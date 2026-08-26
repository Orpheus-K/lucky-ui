import { describe, expect, it } from 'vitest';
import { ANIMATION_PRESETS } from '../../src/uni_modules/lucky-ui/composables/useTransition';
import {
  canSelectDropdownItem,
  createDropdownItemPayload,
  resolveDropdownItemActive,
  resolveDropdownItemClass,
  resolveDropdownItemStyle,
  resolveDropdownMaskStyle,
  resolveDropdownMenuSizeVars,
  resolveDropdownMenuStyle,
  resolveDropdownNextOpen,
  resolveDropdownRootClass,
  resolveDropdownRootStyle,
  resolveDropdownTeleportedMenuPosition,
  resolveDropdownTeleportTarget,
  resolveDropdownTransitionVars,
  resolveDropdownTransitionConfig,
  shouldCloseDropdownOnSelect,
  shouldRenderDropdownMask,
  shouldTeleportDropdown,
  shouldToggleDropdownOnClick,
  shouldToggleDropdownOnHover,
} from '../../src/uni_modules/lucky-ui/components/lk-dropdown/dropdown.utils';

describe('lk-dropdown open and item rules', () => {
  it('resolves root class/style and next open state', () => {
    expect(resolveDropdownRootClass({
      placement: 'bottom',
      menuAlign: 'start',
      customClass: 'custom',
    })).toEqual(['lk-dropdown--placement-bottom', 'lk-dropdown--align-start', 'custom']);
    expect(resolveDropdownRootClass({
      placement: 'bottom',
      menuAlign: 'end',
      customClass: 'custom',
    })).toEqual(['lk-dropdown--placement-bottom', 'lk-dropdown--align-end', 'custom']);

    const style = { marginTop: '8rpx' };
    expect(resolveDropdownRootStyle(style)).toBe(style);
    expect(resolveDropdownNextOpen({
      currentOpen: false,
    })).toBe(true);
    expect(resolveDropdownNextOpen({
      targetOpen: false,
      currentOpen: true,
    })).toBe(false);
  });

  it('guards hover, click, mask and select close behavior', () => {
    expect(shouldToggleDropdownOnHover('hover')).toBe(true);
    expect(shouldToggleDropdownOnHover('click')).toBe(false);
    expect(shouldToggleDropdownOnClick('click')).toBe(true);
    expect(shouldToggleDropdownOnClick('hover')).toBe(false);
    expect(shouldCloseDropdownOnSelect(true)).toBe(true);
    expect(shouldCloseDropdownOnSelect(false)).toBe(false);

    expect(shouldRenderDropdownMask({
      display: true,
      trigger: 'click',
      closeOnClickOutside: true,
      lockScroll: true,
    })).toBe(true);
    expect(shouldRenderDropdownMask({
      display: true,
      trigger: 'hover',
      closeOnClickOutside: true,
      lockScroll: true,
    })).toBe(false);
    expect(shouldRenderDropdownMask({
      display: true,
      trigger: 'click',
      closeOnClickOutside: true,
      lockScroll: false,
    })).toBe(false);
    expect(resolveDropdownMaskStyle(500)).toEqual({ zIndex: 500 });
  });

  it('builds menu style and transition config', () => {
    const transitionStyles = { opacity: 1 };
    expect(resolveDropdownMenuStyle({
      transitionStyles,
      zIndex: 500,
    })).toEqual([transitionStyles, { zIndex: 502 }]);
    expect(resolveDropdownMenuSizeVars({
      menuFitContent: true,
    })).toEqual({
      '--lk-dropdown-menu-width': 'auto',
      '--lk-dropdown-menu-min-width': '0rpx',
    });
    expect(resolveDropdownMenuSizeVars({
      menuWidth: 240,
    })).toEqual({
      '--lk-dropdown-menu-width': '240rpx',
      '--lk-dropdown-menu-min-width': '240rpx',
    });
    expect(resolveDropdownMenuSizeVars({
      menuWidth: '18em',
      menuMinWidth: 160,
      menuMaxWidth: 'calc(100vw - 32rpx)',
    })).toEqual({
      '--lk-dropdown-menu-width': '18em',
      '--lk-dropdown-menu-min-width': '160rpx',
      '--lk-dropdown-menu-max-width': 'calc(100vw - 32rpx)',
    });
    expect(resolveDropdownMenuStyle({
      transitionStyles,
      zIndex: 500,
      teleported: true,
      placement: 'right',
      menuAlign: 'start',
      triggerRect: {
        top: 12,
        right: 80,
        bottom: 48,
        left: 20,
        width: 60,
        height: 36,
      },
      viewportWidth: 390,
      viewportHeight: 844,
    })).toEqual([
      transitionStyles,
      {
        zIndex: 502,
        '--lk-transition-origin': 'top left',
        '--lk-dropdown-transition-x': '-8rpx',
        '--lk-dropdown-transition-y': '0rpx',
      },
      {
        position: 'fixed',
        margin: '0rpx',
        top: '23.08rpx',
        left: 'calc(153.85rpx + var(--lk-spacing-xs))',
      },
    ]);
    expect(resolveDropdownMenuStyle({
      transitionStyles,
      zIndex: 500,
      teleported: true,
      placement: 'bottom',
      menuAlign: 'end',
      triggerRect: {
        top: 120,
        right: 355,
        bottom: 161,
        left: 273,
        width: 82,
        height: 41,
      },
      viewportWidth: 390,
      viewportHeight: 844,
    })).toEqual([
      transitionStyles,
      {
        zIndex: 502,
        '--lk-transition-origin': 'top right',
        '--lk-dropdown-transition-y': '-8rpx',
      },
      {
        position: 'fixed',
        margin: '0rpx',
        right: '67.31rpx',
        top: 'calc(309.62rpx + var(--lk-spacing-xs))',
      },
    ]);

    expect(resolveDropdownTransitionVars('bottom')).toEqual({
      '--lk-transition-origin': 'top left',
      '--lk-dropdown-transition-y': '-8rpx',
    });
    expect(resolveDropdownTransitionVars('bottom', 'end')).toEqual({
      '--lk-transition-origin': 'top right',
      '--lk-dropdown-transition-y': '-8rpx',
    });

    expect(resolveDropdownTransitionConfig({
      animationType: 'zoom-in',
      animation: 'fade',
      placement: 'top',
      duration: 120,
      delay: 10,
      easing: 'linear',
    })).toEqual({
      name: 'zoom-in',
      duration: 120,
      delay: 10,
      easing: 'linear',
    });

    expect(resolveDropdownTransitionConfig({
      animationType: undefined,
      animation: 'scale',
      placement: 'right',
      duration: 180,
      delay: 0,
      easing: 'ease-out',
    })).toEqual({
      name: ANIMATION_PRESETS.scale.animation,
      duration: 180,
      delay: 0,
      easing: 'ease-out',
    });

    expect(resolveDropdownTransitionConfig({
      animationType: undefined,
      animation: undefined,
      placement: 'right',
      duration: 180,
      delay: 0,
      easing: 'ease-out',
    })).toEqual({
      name: 'dropdown',
      duration: 180,
      delay: 0,
      easing: 'ease-out',
    });
  });

  it('resolves teleport behavior and fixed menu placement', () => {
    expect(shouldTeleportDropdown('body')).toBe(true);
    expect(shouldTeleportDropdown(true)).toBe(true);
    expect(shouldTeleportDropdown(false)).toBe(false);
    expect(resolveDropdownTeleportTarget(true)).toBe('body');
    expect(resolveDropdownTeleportTarget(false)).toBe('body');
    expect(resolveDropdownTeleportTarget('body')).toBe('body');

    expect(resolveDropdownTeleportedMenuPosition({
      placement: 'top',
      menuAlign: 'start',
      triggerRect: {
        top: 100,
        right: 160,
        bottom: 140,
        left: 40,
        width: 120,
        height: 40,
      },
      viewportWidth: 390,
      viewportHeight: 844,
    })).toEqual({
      position: 'fixed',
      margin: '0rpx',
      left: '76.92rpx',
      bottom: 'calc(1430.77rpx + var(--lk-spacing-xs))',
    });

    expect(resolveDropdownTeleportedMenuPosition({
      placement: 'bottom',
      menuAlign: 'start',
      triggerRect: null,
      viewportWidth: 390,
      viewportHeight: 844,
    })).toEqual({
      position: 'fixed',
      margin: '0rpx',
      left: '-9999rpx',
      top: '-9999rpx',
      visibility: 'hidden',
    });
  });

  it('resolves item active, disabled and payload rules', () => {
    expect(resolveDropdownItemActive({
      activeValue: 1,
      name: 1,
    })).toBe(true);
    expect(resolveDropdownItemActive({
      activeValue: '1',
      name: 1,
    })).toBe(false);
    expect(resolveDropdownItemActive({
      activeValue: 1,
      name: 1,
      selectable: false,
    })).toBe(false);
    expect(resolveDropdownItemClass({
      active: true,
      disabled: false,
      customClass: 'custom-item',
    })).toEqual([
      {
        'is-active': true,
        'is-disabled': false,
      },
      'custom-item',
    ]);
    const itemStyle = { color: 'red' };
    expect(resolveDropdownItemStyle({
      customStyle: itemStyle,
    })).toBe(itemStyle);
    expect(resolveDropdownItemStyle({
      customStyle: itemStyle,
      width: 180,
    })).toEqual([itemStyle, { width: '180rpx' }]);

    const event = { type: 'tap' };
    expect(createDropdownItemPayload({
      name: 'newest',
      event,
    })).toEqual({
      name: 'newest',
      event,
    });
    expect(canSelectDropdownItem(false)).toBe(true);
    expect(canSelectDropdownItem(true)).toBe(false);
  });
});
