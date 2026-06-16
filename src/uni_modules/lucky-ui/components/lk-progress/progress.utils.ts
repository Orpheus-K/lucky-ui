import type { CSSProperties, StyleValue } from 'vue';
import { addUnit } from '../../core/src/utils/unit';

export const progressStatusColors: Record<string, string> = {
  success: 'var(--lk-color-success)',
  warning: 'var(--lk-color-warning)',
  danger: 'var(--lk-color-danger)',
  error: 'var(--lk-color-danger)',
};

export function normalizeProgressPercentage(percentage: number): number {
  return Math.min(100, Math.max(0, percentage));
}

export function resolveProgressTrackStyle(options: {
  strokeWidth: number;
  trackColor: string;
}): CSSProperties {
  const style: CSSProperties = {};

  if (options.strokeWidth) style.height = addUnit(options.strokeWidth);
  if (options.trackColor) style.backgroundColor = options.trackColor;

  return style;
}

export function resolveProgressBarStyle(options: {
  percentage: number;
  color: string;
  status: string;
}): CSSProperties {
  const style: CSSProperties = {
    width: `${normalizeProgressPercentage(options.percentage)}%`,
  };

  if (options.color) {
    style.backgroundColor = options.color;
  } else {
    const statusColor = progressStatusColors[options.status];
    if (statusColor) {
      style.backgroundColor = statusColor;
    }
  }

  return style;
}

export function resolveProgressRootClass(options: {
  striped: boolean;
  animated: boolean;
  customClass?: unknown;
}) {
  return [
    {
      'is-striped': options.striped,
      'is-animated': options.animated,
    },
    options.customClass,
  ];
}

export function resolveProgressRootStyle(customStyle: StyleValue): StyleValue {
  return customStyle;
}

export function shouldEmitProgressComplete(value: number, oldValue?: number): boolean {
  return value === 100 && oldValue !== 100;
}

export function formatProgressText(percentage: number): string {
  return `${normalizeProgressPercentage(percentage)}%`;
}
