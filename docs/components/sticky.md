---
title: Sticky 粘性布局
phone: sticky
---

# Sticky 粘性布局

用于让筛选栏、分组标题或操作区在滚动时吸附到顶部。

## 基础用法

```vue
<template>
  <lk-sticky :offset-top="88">
    <view class="filter-bar">筛选条件</view>
  </lk-sticky>
</template>
```

## 分组标题

适合消息列表、订单列表等分段信息流。

```vue
<template>
  <template v-for="group in ['今天', '昨天', '更早']" :key="group">
    <lk-sticky>
      <view class="section-title">{{ group }}</view>
    </lk-sticky>
    <view v-for="i in 5" :key="`${group}-${i}`">消息 {{ i }}</view>
  </template>
</template>
```

## 导航栏偏移

存在自定义导航栏时，通过 `offsetTop` 避开顶部区域。

```vue
<lk-sticky :offset-top="96">
  <view class="filter-tabs">全部 / 待处理 / 已完成</view>
</lk-sticky>
```

## 容器内吸附

```vue
<template>
  <view id="list-container" class="list-container">
    <lk-sticky container="#list-container">
      <view class="section-title">今日订单</view>
    </lk-sticky>
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| offsetTop | 距离顶部偏移 | `number` | `0` |
| container | 限制吸附范围的容器选择器或对象 | `string / object` | `''` |
| customClass | 自定义类名 | `string / object / array` | — |
| customStyle | 自定义样式 | `string / object` | — |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 吸顶状态变化时触发 | `(value: boolean)` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 需要吸附的内容 |

## 兼容说明

`lk-sticky` 会读取节点尺寸与滚动位置。页面存在自定义导航栏、安全区或嵌套滚动容器时，需要显式设置 `offsetTop`，并在目标端校验吸附边界。
