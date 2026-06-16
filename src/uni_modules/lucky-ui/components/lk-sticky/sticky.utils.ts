import type { StyleValue } from 'vue';

export type StickyCustomStyle = string | Record<string, unknown>;

export function resolveStickyOffset(offsetTop: number | undefined | null): number {
  return Number.isFinite(offsetTop) ? Number(offsetTop) : 0;
}

export function resolveStickyBaseStyle(options: {
  offsetTop?: number;
  zIndex?: number;
}): Record<string, string | number> {
  return {
    position: 'sticky',
    top: `${resolveStickyOffset(options.offsetTop)}rpx`,
    zIndex: options.zIndex ?? 99,
  };
}

export function resolveStickyStyle(options: {
  offsetTop?: number;
  zIndex?: number;
  customStyle?: StickyCustomStyle;
}): StyleValue {
  return [resolveStickyBaseStyle(options), (options.customStyle || '') as StyleValue] as StyleValue;
}

export function resolveStickyClass(customClass?: string | object | Array<string | object>) {
  return ['lk-sticky', customClass];
}

export function resolveStickyRootMargin(offsetTop?: number): string {
  return `-${resolveStickyOffset(offsetTop)}px 0px 0px 0px`;
}

export function resolveStickyViewportOffset(offsetTop?: number): { top: number } {
  return { top: resolveStickyOffset(offsetTop) };
}

export function resolveStickyStateFromRatio(intersectionRatio?: number): boolean {
  return (intersectionRatio ?? 1) === 0;
}

export function shouldEmitStickyChange(currentSticky: boolean, nextSticky: boolean): boolean {
  return currentSticky !== nextSticky;
}
