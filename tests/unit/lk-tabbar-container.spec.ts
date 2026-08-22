import { describe, expect, it, vi } from 'vitest';
import type { Component } from 'vue';
import {
  createTabbarContainer,
  getActiveTabId,
  getTabs as getLegacyTabs,
  initTabbarContainer,
  resetTabbarContainer,
  switchTab as switchLegacyTab,
  type TabConfig,
  updateTabBadge,
} from '../../src/uni_modules/lucky-ui/core/src/tabbar-container';
import {
  createTabbarContainerChangeController,
  getTabbarContainerPreloadIds,
  isTabbarContainerSlidingMode,
  resolveTabbarContainerActiveBgStyle,
  resolveTabbarContainerBadgeText,
  resolveTabbarContainerClass,
  resolveTabbarContainerCopyText,
  resolveTabbarContainerFillIconName,
  resolveTabbarContainerIcon,
  resolveTabbarContainerSafeAreaBottom,
  resolveTabbarContainerStyle,
  shouldChangeTabbarContainerTab,
  shouldShowTabbarContainerBadge,
} from '../../src/uni_modules/lucky-ui/components/lk-tabbar-container/tabbar-container.utils';

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve!: Deferred<T>['resolve'];
  let reject!: Deferred<T>['reject'];
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, resolve, reject };
}

function createTab(id: string, component?: TabConfig['component']): TabConfig {
  return { id, label: id, icon: id, component };
}

function createDeferredLoader() {
  const result = deferred<{ default: Component }>();
  return {
    ...result,
    loader: vi.fn(() => result.promise),
  };
}

describe('lk-tabbar-container layout and navigation rules', () => {
  const tabs = [
    { id: 'home', label: '首页', icon: 'house' },
    { id: 'cart', label: '购物车', icon: 'cart', activeIconFill: true },
    { id: 'mine', label: '我的', icon: 'user', selectedIcon: 'user-selected' },
  ];

  it('resolves safe area, mode class and copy fallback', () => {
    expect(
      resolveTabbarContainerSafeAreaBottom({
        safeAreaInsets: { bottom: 20 },
      })
    ).toBe(20);
    expect(
      resolveTabbarContainerSafeAreaBottom({
        screenHeight: 812,
        safeArea: { bottom: 778 },
      })
    ).toBe(34);

    expect(isTabbarContainerSlidingMode('block')).toBe(true);
    expect(isTabbarContainerSlidingMode('float')).toBe(false);
    expect(
      resolveTabbarContainerCopyText({
        value: '',
        fallback: '加载中',
      })
    ).toBe('加载中');
    expect(
      resolveTabbarContainerClass({
        mode: 'ripple',
        fixed: true,
        safeMode: false,
        renderMode: 'auto',
        customClass: 'custom',
      })
    ).toEqual([
      'lk-tabbar-container',
      'lk-tabbar-container--ripple',
      'lk-tabbar-container--render-auto',
      {
        'is-fixed-tabbar': true,
        'is-static-tabbar': false,
        'is-safe-mode': false,
      },
      'custom',
    ]);
  });

  it('builds container style and active indicator geometry', () => {
    expect(
      resolveTabbarContainerStyle({
        preferRuntimeSafeArea: false,
        safeAreaBottom: 34,
        customStyle: { background: '#fff' },
      })
    ).toEqual({
      '--lk-tabbar-container-safe-area-bottom': '34px',
      background: '#fff',
    });
    expect(
      resolveTabbarContainerActiveBgStyle({
        count: 4,
        activeIndex: 2,
      })
    ).toEqual({
      '--item-width': '25%',
      '--item-left': '50%',
      '--item-count': 4,
      '--active-index': 2,
      '--active-center': '62.5%',
    });
    expect(
      resolveTabbarContainerActiveBgStyle({
        count: 0,
        activeIndex: -1,
      })
    ).toEqual({ display: 'none' });
  });

  it('resolves active icons and preload ids', () => {
    expect(resolveTabbarContainerFillIconName('cart')).toBe('cart-fill');
    expect(resolveTabbarContainerFillIconName('cart-fill')).toBe('cart-fill');
    expect(
      resolveTabbarContainerIcon({
        tab: tabs[1],
        activeId: 'cart',
      })
    ).toBe('cart-fill');
    expect(
      resolveTabbarContainerIcon({
        tab: tabs[2],
        activeId: 'mine',
      })
    ).toBe('user-selected');
    expect(
      resolveTabbarContainerIcon({
        tab: tabs[0],
        activeId: 'cart',
      })
    ).toBe('house');
    expect(
      getTabbarContainerPreloadIds({
        tabs,
        activeId: 'cart',
      })
    ).toEqual(['home', 'mine']);
  });

  it('guards tab changes and badge display', () => {
    expect(
      shouldChangeTabbarContainerTab({
        nextTabId: 'cart',
        activeId: 'home',
      })
    ).toBe(true);
    expect(
      shouldChangeTabbarContainerTab({
        nextTabId: 'home',
        activeId: 'home',
      })
    ).toBe(false);
    expect(shouldShowTabbarContainerBadge(1)).toBe(true);
    expect(shouldShowTabbarContainerBadge(0)).toBe(false);
    expect(resolveTabbarContainerBadgeText(120)).toBe('99+');
    expect(resolveTabbarContainerBadgeText(undefined)).toBe('');
  });
});

