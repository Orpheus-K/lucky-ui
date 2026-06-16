export type RateStarStatus = 'full' | 'void';

export interface ResolveRateSelectionOptions {
  currentValue: number;
  index: number;
  allowClear: boolean;
  disabled?: boolean;
  readonly?: boolean;
}

export interface RateSelectionResult {
  value: number;
  oldValue: number;
  cleared: boolean;
  blocked: boolean;
  changed: boolean;
}

export function normalizeRateSize(size: string | number): string {
  if (typeof size === 'number') return `${size}rpx`;
  if (/^\d+$/.test(size)) return `${size}rpx`;
  return size;
}

export function createRateStars(count: number): number[] {
  const normalizedCount = Math.max(0, Math.floor(count));
  return Array.from({ length: normalizedCount }, (_, index) => index + 1);
}

export function getRateStarStatus(value: number, index: number): RateStarStatus {
  return value >= index ? 'full' : 'void';
}

export function resolveRateSelection(options: ResolveRateSelectionOptions): RateSelectionResult {
  const oldValue = options.currentValue;
  if (options.disabled || options.readonly) {
    return {
      value: oldValue,
      oldValue,
      cleared: false,
      blocked: true,
      changed: false,
    };
  }

  const shouldClear = options.allowClear && oldValue === options.index;
  const value = shouldClear ? 0 : options.index;

  return {
    value,
    oldValue,
    cleared: shouldClear,
    blocked: false,
    changed: value !== oldValue,
  };
}
