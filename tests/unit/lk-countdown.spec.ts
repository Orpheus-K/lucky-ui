import { describe, expect, it } from 'vitest';
import {
  formatCountdownTime,
  getCountdownInterval,
  getCountdownScheduleDelay,
  getCountdownTimeData,
  getCountdownVisibleRemaining,
  normalizeCountdownDisplayRemaining,
  normalizeCountdownDuration,
  normalizeCountdownTargetTime,
  padCountdownValue,
  parseCountdownSegments,
  resolveCountdownClass,
  resolveCountdownRootStyle,
  resolveCountdownUnitMap,
} from '../../src/uni_modules/lucky-ui/components/lk-countdown/countdown.utils';

describe('lk-countdown time and format rules', () => {
  it('normalizes target time and duration', () => {
    expect(normalizeCountdownTargetTime(100)).toBe(100000);
    expect(normalizeCountdownTargetTime(1700000000000)).toBe(1700000000000);
    expect(normalizeCountdownTargetTime('100')).toBe(100000);
    expect(normalizeCountdownTargetTime('')).toBe(0);

    expect(normalizeCountdownDuration({
      time: 3000,
      targetTime: '',
      now: 1000,
    })).toBe(3000);
    expect(normalizeCountdownDuration({
      time: 3000,
      targetTime: 5,
      now: 1000,
    })).toBe(4000);
  });

  it('splits time data by format day token presence', () => {
    const total = 25 * 60 * 60 * 1000 + 61 * 1000 + 123;

    expect(getCountdownTimeData(total, 'DD HH:mm:ss')).toMatchObject({
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 1,
      milliseconds: 123,
    });

    expect(getCountdownTimeData(total, 'HH:mm:ss')).toMatchObject({
      days: 1,
      hours: 25,
      minutes: 1,
      seconds: 1,
    });
  });

  it('normalizes visible and display remaining values', () => {
    expect(getCountdownVisibleRemaining({
      remaining: 1234,
      finished: true,
      showZero: false,
    })).toBe(0);

    expect(normalizeCountdownDisplayRemaining({
      total: 1201,
      millisecond: false,
    })).toBe(2000);

    expect(normalizeCountdownDisplayRemaining({
      total: 1201,
      millisecond: true,
    })).toBe(1201);
  });

  it('formats time tokens and trims zero day prefix', () => {
    const data = getCountdownTimeData(3661123, 'HH:mm:ss SSS');

    expect(padCountdownValue(5, 2, true)).toBe('05');
    expect(padCountdownValue(5, 2, false)).toBe('5');

    expect(formatCountdownTime({
      format: 'HH:mm:ss.SSS',
      data,
      padZero: true,
      trimZeroDay: false,
    })).toBe('01:01:01.123');

    expect(formatCountdownTime({
      format: 'DD天 HH:mm:ss',
      data,
      padZero: true,
      trimZeroDay: true,
    })).toBe('01:01:01');
  });

  it('resolves unit map and parses display segments', () => {
    const unitMap = resolveCountdownUnitMap({
      unitMap: { hour: '小时' },
      fallback: {
        day: '天',
        hour: '时',
        minute: '分',
        second: '秒',
        millisecond: '毫秒',
      },
    });

    expect(unitMap.hour).toBe('小时');
    expect(parseCountdownSegments('01小时:02分', unitMap)).toEqual([
      { key: 'value-0', kind: 'value', value: '0' },
      { key: 'value-1', kind: 'value', value: '1' },
      { key: 'unit-2', kind: 'unit', value: '小时' },
      { key: 'separator-4', kind: 'separator', value: ':' },
      { key: 'value-5', kind: 'value', value: '0' },
      { key: 'value-6', kind: 'value', value: '2' },
      { key: 'unit-7', kind: 'unit', value: '分' },
    ]);
  });

  it('builds classes, styles and timer delay', () => {
    expect(resolveCountdownClass({
      variant: 'block',
      size: 'md',
      type: 'primary',
      running: true,
      finished: false,
      millisecond: true,
      customClass: 'custom-countdown',
    })).toEqual([
      'lk-countdown',
      'lk-countdown--block',
      'lk-countdown--md',
      'lk-countdown--primary',
      {
        'is-running': true,
        'is-finished': false,
        'is-millisecond': true,
      },
      'custom-countdown',
    ]);

    const customStyle = { marginTop: '16rpx' };
    expect(resolveCountdownRootStyle(customStyle)).toBe(customStyle);
    expect(getCountdownInterval(true)).toBe(30);
    expect(getCountdownInterval(false)).toBe(1000);
    expect(getCountdownScheduleDelay({
      millisecond: false,
      interval: 1000,
      currentRemaining: 1500,
    })).toBe(500);
    expect(getCountdownScheduleDelay({
      millisecond: true,
      interval: 10,
      currentRemaining: 1500,
    })).toBe(16);
  });
});
