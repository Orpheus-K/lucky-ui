import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRenderer, defineComponent, nextTick, ref, type App, type Ref } from 'vue';
import {
  useTransition,
  type TransitionCallbacks,
  type TransitionConfig,
} from '../../src/uni_modules/lucky-ui/composables/useTransition';

type TestNode = Record<string, unknown>;
type TestElement = TestNode;

type TrackedListener = EventListenerOrEventListenerObject;
type EndEventOptions = {
  target?: unknown;
  propertyName?: string;
  animationName?: string;
};

class TrackingElement {
  private readonly listeners = new Map<string, Set<TrackedListener>>();

  addEventListener(type: string, listener: TrackedListener) {
    const listeners = this.listeners.get(type) ?? new Set<TrackedListener>();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: TrackedListener) {
    this.listeners.get(type)?.delete(listener);
  }

  dispatchEnd(type: 'transitionend' | 'animationend', options: EndEventOptions = {}) {
    const event = {
      type,
      target: options.target ?? this,
      currentTarget: this,
      propertyName: options.propertyName ?? '',
      animationName: options.animationName ?? '',
    } as unknown as Event;
    for (const listener of [...(this.listeners.get(type) ?? [])]) {
      if (typeof listener === 'function') listener.call(this, event);
      else listener.handleEvent(event);
    }
  }

  listenerCount() {
    return [...this.listeners.values()].reduce((total, listeners) => total + listeners.size, 0);
  }
}

