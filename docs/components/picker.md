---
title: Picker 选择器
phone: picker
---

# Picker 选择器

用于从单列、多列或级联数据中选择值。弹层模式适合确认式选择，内联模式适合即时生效的常驻选择器。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);
const value = ref('apple');
const columns = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
];

function onConfirm(nextValue: string | number | (string | number)[]) {
  console.log('confirmed', nextValue);
}
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
const value = ref(['2026', '04']);
const columns = [
  [
    { label: '2025', value: '2025' },
    { label: '2026', value: '2026' },
  ],
  [
    { label: '03 月', value: '03' },
    { label: '04 月', value: '04' },
  ],
];
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
<template>
  <text>当前值：{{ value }}</text>
  <lk-picker inline v-model="value" :columns="columns" @change="onChange" />
</template>
```

内联模式没有确认按钮。用户选择新项后会在同一次事件中依次触发 `pick`、`update:modelValue`、`change`，因此 `v-model` 会立即更新。选择仍停留在当前索引时不会重复触发这些事件。

弹层模式中的滚动选择只更新内部草稿并触发 `pick`；点击确认后才依次触发 `update:modelValue`、`change`、`confirm`。点击取消会恢复已提交值，不触发 `update:modelValue` 或 `change`。

## API

### Props

| 参数         | 说明                                 | 类型                                | 可选值                     | 默认值      |
| ------------ | ------------------------------------ | ----------------------------------- | -------------------------- | ----------- |
| modelValue   | 当前选中值                           | `string / number / array`           | —                          | `undefined` |
| visible      | 是否显示弹层，支持 `v-model:visible` | `boolean`                           | —                          | `false`     |
| mode         | 选择模式                             | `string`                            | `single / multi / cascade` | `single`    |
| columns      | 选项列数据                           | `PickerOption[] / PickerOption[][]` | —                          | `[]`        |
| inline       | 是否内联显示，不使用弹层             | `boolean`                           | —                          | `false`     |
| title        | 标题                                 | `string`                            | —                          | `''`        |
| confirmText  | 确认按钮文字                         | `string`                            | —                          | `确定`      |
| cancelText   | 取消按钮文字                         | `string`                            | —                          | `取消`      |
| round        | 弹层是否圆角                         | `boolean`                           | —                          | `true`      |
| visibleCount | 可见选项数量                         | `number`                            | —                          | `5`         |
| itemHeight   | 选项高度，单位 rpx                   | `number`                            | —                          | `100`       |
| id           | 根节点 id                            | `string`                            | —                          | `''`        |
| customClass  | 自定义类名                           | `string / object / array`           | —                          | `''`        |
| customStyle  | 自定义样式                           | `string / object`                   | —                          | `''`        |

### Events

| 事件名            | 说明                                                         | 回调参数                                                           |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------------ |
| update:modelValue | 内联模式选择变化时立即触发；弹层模式点击确认时触发           | `(value: PickerValue)`                                             |
| update:visible    | 弹层显示状态变化时触发                                       | `(visible: boolean)`                                               |
| pick              | 选择索引变化时触发；内联模式随后立即提交，弹层模式仅更新草稿 | `(value: PickerValue, indexes: number[], options: PickerOption[])` |
| change            | 内联模式选择变化时立即触发；弹层模式点击确认时触发           | `(value: PickerValue)`                                             |
| confirm           | 弹层模式点击确认并提交后触发                                 | `(value: PickerValue, indexes: number[], options: PickerOption[])` |
| cancel            | 弹层模式点击取消并恢复已提交值时触发                         | `(value: PickerValue, indexes: number[], options: PickerOption[])` |
| open              | 弹层打开时触发                                               | `()`                                                               |
| close             | 弹层关闭时触发                                               | `()`                                                               |

### PickerOption

| 字段     | 说明                   | 类型              |
| -------- | ---------------------- | ----------------- |
| label    | 展示文本               | `string`          |
| value    | 选项值                 | `string / number` |
| children | 子级选项，级联模式使用 | `PickerOption[]`  |

## 注意事项

::: tip
`pick` 表示真实选择索引已经变化。内联模式会紧接着提交 `v-model` 并触发 `change`；弹层模式则保留草稿，只有点击确认才提交。取消弹层不会提交草稿。
:::

## 发布验收

发布前必须在全新干净构建上分别抓取 H5 与微信小程序运行态；两端执行相同用例：

| 场景         | Peekit 操作                                                                                           | 客观通过条件                                                                                                                                         |
| ------------ | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 内联即时提交 | 在 `#picker-inline-demo` 的组件 scope 内查询 `.lk-picker__item`，轻点“蓝色”                           | `#picker-inline-value` 严格变为 `value=blue；label=蓝色；events=pick:blue > update:blue > change:blue`，三个事件各一次                               |
| 相同项去重   | 页面刷新后轻点当前选中的“绿色”                                                                        | `#picker-inline-value` 仍为 `value=green；label=绿色；events=none`                                                                                   |
| 弹层草稿     | 轻点 `#picker-popup-open`，在 `#picker-popup-demo` scope 选“蓝色”，确认前后查询 `#picker-popup-state` | 确认前 `value=green` 且事件为 `open > pick:blue`；确认后严格为 `open > pick:blue > update:blue > change:blue > confirm:blue > visible:false > close` |
| 弹层取消     | 重新打开弹层，选未提交项，再点取消并查询 `#picker-popup-state`                                        | value 保持打开前值；尾部为 `cancel:<已提交值> > visible:false > close`；整条记录没有 `update` 或 `change`                                            |
| 级联父项变化 | 在级联数据切换父列                                                                                    | 子列索引归零，value、indexes、options 与新分支同一路径；H5 与微信结果完全一致                                                                        |
| 几何与错误   | 查询每列、选中指示器及可视区 rect，并读取 console/runtime errors                                      | 每列和指示器 rect 非零且位于可视区；无重复目标、无越界、无 console/runtime error                                                                     |

H5 可从页面查询组件内部节点；微信端必须先进入 `lk-picker` 组件 scope 再查询 `.lk-picker__item`。构建成功、showcase 的 `verified` 字段、静态 WXML 或只点击外层容器均不能替代上述运行证据。

::: warning
H5 与微信的滚动手感可以存在平台差异，但提交值、完整 payload、事件顺序和事件次数必须一致。
:::
