---
title: Rate 评分
phone: rate
---

# Rate 评分

用于通过星级或自定义图标表达评分结果，支持交互评分、只读展示等场景。

## 交互式调试

<PropsPlayground
  component="rate"
  :props-def="[
    { key: 'count', type: 'number', label: '总数', default: 5 },
    { key: 'disabled', type: 'boolean', label: '禁用', default: false },
    { key: 'readonly', type: 'boolean', label: '只读', default: false },
    { key: 'allowClear', type: 'boolean', label: '允许清除', default: true },
  ]"
/>

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const score = ref(3)
</script>

<template>
  <lk-rate v-model="score" />
</template>
```

## 再次点击清零

启用 `allowClear` 后，点击当前已选值可直接清零。

```vue
<lk-rate v-model="score" allow-clear @clear="handleClear" />
```

`clear` 会返回 `{ oldValue, index, event }`，适合做撤销提示或埋点。

## 只读与禁用

```vue
<template>
  <lk-rate :model-value="4" readonly />
  <lk-rate :model-value="2" disabled />
</template>
```

## 自定义图标与颜色

```vue
<lk-rate
  v-model="score"
  icon="star-fill"
  icon-void="star"
  color="#f5a623"
  color-void="#d4d4d8"
/>
```

## 自定义数量与尺寸

```vue
<template>
  <lk-rate v-model="score" :count="8" :size="64" />
</template>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import RateDemo from '@/components/demos/rate-demo.vue'
</script>

<template>
  <RateDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-rate />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 当前评分值 | `number` | `0` |
| count | 图标总数量 | `number` | `5` |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| allowClear | 点击当前值时是否允许清零 | `boolean` | `true` |
| size | 图标尺寸，数字按 `rpx` 处理 | `string \| number` | `48` |
| color | 选中颜色 | `string` | `''` |
| colorVoid | 未选中颜色 | `string` | `''` |
| icon | 选中图标名 | `string` | `''` |
| iconVoid | 未选中图标名 | `string` | `''` |
| prop | 表单字段名 | `string` | `''` |
| id | 根节点 id | `string` | `''` |
| customClass | 根节点自定义类名 | `string \| object \| array` | — |
| customStyle | 根节点自定义样式 | `string \| object` | — |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| update:modelValue | 评分变化 | `(value: number) => void` |
| change | 评分变化后的回调 | `(value: number, oldValue?: number) => void` |
| click | 点击可交互图标时触发，早于 `change` | `({ value, oldValue, index, event }) => void` |
| clear | 点击当前评分并清零时触发 | `({ oldValue, index, event }) => void` |
| click-disabled | 点击禁用或只读评分时触发 | `({ value, index, disabled, readonly, event }) => void` |

### Slots

无

## 使用建议

::: tip
展示历史评分或服务评分结果时，优先使用 `readonly`，避免用户误以为仍可编辑。
:::

