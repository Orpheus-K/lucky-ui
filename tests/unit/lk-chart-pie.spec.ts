import { describe, expect, it } from 'vitest';
import {
  areChartPieTooltipStatesEqual,
  CHART_PIE_EMPTY_TOOLTIP,
  clampChartPieIndex,
  getChartPieCapSweep,
  getChartPieEffectiveIndex,
  getChartPieIndexByAngle,
  getChartPieNextAutoTooltipIndex,
  getChartPieOverlapAngle,
  getChartPiePercent,
  getChartPieSliceSweep,
  getChartPieTotal,
  getValidChartPieSlices,
  isChartPiePointInside,
  normalizeChartPieAngle,
  resolveChartPieCenterText,
  resolveChartPieCanvasTextColor,
  resolveChartPieDonutBounds,
  resolveChartPieGeometry,
  resolveChartPieHeightStyle,
  resolveChartPieInitialHoverIndex,
  resolveChartPieRootStyle,
  resolveChartPieSliceColor,
  resolveChartPieTooltipState,
  resolveChartPieTooltipStyle,
  resolveChartPieTooltipText,
  shouldDrawChartPieSegmentEndCap,
} from '../../src/uni_modules/lucky-ui/components/lk-chart-pie/chart-pie.utils';

describe('lk-chart-pie slice and interaction rules', () => {
  it('normalizes height, root style and active indexes', () => {
    expect(resolveChartPieHeightStyle(320)).toBe('320rpx');
    expect(resolveChartPieHeightStyle('240')).toBe('240rpx');
    expect(resolveChartPieHeightStyle('48vh')).toBe('48vh');

    const customStyle = { marginTop: '16rpx' };
    expect(resolveChartPieRootStyle({
      heightStyle: '320rpx',
      customStyle,
    })).toEqual([{ height: '320rpx' }, customStyle]);

    expect(clampChartPieIndex(-1, 3)).toBe(0);
    expect(clampChartPieIndex(7, 3)).toBe(2);
    expect(clampChartPieIndex(0, 0)).toBe(-1);
    expect(getChartPieEffectiveIndex({
      tooltip: true,
      hoverIndex: -1,
      autoTooltip: false,
      tooltipAlways: true,
      defaultIndex: 8,
      length: 3,
    })).toBe(2);
    expect(resolveChartPieInitialHoverIndex({
      autoTooltip: false,
      tooltipAlways: false,
      defaultIndex: 1,
      length: 3,
    })).toBe(-1);
    expect(getChartPieNextAutoTooltipIndex({
      hoverIndex: -1,
      defaultIndex: 2,
      length: 3,
    })).toBe(0);
  });

  it('filters slices, resolves totals, sweeps and colors', () => {
    const slices = getValidChartPieSlices([
      { label: 'A', value: 10 },
      { label: 'B', value: 0 },
      { label: 'C', value: Number.NaN },
      { label: 'D', value: 30 },
    ]);
    expect(slices).toEqual([
      { label: 'A', value: 10 },
      { label: 'D', value: 30 },
    ]);
    expect(getChartPieTotal(slices)).toBe(40);
    expect(getChartPieSliceSweep({ value: 10, total: 40 })).toBeCloseTo(Math.PI / 2);

    const palette = {
      brand400: '#a',
      brand500: '#b',
      brand600: '#c',
      brand700: '#d',
      brand800: '#e',
      brand900: '#f',
    };
    expect(resolveChartPieSliceColor({ value: 1, color: '#123456' }, 0, palette)).toBe('#123456');
    expect(resolveChartPieSliceColor({ value: 1 }, 4, palette)).toBe('#e');
  });

  it('resolves geometry, donut bounds and hit testing', () => {
    expect(resolveChartPieGeometry({
      width: 300,
      height: 200,
      padding: 24,
    })).toEqual({
      width: 300,
      height: 200,
      cx: 150,
      cy: 100,
      radius: 76,
    });

    expect(resolveChartPieDonutBounds({
      radius: 76,
      donutWidth: 28,
    })).toEqual({
      thickness: 28,
      outerRadius: 76,
      innerRadius: 48,
      arcRadius: 62,
    });

    expect(isChartPiePointInside({
      distance: 50,
      donut: true,
      radius: 76,
      donutWidth: 28,
    })).toBe(true);
    expect(isChartPiePointInside({
      distance: 20,
      donut: true,
      radius: 76,
      donutWidth: 28,
    })).toBe(false);
  });

  it('maps pointer angle to slice index', () => {
    const slices = [
      { value: 10 },
      { value: 30 },
      { value: 60 },
    ];
    const total = getChartPieTotal(slices);

    expect(normalizeChartPieAngle(0, -1)).toBe(0);
    expect(getChartPieIndexByAngle({
      angle: Math.PI * 0.3,
      data: slices,
      total,
    })).toBe(1);
    expect(getChartPieIndexByAngle({
      angle: Math.PI * 1.8,
      data: slices,
      total,
    })).toBe(2);
  });

  it('builds center, tooltip and overlap values', () => {
    expect(getChartPiePercent({ value: 1, total: 4 })).toBe(25);
    expect(resolveChartPieTooltipText({
      slice: { label: 'A', value: 1 },
      total: 4,
    })).toBe('A: 25%');

    expect(resolveChartPieCenterText({
      showCenterText: true,
      centerTitle: 'Sales',
      activeSlice: null,
      total: 12.34,
    })).toEqual({ title: 'Sales', main: '12.34' });
    expect(resolveChartPieCenterText({
      showCenterText: true,
      centerTitle: 'Sales',
      activeSlice: { label: 'A', value: 3 },
      total: 12,
    })).toEqual({ title: 'A', main: '25%' });

    expect(resolveChartPieCanvasTextColor({
      color: 'var(--lk-text-primary)',
      fallback: '#0f172a',
    })).toBe('#0f172a');
    expect(resolveChartPieCanvasTextColor({
      color: '#64748b',
      fallback: '#0f172a',
    })).toBe('#64748b');

    const overlap = getChartPieOverlapAngle({
      segmentCount: 3,
      thickness: 28,
      radius: 76,
    });
    expect(overlap).toBeCloseTo(Math.PI / 8);
    expect(getChartPieCapSweep({
      overlapAngle: overlap,
      sweep: 0.2,
      fullSweep: 1,
    })).toBe(0.2);
    expect(shouldDrawChartPieSegmentEndCap({ index: 0, segmentCount: 2 })).toBe(true);
    expect(shouldDrawChartPieSegmentEndCap({ index: 1, segmentCount: 2 })).toBe(false);
    expect(shouldDrawChartPieSegmentEndCap({ index: 0, segmentCount: 1 })).toBe(false);
  });

  it('builds bounded tooltip state and style', () => {
    const state = resolveChartPieTooltipState({
      x: 150,
      y: 80,
      text: 'A: 25%',
      textWidth: 40,
      chartWidth: 200,
      px: value => value,
    });

    expect(state).toEqual({
      visible: true,
      x: 114,
      y: 80,
      width: 72,
      arrowX: 36,
      text: 'A: 25%',
    });
    expect(resolveChartPieTooltipStyle(state)).toEqual({
      left: '114px',
      top: '80px',
      width: '72px',
      '--lk-chart-tooltip-arrow-x': '36px',
    });
    expect(areChartPieTooltipStatesEqual(state, { ...state })).toBe(true);
    expect(areChartPieTooltipStatesEqual(state, CHART_PIE_EMPTY_TOOLTIP)).toBe(false);
  });
});
