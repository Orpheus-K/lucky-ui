import type { StyleValue } from 'vue';
import type { BarChartItem } from './chart-bar.props';
import type { buildBrandPalette } from '../../utils/chart-colors';

export interface ChartBarTooltipState {
  visible: boolean;
  x: number;
  y: number;
  width: number;
  arrowX: number;
  text: string;
}

export interface ChartBarLayout {
  xLabelHeight: number;
  yLabelWidth: number;
  innerWidth: number;
  innerHeight: number;
  yAxisLeft: number;
  plotLeft: number;
  plotTop: number;
  plotBottom: number;
  step: number;
  barWidth: number;
}

export interface ChartBarValueRange {
  min: number;
  max: number;
  span: number;
}

export const CHART_BAR_EMPTY_TOOLTIP: ChartBarTooltipState = {
  visible: false,
  x: 0,
  y: 0,
  width: 0,
  arrowX: 0,
  text: '',
};

export function resolveChartBarHeightStyle(height: string | number): string {
  if (typeof height === 'number') return `${height}rpx`;
  if (/^\d+$/.test(height)) return `${height}rpx`;
  return String(height);
}

export function resolveChartBarRootStyle(options: {
  heightStyle: string;
  customStyle: StyleValue;
}): StyleValue {
  return [{ height: options.heightStyle }, options.customStyle];
}

export function resolveChartBarTooltipStyle(state: ChartBarTooltipState): StyleValue {
  return {
    left: `${state.x}px`,
    top: `${state.y}px`,
    width: `${state.width}px`,
    '--lk-chart-tooltip-arrow-x': `${state.arrowX}px`,
  };
}

export function resolveChartBarYAxisLabelWidth(options: {
  showAxis: boolean;
  minValue: number;
  maxValue: number;
  ticks: number;
  measureTextWidth?: (text: string) => number;
}): number {
  if (!options.showAxis) return 0;

  const ticks = Math.max(2, options.ticks);
  let maxTextWidth = 0;

  for (let t = 0; t <= ticks; t += 1) {
    const value = options.minValue + ((options.maxValue - options.minValue) * t) / ticks;
    const label = formatChartBarAxisValue(value, options.maxValue - options.minValue);
    const width = options.measureTextWidth?.(label) ?? label.length * 6;
    maxTextWidth = Math.max(maxTextWidth, width);
  }

  return Math.min(48, Math.max(24, Math.ceil(maxTextWidth + 8)));
}

export function clampChartBarIndex(index: number, length: number): number {
  if (length <= 0) return -1;
  return Math.max(0, Math.min(length - 1, index));
}

export function getChartBarEffectiveIndex(options: {
  tooltip: boolean;
  hoverIndex: number;
  autoTooltip: boolean;
  tooltipAlways: boolean;
  defaultIndex: number;
  length: number;
}): number {
  if (!options.tooltip) return -1;
  const hasHover = options.hoverIndex >= 0 && options.hoverIndex < options.length;
  if (hasHover) return options.hoverIndex;
  if (options.autoTooltip || options.tooltipAlways) {
    return clampChartBarIndex(options.defaultIndex, options.length);
  }
  return -1;
}

export function resolveChartBarInitialHoverIndex(options: {
  autoTooltip: boolean;
  tooltipAlways: boolean;
  defaultIndex: number;
  length: number;
}): number {
  return options.tooltipAlways || options.autoTooltip
    ? clampChartBarIndex(options.defaultIndex, options.length)
    : -1;
}

export function getChartBarNextAutoTooltipIndex(options: {
  hoverIndex: number;
  length: number;
}): number {
  if (options.length <= 0) return -1;
  return (clampChartBarIndex(options.hoverIndex, options.length) + 1) % options.length;
}

export function normalizeChartBarValues(data: BarChartItem[]): number[] {
  return data.map(item => (Number.isFinite(item.value) ? item.value : 0));
}

export function getChartBarMaxValue(values: number[]): number {
  return Math.max(1, ...values);
}

