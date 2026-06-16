/**
 * Lucky UI 预加载系统
 * @description 提供页面、组件、图片等资源的预加载能力，优化用户体验
 *
 * @example
 * ```ts
 * import { usePreload, useTabbarPreload, PreloadPriority } from '@/uni_modules/lucky-ui/core/src/preload';
 *
 * // 基础使用
 * const { preloadPage, preloadImages, stats } = usePreload();
 *
 * // 预加载页面
 * preloadPage({ path: '/pages/detail/index', priority: PreloadPriority.HIGH });
 *
 * // Tabbar 预加载
 * const { isPreloaded } = useTabbarPreload({
 *   pages: [
 *     { id: 'home', path: '/pages/app-main/index' },
 *     { id: 'settings', path: '/pages_sub/settings/index' },
 *   ],
 *   currentPageId: 'home',
 * });
 * ```
 */

// 类型导出
export * from './types';

// 队列管理
export { PreloadQueue, getPreloadQueue, resetPreloadQueue } from './queue';

// 预加载管理器
export { PreloadManager, getPreloadManager, resetPreloadManager } from './manager';

// 组合式函数
export {
  usePreload,
  useTabbarPreload,
  type UsePreloadOptions,
  type UsePreloadReturn,
  type TabbarPreloadConfig,
} from './usePreload';
