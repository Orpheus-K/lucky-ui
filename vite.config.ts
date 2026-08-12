import { defineConfig, type Plugin } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const LUCKY_UI_H5_PORT = 5188;

interface LuckyUiBuildIdentity {
  commit: string;
  branch: string;
  dirty: boolean;
  sourceDigest: string;
  version: string;
  buildMode: 'static-build' | 'dev-server';
  provenance: 'git-worktree' | 'unverified';
  valid: boolean;
}

function runGitText(args: string[]): string {
  return execFileSync('git', args, {
    cwd: __dirname,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

function runGitBuffer(args: string[]): Buffer {
  return execFileSync('git', args, {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

function readPackageVersion(): string {
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')
    );
    return typeof packageJson.version === 'string' ? packageJson.version : 'unknown';
  } catch {
    return 'unknown';
  }
}

function resolveBuildIdentity(command: 'build' | 'serve'): LuckyUiBuildIdentity {
  const environmentCommit = process.env.GITHUB_SHA || process.env.VITE_GIT_COMMIT || '';
  const environmentBranch = process.env.GITHUB_REF_NAME || process.env.VITE_GIT_BRANCH || '';
  let commit = environmentCommit.slice(0, 40) || 'unknown';
  let branch = environmentBranch.slice(0, 160) || 'unknown';
  let dirty = true;
  let sourceDigest = process.env.VITE_SOURCE_DIGEST || 'unknown';
  let provenance: LuckyUiBuildIdentity['provenance'] = 'unverified';

  try {
    commit = runGitText(['rev-parse', 'HEAD']);
    branch = environmentBranch.slice(0, 160) || runGitText(['rev-parse', '--abbrev-ref', 'HEAD']);
    const status = runGitBuffer(['status', '--porcelain=v1', '-z', '--untracked-files=all']);
    dirty = status.length > 0;

    const hash = crypto.createHash('sha256');
    hash.update(commit);
    hash.update('\0');
    hash.update(branch);
    hash.update('\0');
    hash.update(status);
    hash.update(runGitBuffer(['diff', '--binary', '--no-ext-diff', 'HEAD', '--']));

    const untracked = runGitBuffer(['ls-files', '--others', '--exclude-standard', '-z'])
      .toString('utf8')
      .split('\0')
      .filter(Boolean)
      .sort();
    for (const relativePath of untracked) {
      const filePath = path.resolve(__dirname, relativePath);
      const insideRepository =
        filePath === __dirname || filePath.startsWith(`${path.resolve(__dirname)}${path.sep}`);
      if (!insideRepository) continue;
      const fileInfo = fs.lstatSync(filePath);
      if (!fileInfo.isFile() || fileInfo.isSymbolicLink()) continue;
      hash.update(relativePath.replace(/\\/g, '/'));
      hash.update('\0');
      hash.update(fs.readFileSync(filePath));
      hash.update('\0');
    }
    sourceDigest = hash.digest('hex');
    provenance = 'git-worktree';
  } catch {
    // Provenance must remain unverified when any Git or source read fails.
  }

  const version = readPackageVersion();
  const buildMode = command === 'build' ? 'static-build' : 'dev-server';
  const valid =
    buildMode === 'static-build' &&
    provenance === 'git-worktree' &&
    !dirty &&
    /^[0-9a-f]{40}$/i.test(commit) &&
    branch !== 'unknown' &&
    /^[0-9a-f]{64}$/i.test(sourceDigest) &&
    version !== 'unknown';
  return { commit, branch, dirty, sourceDigest, version, buildMode, provenance, valid };
}

const WXSS_CHILD_TAGS = [
  'view',
  'text',
  'image',
  'button',
  'input',
  'textarea',
  'scroll-view',
  'swiper',
  'swiper-item',
  'navigator',
  'form',
  'label',
];

function splitSelectorList(selector: string): string[] {
  const selectors: string[] = [];
  let current = '';
  let parenDepth = 0;
  let bracketDepth = 0;

  for (const char of selector) {
    if (char === '(') parenDepth += 1;
    if (char === ')') parenDepth = Math.max(0, parenDepth - 1);
    if (char === '[') bracketDepth += 1;
    if (char === ']') bracketDepth = Math.max(0, bracketDepth - 1);

    if (char === ',' && parenDepth === 0 && bracketDepth === 0) {
      selectors.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) selectors.push(current.trim());
  return selectors;
}

function expandBareNotSelector(selector: string): string[] {
  const bareFirstChildNot = /([>+~])\s*:not\(:first-child\)/;
  const bareNot = /([>+~])\s*:not\([^)]*\)/;

  if (bareFirstChildNot.test(selector)) {
    return WXSS_CHILD_TAGS.map(tag => selector.replace(bareFirstChildNot, `$1${tag}+${tag}`));
  }

  if (bareNot.test(selector)) {
    return WXSS_CHILD_TAGS.map(tag => selector.replace(bareNot, `$1${tag}`));
  }

  return [selector];
}

function normalizeWxssSelector(selector: string): string[] {
  const normalized = selector
    .replace(/[^\s>+~,{}]*:root\b/g, 'page')
    .replace(/:deep\(([^()]*)\)/g, '$1')
    .replace(/:global\(([^()]*)\)/g, '$1')
    .replace(/::v-deep\s*/g, '')
    .replace(/([^\s>+~,{}]+):not\(:first-child\)/g, '$1+$1')
    .trim();

  return expandBareNotSelector(normalized)
    .map(item => item.replace(/:not\([^)]*\)/g, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function normalizeWxssSelectors(selector: string): string {
  return Array.from(new Set(
    splitSelectorList(selector).flatMap(normalizeWxssSelector)
  )).join(',');
}

function transformWxssCompat(source: string): string {
  const repaired = source.replace(/\.data-v-[\w-]+page\b/g, 'page');

  return repaired.replace(/([^{}@][^{}]*)\{/g, (match, selector: string) => {
    if (!/:(root|not|deep|global)|::v-deep/.test(selector)) return match;
    return `${normalizeWxssSelectors(selector)}{`;
  });
}

function collectWxssFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectWxssFiles(fullPath);
    return entry.isFile() && fullPath.endsWith('.wxss') ? [fullPath] : [];
  });
}

function postprocessWxssDir(dir: string): void {
  for (const filePath of collectWxssFiles(dir)) {
    const source = fs.readFileSync(filePath, 'utf8');
    const next = transformWxssCompat(source);
    if (next !== source) fs.writeFileSync(filePath, next);
  }
}

function wxssCompatPlugin(): Plugin {
  return {
    name: 'lucky-ui-wxss-compat',
    generateBundle(_, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type !== 'asset' || !asset.fileName.endsWith('.wxss')) continue;
        asset.source = transformWxssCompat(String(asset.source));
      }
    },
    writeBundle(options) {
      const outputDir = options.dir && path.resolve(options.dir);
      const isWxssOutput = outputDir
        ? outputDir.split(path.sep).includes('mp-weixin') || collectWxssFiles(outputDir).length > 0
        : false;

      if (!outputDir || !isWxssOutput) return;
      postprocessWxssDir(outputDir);
      postprocessWxssDir(path.resolve(__dirname, 'dist/build/mp-weixin'));
      postprocessWxssDir(path.resolve(__dirname, 'dist/dev/mp-weixin'));
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const luckyUiBuildIdentity = resolveBuildIdentity(command);

  return {
    define: {
      __LUCKY_UI_BUILD_IDENTITY__: JSON.stringify(luckyUiBuildIdentity),
    },

    server: {
      port: LUCKY_UI_H5_PORT,
      strictPort: true,
    },

    plugins: [uni(), wxssCompatPlugin()],

    worker: {
      format: 'es',
    },

    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    },

    resolve: {
      alias: {
        // 创建一个名为 @bootstrap-icons 的别名
        // 它指向 node_modules 中的 bootstrap-icons 文件夹
        // 这能让我们的 import 路径更清晰且不受文件层级影响
        '@bootstrap-icons': path.resolve(__dirname, 'node_modules/bootstrap-icons'),
      },
    },
  };
});
