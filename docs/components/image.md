---
title: Image 图片
phone: image
---

# Image 图片

用于展示网络图片，内置加载中占位、失败占位和点击预览能力，适合列表封面、头像区块、卡片头图等场景。

## 交互式调试

<PropsPlayground
  component="image"
  :props-def="[
    { key: 'src', type: 'string', label: '图片地址', default: 'https://picsum.photos/200' },
    { key: 'width', type: 'string', label: '宽度', default: '200rpx' },
    { key: 'height', type: 'string', label: '高度', default: '200rpx' },
    { key: 'fit', type: 'enum', label: '适应模式', values: ['cover', 'contain', 'fill', 'none', 'scale-down'], default: 'cover' },
    { key: 'lazy', type: 'boolean', label: '懒加载', default: false },
    { key: 'preview', type: 'boolean', label: '预览', default: false },
    { key: 'showLoading', type: 'boolean', label: '加载占位', default: true },
    { key: 'showError', type: 'boolean', label: '错误占位', default: true },
  ]"
/>

## 基础用法

```vue
<lk-image src="https://example.com/demo.jpg" width="200rpx" height="200rpx" />
```

## 尺寸与圆角

```vue
<template>
  <lk-image src="https://picsum.photos/200/200" width="160rpx" height="160rpx" />
  <lk-image src="https://picsum.photos/200/200" width="160rpx" height="160rpx" radius="24rpx" />
  <lk-image src="https://picsum.photos/200/200" width="160rpx" height="160rpx" radius="50%" />
</template>
```

## 填充模式

`fit` 直接映射到底层图片的展示模式。

```vue
<template>
  <lk-image src="https://picsum.photos/400/300" width="200rpx" height="160rpx" fit="cover" />
  <lk-image src="https://picsum.photos/400/300" width="200rpx" height="160rpx" fit="contain" />
  <lk-image src="https://picsum.photos/400/300" width="200rpx" height="160rpx" fit="fill" />
</template>
```

## 加载与错误占位

默认情况下会展示加载中和加载失败状态，可按需关闭。

```vue
<template>
  <lk-image src="https://invalid.example.com/demo.jpg" show-loading show-error />
</template>
```

## 点击预览

开启 `preview` 后，点击图片会调起系统图片预览。

```vue
<lk-image
  src="https://picsum.photos/800/600"
  width="240rpx"
  height="180rpx"
  radius="var(--lk-radius-md)"
  preview
/>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import ImageDemo from '@/components/demos/image-demo.vue'
</script>

<template>
  <ImageDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-image />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| src | 图片地址 | `string` | `''` |
| width | 容器宽度 | `string` | `'100%'` |
| height | 容器高度 | `string` | `'auto'` |
| radius | 圆角 | `string` | `'var(--lk-radius-md)'` |
| fit | 填充模式 | `cover \| contain \| fill \| none \| scale-down` | `cover` |
| lazy | 是否懒加载 | `boolean` | `false` |
| showLoading | 是否显示加载中占位 | `boolean` | `true` |
| showError | 是否显示失败占位 | `boolean` | `true` |
| preview | 是否开启点击预览 | `boolean` | `true` |
| id | 根节点 id | `string` | `''` |
| customClass | 根节点自定义类名 | `string \| object \| array` | — |
| customStyle | 根节点自定义样式 | `string \| object` | — |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| load | 图片加载成功 | `(event: unknown) => void` |
| error | 图片加载失败 | `(event: unknown) => void` |
| click | 点击图片容器 | `({ src, event }) => void` |
| preview | 调起图片预览前触发 | `({ src, urls, event }) => void` |
| preview-success | 图片预览成功调起后触发 | `({ src, result }) => void` |
| preview-fail | 图片预览调起失败时触发 | `({ src, error }) => void` |

### Slots

无

## 使用建议

::: tip
在列表场景中建议总是显式传入 `width` 和 `height`，这样加载前后布局更稳定。
:::

::: warning
开启 `preview` 后，点击事件仍会先触发 `click`，如果业务中要阻止预览，需要在组件外自行控制是否传入 `preview`。
:::
