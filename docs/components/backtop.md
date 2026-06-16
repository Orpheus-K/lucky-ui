---
title: Backtop 返回顶部
phone: backtop
---

# Backtop 返回顶部

当页面或容器滚动到一定距离后，显示悬浮返回顶部按钮。支持页面滚动模式和受控容器滚动模式。

## 基础用法

```vue
<lk-backtop />
```

默认监听页面滚动，滚动高度超过 `visibilityHeight` 后显示按钮。

## 自定义位置与样式

```vue
<lk-backtop
  right="40rpx"
  bottom="160rpx"
  shape="round"
  size="lg"
/>
```

## 自定义回顶速率

`easing` 支持内置名称与 CSS 贝塞尔曲线，适合需要更自然回弹节奏的业务页。

```vue
<lk-backtop
  :duration="640"
  easing="cubic-bezier(0.22, 1, 0.36, 1)"
/>
```

## 容器内受控模式

当页面主体不是整页滚动，而是内部 `scroll-view` 滚动时，需要关闭页面滚动监听，改由外部传入 `scrollTop`。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const innerTop = ref(0)

function onScroll(e) {
  innerTop.value = e.detail.scrollTop
}
</script>

<template>
  <scroll-view scroll-y :scroll-top="innerTop" style="height: 500rpx" @scroll="onScroll">
    <view style="height: 2000rpx"></view>
  </scroll-view>

  <lk-backtop
    :use-page-scroll="false"
    :scroll-top="innerTop"
    :duration="640"
    easing="easeOutCubic"
    @to-top="innerTop = 0"
  />
</template>
```

## 自定义按钮内容

```vue
<lk-backtop text="TOP">
  <lk-icon name="arrow-up-circle-fill" size="40" color="var(--lk-text-inverse)" />
</lk-backtop>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import BacktopDemo from '@/components/demos/backtop-demo.vue'
</script>

<template>
  <BacktopDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-backtop />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| zIndex | 层级 | `number` | `400` |
| visibilityHeight | 滚动超过该值后显示按钮 | `number` | `200` |
| right | 距离右侧偏移 | `string \| number` | `'32rpx'` |
| bottom | 距离底部偏移 | `string \| number` | `'80rpx'` |
| duration | 回顶动画时长，单位 ms | `number` | `300` |
| easing | 回顶缓动函数，支持 `linear` / `easeOutCubic` / `cubic-bezier(...)` | `string` | `linear` |
| shape | 按钮形状 | `circle \| square \| round` | `circle` |
| size | 按钮尺寸 | `sm \| md \| lg` | `md` |
| icon | 图标名称 | `string` | `'arrow-up'` |
| text | 按钮文字 | `string` | `''` |
| usePageScroll | 是否监听页面滚动 | `boolean` | `true` |
| scrollTop | 当前滚动位置；受控模式下使用 | `number` | `0` |
| id | 根节点 id | `string` | `''` |
| customClass | 根节点自定义类名 | `string \| object \| array` | — |
| customStyle | 根节点自定义样式 | `string \| object` | — |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击按钮时触发 | `(event?: Event)` |
| to-top | 执行回顶操作时触发；受控模式下用于外部同步滚动归零 | `({ usePageScroll, duration, easing, event })` |
| change:visible | 按钮显示状态变化时触发 | `(visible: boolean, scrollTop?: number)` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 自定义按钮内容 |

## 使用建议

::: tip
如果你的页面主体是 `scroll-view`，请务必设置 `usePageScroll="false"`，并把容器的滚动值同步到 `scrollTop`。
:::

## 发布验收

- H5：受控 `scroll-view` 滚动超过阈值后按钮应出现，点击后应触发回顶并同步 `scrollTop` 为 0。
- App：重点复核 fixed 位置、安全区底部距离和 `pageScrollTo` 回顶节奏。
- 小程序：重点复核页面滚动模式与容器受控模式，避免双滚动容器导致按钮状态不同步。
- 自动回归：`tests/visual/needs-hardening-showcase.spec.ts` 覆盖 showcase 元数据、受控滚动显示按钮和点击回顶。
