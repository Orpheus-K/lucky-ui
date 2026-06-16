/**
 * 页面缓存系统
 * @description 用于缓存已访问页面的状态和数据，减少切换时的重复渲染和闪烁
 */

import { ref, reactive, readonly } from 'vue';
import type { Ref } from 'vue';

/** 页面缓存状态 */
interface PageCacheState {
  /** 页面是否已访问过 */
  visited: boolean;
  /** 页面是否已完成首次渲染 */
  rendered: boolean;
  /** 上次访问时间 */
  lastVisitTime: number;
  /** 访问次数 */
  visitCount: number;
}

/** 页面数据缓存 */
interface PageDataCache<T = unknown> {
  data: T;
  timestamp: number;
  /** 缓存有效期（毫秒），0 表示永不过期 */
  ttl: number;
}

/** 页面缓存存储 */
const pageStateCache = reactive<Map<string, PageCacheState>>(new Map());
const pageDataCache = reactive<Map<string, PageDataCache>>(new Map());

/** 调试模式 */
let debugMode = false;

/** 日志输出 */
function log(...args: unknown[]): void {
  if (debugMode) {
    console.log('[PageCache]', ...args);
  }
}

/**
 * 获取页面缓存状态
 */
export function getPageState(pageId: string): PageCacheState | undefined {
  return pageStateCache.get(pageId);
}

/**
 * 检查页面是否已访问过
 */
export function isPageVisited(pageId: string): boolean {
  return pageStateCache.get(pageId)?.visited ?? false;
}

/**
 * 检查页面是否已完成首次渲染
 */
export function isPageRendered(pageId: string): boolean {
  return pageStateCache.get(pageId)?.rendered ?? false;
}

/**
 * 标记页面已访问
 */
export function markPageVisited(pageId: string): void {
  const existing = pageStateCache.get(pageId);
  if (existing) {
    existing.visited = true;
    existing.lastVisitTime = Date.now();
    existing.visitCount++;
  } else {
    pageStateCache.set(pageId, {
      visited: true,
      rendered: false,
      lastVisitTime: Date.now(),
      visitCount: 1,
    });
  }
  log('Page visited:', pageId);
}

/**
 * 标记页面已渲染
 */
export function markPageRendered(pageId: string): void {
  const existing = pageStateCache.get(pageId);
  if (existing) {
    existing.rendered = true;
  } else {
    pageStateCache.set(pageId, {
      visited: true,
      rendered: true,
      lastVisitTime: Date.now(),
      visitCount: 1,
    });
  }
  log('Page rendered:', pageId);
}

/**
 * 缓存页面数据
 */
export function cachePageData<T>(pageId: string, key: string, data: T, ttl = 0): void {
  const cacheKey = `${pageId}:${key}`;
  pageDataCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl,
  });
  log('Data cached:', cacheKey);
}

/**
 * 获取缓存的页面数据
 */
export function getCachedPageData<T>(pageId: string, key: string): T | undefined {
  const cacheKey = `${pageId}:${key}`;
  const cached = pageDataCache.get(cacheKey);

  if (!cached) {
    return undefined;
  }

  // 检查是否过期
  if (cached.ttl > 0 && Date.now() - cached.timestamp > cached.ttl) {
    pageDataCache.delete(cacheKey);
    log('Cache expired:', cacheKey);
    return undefined;
  }

  return cached.data as T;
}

/**
 * 清除页面数据缓存
 */
export function clearPageDataCache(pageId?: string, key?: string): void {
  if (pageId && key) {
    pageDataCache.delete(`${pageId}:${key}`);
  } else if (pageId) {
    // 清除该页面的所有数据缓存
    const prefix = `${pageId}:`;
    for (const cacheKey of pageDataCache.keys()) {
      if (cacheKey.startsWith(prefix)) {
        pageDataCache.delete(cacheKey);
      }
    }
  } else {
    pageDataCache.clear();
  }
}

/**
 * 清除所有缓存
 */
export function clearAllCache(): void {
  pageStateCache.clear();
  pageDataCache.clear();
  log('All cache cleared');
}

/**
 * 设置调试模式
 */
export function setPageCacheDebug(enabled: boolean): void {
  debugMode = enabled;
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats(): {
  visitedPages: number;
  renderedPages: number;
  dataEntries: number;
} {
  let visitedPages = 0;
  let renderedPages = 0;

  for (const state of pageStateCache.values()) {
    if (state.visited) visitedPages++;
    if (state.rendered) renderedPages++;
  }

  return {
    visitedPages,
    renderedPages,
    dataEntries: pageDataCache.size,
  };
}

/** usePageCache Options */
export interface UsePageCacheOptions {
  /** 页面唯一标识 */
  pageId: string;
  /** 是否启用调试 */
  debug?: boolean;
}

/** usePageCache 返回值 */
export interface UsePageCacheReturn {
  /** 页面是否已访问过（首次进入为 false） */
  isFirstVisit: Ref<boolean>;
  /** 页面是否已完成首次渲染 */
  hasRendered: Ref<boolean>;
  /** 访问次数 */
  visitCount: Ref<number>;
  /** 标记页面已渲染完成 */
  markRendered: () => void;
  /** 缓存数据 */
  cache: <T>(key: string, data: T, ttl?: number) => void;
  /** 获取缓存数据 */
  getCache: <T>(key: string) => T | undefined;
  /** 清除缓存 */
  clearCache: (key?: string) => void;
}

/**
 * 页面缓存 Hook
 * @description 在页面组件中使用，自动管理页面访问状态和数据缓存
 */
export function usePageCache(options: UsePageCacheOptions): UsePageCacheReturn {
  const { pageId, debug = false } = options;

  if (debug) {
    setPageCacheDebug(true);
  }

  const state = getPageState(pageId);
  const isFirstVisit = ref(!state?.visited);
  const hasRendered = ref(state?.rendered ?? false);
  const visitCount = ref(state?.visitCount ?? 0);

  markPageVisited(pageId);
  visitCount.value = getPageState(pageId)?.visitCount ?? 1;

  const markRendered = (): void => {
    markPageRendered(pageId);
    hasRendered.value = true;
  };

  const cache = <T>(key: string, data: T, ttl = 0): void => {
    cachePageData(pageId, key, data, ttl);
  };

  const getCache = <T>(key: string): T | undefined => {
    return getCachedPageData<T>(pageId, key);
  };

  const clearCache = (key?: string): void => {
    clearPageDataCache(pageId, key);
  };

  return {
    isFirstVisit: readonly(isFirstVisit) as Ref<boolean>,
    hasRendered: readonly(hasRendered) as Ref<boolean>,
    visitCount: readonly(visitCount) as Ref<number>,
    markRendered,
    cache,
    getCache,
    clearCache,
  };
}
