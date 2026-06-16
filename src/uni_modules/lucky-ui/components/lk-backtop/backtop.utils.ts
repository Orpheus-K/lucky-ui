import type { StyleValue } from 'vue';
import { addUnit } from '@/uni_modules/lucky-ui/core/src/utils/unit';
import type { BacktopShape, BacktopSize } from './backtop.props';

export function resolveBacktopVisible(options: {
  scrollTop: number;
  visibilityHeight: number;
}): boolean {
  return options.scrollTop >= options.visibilityHeight;
}

export function resolveBacktopWrapperStyle(options: {
  right: string | number;
  bottom: string | number;
  zIndex: number;
}): Record<string, string> {
  return {
    right: addUnit(options.right) || 'var(--lk-rpx-32)',
    bottom: addUnit(options.bottom) || 'var(--lk-rpx-80)',
    zIndex: String(options.zIndex),
  };
}

export function resolveBacktopStyle(options: {
  wrapperStyle: StyleValue;
  customStyle: StyleValue;
}): StyleValue {
  return [options.wrapperStyle, options.customStyle];
}

export function resolveBacktopClass(options: {
  size: BacktopSize;
  shape: BacktopShape;
  visible: boolean;
  customClass: unknown;
}) {
  return [
    'lk-backtop',
    `lk-backtop--${options.size}`,
    `lk-backtop--shape-${options.shape}`,
    { 'is-visible': options.visible },
    options.customClass,
  ];
}

export function shouldBacktopScrollPage(usePageScroll: boolean): boolean {
  return usePageScroll;
}

export function createBacktopPayload(options: {
  usePageScroll: boolean;
  duration: number;
  easing: string;
  event?: unknown;
}) {
  return {
    usePageScroll: options.usePageScroll,
    duration: options.duration,
    easing: options.easing,
    event: options.event,
  };
}
