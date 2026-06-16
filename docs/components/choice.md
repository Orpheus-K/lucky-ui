---
title: Choice 快选
phone: choice
---

# Choice 快选

用于在一组选项中完成单选或多选，适合支付方式、筛选条件、权益标签等轻量选择场景。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue';

const value = ref('wechat');
const options = [
  { label: '微信', value: 'wechat', icon: 'wechat' },
  { label: '支付宝', value: 'alipay', icon: 'wallet2' },
];
</script>

<template>
  <lk-choice v-model="value" :options="options" />
</template>
```

## 多选

```vue
<script setup lang="ts">
import { ref } from 'vue';

const values = ref(['coupon']);
const options = [
  { label: '优惠券', value: 'coupon' },
  { label: '积分', value: 'point' },
  { label: '包邮', value: 'shipping' },
];
</script>

<template>
  <lk-choice v-model="values" multiple :options="options" />
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 当前值 | `string / number / array / null` | `null` |
| options | 选项列表 | `Array<{ label: string; value: any; icon?: string }>` | `[]` |
| multiple | 是否多选 | `boolean` | `false` |
| size | 尺寸 | `string` | `'md'` |
| allowUnselect | 是否允许取消选中 | `boolean` | `true` |
| gap | 选项间距，单位 rpx | `number` | `20` |
| customClass | 自定义类名 | `string / object / array` | — |
| customStyle | 自定义样式 | `string / object` | — |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 选择值变化 | `(value) => void` |
| change | 选择值变化 | `(value) => void` |
| click | 点击选项 | `(option) => void` |

### Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|------------|
| item | 自定义选项内容 | `{ option, selected }` |

## 注意事项

多选模式下 `modelValue` 应传数组；单选模式下传字符串或数字。需要强制至少保留一项时，设置 `:allow-unselect="false"`。
