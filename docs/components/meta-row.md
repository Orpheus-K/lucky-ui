---
title: MetaRow 结构行
phone: meta-row
---

# MetaRow 结构行

用于构建「左侧区块 + 中间上下信息 + 右侧区块」的通用行布局，适合账单、消息列表、联系人、订单条目等移动端高频场景。

## 基础用法

```vue
<lk-meta-row :gap="16" :main-gap="6">
  <template #start>
    <lk-avatar shape="rounded" size="72" icon="person-fill" />
  </template>
  <template #main-top>
    <text>主标题</text>
  </template>
  <template #main-bottom>
    <text>副标题</text>
  </template>
  <template #end>
    <text>-$12.88</text>
  </template>
</lk-meta-row>
```

## 固定左右宽度

```vue
<lk-meta-row :start-width="72" :end-width="140" :gap="16">
  <template #start>
    <lk-avatar shape="rounded" size="72" icon="music-note-beamed" />
  </template>
  <template #main-top>
    <text>Spotify</text>
  </template>
  <template #main-bottom>
    <text>Yesterday</text>
  </template>
  <template #end>
    <text>-$90.40</text>
  </template>
</lk-meta-row>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import MetaRowDemo from '@/components/demos/meta-row-demo.vue'
</script>

<template>
  <MetaRowDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-meta-row />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| align | 左中右三栏的垂直对齐方式 | `start \| center \| end` | `center` |
| gap | 左中右三栏水平间距 | `string \| number` | `16` |
| mainGap | 中间上下区域垂直间距 | `string \| number` | `2` |
| startWidth | 左侧区域固定宽度 | `string \| number` | `''` |
| endWidth | 右侧区域固定宽度 | `string \| number` | `''` |

### Events

当前版本未额外暴露自定义事件。

### Slots

| 插槽名 | 说明 |
|--------|------|
| start | 左侧区域（头像/图标/缩略图） |
| main-top | 中间上区域（标题） |
| main-bottom | 中间下区域（描述） |
| end | 右侧区域（金额/状态/时间） |

## 使用建议

::: tip
当中间标题或副标题较长时，建议在插槽内部文本上增加省略样式，避免挤压右侧信息区。
:::

::: warning
`startWidth` 与 `endWidth` 仅控制左右区域，不会自动限制插槽内部子元素宽度；超宽内容需要在插槽内自行约束。
:::
