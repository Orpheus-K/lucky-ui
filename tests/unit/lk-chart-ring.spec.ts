import { describe, expect, it } from 'vitest';
import { LiteChartEffect } from '../../src/uni_modules/lucky-ui/core/src/chart';
import {
  getChartRingCapSweep,
  getChartRingEffectStrength,
  getChartRingOverlapAngle,
  getChartRingTotal,
  normalizeChartRingSegments,
  resolveChartRingCenterSubtitle,
  resolveChartRingCenterTitle,
  resolveChartRingClass,
  resolveChartRingGeometry,
  resolveChartRingHeightStyle,
  resolveChartRingRootStyle,
  resolveChartRingSegmentColor,
} from '../../src/uni_modules/lucky-ui/components/lk-chart-ring/chart-ring.utils';
import { chartRingProps } from '../../src/uni_modules/lucky-ui/components/lk-chart-ring/chart-ring.props';

describe('lk-chart-ring segment and geometry rules', () => {
  it('exposes configurable motion defaults', () => {
    expect(chartRingProps.animationDuration.default).toBe(700);
    expect(chartRingProps.animationRepeat.default).toBe(1);
  });

  it('normalizes single and multi segment data', () => {
    expect(normalizeChartRingSegments({
      segments: [],
      value: 120,
      max: 100,
      title: '',
    })).toEqual([{ label: 'Progress', value: 100 }]);

    expect(normalizeChartRingSegments({
      segments: [
        { label: 'A', value: 10 },
        { label: 'B', value: 0 },
        { label: 'C', value: 20, color: '#123456' },
      ],
      value: 0,
      max: 100,
      title: '',
    })).toEqual([
      { label: 'A', value: 10 },
      { label: 'C', value: 20, color: '#123456' },
    ]);

    expect(normalizeChartRingSegments({
      segments: [
        { label: 'A', value: 0 },
        { label: 'B', value: Number.NaN },
      ],
      value: 0,
      max: 100,
      title: '',
    })).toEqual([{ label: 'Total', value: 0 }]);

    expect(normalizeChartRingSegments({
      segments: [],
      value: Number.NaN,
      max: Number.NaN,
      title: 'Progress',
    })).toEqual([{ label: 'Progress', value: 0 }]);
  });

  it('resolves center text, root style and geometry', () => {
    const segments = [
      { label: 'A', value: 10 },
      { label: 'C', value: 20, color: '#123456' },
    ];

    expect(resolveChartRingCenterTitle({
      title: '',
      segments,
      normalizedSegments: segments,
      value: 0,
      max: 100,
    })).toBe('30');
    expect(resolveChartRingCenterSubtitle({ subtitle: '', segments })).toBe('Total');
    expect(resolveChartRingHeightStyle('240')).toBe('240rpx');
    expect(resolveChartRingRootStyle({
      heightStyle: '240rpx',
      customStyle: { opacity: 0.9 },
    })).toEqual([{ height: '240rpx' }, { opacity: 0.9 }]);
    expect(resolveChartRingClass('ring-card')).toEqual(['lk-chart-ring', 'ring-card']);
    expect(resolveChartRingGeometry({
      width: 240,
      height: 200,
      padding: 20,
      strokeWidth: 24,
    })).toEqual({ cx: 120, cy: 100, radius: 68 });
  });

  it('resolves totals, caps and colors', () => {
    const segments = [
      { label: 'A', value: 10 },
      { label: 'C', value: 20, color: '#123456' },
    ];

    expect(getChartRingTotal({ hasSegments: true, segments, max: 100 })).toBe(30);
    expect(getChartRingTotal({ hasSegments: true, segments: [{ value: 0 }], max: 100 })).toBe(1);
    expect(getChartRingTotal({ hasSegments: false, segments: [], max: Number.NaN })).toBe(1);
    expect(getChartRingEffectStrength(LiteChartEffect.Subtle)).toBe(0.65);
    expect(getChartRingOverlapAngle({
      segmentCount: 2,
      strokeWidth: 24,
      radius: 68,
    })).toBeCloseTo(Math.PI / 8);
    expect(getChartRingCapSweep({
      overlapAngle: 0.3,
      sweep: 0.2,
      fullSweep: 1,
    })).toBe(0.2);

    const palette = {
      brand300: '#0',
      brand400: '#1',
      brand600: '#2',
      brand700: '#3',
    };
    expect(resolveChartRingSegmentColor({ value: 1 }, 2, palette)).toBe('#3');
    expect(resolveChartRingSegmentColor({ value: 1, color: '#abc' }, 2, palette)).toBe('#abc');
  });
});
