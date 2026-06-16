const fs = require('node:fs');
const path = require('node:path');

const SHOWCASE_FILE = path.resolve(process.cwd(), 'src/components/showcase/showcase-cases.ts');
const SCORE_FILE = path.resolve(process.cwd(), 'docs/OPEN_SOURCE_COMPONENT_SCORE.md');

function readFile(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function parseShowcaseCases(source) {
  const blocks = source.match(/\{\s*slug:[\s\S]*?\n\s*\}/g) || [];
  return blocks
    .map(block => ({
      slug: getStringValue(block, 'slug'),
      title: getStringValue(block, 'title'),
      group: getStringValue(block, 'group'),
      verifyStatus: getStringValue(block, 'verifyStatus'),
      riskLevel: getStringValue(block, 'riskLevel'),
      visualEnabled: getBooleanValue(block, 'visualEnabled'),
      riskNotes: getArrayValues(block, 'riskNotes'),
    }))
    .filter(item => item.slug);
}

function getStringValue(block, key) {
  const match = block.match(new RegExp(`${key}:\\s*'([^']*)'`));
  return match ? match[1] : '';
}

function getBooleanValue(block, key) {
  const match = block.match(new RegExp(`${key}:\\s*(true|false)`));
  return match ? match[1] === 'true' : false;
}

function getArrayValues(block, key) {
  const match = block.match(new RegExp(`${key}:\\s*\\[([\\s\\S]*?)\\]`));
  if (!match) return [];
  return [...match[1].matchAll(/'([^']+)'/g)].map(item => item[1]);
}

function parseScoreRisks(source) {
  const rows = source
    .split(/\r?\n/)
    .filter(line => /^\| lk-/.test(line));

  const risks = new Map();
  for (const row of rows) {
    const cells = row.split('|').map(cell => cell.trim());
    const component = cells[1];
    const note = cells[cells.length - 2] || '';
    if (component) risks.set(component.replace(/^lk-/, ''), note);
  }
  return risks;
}

function buildRiskMatrix(options = {}) {
  const cases = parseShowcaseCases(readFile(options.showcaseFile || SHOWCASE_FILE));
  const scoreRisks = parseScoreRisks(readFile(options.scoreFile || SCORE_FILE));

  return cases.map(item => ({
    component: `lk-${item.slug}`,
    level: item.riskLevel,
    group: item.group,
    verifyStatus: item.verifyStatus,
    visualEnabled: item.visualEnabled,
    notes: item.riskNotes.join('；') || scoreRisks.get(item.slug) || '',
  }));
}

function printRiskMatrix(matrix) {
  const levels = ['high', 'medium', 'low'];
  for (const level of levels) {
    const items = matrix.filter(item => item.level === level);
    console.log(`\n[compat-risk:${level}] ${items.length}`);
    for (const item of items) {
      const visual = item.visualEnabled ? 'visual' : 'manual';
      console.log(`- ${item.component} (${item.group}, ${item.verifyStatus}, ${visual}) ${item.notes}`);
    }
  }
}

function main() {
  printRiskMatrix(buildRiskMatrix());
}

if (require.main === module) {
  main();
}

module.exports = {
  buildRiskMatrix,
  parseScoreRisks,
  parseShowcaseCases,
};
