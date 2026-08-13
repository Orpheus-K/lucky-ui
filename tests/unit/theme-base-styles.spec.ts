import path from 'node:path';
import { initPreContext, preCss } from '@dcloudio/uni-cli-shared/dist/preprocess';
import postcss from 'postcss';
import * as sass from 'sass';
import { describe, expect, it } from 'vitest';

const THEME_ENTRY = path.join(process.cwd(), 'src/uni_modules/lucky-ui/theme/src/index.scss');
type ThemePlatform = 'h5' | 'mp-weixin';

function compileThemeCss(): string {
  return sass.compile(THEME_ENTRY, { style: 'expanded' }).css;
}

function compileThemeCssForPlatform(platform: ThemePlatform): string {
  initPreContext(platform);
  return preCss(compileThemeCss()) as string;
}

function declarationsForSelector(css: string, selector: string, property: string): string[] {
  const values: string[] = [];

  postcss.parse(css).walkRules(rule => {
    if (!rule.selectors.map(item => item.trim()).includes(selector)) return;

    rule.walkDecls(property, declaration => {
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

    expect(declarationsForSelector(css, 'page', 'color')).toContain('var(--lk-text-primary)');
    expect(declarationsForSelector(css, 'view', 'color')).toEqual([]);
    expect(declarationsForSelector(css, 'text', 'color')).toEqual([]);
  });

  it('includes cross-platform theme transition rules in the public entry', () => {
    const selectors = selectorsInTheme(compileThemeCss());

    expect(selectors).toContain('.lk-theme-transition');
    expect(selectors).toContain('.lk-theme-switching *');
    expect(selectors).toContain('.lk-theme-switching view');
  });

  it('keeps the native select reset on H5 without leaking it into MP-WEIXIN CSS', () => {
    const h5Css = compileThemeCssForPlatform('h5');
    const mpWeixinCss = compileThemeCssForPlatform('mp-weixin');

    expect(declarationsForSelector(h5Css, 'select', 'font')).toContain('inherit');
    expect(declarationsForSelector(mpWeixinCss, 'select', 'font')).toEqual([]);

    for (const selector of ['button', 'input', 'textarea']) {
      expect(declarationsForSelector(h5Css, selector, 'font')).toContain('inherit');
      expect(declarationsForSelector(mpWeixinCss, selector, 'font')).toContain('inherit');
    }
  });
});
