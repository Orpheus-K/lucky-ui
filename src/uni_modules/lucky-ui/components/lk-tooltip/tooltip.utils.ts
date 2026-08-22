import {
  ANIMATION_PRESETS,
  type TransitionConfig,
} from '@/uni_modules/lucky-ui/composables/useTransition';
import type { TooltipPlacement, TooltipTrigger } from './tooltip.props';

type TooltipRect = Record<'top' | 'right' | 'bottom' | 'left', number>;
export type TooltipOpenTrigger = TooltipTrigger | 'default';
export type TooltipCloseTrigger = TooltipOpenTrigger | 'disabled' | 'content';
export type TooltipVisibilityTrigger = TooltipCloseTrigger | 'external';

export interface TooltipVisibilityPayload {
  trigger: TooltipVisibilityTrigger;
  event?: unknown;
}

export interface TooltipVisibilityConfig {
  always: boolean;
  disabled: boolean;
  modelValue: boolean | undefined;
  trigger: TooltipTrigger;
}

export function resolveTooltipOpen(options: {
  always: boolean;
  disabled: boolean;
  modelValue: boolean | undefined;
  innerOpen: boolean;
}): boolean {
  if (options.disabled) return false;
  if (options.always) return true;
  return options.modelValue === undefined ? options.innerOpen : options.modelValue;
}

export function canMutateTooltipOpen(always: boolean): boolean {
  return !always;
}

export function canUpdateTooltipOpen(options: {
  disabled: boolean;
  always: boolean;
  currentOpen: boolean;
  nextOpen: boolean;
}): boolean {
  return (
    !options.always &&
    (!options.disabled || !options.nextOpen) &&
    options.currentOpen !== options.nextOpen
  );
}

export function shouldOpenTooltipOnTriggerEnter(options: {
  supportsHover: boolean;
  always: boolean;
  trigger: TooltipTrigger;
}): boolean {
  return options.supportsHover && !options.always && options.trigger === 'hover';
}

export function shouldToggleTooltipOnTriggerClick(options: {
  always: boolean;
  trigger: TooltipTrigger;
  supportsHover: boolean;
  touchLike?: boolean;
}): boolean {
  if (options.always) return false;
  if (options.trigger === 'click') return true;
  return options.trigger === 'hover' && (!options.supportsHover || options.touchLike === true);
}

export function shouldKeepTooltipContentHover(options: {
  always: boolean;
  trigger: TooltipTrigger;
}): boolean {
  return !options.always && options.trigger === 'hover';
}

export function createTooltipPayload(options: {
  trigger: TooltipVisibilityTrigger;
  event?: unknown;
}): TooltipVisibilityPayload {
  return {
    trigger: options.trigger,
    event: options.event,
  };
}

export function isTooltipTouchLikeEvent(
  event: unknown,
  options: { recentTouchAt?: number; now?: number; maxAge?: number } = {}
): boolean {
  const candidate = (event && typeof event === 'object' ? event : {}) as {
    pointerType?: unknown;
    touches?: unknown;
    changedTouches?: unknown;
    detail?: { pointerType?: unknown; source?: unknown };
    sourceCapabilities?: { firesTouchEvents?: unknown };
  };
  const pointerType = candidate.pointerType ?? candidate.detail?.pointerType;
  if (pointerType === 'touch' || pointerType === 'pen') return true;
  if (candidate.detail?.source === 'touch') return true;
  if (candidate.sourceCapabilities?.firesTouchEvents === true) return true;
  const touches = candidate.touches as { length?: unknown } | undefined;
  const changedTouches = candidate.changedTouches as { length?: unknown } | undefined;
  if (
    (typeof touches?.length === 'number' && touches.length > 0) ||
    (typeof changedTouches?.length === 'number' && changedTouches.length > 0)
  ) {
    return true;
  }
  if (options.recentTouchAt === undefined) return false;
  const age = (options.now ?? Date.now()) - options.recentTouchAt;
  return age >= 0 && age <= (options.maxAge ?? 1000);
}

export interface TooltipVisibilityController {
  resolveOpen: () => boolean;
  getRequestedOpen: () => boolean;
  request: (nextOpen: boolean, trigger: TooltipVisibilityTrigger, event?: unknown) => boolean;
  setDefaultOpen: () => boolean;
  scheduleOpen: (trigger: TooltipOpenTrigger, event: unknown, delay: number) => void;
  scheduleClose: (trigger: TooltipCloseTrigger, event: unknown, delay: number) => void;
  cancelShow: () => void;
  cancelHide: () => void;
  cancelTimers: () => void;
  sync: (fallbackTrigger?: TooltipVisibilityTrigger) => void;
  destroy: () => void;
  getTimerCount: () => number;
}

/**
 * 将“请求开闭”与“真实可见边沿”分开。
 * 受控父级拒绝 update 时不会伪造 show/open；禁用则始终撤销可见状态与延迟任务。
 */
