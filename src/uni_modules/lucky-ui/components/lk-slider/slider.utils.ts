import type { CSSProperties, StyleValue } from 'vue';
import type { SliderValue } from './slider.props';

export interface SliderTrackRect {
  left: number;
  width: number;
}

export type SliderPointerEvent = {
  changedTouches?: ArrayLike<{ clientX?: number }>;
  touches?: ArrayLike<{ clientX?: number }>;
  clientX?: number;
  detail?: number | { x?: number };
};

export function initSliderValue(options: {
  value: number | number[];
  range: boolean;
  min: number;
  max: number;
}): number[] {
  if (options.range) {
    if (Array.isArray(options.value)) {
      return [options.value[0] ?? options.min, options.value[1] ?? options.max];
    }
    return [options.min, Number(options.value)];
  }

  return [Array.isArray(options.value) ? options.value[0] : Number(options.value)];
}

export function getSliderPercent(options: { value: number; min: number; max: number }): number {
  const range = options.max - options.min;
  if (range <= 0) return 0;
  return Math.max(0, Math.min(100, ((options.value - options.min) / range) * 100));
}

export function resolveSliderStops(options: {
  showStops: boolean;
  step: number;
  min: number;
  max: number;
}): number[] {
  if (!options.showStops || options.step <= 0) return [];
  const range = options.max - options.min;
  const stepCount = Math.floor(range / options.step);
  const result: number[] = [];

  if (stepCount > 50) return [];

  for (let i = 1; i < stepCount; i++) {
    result.push(((i * options.step) / range) * 100);
  }

  return result;
}

export function resolveSliderBarStyle(options: {
  activeColor: string;
  dragging: boolean;
  range: boolean;
  values: number[];
  min: number;
  max: number;
}): CSSProperties {
  const style: CSSProperties = {};
  if (options.activeColor) style.backgroundColor = options.activeColor;
  if (options.dragging) style.transition = 'none';

  if (options.range) {
    const p1 = getSliderPercent({
      value: Math.min(options.values[0], options.values[1]),
      min: options.min,
      max: options.max,
    });
    const p2 = getSliderPercent({
      value: Math.max(options.values[0], options.values[1]),
      min: options.min,
      max: options.max,
    });
    style.left = `${p1}%`;
    style.width = `${p2 - p1}%`;
  } else {
    style.width = `${getSliderPercent({
      value: options.values[0],
      min: options.min,
      max: options.max,
    })}%`;
  }

  return style;
}

export function resolveSliderRootClass(options: {
  size: string;
  disabled: boolean;
  dragging: boolean;
  customClass: unknown;
}) {
  return [
    'lk-slider',
    `lk-slider--${options.size}`,
    { 'is-disabled': options.disabled, 'is-dragging': options.dragging },
    options.customClass,
  ];
}

export function resolveSliderRootStyle(options: {
  customStyle: StyleValue;
  activeColor: string;
  inactiveColor: string;
}): StyleValue {
  const vars: CSSProperties = {};
  if (options.activeColor) vars['--_active-bg'] = options.activeColor;
  if (options.inactiveColor) vars['--_inactive-bg'] = options.inactiveColor;

  if (!options.activeColor && !options.inactiveColor) return options.customStyle;
  return [vars, options.customStyle] as StyleValue;
}

export function resolveSliderTrackStyle(options: {
  barHeight: string;
  inactiveColor: string;
}): CSSProperties {
  const style: CSSProperties = {};
  if (options.barHeight) style.height = options.barHeight;
  if (options.inactiveColor) style.backgroundColor = options.inactiveColor;
  return style;
}

export function resolveSliderThumbStyle(options: {
  value: number;
  min: number;
  max: number;
  dragging: boolean;
  active: boolean;
}): CSSProperties {
  const style: CSSProperties = {
    left: `${getSliderPercent({ value: options.value, min: options.min, max: options.max })}%`,
  };
  if (options.dragging) style.transition = 'none';
  style.zIndex = options.active ? 2 : 1;
  return style;
}

export function resolveSliderBlockStyle(options: {
  blockSize: string;
  blockColor: string;
}): CSSProperties {
  const style: CSSProperties = {};
  if (options.blockSize) {
    style.width = options.blockSize;
    style.height = options.blockSize;
  }
  if (options.blockColor) style.backgroundColor = options.blockColor;
  return style;
}

export function getSliderPointX(event: Event | SliderPointerEvent): number {
  const payload = event as SliderPointerEvent;
  const detailX =
    typeof payload.detail === 'object' && payload.detail !== null ? payload.detail.x : undefined;

  return (
    payload.changedTouches?.[0]?.clientX ??
    payload.touches?.[0]?.clientX ??
    payload.clientX ??
    detailX ??
    0
  );
}

export function formatSliderStepValue(options: {
  percent: number;
  min: number;
  max: number;
  step: number;
}): number {
  const range = options.max - options.min;
  const rawValue = options.min + range * options.percent;
  const step = options.step > 0 ? options.step : 1;
  const steps = Math.round((rawValue - options.min) / step);
  let value = options.min + steps * step;
  value = parseFloat(value.toFixed(2));
  return Math.min(options.max, Math.max(options.min, value));
}

export function getSliderEmitValue(options: { range: boolean; values: number[] }): SliderValue {
  return options.range ? [...options.values].sort((a, b) => a - b) : options.values[0];
}

export function chooseSliderThumbIndex(options: {
  range: boolean;
  values: number[];
  value: number;
}): number {
  if (!options.range) return 0;
  const dist0 = Math.abs(options.values[0] - options.value);
  const dist1 = Math.abs(options.values[1] - options.value);
  return dist0 <= dist1 ? 0 : 1;
}

export type SliderUpdateResult = null | {
  values: number[];
  emitValue: SliderValue;
  draggingIndex: number;
  changed: boolean;
};

export function resolveSliderUpdate(options: {
  clientX: number;
  rect: SliderTrackRect;
  values: number[];
  draggingIndex: number;
  isClick: boolean;
  range: boolean;
  min: number;
  max: number;
  step: number;
}): SliderUpdateResult {
  if (options.rect.width <= 0) return null;

  const percent = Math.min(
    1,
    Math.max(0, (options.clientX - options.rect.left) / options.rect.width)
  );
  const newValue = formatSliderStepValue({
    percent,
    min: options.min,
    max: options.max,
    step: options.step,
  });

  let index = options.draggingIndex;
  if (options.isClick || index === -1) {
    index = chooseSliderThumbIndex({
      range: options.range,
      values: options.values,
      value: newValue,
    });
  }

  const nextValues = [...options.values];
  const changed = nextValues[index] !== newValue;
  if (changed) {
    nextValues[index] = newValue;
  }

  return {
    values: nextValues,
    emitValue: getSliderEmitValue({ range: options.range, values: nextValues }),
    draggingIndex: index,
    changed,
  };
}

export function formatSliderDisplayValue(
  value: number,
  formatter?: (value: number) => string | number
): string | number {
  return formatter ? formatter(value) : value;
}

export function shouldValidateSliderField(options: {
  validateEvent: boolean;
  prop: string;
}): boolean {
  return options.validateEvent && !!options.prop;
}
