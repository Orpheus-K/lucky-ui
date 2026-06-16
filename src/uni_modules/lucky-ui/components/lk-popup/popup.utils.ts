import type { StyleValue } from 'vue';
import { addUnit } from '../../core/src/utils/unit';
import {
  ANIMATION_PRESETS,
  type TransitionConfig,
} from '@/uni_modules/lucky-ui/composables/useTransition';

export const POPUP_DEFAULT_TRANSITION_BY_POSITION: Record<
  string,
  NonNullable<TransitionConfig['name']>
> = {
  center: 'zoom-in',
  top: 'slide-down',
  bottom: 'slide-up',
  left: 'slide-left',
  right: 'slide-right',
};

export const POPUP_VELOCITY_THRESHOLD = 0.5;
export const POPUP_DRAG_DISTANCE_THRESHOLD = 50;
export const POPUP_SCROLL_BOUND_EPS = 6;
export const POPUP_SNAP_EPS = 2;
export const POPUP_DEFAULT_DRAG_DAMPING = 0.18;
export const POPUP_DEFAULT_DRAG_EASING = 'cubic-bezier(0.18, 0.89, 0.32, 1.08)';

export function resolvePopupSize(value: string | number): string {
  return addUnit(value) || '';
}

export function isPopupBottomDraggable(options: { position: string; draggable: boolean }): boolean {
  return options.position === 'bottom' && options.draggable;
}

export function resolvePopupTransitionConfig(options: {
  position: string;
  draggable: boolean;
  animation?: keyof typeof ANIMATION_PRESETS;
  animationType?: TransitionConfig['name'];
  duration?: number;
  delay?: number;
  easing?: TransitionConfig['easing'];
}): TransitionConfig {
  if (isPopupBottomDraggable(options)) {
    return {
      name: 'fade',
      duration: options.duration ?? 260,
      delay: options.delay,
      easing: options.easing ?? 'ease-out',
    };
  }

  if (options.animationType) {
    return {
      name: options.animationType,
      duration: options.duration ?? 260,
      delay: options.delay,
      easing: options.easing ?? 'ease-out',
    };
  }

  if (options.animation && ANIMATION_PRESETS[options.animation]) {
    const preset = ANIMATION_PRESETS[options.animation];
    return {
      name: preset.animation,
      duration: options.duration ?? preset.duration ?? 260,
      delay: options.delay ?? preset.delay,
      easing: options.easing ?? preset.easing ?? 'ease-out',
    };
  }

  return {
    name: POPUP_DEFAULT_TRANSITION_BY_POSITION[options.position] || 'zoom-in',
    duration: options.duration ?? 260,
    delay: options.delay ?? 0,
    easing: options.easing ?? 'ease-out',
  };
}

export function resolvePopupWrapperClass(options: {
  position: string;
  round: boolean;
  draggable: boolean;
}) {
  return [
    'lk-popup',
    `lk-popup--${options.position}`,
    { 'is-round': options.round },
    { 'is-draggable': isPopupBottomDraggable(options) },
  ];
}

export function resolvePopupWrapperStyle(options: { zIndex: number; radius: string }) {
  return {
    zIndex: options.zIndex + 1,
    '--lk-popup-radius': options.radius,
  };
}

export function normalizePopupSnapPixels(options: {
  snapPoints: number[];
  windowHeight: number;
}): number[] {
  const raw = options.snapPoints.filter(point => point >= 0 && point <= 1);
  const list = raw.length ? [...raw] : [0.5, 0.1];
  return [...new Set(list.map(point => point * options.windowHeight))].sort((a, b) => a - b);
}

export function getPopupInitialOpenTranslateY(options: {
  snapPoints: number[];
  windowHeight: number;
}): number {
  const first = typeof options.snapPoints[0] === 'number' ? options.snapPoints[0] : 0.5;
  return Math.min(1, Math.max(0, first)) * options.windowHeight;
}

export function getPopupMinSnapY(options: { snapPixels: number[]; windowHeight: number }): number {
  return options.snapPixels[0] ?? options.windowHeight * 0.1;
}

export function getPopupTouchClientY(event: {
  touches?: ArrayLike<{ clientY?: number }>;
  changedTouches?: ArrayLike<{ clientY?: number }>;
}): number {
  const y = event.touches?.[0]?.clientY ?? event.changedTouches?.[0]?.clientY;
  return typeof y === 'number' ? y : 0;
}

export function applyPopupRubberBand(options: {
  nextY: number;
  minSnapY: number;
  damping?: number;
}): number {
  if (options.nextY < options.minSnapY) {
    return (
      options.minSnapY +
      (options.nextY - options.minSnapY) * resolvePopupDragDamping(options.damping)
    );
  }
  return options.nextY;
}

export function resolvePopupDragDamping(value?: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return POPUP_DEFAULT_DRAG_DAMPING;
  return Math.min(1, Math.max(0, value));
}

export function resolvePopupSnapTarget(options: {
  currentY: number;
  velocity: number;
  snapPixels: number[];
  windowHeight: number;
}): number {
  const closeY = options.windowHeight;
  const candidates = [...options.snapPixels, closeY];

  if (options.velocity > POPUP_VELOCITY_THRESHOLD) {
    const down = candidates.filter(point => point > options.currentY + 2);
    return down.length ? Math.min(...down) : closeY;
  }
  if (options.velocity < -POPUP_VELOCITY_THRESHOLD) {
    const up = candidates.filter(point => point < options.currentY - 2);
    return up.length ? Math.max(...up) : (options.snapPixels[0] ?? options.currentY);
  }

  return candidates.reduce((best, point) =>
    Math.abs(point - options.currentY) < Math.abs(best - options.currentY) ? point : best
  );
}