export function createTooltipVisibilityController(options: {
  getConfig: () => TooltipVisibilityConfig;
  getInnerOpen: () => boolean;
  setInnerOpen: (value: boolean) => void;
  onUpdate: (value: boolean) => void;
  onVisibilityChange: (open: boolean, payload: TooltipVisibilityPayload) => void;
  defer?: (callback: () => void) => void;
}): TooltipVisibilityController {
  const defer = options.defer || (callback => void Promise.resolve().then(callback));
  let lastDisabled = options.getConfig().disabled;
  let lastModelValue = options.getConfig().modelValue;
  let lastResolvedOpen = resolveCurrentOpen();
  let pending:
    | { generation: number; nextOpen: boolean; payload: TooltipVisibilityPayload }
    | undefined;
  let requestGeneration = 0;
  let showTimer: ReturnType<typeof setTimeout> | undefined;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;
  let destroyed = false;
  let syncing = false;
  let syncAgain = false;
  let disabledCloseRequested = false;

  function resolveCurrentOpen(disabled = options.getConfig().disabled): boolean {
    const config = options.getConfig();
    return resolveTooltipOpen({
      always: config.always,
      disabled,
      modelValue: config.modelValue,
      innerOpen: options.getInnerOpen(),
    });
  }

  function cancelShow() {
    if (showTimer === undefined) return;
    clearTimeout(showTimer);
    showTimer = undefined;
  }

  function cancelHide() {
    if (hideTimer === undefined) return;
    clearTimeout(hideTimer);
    hideTimer = undefined;
  }

  function cancelTimers() {
    cancelShow();
    cancelHide();
  }

  function reconcile(fallbackTrigger: TooltipVisibilityTrigger) {
    const nextOpen = resolveCurrentOpen();
    if (nextOpen === lastResolvedOpen) return;
    lastResolvedOpen = nextOpen;
    const matchedPending = pending?.nextOpen === nextOpen ? pending : undefined;
    const payload = matchedPending?.payload || createTooltipPayload({ trigger: fallbackTrigger });
    if (pending) pending = undefined;
    options.onVisibilityChange(nextOpen, payload);
  }

  function sync(fallbackTrigger: TooltipVisibilityTrigger = 'external') {
    if (destroyed) return;
    if (syncing) {
      syncAgain = true;
      return;
    }

    syncing = true;
    try {
      do {
        syncAgain = false;
        const config = options.getConfig();
        const becameDisabled = config.disabled && !lastDisabled;
        const modelChanged = !Object.is(config.modelValue, lastModelValue);
        lastDisabled = config.disabled;
        lastModelValue = config.modelValue;

        if (!config.disabled) disabledCloseRequested = false;
        if (config.disabled || config.always) cancelTimers();
        if (config.disabled && !config.always) {
          const hadPendingClose = pending?.nextOpen === false;
          const pendingOpen = pending?.nextOpen === true;
          const receivedControlledOpen = config.modelValue === true && modelChanged;
          const shouldRevoke =
            (becameDisabled && resolveCurrentOpen(false)) || pendingOpen || receivedControlledOpen;
          if (shouldRevoke) {
            const generation = ++requestGeneration;
            pending = {
              generation,
              nextOpen: false,
              payload: createTooltipPayload({ trigger: 'disabled' }),
            };
            if (
              receivedControlledOpen ||
              (!hadPendingClose && (!disabledCloseRequested || pendingOpen))
            ) {
              options.onUpdate(false);
            }
            disabledCloseRequested = true;
            if (config.modelValue === undefined) options.setInnerOpen(false);
          }
        }

        reconcile(becameDisabled ? 'disabled' : fallbackTrigger);
      } while (syncAgain && !destroyed);
    } finally {
      syncing = false;
    }
  }

  function settleRejectedRequest(generation: number) {
    if (destroyed || pending?.generation !== generation) return;
    pending = undefined;
  }

  function request(nextOpen: boolean, trigger: TooltipVisibilityTrigger, event?: unknown): boolean {
    if (destroyed) return false;
    sync();
    cancelTimers();
    const config = options.getConfig();
    const currentRequestedOpen = pending?.nextOpen ?? resolveCurrentOpen();
    if (
      !canUpdateTooltipOpen({
        disabled: config.disabled,
        always: config.always,
        currentOpen: currentRequestedOpen,
        nextOpen,
      })
    ) {
      return false;
    }

    const generation = ++requestGeneration;
    pending = {
      generation,
      nextOpen,
      payload: createTooltipPayload({ trigger, event }),
    };
    if (nextOpen) cancelHide();
    else cancelShow();
    options.onUpdate(nextOpen);
    if (config.modelValue === undefined) options.setInnerOpen(nextOpen);
    sync();
    defer(() => settleRejectedRequest(generation));
    return true;
  }

  function setDefaultOpen(): boolean {
    if (destroyed) return false;
    const config = options.getConfig();
    if (
      config.modelValue !== undefined ||
      !canUpdateTooltipOpen({
        disabled: config.disabled,
        always: config.always,
        currentOpen: resolveCurrentOpen(),
        nextOpen: true,
      })
    ) {
      return false;
    }
    pending = {
      generation: ++requestGeneration,
      nextOpen: true,
      payload: createTooltipPayload({ trigger: 'default' }),
    };
    options.setInnerOpen(true);
    sync();
    return true;
  }

  function scheduleOpen(trigger: TooltipOpenTrigger, event: unknown, delay: number) {
    if (destroyed) return;
    sync();
    cancelHide();
    cancelShow();
    const config = options.getConfig();
    if (config.disabled || config.always) return;
    showTimer = setTimeout(
      () => {
        showTimer = undefined;
        request(true, trigger, event);
      },
      Math.max(0, delay)
    );
  }

  function scheduleClose(trigger: TooltipCloseTrigger, event: unknown, delay: number) {
    if (destroyed) return;
    sync();
    cancelShow();
    cancelHide();
    const config = options.getConfig();
    if (config.disabled || config.always) return;
    hideTimer = setTimeout(
      () => {
        hideTimer = undefined;
        request(false, trigger, event);
      },
      Math.max(0, delay)
    );
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cancelTimers();
    pending = undefined;
  }

  return {
    resolveOpen: resolveCurrentOpen,
    getRequestedOpen: () => pending?.nextOpen ?? resolveCurrentOpen(),
    request,
    setDefaultOpen,
    scheduleOpen,
    scheduleClose,
    cancelShow,
    cancelHide,
    cancelTimers,
    sync,
    destroy,
    getTimerCount: () => Number(showTimer !== undefined) + Number(hideTimer !== undefined),
  };
}

