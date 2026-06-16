import type { StyleValue } from 'vue';
import { StatCardTrend } from './chart-stat-card.props';

export function resolveChartStatCardClass(options: {
  trend: string;
  showChart: boolean;
  customClass?: unknown;
}) {
  return [
    'lk-chart-stat-card',
    `is-${options.trend}`,
    {
      'is-chartless': !options.showChart,
    },
    options.customClass,
  ];
}

export function resolveChartStatCardRootStyle(options: { customStyle: StyleValue }): StyleValue {
  return options.customStyle;
}

export function resolveChartStatCardTrendLabel(options: {
  trendText: string;
  trend: string;
  t: (key: string) => string;
}): string {
  if (options.trendText) return options.trendText;
  if (options.trend === StatCardTrend.Up) return options.t('trendUp');
  if (options.trend === StatCardTrend.Down) return options.t('trendDown');
  return options.t('trendFlat');
}

export function resolveChartStatCardTrendIcon(trend: string): string {
  if (trend === StatCardTrend.Up) return '↗';
  if (trend === StatCardTrend.Down) return '↘';
  return '→';
}
