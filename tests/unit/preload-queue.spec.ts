import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PreloadQueue,
  getPreloadQueue,
  resetPreloadQueue,
} from '../../src/uni_modules/lucky-ui/core/src/preload/queue';
import {
  PreloadPriority,
  PreloadResourceType,
  PreloadTaskStatus,
  type PreloadStats,
} from '../../src/uni_modules/lucky-ui/core/src/preload/types';

const QUEUE_CONFIG = {
  maxConcurrency: 1,
  defaultRetries: 1,
  retryDelay: 100,
  idleThreshold: 0,
  taskTimeout: 10_000,
  pauseOnHidden: false,
};

function expectPartition(stats: PreloadStats): void {
  expect(stats.total).toBe(
    stats.pending + stats.running + stats.completed + stats.failed + stats.cancelled
  );
}

function addTask(queue: PreloadQueue, executor: () => Promise<void>, maxRetries = 1): string {
  return queue.addTask({
    type: PreloadResourceType.CUSTOM,
    priority: PreloadPriority.MEDIUM,
    resource: 'test-resource',
    maxRetries,
    executor,
  });
}

function deferred(): {
  promise: Promise<void>;
  resolve: () => void;
  reject: (error: Error) => void;
} {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

async function startScheduledWork(): Promise<void> {
  // Source contains H5's 0 ms fallback and MP's 16 ms fallback before conditional compilation.
  await vi.advanceTimersByTimeAsync(16);
}

describe('PreloadQueue retry state invariants', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    resetPreloadQueue();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('keeps retry delay in pending without entering the completed ledger', async () => {
    const executor = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error('retry once'))
      .mockResolvedValueOnce(undefined);
    const queue = new PreloadQueue(QUEUE_CONFIG);
    const completeStats: PreloadStats[] = [];
    queue.on('task:complete', () => completeStats.push(queue.getStats()));

    addTask(queue, executor);
    await startScheduledWork();

    const retrying = queue.getStats();
    expect(retrying).toEqual({
      total: 1,
      pending: 1,
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    });
    expectPartition(retrying);
    expect(retrying.running > 0 || retrying.pending > 0).toBe(true);
    expect(queue.getTasks()).toHaveLength(1);
    expect(queue.getTasks()[0].status).toBe(PreloadTaskStatus.PENDING);
    expect(executor).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(83);
    expect(executor).toHaveBeenCalledTimes(1);
    expectPartition(queue.getStats());

    await vi.advanceTimersByTimeAsync(1);
    await startScheduledWork();
    const completed = queue.getStats();
    expect(completed).toEqual({
      total: 1,
      pending: 0,
      running: 0,
      completed: 1,
      failed: 0,
      cancelled: 0,
    });
    expectPartition(completed);
    expect(completed.running > 0 || completed.pending > 0).toBe(false);
    expect(executor).toHaveBeenCalledTimes(2);
    expect(completeStats).toEqual([completed]);
  });

  it('counts the final failed attempt exactly once', async () => {
    const executor = vi.fn<() => Promise<void>>().mockRejectedValue(new Error('always fails'));
    const queue = new PreloadQueue(QUEUE_CONFIG);
    const errorStats: PreloadStats[] = [];
    queue.on('task:error', () => errorStats.push(queue.getStats()));

    addTask(queue, executor);
    await startScheduledWork();
    await vi.advanceTimersByTimeAsync(100);
    await startScheduledWork();

    const failed = queue.getStats();
    expect(failed).toEqual({
      total: 1,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 1,
      cancelled: 0,
    });
    expectPartition(failed);
    expect(failed.running > 0 || failed.pending > 0).toBe(false);
    expect(executor).toHaveBeenCalledTimes(2);
    expect(errorStats).toEqual([failed]);
  });

  it('cancels a retry wait and never starts another attempt', async () => {
    const executor = vi.fn<() => Promise<void>>().mockRejectedValue(new Error('retry later'));
    const queue = new PreloadQueue(QUEUE_CONFIG);
    const taskId = addTask(queue, executor);

    await startScheduledWork();
    expect(queue.getStats().pending).toBe(1);
    expect(queue.cancelTask(taskId)).toBe(true);

    const cancelled = queue.getStats();
    expect(cancelled).toEqual({
      total: 1,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 1,
    });
    expectPartition(cancelled);
    expect(cancelled.running > 0 || cancelled.pending > 0).toBe(false);

    await vi.advanceTimersByTimeAsync(1_000);
    expect(executor).toHaveBeenCalledTimes(1);
    expect(queue.getStats()).toEqual(cancelled);
  });

  it('prevents an attempt from a reset queue from writing into the fresh generation', async () => {
    let resolveOld!: () => void;
    const oldExecutor = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveOld = resolve;
        })
    );
    const oldQueue = getPreloadQueue(QUEUE_CONFIG);
    addTask(oldQueue, oldExecutor, 0);
    await startScheduledWork();
    expect(oldQueue.getStats().running).toBe(1);

    resetPreloadQueue();
    const freshQueue = getPreloadQueue(QUEUE_CONFIG);
    const freshExecutor = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    addTask(freshQueue, freshExecutor, 0);
    await startScheduledWork();

    const freshCompleted = freshQueue.getStats();
    expect(freshCompleted.completed).toBe(1);
    expectPartition(freshCompleted);

    resolveOld();
    await Promise.resolve();
    await Promise.resolve();

    expect(oldQueue.getStats()).toEqual({
      total: 1,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 1,
    });
    expect(freshQueue.getStats()).toEqual(freshCompleted);
    expect(freshExecutor).toHaveBeenCalledTimes(1);
  });

  it('emits queue:empty exactly once per logical non-empty to empty transition', async () => {
    const queue = new PreloadQueue(QUEUE_CONFIG);
    const empty = vi.fn();
    queue.on('queue:empty', empty);

    addTask(queue, vi.fn<() => Promise<void>>().mockResolvedValue(undefined), 0);
    await startScheduledWork();
    await vi.runOnlyPendingTimersAsync();
    expect(empty).toHaveBeenCalledTimes(1);

    await vi.runOnlyPendingTimersAsync();
    expect(empty).toHaveBeenCalledTimes(1);

    const queuedId = addTask(queue, vi.fn<() => Promise<void>>().mockResolvedValue(undefined), 0);
    expect(queue.cancelTask(queuedId)).toBe(true);
    await vi.runOnlyPendingTimersAsync();
    expect(empty).toHaveBeenCalledTimes(2);

    queue.pause();
    addTask(queue, vi.fn<() => Promise<void>>().mockResolvedValue(undefined), 0);
    queue.clear();
    await vi.runOnlyPendingTimersAsync();
    expect(empty).toHaveBeenCalledTimes(3);
  });

  it('keeps a cancelled running executor in the physical concurrency slot until it settles', async () => {
    const first = deferred();
    const second = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const queue = new PreloadQueue(QUEUE_CONFIG);
    const firstId = addTask(queue, () => first.promise, 0);
    addTask(queue, second, 0);

    await startScheduledWork();
    expect(queue.cancelTask(firstId)).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(second).not.toHaveBeenCalled();

    first.resolve();
    await vi.runOnlyPendingTimersAsync();
    expect(second).toHaveBeenCalledTimes(1);
    expect(queue.getStats()).toMatchObject({ completed: 1, cancelled: 1 });
  });

  it('keeps clear() executors in physical slots before reusing the same queue', async () => {
    const first = deferred();
    const second = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const queue = new PreloadQueue(QUEUE_CONFIG);
    addTask(queue, () => first.promise, 0);

    await startScheduledWork();
    queue.clear();
    addTask(queue, second, 0);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(second).not.toHaveBeenCalled();

    first.resolve();
    await vi.runOnlyPendingTimersAsync();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('does not release a timed-out executor slot until the underlying promise settles', async () => {
    const first = deferred();
    const second = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const queue = new PreloadQueue({ ...QUEUE_CONFIG, taskTimeout: 50 });
    addTask(queue, () => first.promise, 0);
    addTask(queue, second, 0);

    await startScheduledWork();
    await vi.advanceTimersByTimeAsync(50);
    expect(queue.getStats()).toMatchObject({ failed: 1, pending: 1, running: 0 });
    expect(second).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1_000);
    expect(second).not.toHaveBeenCalled();
    first.resolve();
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(16);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('waits for the timed-out attempt to settle before starting its retry', async () => {
    const first = deferred();
    const retry = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const executor = vi
      .fn<() => Promise<void>>()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(retry);
    const queue = new PreloadQueue({ ...QUEUE_CONFIG, taskTimeout: 50 });
    addTask(queue, executor);

    await startScheduledWork();
    await vi.advanceTimersByTimeAsync(150);
    expect(queue.getStats()).toMatchObject({ pending: 1, running: 0 });
    expect(executor).toHaveBeenCalledTimes(1);

    first.resolve();
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(16);
    expect(executor).toHaveBeenCalledTimes(2);
    expect(retry).toHaveBeenCalledTimes(1);
    expect(queue.getStats()).toMatchObject({ completed: 1, pending: 0, running: 0 });
  });

  it('publishes atomic queue:change snapshots for paused add and retry wait', async () => {
    const queue = new PreloadQueue(QUEUE_CONFIG);
    const snapshots: PreloadStats[] = [];
    queue.on('queue:change', () => snapshots.push(queue.getStats()));
    queue.pause();

    addTask(queue, vi.fn<() => Promise<void>>().mockRejectedValue(new Error('retry')));
    expect(snapshots.at(-1)).toMatchObject({ pending: 1, running: 0 });

    queue.resume();
    await startScheduledWork();
    expect(snapshots).toContainEqual({
      total: 1,
      pending: 1,
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    });
  });

  it('writes the complete cancellation ledger before clear emits task:cancel', () => {
    const queue = new PreloadQueue(QUEUE_CONFIG);
    const snapshots: PreloadStats[] = [];
    queue.pause();
    addTask(queue, vi.fn<() => Promise<void>>().mockResolvedValue(undefined), 0);
    addTask(queue, vi.fn<() => Promise<void>>().mockResolvedValue(undefined), 0);
    queue.on('task:cancel', () => snapshots.push(queue.getStats()));

    queue.clear();

    expect(snapshots).toEqual([
      { total: 2, pending: 0, running: 0, completed: 0, failed: 0, cancelled: 2 },
      { total: 2, pending: 0, running: 0, completed: 0, failed: 0, cancelled: 2 },
    ]);
  });

  it('cleans retry and scheduling timers when retry wait is cancelled', async () => {
    const queue = new PreloadQueue(QUEUE_CONFIG);
    const taskId = addTask(
      queue,
      vi.fn<() => Promise<void>>().mockRejectedValue(new Error('retry'))
    );

    await startScheduledWork();
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    queue.cancelTask(taskId);
    await vi.runOnlyPendingTimersAsync();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps queue:change reentrant cancellation ordered and timer-free', async () => {
    const queue = new PreloadQueue(QUEUE_CONFIG);
    const events: string[] = [];
    let taskId = '';
    let changeCount = 0;
    queue.on('queue:change', () => {
      changeCount++;
      if (taskId && changeCount === 3) {
        queue.cancelTask(taskId);
      }
    });
    queue.on('task:start', () => events.push('start'));
    queue.on('task:cancel', () => events.push('cancel'));

    taskId = addTask(queue, vi.fn<() => Promise<void>>().mockRejectedValue(new Error('retry')));
    await startScheduledWork();

    expect(events).toEqual(['start', 'cancel']);
    expect(queue.getStats()).toMatchObject({ pending: 0, running: 0, cancelled: 1 });
    await vi.runOnlyPendingTimersAsync();
    expect(vi.getTimerCount()).toBe(0);
  });
});
