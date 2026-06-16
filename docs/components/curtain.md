---
title: Curtain 幕帘
phone: curtain
---

# Curtain 幕帘

用于营销弹窗、活动海报、领券引导、新人礼包等全屏或居中展示的幕帘型浮层。支持图片模式和完全自定义插槽模式。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const show = ref(false)
</script>

<template>
  <lk-button @click="show = true">显示幕帘</lk-button>

  <lk-curtain
    v-model="show"
    image-url="https://img.yzcdn.cn/vant/apple-1.jpg"
  />
</template>
```

## 关闭按钮位置

```vue
<lk-curtain
  v-model="show"
  image-url="https://img.yzcdn.cn/vant/apple-2.jpg"
  close-position="top-right"
/>
```

可选值包括：`top-left`、`top-right`、`bottom-left`、`bottom-right`、`bottom`。

## 点击遮罩关闭

```vue
<lk-curtain
  v-model="show"
  image-url="https://img.yzcdn.cn/vant/apple-3.jpg"
  close-on-overlay
/>
```

## 自定义内容

如果要做优惠券、活动卡片、复杂营销布局，推荐直接使用默认插槽。

```vue
<lk-curtain
  v-model="show"
  width="580rpx"
  height="800rpx"
  close-position="bottom"
>
  <view style="width:100%;height:100%;background:linear-gradient(180deg,#ff4444 0%,#ff8855 100%);border-radius:32rpx">
    <view style="padding:48rpx;color:#fff;font-size:40rpx;font-weight:700">新人专享礼</view>
  </view>
</lk-curtain>
```

## 点击跳转

```vue
<lk-curtain
  v-model="show"
  image-url="https://img.yzcdn.cn/vant/apple-1.jpg"
  link="/pages/index/index"
  link-type="navigateTo"
/>
```

当 `link` 是 http 地址时，H5 会直接跳转，App 会尝试外部打开，小程序端会复制链接。

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import CurtainDemo from '@/components/demos/curtain-demo.vue'
</script>

<template>
  <CurtainDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-curtain />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| zIndex | 层级 | `number` | `10090` |
| modelValue | 是否显示，支持 `v-model` | `boolean` | `false` |
| imageUrl | 幕帘图片地址 | `string` | `''` |
| imageMode | 图片裁剪模式 | `CurtainImageMode` | `widthFix` |
| width | 幕帘宽度 | `string \| number` | `'600rpx'` |
| height | 幕帘高度 | `string \| number` | `''` |
| closePosition | 关闭按钮位置 | `top-left \| top-right \| bottom-left \| bottom-right \| bottom` | `bottom` |
| closeOffset | 角位关闭按钮偏移。正值代表内侧（浮在图片上），负值代表外侧（完全脱离图片，且水平对齐边缘不超出）。支持 `rpx` 或 `px` 变量 | `string \| number` | `'24rpx'` |
| closeOffsetBottom | 底部关闭按钮偏移。自动转为负值偏移（偏离到图片底部下方） | `string \| number` | `'80rpx'` |
| closeOnOverlay | 点击遮罩是否关闭 | `boolean` | `false` |
| link | 点击内容后的跳转地址 | `string` | `''` |
| linkType | 跳转方式 | `navigateTo \| redirectTo \| reLaunch \| switchTab \| navigateBack` | `navigateTo` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 显示状态变化 | `(show: boolean)` |
| close | 点击关闭按钮时触发 | `()` |
| click | 点击幕帘内容时触发 | `()` |
| click-overlay | 点击遮罩层时触发 | `()` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 自定义幕帘内容；存在插槽时将不再渲染 `imageUrl` 图片 |

## 使用建议

::: tip
简单活动海报直接用 `imageUrl`；复杂营销内容、按钮组合、优惠券布局建议改用默认插槽。
:::

## 发布验收

`lk-curtain` 已纳入 needs-hardening showcase 回归，发布前按下面边界验收：

| 场景 | 验收方式 | 要点 |
|------|----------|------|
| 展示台基线 | 自动回归 | `tests/visual/needs-hardening-showcase.spec.ts` 校验组件路由、verified 状态与中风险标记 |
| 浮层关闭 | 人工验收 | 关闭按钮位置、遮罩点击和 `update:modelValue` 在目标端一致 |
| 外链跳转 | 人工验收 | H5 直接跳转、App 外部打开、小程序复制链接的端差说明可追溯 |
