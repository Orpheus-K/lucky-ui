import { watch, type WatchSource } from 'vue';
import { shouldScheduleToastClose } from './toast.utils';

export interface ToastLifecycleHooks {
  getDuration: () => number;
  onOpen: () => void;
  onRequestClose: () => void;
  onClose: () => void;
  onAfterLeave: () => void;
}

export interface ToastLifecycleController {
  syncVisibility: (visible: boolean) => void;
  requestClose: () => void;
  reschedule: () => void;
  finishLeave: () => void;
  dispose: () => void;
}

export interface ToastLifecycleSources {
  visible: WatchSource<boolean>;
  duration: WatchSource<number>;
}

type ToastLifecyclePhase = 'idle' | 'open' | 'leaving' | 'left' | 'disposed';

/**
 * Owns the lifecycle of one controlled Toast instance.
 *
 * A generation token makes every scheduled close disposable. Close and
 * after-leave are latched per visible cycle so external updates, timer expiry,
 * and transition completion cannot report the same boundary twice.
 */
export function createToastLifecycle(hooks: ToastLifecycleHooks): ToastLifecycleController {
  let phase: ToastLifecyclePhase = 'idle';
  let visible = false;
  let generation = 0;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;

  const invalidateCloseTimer = () => {
    generation += 1;
    if (closeTimer !== null) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  };

  const isDisposed = () => phase === 'disposed';

  const requestClose = () => {
    if (isDisposed() || !visible || phase !== 'open') return;

    invalidateCloseTimer();
    const requestGeneration = generation;
    hooks.onRequestClose();
    // A controlled parent may reject the update. In that case retry only after
    // another complete positive duration, rather than spinning in a microtask.
    if (!isDisposed() && visible && phase === 'open' && generation === requestGeneration) {
      scheduleClose();
    }
  };

  const scheduleClose = () => {
    invalidateCloseTimer();
    const duration = hooks.getDuration();
    if (!shouldScheduleToastClose(duration)) return;

    const scheduledGeneration = generation;
    closeTimer = setTimeout(() => {
      closeTimer = null;
      if (isDisposed() || generation !== scheduledGeneration) return;
      requestClose();
    }, duration);
  };

  const syncVisibility = (nextVisible: boolean) => {
    if (isDisposed() || nextVisible === visible) return;

    invalidateCloseTimer();
    visible = nextVisible;

    if (nextVisible) {
      phase = 'open';
      hooks.onOpen();
      if (!isDisposed() && visible && phase === 'open') scheduleClose();
      return;
    }

    phase = 'leaving';
    hooks.onClose();
  };

  const reschedule = () => {
    if (isDisposed() || !visible || phase !== 'open') return;
    scheduleClose();
  };

  const finishLeave = () => {
    if (isDisposed() || visible || phase !== 'leaving') return;

    phase = 'left';
    hooks.onAfterLeave();
  };

  const dispose = () => {
    if (isDisposed()) return;
    invalidateCloseTimer();
    visible = false;
    phase = 'disposed';
  };

  return {
    syncVisibility,
    requestClose,
    reschedule,
    finishLeave,
    dispose,
  };
}

/** Processes every source edge synchronously after Vue has delivered it to this component. */
export function watchToastLifecycle(
  lifecycle: ToastLifecycleController,
  sources: ToastLifecycleSources
): () => void {
  const stopVisibility = watch(sources.visible, visible => lifecycle.syncVisibility(visible), {
    immediate: true,
    flush: 'sync',
  });
  const stopDuration = watch(sources.duration, () => lifecycle.reschedule(), { flush: 'sync' });

  return () => {
    stopDuration();
    stopVisibility();
  };
}
