import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRenderer, defineComponent, h, nextTick, ref, type App } from 'vue';
import {
  createToastLifecycle,
  watchToastLifecycle,
} from '../../src/uni_modules/lucky-ui/components/lk-toast/toast.lifecycle';
import { toastManagerProps } from '../../src/uni_modules/lucky-ui/components/lk-toast/toast.props';
import {
  createToastItem,
  resolveToastManagerItemClass,
  resolveToastManagerStyle,
  resolveToastManagerTransition,
  resolveToastOverlayClass,
  resolveToastOverlayStyle,
  resolveToastRootClass,
  resolveToastRootStyle,
  resolveToastTransition,
  shouldScheduleToastClose,
} from '../../src/uni_modules/lucky-ui/components/lk-toast/toast.utils';

describe('lk-toast display and manager rules', () => {
  it('uses the public toast layer for the global manager', () => {
    const customStyle = { top: '24rpx', zIndex: 3000 };

    expect(toastManagerProps.zIndex.default).toBe(2000);
    expect(
      resolveToastManagerStyle({
        customStyle,
        zIndex: 2100,
      })
    ).toEqual([customStyle, { zIndex: 2100 }]);
  });

  it('resolves controlled toast transition by position', () => {
    expect(
      resolveToastTransition({
        transition: 'slide-up',
        position: 'top',
      })
    ).toBe('slide-down');
    expect(
      resolveToastTransition({
        transition: 'slide-up',
        position: 'center',
      })
    ).toBe('zoom-in');
    expect(
      resolveToastTransition({
        transition: 'fade',
        position: 'bottom',
      })
    ).toBe('fade');
  });

  it('builds overlay and root classes/styles', () => {
    expect(shouldScheduleToastClose(2000)).toBe(true);
    expect(shouldScheduleToastClose(0)).toBe(false);
    expect(resolveToastOverlayClass(true)).toEqual({ 'is-lock': true });
    expect(resolveToastOverlayStyle(2000)).toEqual({ zIndex: 2000 });
    expect(resolveToastRootClass('bottom')).toEqual(['lk-toast--bottom']);
    expect(resolveToastRootStyle(2000)).toEqual({ zIndex: 2001 });
  });

  it('normalizes manager transition and item class', () => {
    expect(
      resolveToastManagerTransition({
        position: 'top',
      })
    ).toBe('slide-down');
    expect(
      resolveToastManagerTransition({
        position: 'center',
      })
    ).toBe('zoom-in');
    expect(
      resolveToastManagerTransition({
        position: 'bottom',
        transition: 'fade',
      })
    ).toBe('fade');
    expect(resolveToastManagerItemClass('center')).toEqual(['pos-center']);
  });

  it('creates manager items from string or object options', () => {
    expect(
      createToastItem({
        id: 1,
        input: '保存成功',
      })
    ).toEqual({
      id: 1,
      message: '保存成功',
      transition: 'zoom-in',
      duration: 2000,
      position: 'center',
      visible: true,
    });

    expect(
      createToastItem({
        id: 2,
        input: {
          message: '顶部提示',
          position: 'top',
          duration: 0,
        },
      })
    ).toEqual({
      id: 2,
      message: '顶部提示',
      transition: 'slide-down',
      duration: 0,
      position: 'top',
      visible: true,
    });
  });
});

