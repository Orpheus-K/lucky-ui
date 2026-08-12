/**
 * uniapp 请求工具
 * 基于 @dcloudio/types 官方类型定义
 */
import { Locale } from '../../../locale';

/**
 * 扩展的请求配置
 */
export interface RequestConfig
  extends Omit<UniApp.RequestOptions, 'success' | 'fail' | 'complete'> {
  // 基础URL前缀
  baseURL?: string;
  // 请求重试次数
  retry?: number;
  // 重试延迟时间(ms)
  retryDelay?: number;
  // 是否显示加载提示
  loading?: boolean;
  // 加载提示文本
  loadingText?: string;
  // 请求唯一标识，用于取消重复请求
  requestId?: string;
  // 自定义元数据
  meta?: Record<string, unknown>;
}

/**
 * 响应数据接口
 */
export interface RequestResponse<T = unknown> {
  // 响应数据
  data: T;
  // 状态码
  statusCode: number;
  // 响应头
  header: Record<string, string>;
  // 响应cookie
  cookies?: string[];
  // 网络请求过程中一些调试信息
  profile?: UniApp.RequestProfile;
}

/**
 * 请求错误接口
 */
export interface RequestError extends UniApp.GeneralCallbackResult {
  // 状态码
  statusCode?: number;
  // 响应数据
  data?: unknown;
  // 请求配置
  config?: RequestConfig;
}

type FulfilledInterceptor<T> = (value: T) => T | Promise<T>;
type RejectedInterceptor = (error: unknown) => unknown;

interface Interceptor<T> {
  fulfilled: FulfilledInterceptor<T>;
  rejected?: RejectedInterceptor;
}

/**
 * 拦截器接口
 */
export interface RequestInterceptors {
  // 请求拦截器
  request: InterceptorManager<RequestConfig>;
  // 响应拦截器
  response: InterceptorManager<RequestResponse>;
}

/**
 * 上传文件响应接口
 */
export type UploadResponse = UniApp.UploadFileSuccessCallbackResult;

/**
 * 下载文件响应接口
 */
export interface DownloadResponse {
  // 临时文件路径
  tempFilePath: string;
  // 状态码
  statusCode: number;
  // 网络请求过程中一些调试信息
  profile?: UniApp.RequestProfile;
}

/**
 * 拦截器管理器
 */
class InterceptorManager<T> {
  private handlers: Array<Interceptor<T> | null> = [];

  /**
   * 添加拦截器
   */
  use(fulfilled: FulfilledInterceptor<T>, rejected?: RejectedInterceptor): number {
    this.handlers.push({ fulfilled, rejected });
    return this.handlers.length - 1;
  }

  /**
   * 移除拦截器
   */
  eject(id: number): void {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }

  /**
   * 遍历拦截器
   */
  forEach(fn: (handler: Interceptor<T>) => void): void {
    this.handlers.forEach(handler => {
      if (handler !== null) {
        fn(handler);
      }
    });
  }
}

/**
 * 请求任务管理器
 */
interface RequestGeneration {
  key: string;
  generation: number;
  cancelled: boolean;
  cancellationError: RequestError;
  cancellation: Promise<never>;
  rejectCancellation: (reason: RequestError) => void;
  task?: UniApp.RequestTask;
  retryTimer?: ReturnType<typeof setTimeout>;
}

class RequestTaskManager {
  private generations = new Map<string, RequestGeneration>();
  private generation = 0;

  /**
   * 开始一个逻辑请求，并让同 key 的旧 generation 失效
   */
  start(key: string, cancellationError: RequestError): RequestGeneration {
    let rejectCancellation!: (reason: RequestError) => void;
    const cancellation = new Promise<never>((_, reject) => {
      rejectCancellation = reject;
    });

    // cancellation 还会参与具体的 race；这里的兜底处理确保即使初始化流程意外中断，
    // 后续取消也不会产生未处理的 Promise 拒绝。
    void cancellation.catch(() => undefined);

    const generation: RequestGeneration = {
      key,
      generation: ++this.generation,
      cancelled: false,
      cancellationError,
      cancellation,
      rejectCancellation,
    };
    const previous = this.generations.get(key);

    // 先提交新 generation，再中止旧任务；即使 abort 同步触发旧回调，
    // 旧回调也无法删除或提交到新 generation。
    this.generations.set(key, generation);
    if (previous) {
      this.cancelGeneration(previous);
    }

    return generation;
  }

