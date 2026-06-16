---
title: Skeleton 骨架屏
phone: skeleton
---

# Skeleton 骨架屏

用于在真实内容尚未返回时提供结构化占位，减少页面跳动并提升感知性能。

## 交互式调试

<PropsPlayground
  component="skeleton"
  :props-def="[
    { key: 'loading', type: 'boolean', label: '显示骨架', default: true },
    { key: 'avatar', type: 'boolean', label: '头像', default: false },
    { key: 'title', type: 'boolean', label: '标题', default: false },
    { key: 'rows', type: 'number', label: '行数', default: 3 },
    { key: 'animated', type: 'boolean', label: '动画', default: true },
    { key: 'round', type: 'boolean', label: '圆角', default: false },
  ]"
/>

## 基础用法

```vue
<lk-skeleton :rows="3" />
```

## 带头像与标题

适合用户信息、评论、列表卡片等信息块。

```vue
<lk-skeleton avatar title :rows="3" />
```

## 自定义行宽与高度

`rowWidth` 和 `rowHeight` 都支持单值或数组，数组模式下会按每一行依次取值，不足时复用最后一项。

```vue
<lk-skeleton
  :rows="4"
  :row-width="['90%', '80%', '70%', '60%']"
  :row-height="['32rpx', '32rpx', '24rpx', '24rpx']"
  round
/>
```

## 作为内容占位容器

当 `loading` 为 `false` 时，组件会渲染默认插槽内容。这是最推荐的业务接入方式。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(true)
</script>

<template>
  <lk-skeleton :loading="loading" avatar title :rows="4" animated>
    <view class="user-card">
      <text>真实内容</text>
    </view>
  </lk-skeleton>
</template>
```

## 动画与节奏

通过 `animated`、`duration` 和 `easing` 控制骨架屏的呼吸节奏。

```vue
<lk-skeleton animated :duration="1.6" easing="linear" :rows="3" />
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import SkeletonDemo from '@/components/demos/skeleton-demo.vue'
</script>

<template>
  <SkeletonDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-skeleton />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customClass | 组件可视根节点自定义类名 | `string \| object \| array` | `''` |
| customStyle | 组件可视根节点自定义样式 | `string \| object` | `''` |
| loading | 是否显示骨架；为 `false` 时渲染默认插槽 | `boolean` | `true` |
| avatar | 是否显示头像占位 | `boolean` | `false` |
| avatarSize | 头像尺寸 | `string` | `'72rpx'` |
| title | 是否显示标题占位 | `boolean` | `false` |
| titleWidth | 标题宽度 | `string` | `'40%'` |
| titleHeight | 标题高度 | `string` | `'32rpx'` |
| rows | 内容占位行数 | `number` | `3` |
| rowWidth | 每行宽度；可传单值或数组 | `string \| string[]` | `'100%'` |
| rowHeight | 每行高度；可传单值或数组 | `string \| string[]` | `'32rpx'` |
| animated | 是否开启动画 | `boolean` | `true` |
| round | 是否使用圆角风格 | `boolean` | `false` |
| duration | 动画时长（秒或时间字符串） | `number \| string` | `2.4` |
| easing | 动画缓动函数 | `string` | `'ease-in-out'` |

### Events

当前版本未额外暴露自定义事件。

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 当 `loading` 为 `false` 时显示的真实内容 |

## 使用建议

::: tip
将骨架块的宽高比例尽量设计得接近真实内容，可以显著减少加载完成时的布局跳动。
:::

::: warning
如果你只是想表达“正在处理中”，优先使用 `lk-loading`；如果要模拟页面结构，优先使用 `lk-skeleton`。
:::
