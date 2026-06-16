import type { StyleValue } from 'vue';
import type { TabOption, TabValue } from './tab.props';

export interface ResolveTabSelectionOptions {
  option: TabOption;
  activeValue: TabValue;
}

export interface TabSelectionResult {
  value: TabValue;
  oldValue: TabValue;
  disabled: boolean;
  reselected: boolean;
  changed: boolean;
}

export interface TabRect {
  left: number;
  width: number;
}

export interface ResolveTabSliderOptions {
  wrap: Pick<TabRect, 'left'>;
  items: TabRect[];
  options: TabOption[];
  activeValue: TabValue;
  animated: boolean;
  duration: number;
  easing: string;
}

export interface ResolveTabRootStyleOptions {
  duration: number;
  easing: string;
  letterSpacing: string;
  underlineWidth: string;
  underlineHeight: string;
  customStyle: StyleValue;
}

export function resolveTabSelection(options: ResolveTabSelectionOptions): TabSelectionResult {
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

export function resolveTabSliderStyle(options: ResolveTabSliderOptions): Record<string, string> {
  const activeIndex = options.options.findIndex(item => item.value === options.activeValue);
  const activeItem = options.items[activeIndex];

  if (activeIndex < 0 || !activeItem) {
    return { opacity: '0' };
  }

  const offset = activeItem.left - options.wrap.left;
  return {
    width: `${activeItem.width}px`,
    transform: `translate3d(${offset}px, 0, 0)`,
    opacity: '1',
    transition: options.animated
      ? `width ${options.duration}ms ${options.easing}, transform ${options.duration}ms ${options.easing}, opacity 180ms ease`
      : 'none',
  };
}

export function resolveTabRootStyle(options: ResolveTabRootStyleOptions): StyleValue {
  const vars: Record<string, string> = {
    '--lk-tab-duration': `${options.duration}ms`,
    '--lk-tab-easing': options.easing,
    '--lk-tab-letter-spacing': options.letterSpacing,
    '--lk-tab-underline-width': options.underlineWidth === 'auto' ? '100%' : options.underlineWidth,
    '--lk-tab-underline-height': options.underlineHeight,
  };

  return [vars, options.customStyle as StyleValue];
}
