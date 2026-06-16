import { describe, expect, it } from 'vitest';
import { chartStatCardProps } from '../../src/uni_modules/lucky-ui/components/lk-chart-stat-card/chart-stat-card.props';
import {
  resolveChartStatCardClass,
  resolveChartStatCardRootStyle,
  resolveChartStatCardTrendIcon,
  resolveChartStatCardTrendLabel,
} from '../../src/uni_modules/lucky-ui/components/lk-chart-stat-card/chart-stat-card.utils';

describe('lk-chart-stat-card status and style rules', () => {
  it('exposes embedded sparkline configuration defaults', () => {
    expect(chartStatCardProps.chartLineWidth.default).toBe(5);
    expect(chartStatCardProps.chartAnimationDuration.default).toBe(560);
    expect(chartStatCardProps.chartAnimationRepeat.default).toBe(1);
    expect(chartStatCardProps.chartEffect.default).toBe('premium');
  });

  it('resolves classes and root style', () => {
    expect(resolveChartStatCardClass({
      trend: 'up',
      showChart: false,
      customClass: 'revenue-card',
    })).toEqual([
      'lk-chart-stat-card',
      'is-up',
      { 'is-chartless': true },
      'revenue-card',
    ]);

    expect(resolveChartStatCardRootStyle({
      customStyle: { marginTop: '8rpx' },
    })).toEqual({ marginTop: '8rpx' });
    expect(resolveChartStatCardRootStyle({
      customStyle: '',
    })).toBe('');
  });

  it('resolves trend label and icon', () => {
    expect(resolveChartStatCardTrendLabel({
      trendText: '',
      trend: 'down',
      t: key => `i18n:${key}`,
    })).toBe('i18n:trendDown');
    expect(resolveChartStatCardTrendLabel({
      trendText: '自定义',
      trend: 'flat',
      t: key => key,
    })).toBe('自定义');
    expect(resolveChartStatCardTrendIcon('up')).toBe('↗');
    expect(resolveChartStatCardTrendIcon('down')).toBe('↘');
    expect(resolveChartStatCardTrendIcon('flat')).toBe('→');
  });
});