const testRenderer = createRenderer<TestNode, TestElement>({
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

type TransitionHarness = {
  app: App;
  element: TrackingElement;
  show: Ref<boolean>;
  transition: ReturnType<typeof useTransition>;
};

const mountedApps: App[] = [];

function mountTransition(
  initialShow: boolean,
  callbacks: TransitionCallbacks,
  config: Omit<TransitionConfig, 'target'> = {}
): TransitionHarness {
  const show = ref(initialShow);
  const element = new TrackingElement();
  const target = ref(element as unknown as HTMLElement);
  let transition: ReturnType<typeof useTransition> | undefined;

  const App = defineComponent({
    setup() {
      transition = useTransition(
        () => show.value,
        {
          duration: 100,
          ...config,
          target,
        },
        callbacks
      );
      return () => null;
    },
  });

  const app = testRenderer.createApp(App);
  app.mount({});
  mountedApps.push(app);

  if (!transition) throw new Error('transition harness did not initialize');
  return { app, element, show, transition };
}

async function reachEndDetection() {
  await nextTick();
  await nextTick();
  await nextTick();
  vi.advanceTimersToNextTimer();
  await nextTick();
}

function reachConfiguredEnd(duration = 100) {
  vi.setSystemTime(Date.now() + duration);
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  for (const app of mountedApps.splice(0).reverse()) app.unmount();
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('useTransition lifecycle completion', () => {
  it('completes enter by root event and leave by fallback exactly once', async () => {
    const onAfterEnter = vi.fn();
    const onAfterLeave = vi.fn();
    const { element, show } = mountTransition(false, { onAfterEnter, onAfterLeave });

    show.value = true;
    await reachEndDetection();

    expect(element.listenerCount()).toBe(1);
    expect(vi.getTimerCount()).toBe(1);

    reachConfiguredEnd();
    element.dispatchEnd('transitionend', { propertyName: 'opacity' });
    vi.advanceTimersByTime(200);

    expect(onAfterEnter).toHaveBeenCalledTimes(1);
    expect(element.listenerCount()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);

    show.value = false;
    await reachEndDetection();
    vi.advanceTimersByTime(100);
    element.dispatchEnd('transitionend', { propertyName: 'opacity' });

    expect(onAfterLeave).toHaveBeenCalledTimes(1);
    expect(element.listenerCount()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('ignores bubbled, unrelated, and premature end events', async () => {
    const onAfterEnter = vi.fn();
    const { element, show } = mountTransition(false, { onAfterEnter });

    show.value = true;
    await reachEndDetection();
    element.dispatchEnd('transitionend', { target: {}, propertyName: 'opacity' });
    element.dispatchEnd('transitionend', { propertyName: 'width' });
    element.dispatchEnd('animationend', { animationName: 'pulse' });
    element.dispatchEnd('transitionend', { propertyName: 'opacity' });

    expect(onAfterEnter).not.toHaveBeenCalled();
    expect(element.listenerCount()).toBe(1);
    expect(vi.getTimerCount()).toBe(1);

    reachConfiguredEnd();
    element.dispatchEnd('animationend', { animationName: 'pulse' });
    element.dispatchEnd('transitionend', { propertyName: 'width' });
    expect(onAfterEnter).not.toHaveBeenCalled();

    element.dispatchEnd('transitionend', { propertyName: 'transform' });

    expect(onAfterEnter).toHaveBeenCalledTimes(1);
    expect(element.listenerCount()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels pending enter resources without completing it', async () => {
    const onAfterEnter = vi.fn();
    const { element, show, transition } = mountTransition(false, { onAfterEnter });

    show.value = true;
    await reachEndDetection();
    transition.cancel();

    expect(element.listenerCount()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    expect(transition.state.value).toMatchObject({
      inited: true,
      display: true,
      active: true,
      entering: false,
      leaving: false,
    });

    element.dispatchEnd('transitionend');
    vi.advanceTimersByTime(200);
    expect(onAfterEnter).not.toHaveBeenCalled();
  });

  it('keeps cancel stable when the matching model watcher has not flushed yet', async () => {
    const onAfterEnter = vi.fn();
    const { element, show, transition } = mountTransition(false, { onAfterEnter });

    show.value = true;
    transition.cancel();
    await reachEndDetection();

    expect(transition.state.value).toMatchObject({
      inited: true,
      display: true,
      active: true,
      entering: false,
      leaving: false,
    });
    expect(element.listenerCount()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    expect(onAfterEnter).not.toHaveBeenCalled();
  });

  it('cancels pending leave into the hidden stable state', async () => {
    const onAfterLeave = vi.fn();
    const { element, show, transition } = mountTransition(
      true,
      { onAfterLeave },
      { appear: false }
    );

    show.value = false;
    await reachEndDetection();
    transition.cancel();

    expect(transition.state.value).toMatchObject({
      inited: false,
      display: false,
      active: false,
      entering: false,
      leaving: false,
    });
    expect(element.listenerCount()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);

    vi.advanceTimersByTime(200);
    expect(onAfterLeave).not.toHaveBeenCalled();
  });

  it('restores rendering when enter is triggered manually after a completed leave', async () => {
    const onAfterEnter = vi.fn();
    const { element, transition } = mountTransition(false, { onAfterEnter });

    expect(transition.display.value).toBe(false);
    transition.enter();

    expect(transition.state.value).toMatchObject({
      inited: true,
      display: true,
      active: false,
      entering: true,
      leaving: false,
    });

    await reachEndDetection();
    reachConfiguredEnd();
    element.dispatchEnd('transitionend', { propertyName: 'opacity' });

    expect(onAfterEnter).toHaveBeenCalledTimes(1);
    expect(transition.state.value).toMatchObject({
      inited: true,
      display: true,
      active: true,
      entering: false,
      leaving: false,
    });
  });

  it('accepts only the matching bounce animation end signal', async () => {
    const onAfterEnter = vi.fn();
    const { element, show } = mountTransition(false, { onAfterEnter }, { name: 'bounce-in-up' });

    show.value = true;
    await reachEndDetection();
    reachConfiguredEnd();

    element.dispatchEnd('transitionend', { propertyName: 'opacity' });
    element.dispatchEnd('animationend', { animationName: 'pulse' });
    expect(onAfterEnter).not.toHaveBeenCalled();

    element.dispatchEnd('animationend', { animationName: 'lk-bounce-in-up' });
    expect(onAfterEnter).toHaveBeenCalledTimes(1);
  });

  it('rejects completion when show reverses before its watcher flushes', async () => {
    const onAfterEnter = vi.fn();
    const onAfterLeave = vi.fn();
    const { element, show } = mountTransition(false, { onAfterEnter, onAfterLeave });

    show.value = true;
    await reachEndDetection();
    reachConfiguredEnd();

    show.value = false;
    element.dispatchEnd('transitionend', { propertyName: 'opacity' });
    expect(onAfterEnter).not.toHaveBeenCalled();

    await reachEndDetection();
    reachConfiguredEnd();

    show.value = true;
    element.dispatchEnd('transitionend', { propertyName: 'opacity' });
    expect(onAfterLeave).not.toHaveBeenCalled();

    await reachEndDetection();
    reachConfiguredEnd();
    element.dispatchEnd('transitionend', { propertyName: 'opacity' });

    expect(onAfterEnter).toHaveBeenCalledTimes(1);
    expect(onAfterLeave).not.toHaveBeenCalled();
  });

  it('cancels pending enter on unmount without callbacks or resources', async () => {
    const onAfterEnter = vi.fn();
    const onAfterLeave = vi.fn();
    const { app, element, show } = mountTransition(false, { onAfterEnter, onAfterLeave });

    show.value = true;
    await reachEndDetection();
    app.unmount();

    expect(onAfterEnter).not.toHaveBeenCalled();
    expect(onAfterLeave).not.toHaveBeenCalled();
    expect(element.listenerCount()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);

    element.dispatchEnd('transitionend');
    vi.advanceTimersByTime(200);
    expect(onAfterEnter).not.toHaveBeenCalled();
  });

  it('cancels pending leave on unmount without callbacks or resources', async () => {
    const onAfterLeave = vi.fn();
    const { app, element, show } = mountTransition(true, { onAfterLeave }, { appear: false });

    show.value = false;
    await reachEndDetection();
    app.unmount();

    expect(onAfterLeave).not.toHaveBeenCalled();
    expect(element.listenerCount()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);

    element.dispatchEnd('transitionend');
    vi.advanceTimersByTime(200);
    expect(onAfterLeave).not.toHaveBeenCalled();
  });

  it('invalidates callbacks from transitions superseded in both directions', async () => {
    const onAfterEnter = vi.fn();
    const onAfterLeave = vi.fn();
    const { element, show } = mountTransition(false, { onAfterEnter, onAfterLeave });

    show.value = true;
    await reachEndDetection();

    show.value = false;
    await reachEndDetection();

    show.value = true;
    await reachEndDetection();

    expect(element.listenerCount()).toBe(1);
    expect(vi.getTimerCount()).toBe(1);

    reachConfiguredEnd();
    element.dispatchEnd('transitionend', { propertyName: 'opacity' });
    vi.advanceTimersByTime(200);

    expect(onAfterEnter).toHaveBeenCalledTimes(1);
    expect(onAfterLeave).not.toHaveBeenCalled();
    expect(element.listenerCount()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
