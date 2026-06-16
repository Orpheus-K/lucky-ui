/**
 * 预加载管理器
 * @description 提供页面、组件、图片等资源的预加载能力
 */

import type {
  PreloadTask,
  PreloadConfig,
  PreloadEventType,
  PreloadEventHandler,
  PreloadStats,
  PagePreloadOptions,
  ComponentPreloadOptions,
  ImagePreloadOptions,
  IPreloadManager,
} from './types';
import { PreloadPriority, PreloadResourceType } from './types';
import { PreloadQueue, getPreloadQueue } from './queue';

type UniPreloadPageApi = typeof uni & {
  preloadPage?: (options: {
    url: string;
    success: () => void;
    fail: (err: Error) => void;
  }) => void;
};

/** 已加载的资源缓存 */
const loadedResources = new Set<string>();

/** 页面预取缓存（用于存储预取的页面数据） */
const pageDataCache = new Map<string, unknown>();

/**
 * 预加载管理器类
 */
export class PreloadManager implements IPreloadManager {
  private queue: PreloadQueue;
  private componentLoaders: Map<string, () => Promise<unknown>> = new Map();

  constructor(config?: Partial<PreloadConfig>) {
    this.queue = getPreloadQueue(config);
  }

  /**
   * 注册组件加载器
   * @description 注册动态组件的加载函数，用于组件预加载
   */
  registerComponentLoader(name: string, loader: () => Promise<unknown>): void {
    this.componentLoaders.set(name, loader);
  }

  /**
   * 预加载页面
   * @description 预取页面资源，包括页面本身和关联的数据接口
   */
  preloadPage(options: PagePreloadOptions): string {
    const { path, priority = PreloadPriority.MEDIUM, dataUrls = [] } = options;
    const resourceKey = `page:${path}`;

    // 如果已经加载过，跳过
    if (loadedResources.has(resourceKey)) {
      return '';
    }

    const taskId = this.queue.addTask({
      type: PreloadResourceType.PAGE,
      priority,
      resource: path,
      maxRetries: 2,
      payload: { dataUrls },
      executor: async () => {
        // 使用 uni.preloadPage 预加载页面（如果可用）
        // #ifdef APP-PLUS || MP-WEIXIN
        await new Promise<void>((resolve, _reject) => {
          const uniApi = uni as UniPreloadPageApi;
          if (typeof uniApi.preloadPage === 'function') {
            uniApi.preloadPage({
              url: path,
              success: () => resolve(),
              fail: (err: Error) => {
                console.warn('[PreloadManager] Page preload warning:', err);
                resolve(); // 即使失败也继续
              },
            });
          } else {
            resolve();
          }
        });
        // #endif

        // #ifdef H5
        // H5 环境使用 link prefetch
        if (typeof document !== 'undefined') {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = path;
          link.as = 'document';
          document.head.appendChild(link);
        }
        // #endif

        // 预取页面关联的数据接口
        if (dataUrls.length > 0) {
          await Promise.allSettled(dataUrls.map(url => this.prefetchData(url)));
        }

        loadedResources.add(resourceKey);
      },
    });

    return taskId;
  }

  /**
   * 预加载组件
   * @description 预加载动态组件
   */
  preloadComponent(options: ComponentPreloadOptions): string {
    const { name, priority = PreloadPriority.MEDIUM } = options;
    const resourceKey = `component:${name}`;

    if (loadedResources.has(resourceKey)) {
      return '';
    }

    const loader = this.componentLoaders.get(name);
    if (!loader) {
      console.warn(`[PreloadManager] Component loader not registered: ${name}`);
      return '';
    }

    const taskId = this.queue.addTask({
      type: PreloadResourceType.COMPONENT,
      priority,
      resource: name,
      maxRetries: 2,
      executor: async () => {
        await loader();
        loadedResources.add(resourceKey);
      },
    });

    return taskId;
  }

