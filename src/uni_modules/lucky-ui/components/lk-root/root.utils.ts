import type { StyleValue } from 'vue';
import { generateBrandVars, type Theme } from '../../theme';
import type { RootBackground, RootTheme } from './root.props';

export type RootSafeAreaInsets = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

type RootStyleObject = Record<string, string | number>;

function formatSafeAreaValue(value: number | undefined, fallback: string): string {
  return typeof value === 'number' ? `${Math.max(value, 0)}px` : fallback;
}

export function resolveRootTheme(options: { theme: RootTheme; currentTheme: Theme }): Theme {
  return options.theme === 'auto' ? options.currentTheme : options.theme;
}

export function resolveRootClass(options: {
  theme: Theme;
  background: RootBackground;
  fullHeight: boolean;
  safeArea: boolean;
  customClass?: string | object | Array<string | object>;
}) {
  return [
    'lk-root',
    `lk-theme-${options.theme}`,
    `lk-root--background-${options.background}`,
    {
      'lk-root--full-height': options.fullHeight,
      'lk-root--safe-area': options.safeArea,
    },
    options.customClass,
  ];
}

export function resolveRootSafeAreaStyle(options: {
  safeArea: boolean;
  insets?: RootSafeAreaInsets;
}): RootStyleObject {
  if (!options.safeArea) {
    return {
      '--lk-root-safe-area-top': '0px',
      '--lk-root-safe-area-right': '0px',
      '--lk-root-safe-area-bottom': '0px',
      '--lk-root-safe-area-left': '0px',
    };
  }

  return {
    '--lk-root-safe-area-top': formatSafeAreaValue(options.insets?.top, 'env(safe-area-inset-top)'),
    '--lk-root-safe-area-right': formatSafeAreaValue(
      options.insets?.right,
      'env(safe-area-inset-right)'
    ),
    '--lk-root-safe-area-bottom': formatSafeAreaValue(
      options.insets?.bottom,
      'env(safe-area-inset-bottom)'
    ),
    '--lk-root-safe-area-left': formatSafeAreaValue(
      options.insets?.left,
      'env(safe-area-inset-left)'
    ),
  };
}

export function resolveRootBrandStyle(options: {
  brandColor: string;
  currentBrandStyle: StyleValue;
}): StyleValue {
  return options.brandColor ? generateBrandVars(options.brandColor) : options.currentBrandStyle;
}

export function resolveRootStyle(options: {
  brandColor: string;
  currentBrandStyle: StyleValue;
  safeArea: boolean;
  safeAreaInsets?: RootSafeAreaInsets;
  customStyle: StyleValue;
}): StyleValue {
  return [
    resolveRootSafeAreaStyle({
      safeArea: options.safeArea,
      insets: options.safeAreaInsets,
    }),
    resolveRootBrandStyle({
      brandColor: options.brandColor,
      currentBrandStyle: options.currentBrandStyle,
    }),
    options.customStyle || '',
  ] as StyleValue;
}
