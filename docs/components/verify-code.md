---
title: VerifyCode 验证码输入框
phone: verify-code
---

# VerifyCode 验证码输入框

用于输入短信验证码、密码等场景，支持自动跳格、粘贴自动填充、倒计时发送等功能。

## 交互式调试

<PropsPlayground
  component="verify-code"
  :props-def="[
    { key: 'length', type: 'number', label: '位数', default: 6 },
    { key: 'type', type: 'enum', label: '输入类型', values: ['text', 'number'], default: 'number' },
    { key: 'variant', type: 'enum', label: '变体', values: ['box', 'underline', 'rounded'], default: 'box' },
    { key: 'mask', type: 'boolean', label: '密码模式', default: false },
    { key: 'disabled', type: 'boolean', label: '禁用', default: false },
    { key: 'showCursor', type: 'boolean', label: '光标', default: true },
  ]"
/>

## 基础用法

```vue
<template>
  <lk-verify-code v-model="code" @finish="onFinish" />
</template>

<script setup>
import { ref } from 'vue';

const code = ref('');

function onFinish(value) {
  console.log('输入完成:', value);
}
</script>
```

## 验证码长度

支持 4、6、8 位验证码长度。

```vue
<lk-verify-code v-model="code4" :length="4" />
<lk-verify-code v-model="code6" :length="6" />
<lk-verify-code v-model="code8" :length="8" />
```

## 样式变体

提供三种样式变体：方框 (box)、下划线 (underline)、圆角 (rounded)。

```vue
<lk-verify-code v-model="code" variant="box" />
<lk-verify-code v-model="code" variant="underline" />
<lk-verify-code v-model="code" variant="rounded" />
```

## 密码模式

使用 `mask` 属性将输入内容显示为圆点。

```vue
<lk-verify-code v-model="code" mask />
```

## 状态

通过 `status` 属性设置不同状态。

```vue
<!-- 错误状态 -->
<lk-verify-code v-model="code" status="error" error-message="验证码错误" />

<!-- 成功状态 -->
<lk-verify-code v-model="code" status="success" />

<!-- 禁用状态 -->
<lk-verify-code v-model="code" disabled />
```

## 倒计时发送

开启 `countdown` 属性显示发送验证码按钮和倒计时功能。

```vue
<template>
  <lk-verify-code
    v-model="code"
    countdown
    :countdown-duration="60"
    @send="onSend"
    @resend="onResend"
    @countdown-end="onCountdownEnd"
  />
</template>

<script setup>
function onSend() {
  // 发送验证码逻辑
}

function onResend() {
  // 重新发送验证码逻辑
}

function onCountdownEnd() {
  // 倒计时结束
}
</script>
```

## 自定义颜色

```vue
<lk-verify-code v-model="code" focus-color="#007AFF" error-color="#FF3B30" />
```

## 方法调用

通过 ref 调用组件方法。

```vue
<template>
  <lk-verify-code ref="verifyCodeRef" v-model="code" />
  <button @click="handleSetValue">设置值</button>
</template>

<script setup>
import { ref } from 'vue';

const verifyCodeRef = ref();
const code = ref('');

function handleSetValue() {
  // 设置验证码值（支持 SMS 自动填充）
  verifyCodeRef.value.setValue('123456');
}
</script>
```

## API

### Props

| 参数              | 说明             | 类型                                           | 默认值             |
| ----------------- | ---------------- | ---------------------------------------------- | ------------------ |
| customClass       | 组件可视根节点自定义类名 | `string \| object \| array`                    | `''`               |
| customStyle       | 组件可视根节点自定义样式 | `string \| object`                             | `''`               |
| v-model           | 绑定值           | `string`                                       | `''`               |
| length            | 验证码长度       | `4 \| 6 \| 8`                                  | `6`                |
| type              | 输入类型         | `'number' \| 'text'`                           | `'number'`         |
| variant           | 样式变体         | `'box' \| 'underline' \| 'rounded'`            | `'box'`            |
| mask              | 是否密码模式     | `boolean`                                      | `false`            |
| autofocus         | 是否自动聚焦     | `boolean`                                      | `true`             |
| disabled          | 是否禁用         | `boolean`                                      | `false`            |
| status            | 状态             | `'default' \| 'focus' \| 'error' \| 'success'` | `'default'`        |
| errorMessage      | 错误提示文字     | `string`                                       | `''`               |
| showCursor        | 是否显示光标     | `boolean`                                      | `true`             |
| countdown         | 是否开启倒计时   | `boolean`                                      | `false`            |
| countdownDuration | 倒计时时长（秒） | `number`                                       | `60`               |
| sendText          | 发送按钮文字     | `string`                                       | `'获取验证码'`     |
| resendText        | 重新发送按钮文字 | `string`                                       | `'重新获取'`       |
| countdownText     | 倒计时文字模板   | `string`                                       | `'{s}s后重新获取'` |
| gap               | 单元格间距 (rpx) | `number`                                       | `12`               |
| cellSize          | 单元格尺寸 (rpx) | `number`                                       | `96`               |
| fontSize          | 字体大小 (rpx)   | `number`                                       | `40`               |
| tips              | 提示文字         | `string`                                       | `''`               |
| focusColor        | 聚焦时边框颜色   | `string`                                       | `''`               |
| errorColor        | 错误时边框颜色   | `string`                                       | `''`               |

### Events

| 事件名            | 说明                   | 回调参数          |
| ----------------- | ---------------------- | ----------------- |
| update:modelValue | 值变化时触发           | `(value: string)` |
| finish            | 输入完成时触发         | `(value: string)` |
| send              | 点击发送按钮时触发     | -                 |
| resend            | 点击重新发送按钮时触发 | -                 |
| focus             | 聚焦时触发             | -                 |
| blur              | 失焦时触发             | -                 |
| countdownEnd      | 倒计时结束时触发       | -                 |

### Methods

| 方法名         | 说明                              | 参数             |
| -------------- | --------------------------------- | ---------------- |
| focus          | 使输入框聚焦                      | -                |
| blur           | 使输入框失焦                      | -                |
| clear          | 清空输入内容                      | -                |
| setValue       | 设置验证码值（支持 SMS 自动填充） | `(code: string)` |
| startCountdown | 开始倒计时                        | -                |
| stopCountdown  | 停止倒计时                        | -                |

## 主题定制

组件使用以下 CSS 变量，可通过修改主题变量来自定义样式：

```css
--lk-color-primary         /* 主色调 */
--lk-color-border          /* 边框颜色 */
--lk-text-primary            /* 文字颜色 */
--lk-text-secondary  /* 次要文字颜色 */
--lk-fill-tertiary   /* 填充色 */
--lk-radius-lg             /* 圆角大小 */
```

