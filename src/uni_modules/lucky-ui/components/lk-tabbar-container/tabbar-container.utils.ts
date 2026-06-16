import type { StyleValue } from 'vue';
import type {
  TabConfig,
  TabbarContainerMode,
  TabbarContainerRenderMode,
} from './tabbar-container.props';

type TabbarContainerStyleObject = Record<string, string | number>;

function isTabbarContainerStyleObject(value: unknown): value is TabbarContainerStyleObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export type TabbarContainerSafeAreaInfo = {
  screenHeight?: number;
  safeArea?: {
    bottom?: number;
  };
  safeAreaInsets?: {
    bottom?: number;
  };
};

const slidingIndicatorModes: TabbarContainerMode[] = [
  'block',
  'marker-top',
  'marker-bottom',
  'dot-slide',
];

export function resolveTabbarContainerSafeAreaBottom(info: TabbarContainerSafeAreaInfo): number {
  const insetBottom = info.safeAreaInsets?.bottom;
  if (typeof insetBottom === 'number') return Math.max(insetBottom, 0);

  const screenHeight = info.screenHeight;
  const safeAreaBottom = info.safeArea?.bottom;
  if (typeof screenHeight === 'number' && typeof safeAreaBottom === 'number') {
    return Math.max(screenHeight - safeAreaBottom, 0);
  }

  return 0;
}

export function isTabbarContainerSlidingMode(mode: TabbarContainerMode): boolean {
  return slidingIndicatorModes.includes(mode);
}

export function resolveTabbarContainerCopyText(options: {
  value: string;
  fallback: string;
}): string {
  return options.value || options.fallback;
}

export function resolveTabbarContainerClass(options: {
  mode: TabbarContainerMode;
  fixed: boolean;
  safeMode: boolean;
  renderMode: TabbarContainerRenderMode;
  customClass: unknown;
}) {
  return [
    'lk-tabbar-container',
    `lk-tabbar-container--${options.mode}`,
    `lk-tabbar-container--render-${options.renderMode}`,
    {
      'is-fixed-tabbar': options.fixed,
      'is-static-tabbar': !options.fixed,
      'is-safe-mode': options.safeMode,
    },
    options.customClass,
  ];
}

export function resolveTabbarContainerStyle(options: {
  preferRuntimeSafeArea: boolean;
  safeAreaBottom: number;
  customStyle: StyleValue;
}): StyleValue {
  const style: TabbarContainerStyleObject = {};
  if (options.preferRuntimeSafeArea || options.safeAreaBottom > 0) {
    style['--lk-tabbar-container-safe-area-bottom'] = `${options.safeAreaBottom}px`;
  }

  if (!options.customStyle) return style;

  if (Array.isArray(options.customStyle)) {
    let merged: TabbarContainerStyleObject = { ...style };
    options.customStyle.forEach(item => {
      if (isTabbarContainerStyleObject(item)) merged = { ...merged, ...item };
    });
    return merged;
  }

  if (isTabbarContainerStyleObject(options.customStyle)) {
    return { ...style, ...options.customStyle };
  }

  return [style, options.customStyle];
}

export function resolveTabbarContainerActiveBgStyle(options: {
  count: number;
  activeIndex: number;
}) {
  if (options.count === 0 || options.activeIndex === -1) return { display: 'none' };

  const width = 100 / options.count;
  const left = options.activeIndex * width;

  return {
    '--item-width': `${width}%`,
    '--item-left': `${left}%`,
    '--item-count': options.count,
    '--active-index': options.activeIndex,
    '--active-center': `${left + width / 2}%`,
  };
}

export function resolveTabbarContainerFillIconName(iconName: string): string {
  if (!iconName || iconName.endsWith('-fill')) return iconName;
  return `${iconName}-fill`;
}

export function resolveTabbarContainerIcon(options: { tab: TabConfig; activeId: string }): string {
  if (options.tab.id !== options.activeId) return options.tab.icon;
  if (options.tab.selectedIcon) return options.tab.selectedIcon;
  if (options.tab.activeIconFill) return resolveTabbarContainerFillIconName(options.tab.icon);
  return options.tab.icon;
}

export function shouldChangeTabbarContainerTab(options: {
  nextTabId: string;
  activeId: string;
}): boolean {
  return options.nextTabId !== options.activeId;
}

export function getTabbarContainerPreloadIds(options: {
  tabs: TabConfig[];
  activeId: string;
}): string[] {
  return options.tabs.filter(tab => tab.id !== options.activeId).map(tab => tab.id);
}

export function shouldShowTabbarContainerBadge(badge: number | undefined): boolean {
  return typeof badge === 'number' && badge > 0;
}

export function resolveTabbarContainerBadgeText(badge: number | undefined): string {
  if (typeof badge !== 'number' || badge <= 0) return '';
  return badge > 99 ? '99+' : String(badge);
}
