import { describe, expect, it } from 'vitest';
import {
  areChartLineTooltipStatesEqual,
  buildChartLineRenderPoints,
  CHART_LINE_EMPTY_TOOLTIP,
  clampChartLineIndex,
  formatChartLineAxisValue,
  getChartLineBezierSegments,
  getChartLineHoverIndexFromPoint,
  getChartLineXAxisLabelStride,
  isChartLineAutoAnimating,
  normalizeChartLineValues,
  resolveChartLineAutoTransition,
  resolveChartLineHeightStyle,
  resolveChartLineInitialHoverIndex,
  resolveChartLineInterpolatedTooltip,
  resolveChartLineLayout,
  resolveChartLineRootStyle,
  resolveChartLineTooltipState,
  resolveChartLineTooltipStyle,
  resolveChartLineTooltipText,
  resolveChartLineValueRange,
  resolveChartLineYAxisLabelWidth,
} from '../../src/uni_modules/lucky-ui/components/lk-chart-line/chart-line.utils';

describe('lk-chart-line geometry and tooltip rules', () => {
  it('normalizes height, root style and indexes', () => {
    expect(resolveChartLineHeightStyle(320)).toBe('320rpx');
    expect(resolveChartLineHeightStyle('240')).toBe('240rpx');
    expect(resolveChartLineHeightStyle('60vh')).toBe('60vh');

    const customStyle = { marginTop: '12rpx' };
    expect(resolveChartLineRootStyle({
      heightStyle: '320rpx',
      customStyle,
    })).toEqual([{ height: '320rpx' }, customStyle]);

    expect(clampChartLineIndex(-1, 3)).toBe(0);
    expect(clampChartLineIndex(9, 3)).toBe(2);
    expect(clampChartLineIndex(0, 0)).toBe(-1);
    expect(resolveChartLineInitialHoverIndex({
      autoTooltip: true,
      tooltipAlways: false,
      defaultIndex: 8,
      length: 3,
    })).toBe(2);
  });

  it('resolves value range, layout and render points', () => {
    const values = normalizeChartLineValues([
      { value: 10 },
      { value: Number.NaN },
      { value: 30 },
    ]);
    expect(values).toEqual([10, 0, 30]);
    const range = resolveChartLineValueRange([10, 20, 30]);
    expect(range.min).toBeCloseTo(8.4);
    expect(range.max).toBeCloseTo(31.6);
    expect(range.span).toBeCloseTo(23.2);
    expect(resolveChartLineValueRange([10, 20, 30], false)).toEqual({
      min: 10,
      max: 30,
      span: 20,
    });

    const layout = resolveChartLineLayout({
      width: 300,
      height: 200,
      padding: 24,
      showXAxisLabel: true,
      showAxis: true,
      length: 3,
    });
    expect(layout).toMatchObject({
      innerWidth: 240,
      innerHeight: 176,
      yAxisLeft: 42,
      axisRight: 294,
      plotLeft: 48,
      plotTop: 6,
      plotBottom: 182,
      step: 120,
    });

    expect(buildChartLineRenderPoints({
      data: [{ value: 10 }, { value: 20, label: 'M' }, { value: 30 }],
      layout,
      min: 10,
      span: 20,
      progress: 1,
    })).toEqual([
      { x: 48, y: 182, v: 10, label: undefined },
      { x: 168, y: 94, v: 20, label: 'M' },
      { x: 288, y: 6, v: 30, label: undefined },
    ]);
  });

  it('resolves compact y axis labels and adaptive range', () => {
    expect(resolveChartLineYAxisLabelWidth({
      showAxis: false,
      minValue: 0,
      maxValue: 42,
      ticks: 4,
    })).toBe(0);

    expect(resolveChartLineYAxisLabelWidth({
      showAxis: true,
      minValue: 900,
      maxValue: 940,
      ticks: 4,
      measureTextWidth: text => text.length * 6,
    })).toBe(26);

    const range = resolveChartLineValueRange([900, 930, 940], true);
    expect(range.min).toBeCloseTo(896.8);
    expect(range.max).toBeCloseTo(943.2);
    expect(range.span).toBeCloseTo(46.4);
    expect(formatChartLineAxisValue(0.256, 0.5)).toBe('0.26');
    expect(formatChartLineAxisValue(10.5, 42)).toBe('11');
  });

  it('builds bezier segments and hover indexes', () => {
    const points = [
      { x: 60, y: 158, v: 10 },
      { x: 168, y: 91, v: 20 },
      { x: 276, y: 24, v: 30 },
    ];

    expect(getChartLineBezierSegments(points)[0]).toEqual({
      cp1x: 78,
      cp1y: 146.83333333333334,
      cp2x: 132,
      cp2y: 113.33333333333333,
      x: 168,
      y: 91,
    });
    expect(getChartLineHoverIndexFromPoint({
      x: 230,
      plotLeft: 60,
      step: 108,
      length: 3,
    })).toBe(2);
    expect(getChartLineXAxisLabelStride(14)).toBe(3);
  });

  it('clamps bezier controls within segment y range', () => {
    const segments = getChartLineBezierSegments([
      { x: 0, y: 100, v: 1 },
      { x: 50, y: 0, v: 2 },
      { x: 100, y: 10, v: 3 },
      { x: 150, y: 100, v: 4 },
    ]);

    expect(segments[1].cp1y).toBeGreaterThanOrEqual(0);
    expect(segments[1].cp1y).toBeLessThanOrEqual(10);
    expect(segments[1].cp2y).toBeGreaterThanOrEqual(0);
    expect(segments[1].cp2y).toBeLessThanOrEqual(10);
  });

  it('resolves auto transition and tooltip content', () => {
    expect(isChartLineAutoAnimating({
      autoFrom: 0,
      autoTo: 1,
      autoT: 0.5,
    })).toBe(true);
    expect(resolveChartLineAutoTransition({
      hoverIndex: -1,
      defaultIndex: 1,
      nextIndex: 9,
      length: 3,
    })).toEqual({ from: 1, to: 2 });

    expect(resolveChartLineTooltipText({ label: 'Q1', value: 12 })).toBe('Q1: 12');
    expect(resolveChartLineInterpolatedTooltip({
      from: { x: 0, y: 100, v: 10 },
      to: { x: 100, y: 0, v: 20, label: 'Q2' },
      t: 0.25,
    })).toEqual({
      x: 25,
      y: 75,
      text: 'Q2: 12.5',
    });
  });

  it('builds bounded tooltip state and style', () => {
    const state = resolveChartLineTooltipState({
      x: 150,
      y: 80,
      text: 'Q1: 12',
      textWidth: 40,
      chartWidth: 200,
      px: value => value,
    });

    expect(state).toEqual({
      visible: true,
      x: 100,
      y: 80,
      width: 88,
      arrowX: 50,
      text: 'Q1: 12',
    });
    expect(resolveChartLineTooltipStyle(state)).toEqual({
      left: '100px',
      top: '80px',
      width: '88px',
      '--lk-chart-tooltip-arrow-x': '50px',
    });
    expect(areChartLineTooltipStatesEqual(state, { ...state })).toBe(true);
    expect(areChartLineTooltipStatesEqual(state, CHART_LINE_EMPTY_TOOLTIP)).toBe(false);
  });
});
