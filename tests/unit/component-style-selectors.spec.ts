import path from 'node:path';
import * as sass from 'sass';
import { describe, expect, it } from 'vitest';

const COMPONENT_ROOT = path.join(process.cwd(), 'src/uni_modules/lucky-ui/components');

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
});
