import type { StyleValue } from 'vue';

export function resolveSkeletonIndexedValue(
  value: string | string[],
  index: number,
  fallback: string
): string {
  if (Array.isArray(value)) {
    return String(value[index] || value[value.length - 1] || fallback);
  }

  return String(value);
}

export function resolveSkeletonHostStyle(options: {
  duration: string | number;
  easing: string;
  customStyle?: StyleValue;
}): StyleValue {
  const duration =
    typeof options.duration === 'number'
      ? `${options.duration}s`
      : String(options.duration || '1.8s');

  return [
    {
      '--lk-skel-duration': duration,
      '--lk-skel-ease': options.easing,
    },
    options.customStyle || '',
  ] as StyleValue;
}

export function resolveSkeletonRootClass(customClass?: unknown) {
  return ['lk-skeleton', customClass];
}

export function resolveSkeletonAvatarStyle(options: { avatarSize: string; round: boolean }) {
  return {
    width: options.avatarSize,
    height: options.avatarSize,
    borderRadius: options.round ? '50%' : 'var(--lk-radius-md)',
  };
}

export function resolveSkeletonTitleStyle(options: { titleWidth: string; titleHeight: string }) {
  return {
    width: options.titleWidth,
    height: options.titleHeight,
  };
}

export function resolveSkeletonRowStyle(options: {
  rowWidth: string | string[];
  rowHeight: string | string[];
  index: number;
}) {
  return {
    width: resolveSkeletonIndexedValue(options.rowWidth, options.index, '100%'),
    height: resolveSkeletonIndexedValue(options.rowHeight, options.index, 'var(--lk-rpx-32)'),
  };
}

export function resolveSkeletonAnimatedClass(animated: boolean) {
  return animated ? 'is-anim' : '';
}
