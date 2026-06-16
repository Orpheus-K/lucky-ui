import type { StyleValue } from 'vue';

export type CellTapAction = 'click' | 'click-disabled';

export function shouldTriggerCellRipple(options: {
  clickable: boolean;
  ripple: boolean;
  disabled: boolean;
}): boolean {
  return !options.disabled && options.clickable && options.ripple;
}

export function resolveCellTapAction(disabled: boolean): CellTapAction {
  return disabled ? 'click-disabled' : 'click';
}

export function resolveCellClass(options: {
  customClass?: unknown;
  clickable: boolean;
  ripple: boolean;
  disabled: boolean;
  center: boolean;
  rippleActive: boolean;
}) {
  return [
    options.customClass,
    {
      'lk-ripple': options.clickable && options.ripple,
      'is-clickable': options.clickable,
      'is-disabled': options.disabled,
      'is-center': options.center,
      'lk-ripple--active': options.rippleActive,
    },
  ];
}

export function resolveCellStyle(customStyle: StyleValue): StyleValue {
  return customStyle;
}

export function resolveCellGroupClass(options: {
  inset: boolean;
  card: boolean;
  border: boolean;
  customClass?: unknown;
}) {
  return [
    {
      'is-inset': options.inset,
      'is-card': options.card,
      'is-border': options.border,
    },
    options.customClass,
  ];
}
