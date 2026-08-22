import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Ref, StyleValue } from 'vue';

export interface OverlayScrollLockController {
  sync(shouldLock: boolean): boolean;
  release(): void;
}

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

export function useOverlayScrollLock(
  shouldLock: () => boolean,
  controller: OverlayScrollLockController
): Ref<boolean> {
  const scrollLocked = ref(false);
  const sync = () => {
    scrollLocked.value = controller.sync(shouldLock());
  };

  watch(shouldLock, sync, { immediate: true });
  onMounted(sync);
  onBeforeUnmount(() => {
    controller.release();
    scrollLocked.value = false;
  });

  return scrollLocked;
}

export function preventOverlayTouchMove(
  event: Pick<TouchEvent, 'preventDefault'>,
  scrollLocked: boolean
): void {
  if (scrollLocked) event.preventDefault();
}
