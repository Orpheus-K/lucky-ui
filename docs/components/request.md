---
title: Network Request 网络请求
---

# Network Request 网络请求

Lucky UI 内置网络请求工具，提供统一的请求封装、拦截器、重试、取消请求、上传下载与状态码辅助方法。

## 引入方式

```ts
import {
  createRequest,
  request,
  HTTP_STATUS,
  isSuccessStatus,
  isClientErrorStatus,
  isServerErrorStatus,
  transformRequest,
  transformResponse,
} from '@/uni_modules/lucky-ui/core/src';
```

## 创建实例

```ts
import { createRequest } from '@/uni_modules/lucky-ui/core/src';

const api = createRequest({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  retry: 1,
  retryDelay: 500,
  loading: false,
  loadingText: '加载中...',
  header: {
    'Content-Type': 'application/json',
  },
});
```

## 基础请求

```ts
// GET
const user = await api.get('/user/profile', { loading: true });

// POST
await api.post('/user/update', { nickname: 'Lucky' });

// PUT
await api.put('/user/settings', { darkMode: true });

// DELETE
await api.delete('/user/account');
```

## 拦截器

请求拦截器按 LIFO 执行，响应拦截器按 FIFO 执行。

```ts
const reqId = api.interceptors.request.use((config) => {
  const token = uni.getStorageSync('token');
  config.header = {
    ...config.header,
    Authorization: token ? `Bearer ${token}` : '',
  };
  return config;
});

const resId = api.interceptors.response.use((response) => {
  if (response.statusCode === HTTP_STATUS.UNAUTHORIZED) {
    uni.removeStorageSync('token');
  }
  return response;
});

// 不再需要时移除
api.interceptors.request.eject(reqId);
api.interceptors.response.eject(resId);
```

## 重试与错误处理

```ts
try {
  const res = await api.get('/unstable-api', {
    retry: 2,
    retryDelay: 1000,
  });

  if (isSuccessStatus(res.statusCode)) {
    console.log('ok', res.data);
  }
} catch (err: any) {
  if (isClientErrorStatus(err.statusCode || 0)) {
    uni.showToast({ title: '请求参数错误', icon: 'none' });
  } else if (isServerErrorStatus(err.statusCode || 0)) {
    uni.showToast({ title: '服务器开小差了', icon: 'none' });
  } else {
    uni.showToast({ title: '网络异常', icon: 'none' });
  }
}
```

## 取消请求

支持按 `requestId` 取消重复请求，也支持全部取消。

```ts
// 发起请求
api.get('/search', {
  data: { keyword: 'button' },
  requestId: 'search-list',
});

// 取消指定请求
api.cancel('search-list');

// 页面销毁时可全部取消
api.cancelAll();
```

## 上传与下载

```ts
// 上传
await api.upload({
  url: '/file/upload',
  filePath,
  name: 'file',
  formData: { biz: 'avatar' },
  onProgress: ({ progress }) => {
    console.log('upload progress:', progress);
  },
});

// 下载
const downloadRes = await api.download({
  url: '/file/template.xlsx',
  onProgress: ({ progress }) => {
    console.log('download progress:', progress);
  },
});

console.log(downloadRes.tempFilePath);
```

## 数据转换工具

```ts
const body = transformRequest.json({ name: 'Lucky UI' });
const query = transformRequest.queryString({ page: 1, pageSize: 20 });

const json = transformResponse.json<{ list: any[] }>(response);
```

## 默认实例

如果不需要自定义配置，可以直接使用默认实例：

```ts
import { request } from '@/uni_modules/lucky-ui/core/src';

const res = await request.get('/ping');
```

## 类型参考

- `RequestConfig`
- `RequestInstanceConfig`
- `RequestResponse<T>`
- `RequestError`
- `RequestInterceptors`

源码位置：

- `src/uni_modules/lucky-ui/core/src/utils/request.ts`
