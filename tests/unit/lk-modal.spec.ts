import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ANIMATION_PRESETS } from '../../src/uni_modules/lucky-ui/composables/useTransition';
import type { ModalBeforeConfirm } from '../../src/uni_modules/lucky-ui/components/lk-modal/modal.props';
import {
  canTriggerModalAction,
  createModalActionController,
  resolveModalFooterClass,
  resolveModalHeaderClass,
  resolveModalPanelStyle,
  resolveModalRootStyle,
  resolveModalText,
  resolveModalTransitionConfig,
  resolveModalTransitionDelay,
  resolveModalTransitionDuration,
  resolveModalTransitionEasing,
  resolveModalTransitionName,
  shouldCloseModalOnOverlay,
  shouldModalHeaderRender,
} from '../../src/uni_modules/lucky-ui/components/lk-modal/modal.utils';

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function createActionHarness(options: { controlled: boolean; beforeConfirm?: ModalBeforeConfirm }) {
  let visible = true;
  let leaving = false;
  let confirming = false;
  let closeRequested = false;
  const events: string[] = [];

  const controller = createModalActionController({
    isVisible: () => visible,
    isLeaving: () => leaving,
    isConfirming: () => confirming,
    setConfirming: value => {
      confirming = value;
    },
    isCloseRequested: () => closeRequested,
    setCloseRequested: value => {
      closeRequested = value;
    },
    getBeforeConfirm: () => options.beforeConfirm || null,
    onUpdateModelValue: value => {
      events.push(`update:${value}`);
      if (options.controlled) {
        visible = value;
        leaving = !value;
        controller.syncVisibility();
      }
    },
    onConfirm: () => events.push('confirm'),
    onCancel: () => events.push('cancel'),
    onClickOverlay: () => events.push('click-overlay'),
    onClickClose: () => events.push('click-close'),
  });

  return {
    controller,
    events,
    get visible() {
      return visible;
    },
    get confirming() {
      return confirming;
    },
    get closeRequested() {
      return closeRequested;
    },
    setVisible(value: boolean) {
      visible = value;
      leaving = !value;
      controller.syncVisibility();
    },
    tapOverlay(closeOnOverlay: boolean) {
      const shouldClose = controller.shouldCloseOnOverlay(closeOnOverlay);
      controller.clickOverlay();
      if (shouldClose) controller.closeFromOverlay();
    },
  };
}

