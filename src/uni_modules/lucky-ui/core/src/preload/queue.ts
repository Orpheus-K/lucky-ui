/**
 * 预加载队列管理
 * @description 基于优先级的任务队列，支持并发控制和空闲时间调度
 */

import type {
  PreloadTask,
  PreloadConfig,
  PreloadEventType,
  PreloadEventHandler,
  PreloadEvent,
  PreloadStats,
} from './types';
import { PreloadTaskStatus } from './types';

/** 默认配置 */
const DEFAULT_CONFIG: PreloadConfig = {
  maxConcurrency: 2,
  defaultRetries: 2,
  retryDelay: 1000,
  idleThreshold: 10, // 10ms 空闲时间阈值
  taskTimeout: 30000, // 30秒超时
  debug: false,
  pauseOnHidden: true,
};

/**
 * 预加载队列类
 * @description 管理预加载任务的执行队列，支持优先级排序和并发控制
 */
export class PreloadQueue {
  private queue: PreloadTask[] = [];
  private runningTasks: Map<string, PreloadTask> = new Map();
  private completedTasks: Map<string, PreloadTask> = new Map();
  private config: PreloadConfig;
  private isPaused = false;
  private isProcessing = false;
  private eventHandlers: Map<PreloadEventType, Set<PreloadEventHandler>> = new Map();
  private idleCallbackId: number | null = null;
  private pageVisible = true;

  constructor(config: Partial<PreloadConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupVisibilityListener();
  }

