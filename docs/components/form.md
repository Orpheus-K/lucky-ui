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
import { reactive, ref } from 'vue';

const formRef = ref();

const form = reactive({
  username: '',
  phone: '',
});

const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  phone: [
    { required: true, message: '请输入手机号' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
  ],
};

async function submit() {
  try {
    await formRef.value?.validate();
  } catch (errors) {
    console.log(errors);
  }
}
</script>

<template>
  <lk-form ref="formRef" :model="form" :rules="rules" label-width="160rpx">
    <lk-form-item label="用户名" prop="username">
      <lk-input v-model="form.username" placeholder="请输入用户名" />
    </lk-form-item>

    <lk-form-item label="手机号" prop="phone">
      <lk-input v-model="form.phone" type="tel" placeholder="请输入手机号" />
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
      <lk-input v-model="form.username" />
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
        if (value !== model?.password) return '两次输入的密码不一致';
        return true;
      },
      trigger: ['blur', 'change'],
    },
  ],
};
</script>
```

## 表单方法

通过组件 `ref` 可以调用常用方法：

```vue
<script setup lang="ts">
import { ref } from 'vue';

const formRef = ref();

async function validateUsername() {
  await formRef.value?.validateField('username');
}

function resetUsername() {
  formRef.value?.resetFields(['username']);
}

