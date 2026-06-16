import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { expressionAllowsMp, scanContent } = require('../../scripts/compat-check.js') as {
  expressionAllowsMp: (expression: string) => boolean;
  scanContent: (filePath: string, content: string) => Array<{ id: string; level: string }>;
};

describe('compat-check rules', () => {
  it('understands UniApp platform guards for mini-program reachability', () => {
    expect(expressionAllowsMp('H5 || APP-PLUS')).toBe(false);
    expect(expressionAllowsMp('MP || APP-PLUS')).toBe(true);
    expect(expressionAllowsMp('MP-WEIXIN')).toBe(true);
  });

  it('blocks native template click but allows component click emits', () => {
    const nativeFindings = scanContent('sample.vue', '<template><view @click="tap" /></template>');
    expect(nativeFindings.some(item => item.id === 'no-click-template')).toBe(true);

    const componentFindings = scanContent('sample.vue', '<template><lk-button @click="submit" /></template>');
    expect(componentFindings.some(item => item.id === 'no-click-template')).toBe(false);
  });

  it('requires browser APIs and dynamic components to be isolated from mini programs', () => {
    const unsafe = scanContent('sample.vue', [
      '<script setup>',
      'document.createElement("div");',
      '</script>',
      '<template><component :is="current" /></template>',
    ].join('\n'));
    expect(unsafe.map(item => item.id)).toContain('no-browser-dom');
    expect(unsafe.map(item => item.id)).toContain('no-dynamic-component-mp');

    const guarded = scanContent('sample.vue', [
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
    ].join('\n'));
    expect(guarded.filter(item => item.level === 'error')).toEqual([]);
  });
});