describe('tabbar-container instance ownership', () => {
  it('keeps the legacy singleton function API compatible', async () => {
    const legacyTabs = [createTab('first'), createTab('second')];
    resetTabbarContainer();
    initTabbarContainer(legacyTabs, 'first');

    expect(getActiveTabId()).toBe('first');
    await expect(switchLegacyTab('second')).resolves.toBeUndefined();
    expect(getActiveTabId()).toBe('second');
    updateTabBadge('first', 2, true);
    expect(legacyTabs[0]).toMatchObject({ badge: 2, dot: true });
    legacyTabs[0].label = 'updated';
    expect(getLegacyTabs()[0].label).toBe('updated');

    resetTabbarContainer();
    expect(getActiveTabId()).toBe('');
  });

  it('keeps two initialized owners isolated even when tab ids overlap', async () => {
    const homeA = createDeferredLoader();
    const homeB = createDeferredLoader();
    const ownerA = createTabbarContainer();
    const ownerB = createTabbarContainer();

    ownerA.init([createTab('home', homeA.loader), createTab('a-only')], 'home');
    ownerB.init([createTab('home', homeB.loader), createTab('b-only')], 'home');
    const waitForA = ownerA.switchTab('home');
    const waitForB = ownerB.switchTab('home');

    expect(ownerA.getTabs().map(tab => tab.id)).toEqual(['home', 'a-only']);
    expect(ownerB.getTabs().map(tab => tab.id)).toEqual(['home', 'b-only']);
    expect(ownerA.getTabInstance('home')?.loading).toBe(true);
    expect(ownerB.getTabInstance('home')?.loading).toBe(true);
    expect(ownerA.getActiveTabId()).toBe('');
    expect(ownerB.getActiveTabId()).toBe('');

    homeB.resolve({ default: { name: 'HomeB' } as Component });
    await expect(waitForB).resolves.toBe(false);
    expect(ownerB.getActiveTabId()).toBe('home');
    expect(ownerA.getActiveTabId()).toBe('');

    homeA.resolve({ default: { name: 'HomeA' } as Component });
    await expect(waitForA).resolves.toBe(false);
    expect(ownerA.getActiveTabId()).toBe('home');

    await expect(ownerA.switchTab('a-only')).resolves.toBe(true);
    expect(ownerA.getActiveTabId()).toBe('a-only');
    expect(ownerB.getActiveTabId()).toBe('home');
    expect(ownerB.getTabInstance('b-only')).toBeDefined();

    ownerA.reset();
    expect(ownerA.getTabs()).toEqual([]);
    expect(ownerB.getTabs().map(tab => tab.id)).toEqual(['home', 'b-only']);
    expect(ownerB.getActiveTabId()).toBe('home');
  });

  it('owns copied tab configs when two owners receive the same input array', () => {
    const sharedTabs = [createTab('home'), createTab('mine')];
    const ownerA = createTabbarContainer();
    const ownerB = createTabbarContainer();

    ownerA.init(sharedTabs, 'home');
    ownerB.init(sharedTabs, 'home');
    ownerA.updateBadge('home', 3, true);

    expect(ownerA.getTabs()[0]).toMatchObject({ badge: 3, dot: true });
    expect(ownerB.getTabs()[0]).not.toHaveProperty('badge');
    expect(ownerB.getTabs()[0]).not.toHaveProperty('dot');
    expect(sharedTabs[0]).not.toHaveProperty('badge');
    expect(ownerA.getTabs()).not.toBe(ownerB.getTabs());
    expect(ownerA.getTabs()[0]).not.toBe(ownerB.getTabs()[0]);
  });

  it('lets only the latest slow-to-fast switch resolve into state', async () => {
    const slow = createDeferredLoader();
    const fast = createDeferredLoader();
    const slowComponent = { name: 'SlowPane' } as Component;
    const fastComponent = { name: 'FastPane' } as Component;
    const owner = createTabbarContainer();
    owner.init(
      [createTab('base'), createTab('slow', slow.loader), createTab('fast', fast.loader)],
      'base'
    );

    const slowSwitch = owner.switchTab('slow');
    const slowInstance = owner.getTabInstance('slow')!;
    expect(slowInstance.loading).toBe(true);

    const fastSwitch = owner.switchTab('fast');
    const fastInstance = owner.getTabInstance('fast')!;
    expect(slowInstance.loading).toBe(false);
    expect(fastInstance.loading).toBe(true);

    fast.resolve({ default: fastComponent });
    await expect(fastSwitch).resolves.toBe(true);
    expect(owner.getActiveTabId()).toBe('fast');
    expect(fastInstance.component).toBe(fastComponent);
    expect(fastInstance.loading).toBe(false);

    slow.resolve({ default: slowComponent });
    await expect(slowSwitch).resolves.toBe(false);
    expect(owner.getActiveTabId()).toBe('fast');
    expect(slowInstance).toMatchObject({
      component: null,
      loaded: false,
      loading: false,
      error: null,
    });
  });

  it('ignores a stale rejection while the latest rejection owns the error state', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const slow = createDeferredLoader();
    const fast = createDeferredLoader();
    const slowError = new Error('stale slow failure');
    const fastError = new Error('latest fast failure');
    const owner = createTabbarContainer();
    owner.init(
      [createTab('base'), createTab('slow', slow.loader), createTab('fast', fast.loader)],
      'base'
    );

    const slowSwitch = owner.switchTab('slow');
    const slowInstance = owner.getTabInstance('slow')!;
    const fastSwitch = owner.switchTab('fast');
    const fastInstance = owner.getTabInstance('fast')!;

    fast.reject(fastError);
    await expect(fastSwitch).resolves.toBe(true);
    expect(owner.getActiveTabId()).toBe('fast');
    expect(fastInstance).toMatchObject({ loading: false, error: fastError });

    slow.reject(slowError);
    await expect(slowSwitch).resolves.toBe(false);
    expect(owner.getActiveTabId()).toBe('fast');
    expect(slowInstance).toMatchObject({ loading: false, error: null });
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith(
      '[TabbarContainer] Failed to load tab: fast',
      fastError
    );
    consoleError.mockRestore();
  });

  it('invalidates a pending switch on reset without allowing late writes', async () => {
    const slow = createDeferredLoader();
    const slowComponent = { name: 'SlowPane' } as Component;
    const owner = createTabbarContainer();
    owner.init([createTab('base'), createTab('slow', slow.loader)], 'base');

    const slowSwitch = owner.switchTab('slow');
    const staleInstance = owner.getTabInstance('slow')!;
    expect(staleInstance.loading).toBe(true);

    owner.reset();
    expect(staleInstance.loading).toBe(false);
    expect(owner.getActiveTabId()).toBe('');
    expect(owner.getTabs()).toEqual([]);

    slow.resolve({ default: slowComponent });
    await expect(slowSwitch).resolves.toBe(false);
    expect(staleInstance).toMatchObject({
      component: null,
      loaded: false,
      loading: false,
      error: null,
    });
    expect(owner.getActiveTabId()).toBe('');
  });

  it('keeps a re-initialized same-id instance safe from an old promise', async () => {
    const oldLoader = createDeferredLoader();
    const oldComponent = { name: 'OldPane' } as Component;
    const replacementComponent = { name: 'ReplacementPane' } as Component;
    const owner = createTabbarContainer();
    owner.init([createTab('base'), createTab('shared', oldLoader.loader)], 'base');

    const oldSwitch = owner.switchTab('shared');
    const oldInstance = owner.getTabInstance('shared')!;
    owner.init([createTab('shared', replacementComponent)], 'shared');
    const replacementInstance = owner.getTabInstance('shared')!;

    expect(replacementInstance).not.toBe(oldInstance);
    expect(owner.getActiveTabId()).toBe('shared');
    expect(replacementInstance.component).toMatchObject({ name: 'ReplacementPane' });
    expect(replacementInstance.loaded).toBe(true);

    oldLoader.resolve({ default: oldComponent });
    await expect(oldSwitch).resolves.toBe(false);
    expect(replacementInstance.component).toMatchObject({ name: 'ReplacementPane' });
    expect(replacementInstance).toMatchObject({ loaded: true, loading: false, error: null });
    expect(oldInstance).toMatchObject({
      component: null,
      loaded: false,
      loading: false,
      error: null,
    });
  });

  it('falls back to the first tab when re-init removes the requested default', () => {
    const owner = createTabbarContainer();
    owner.init([createTab('first'), createTab('removed')], 'removed');
    expect(owner.getActiveTabId()).toBe('removed');

    owner.init([createTab('first')], 'removed');

    expect(owner.getActiveTabId()).toBe('first');
    expect(owner.isVisited('first')).toBe(true);
  });

  it('deduplicates the same pending target and ignores the current active target', async () => {
    const target = createDeferredLoader();
    const targetComponent = { name: 'TargetPane' } as Component;
    const owner = createTabbarContainer();
    owner.init([createTab('base'), createTab('target', target.loader)], 'base');

    const firstSwitch = owner.switchTab('target');
    const duplicateSwitch = owner.switchTab('target');
    expect(target.loader).toHaveBeenCalledTimes(1);

    target.resolve({ default: targetComponent });
    await expect(firstSwitch).resolves.toBe(true);
    await expect(duplicateSwitch).resolves.toBe(false);
    expect(owner.getActiveTabId()).toBe('target');
    await expect(owner.switchTab('target')).resolves.toBe(false);
    expect(target.loader).toHaveBeenCalledTimes(1);
  });

  it('reuses an in-flight loader when the latest intent returns to the same tab', async () => {
    const slow = createDeferredLoader();
    const fast = createDeferredLoader();
    const owner = createTabbarContainer();
    owner.init(
      [createTab('base'), createTab('slow', slow.loader), createTab('fast', fast.loader)],
      'base'
    );

    const firstSlowSwitch = owner.switchTab('slow');
    const fastSwitch = owner.switchTab('fast');
    const latestSlowSwitch = owner.switchTab('slow');

    expect(slow.loader).toHaveBeenCalledTimes(1);
    expect(owner.getTabInstance('slow')?.loading).toBe(true);

    slow.resolve({ default: { name: 'SlowPane' } as Component });
    await expect(firstSlowSwitch).resolves.toBe(false);
    await expect(latestSlowSwitch).resolves.toBe(true);
    expect(owner.getActiveTabId()).toBe('slow');
    expect(owner.getTabInstance('slow')).toMatchObject({
      loaded: true,
      loading: false,
      error: null,
    });

    fast.resolve({ default: { name: 'FastPane' } as Component });
    await expect(fastSwitch).resolves.toBe(false);
    expect(owner.getActiveTabId()).toBe('slow');
    expect(owner.getTabInstance('fast')).toMatchObject({
      component: null,
      loaded: false,
      loading: false,
      error: null,
    });
  });
});

