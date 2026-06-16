---
title: Keyboard 虚拟键盘
phone: keyboard
---

# Keyboard 虚拟键盘

用于数字、身份证、车牌号等受控输入场景。适合金额输入、验证码输入、自定义业务输入面板等移动端交互。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const value = ref('')
const visible = ref(false)
</script>

<template>
  <lk-button @click="visible = true">打开数字键盘</lk-button>

  <lk-keyboard
    v-model:visible="visible"
    v-model="value"
    type="number"
  />
</template>
```

## 带小数点与随机排列

```vue
<lk-keyboard
  v-model:visible="visible"
  v-model="value"
  type="number"
  :show-dot="true"
  :random="true"
/>
```

## 身份证与车牌号键盘

```vue
<lk-keyboard v-model:visible="idVisible" v-model="idValue" type="idcard" :max-length="18" />

<lk-keyboard v-model:visible="plateVisible" v-model="plateValue" type="plate" />
```

`plate` 模式内置省份简称与字母数字切换逻辑，无需手动处理切面。

## 标题栏与确认按钮

```vue
<lk-keyboard
  v-model:visible="visible"
  v-model="value"
  title="输入金额"
  confirm-text="完成"
  :show-close="true"
  :show-confirm="true"
/>
```

## 自定义键盘布局

当 `type="custom"` 时，可通过 `keys` 传入二维按键数组。

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
]
</script>

<template>
  <lk-keyboard
    v-model:visible="visible"
    v-model="value"
    type="custom"
    :keys="keys"
  />
</template>
```

## 内部结构定制

根节点继续使用 `customClass/customStyle`。如果需要定制更细的结构，可以使用 `overlayClass/overlayStyle`、`headerClass/headerStyle`、`bodyClass/bodyStyle`、`rowClass/rowStyle` 和 `keyClass/keyStyle`。自定义 `keys` 中的单个 `KeyboardKey` 也支持 `className/style`，用于突出确认键、快捷键或禁用态。

```vue
<script setup lang="ts">
const keys = [
  [
    { text: 'A', value: 'A', className: 'key-accent' },
    { text: 'B', value: 'B' },
  ],
  [
    { text: 'VIP', value: 'VIP', flex: 2, style: { fontWeight: 700 } },
    { text: '删除', type: 'delete' },
  ],
]
</script>

<template>
  <lk-keyboard
    v-model:visible="visible"
    v-model="value"
    type="custom"
    :keys="keys"
    header-class="payment-keyboard-header"
    body-class="payment-keyboard-body"
    key-class="payment-key"
    :key-style="{ borderRadius: '16rpx' }"
  />
</template>
```

## 遮罩与关闭行为

```vue
<lk-keyboard
  v-model:visible="visible"
  v-model="value"
  overlay
  :close-on-overlay="true"
  :blur="true"
/>
```

## 键盘入口策略

`lk-keyboard` 是唯一公开键盘入口，覆盖数字、身份证、车牌和自定义布局。未发布前已移除重复数字键盘入口，避免用户在两个能力重复的组件之间做选择。

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import KeyboardDemo from '@/components/demos/keyboard-demo.vue'
</script>

<template>
  <KeyboardDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-keyboard />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customClass | 组件可视根节点自定义类名 | `string \| object \| array` | `''` |
