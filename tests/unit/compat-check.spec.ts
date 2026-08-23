import { mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const COMPAT_SCRIPT_PATH = fileURLToPath(new URL('../../scripts/compat-check.js', import.meta.url));
const WORKFLOW_PATH = fileURLToPath(
  new URL('../../.github/workflows/uni-compat.yml', import.meta.url)
);
const PACKAGE_PATH = fileURLToPath(new URL('../../package.json', import.meta.url));
const { expressionAllowsMp, scanContent } = require('../../scripts/compat-check.js') as {
  expressionAllowsMp: (expression: string) => boolean;
  scanContent: (filePath: string, content: string) => Array<{ id: string; level: string }>;
};

function runCompatCheck(root: string, strict: boolean) {
  return spawnSync(
    process.execPath,
    [COMPAT_SCRIPT_PATH, '--root', root, ...(strict ? ['--strict'] : [])],
    { encoding: 'utf8' }
  );
}

describe('compat-check rules', () => {
  it('understands UniApp platform guards for mini-program reachability', () => {
    expect(expressionAllowsMp('H5 || APP-PLUS')).toBe(false);
    expect(expressionAllowsMp('MP || APP-PLUS')).toBe(true);
    expect(expressionAllowsMp('MP-WEIXIN')).toBe(true);
  });

  it('blocks native template click but allows component click emits', () => {
    const nativeFindings = scanContent('sample.vue', '<template><view @click="tap" /></template>');
    expect(nativeFindings.some(item => item.id === 'no-click-template')).toBe(true);

    const componentFindings = scanContent(
      'sample.vue',
      '<template><lk-button @click="submit" /></template>'
    );
    expect(componentFindings.some(item => item.id === 'no-click-template')).toBe(false);
  });

  it('requires browser APIs and dynamic components to be isolated from mini programs', () => {
    const unsafe = scanContent(
      'sample.vue',
      [
        '<script setup>',
        'document.createElement("div");',
        '</script>',
        '<template><component :is="current" /></template>',
      ].join('\n')
    );
    expect(unsafe.map(item => item.id)).toContain('no-browser-dom');
    expect(unsafe.map(item => item.id)).toContain('no-dynamic-component-mp');

    const guarded = scanContent(
      'sample.vue',
      [
        '<script setup>',
        '// #ifdef H5',
        'document.createElement("div");',
        '// #endif',
        '</script>',
        '<template>',
        '<!-- #ifdef H5 || APP-PLUS -->',
        '<component :is="current" />',
        '<!-- #endif -->',
        '</template>',
      ].join('\n')
    );
    expect(guarded.filter(item => item.level === 'error')).toEqual([]);
  });

  it('rejects :global combined with a Sass parent selector', () => {
    const unsafe = scanContent(
      'sample.scss',
      '.lk-input { :global(.lk-form-item.is-error) & { color: red; } }'
    );
    expect(unsafe.map(item => item.id)).toContain('no-global-parent-selector');

    const safe = scanContent('sample.scss', '.lk-input { &.is-error { color: red; } }');
    expect(safe.map(item => item.id)).not.toContain('no-global-parent-selector');
  });

  it('keeps report mode non-blocking while strict mode blocks only errors', () => {
    const fixtureRoot = mkdtempSync(join(tmpdir(), 'lucky-ui-compat-'));

    try {
      const unsafePath = join(fixtureRoot, 'unsafe.vue');
      writeFileSync(unsafePath, '<template><div>unsafe</div></template>\n', 'utf8');

      const reportOnly = runCompatCheck(fixtureRoot, false);
      expect(reportOnly.status).toBe(0);
      expect(`${reportOnly.stdout}${reportOnly.stderr}`).toContain('error 1');

      const strictError = runCompatCheck(fixtureRoot, true);
      expect(strictError.status).toBe(1);
      expect(`${strictError.stdout}${strictError.stderr}`).toContain('strict 模式将因 error 失败');

      unlinkSync(unsafePath);
      writeFileSync(join(fixtureRoot, 'warning.scss'), '.fixture { position: fixed; }\n', 'utf8');

      const strictWarning = runCompatCheck(fixtureRoot, true);
      expect(strictWarning.status).toBe(0);
      expect(`${strictWarning.stdout}${strictWarning.stderr}`).toContain('error 0 条，warn 1 条');
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
  });

  it('fails closed when the strict scan root does not exist', () => {
    const missingRoot = join(tmpdir(), `lucky-ui-compat-missing-${process.pid}-${Date.now()}`);

    const reportOnly = runCompatCheck(missingRoot, false);
    expect(reportOnly.status).toBe(0);
    expect(`${reportOnly.stdout}${reportOnly.stderr}`).toContain('未找到扫描目录');

    const strict = runCompatCheck(missingRoot, true);
    expect(strict.status).toBe(1);
    expect(`${strict.stdout}${strict.stderr}`).toContain('strict 模式失败');
  });

  it('keeps the package alias strict and runs its contract in the compatibility workflow', () => {
    const workflow = readFileSync(WORKFLOW_PATH, 'utf8');
    const packageJson = JSON.parse(readFileSync(PACKAGE_PATH, 'utf8')) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.['compat-check:strict']).toBe(
      'node scripts/compat-check.js --strict'
    );
    expect(workflow).toContain('run: pnpm run test:unit');
    expect(workflow).toContain('run: pnpm run compat-check:strict');
    expect(workflow).not.toMatch(/run:\s+pnpm run compat-check\s*$/m);
  });
});