  /**
   * 将单次请求任务挂到所属逻辑请求
   */
  attach(generation: RequestGeneration, task: UniApp.RequestTask): boolean {
    if (!this.isLatest(generation)) {
      this.abortTask(task);
      return false;
    }
    generation.task = task;
    return true;
  }

  /**
   * 单次尝试结束时只释放自己挂接的任务
   */
  release(generation: RequestGeneration, task: UniApp.RequestTask): void {
    if (generation.task === task) {
      generation.task = undefined;
    }
  }

  /**
   * 判断是否仍为该 key 的最新逻辑请求
   */
  isLatest(generation: RequestGeneration): boolean {
    return !generation.cancelled && this.generations.get(generation.key) === generation;
  }

  /**
   * 判断逻辑请求是否已被显式取消或替换
   */
  isCancelled(generation: RequestGeneration): boolean {
    return generation.cancelled;
  }

  /**
   * 保存重试等待计时器；generation 失效时立即清理
   */
  attachRetryTimer(generation: RequestGeneration, timer: ReturnType<typeof setTimeout>): boolean {
    if (!this.isLatest(generation)) {
      clearTimeout(timer);
      return false;
    }

    this.clearRetryTimer(generation);
    generation.retryTimer = timer;
    return true;
  }

  /**
   * 计时器自然到期时只释放自身句柄
   */
  releaseRetryTimer(generation: RequestGeneration, timer: ReturnType<typeof setTimeout>): void {
    if (generation.retryTimer === timer) {
      generation.retryTimer = undefined;
    }
  }

  /**
   * 取消任务
   */
  cancel(key: string): void {
    const generation = this.generations.get(key);
    if (!generation) return;

    this.generations.delete(key);
    this.cancelGeneration(generation);
  }

  /**
   * 取消所有任务
   */
  cancelAll(): void {
    const generations = [...this.generations.values()];
    this.generations.clear();
    generations.forEach(generation => {
      this.cancelGeneration(generation);
    });
  }

  /**
   * 逻辑请求结束；旧 generation 不得清理新 generation
   */
  finish(generation: RequestGeneration): void {
    generation.task = undefined;
    this.clearRetryTimer(generation);
    if (this.generations.get(generation.key) === generation) {
      this.generations.delete(generation.key);
    }
  }

  private cancelGeneration(generation: RequestGeneration): void {
    if (generation.cancelled) return;

    generation.cancelled = true;
    const task = generation.task;
    generation.task = undefined;
    this.clearRetryTimer(generation);
    generation.rejectCancellation(generation.cancellationError);
    this.abortTask(task);
  }

  private clearRetryTimer(generation: RequestGeneration): void {
    if (generation.retryTimer !== undefined) {
      clearTimeout(generation.retryTimer);
      generation.retryTimer = undefined;
    }
  }

  private abortTask(task?: UniApp.RequestTask): void {
    if (!task) return;

    try {
      task.abort();
    } catch {
      // abort 是尽力清理；底层异常不得改变已经提交的取消终态。
    }
  }
}

/**
 * 请求实例配置
 */
export interface RequestInstanceConfig {
  // 基础URL
  baseURL?: string;
  // 默认超时时间
  timeout?: number;
  // 默认请求头
  header?: Record<string, string>;
  // 默认数据类型
  dataType?: UniApp.RequestOptions['dataType'];
  // 默认响应类型
  responseType?: UniApp.RequestOptions['responseType'];
  // 请求重试次数
  retry?: number;
  // 重试延迟时间
  retryDelay?: number;
  // 是否显示加载提示
  loading?: boolean;
  // 加载提示文本
  loadingText?: string;
}

/**
 * 请求类
 */
export class Request {
  // 默认配置
  public defaults: RequestInstanceConfig;
  // 拦截器
  public interceptors: RequestInterceptors;
  // 任务管理器
  private taskManager = new RequestTaskManager();
  // 加载状态
  private loadingCount = 0;

