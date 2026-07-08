import type { StyleValue } from 'vue';
import {
  ANIMATION_PRESETS,
  type TransitionConfig,
} from '@/uni_modules/lucky-ui/composables/useTransition';
import { addUnit } from '@/uni_modules/lucky-ui/core/src/utils/unit';
import type {
  DropdownMenuAlign,
  DropdownPlacement,
  DropdownSelectPayload,
  DropdownTrigger,
  DropdownValue,
} from './dropdown.props';

export type DropdownRect = Record<'top' | 'right' | 'bottom' | 'left' | 'width' | 'height', number>;
type DropdownSizeValue = string | number | undefined;

const DESIGN_WIDTH_RPX = 750;

function toDropdownRpx(value: number, viewportWidth: number): string {
  const baseWidth = viewportWidth > 0 ? viewportWidth : DESIGN_WIDTH_RPX;
  const next = (value * DESIGN_WIDTH_RPX) / baseWidth;
  const rounded = Number.isInteger(next) ? next : Number(next.toFixed(2));
  return `${rounded}rpx`;
}

export function resolveDropdownRootStyle(customStyle: StyleValue): StyleValue {
  return customStyle;
}

export function resolveDropdownRootClass(options: {
  placement: DropdownPlacement;
  menuAlign: DropdownMenuAlign;
  customClass: unknown;
}) {
  return [
    `lk-dropdown--placement-${options.placement}`,
    `lk-dropdown--align-${options.menuAlign}`,
    options.customClass,
  ];
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
  lockScroll: boolean;
}): boolean {
  return (
    options.display &&
    options.trigger === 'click' &&
    options.closeOnClickOutside &&
    options.lockScroll
  );
}

export function resolveDropdownMaskStyle(zIndex: number): StyleValue {
  return { zIndex };
}

export function shouldTeleportDropdown(teleport: unknown): boolean {
  return teleport !== false;
}

export function resolveDropdownTeleportTarget(teleport: unknown): unknown {
  if (teleport === true || teleport === undefined || teleport === '') return 'body';
  return teleport;
}

export function resolveDropdownTeleportedMenuPosition(options: {
  placement: DropdownPlacement;
  menuAlign: DropdownMenuAlign;
  triggerRect: DropdownRect | null;
  viewportWidth: number;
  viewportHeight: number;
}): StyleValue {
  const base = {
    position: 'fixed' as const,
    margin: '0rpx',
  };
  if (!options.triggerRect) {
    return {
      ...base,
      left: '-9999rpx',
      top: '-9999rpx',
      visibility: 'hidden' as const,
    };
  }

  const gap = 'var(--lk-spacing-xs)';
  const rect = options.triggerRect;
  const rpx = (value: number) => toDropdownRpx(value, options.viewportWidth);
  const endAligned = options.menuAlign === 'end';
  switch (options.placement) {
    case 'top':
      return {
        ...base,
        ...(endAligned
          ? { right: rpx(options.viewportWidth - rect.right) }
          : { left: rpx(rect.left) }),
        bottom: `calc(${rpx(options.viewportHeight - rect.top)} + ${gap})`,
      };
    case 'left':
      return {
        ...base,
        ...(endAligned
          ? { bottom: rpx(options.viewportHeight - rect.bottom) }
          : { top: rpx(rect.top) }),
        right: `calc(${rpx(options.viewportWidth - rect.left)} + ${gap})`,
      };
    case 'right':
      return {
        ...base,
        ...(endAligned
          ? { bottom: rpx(options.viewportHeight - rect.bottom) }
          : { top: rpx(rect.top) }),
        left: `calc(${rpx(rect.right)} + ${gap})`,
      };
    case 'bottom':
    default:
      return {
        ...base,
        ...(endAligned
          ? { right: rpx(options.viewportWidth - rect.right) }
          : { left: rpx(rect.left) }),
        top: `calc(${rpx(rect.bottom)} + ${gap})`,
      };
  }
}

