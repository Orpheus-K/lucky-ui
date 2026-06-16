---
title: Divider 分割线
phone: divider
---

# Divider 分割线

内容区块之间的视觉分隔，支持水平、垂直方向及中间插入文字。

## 交互式调试

<PropsPlayground
  component="divider"
  :props-def="[
    { key: 'dashed', type: 'boolean', label: '虚线', default: false },
    { key: 'vertical', type: 'boolean', label: '垂直方向', default: false },
    { key: 'hairline', type: 'boolean', label: '极细线', default: true },
    { key: 'textPosition', type: 'enum', label: '文字位置', values: ['left', 'center', 'right'], default: 'center' },
  ]"
  slot-content="分割线"
/>

## 基础用法

```vue
<template>
  <view>
    <view>上方内容区块</view>
    <lk-divider />
    <view>下方内容区块</view>
  </view>
</template>
```

## 带文字

```vue
<template>
  <view>
    <lk-divider>居中文字</lk-divider>
    <lk-divider align="left">左对齐文字</lk-divider>
    <lk-divider align="right">右对齐文字</lk-divider>
  </view>
</template>
```

## 虚线与自定义颜色

```vue
<template>
  <view>
    <lk-divider dashed />
    <lk-divider :border-width="2" border-color="#7c3aed" />
    <lk-divider dashed border-color="#f59e0b">自定义颜色</lk-divider>
  </view>
</template>
```

## 垂直分割线

```vue
<template>
  <view style="display:flex; align-items:center; height:48rpx; padding:0 24rpx">
    <text>首页</text>
    <lk-divider direction="vertical" />
    <text>产品</text>
    <lk-divider direction="vertical" />
    <text>关于我们</text>
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| direction | 方向 | `horizontal \| vertical` | `horizontal` |
| dashed | 是否虚线 | `boolean` | `false` |
| align | 文字对齐 | `left \| center \| right` | `center` |
| borderWidth | 线条粗细（rpx） | `number` | `1` |
| borderColor | 线条颜色 | `string` | — |
| textColor | 文字颜色 | `string` | — |
| margin | 上下外边距（rpx） | `number` | `24` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 中间文字内容 |
