const fs = require('fs').promises;

async function getSvgoOptimize() {
  const svgo = await import('svgo');
  return svgo.optimize;
}

function hasSvgRoot(content) {
  return /<svg[\s>]/i.test(content);
}

function hasViewBox(content) {
  return /\sviewBox=(["'])[^"']+\1/i.test(content);
}

function stripUnsafeRuntimeAttrs(content) {
  return content
    .replace(/\s(?:on[a-z]+)=["'][^"']*["']/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');
}

function normalizeForTarget(content, asset) {
  let output = stripUnsafeRuntimeAttrs(content);

  if (asset.target === 'iconFont' || asset.colorMode === 'monochrome') {
    output = output
      .replace(/\sfill=(["'])currentColor\1/gi, '')
      .replace(/\scolor=(["'])currentColor\1/gi, '');
  }

  return output.trim();
}

async function normalizeSvgContent(content, asset = {}) {
  const findings = [];

  if (!hasSvgRoot(content)) {
    return {
      content: '',
      findings: [
        {
          id: 'invalid-svg',
          level: 'error',
          message: `Asset "${asset.name || asset.sourcePath || 'unknown'}" is not an SVG document.`,
          name: asset.name,
        },
      ],
    };
  }

  if (!hasViewBox(content)) {
    findings.push({
      id: 'missing-viewbox',
      level: 'error',
      message: `Asset "${asset.name || asset.sourcePath}" must include a viewBox for cross-platform scaling.`,
      name: asset.name,
    });
  }

  try {
    const optimize = await getSvgoOptimize();
    const result = optimize(content, {
      multipass: true,
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              removeUnknownsAndDefaults: {
                keepDataAttrs: true,
              },
            },
          },
        },
        'removeDimensions',
      ],
    });
    const optimized = normalizeForTarget(result.data || content, asset);
    return { content: optimized, findings };
  } catch (error) {
    return {
      content: '',
      findings: [
        {
          id: 'svgo-failed',
          level: 'error',
          message: `SVGO failed for "${asset.name || asset.sourcePath}": ${error.message}`,
          name: asset.name,
        },
      ],
    };
  }
}

async function normalizeCollectedAssets(assets) {
  const normalized = [];
  const findings = [];

  for (const asset of assets) {
    const raw = await fs.readFile(asset.sourcePath, 'utf8');
    const result = await normalizeSvgContent(raw, asset);
    findings.push(
      ...result.findings.map(finding => ({
        ...finding,
        target: asset.target,
        sourceId: asset.sourceId,
      }))
    );
    if (result.content) {
      normalized.push({
        ...asset,
        content: result.content,
      });
    }
  }

  return { assets: normalized, findings };
}

module.exports = {
  hasSvgRoot,
  hasViewBox,
  normalizeCollectedAssets,
  normalizeSvgContent,
};
