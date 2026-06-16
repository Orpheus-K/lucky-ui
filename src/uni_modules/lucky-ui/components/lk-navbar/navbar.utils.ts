import type { StyleValue } from 'vue';
import type { NavbarTitleAlign, NavbarVariant } from './navbar.props';

type NavbarStyleObject = Record<string, string | number>;

function isNavbarStyleObject(value: unknown): value is NavbarStyleObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export type NavbarMenuButtonInfo = {
  height?: number;
  top?: number;
  left?: number;
};

export function resolveNavbarRootClass(options: {
  variant: NavbarVariant;
  titleAlign: NavbarTitleAlign;
  customClass: unknown;
  fixed: boolean;
  border: boolean;
  shadow: boolean;
  background: string;
}) {
  return [
    'lk-navbar',
    `lk-navbar--${options.variant}`,
    `lk-navbar--title-${options.titleAlign}`,
    options.customClass,
    {
      'is-fixed': options.fixed,
      'is-border': options.border,
      'is-shadow': options.shadow,
      'has-background': !!options.background,
    },
  ];
}

export function resolveNavbarMergedStyle(options: {
  zIndex: number;
  background: string;
  customStyle: StyleValue;
}): StyleValue {
  const style: NavbarStyleObject = { zIndex: options.zIndex };
  if (options.background) style.background = options.background;

  if (!options.customStyle) return style;

  if (Array.isArray(options.customStyle)) {
    let merged: NavbarStyleObject = { ...style };
    options.customStyle.forEach(item => {
      if (isNavbarStyleObject(item)) merged = { ...merged, ...item };
    });
    return merged;
  }

  if (isNavbarStyleObject(options.customStyle)) {
    return { ...style, ...options.customStyle };
  }

  return [style, options.customStyle];
}

export function resolveNavbarContentHeight(options: {
  statusBarHeight: number;
  menuButtonInfo: NavbarMenuButtonInfo;
}): number {
  const capsuleHeight = options.menuButtonInfo.height ?? 0;
  const capsuleTop = options.menuButtonInfo.top ?? 0;
  if (capsuleHeight > 0) {
    return capsuleHeight + (capsuleTop - options.statusBarHeight) * 2;
  }
  return 44;
}

export function resolveNavbarSafeStyle(options: {
  fixed: boolean;
  safeArea: boolean;
  menuButtonLeft: number | undefined;
  windowWidth: number;
  rpxToPx: (value: number) => number;
}): Record<string, string> {
  if (!options.fixed || !options.safeArea) return {};
  if (typeof options.menuButtonLeft !== 'number' || options.windowWidth <= 0) return {};

  const defaultPadding = options.rpxToPx(16);
  const capsuleGap = options.rpxToPx(8);
  const capsuleReserve = options.windowWidth - options.menuButtonLeft;
  const safePadding = Math.max(defaultPadding, capsuleReserve + capsuleGap);

  return {
    '--lk-navbar-content-padding-right': `${safePadding}px`,
  };
}

export function resolveNavbarContentStyle(options: {
  navbarContentHeight: number;
  capsuleSafeStyle: Record<string, string>;
}): StyleValue {
  return {
    height: `${options.navbarContentHeight}px`,
    ...options.capsuleSafeStyle,
  };
}

export function resolveNavbarPlaceholderStyle(options: {
  safeArea: boolean;
  statusBarHeight: number;
  navbarContentHeight: number;
}): StyleValue {
  return {
    height: `${(options.safeArea ? options.statusBarHeight : 0) + options.navbarContentHeight}px`,
  };
}

export function shouldNavigateBack(pages: unknown): boolean {
  return Array.isArray(pages) && pages.length > 1;
}