  constructor(config: RequestInstanceConfig = {}) {
    // 【关键修改】修复了构造函数中 header 的合并逻辑
    // 定义基础默认配置，以避免被传入的 config 完全覆盖
    const baseDefaults = {
      timeout: 60000,
      dataType: 'json',
      responseType: 'text',
      retry: 0,
      retryDelay: 1000,
      loading: false,
      loadingText: Locale.t('lk.common.loading'),
      header: {
        'Content-Type': 'application/json',
      },
    };

    // 合并配置，特别是深度合并 header
    this.defaults = {
      ...baseDefaults,
      ...config,
      header: {
        ...baseDefaults.header,
        ...config.header,
      },
    };

    this.interceptors = {
      request: new InterceptorManager<RequestConfig>(),
      response: new InterceptorManager<RequestResponse>(),
    };
  }

  /**
   * 合并配置
   */
  private mergeConfig(config: RequestConfig): RequestConfig {
    const merged: RequestConfig = {
      ...this.defaults,
      ...config,
      header: {
        ...this.defaults.header,
        ...config.header,
      },
    };

    // 处理URL
    if (merged.baseURL && !this.isAbsoluteURL(merged.url)) {
      merged.url = this.combineURLs(merged.baseURL, merged.url);
    }

    return merged;
  }

  /**
   * 判断是否为绝对URL
   */
  private isAbsoluteURL(url: string): boolean {
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
  }

  /**
   * 合并URL
   */
  private combineURLs(baseURL: string, relativeURL: string): string {
    return relativeURL
      ? `${baseURL.replace(/\/+$/, '')}/${relativeURL.replace(/^\/+/, '')}`
      : baseURL;
  }

  /**
   * 显示加载提示
   */
  private showLoading(text?: string): void {
    if (this.loadingCount === 0) {
      uni.showLoading({
        title: text || Locale.t('lk.common.loading'),
        mask: true,
      });
    }
    this.loadingCount++;
  }

  /**
   * 隐藏加载提示
   */
  private hideLoading(): void {
    this.loadingCount--;
    if (this.loadingCount <= 0) {
      this.loadingCount = 0;
      uni.hideLoading();
    }
  }

  /**
   * 生成请求唯一标识
   */
  private generateRequestId(config: RequestConfig): string {
    if (config.requestId) {
      return config.requestId;
    }
    return `${config.method || 'GET'}_${config.url}_${Date.now()}_${Math.random()}`;
  }

  /**
   * 延迟函数
   */
  private delay(ms: number, generation: RequestGeneration): Promise<void> {
    return new Promise(resolve => {
      const timer = setTimeout(() => {
        this.taskManager.releaseRetryTimer(generation, timer);
        resolve();
      }, ms);

      if (!this.taskManager.attachRetryTimer(generation, timer)) {
        resolve();
      }
    });
  }

  /**
   * 创建与 uni.request abort 语义一致的取消错误
   */
  private createCancellationError(config: RequestConfig): RequestError {
    return {
      errMsg: 'request:fail abort',
      config,
    };
  }

  /**
   * 执行单次请求尝试
   */
  private performRequestAttempt<T>(
    config: RequestConfig,
    generation: RequestGeneration,
    terminalOnFailure: boolean
  ): Promise<RequestResponse<T>> {
    return new Promise((resolve, reject) => {
      const taskRef: { current?: UniApp.RequestTask } = {};
      let settled = false;

      const settle = (handler: () => void): void => {
        if (settled) return;
        settled = true;
        if (taskRef.current) {
          this.taskManager.release(generation, taskRef.current);
        }
        handler();
      };

      let task: UniApp.RequestTask;
      try {
        task = uni.request({
          ...config,
          method: config.method as UniApp.RequestOptions['method'],
          success: (res: UniApp.RequestSuccessCallbackResult) => {
            if (!this.taskManager.isLatest(generation)) {
              settle(() => reject(this.createCancellationError(config)));
              return;
            }

            const response: RequestResponse<T> = {
              data: res.data as T,
              statusCode: res.statusCode,
              header: res.header,
              cookies: res.cookies,
              profile: res.profile,
            };
            settle(() => {
              this.taskManager.finish(generation);
              resolve(response);
            });
          },
          fail: (
            err: UniApp.GeneralCallbackResult & {
              statusCode?: number;
              data?: unknown;
            }
          ) => {
            if (!this.taskManager.isLatest(generation)) {
              settle(() => reject(this.createCancellationError(config)));
              return;
            }

            const error: RequestError = {
              errMsg: err.errMsg,
              statusCode: err.statusCode,
              data: err.data,
              config,
            };
            settle(() => {
              if (terminalOnFailure) {
                this.taskManager.finish(generation);
              }
              reject(error);
            });
          },
        });
      } catch (error) {
        if (settled) return;
        if (!this.taskManager.isLatest(generation)) {
          settle(() => reject(this.createCancellationError(config)));
          return;
        }

        settle(() => {
          if (terminalOnFailure) {
            this.taskManager.finish(generation);
          }
          reject(error);
        });
        return;
      }
      taskRef.current = task;

      if (settled) return;
      if (!this.taskManager.attach(generation, task)) {
        settle(() => reject(this.createCancellationError(config)));
      }
    });
  }

