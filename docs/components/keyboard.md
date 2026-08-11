---
title: Keyboard 虚拟键盘
phone: keyboard
---

# Keyboard 虚拟键盘

用于数字、身份证、车牌号等受控输入场景。组件内部复用 `lk-popup`，默认呈现纯色面板、反差文字和无独立键帽的简约布局。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue';

const value = ref('');
const visible = ref(false);
</script>

<template>
  <lk-button @click="visible = true">打开数字键盘</lk-button>
  <lk-keyboard v-model:visible="visible" v-model="value" />
</template>
```

键盘默认显示遮罩，点击遮罩即可收起。标题栏和操作按钮默认不显示，因此基础形态只有键盘区域。

## 小数点与随机排列

```vue
<lk-keyboard v-model:visible="visible" v-model="value" :show-dot="true" :random="true" />
```

## 身份证与车牌号键盘

```vue
<lk-keyboard v-model:visible="idVisible" v-model="idValue" type="idcard" :max-length="18" />
<lk-keyboard v-model:visible="plateVisible" v-model="plateValue" type="plate" />
```

`plate` 模式内置省份简称与字母数字切换逻辑。

## 标题栏与确认操作

```vue
<lk-keyboard
  v-model:visible="visible"
  v-model="value"
  title="输入金额"
  confirm-text="完成"
  show-close
  show-confirm
/>
```

## 自定义键盘布局

当 `type="custom"` 时，通过 `keys` 传入二维按键数组。自定义布局与内置布局共用同一套纯色视觉，不提供旧式键帽皮肤入口。

```vue
<script setup lang="ts">
const keys = [
  [
    { text: 'A', value: 'A' },
    { text: 'B', value: 'B' },
    { text: 'C', value: 'C' },
  ],
  [
    { text: '删除', type: 'delete' },
    { text: '确认', type: 'confirm', flex: 2 },
  ],
];
</script>

<template>
  <lk-keyboard v-model:visible="visible" v-model="value" type="custom" :keys="keys" />
</template>
```

## Popup 行为

`lk-keyboard` 将弹层、遮罩、底部圆角、滚动锁定和安全区交给 `lk-popup` 处理。可以关闭遮罩，或阻止点击遮罩收起：

```vue
<lk-keyboard
  v-model:visible="visible"
  v-model="value"
  show-close
  :overlay="false"
  :close-on-overlay="false"
/>
```

## 主题变量

组件仅保留面板与文字两个视觉变量，避免键帽背景、边框、阴影和特殊键配色形成重复皮肤层。

| 变量                 | 说明                     | 默认值                   |
| -------------------- | ------------------------ | ------------------------ |
| `--lk-keyboard-bg`   | Popup 与键盘面板纯色背景 | `var(--lk-bg-container)` |
| `--lk-keyboard-text` | 数字、操作文字与图标颜色 | `var(--lk-text-primary)` |

`customClass` 应用于键盘内容根节点，`customStyle` 应用于 Popup 面板。若要换成品牌色面板，可以通过 `customStyle` 同时设置上述两个变量，让 Popup、安全区和键盘内容保持同色，并确保文字对比度。

```vue
<lk-keyboard
  v-model:visible="visible"
  v-model="value"
  :custom-style="{
    '--lk-keyboard-bg': '#111111',
    '--lk-keyboard-text': '#ffffff',
  }"
/>
```

## API

### Props

| 参数                | 说明                               | 类型                                  | 默认值   |
| ------------------- | ---------------------------------- | ------------------------------------- | -------- |
| customClass         | 键盘根节点自定义类名               | `string \| object \| array`           | `''`     |
| customStyle         | Popup 面板自定义样式               | `string \| object`                    | `''`     |
| visible             | 是否显示，支持 `v-model:visible`   | `boolean`                             | `false`  |
| type                | 键盘类型                           | `number \| idcard \| plate \| custom` | `number` |
| title               | 标题文字                           | `string`                              | `''`     |
| confirmText         | 确认按钮文字，为空时使用国际化文案 | `string`                              | `''`     |
| showConfirm         | 是否显示确认操作                   | `boolean`                             | `false`  |
| showClose           | 是否显示收起操作                   | `boolean`                             | `false`  |
| showDelete          | 数字键盘是否显示删除键             | `boolean`                             | `true`   |
| showDot             | 数字键盘是否显示小数点             | `boolean`                             | `false`  |
| extraKey            | 数字键盘左下角额外按键             | `string`                              | `''`     |
| random              | 是否随机排列数字                   | `boolean`                             | `false`  |
| maxLength           | 最大输入长度，`0` 表示不限制       | `number`                              | `0`      |
| modelValue          | 当前输入值，支持 `v-model`         | `string`                              | `''`     |
| overlay             | 是否显示 Popup 遮罩                | `boolean`                             | `true`   |
| closeOnOverlay      | 点击遮罩是否收起                   | `boolean`                             | `true`   |
| zIndex              | Popup 层级                         | `number`                              | `1000`   |
| safeAreaInsetBottom | 是否适配底部安全区                 | `boolean`                             | `true`   |
| keys                | 自定义布局，仅 `custom` 模式使用   | `KeyboardKey[][]`                     | `[]`     |
| vibrate             | 是否启用触感反馈                   | `boolean`                             | `true`   |

### KeyboardKey

| 字段     | 说明           | 类型                                             | 默认值      |
| -------- | -------------- | ------------------------------------------------ | ----------- |
| text     | 按键显示文字   | `string`                                         | —           |
| value    | 点击后输出的值 | `string`                                         | `undefined` |
| flex     | 按键宽度比例   | `number`                                         | `undefined` |
| type     | 按键类型       | `default \| delete \| confirm \| extra \| empty` | `default`   |
| disabled | 是否禁用       | `boolean`                                        | `undefined` |

### Events

| 事件名            | 说明                   | 回调参数             |
| ----------------- | ---------------------- | -------------------- |
| update:visible    | 键盘显隐变化           | `(visible: boolean)` |
| update:modelValue | 输入值变化             | `(value: string)`    |
| input             | 输入普通字符时触发     | `(key: string)`      |
| delete            | 点击删除键时触发       | `()`                 |
| confirm           | 点击确认操作时触发     | `(value: string)`    |
| close             | 键盘请求收起时触发     | `()`                 |
| key-press         | 任意有效按键点击时触发 | `(key: KeyboardKey)` |

### Slots

当前版本不提供插槽。

## 使用建议

- 键盘只负责受控输入，不会自动唤起系统输入框。
- 验证码、密码和金额场景可与 `lk-code-input`、`lk-input` 或业务展示卡组合。
- 自定义品牌色时同时设置面板与文字变量，并保持足够对比度。

## 发布验收

发布前应在 H5、App 和目标小程序检查数字、身份证、车牌和自定义布局，并覆盖遮罩关闭、确认关闭、删除、暗色主题和底部安全区。
