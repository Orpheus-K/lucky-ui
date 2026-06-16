import { defineConfig, type Plugin } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import path from 'node:path';
import fs from 'node:fs';

const LUCKY_UI_H5_PORT = 5188;

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
export default defineConfig({
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
});
