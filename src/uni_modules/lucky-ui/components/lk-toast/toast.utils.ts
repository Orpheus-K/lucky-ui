import type { StyleValue } from 'vue';
import type { ToastPosition, ToastTransitionName } from './toast.props';

export interface ToastItem {
  id: number;
  message: string;
  transition?: ToastTransitionName;
  duration: number;
  position: ToastPosition;
  visible: boolean;
}

export type ToastShowOptions = Partial<ToastItem> | string;

export function resolveToastTransition(options: {
  transition: ToastTransitionName;
  position: ToastPosition;
}): ToastTransitionName {
  if (options.transition !== 'slide-up') return options.transition;
  if (options.position === 'top') return 'slide-down';
  if (options.position === 'center') return 'zoom-in';
  return 'slide-up';
}

export function resolveToastManagerTransition(options: {
  transition?: ToastTransitionName;
  position: ToastPosition;
}): ToastTransitionName {
  if (options.transition) return options.transition;
  return resolveToastTransition({
    transition: 'slide-up',
    position: options.position,
  });
}

export function shouldScheduleToastClose(duration: number): boolean {
  return duration > 0;
}

export interface ToastBlockerConfig {
  overlay: boolean;
  forbidClick: boolean;
}

export interface ToastBlockerState {
  sync: (options: ToastBlockerConfig & { visible: boolean }) => ToastBlockerConfig;
  finishLeave: () => void;
  dispose: () => void;
}

export function createToastBlockerState(): ToastBlockerState {
  let phase: 'hidden' | 'visible' | 'leaving' | 'disposed' = 'hidden';
  let config: ToastBlockerConfig = { overlay: false, forbidClick: false };

  const sync = (options: ToastBlockerConfig & { visible: boolean }) => {
    if (phase === 'disposed') return config;

    if (options.visible) {
      phase = 'visible';
      config = {
        overlay: options.overlay,
        forbidClick: options.forbidClick,
      };
    } else if (phase === 'visible') {
      phase = 'leaving';
    }

    return config;
  };

  return {
    sync,
    finishLeave() {
      if (phase === 'leaving') phase = 'hidden';
    },
    dispose() {
      phase = 'disposed';
    },
  };
}

export function shouldRenderToastBlocker(options: {
  display: boolean;
  overlay: boolean;
  forbidClick: boolean;
}): boolean {
  return options.display && (options.overlay || options.forbidClick);
}

export function resolveToastOverlayClass(options: { overlay: boolean; forbidClick: boolean }) {
  return {
    'is-visible': options.overlay,
    'is-lock': options.forbidClick,
  };
}

export function resolveToastOverlayStyle(zIndex: number): StyleValue {
  return { zIndex };
}

export function resolveToastRootClass(position: ToastPosition) {
  return [`lk-toast--${position}`];
}

export function resolveToastRootStyle(zIndex: number): StyleValue {
  return { zIndex: zIndex + 1 };
}

export function resolveToastManagerStyle(options: {
  customStyle: StyleValue;
  zIndex: number;
}): StyleValue {
  return [options.customStyle, { zIndex: options.zIndex }];
}

export function resolveToastManagerItemClass(position: ToastPosition) {
  return [`pos-${position}`];
}

export function createToastItem(options: { id: number; input: ToastShowOptions }): ToastItem {
  const input = options.input;
  const isString = typeof input === 'string';
  const position = (isString ? 'center' : input.position) || 'center';

  return {
    id: options.id,
    message: isString ? input : input.message || '',
    transition: resolveToastManagerTransition({
      transition: isString ? undefined : input.transition,
      position,
    }),
    duration: isString ? 2000 : (input.duration ?? 2000),
    position,
    visible: true,
  };
}
