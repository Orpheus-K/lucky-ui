import { describe, expect, it } from 'vitest';
import { LiteChartEffect } from '../../src/uni_modules/lucky-ui/core/src/chart';
import {
  buildRadarLitePoints,
  getChartRadarLiteEffectStrength,
  getChartRadarLiteLevels,
  getRadarLiteAxisReveal,
  getRadarLiteBreath,
  getRadarLitePoint,
  getRadarLitePointDrop,
  normalizeRadarLiteData,
  resolveChartRadarLiteClass,
  resolveChartRadarLiteGeometry,
  resolveChartRadarLiteHeightStyle,
  resolveChartRadarLiteRootStyle,
  resolveRadarLiteMotion,
} from '../../src/uni_modules/lucky-ui/components/lk-chart-radar-lite/chart-radar-lite.utils';
import { chartRadarLiteProps } from '../../src/uni_modules/lucky-ui/components/lk-chart-radar-lite/chart-radar-lite.props';

describe('lk-chart-radar-lite geometry and data rules', () => {
  it('exposes configurable stroke and motion defaults', () => {
    expect(chartRadarLiteProps.lineWidth.default).toBe(2);
    expect(chartRadarLiteProps.animationDuration.default).toBe(680);
    expect(chartRadarLiteProps.animationRepeat.default).toBe(1);
  });

  it('builds root style and class', () => {
    expect(resolveChartRadarLiteHeightStyle(320)).toBe('320rpx');
    expect(resolveChartRadarLiteRootStyle({
      heightStyle: '320rpx',
      customStyle: { padding: '8rpx' },
    })).toEqual([{ height: '320rpx' }, { padding: '8rpx' }]);
    expect(resolveChartRadarLiteClass('wellness')).toEqual([
      'lk-chart-radar-lite',
      'wellness',
    ]);
  });

  it('normalizes radar data and geometry', () => {
    expect(normalizeRadarLiteData([
      { label: 'Sleep', value: 80 },
      { label: '', value: 20 },
      { label: 'Move', value: Number.NaN },
      { label: ' Mind ', value: 50, max: 0 },
      { label: 'Fallback', value: 30, max: Number.NaN },
    ], 100)).toEqual([
      { label: 'Sleep', value: 80, max: 100 },
      { label: 'Mind', value: 50, max: 1 },
      { label: 'Fallback', value: 30, max: 100 },
    ]);

    expect(resolveChartRadarLiteGeometry({
      width: 320,
      height: 240,
      padding: 42,
    })).toEqual({ cx: 160, cy: 120, radius: 78 });
    expect(resolveChartRadarLiteGeometry({
      width: 20,
      height: 10,
      padding: 42,
    })).toEqual({ cx: 10, cy: 5, radius: 1 });
    expect(getChartRadarLiteLevels(1.2)).toBe(2);
    expect(getChartRadarLiteLevels(Number.NaN)).toBe(4);
    expect(getChartRadarLiteEffectStrength(LiteChartEffect.None)).toBe(0);
    expect(getChartRadarLiteEffectStrength(LiteChartEffect.Premium))
      .toBeGreaterThan(getChartRadarLiteEffectStrength(LiteChartEffect.Subtle));
  });

  it('resolves points and polygon geometry', () => {
    expect(getRadarLitePoint({
      cx: 100,
      cy: 100,
      radius: 50,
      angle: 0,
      ratio: 0.5,
    })).toEqual({ x: 125, y: 100 });

    expect(buildRadarLitePoints({
      data: [
        { label: 'A', value: 50, max: 100 },
        { label: 'B', value: 100, max: 100 },
        { label: 'C', value: 150, max: 100 },
      ],
      cx: 100,
      cy: 100,
      radius: 60,
    })).toMatchObject([
      { label: 'A', ratio: 0.5, x: 100, y: 70 },
      { label: 'B', ratio: 1 },
      { label: 'C', ratio: 1 },
    ]);

    expect(buildRadarLitePoints({
      data: [
        { label: 'A', value: 25, max: 100 },
        { label: 'B', value: 75, max: 100 },
      ],
      cx: 100,
      cy: 100,
      radius: 80,
    })).toMatchObject([
      { label: 'A', ratio: 0.25, x: 100, y: 80 },
      { label: 'B', ratio: 0.75, x: 100, y: 160 },
    ]);
  });

  it('uses staged reveal motion instead of scan-loop motion', () => {
    expect(resolveRadarLiteMotion(0)).toEqual({
      gridProgress: 0,
      axisProgress: 0,
      polygonProgress: 0,
      pointProgress: 0,
      labelProgress: 0,
    });
    expect(resolveRadarLiteMotion(1)).toEqual({
      gridProgress: 1,
      axisProgress: 1,
      polygonProgress: 1,
      pointProgress: 1,
      labelProgress: 1,
    });

    const early = resolveRadarLiteMotion(0.2);
    expect(early.gridProgress).toBeGreaterThan(early.axisProgress);
    expect(early.axisProgress).toBeGreaterThan(early.polygonProgress);

    expect(getRadarLiteAxisReveal(0, 6, 0.38))
      .toBeGreaterThan(getRadarLiteAxisReveal(4, 6, 0.38));
    expect(getRadarLiteAxisReveal(5, 6, 1)).toBe(1);
    expect(getRadarLitePointDrop(0.2, 1)).toBe(0);
    expect(getRadarLitePointDrop(0.88, 1)).toBeGreaterThan(0);
    expect(getRadarLiteBreath(0.5, 0.72)).toBeCloseTo(0.72);
    expect(getRadarLiteBreath(0.5, 0)).toBe(0);
  });
});
