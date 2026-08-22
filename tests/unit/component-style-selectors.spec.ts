import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { initPreContext, preCss } from '@dcloudio/uni-cli-shared';
import * as sass from 'sass';
import { describe, expect, it } from 'vitest';

const COMPONENT_ROOT = path.join(process.cwd(), 'src/uni_modules/lucky-ui/components');
const CARD_STYLE = path.join(COMPONENT_ROOT, 'lk-card', 'lk-card.scss');

function compileStyle(component: string): string {
  return sass.compile(path.join(COMPONENT_ROOT, `lk-${component}`, `lk-${component}.scss`), {
    style: 'expanded',
  }).css;
}

function selectorBlock(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`Missing selector: ${selector}`);
  const end = css.indexOf('}', start);
  return css.slice(start, end + 1);
}

function compileCardStyleForPlatform(platform: 'h5' | 'mp-weixin') {
  initPreContext(platform);
  const preprocessed = preCss(fs.readFileSync(CARD_STYLE, 'utf8'));
  const css = sass.compileString(preprocessed, {
    style: 'expanded',
    url: pathToFileURL(CARD_STYLE),
  }).css;

  return { css, preprocessed };
}

describe('component style selectors', () => {
  it('keeps the input validation state on the input root', () => {
    const css = compileStyle('input');
    const block = selectorBlock(css, '.lk-input.is-error');

    expect(css).not.toContain(':global(');
    expect(css).not.toContain('.lk-form-item.is-error');
    expect(block).toContain('border-color: var(--lk-color-danger)');
    expect(block).toContain('box-shadow: 0 0 0 var(--lk-rpx-4) var(--lk-color-danger-soft)');
  });

  it('applies the popup radius to the panel before position overrides', () => {
    const css = compileStyle('popup');
    const roundSelector = '.lk-popup.is-round .lk-popup__panel';
    const block = selectorBlock(css, roundSelector);

    expect(css).not.toContain(':global(');
    expect(block).toContain('overflow: hidden');
    expect(block).toContain('border-radius: var(--lk-popup-radius)');
    expect(css.indexOf(roundSelector)).toBeLessThan(
      css.indexOf('.lk-popup--bottom.is-round .lk-popup__panel')
    );
  });

  it('keeps overlay component layers aligned with props and public tokens', () => {
    const dropdownMenu = selectorBlock(compileStyle('dropdown'), '.lk-dropdown__menu');
    const tooltipPop = selectorBlock(compileStyle('tooltip'), '.lk-tooltip__pop');
    const toastCss = compileStyle('toast');
    const toastRoot = selectorBlock(toastCss, '.lk-toast');
    const toastManager = selectorBlock(toastCss, '.lk-toast-manager');

    expect(dropdownMenu).not.toContain('z-index:');
    expect(tooltipPop).not.toContain('z-index:');
    expect(toastRoot).toContain('z-index: var(--lk-z-index-toast)');
    expect(toastManager).toContain('z-index: var(--lk-z-index-toast)');
    expect(toastCss).not.toMatch(/z-index:\s*(?:4000|4500)/);
  });

  it('renders picker masks with directional gradients', () => {
    const css = compileStyle('picker');
    const topMask = selectorBlock(css, '.lk-picker__mask--top');
    const bottomMask = selectorBlock(css, '.lk-picker__mask--bottom');

    expect(topMask).toContain(
      'background: linear-gradient(to bottom, var(--lk-picker-bg) 0%, transparent 100%)'
    );
    expect(bottomMask).toContain(
      'background: linear-gradient(to top, var(--lk-picker-bg) 0%, transparent 100%)'
    );
  });

  it('uses native flex gaps for space layout', () => {
    const root = selectorBlock(compileStyle('space'), '.lk-space');

    expect(root).toContain('row-gap: var(--lk-space-row-gap)');
    expect(root).toContain('column-gap: var(--lk-space-col-gap)');
    expect(root).not.toContain('margin:');
  });

  it('keeps the pull refresh indicator in native slot flow', () => {
    const indicator = selectorBlock(compileStyle('pull-refresh'), '.lk-pull-refresh__indicator');

    expect(indicator).toContain('width: 100%');
    expect(indicator).toContain('align-items: center');
    expect(indicator).not.toContain('position: absolute');
    expect(indicator).not.toContain('z-index:');
  });

  it('isolates the native card cover selector through Uni preCss and Sass', () => {
    const h5 = compileCardStyleForPlatform('h5');
    const mpWeixin = compileCardStyleForPlatform('mp-weixin');
    const h5UniImage = selectorBlock(h5.css, '.lk-card__cover :deep(image)');
    const h5NativeImage = selectorBlock(h5.css, '.lk-card__cover :deep(img)');
    const mpUniImage = selectorBlock(mpWeixin.css, '.lk-card__cover :deep(image)');

    for (const block of [h5UniImage, h5NativeImage, mpUniImage]) {
      expect(block).toContain('display: block');
      expect(block).toContain('width: 100%');
      expect(block).toContain('object-fit: cover');
    }

    expect(h5.preprocessed).toContain(':deep(img)');
    expect(mpWeixin.preprocessed).not.toContain(':deep(img)');
    expect(mpWeixin.css).not.toContain(':deep(img)');
  });
});