export function resolveChartBarValueRange(values: number[], autoScale = true): ChartBarValueRange {
  const finiteValues = values.filter(Number.isFinite);
  if (!finiteValues.length) return { min: 0, max: 1, span: 1 };

  if (!autoScale) {
    const max = Math.max(1, ...finiteValues.map(value => Math.max(0, value)));
    return { min: 0, max, span: max };
  }

  const rawMin = Math.min(...finiteValues);
  const rawMax = Math.max(...finiteValues);

  if (rawMin === rawMax) {
    if (rawMin === 0) return { min: 0, max: 1, span: 1 };
    const padding = Math.max(1, Math.abs(rawMin) * 0.1);
    const min = rawMin - padding;
    const max = rawMax + padding;
    return { min, max, span: Math.max(1e-6, max - min) };
  }

  const rawSpan = rawMax - rawMin;
  const padding = rawSpan * 0.08;
  let min = rawMin - padding;
  let max = rawMax + padding;

  if (rawMin >= 0 && min < 0) min = 0;
  if (rawMax <= 0 && max > 0) max = 0;

  return {
    min,
    max,
    span: Math.max(1e-6, max - min),
  };
}

export function getChartBarValueRatio(value: number, range: ChartBarValueRange): number {
  return Math.max(0, Math.min(1, (value - range.min) / range.span));
}

export function formatChartBarAxisValue(value: number, span: number): string {
  const absSpan = Math.abs(span);
  const digits = absSpan < 1 ? 2 : absSpan < 10 ? 1 : 0;
  return Number(value.toFixed(digits)).toString();
}

export function resolveChartBarLayout(options: {
  width: number;
  height: number;
  padding: number;
  showXAxisLabel: boolean;
  showAxis: boolean;
  length: number;
  maxBarWidth: number;
  yAxisLabelWidth?: number;
}): ChartBarLayout {
  const xLabelHeight = options.showXAxisLabel ? 18 : 0;
  const yLabelWidth = options.showAxis ? (options.yAxisLabelWidth ?? 36) : 0;
  const axisEdgeInset = options.showAxis ? Math.min(options.padding, 6) : options.padding;
  const yAxisLeft = yLabelWidth + axisEdgeInset;
  const plotTop = axisEdgeInset;
  const plotBottom = Math.max(
    plotTop,
    options.height - (options.showXAxisLabel ? xLabelHeight : axisEdgeInset)
  );
  const innerWidth = Math.max(0, options.width - yAxisLeft - axisEdgeInset);
  const innerHeight = Math.max(0, plotBottom - plotTop);
  const step = options.length > 0 ? innerWidth / options.length : 0;
  const autoBarWidth = step * 0.62;
  const maxBarWidth = options.maxBarWidth > 0 ? options.maxBarWidth : autoBarWidth;
  const barWidth = Math.max(2, Math.min(autoBarWidth, maxBarWidth));

  return {
    xLabelHeight,
    yLabelWidth,
    innerWidth,
    innerHeight,
    yAxisLeft,
    plotLeft: yAxisLeft,
    plotTop,
    plotBottom,
    step,
    barWidth,
  };
}

export function getChartBarHoverIndexFromPoint(options: {
  x: number;
  plotLeft: number;
  step: number;
  length: number;
}): number {
  if (options.length <= 0 || options.step <= 0) return -1;
  return clampChartBarIndex(
    Math.floor((options.x - options.plotLeft) / options.step),
    options.length
  );
}

export function getChartBarXAxisLabelInterval(length: number): number {
  return Math.max(1, Math.ceil(length / 6));
}

export function resolveChartBarItemColor(
  item: BarChartItem,
  index: number,
  palette: ReturnType<typeof buildBrandPalette>
): string {
  if (item.color) return item.color;
  const candidates = [
    palette.brand600,
    palette.brand500,
    palette.brand700,
    palette.brand400,
    palette.brand800,
  ];
  return candidates[index % candidates.length];
}

export function resolveChartBarTooltipText(item: BarChartItem, value: number): string {
  const label = item.label ? String(item.label) : '';
  return label ? `${label}: ${value}` : String(value);
}

export function resolveChartBarTooltipState(options: {
  x: number;
  y: number;
  text: string;
  textWidth: number;
  chartWidth: number;
  px: (value: number) => number;
}): ChartBarTooltipState {
  const gap = options.px(12);
  const minWidth = options.px(48);
  const maxWidth = Math.max(minWidth, Math.min(options.px(320), options.chartWidth - gap * 2));
  const width = Math.min(maxWidth, Math.max(minWidth, options.textWidth + options.px(48)));
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

export function areChartBarTooltipStatesEqual(
  a: ChartBarTooltipState,
  b: ChartBarTooltipState
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