describe('lk-toast controlled lifecycle', () => {
  const mountedApps: App[] = [];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    for (const app of mountedApps.splice(0).reverse()) app.unmount();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  function createHarness(initialDuration = 1000) {
    const events: string[] = [];
    let duration = initialDuration;
    const lifecycle = createToastLifecycle({
      getDuration: () => duration,
      onOpen: () => events.push('open'),
      onRequestClose: () => events.push('update:false'),
      onClose: () => events.push('close'),
      onAfterLeave: () => events.push('after-leave'),
    });

    return {
      events,
      lifecycle,
      setDuration(nextDuration: number) {
        duration = nextDuration;
        lifecycle.reschedule();
      },
    };
  }

  it('schedules an initially visible toast and retries a rejected update after a full duration', () => {
    const { events, lifecycle } = createHarness();

    lifecycle.syncVisibility(true);
    expect(events).toEqual(['open']);
    expect(vi.getTimerCount()).toBe(1);

    vi.advanceTimersByTime(1000);
    expect(events).toEqual(['open', 'update:false']);
    expect(vi.getTimerCount()).toBe(1);

    vi.advanceTimersByTime(999);
    expect(events).toEqual(['open', 'update:false']);
    vi.advanceTimersByTime(1);
    expect(events).toEqual(['open', 'update:false', 'update:false']);
    expect(vi.getTimerCount()).toBe(1);

    lifecycle.syncVisibility(false);
    lifecycle.finishLeave();
    lifecycle.finishLeave();
    expect(events).toEqual(['open', 'update:false', 'update:false', 'close', 'after-leave']);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('treats an external false update as one close without an update echo', () => {
    const { events, lifecycle } = createHarness();

    lifecycle.syncVisibility(true);
    lifecycle.syncVisibility(false);
    lifecycle.syncVisibility(false);
    lifecycle.finishLeave();
    lifecycle.finishLeave();
    vi.advanceTimersByTime(2000);

    expect(events).toEqual(['open', 'close', 'after-leave']);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('allows a rejected close request to retry without reporting close', () => {
    const { events, lifecycle } = createHarness();

    lifecycle.syncVisibility(true);
    lifecycle.requestClose();
    lifecycle.requestClose();

    expect(events).toEqual(['open', 'update:false', 'update:false']);
    expect(vi.getTimerCount()).toBe(1);

    lifecycle.syncVisibility(false);
    expect(events).toEqual(['open', 'update:false', 'update:false', 'close']);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not rearm when the parent accepts a close request synchronously', () => {
    const events: string[] = [];
    const lifecycle = createToastLifecycle({
      getDuration: () => 1000,
      onOpen: () => events.push('open'),
      onRequestClose: () => {
        events.push('update:false');
        lifecycle.syncVisibility(false);
      },
      onClose: () => events.push('close'),
      onAfterLeave: () => events.push('after-leave'),
    });

    lifecycle.syncVisibility(true);
    vi.advanceTimersByTime(1000);
    vi.advanceTimersByTime(2000);

    expect(events).toEqual(['open', 'update:false', 'close']);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('invalidates the old timer and leave completion when reopened quickly', () => {
    const { events, lifecycle } = createHarness();

    lifecycle.syncVisibility(true);
    vi.advanceTimersByTime(200);
    lifecycle.syncVisibility(false);
    lifecycle.syncVisibility(true);
    lifecycle.finishLeave();

    vi.advanceTimersByTime(800);
    expect(events).toEqual(['open', 'close', 'open']);

    vi.advanceTimersByTime(200);
    expect(events).toEqual(['open', 'close', 'open', 'update:false']);

    lifecycle.syncVisibility(false);
    lifecycle.finishLeave();
    lifecycle.finishLeave();
    expect(events).toEqual(['open', 'close', 'open', 'update:false', 'close', 'after-leave']);
  });

  it('starts a fresh timer when externally reopened after leaving', () => {
    const { events, lifecycle } = createHarness();

    lifecycle.syncVisibility(true);
    vi.advanceTimersByTime(300);
    lifecycle.syncVisibility(false);
    lifecycle.finishLeave();
    lifecycle.syncVisibility(true);

    vi.advanceTimersByTime(700);
    expect(events).toEqual(['open', 'close', 'after-leave', 'open']);

    vi.advanceTimersByTime(300);
    expect(events).toEqual(['open', 'close', 'after-leave', 'open', 'update:false']);

    lifecycle.syncVisibility(false);
    expect(events.at(-1)).toBe('close');
  });

  it('keeps duration zero open until an explicit close request', () => {
    const { events, lifecycle } = createHarness(0);

    lifecycle.syncVisibility(true);
    vi.advanceTimersByTime(5000);
    expect(events).toEqual(['open']);
    expect(vi.getTimerCount()).toBe(0);

    lifecycle.requestClose();
    lifecycle.requestClose();
    expect(events).toEqual(['open', 'update:false', 'update:false']);
  });

  it('reschedules or cancels automatic close when duration changes while visible', () => {
    const cancelHarness = createHarness(100);
    cancelHarness.lifecycle.syncVisibility(true);
    vi.advanceTimersByTime(40);
    cancelHarness.setDuration(0);
    vi.advanceTimersByTime(500);
    expect(cancelHarness.events).toEqual(['open']);
    expect(vi.getTimerCount()).toBe(0);

    const scheduleHarness = createHarness(0);
    scheduleHarness.lifecycle.syncVisibility(true);
    vi.advanceTimersByTime(500);
    scheduleHarness.setDuration(100);
    vi.advanceTimersByTime(99);
    expect(scheduleHarness.events).toEqual(['open']);
    vi.advanceTimersByTime(1);
    expect(scheduleHarness.events).toEqual(['open', 'update:false']);
    expect(vi.getTimerCount()).toBe(1);
  });

  it('resets a positive duration from the change point without keeping the old deadline', () => {
    const { events, lifecycle, setDuration } = createHarness(100);

    lifecycle.syncVisibility(true);
    vi.advanceTimersByTime(40);
    setDuration(200);

    vi.advanceTimersByTime(60);
    expect(events).toEqual(['open']);
    vi.advanceTimersByTime(139);
    expect(events).toEqual(['open']);
    vi.advanceTimersByTime(1);
    expect(events).toEqual(['open', 'update:false']);

    lifecycle.syncVisibility(false);
    vi.advanceTimersByTime(1000);
    expect(events).toEqual(['open', 'update:false', 'close']);
  });

  function createTestRenderer() {
    return createRenderer<Record<string, unknown>, Record<string, unknown>>({
      patchProp() {},
      insert() {},
      remove() {},
      createElement() {
        return {};
      },
      createText() {
        return {};
      },
      createComment() {
        return {};
      },
      setText() {},
      setElementText() {},
      parentNode() {
        return null;
      },
      nextSibling() {
        return null;
      },
    });
  }

  it('processes every delivered source edge synchronously in a mounted component', async () => {
    const renderer = createTestRenderer();
    const visible = ref(true);
    const duration = ref(1000);
    const events: string[] = [];
    let lifecycle: ReturnType<typeof createToastLifecycle> | undefined;
    const App = defineComponent({
      setup() {
        lifecycle = createToastLifecycle({
          getDuration: () => duration.value,
          onOpen: () => events.push('open'),
          onRequestClose: () => events.push('update:false'),
          onClose: () => events.push('close'),
          onAfterLeave: () => events.push('after-leave'),
        });
        watchToastLifecycle(lifecycle, { visible, duration });
        return () => null;
      },
    });
    const app = renderer.createApp(App);
    app.mount({});
    mountedApps.push(app);

    visible.value = false;
    visible.value = true;

    expect(events).toEqual(['open', 'close', 'open']);
    await nextTick();
    expect(events).toEqual(['open', 'close', 'open']);
    lifecycle?.finishLeave();
    expect(events).toEqual(['open', 'close', 'open']);
    expect(vi.getTimerCount()).toBe(1);
  });

  it('treats only parent edges delivered across render batches as lifecycle boundaries', async () => {
    const renderer = createTestRenderer();
    const parentVisible = ref(true);
    const events: string[] = [];
    let childLifecycle: ReturnType<typeof createToastLifecycle> | undefined;
    const Child = defineComponent({
      props: {
        visible: { type: Boolean, required: true },
        duration: { type: Number, required: true },
      },
      setup(props) {
        childLifecycle = createToastLifecycle({
          getDuration: () => props.duration,
          onOpen: () => events.push('open'),
          onRequestClose: () => events.push('update:false'),
          onClose: () => events.push('close'),
          onAfterLeave: () => events.push('after-leave'),
        });
        watchToastLifecycle(childLifecycle, {
          visible: () => props.visible,
          duration: () => props.duration,
        });
        return () => null;
      },
    });
    const Parent = defineComponent({
      setup() {
        return () => h(Child, { visible: parentVisible.value, duration: 1000 });
      },
    });
    const app = renderer.createApp(Parent);
    app.mount({});
    mountedApps.push(app);

    parentVisible.value = false;
    parentVisible.value = true;
    await nextTick();
    expect(events).toEqual(['open']);

    parentVisible.value = false;
    await nextTick();
    expect(events).toEqual(['open', 'close']);

    parentVisible.value = true;
    await nextTick();
    expect(events).toEqual(['open', 'close', 'open']);
    childLifecycle?.finishLeave();
    expect(events).toEqual(['open', 'close', 'open']);
    expect(vi.getTimerCount()).toBe(1);
  });

  it('disposes a pending close without later events', () => {
    const { events, lifecycle } = createHarness();

    lifecycle.syncVisibility(true);
    expect(vi.getTimerCount()).toBe(1);

    lifecycle.dispose();
    lifecycle.dispose();
    lifecycle.requestClose();
    lifecycle.syncVisibility(false);
    lifecycle.finishLeave();
    vi.advanceTimersByTime(2000);

    expect(events).toEqual(['open']);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not emit close when the update request synchronously disposes the instance', () => {
    const events: string[] = [];
    const lifecycle = createToastLifecycle({
      getDuration: () => 1000,
      onOpen: () => events.push('open'),
      onRequestClose: () => {
        events.push('update:false');
        lifecycle.dispose();
      },
      onClose: () => events.push('close'),
      onAfterLeave: () => events.push('after-leave'),
    });

    lifecycle.syncVisibility(true);
    vi.advanceTimersByTime(1000);
    vi.advanceTimersByTime(1000);

    expect(events).toEqual(['open', 'update:false']);
    expect(vi.getTimerCount()).toBe(0);
  });
});
