const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_ROOT = path.resolve(process.cwd(), 'src/uni_modules/lucky-ui');
const SCAN_EXTENSIONS = new Set(['.vue', '.ts', '.scss', '.css']);
const NON_MP_TOKENS = new Set([
  'H5',
  'WEB',
  'APP',
  'APP-PLUS',
  'APP-PLUS-NVUE',
  'APP-ANDROID',
  'APP-IOS',
  'APP-HARMONY',
  'QUICKAPP-WEBVIEW',
  'QUICKAPP-WEBVIEW-UNION',
  'QUICKAPP-WEBVIEW-HUAWEI',
]);

const ERROR_RULES = [
  {
    id: 'no-wildcard-selector',
    files: ['.vue', '.scss', '.css'],
    pattern: /(^|[}\s,])\*\s*\{/,
    message: '小程序不支持通配符选择器',
  },
  {
    id: 'no-div',
    files: ['.vue'],
    pattern: /<\s*div(\s|>)/,
    message: '小程序不支持 div 标签，请使用 view 或条件编译隔离',
  },
  {
    id: 'no-span',
    files: ['.vue'],
    pattern: /<\s*span(\s|>)/,
    message: '小程序不支持 span 标签，请使用 text 或条件编译隔离',
  },
  {
    id: 'no-img',
    files: ['.vue'],
    pattern: /<\s*img(\s|>)/,
    message: '小程序不支持 img 标签，请使用 image 或条件编译隔离',
  },
  {
    id: 'no-dynamic-component-mp',
    files: ['.vue'],
    pattern: /<\s*component\b[^>]*(:is|is)\s*=/,
    message: '小程序不支持 <component :is> 动态组件，请使用具名 slot 或条件编译隔离',
  },
  {
    id: 'no-click-template',
    files: ['.vue'],
    pattern: /@click(\.|=)/,
    message: '组件模板请使用 @tap，H5 专属 @click 必须条件编译隔离',
  },
  {
    id: 'no-browser-dom',
    files: ['.vue', '.ts'],
    pattern: /\b(document|window|navigator|localStorage|sessionStorage)\s*\./,
    message: '浏览器 API 必须放入 H5 条件编译，其他平台使用 uni API 或降级实现',
  },
  {
    id: 'no-global-get-computed-style',
    files: ['.vue', '.ts'],
    pattern: /\bgetComputedStyle\s*\(/,
    message: 'getComputedStyle 必须放入 H5 条件编译，其他平台使用 token 默认值或降级实现',
  },
];

const WARN_RULES = [
  {
    id: 'fixed-position',
    files: ['.vue', '.scss', '.css'],
    pattern: /position\s*:\s*fixed/,
    message: 'fixed 定位各平台行为不一致，请纳入平台验收',
  },
  {
    id: 'css-filter',
    files: ['.vue', '.scss', '.css'],
    pattern: /(^|[^-])\bfilter\s*:/,
    message: 'CSS filter 在 App/部分小程序支持有限，请提供无特效降级',
  },
  {
    id: 'webkit-private',
    files: ['.vue', '.scss', '.css'],
    pattern: /::-webkit-|-webkit-/,
    message: 'webkit 私有能力需作为渐进增强，不能阻断核心交互',
  },
  {
    id: 'native-picker',
    files: ['.vue'],
    pattern: /<\s*picker(\s|>)/,
    message: 'picker 跨平台差异大，请使用条件编译或组件级适配',
  },
  {
    id: 'textarea-padding',
    files: ['.vue', '.scss', '.css'],
    pattern: /textarea[\s\S]*padding\s*:/,
    message: 'textarea padding 在 App/小程序可能无效，优先使用外层容器控制间距',
  },
];

function parseArgs(argv = process.argv.slice(2)) {
  return {
    strict: argv.includes('--strict'),
    root: getArgValue(argv, '--root') || DEFAULT_ROOT,
  };
}

function getArgValue(argv, name) {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : '';
}

function collectFiles(rootDir) {
  const files = [];
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
      continue;
    }

    if (entry.isFile() && SCAN_EXTENSIONS.has(path.extname(fullPath))) {
      files.push(fullPath);
    }
  }

  return files;
}

function scanContent(filePath, content) {
  const ext = path.extname(filePath);
  const stateStack = [];
  const findings = [];
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    const directive = parseDirective(line);
    if (directive) {
      applyDirective(stateStack, directive);
      return;
    }

    const mpReachable = stateStack.every(state => state.mpReachable);
    const lineNo = index + 1;
    if (isIgnorableLine(line)) return;

    if (mpReachable) {
      findings.push(...matchRules(ERROR_RULES, ext, line, filePath, lineNo, 'error', {
        isComponentClick: isComponentClickLine(lines, index),
      }));
    }

    findings.push(...matchRules(WARN_RULES, ext, line, filePath, lineNo, 'warn'));
  });

  return findings;
}

