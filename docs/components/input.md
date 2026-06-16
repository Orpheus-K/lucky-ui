---
title: Input 输入框
phone: input
---

# Input 输入框

单行文本输入框，支持清空、前缀图标、字数统计等常见功能。

## 交互式调试

<PropsPlayground
  component="input"
  :props-def="[
    { key: 'size', type: 'enum', label: '尺寸', values: ['sm', 'md', 'lg'], default: 'md' },
    { key: 'type', type: 'enum', label: '输入类型', values: ['text', 'password', 'number', 'tel', 'email', 'digit', 'idcard'], default: 'text' },
    { key: 'placeholder', type: 'string', label: '占位文本', default: '请输入' },
    { key: 'disabled', type: 'boolean', label: '禁用', default: false },
    { key: 'readonly', type: 'boolean', label: '只读', default: false },
    { key: 'clearable', type: 'boolean', label: '可清除', default: true },
    { key: 'showCount', type: 'boolean', label: '字数统计', default: false },
  ]"
/>

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
const val = ref('')
</script>

<template>
  <lk-input v-model="val" placeholder="请输入内容" />
</template>
```

## 输入类型

```vue
<template>
  <view class="demo-col">
    <lk-input type="text" placeholder="文本输入" />
    <lk-input type="password" placeholder="密码输入" />
    <lk-input type="number" placeholder="数字输入" />
    <lk-input type="tel" placeholder="电话号码" />
    <lk-input type="digit" placeholder="带小数点数字键盘" />
    <lk-input type="idcard" placeholder="身份证键盘" />
  </view>
</template>
```

## 前缀图标

```vue
<template>
  <view class="demo-col">
    <lk-input prefix-icon="search" placeholder="搜索..." />
    <lk-input prefix-icon="person" placeholder="用户名" />
    <lk-input prefix-icon="lock" type="password" placeholder="密码" />
    <lk-input prefix-icon="envelope" type="email" placeholder="电子邮箱" />
  </view>
</template>
```

## 尺寸

```vue
<template>
  <view class="demo-col">
    <lk-input size="sm" placeholder="小尺寸" />
    <lk-input size="md" placeholder="中尺寸（默认）" />
    <lk-input size="lg" placeholder="大尺寸" />
  </view>
</template>
```

## 可清空 & 字数统计

```vue
<script setup lang="ts">
import { ref } from 'vue'
const bio = ref('')
</script>

<template>
  <!-- clearable 默认已启用 -->
  <lk-input v-model="bio" placeholder="请输入昵称" clearable />

  <!-- 字数统计（配合 maxlength） -->
  <lk-input
    v-model="bio"
    placeholder="一句话介绍自己"
    :maxlength="50"
    show-count
  />
</template>
```

## 禁用 & 只读

```vue
<template>
  <view class="demo-col">
    <lk-input value="禁用状态" disabled />
    <lk-input value="只读状态" readonly />
  </view>
</template>
```

## 事件监听

```vue
<script setup lang="ts">
import { ref } from 'vue'

const keyword = ref('')

function onInput(value: string | number) {
  keyword.value = String(value)
}

function onConfirm(event: any) {
  console.log('confirm value:', event.detail?.value)
}
</script>

<template>
  <lk-input
    v-model="keyword"
    confirm-type="search"
    placeholder="搜索关键词"
    @input="onInput"
    @confirm="onConfirm"
    @keyboardheightchange="event => console.log(event.detail)"
  />
</template>
```

## 假输入框

用于搜索入口、选择器入口等场景。`fake` 模式不会渲染原生 `input`，点击时只触发 `click`。

```vue
<template>
  <lk-input
    fake
    prefix-icon="search"
    placeholder="搜索商品"
    @click="goSearch"
  />
</template>
```

## 与表单验证结合

```vue
<script setup lang="ts">
import { ref } from 'vue'
const formRef = ref()
const form = ref({ username: '', phone: '' })

async function submit() {
  await formRef.value.validate()
}
</script>

<template>
  <lk-form ref="formRef" :model="form">
    <lk-form-item
      label="用户名"
      prop="username"
      :rules="[{ required: true, message: '请输入用户名' }]"
    >
      <lk-input v-model="form.username" prefix-icon="person" placeholder="请输入用户名" />
    </lk-form-item>
    <lk-form-item
      label="手机号"
      prop="phone"
      :rules="[
        { required: true, message: '请输入手机号' },
        { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
      ]"
    >
      <lk-input v-model="form.phone" type="tel" prefix-icon="phone" placeholder="请输入手机号" />
    </lk-form-item>
    <lk-button block @click="submit">提交</lk-button>
  </lk-form>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| modelValue | 绑定值，支持 `v-model` | `string / number` | — | `''` |
