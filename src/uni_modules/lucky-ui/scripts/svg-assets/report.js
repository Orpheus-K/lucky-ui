const fs = require('fs').promises;
const { relativeToModule, resolveModulePath } = require('./path-utils');

function createReport(payload) {
  const assets = payload.assets || [];
  const findings = payload.findings || [];
  const writes = payload.writes || [];
  const changes = payload.changes || [];
  const targets = {};

  for (const asset of assets) {
    targets[asset.target] = targets[asset.target] || { total: 0, sources: {} };
    targets[asset.target].total += 1;
    targets[asset.target].sources[asset.sourceId] =
      (targets[asset.target].sources[asset.sourceId] || 0) + 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    mode: payload.check ? 'check' : 'write',
    targets,
    findings,
    changes,
    writes,
  };
}

function printReport(report) {
  const targetEntries = Object.entries(report.targets);
  console.log(`[svg-assets] mode: ${report.mode}`);

  if (!targetEntries.length) {
    console.log('[svg-assets] no active targets');
  }

  for (const [target, summary] of targetEntries) {
    console.log(`[svg-assets] ${target}: ${summary.total} svg assets`);
  }

  const errors = report.findings.filter(item => item.level === 'error');
  const warnings = report.findings.filter(item => item.level === 'warning');
  const infos = report.findings.filter(item => item.level === 'info');

  if (warnings.length) console.warn(`[svg-assets] warnings: ${warnings.length}`);
  if (errors.length) console.error(`[svg-assets] errors: ${errors.length}`);
  if (infos.length) console.log(`[svg-assets] skipped/info: ${infos.length}`);

  for (const write of report.writes) {
    console.log(`[svg-assets] ${write.action}: ${write.path} (${write.count})`);
  }

  for (const change of report.changes || []) {
    const added = change.added?.length || 0;
    const removed = change.removed?.length || 0;
    if (added || removed) {
      console.log(`[svg-assets] ${change.target} changes: +${added} -${removed}`);
    }
  }

  [...errors, ...warnings].slice(0, 20).forEach(item => {
    const log = item.level === 'error' ? console.error : console.warn;
    log(`[svg-assets] ${item.level}: ${item.message}`);
  });
}

async function writeJsonReport(report, reportFile) {
  if (!reportFile) return null;
  const outFile = resolveModulePath(reportFile);
  await fs.mkdir(require('path').dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return relativeToModule(outFile);
}

module.exports = {
  createReport,
  printReport,
  writeJsonReport,
};
