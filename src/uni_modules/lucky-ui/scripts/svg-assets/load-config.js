const path = require('path');
const { defaultConfigPath, moduleRoot } = require('./path-utils');

function ensureArray(value, field) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new Error(`[svg-assets] ${field} must be an array.`);
  }
  return value;
}

function normalizeRules(rules = {}) {
  return {
    include: ensureArray(rules.include, 'rules.include'),
    exclude: ensureArray(rules.exclude, 'rules.exclude'),
    explicit: ensureArray(rules.explicit, 'rules.explicit'),
    rename: rules.rename || {},
    prefix: rules.prefix || '',
    colorMode: rules.colorMode || '',
  };
}

function normalizeSource(source, index) {
  if (!source || typeof source !== 'object') {
    throw new Error(`[svg-assets] sources[${index}] must be an object.`);
  }
  if (!source.id || typeof source.id !== 'string') {
    throw new Error(`[svg-assets] sources[${index}].id is required.`);
  }
  if (source.type !== 'local' && source.type !== 'package') {
    throw new Error(`[svg-assets] source "${source.id}" type must be "local" or "package".`);
  }
  if (source.type === 'package' && !source.packageName) {
    throw new Error(`[svg-assets] source "${source.id}" packageName is required.`);
  }
  if (!source.dir || typeof source.dir !== 'string') {
    throw new Error(`[svg-assets] source "${source.id}" dir is required.`);
  }

  return {
    ...source,
    targets: ensureArray(source.targets, `source "${source.id}" targets`),
    rules: normalizeRules(source.rules),
    sourceMeta: source.sourceMeta || {},
  };
}

function normalizeTarget(name, target = {}) {
  return {
    ...target,
    name,
    enabled: target.enabled !== false,
  };
}

function normalizeConfig(rawConfig, configPath = defaultConfigPath) {
  if (!rawConfig || typeof rawConfig !== 'object') {
    throw new Error('[svg-assets] config must export an object.');
  }
  const sources = ensureArray(rawConfig.sources, 'sources').map(normalizeSource);
  if (!sources.length) {
    throw new Error('[svg-assets] config.sources cannot be empty.');
  }

  const rawTargets = rawConfig.targets || {};
  const targets = Object.fromEntries(
    Object.entries(rawTargets).map(([name, target]) => [name, normalizeTarget(name, target)])
  );

  return {
    ...rawConfig,
    configPath: path.resolve(configPath),
    moduleRoot,
    sources,
    targets,
    feedback: {
      failOnWarning: false,
      reportFile: '',
      ...(rawConfig.feedback || {}),
    },
  };
}

function loadSvgAssetsConfig(configPath = defaultConfigPath) {
  const resolvedPath = path.resolve(configPath);
  delete require.cache[resolvedPath];
  return normalizeConfig(require(resolvedPath), resolvedPath);
}

module.exports = {
  loadSvgAssetsConfig,
  normalizeConfig,
  normalizeRules,
};