function getPopupSnapCandidates(snapPixels: number[], windowHeight: number): number[] {
  return [...new Set([...snapPixels, windowHeight])].sort((a, b) => a - b);
}

export function resolveNearestPopupSnapPoint(options: {
  value: number;
  snapPixels: number[];
  windowHeight: number;
}): number {
  return getPopupSnapCandidates(options.snapPixels, options.windowHeight).reduce((best, point) =>
    Math.abs(point - options.value) < Math.abs(best - options.value) ? point : best
  );
}

export function resolvePopupAdjacentSnapTarget(options: {
  startY: number;
  currentY: number;
  velocity: number;
  snapPixels: number[];
  windowHeight: number;
  dragThreshold?: number;
}): number {
  const candidates = getPopupSnapCandidates(options.snapPixels, options.windowHeight);
  const start = resolveNearestPopupSnapPoint({
    value: options.startY,
    snapPixels: options.snapPixels,
    windowHeight: options.windowHeight,
  });
  const threshold = options.dragThreshold ?? POPUP_DRAG_DISTANCE_THRESHOLD;
  const distance = options.currentY - options.startY;
  const shouldMoveDown = options.velocity > POPUP_VELOCITY_THRESHOLD || distance > threshold;
  const shouldMoveUp = options.velocity < -POPUP_VELOCITY_THRESHOLD || distance < -threshold;

  if (shouldMoveDown) {
    return candidates.find(point => point > start + POPUP_SNAP_EPS) ?? options.windowHeight;
  }

  if (shouldMoveUp) {
    const upper = candidates.filter(point => point < start - POPUP_SNAP_EPS);
    return upper.length ? upper[upper.length - 1] : start;
  }

  return resolveNearestPopupSnapPoint({
    value: options.currentY,
    snapPixels: options.snapPixels,
    windowHeight: options.windowHeight,
  });
}

export function canExpandPopupSheet(options: { translateY: number; minSnapY: number }): boolean {
  return options.translateY > options.minSnapY + POPUP_SNAP_EPS;
}

export function isPopupSheetExpanded(options: { translateY: number; minSnapY: number }): boolean {
  return !canExpandPopupSheet(options);
}

export function isPopupContentAtUpper(options: { scrollTop: number }): boolean {
  return options.scrollTop <= POPUP_SCROLL_BOUND_EPS;
}

export function shouldPopupSheetTakeContentGesture(options: {
  translateY: number;
  minSnapY: number;
  scrollTop: number;
  deltaY: number;
}): boolean {
  if (Math.abs(options.deltaY) <= POPUP_SNAP_EPS) return false;
  if (
    !isPopupSheetExpanded({
      translateY: options.translateY,
      minSnapY: options.minSnapY,
    })
  ) {
    return true;
  }
  return options.deltaY > 0 && isPopupContentAtUpper({ scrollTop: options.scrollTop });
}

export function shouldPopupSheetHandOffToContentScroll(options: {
  startTranslateY: number;
  nextY: number;
  minSnapY: number;
  deltaY: number;
}): boolean {
  return (
    options.deltaY < -POPUP_SNAP_EPS &&
    !isPopupSheetExpanded({
      translateY: options.startTranslateY,
      minSnapY: options.minSnapY,
    }) &&
    options.nextY <= options.minSnapY
  );
}

export function isPopupContentAtLower(options: {
  scrollTop: number;
  viewportHeight: number;
  scrollHeight: number;
}): boolean {
  if (options.viewportHeight <= 0 || options.scrollHeight <= 0) return false;
  return (
    options.scrollTop + options.viewportHeight >= options.scrollHeight - POPUP_SCROLL_BOUND_EPS
  );
}

export function resolvePopupPanelStyle(options: {
  position: string;
  draggable: boolean;
  transitionStyles: StyleValue;
  height: string;
  width: string;
  transitionDuration: number;
  dragEasing?: string;
  isGestureActive: boolean;
  windowHeight: number;
  translateY: number;
  round: boolean;
  customStyle?: StyleValue;
}): StyleValue {
  const base = options.transitionStyles as Record<string, unknown>;
  if (isPopupBottomDraggable(options)) {
    const visibleHeight = Math.max(0, options.windowHeight - options.translateY);
    return [
      options.customStyle || '',
      {
        ...base,
        height: `${visibleHeight}px`,
        transform: 'none',
        transition: options.isGestureActive
          ? 'none'
          : `height ${Math.max(options.transitionDuration, 260) * 0.001}s ${options.dragEasing || POPUP_DEFAULT_DRAG_EASING}`,
        ...(options.width ? { width: options.width } : {}),
        borderRadius: options.round ? 'var(--lk-popup-radius) var(--lk-popup-radius) 0 0' : '0',
      },
    ] as StyleValue;
  }

  return [
    options.customStyle || '',
    {
      ...base,
      ...(options.height ? { height: options.height } : {}),
      ...(options.width ? { width: options.width } : {}),
    },
  ] as StyleValue;
}