function clearUsernameError() {
  formRef.value?.clearValidate(['username']);
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
import FormDemo from '@/pages_sub/components/demos/form-demo.vue';
</script>

<template>
  <FormDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<script setup lang="ts">
import { reactive } from 'vue';

const form = reactive({ name: '' });
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

## 字段状态与验证契约

- `lk-form-item` 的单一 `prop` 会被内部 `lk-input` / `lk-textarea` 自动继承；控件显式传入的 `prop` 优先。多字段 FormItem 必须在各控件上显式指定 `prop`，避免歧义。
- `resetFields()` 恢复 FormItem 注册时的初始快照，不按当前值类型清空。普通对象/数组（含循环引用）及 Date、RegExp、Map、Set 会被深拷贝；其他自定义类实例保留原身份，因此表单模型应优先使用 JSON-like 普通数据。Form 的 `model` 对象身份或 FormItem 的 `prop` 改变后，会以新字段当前值重建快照。
- `validate({ fields })` 只校验、更新并报告目标字段。`validate({ silent: true })` 仍 resolve/reject 校验结果，但只抑制验证状态、`validate` / `validate-field` 事件与滚动，不放宽结果的新鲜度要求。
- 所有命令式 `validate()` / `validateField()`（包括 `silent`）进行中若被新校验、输入、reset、clear、禁用或 model/prop/rules 切换取代，都会 reject `{ code: 'FORM_VALIDATION_SUPERSEDED' }`；该旧轮次不写状态、不发验证事件、不滚动。调用方必须把它当作“无有效结论”，不能继续提交。
- `field-change` / `field-blur` 后会先等待父 Form 状态交付，再决定是否启动自动验证；`validate-field` / `validate` 后也会跨 `nextTick` 保留本轮状态所有权。监听器交付 disabled、改模型、reset 或重入验证时，旧提交会回滚，命令式旧 Promise 按上条契约 reject。
- Input/Textarea 接受一次正常原生输入时，恰好触发一次 `change` 规则；失焦只触发 `blur` 规则。无匹配 trigger 时保留原验证状态。
- Form `disabled` 会合并到文档“表单控件”分类中的所有可编辑控件：Input、Textarea、Radio（单独/组）、Checkbox（单独/组）、SelectList、Switch、Stepper、Slider、Rate、Upload、Picker、Calendar、CalendarPicker、Keyboard、VerifyCode。禁用会同步阻断用户触发的值更新、业务交互与表单验证；已经开始但尚未提交的异步/手势/定时交互也会失效。Picker、CalendarPicker 与 Keyboard 的关闭/取消仍可用；Upload 会取消正在上传的任务并按 `uid` 恢复该文件上传前状态。组件公开的程序化方法不等同于用户交互，按各组件 API 契约执行。
- 只有 Input/Textarea 自动继承单字段 FormItem 的 `prop`（显式 `prop` 可覆盖）。Checkbox/Radio（单独或 Group）、Switch、Stepper、Slider、Rate 支持显式 `prop` / `validateEvent` 并可触发表单字段验证。SelectList、Upload、Picker、Calendar、CalendarPicker、Keyboard、VerifyCode 仅继承 Form disabled，不声明字段验证 API；合并 disabled 不会扩大既有验证范围。

### disabled 的公开事件边界

可编辑控件的多阶段交互在每个公开 proposal 或最终模型提交后都会等待一次 Vue `nextTick`，再读取真实父 `LkForm` 已交付的 `disabled`。监听器若在该事件中把 Form 设为 disabled，首个已经发出的最终 `update:modelValue` 不会被伪装成可撤回，但后续业务事件、表单验证、定时器和异步提交必须停止。同一调用栈内 `true → false`、且未被 Vue 交付给子组件的脉冲不属于可观察契约。关闭/取消链同样等待交付边沿并在组件卸载时停止，但不以 disabled 阻断关闭。

| 控件                             | 公开顺序（`→` 表示进入下一阶段前检查真实 Form 状态）                                                                                                                                                                             |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input                            | `update:modelValue → input → change（需要时）→ Form field-change`；`blur → change → Form field-blur`；compositionend 复用同一交互代际后进入输入链                                                                                |
| Textarea                         | `update:modelValue → input → Form field-change`；延迟的 `blur → change → Form field-blur`；compositionend 复用同一交互代际                                                                                                       |
| Checkbox / Radio（单独或 Group） | 子项 `click → update:modelValue → change → item-change（Group）→ Form field-change（显式 prop）`                                                                                                                                 |
| SelectList                       | `update:modelValue → change → select`                                                                                                                                                                                            |
| Switch                           | `click → before-change → beforeChange 回调 → update:modelValue → change → Form field-change`                                                                                                                                     |
| Stepper                          | 按钮：`before-change → beforeChange 回调 → update:modelValue → change → plus/minus → Form field-change`；输入框：`blur → before-change → beforeChange 回调 → update:modelValue → change → Form field-change`                     |
| Slider                           | 轨道点击：`update:modelValue → input → click → change → Form field-change`；拖拽：`update:modelValue/input → dragstart → change → Form field-change → dragend → drag-release`                                                    |
| Rate                             | `click → clear（需要时）→ update:modelValue → change → Form field-change`                                                                                                                                                        |
| Upload                           | `clickUpload/oversize/afterRead/retry/progress → 后续选择或上传阶段`；`update:modelValue → change`；`clickPreview → 原生 previewImage`。disabled 中止上传时只发修复性的 `update:modelValue`，不发 `change`，并关闭待确认删除弹窗 |
| Picker                           | `pick → 草稿归一化`；确认时 `update:modelValue → change → confirm → update:visible(false)`；取消时 `cancel → update:visible(false)`，disabled 时仍可关闭                                                                         |
| Calendar                         | 选择时 `update:modelValue → select → change`；翻页时 `update:viewDate → month/week/panel-change`                                                                                                                                 |
| CalendarPicker                   | `update:modelValue → change → reset/confirm → 关闭（若配置）`；`update:show → open/close`，disabled 时 close 仍可用                                                                                                              |
| Keyboard                         | `key-press → input/delete/confirm → update:modelValue 或关闭`；关闭时 `update:visible(false) → close`，disabled 时仍可关闭                                                                                                       |
| VerifyCode                       | `update:modelValue → finish`；`send/resend → 启动倒计时 → countdown-end`                                                                                                                                                         |

## Form 契约演练探针

组件 Demo 内置 `#form-contract-probe`，状态同时输出到 dataset 与 `#form-contract-probe-state`。输入控件只在 FormItem 声明 `prop`，用于验证继承链。以下步骤是 Peekit 的客观验收合同，不代表文档构建或单测已完成真实运行态验收。

### H5 Peekit

1. 打开 Form Demo，查询 `#form-contract-probe`、`#form-contract-probe-input .lk-input__inner`、`#form-contract-probe-textarea .lk-textarea__inner`；所有 rect 必须非零，console/page errors 必须为空。
2. 对 Input 派发一次原生 input（固定值 `x`）。`data-change-count` 与 `data-validation-count` 各增加 1，`#form-contract-probe-title-item` 为 `data-validation-status="error"`；不得出现第二次 change 验证。
3. 点击 `#form-contract-probe-silent`。结果为 `data-silent-result="rejected"`、`data-silent-event-delta="0"`，title item 的状态和消息与点击前完全一致。
4. 编辑两字段后点击 `#form-contract-probe-reset`。`data-title="Initial title"`、`data-notes="Initial notes"`，reset 计数只增加 1，两项状态均回到 `idle`。
5. 输入固定值 `pending-invalid` 后立即点击 reset；等待至少 800ms。`data-async-started="1"` 与 `data-async-settled="1"` 证明旧异步规则确实完成，但 title 仍为初始值、item 仍为 `idle`，`data-validation-count` 不得因旧结果增加。
6. 基础控件必须先做启用态正向对照，不能点击没有 handler 的组件根来证明禁用。依次操作：`#form-contract-probe-checkbox-action`、`#form-contract-probe-radio-action`、`#form-contract-probe-switch`、`#form-contract-probe-stepper .lk-stepper__plus`、`#form-contract-probe-slider .lk-slider__track-container`（在非零 rect 的 75% 横坐标点击）、`#form-contract-probe-rate .lk-rate__item` 查询结果的固定索引 1、`#form-contract-probe-select .lk-select-list__item` 查询结果的固定索引 1。启用态必须分别得到 checkbox=`['a']`、radio=`'b'`、switch=`true`、stepper=`2`、slider 大于 20、rate=`2`、select=`'b'`。随后点击 `#form-contract-probe-advanced-reset`，确认七项精确恢复为 `[]/'a'/false/1/20/1/'a'`；再点击 `#form-contract-probe-disable`，对同一目标、同一坐标或固定索引重放动作，七项值与输入/验证计数必须全部不变。Input/Textarea 的启用态正向对照沿用第 2 步，禁用后也要对同一原生节点重放固定输入并确认值、事件与验证计数不变。
7. 下面 6 组复杂交互也集中在同一个 Form Demo。每组开始前点击 `#form-contract-probe-advanced-reset`，并确认 `data-disabled="false"`：
   - Upload：点击 `#form-contract-probe-upload-start` 后，`#form-contract-probe-upload-state` 必须为 `data-status="uploading"`；记录 `data-change-count`，点击总开关 disable，再点击 `#form-contract-probe-upload-stale-success`。最终必须恢复 `data-status="fail"`、`data-progress="20"`、`data-success-count="0"`，且禁用清理不能增加 `data-change-count`；旧成功回调不得改写状态。
   - Picker：点击 `#form-contract-probe-picker-open`，确认 `data-visible="true"` 后点击遮罩之上的 `#form-contract-probe-overlay-disable`。点击 `#form-contract-probe-picker .lk-picker__item` 的第二项及 `.lk-picker__btn--confirm`，`data-value="a"`、pick/confirm 计数均为 0；再点 `.lk-picker__btn--cancel`，必须 `data-visible="false"`、`data-cancel-count="1"`。
   - Calendar：disable 后点击 `#form-contract-probe-calendar [data-date="2026-08-14"]`；`#form-contract-probe-calendar-state` 必须保持 `data-value="2026-08-13"`、`data-change-count="0"`。
   - CalendarPicker：先点 `#form-contract-probe-calendar-picker-open`，确认 `data-show="true"` 后点击 `#form-contract-probe-overlay-disable`；只在 `#form-contract-probe-calendar-picker` 根内点击 `[data-date="2026-08-14"]`、`.lk-calendar-picker__footer .lk-button` 与 `.lk-calendar-picker__close`，不得使用页面级裸 `[data-date]`。value 仍为 `2026-08-13` 且 change/confirm 均为 0；关闭后必须 `data-show="false"`、`data-close-count="1"`。
   - Keyboard：先点 `#form-contract-probe-keyboard-open`，确认 `data-visible="true"` 后点击 `#form-contract-probe-overlay-disable`；点击 `#form-contract-probe-keyboard [data-key="1"]` 与 `.lk-keyboard__done`，value 仍为空且 input/confirm 均为 0；点击 `.lk-keyboard__close` 后必须 `data-visible="false"`、`data-close-count="1"`。
   - VerifyCode：点击 `#form-contract-probe-verify .lk-verify-code__countdown-btn`，确认 `data-send-count="1"` 后立即 disable；等待至少 1200ms，`#form-contract-probe-verify-state` 必须保持 `data-countdown-end-count="0"`、value 为空。
8. 每个单节点 selector 在执行前必须断言只解析到 1 个非零 rect。Rate 的 `.lk-rate__item` 必须恰好 5 个、SelectList 的 `.lk-select-list__item` 必须恰好 2 个，再读取约定的固定索引及其非零 rect；数量、索引或尺寸不符即失败。每一步都同时读取对应 state dataset 与 `#form-contract-probe-state` 的结构化 JSON，并保存动作前/动作后/旧回调等待后的截图与 console/page errors。当前文档只定义验收合同；未保存这些真实证据前不得标记 H5 通过。

### 微信小程序 Peekit

1. 在同一 Demo route 查询上述稳定 id 及其原生 `input` / `textarea` 节点，记录 WXML、properties、dataset、rect 与错误日志。
2. 用一次 `{ detail: { value: 'x' } }` 原生 input 事件执行第 2 步；事件计数、错误状态和单次触发约束必须与 H5 一致。
3. 依次复验 silent、reset 与 `pending-invalid → 立即 reset → 等待旧异步完成`，再 tap disable；禁用后 Input/Textarea 原生节点 `disabled=true`，其余控件 `aria-disabled=true` 或呈现等价平台属性，状态 JSON 与计数不变。
4. 不得把 H5 的复合 selector 直接用于页面 SelectorQuery。先从页面按稳定 id 精确取得 `lk-*` 自定义组件宿主（恰好 1 个且 rect 非零），再用该组件实例创建 `createSelectorQuery().in(component)` 查询它的内部目标；CalendarPicker 还需先进入其 `lk-calendar` 子组件实例，再在该实例内查询 `[data-date="2026-08-14"]`。Picker、Keyboard 同理在各自宿主实例内查询 item/button/key；关闭/取消必须在所属组件实例内真实 tap，不能只看属性。每一层宿主与最终目标都必须分别断言恰好 1 个非零 rect，无法取得组件实例或跨层 scope 即判失败，不得以页面级裸 selector 代替。
5. H5 与微信证据需分别保存动作前后快照；只有两端均满足数值断言且 errors 为空，才可标记通过。构建成功不能替代该证据。

## API

### Form Props

| 参数             | 说明                                       | 类型                                                                                   | 可选值               | 默认值      |
| ---------------- | ------------------------------------------ | -------------------------------------------------------------------------------------- | -------------------- | ----------- |
| model            | 表单数据对象，必填                         | `Record<string, unknown>`                                                              | —                    | —           |
| rules            | 表单校验规则                               | `FormRules`                                                                            | —                    | `undefined` |
| labelWidth       | 默认标签宽度，支持数字或带单位字符串       | `string / number`                                                                      | —                    | `''`        |
| labelAlign       | 默认标签对齐方式                           | `string`                                                                               | `left / right / top` | `left`      |
| showMessage      | 是否显示错误提示文本                       | `boolean`                                                                              | —                    | `true`      |
| scrollToError    | 校验失败时是否自动滚动到第一个错误字段     | `boolean`                                                                              | —                    | `false`     |
| disabled         | 是否禁用表单内控件的业务状态传递           | `boolean`                                                                              | —                    | `false`     |
| border           | 是否显示单元格边框                         | `boolean`                                                                              | —                    | `false`     |
| card             | 是否为圆角卡片布局                         | `boolean`                                                                              | —                    | `false`     |
| customValidator  | 整表自定义校验器，返回字段到错误信息的映射 | `(model) => Record<string, string> \| null \| Promise<Record<string, string> \| null>` | —                    | `undefined` |
| asteriskPosition | 必填星号默认位置                           | `string`                                                                               | `left / right`       | `left`      |
| id               | 根节点 id                                  | `string`                                                                               | —                    | `''`        |
| customClass      | 自定义类名                                 | `string / object / array`                                                              | —                    | `''`        |
| customStyle      | 自定义样式                                 | `string / object`                                                                      | —                    | `''`        |

### Form Events

| 事件名         | 说明                                       | 回调参数                                                       |
| -------------- | ------------------------------------------ | -------------------------------------------------------------- |
| validate       | 调用 `validate()` 后触发，表示整体验证结果 | `(ok: boolean, errors: ValidateError[] \| null)`               |
| validate-field | 单个字段完成校验后触发                     | `(prop: string, ok: boolean, errors: ValidateError[] \| null)` |
| field-blur     | 字段触发 blur 校验前触发                   | `(prop: string)`                                               |
| field-change   | 字段触发 change 校验前触发                 | `(prop: string, value?: unknown)`                              |
| reset          | 调用 `resetFields()` 后触发                | `(fields?: string[])`                                          |
| clear-validate | 调用 `clearValidate()` 后触发              | `(fields?: string[])`                                          |

### Form Methods

| 方法名          | 说明                                                                                 | 参数                                             |
| --------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------ |
| validate()      | 校验全部字段；失败 reject errors，被新状态取代时 reject `FORM_VALIDATION_SUPERSEDED` | `opts?: { fields?: string[]; silent?: boolean }` |
| validateField() | 校验单个字段；被新状态取代时同样 reject                                              | `(prop: string)`                                 |
| resetFields()   | 重置全部或指定字段的值与校验状态                                                     | `(fields?: string[])`                            |
| clearValidate() | 清除全部或指定字段的校验状态，不重置值                                               | `(fields?: string[])`                            |
| scrollToField() | 滚动到指定字段                                                                       | `(prop: string)`                                 |

### FormItem Props

| 参数             | 说明                                         | 类型                      | 可选值               | 默认值      |
| ---------------- | -------------------------------------------- | ------------------------- | -------------------- | ----------- |
| prop             | 对应 `model` 中的一个或多个字段名            | `string / string[]`       | —                    | `''`        |
| label            | 标签文本                                     | `string`                  | —                    | `''`        |
| required         | 是否强制显示必填星号；不传时根据规则自动推断 | `boolean`                 | —                    | `undefined` |
| labelWidth       | 当前项标签宽度，优先级高于 Form              | `string / number`         | —                    | `''`        |
| labelAlign       | 当前项标签对齐方式，优先级高于 Form          | `string`                  | `left / right / top` | `''`        |
| showMessage      | 当前项是否显示错误信息，优先级高于 Form      | `boolean`                 | —                    | `undefined` |
| isLink           | 是否显示右侧箭头，常用于选择器跳转场景       | `boolean`                 | —                    | `false`     |
| vertical         | 是否垂直布局，标签居上内容居下               | `boolean`                 | —                    | `false`     |
| asteriskPosition | 当前项必填星号位置，未传时继承 Form          | `string`                  | `'' / left / right`  | `''`        |
| border           | 是否显示当前项底部边框，未传时继承 Form      | `boolean`                 | —                    | `undefined` |
| id               | 根节点 id                                    | `string`                  | —                    | `''`        |
| customClass      | 自定义类名                                   | `string / object / array` | —                    | `''`        |
| customStyle      | 自定义样式                                   | `string / object`         | —                    | `''`        |

### FormItem Events

| 事件名 | 说明                  | 回调参数         |
| ------ | --------------------- | ---------------- |
| click  | 点击表单项时触发      | `(event: Event)` |
| tap    | UniApp `tap` 兼容事件 | `(event: Event)` |

### FormItem Slots

| 插槽名  | 说明           |
| ------- | -------------- |
| default | 表单控件内容   |
| label   | 自定义标签区域 |

### FormItem Methods

| 方法名          | 说明                                                                                | 参数                             |
| --------------- | ----------------------------------------------------------------------------------- | -------------------------------- |
| validate()      | 手动校验当前表单项；失败 reject `ValidateError[]`，被新状态取代时 resolve `'stale'` | `(trigger?: 'blur' \| 'change')` |
| resetField()    | 重置当前字段值并清除校验状态                                                        | —                                |
| clearValidate() | 清除当前字段校验状态                                                                | —                                |

### Rule 结构

| 字段      | 说明             | 类型                                                                      |
| --------- | ---------------- | ------------------------------------------------------------------------- |
| required  | 是否必填         | `boolean`                                                                 |
| message   | 失败提示文案     | `string`                                                                  |
| trigger   | 触发时机         | `'blur' \| 'change' \| Array<'blur' \| 'change'>`                         |
| min       | 最小长度或最小值 | `number`                                                                  |
| max       | 最大长度或最大值 | `number`                                                                  |
| pattern   | 正则校验         | `RegExp`                                                                  |
| validator | 自定义校验函数   | `(value, rule, model) => boolean \| string \| Promise<boolean \| string>` |

## 使用建议

::: tip
单字段 FormItem 内的 Input/Textarea 无需重复传 `prop`；`resetFields()` 始终恢复注册时初始值。需要清空业务数据时，请显式修改 model，不要把 reset 当作 clear。
:::
