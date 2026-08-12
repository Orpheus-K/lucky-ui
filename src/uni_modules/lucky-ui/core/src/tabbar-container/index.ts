/**
 * Tabbar 页面容器系统
 * @description 实现单页面内的 Tab 切换，避免页面重新渲染导致的闪烁
 *
 * 1. 只有一个真正的"页面"作为 Tabbar 容器
 * 2. 各个 Tab 内容作为组件存在，通过 v-show 或 keep-alive 切换
 * 3. Tabbar 组件固定在容器底部，不随 Tab 内容变化
 * 4. 支持懒加载：首次切换到某个 Tab 时才加载其内容
 */

import { computed, markRaw, ref, type Component, type ComputedRef, type Ref } from 'vue';

/** Tab 配置项 */
export interface TabConfig {
  /** Tab 唯一标识 */
  id: string;
  /** Tab 显示名称 */
  label: string;
  /** Tab 图标 */
  icon: string;
  /** 选中态图标 */
  selectedIcon?: string;
  /** 选中态优先尝试 fill 图标 */
  activeIconFill?: boolean;
  /** Tab 内容组件（懒加载时为函数） */
  component?: Component | (() => Promise<{ default: Component }>);
  /** 是否保持状态（类似 keep-alive） */
  keepAlive?: boolean;
  /** 徽标数量 */
  badge?: number;
  /** 是否显示小红点 */
  dot?: boolean;
}

/** Tab 实例状态 */
export interface TabInstance {
  /** 组件引用 */
  component: Component | null;
  /** 是否已加载 */
  loaded: boolean;
  /** 是否正在加载 */
  loading: boolean;
  /** 加载错误 */
  error: Error | null;
}

/** Tabbar 容器状态 */
export interface TabbarContainerState {
  /** 当前激活的 Tab ID */
  activeId: string;
  /** Tab 配置列表 */
  tabs: TabConfig[];
  /** Tab 实例映射 */
  instances: Map<string, TabInstance>;
  /** 已访问过的 Tab ID 集合 */
  visitedTabs: Set<string>;
}

/** 兼容旧的全局 composable 返回值 */
export interface UseTabbarContainerReturn {
  activeId: ComputedRef<string>;
  tabs: ComputedRef<TabConfig[]>;
  visitedTabs: ComputedRef<Set<string>>;
  switchTab: (tabId: string) => Promise<void>;
  preloadTab: (tabId: string) => Promise<void>;
  preloadTabs: (tabIds: string[]) => Promise<void>;
  getTabInstance: (tabId: string) => TabInstance | undefined;
  updateBadge: (tabId: string, badge?: number, dot?: boolean) => void;
  isVisited: (tabId: string) => boolean;
}

/** 每个 Tabbar 容器独占的状态与行为 owner */
export interface TabbarContainerOwner {
  activeId: ComputedRef<string>;
  tabs: ComputedRef<TabConfig[]>;
  visitedTabs: ComputedRef<Set<string>>;
  init: (tabs: TabConfig[], defaultTabId?: string) => void;
  switchTab: (tabId: string) => Promise<boolean>;
  preloadTab: (tabId: string) => Promise<void>;
  preloadTabs: (tabIds: string[]) => Promise<void>;
  getActiveTabId: () => string;
  getTabs: () => TabConfig[];
  getTabInstance: (tabId: string) => TabInstance | undefined;
  isVisited: (tabId: string) => boolean;
  updateBadge: (tabId: string, badge?: number, dot?: boolean) => void;
  setDebug: (enabled: boolean) => void;
  reset: () => void;
}

interface ActiveSwitch {
  tabId: string;
  lifecycle: number;
  generation: number;
  instance: TabInstance;
  promise: Promise<boolean>;
}

function createTabbarState(): Ref<TabbarContainerState> {
  return ref({
    activeId: '',
    tabs: [],
    instances: new Map(),
    visitedTabs: new Set(),
  });
}

