import path from 'node:path';
import * as sass from 'sass';
import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_BRAND_COLOR,
  generateBrandVars,
  generateShade,
} from '../../src/uni_modules/lucky-ui/theme/src/brand-color';
import { themeStore } from '../../src/uni_modules/lucky-ui/theme/src/theme-store';
import {
  cssColorToRgb,
  generateBrandShade,
} from '../../src/uni_modules/lucky-ui/utils/chart-colors';

const BRAND_LEVELS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
const THEME_SOURCE_DIR = path.join(process.cwd(), 'src/uni_modules/lucky-ui/theme/src');

function extractBrandVars(serialized: string): Record<string, string> {
  return Object.fromEntries(
    [...serialized.matchAll(/(--lk-brand-(?:\d+|rgb)):\s*([^;}]+)/g)].map(match => [
      match[1],
      match[2].trim(),
    ])
  );
}

function compileScssPalette(baseColor: string): Record<string, string> {
  const declarations = BRAND_LEVELS.map(
    level => `  --lk-brand-${level}: #{colors.$color-brand-${level}};`
  ).join('\n');
  const source = `
@use 'tokens/colors' as colors with ($color-brand-base: ${baseColor});

:root {
${declarations}
}
`;
  const result = sass.compileString(source, { loadPaths: [THEME_SOURCE_DIR] });
  return extractBrandVars(result.css);
}

function normalizeColor(color: string): [number, number, number] {
  const rgb = cssColorToRgb(color);
  if (!rgb) throw new Error(`Unable to parse color: ${color}`);
  return [Math.round(rgb.r), Math.round(rgb.g), Math.round(rgb.b)];
}

function expectRuntimePaletteToMatchScss(baseColor: string): void {
  const scssPalette = compileScssPalette(baseColor);
  const runtimePalette = generateBrandVars(baseColor);

  BRAND_LEVELS.forEach(level => {
    const name = `--lk-brand-${level}`;
    const expected = normalizeColor(scssPalette[name]);

    expect(normalizeColor(runtimePalette[name])).toEqual(expected);
    expect(normalizeColor(generateShade(baseColor, level))).toEqual(expected);
    expect(normalizeColor(generateBrandShade(baseColor, level))).toEqual(expected);
  });
}

describe('theme brand color palette', () => {
  it('keeps every runtime generator aligned with the canonical SCSS palette', () => {
    expectRuntimePaletteToMatchScss(DEFAULT_BRAND_COLOR);
    expectRuntimePaletteToMatchScss('#336699');
  });

  it('uses the canonical dark-shade curve for levels 700 through 900', () => {
    expect(BRAND_LEVELS.slice(6).map(level => generateShade(DEFAULT_BRAND_COLOR, level))).toEqual([
      'rgb(87, 83, 181)',
      'rgb(68, 66, 142)',
      'rgb(50, 48, 104)',
    ]);
  });

  it('serializes the shared generator through the global theme store', () => {
    const customColor = '#336699';
    vi.stubGlobal('uni', { setStorageSync: vi.fn() });
    themeStore.setBrandColor(customColor);

    try {
      expect(extractBrandVars(themeStore.brandStyleVars)).toEqual(generateBrandVars(customColor));
    } finally {
      themeStore.setBrandColor(DEFAULT_BRAND_COLOR);
      vi.unstubAllGlobals();
    }
  });
});
