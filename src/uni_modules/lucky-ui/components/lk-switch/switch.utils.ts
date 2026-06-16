import type { CSSProperties, StyleValue } from 'vue';
import type { SwitchValue } from './switch.props';

export function isSwitchChecked(options: {
  modelValue: SwitchValue;
  activeValue: SwitchValue;
}): boolean {
  return options.modelValue === options.activeValue;
}

export function resolveSwitchNextValue(options: {
  checked: boolean;
  activeValue: SwitchValue;
  inactiveValue: SwitchValue;
}): SwitchValue {
  return options.checked ? options.inactiveValue : options.activeValue;
}

export function canToggleSwitch(options: {
  disabled: boolean;
  loading: boolean;
  changing: boolean;
}): boolean {
  return !options.disabled && !options.loading && !options.changing;
}

export function resolveSwitchPromptText(options: {
  inlinePrompt: boolean;
  checked: boolean;
  activeText: string;
  inactiveText: string;
}): string {
  if (!options.inlinePrompt) return '';
  if (options.checked) return options.activeText || 'ON';
  return options.inactiveText || 'OFF';
}

export function resolveSwitchStyle(options: {
  activeColor?: string;
  inactiveColor?: string;
  customStyle: StyleValue;
}): StyleValue {
  const style: CSSProperties = {};

  if (options.activeColor) {
    style['--switch-active-color'] = options.activeColor;
  }

  if (options.inactiveColor) {
    style['--switch-inactive-color'] = options.inactiveColor;
  }

  return [style, options.customStyle] as StyleValue;
}

export function resolveSwitchClass(options: {
  customClass: unknown;
  size: string;
  checked: boolean;
  disabled: boolean;
  loading: boolean;
  changing: boolean;
  inlinePrompt: boolean;
}) {
  return [
    options.customClass,
    `lk-switch--${options.size}`,
    {
      'is-checked': options.checked,
      'is-disabled': options.disabled,
      'is-loading': options.loading || options.changing,
      'has-prompt': options.inlinePrompt,
    },
  ];
}

export function shouldValidateSwitchField(options: {
  validateEvent: boolean;
  prop: string;
}): boolean {
  return options.validateEvent && !!options.prop;
}