  /**
   * 执行请求（支持重试）
   */
  private async performRequest<T>(config: RequestConfig): Promise<RequestResponse<T>> {
    const requestId = this.generateRequestId(config);
    const cancellationError = this.createCancellationError(config);
    const generation = this.taskManager.start(requestId, cancellationError);
    const maxRetries = config.retry || 0;

    const attempts = async (): Promise<RequestResponse<T>> => {
      let attempt = 0;
      let firstError: unknown;
      let hasFirstError = false;

      while (true) {
        if (!this.taskManager.isLatest(generation)) {
          throw cancellationError;
        }

        const canRetry = attempt < maxRetries;
        try {
          return await this.performRequestAttempt<T>(config, generation, !canRetry);
        } catch (error) {
          if (this.taskManager.isCancelled(generation)) {
            throw cancellationError;
          }

          if (!hasFirstError) {
            firstError = error;
            hasFirstError = true;
          }
          if (!canRetry) {
            throw firstError;
          }

          if (config.retryDelay) {
            await Promise.race([
              this.delay(config.retryDelay, generation),
              generation.cancellation,
            ]);
          }
          if (!this.taskManager.isLatest(generation)) {
            throw cancellationError;
          }
          attempt += 1;
        }
      }
    };

    try {
      return await Promise.race([attempts(), generation.cancellation]);
    } finally {
      this.taskManager.finish(generation);
    }
  }

  /**
   * 请求方法
   */
  async request<T = unknown>(config: RequestConfig): Promise<RequestResponse<T>> {
    const mergedConfig = this.mergeConfig(config);
    // 用于在 finally 块中访问最终配置，以判断是否需要隐藏 loading
    let finalConfig: RequestConfig = mergedConfig;
    let loadingAcquired = false;

    // Promise 链，初始值为已合并的配置
    type RequestChainFn = (value: unknown) => unknown | Promise<unknown>;
    let promise: Promise<unknown> = Promise.resolve(mergedConfig);

    // 核心请求分发函数
    const dispatchRequest = (config: RequestConfig): Promise<RequestResponse<T>> => {
      finalConfig = config;
      if (finalConfig.loading) {
        this.showLoading(finalConfig.loadingText);
        loadingAcquired = true;
      }
      return this.performRequest<T>(finalConfig);
    };

    // 构建执行链，[成功处理, 失败处理, 成功处理, 失败处理, ...]
    const chain: Array<RequestChainFn | undefined> = [dispatchRequest as RequestChainFn, undefined];

    // 请求拦截器：后进先出 (LIFO)，使用 unshift 添加到链的头部
    this.interceptors.request.forEach(interceptor => {
      chain.unshift(
        interceptor.fulfilled as unknown as RequestChainFn,
        interceptor.rejected as unknown as RequestChainFn
      );
    });

    // 响应拦截器：先进先出 (FIFO)，使用 push 添加到链的尾部
    this.interceptors.response.forEach(interceptor => {
      chain.push(
        interceptor.fulfilled as unknown as RequestChainFn,
        interceptor.rejected as unknown as RequestChainFn
      );
    });

    // 执行 Promise 链
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    try {
      return (await promise) as RequestResponse<T>;
    } finally {
      if (loadingAcquired) {
        this.hideLoading();
      }
    }
  }

