const fs = require('fs');
const path = require('path');

const DOC_ROOT = path.join(process.cwd(), 'docs', 'components');

const SKIP_FILES = new Set(['index.md']);

const SECTION_MARKERS = {
  basic: /##\s*(基础用法|基本用法|Basic)/i,
  variant: /##\s*(变体|样式|类型|Variants?)/i,
  size: /##\s*(尺寸|大小|Size)/i,
  state: /##\s*(状态|禁用|States?)/i,
  api: /##\s*(API|Props|属性|方法|事件|Slots?)/i,
  spec: /##\s*规范示例（推荐）/i,
};

function walkMarkdownFiles(dir) {
  const result = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...walkMarkdownFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.md') && !SKIP_FILES.has(entry.name)) {
      result.push(fullPath);
    }
  }
  return result;
}

function getComponentNameFromDoc(filePath) {
  const base = path.basename(filePath, '.md');
  return base;
}

function buildSpecBlock(componentName) {
  const demoFile = `src/components/demos/${componentName}-demo.vue`;
  return [
    '',
    '## 规范示例（推荐）',
    '',
    '> 该章节结构参考 Naive UI / Ant Design 的文档组织方式，建议所有组件示例至少覆盖以下维度。',
    '',
    `- 运行示例参考：\`${demoFile}\``,
    '',
    '### 基础用法',
    '',
    '- 展示组件最小可用示例（MVP）。',
    '- 建议同时给出默认值与常见场景说明。',
    '',
    '### 变体（Variants）',
    '',
    '- 覆盖常见视觉/语义变体（如 primary / success / warning / danger）。',
    '- 如无变体能力，可说明“不适用”。',
    '',
    '### 尺寸（Size）',
    '',
    '- 覆盖 `sm / md / lg` 或对应尺寸能力。',
    '- 如组件不支持尺寸，说明由容器或样式变量控制。',
    '',
    '### 状态（States）',
    '',
    '- 至少覆盖 `disabled`、加载态、错误态、空态中的适用项。',
    '- 涉及交互时，补充事件触发与边界行为。',
    '',
    '## API',
    '',
    '- 建议按 `Props`、`Events`、`Slots`、`Expose` 分节说明。',
    '- 推荐使用表格统一字段：`参数`、`说明`、`类型`、`默认值`。',
    '',
  ].join('\n');
}

function normalizeTailNewline(content) {
  return content.endsWith('\n') ? content : `${content}\n`;
}

function applyToFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const content = raw.replace(/^\uFEFF/, '');

  if (SECTION_MARKERS.spec.test(content)) {
    return false;
  }

  const componentName = getComponentNameFromDoc(filePath);
  const block = buildSpecBlock(componentName);
  const next = normalizeTailNewline(content) + block;
  fs.writeFileSync(filePath, next, 'utf8');
  return true;
}

function main() {
  const files = walkMarkdownFiles(DOC_ROOT);
  let changed = 0;
  for (const file of files) {
    if (applyToFile(file)) {
      changed += 1;
    }
  }
  console.log(`DOC_FILES=${files.length}`);
  console.log(`DOC_CHANGED=${changed}`);
}

main();
