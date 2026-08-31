export type PageMenuButtonInfo = {
  height?: number;
  top?: number;
  left?: number;
};

export type ResolvePageNavbarHeightOptions = {
  statusBarHeight: number;
  menuButtonInfo?: PageMenuButtonInfo;
  defaultHeight?: number;
};

export type ResolvePageLeftSlotStyleOptions = {
  capsuleAlign: boolean;
  statusBarHeight: number;
  navbarContentHeight: number;
  menuButtonInfo?: PageMenuButtonInfo;
  zIndex?: number | string;
};

export type ResolvePageRootClassOptions = {
  customClass?: unknown;
  scrollable: boolean;
};

/**
 * 计算导航栏内容区域高度（小程序中根据胶囊按钮自适应，默认 44px）
 */
export function resolvePageNavbarContentHeight(options: ResolvePageNavbarHeightOptions): number {
  const capsuleHeight = options.menuButtonInfo?.height ?? 0;
  const capsuleTop = options.menuButtonInfo?.top ?? 0;
  if (capsuleHeight > 0) {
    return capsuleHeight + (capsuleTop - options.statusBarHeight) * 2;
  }
  return options.defaultHeight ?? 44;
}

/**
 * 计算预留的顶部总高度（状态栏高度 + 导航栏内容区高度）
 */
export function resolvePageReservedTopHeight(options: {
  statusBarHeight: number;
  navbarContentHeight: number;
}): number {
  return options.statusBarHeight + options.navbarContentHeight;
}

/**
 * 计算左侧插槽的定位与高度样式，实现精准物理居中对齐
 */
export function resolvePageLeftSlotStyle(
  options: ResolvePageLeftSlotStyleOptions
): Record<string, string> {
  const style: Record<string, string> = {};

  if (options.zIndex !== undefined && options.zIndex !== '') {
    style.zIndex = String(options.zIndex);
  }

  if (options.capsuleAlign) {
    // 胶囊对齐逻辑：居中对齐小程序右上角的胶囊按钮（若无胶囊信息则使用 6px 偏移与 32px 标准高度回退）
    const top = options.menuButtonInfo?.top || options.statusBarHeight + 6;
    const height = options.menuButtonInfo?.height || 32;
    style.top = `${top}px`;
    style.height = `${height}px`;
  } else {
    // 默认对齐逻辑：居中对齐标准导航栏内容区
    style.top = `${options.statusBarHeight}px`;
    style.height = `${options.navbarContentHeight}px`;
  }

  return style;
}

/**
 * 构建根容器类名
 */
export function resolvePageRootClass(options: ResolvePageRootClassOptions): unknown[] {
  return [
    'lk-page',
    options.customClass,
    {
      'lk-page--non-scrollable': !options.scrollable,
    },
  ];
}
