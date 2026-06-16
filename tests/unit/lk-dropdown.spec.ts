import { describe, expect, it } from 'vitest';
import { ANIMATION_PRESETS } from '../../src/uni_modules/lucky-ui/composables/useTransition';
import {
  canSelectDropdownItem,
  createDropdownItemPayload,
  resolveDropdownItemActive,
  resolveDropdownItemClass,
  resolveDropdownMaskStyle,
  resolveDropdownMenuStyle,
  resolveDropdownNextOpen,
  resolveDropdownRootClass,
  resolveDropdownRootStyle,
  resolveDropdownTransitionConfig,
  shouldCloseDropdownOnSelect,
  shouldRenderDropdownMask,
  shouldToggleDropdownOnClick,
  shouldToggleDropdownOnHover,
} from '../../src/uni_modules/lucky-ui/components/lk-dropdown/dropdown.utils';

describe('lk-dropdown open and item rules', () => {
  it('resolves root class/style and next open state', () => {
    expect(resolveDropdownRootClass({
      placement: 'bottom',
      customClass: 'custom',
    })).toEqual(['lk-dropdown--placement-bottom', 'custom']);

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
    })).toBe(true);
    expect(shouldRenderDropdownMask({
      display: true,
      trigger: 'hover',
      closeOnClickOutside: true,
    })).toBe(false);
    expect(resolveDropdownMaskStyle(500)).toEqual({ zIndex: 500 });
  });

  it('builds menu style and transition config', () => {
    const transitionStyles = { opacity: 1 };
    expect(resolveDropdownMenuStyle({
      transitionStyles,
      zIndex: 500,
    })).toEqual([transitionStyles, { zIndex: 502 }]);

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
      name: 'fade-left',
      duration: 180,
      delay: 0,
      easing: 'ease-out',
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
