---
title: Switch 开关
phone: switch
---

# Switch 开关

用于开启或关闭某个功能状态，是替代 Checkbox 的更直观表单控件。

## 交互式调试

<PropsPlayground
  component="switch"
  :props-def="[
    { key: 'size', type: 'enum', label: '尺寸', values: ['sm', 'md', 'lg'], default: 'md' },
    { key: 'disabled', type: 'boolean', label: '禁用', default: false },
    { key: 'loading', type: 'boolean', label: '加载中', default: false },
  ]"
/>

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
const on = ref(false)
</script>

<template>
  <lk-switch v-model="on" />
  <view>状态：{{ on ? '已开启' : '已关闭' }}</view>
</template>
```

## 尺寸

```vue
<template>
  <view class="demo-row" style="align-items:center">
    <lk-switch size="sm" />
    <lk-switch size="md" />
    <lk-switch size="lg" />
  </view>
</template>
```

## 自定义颜色

```vue
<template>
  <view class="demo-col">
    <lk-switch :model-value="true" active-color="#22c55e" />
    <lk-switch :model-value="true" active-color="#f59e0b" />
    <lk-switch :model-value="true" active-color="#ef4444" />
  </view>
</template>
```

## 禁用与加载

```vue
<template>
  <view class="demo-row">
    <lk-switch :model-value="true" disabled />
    <lk-switch :model-value="false" disabled />
    <lk-switch :model-value="true" loading />
  </view>
</template>
```

## 自定义值与切换拦截

`activeValue` 和 `inactiveValue` 可定义真实提交值；`beforeChange` 返回 `false` 或抛错时会阻止切换。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const status = ref('enabled')

async function beforeChange(nextValue: string | number | boolean) {
  if (nextValue === 'disabled') {
    return false
  }
  return true
}
</script>

<template>
  <lk-switch
    v-model="status"
    active-value="enabled"
    inactive-value="disabled"
    :before-change="beforeChange"
    @before-change="value => console.log('before:', value)"
    @change-cancel="(value, reason) => console.log(value, reason)"
  />
</template>
```

## 带文字标签

```vue
<script setup lang="ts">
import { ref } from 'vue'
const receive = ref(true)
const auto = ref(false)
</script>

<template>
  <lk-cell-group>
    <lk-cell title="接收通知">
      <template #value>
        <lk-switch v-model="receive" size="sm" />
      </template>
    </lk-cell>
    <lk-cell title="自动同步">
      <template #value>
        <lk-switch v-model="auto" size="sm" />
      </template>
    </lk-cell>
  </lk-cell-group>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| modelValue | 绑定值，支持 `v-model` | `boolean / string / number` | — | `false` |
| activeValue | 开启时的值 | `boolean / string / number` | — | `true` |
| inactiveValue | 关闭时的值 | `boolean / string / number` | — | `false` |
| size | 尺寸 | `string` | `sm / md / lg` | `md` |
| disabled | 是否禁用 | `boolean` | — | `false` |
| loading | 是否加载中 | `boolean` | — | `false` |
| activeColor | 开启状态颜色 | `string` | — | `''` |
| inactiveColor | 关闭状态颜色 | `string` | — | `''` |
| beforeChange | 切换前拦截函数，返回 `false` 或 `Promise<false>` 阻止切换 | `(nextValue) => boolean / Promise<boolean>` | — | `null` |
| inlinePrompt | 是否在开关内显示文字 | `boolean` | — | `false` |
| activeText | 开启时内嵌文字 | `string` | — | `''` |
| inactiveText | 关闭时内嵌文字 | `string` | — | `''` |
| hapticFeedback | 是否开启轻震动反馈 | `boolean` | — | `false` |
| prop | 表单字段名，配合 `lk-form` 联动校验 | `string` | — | `''` |
| validateEvent | 值变更时是否触发表单校验 | `boolean` | — | `true` |
| id | 根节点 id | `string` | — | `''` |
| customClass | 自定义类名 | `string / object / array` | — | `''` |
| customStyle | 自定义样式 | `string / object` | — | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 状态变化时触发 | `(value: boolean \| string \| number)` |
| change | 状态变化回调 | `(value: boolean \| string \| number)` |
| click | 点击开关时触发，禁用、加载、切换中不触发 | `(event: Event, checked: boolean)` |
| before-change | 执行切换前触发 | `(nextValue: boolean \| string \| number)` |
| change-cancel | 切换被拦截或异常中断时触发 | `(nextValue: boolean \| string \| number, reason: 'before-change' \| 'error')` |

## 注意事项

::: tip
事件触发顺序为 `click` -> `before-change` -> `update:modelValue` -> `change`。若 `beforeChange` 拦截失败，则触发 `change-cancel`，不会更新值。
:::
