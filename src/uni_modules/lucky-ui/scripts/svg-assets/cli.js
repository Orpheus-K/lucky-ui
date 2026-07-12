const { collectSvgAssets } = require('./collect');
const { buildIconFont, prepareIconFontAssets } = require('./emit-icon-font');
const { emitEmptyIllustrations } = require('./emit-empty');
const { loadSvgAssetsConfig } = require('./load-config');
const { normalizeCollectedAssets } = require('./normalize');
const { createReport, printReport, writeJsonReport } = require('./report');

function parseArgs(argv) {
  const options = {
    check: false,
    report: false,
    stage: 'all',
    targets: [],
  };

  for (const arg of argv) {
    if (arg === '--check') options.check = true;
    else if (arg === '--report') options.report = true;
    else if (arg.startsWith('--stage=')) options.stage = arg.slice('--stage='.length);
    else if (arg.startsWith('--target=')) options.targets.push(arg.slice('--target='.length));
    else if (arg.startsWith('--config=')) options.configPath = arg.slice('--config='.length);
  }

  return options;
}

function getStageTargets(stage, explicitTargets, config) {
  if (explicitTargets.length) return explicitTargets;
  if (stage === 'empty') return ['emptyIllustrations'];
  if (stage === 'prepare' || stage === 'build') return ['iconFont'];
  return Object.entries(config.targets)
    .filter(([, target]) => target.enabled)
    .map(([name]) => name);
}

function hasErrors(findings) {
  return findings.some(item => item.level === 'error');
}

function hasWarnings(findings) {
  return findings.some(item => item.level === 'warning');
}

async function runSvgAssets(rawOptions = {}) {
  const options = {
    check: false,
    report: false,
    stage: 'all',
    targets: [],
    ...rawOptions,
  };
  const config = loadSvgAssetsConfig(options.configPath);
  const targets = getStageTargets(options.stage, options.targets, config);
  const targetFilter = targets.filter(target => config.targets[target]?.enabled !== false);
  const writes = [];
  const changes = [];
  let assets = [];
  const findings = [];

  if (options.stage !== 'build') {
    const collected = await collectSvgAssets(config, { targetFilter });
    findings.push(...collected.findings);
    const normalized = await normalizeCollectedAssets(collected.assets);
    findings.push(...normalized.findings);
    assets = normalized.assets;
  }

  if (hasErrors(findings)) {
    const report = createReport({ assets, findings, writes, changes, check: options.check });
    printReport(report);
    throw new Error('[svg-assets] failed with errors.');
  }

  if (config.feedback.failOnWarning && hasWarnings(findings)) {
    const report = createReport({ assets, findings, writes, changes, check: options.check });
    printReport(report);
    throw new Error('[svg-assets] failed because warnings are configured as fatal.');
  }

  if (
    (options.stage === 'prepare' || options.stage === 'all') &&
    targetFilter.includes('iconFont')
  ) {
    const result = await prepareIconFontAssets(assets, config.targets.iconFont, options);
    writes.push(...result.writes);
    changes.push(...(result.changes || []));
  }

  if ((options.stage === 'build' || options.stage === 'all') && targetFilter.includes('iconFont')) {
    const result = await buildIconFont(config.targets.iconFont, options);
    writes.push(...result.writes);
  }

  if (
    (options.stage === 'empty' || options.stage === 'all') &&
    targetFilter.includes('emptyIllustrations')
  ) {
    const result = await emitEmptyIllustrations(assets, config.targets.emptyIllustrations, options);
    writes.push(...result.writes);
  }

  const report = createReport({ assets, findings, writes, changes, check: options.check });
  printReport(report);

  if (options.report) {
    const reportPath = await writeJsonReport(report, config.feedback.reportFile);
    if (reportPath) console.log(`[svg-assets] report: ${reportPath}`);
  }

  return report;
}

async function main(argv = process.argv.slice(2)) {
  try {
    await runSvgAssets(parseArgs(argv));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  getStageTargets,
  main,
  parseArgs,
  runSvgAssets,
};
