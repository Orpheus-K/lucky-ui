import type { InputEventPayload, InputType, InputValue } from './input.props';

export function readInputValue(event: InputEventPayload): InputValue {
  if (typeof event === 'object' && event !== null && 'detail' in event) {
    const detail = event.detail as { value?: InputValue } | undefined;
    if (detail?.value !== undefined) return detail.value;
  }

  if (typeof event === 'object' && event !== null && 'target' in event) {
    const target = event.target as { value?: InputValue } | null | undefined;
    if (target?.value !== undefined) return target.value;
  }

  return '';
}

export function applyInputMaxlength(value: InputValue, maxlength: number): InputValue {
  if (maxlength < 0) return value;
  const text = String(value);
  return text.length > maxlength ? text.slice(0, maxlength) : value;
}

export function hasInputValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

export function resolveInputNativeState(options: { type: InputType; passwordVisible: boolean }) {
  return {
    nativeType: options.type === 'password' ? 'text' : options.type,
    nativePassword: options.type === 'password' && !options.passwordVisible,
  };
}

export function resolveInputCount(options: {
  value: InputValue;
  maxlength: number;
  showCount: boolean;
  showWordLimit: boolean;
}): string {
  if (!options.showCount && !options.showWordLimit) return '';
  const length = String(options.value ?? '').length;
  return options.maxlength > -1 ? `${length}/${options.maxlength}` : `${length}`;
}

export function shouldShowPasswordToggle(options: {
  showPassword: boolean;
  type: InputType;
  disabled: boolean;
  readonly: boolean;
  fake: boolean;
}): boolean {
  return (
    options.showPassword &&
    options.type === 'password' &&
    !options.disabled &&
    !options.readonly &&
    !options.fake
  );
}

export function shouldShowSuffix(options: {
  hasSuffixSlot: boolean;
  suffixIcon: string;
  showPasswordToggle: boolean;
}): boolean {
  return (options.hasSuffixSlot || !!options.suffixIcon) && !options.showPasswordToggle;
}

export function shouldShowTrailingBalance(options: {
  inputAlign: string;
  prefixIcon: string;
  hasPrefixSlot: boolean;
  showPasswordToggle: boolean;
  showSuffix: boolean;
  value: InputValue;
  clearable: boolean;
  count: string;
}): boolean {
  return (
    options.inputAlign === 'center' &&
    !options.prefixIcon &&
    !options.hasPrefixSlot &&
    (options.showPasswordToggle ||
      options.showSuffix ||
      (hasInputValue(options.value) && options.clearable) ||
      !!options.count)
  );
}

export function resolveInputClass(options: {
  size: string;
  disabled: boolean;
  readonly: boolean;
  fake: boolean;
  value?: unknown;
  borderless: boolean;
  inputAlign: string;
  prefixIcon: string;
  trailingBalance: boolean;
  count: string;
  customClass: unknown;
}) {
  return [
    'lk-input',
    `lk-input--${options.size}`,
    {
      'is-disabled': options.disabled,
      'is-readonly': options.readonly,
      'is-fake': options.fake,
      'is-borderless': options.borderless,
      'has-value': hasInputValue(options.value),
      'is-center-align': options.inputAlign === 'center',
      'has-leading': !!options.prefixIcon,
      'has-trailing': options.trailingBalance,
      'has-count': !!options.count,
    },
    options.customClass,
  ];
}

export function resolveFakeInputText(fakeText: string, placeholder: string): string {
  return fakeText || placeholder || '';
}