function createTabbarOwner(
  state: Ref<TabbarContainerState>,
  isolateTabConfigs: boolean
): TabbarContainerOwner {
  let debugMode = false;
  let lifecycleGeneration = 0;
  let switchGeneration = 0;
  let activeSwitch: ActiveSwitch | undefined;
  const switchLoadPromises = new Map<TabInstance, Promise<Component>>();

  const activeId = computed(() => state.value.activeId);
  const tabs = computed(() => state.value.tabs);
  const visitedTabs = computed(() => state.value.visitedTabs);

  function log(...args: unknown[]): void {
    if (debugMode) {
      console.log('[TabbarContainer]', ...args);
    }
  }

  function isCurrentInstance(lifecycle: number, tabId: string, instance: TabInstance): boolean {
    return lifecycleGeneration === lifecycle && state.value.instances.get(tabId) === instance;
  }

  function isCurrentSwitch(
    lifecycle: number,
    generation: number,
    tabId: string,
    instance: TabInstance
  ): boolean {
    return switchGeneration === generation && isCurrentInstance(lifecycle, tabId, instance);
  }

  function invalidateLifecycle(): void {
    lifecycleGeneration += 1;
    switchGeneration += 1;
    state.value.instances.forEach(instance => {
      instance.loading = false;
    });
    activeSwitch = undefined;
    switchLoadPromises.clear();
  }

  function loadSwitchComponent(
    tab: TabConfig,
    instance: TabInstance
  ): Component | Promise<Component> {
    if (typeof tab.component !== 'function') {
      return tab.component as Component;
    }

    const pendingLoad = switchLoadPromises.get(instance);
    if (pendingLoad) return pendingLoad;

    let loadPromise: Promise<Component>;
    try {
      loadPromise = Promise.resolve(
        (tab.component as () => Promise<{ default: Component }>)()
      ).then(module => module.default);
    } catch (error) {
      loadPromise = Promise.reject(error);
    }
    switchLoadPromises.set(instance, loadPromise);
    void loadPromise.then(
      () => {
        if (switchLoadPromises.get(instance) === loadPromise) {
          switchLoadPromises.delete(instance);
        }
      },
      () => {
        if (switchLoadPromises.get(instance) === loadPromise) {
          switchLoadPromises.delete(instance);
        }
      }
    );
    return loadPromise;
  }

  async function executeSwitch(
    tab: TabConfig,
    instance: TabInstance,
    lifecycle: number,
    generation: number
  ): Promise<boolean> {
    if (!instance.loaded && !instance.loading) {
      instance.loading = true;
      log('Loading tab component:', tab.id);

      try {
        if (!tab.component) {
          if (!isCurrentSwitch(lifecycle, generation, tab.id, instance)) return false;
          instance.component = null;
          instance.loaded = true;
          instance.error = null;
          log('Tab component skipped (no component):', tab.id);
        } else if (typeof tab.component === 'function') {
          const component = await loadSwitchComponent(tab, instance);
          if (!isCurrentSwitch(lifecycle, generation, tab.id, instance)) return false;
          instance.component = markRaw(component);
          instance.loaded = true;
          instance.error = null;
          log('Tab component loaded:', tab.id);
        } else {
          if (!isCurrentSwitch(lifecycle, generation, tab.id, instance)) return false;
          instance.component = markRaw(tab.component);
          instance.loaded = true;
          instance.error = null;
          log('Tab component loaded:', tab.id);
        }
      } catch (error) {
        if (!isCurrentSwitch(lifecycle, generation, tab.id, instance)) return false;
        instance.error = error as Error;
        console.error(`[TabbarContainer] Failed to load tab: ${tab.id}`, error);
      } finally {
        if (isCurrentSwitch(lifecycle, generation, tab.id, instance)) {
          instance.loading = false;
        }
      }
    }

    if (!isCurrentSwitch(lifecycle, generation, tab.id, instance)) return false;

    state.value.activeId = tab.id;
    state.value.visitedTabs.add(tab.id);
    log('Switched to tab:', tab.id);
    return true;
  }

  async function switchTab(tabId: string): Promise<boolean> {
    const tab = state.value.tabs.find(item => item.id === tabId);
    if (!tab) {
      console.warn(`[TabbarContainer] Tab not found: ${tabId}`);
      return false;
    }

    const instance = state.value.instances.get(tabId);
    if (!instance) return false;

    if (state.value.activeId === tabId && (instance.loaded || instance.loading)) {
      return false;
    }

    const pendingSwitch = activeSwitch;
    if (
      pendingSwitch?.tabId === tabId &&
      isCurrentInstance(pendingSwitch.lifecycle, tabId, pendingSwitch.instance)
    ) {
      await pendingSwitch.promise;
      return false;
    }

    const generation = ++switchGeneration;
    if (
      pendingSwitch &&
      isCurrentInstance(pendingSwitch.lifecycle, pendingSwitch.tabId, pendingSwitch.instance)
    ) {
      pendingSwitch.instance.loading = false;
    }

    const lifecycle = lifecycleGeneration;
    let resolveSwitch!: (changed: boolean) => void;
    let rejectSwitch!: (reason?: unknown) => void;
    const promise = new Promise<boolean>((resolve, reject) => {
      resolveSwitch = resolve;
      rejectSwitch = reject;
    });
    const currentSwitch: ActiveSwitch = {
      tabId,
      lifecycle,
      generation,
      instance,
      promise,
    };
    activeSwitch = currentSwitch;
    void executeSwitch(tab, instance, lifecycle, generation).then(resolveSwitch, rejectSwitch);

    try {
      return await promise;
    } finally {
      if (activeSwitch === currentSwitch) {
        activeSwitch = undefined;
      }
    }
  }

  function init(tabsConfig: TabConfig[], defaultTabId?: string): void {
    invalidateLifecycle();
    const ownedTabs = isolateTabConfigs ? tabsConfig.map(tab => ({ ...tab })) : tabsConfig;
    state.value.tabs = ownedTabs;
    state.value.instances.clear();
    state.value.visitedTabs.clear();
    state.value.activeId = '';

    ownedTabs.forEach(tab => {
      state.value.instances.set(tab.id, {
        component: null,
        loaded: false,
        loading: false,
        error: null,
      });
    });

    const initialTab = ownedTabs.some(tab => tab.id === defaultTabId)
      ? defaultTabId!
      : ownedTabs[0]?.id || '';
    if (initialTab) {
      void switchTab(initialTab);
    }

    log(
      'Container initialized with tabs:',
      ownedTabs.map(tab => tab.id)
    );
  }

  function getActiveTabId(): string {
    return state.value.activeId;
  }

  function getTabs(): TabConfig[] {
    return state.value.tabs;
  }

  function getTabInstance(tabId: string): TabInstance | undefined {
    return state.value.instances.get(tabId);
  }

  function isVisited(tabId: string): boolean {
    return state.value.visitedTabs.has(tabId);
  }

  async function preloadTab(tabId: string): Promise<void> {
    const tab = state.value.tabs.find(item => item.id === tabId);
    const instance = state.value.instances.get(tabId);

    if (!tab || !instance || instance.loaded || instance.loading) return;

    const lifecycle = lifecycleGeneration;
    instance.loading = true;
    log('Preloading tab:', tabId);

    try {
      if (!tab.component) {
        if (!isCurrentInstance(lifecycle, tabId, instance)) return;
        instance.component = null;
        instance.loaded = true;
        log('Tab preload skipped (no component):', tabId);
      } else if (typeof tab.component === 'function') {
        const module = await (tab.component as () => Promise<{ default: Component }>)();
        if (!isCurrentInstance(lifecycle, tabId, instance)) return;
        instance.component = markRaw(module.default);
        instance.loaded = true;
        log('Tab preloaded:', tabId);
      } else {
        if (!isCurrentInstance(lifecycle, tabId, instance)) return;
        instance.component = markRaw(tab.component);
        instance.loaded = true;
        log('Tab preloaded:', tabId);
      }
    } catch (error) {
      if (!isCurrentInstance(lifecycle, tabId, instance)) return;
      instance.error = error as Error;
      console.error(`[TabbarContainer] Failed to preload tab: ${tabId}`, error);
    } finally {
      if (isCurrentInstance(lifecycle, tabId, instance)) {
        instance.loading = false;
      }
    }
  }

  async function preloadTabs(tabIds: string[]): Promise<void> {
    await Promise.all(tabIds.map(tabId => preloadTab(tabId)));
  }

  function updateBadge(tabId: string, badge?: number, dot?: boolean): void {
    const tab = state.value.tabs.find(item => item.id === tabId);
    if (!tab) return;
    if (badge !== undefined) tab.badge = badge;
    if (dot !== undefined) tab.dot = dot;
  }

  function setDebug(enabled: boolean): void {
    debugMode = enabled;
  }

  function reset(): void {
    invalidateLifecycle();
    state.value.activeId = '';
    state.value.tabs = [];
    state.value.instances.clear();
    state.value.visitedTabs.clear();
    log('Container reset');
  }

  return {
    activeId,
    tabs,
    visitedTabs,
    init,
    switchTab,
    preloadTab,
    preloadTabs,
    getActiveTabId,
    getTabs,
    getTabInstance,
    isVisited,
    updateBadge,
    setDebug,
    reset,
  };
}