  /** 设置页面可见性监听 */
  private setupVisibilityListener(): void {
    // #ifdef H5
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.pageVisible = document.visibilityState === 'visible';
        if (this.config.pauseOnHidden) {
          if (this.pageVisible) {
            this.scheduleProcessing();
          } else {
            this.cancelIdleCallback();
          }
        }
      });
    }
    // #endif
  }

  /** 调试日志 */
  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[PreloadQueue]', ...args);
    }
  }

  /** 生成唯一任务 ID */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  /** 触发事件 */
  private emit(type: PreloadEventType, task?: PreloadTask, error?: Error): void {
    const event: PreloadEvent = {
      type,
      task,
      error,
      timestamp: Date.now(),
    };

    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (e) {
          console.error('[PreloadQueue] Event handler error:', e);
        }
      });
    }
  }

  /** 添加任务到队列 */
  addTask(task: Omit<PreloadTask, 'id' | 'status' | 'createdAt' | 'retryCount'>): string {
    const newTask: PreloadTask = {
      ...task,
      id: this.generateTaskId(),
      status: PreloadTaskStatus.PENDING,
      createdAt: Date.now(),
      retryCount: 0,
      maxRetries: task.maxRetries ?? this.config.defaultRetries,
    };

    // 按优先级插入队列
    const insertIndex = this.queue.findIndex(t => t.priority > newTask.priority);
    if (insertIndex === -1) {
      this.queue.push(newTask);
    } else {
      this.queue.splice(insertIndex, 0, newTask);
    }

    this.log('Task added:', newTask.id, newTask.resource);
    this.scheduleProcessing();

    return newTask.id;
  }

  /** 取消任务 */
  cancelTask(taskId: string): boolean {
    // 检查队列中的任务
    const queueIndex = this.queue.findIndex(t => t.id === taskId);
    if (queueIndex !== -1) {
      const task = this.queue[queueIndex];
      task.status = PreloadTaskStatus.CANCELLED;
      this.queue.splice(queueIndex, 1);
      this.completedTasks.set(taskId, task);
      this.emit('task:cancel', task);
      this.log('Task cancelled:', taskId);
      return true;
    }

    // 标记运行中的任务为已取消（实际取消需要在执行器中处理）
    const runningTask = this.runningTasks.get(taskId);
    if (runningTask) {
      runningTask.status = PreloadTaskStatus.CANCELLED;
      return true;
    }

    return false;
  }

  /** 暂停队列处理 */
  pause(): void {
    this.isPaused = true;
    this.cancelIdleCallback();
    this.emit('queue:pause');
    this.log('Queue paused');
  }

  /** 恢复队列处理 */
  resume(): void {
    this.isPaused = false;
    this.emit('queue:resume');
    this.log('Queue resumed');
    this.scheduleProcessing();
  }

  /** 清空队列 */
  clear(): void {
    this.queue.forEach(task => {
      task.status = PreloadTaskStatus.CANCELLED;
      this.completedTasks.set(task.id, task);
    });
    this.queue = [];
    this.cancelIdleCallback();
    this.log('Queue cleared');
  }

  /** 获取统计信息 */
  getStats(): PreloadStats {
    let completed = 0;
    let failed = 0;
    let cancelled = 0;

    this.completedTasks.forEach(task => {
      if (task.status === PreloadTaskStatus.COMPLETED) completed++;
      else if (task.status === PreloadTaskStatus.FAILED) failed++;
      else if (task.status === PreloadTaskStatus.CANCELLED) cancelled++;
    });

    return {
      total: this.queue.length + this.runningTasks.size + this.completedTasks.size,
      pending: this.queue.length,
      running: this.runningTasks.size,
      completed,
      failed,
      cancelled,
    };
  }

  /** 监听事件 */
  on(event: PreloadEventType, handler: PreloadEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  /** 移除事件监听 */
  off(event: PreloadEventType, handler: PreloadEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /** 取消空闲回调 */
  private cancelIdleCallback(): void {
    // #ifdef H5
    if (
      this.idleCallbackId !== null &&
      typeof window !== 'undefined' &&
      'cancelIdleCallback' in window
    ) {
      (window as typeof window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(
        this.idleCallbackId
      );
      this.idleCallbackId = null;
    }
    // #endif
  }

  /** 调度处理（使用 requestIdleCallback 或 setTimeout） */
  private scheduleProcessing(): void {
    if (this.isPaused || this.isProcessing || this.queue.length === 0) {
      return;
    }

    if (!this.pageVisible && this.config.pauseOnHidden) {
      return;
    }

    this.cancelIdleCallback();

    // #ifdef H5
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const ric = (
        window as typeof window & {
          requestIdleCallback: (
            cb: (deadline: { timeRemaining: () => number }) => void,
            opts?: { timeout: number }
          ) => number;
        }
      ).requestIdleCallback;
      this.idleCallbackId = ric(
        deadline => this.processWithDeadline(deadline),
        { timeout: 5000 } // 最多等待 5 秒
      );
    } else {
      // 降级使用 setTimeout
      setTimeout(() => this.processQueue(), 0);
    }
    // #endif

    // #ifndef H5
    // 小程序环境使用 setTimeout
    setTimeout(() => this.processQueue(), 16); // 约一帧的时间
    // #endif
  }

  /** 基于空闲时间处理任务（H5） */
  private processWithDeadline(deadline: { timeRemaining: () => number }): void {
    this.isProcessing = true;

    // 在空闲时间内处理任务
    while (deadline.timeRemaining() > this.config.idleThreshold && this.canStartNewTask()) {
      this.startNextTask();
    }

    this.isProcessing = false;

    // 如果还有任务，继续调度
    if (this.queue.length > 0) {
      this.scheduleProcessing();
    } else if (this.runningTasks.size === 0) {
      this.emit('queue:empty');
    }
  }

  /** 处理队列（小程序或降级） */
  private processQueue(): void {
    this.isProcessing = true;

    // 启动可以并发的任务
    while (this.canStartNewTask()) {
      this.startNextTask();
    }

    this.isProcessing = false;

    // 如果还有任务，继续调度
    if (this.queue.length > 0) {
      this.scheduleProcessing();
    } else if (this.runningTasks.size === 0) {
      this.emit('queue:empty');
    }
  }

  /** 检查是否可以启动新任务 */
  private canStartNewTask(): boolean {
    return (
      !this.isPaused && this.queue.length > 0 && this.runningTasks.size < this.config.maxConcurrency
    );
  }

  /** 启动下一个任务 */
  private startNextTask(): void {
    const task = this.queue.shift();
    if (!task) return;

    task.status = PreloadTaskStatus.RUNNING;
    task.startedAt = Date.now();
    this.runningTasks.set(task.id, task);

    this.emit('task:start', task);
    this.log('Task started:', task.id, task.resource);

    this.executeTask(task);
  }

  /** 执行任务 */
  private async executeTask(task: PreloadTask): Promise<void> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Task timeout: ${task.id}`)), this.config.taskTimeout);
    });

    try {
      let executor: () => Promise<void>;

      if (task.executor) {
        executor = task.executor;
      } else {
        // 使用默认执行器
        executor = () => this.defaultExecutor(task);
      }

      await Promise.race([executor(), timeoutPromise]);

      // 检查任务是否被取消
      if (task.status === PreloadTaskStatus.CANCELLED) {
        return;
      }

      task.status = PreloadTaskStatus.COMPLETED;
      task.completedAt = Date.now();
      this.emit('task:complete', task);
      this.log('Task completed:', task.id, task.resource);
    } catch (error) {
      // 检查任务是否被取消
      if (task.status === PreloadTaskStatus.CANCELLED) {
        return;
      }

      task.retryCount++;

      if (task.retryCount <= task.maxRetries) {
        // 重试
        this.log('Task retrying:', task.id, `(${task.retryCount}/${task.maxRetries})`);
        task.status = PreloadTaskStatus.PENDING;
        this.runningTasks.delete(task.id);

        setTimeout(() => {
          // 重新加入队列（保持优先级）
          const insertIndex = this.queue.findIndex(t => t.priority > task.priority);
          if (insertIndex === -1) {
            this.queue.push(task);
          } else {
            this.queue.splice(insertIndex, 0, task);
          }
          this.scheduleProcessing();
        }, this.config.retryDelay);

        return;
      }

      task.status = PreloadTaskStatus.FAILED;
      task.completedAt = Date.now();
      this.emit('task:error', task, error as Error);
      this.log('Task failed:', task.id, error);
    } finally {
      this.runningTasks.delete(task.id);
      this.completedTasks.set(task.id, task);

      // 继续处理队列
      this.scheduleProcessing();
    }
  }

  /** 默认执行器 */
  private async defaultExecutor(_task: PreloadTask): Promise<void> {
    // 默认实现为空，由具体的预加载管理器实现
    return Promise.resolve();
  }

  /** 更新配置 */
  updateConfig(config: Partial<PreloadConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /** 获取当前配置 */
  getConfig(): Readonly<PreloadConfig> {
    return { ...this.config };
  }

  /** 获取队列中的所有任务（只读） */
  getTasks(): readonly PreloadTask[] {
    return [...this.queue];
  }

  /** 获取正在运行的任务（只读） */
  getRunningTasks(): readonly PreloadTask[] {
    return Array.from(this.runningTasks.values());
  }
}

/** 导出单例 */
let queueInstance: PreloadQueue | null = null;

export function getPreloadQueue(config?: Partial<PreloadConfig>): PreloadQueue {
  if (!queueInstance) {
    queueInstance = new PreloadQueue(config);
  } else if (config) {
    queueInstance.updateConfig(config);
  }
  return queueInstance;
}

export function resetPreloadQueue(): void {
  if (queueInstance) {
    queueInstance.clear();
    queueInstance = null;
  }
}
