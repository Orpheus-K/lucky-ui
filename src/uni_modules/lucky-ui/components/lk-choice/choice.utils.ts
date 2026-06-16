import type { CSSProperties, StyleValue } from 'vue';

export type ChoiceValue = string | number;

export interface ChoiceOption {
  label: string;
  value: ChoiceValue;
  icon?: string;
}

export function isChoiceSelected(options: {
  modelValue: ChoiceValue | ChoiceValue[] | null;
  value: ChoiceValue;
  multiple: boolean;
}): boolean {
  if (options.multiple) {
    return Array.isArray(options.modelValue) && options.modelValue.includes(options.value);
  }
  return options.modelValue === options.value;
}

export function resolveChoiceSelection(options: {
  modelValue: ChoiceValue | ChoiceValue[] | null;
  value: ChoiceValue;
  multiple: boolean;
  allowUnselect: boolean;
}): { changed: boolean; value: ChoiceValue | ChoiceValue[] | null } {
  const selected = isChoiceSelected({
    modelValue: options.modelValue,
    value: options.value,
    multiple: options.multiple,
  });

  if (selected) {
    if (!options.allowUnselect) {
      return { changed: false, value: options.modelValue };
    }

    if (options.multiple) {
      const currentValues = Array.isArray(options.modelValue) ? options.modelValue : [];
      return {
        changed: true,
        value: currentValues.filter(item => item !== options.value),
      };
    }

    return { changed: true, value: null };
  }

  if (options.multiple) {
    const currentValues = Array.isArray(options.modelValue) ? options.modelValue : [];
    return {
      changed: true,
      value: [...currentValues, options.value],
    };
  }

  return { changed: true, value: options.value };
}

export function resolveChoiceContainerStyle(options: {
  gap: number;
  wrap: boolean;
  customStyle: StyleValue;
}): CSSProperties {
  const gapToken = `${options.gap}rpx`;
  const style: CSSProperties = options.wrap
    ? {
        margin: `-${options.gap / 2}rpx`,
        '--lk-choice-gap': gapToken,
      }
    : {
        margin: 0,
        gap: gapToken,
        '--lk-choice-gap': gapToken,
      };
  const customStyle =
    typeof options.customStyle === 'object' &&
    options.customStyle !== null &&
    !Array.isArray(options.customStyle)
      ? (options.customStyle as CSSProperties)
      : {};

  return {
    ...style,
    ...customStyle,
  };
}

export function resolveChoiceRootClass(options: { wrap: boolean; customClass: unknown }) {
  return ['lk-choice', { 'lk-choice--nowrap': !options.wrap }, options.customClass];
}

export function resolveChoiceItemClass(options: { size: string; selected: boolean }) {
  return [
    'lk-choice__item',
    `lk-choice__item--${options.size}`,
    { 'is-selected': options.selected },
  ];
}