/** 创建完全独立的 Tabbar 容器 owner */
export function createTabbarContainer(): TabbarContainerOwner {
  return createTabbarOwner(createTabbarState(), true);
}

/** 旧函数 API 继续绑定同一个默认 owner，以保持兼容 */
const defaultState = createTabbarState();
const defaultOwner = createTabbarOwner(defaultState, false);

export function initTabbarContainer(tabs: TabConfig[], defaultTabId?: string): void {
  defaultOwner.init(tabs, defaultTabId);
}

export async function switchTab(tabId: string): Promise<void> {
  await defaultOwner.switchTab(tabId);
}

export function getActiveTabId(): string {
  return defaultOwner.getActiveTabId();
}

export function getTabs(): TabConfig[] {
  return defaultOwner.getTabs();
}

export function getTabInstance(tabId: string): TabInstance | undefined {
  return defaultOwner.getTabInstance(tabId);
}

export function isTabVisited(tabId: string): boolean {
  return defaultOwner.isVisited(tabId);
}

export async function preloadTab(tabId: string): Promise<void> {
  await defaultOwner.preloadTab(tabId);
}

export async function preloadTabs(tabIds: string[]): Promise<void> {
  await defaultOwner.preloadTabs(tabIds);
}

export function updateTabBadge(tabId: string, badge?: number, dot?: boolean): void {
  defaultOwner.updateBadge(tabId, badge, dot);
}

export function setTabbarDebug(enabled: boolean): void {
  defaultOwner.setDebug(enabled);
}

export function resetTabbarContainer(): void {
  defaultOwner.reset();
}

/** 兼容旧的全局单例 composable；多实例组件应使用 createTabbarContainer */
export function useTabbarContainer(): UseTabbarContainerReturn {
  return {
    activeId: defaultOwner.activeId,
    tabs: defaultOwner.tabs,
    visitedTabs: defaultOwner.visitedTabs,
    switchTab,
    preloadTab,
    preloadTabs,
    getTabInstance,
    updateBadge: updateTabBadge,
    isVisited: isTabVisited,
  };
}

export const tabbarState = defaultState;
