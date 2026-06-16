const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');
const { moduleRoot, toPosixPath } = require('./path-utils');

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toAssetName(filePath) {
  return path
    .basename(filePath, '.svg')
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function toRegexList(patterns) {
  return patterns.map(pattern => {
    if (pattern instanceof RegExp) return pattern;
    return new RegExp(pattern);
  });
}

function matchRule(name, patterns) {
  const regexList = toRegexList(patterns);
  return regexList.some(re => re.test(name));
}

function splitLiteralAndRegex(patterns) {
  const literals = [];
  const regexLike = [];

  for (const pattern of patterns) {
    if (pattern instanceof RegExp || /[\\^$.*+?()[\]{}|]/.test(String(pattern))) {
      regexLike.push(pattern);
    } else {
      literals.push(String(pattern));
    }
  }

  return { literals, regexLike };
}

function ruleIncludes(rawName, normalizedName, rules) {
  const explicit = new Set(rules.explicit.map(String));
  if (explicit.has(rawName) || explicit.has(normalizedName)) return true;
  if (!rules.include.length) return true;

  const { literals, regexLike } = splitLiteralAndRegex(rules.include);
  if (literals.includes(rawName) || literals.includes(normalizedName)) return true;

  return matchRule(rawName, regexLike) || matchRule(normalizedName, regexLike);
}

function ruleExcludes(rawName, normalizedName, rules) {
  const { literals, regexLike } = splitLiteralAndRegex(rules.exclude);
  return (
    literals.includes(rawName) ||
    literals.includes(normalizedName) ||
    matchRule(rawName, regexLike) ||
    matchRule(normalizedName, regexLike)
  );
}

function resolveSourceRoot(source, options = {}) {
  const root = options.moduleRoot || moduleRoot;
  if (source.type === 'local') {
    const base = source.base === 'repo' ? process.cwd() : root;
    return path.resolve(base, source.dir);
  }

  const pkgPath = require.resolve(`${source.packageName}/package.json`, {
    paths: [process.cwd(), root],
  });
  return path.resolve(path.dirname(pkgPath), source.dir);
}

async function collectSourceAssets(source, options = {}) {
  const findings = [];
  let sourceRoot;

  try {
    sourceRoot = resolveSourceRoot(source, options);
  } catch (error) {
    return {
      assets: [],
      findings: [
        {
          id: 'source-resolve-failed',
          level: 'error',
          message: `Cannot resolve source "${source.id}": ${error.message}`,
          sourceId: source.id,
        },
      ],
    };
  }

  if (!fs.existsSync(sourceRoot)) {
    return {
      assets: [],
      findings: [
        {
          id: 'source-missing',
          level: 'error',
          message: `Source "${source.id}" directory does not exist: ${sourceRoot}`,
          sourceId: source.id,
        },
      ],
    };
  }

  const files = await fg('**/*.svg', {
    cwd: sourceRoot,
    absolute: true,
    onlyFiles: true,
    unique: true,
  });

  if (!files.length) {
    findings.push({
      id: 'source-empty',
      level: 'warning',
      message: `Source "${source.id}" contains no SVG files.`,
      sourceId: source.id,
    });
  }

  const targetFilter = new Set(options.targetFilter || []);
  const assets = [];

  for (const filePath of files.sort((a, b) => a.localeCompare(b))) {
    const rawName = path.basename(filePath, '.svg');
    const normalizedName = toAssetName(filePath);
    const rules = source.rules;

    if (
      !ruleIncludes(rawName, normalizedName, rules) ||
      ruleExcludes(rawName, normalizedName, rules)
    ) {
      findings.push({
        id: 'asset-skipped',
        level: 'info',
        message: `Skipped "${normalizedName}" from source "${source.id}".`,
        sourceId: source.id,
        name: normalizedName,
      });
      continue;
    }

    const renameValue = rules.rename[rawName] || rules.rename[normalizedName] || normalizedName;
    const finalName = `${rules.prefix || ''}${renameValue}`.replace(
      new RegExp(`^${escapeRegex(rules.prefix)}${escapeRegex(rules.prefix)}`),
      rules.prefix
    );

    for (const target of source.targets) {
      if (targetFilter.size && !targetFilter.has(target)) continue;
      assets.push({
        name: finalName,
        rawName,
        sourceId: source.id,
        sourceType: source.type,
        sourcePath: filePath,
        relativePath: toPosixPath(path.relative(sourceRoot, filePath)),
        target,
        colorMode: rules.colorMode,
        sourceMeta: source.sourceMeta || {},
      });
    }
  }

  return { assets, findings };
}

function findDuplicateAssets(assets) {
  const byTargetName = new Map();
  const findings = [];

  for (const asset of assets) {
    const key = `${asset.target}:${asset.name}`;
    const existing = byTargetName.get(key);
    if (!existing) {
      byTargetName.set(key, asset);
      continue;
    }
    findings.push({
      id: 'duplicate-name',
      level: 'error',
      message: `Duplicate SVG asset "${asset.name}" for target "${asset.target}" from "${existing.sourceId}" and "${asset.sourceId}".`,
      target: asset.target,
      name: asset.name,
    });
  }

  return findings;
}

async function collectSvgAssets(config, options = {}) {
  const activeTargets = new Set(options.targetFilter || []);
  const assets = [];
  const findings = [];

  for (const source of config.sources) {
    if (activeTargets.size && !source.targets.some(target => activeTargets.has(target))) continue;
    const result = await collectSourceAssets(source, options);
    assets.push(...result.assets);
    findings.push(...result.findings);
  }

  findings.push(...findDuplicateAssets(assets));
  return { assets, findings };
}

module.exports = {
  collectSourceAssets,
  collectSvgAssets,
  findDuplicateAssets,
  resolveSourceRoot,
  toAssetName,
};
