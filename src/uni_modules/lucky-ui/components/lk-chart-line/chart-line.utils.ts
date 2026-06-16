import type { StyleValue } from 'vue';
import type { LineChartPoint } from './chart-line.props';

export interface ChartLineTooltipState {
  visible: boolean;
  x: number;
  y: number;
  width: number;
  arrowX: number;
  text: string;
}

export interface ChartLineLayout {
  xLabelHeight: number;
  yLabelWidth: number;
  innerWidth: number;
  innerHeight: number;
  yAxisLeft: number;
  axisRight: number;
  plotLeft: number;
  plotTop: number;
  plotBottom: number;
  step: number;
}

export interface ChartLineValueRange {
  min: number;
  max: number;
  span: number;
}

export interface ChartLineRenderPoint {
  x: number;
  y: number;
  v: number;
  label?: string;
}

export interface ChartLineBezierSegment {
  cp1x: number;
  cp1y: number;
  cp2x: number;
  cp2y: number;
  x: number;
  y: number;
}

export const CHART_LINE_EMPTY_TOOLTIP: ChartLineTooltipState = {
  visible: false,
  x: 0,
  y: 0,
  width: 0,
  arrowX: 0,
  text: '',
};

export function resolveChartLineHeightStyle(height: string | number): string {
  if (typeof height === 'number') return `${height}rpx`;
  if (/^\d+$/.test(height)) return `${height}rpx`;
  return String(height);
}

export function resolveChartLineRootStyle(options: {
  heightStyle: string;
  customStyle: StyleValue;
}): StyleValue {
  return [{ height: options.heightStyle }, options.customStyle];
}

export function resolveChartLineTooltipStyle(state: ChartLineTooltipState): StyleValue {
  return {
    left: `${state.x}px`,
    top: `${state.y}px`,
    width: `${state.width}px`,
    '--lk-chart-tooltip-arrow-x': `${state.arrowX}px`,
  };
}

export function clampChartLineIndex(index: number, length: number): number {
  if (length <= 0) return -1;
  return Math.max(0, Math.min(length - 1, index));
}

export function isChartLineAutoAnimating(options: {
  autoFrom: number | null;
  autoTo: number | null;
  autoT: number;
}): boolean {
  return options.autoFrom != null && options.autoTo != null && options.autoT < 1;
}

export function resolveChartLineInitialHoverIndex(options: {
  autoTooltip: boolean;
  tooltipAlways: boolean;
  defaultIndex: number;
  length: number;
}): number {
  return options.tooltipAlways || options.autoTooltip
    ? clampChartLineIndex(options.defaultIndex, options.length)
    : -1;
}

export function resolveChartLineAutoTransition(options: {
  hoverIndex: number;
  defaultIndex: number;
  nextIndex: number;
  length: number;
}) {
  if (options.length <= 0) return null;
  return {
    from: clampChartLineIndex(
      options.hoverIndex < 0 ? options.defaultIndex : options.hoverIndex,
      options.length
    ),
    to: clampChartLineIndex(options.nextIndex, options.length),
  };
}

export function normalizeChartLineValues(data: LineChartPoint[]): number[] {
  return data.map(item => (Number.isFinite(item.value) ? item.value : 0));
}

