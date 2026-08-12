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
  private retryingTasks: Map<string, PreloadTask> = new Map();
  private retryTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private runningTasks: Map<string, PreloadTask> = new Map();
  private completedTasks: Map<string, PreloadTask> = new Map();
  private taskAttempts: Map<string, number> = new Map();
  private inFlightAttempts: Map<number, string> = new Map();
  private attemptTimeouts: Map<number, ReturnType<typeof setTimeout>> = new Map();
  private attemptSettleTimers: Set<ReturnType<typeof setTimeout>> = new Set();
  private nextInFlightAttemptId = 0;
  private generation = 0;
  private config: PreloadConfig;
  private isPaused = false;
  private isProcessing = false;
  private isProcessingScheduled = false;
  private processingScheduleVersion = 0;
  private processingTimers: Set<ReturnType<typeof setTimeout>> = new Set();
  private emptyEventArmed = false;
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
            this.cancelScheduledProcessing();
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

    this.enqueueTask(newTask);
    this.emptyEventArmed = true;
    this.emitQueueChange(newTask);

    this.log('Task added:', newTask.id, newTask.resource);
    this.scheduleProcessing();

    return newTask.id;
  }

  /** 按优先级插入待执行队列 */
  private enqueueTask(task: PreloadTask): void {
    const insertIndex = this.queue.findIndex(t => t.priority > task.priority);
    if (insertIndex === -1) {
      this.queue.push(task);
    } else {
      this.queue.splice(insertIndex, 0, task);
    }
  }

  /** 取消任务 */
  cancelTask(taskId: string): boolean {
    // 检查队列中的任务
    const queueIndex = this.queue.findIndex(t => t.id === taskId);
    if (queueIndex !== -1) {
      const task = this.queue[queueIndex];
      this.queue.splice(queueIndex, 1);
      this.completeCancellation(task);
      return true;
    }

    const retryingTask = this.retryingTasks.get(taskId);
    if (retryingTask) {
      this.retryingTasks.delete(taskId);
      this.clearRetryTimer(taskId);
      this.completeCancellation(retryingTask);
      return true;
    }

    // 执行器本身可能无法中断，但取消后其旧 attempt 不得再提交状态。
    const runningTask = this.runningTasks.get(taskId);
    if (runningTask) {
      this.runningTasks.delete(taskId);
      this.completeCancellation(runningTask);
      this.scheduleProcessing();
      return true;
    }

    return false;
  }

  /** 暂停队列处理 */
  pause(): void {
    this.isPaused = true;
    this.cancelScheduledProcessing();
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
    this.generation++;
    this.cancelScheduledProcessing();
    this.retryTimers.forEach(timer => clearTimeout(timer));
    this.retryTimers.clear();

    const activeTasks = new Map<string, PreloadTask>();
    this.queue.forEach(task => activeTasks.set(task.id, task));
    this.retryingTasks.forEach(task => activeTasks.set(task.id, task));
    this.runningTasks.forEach(task => activeTasks.set(task.id, task));

    this.queue = [];
    this.retryingTasks.clear();
    this.runningTasks.clear();
    this.taskAttempts.clear();

    activeTasks.forEach(task => {
      this.markTaskCancelled(task);
    });

    this.emitQueueChange();
    activeTasks.forEach(task => {
      this.emit('task:cancel', task);
    });
    this.maybeEmitQueueEmpty();

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
      total:
        this.queue.length +
        this.retryingTasks.size +
        this.runningTasks.size +
        this.completedTasks.size,
      pending: this.queue.length + this.retryingTasks.size,
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
    const idleCallbackId = this.idleCallbackId;
    this.idleCallbackId = null;

    // #ifdef H5
    if (
      idleCallbackId !== null &&
      typeof window !== 'undefined' &&
      'cancelIdleCallback' in window
    ) {
      (window as typeof window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(
        idleCallbackId
      );
    }
    // #endif
  }

  /** 取消尚未开始的队列调度，不影响已经执行中的底层 executor */
  private cancelScheduledProcessing(): void {
    this.processingScheduleVersion++;
    this.isProcessingScheduled = false;
    this.cancelIdleCallback();
    this.processingTimers.forEach(timer => clearTimeout(timer));
    this.processingTimers.clear();
  }

  /** 注册降级调度 timer；源码测试同时保留条件编译分支时也只消费一次 */
  private scheduleProcessingTimer(version: number, delay: number): void {
    const timer = setTimeout(() => {
      this.processingTimers.delete(timer);
      this.runScheduledQueueProcessing(version);
    }, delay);
    this.processingTimers.add(timer);
  }

  /** 原子消费一次队列调度，并清理同轮残留回调 */
  private takeProcessingSchedule(version: number): boolean {
    if (!this.isProcessingScheduled || version !== this.processingScheduleVersion) {
      return false;
    }

    this.isProcessingScheduled = false;
    this.cancelIdleCallback();
    this.processingTimers.forEach(timer => clearTimeout(timer));
    this.processingTimers.clear();
    return true;
  }

  /** 执行降级/小程序调度回调 */
  private runScheduledQueueProcessing(version: number): void {
    if (this.takeProcessingSchedule(version)) {
      this.processQueue();
    }
  }

  /** 调度处理（使用 requestIdleCallback 或 setTimeout） */
  private scheduleProcessing(): void {
    if (
      this.isPaused ||
      this.isProcessing ||
      this.isProcessingScheduled ||
      !this.canStartNewTask()
    ) {
      return;
    }

    if (!this.pageVisible && this.config.pauseOnHidden) {
      return;
    }

    this.isProcessingScheduled = true;
    const version = ++this.processingScheduleVersion;

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
        deadline => {
          this.idleCallbackId = null;
          if (this.takeProcessingSchedule(version)) {
            this.processWithDeadline(deadline);
          }
        },
        { timeout: 5000 } // 最多等待 5 秒
      );
    } else {
      // 降级使用 setTimeout
      this.scheduleProcessingTimer(version, 0);
    }
    // #endif

    // #ifndef H5
    // 小程序环境使用 setTimeout
    this.scheduleProcessingTimer(version, 16); // 约一帧的时间
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

    // 空闲预算不足但仍有可运行任务时，继续调度。
    if (this.canStartNewTask()) {
      this.scheduleProcessing();
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

    if (this.canStartNewTask()) {
      this.scheduleProcessing();
    }
  }

  /** 检查是否可以启动新任务 */
  private canStartNewTask(): boolean {
    return (
      !this.isPaused &&
      this.inFlightAttempts.size < this.config.maxConcurrency &&
      this.findNextRunnableTaskIndex() !== -1
    );
  }

  /** 已超时但底层尚未结束的 attempt 仍占槽，且同一任务不得并行重试 */
  private findNextRunnableTaskIndex(): number {
    return this.queue.findIndex(task => !this.hasInFlightAttempt(task.id));
  }

  private hasInFlightAttempt(taskId: string): boolean {
    return Array.from(this.inFlightAttempts.values()).some(id => id === taskId);
  }

  /** 启动下一个任务 */
  private startNextTask(): void {
    const taskIndex = this.findNextRunnableTaskIndex();
    if (taskIndex === -1) return;

    const [task] = this.queue.splice(taskIndex, 1);

    task.status = PreloadTaskStatus.RUNNING;
    task.startedAt = Date.now();
    this.runningTasks.set(task.id, task);

    const generation = this.generation;
    const attempt = (this.taskAttempts.get(task.id) ?? 0) + 1;
    this.taskAttempts.set(task.id, attempt);
    const inFlightAttemptId = ++this.nextInFlightAttemptId;
    this.inFlightAttempts.set(inFlightAttemptId, task.id);

    this.emitQueueChange(task);

    if (this.runningTasks.get(task.id) !== task || task.status !== PreloadTaskStatus.RUNNING) {
      this.releaseInFlightAttempt(inFlightAttemptId);
      return;
    }

    this.emit('task:start', task);
    this.log('Task started:', task.id, task.resource);

    if (this.runningTasks.get(task.id) !== task || task.status !== PreloadTaskStatus.RUNNING) {
      this.releaseInFlightAttempt(inFlightAttemptId);
      return;
    }

    this.executeTask(task, generation, attempt, inFlightAttemptId);
  }

  /** 执行任务 */
  private async executeTask(
    task: PreloadTask,
    generation: number,
    attempt: number,
    inFlightAttemptId: number
  ): Promise<void> {
    let rejectTimeout!: (error: Error) => void;
    const timeoutPromise = new Promise<never>((_, reject) => {
      rejectTimeout = reject;
    });
    const timeoutId = setTimeout(() => {
      this.attemptTimeouts.delete(inFlightAttemptId);
      rejectTimeout(new Error(`Task timeout: ${task.id}`));
    }, this.config.taskTimeout);
    this.attemptTimeouts.set(inFlightAttemptId, timeoutId);

    let executorPromise: Promise<void>;
    try {
      executorPromise = Promise.resolve(
        task.executor ? task.executor() : this.defaultExecutor(task)
      );
    } catch (error) {
      executorPromise = Promise.reject(error);
    }

    void executorPromise.then(
      () => this.releaseInFlightAttempt(inFlightAttemptId),
      () => this.releaseInFlightAttempt(inFlightAttemptId)
    );

    try {
      await Promise.race([executorPromise, timeoutPromise]);

      if (!this.isCurrentAttempt(task, generation, attempt)) {
        return;
      }

      task.status = PreloadTaskStatus.COMPLETED;
      task.completedAt = Date.now();
      this.finishTask(task);
      this.emitQueueChange(task);
      this.emit('task:complete', task);
      this.maybeEmitQueueEmpty();
      this.log('Task completed:', task.id, task.resource);
    } catch (error) {
      if (!this.isCurrentAttempt(task, generation, attempt)) {
        return;
      }

      task.retryCount++;

      if (task.retryCount <= task.maxRetries) {
        // 重试
        this.log('Task retrying:', task.id, `(${task.retryCount}/${task.maxRetries})`);
        task.status = PreloadTaskStatus.PENDING;
        this.runningTasks.delete(task.id);
        this.retryingTasks.set(task.id, task);

        const retryTimer = setTimeout(() => {
          this.retryTimers.delete(task.id);

          if (
            generation !== this.generation ||
            this.retryingTasks.get(task.id) !== task ||
            task.status !== PreloadTaskStatus.PENDING
          ) {
            return;
          }

          this.retryingTasks.delete(task.id);
          this.enqueueTask(task);
          this.emitQueueChange(task);
          this.scheduleProcessing();
        }, this.config.retryDelay);
        this.retryTimers.set(task.id, retryTimer);
        this.emitQueueChange(task);

        return;
      }

      task.status = PreloadTaskStatus.FAILED;
      task.completedAt = Date.now();
      this.finishTask(task);
      this.emitQueueChange(task);
      this.emit('task:error', task, error as Error);
      this.maybeEmitQueueEmpty();
      this.log('Task failed:', task.id, error);
    } finally {
      this.scheduleProcessing();
    }
  }

  /** 只有底层 executor 真正 settle 才释放物理并发槽 */
  private releaseInFlightAttempt(inFlightAttemptId: number): void {
    if (!this.inFlightAttempts.delete(inFlightAttemptId)) {
      return;
    }

    const timeoutId = this.attemptTimeouts.get(inFlightAttemptId);
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      this.attemptTimeouts.delete(inFlightAttemptId);
    }

    const settleTimer = setTimeout(() => {
      this.attemptSettleTimers.delete(settleTimer);
      this.scheduleProcessing();
    }, 0);
    this.attemptSettleTimers.add(settleTimer);

    // queue:empty 描述逻辑队列；物理 attempt settle 只释放槽，不产生新的逻辑边沿。
  }

  /** 当前异步 attempt 是否仍拥有该任务的提交权 */
  private isCurrentAttempt(task: PreloadTask, generation: number, attempt: number): boolean {
    return (
      generation === this.generation &&
      this.runningTasks.get(task.id) === task &&
      this.taskAttempts.get(task.id) === attempt &&
      task.status === PreloadTaskStatus.RUNNING
    );
  }

  /** 将终态任务从活动集合原子迁移到完成账本 */
  private finishTask(task: PreloadTask): void {
    this.runningTasks.delete(task.id);
    this.retryingTasks.delete(task.id);
    this.clearRetryTimer(task.id);
    this.taskAttempts.delete(task.id);
    this.completedTasks.set(task.id, task);
  }

  /** 只写入取消终态；clear 用它先完成整批账本，再发送事件 */
  private markTaskCancelled(task: PreloadTask): void {
    task.status = PreloadTaskStatus.CANCELLED;
    task.completedAt = Date.now();
    this.taskAttempts.delete(task.id);
    this.clearAttemptTimeouts(task.id);
    this.completedTasks.set(task.id, task);
  }

  /** 取消单个逻辑任务并立即发布完整状态 */
  private completeCancellation(task: PreloadTask): void {
    this.markTaskCancelled(task);
    this.emitQueueChange(task);
    this.emit('task:cancel', task);
    this.maybeEmitQueueEmpty();
    this.log('Task cancelled:', task.id);
  }

  /** 所有逻辑任务均进入终态才算 empty；未结束 executor 不影响逻辑 empty */
  private isLogicallyEmpty(): boolean {
    return this.queue.length === 0 && this.retryingTasks.size === 0 && this.runningTasks.size === 0;
  }

  /** 非空到空的边沿事件，每轮 workload 最多一次 */
  private maybeEmitQueueEmpty(): void {
    if (!this.emptyEventArmed || !this.isLogicallyEmpty()) {
      return;
    }

    this.emptyEventArmed = false;
    this.emit('queue:empty');
  }

  /** 通知统计消费者重新读取原子快照 */
  private emitQueueChange(task?: PreloadTask): void {
    this.emit('queue:change', task);
  }

  /** 清理指定任务的重试延时 */
  private clearRetryTimer(taskId: string): void {
    const timer = this.retryTimers.get(taskId);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.retryTimers.delete(taskId);
    }
  }

  /** 取消逻辑任务后不再需要 attempt timeout，但底层 executor 仍占物理槽直到 settle */
  private clearAttemptTimeouts(taskId: string): void {
    this.inFlightAttempts.forEach((inFlightTaskId, inFlightAttemptId) => {
      if (inFlightTaskId !== taskId) {
        return;
      }

      const timer = this.attemptTimeouts.get(inFlightAttemptId);
      if (timer !== undefined) {
        clearTimeout(timer);
        this.attemptTimeouts.delete(inFlightAttemptId);
      }
    });
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
    return [...this.queue, ...this.retryingTasks.values()];
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
