---
title: Form 表单
phone: form
---

# Form 表单

用于承载表单数据、组织字段布局，并统一处理校验、错误提示与表单方法调用。

## 何时使用

- 需要集中维护一组字段值时。
- 需要必填、长度、正则、自定义函数校验时。
- 需要通过 `ref` 统一调用 `validate()`、`resetFields()`、`clearValidate()` 时。

## 基础用法

`lk-form` 负责提供表单上下文，`lk-form-item` 负责字段标签、错误提示与校验承载，输入组件通过 `v-model` 直接读写 `model`。

```vue
<script setup lang="ts">
import { reactive, ref } from 'vue'

const formRef = ref()

const form = reactive({
  username: '',
  phone: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
  ],
}

async function submit() {
  try {
    await formRef.value?.validate()
  } catch (errors) {
    console.log(errors)
  }
}
</script>

<template>
  <lk-form ref="formRef" :model="form" :rules="rules" label-width="160rpx">
    <lk-form-item label="用户名" prop="username">
      <lk-input v-model="form.username" prop="username" placeholder="请输入用户名" />
    </lk-form-item>

    <lk-form-item label="手机号" prop="phone">
      <lk-input v-model="form.phone" prop="phone" type="tel" placeholder="请输入手机号" />
    </lk-form-item>

    <lk-button @click="submit">提交</lk-button>
  </lk-form>
</template>
```

## 事件监听

```vue
<template>
  <lk-form
    ref="formRef"
    :model="form"
    :rules="rules"
    @validate="(ok, errors) => console.log(ok, errors)"
    @validate-field="(prop, ok, errors) => console.log(prop, ok, errors)"
    @field-change="(prop, value) => console.log(prop, value)"
    @field-blur="prop => console.log(prop)"
    @reset="fields => console.log(fields)"
    @clear-validate="fields => console.log(fields)"
  >
    <lk-form-item label="用户名" prop="username">
      <lk-input v-model="form.username" prop="username" />
    </lk-form-item>
  </lk-form>
</template>
```

## 标签布局

通过 `label-width` 和 `label-align` 控制字段标签布局。`top` 适合移动端窄屏表单。

```vue
<template>
  <lk-form :model="form" label-align="top">
    <lk-form-item label="姓名" prop="name">
      <lk-input v-model="form.name" placeholder="请输入姓名" />
    </lk-form-item>

    <lk-form-item label="公司" prop="company">
      <lk-input v-model="form.company" placeholder="请输入公司名称" />
    </lk-form-item>
  </lk-form>
</template>
```

## 校验规则

支持以下几类规则：

- `required`：必填校验
- `min` / `max`：字符串长度或数值范围
- `pattern`：正则校验
- `validator`：自定义同步 / 异步校验
- `trigger`：`blur`、`change` 或两者组合

```vue
<script setup lang="ts">
const rules = {
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 位', trigger: 'change' },
  ],
  confirmPassword: [
    {
      validator: (value, _rule, model) => {
        if (value !== model?.password) return '两次输入的密码不一致'
        return true
      },
      trigger: ['blur', 'change'],
    },
  ],
}
</script>
```

## 表单方法

通过组件 `ref` 可以调用常用方法：

```vue
<script setup lang="ts">
import { ref } from 'vue'

const formRef = ref()

async function validateUsername() {
  await formRef.value?.validateField('username')
}

function resetUsername() {
  formRef.value?.resetFields(['username'])
}

function clearUsernameError() {
  formRef.value?.clearValidate(['username'])
}
</script>
```

## 自动滚动到错误字段

在长表单中，建议开启 `scroll-to-error`。当 `validate()` 失败时，组件会自动滚动到首个错误项。

```vue
<template>
  <lk-form :model="form" :rules="rules" scroll-to-error>
    <!-- 长表单字段 -->
  </lk-form>
</template>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import FormDemo from '@/components/demos/form-demo.vue'
</script>

<template>
  <FormDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({ name: '' })
</script>

<template>
  <view class="page-demo">
    <lk-form :model="form">
      <lk-form-item label="姓名" prop="name">
        <lk-input v-model="form.name" placeholder="请输入姓名" />
      </lk-form-item>
    </lk-form>
  </view>
</template>
```

## API

