import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ANIMATION_PRESETS } from '../../src/uni_modules/lucky-ui/composables/useTransition';
import {
  canMutateTooltipOpen,
  canUpdateTooltipOpen,
  createTooltipPayload,
  createTooltipVisibilityController,
  getFallbackPlacement,
  isTooltipTouchLikeEvent,
  resolveTooltipOpen,
  resolveTooltipPlacementClass,
  resolveTooltipPopStyle,
  resolveTooltipTransitionConfig,
  shouldKeepTooltipContentHover,
  shouldOpenTooltipOnTriggerEnter,
  shouldToggleTooltipOnTriggerClick,
} from '../../src/uni_modules/lucky-ui/components/lk-tooltip/tooltip.utils';
import type { TooltipVisibilityConfig } from '../../src/uni_modules/lucky-ui/components/lk-tooltip/tooltip.utils';

function createVisibilityHarness(initial: Partial<TooltipVisibilityConfig> = {}) {
  const config: TooltipVisibilityConfig = {
    always: false,
    disabled: false,
    modelValue: undefined,
    trigger: 'click',
    ...initial,
  };
  let innerOpen = false;
  const updates: boolean[] = [];
  const visibility: Array<{ open: boolean; trigger: string }> = [];
  const deferred: Array<() => void> = [];
  const controller = createTooltipVisibilityController({
    getConfig: () => config,
    getInnerOpen: () => innerOpen,
    setInnerOpen: value => {
      innerOpen = value;
    },
    onUpdate: value => updates.push(value),
    onVisibilityChange: (open, payload) => visibility.push({ open, trigger: payload.trigger }),
    defer: callback => deferred.push(callback),
  });

  return {
    config,
    controller,
    updates,
    visibility,
    flushDeferred() {
      deferred.splice(0).forEach(callback => callback());
    },
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('lk-tooltip trigger and placement rules', () => {
  it('isolates trigger taps from interactive tooltip content', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/uni_modules/lucky-ui/components/lk-tooltip/lk-tooltip.vue'),
      'utf8'
    );
    const template = source.slice(source.indexOf('<template>'), source.indexOf('</template>'));
    const rootStart = template.indexOf('class="lk-tooltip"');
    const triggerStart = template.indexOf('class="lk-tooltip__trigger"');
    const triggerEnd = template.indexOf('</view>', triggerStart);
    const popStart = template.indexOf('class="lk-tooltip__pop"');
    const popTagEnd = template.indexOf('>', popStart);

    expect(rootStart).toBeGreaterThan(-1);
    expect(template.slice(rootStart, triggerStart)).not.toContain('@tap=');
    expect(template.slice(triggerStart, triggerEnd)).toContain('@tap="onTriggerClick"');
    expect(template.slice(popStart, popTagEnd)).toContain('@tap.stop');
  });

  it('resolves open state from always, controlled and inner state', () => {
    expect(
      resolveTooltipOpen({
        always: true,
        disabled: false,
        modelValue: false,
        innerOpen: false,
      })
    ).toBe(true);
    expect(
      resolveTooltipOpen({
        always: false,
        disabled: false,
        modelValue: false,
        innerOpen: true,
      })
    ).toBe(false);
    expect(
      resolveTooltipOpen({
        always: false,
        disabled: false,
        modelValue: undefined,
        innerOpen: true,
      })
    ).toBe(true);
    expect(
      resolveTooltipOpen({
        always: true,
        disabled: true,
        modelValue: true,
        innerOpen: true,
      })
    ).toBe(false);

    expect(canMutateTooltipOpen(true)).toBe(false);
    expect(canMutateTooltipOpen(false)).toBe(true);
  });

  it('guards open updates and trigger behavior', () => {
    expect(
      canUpdateTooltipOpen({
        disabled: false,
        always: false,
        currentOpen: false,
        nextOpen: true,
      })
    ).toBe(true);
    expect(
      canUpdateTooltipOpen({
        disabled: true,
        always: false,
        currentOpen: false,
        nextOpen: true,
      })
    ).toBe(false);
    expect(
      canUpdateTooltipOpen({
        disabled: true,
        always: false,
        currentOpen: true,
        nextOpen: false,
      })
    ).toBe(true);
    expect(
      canUpdateTooltipOpen({
        disabled: false,
        always: false,
        currentOpen: true,
        nextOpen: true,
      })
    ).toBe(false);

    expect(
      shouldOpenTooltipOnTriggerEnter({
        supportsHover: true,
        always: false,
        trigger: 'hover',
      })
    ).toBe(true);
    expect(
      shouldOpenTooltipOnTriggerEnter({
        supportsHover: false,
        always: false,
        trigger: 'hover',
      })
    ).toBe(false);
    expect(
      shouldToggleTooltipOnTriggerClick({
        always: false,
        trigger: 'click',
        supportsHover: true,
      })
    ).toBe(true);
    expect(
      shouldToggleTooltipOnTriggerClick({
        always: false,
        trigger: 'hover',
        supportsHover: false,
      })
    ).toBe(true);
    expect(
      shouldToggleTooltipOnTriggerClick({
        always: false,
        trigger: 'hover',
        supportsHover: true,
        touchLike: true,
      })
    ).toBe(true);
    expect(
      shouldToggleTooltipOnTriggerClick({
        always: false,
        trigger: 'hover',
        supportsHover: true,
        touchLike: false,
      })
    ).toBe(false);
    expect(
      shouldKeepTooltipContentHover({
        always: false,
        trigger: 'hover',
      })
    ).toBe(true);
  });

  it('recognizes touch-like tap payloads without treating mouse input as touch', () => {
    expect(isTooltipTouchLikeEvent({ pointerType: 'touch' })).toBe(true);
    expect(isTooltipTouchLikeEvent({ detail: { pointerType: 'pen' } })).toBe(true);
    expect(isTooltipTouchLikeEvent({ changedTouches: { length: 1 } })).toBe(true);
    expect(isTooltipTouchLikeEvent({ sourceCapabilities: { firesTouchEvents: true } })).toBe(true);
    expect(isTooltipTouchLikeEvent({ pointerType: 'mouse' })).toBe(false);
    expect(isTooltipTouchLikeEvent(undefined)).toBe(false);
    expect(isTooltipTouchLikeEvent({}, { recentTouchAt: 1000, now: 1500 })).toBe(true);
    expect(isTooltipTouchLikeEvent({}, { recentTouchAt: 1000, now: 2001 })).toBe(false);
  });

  it('emits lifecycle events only after a controlled request becomes visible', () => {
    const harness = createVisibilityHarness({ modelValue: false });

    expect(harness.controller.request(true, 'click')).toBe(true);
    expect(harness.updates).toEqual([true]);
    expect(harness.visibility).toEqual([]);

    harness.flushDeferred();
    expect(harness.visibility).toEqual([]);

    harness.config.modelValue = true;
    harness.controller.sync('external');
    expect(harness.visibility).toEqual([{ open: true, trigger: 'external' }]);

    harness.config.modelValue = false;
    harness.controller.sync('external');
    expect(harness.visibility).toEqual([
      { open: true, trigger: 'external' },
      { open: false, trigger: 'external' },
    ]);
  });

  it('keeps the request trigger when a controlled parent accepts it before settlement', () => {
    const harness = createVisibilityHarness({ modelValue: false });

    expect(harness.controller.request(true, 'click', { type: 'tap' })).toBe(true);
    harness.config.modelValue = true;
    harness.controller.sync('external');

    expect(harness.updates).toEqual([true]);
    expect(harness.visibility).toEqual([{ open: true, trigger: 'click' }]);
  });

  it('retires a rapidly reversed controlled request before the next tap', () => {
    const harness = createVisibilityHarness({ modelValue: false });

    expect(harness.controller.request(true, 'click')).toBe(true);
    expect(harness.controller.request(false, 'click')).toBe(true);
    harness.flushDeferred();
    expect(harness.updates).toEqual([true, false]);

    harness.config.modelValue = true;
    harness.controller.sync('external');
    expect(harness.controller.getRequestedOpen()).toBe(true);
    expect(harness.controller.request(false, 'click')).toBe(true);
    expect(harness.updates).toEqual([true, false, false]);
  });

  it('closes on disable, clears timers and does not reopen an uncontrolled tooltip', () => {
    vi.useFakeTimers();
    const harness = createVisibilityHarness();

    expect(harness.controller.request(true, 'click')).toBe(true);
    expect(harness.controller.resolveOpen()).toBe(true);
    harness.controller.scheduleClose('content', undefined, 500);
    expect(harness.controller.getTimerCount()).toBe(1);

    harness.config.disabled = true;
    harness.controller.sync('external');

    expect(harness.controller.resolveOpen()).toBe(false);
    expect(harness.controller.getTimerCount()).toBe(0);
    expect(harness.updates).toEqual([true, false]);
    expect(harness.visibility).toEqual([
      { open: true, trigger: 'click' },
      { open: false, trigger: 'disabled' },
    ]);

    harness.config.disabled = false;
    harness.controller.sync('external');
    expect(harness.controller.resolveOpen()).toBe(false);
    vi.advanceTimersByTime(500);
    expect(harness.visibility).toHaveLength(2);
  });

  it('keeps a controlled tooltip hidden while disabled even if its parent rejects close', () => {
    const harness = createVisibilityHarness({ modelValue: true });

    harness.config.disabled = true;
    harness.controller.sync('external');

    expect(harness.controller.resolveOpen()).toBe(false);
    expect(harness.updates).toEqual([false]);
    expect(harness.visibility).toEqual([{ open: false, trigger: 'disabled' }]);

    harness.controller.scheduleOpen('hover', undefined, 100);
    harness.controller.scheduleClose('hover', undefined, 100);
    expect(harness.controller.getTimerCount()).toBe(0);
    harness.controller.sync('external');
    expect(harness.controller.request(true, 'click')).toBe(false);
    expect(harness.updates).toEqual([false]);
  });

  it('does not duplicate an existing close request when disabled', () => {
    const harness = createVisibilityHarness({ modelValue: true });

    expect(harness.controller.request(false, 'click')).toBe(true);
    harness.config.disabled = true;
    harness.controller.sync('external');

    expect(harness.updates).toEqual([false]);
    expect(harness.visibility).toEqual([{ open: false, trigger: 'disabled' }]);
  });

  it('revokes a pending open and any stale controlled write while disabled', () => {
    const harness = createVisibilityHarness({ modelValue: false });

    expect(harness.controller.request(true, 'click')).toBe(true);
    harness.config.disabled = true;
    harness.controller.sync('external');
    expect(harness.updates).toEqual([true, false]);
    expect(harness.visibility).toEqual([]);

    harness.config.modelValue = true;
    harness.controller.sync('external');
    expect(harness.updates).toEqual([true, false, false]);
    expect(harness.controller.resolveOpen()).toBe(false);
  });

  it('temporarily hides an always tooltip without requesting a model update', () => {
    const harness = createVisibilityHarness({ always: true });

    harness.config.disabled = true;
    harness.controller.sync('external');
    expect(harness.updates).toEqual([]);
    expect(harness.visibility).toEqual([{ open: false, trigger: 'disabled' }]);

    harness.config.disabled = false;
    harness.controller.sync('external');
    expect(harness.visibility).toEqual([
      { open: false, trigger: 'disabled' },
      { open: true, trigger: 'external' },
    ]);
  });

  it('cancels a pending hover open when a touch tap requests the same edge', () => {
    vi.useFakeTimers();
    const harness = createVisibilityHarness({ trigger: 'hover' });

    harness.controller.scheduleOpen('hover', undefined, 100);
    expect(harness.controller.getTimerCount()).toBe(1);
    expect(harness.controller.request(true, 'click')).toBe(true);
    expect(harness.controller.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(100);

    expect(harness.updates).toEqual([true]);
    expect(harness.visibility).toEqual([{ open: true, trigger: 'click' }]);
  });

  it('cancels opposing delays and destroys every pending timer', () => {
    vi.useFakeTimers();
    const harness = createVisibilityHarness({ trigger: 'hover' });

    harness.controller.scheduleOpen('hover', undefined, 100);
    harness.controller.scheduleClose('hover', undefined, 80);
    expect(harness.controller.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(80);
    expect(harness.controller.resolveOpen()).toBe(false);
    expect(harness.updates).toEqual([]);

    harness.controller.scheduleOpen('hover', undefined, 100);
    harness.controller.destroy();
    expect(harness.controller.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(100);
    expect(harness.updates).toEqual([]);
  });

  it('falls back placement by viewport overflow', () => {
    const rect = {
      top: 4,
      right: 200,
      bottom: 80,
      left: 40,
    };

    expect(getFallbackPlacement('top', rect, 375, 667)).toBe('bottom');
    expect(
      getFallbackPlacement(
        'left',
        {
          top: 80,
          right: 100,
          bottom: 140,
          left: 4,
        },
        375,
        667
      )
    ).toBe('right');
    expect(
      getFallbackPlacement(
        'bottom',
        {
          top: 80,
          right: 100,
          bottom: 640,
          left: 40,
        },
        375,
        667
      )
    ).toBe('bottom');
  });

  it('builds placement class, pop style and payload', () => {
    expect(resolveTooltipPlacementClass('right')).toBe('is-right');
    expect(
      resolveTooltipPopStyle({
        offset: 12,
        zIndex: 700,
        width: 240,
      })
    ).toEqual({
      '--lk-tooltip-offset': '12rpx',
      zIndex: 700,
      width: '240rpx',
    });
    expect(
      resolveTooltipPopStyle({
        offset: 8,
        zIndex: 600,
        width: '32vw',
      })
    ).toEqual({
      '--lk-tooltip-offset': '8rpx',
      zIndex: 600,
      width: '32vw',
    });

    const event = { type: 'tap' };
    expect(
      createTooltipPayload({
        trigger: 'click',
        event,
      })
    ).toEqual({
      trigger: 'click',
      event,
    });
  });

  it('resolves transition priority from explicit type, preset and placement', () => {
    expect(
      resolveTooltipTransitionConfig({
        animationType: 'zoom-in',
        animation: 'fade',
        placement: 'top',
        duration: 120,
        delay: 20,
        easing: 'linear',
      })
    ).toEqual({
      name: 'zoom-in',
      duration: 120,
      delay: 20,
      easing: 'linear',
    });

    expect(
      resolveTooltipTransitionConfig({
        animationType: undefined,
        animation: 'scale',
        placement: 'bottom',
        duration: 180,
        delay: 0,
        easing: 'ease-out',
      })
    ).toEqual({
      name: ANIMATION_PRESETS.scale.animation,
      duration: 180,
      delay: 0,
      easing: 'ease-out',
    });

    expect(
      resolveTooltipTransitionConfig({
        animationType: undefined,
        animation: undefined,
        placement: 'left',
        duration: 180,
        delay: 0,
        easing: 'ease-out',
      })
    ).toMatchObject({
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