export function resolveDropdownMenuStyle(options: {
  transitionStyles: StyleValue;
  zIndex: number;
  teleported?: boolean;
  placement?: DropdownPlacement;
  menuAlign?: DropdownMenuAlign;
  triggerRect?: DropdownRect | null;
  viewportWidth?: number;
  viewportHeight?: number;
  menuWidth?: DropdownSizeValue;
  menuMinWidth?: DropdownSizeValue;
  menuMaxWidth?: DropdownSizeValue;
  menuFitContent?: boolean;
}): StyleValue {
  const menuAlign = options.menuAlign ?? 'start';
  const styles: StyleValue[] = [
    options.transitionStyles,
    {
      zIndex: options.zIndex + 2,
      ...resolveDropdownTransitionVars(options.placement, menuAlign),
      ...resolveDropdownMenuSizeVars({
        menuWidth: options.menuWidth,
        menuMinWidth: options.menuMinWidth,
        menuMaxWidth: options.menuMaxWidth,
        menuFitContent: options.menuFitContent,
      }),
    },
  ];
  if (options.teleported && options.placement) {
    styles.push(
      resolveDropdownTeleportedMenuPosition({
        placement: options.placement,
        menuAlign,
        triggerRect: options.triggerRect ?? null,
        viewportWidth: options.viewportWidth ?? 0,
        viewportHeight: options.viewportHeight ?? 0,
      })
    );
  }
  return styles;
}

export function resolveDropdownMenuSizeVars(options: {
  menuWidth?: DropdownSizeValue;
  menuMinWidth?: DropdownSizeValue;
  menuMaxWidth?: DropdownSizeValue;
  menuFitContent?: boolean;
}): Record<string, string> {
  const vars: Record<string, string> = {};
  const menuWidth = addUnit(options.menuWidth);
  const menuMinWidth = addUnit(options.menuMinWidth);
  const menuMaxWidth = addUnit(options.menuMaxWidth);

  if (options.menuFitContent) {
    vars['--lk-dropdown-menu-width'] = 'auto';
    vars['--lk-dropdown-menu-min-width'] = '0rpx';
  }
  if (menuWidth) {
    vars['--lk-dropdown-menu-width'] = menuWidth;
    if (!menuMinWidth) vars['--lk-dropdown-menu-min-width'] = menuWidth;
  }
  if (menuMinWidth) vars['--lk-dropdown-menu-min-width'] = menuMinWidth;
  if (menuMaxWidth) vars['--lk-dropdown-menu-max-width'] = menuMaxWidth;

  return vars;
}

export function resolveDropdownTransitionVars(
  placement: DropdownPlacement | undefined,
  menuAlign: DropdownMenuAlign = 'start'
): Record<string, string> {
  if (!placement) return {};

  const endAligned = menuAlign === 'end';
  switch (placement) {
    case 'top':
      return {
        '--lk-transition-origin': endAligned ? 'bottom right' : 'bottom left',
        '--lk-dropdown-transition-y': '8rpx',
      };
    case 'left':
      return {
        '--lk-transition-origin': endAligned ? 'bottom right' : 'top right',
        '--lk-dropdown-transition-x': '8rpx',
        '--lk-dropdown-transition-y': '0rpx',
      };
    case 'right':
      return {
        '--lk-transition-origin': endAligned ? 'bottom left' : 'top left',
        '--lk-dropdown-transition-x': '-8rpx',
        '--lk-dropdown-transition-y': '0rpx',
      };
    case 'bottom':
    default:
      return {
        '--lk-transition-origin': endAligned ? 'top right' : 'top left',
        '--lk-dropdown-transition-y': '-8rpx',
      };
  }
}

const defaultTransitionByPlacement: Record<
  DropdownPlacement,
  NonNullable<TransitionConfig['name']>
> = {
  bottom: 'dropdown',
  top: 'dropdown',
  left: 'dropdown',
  right: 'dropdown',
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
  selectable?: boolean;
}): boolean {
  if (options.selectable === false) return false;
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

export function resolveDropdownItemStyle(options: {
  customStyle: StyleValue;
  width?: DropdownSizeValue;
}): StyleValue {
  const width = addUnit(options.width);
  if (!width) return options.customStyle;
  return [options.customStyle, { width }];
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
