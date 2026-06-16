import { describe, expect, it } from 'vitest';
import {
  clampVirtualListIndex,
  extractVirtualListScrollTop,
  resolveVirtualListClass,
  resolveVirtualListItemPx,
  resolveVirtualListMetrics,
  resolveVirtualListOverscan,
  resolveVirtualListOverscanBoost,
  resolveVirtualListPx,
  resolveVirtualListRootStyle,
  resolveVirtualWindow,
  shouldEmitVirtualPrefetch,
  shouldEmitVirtualReachBottom,
  shouldResetVirtualPrefetch,
  shouldResetVirtualReachBottom,
} from '../../src/uni_modules/lucky-ui/components/lk-virtual-list/virtual-list.utils';

describe('lk-virtual-list window and scroll rules', () => {
  it('normalizes units and item height', () => {
    const upx2px = (value: number) => value / 2;

    expect(resolveVirtualListPx(120, 0)).toBe(120);
    expect(resolveVirtualListPx('80px', 0)).toBe(80);
    expect(resolveVirtualListPx('120rpx', 0, upx2px)).toBe(60);
    expect(resolveVirtualListPx('var(--lk-rpx-80)', 80)).toBe(80);
    expect(resolveVirtualListItemPx(0)).toBe(1);
  });

  it('calculates dynamic overscan and clamps window start near list end', () => {
    expect(resolveVirtualListOverscan({
      buffer: 6,
      dynamicOverscan: true,
      maxOverscanRows: 24,
      currentOverscanBoost: 30,
    })).toBe(30);
    expect(resolveVirtualListOverscanBoost({
      delta: 500,
      itemPx: 50,
      maxOverscanRows: 24,
      overscanBoostFactor: 0.7,
    })).toBe(7);

    expect(resolveVirtualWindow({
      itemCount: 100,
      itemPx: 50,
      containerHeightPx: 400,
      scrollTop: 99999,
      overscanCount: 6,
    })).toEqual({
      baseVisibleCount: 8,
      visibleCount: 20,
      start: 80,
      end: 100,
    });
  });

  it('calculates padding metrics for padding and transform strategies', () => {
    expect(resolveVirtualListMetrics({
      itemCount: 100,
      itemPx: 50,
      start: 10,
      end: 30,
      reserveRows: 2,
    })).toEqual({
      totalHeight: 5000,
      topPadding: 500,
      renderedHeight: 1000,
      bottomPadding: 3500,
      reservePadding: 100,
      bottomPaddingTotal: 3600,
      totalScrollable: 5100,
    });
  });

  it('guards reach-bottom and prefetch emission jitter', () => {
    expect(shouldEmitVirtualReachBottom({
      remain: 60,
      lowerThresholdPx: 80,
      emitted: false,
    })).toBe(true);
    expect(shouldEmitVirtualReachBottom({
      remain: 60,
      lowerThresholdPx: 80,
      emitted: true,
    })).toBe(false);
    expect(shouldResetVirtualReachBottom({
      remain: 200,
      lowerThresholdPx: 80,
    })).toBe(true);

    expect(shouldEmitVirtualPrefetch({
      remainingItems: 20,
      prefetchRows: 30,
      emitted: false,
    })).toBe(true);
    expect(shouldResetVirtualPrefetch({
      remainingItems: 80,
      prefetchRows: 30,
    })).toBe(true);
  });

  it('builds root class/style and extracts scrollTop from platform events', () => {
    expect(resolveVirtualListClass('feed-list')).toEqual(['lk-virtual-list', 'feed-list']);
    expect(resolveVirtualListRootStyle({
      heightPx: 400,
      customStyle: { background: '#fff' },
    })).toEqual([
      { height: '400px' },
      { background: '#fff' },
    ]);

    expect(extractVirtualListScrollTop({ detail: { scrollTop: 120 } })).toBe(120);
    expect(extractVirtualListScrollTop({ target: { scrollTop: 240 } })).toBe(240);
    expect(clampVirtualListIndex(120, 10)).toBe(9);
    expect(clampVirtualListIndex(-2, 10)).toBe(0);
    expect(clampVirtualListIndex(10, 0)).toBe(0);
  });
});
