import type { StyleValue } from 'vue';
import type { SegmentedOption, SegmentedValue } from './segmented.props';

export interface ResolveSegmentedSelectionOptions {
  option: SegmentedOption;
  activeValue: SegmentedValue;
}

export interface SegmentedSelectionResult {
  value: SegmentedValue;
  oldValue: SegmentedValue;
  disabled: boolean;
  reselected: boolean;
  changed: boolean;
}

export interface SegmentRect {
  left: number;
  width: number;
}

export interface ResolveSegmentedSliderOptions {
  wrap: Pick<SegmentRect, 'left'>;
  items: SegmentRect[];
  options: SegmentedOption[];
  activeValue: SegmentedValue;
  animated: boolean;
  duration: number;
  easing: string;
}

export interface ResolveSegmentedRootStyleOptions {
  radius: string;
  duration: number;
  easing: string;
  inset: string;
  gutter: string;
  height: string;
  customStyle: StyleValue;
}

export function resolveSegmentedSelection(
  options: ResolveSegmentedSelectionOptions
): SegmentedSelectionResult {
  const value = options.option.value;
  const oldValue = options.activeValue;
  const disabled = Boolean(options.option.disabled);
  const reselected = !disabled && value === oldValue;

  return {
    value,
    oldValue,
    disabled,
    reselected,
    changed: !disabled && !reselected,
  };
}

export function resolveSegmentedSliderStyle(
  options: ResolveSegmentedSliderOptions
): Record<string, string> {
  const activeIndex = options.options.findIndex(item => item.value === options.activeValue);
  const activeItem = options.items[activeIndex];

  if (activeIndex < 0 || !activeItem) {
    return { opacity: '0' };
  }

  const offset = activeItem.left - options.wrap.left;
  return {
    width: `${activeItem.width}px`,
    transform: `translateX(${offset}px)`,
    opacity: '1',
    transition: options.animated
      ? `width ${options.duration}ms ${options.easing}, transform ${options.duration}ms ${options.easing}, opacity 180ms ease`
      : 'none',
  };
}

export function resolveSegmentedRootStyle(options: ResolveSegmentedRootStyleOptions): StyleValue {
  const vars: Record<string, string> = {
    '--lk-seg-radius': options.radius || 'var(--lk-radius-full)',
    '--lk-seg-duration': `${options.duration}ms`,
    '--lk-seg-easing': options.easing,
    '--lk-seg-inset': options.inset,
    '--lk-seg-gutter': options.gutter,
  };

  if (options.height) {
    vars['--lk-seg-height'] = options.height;
  }

  return [vars, options.customStyle as StyleValue];
}
