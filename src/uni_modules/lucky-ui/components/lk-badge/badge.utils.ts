import type { BadgeType } from './badge.props';

export type BadgeValue = string | number;

export const badgeTypeBgMap: Record<BadgeType, string> = {
  primary: 'var(--lk-color-primary)',
  success: 'var(--lk-color-success)',
  warning: 'var(--lk-color-warning)',
  danger: 'var(--lk-color-danger)',
  info: 'var(--lk-color-info)',
};

export function resolveBadgeDisplayValue(options: {
  value: BadgeValue;
  max: number;
  dot: boolean;
}): BadgeValue {
  if (options.dot) return '';
  if (typeof options.value === 'number' && options.value > options.max) {
    return `${options.max}+`;
  }
  return options.value;
}

export function shouldShowBadge(options: {
  hidden: boolean;
  dot: boolean;
  value: BadgeValue;
}): boolean {
  return !options.hidden && (options.dot || options.value !== '');
}

export function resolveBadgeStyle(options: {
  offset: [number, number];
  color: string;
  bgColor: string;
  type: BadgeType;
}): Record<string, string | undefined> {
  return {
    right: `${options.offset[0]}rpx`,
    top: `${options.offset[1]}rpx`,
    color: options.color || undefined,
    background: options.bgColor || badgeTypeBgMap[options.type] || undefined,
  };
}

export function resolveBadgeClass(options: {
  type: BadgeType;
  dot: boolean;
  customClass: unknown;
}) {
  return [`lk-badge--${options.type}`, { 'is-dot': options.dot }, options.customClass];
}

export function resolveBadgeClickPayload(options: {
  value: BadgeValue;
  displayValue: BadgeValue;
  event?: unknown;
}) {
  return {
    value: options.value,
    displayValue: options.displayValue,
    event: options.event,
  };
}
