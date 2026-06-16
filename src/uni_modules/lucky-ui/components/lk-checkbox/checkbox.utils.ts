import { addUnit } from '../../core/src/utils/unit';
import type { CheckboxValue } from './checkbox.props';

export interface CheckboxGroupLike {
  modelValue: CheckboxValue[];
  disabled: boolean;
  shape: string;
  iconType: string;
  size: string;
  activeColor: string;
}

export function resolveCheckboxValue(name: CheckboxValue, label: string): CheckboxValue {
  return name !== '' ? name : label;
}

export function isCheckboxChecked(options: {
  group?: CheckboxGroupLike | null;
  modelValue: CheckboxValue;
  checkboxValue: CheckboxValue;
}): boolean {
  return options.group
    ? options.group.modelValue.includes(options.checkboxValue)
    : !!options.modelValue;
}

export function isCheckboxDisabled(options: {
  disabled: boolean;
  group?: CheckboxGroupLike | null;
}): boolean {
  return options.disabled || !!options.group?.disabled;
}

export function resolveCheckboxShape(shape: string, group?: CheckboxGroupLike | null): string {
  return shape || group?.shape || 'square';
}

export function resolveCheckboxIconType(
  iconType: string,
  group?: CheckboxGroupLike | null
): string {
  return iconType || group?.iconType || 'check';
}

export function resolveCheckboxSize(group?: CheckboxGroupLike | null): string {
  return group?.size || 'md';
}

export function resolveCheckboxIconSize(options: {
  iconSize: string | number;
  size: string;
}): string | number {
  if (options.iconSize) return options.iconSize;
  if (options.size === 'sm') return 24;
  if (options.size === 'lg') return 36;
  return 30;
}

export function resolveCheckboxClass(options: {
  size: string;
  shape: string;
  iconType: string;
  checked: boolean;
  disabled: boolean;
  indeterminate: boolean;
  customClass: unknown;
}) {
  return [
    'lk-checkbox',
    `lk-checkbox--${options.size}`,
    `lk-checkbox--${options.shape}`,
    `lk-checkbox--icon-${options.iconType}`,
    {
      'lk-checkbox--checked': options.checked,
      'lk-checkbox--disabled': options.disabled,
      'lk-checkbox--indeterminate': options.indeterminate,
    },
    options.customClass,
  ];
}

export function resolveCheckboxIconStyle(options: {
  checked: boolean;
  indeterminate: boolean;
  activeColor: string;
  iconSize: string | number;
}): Record<string, string> {
  const nextStyle: Record<string, string> = {};

  if ((options.checked || options.indeterminate) && options.activeColor) {
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

export function resolveCheckboxGroupToggle(options: {
  currentValue: CheckboxValue[];
  name: CheckboxValue;
  max: number;
}): {
  value: CheckboxValue[];
  checked: boolean;
  overlimit: boolean;
} {
  const value = [...options.currentValue];
  const index = value.indexOf(options.name);

  if (index !== -1) {
    value.splice(index, 1);
    return { value, checked: false, overlimit: false };
  }

  if (options.max === 0 || value.length < options.max) {
    value.push(options.name);
    return { value, checked: true, overlimit: false };
  }

  return { value: options.currentValue, checked: false, overlimit: true };
}

export function resolveCheckboxGroupClass(options: { direction: string; customClass: unknown }) {
  return ['lk-checkbox-group', `lk-checkbox-group--${options.direction}`, options.customClass];
}
