---
title: Stepper 步进器
phone: stepper
---

# Stepper 步进器

用于通过加减按钮或直接输入的方式快速调整数值，常见于商品数量、库存、份数等场景。

## 交互式调试

<PropsPlayground
  component="stepper"
  :props-def="[
    { key: 'size', type: 'enum', label: '尺寸', values: ['sm', 'md', 'lg'], default: 'md' },
    { key: 'min', type: 'number', label: '最小值', default: 1 },
    { key: 'max', type: 'number', label: '最大值', default: 99 },
    { key: 'step', type: 'number', label: '步长', default: 1 },
    { key: 'disabled', type: 'boolean', label: '禁用', default: false },
    { key: 'integer', type: 'boolean', label: '仅整数', default: false },
    { key: 'disableInput', type: 'boolean', label: '禁用输入', default: false },
  ]"
/>

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(1)
</script>

<template>
  <lk-stepper v-model="count" />
</template>
```

## 范围与步长

`min`、`max`、`step` 支持整数与小数。

```vue
<lk-stepper v-model="count" min="0" max="10" step="0.2" />
```

## 仅允许整数

启用 `integer` 后，即使输入小数，失焦时也会自动修正为整数。

```vue
<lk-stepper v-model="count" integer />
```

## 禁用输入或组件

```vue
<template>
  <lk-stepper :model-value="3" disabled />
  <lk-stepper v-model="count" disable-input />
</template>
```

## 自定义尺寸

```vue
<template>
  <lk-stepper v-model="small" size="sm" />
  <lk-stepper v-model="medium" size="md" />
  <lk-stepper v-model="large" size="lg" />
</template>
```

## 变更前拦截

通过 `beforeChange` 可以接入库存校验、权限校验、异步确认等业务逻辑。

```vue
<script setup lang="ts">
const beforeChange = async (value: number) => {
  if (value > 5) {
    uni.showToast({ title: '库存不足', icon: 'none' })
    return false
  }
  return true
}
</script>

<template>
  <lk-stepper v-model="count" :before-change="beforeChange" />
</template>
```

## 事件监听

```vue
<template>
  <lk-stepper
    v-model="count"
    :min="1"
    :max="5"
    @input="value => console.log('input:', value)"
    @change="(value, action) => console.log(value, action)"
    @plus="value => console.log('plus:', value)"
    @minus="value => console.log('minus:', value)"
    @overlimit="(type, limit) => console.log(type, limit)"
    @change-cancel="(value, action, reason) => console.log(value, action, reason)"
  />
</template>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import StepperDemo from '@/components/demos/stepper-demo.vue'
</script>

<template>
  <StepperDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-stepper />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| modelValue | 当前值 | `number / string` | — | `0` |
| min | 最小值 | `number / string` | — | `1` |
| max | 最大值 | `number / string` | — | `Infinity` |
| step | 步长 | `number / string` | — | `1` |
| integer | 是否只允许整数 | `boolean` | — | `false` |
| disabled | 是否禁用 | `boolean` | — | `false` |
| disableInput | 是否禁用输入框，仅允许按钮调整 | `boolean` | — | `false` |
| longPress | 是否开启长按连续加减 | `boolean` | — | `true` |
| size | 组件尺寸 | `string` | `sm / md / lg` | `md` |
| inputWidth | 输入框宽度，数字按 `rpx` 处理 | `number / string` | — | `''` |
| buttonSize | 按钮宽度，数字按 `rpx` 处理 | `number / string` | — | `''` |
| beforeChange | 变更前拦截，返回 `false` 或 `Promise<false>` 可阻止更新 | `(value: number) => boolean / Promise<boolean>` | — | `null` |
| prop | 表单字段名，配合 `lk-form` 联动校验 | `string` | — | `''` |
| validateEvent | 值变更时是否触发表单校验 | `boolean` | — | `true` |
| id | 根节点 id | `string` | — | `''` |
| customClass | 自定义类名 | `string / object / array` | — | `''` |
| customStyle | 自定义样式 | `string / object` | — | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 当前值变化 | `(value: number \| string)` |
| change | 值变更完成时触发 | `(value: number \| string, action: 'minus' \| 'plus' \| 'input')` |
| input | 输入框输入时触发，值未必已格式化 | `(value: string)` |
| plus | 点击或长按加号且变更成功时触发 | `(value: number)` |
| minus | 点击或长按减号且变更成功时触发 | `(value: number)` |
| overlimit | 点击超出边界时触发 | `(type: 'minus' \| 'plus', limit: number)` |
| before-change | 执行变更前触发 | `(value: number, action: 'minus' \| 'plus' \| 'input')` |
| change-cancel | 变更被拦截或异常中断时触发 | `(value: number, action: 'minus' \| 'plus' \| 'input', reason: 'before-change' \| 'error')` |
| focus | 输入框聚焦 | `(event: Event)` |
| blur | 输入框失焦 | `(event: Event)` |

### Slots

无

## 使用建议

::: tip
如果值必须与库存、价格、业务规则联动，优先使用 `beforeChange` 统一拦截，而不是在 `change` 后再回滚。
:::

::: warning
组件内部会在失焦时自动修正范围与格式，因此不要依赖输入过程中的临时值作为最终业务值。
:::
