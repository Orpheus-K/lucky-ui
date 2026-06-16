import {
  VerifyCodeStatus,
  VerifyCodeType,
  type VerifyCodeStatus as VerifyCodeStatusValue,
  type VerifyCodeType as VerifyCodeTypeValue,
} from './verify-code.props';

export interface VerifyCodeValueOptions {
  value: unknown;
  type: VerifyCodeTypeValue;
  length: number;
}

export interface VerifyCodeInputEventLike {
  detail?: unknown;
  target?: EventTarget | null | { value?: unknown };
}

export interface VerifyCodeKeydownEventLike {
  key?: string;
  detail?: unknown;
}

function isValuePayload(payload: unknown): payload is { value?: unknown } {
  return typeof payload === 'object' && payload !== null && 'value' in payload;
}

function isKeyPayload(payload: unknown): payload is { key?: string } {
  return typeof payload === 'object' && payload !== null && 'key' in payload;
}

export function normalizeVerifyCodeValue(options: VerifyCodeValueOptions): string {
  let value = typeof options.value === 'string' ? options.value : String(options.value ?? '');

  if (options.type === VerifyCodeType.Number) {
    value = value.replace(/\D+/g, '');
  }

  return value.slice(0, Math.max(0, options.length));
}

export function getVerifyCodeInputRawValue(event: VerifyCodeInputEventLike): unknown {
  if (isValuePayload(event.detail)) {
    return event.detail.value ?? '';
  }

  if (isValuePayload(event.target)) {
    return event.target.value ?? '';
  }

  return '';
}

export function resolveVerifyCodeInputValue(options: {
  event: VerifyCodeInputEventLike;
  type: VerifyCodeTypeValue;
  length: number;
}): string {
  return normalizeVerifyCodeValue({
    value: getVerifyCodeInputRawValue(options.event),
    type: options.type,
    length: options.length,
  });
}

export function resolveVerifyCodeKeydownValue(options: {
  event: VerifyCodeKeydownEventLike;
  currentValue: string;
}): string | null {
  const detailKey = isKeyPayload(options.event.detail) ? options.event.detail.key : '';
  const key = options.event.key || detailKey;

  if (key !== 'Backspace' || options.currentValue.length === 0) {
    return null;
  }

  return options.currentValue.slice(0, -1);
}

export function shouldFinishVerifyCode(value: string, length: number): boolean {
  return length > 0 && value.length === length;
}

export function resolveVerifyCodeActiveIndex(value: string, length: number): number {
  return Math.min(value.length, Math.max(0, length - 1));
}

export function resolveVerifyCodeFocusIndex(value: string, length: number): number {
  return Math.min(value.length, Math.max(0, length));
}

export function resolveVerifyCodeCellStyle(options: { cellSize: number; fontSize: number }) {
  return {
    width: `${options.cellSize}rpx`,
    height: `${options.cellSize}rpx`,
    fontSize: `${options.fontSize}rpx`,
  };
}

export function resolveVerifyCodeContainerStyle(gap: number) {
  return {
    '--lk-verify-code-gap': `${gap || 0}rpx`,
  };
}

export function resolveVerifyCodeCountdownText(options: {
  isCountingDown: boolean;
  countdownRemaining: number;
  value: string;
  countdownText: string;
  sendText: string;
  resendText: string;
}) {
  if (options.isCountingDown) {
    return options.countdownText.replace('{s}', String(options.countdownRemaining));
  }

  return options.value.length === 0 ? options.sendText : options.resendText;
}

export function resolveVerifyCodeStatusClass(options: {
  status: VerifyCodeStatusValue;
  isFocused: boolean;
}) {
  if (options.status === VerifyCodeStatus.Error) return 'is-error';
  if (options.status === VerifyCodeStatus.Success) return 'is-success';
  if (options.isFocused) return 'is-focus';
  return '';
}

export function resolveVerifyCodeRootClass(options: {
  variant: string;
  statusClass: string;
  disabled: boolean;
  customClass?: unknown;
}) {
  return [
    `lk-verify-code--${options.variant}`,
    options.statusClass,
    { 'is-disabled': options.disabled },
    options.customClass,
  ];
}

export function resolveVerifyCodeCellClass(options: {
  index: number;
  isFocused: boolean;
  activeIndex: number;
  valueLength: number;
  length: number;
}) {
  return {
    'is-active':
      options.isFocused &&
      options.index === options.activeIndex &&
      options.valueLength < options.length,
    'is-filled': options.index < options.valueLength,
    'is-next': options.index === options.valueLength,
  };
}
