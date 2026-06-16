/**
 * usePreload 组合式函数
 * @description 提供 Vue 组件中使用预加载功能的便捷 API
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';
import type {
  PreloadConfig,
  PreloadStats,
  PreloadEventType,
  PreloadEventHandler,
  PagePreloadOptions,
  ImagePreloadOptions,
} from './types';
import { PreloadPriority } from './types';
import { getPreloadManager, PreloadManager } from './manager';

/** usePreload 选项 */
export interface UsePreloadOptions {
  /** 预加载配置 */
  config?: Partial<PreloadConfig>;
  /** 是否在组件挂载时自动开始 */
  autoStart?: boolean;
  /** 首页加载完成后的延迟时间（毫秒） */
  startDelay?: number;
}

/** usePreload 返回值 */
export interface UsePreloadReturn {
  /** 预加载管理器实例 */
  manager: PreloadManager;
  /** 统计信息（响应式） */
  stats: Ref<PreloadStats>;
  /** 是否正在加载 */
  isLoading: Ref<boolean>;
  /** 是否暂停 */
  isPaused: Ref<boolean>;
  /** 预加载页面 */
  preloadPage: (options: PagePreloadOptions) => string;
  /** 预加载多个页面 */
  preloadPages: (pages: PagePreloadOptions[]) => string[];
  /** 预加载图片 */
  preloadImage: (options: ImagePreloadOptions) => string;
  /** 预加载多张图片 */
  preloadImages: (urls: string[], priority?: PreloadPriority) => string[];
  /** 暂停预加载 */
  pause: () => void;
  /** 恢复预加载 */
  resume: () => void;
  /** 清空队列 */
  clear: () => void;
  /** 监听事件 */
  on: (event: PreloadEventType, handler: PreloadEventHandler) => void;
  /** 移除事件监听 */
  off: (event: PreloadEventType, handler: PreloadEventHandler) => void;
}

/**
 * 预加载组合式函数
 * @description 在 Vue 组件中使用预加载功能
 */
export function usePreload(options: UsePreloadOptions = {}): UsePreloadReturn {
  const { config, autoStart = false, startDelay = 1000 } = options;

  const manager = getPreloadManager(config);
  const stats = ref<PreloadStats>(manager.getStats());
  const isPaused = ref(false);

  const isLoading = computed(() => {
    return stats.value.running > 0 || stats.value.pending > 0;
  });

  // 更新统计信息
  const updateStats = () => {
    stats.value = manager.getStats();
  };

  // 事件监听器集合（用于组件卸载时清理）
  const eventListeners: Array<{ event: PreloadEventType; handler: PreloadEventHandler }> = [];

  // 内部事件监听
  const internalHandler: PreloadEventHandler = () => {
    updateStats();
  };

  onMounted(() => {
    // 监听内部事件以更新统计
    manager.on('task:start', internalHandler);
    manager.on('task:complete', internalHandler);
    manager.on('task:error', internalHandler);
    manager.on('task:cancel', internalHandler);

    // 自动开始预加载
    if (autoStart) {
      setTimeout(() => {
        manager.resume();
      }, startDelay);
    }
  });

  onUnmounted(() => {
    // 清理内部监听
    manager.off('task:start', internalHandler);
    manager.off('task:complete', internalHandler);
    manager.off('task:error', internalHandler);
    manager.off('task:cancel', internalHandler);

    // 清理用户添加的监听
    eventListeners.forEach(({ event, handler }) => {
      manager.off(event, handler);
    });
  });

  const preloadPage = (pageOptions: PagePreloadOptions): string => {
    return manager.preloadPage(pageOptions);
  };

  const preloadPages = (pages: PagePreloadOptions[]): string[] => {
    return pages.map(page => manager.preloadPage(page)).filter(Boolean);
  };

  const preloadImage = (imageOptions: ImagePreloadOptions): string => {
    return manager.preloadImage(imageOptions);
  };

  const preloadImages = (urls: string[], priority = PreloadPriority.LOW): string[] => {
    return manager.preloadImages(urls, priority);
  };

  const pause = (): void => {
    manager.pause();
    isPaused.value = true;
  };

  const resume = (): void => {
    manager.resume();
    isPaused.value = false;
  };

  const clear = (): void => {
    manager.clear();
    updateStats();
  };

  const on = (event: PreloadEventType, handler: PreloadEventHandler): void => {
    manager.on(event, handler);
    eventListeners.push({ event, handler });
  };

  const off = (event: PreloadEventType, handler: PreloadEventHandler): void => {
    manager.off(event, handler);
    const index = eventListeners.findIndex(l => l.event === event && l.handler === handler);
    if (index !== -1) {
      eventListeners.splice(index, 1);
    }
  };

  return {
    manager,
    stats,
    isLoading,
    isPaused,
    preloadPage,
    preloadPages,
    preloadImage,
    preloadImages,
    pause,
    resume,
    clear,
    on,
    off,
  };
}

/**
 * 创建 Tabbar 页面预加载 Hook
 * @description 专门用于 Tabbar 页面的预加载场景
 */
export interface TabbarPreloadConfig {
  /** Tabbar 页面配置 */
  pages: Array<{
    /** 页面路径 */
    path: string;
    /** 页面 ID（用于标识） */
    id: string;
    /** 关联的数据接口 */
    dataUrls?: string[];
  }>;
  /** 当前页面 ID */
  currentPageId: string;
  /** 预加载延迟（毫秒） */
  delay?: number;
  /** 是否启用调试 */
  debug?: boolean;
}

/**
 * Tabbar 预加载 Hook
 */
export function useTabbarPreload(config: TabbarPreloadConfig) {
  const { pages, currentPageId, delay = 2000, debug = false } = config;

  const manager = getPreloadManager({ debug });
  const preloadedPages = ref<Set<string>>(new Set([currentPageId]));

  /**
   * 预加载其他 Tabbar 页面
   */
  const preloadOtherTabs = () => {
    // 过滤出需要预加载的页面
    const pagesToPreload = pages.filter(page => page.id !== currentPageId);

    if (debug) {
      console.log(
        '[TabbarPreload] Starting preload for:',
        pagesToPreload.map(p => p.id)
      );
    }

    // 按顺序添加预加载任务
    pagesToPreload.forEach((page, index) => {
      // 根据顺序设置优先级
      const priority =
        index === 0
          ? PreloadPriority.HIGH
          : index === 1
            ? PreloadPriority.MEDIUM
            : PreloadPriority.LOW;

      manager.preloadPage({
        path: page.path,
        priority,
        dataUrls: page.dataUrls,
      });

      preloadedPages.value.add(page.id);
    });
  };

  onMounted(() => {
    // 首页进入稳定后再预加载其他 Tab。
    setTimeout(() => {
      preloadOtherTabs();
    }, delay);
  });

  return {
    preloadedPages,
    manager,
    /** 手动触发预加载 */
    triggerPreload: preloadOtherTabs,
    /** 检查页面是否已预加载 */
    isPreloaded: (pageId: string) => preloadedPages.value.has(pageId),
  };
}