  /**
   * GET请求
   */
  get<T = unknown>(
    url: string,
    config?: Omit<RequestConfig, 'url' | 'method'>
  ): Promise<RequestResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  /**
   * POST请求
   */
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: Omit<RequestConfig, 'url' | 'method' | 'data'>
  ): Promise<RequestResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', data: data as RequestConfig['data'] });
  }

  /**
   * PUT请求
   */
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: Omit<RequestConfig, 'url' | 'method' | 'data'>
  ): Promise<RequestResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', data: data as RequestConfig['data'] });
  }

  /**
   * DELETE请求
   */
  delete<T = unknown>(
    url: string,
    config?: Omit<RequestConfig, 'url' | 'method'>
  ): Promise<RequestResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }

  /**
   * HEAD请求
   */
  head<T = unknown>(
    url: string,
    config?: Omit<RequestConfig, 'url' | 'method'>
  ): Promise<RequestResponse<T>> {
    return this.request<T>({ ...config, url, method: 'HEAD' });
  }

  /**
   * OPTIONS请求
   */
  options<T = unknown>(
    url: string,
    config?: Omit<RequestConfig, 'url' | 'method'>
  ): Promise<RequestResponse<T>> {
    return this.request<T>({ ...config, url, method: 'OPTIONS' });
  }

  /**
   * 取消请求
   */
  cancel(requestId: string): void {
    this.taskManager.cancel(requestId);
  }

  /**
   * 取消所有请求
   */
  cancelAll(): void {
    this.taskManager.cancelAll();
  }

  /**
   * 上传文件
   */
  upload(
    config: Omit<UniApp.UploadFileOption, 'success' | 'fail' | 'complete'> & {
      onProgress?: (result: UniApp.OnProgressUpdateResult) => void;
    }
  ): Promise<UploadResponse> {
    return new Promise((resolve, reject) => {
      const task = uni.uploadFile({
        ...config,
        success: res => {
          resolve(res);
        },
        fail: err => {
          reject(err);
        },
      });

      // 上传进度回调
      if (config.onProgress) {
        task.onProgressUpdate(config.onProgress);
      }
    });
  }

  /**
   * 下载文件
   */
  download(
    config: Omit<UniApp.DownloadFileOption, 'success' | 'fail' | 'complete'> & {
      onProgress?: (result: UniApp.OnProgressDownloadResult) => void;
    }
  ): Promise<DownloadResponse> {
    return new Promise((resolve, reject) => {
      const task = uni.downloadFile({
        ...config,
        success: (res: UniApp.DownloadSuccessData) => {
          const response: DownloadResponse = {
            tempFilePath: res.tempFilePath,
            statusCode: res.statusCode,
            profile: res.profile,
          };
          resolve(response);
        },
        fail: (err: UniApp.GeneralCallbackResult) => {
          reject(err);
        },
      });

      // 下载进度回调
      if (config.onProgress) {
        task.onProgressUpdate(config.onProgress);
      }
    });
  }
}

/**
 * 创建请求实例
 */
export function createRequest(config?: RequestInstanceConfig): Request {
  return new Request(config);
}

/**
 * 默认请求实例
 */
export const request = createRequest();

/**
 * HTTP状态码常量
 */
export const HTTP_STATUS = {
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  UPGRADE_REQUIRED: 426,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
} as const;

/**
 * 状态码判断工具
 */
export const isSuccessStatus = (status: number): boolean => status >= 200 && status < 300;
export const isRedirectStatus = (status: number): boolean => status >= 300 && status < 400;
export const isClientErrorStatus = (status: number): boolean => status >= 400 && status < 500;
export const isServerErrorStatus = (status: number): boolean => status >= 500 && status < 600;

/**
 * 响应数据转换工具
 */
export const transformResponse = {
  /**
   * JSON响应转换
   */
  json: <T>(response: RequestResponse): T => {
    if (typeof response.data === 'string') {
      try {
        return JSON.parse(response.data);
      } catch {
        return response.data as T;
      }
    }
    return response.data as T;
  },

  /**
   * 文本响应转换
   */
  text: (response: RequestResponse): string => {
    return String(response.data);
  },

  /**
   * ArrayBuffer响应转换
   */
  arrayBuffer: (response: RequestResponse): ArrayBuffer => {
    return response.data as ArrayBuffer;
  },
};

/**
 * 请求数据转换工具
 */
export const transformRequest = {
  /**
   * JSON数据转换
   */
  json: (data: unknown): string => {
    return JSON.stringify(data);
  },

  /**
   * 表单数据转换
   */
  formData: (data: Record<string, unknown>): string => {
    return Object.keys(data)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(String(data[key]))}`)
      .join('&');
  },

  /**
   * 查询字符串转换
   */
  queryString: (data: Record<string, unknown>): string => {
    return Object.keys(data)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(String(data[key]))}`)
      .join('&');
  },
};
