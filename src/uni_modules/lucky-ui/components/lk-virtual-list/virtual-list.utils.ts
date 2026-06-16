import type { StyleValue } from 'vue';

export type VirtualListCustomStyle = string | Record<string, unknown>;

export type VirtualListScrollEvent = {
  detail?: { scrollTop?: number };
  target?: { scrollTop?: number };
};

export function resolveVirtualListPx(
  value: string | number | undefined | null,
  fallback = 0,
  upx2px?: (value: number) => number
): number {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;

  const normalized = String(value).trim();
  if (normalized.endsWith('rpx') || normalized.endsWith('upx')) {
    const parsed = Number.parseFloat(normalized);
    if (!Number.isFinite(parsed)) return fallback;
    return upx2px ? upx2px(parsed) : parsed;
  }

  if (normalized.endsWith('px')) {
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function resolveVirtualListItemPx(
  value: string | number,
  upx2px?: (value: number) => number
): number {
  return Math.max(1, Math.round(resolveVirtualListPx(value, 100, upx2px)));
}

export function resolveVirtualListOverscan(options: {
  buffer: number;
  dynamicOverscan: boolean;
  maxOverscanRows: number;
  currentOverscanBoost: number;
}): number {
  const base = Math.max(0, options.buffer);
  const dynamic = options.dynamicOverscan
    ? Math.min(Math.max(0, options.maxOverscanRows), Math.max(0, options.currentOverscanBoost))
    : 0;
  return base + dynamic;
}

export function resolveVirtualListOverscanBoost(options: {
  delta: number;
  itemPx: number;
  maxOverscanRows: number;
  overscanBoostFactor: number;
}): number {
  const deltaRows = Math.abs(options.delta) / Math.max(1, options.itemPx);
  return Math.min(
    Math.max(0, options.maxOverscanRows),
    Math.floor(deltaRows * Math.max(0, options.overscanBoostFactor))
  );
}

export function resolveVirtualWindow(options: {
  itemCount: number;
  itemPx: number;
  containerHeightPx: number;
  scrollTop: number;
  overscanCount: number;
}) {
  const itemCount = Math.max(0, options.itemCount);
  const itemPx = Math.max(1, options.itemPx);
  const baseVisibleCount = Math.ceil(Math.max(0, options.containerHeightPx) / itemPx);
  const visibleCount = baseVisibleCount + Math.max(0, options.overscanCount) * 2;
  const maxStart = Math.max(0, itemCount - visibleCount);
  const anchorRow = Math.floor(Math.max(0, options.scrollTop) / itemPx);
  const start = Math.min(Math.max(0, anchorRow - Math.max(0, options.overscanCount)), maxStart);
  const end = Math.min(itemCount, start + visibleCount);

  return {
    baseVisibleCount,
    visibleCount,
    start,
    end,
  };
}

export function resolveVirtualListMetrics(options: {
  itemCount: number;
  itemPx: number;
  start: number;
  end: number;
  reserveRows: number;
}) {
  const itemPx = Math.max(1, options.itemPx);
  const totalHeight = Math.max(0, options.itemCount) * itemPx;
  const topPadding = Math.max(0, options.start) * itemPx;
  const renderedHeight = Math.max(0, options.end - options.start) * itemPx;
  const bottomPadding = Math.max(0, totalHeight - topPadding - renderedHeight);
  const reservePadding = Math.max(0, options.reserveRows) * itemPx;

  return {
    totalHeight,
    topPadding,
    renderedHeight,
    bottomPadding,
    reservePadding,
    bottomPaddingTotal: bottomPadding + reservePadding,
    totalScrollable: totalHeight + reservePadding,
  };
}

export function shouldEmitVirtualReachBottom(options: {
  remain: number;
  lowerThresholdPx: number;
  emitted: boolean;
}): boolean {
  return options.remain <= options.lowerThresholdPx && !options.emitted;
}

export function shouldResetVirtualReachBottom(options: {
  remain: number;
  lowerThresholdPx: number;
}): boolean {
  return options.remain > options.lowerThresholdPx * 2;
}

export function shouldEmitVirtualPrefetch(options: {
  remainingItems: number;
  prefetchRows: number;
  emitted: boolean;
}): boolean {
  return (
    options.prefetchRows > 0 && options.remainingItems <= options.prefetchRows && !options.emitted
  );
}

export function shouldResetVirtualPrefetch(options: {
  remainingItems: number;
  prefetchRows: number;
}): boolean {
  return options.prefetchRows > 0 && options.remainingItems > options.prefetchRows * 2;
}

export function resolveVirtualListClass(customClass?: string | object | Array<string | object>) {
  return ['lk-virtual-list', customClass];
}

export function resolveVirtualListRootStyle(options: {
  heightPx: number;
  customStyle?: VirtualListCustomStyle;
}): StyleValue {
  return [
    { height: `${Math.max(0, options.heightPx)}px` },
    (options.customStyle || '') as StyleValue,
  ] as StyleValue;
}

export function extractVirtualListScrollTop(event: VirtualListScrollEvent): number {
  return event.detail?.scrollTop ?? event.target?.scrollTop ?? 0;
}

export function clampVirtualListIndex(index: number, itemCount: number): number {
  return Math.max(0, Math.min(index, Math.max(0, itemCount - 1)));
}
