import type { StyleValue } from 'vue';
import { LiteChartEffect } from '../../core/src/chart';

export interface ChartSparklineTooltipState {
  visible: boolean;
  x: number;
  y: number;
  width: number;
  arrowX: number;
  text: string;
}

export const CHART_SPARKLINE_EMPTY_TOOLTIP: ChartSparklineTooltipState = {
  visible: false,
  x: 0,
  y: 0,
  width: 0,
  arrowX: 0,
  text: '',
};

export function resolveChartSparklineHeightStyle(height: string | number): string {
  if (typeof height === 'number') return `${height}rpx`;
  if (/^\d+$/.test(String(height))) return `${height}rpx`;
  return String(height);
}

export function resolveChartSparklineRootStyle(options: {
  heightStyle: string;
  customStyle: StyleValue;
}): StyleValue {
  return [{ height: options.heightStyle }, options.customStyle];
}

export function resolveChartSparklineTooltipStyle(state: ChartSparklineTooltipState): StyleValue {
  return {
    left: `${state.x}px`,
    top: `${state.y}px`,
    width: `${state.width}px`,
    '--lk-chart-tooltip-arrow-x': `${state.arrowX}px`,
  };
}

export function resolveChartSparklineClass(options: { tooltip: boolean; customClass?: unknown }) {
  return [
    'lk-chart-sparkline',
    {
      'is-interactive': options.tooltip,
    },
    options.customClass,
  ];
}

export function getChartSparklineEffectStrength(effect: string): number {
  if (effect === LiteChartEffect.None) return 0;
  if (effect === LiteChartEffect.Subtle) return 0.65;
  return 1;
}

export function resolveChartSparklineActiveIndex(options: {
  hoverIndex: number;
  pointCount: number;
  showEndPoint: boolean;
}): number {
  if (options.hoverIndex >= 0 && options.hoverIndex < options.pointCount) {
    return options.hoverIndex;
  }
  return options.showEndPoint && options.pointCount > 0 ? options.pointCount - 1 : -1;
}

export function resolveChartSparklineTooltipState(options: {
  x: number;
  y: number;
  text: string;
  textWidth: number;
  chartWidth: number;
  px: (value: number) => number;
}): ChartSparklineTooltipState {
  const gap = options.px(10);
  const minWidth = options.px(48);
  const maxWidth = Math.max(minWidth, Math.min(options.px(320), options.chartWidth - gap * 2));
  const width = Math.min(maxWidth, Math.max(minWidth, options.textWidth + options.px(28)));
  const maxLeft = Math.max(gap, options.chartWidth - width - gap);
  const left = Math.max(gap, Math.min(options.x - width / 2, maxLeft));
  const arrowX = Math.max(options.px(10), Math.min(options.x - left, width - options.px(10)));

  return {
    visible: true,
    x: left,
    y: options.y,
    width,
    arrowX,
    text: options.text,
  };
}

export function areChartSparklineTooltipStatesEqual(
  a: ChartSparklineTooltipState,
  b: ChartSparklineTooltipState
): boolean {
  return (
    a.visible === b.visible &&
    a.x === b.x &&
    a.y === b.y &&
    a.width === b.width &&
    a.arrowX === b.arrowX &&
    a.text === b.text
  );
}
