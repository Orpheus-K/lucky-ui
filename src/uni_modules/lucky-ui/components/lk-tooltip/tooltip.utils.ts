import {
  ANIMATION_PRESETS,
  type TransitionConfig,
} from '@/uni_modules/lucky-ui/composables/useTransition';
import type { TooltipPlacement, TooltipTrigger } from './tooltip.props';

type TooltipRect = Record<'top' | 'right' | 'bottom' | 'left', number>;
type TooltipOpenTrigger = TooltipTrigger | 'default';

export function resolveTooltipOpen(options: {
  always: boolean;
  modelValue: boolean | undefined;
  innerOpen: boolean;
}): boolean {
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
  return !options.disabled && !options.always && options.currentOpen !== options.nextOpen;
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
}): boolean {
  if (options.always) return false;
  if (options.trigger === 'click') return true;
  return !options.supportsHover && options.trigger === 'hover';
}

export function shouldKeepTooltipContentHover(options: {
  always: boolean;
  trigger: TooltipTrigger;
}): boolean {
  return !options.always && options.trigger === 'hover';
}

export function createTooltipPayload(options: {
  trigger: TooltipOpenTrigger | 'disabled' | 'content';
  event?: unknown;
}) {
  return {
    trigger: options.trigger,
    event: options.event,
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

function resolveTooltipDefaultMotion(placement: TooltipPlacement): Pick<
  TransitionConfig,
  'enterFrom' | 'enterTo' | 'leaveFrom' | 'leaveTo'
> {
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
