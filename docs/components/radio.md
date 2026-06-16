---
title: Radio 单选框
phone: radio
---

# Radio 单选框

在一组选项中进行单项选择，通常配合 `RadioGroup` 使用。

## 交互式调试

<PropsPlayground
  component="radio"
  :props-def="[
    { key: 'disabled', type: 'boolean', label: '禁用', default: false },
  ]"
  slot-content="单选框"
/>

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
const checked = ref('A')
</script>

<template>
  <lk-radio-group v-model="checked">
    <lk-radio name="A">选项 A</lk-radio>
    <lk-radio name="B">选项 B</lk-radio>
    <lk-radio name="C">选项 C</lk-radio>
  </lk-radio-group>
  <view>当前选中：{{ checked }}</view>
</template>
```

## 单独使用

单独使用时，通过 `modelValue` 判断当前项是否选中。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const answer = ref('yes')
</script>

<template>
  <lk-radio v-model="answer" name="yes">同意</lk-radio>
</template>
```

## 横向排列

```vue
<script setup lang="ts">
import { ref } from 'vue'
const plan = ref('lite')
</script>

<template>
  <lk-radio-group v-model="plan" direction="row">
    <lk-radio name="lite">基础版</lk-radio>
    <lk-radio name="pro">专业版</lk-radio>
    <lk-radio name="enterprise">企业版</lk-radio>
  </lk-radio-group>
</template>
```

## 图标类型

```vue
<template>
  <!-- dot（默认）：选中显示中心圆点 -->
  <lk-radio-group v-model="val" icon-type="dot">
    <lk-radio name="1">选项 1</lk-radio>
    <lk-radio name="2">选项 2</lk-radio>
  </lk-radio-group>

  <!-- check：选中显示勾选图标 -->
  <lk-radio-group v-model="val" icon-type="check">
    <lk-radio name="1">选项 1</lk-radio>
    <lk-radio name="2">选项 2</lk-radio>
  </lk-radio-group>
</template>
```

## 方形外观

```vue
<template>
  <lk-radio-group v-model="val" shape="square">
    <lk-radio name="yes">同意</lk-radio>
    <lk-radio name="no">不同意</lk-radio>
  </lk-radio-group>
</template>
```

## 禁用状态

```vue
<template>
  <!-- 整组禁用 -->
  <lk-radio-group v-model="val" disabled>
    <lk-radio name="A">选项 A（禁用）</lk-radio>
    <lk-radio name="B">选项 B（禁用）</lk-radio>
  </lk-radio-group>

  <!-- 单项禁用 -->
  <lk-radio-group v-model="val2">
    <lk-radio name="X">可选</lk-radio>
    <lk-radio name="Y" disabled>不可选</lk-radio>
    <lk-radio name="Z">可选</lk-radio>
  </lk-radio-group>
</template>
```

## 自定义选中颜色

```vue
<template>
  <lk-radio-group v-model="val" active-color="#f59e0b">
    <lk-radio name="gold">黄金选项</lk-radio>
    <lk-radio name="silver">白银选项</lk-radio>
  </lk-radio-group>
</template>
```

## 与表单结合

```vue
<script setup lang="ts">
import { ref } from 'vue'
const gender = ref('male')
const agree = ref(false)
</script>

<template>
  <lk-form>
    <lk-form-item label="性别" required>
      <lk-radio-group v-model="gender" direction="row">
        <lk-radio name="male">男</lk-radio>
        <lk-radio name="female">女</lk-radio>
      </lk-radio-group>
    </lk-form-item>
  </lk-form>
</template>
```

## API

### RadioGroup Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| modelValue | 绑定值，支持 `v-model` | `string / number / boolean` | — | `''` |
| direction | 排列方向 | `string` | `row / column` | `row` |
| shape | 外观形状 | `string` | `circle / square` | `circle` |
| iconType | 图标样式 | `string` | `dot / check` | `dot` |
| size | 尺寸 | `string` | `sm / md / lg` | `md` |
| disabled | 是否全部禁用 | `boolean` | — | `false` |
| activeColor | 选中颜色 | `string` | — | `''` |
| prop | 表单字段名，配合 `lk-form` 联动校验 | `string` | — | `''` |
| validateEvent | 值变更时是否触发表单校验 | `boolean` | — | `true` |
| id | 根节点 id | `string` | — | `''` |
| customClass | 自定义类名 | `string / object / array` | — | `''` |
| customStyle | 自定义样式 | `string / object` | — | `''` |

### RadioGroup Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 绑定值变化 | `(value: string \| number \| boolean)` |
| change | 选项改变 | `(value: string \| number \| boolean)` |
| item-change | 单个选项选中时触发 | `(value: string \| number \| boolean)` |

### Radio Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| modelValue | 单独使用时的绑定值 | `string / number / boolean` | — | `''` |
| name | 唯一标识符，作为选中值 | `string / number / boolean` | — | `''` |
| label | 标签文字，也可作为值回退 | `string` | — | `''` |
| disabled | 是否禁用该项 | `boolean` | — | `false` |
| labelDisabled | 点击文字是否触发选择 | `boolean` | — | `false` |
| shape | 覆盖 Group 的形状 | `string` | `'' / circle / square` | `''` |
| iconType | 覆盖 Group 的图标类型 | `string` | `'' / dot / check` | `''` |
| activeColor | 覆盖 Group 的选中色 | `string` | — | `''` |
| iconSize | 图标尺寸 | `string / number` | — | `''` |
| id | 根节点 id | `string` | — | `''` |
| customClass | 自定义类名 | `string / object / array` | — | `''` |
| customStyle | 自定义样式 | `string / object` | — | `''` |

### Radio Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 单独使用时的绑定值变化 | `(value: string \| number \| boolean)` |
| change | 单独使用时的值变化回调 | `(value: string \| number \| boolean)` |
| click | 点击单选框时触发，禁用态不触发 | `(event: Event, checked: boolean, value: string \| number \| boolean)` |

### Radio Slots

| 插槽名 | 说明 |
|--------|------|
| default | 标签内容 |
| icon | 自定义选中图标（参数：`{ checked, disabled }`） |
