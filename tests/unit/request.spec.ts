import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createRequest,
  type RequestResponse,
} from '../../src/uni_modules/lucky-ui/core/src/utils/request';

interface ControlledRequest {
  options: UniApp.RequestOptions;
  task: UniApp.RequestTask;
  abort: ReturnType<typeof vi.fn>;
  fail: (error?: UniApp.GeneralCallbackResult & { statusCode?: number; data?: unknown }) => void;
  succeed: (data?: unknown) => void;
}

interface ControlledUniOptions {
  beforeCreate?: (index: number) => void;
  afterCreate?: (request: ControlledRequest, index: number) => void;
  onAbort?: (index: number) => void;
}

type Settled<T> = { status: 'fulfilled'; value: T } | { status: 'rejected'; reason: unknown };

function capture<T>(promise: Promise<T>): Promise<Settled<T>> {
  return promise.then(
    value => ({ status: 'fulfilled', value }),
    reason => ({ status: 'rejected', reason })
  );
}

async function flushMicrotasks(): Promise<void> {
  for (let index = 0; index < 6; index += 1) {
    await Promise.resolve();
  }
}

function installControlledUni(behavior: ControlledUniOptions = {}) {
  const requests: ControlledRequest[] = [];
  let invocationCount = 0;
  const request = vi.fn((options: UniApp.RequestOptions): UniApp.RequestTask => {
    const index = invocationCount;
    invocationCount += 1;
    behavior.beforeCreate?.(index);

    let settled = false;
    const fail: ControlledRequest['fail'] = (error = { errMsg: 'request:fail network' }) => {
      if (settled) return;
      settled = true;
      options.fail?.(error);
    };
    const succeed: ControlledRequest['succeed'] = (data = { ok: true }) => {
      if (settled) return;
      settled = true;
      options.success?.({
        data: data as UniApp.RequestSuccessCallbackResult['data'],
        statusCode: 200,
        header: {},
        cookies: [],
      });
    };
    const abort = vi.fn(() => {
      behavior.onAbort?.(index);
      fail({ errMsg: 'request:fail abort' });
    });
    const task = {
      abort,
      onHeadersReceived: vi.fn(),
      offHeadersReceived: vi.fn(),
    } as unknown as UniApp.RequestTask;

    const controlledRequest = { options, task, abort, fail, succeed };
    requests.push(controlledRequest);
    behavior.afterCreate?.(controlledRequest, index);
    return task;
  });

  const showLoading = vi.fn();
  const hideLoading = vi.fn();

  vi.stubGlobal('uni', {
    request,
    showLoading,
    hideLoading,
    getLocale: vi.fn(() => 'zh-Hans'),
  });

  return { request, requests, showLoading, hideLoading };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('request cancellation generations', () => {
  it('keeps a newer same-id request alive when an older retry delay is released', async () => {
    vi.useFakeTimers();
    const controller = installControlledUni();
    const api = createRequest();
    const first = capture(api.get('/first', { requestId: 'shared', retry: 1, retryDelay: 100 }));

    await flushMicrotasks();
    controller.requests[0].fail({ errMsg: 'request:fail offline' });
    await flushMicrotasks();
    expect(vi.getTimerCount()).toBe(1);

    const secondPromise = api.get<{ owner: string }>('/second', { requestId: 'shared' });
    await flushMicrotasks();

    expect(controller.requests).toHaveLength(2);
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(100);
    await flushMicrotasks();

    expect(controller.requests).toHaveLength(2);
    expect(controller.requests[1].abort).not.toHaveBeenCalled();
    await expect(first).resolves.toMatchObject({
      status: 'rejected',
      reason: {
        errMsg: 'request:fail abort',
        config: { url: '/first', requestId: 'shared' },
      },
    });

    controller.requests[1].succeed({ owner: 'second' });
    await expect(secondPromise).resolves.toMatchObject({ data: { owner: 'second' } });
  });

  it('never retries a directly cancelled logical request', async () => {
    vi.useFakeTimers();
    const controller = installControlledUni();
    const api = createRequest();
    const result = capture(
      api.get('/cancel-me', { requestId: 'cancel-me', retry: 2, retryDelay: 100 })
    );

    await flushMicrotasks();
    api.cancel('cancel-me');
    await flushMicrotasks();
    await vi.advanceTimersByTimeAsync(500);

    expect(controller.request).toHaveBeenCalledTimes(1);
    expect(controller.requests[0].abort).toHaveBeenCalledTimes(1);
    await expect(result).resolves.toMatchObject({
      status: 'rejected',
      reason: { errMsg: 'request:fail abort' },
    });
  });

  it('cancels a logical request while it is waiting to retry', async () => {
    vi.useFakeTimers();
    const controller = installControlledUni();
    const api = createRequest();
    const result = capture(
      api.get('/cancel-delay', { requestId: 'cancel-delay', retry: 2, retryDelay: 100 })
    );

    await flushMicrotasks();
    controller.requests[0].fail({ errMsg: 'request:fail offline' });
    await flushMicrotasks();
    expect(vi.getTimerCount()).toBe(1);
    api.cancel('cancel-delay');
    await flushMicrotasks();
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(500);

    expect(controller.request).toHaveBeenCalledTimes(1);
    await expect(result).resolves.toMatchObject({
      status: 'rejected',
      reason: { errMsg: 'request:fail abort' },
    });
  });

  it('does not let an older finally remove the newer request generation', async () => {
    const controller = installControlledUni();
    const api = createRequest();
    const first = capture(api.get('/first', { requestId: 'shared' }));

    await flushMicrotasks();
    const second = capture(api.get('/second', { requestId: 'shared' }));
    await flushMicrotasks();

    expect(controller.requests[0].abort).toHaveBeenCalledTimes(1);
    await expect(first).resolves.toMatchObject({
      status: 'rejected',
      reason: { errMsg: 'request:fail abort' },
    });

    api.cancel('shared');
    await flushMicrotasks();

    expect(controller.requests[1].abort).toHaveBeenCalledTimes(1);
    await expect(second).resolves.toMatchObject({
      status: 'rejected',
      reason: { errMsg: 'request:fail abort' },
    });
  });

  it('preserves a normal retry when the generation remains current', async () => {
    vi.useFakeTimers();
    const controller = installControlledUni();
    const api = createRequest();
    const result: Promise<RequestResponse<{ attempt: number }>> = api.get('/retry', {
      requestId: 'retry',
      retry: 1,
      retryDelay: 100,
    });

    await flushMicrotasks();
    controller.requests[0].fail({ errMsg: 'request:fail offline' });
    await flushMicrotasks();
    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(100);
    await flushMicrotasks();

    expect(vi.getTimerCount()).toBe(0);
    expect(controller.requests).toHaveLength(2);
    controller.requests[1].succeed({ attempt: 2 });
    await expect(result).resolves.toMatchObject({ data: { attempt: 2 } });
  });
});

describe('request terminal ownership', () => {
  it('commits a synchronous success before a same-id replacement starts', async () => {
    const controller = installControlledUni({
      afterCreate: (request, index) => {
        if (index === 0) {
          request.succeed({ owner: 'first' });
        }
      },
    });
    const api = createRequest();
    const first = capture(api.get<{ owner: string }>('/first', { requestId: 'shared' }));
    const second = capture(api.get<{ owner: string }>('/second', { requestId: 'shared' }));

    await flushMicrotasks();

    expect(controller.requests).toHaveLength(2);
    await expect(first).resolves.toMatchObject({
      status: 'fulfilled',
      value: { data: { owner: 'first' } },
    });

    controller.requests[1].succeed({ owner: 'second' });
    await expect(second).resolves.toMatchObject({
      status: 'fulfilled',
      value: { data: { owner: 'second' } },
    });
  });

  it('commits a synchronous terminal failure before a same-id replacement starts', async () => {
    const controller = installControlledUni({
      afterCreate: (request, index) => {
        if (index === 0) {
          request.fail({ errMsg: 'request:fail first-terminal' });
        }
      },
    });
    const api = createRequest();
    const first = capture(api.get('/first', { requestId: 'shared' }));
    const second = capture(api.get<{ owner: string }>('/second', { requestId: 'shared' }));

    await flushMicrotasks();

    expect(controller.requests).toHaveLength(2);
    await expect(first).resolves.toMatchObject({
      status: 'rejected',
      reason: { errMsg: 'request:fail first-terminal' },
    });

    controller.requests[1].succeed({ owner: 'second' });
    await expect(second).resolves.toMatchObject({
      status: 'fulfilled',
      value: { data: { owner: 'second' } },
    });
  });

  it.each([undefined, null])(
    'preserves a %s first synchronous error after retries are exhausted',
    async firstError => {
      const finalError = new Error('final error');
      const controller = installControlledUni({
        beforeCreate: index => {
          if (index === 0) {
            throw firstError;
          }
          throw finalError;
        },
      });
      const api = createRequest();
      const settled = await capture(
        api.get('/sync-throw', { requestId: 'sync-throw', retry: 1, retryDelay: 0 })
      );

      expect(controller.request).toHaveBeenCalledTimes(2);
      expect(settled).toEqual({ status: 'rejected', reason: firstError });
    }
  );

  it('uses retry as the number of extra attempts and returns the first ordinary error', async () => {
    const controller = installControlledUni();
    const api = createRequest();
    const result = capture(
      api.get('/retry-exhausted', {
        requestId: 'retry-exhausted',
        retry: 2,
        retryDelay: 0,
      })
    );

    await flushMicrotasks();
    controller.requests[0].fail({ errMsg: 'request:fail first' });
    await flushMicrotasks();
    controller.requests[1].fail({ errMsg: 'request:fail second' });
    await flushMicrotasks();
    controller.requests[2].fail({ errMsg: 'request:fail third' });

    expect(controller.request).toHaveBeenCalledTimes(3);
    await expect(result).resolves.toMatchObject({
      status: 'rejected',
      reason: { errMsg: 'request:fail first' },
    });
  });
});

describe('request cleanup ownership', () => {
  it('does not hide loading for a request rejected before dispatch', async () => {
    const controller = installControlledUni();
    const api = createRequest({ loading: true });
    const active = capture(api.get('/active'));

    await flushMicrotasks();
    expect(controller.showLoading).toHaveBeenCalledTimes(1);
    expect(controller.hideLoading).not.toHaveBeenCalled();

    const interceptorError = new Error('blocked before dispatch');
    api.interceptors.request.use(() => {
      throw interceptorError;
    });
    const blocked = capture(api.get('/blocked'));
    await expect(blocked).resolves.toEqual({
      status: 'rejected',
      reason: interceptorError,
    });

    expect(controller.hideLoading).not.toHaveBeenCalled();
    controller.requests[0].succeed();
    await expect(active).resolves.toMatchObject({ status: 'fulfilled' });
    expect(controller.hideLoading).toHaveBeenCalledTimes(1);
  });

  it('keeps replacement usable when abort cleanup throws synchronously', async () => {
    const abortError = new Error('abort cleanup failed');
    const controller = installControlledUni({
      onAbort: index => {
        if (index === 0) {
          throw abortError;
        }
      },
    });
    const api = createRequest();
    const first = capture(api.get('/first', { requestId: 'shared' }));

    await flushMicrotasks();
    const second = capture(api.get<{ owner: string }>('/second', { requestId: 'shared' }));
    await flushMicrotasks();

    expect(controller.requests[0].abort).toHaveBeenCalledTimes(1);
    expect(controller.requests).toHaveLength(2);
    await expect(first).resolves.toMatchObject({
      status: 'rejected',
      reason: { errMsg: 'request:fail abort' },
    });

    controller.requests[1].succeed({ owner: 'second' });
    await expect(second).resolves.toMatchObject({
      status: 'fulfilled',
      value: { data: { owner: 'second' } },
    });

    expect(() => api.cancel('shared')).not.toThrow();
    expect(controller.requests[1].abort).not.toHaveBeenCalled();
  });
});
