import type { TextareaEventPayload } from './textarea.props';

export function readTextareaValue(event: TextareaEventPayload): string {
  if (typeof event === 'object' && event !== null && 'detail' in event) {
    const detail = event.detail as { value?: string } | undefined;
    if (detail?.value !== undefined) return detail.value;
  }

  if (typeof event === 'object' && event !== null && 'target' in event) {
    const target = event.target as { value?: string } | null | undefined;
    if (target?.value !== undefined) return target.value;
  }

  return '';
}

export function applyTextareaMaxlength(value: string, maxlength: number): string {
  if (maxlength === -1 || value.length <= maxlength) return value;
  return value.substring(0, maxlength);
}

export function resolveTextareaCount(value: string): number {
  return String(value || '').length;
}

export function resolveTextareaPlaceholder(placeholder: string, fallback: string): string {
  return placeholder || fallback;
}

export function isTextareaNativeFocused(options: { focus: boolean; autofocus: boolean }): boolean {
  return options.focus || options.autofocus;
}

export function shouldShowTextareaClear(options: {
  clearable: boolean;
  value: string;
  disabled: boolean;
  readonly: boolean;
}): boolean {
  return options.clearable && !!options.value && !options.disabled && !options.readonly;
}

export function shouldShowTextareaFooter(options: {
  showCount: boolean;
  maxlength: number;
  hasFooterSlot: boolean;
}): boolean {
  return (options.showCount && options.maxlength !== -1) || options.hasFooterSlot;
}

export function resolveTextareaClass(options: {
  variant: string;
  disabled: boolean;
  focused: boolean;
  autoHeight: boolean;
  label: string;
  customClass: unknown;
}) {
  return [
    'lk-textarea',
    `lk-textarea--${options.variant}`,
    {
      'is-disabled': options.disabled,
      'is-focused': options.focused,
      'is-auto-height': options.autoHeight,
      'has-label': !!options.label,
    },
    options.customClass,
  ];
}
