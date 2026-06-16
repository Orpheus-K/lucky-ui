---
title: Badge 徽标
phone: badge
---

# Badge 徽标

用于在按钮、图标或内容右上角展示数字、红点或短文本状态。

## 基础用法

```vue
<template>
  <lk-badge :value="5">
    <lk-button>消息</lk-button>
  </lk-badge>

  <lk-badge dot>
    <lk-icon name="bell" size="44" />
  </lk-badge>

  <lk-badge value="NEW" type="success">
    <lk-button>新功能</lk-button>
  </lk-badge>
</template>
```

## 独立徽标

```vue
<template>
  <lk-badge :value="12" />
  <lk-badge dot />
  <lk-badge value="HOT" type="danger" />
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| value | 展示内容 | `number / string` | `''` |
| max | 数字上限，超出显示 `max+` | `number` | `99` |
| dot | 是否显示红点 | `boolean` | `false` |
| hidden | 是否隐藏 | `boolean` | `false` |
| type | 颜色类型 | `primary / success / warning / danger / info` | `primary` |
| offset | 偏移量 `[x, y]` | `[number, number]` | `[0, 0]` |
| color | 文字颜色 | `string` | `''` |
| bgColor | 背景色 | `string` | `''` |
| customClass | 自定义类名 | `string / object / array` | — |
| customStyle | 自定义样式 | `string / object` | — |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击徽标时触发 | `({ value, displayValue, event })` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 被徽标包裹的内容 |
