import type { CSSProperties, StyleValue } from 'vue';
import type { PlacedCard, WaterfallItem } from './waterfall.props';

export type WaterfallSystemInfo = {
  windowWidth?: number;
  windowHeight?: number;
};

export type WaterfallUnitContext = {
  systemInfo?: WaterfallSystemInfo;
  containerHeight?: number;
  upx2px?: (value: number) => number;
};

export function resolveWaterfallPx(
  value: string | number | undefined | null,
  fallback = 0,
  context: WaterfallUnitContext = {}
): number {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;

  const normalized = String(value).trim();
  if (normalized === '100vh') {
    return context.systemInfo?.windowHeight || 600;
  }

  if (normalized.endsWith('%')) {
    const percent = Number.parseFloat(normalized);
    if (!Number.isFinite(percent)) return fallback;
    const base = context.containerHeight || context.systemInfo?.windowHeight || 600;
    return (base * percent) / 100;
  }

  if (normalized.endsWith('rpx') || normalized.endsWith('upx')) {
    const parsed = Number.parseFloat(normalized);
    if (!Number.isFinite(parsed)) return fallback;
    return context.upx2px ? context.upx2px(parsed) : parsed / 2;
  }

  if (normalized.endsWith('px')) {
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  if (normalized.endsWith('vh')) {
    const parsed = Number.parseFloat(normalized);
    if (!Number.isFinite(parsed)) return fallback;
    return ((context.systemInfo?.windowHeight || 600) * parsed) / 100;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function resolveWaterfallUnit(
  value: string | number | undefined | null,
  unit = 'px'
): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  return `${value}${unit}`;
}

export function resolveWaterfallColumnWidth(options: {
  containerWidth: number;
  paddingX: number;
  gutter: number;
}): number {
  const availableWidth = options.containerWidth - options.paddingX * 2 - options.gutter;
  return Math.max(0, availableWidth / 2);
}

export function resolveWaterfallRightColumnLeft(options: {
  paddingX: number;
  columnWidth: number;
  gutter: number;
}): number {
  return options.paddingX + options.columnWidth + options.gutter;
}

export function resolveWaterfallTotalHeight(options: {
  leftHeight: number;
  rightHeight: number;
  paddingY: number;
}): number {
  return Math.max(options.leftHeight, options.rightHeight) + options.paddingY;
}

export function calculateWaterfallCardHeight(options: {
  item: WaterfallItem;
  columnWidth: number;
  estimateHeight: number;
  defaultExtraHeight: number;
}): number {
  if (options.columnWidth <= 0) return options.estimateHeight;

  if (options.item.ratio && options.item.ratio > 0) {
    return Math.round(
      options.columnWidth * options.item.ratio +
        (options.item.extraHeight ?? options.defaultExtraHeight)
    );
  }

  if (
    options.item.imageWidth &&
    options.item.imageHeight &&
    options.item.imageWidth > 0 &&
    options.item.imageHeight > 0
  ) {
    const scale = options.columnWidth / options.item.imageWidth;
    return Math.round(
      options.item.imageHeight * scale + (options.item.extraHeight ?? options.defaultExtraHeight)
    );
  }

  return options.estimateHeight;
}

export function placeWaterfallCards(options: {
  items: WaterfallItem[];
  startIndex?: number;
  leftHeight: number;
  rightHeight: number;
  paddingX: number;
  rightColumnLeft: number;
  columnWidth: number;
  rowGap: number;
  estimateHeight: number;
  defaultExtraHeight: number;
}) {
  let leftHeight = options.leftHeight;
  let rightHeight = options.rightHeight;
  const cards: PlacedCard[] = [];

  for (let i = options.startIndex ?? 0; i < options.items.length; i++) {
    const item = options.items[i];
    const height = calculateWaterfallCardHeight({
      item,
      columnWidth: options.columnWidth,
      estimateHeight: options.estimateHeight,
      defaultExtraHeight: options.defaultExtraHeight,
    });
    const isLeft = leftHeight <= rightHeight;

    cards.push({
      index: i,
      id: item.id ?? i,
      column: isLeft ? 0 : 1,
      top: isLeft ? leftHeight : rightHeight,
      left: isLeft ? options.paddingX : options.rightColumnLeft,
      width: options.columnWidth,
      height,
      loadingState: item.image ? 'loading' : 'loaded',
      item,
    });

    if (isLeft) leftHeight += height + options.rowGap;
    else rightHeight += height + options.rowGap;
  }

  return {
    cards,
    leftHeight,
    rightHeight,
    processedIndex: options.items.length,
  };
}

export function shouldWaterfallLoadMore(options: {
  totalHeight: number;
  scrollTop: number;
  viewportHeight: number;
  lowerThreshold: number;
}): boolean {
  return options.totalHeight - options.scrollTop - options.viewportHeight < options.lowerThreshold;
}

export function extractWaterfallScrollTop(event: {
  detail?: { scrollTop?: number };
  scrollTop?: number;
}): number {
  return event.detail?.scrollTop ?? event.scrollTop ?? 0;
}

export function resolveWaterfallClass(customClass?: string | object | Array<string | object>) {
  return ['lk-waterfall', customClass];
}

export function resolveWaterfallContainerStyle(options: {
  heightPx: number;
  customStyle?: string | Record<string, unknown>;
}): StyleValue {
  return [
    { height: resolveWaterfallUnit(options.heightPx) },
    (options.customStyle || '') as StyleValue,
  ] as StyleValue;
}

export function resolveWaterfallContentStyle(totalHeight: number): CSSProperties {
  return {
    position: 'relative',
    minHeight: resolveWaterfallUnit(totalHeight),
  };
}

export function resolveWaterfallColumnStyle(columnWidth: number): CSSProperties {
  return {
    width: resolveWaterfallUnit(columnWidth),
  };
}

export function resolveWaterfallCardStyle(options: {
  top: number;
  left?: number;
  width: number;
  height: number;
  cardRadius: number;
}): CSSProperties {
  return {
    position: 'absolute',
    top: resolveWaterfallUnit(options.top),
    left: resolveWaterfallUnit(options.left ?? 0),
    width: resolveWaterfallUnit(options.width),
    height: resolveWaterfallUnit(options.height),
    borderRadius: resolveWaterfallUnit(options.cardRadius),
  };
}

export function resolveWaterfallSkeletonPadding(options: {
  paddingY: number;
  paddingX: number;
}): CSSProperties {
  return {
    padding: `${resolveWaterfallUnit(options.paddingY)} ${resolveWaterfallUnit(options.paddingX)}`,
  };
}

export function resolveWaterfallFooterStyle(options: {
  totalHeight: number;
  paddingY: number;
}): CSSProperties {
  return {
    position: 'absolute',
    top: resolveWaterfallUnit(options.totalHeight - options.paddingY),
    left: 0,
    right: 0,
  };
}
