---
title: 预加载系统 (Preload System)
phone: preload
---

# 预加载系统 (Preload System) <Badge type="warning" text="实验性" />

用于在用户真正进入页面前，提前加载页面资源、图片或自定义任务，降低白屏与等待感。

## 什么时候用

- 首页加载完成后，预加载常用二级页。
- 列表数据返回后，预加载首屏可见图片。
- Tabbar 应用中，预加载非当前 tab 页面。

## 快速开始

### 1) 页面 + 图片预加载

```typescript
import { usePreload, PreloadPriority } from '@/uni_modules/lucky-ui/core/src';
import { onMounted } from 'vue';

const { preloadPage, preloadImages, stats, isLoading } = usePreload({
  autoStart: true,
  startDelay: 0,
});

onMounted(() => {
  preloadPage({ path: '/pages_sub/search/index', priority: PreloadPriority.HIGH });
  preloadPage({ path: '/pages_sub/settings/index', priority: PreloadPriority.MEDIUM });

  preloadImages(
    [
      'https://picsum.photos/420/240?random=11',
      'https://picsum.photos/420/240?random=12',
    ],
    PreloadPriority.LOW
  );
});

// 响应式状态
console.log(isLoading.value, stats.value);
```

### 2) Tabbar 预加载

适合 tab 首页稳定后，按优先级预热其他 tab 页面。

```typescript
import { useTabbarPreload } from '@/uni_modules/lucky-ui/core/src';

const { isPreloaded, triggerPreload } = useTabbarPreload({
  pages: [
    { id: 'search', path: '/pages_sub/search/index' },
    { id: 'settings', path: '/pages_sub/settings/index' },
  ],
  currentPageId: 'search',
  delay: 1500,
  debug: true,
});

triggerPreload();
console.log(isPreloaded('settings'));
```

## API

### usePreload

用于管理预加载队列和状态。

**参数**

| 参数       | 类型                     | 默认值  | 说明                             |
| ---------- | ------------------------ | ------- | -------------------------------- |
| config     | `Partial<PreloadConfig>` | -       | 预加载配置                       |
| autoStart  | `boolean`                | `false` | 是否在组件挂载时自动开始         |
| startDelay | `number`                 | `1000`  | 首次加载完成后的延迟时间（毫秒） |

**返回值**

| 属性          | 类型                                        | 说明               |
| ------------- | ------------------------------------------- | ------------------ |
| manager       | `PreloadManager`                            | 预加载管理器实例   |
| stats         | `Ref<PreloadStats>`                         | 统计信息（响应式） |
| isLoading     | `Ref<boolean>`                              | 是否正在加载       |
| isPaused      | `Ref<boolean>`                              | 是否暂停           |
| preloadPage   | `(options: PagePreloadOptions) => string`   | 预加载页面         |
| preloadPages  | `(pages: PagePreloadOptions[]) => string[]` | 预加载多个页面     |
| preloadImage  | `(options: ImagePreloadOptions) => string`  | 预加载图片         |
| preloadImages | `(urls: string[], priority?) => string[]`   | 预加载多张图片     |
| pause         | `() => void`                                | 暂停预加载         |
| resume        | `() => void`                                | 恢复预加载         |
| clear         | `() => void`                                | 清空队列           |
| on            | `(event, handler) => void`                  | 监听事件           |
| off           | `(event, handler) => void`                  | 移除事件监听       |

### useTabbarPreload

用于 Tabbar 页面的延迟预加载。

**参数**

| 参数          | 类型                                                       | 说明                          |
| ------------- | ---------------------------------------------------------- | ----------------------------- |
| pages         | `Array<{ id: string; path: string; dataUrls?: string[] }>` | Tabbar 页面配置               |
| currentPageId | `string`                                                   | 当前页面 ID                   |
| delay         | `number`                                                   | 预加载延迟（毫秒），默认 2000 |
| debug         | `boolean`                                                  | 是否启用调试日志              |

### PreloadConfig

队列全局配置。

| 参数           | 类型      | 默认值  | 说明                     |
| -------------- | --------- | ------- | ------------------------ |
| maxConcurrency | `number`  | `2`     | 最大并发数               |
| defaultRetries | `number`  | `2`     | 默认重试次数             |
| retryDelay     | `number`  | `1000`  | 重试延迟（毫秒）         |
| idleThreshold  | `number`  | `10`    | 空闲时间阈值（毫秒）     |
| taskTimeout    | `number`  | `30000` | 任务超时时间（毫秒）     |
| debug          | `boolean` | `false` | 是否启用调试日志         |
| pauseOnHidden  | `boolean` | `true`  | 页面隐藏时是否暂停预加载 |