function isIgnorableLine(line) {
  const trimmed = line.trim();
  return trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*');
}

function parseDirective(line) {
  const match = line.match(/#(ifdef|ifndef|endif)\b\s*([^*-]*)/);
  if (!match) return null;
  return {
    type: match[1],
    expression: match[2].trim(),
  };
}

function applyDirective(stack, directive) {
  if (directive.type === 'endif') {
    stack.pop();
    return;
  }

  stack.push({
    mpReachable: directive.type === 'ifdef'
      ? expressionAllowsMp(directive.expression)
      : !expressionRequiresMp(directive.expression),
  });
}

function expressionAllowsMp(expression) {
  const tokens = expression.match(/[A-Z][A-Z0-9-]*/g) || [];
  if (tokens.length === 0) return true;
  if (tokens.some(token => token === 'MP' || token.startsWith('MP-'))) return true;
  return !tokens.some(token => NON_MP_TOKENS.has(token));
}

function expressionRequiresMp(expression) {
  const tokens = expression.match(/[A-Z][A-Z0-9-]*/g) || [];
  return tokens.some(token => token === 'MP' || token.startsWith('MP-'));
}

function isComponentClickLine(lines, index) {
  const line = lines[index];
  if (!/@click(\.|=)/.test(line)) return false;

  const inlineTagMatches = [...line.matchAll(/<\s*([A-Za-z][\w-]*)\b/g)];
  const inlineTagMatch = inlineTagMatches[inlineTagMatches.length - 1];
  if (inlineTagMatch && isComponentTag(inlineTagMatch[1])) return true;

  const start = Math.max(0, index - 8);
  const chunk = lines.slice(start, index + 1).join('\n');
  const lastTagStart = chunk.lastIndexOf('<');
  const lastTagEnd = chunk.lastIndexOf('>');
  if (lastTagStart < 0 || lastTagStart < lastTagEnd) return false;

  const tagMatch = chunk.slice(lastTagStart).match(/^<\s*([A-Za-z][\w-]*)/);
  if (!tagMatch) return false;

  return isComponentTag(tagMatch[1]);
}

function isComponentTag(tagName) {
  return tagName.startsWith('lk-') || /^[A-Z]/.test(tagName);
}

function matchRules(rules, ext, line, filePath, lineNo, level, context = {}) {
  return rules
    .filter(rule => rule.files.includes(ext))
    .filter(rule => !(rule.id === 'no-click-template' && context.isComponentClick))
    .filter(rule => rule.pattern.test(line))
    .map(rule => ({
      id: rule.id,
      level,
      filePath,
      line: lineNo,
      message: rule.message,
    }));
}

function runCompatCheck(options = {}) {
  const root = options.root || DEFAULT_ROOT;
  if (!fs.existsSync(root)) {
    return {
      root,
      findings: [],
      errorCount: 0,
      warnCount: 0,
      missingRoot: true,
    };
  }

  const findings = collectFiles(root).flatMap(filePath => {
    return scanContent(filePath, fs.readFileSync(filePath, 'utf8'));
  });

  return {
    root,
    findings,
    errorCount: findings.filter(item => item.level === 'error').length,
    warnCount: findings.filter(item => item.level === 'warn').length,
    missingRoot: false,
  };
}

function formatFinding(finding, cwd = process.cwd()) {
  const relativePath = path.relative(cwd, finding.filePath).split(path.sep).join('/');
  return `[compat-check:${finding.level}] ${relativePath}:${finding.line} ${finding.message}`;
}

function printResult(result, strict = false) {
  if (result.missingRoot) {
    console.warn(`[compat-check] 未找到 ${result.root}，跳过检查。`);
    return;
  }

  for (const finding of result.findings) {
    const line = formatFinding(finding);
    if (finding.level === 'error') console.error(line);
    else console.warn(line);
  }

  if (result.findings.length === 0) {
    console.log('[compat-check] 未发现已知跨平台风险。');
    return;
  }

  const strictText = strict && result.errorCount > 0 ? '，strict 模式将因 error 失败' : '';
  console.warn(
    `[compat-check] 检查完成：error ${result.errorCount} 条，warn ${result.warnCount} 条${strictText}。`
  );
}

function main() {
  const options = parseArgs();
  const result = runCompatCheck(options);
  printResult(result, options.strict);

  if (options.strict && result.errorCount > 0) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  ERROR_RULES,
  WARN_RULES,
  collectFiles,
  expressionAllowsMp,
  expressionRequiresMp,
  formatFinding,
  parseDirective,
  runCompatCheck,
  scanContent,
};
