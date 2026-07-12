import { describe, expect, it } from 'vitest';
import { ANIMATION_PRESETS } from '../../src/uni_modules/lucky-ui/composables/useTransition';
import {
  canMutateTooltipOpen,
  canUpdateTooltipOpen,
  createTooltipPayload,
  getFallbackPlacement,
  resolveTooltipOpen,
  resolveTooltipPlacementClass,
  resolveTooltipPopStyle,
  resolveTooltipTransitionConfig,
  shouldKeepTooltipContentHover,
  shouldOpenTooltipOnTriggerEnter,
  shouldToggleTooltipOnTriggerClick,
} from '../../src/uni_modules/lucky-ui/components/lk-tooltip/tooltip.utils';

describe('lk-tooltip trigger and placement rules', () => {
  it('resolves open state from always, controlled and inner state', () => {
    expect(resolveTooltipOpen({
      always: true,
      modelValue: false,
      innerOpen: false,
    })).toBe(true);
    expect(resolveTooltipOpen({
      always: false,
      modelValue: false,
      innerOpen: true,
    })).toBe(false);
    expect(resolveTooltipOpen({
      always: false,
      modelValue: undefined,
      innerOpen: true,
    })).toBe(true);

    expect(canMutateTooltipOpen(true)).toBe(false);
    expect(canMutateTooltipOpen(false)).toBe(true);
  });

  it('guards open updates and trigger behavior', () => {
    expect(canUpdateTooltipOpen({
      disabled: false,
      always: false,
      currentOpen: false,
      nextOpen: true,
    })).toBe(true);
    expect(canUpdateTooltipOpen({
      disabled: true,
      always: false,
      currentOpen: false,
      nextOpen: true,
    })).toBe(false);
    expect(canUpdateTooltipOpen({
      disabled: false,
      always: false,
      currentOpen: true,
      nextOpen: true,
    })).toBe(false);

    expect(shouldOpenTooltipOnTriggerEnter({
      supportsHover: true,
      always: false,
      trigger: 'hover',
    })).toBe(true);
    expect(shouldOpenTooltipOnTriggerEnter({
      supportsHover: false,
      always: false,
      trigger: 'hover',
    })).toBe(false);
    expect(shouldToggleTooltipOnTriggerClick({
      always: false,
      trigger: 'click',
      supportsHover: true,
    })).toBe(true);
    expect(shouldToggleTooltipOnTriggerClick({
      always: false,
      trigger: 'hover',
      supportsHover: false,
    })).toBe(true);
    expect(shouldKeepTooltipContentHover({
      always: false,
      trigger: 'hover',
    })).toBe(true);
  });

  it('falls back placement by viewport overflow', () => {
    const rect = {
      top: 4,
      right: 200,
      bottom: 80,
      left: 40,
    };

    expect(getFallbackPlacement('top', rect, 375, 667)).toBe('bottom');
    expect(getFallbackPlacement('left', {
      top: 80,
      right: 100,
      bottom: 140,
      left: 4,
    }, 375, 667)).toBe('right');
    expect(getFallbackPlacement('bottom', {
      top: 80,
      right: 100,
      bottom: 640,
      left: 40,
    }, 375, 667)).toBe('bottom');
  });

  it('builds placement class, pop style and payload', () => {
    expect(resolveTooltipPlacementClass('right')).toBe('is-right');
    expect(resolveTooltipPopStyle({
      offset: 12,
      zIndex: 700,
      width: 240,
    })).toEqual({
      '--lk-tooltip-offset': '12rpx',
      zIndex: 700,
      width: '240rpx',
    });
    expect(resolveTooltipPopStyle({
      offset: 8,
      zIndex: 600,
      width: '32vw',
    })).toEqual({
      '--lk-tooltip-offset': '8rpx',
      zIndex: 600,
      width: '32vw',
    });

    const event = { type: 'tap' };
    expect(createTooltipPayload({
      trigger: 'click',
      event,
    })).toEqual({
      trigger: 'click',
      event,
    });
  });

  it('resolves transition priority from explicit type, preset and placement', () => {
    expect(resolveTooltipTransitionConfig({
      animationType: 'zoom-in',
      animation: 'fade',
      placement: 'top',
      duration: 120,
      delay: 20,
      easing: 'linear',
    })).toEqual({
      name: 'zoom-in',
      duration: 120,
      delay: 20,
      easing: 'linear',
    });

    expect(resolveTooltipTransitionConfig({
      animationType: undefined,
      animation: 'scale',
      placement: 'bottom',
      duration: 180,
      delay: 0,
      easing: 'ease-out',
    })).toEqual({
      name: ANIMATION_PRESETS.scale.animation,
      duration: 180,
      delay: 0,
      easing: 'ease-out',
    });

    expect(resolveTooltipTransitionConfig({
      animationType: undefined,
      animation: undefined,
      placement: 'left',
      duration: 180,
      delay: 0,
      easing: 'ease-out',
    })).toMatchObject({
      name: 'fade',
      duration: 180,
      delay: 0,
      easing: 'ease-out',
      enterFrom: {
        opacity: 0,
        transform: 'translate3d(var(--lk-rpx-8), 0, 0)',
      },
      enterTo: {
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
      },
      leaveTo: {
        opacity: 0,
        transform: 'translate3d(var(--lk-rpx-8), 0, 0)',
      },
    });
  });
});