### Form Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| model | 表单数据对象，必填 | `Record<string, unknown>` | — | — |
| rules | 表单校验规则 | `FormRules` | — | `undefined` |
| labelWidth | 默认标签宽度，支持数字或带单位字符串 | `string / number` | — | `''` |
| labelAlign | 默认标签对齐方式 | `string` | `left / right / top` | `left` |
| showMessage | 是否显示错误提示文本 | `boolean` | — | `true` |
| scrollToError | 校验失败时是否自动滚动到第一个错误字段 | `boolean` | — | `false` |
| disabled | 是否禁用表单内控件的业务状态传递 | `boolean` | — | `false` |
| border | 是否显示单元格边框 | `boolean` | — | `false` |
| card | 是否为圆角卡片布局 | `boolean` | — | `false` |
| id | 根节点 id | `string` | — | `''` |
| customClass | 自定义类名 | `string / object / array` | — | `''` |
| customStyle | 自定义样式 | `string / object` | — | `''` |

### Form Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| validate | 调用 `validate()` 后触发，表示整体验证结果 | `(ok: boolean, errors: ValidateError[] \| null)` |
| validate-field | 单个字段完成校验后触发 | `(prop: string, ok: boolean, errors: ValidateError[] \| null)` |
| field-blur | 字段触发 blur 校验前触发 | `(prop: string)` |
| field-change | 字段触发 change 校验前触发 | `(prop: string, value?: unknown)` |
| reset | 调用 `resetFields()` 后触发 | `(fields?: string[])` |
| clear-validate | 调用 `clearValidate()` 后触发 | `(fields?: string[])` |

### Form Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| validate() | 校验全部字段，失败时返回 `Promise.reject(errors)` | `opts?: { fields?: string[]; silent?: boolean }` |
| validateField() | 校验单个字段 | `(prop: string)` |
| resetFields() | 重置全部或指定字段的值与校验状态 | `(fields?: string[])` |
| clearValidate() | 清除全部或指定字段的校验状态，不重置值 | `(fields?: string[])` |
| scrollToField() | 滚动到指定字段 | `(prop: string)` |

### FormItem Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| prop | 对应 `model` 中的字段名 | `string` | — | `''` |
| label | 标签文本 | `string` | — | `''` |
| required | 是否强制显示必填星号；不传时根据规则自动推断 | `boolean` | — | `undefined` |
| labelWidth | 当前项标签宽度，优先级高于 Form | `string / number` | — | `''` |
| labelAlign | 当前项标签对齐方式，优先级高于 Form | `string` | `left / right / top` | `''` |
| showMessage | 当前项是否显示错误信息，优先级高于 Form | `boolean` | — | `undefined` |
| isLink | 是否显示右侧箭头，常用于选择器跳转场景 | `boolean` | — | `false` |
| vertical | 是否垂直布局，标签居上内容居下 | `boolean` | — | `false` |
| id | 根节点 id | `string` | — | `''` |
| customClass | 自定义类名 | `string / object / array` | — | `''` |
| customStyle | 自定义样式 | `string / object` | — | `''` |

### FormItem Slots

| 插槽名 | 说明 |
|--------|------|
| default | 表单控件内容 |
| label | 自定义标签区域 |

### FormItem Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| validate() | 手动校验当前表单项 | `(trigger?: 'blur' \| 'change')` |
| resetField() | 重置当前字段值并清除校验状态 | — |
| clearValidate() | 清除当前字段校验状态 | — |

### Rule 结构

| 字段 | 说明 | 类型 |
|------|------|------|
| required | 是否必填 | `boolean` |
| message | 失败提示文案 | `string` |
| trigger | 触发时机 | `'blur' \| 'change' \| Array<'blur' \| 'change'>` |
| min | 最小长度或最小值 | `number` |
| max | 最大长度或最大值 | `number` |
| pattern | 正则校验 | `RegExp` |
| validator | 自定义校验函数 | `(value, rule, model) => boolean \| string \| Promise<boolean \| string>` |

## 使用建议

::: tip
输入类组件如果需要联动表单 `blur/change` 校验，建议同时传入与 `lk-form-item` 一致的 `prop`。
:::

::: warning
`resetFields()` 会按照字段当前类型恢复为 `''`、`0`、`false`、`[]` 或 `null`，使用前建议确保初始模型结构稳定。
:::
