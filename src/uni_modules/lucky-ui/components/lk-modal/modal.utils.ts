import type { StyleValue } from 'vue';
import {
  ANIMATION_PRESETS,
  type TransitionConfig,
  type TransitionName,
} from '@/uni_modules/lucky-ui/composables/useTransition';
import type { ModalBeforeConfirm } from './modal.props';

export function resolveModalText(options: { value: string; fallback: string }): string {
  return options.value || options.fallback;
}

export function resolveModalTransitionConfig(options: {
  animationType?: TransitionConfig['name'];
  animation: keyof typeof ANIMATION_PRESETS;
  duration?: number;
  delay?: number;
  easing?: TransitionConfig['easing'];
}): TransitionConfig {
  if (options.animationType) {
    return {
      name: options.animationType,
      duration: options.duration,
      delay: options.delay,
      easing: options.easing,
    };
  }

  const preset = ANIMATION_PRESETS[options.animation] || ANIMATION_PRESETS.scale;
  return {
    name: preset.animation,
    duration: options.duration ?? preset.duration,
    delay: options.delay ?? preset.delay ?? 0,
    easing: options.easing ?? preset.easing,
  };
}

export function resolveModalTransitionName(config: TransitionConfig): TransitionName {
  return typeof config.name === 'string' ? (config.name as TransitionName) : 'fade';
}

export function resolveModalTransitionDuration(config: TransitionConfig): number {
  return typeof config.duration === 'number' ? config.duration : 300;
}

export function resolveModalTransitionDelay(config: TransitionConfig): number {
  return typeof config.delay === 'number' ? config.delay : 0;
}

export function resolveModalTransitionEasing(config: TransitionConfig): string {
  return typeof config.easing === 'string' ? config.easing : 'ease';
}

export function shouldModalHeaderRender(options: {
  showHeader: boolean;
  title: string;
  showClose: boolean;
  hasHeaderSlot: boolean;
}): boolean {
  return options.showHeader && Boolean(options.title || options.showClose || options.hasHeaderSlot);
}

export function resolveModalRootStyle(zIndex: number): StyleValue {
  return { zIndex: zIndex + 1 };
}

export function resolveModalPanelStyle(options: {
  transitionStyles: StyleValue;
  width: string;
  customStyle?: StyleValue;
}): StyleValue {
  return [
    options.customStyle || '',
    {
      ...(options.transitionStyles as Record<string, unknown>),
      width: options.width,
    },
  ] as StyleValue;
}

export function resolveModalHeaderClass(titleAlign: string) {
  return [`is-title-${titleAlign}`];
}

export function resolveModalFooterClass(options: { footerType: string; showCancel: boolean }) {
  return [`is-footer-${options.footerType}`, { 'has-cancel': options.showCancel }];
}

export interface ModalActionState {
  visible: boolean;
  leaving: boolean;
  confirming: boolean;
  closeRequested: boolean;
}

export function canTriggerModalAction(state: ModalActionState): boolean {
  return state.visible && !state.leaving && !state.confirming && !state.closeRequested;
}

export function shouldCloseModalOnOverlay(
  options: ModalActionState & {
    closeOnOverlay: boolean;
  }
): boolean {
  return options.closeOnOverlay && canTriggerModalAction(options);
}

export type ModalConfirmResult = 'confirmed' | 'cancelled' | 'rejected' | 'stale' | 'blocked';

export interface ModalActionControllerOptions {
  isVisible: () => boolean;
  isLeaving: () => boolean;
  isConfirming: () => boolean;
  setConfirming: (value: boolean) => void;
  isCloseRequested: () => boolean;
  setCloseRequested: (value: boolean) => void;
  getBeforeConfirm: () => ModalBeforeConfirm | null;
  onUpdateModelValue: (value: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onClickOverlay: () => void;
  onClickClose: () => void;
}

export interface ModalActionController {
  canAct: () => boolean;
  shouldCloseOnOverlay: (closeOnOverlay: boolean) => boolean;
  clickOverlay: () => boolean;
  closeFromOverlay: () => boolean;
  cancel: () => boolean;
  clickClose: () => boolean;
  confirm: () => Promise<ModalConfirmResult>;
  syncVisibility: () => void;
  destroy: () => void;
}

export function createModalActionController(
  options: ModalActionControllerOptions
): ModalActionController {
  let confirmAttempt = 0;

  const currentState = (): ModalActionState => ({
    visible: options.isVisible(),
    leaving: options.isLeaving(),
    confirming: options.isConfirming(),
    closeRequested: options.isCloseRequested(),
  });

  const canAct = () => canTriggerModalAction(currentState());

  const releaseIgnoredCloseRequest = () => {
    Promise.resolve().then(() => {
      if (options.isVisible() && !options.isLeaving()) {
        options.setCloseRequested(false);
      }
    });
  };

  const requestClose = (beforeUpdate?: () => void): boolean => {
    if (!canAct()) return false;

    options.setCloseRequested(true);
    beforeUpdate?.();
    options.onUpdateModelValue(false);
    releaseIgnoredCloseRequest();
    return true;
  };

  const finishConfirm = (
    attempt: number,
    allowed: boolean,
    rejected: boolean
  ): ModalConfirmResult => {
    if (attempt !== confirmAttempt) return 'stale';

    if (!options.isVisible()) {
      options.setConfirming(false);
      return 'stale';
    }

    options.setConfirming(false);
    if (rejected) return 'rejected';
    if (!allowed) return 'cancelled';

    return requestClose(options.onConfirm) ? 'confirmed' : 'blocked';
  };

  const invalidatePendingConfirm = () => {
    confirmAttempt += 1;
    options.setConfirming(false);
    options.setCloseRequested(false);
  };

  return {
    canAct,
    shouldCloseOnOverlay(closeOnOverlay) {
      return shouldCloseModalOnOverlay({
        ...currentState(),
        closeOnOverlay,
      });
    },
    clickOverlay() {
      if (!canAct()) return false;
      options.onClickOverlay();
      return true;
    },
    closeFromOverlay() {
      return requestClose();
    },
    cancel() {
      return requestClose(options.onCancel);
    },
    clickClose() {
      return requestClose(options.onClickClose);
    },
    confirm() {
      if (!canAct()) return Promise.resolve('blocked');

      const beforeConfirm = options.getBeforeConfirm();
      if (!beforeConfirm) {
        return Promise.resolve(requestClose(options.onConfirm) ? 'confirmed' : 'blocked');
      }

      const attempt = ++confirmAttempt;
      options.setConfirming(true);

      let result: boolean | Promise<boolean>;
      try {
        result = beforeConfirm();
      } catch {
        return Promise.resolve(finishConfirm(attempt, false, true));
      }

      return Promise.resolve(result).then(
        allowed => finishConfirm(attempt, allowed, false),
        () => finishConfirm(attempt, false, true)
      );
    },
    syncVisibility: invalidatePendingConfirm,
    destroy: invalidatePendingConfirm,
  };
}
