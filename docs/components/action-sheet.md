---
title: Action Sheet 动作面板
phone: action-sheet
---

# Action Sheet 动作面板

从底部弹出的轻量级操作面板，适合“选择操作”“危险操作确认前二次选择”“分享菜单”等移动端场景。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const actions = [
  { name: '编辑' },
  { name: '删除', color: '#f56c6c' },
]
</script>

<template>
  <lk-button @click="visible = true">显示动作面板</lk-button>

  <lk-action-sheet
    v-model="visible"
    :actions="actions"
  />
</template>
```

`select` 会返回 `{ action, index, event }`，适合在异步完成后再手动关闭。

## 带标题与描述

```vue
<lk-action-sheet
  v-model="visible"
  title="请选择操作"
  description="该操作将立即生效，请谨慎确认"
  :actions="actions"
/>
```

## 禁用项与加载态

```vue
<script setup lang="ts">
const actions = [
  { name: '普通操作' },
  { name: '处理中', loading: true },
  { name: '暂不可用', disabled: true },
]
</script>

<template>
  <lk-action-sheet v-model="visible" :actions="actions" />
</template>
```

## 点击选项后不自动关闭

适合需要先执行异步逻辑，再手动关闭面板的场景。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const actions = [{ name: '提交审核' }]

function handleSelect() {
  // 先执行业务逻辑
  setTimeout(() => {
    visible.value = false
  }, 300)
}
</script>

<template>
  <lk-action-sheet
    v-model="visible"
    :actions="actions"
    :close-on-click-action="false"
    @select="handleSelect"
  />
</template>
```

## 动画配置

```vue
<lk-action-sheet
  v-model="visible"
  :actions="actions"
  animation="quick"
/>

<lk-action-sheet
  v-model="visible"
  :actions="actions"
  animation-type="fade-up"
  :duration="320"
  easing="ease-out"
/>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import ActionSheetDemo from '@/components/demos/action-sheet-demo.vue'
</script>

<template>
  <ActionSheetDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-action-sheet />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 是否显示，支持 `v-model` | `boolean` | `false` |
| zIndex | 弹层层级 | `number` | `1000` |
| title | 标题 | `string` | `''` |
| description | 描述文案 | `string` | `''` |
| actions | 操作项列表 | `Action[]` | `[]` |
| cancelText | 取消按钮文字；传空字符串可隐藏取消按钮 | `string` | `'取消'` |
| closeOnClickAction | 点击选项后是否自动关闭 | `boolean` | `true` |
| safeArea | 是否适配底部安全区 | `boolean` | `true` |
| animation | 动画预设名称 | `keyof ANIMATION_PRESETS` | `undefined` |
| animationType | 自定义动画类型 | `TransitionConfig['name']` | `undefined` |
| duration | 动画时长 | `number` | `undefined` |
| delay | 动画延迟 | `number` | `undefined` |
| easing | 动画缓动函数 | `TransitionConfig['easing']` | `undefined` |

### Action

| 字段 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| name | 主文案 | `string` | — |
| sub | 次级说明 | `string` | `undefined` |
| disabled | 是否禁用 | `boolean` | `undefined` |
| color | 文字颜色 | `string` | `undefined` |
| loading | 是否显示加载态 | `boolean` | `undefined` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 显示状态变化 | `(value: boolean)` |
| select | 点击可用操作项并完成选择 | `({ action, index, event })` |
| click-action | 点击可用操作项时触发，早于 `select` | `({ action, index, event })` |
| cancel | 点击取消按钮并关闭面板 | `(event?: Event)` |
| click-cancel | 点击取消按钮时触发，早于 `cancel` | `(event?: Event)` |
| click-overlay | 点击遮罩层时触发 | `(event?: Event)` |
| open | 面板打开时触发 | `()` |
| close | 面板关闭时触发 | `()` |
| after-enter | 进入动画结束后触发 | `()` |
| after-leave | 离开动画结束后触发 | `()` |

### Slots

当前版本未提供具名插槽，内容由 `actions` 数据驱动。

## 使用建议

::: tip
如果你的场景是标准确认框，请优先使用 `lk-modal`；如果需要自定义复杂内容区域，请优先使用 `lk-popup`。
:::
