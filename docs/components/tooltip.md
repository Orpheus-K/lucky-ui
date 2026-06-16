---
title: Tooltip 文字提示
phone: tooltip
---

# Tooltip 文字提示

用于围绕一个触发元素显示轻量提示信息，支持 `hover`、`click`、手动控制和自定义内容。

## 基础用法

```vue
<lk-tooltip content="提示内容">
  <lk-button>悬停</lk-button>
</lk-tooltip>
```

## 点击触发

```vue
<lk-tooltip content="点击触发" trigger="click">
  <lk-button>点击看看</lk-button>
</lk-tooltip>
```

## 自定义内容

```vue
<lk-tooltip trigger="click">
  <lk-button>自定义内容</lk-button>
  <template #content>
    <view style="display:flex;align-items:center;gap:12rpx">
      <view style="width:20rpx;height:20rpx;border-radius:50%;background:#16a34a" />
      <text>支持复杂内容</text>
    </view>
  </template>
</lk-tooltip>
```

## 位置与宽度

```vue
<template>
  <lk-tooltip content="Top" placement="top"><lk-button>Top</lk-button></lk-tooltip>
  <lk-tooltip content="Bottom" placement="bottom" :width="260"><lk-button>Bottom</lk-button></lk-tooltip>
</template>
```

## 手动控制与常驻显示

```vue
<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
</script>

<template>
  <lk-tooltip :model-value="open" trigger="manual" content="手动控制">
    <lk-button @click="open = !open">切换</lk-button>
  </lk-tooltip>

  <lk-tooltip content="我会一直显示" always>
    <lk-button>常驻</lk-button>
  </lk-tooltip>
</template>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import TooltipDemo from '@/components/demos/tooltip-demo.vue'
</script>

<template>
  <TooltipDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-tooltip />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| content | 提示文本 | `string` | `''` |
| zIndex | 层级 | `number` | `600` |
| trigger | 触发方式 | `hover \| click \| manual` | `hover` |
| placement | 展示位置 | `top \| bottom \| left \| right` | `top` |
| modelValue | 手动控制显示状态 | `boolean` | `undefined` |
| disabled | 是否禁用 | `boolean` | `false` |
| always | 是否常驻显示 | `boolean` | `false` |
| defaultOpen | 初次挂载时是否默认展开一次 | `boolean` | `false` |
| offset | 与触发元素的间距（rpx） | `number` | `8` |
| width | 浮层宽度 | `number \| string` | `undefined` |
| showDelay | 显示延时（ms） | `number` | `80` |
| hideDelay | 隐藏延时（ms） | `number` | `80` |
| animation | 动画预设名称 | `keyof ANIMATION_PRESETS` | `undefined` |
| animationType | 动画类型 | `TransitionConfig['name']` | `undefined` |
| duration | 动画持续时间 | `number` | `180` |
| delay | 动画延迟 | `number` | `0` |
| easing | 缓动函数 | `TransitionConfig['easing']` | `ease-out` |
| id | 根节点 id | `string` | `''` |
| customClass | 根节点自定义类名 | `string \| object \| array` | — |
| customStyle | 根节点自定义样式 | `string \| object` | — |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| update:modelValue | 显示状态变化 | `(value: boolean) => void` |
| show | 显示时触发 | `({ trigger, event }) => void` |
| hide | 隐藏时触发 | `({ trigger, event }) => void` |
| open | 显示时触发，语义化别名 | `({ trigger, event }) => void` |
| close | 隐藏时触发，语义化别名 | `({ trigger, event }) => void` |
| click-trigger | 点击触发区域时触发 | `(event?: Event) => void` |
| mouseenter-trigger | 鼠标进入触发区域时触发 | `(event?: Event) => void` |
| mouseleave-trigger | 鼠标离开触发区域时触发 | `(event?: Event) => void` |
| mouseenter-content | 鼠标进入提示内容时触发 | `(event?: Event) => void` |
| mouseleave-content | 鼠标离开提示内容时触发 | `(event?: Event) => void` |
| placement-change | 自动修正展示位置时触发 | `(placement, oldPlacement) => void` |
| after-enter | 进入动画结束后触发 | `() => void` |
| after-leave | 离开动画结束后触发 | `() => void` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 触发器内容 |
| content | 自定义提示层内容 |

## 使用建议

::: tip
移动端优先使用 `click` 或 `manual`，桌面端才更适合 `hover`。
:::

## 发布验收

`lk-tooltip` 已纳入 high-risk showcase 回归，发布前按下面边界验收：

| 场景 | 验收方式 | 要点 |
|------|----------|------|
| 展示台基线 | 自动回归 | `tests/visual/high-risk-showcase.spec.ts` 校验组件路由、verified 状态与高风险标记 |
| 定位与层级 | 人工验收 | `top/right/bottom/left` 不遮挡触发器，弹层层级高于普通内容 |
| 触发方式 | 人工验收 | 移动端以 `click/manual` 为主；桌面端补 `hover` 进入、离开延迟 |

::: warning
Tooltip 的定位依赖触发器尺寸与页面边界，小程序和 App WebView 可能存在测量时序差异；复杂浮层场景建议使用 `manual` 控制显示状态。
:::
