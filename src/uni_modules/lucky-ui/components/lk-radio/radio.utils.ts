import { addUnit } from '../../core/src/utils/unit';
import type { RadioValue } from './radio.props';

export interface RadioGroupLike {
  modelValue: RadioValue;
  disabled: boolean;
  shape: string;
  iconType: string;
  size: string;
  activeColor: string;
}

export function resolveRadioValue(name: RadioValue, label: string): RadioValue {
  return name !== '' ? name : label;
}

export function isRadioChecked(options: {
  group?: RadioGroupLike | null;
  modelValue: RadioValue;
  radioValue: RadioValue;
}): boolean {
  return options.group
    ? options.group.modelValue === options.radioValue
    : options.modelValue === options.radioValue;
}

export function isRadioDisabled(options: {
  disabled: boolean;
  group?: RadioGroupLike | null;
}): boolean {
  return options.disabled || !!options.group?.disabled;
}

export function resolveRadioShape(shape: string, group?: RadioGroupLike | null): string {
  return shape || group?.shape || 'circle';
}

export function resolveRadioIconType(iconType: string, group?: RadioGroupLike | null): string {
  return iconType || group?.iconType || 'dot';
}

export function resolveRadioSize(group?: RadioGroupLike | null): string {
  return group?.size || 'md';
}

export function resolveRadioIconSize(options: {
  iconSize: string | number;
  size: string;
}): string | number {
  if (options.iconSize) return options.iconSize;
  if (options.size === 'sm') return 24;
  if (options.size === 'lg') return 36;
  return 30;
}

export function resolveRadioClass(options: {
  size: string;
  shape: string;
  iconType: string;
  checked: boolean;
  disabled: boolean;
  customClass: unknown;
}) {
  return [
    'lk-radio',
    `lk-radio--${options.size}`,
    `lk-radio--${options.shape}`,
    `lk-radio--icon-${options.iconType}`,
    {
      'lk-radio--checked': options.checked,
      'lk-radio--disabled': options.disabled,
    },
    options.customClass,
  ];
}

export function resolveRadioIconStyle(options: {
  checked: boolean;
  activeColor: string;
  iconSize: string | number;
}): Record<string, string> {
  const nextStyle: Record<string, string> = {};

  if (options.checked && options.activeColor) {
    nextStyle.borderColor = options.activeColor;
    nextStyle.backgroundColor = options.activeColor;
  }

  if (options.iconSize) {
    const size = addUnit(options.iconSize);
    if (size) {
      nextStyle.width = size;
      nextStyle.height = size;
    }
  }

  return nextStyle;
}

export function resolveRadioGroupClass(options: { direction: string; customClass: unknown }) {
  return ['lk-radio-group', `lk-radio-group--${options.direction}`, options.customClass];
}