  /**
   * 预加载图片
   * @description 预加载图片资源到缓存
   */
  preloadImage(options: ImagePreloadOptions): string {
    const { url, priority = PreloadPriority.LOW } = options;
    const resourceKey = `image:${url}`;

    if (loadedResources.has(resourceKey)) {
      return '';
    }

    const taskId = this.queue.addTask({
      type: PreloadResourceType.IMAGE,
      priority,
      resource: url,
      maxRetries: 1,
      executor: async () => {
        await new Promise<void>((resolve, reject) => {
          // #ifdef H5
          if (typeof window !== 'undefined' && 'Image' in window) {
            const img = new window.Image();
            img.onload = () => {
              loadedResources.add(resourceKey);
              resolve();
            };
            img.onerror = () => {
              reject(new Error(`Failed to load image: ${url}`));
            };
            img.src = url;
            return;
          }
          // #endif

          // 小程序环境使用 uni.getImageInfo
          uni.getImageInfo({
            src: url,
            success: () => {
              loadedResources.add(resourceKey);
              resolve();
            },
            fail: err => {
              reject(new Error(`Failed to load image: ${url}, ${JSON.stringify(err)}`));
            },
          });
        });
      },
    });

    return taskId;
  }

  /**
   * 批量预加载图片
   */
  preloadImages(urls: string[], priority = PreloadPriority.LOW): string[] {
    return urls.map(url => this.preloadImage({ url, priority })).filter(Boolean);
  }

  /**
   * 预取数据
   * @description 预取 API 数据并缓存
   */
  private async prefetchData(url: string): Promise<void> {
    if (pageDataCache.has(url)) {
      return;
    }

    return new Promise((resolve, _reject) => {
      uni.request({
        url,
        method: 'GET',
        success: res => {
          pageDataCache.set(url, res.data);
          resolve();
        },
        fail: err => {
          console.warn('[PreloadManager] Data prefetch failed:', url, err);
          resolve(); // 即使失败也继续
        },
      });
    });
  }

  /**
   * 获取预取的数据
   */
  getPrefetchedData<T = unknown>(url: string): T | undefined {
    return pageDataCache.get(url) as T | undefined;
  }

  /**
   * 清除预取数据缓存
   */
  clearDataCache(url?: string): void {
    if (url) {
      pageDataCache.delete(url);
    } else {
      pageDataCache.clear();
    }
  }

  /**
   * 添加自定义预加载任务
   */
  addTask(task: Omit<PreloadTask, 'id' | 'status' | 'createdAt' | 'retryCount'>): string {
    return this.queue.addTask(task);
  }

  /**
   * 取消任务
   */
  cancelTask(taskId: string): boolean {
    return this.queue.cancelTask(taskId);
  }

  /**
   * 暂停预加载
   */
  pause(): void {
    this.queue.pause();
  }

  /**
   * 恢复预加载
   */
  resume(): void {
    this.queue.resume();
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue.clear();
  }

  /**
   * 获取统计信息
   */
  getStats(): PreloadStats {
    return this.queue.getStats();
  }

  /**
   * 监听事件
   */
  on(event: PreloadEventType, handler: PreloadEventHandler): void {
    this.queue.on(event, handler);
  }

  /**
   * 移除事件监听
   */
  off(event: PreloadEventType, handler: PreloadEventHandler): void {
    this.queue.off(event, handler);
  }

  /**
   * 检查资源是否已加载
   */
  isLoaded(resourceKey: string): boolean {
    return loadedResources.has(resourceKey);
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<PreloadConfig>): void {
    this.queue.updateConfig(config);
  }
}

/** 预加载管理器单例 */
let managerInstance: PreloadManager | null = null;

/**
 * 获取预加载管理器实例
 */
export function getPreloadManager(config?: Partial<PreloadConfig>): PreloadManager {
  if (!managerInstance) {
    managerInstance = new PreloadManager(config);
  } else if (config) {
    managerInstance.updateConfig(config);
  }
  return managerInstance;
}

/**
 * 重置预加载管理器
 */
export function resetPreloadManager(): void {
  if (managerInstance) {
    managerInstance.clear();
    managerInstance = null;
  }
  loadedResources.clear();
  pageDataCache.clear();
}
