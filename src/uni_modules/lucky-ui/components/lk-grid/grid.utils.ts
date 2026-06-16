import type { GridItem } from './grid.props';

export function resolveGridGap(gap?: number): number {
  return gap !== undefined ? gap : 12;
}

export function resolveGridStyle(options: {
  columns?: number;
  gap: number;
}): Record<string, string> {
  return {
    gridTemplateColumns: options.columns
      ? `repeat(${options.columns}, 1fr)`
      : 'repeat(auto-fill, minmax(100px, 1fr))',
    margin: `0 -${options.gap / 2}rpx -${options.gap}rpx -${options.gap / 2}rpx`,
  };
}

export function resolveGridItemStyle(gap: number): Record<string, string> {
  return {
    margin: `0 ${gap / 2}rpx ${gap}rpx ${gap / 2}rpx`,
  };
}

export function resolveGridInnerGapStyle(itemGap?: number): Record<string, string> {
  return {
    marginTop: `${itemGap || 8}rpx`,
  };
}

export function resolveGridContainerClass(clip: boolean) {
  return ['lk-grid-container', { 'is-clipped': clip }];
}

export function paginateGridItems<T>(items: T[], columns?: number, rows?: number): T[][] {
  const cols = columns || 1;
  const rowCount = rows || 1;
  const perPage = Math.max(1, cols * rowCount);
  const pages: T[][] = [];

  for (let index = 0; index < items.length; index += perPage) {
    pages.push(items.slice(index, index + perPage));
  }

  return pages;
}

export function resolveGridItemKey(pageIndex: number, index: number): string {
  return `${pageIndex}-${index}`;
}

export function resolveGridItemClass(options: {
  rippleActive: boolean;
  activeIndex: string | number;
  pageIndex: number;
  index: number;
  disabled?: boolean;
}) {
  return {
    'lk-ripple--active':
      options.rippleActive &&
      options.activeIndex === resolveGridItemKey(options.pageIndex, options.index),
    'is-disabled': Boolean(options.disabled),
  };
}

export function resolveGridClickResult(options: {
  item: GridItem;
  index: number;
  pageIndex: number;
  event?: unknown;
}) {
  return {
    activeIndex: resolveGridItemKey(options.pageIndex, options.index),
    eventName: options.item.disabled ? ('click-disabled' as const) : ('click' as const),
    payload: {
      item: options.item,
      index: options.index,
      pageIndex: options.pageIndex,
      event: options.event,
    },
  };
}
