---
title: PreloadDebugger 预加载调试面板
phone: preload
---

# PreloadDebugger 预加载调试面板 <Badge type="warning" text="实验性" />

`LkPreloadDebugger` 是预加载系统的开发态调试面板，用于观察任务队列、运行状态与调度日志。它不是公开业务组件，不从 `components/index.ts` 导出；需要时直接从源码路径导入。

## 什么时候用

- 开发环境验证页面预加载、图片预加载、自定义任务是否按预期入队。
- 排查任务过多、并发过高、失败重试、页面隐藏暂停等问题。
- Tabbar 应用调优非当前 Tab 的预热时机。

## 基础用法

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

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| visible | 是否显示调试面板 | `boolean` | `false` |
| position | 面板位置 | `top-left / top-right / bottom-left / bottom-right` | `bottom-right` |

## 使用规范

- 只在开发环境、测试包或内部白名单开启。
- 生产环境必须关闭，避免遮挡业务内容或暴露调度信息。
- App 与小程序端注意底部安全区、Tabbar、悬浮按钮的层级冲突。
- 预加载问题优先通过面板确认“任务是否入队”，再排查网络、路径和平台能力。

## 与预加载系统的关系

调试面板只负责显示状态，不负责创建任务。任务仍通过 [预加载系统](./preload) 的 `usePreload`、`useTabbarPreload` 或 `PreloadManager` 创建。

```ts
import { usePreload, PreloadPriority } from '@/uni_modules/lucky-ui/core/src';

const { preloadPage, preloadImages } = usePreload({ autoStart: true, debug: true });

preloadPage({ path: '/pages_sub/search/index', priority: PreloadPriority.HIGH });
preloadImages(['https://picsum.photos/420/240?random=1']);
```

## 注意事项

> [!WARNING]
> 该组件是开发工具，不建议纳入组件总览的公开宣传口径，也不建议全局注册。

> [!TIP]
> 如果预加载面板没有任何任务，优先检查 `usePreload` 是否启用、任务路径是否正确、页面是否因隐藏状态暂停队列。
