import type { StyleValue } from 'vue';
import { addUnit } from '../../core/src/utils/unit';

/** 缺失节点、单个超宽包装节点或宽于视口的子项保留原生滚动。 */
export function resolveHorizontalScrollTargets(
  viewport: { width: number } | null,
  container: { width: number } | null,
  items: { left: number; width: number }[] | null
): number[] {
  if (
    !viewport ||
    !container ||
    !items ||
    items.length < 2 ||
    !Number.isFinite(viewport.width) ||
    !Number.isFinite(container.width) ||
    viewport.width <= 0
  )
    return [];
  if (
    items.some(
      item =>
        !Number.isFinite(item.left) ||
        !Number.isFinite(item.width) ||
        item.width <= 0 ||
        item.width > viewport.width
    )
  )
    return [];
  const max = Math.max(0, container.width - viewport.width);
  if (max === 0) return [];
  // 减去首项位置以保留 padding；末尾多个可见子项可能共享同一个停靠点。
  return [...new Set(items.map(item => Math.max(0, Math.min(max, item.left - items[0].left))))];
}

export function resolveHorizontalScrollIndex(index: number, deltaX: number, count: number): number {
  const step = Math.abs(deltaX) < 24 ? 0 : deltaX < 0 ? 1 : -1;
  return Math.max(0, Math.min(Math.max(0, count - 1), index + step));
}

export function resolveHorizontalScrollClass(customClass: unknown) {
  return ['lk-horizontal-scroll', customClass];
}

export function shouldShowHorizontalScrollbar(hideScrollbar: boolean): boolean {
  return !hideScrollbar;
}

export function resolveHorizontalScrollRootStyle(customStyle: StyleValue): StyleValue {
  return customStyle;
}

export function resolveHorizontalScrollContainerStyle(options: {
  gap: string | number;
  padding: string | number;
}) {
  const padding = addUnit(options.padding);
  return {
    '--lk-hs-gap': addUnit(options.gap),
    paddingLeft: padding,
    paddingRight: padding,
  };
}
