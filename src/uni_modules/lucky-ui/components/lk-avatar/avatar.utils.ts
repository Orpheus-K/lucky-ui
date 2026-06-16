import type { AvatarShape } from './avatar.props';
import { addUnit } from '../../core/src/utils/unit';

export interface ResolveAvatarStyleOptions {
  shape: AvatarShape;
  size: string | number;
  radius: string | number;
  bg: string;
  color: string;
}

export function resolveAvatarBorderRadius(options: {
  shape: AvatarShape;
  radius: string | number;
}): string {
  if (options.shape === 'circle') {
    return '50%';
  }

  if (options.radius !== '' && options.radius !== undefined && options.radius !== null) {
    return addUnit(options.radius) || '';
  }

  if (options.shape === 'rounded') {
    return 'var(--lk-radius-lg)';
  }

  if (options.shape === 'square') {
    return 'var(--lk-radius-xs)';
  }

  return 'var(--lk-radius-md)';
}

export function resolveAvatarStyle(
  options: ResolveAvatarStyleOptions
): Record<string, string | undefined> {
  return {
    width: addUnit(options.size),
    height: addUnit(options.size),
    background: options.bg || 'var(--lk-fill-1)',
    borderRadius: resolveAvatarBorderRadius({
      shape: options.shape,
      radius: options.radius,
    }),
    color: options.color || undefined,
  };
}

export function resolveAvatarClass(options: {
  shape: AvatarShape;
  fallback: boolean;
  customClass: unknown;
}) {
  return [`lk-avatar--${options.shape}`, { 'is-fallback': options.fallback }, options.customClass];
}

export function shouldShowAvatarImage(options: { src: string; hasError: boolean }): boolean {
  return Boolean(options.src) && !options.hasError;
}

export function resolveAvatarFallbackText(text: string): string {
  return text.slice(0, 1).toUpperCase();
}
