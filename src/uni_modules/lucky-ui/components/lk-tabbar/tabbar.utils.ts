import type { StyleValue } from 'vue';
import {
  TabbarMode,
  type TabbarItemConfig,
  type TabbarMode as TabbarModeType,
} from './tabbar.props';
import type { TabbarValue } from './context';

export type TabbarSafeAreaInfo = {
  screenHeight?: number;
  safeArea?: {
    bottom?: number;
  };
  safeAreaInsets?: {
    bottom?: number;
  };
};

export function resolveTabbarSafeAreaBottom(info: TabbarSafeAreaInfo): number {
  const insetBottom = info.safeAreaInsets?.bottom;
  if (typeof insetBottom === 'number') return Math.max(insetBottom, 0);

  const screenHeight = info.screenHeight;
  const safeAreaBottom = info.safeArea?.bottom;
  if (typeof screenHeight === 'number' && typeof safeAreaBottom === 'number') {
    return Math.max(screenHeight - safeAreaBottom, 0);
  }

  return 0;
}

export function resolveTabbarIndex(value: TabbarValue): number {
  if (typeof value === 'number') return value;
  return parseInt(value, 10) || 0;
}

export function resolveTabbarSliderMetrics(options: {
  mode: TabbarModeType;
  totalItems: number;
  index: number;
}): { left: number; width: number } | null {
  if (options.mode !== TabbarMode.Slider || options.totalItems <= 0) return null;
  const width = 100 / options.totalItems;
  return {
    left: options.index * width,
    width,
  };
}

export function resolveTabbarRootStyle(options: {
  zIndex: number;
  safeArea: boolean;
  preferRuntimeSafeArea: boolean;
  safeAreaBottom: number;
  bgColor: string;
  activeColor: string;
  inactiveColor: string;
}): Record<string, string | number> {
  const style: Record<string, string | number> = {
    zIndex: options.zIndex,
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
  };

  if (options.safeArea && (options.preferRuntimeSafeArea || options.safeAreaBottom > 0)) {
    style['--lk-tabbar-safe-area-bottom'] = `${options.safeAreaBottom}px`;
  }
  if (options.bgColor) style['--lk-tabbar-bg'] = options.bgColor;
  if (options.activeColor) style['--lk-tabbar-active-color'] = options.activeColor;
  if (options.inactiveColor) style['--lk-tabbar-inactive-color'] = options.inactiveColor;

  return style;
}

export function resolveTabbarStyleLayers(options: {
  rootStyle: StyleValue;
  customStyle: StyleValue;
}): StyleValue {
  return [options.rootStyle, options.customStyle];
}

export function resolveTabbarSliderStyle(options: {
  left: number;
  width: number;
}): Record<string, string> {
  return {
    left: `${options.left}%`,
    width: `${options.width}%`,
  };
}

export function resolveTabbarPlaceholderStyle(options: {
  safeArea: boolean;
  preferRuntimeSafeArea: boolean;
  safeAreaBottom: number;
}): Record<string, string> {
  if (!options.safeArea || (!options.preferRuntimeSafeArea && options.safeAreaBottom <= 0)) {
    return {};
  }
  return {
    '--lk-tabbar-safe-area-bottom': `${options.safeAreaBottom}px`,
  };
}

export function resolveTabbarRootClass(options: {
  customClass: unknown;
  mode: TabbarModeType;
  fixed: boolean;
  safeArea: boolean;
  border: boolean;
  glassBg: boolean;
}) {
  return [
    options.customClass,
    `lk-tabbar--${options.mode}`,
    {
      'lk-tabbar--fixed': options.fixed,
      'lk-tabbar--safe-area': options.safeArea,
      'lk-tabbar--border': options.border,
      'lk-tabbar--glass': options.glassBg,
    },
  ];
}

export function resolveTabbarItemActive(
  activeValue: TabbarValue | '' | undefined,
  name: TabbarValue
): boolean {
  return activeValue === name;
}

export function isTabbarBumpItem(options: {
  mode: TabbarModeType;
  total: number;
  index: number;
}): boolean {
  if (options.mode !== TabbarMode.Bump) return false;
  return options.total % 2 === 1 && options.index === Math.floor(options.total / 2);
}

export function resolveTabbarItemClass(options: {
  active: boolean;
  bump: boolean;
  customClass?: unknown;
}) {
  return [
    {
      'is-active': options.active,
      'lk-tabbar-item--bump': options.bump,
    },
    options.customClass,
  ];
}

export function resolveTabbarIconColor(options: {
  active: boolean;
  bump: boolean;
  activeColor: string;
  inactiveColor: string;
}): string {
  if (options.bump) return 'var(--lk-color-white)';
  if (options.active) return options.activeColor || 'var(--lk-color-primary)';
  return options.inactiveColor || 'var(--lk-text-secondary)';
}

export function resolveTabbarFillIconName(iconName: string): string {
  if (!iconName || iconName.endsWith('-fill')) return iconName;
  return `${iconName}-fill`;
}

export function resolveTabbarListItemIcon(options: {
  item: TabbarItemConfig;
  active: boolean;
}): string {
  if (options.active && options.item.selectedIcon) return options.item.selectedIcon;
  if (options.active && options.item.activeIconFill)
    return resolveTabbarFillIconName(options.item.icon);
  return options.item.icon;
}

export function shouldShowTabbarBadge(options: {
  dot?: boolean;
  badge?: string | number;
}): boolean {
  return (
    !options.dot &&
    options.badge !== '' &&
    options.badge !== null &&
    typeof options.badge !== 'undefined'
  );
}

export function resolveTabbarBadgeText(badge: string | number): string {
  return String(badge);
}

export function resolveTabbarItemLabelStyle(options: {
  active: boolean;
  bump: boolean;
  activeColor: string;
  inactiveColor: string;
}): string {
  if (options.bump) return '';
  return `color: ${options.active ? options.activeColor : options.inactiveColor}`;
}

export function shouldSwitchTabbarPage(options: {
  switchPage: boolean;
  item: TabbarItemConfig | undefined;
}): boolean {
  return options.switchPage && !!options.item?.pagePath;
}
