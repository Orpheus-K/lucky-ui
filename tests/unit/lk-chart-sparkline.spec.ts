import { describe, expect, it } from 'vitest';
import {
  getLiteChartPositions,
  getNearestPointIndex,
  LiteChartEffect,
} from '../../src/uni_modules/lucky-ui/core/src/chart';
import {
  areChartSparklineTooltipStatesEqual,
  CHART_SPARKLINE_EMPTY_TOOLTIP,
  getChartSparklineEffectStrength,
  resolveChartSparklineActiveIndex,
  resolveChartSparklineClass,
  resolveChartSparklineHeightStyle,
  resolveChartSparklineRootStyle,
  resolveChartSparklineTooltipState,
  resolveChartSparklineTooltipStyle,
} from '../../src/uni_modules/lucky-ui/components/lk-chart-sparkline/chart-sparkline.utils';
import { chartSparklineProps } from '../../src/uni_modules/lucky-ui/components/lk-chart-sparkline/chart-sparkline.props';

describe('lk-chart-sparkline interaction and style rules', () => {
  it('exposes configurable motion defaults', () => {
    expect(chartSparklineProps.animationDuration.default).toBe(560);
    expect(chartSparklineProps.animationRepeat.default).toBe(1);
  });

  it('builds positions and nearest hover point', () => {
    const positions = getLiteChartPositions([
      { label: 'A', value: 10 },
      { label: 'B', value: 20 },
      { label: 'C', value: 30 },
    ], 180, 80, 10);

    expect(positions).toEqual([
      { label: 'A', value: 10, x: 10, y: 70 },
      { label: 'B', value: 20, x: 90, y: 40 },
      { label: 'C', value: 30, x: 170, y: 10 },
    ]);
    expect(getNearestPointIndex(positions, 120)).toBe(1);
  });

  it('builds height, root style and class', () => {
    expect(resolveChartSparklineHeightStyle(120)).toBe('120rpx');
    expect(resolveChartSparklineHeightStyle('96')).toBe('96rpx');
    expect(resolveChartSparklineHeightStyle('30vh')).toBe('30vh');
    expect(resolveChartSparklineRootStyle({
      heightStyle: '120rpx',
      customStyle: { opacity: 0.8 },
    })).toEqual([{ height: '120rpx' }, { opacity: 0.8 }]);
    expect(resolveChartSparklineClass({
      tooltip: false,
      customClass: 'mini-trend',
    })).toEqual([
      'lk-chart-sparkline',
      { 'is-interactive': false },
      'mini-trend',
    ]);
  });

  it('resolves effect strength and active point', () => {
    expect(getChartSparklineEffectStrength(LiteChartEffect.None)).toBe(0);
    expect(getChartSparklineEffectStrength(LiteChartEffect.Subtle)).toBe(0.65);
    expect(getChartSparklineEffectStrength(LiteChartEffect.Premium)).toBe(1);
    expect(resolveChartSparklineActiveIndex({
      hoverIndex: 1,
      pointCount: 3,
      showEndPoint: true,
    })).toBe(1);
    expect(resolveChartSparklineActiveIndex({
      hoverIndex: 8,
      pointCount: 3,
      showEndPoint: true,
    })).toBe(2);
    expect(resolveChartSparklineActiveIndex({
      hoverIndex: -1,
      pointCount: 3,
      showEndPoint: false,
    })).toBe(-1);
  });

  it('builds bounded tooltip state and style', () => {
    const state = resolveChartSparklineTooltipState({
      x: 20,
      y: 32,
      text: 'A 1.2k',
      textWidth: 42,
      chartWidth: 100,
      px: value => value,
    });

    expect(state).toEqual({
      visible: true,
      x: 10,
      y: 32,
      width: 70,
      arrowX: 10,
      text: 'A 1.2k',
    });
    expect(resolveChartSparklineTooltipStyle(state)).toEqual({
      left: '10px',
      top: '32px',
      width: '70px',
      '--lk-chart-tooltip-arrow-x': '10px',
    });
    expect(areChartSparklineTooltipStatesEqual(state, { ...state })).toBe(true);
    expect(areChartSparklineTooltipStatesEqual(state, CHART_SPARKLINE_EMPTY_TOOLTIP)).toBe(false);
  });
});
