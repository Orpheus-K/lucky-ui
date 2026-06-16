---
title: Tag 标签
phone: tag
---

# Tag 标签

标注内容属性、元信息或操作状态的小型标签。

## 交互式调试

<PropsPlayground
  component="tag"
  :props-def="[
    { key: 'type', type: 'enum', label: '标签类型', values: ['solid', 'outline', 'light'], default: 'light' },
    { key: 'size', type: 'enum', label: '标签尺寸', values: ['sm', 'md', 'lg'], default: 'md' },
    { key: 'closable', type: 'boolean', label: '可关闭', default: false },
    { key: 'disabled', type: 'boolean', label: '禁用', default: false },
    { key: 'round', type: 'boolean', label: '圆角', default: true },
  ]"
  slot-content="标签"
/>

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

## 样式变体

```vue
<template>
  <!-- 实心 -->
  <view class="demo-row">
    <lk-tag type="solid">实心</lk-tag>
  </view>

  <!-- 描边 -->
  <view class="demo-row">
    <lk-tag type="outline">描边</lk-tag>
  </view>

  <!-- 浅色背景 -->
  <view class="demo-row">
    <lk-tag type="light">浅色</lk-tag>
  </view>
</template>
```

## 尺寸

```vue
<template>
  <view class="demo-row" style="align-items:center">
    <lk-tag size="sm">小标签</lk-tag>
    <lk-tag size="md">中标签</lk-tag>
    <lk-tag size="lg">大标签</lk-tag>
  </view>
</template>
```

## 可关闭

```vue
<script setup lang="ts">
import { ref } from 'vue'
const tags = ref(['Vue 3', 'TypeScript', 'Uni-app', 'Lucky UI'])
function remove(t: string) {
  tags.value = tags.value.filter(x => x !== t)
}
</script>

<template>
  <view class="demo-row">
    <lk-tag
      v-for="t in tags" :key="t"
      closable @close="remove(t)"
    >{{ t }}</lk-tag>
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 样式变体 | `solid \| outline \| light` | `light` |
| size | 尺寸 | `sm \| md \| lg` | `md` |
| closable | 是否可关闭 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| round | 是否胶囊圆角 | `boolean` | `true` |
| textColor | 自定义文字颜色 | `string` | `''` |
| bgColor | 自定义背景色 | `string` | `''` |
| id | 根节点 id | `string` | `''` |
| customClass | 根节点自定义类名 | `string \| object \| array` | — |
| customStyle | 根节点自定义样式 | `string \| object` | — |

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
