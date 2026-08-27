import type { StyleValue } from 'vue';

export function resolveLoadingSize(size: string | number): string {
  if (size === '' || size === undefined || size === null) return '';
  const value = String(size).trim();
  return /^\d+(\.\d+)?$/.test(value) ? `${value}rpx` : value;
}

export function normalizeLoadingSize(size: string | number): number {
  if (typeof size === 'number') return size;
  const num = parseInt(size, 10);
  return Number.isNaN(num) ? 40 : num;
}

export function resolveLoadingRootClass(options: {
  type: string;
  vertical: boolean;
  customClass?: unknown;
}) {
  return [`lk-loading--${options.type}`, { 'is-vertical': options.vertical }, options.customClass];
}

export function resolveLoadingRootStyle(options: {
  color: string;
  showTrack: boolean;
  trackColor: string;
  customStyle?: StyleValue;
}): StyleValue {
  const style: Record<string, string> = {
    '--_color': options.color,
  };

  if (!options.showTrack) {
    style['--_track-color'] = 'transparent';
  } else if (options.trackColor) {
    style['--_track-color'] = options.trackColor;
  }

  return [style, options.customStyle || ''] as StyleValue;
}

export function resolveLoadingSquareStyle(size: string | number) {
  const value = resolveLoadingSize(size);
  return {
    width: value,
    height: value,
  };
}

export function resolveLoadingHeightStyle(size: string | number) {
  return {
    height: resolveLoadingSize(size),
  };
}

export function resolveLoadingBarStyle(size: string | number) {
  const rawValue = String(size).trim();
  if (/^\d+(\.\d+)?$/.test(rawValue)) {
    return {
      width: `${Number(rawValue) * 2}rpx`,
    };
  }
  const value = resolveLoadingSize(size);
  if (!value) {
    return {
      width: '',
    };
  }
  return {
    width: `calc(${value} + ${value})`,
  };
}

export function resolveLoadingText(options: { type: string; text: string }) {
  return options.type === 'text' ? options.text || 'Loading...' : options.text;
}

export function shouldRenderLoadingText(options: { type: string; text: string }) {
  return !!options.text && options.type !== 'text';
}