| type | 输入类型 | `string` | `text / password / number / tel / email / digit / idcard` | `text` |
| size | 尺寸 | `string` | `sm / md / lg` | `md` |
| placeholder | 占位文字 | `string` | — | `''` |
| placeholderStyle | 占位符样式 | `string` | — | `''` |
| placeholderClass | 占位符样式类 | `string` | — | `input-placeholder` |
| name | 原生表单字段名 | `string` | — | `''` |
| disabled | 是否禁用 | `boolean` | — | `false` |
| readonly | 是否只读 | `boolean` | — | `false` |
| clearable | 是否显示清空按钮 | `boolean` | — | `true` |
| maxlength | 最大长度，`-1` 表示不限制 | `number` | — | `-1` |
| showCount | 是否显示字数统计 | `boolean` | — | `false` |
| showWordLimit | 是否显示输入字数限制 | `boolean` | — | `false` |
| prop | 表单字段名，用于 Form 校验联动 | `string` | — | `''` |
| autofocus | 首次渲染时是否自动聚焦 | `boolean` | — | `false` |
| focus | 是否聚焦，受控聚焦状态 | `boolean` | — | `false` |
| prefixIcon | 前缀图标名 | `string` | — | `''` |
| suffixIcon | 后缀图标名 | `string` | — | `''` |
| showPassword | 密码输入时是否显示明暗切换按钮 | `boolean` | — | `false` |
| borderless | 是否无边框，常用于表单列表内 | `boolean` | — | `false` |
| inputAlign | 输入内容对齐方式 | `string` | `left / center / right` | `left` |
| confirmType | 键盘右下角按钮文字 | `string` | `send / search / next / go / done / return` | `done` |
| confirmHold | 点击键盘右下角按钮时是否保持键盘不收起 | `boolean` | — | `false` |
| cursorSpacing | 光标与键盘的距离，单位 px | `number` | — | `0` |
| cursor | 指定聚焦时的光标位置 | `number` | — | `-1` |
| selectionStart | 光标起始位置，需与 `selectionEnd` 搭配使用 | `number` | — | `-1` |
| selectionEnd | 光标结束位置，需与 `selectionStart` 搭配使用 | `number` | — | `-1` |
| adjustPosition | 键盘弹起时是否自动上推页面 | `boolean` | — | `true` |
| holdKeyboard | 聚焦时点击页面是否保持键盘不收起 | `boolean` | — | `false` |
| inputmode | H5/App 输入模式提示 | `string` | `none / text / decimal / numeric / tel / search / email / url` | `text` |
| ignoreCompositionEvent | 是否忽略系统组合输入事件 | `boolean` | — | `true` |
| fake | 是否为假输入框模式 | `boolean` | — | `false` |
| fakeText | 假输入框显示文本，不设置时使用 `placeholder` | `string` | — | `''` |
| id | 根节点 id | `string` | — | `''` |
| customClass | 自定义类名 | `string / object / array` | — | `''` |
| customStyle | 自定义样式 | `string / object` | — | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 输入值变化时触发，用于 `v-model` | `(value: string \| number)` |
| input | 键盘输入时触发，组合输入中默认等 `compositionend` 后触发 | `(value: string \| number)` |
| change | 清空或失焦提交最终值时触发 | `(value: string \| number)` |
| focus | 输入框聚焦时触发 | `(event: Event)` |
| blur | 输入框失焦时触发 | `(event: Event)` |
| confirm | 点击键盘右下角按钮时触发 | `(event: Event)` |
| keyboardheightchange | 键盘高度变化时触发 | `(event: Event)` |
| clear | 点击清空按钮时触发 | `()` |
| click | `fake=true` 时点击假输入框触发 | `(event: Event)` |
| compositionstart | 组合输入开始时触发 | `(event: Event)` |
| compositionupdate | 组合输入更新时触发 | `(event: Event)` |
| compositionend | 组合输入结束时触发 | `(event: Event)` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| prefix | 前缀自定义内容 |
| suffix | 后缀自定义内容 |
| notice | 内嵌通知内容 |

## 注意事项

::: tip
`update:modelValue` 与 `input` 会在输入值变化时同步触发；`change` 主要用于失焦提交与清空场景，适合触发表单校验。
:::

::: warning
`digit`、`idcard`、`keyboardheightchange`、`holdKeyboard`、`inputmode` 等能力存在平台差异，请以 UniApp 当前运行端的原生 `input` 能力为准。
:::