export function getFallbackPlacement(
  current: TooltipPlacement,
  rect: TooltipRect,
  viewportWidth: number,
  viewportHeight: number
): TooltipPlacement {
  const edge = 12;
  const overflowTop = rect.top < edge;
  const overflowBottom = rect.bottom > viewportHeight - edge;
  const overflowLeft = rect.left < edge;
  const overflowRight = rect.right > viewportWidth - edge;

  if (current === 'top' && overflowTop) return 'bottom';
  if (current === 'bottom' && overflowBottom) return 'top';
  if (current === 'left' && overflowLeft) return 'right';
  if (current === 'right' && overflowRight) return 'left';

  if (overflowTop && !overflowBottom) return 'bottom';
  if (overflowBottom && !overflowTop) return 'top';
  if (overflowLeft && !overflowRight) return 'right';
  if (overflowRight && !overflowLeft) return 'left';

  return current;
}

export function resolveTooltipPlacementClass(placement: TooltipPlacement): string {
  return `is-${placement}`;
}

export function resolveTooltipPopStyle(options: {
  offset: number;
  zIndex: number;
  width: number | string | undefined;
}) {
  const style: Record<string, string | number> = {
    '--lk-tooltip-offset': `${options.offset}rpx`,
    zIndex: options.zIndex,
  };
  if (options.width !== undefined && options.width !== null && options.width !== '') {
    style.width = typeof options.width === 'number' ? `${options.width}rpx` : String(options.width);
  }
  return style;
}

const defaultMotionByPlacement: Record<TooltipPlacement, string> = {
  top: 'translate3d(0, calc(var(--lk-rpx-8) * -1), 0)',
  bottom: 'translate3d(0, var(--lk-rpx-8), 0)',
  left: 'translate3d(var(--lk-rpx-8), 0, 0)',
  right: 'translate3d(calc(var(--lk-rpx-8) * -1), 0, 0)',
};
const tooltipRestTransform = 'translate3d(0, 0, 0)';

function resolveTooltipDefaultMotion(
  placement: TooltipPlacement
): Pick<TransitionConfig, 'enterFrom' | 'enterTo' | 'leaveFrom' | 'leaveTo'> {
  const hiddenTransform = defaultMotionByPlacement[placement];
  return {
    enterFrom: {
      opacity: 0,
      transform: hiddenTransform,
    },
    enterTo: {
      opacity: 1,
      transform: tooltipRestTransform,
    },
    leaveFrom: {
      opacity: 1,
      transform: tooltipRestTransform,
    },
    leaveTo: {
      opacity: 0,
      transform: hiddenTransform,
    },
  };
}

export function resolveTooltipTransitionConfig(options: {
  animationType: TransitionConfig['name'] | undefined;
  animation: keyof typeof ANIMATION_PRESETS | undefined;
  placement: TooltipPlacement;
  duration: number;
  delay: number;
  easing: TransitionConfig['easing'];
}): TransitionConfig {
  if (options.animationType) {
    return {
      name: options.animationType,
      duration: options.duration,
      delay: options.delay,
      easing: options.easing,
    };
  }

  if (options.animation && ANIMATION_PRESETS[options.animation]) {
    const preset = ANIMATION_PRESETS[options.animation];
    return {
      name: preset.animation,
      duration: options.duration ?? preset.duration ?? 220,
      delay: options.delay ?? preset.delay ?? 0,
      easing: options.easing ?? preset.easing ?? 'ease-out-cubic',
    };
  }

  return {
    name: 'fade',
    duration: options.duration,
    delay: options.delay,
    easing: options.easing,
    ...resolveTooltipDefaultMotion(options.placement),
  };
}
