---
title: Grid 栅格
phone: grid
---

# Grid 栅格

用于将入口、菜单或快捷操作按照规则网格排布，支持静态宫格和分页轮播宫格两种模式。

## 何时使用

- 首页快捷入口区
- 分类导航区
- 需要图标 + 文本统一排列的操作面板
- 需要分页展示大量入口时

## 基础用法

```vue
<script setup lang="ts">
const items = [
  { icon: 'house', text: '首页' },
  { icon: 'bag', text: '订单' },
  { icon: 'person', text: '我的' },
  { icon: 'gear', text: '设置', disabled: true },
]
</script>

<template>
  <lk-grid :columns="4" :items="items" @click="handleGridClick" />
</template>
```

## 自定义间距

```vue
<lk-grid :columns="4" :gap="16" :item-gap="12" :items="items" />
```

## 轮播分页宫格

当入口较多时，可开启 `carousel`，并结合 `columns` 与 `rows` 自动分页。

```vue
<lk-grid :columns="4" :rows="2" :carousel="true" :items="items" />
```

## 自定义内容

如果不传 `items`，可以直接使用默认插槽自定义每一个栅格项。

```vue
<template>
  <lk-grid :columns="3">
    <view class="custom-item">自定义 1</view>
    <view class="custom-item">自定义 2</view>
    <view class="custom-item">自定义 3</view>
  </lk-grid>
</template>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import GridDemo from '@/components/demos/grid-demo.vue'
</script>

<template>
  <GridDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-grid />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| columns | 列数；不传时自动填充 | `number` | `undefined` |
| gap | 栅格整体间距 | `number` | `undefined` |
| itemGap | 单个栅格项内部图标与文本的间距 | `number` | `undefined` |
| carousel | 是否启用轮播分页模式 | `boolean` | `false` |
| rows | 轮播模式下每页行数 | `number` | `undefined` |
| items | 宫格数据源 | `GridItem[]` | `[]` |
| id | 根节点 id | `string` | `''` |
| customClass | 根节点自定义类名 | `string \| object \| array` | — |
| customStyle | 根节点自定义样式 | `string \| object` | — |

### GridItem 结构

| 字段 | 说明 | 类型 |
|------|------|------|
| text | 文本内容 | `string` |
| icon | 图标名称 | `string` |
| disabled | 是否禁用点击 | `boolean` |
| ...rest | 其他业务字段，便于外部自行扩展 | `unknown` |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| click | 点击可用宫格项时触发 | `({ item, index, pageIndex, event }) => void` |
| click-disabled | 点击禁用宫格项时触发 | `({ item, index, pageIndex, event }) => void` |
| page-change | 轮播分页变化时触发 | `(index, oldIndex) => void` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 不传 `items` 时自定义栅格内容 |

## 使用建议

::: tip
如果你的入口数量固定且主要用于导航，优先使用 `items` 数据驱动；如果每格结构复杂，优先使用默认插槽自定义。
:::
