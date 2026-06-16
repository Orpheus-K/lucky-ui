import { describe, expect, it } from 'vitest';
import {
  normalizeWatermarkContent,
  resolveWatermarkCellCount,
  resolveWatermarkClass,
  resolveWatermarkItemStyle,
  resolveWatermarkItems,
  resolveWatermarkLayerStyle,
  resolveWatermarkParams,
  resolveWatermarkRootStyle,
} from '../../src/uni_modules/lucky-ui/components/lk-watermark/watermark.utils';

describe('lk-watermark layout and style rules', () => {
  it('normalizes content and removes empty lines', () => {
    expect(normalizeWatermarkContent('Lucky UI')).toEqual(['Lucky UI']);
    expect(normalizeWatermarkContent(['Lucky UI', '', 'Internal'])).toEqual([
      'Lucky UI',
      'Internal',
    ]);
  });

  it('resolves size presets and explicit overrides', () => {
    expect(resolveWatermarkParams('sm', {})).toEqual({
      width: 170,
      height: 112,
      fontSize: 20,
      gapX: 40,
      gapY: 34,
    });

    expect(resolveWatermarkParams('lg', {
      width: '320rpx',
      fontSize: 28,
      gapX: '48px',
    })).toEqual({
      width: '320rpx',
      height: 224,
      fontSize: 28,
      gapX: '48px',
      gapY: 64,
    });
  });

  it('clamps rows and columns for generated watermark cells', () => {
    expect(resolveWatermarkCellCount(4, 2)).toBe(8);
    expect(resolveWatermarkCellCount(0, -1)).toBe(1);
    expect(resolveWatermarkItems(2, 3)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('builds root class and forwards custom style', () => {
    expect(resolveWatermarkClass({
      variant: 'outline',
      size: 'lg',
      customClass: 'report-mark',
      fullPage: true,
    })).toEqual([
      'lk-watermark',
      'lk-watermark--outline',
      'is-size-lg',
      'report-mark',
      { 'is-full-page': true },
    ]);

    const customStyle = { minHeight: '320rpx' };
    expect(resolveWatermarkRootStyle(customStyle)).toBe(customStyle);
  });

  it('builds layer style with safe column count', () => {
    const params = resolveWatermarkParams('md', {});

    expect(resolveWatermarkLayerStyle({
      zIndex: 8,
      color: '',
      opacity: 0.15,
      columns: 0,
      params,
    })).toEqual({
      zIndex: 8,
      color: undefined,
      opacity: 0.15,
      gap: '48rpx 60rpx',
      gridTemplateColumns: 'repeat(1, 260rpx)',
    });
  });

  it('builds item transform and typography style', () => {
    expect(resolveWatermarkItemStyle({
      params: resolveWatermarkParams('md', { width: '300px', fontSize: 28 }),
      rotate: -18,
      skewX: -8,
      skewY: 4,
      fontWeight: 700,
    })).toEqual({
      width: '300px',
      height: '168rpx',
      transform: 'rotate(-18deg) skew(-8deg, 4deg)',
      fontSize: '28rpx',
      fontWeight: 700,
    });
  });
});
