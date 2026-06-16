/**
 * Tabbar 页面容器系统
 * @description 实现单页面内的 Tab 切换，避免页面重新渲染导致的闪烁
 *
 * 1. 只有一个真正的"页面"作为 Tabbar 容器
 * 2. 各个 Tab 内容作为组件存在，通过 v-show 或 keep-alive 切换
 * 3. Tabbar 组件固定在容器底部，不随 Tab 内容变化
 * 4. 支持懒加载：首次切换到某个 Tab 时才加载其内容
 */

import { ref, computed, markRaw, type ComputedRef } from 'vue';
import type { Component } from 'vue';

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
interface TabInstance {
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
interface TabbarContainerState {
  /** 当前激活的 Tab ID */
  activeId: string;
  /** Tab 配置列表 */
  tabs: TabConfig[];
  /** Tab 实例映射 */
  instances: Map<string, TabInstance>;
  /** 已访问过的 Tab ID 集合 */
  visitedTabs: Set<string>;
}

export interface UseTabbarContainerReturn {
  activeId: ComputedRef<string>;
  tabs: ComputedRef<TabConfig[]>;
  visitedTabs: ComputedRef<Set<string>>;
  switchTab: typeof switchTab;
  preloadTab: typeof preloadTab;
  preloadTabs: typeof preloadTabs;
  getTabInstance: typeof getTabInstance;
  updateBadge: typeof updateTabBadge;
  isVisited: typeof isTabVisited;
}

/** 全局状态 */
const state = ref<TabbarContainerState>({
  activeId: '',
  tabs: [],
  instances: new Map(),
  visitedTabs: new Set(),
});

/** 调试模式 */
let debugMode = false;

/** 日志 */
function log(...args: unknown[]): void {
  if (debugMode) {
    console.log('[TabbarContainer]', ...args);
  }
}

/**
 * 初始化 Tabbar 容器
 */
export function initTabbarContainer(tabs: TabConfig[], defaultTabId?: string): void {
  state.value.tabs = tabs;
  state.value.instances.clear();
  state.value.visitedTabs.clear();

  tabs.forEach(tab => {
    state.value.instances.set(tab.id, {
      component: null,
      loaded: false,
      loading: false,
      error: null,
    });
  });

  const initialTab = defaultTabId || tabs[0]?.id || '';
  if (initialTab) {
    switchTab(initialTab);
  }

  log(
    'Container initialized with tabs:',
    tabs.map(t => t.id)
  );
}

/**
 * 切换 Tab
 */
export async function switchTab(tabId: string): Promise<void> {
  const tab = state.value.tabs.find(t => t.id === tabId);
  if (!tab) {
    console.warn(`[TabbarContainer] Tab not found: ${tabId}`);
    return;
  }

  const instance = state.value.instances.get(tabId);
  if (!instance) {
    return;
  }

  if (!instance.loaded && !instance.loading) {
    instance.loading = true;
    log('Loading tab component:', tabId);

    try {
      if (!tab.component) {
        instance.component = null;
        instance.loaded = true;
        instance.error = null;
        log('Tab component skipped (no component):', tabId);
      } else if (typeof tab.component === 'function') {
        const module = await (tab.component as () => Promise<{ default: Component }>)();
        instance.component = markRaw(module.default);
      } else {
        instance.component = markRaw(tab.component);
      }
      instance.loaded = true;
      instance.error = null;
      log('Tab component loaded:', tabId);
    } catch (error) {
      instance.error = error as Error;
      console.error(`[TabbarContainer] Failed to load tab: ${tabId}`, error);
    } finally {
      instance.loading = false;
    }
  }

  state.value.activeId = tabId;
  state.value.visitedTabs.add(tabId);
  log('Switched to tab:', tabId);
}

/**
 * 获取当前激活的 Tab ID
 */
export function getActiveTabId(): string {
  return state.value.activeId;
}

/**
 * 获取 Tab 配置列表
 */
export function getTabs(): TabConfig[] {
  return state.value.tabs;
}

/**
 * 获取 Tab 实例
 */
export function getTabInstance(tabId: string): TabInstance | undefined {
  return state.value.instances.get(tabId);
}

/**
 * 检查 Tab 是否已访问
 */
export function isTabVisited(tabId: string): boolean {
  return state.value.visitedTabs.has(tabId);
}

/**
 * 预加载 Tab 组件
 */
export async function preloadTab(tabId: string): Promise<void> {
  const tab = state.value.tabs.find(t => t.id === tabId);
  const instance = state.value.instances.get(tabId);

  if (!tab || !instance || instance.loaded || instance.loading) {
    return;
  }

  instance.loading = true;
  log('Preloading tab:', tabId);

  try {
    if (!tab.component) {
      instance.component = null;
      instance.loaded = true;
      log('Tab preload skipped (no component):', tabId);
    } else if (typeof tab.component === 'function') {
      const module = await (tab.component as () => Promise<{ default: Component }>)();
      instance.component = markRaw(module.default);
    } else {
      instance.component = markRaw(tab.component);
    }
    instance.loaded = true;
    log('Tab preloaded:', tabId);
  } catch (error) {
    instance.error = error as Error;
    console.error(`[TabbarContainer] Failed to preload tab: ${tabId}`, error);
  } finally {
    instance.loading = false;
  }
}

/**
 * 批量预加载 Tab 组件
 */
export async function preloadTabs(tabIds: string[]): Promise<void> {
  await Promise.all(tabIds.map(id => preloadTab(id)));
}

/**
 * 更新 Tab 徽标
 */
export function updateTabBadge(tabId: string, badge?: number, dot?: boolean): void {
  const tab = state.value.tabs.find(t => t.id === tabId);
  if (tab) {
    if (badge !== undefined) tab.badge = badge;
    if (dot !== undefined) tab.dot = dot;
  }
}

/**
 * 设置调试模式
 */
export function setTabbarDebug(enabled: boolean): void {
  debugMode = enabled;
}

/**
 * 重置容器状态
 */
export function resetTabbarContainer(): void {
  state.value.activeId = '';
  state.value.tabs = [];
  state.value.instances.clear();
  state.value.visitedTabs.clear();
  log('Container reset');
}

/**
 * Tabbar 容器 Hook
 */
export function useTabbarContainer(): UseTabbarContainerReturn {
  return {
    /** 当前激活的 Tab ID */
    activeId: computed(() => state.value.activeId),
    /** Tab 配置列表 */
    tabs: computed(() => state.value.tabs),
    /** 已访问的 Tab 集合 */
    visitedTabs: computed(() => state.value.visitedTabs),
    /** 切换 Tab */
    switchTab,
    /** 预加载 Tab */
    preloadTab,
    /** 预加载多个 Tab */
    preloadTabs,
    /** 获取 Tab 实例 */
    getTabInstance,
    /** 更新徽标 */
    updateBadge: updateTabBadge,
    /** 检查是否已访问 */
    isVisited: isTabVisited,
  };
}

export { state as tabbarState };
