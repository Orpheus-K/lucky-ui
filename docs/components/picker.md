---
title: Picker 选择器
phone: picker
---

# Picker 选择器

用于从单列、多列或级联数据中选择值，适合城市、分类、规格等确认式选择场景。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const value = ref('apple')
const columns = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
]
</script>

<template>
  <lk-button @click="visible = true">选择水果</lk-button>
  <lk-picker
    v-model="value"
    v-model:visible="visible"
    title="选择水果"
    :columns="columns"
    @confirm="onConfirm"
  />
</template>
```

## 多列选择

```vue
<script setup lang="ts">
const value = ref(['2026', '04'])
const columns = [
  [
    { label: '2025', value: '2025' },
    { label: '2026', value: '2026' },
  ],
  [
    { label: '03 月', value: '03' },
    { label: '04 月', value: '04' },
  ],
]
</script>

<template>
  <lk-picker v-model="value" mode="multi" :columns="columns" />
</template>
```

## 级联选择

```vue
<template>
  <lk-picker
    v-model="area"
    v-model:visible="visible"
    mode="cascade"
    :columns="areaColumns"
    @pick="(value, indexes, options) => console.log(value, indexes, options)"
  />
</template>
```

## 内联模式

```vue
<lk-picker inline v-model="value" :columns="columns" />
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| modelValue | 当前选中值 | `string / number / array` | — | `undefined` |
| visible | 是否显示弹层，支持 `v-model:visible` | `boolean` | — | `false` |
| mode | 选择模式 | `string` | `single / multi / cascade` | `single` |
| columns | 选项列数据 | `PickerOption[] / PickerOption[][]` | — | `[]` |
| inline | 是否内联显示，不使用弹层 | `boolean` | — | `false` |
| title | 标题 | `string` | — | `''` |
| confirmText | 确认按钮文字 | `string` | — | `确定` |
| cancelText | 取消按钮文字 | `string` | — | `取消` |
| round | 弹层是否圆角 | `boolean` | — | `true` |
| visibleCount | 可见选项数量 | `number` | — | `5` |
| itemHeight | 选项高度，单位 rpx | `number` | — | `100` |
| id | 根节点 id | `string` | — | `''` |
| customClass | 自定义类名 | `string / object / array` | — | `''` |
| customStyle | 自定义样式 | `string / object` | — | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 确认选择后触发 | `(value: PickerValue)` |
| update:visible | 弹层显示状态变化时触发 | `(visible: boolean)` |
| pick | 滚动选择项时触发，不提交 `modelValue` | `(value: PickerValue, indexes: number[], options: PickerOption[])` |
| change | 确认选择后触发 | `(value: PickerValue)` |
| confirm | 点击确认时触发 | `(value: PickerValue, indexes: number[], options: PickerOption[])` |
| cancel | 点击取消时触发 | `(value: PickerValue, indexes: number[], options: PickerOption[])` |
| open | 弹层打开时触发 | `()` |
| close | 弹层关闭时触发 | `()` |

### PickerOption

| 字段 | 说明 | 类型 |
|------|------|------|
| label | 展示文本 | `string` |
| value | 选项值 | `string / number` |
| children | 子级选项，级联模式使用 | `PickerOption[]` |

## 注意事项

::: tip
`pick` 只表示当前滚动草稿值，只有点击确认后才会触发 `update:modelValue`、`change` 和 `confirm`。
:::

## 发布验收

`lk-picker` 已纳入 high-risk showcase 回归，发布前按下面边界验收：

| 场景 | 验收方式 | 要点 |
|------|----------|------|
| 展示台基线 | 自动回归 | `tests/visual/high-risk-showcase.spec.ts` 校验组件路由、verified 状态与高风险标记 |
| H5 / App | 人工验收 | 单列、多列、级联滚动后确认值一致；弹层打开关闭无滚动穿透 |
| 小程序 | 人工验收 | 选择器滚动惯性、确认/取消事件顺序与 H5 保持一致 |

::: warning
不同端的滚轮手感和选择器 UI 会有平台差异，公开示例只承诺事件和值同步语义一致，不承诺原生滚动视觉完全一致。
:::
