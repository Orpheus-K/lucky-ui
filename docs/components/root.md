---
title: Root 根节点
phone: root
---

# Root 根节点

页面级根容器，用于统一 Lucky UI 的主题作用域、品牌色变量、安全区变量与全局反馈宿主。

## 基础用法

推荐在主页面或业务根布局包裹内容。使用 `LkRoot` 后，Toast 宿主会自动挂载，不需要再额外写 `<lk-toast-manager />`。

```vue
<template>
  <lk-root>
    <page-layout />
  </lk-root>
</template>
```

## 局部主题

`theme="auto"` 会跟随 Lucky UI 当前主题；传入 `light` 或 `dark` 时，仅影响当前根节点内部。

```vue
<template>
  <lk-root theme="dark" brand-color="#13c2c2">
    <view class="page">
      <lk-button @click="showToast">显示 Toast</lk-button>
    </view>
  </lk-root>
</template>

<script setup lang="ts">
import { toastStore } from '@/uni_modules/lucky-ui'

function showToast() {
  toastStore.show('Root 已承载 Toast')
}
</script>
```

## 关闭内置 Toast

如果页面仍使用低层的 `<lk-toast-manager />`，应关闭 Root 的内置宿主，避免重复挂载。

```vue
<template>
  <lk-root :toast="false">
    <page-layout />
    <lk-toast-manager />
  </lk-root>
</template>
```

## 高质量根节点标准

一个可长期维护的根节点应具备这些能力：

| 能力 | 说明 |
|------|------|
| 稳定单根契约 | 对外只暴露明确根容器和默认插槽，不制造额外布局副作用 |
| 清晰作用域 | 主题、品牌色、CSS 变量只影响当前 Root 内部 |
| 跨端安全区 | H5 使用 `env(safe-area-inset-*)`，小程序/App 优先使用运行时安全区 |
| 全局宿主 | Toast 这类全局反馈集中挂载，避免页面重复声明 |
| 层级边界 | 不随意抬高根节点 z-index，浮层仍遵循组件自身层级体系 |
| 可关闭能力 | 全局宿主、全高、安全区等行为均可通过 prop 显式关闭 |
| 扩展入口 | 为后续 Loading、Notify、浮层宿主保留同一个页面级入口 |
| 可预测默认值 | 不隐式锁滚动，不接管业务路由，不依赖 DOM API |
| 类型完整 | 导出 props 类型和全局组件声明，IDE 能正确提示 |

## 实用场景

| 场景 | 建议 |
|------|------|
| 应用主页面 | 用 `LkRoot` 包裹主布局，统一主题、品牌变量与 Toast 宿主 |
| 业务根布局 | 在登录页、工作台、设置页等独立布局入口使用 |
| 局部主题隔离 | 活动页、预览区、嵌入模块可传 `theme` 和 `brandColor` |
| 自定义导航框架 | 搭配 Navbar、Tabbar、TabbarContainer，复用全高与安全区变量 |
| 后续全局能力 | 为 Loading、Notify、浮层宿主等能力预留稳定入口 |

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| theme | 主题模式，`auto` 跟随当前 Lucky UI 主题 | `string` | `auto / light / dark` | `auto` |
| brandColor | 局部品牌色，仅影响当前根节点内部 | `string` | — | `''` |
| locale | Lucky UI 组件语言，传入后调用 `Locale.use` | `string` | — | `''` |
| background | 根节点背景 | `string` | `page / container / transparent` | `page` |
| fullHeight | 是否启用页面级最小高度 | `boolean` | — | `true` |
| safeArea | 是否暴露安全区 CSS 变量 | `boolean` | — | `true` |
| toast | 是否内置 Toast 宿主 | `boolean` | — | `true` |
| customClass | 自定义类名 | `string / object / array` | — | `''` |
| customStyle | 自定义样式 | `string / object` | — | `''` |

### Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| default | 页面内容 | — |

### CSS 变量

| CSS 变量 | 说明 |
|----------|------|
| `--lk-root-safe-area-top` | 当前根节点顶部安全区 |
| `--lk-root-safe-area-right` | 当前根节点右侧安全区 |
| `--lk-root-safe-area-bottom` | 当前根节点底部安全区 |
| `--lk-root-safe-area-left` | 当前根节点左侧安全区 |
| `--lk-safe-area-top` | Root 对外提供的顶部安全区别名 |
| `--lk-safe-area-bottom` | Root 对外提供的底部安全区别名 |

## 注意事项

::: tip
Root 首版不会接管 Popup、Modal、Overlay 的渲染宿主，现有浮层组件行为保持不变。
:::

::: warning
同一页面只保留一个 Toast 宿主。使用 `LkRoot` 默认配置时，不要再手写 `<lk-toast-manager />`。
:::
