const fs = require('node:fs');
const path = require('node:path');

const SOURCE_PATH = path.resolve(process.cwd(), 'src/components/showcase/showcase-cases.ts');
const OUTPUT_PATH = path.resolve(process.cwd(), 'artifacts/showcase-cases-report.json');

/**
 * 从 TS 文件提取 SHOWCASE_CASES 数组字面量。
 * @param {string} content 文件内容
 * @returns {string}
 */
function extractArrayLiteral(content) {
  const match = content.match(/SHOWCASE_CASES\s*:\s*ShowcaseCase\[\]\s*=\s*(\[[\s\S]*\]);/);
  if (!match || !match[1]) {
    throw new Error('未找到 SHOWCASE_CASES 数组定义。');
  }
  return match[1];
}

/**
 * 将数组字面量安全转为对象。
 * 注意事项：输入来源为本仓库受控文件。
 * @param {string} literal 数组字面量
 * @returns {unknown[]}
 */
function parseCasesLiteral(literal) {
  return Function(`"use strict"; return (${literal});`)();
}

function run() {
  if (!fs.existsSync(SOURCE_PATH)) {
    throw new Error('showcase 清单文件不存在。');
  }

  const content = fs.readFileSync(SOURCE_PATH, 'utf8');
  const cases = parseCasesLiteral(extractArrayLiteral(content));
  const now = new Date().toISOString();

  const summary = {
    total: cases.length,
    visualEnabled: cases.filter(item => item.visualEnabled).length,
    verified: cases.filter(item => item.verifyStatus === 'verified').length,
    pending: cases.filter(item => item.verifyStatus === 'pending').length,
    highRisk: cases.filter(item => item.riskLevel === 'high').length,
  };

  const report = {
    generatedAt: now,
    summary,
    cases,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`[showcase-report] 已输出: ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

run();