| customStyle | 组件可视根节点自定义样式 | `string \| object` | `''` |
| visible | 是否显示，支持 `v-model:visible` | `boolean` | `false` |
| type | 键盘类型 | `number \| idcard \| plate \| custom` | `number` |
| title | 标题文字 | `string` | `''` |
| confirmText | 确认按钮文本 | `string` | `'完成'` |
| showConfirm | 是否显示确认按钮 | `boolean` | `true` |
| showDelete | 是否显示删除按钮 | `boolean` | `true` |
| showDot | 数字键盘是否显示小数点 | `boolean` | `false` |
| extraKey | 数字键盘左下角额外按键 | `string` | `''` |
| random | 是否随机排列数字键 | `boolean` | `false` |
| maxLength | 最大输入长度，`0` 表示不限制 | `number` | `0` |
| modelValue | 当前输入值，支持 `v-model` | `string` | `''` |
| overlay | 是否显示遮罩 | `boolean` | `false` |
| closeOnOverlay | 点击遮罩是否关闭 | `boolean` | `true` |
| blur | 是否启用毛玻璃效果 | `boolean` | `true` |
| showClose | 是否显示关闭入口 | `boolean` | `true` |
| zIndex | 层级 | `number` | `1000` |
| safeAreaInsetBottom | 是否适配底部安全区 | `boolean` | `true` |
| keys | 自定义键盘布局，仅 `custom` 模式使用 | `KeyboardKey[][]` | `[]` |
| sound | 是否启用按键音效 | `boolean` | `false` |
| vibrate | 是否启用触感反馈 | `boolean` | `true` |
| overlayClass | 遮罩层自定义类名 | `string \| object \| array` | `''` |
| overlayStyle | 遮罩层自定义样式 | `string \| object` | `''` |
| headerClass | 标题栏自定义类名 | `string \| object \| array` | `''` |
| headerStyle | 标题栏自定义样式 | `string \| object` | `''` |
| bodyClass | 键盘区域自定义类名 | `string \| object \| array` | `''` |
| bodyStyle | 键盘区域自定义样式 | `string \| object` | `''` |
| rowClass | 按键行自定义类名 | `string \| object \| array` | `''` |
| rowStyle | 按键行自定义样式 | `string \| object` | `''` |
| keyClass | 全局按键自定义类名 | `string \| object \| array` | `''` |
| keyStyle | 全局按键自定义样式 | `string \| object` | `''` |

### KeyboardKey

| 字段 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| text | 按键显示文本 | `string` | — |
| value | 点击后输出的值 | `string` | `undefined` |
| flex | 按键宽度比例 | `number` | `undefined` |
| type | 按键类型 | `default \| delete \| confirm \| extra \| empty` | `default` |
| disabled | 是否禁用 | `boolean` | `undefined` |
| className | 单个按键自定义类名 | `string \| object \| array` | `undefined` |
| style | 单个按键自定义样式 | `string \| object` | `undefined` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:visible | 键盘显隐变化 | `(visible: boolean)` |
| update:modelValue | 输入值变化 | `(value: string)` |
| input | 输入普通字符时触发 | `(key: string)` |
| delete | 点击删除键时触发 | `()` |
| confirm | 点击确认时触发 | `(value: string)` |
| close | 键盘关闭时触发 | `()` |
| key-press | 任意按键点击时触发 | `(key: KeyboardKey)` |

### Slots

当前版本未提供插槽。

## 使用建议

::: warning
`lk-keyboard` 本身只负责键盘输入，不会自动弹出系统输入框。推荐与受控展示区、验证码输入框、金额输入卡片等组件配合使用。
:::

::: tip
如果是纯验证码或密码输入，可将 `lk-keyboard` 与 `lk-code-input`、`lk-input` 组合使用，由业务层统一管理输入值。
:::

## 兼容说明

- 组件使用 fixed 底部浮层，存在安全区与软键盘遮挡差异；发布前需在 H5、App 与各小程序目标端确认底部间距。
- `blur` 毛玻璃效果依赖平台对 CSS filter/backdrop-filter 的支持；性能敏感场景建议关闭 `blur`。
- 车牌键盘和自定义键盘应由业务层限制输入格式，组件只负责按键输出。
- `overlayClass/headerClass/bodyClass/rowClass/keyClass` 位于子组件内部；父组件 scoped 样式覆盖这些类时需使用 `:deep()`。

## 发布验收

`lk-keyboard` 已纳入 needs-hardening showcase 回归，发布前按下面边界验收：

| 场景 | 验收方式 | 要点 |
|------|----------|------|
| 展示台基线 | 自动回归 | `tests/visual/needs-hardening-showcase.spec.ts` 校验组件路由、verified 状态与中风险标记 |
| 底部浮层 | 人工验收 | H5/App/小程序底部安全区、遮罩关闭和锁滚动无明显遮挡 |
| 输入链路 | 人工验收 | 数字、身份证、车牌、自定义键盘的 `input/delete/confirm` 事件顺序一致 |