describe('tabbar-container change event ownership', () => {
  it('emits each accepted intent once and only emits change for the latest result', async () => {
    const slow = createDeferredLoader();
    const fast = createDeferredLoader();
    const owner = createTabbarContainer();
    owner.init(
      [createTab('base'), createTab('slow', slow.loader), createTab('fast', fast.loader)],
      'base'
    );
    const beforeChange = vi.fn();
    const change = vi.fn();
    const controller = createTabbarContainerChangeController({
      getActiveId: owner.getActiveTabId,
      switchTab: owner.switchTab,
      onBeforeChange: beforeChange,
      onChange: change,
    });

    const slowClick = controller.switchTo('slow');
    await expect(controller.switchTo('slow')).resolves.toBe(false);
    const fastClick = controller.switchTo('fast');

    expect(beforeChange.mock.calls).toEqual([
      ['slow', 'base'],
      ['fast', 'base'],
    ]);
    fast.resolve({ default: { name: 'FastPane' } as Component });
    await expect(fastClick).resolves.toBe(true);
    expect(change).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenLastCalledWith('fast');

    slow.resolve({ default: { name: 'SlowPane' } as Component });
    await expect(slowClick).resolves.toBe(false);
    await expect(controller.switchTo('fast')).resolves.toBe(false);
    expect(beforeChange).toHaveBeenCalledTimes(2);
    expect(change).toHaveBeenCalledTimes(1);
  });

  it('does not emit change after controller invalidation and owner reset', async () => {
    const slow = createDeferredLoader();
    const owner = createTabbarContainer();
    owner.init([createTab('base'), createTab('slow', slow.loader)], 'base');
    const beforeChange = vi.fn();
    const change = vi.fn();
    const controller = createTabbarContainerChangeController({
      getActiveId: owner.getActiveTabId,
      switchTab: owner.switchTab,
      onBeforeChange: beforeChange,
      onChange: change,
    });

    const pendingClick = controller.switchTo('slow');
    controller.invalidate();
    owner.reset();
    slow.resolve({ default: { name: 'SlowPane' } as Component });

    await expect(pendingClick).resolves.toBe(false);
    expect(beforeChange).toHaveBeenCalledTimes(1);
    expect(change).not.toHaveBeenCalled();
  });
});
