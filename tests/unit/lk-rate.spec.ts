import { describe, expect, it } from 'vitest';
import {
  createRateStars,
  getRateStarStatus,
  normalizeRateSize,
  resolveRateSelection,
} from '../../src/uni_modules/lucky-ui/components/lk-rate/rate.utils';

describe('lk-rate interaction rules', () => {
  it('normalizes numeric sizes to rpx and preserves token sizes', () => {
    expect(normalizeRateSize(48)).toBe('48rpx');
    expect(normalizeRateSize('64')).toBe('64rpx');
    expect(normalizeRateSize('var(--lk-rpx-40)')).toBe('var(--lk-rpx-40)');
    expect(normalizeRateSize('2rem')).toBe('2rem');
  });

  it('creates stable 1-based star indexes and guards invalid counts', () => {
    expect(createRateStars(5)).toEqual([1, 2, 3, 4, 5]);
    expect(createRateStars(3.8)).toEqual([1, 2, 3]);
    expect(createRateStars(0)).toEqual([]);
    expect(createRateStars(-2)).toEqual([]);
  });

  it('marks stars full only when the current value reaches the index', () => {
    expect(getRateStarStatus(3, 1)).toBe('full');
    expect(getRateStarStatus(3, 3)).toBe('full');
    expect(getRateStarStatus(3, 4)).toBe('void');
  });

  it('selects a new value and reports old value for change emission', () => {
    expect(resolveRateSelection({ currentValue: 2, index: 4, allowClear: true }))
      .toEqual({
        value: 4,
        oldValue: 2,
        cleared: false,
        blocked: false,
        changed: true,
      });
  });

  it('clears the value when allowClear selects the current star again', () => {
    expect(resolveRateSelection({ currentValue: 4, index: 4, allowClear: true }))
      .toMatchObject({
        value: 0,
        oldValue: 4,
        cleared: true,
        changed: true,
      });
  });

  it('does not clear when allowClear is disabled', () => {
    expect(resolveRateSelection({ currentValue: 4, index: 4, allowClear: false }))
      .toMatchObject({
        value: 4,
        oldValue: 4,
        cleared: false,
        changed: false,
      });
  });

  it('blocks disabled and readonly interaction without changing value', () => {
    expect(resolveRateSelection({ currentValue: 2, index: 5, allowClear: true, disabled: true }))
      .toMatchObject({
        value: 2,
        blocked: true,
        changed: false,
      });

    expect(resolveRateSelection({ currentValue: 2, index: 5, allowClear: true, readonly: true }))
      .toMatchObject({
        value: 2,
        blocked: true,
        changed: false,
      });
  });
});
