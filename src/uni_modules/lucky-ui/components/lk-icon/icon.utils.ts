import type { IconBoxShape } from './icon.props';

export const iconSemanticColorMap: Record<string, string> = {
  primary: 'var(--lk-color-primary)',
  success: 'var(--lk-color-success)',
  warning: 'var(--lk-color-warning)',
  danger: 'var(--lk-color-danger)',
  info: 'var(--lk-color-info)',
  text: 'var(--lk-text-primary)',
  textSecondary: 'var(--lk-text-secondary)',
  textTertiary: 'var(--lk-text-tertiary)',
  textPlaceholder: 'var(--lk-text-placeholder)',
  textDisabled: 'var(--lk-text-disabled)',
  textInverse: 'var(--lk-text-inverse)',
  white: 'var(--lk-color-white)',
  black: 'var(--lk-color-black)',
};

export const iconBoxSemanticColorMap: Record<string, string> = {
  primary: 'var(--lk-color-primary-soft)',
  success: 'var(--lk-color-success-soft)',
  warning: 'var(--lk-color-warning-soft)',
  danger: 'var(--lk-color-danger-soft)',
  info: 'var(--lk-color-info-soft)',
};

export function resolveIconColor(color: string): string {
  if (!color) return '';
  return iconSemanticColorMap[color] || color;
}

export function resolveIconSize(size: string | number): string {
  if (size === '') return '';
  return /^\d+(\.\d+)?$/.test(String(size)) ? `${size}rpx` : String(size);
}

export function resolveIconStyle(options: {
  color: string;
  size: string | number;
}): Record<string, string> {
  const styles: Record<string, string> = {};
  const color = resolveIconColor(options.color);
  const fontSize = resolveIconSize(options.size);

  if (color) styles.color = color;
  if (fontSize) styles.fontSize = fontSize;

  return styles;
}

export function expandIconShortHex(hex: string): string {
  if (typeof hex !== 'string') return '';
  return hex
    .split('')
    .map(char => char + char)
    .join('');
}

export function toIconSoftColor(color: string): string {
  if (typeof color !== 'string') return '';
  const value = color.trim();
  if (!value) return '';
  const hex = value.replace('#', '');
  const normalized = hex.length === 3 ? expandIconShortHex(hex) : hex;

  if (/^[0-9a-fA-F]{6}$/.test(normalized)) {
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.12)`;
  }

  const rgb = value.match(/^rgba?\(([^)]+)\)$/i);
  if (rgb && rgb[1]) {
    const parts = rgb[1].split(',');
    if (parts.length >= 3) {
      const [r, g, b] = parts.map(part => part.trim());
      if (r && g && b) return `rgba(${r}, ${g}, ${b}, 0.12)`;
    }
  }

  return '';
}

export function resolveIconBoxColor(boxColor: string, color: string): string {
  const explicitBoxColor = typeof boxColor === 'string' ? boxColor.trim() : '';
  if (explicitBoxColor) {
    return iconBoxSemanticColorMap[explicitBoxColor] || explicitBoxColor;
  }

  const iconColor = typeof color === 'string' ? color.trim() : '';
  return iconBoxSemanticColorMap[iconColor] || toIconSoftColor(iconColor) || 'var(--lk-fill-1)';
}

export function resolveIconBoxSize(boxSize: string | number, iconSize: string | number): string {
  const explicitBoxSize = resolveIconSize(boxSize);
  if (explicitBoxSize) return explicitBoxSize;

  const iconSizeValue = String(iconSize).trim();
  const match = iconSizeValue.match(/^(\d+(?:\.\d+)?)(?:rpx)?$/);
  if (!match) return 'var(--lk-rpx-64)';

  const nextSize = Math.max(56, Number(match[1]) + 32);
  return `${Number.isInteger(nextSize) ? nextSize : Number(nextSize.toFixed(2))}rpx`;
}

export function resolveIconBoxRadius(options: {
  boxShape: IconBoxShape;
  boxRadius: string | number;
}): string {
  if (options.boxShape === 'circle') return '50%';

  const radius = resolveIconSize(options.boxRadius);
  if (radius) return radius;

  if (options.boxShape === 'square') return 'var(--lk-radius-xs)';
  return 'var(--lk-radius-md)';
}

export function resolveIconBoxStyle(options: {
  color: string;
  size: string | number;
  boxSize: string | number;
  boxColor: string;
  boxRadius: string | number;
  boxShape: IconBoxShape;
}): Record<string, string> {
  const size = resolveIconBoxSize(options.boxSize, options.size);

  return {
    width: size,
    height: size,
    background: resolveIconBoxColor(options.boxColor, options.color),
    borderRadius: resolveIconBoxRadius({
      boxShape: options.boxShape,
      boxRadius: options.boxRadius,
    }),
  };
}

export function shouldWarnMissingIcon(iconChar: string): boolean {
  return !iconChar;
}
