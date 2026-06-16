import { describe, expect, it } from 'vitest';
import {
  paginateGridItems,
  resolveGridClickResult,
  resolveGridContainerClass,
  resolveGridGap,
  resolveGridInnerGapStyle,
  resolveGridItemClass,
  resolveGridItemKey,
  resolveGridItemStyle,
  resolveGridStyle,
} from '../../src/uni_modules/lucky-ui/components/lk-grid/grid.utils';
import type { GridItem } from '../../src/uni_modules/lucky-ui/components/lk-grid/grid.props';

describe('lk-grid layout and click rules', () => {
  it('uses default gap and computes compensated grid/item margins', () => {
    expect(resolveGridGap(undefined)).toBe(12);
    expect(resolveGridGap(20)).toBe(20);
    expect(resolveGridStyle({ columns: 4, gap: 20 })).toEqual({
      gridTemplateColumns: 'repeat(4, 1fr)',
      margin: '0 -10rpx -20rpx -10rpx',
    });
    expect(resolveGridItemStyle(20)).toEqual({
      margin: '0 10rpx 20rpx 10rpx',
    });
  });

  it('falls back to auto-fill columns and default inner gap', () => {
    expect(resolveGridStyle({ columns: undefined, gap: 12 }).gridTemplateColumns)
      .toBe('repeat(auto-fill, minmax(100px, 1fr))');
    expect(resolveGridInnerGapStyle(undefined)).toEqual({ marginTop: '8rpx' });
    expect(resolveGridInnerGapStyle(16)).toEqual({ marginTop: '16rpx' });
  });

  it('builds container class from clipping state', () => {
    expect(resolveGridContainerClass(true)).toEqual(['lk-grid-container', { 'is-clipped': true }]);
  });

  it('paginates items by columns multiplied by rows', () => {
    const items = [1, 2, 3, 4, 5, 6, 7];
    expect(paginateGridItems(items, 3, 2)).toEqual([[1, 2, 3, 4, 5, 6], [7]]);
    expect(paginateGridItems(items, 0, 0)).toEqual([[1], [2], [3], [4], [5], [6], [7]]);
  });

  it('generates stable item keys and active/disabled classes', () => {
    expect(resolveGridItemKey(2, 3)).toBe('2-3');
    expect(resolveGridItemClass({
      rippleActive: true,
      activeIndex: '2-3',
      pageIndex: 2,
      index: 3,
      disabled: true,
    })).toEqual({
      'lk-ripple--active': true,
      'is-disabled': true,
    });
  });

  it('routes enabled and disabled item click results', () => {
    const event = { type: 'tap' };
    const enabled: GridItem = { text: 'A' };
    const disabled: GridItem = { text: 'B', disabled: true };

    expect(resolveGridClickResult({ item: enabled, index: 1, pageIndex: 0, event }))
      .toEqual({
        activeIndex: '0-1',
        eventName: 'click',
        payload: { item: enabled, index: 1, pageIndex: 0, event },
      });

    expect(resolveGridClickResult({ item: disabled, index: 2, pageIndex: 1, event }))
      .toEqual({
        activeIndex: '1-2',
        eventName: 'click-disabled',
        payload: { item: disabled, index: 2, pageIndex: 1, event },
      });
  });
});