### PreloadPriority

任务优先级。

| 值         | 说明                              |
| ---------- | --------------------------------- |
| HIGH (1)   | 高优先级 - 用户即将访问的页面     |
| MEDIUM (2) | 中优先级 - 常用页面               |
| LOW (3)    | 低优先级 - 不常用但可能访问的页面 |

### 事件

| 事件            | 说明     |
| --------------- | -------- |
| `task:start`    | 任务开始 |
| `task:complete` | 任务完成 |
| `task:error`    | 任务失败 |
| `task:cancel`   | 任务取消 |
| `queue:empty`   | 队列清空 |
| `queue:pause`   | 队列暂停 |
| `queue:resume`  | 队列恢复 |

## 调试面板（推荐开发环境开启）

可视化查看任务状态与日志。调试面板是开发工具，不进入公开组件入口、全局类型、组件总览首批清单与发布宣传；需要时直接从源码路径导入，生产环境保持关闭。

```vue
<template>
  <view>
    <lk-preload-debugger :visible="isDev" position="bottom-right" />
  </view>
</template>

<script setup lang="ts">
import LkPreloadDebugger from '@/uni_modules/lucky-ui/components/lk-preload-debugger/lk-preload-debugger.vue';

const isDev = import.meta.env.DEV;
</script>
```

**Props**

| 参数     | 类型                                                           | 默认值           | 说明     |
| -------- | -------------------------------------------------------------- | ---------------- | -------- |
| visible  | `boolean`                                                      | `false`          | 是否显示 |
| position | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'bottom-right'` | 位置     |

## 常见模式

### 首页延迟预热

```typescript
import { onMounted } from 'vue';
import { usePreload, PreloadPriority } from '@/uni_modules/lucky-ui/core/src';

const { preloadPages } = usePreload();

onMounted(() => {
  setTimeout(() => {
    preloadPages([
      { path: '/pages_sub/product-detail/index', priority: PreloadPriority.HIGH },
      { path: '/pages_sub/search/index', priority: PreloadPriority.MEDIUM },
      { path: '/pages_sub/settings/index', priority: PreloadPriority.LOW },
    ]);
  }, 2000);
});
```

### 列表图片预热

```typescript
import { watch } from 'vue';
import { usePreload, PreloadPriority } from '@/uni_modules/lucky-ui/core/src';

const { preloadImages } = usePreload();

watch(productList, list => {
  const imageUrls = list.map(item => item.image);
  preloadImages(imageUrls, PreloadPriority.MEDIUM);
});
```

### 自定义任务

```typescript
import {
  getPreloadManager,
  PreloadResourceType,
  PreloadPriority,
} from '@/uni_modules/lucky-ui/core/src/preload';

const manager = getPreloadManager();

manager.addTask({
  type: PreloadResourceType.CUSTOM,
  priority: PreloadPriority.LOW,
  resource: 'custom-resource-key',
  maxRetries: 3,
  executor: async () => {
    // 自定义预加载逻辑
    await fetchSomeData();
    await loadSomeScript();
  },
});
```

## 平台差异

| 功能                | H5  | 微信小程序            | 其他小程序            |
| ------------------- | --- | --------------------- | --------------------- |
| requestIdleCallback | ✅  | setTimeout fallback   | setTimeout fallback   |
| link prefetch       | ✅  | 依运行端能力          | 依运行端能力          |
| uni.preloadPage     | 依运行端能力 | ✅           | 依运行端能力          |
| Image 预加载        | ✅  | ✅ (uni.getImageInfo) | ✅ (uni.getImageInfo) |

## 注意事项

1. 避免一次性塞入过多任务，优先预加载“下一跳页面”。
2. 首屏阶段建议延迟触发，避免影响首屏渲染。
3. 生产环境关闭调试面板与详细日志。
4. `LkPreloadDebugger` 不从 `components/index.ts` 导出，避免被误纳入公开组件 API。
5. 调试面板使用 fixed 定位，仅建议开发态启用；App 与小程序端需避免覆盖业务底部栏。

## 源码位置

- `src/uni_modules/lucky-ui/core/src/preload/`
- `src/uni_modules/lucky-ui/components/lk-preload-debugger/`
