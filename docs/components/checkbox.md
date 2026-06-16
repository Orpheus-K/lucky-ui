---
title: Checkbox 复选框
phone: checkbox
---

# Checkbox 复选框

用于在多个备选项中进行勾选。支持单独使用，也支持通过 `lk-checkbox-group` 管理一组选项。

## 交互式调试

<PropsPlayground
  component="checkbox"
  :props-def="[
    { key: 'disabled', type: 'boolean', label: '禁用', default: false },
    { key: 'indeterminate', type: 'boolean', label: '半选中', default: false },
  ]"
  slot-content="复选框"
/>

## 基础用法

单独使用时，`v-model` 绑定布尔值最直观。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const checked = ref(false)
</script>

<template>
  <lk-checkbox v-model="checked">接收通知</lk-checkbox>
</template>
```

## 组合使用

在多选场景中，推荐始终使用 `lk-checkbox-group` 管理数组值。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const hobbies = ref(['reading'])
</script>

<template>
  <lk-checkbox-group v-model="hobbies">
    <lk-checkbox label="reading">阅读</lk-checkbox>
    <lk-checkbox label="music">音乐</lk-checkbox>
    <lk-checkbox label="sports">运动</lk-checkbox>
  </lk-checkbox-group>
</template>
```

## 方向、形状与尺寸

```vue
<template>
  <lk-checkbox-group v-model="value" direction="column" shape="circle" size="lg">
    <lk-checkbox label="a">选项 A</lk-checkbox>
    <lk-checkbox label="b">选项 B</lk-checkbox>
  </lk-checkbox-group>
</template>
```

## 最大可选数

`max` 用于限制最多可选数量，超出时不会改变绑定值，并触发 `overlimit`。

```vue
<template>
  <lk-checkbox-group
    v-model="value"
    :max="2"
    @overlimit="(name, max) => console.log(name, max)"
  >
    <lk-checkbox name="a">选项 A</lk-checkbox>
    <lk-checkbox name="b">选项 B</lk-checkbox>
    <lk-checkbox name="c">选项 C</lk-checkbox>
  </lk-checkbox-group>
</template>
```

## 半选与全选

`indeterminate` 适合用于“全选”这一类聚合状态，本身不会自动计算，需要业务侧自行维护。

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const items = ['1', '2', '3']
const checkedList = ref(['1'])

const isAllChecked = computed(() => checkedList.value.length === items.length)
const isIndeterminate = computed(() => checkedList.value.length > 0 && !isAllChecked.value)

function toggleAll(checked: boolean) {
  checkedList.value = checked ? [...items] : []
}
</script>

<template>
  <lk-checkbox
    :model-value="isAllChecked"
    :indeterminate="isIndeterminate"
    @change="toggleAll"
  >
    全选
  </lk-checkbox>

  <lk-checkbox-group v-model="checkedList">
    <lk-checkbox v-for="item in items" :key="item" :label="item">选项 {{ item }}</lk-checkbox>
  </lk-checkbox-group>
</template>
```

## 自定义图标

通过 `#icon` 插槽可完全接管勾选图标，适合品牌化风格或特殊态展示。

```vue
<template>
  <lk-checkbox-group v-model="value">
    <lk-checkbox label="favorite">
      <template #icon="{ checked }">
        <lk-icon :name="checked ? 'heart-fill' : 'heart'" />
      </template>
      收藏
    </lk-checkbox>
  </lk-checkbox-group>
</template>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import CheckboxDemo from '@/components/demos/checkbox-demo.vue'
</script>

<template>
  <CheckboxDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-checkbox />
  </view>
</template>
```

## API

### Checkbox Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| modelValue | 单独使用时的绑定值，建议绑定 `boolean` | `boolean / string / number` | — | `false` |
| name | 在 Group 中的唯一标识；未传时回退为 `label` | `string / number / boolean` | — | `''` |
| shape | 图标形状；不传时继承 Group | `string` | `'' / square / circle` | `''` |
| iconType | 图标类型；不传时继承 Group | `string` | `'' / check / dot` | `''` |
| disabled | 是否禁用 | `boolean` | — | `false` |
| activeColor | 选中颜色；不传时继承 Group | `string` | — | `''` |
| iconSize | 图标尺寸，支持数字或单位字符串 | `string / number` | — | `''` |
| label | 文本标签；在 Group 中也可作为值回退 | `string` | — | `''` |
| labelDisabled | 是否禁用点击文本区域切换 | `boolean` | — | `false` |
| indeterminate | 是否显示半选状态 | `boolean` | — | `false` |
| id | 根节点 id | `string` | — | `''` |
| customClass | 自定义类名 | `string / object / array` | — | `''` |
| customStyle | 自定义样式 | `string / object` | — | `''` |

### Checkbox Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 单独使用时的值变化 | `(value: boolean)` |
| change | 单独使用时的值变化回调 | `(value: boolean)` |
| click | 点击复选框时触发，禁用态不触发 | `(event: Event, checked: boolean, value: string \| number \| boolean)` |

### Checkbox Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| default | 标签内容 | — |
| icon | 自定义图标区域 | `{ checked, disabled, indeterminate }` |

### CheckboxGroup Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| modelValue | 当前选中值数组 | `Array<string / number / boolean>` | — | `[]` |
| size | 统一尺寸 | `string` | `sm / md / lg` | `md` |
| disabled | 是否禁用全部子项 | `boolean` | — | `false` |
| direction | 排列方向 | `string` | `row / column` | `row` |
| shape | 统一形状 | `string` | `square / circle` | `square` |
| iconType | 统一图标类型 | `string` | `check / dot` | `check` |
| activeColor | 统一选中颜色 | `string` | — | `''` |
| max | 最大可选数量，`0` 表示不限制 | `number` | — | `0` |
| prop | 表单字段名，配合 `lk-form` 联动校验 | `string` | — | `''` |
| validateEvent | 值变更时是否触发表单校验 | `boolean` | — | `true` |
| id | 根节点 id | `string` | — | `''` |
| customClass | 自定义类名 | `string / object / array` | — | `''` |
| customStyle | 自定义样式 | `string / object` | — | `''` |

### CheckboxGroup Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 选中值数组变化 | `(value: Array<string \| number \| boolean>)` |
| change | 选中值数组变化回调 | `(value: Array<string \| number \| boolean>)` |
| item-change | 单个选项变化时触发 | `(value: string \| number \| boolean, checked: boolean, list: Array<string \| number \| boolean>)` |
| overlimit | 选中数量超过 `max` 时触发 | `(value: string \| number \| boolean, max: number)` |

### 使用建议

::: tip
在 `lk-checkbox-group` 中，推荐显式传入 `name` 或 `label` 作为稳定值，避免仅依赖插槽文案。
:::

::: warning
`indeterminate` 只控制视觉态，不会自动驱动选中值数组。
:::
