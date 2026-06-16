import type { CSSProperties, StyleValue } from 'vue';
import type { SelectListOption, SelectValue } from './select-list.props';

export function resolveSelectListColumnCount(columns: number): number {
  return Math.min(Math.max(Math.floor(columns || 1), 1), 4);
}

export function resolveSelectListItemRadius(itemRadius: string | number): string {
  if (itemRadius === '' || itemRadius === null || itemRadius === undefined) return '';
  return typeof itemRadius === 'number' ? `${itemRadius}rpx` : String(itemRadius);
}

export function resolveSelectListStyle(options: {
  customStyle: StyleValue;
  columnCount: number;
  itemRadius: string;
  activeColor: string;
}): StyleValue {
  const style: StyleValue =
    typeof options.customStyle === 'object' && options.customStyle !== null
      ? ({ ...options.customStyle } as CSSProperties)
      : options.customStyle;

  const vars = {
    '--lk-select-list-columns': String(options.columnCount),
    ...(options.itemRadius ? { '--lk-select-list-item-radius': options.itemRadius } : {}),
    ...(options.activeColor
      ? {
          '--lk-select-list-selected-border': options.activeColor,
          '--lk-select-list-icon-color': options.activeColor,
          '--lk-select-list-selected-color': options.activeColor,
        }
      : {}),
  };

  if (!options.activeColor && options.columnCount <= 1 && !options.itemRadius) return style;

  if (typeof style === 'string') {
    const cssVars = Object.entries(vars)
      .map(([key, value]) => `${key}: ${value}`)
      .join(';');
    return [style, cssVars].filter(Boolean).join(';');
  }

  return typeof style === 'object' ? { ...style, ...vars } : vars;
}

export function readSelectListOption(option: SelectListOption, key: string): unknown {
  return option[key];
}

export function getSelectListValue(option: SelectListOption, valueKey: string): SelectValue {
  return readSelectListOption(option, valueKey) as SelectValue;
}

export function getSelectListText(option: SelectListOption, key: string): string {
  const value = readSelectListOption(option, key);
  return value == null ? '' : String(value);
}

export function isSelectListOptionDisabled(options: {
  option: SelectListOption;
  disabled: boolean;
  disabledKey: string;
}): boolean {
  return options.disabled || Boolean(readSelectListOption(options.option, options.disabledKey));
}

export function normalizeSelectListMultipleValue(
  modelValue: SelectValue | SelectValue[]
): SelectValue[] {
  return Array.isArray(modelValue) ? [...modelValue] : [];
}

export function isSelectListSelected(options: {
  option: SelectListOption;
  valueKey: string;
  modelValue: SelectValue | SelectValue[];
  multiple: boolean;
}): boolean {
  const value = getSelectListValue(options.option, options.valueKey);
  return options.multiple
    ? normalizeSelectListMultipleValue(options.modelValue).includes(value)
    : options.modelValue === value;
}

export function resolveSelectListOptionClass(options: { selected: boolean; disabled: boolean }) {
  return [
    'lk-select-list__item',
    {
      'is-selected': options.selected,
      'is-disabled': options.disabled,
    },
  ];
}

export function resolveSelectListClass(options: {
  size: string;
  inset: boolean;
  disabled: boolean;
  bordered: boolean;
  selectedBg: boolean;
  selectedBorder: boolean;
  columnCount: number;
  customClass: unknown;
}) {
  return [
    'lk-select-list',
    `lk-select-list--${options.size}`,
    {
      'is-inset': options.inset,
      'is-disabled': options.disabled,
      'is-borderless': !options.bordered,
      'is-selected-bg-disabled': !options.selectedBg,
      'is-selected-border-disabled': !options.selectedBorder,
      'is-grid': options.columnCount > 1,
    },
    options.customClass,
  ];
}

export type SelectListSelectionResult =
  | { type: 'disabled' | 'unchanged' | 'overlimit'; value?: undefined; selected?: undefined }
  | { type: 'select'; value: SelectValue | SelectValue[]; selected: boolean };

export function resolveSelectListSelection(options: {
  option: SelectListOption;
  valueKey: string;
  modelValue: SelectValue | SelectValue[];
  multiple: boolean;
  max: number;
  disabled: boolean;
}): SelectListSelectionResult {
  if (options.disabled) return { type: 'disabled' };

  const selected = isSelectListSelected({
    option: options.option,
    valueKey: options.valueKey,
    modelValue: options.modelValue,
    multiple: options.multiple,
  });
  const value = getSelectListValue(options.option, options.valueKey);

  if (!options.multiple) {
    return selected ? { type: 'unchanged' } : { type: 'select', value, selected: true };
  }

  const list = normalizeSelectListMultipleValue(options.modelValue);
  const index = list.indexOf(value);

  if (index !== -1) {
    list.splice(index, 1);
    return { type: 'select', value: list, selected: false };
  }

  if (options.max > 0 && list.length >= options.max) {
    return { type: 'overlimit' };
  }

  list.push(value);
  return { type: 'select', value: list, selected: true };
}
