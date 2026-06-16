---
title: PullRefresh 下拉刷新
phone: pull-refresh
---

# PullRefresh 下拉刷新

用于局部滚动容器刷新，也可配合 `usePagePullRefresh` 承接页面级原生刷新。

## 基础用法

```vue
<template>
  <lk-pull-refresh v-model="refreshing" height="620rpx" @refresh="onRefresh">
    <view v-for="item in list" :key="item.id">{{ item.title }}</view>
  </lk-pull-refresh>
</template>

<script setup>
import { ref } from 'vue';

const refreshing = ref(false);
const list = ref([]);

function onRefresh() {
  refreshing.value = true;
  setTimeout(() => {
    refreshing.value = false;
  }, 900);
}
</script>
```

## 自定义提示

```vue
<lk-pull-refresh v-model="refreshing" @refresh="onRefresh">
  <template #text="{ status }">
    <text>{{ status === 'loosing' ? '松开刷新' : '下拉刷新' }}</text>
  </template>
</lk-pull-refresh>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| v-model | 是否刷新中 | `boolean` | `false` |
| disabled | 是否禁用下拉刷新 | `boolean` | `false` |
| height | 容器高度 | `string / number` | `100%` |
| threshold | 触发刷新阈值，单位 px | `number` | `80` |
| background | 刷新区域背景 | `string` | `transparent` |
| defaultStyle | 原生刷新样式 | `none / black / white` | `none` |
| showSuccess | 是否显示刷新成功态 | `boolean` | `true` |
| loadingType | 加载动画类型 | `string` | `spinner` |
| loadingSize | 加载图标尺寸 | `string / number` | `34` |
| loadingColor | 加载图标颜色 | `string` | `var(--lk-color-primary)` |
| successDuration | 成功态展示时长，单位 ms | `number` | `500` |
| pullingText | 下拉过程文案 | `string` | `''` |
| loosingText | 释放刷新文案 | `string` | `''` |
| loadingText | 刷新中文案 | `string` | `''` |
| successText | 刷新成功文案 | `string` | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 刷新状态变化 | `(value: boolean)` |
| refresh | 触发刷新 | - |
| scroll | 滚动时触发 | `(event)` |
| restore | 复位时触发 | `(event)` |
| abort | 中止刷新时触发 | `(event)` |
| scrolltolower | 滚动到底部时触发 | `(event)` |

### Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|------------|
| default | 滚动内容 | - |
| indicator | 自定义刷新指示区 | `{ status, distance }` |
| text | 自定义状态文案 | `{ status, distance }` |

## Demo

项目演示位于 `src/components/demos/pull-refresh-demo.vue`。
