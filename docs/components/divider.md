---
title: Divider 分割线
phone: divider
---

# Divider 分割线

用于内容区块之间的视觉分隔，支持水平、垂直方向及中间插入文字。

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
  <lk-divider text="文字分割" />
</template>
```

## 垂直分割线

```vue
<template>
  <view class="demo-row">
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
| dashed | 是否虚线 | `boolean` | `false` |
| vertical | 是否为垂直分割线 | `boolean` | `false` |
| text | 分割线文字内容 | `string` | `''` |
| hairline | 是否为细线 | `boolean` | `true` |
| textPosition | 文字位置 | `left / center / right / string / number` | `center` |
| customClass | 自定义类名 | `string / object / array` | — |
| customStyle | 自定义样式 | `string / object` | — |

### Events

当前版本未额外暴露自定义事件。

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 中间文字内容 |
