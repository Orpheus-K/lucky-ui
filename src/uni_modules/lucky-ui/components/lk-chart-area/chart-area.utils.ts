import type { StyleValue } from 'vue';
import { LiteChartEffect } from '../../core/src/chart';

export interface ChartAreaTooltipState {
  visible: boolean;
  x: number;
  y: number;
  width: number;
  arrowX: number;
  text: string;
}

export const CHART_AREA_EMPTY_TOOLTIP: ChartAreaTooltipState = {
  visible: false,
  x: 0,
  y: 0,
  width: 0,
  arrowX: 0,
  text: '',
};

export function resolveChartAreaHeightStyle(height: string | number): string {
  if (typeof height === 'number') return `${height}rpx`;
  if (/^\d+$/.test(String(height))) return `${height}rpx`;
  return String(height);
}

export function resolveChartAreaRootStyle(options: {
  heightStyle: string;
  customStyle: StyleValue;
}): StyleValue {
  return [{ height: options.heightStyle }, options.customStyle];
}

export function resolveChartAreaClass(options: { tooltip: boolean; customClass?: unknown }) {
  return [
    'lk-chart-area',
    {
      'is-interactive': options.tooltip,
    },
    options.customClass,
  ];
}

export function resolveChartAreaTooltipStyle(state: ChartAreaTooltipState): StyleValue {
  return {
    left: `${state.x}px`,
    top: `${state.y}px`,
    width: `${state.width}px`,
    '--lk-chart-tooltip-arrow-x': `${state.arrowX}px`,
  };
}

export function resolveChartAreaTooltipState(options: {
  x: number;
  y: number;
  text: string;
  textWidth: number;
  chartWidth: number;
  px: (value: number) => number;
}): ChartAreaTooltipState {
  const gap = options.px(12);
  const minWidth = options.px(48);
  const maxWidth = Math.max(minWidth, Math.min(options.px(320), options.chartWidth - gap * 2));
  const width = Math.min(maxWidth, Math.max(minWidth, options.textWidth + options.px(32)));
  const maxLeft = Math.max(gap, options.chartWidth - width - gap);
  const left = Math.max(gap, Math.min(options.x - width / 2, maxLeft));
  const arrowX = Math.max(options.px(12), Math.min(options.x - left, width - options.px(12)));

  return {
    visible: true,
    x: left,
    y: options.y,
    width,
    arrowX,
    text: options.text,
  };
}

export function areChartAreaTooltipStatesEqual(
  a: ChartAreaTooltipState,
  b: ChartAreaTooltipState
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

export function getChartAreaEffectStrength(effect: string): number {
  if (effect === LiteChartEffect.None) return 0;
  if (effect === LiteChartEffect.Subtle) return 0.65;
  return 1;
}
