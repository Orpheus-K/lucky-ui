import type { StyleValue } from 'vue';

export function resolveOverlayVisible(options: { modelValue: boolean }): boolean {
  return options.modelValue;
}

export function resolveOverlayBackground(options: { background: string; opacity: number }): string {
  return options.background || `rgba(0,0,0,${options.opacity})`;
}

export function resolveOverlayBaseStyle(options: {
  zIndex: number;
  background: string;
  opacity: number;
}): StyleValue {
  return {
    zIndex: options.zIndex,
    '--lk-overlay-bg': resolveOverlayBackground(options),
  };
}

export function resolveOverlayStyle(options: {
  zIndex: number;
  background: string;
  opacity: number;
  transitionStyles: StyleValue;
  customStyle: StyleValue;
}): StyleValue {
  return [resolveOverlayBaseStyle(options), options.transitionStyles, options.customStyle];
}

export function shouldCloseOverlayOnClick(closeOnClick: boolean): boolean {
  return closeOnClick;
}

export function shouldLockOverlayScroll(options: {
  visible: boolean;
  lockScroll: boolean;
}): boolean {
  return options.visible && options.lockScroll;
}

export function shouldPreventOverlayTouchMove(lockScroll: boolean): boolean {
  return lockScroll;
}
