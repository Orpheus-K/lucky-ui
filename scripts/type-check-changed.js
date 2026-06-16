const { execFileSync, spawnSync } = require('node:child_process');
const { existsSync, mkdirSync, writeFileSync } = require('node:fs');
const { dirname, resolve } = require('node:path');

const TYPE_EXT_RE = /\.(d\.ts|ts|tsx|vue)$/;
const SRC_RE = /^src[\\/]/;
const DEFAULT_BASE = 'HEAD';
const cacheDir = resolve('node_modules/.cache/lucky-ui');
const tempTsconfig = resolve(cacheDir, 'tsconfig.changed.json');

function parseArgs(argv) {
  const options = {
    base: DEFAULT_BASE,
    staged: false,
    files: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--staged') {
      options.staged = true;
    } else if (arg === '--base') {
      options.base = argv[index + 1] || DEFAULT_BASE;
      index += 1;
    } else if (arg.startsWith('--base=')) {
      options.base = arg.slice('--base='.length) || DEFAULT_BASE;
    } else {
      options.files.push(arg);
    }
  }

  return options;
}

function gitDiffFiles(options) {
  const args = ['diff', '--name-only', '--diff-filter=ACMR'];
  if (options.staged) {
    args.push('--cached');
  }
  args.push(options.base, '--', 'src');

  return execFileSync('git', args, { encoding: 'utf8' })
    .split(/\r?\n/)
    .filter(Boolean);
}

function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/');
}

function uniqueTypeFiles(files) {
  return Array.from(
    new Set(
      files
        .map(normalizePath)
        .filter((filePath) => SRC_RE.test(filePath))
        .filter((filePath) => TYPE_EXT_RE.test(filePath))
        .filter((filePath) => existsSync(resolve(filePath)))
    )
  ).sort();
}

function writeTempTsconfig(files) {
  mkdirSync(dirname(tempTsconfig), { recursive: true });
  writeFileSync(
    tempTsconfig,
    `${JSON.stringify(
      {
        extends: '../../../tsconfig.json',
        include: ['../../../src/**/*.d.ts', ...files.map((filePath) => `../../../${filePath}`)],
      },
      null,
      2
    )}\n`
  );
}

function runVueTsc() {
  const bin = process.platform === 'win32' ? 'vue-tsc.cmd' : 'vue-tsc';
  const result = spawnSync(bin, ['--noEmit', '--pretty', 'false', '-p', tempTsconfig], {
    cwd: resolve('.'),
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.error) {
    throw result.error;
  }

  return result.status || 0;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const rawFiles = options.files.length > 0 ? options.files : gitDiffFiles(options);
  const files = uniqueTypeFiles(rawFiles);

  if (files.length === 0) {
    console.log('[type-check:changed] 未发现需要检查的 src 类型文件。');
    return 0;
  }

  writeTempTsconfig(files);
  console.log(`[type-check:changed] 检查 ${files.length} 个改动文件。`);
  files.forEach((filePath) => console.log(`  - ${filePath}`));

  return runVueTsc();
}

process.exitCode = main();
