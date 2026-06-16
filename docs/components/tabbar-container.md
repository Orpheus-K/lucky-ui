---
title: Tabbar 容器
---

# Tabbar 容器 lk-tabbar-container

在**一个页面**内提供「底部 Tab + 多面板」整体布局：底部栏与 `lk-tabbar` 系列不同视觉（block、手电筒、浮动等），并内置**懒加载**、错误重试、可选预加载，适合 App 主壳、电商首页等多 Tab 单页场景。

若你只需要底部导航条、内容区自己管理，请使用 [Tabbar 底部导航](./tabbar) 的 **lk-tabbar**。

## 与 lk-tabbar 的区别

| 对比项 | lk-tabbar | lk-tabbar-container |
|--------|-----------|---------------------|
| 定位 | 纯底部导航 UI + `v-model` | 导航 + 内容区一体化容器 |
| 典型用法 | 与自建内容区或页面路由组合 | `tabs` 配置驱动多面板，单页内切换 |
| 视觉模式 | fixed / slider / bump | plain、block、flashlight、float 等 |
| 懒加载 | 无（由业务实现） | 内置按 Tab 懒加载组件 |

## 引入方式

- **推荐**：组件放在 `src/uni_modules/lucky-ui/` 下，在模板中直接使用 `<lk-tabbar-container>`（与 [安装与引入](/guide/install) 一致，无需写死 `src/uni_modules/lucky-ui/components/...` 路径）。
- **类型与配置**：`TabConfig` 等可从包入口按需导入，例如：

```ts
import type { TabConfig } from '@/uni_modules/lucky-ui';
// npm 包路径示例：from 'lucky-ui'
```

## 平台说明

- **动态组件配置**：在 `TabConfig` 上为每个 Tab 提供 `component`（可 `markRaw` 同步组件，或 `() => import('...')` 异步），适用于支持动态组件渲染的 UniApp 运行端。
- **具名插槽配置**：需要规避动态组件端差时，使用具名插槽 **`tab-{tabId}`** 传入各 Tab 内容（`tabId` 与配置里的 `id` 一致）。
- **底部定位**：容器内部底栏默认使用 fixed 定位与安全区占位；嵌套容器或已有底部安全区时可用 `:fixed="false"` 让底栏进入普通布局流。App、H5、小程序的 safe area 行为不同，首屏发布前必须在目标端确认底部遮挡与滚动高度。
- **视觉模式**：`flashlight`、`float`、`mask-fill` 等模式包含滤镜或较复杂动画；性能敏感页面优先使用 `plain`、`block`、`marker-top`、`marker-bottom`，或用 `safe-mode` 强制降级到 `plain`。

## 基础示例（动态组件配置）

```vue
<script setup lang="ts">
import { markRaw } from 'vue';
import type { TabConfig } from '@/uni_modules/lucky-ui';
import PageHome from './pages/home.vue';
import PageMine from './pages/mine.vue';

const tabs: TabConfig[] = [
  { id: 'home', label: '首页', icon: 'house', component: markRaw(PageHome), keepAlive: true },
  { id: 'mine', label: '我的', icon: 'gear', component: markRaw(PageMine), keepAlive: true },
];
</script>

<template>
  <view class="shell">
    <lk-tabbar-container :tabs="tabs" default-tab="home" mode="block" />
  </view>
</template>
```

## 具名插槽示例

```vue
<lk-tabbar-container :tabs="tabs" default-tab="home">
  <!-- #ifdef MP -->
  <template #tab-home>
    <home-panel />
  </template>
  <template #tab-mine>
    <mine-panel />
  </template>
  <!-- #endif -->
</lk-tabbar-container>
```

## 低风险渲染模式

当页面嵌在已有布局容器中，或目标端对动态组件、fixed 底栏、filter 动画更敏感时，建议同时使用 `render-mode="slot"`、`safe-mode` 与 `:fixed="false"`：

```vue
<lk-tabbar-container
  :tabs="tabs"
  default-tab="home"
  mode="flashlight"
  render-mode="slot"
  safe-mode
  :fixed="false"
>
  <template #tab-home="{ tabId, isActive }">
    <home-panel :tab-id="tabId" :is-active="isActive" />
  </template>
</lk-tabbar-container>
```

- `safe-mode` 会强制降级为 `plain`，避免发布首屏依赖高特效模式。
- `render-mode="slot"` 会忽略 `TabConfig.component`，只使用 `tab-{id}` 具名插槽。
- `fixed=false` 会让底栏进入容器正常布局，同时隐藏底部占位，适合嵌套 shell。

## Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| tabs | Tab 配置列表 | `TabConfig[]` | （必填） |
| defaultTab | 默认激活的 Tab `id` | `string` | `''`（回退为第一项） |
| mode | 底部栏视觉模式 | 见下表 | 未传时为 `block` |
| debug | 是否打印容器调试日志 | `boolean` | `false` |
| customClass | 根节点额外 class | `string` | `''` |
| customStyle | 根节点样式 | `string \| Record<string, string>` | `''` |
| preloadDelay | `preloadAll` 为 true 时，预加载其余 Tab 的延迟（ms） | `number` | `2000` |
| preloadAll | 是否在挂载后预加载其它 Tab | `boolean` | `true` |
| panelScrollable | 内容面板是否使用内置纵向滚动容器；Tab 内容已自带 `scroll-view` 时建议关闭 | `boolean` | `true` |
| fixed | 底部栏是否使用 `fixed` 定位；嵌套容器或已有底部安全区时可设为 `false` | `boolean` | `true` |
| safeMode | 低风险视觉模式；强制使用 `plain`，并关闭重动画/filter 效果 | `boolean` | `false` |
| renderMode | 内容渲染方式；`slot` 可完全避开动态组件渲染 | `auto \| component \| slot` | `auto` |

### mode 可选值

`plain` | `block` | `flashlight` | `float` | `marker-top` | `marker-bottom` | `dot-slide` | `bubble` | `ripple` | `mask-fill` | `text-raise`

宿主若需与全局设置联动，可自行维护状态并传入，例如 `:mode="appTabbarMode"`。

## Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| beforeChange | 切换前 | `(tabId, oldTabId)` |
| change | 切换完成 | `(tabId)` |

## TabConfig

```ts
interface TabConfig {
  id: string;
  label: string;
  icon: string;
  selectedIcon?: string;
  activeIconFill?: boolean;
  /** 动态组件配置：Tab 内容组件；可为异步 import */
  component?: Component | (() => Promise<{ default: Component }>);
  keepAlive?: boolean;
  badge?: number;
  dot?: boolean;
}
```

## 主题与样式

容器与底部栏颜色使用 Lucky UI 主题 **CSS 变量**（`--lk-bg-page`、`--lk-color-primary`、`--lk-bg-container` 等）。接入方引入主题 SCSS 后即可随亮暗色切换；无需依赖业务项目里的测试页样式文件。

## 发布前检查

1. `component` 动态组件配置与 `tab-{id}` 具名插槽方案二选一，避免同一 Tab 混用两套内容来源。
2. 若页面已有原生 tabbar、自定义 navbar 或 safe area 占位，优先评估 `:fixed="false"`，并确认 `lk-tabbar-container__placeholder` 不会产生双重底部间距。
3. 启用滤镜类视觉模式时，低端 App WebView 表现可能简化；公开示例默认使用 `block`，性能敏感场景使用 `safe-mode`。
4. 需要规避动态组件端差时，使用 `render-mode="slot"` 并为每个 Tab 提供 `tab-{id}` 具名插槽。

## 发布验收

`lk-tabbar-container` 已纳入 high-risk showcase 回归，发布前按下面边界验收：

| 场景 | 验收方式 | 要点 |
|------|----------|------|
| 展示台基线 | 自动回归 | `tests/visual/high-risk-showcase.spec.ts` 校验组件路由、verified 状态与高风险标记 |
| 动态组件配置 | 人工验收 | 动态组件、懒加载、重试、保活切换状态稳定 |
| 具名插槽配置 | 人工验收 | 使用 `tab-{id}` 插槽方案，规避 `<component :is>` 动态渲染端差 |
| 低风险降级 | 自动 + 人工验收 | `render-mode="slot"`、`safe-mode`、`:fixed="false"` 组合能在嵌套容器中稳定显示 |
| 底部安全区 | 人工验收 | fixed/static 底栏、placeholder 与系统 safe area 不产生双重遮挡 |

::: warning
`flashlight`、`float`、`mask-fill` 等模式包含 filter 或复杂动画。首批公开示例建议使用 `block`，其他模式以增强能力发布。
:::

## 参考

- 逻辑实现：`uni_modules/lucky-ui/core/src/tabbar-container`
- 本仓库演示：`src/components/demos/tabbar-container-demo.vue`、`src/pages/app-main/index.vue`
