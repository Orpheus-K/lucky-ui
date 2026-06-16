/**
 * 预加载系统类型定义
 * @description 定义预加载任务、队列、配置等相关类型
 */

/** 预加载任务优先级 */
export enum PreloadPriority {
  /** 高优先级 - 用户即将访问的页面 */
  HIGH = 1,
  /** 中优先级 - 常用页面 */
  MEDIUM = 2,
  /** 低优先级 - 不常用但可能访问的页面 */
  LOW = 3,
}

/** 预加载资源类型 */
export enum PreloadResourceType {
  /** 页面资源 */
  PAGE = 'page',
  /** 组件资源 */
  COMPONENT = 'component',
  /** 图片资源 */
  IMAGE = 'image',
  /** 数据资源 */
  DATA = 'data',
  /** 自定义资源 */
  CUSTOM = 'custom',
}

/** 任务状态 */
export enum PreloadTaskStatus {
  /** 等待中 */
  PENDING = 'pending',
  /** 执行中 */
  RUNNING = 'running',
  /** 已完成 */
  COMPLETED = 'completed',
  /** 失败 */
  FAILED = 'failed',
  /** 已取消 */
  CANCELLED = 'cancelled',
}

/** 预加载任务接口 */
export interface PreloadTask {
  /** 任务唯一标识 */
  id: string;
  /** 资源类型 */
  type: PreloadResourceType;
  /** 优先级 */
  priority: PreloadPriority;
  /** 任务状态 */
  status: PreloadTaskStatus;
  /** 资源路径或标识 */
  resource: string;
  /** 创建时间 */
  createdAt: number;
  /** 开始执行时间 */
  startedAt?: number;
  /** 完成时间 */
  completedAt?: number;
  /** 重试次数 */
  retryCount: number;
  /** 最大重试次数 */
  maxRetries: number;
  /** 自定义数据 */
  payload?: Record<string, unknown>;
  /** 执行函数（用于自定义任务） */
  executor?: () => Promise<void>;
}

/** 预加载配置接口 */
export interface PreloadConfig {
  /** 最大并发数 */
  maxConcurrency: number;
  /** 默认重试次数 */
  defaultRetries: number;
  /** 重试延迟（毫秒） */
  retryDelay: number;
  /** 空闲时间阈值（毫秒），低于此值不执行任务 */
  idleThreshold: number;
  /** 任务超时时间（毫秒） */
  taskTimeout: number;
  /** 是否启用调试日志 */
  debug: boolean;
  /** 是否在页面隐藏时暂停预加载 */
  pauseOnHidden: boolean;
}

/** 预加载事件类型 */
export type PreloadEventType =
  | 'task:start'
  | 'task:complete'
  | 'task:error'
  | 'task:cancel'
  | 'queue:empty'
  | 'queue:pause'
  | 'queue:resume';

/** 预加载事件回调 */
export type PreloadEventHandler = (event: PreloadEvent) => void;

/** 预加载事件 */
export interface PreloadEvent {
  type: PreloadEventType;
  task?: PreloadTask;
  error?: Error;
  timestamp: number;
}

/** 预加载统计信息 */
export interface PreloadStats {
  /** 总任务数 */
  total: number;
  /** 完成数 */
  completed: number;
  /** 失败数 */
  failed: number;
  /** 等待中数量 */
  pending: number;
  /** 运行中数量 */
  running: number;
  /** 已取消数量 */
  cancelled: number;
}

/** 页面预加载选项 */
export interface PagePreloadOptions {
  /** 页面路径 */
  path: string;
  /** 优先级 */
  priority?: PreloadPriority;
  /** 预加载页面所需的数据接口 */
  dataUrls?: string[];
}

/** 组件预加载选项 */
export interface ComponentPreloadOptions {
  /** 组件名称或路径 */
  name: string;
  /** 优先级 */
  priority?: PreloadPriority;
}

/** 图片预加载选项 */
export interface ImagePreloadOptions {
  /** 图片 URL */
  url: string;
  /** 优先级 */
  priority?: PreloadPriority;
}

/** 预加载管理器接口 */
export interface IPreloadManager {
  /** 预加载页面 */
  preloadPage(options: PagePreloadOptions): string;
  /** 预加载组件 */
  preloadComponent(options: ComponentPreloadOptions): string;
  /** 预加载图片 */
  preloadImage(options: ImagePreloadOptions): string;
  /** 添加自定义预加载任务 */
  addTask(task: Omit<PreloadTask, 'id' | 'status' | 'createdAt' | 'retryCount'>): string;
  /** 取消任务 */
  cancelTask(taskId: string): boolean;
  /** 暂停队列 */
  pause(): void;
  /** 恢复队列 */
  resume(): void;
  /** 清空队列 */
  clear(): void;
  /** 获取统计信息 */
  getStats(): PreloadStats;
  /** 监听事件 */
  on(event: PreloadEventType, handler: PreloadEventHandler): void;
  /** 移除事件监听 */
  off(event: PreloadEventType, handler: PreloadEventHandler): void;
}
