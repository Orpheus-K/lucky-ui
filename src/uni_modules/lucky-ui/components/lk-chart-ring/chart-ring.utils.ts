import type { StyleValue } from 'vue';
import type { RingChartSegment } from './chart-ring.props';
import type { buildBrandPalette } from '../../utils/chart-colors';
import { LiteChartEffect } from '../../core/src/chart';

export function resolveChartRingHeightStyle(height: string | number): string {
  if (typeof height === 'number') return `${height}rpx`;
  if (/^\d+$/.test(String(height))) return `${height}rpx`;
  return String(height);
}

export function resolveChartRingRootStyle(options: {
  heightStyle: string;
  customStyle: StyleValue;
}): StyleValue {
  return [{ height: options.heightStyle }, options.customStyle];
}

export function resolveChartRingClass(customClass: unknown) {
  return ['lk-chart-ring', customClass];
}

export function normalizeChartRingSegments(options: {
  segments: RingChartSegment[];
  value: number;
  max: number;
  title: string;
}): RingChartSegment[] {
  if (options.segments.length) {
    const segments = options.segments.filter(item => Number.isFinite(item.value) && item.value > 0);
    return segments.length ? segments : [{ label: 'Total', value: 0 }];
  }
  const max = Number.isFinite(options.max) ? Math.max(1, options.max) : 1;
  const value = Number.isFinite(options.value) ? options.value : 0;
  return [
    {
      label: options.title || 'Progress',
      value: Math.max(0, Math.min(value, max)),
    },
  ];
}

export function resolveChartRingCenterTitle(options: {
  title: string;
  segments: RingChartSegment[];
  normalizedSegments: RingChartSegment[];
  value: number;
  max: number;
}): string {
  if (options.title) return options.title;
  if (options.segments.length) {
    const total = options.normalizedSegments.reduce((sum, item) => sum + item.value, 0);
    return `${Math.round(total)}`;
  }
  const max = Number.isFinite(options.max) ? Math.max(1, options.max) : 1;
  const value = Number.isFinite(options.value) ? options.value : 0;
  const percent = Math.round((Math.max(0, Math.min(value, max)) / max) * 100);
  return `${percent}%`;
}

export function resolveChartRingCenterSubtitle(options: {
  subtitle: string;
  segments: RingChartSegment[];
}): string {
  return options.subtitle || (options.segments.length ? 'Total' : 'Completed');
}

export function resolveChartRingSegmentColor(
  segment: RingChartSegment,
  index: number,
  palette: ReturnType<typeof buildBrandPalette>
): string {
  if (segment.color) return segment.color;
  const colors = [palette.brand600, palette.brand400, palette.brand700, palette.brand300];
  return colors[index % colors.length];
}

export function getChartRingEffectStrength(effect: string): number {
  if (effect === LiteChartEffect.None) return 0;
  if (effect === LiteChartEffect.Subtle) return 0.65;
  return 1;
}

export function resolveChartRingGeometry(options: {
  width: number;
  height: number;
  padding: number;
  strokeWidth: number;
}) {
  return {
    cx: options.width / 2,
    cy: options.height / 2,
    radius: Math.max(
      1,
      Math.min(options.width, options.height) / 2 - options.padding - options.strokeWidth / 2
    ),
  };
}

export function getChartRingTotal(options: {
  hasSegments: boolean;
  segments: RingChartSegment[];
  max: number;
}): number {
  if (options.hasSegments) {
    return Math.max(
      1,
      options.segments.reduce((sum, item) => sum + item.value, 0)
    );
  }
  return Number.isFinite(options.max) ? Math.max(1, options.max) : 1;
}

export function getChartRingOverlapAngle(options: {
  segmentCount: number;
  strokeWidth: number;
  radius: number;
}): number {
  if (options.segmentCount <= 1) return 0;
  return Math.min((options.strokeWidth * 1.6) / options.radius, Math.PI / 8);
}

export function getChartRingCapSweep(options: {
  overlapAngle: number;
  sweep: number;
  fullSweep: number;
}): number {
  return Math.min(options.overlapAngle, options.sweep, options.fullSweep * 0.45);
}
