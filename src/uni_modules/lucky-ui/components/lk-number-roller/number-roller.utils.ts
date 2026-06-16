import type { StyleValue } from 'vue';
import type { NumberRollerFormatter } from './number-roller.props';

export const NUMBER_ROLLER_DIGITS_POOL = Object.freeze(Array.from({ length: 10 }, (_, i) => i));

export interface NumberRollerDigitSegment {
  key: string;
  type: 'digit';
  digit: number;
}

export interface NumberRollerSymbolSegment {
  key: string;
  type: 'symbol';
  symbol: string;
}

export type NumberRollerSegment = NumberRollerDigitSegment | NumberRollerSymbolSegment;
export type NumberRollerAnimatedDigits = Record<string, number>;

export function resolveNumberRollerClass(customClass: unknown) {
  return ['lk-number-roller', customClass];
}

export function resolveNumberRollerStyle(options: {
  autoplay: boolean;
  speed: number;
  easing: string;
  digitHeight: number;
}) {
  return {
    '--lk-number-roller-speed': options.autoplay ? `${Math.max(options.speed, 16)}ms` : '0ms',
    '--lk-number-roller-easing': options.easing,
    '--lk-number-roller-digit-height': `${options.digitHeight}rpx`,
  };
}

export function resolveNumberRollerRootStyle(
  rollerStyle: StyleValue,
  customStyle: StyleValue
): StyleValue {
  return [rollerStyle, customStyle];
}

export function resolveNumberRollerTrackStyle(digit: number) {
  return {
    transform: `translate3d(0, calc(${digit} * -1 * var(--lk-number-roller-digit-height)), 0)`,
  };
}

export function normalizeNumberRollerValue(
  value: number | string,
  options: {
    formatter?: NumberRollerFormatter | null;
    decimals: number | null;
    grouping: boolean;
    groupSeparator: string;
    decimalSeparator: string;
  }
): string {
  const formatted = options.formatter?.(value);
  if (formatted !== undefined && formatted !== null) {
    const custom = String(formatted).trim();
    return custom || '0';
  }

  if (typeof value === 'number') {
    return formatNumberRollerNumeric(value, String(value), options);
  }

  const raw = String(value ?? '').trim();
  if (!raw) return '0';

  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    return formatNumberRollerNumeric(Number(raw), raw, options);
  }

  return raw;
}

export function formatNumberRollerNumeric(
  num: number,
  raw: string,
  options: {
    decimals: number | null;
    grouping: boolean;
    groupSeparator: string;
    decimalSeparator: string;
  }
): string {
  const decimals =
    typeof options.decimals === 'number' && options.decimals >= 0
      ? options.decimals
      : extractNumberRollerDecimalLength(raw);
  const normalized = decimals !== null ? num.toFixed(decimals) : raw;
  return injectNumberRollerSeparators(normalized, options);
}

export function extractNumberRollerDecimalLength(text: string): number | null {
  if (!text.includes('.')) return null;
  const decimal = text.split('.')[1];
  return decimal && decimal.length > 0 ? decimal.length : null;
}

export function injectNumberRollerSeparators(
  input: string,
  options: {
    grouping: boolean;
    groupSeparator: string;
    decimalSeparator: string;
  }
): string {
  const [intRaw, decimalRaw = ''] = input.split('.');
  const sign = intRaw.startsWith('-') ? '-' : '';
  const absoluteInt = sign ? intRaw.slice(1) : intRaw;
  const groupedInt = options.grouping
    ? absoluteInt.replace(/\B(?=(\d{3})+(?!\d))/g, options.groupSeparator)
    : absoluteInt;
  const decimalPart = decimalRaw ? `${options.decimalSeparator}${decimalRaw}` : '';
  const result = `${sign}${groupedInt}${decimalPart}`;
  return result || '0';
}

export function buildNumberRollerSegments(value: string): NumberRollerSegment[] {
  const source = value || '0';
  return source.split('').map((char, index) => {
    if (/^\d$/.test(char)) {
      return { key: `digit-${index}`, type: 'digit', digit: Number(char) };
    }
    return { key: `symbol-${index}-${char}`, type: 'symbol', symbol: char };
  });
}

export function resolveNumberRollerRenderSegments(options: {
  autoplay: boolean;
  segments: NumberRollerSegment[];
  animatedDigitByKey: NumberRollerAnimatedDigits;
}): NumberRollerSegment[] {
  if (!options.autoplay) return options.segments;
  return options.segments.map(seg => {
    if (seg.type !== 'digit') return seg;
    const current = options.animatedDigitByKey[seg.key];
    return {
      ...seg,
      digit: typeof current === 'number' ? current : seg.digit,
    };
  });
}

export function primeNumberRollerDigits(
  segments: NumberRollerSegment[],
  current: NumberRollerAnimatedDigits
) {
  const next: NumberRollerAnimatedDigits = { ...current };
  let changed = false;
  for (const seg of segments) {
    if (seg.type !== 'digit') continue;
    if (!(seg.key in next)) {
      next[seg.key] = 0;
      changed = true;
    }
  }
  return { next, changed };
}

export function resolveNumberRollerTargetDigits(
  segments: NumberRollerSegment[],
  current: NumberRollerAnimatedDigits
): NumberRollerAnimatedDigits {
  const updated: NumberRollerAnimatedDigits = { ...current };
  for (const seg of segments) {
    if (seg.type !== 'digit') continue;
    updated[seg.key] = seg.digit;
  }
  return updated;
}
