import path from 'node:path';
import postcss from 'postcss';
import * as sass from 'sass';
import { describe, expect, it } from 'vitest';

const THEME_ENTRY = path.join(process.cwd(), 'src/uni_modules/lucky-ui/theme/src/index.scss');

function compileThemeCss(): string {
  return sass.compile(THEME_ENTRY, { style: 'expanded' }).css;
}

function colorDeclarationsForSelector(css: string, selector: string): string[] {
  const values: string[] = [];

  postcss.parse(css).walkRules(rule => {
    if (!rule.selectors.map(item => item.trim()).includes(selector)) return;

    rule.walkDecls('color', declaration => {
      values.push(declaration.value);
    });
  });

  return values;
}

function selectorsInTheme(css: string): string[] {
  const selectors = new Set<string>();

  postcss.parse(css).walkRules(rule => {
    rule.selectors.forEach(selector => selectors.add(selector.trim()));
  });

  return [...selectors];
}

describe('theme base styles', () => {
  it('defines the default text color on page without overriding descendant inheritance', () => {
    const css = compileThemeCss();

    expect(colorDeclarationsForSelector(css, 'page')).toContain('var(--lk-text-primary)');
    expect(colorDeclarationsForSelector(css, 'view')).toEqual([]);
    expect(colorDeclarationsForSelector(css, 'text')).toEqual([]);
  });

  it('includes cross-platform theme transition rules in the public entry', () => {
    const selectors = selectorsInTheme(compileThemeCss());

    expect(selectors).toContain('.lk-theme-transition');
    expect(selectors).toContain('.lk-theme-switching *');
    expect(selectors).toContain('.lk-theme-switching view');
  });
});