export function resolveChartLineValueRange(
  values: number[],
  autoScale = true
): ChartLineValueRange {
  const finiteValues = values.filter(Number.isFinite);
  if (!finiteValues.length) return { min: 0, max: 1, span: 1 };

  const rawMin = Math.min(...finiteValues);
  const rawMax = Math.max(...finiteValues);

  if (!autoScale) {
    return {
      min: rawMin,
      max: rawMax,
      span: Math.max(1e-6, rawMax - rawMin),
    };
  }

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

export function formatChartLineAxisValue(value: number, span: number): string {
  const absSpan = Math.abs(span);
  const digits = absSpan < 1 ? 2 : absSpan < 10 ? 1 : 0;
  return Number(value.toFixed(digits)).toString();
}

export function resolveChartLineYAxisLabelWidth(options: {
  showAxis: boolean;
  minValue: number;
  maxValue: number;
  ticks: number;
  measureTextWidth?: (text: string) => number;
}): number {
  if (!options.showAxis) return 0;

  const ticks = Math.max(2, options.ticks);
  const span = options.maxValue - options.minValue;
  let maxTextWidth = 0;

  for (let t = 0; t <= ticks; t += 1) {
    const value = options.minValue + (span * t) / ticks;
    const label = formatChartLineAxisValue(value, span);
    const width = options.measureTextWidth?.(label) ?? label.length * 6;
    maxTextWidth = Math.max(maxTextWidth, width);
  }

  return Math.min(48, Math.max(24, Math.ceil(maxTextWidth + 8)));
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function resolveChartLineLayout(options: {
  width: number;
  height: number;
  padding: number;
  showXAxisLabel: boolean;
  showAxis: boolean;
  length: number;
  yAxisLabelWidth?: number;
}): ChartLineLayout {
  const xLabelHeight = options.showXAxisLabel ? 18 : 0;
  const yLabelWidth = options.showAxis ? (options.yAxisLabelWidth ?? 36) : 0;
  const axisEdgeInset = options.showAxis ? Math.min(options.padding, 6) : options.padding;
  const dataEdgeInset = options.showAxis ? Math.min(Math.max(axisEdgeInset, 6), 8) : 0;
  const yAxisLeft = options.showAxis ? yLabelWidth + axisEdgeInset : options.padding;
  const axisRight = Math.max(yAxisLeft, options.width - axisEdgeInset);
  const plotLeft = options.showAxis ? yAxisLeft + dataEdgeInset : options.padding;
  const plotRight = options.showAxis ? Math.max(plotLeft, axisRight - dataEdgeInset) : axisRight;
  const plotTop = options.showAxis ? axisEdgeInset : options.padding;
  const plotBottom = Math.max(
    plotTop,
    options.height - (options.showXAxisLabel ? xLabelHeight : axisEdgeInset)
  );
  const innerWidth = Math.max(0, plotRight - plotLeft);
  const innerHeight = Math.max(0, plotBottom - plotTop);

  return {
    xLabelHeight,
    yLabelWidth,
    innerWidth,
    innerHeight,
    yAxisLeft,
    axisRight,
    plotLeft,
    plotTop,
    plotBottom,
    step: innerWidth / Math.max(1, options.length - 1),
  };
}

export function buildChartLineRenderPoints(options: {
  data: LineChartPoint[];
  layout: ChartLineLayout;
  min: number;
  span: number;
  progress: number;
}): ChartLineRenderPoint[] {
  return options.data.map((item, index) => {
    const x = options.layout.plotLeft + options.layout.step * index;
    const valueRatio = (item.value - options.min) / options.span;
    const y =
      options.layout.plotTop +
      options.layout.innerHeight -
      valueRatio * options.layout.innerHeight * options.progress;
    return { x, y, v: item.value, label: item.label };
  });
}

export function getChartLineBezierSegments(
  points: ChartLineRenderPoint[]
): ChartLineBezierSegment[] {
  const result: ChartLineBezierSegment[] = [];
  const count = points.length;
  if (count < 2) return result;

  for (let index = 0; index < count - 1; index += 1) {
    const p0 = points[Math.max(0, index - 1)];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[Math.min(count - 1, index + 2)];

    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    const segmentMinY = Math.min(p1.y, p2.y);
    const segmentMaxY = Math.max(p1.y, p2.y);

    result.push({
      cp1x: p1.x + (p2.x - p0.x) / 6,
      cp1y: clampNumber(cp1y, segmentMinY, segmentMaxY),
      cp2x: p2.x - (p3.x - p1.x) / 6,
      cp2y: clampNumber(cp2y, segmentMinY, segmentMaxY),
      x: p2.x,
      y: p2.y,
    });
  }

  return result;
}

export function getChartLineHoverIndexFromPoint(options: {
  x: number;
  plotLeft: number;
  step: number;
  length: number;
}): number {
  if (options.length <= 0 || options.step <= 0) return -1;
  return clampChartLineIndex(
    Math.round((options.x - options.plotLeft) / options.step),
    options.length
  );
}

export function getChartLineXAxisLabelStride(length: number): number {
  return Math.max(1, Math.ceil(length / 6));
}

export function resolveChartLineTooltipText(options: { label?: string; value: number }): string {
  const label = options.label ? String(options.label) : '';
  return label ? `${label}: ${options.value}` : String(options.value);
}

export function resolveChartLineInterpolatedTooltip(options: {
  from: ChartLineRenderPoint;
  to: ChartLineRenderPoint;
  t: number;
}) {
  const value = options.from.v + (options.to.v - options.from.v) * options.t;
  return {
    x: options.from.x + (options.to.x - options.from.x) * options.t,
    y: options.from.y + (options.to.y - options.from.y) * options.t,
    text: resolveChartLineTooltipText({
      label: options.to.label,
      value: Math.round(value * 100) / 100,
    }),
  };
}

export function resolveChartLineTooltipState(options: {
  x: number;
  y: number;
  text: string;
  textWidth: number;
  chartWidth: number;
  px: (value: number) => number;
}): ChartLineTooltipState {
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

export function areChartLineTooltipStatesEqual(
  a: ChartLineTooltipState,
  b: ChartLineTooltipState
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
