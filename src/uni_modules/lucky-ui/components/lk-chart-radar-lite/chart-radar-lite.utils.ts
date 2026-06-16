import type { StyleValue } from 'vue';
import type { RadarLiteItem } from './chart-radar-lite.props';
import { clamp01, easeOutCubic, LiteChartEffect, oscillate } from '../../core/src/chart';

export interface NormalizedRadarLiteItem extends RadarLiteItem {
  max: number;
}

export interface RadarLitePoint {
  label: string;
  value: number;
  ratio: number;
  angle: number;
  x: number;
  y: number;
}

export function resolveChartRadarLiteHeightStyle(height: string | number): string {
  if (typeof height === 'number') return `${height}rpx`;
  if (/^\d+$/.test(String(height))) return `${height}rpx`;
  return String(height);
}

export function resolveChartRadarLiteRootStyle(options: {
  heightStyle: string;
  customStyle: StyleValue;
}): StyleValue {
  return [{ height: options.heightStyle }, options.customStyle];
}

export function resolveChartRadarLiteClass(customClass: unknown) {
  return ['lk-chart-radar-lite', customClass];
}

export function normalizeRadarLiteData(
  data: RadarLiteItem[],
  fallbackMax: number
): NormalizedRadarLiteItem[] {
  const defaultMax = Number.isFinite(fallbackMax) ? Math.max(1, fallbackMax) : 100;
  return data
    .filter(item => String(item.label || '').trim() && Number.isFinite(item.value))
    .map(item => ({
      ...item,
      label: String(item.label).trim(),
      max: Number.isFinite(item.max) ? Math.max(1, item.max as number) : defaultMax,
    }));
}

export function getChartRadarLiteEffectStrength(effect: string): number {
  if (effect === LiteChartEffect.None) return 0;
  if (effect === LiteChartEffect.Subtle) return 0.42;
  return 0.72;
}

export function getRadarLitePoint(options: {
  cx: number;
  cy: number;
  radius: number;
  angle: number;
  ratio: number;
}) {
  return {
    x: options.cx + Math.cos(options.angle) * options.radius * options.ratio,
    y: options.cy + Math.sin(options.angle) * options.radius * options.ratio,
  };
}

export function buildRadarLitePoints(options: {
  data: NormalizedRadarLiteItem[];
  cx: number;
  cy: number;
  radius: number;
}): RadarLitePoint[] {
  const count = options.data.length;
  return options.data.map((item, index): RadarLitePoint => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / count;
    const ratio = Math.max(0, Math.min(1, item.value / item.max));
    const point = getRadarLitePoint({
      cx: options.cx,
      cy: options.cy,
      radius: options.radius,
      angle,
      ratio,
    });
    return {
      label: item.label,
      value: item.value,
      ratio,
      angle,
      x: point.x,
      y: point.y,
    };
  });
}

export function resolveChartRadarLiteGeometry(options: {
  width: number;
  height: number;
  padding: number;
}) {
  const width = Number.isFinite(options.width) ? Math.max(0, options.width) : 0;
  const height = Number.isFinite(options.height) ? Math.max(0, options.height) : 0;
  const padding = Number.isFinite(options.padding)
    ? Math.min(Math.max(0, options.padding), Math.min(width, height) / 2)
    : 0;
  return {
    cx: width / 2,
    cy: height / 2,
    radius: Math.max(1, Math.min(width, height) / 2 - padding),
  };
}

export function getChartRadarLiteLevels(levels: number): number {
  return Number.isFinite(levels) ? Math.max(2, Math.round(levels)) : 4;
}

function getSegmentProgress(progress: number, start: number, end: number): number {
  return clamp01((progress - start) / Math.max(0.0001, end - start));
}

export interface RadarLiteMotionState {
  gridProgress: number;
  axisProgress: number;
  polygonProgress: number;
  pointProgress: number;
  labelProgress: number;
}

export function resolveRadarLiteMotion(progress: number): RadarLiteMotionState {
  const value = clamp01(progress);
  return {
    gridProgress: easeOutCubic(getSegmentProgress(value, 0, 0.34)),
    axisProgress: easeOutCubic(getSegmentProgress(value, 0.08, 0.48)),
    polygonProgress: easeOutCubic(getSegmentProgress(value, 0.18, 0.86)),
    pointProgress: easeOutCubic(getSegmentProgress(value, 0.58, 0.98)),
    labelProgress: easeOutCubic(getSegmentProgress(value, 0.7, 1)),
  };
}

export function getRadarLiteAxisReveal(index: number, count: number, progress: number): number {
  const safeCount = Math.max(1, count);
  const stagger = safeCount > 1 ? (index / safeCount) * 0.34 : 0;
  return easeOutCubic(getSegmentProgress(progress, stagger, stagger + 0.58));
}

export function getRadarLitePointDrop(reveal: number, pointProgress: number): number {
  const pointReveal = getSegmentProgress(pointProgress, 0.18, 1);
  return oscillate(getSegmentProgress(reveal * pointReveal, 0.72, 1));
}

export function getRadarLiteBreath(phase: number, effectStrength: number): number {
  if (effectStrength <= 0) return 0;
  return oscillate(phase) * effectStrength;
}
