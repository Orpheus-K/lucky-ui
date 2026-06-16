import type { StyleValue } from 'vue';
import {
  ANIMATION_PRESETS,
  type TransitionConfig,
} from '@/uni_modules/lucky-ui/composables/useTransition';
import type {
  DropdownPlacement,
  DropdownSelectPayload,
  DropdownTrigger,
  DropdownValue,
} from './dropdown.props';

export function resolveDropdownRootStyle(customStyle: StyleValue): StyleValue {
  return customStyle;
}

export function resolveDropdownRootClass(options: {
  placement: DropdownPlacement;
  customClass: unknown;
}) {
  return [`lk-dropdown--placement-${options.placement}`, options.customClass];
}

export function resolveDropdownNextOpen(options: {
  targetOpen?: boolean;
  currentOpen: boolean;
}): boolean {
  return options.targetOpen !== undefined ? options.targetOpen : !options.currentOpen;
}

export function shouldToggleDropdownOnHover(trigger: DropdownTrigger): boolean {
  return trigger === 'hover';
}

export function shouldToggleDropdownOnClick(trigger: DropdownTrigger): boolean {
  return trigger === 'click';
}

export function shouldCloseDropdownOnSelect(closeOnSelect: boolean): boolean {
  return closeOnSelect;
}

export function shouldRenderDropdownMask(options: {
  display: boolean;
  trigger: DropdownTrigger;
  closeOnClickOutside: boolean;
}): boolean {
  return options.display && options.trigger === 'click' && options.closeOnClickOutside;
}

export function resolveDropdownMaskStyle(zIndex: number): StyleValue {
  return { zIndex };
}

export function resolveDropdownMenuStyle(options: {
  transitionStyles: StyleValue;
  zIndex: number;
}): StyleValue {
  return [options.transitionStyles, { zIndex: options.zIndex + 2 }];
}

const defaultTransitionByPlacement: Record<
  DropdownPlacement,
  NonNullable<TransitionConfig['name']>
> = {
  bottom: 'fade-up',
  top: 'fade-down',
  left: 'fade-right',
  right: 'fade-left',
};

export function resolveDropdownTransitionConfig(options: {
  animationType: TransitionConfig['name'] | undefined;
  animation: keyof typeof ANIMATION_PRESETS | undefined;
  placement: DropdownPlacement;
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
      duration: options.duration ?? preset.duration ?? 180,
      delay: options.delay ?? preset.delay ?? 0,
      easing: options.easing ?? preset.easing ?? 'ease-out',
    };
  }

  return {
    name: defaultTransitionByPlacement[options.placement] || 'fade',
    duration: options.duration,
    delay: options.delay,
    easing: options.easing,
  };
}

export function resolveDropdownItemActive(options: {
  activeValue: DropdownValue | undefined;
  name: DropdownValue;
}): boolean {
  return options.activeValue === options.name;
}

export function resolveDropdownItemClass(options: {
  active: boolean;
  disabled: boolean;
  customClass?: unknown;
}) {
  return [
    {
      'is-active': options.active,
      'is-disabled': options.disabled,
    },
    options.customClass,
  ];
}

export function createDropdownItemPayload(options: {
  name: DropdownValue;
  event?: unknown;
}): DropdownSelectPayload {
  return {
    name: options.name,
    event: options.event,
  };
}

export function canSelectDropdownItem(disabled: boolean): boolean {
  return !disabled;
}
