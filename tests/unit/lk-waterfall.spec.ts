import { describe, expect, it } from 'vitest';
import {
  calculateWaterfallCardHeight,
  extractWaterfallScrollTop,
  placeWaterfallCards,
  resolveWaterfallCardStyle,
  resolveWaterfallClass,
  resolveWaterfallColumnWidth,
  resolveWaterfallContainerStyle,
  resolveWaterfallFooterStyle,
  resolveWaterfallPx,
  resolveWaterfallRightColumnLeft,
  resolveWaterfallSkeletonPadding,
  resolveWaterfallTotalHeight,
  resolveWaterfallUnit,
  shouldWaterfallLoadMore,
} from '../../src/uni_modules/lucky-ui/components/lk-waterfall/waterfall.utils';
import type { WaterfallItem } from '../../src/uni_modules/lucky-ui/components/lk-waterfall/waterfall.props';

describe('lk-waterfall layout and scroll rules', () => {
  it('normalizes units from px, rpx, vh and percent', () => {
    expect(resolveWaterfallPx(120, 0)).toBe(120);
    expect(resolveWaterfallPx('80px', 0)).toBe(80);
    expect(resolveWaterfallPx('120rpx', 0, { upx2px: value => value / 2 })).toBe(60);
    expect(resolveWaterfallPx('50vh', 0, { systemInfo: { windowHeight: 800 } })).toBe(400);
    expect(resolveWaterfallPx('50%', 0, {
      containerHeight: 600,
      systemInfo: { windowHeight: 800 },
    })).toBe(300);
    expect(resolveWaterfallPx('invalid', 16)).toBe(16);
    expect(resolveWaterfallUnit(12)).toBe('12px');
    expect(resolveWaterfallUnit('12rpx')).toBe('12rpx');
  });

  it('calculates columns and total height', () => {
    const columnWidth = resolveWaterfallColumnWidth({
      containerWidth: 375,
      paddingX: 16,
      gutter: 12,
    });

    expect(columnWidth).toBe(165.5);
    expect(resolveWaterfallRightColumnLeft({
      paddingX: 16,
      columnWidth,
      gutter: 12,
    })).toBe(193.5);
    expect(resolveWaterfallTotalHeight({
      leftHeight: 500,
      rightHeight: 420,
      paddingY: 16,
    })).toBe(516);
  });

  it('calculates card height by ratio, image size and fallback estimate', () => {
    expect(calculateWaterfallCardHeight({
      item: { id: 1, ratio: 1.2, extraHeight: 56 },
      columnWidth: 160,
      estimateHeight: 200,
      defaultExtraHeight: 60,
    })).toBe(248);

    expect(calculateWaterfallCardHeight({
      item: { id: 2, imageWidth: 400, imageHeight: 300 },
      columnWidth: 200,
      estimateHeight: 200,
      defaultExtraHeight: 60,
    })).toBe(210);

    expect(calculateWaterfallCardHeight({
      item: { id: 3 },
      columnWidth: 0,
      estimateHeight: 200,
      defaultExtraHeight: 60,
    })).toBe(200);
  });

  it('places cards into the currently shorter column', () => {
    const items: WaterfallItem[] = [
      { id: 'a', ratio: 1, extraHeight: 20, image: 'a.png' },
      { id: 'b', ratio: 0.5, extraHeight: 20 },
      { id: 'c', ratio: 1, extraHeight: 20 },
    ];

    const result = placeWaterfallCards({
      items,
      leftHeight: 10,
      rightHeight: 10,
      paddingX: 8,
      rightColumnLeft: 118,
      columnWidth: 100,
      rowGap: 12,
      estimateHeight: 200,
      defaultExtraHeight: 60,
    });

    expect(result.cards.map(card => ({
      id: card.id,
      column: card.column,
      top: card.top,
      left: card.left,
      height: card.height,
      loadingState: card.loadingState,
    }))).toEqual([
      { id: 'a', column: 0, top: 10, left: 8, height: 120, loadingState: 'loading' },
      { id: 'b', column: 1, top: 10, left: 118, height: 70, loadingState: 'loaded' },
      { id: 'c', column: 1, top: 92, left: 118, height: 120, loadingState: 'loaded' },
    ]);
    expect(result.leftHeight).toBe(142);
    expect(result.rightHeight).toBe(224);
    expect(result.processedIndex).toBe(3);
  });

  it('guards load-more and extracts scroll top from platform events', () => {
    expect(shouldWaterfallLoadMore({
      totalHeight: 1000,
      scrollTop: 650,
      viewportHeight: 300,
      lowerThreshold: 80,
    })).toBe(true);
    expect(shouldWaterfallLoadMore({
      totalHeight: 1000,
      scrollTop: 500,
      viewportHeight: 300,
      lowerThreshold: 80,
    })).toBe(false);
    expect(extractWaterfallScrollTop({ detail: { scrollTop: 120 } })).toBe(120);
    expect(extractWaterfallScrollTop({ scrollTop: 240 })).toBe(240);
  });

  it('builds root, card, skeleton and footer styles', () => {
    expect(resolveWaterfallClass('feed')).toEqual(['lk-waterfall', 'feed']);
    expect(resolveWaterfallContainerStyle({
      heightPx: 600,
      customStyle: { background: '#fff' },
    })).toEqual([
      { height: '600px' },
      { background: '#fff' },
    ]);
    expect(resolveWaterfallCardStyle({
      top: 10,
      left: 20,
      width: 160,
      height: 240,
      cardRadius: 12,
    })).toEqual({
      position: 'absolute',
      top: '10px',
      left: '20px',
      width: '160px',
      height: '240px',
      borderRadius: '12px',
    });
    expect(resolveWaterfallSkeletonPadding({
      paddingY: 12,
      paddingX: 16,
    })).toEqual({ padding: '12px 16px' });
    expect(resolveWaterfallFooterStyle({
      totalHeight: 800,
      paddingY: 16,
    })).toEqual({
      position: 'absolute',
      top: '784px',
      left: 0,
      right: 0,
    });
  });
});