describe('lk-modal transition and action rules', () => {
  it('resolves locale fallback text and transition config', () => {
    expect(resolveModalText({ value: '', fallback: '确定' })).toBe('确定');
    expect(resolveModalText({ value: '提交', fallback: '确定' })).toBe('提交');

    expect(
      resolveModalTransitionConfig({
        animationType: 'fade-up',
        animation: 'scale',
        duration: 120,
        delay: 30,
        easing: 'linear',
      })
    ).toEqual({
      name: 'fade-up',
      duration: 120,
      delay: 30,
      easing: 'linear',
    });

    const presetConfig = resolveModalTransitionConfig({
      animation: 'scale',
    });
    expect(presetConfig).toEqual({
      name: ANIMATION_PRESETS.scale.animation,
      duration: ANIMATION_PRESETS.scale.duration,
      delay: ANIMATION_PRESETS.scale.delay ?? 0,
      easing: ANIMATION_PRESETS.scale.easing,
    });
  });

  it('normalizes transition primitive values', () => {
    expect(resolveModalTransitionName({ name: 'zoom-in' })).toBe('zoom-in');
    expect(resolveModalTransitionName({ name: undefined })).toBe('fade');
    expect(resolveModalTransitionDuration({ duration: 180 })).toBe(180);
    expect(resolveModalTransitionDuration({ duration: undefined })).toBe(300);
    expect(resolveModalTransitionDelay({ delay: 60 })).toBe(60);
    expect(resolveModalTransitionDelay({ delay: undefined })).toBe(0);
    expect(resolveModalTransitionEasing({ easing: 'ease-out' })).toBe('ease-out');
    expect(resolveModalTransitionEasing({ easing: undefined })).toBe('ease');
  });

  it('builds header/footer classes and styles', () => {
    expect(
      shouldModalHeaderRender({
        showHeader: true,
        title: '',
        showClose: false,
        hasHeaderSlot: true,
      })
    ).toBe(true);
    expect(
      shouldModalHeaderRender({
        showHeader: false,
        title: '标题',
        showClose: true,
        hasHeaderSlot: true,
      })
    ).toBe(false);

    expect(resolveModalRootStyle(1500)).toEqual({ zIndex: 1501 });
    expect(
      resolveModalPanelStyle({
        transitionStyles: { opacity: 1 },
        width: '600rpx',
        customStyle: { transform: 'scale(0.9)' },
      })
    ).toEqual([{ transform: 'scale(0.9)' }, { opacity: 1, width: '600rpx' }]);
    expect(resolveModalHeaderClass('center')).toEqual(['is-title-center']);
    expect(
      resolveModalFooterClass({
        footerType: 'text',
        showCancel: true,
      })
    ).toEqual(['is-footer-text', { 'has-cancel': true }]);
  });

  it('guards actions while leaving and overlay closing by prop', () => {
    expect(
      canTriggerModalAction({
        visible: true,
        leaving: false,
        confirming: false,
        closeRequested: false,
      })
    ).toBe(true);
    expect(
      canTriggerModalAction({
        visible: true,
        leaving: true,
        confirming: false,
        closeRequested: false,
      })
    ).toBe(false);
    expect(
      shouldCloseModalOnOverlay({
        visible: true,
        leaving: false,
        confirming: false,
        closeRequested: false,
        closeOnOverlay: true,
      })
    ).toBe(true);
    expect(
      shouldCloseModalOnOverlay({
        visible: true,
        leaving: true,
        confirming: false,
        closeRequested: false,
        closeOnOverlay: true,
      })
    ).toBe(false);
    expect(
      shouldCloseModalOnOverlay({
        visible: true,
        leaving: false,
        confirming: false,
        closeRequested: false,
        closeOnOverlay: false,
      })
    ).toBe(false);
  });

  it.each([true, false])(
    'emits one overlay event and no close when closeOnOverlay=false (controlled=%s)',
    controlled => {
      const harness = createActionHarness({ controlled });

      harness.tapOverlay(false);

      expect(harness.events).toEqual(['click-overlay']);
      expect(harness.visible).toBe(true);
    }
  );

  it.each([true, false])(
    'emits exactly one close request when closeOnOverlay=true (controlled=%s)',
    async controlled => {
      const harness = createActionHarness({ controlled });

      harness.tapOverlay(true);
      harness.controller.closeFromOverlay();

      expect(harness.events).toEqual(['click-overlay', 'update:false']);
      expect(harness.visible).toBe(!controlled);

      await Promise.resolve();
      if (!controlled) expect(harness.closeRequested).toBe(false);
    }
  );

  it('awaits a successful beforeConfirm and blocks concurrent actions', async () => {
    const deferred = createDeferred<boolean>();
    let beforeConfirmCount = 0;
    const harness = createActionHarness({
      controlled: true,
      beforeConfirm: () => {
        beforeConfirmCount += 1;
        return deferred.promise;
      },
    });

    const first = harness.controller.confirm();
    const second = harness.controller.confirm();

    expect(beforeConfirmCount).toBe(1);
    expect(harness.confirming).toBe(true);
    expect(harness.controller.canAct()).toBe(false);
    expect(harness.controller.shouldCloseOnOverlay(true)).toBe(false);
    expect(harness.controller.cancel()).toBe(false);
    expect(harness.controller.clickClose()).toBe(false);
    expect(await second).toBe('blocked');
    expect(harness.events).toEqual([]);

    deferred.resolve(true);

    expect(await first).toBe('confirmed');
    expect(harness.confirming).toBe(false);
    expect(harness.events).toEqual(['confirm', 'update:false']);
  });

  it('keeps the modal open when beforeConfirm resolves false or rejects', async () => {
    const denied = createActionHarness({
      controlled: true,
      beforeConfirm: () => Promise.resolve(false),
    });
    expect(await denied.controller.confirm()).toBe('cancelled');
    expect(denied.confirming).toBe(false);
    expect(denied.visible).toBe(true);
    expect(denied.events).toEqual([]);

    const rejected = createActionHarness({
      controlled: true,
      beforeConfirm: () => Promise.reject(new Error('request failed')),
    });
    expect(await rejected.controller.confirm()).toBe('rejected');
    expect(rejected.confirming).toBe(false);
    expect(rejected.visible).toBe(true);
    expect(rejected.events).toEqual([]);
  });

  it('ignores a stale confirm result after an external close and reopen', async () => {
    const deferred = createDeferred<boolean>();
    const harness = createActionHarness({
      controlled: true,
      beforeConfirm: () => deferred.promise,
    });

    const pending = harness.controller.confirm();
    harness.setVisible(false);
    harness.setVisible(true);
    deferred.resolve(true);

    expect(await pending).toBe('stale');
    expect(harness.visible).toBe(true);
    expect(harness.confirming).toBe(false);
    expect(harness.events).toEqual([]);
  });

  it('guards cancel and close events before the parent transition starts', () => {
    const cancelHarness = createActionHarness({ controlled: false });
    expect(cancelHarness.controller.cancel()).toBe(true);
    expect(cancelHarness.controller.cancel()).toBe(false);
    expect(cancelHarness.events).toEqual(['cancel', 'update:false']);

    const closeHarness = createActionHarness({ controlled: false });
    expect(closeHarness.controller.clickClose()).toBe(true);
    expect(closeHarness.controller.clickClose()).toBe(false);
    expect(closeHarness.events).toEqual(['click-close', 'update:false']);
  });

  it('wires overlay ownership and loading/disabled state into the template', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/uni_modules/lucky-ui/components/lk-modal/lk-modal.vue'),
      'utf8'
    );

    expect(source).toContain(':close-on-click="overlayCloseOnClick"');
    expect(source).toContain('@update:model-value="onOverlayModelUpdate"');
    expect(source).toContain('class="lk-modal__footer-btn lk-modal__confirm"');
    expect(source).toContain(':loading="confirming"');
    expect(source).toContain(':disabled="actionsDisabled"');
    expect(source).toContain("'is-loading': confirming");
  });
});
