---
title: Badge 徽标
phone: badge
---

# Badge 徽标

在图标、按钮或内容上标注通知数字或状态点。

## 交互式调试

<PropsPlayground
  component="badge"
  :props-def="[
    { key: 'value', type: 'string', label: '徽标值', default: '' },
    { key: 'max', type: 'number', label: '最大值', default: 99 },
    { key: 'dot', type: 'boolean', label: '圆点模式', default: false },
    { key: 'hidden', type: 'boolean', label: '隐藏', default: false },
    { key: 'type', type: 'enum', label: '颜色类型', values: ['primary', 'success', 'warning', 'danger', 'info'], default: 'primary' },
  ]"
/>

## 基础用法

```vue
<template>
  <view class="demo-row">
    <lk-badge :value="3">
      <lk-button>消息</lk-button>
    </lk-badge>
    <lk-badge dot>
      <lk-icon name="bell" :size="28" />
    </lk-badge>
    <lk-badge value="新">
      <lk-button>功能</lk-button>
    </lk-badge>
  </view>
</template>
```

## 最大值

超过 `max` 时显示 `max+`。

```vue
<template>
  <view class="demo-row">
    <lk-badge :value="5" :max="99"><lk-icon name="chat" :size="28" /></lk-badge>
    <lk-badge :value="100" :max="99"><lk-icon name="chat" :size="28" /></lk-badge>
    <lk-badge :value="999" :max="99"><lk-icon name="chat" :size="28" /></lk-badge>
  </view>
</template>
```

## 颜色类型

```vue
<template>
  <view class="demo-row">
    <lk-badge :value="8" type="danger"><lk-icon name="bell" :size="28" /></lk-badge>
    <lk-badge :value="8" type="success"><lk-icon name="bell" :size="28" /></lk-badge>
    <lk-badge :value="8" type="warning"><lk-icon name="bell" :size="28" /></lk-badge>
    <lk-badge :value="8" type="info"><lk-icon name="bell" :size="28" /></lk-badge>
  </view>
</template>
```

## 独立使用

不包裹子内容时，作为纯徽标展示。

```vue
<template>
  <view class="demo-row" style="align-items:center">
    <lk-badge :value="12" />
    <lk-badge dot />
    <lk-badge value="HOT" type="danger" />
    <lk-badge value="NEW" type="success" />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| value | 显示内容 | `number \| string` | `''` |
| max | 数字上限，超出显示 `max+` | `number` | `99` |
| dot | 显示小红点 | `boolean` | `false` |
| hidden | 是否隐藏徽标 | `boolean` | `false` |
| type | 颜色类型 | `primary \| success \| warning \| danger \| info` | `primary` |
| offset | 徽标偏移量 `[x, y]` | `[number, number]` | `[0, 0]` |
| color | 文字颜色 | `string` | `''` |
| bgColor | 背景颜色 | `string` | `''` |
| id | 根节点 id | `string` | `''` |
| customClass | 徽标自定义类名 | `string \| object \| array` | — |
| customStyle | 徽标自定义样式 | `string \| object` | — |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击徽标时触发 | `({ value, displayValue, event })` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 被徽标包裹的内容 |
