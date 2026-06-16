import type { CSSProperties } from 'vue';
import type { TagSize, TagType } from './tag.props';

export interface ResolveTagStyleOptions {
  type: TagType;
  color: string;
  textColor: string;
  bgColor: string;
}

export interface ResolveTagClassOptions {
  type: TagType;
  size: TagSize;
  disabled: boolean;
  round: boolean;
  closable: boolean;
  customClass: unknown;
}

export function expandShortHex(hex: string): string {
  if (typeof hex !== 'string') return '';
  return hex
    .split('')
    .map(char => char + char)
    .join('');
}

export function toSoftColor(color: string): string {
  if (typeof color !== 'string') return '';
  const value = color.trim();
  if (!value) return '';
  const hex = value.replace('#', '');
  const normalized = hex.length === 3 ? expandShortHex(hex) : hex;

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

  return color;
}

export function resolveTagSemanticColor(color: string): { text: string; bg: string } {
  if (typeof color !== 'string') return { text: '', bg: '' };
  const value = color.trim();
  if (!value) return { text: '', bg: '' };
  const colorMap: Record<string, { text: string; bg: string }> = {
    primary: {
      text: 'var(--lk-brand-600)',
      bg: 'rgba(var(--lk-brand-rgb), 0.1)',
    },
    success: {
      text: 'var(--lk-color-success)',
      bg: 'var(--lk-color-success-soft)',
    },
    warning: {
      text: 'var(--lk-color-warning)',
      bg: 'var(--lk-color-warning-soft)',
    },
    danger: {
      text: 'var(--lk-color-danger)',
      bg: 'var(--lk-color-danger-soft)',
    },
    info: {
      text: 'var(--lk-color-info)',
      bg: 'var(--lk-color-info-soft)',
    },
  };

  return colorMap[value] || { text: value, bg: toSoftColor(value) };
}

export function resolveTagStyle(options: ResolveTagStyleOptions): CSSProperties {
  const style: CSSProperties = {};

  if (options.color) {
    const semanticColor = resolveTagSemanticColor(options.color);
    style.color = semanticColor.text;
    style.background = semanticColor.bg;
    style.boxShadow = 'none';
  }

  if (options.bgColor) {
    if (options.type === 'outline') {
      style.boxShadow = `inset 0 0 0 var(--lk-rpx-2) ${options.bgColor}`;
      style.background = 'transparent';
    } else {
      style.background = options.bgColor;
    }
  }

  if (options.textColor) {
    style.color = options.textColor;
  }

  return style;
}

export function resolveTagClass(options: ResolveTagClassOptions) {
  return [
    `lk-tag--${options.type}`,
    `lk-tag--${options.size}`,
    {
      'is-disabled': options.disabled,
      'is-round': options.round,
      'is-closable': options.closable,
    },
    options.customClass,
  ];
}

export function resolveTagEventName(
  eventName: 'click' | 'close',
  disabled: boolean
): 'click' | 'close' | 'click-disabled' | 'close-disabled' {
  if (!disabled) return eventName;
  return eventName === 'click' ? 'click-disabled' : 'close-disabled';
}
