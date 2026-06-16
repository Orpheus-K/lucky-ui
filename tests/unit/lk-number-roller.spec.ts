import { describe, expect, it } from 'vitest';
import {
  buildNumberRollerSegments,
  extractNumberRollerDecimalLength,
  formatNumberRollerNumeric,
  injectNumberRollerSeparators,
  normalizeNumberRollerValue,
  primeNumberRollerDigits,
  resolveNumberRollerClass,
  resolveNumberRollerRenderSegments,
  resolveNumberRollerRootStyle,
  resolveNumberRollerStyle,
  resolveNumberRollerTargetDigits,
  resolveNumberRollerTrackStyle,
} from '../../src/uni_modules/lucky-ui/components/lk-number-roller/number-roller.utils';

describe('lk-number-roller formatting and animation rules', () => {
  const formatOptions = {
    decimals: null,
    grouping: true,
    groupSeparator: ',',
    decimalSeparator: '.',
  };

  it('normalizes numeric, empty and custom formatted values', () => {
    expect(normalizeNumberRollerValue(12345.6, formatOptions)).toBe('12,345.6');
    expect(normalizeNumberRollerValue('001234.50', formatOptions)).toBe('1,234.50');
    expect(normalizeNumberRollerValue('', formatOptions)).toBe('0');
    expect(normalizeNumberRollerValue('N/A', formatOptions)).toBe('N/A');
    expect(normalizeNumberRollerValue(8, {
      ...formatOptions,
      formatter: value => ` ${value}% `,
    })).toBe('8%');
    expect(normalizeNumberRollerValue(8, {
      ...formatOptions,
      formatter: () => '',
    })).toBe('0');
  });

  it('formats decimal precision and custom separators', () => {
    expect(extractNumberRollerDecimalLength('12.340')).toBe(3);
    expect(extractNumberRollerDecimalLength('12')).toBeNull();

    expect(formatNumberRollerNumeric(1234.567, '1234.567', {
      decimals: 2,
      grouping: true,
      groupSeparator: ' ',
      decimalSeparator: ',',
    })).toBe('1 234,57');

    expect(injectNumberRollerSeparators('-1234567.89', {
      grouping: true,
      groupSeparator: ',',
      decimalSeparator: '.',
    })).toBe('-1,234,567.89');
  });

  it('builds digit and symbol segments with stable keys', () => {
    expect(buildNumberRollerSegments('-1,234.5')).toEqual([
      { key: 'symbol-0--', type: 'symbol', symbol: '-' },
      { key: 'digit-1', type: 'digit', digit: 1 },
      { key: 'symbol-2-,', type: 'symbol', symbol: ',' },
      { key: 'digit-3', type: 'digit', digit: 2 },
      { key: 'digit-4', type: 'digit', digit: 3 },
      { key: 'digit-5', type: 'digit', digit: 4 },
      { key: 'symbol-6-.', type: 'symbol', symbol: '.' },
      { key: 'digit-7', type: 'digit', digit: 5 },
    ]);
  });

  it('resolves animation digit priming and rendered segments', () => {
    const segments = buildNumberRollerSegments('42');
    const primed = primeNumberRollerDigits(segments, { 'digit-0': 4 });

    expect(primed).toEqual({
      next: { 'digit-0': 4, 'digit-1': 0 },
      changed: true,
    });

    expect(resolveNumberRollerRenderSegments({
      autoplay: true,
      segments,
      animatedDigitByKey: primed.next,
    })).toEqual([
      { key: 'digit-0', type: 'digit', digit: 4 },
      { key: 'digit-1', type: 'digit', digit: 0 },
    ]);

    expect(resolveNumberRollerTargetDigits(segments, primed.next)).toEqual({
      'digit-0': 4,
      'digit-1': 2,
    });

    expect(resolveNumberRollerRenderSegments({
      autoplay: false,
      segments,
      animatedDigitByKey: {},
    })).toBe(segments);
  });

  it('builds classes and styles', () => {
    expect(resolveNumberRollerClass('custom-roller')).toEqual([
      'lk-number-roller',
      'custom-roller',
    ]);

    expect(resolveNumberRollerStyle({
      autoplay: true,
      speed: 8,
      easing: 'linear',
      digitHeight: 64,
    })).toEqual({
      '--lk-number-roller-speed': '16ms',
      '--lk-number-roller-easing': 'linear',
      '--lk-number-roller-digit-height': '64rpx',
    });

    expect(resolveNumberRollerStyle({
      autoplay: false,
      speed: 800,
      easing: 'ease',
      digitHeight: 56,
    })['--lk-number-roller-speed']).toBe('0ms');

    expect(resolveNumberRollerTrackStyle(7)).toEqual({
      transform: 'translate3d(0, calc(7 * -1 * var(--lk-number-roller-digit-height)), 0)',
    });

    const rollerStyle = { color: 'red' };
    const customStyle = { marginTop: '8rpx' };
    expect(resolveNumberRollerRootStyle(rollerStyle, customStyle)).toEqual([
      rollerStyle,
      customStyle,
    ]);
  });
});
