---
title: Tag 标签
phone: tag
---

# Tag 标签

用于标注内容属性、元信息或操作状态，支持实心、描边、浅色和可关闭状态。

## 基础用法

```vue
<template>
  <view class="demo-row">
    <lk-tag>默认</lk-tag>
    <lk-tag bg-color="var(--lk-color-success)" text-color="#fff">成功</lk-tag>
    <lk-tag bg-color="var(--lk-color-warning)" text-color="#fff">警告</lk-tag>
    <lk-tag bg-color="var(--lk-color-danger)" text-color="#fff">危险</lk-tag>
  </view>
</template>
```

## 样式与尺寸

```vue
<template>
  <view class="demo-row">
    <lk-tag type="solid">实心</lk-tag>
    <lk-tag type="outline">描边</lk-tag>
    <lk-tag type="light">浅色</lk-tag>
    <lk-tag size="sm">小标签</lk-tag>
    <lk-tag size="lg">大标签</lk-tag>
  </view>
</template>
```

## 可关闭

```vue
<template>
  <lk-tag closable @close="handleClose">Vue 3</lk-tag>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 样式变体 | `solid / outline / light` | `light` |
| size | 尺寸 | `sm / md / lg` | `md` |
| closable | 是否可关闭 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| round | 是否胶囊圆角 | `boolean` | `true` |
| textColor | 自定义文字颜色 | `string` | `''` |
| bgColor | 自定义背景色 | `string` | `''` |
| customClass | 自定义类名 | `string / object / array` | — |
| customStyle | 自定义样式 | `string / object` | — |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击可用标签 | `(event)` |
| close | 点击可用关闭按钮 | `(event)` |
| click-disabled | 点击禁用标签 | `(event)` |
| close-disabled | 点击禁用标签的关闭按钮 | `(event)` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 标签内容 |
