import type { StyleValue } from 'vue';
import type { PieChartSlice } from './chart-pie.props';
import type { buildBrandPalette } from '../../utils/chart-colors';

export interface ChartPieTooltipState {
  visible: boolean;
  x: number;
  y: number;
  width: number;
  arrowX: number;
  text: string;
}

export interface ChartPieGeometry {
  width: number;
  height: number;
  cx: number;
  cy: number;
  radius: number;
}

export interface ChartPieDonutBounds {
  thickness: number;
  outerRadius: number;
  innerRadius: number;
  arcRadius: number;
}

export const CHART_PIE_START_ANGLE = -Math.PI / 2;

export const CHART_PIE_EMPTY_TOOLTIP: ChartPieTooltipState = {
  visible: false,
  x: 0,
  y: 0,
  width: 0,
  arrowX: 0,
  text: '',
};

export function resolveChartPieHeightStyle(height: string | number): string {
  if (typeof height === 'number') return `${height}rpx`;
  if (/^\d+$/.test(height)) return `${height}rpx`;
  return String(height);
}

export function resolveChartPieRootStyle(options: {
  heightStyle: string;
  customStyle: StyleValue;
}): StyleValue {
  return [{ height: options.heightStyle }, options.customStyle];
}

export function resolveChartPieTooltipStyle(state: ChartPieTooltipState): StyleValue {
  return {
    left: `${state.x}px`,
    top: `${state.y}px`,
    width: `${state.width}px`,
    '--lk-chart-tooltip-arrow-x': `${state.arrowX}px`,
  };
}

export function clampChartPieIndex(index: number, length: number): number {
  if (length <= 0) return -1;
  return Math.max(0, Math.min(length - 1, index));
}

export function getValidChartPieSlices(data: PieChartSlice[]): PieChartSlice[] {
  return data.filter(item => Number.isFinite(item.value) && item.value > 0);
}

export function getChartPieTotal(data: PieChartSlice[]): number {
  return data.reduce((sum, item) => sum + item.value, 0);
}

export function resolveChartPieGeometry(options: {
  width: number;
  height: number;
  padding: number;
}): ChartPieGeometry {
  return {
    width: options.width,
    height: options.height,
    cx: options.width / 2,
    cy: options.height / 2,
    radius: Math.max(0, Math.min(options.width, options.height) / 2 - options.padding),
  };
}

export function resolveChartPieDonutBounds(options: {
  radius: number;
  donutWidth: number;
}): ChartPieDonutBounds {
  const thickness = Math.max(2, options.donutWidth);
  return {
    thickness,
    outerRadius: options.radius,
    innerRadius: Math.max(0, options.radius - thickness),
    arcRadius: Math.max(1, options.radius - thickness / 2),
  };
}

export function getChartPieEffectiveIndex(options: {
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
    return clampChartPieIndex(options.defaultIndex, options.length);
  }
  return -1;
}

export function resolveChartPieInitialHoverIndex(options: {
  autoTooltip: boolean;
  tooltipAlways: boolean;
  defaultIndex: number;
  length: number;
}): number {
  return options.tooltipAlways || options.autoTooltip
    ? clampChartPieIndex(options.defaultIndex, options.length)
    : -1;
}

export function getChartPieNextAutoTooltipIndex(options: {
  hoverIndex: number;
  defaultIndex: number;
  length: number;
}): number {
  if (options.length <= 0) return -1;
  const current = clampChartPieIndex(
    options.hoverIndex < 0 ? options.defaultIndex : options.hoverIndex,
    options.length
  );
  return (current + 1) % options.length;
}

export function resolveChartPieSliceColor(
  slice: PieChartSlice,
  index: number,
  palette: ReturnType<typeof buildBrandPalette>
): string {
  if (slice.color) return slice.color;
  const candidates = [
    palette.brand600,
    palette.brand500,
    palette.brand700,
    palette.brand400,
    palette.brand800,
  ];
  return candidates[index % candidates.length];
}

export function getChartPieSliceSweep(options: { value: number; total: number }): number {
  if (options.total <= 0) return 0;
  return (options.value / options.total) * Math.PI * 2;
}

export function getChartPieOverlapAngle(options: {
  segmentCount: number;
  thickness: number;
  radius: number;
}): number {
  if (options.segmentCount <= 1) return 0;
  return Math.min((options.thickness * 1.6) / Math.max(1, options.radius), Math.PI / 8);
}

export function getChartPieCapSweep(options: {
  overlapAngle: number;
  sweep: number;
  fullSweep: number;
}): number {
  return Math.min(options.overlapAngle, options.sweep, options.fullSweep * 0.45);
}

export function shouldDrawChartPieSegmentEndCap(options: {
  index: number;
  segmentCount: number;
}): boolean {
  return options.segmentCount > 1 && options.index < options.segmentCount - 1;
}

export function getChartPiePercent(options: { value: number; total: number }): number {
  if (options.total <= 0) return 0;
  return Math.round((options.value / options.total) * 1000) / 10;
}

export function resolveChartPieTooltipText(options: {
  slice: PieChartSlice;
  total: number;
}): string {
  const percent = getChartPiePercent({
    value: options.slice.value,
    total: options.total,
  });
  const label = options.slice.label ? String(options.slice.label) : '';
  return label ? `${label}: ${percent}%` : `${percent}%`;
}

export function resolveChartPieCanvasTextColor(options: {
  color: string | null;
  fallback: string;
}): string {
  const color = options.color?.trim() || '';
  if (!color || color.startsWith('var(')) return options.fallback;
  return color;
}

export function resolveChartPieCenterText(options: {
  showCenterText: boolean;
  centerTitle: string;
  activeSlice: PieChartSlice | null;
  total: number;
}) {
  if (!options.showCenterText) return null;
  const title = options.centerTitle || 'Total';
  const activeLabel = options.activeSlice?.label ? String(options.activeSlice.label) : '';
  const main = options.activeSlice
    ? `${getChartPiePercent({ value: options.activeSlice.value, total: options.total })}%`
    : String(Math.round(options.total * 100) / 100);

  return {
    title: activeLabel || title,
    main,
  };
}

export function normalizeChartPieAngle(dx: number, dy: number): number {
  let angle = Math.atan2(dy, dx) - CHART_PIE_START_ANGLE;
  if (angle < 0) angle += Math.PI * 2;
  return angle;
}

export function isChartPiePointInside(options: {
  distance: number;
  donut: boolean;
  radius: number;
  donutWidth: number;
}): boolean {
  if (!options.donut) return options.distance <= options.radius;
  const bounds = resolveChartPieDonutBounds({
    radius: options.radius,
    donutWidth: options.donutWidth,
  });
  return options.distance >= bounds.innerRadius && options.distance <= bounds.outerRadius;
}

export function getChartPieIndexByAngle(options: {
  angle: number;
  data: PieChartSlice[];
  total: number;
}): number {
  if (!options.data.length || options.total <= 0) return -1;
  let acc = 0;
  for (let index = 0; index < options.data.length; index += 1) {
    const sweep = getChartPieSliceSweep({
      value: options.data[index].value,
      total: options.total,
    });
    if (options.angle >= acc && options.angle < acc + sweep) return index;
    acc += sweep;
  }
  return options.data.length - 1;
}

export function resolveChartPieTooltipState(options: {
  x: number;
  y: number;
  text: string;
  textWidth: number;
  chartWidth: number;
  px: (value: number) => number;
}): ChartPieTooltipState {
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

export function areChartPieTooltipStatesEqual(
  a: ChartPieTooltipState,
  b: ChartPieTooltipState
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
