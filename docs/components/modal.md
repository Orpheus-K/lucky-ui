---
title: Modal 模态框
phone: modal
---

# Modal 模态框

带遮罩的对话框，适用于重要信息确认、表单填写等需要打断用户流程的场景。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue';
const show = ref(false);
</script>

<template>
  <lk-button @click="show = true">打开模态框</lk-button>

  <lk-modal v-model="show" title="提示">
    <view>这是弹框内容，请确认操作。</view>
    <template #footer>
      <lk-button variant="text" @click="show = false">取消</lk-button>
      <lk-button @click="show = false">确认</lk-button>
    </template>
  </lk-modal>
</template>
```

## 确认对话框

```vue
<script setup lang="ts">
import { ref } from 'vue';
const show = ref(false);

function onConfirm() {
  show.value = false;
  // 执行删除逻辑...
}
</script>

<template>
  <lk-button type="danger" variant="outline" @click="show = true">删除账号</lk-button>

  <lk-modal v-model="show" title="确认删除">
    <view style="text-align:center; padding: 16rpx 0">
      <lk-icon name="exclamation-triangle-fill" color="#ef4444" :size="48" />
      <view style="margin-top:16rpx">此操作不可撤销，确定要删除账号吗？</view>
    </view>
    <template #footer>
      <lk-button block variant="outline" @click="show = false">取消</lk-button>
      <lk-button block type="danger" @click="onConfirm">确认删除</lk-button>
    </template>
  </lk-modal>
</template>
```

## 无头部弹框

```vue
<script setup lang="ts">
import { ref } from 'vue';
const show = ref(false);
</script>

<template>
  <lk-button @click="show = true">纯内容弹框</lk-button>

  <lk-modal v-model="show" :show-header="false" :show-footer="false">
    <view style="padding:48rpx; text-align:center">
      <lk-icon name="check-circle-fill" color="#22c55e" :size="64" />
      <view style="font-size:36rpx; font-weight:600; margin-top:24rpx">支付成功！</view>
      <view style="color:#64748b; margin-top:8rpx">金额 ¥128.00 已到账</view>
      <lk-button block style="margin-top:48rpx" @click="show = false">我知道了</lk-button>
    </view>
  </lk-modal>
</template>
```

## 表单弹框

```vue
<script setup lang="ts">
import { ref } from 'vue';
const show = ref(false);
const form = ref({ name: '', phone: '' });
</script>

<template>
  <lk-button @click="show = true">填写信息</lk-button>

  <lk-modal v-model="show" title="完善资料" width="640rpx">
    <lk-form :model="form" style="padding:0">
      <lk-form-item label="姓名">
        <lk-input v-model="form.name" placeholder="请输入真实姓名" />
      </lk-form-item>
      <lk-form-item label="手机">
        <lk-input v-model="form.phone" type="tel" placeholder="请输入手机号" />
      </lk-form-item>
    </lk-form>
    <template #footer>
      <lk-button variant="text" @click="show = false">取消</lk-button>
      <lk-button @click="show = false">保存</lk-button>
    </template>
  </lk-modal>
</template>
```

## 异步确认

默认确认按钮需要等待接口、校验或权限判断时，把异步工作放在 `beforeConfirm` 中。返回 `true` 后组件按 `confirm > update:modelValue(false)` 的顺序完成一次确认；返回 `false` 或 Promise reject 时保持打开，也不会触发 `confirm`。

等待期间确认按钮显示 loading，默认确认、取消、右上角关闭与遮罩关闭入口都会禁用，避免重复任务和竞态关闭。

```vue
<script setup lang="ts">
import { ref } from 'vue';

const show = ref(false);

async function beforeConfirm() {
  const saved = await saveProfile();
  return saved;
}

function onConfirm() {
  uni.showToast({ title: '保存成功' });
}
</script>

<template>
  <lk-modal v-model="show" title="保存资料" :before-confirm="beforeConfirm" @confirm="onConfirm">
    <view>确认保存当前资料吗？</view>
  </lk-modal>
</template>
```

`beforeConfirm` 只管理组件默认 footer 的确认动作。使用自定义 `footer` 插槽时，loading、禁用与关闭时机仍由插槽调用方管理。

## 动画类型

`animation` 用于选择动画预设；`animationType` 用于直接指定内置动画类型，完整列表见 [Animation 动画](./animation)。

```vue
<template>
  <view class="demo-row">
    <lk-button @click="show1 = true">缩放（默认）</lk-button>
    <lk-button @click="show2 = true">从下方滑入</lk-button>
    <lk-button @click="show3 = true">渐显</lk-button>
  </view>

  <lk-modal v-model="show1" animation="scale" title="缩放动画">内容</lk-modal>
  <lk-modal v-model="show2" animation-type="slide-up" title="滑入动画">内容</lk-modal>
  <lk-modal v-model="show3" animation-type="fade" title="渐显动画">内容</lk-modal>
</template>
```

## API

### Props

| 参数           | 说明                                              | 类型                                                   | 默认值      |
| -------------- | ------------------------------------------------- | ------------------------------------------------------ | ----------- |
| customClass    | 组件可视根节点自定义类名                          | `string \| object \| array`                            | `''`        |
| customStyle    | 组件可视根节点自定义样式                          | `string \| object`                                     | `''`        |
| modelValue     | 是否显示（v-model）                               | `boolean`                                              | `false`     |
| zIndex         | 层级                                              | `number`                                               | `1500`      |
| title          | 标题文字                                          | `string`                                               | `''`        |
| width          | 弹框宽度                                          | `string`                                               | `600rpx`    |
| showClose      | 显示右上角关闭按钮                                | `boolean`                                              | `true`      |
| closeOnOverlay | 点击遮罩关闭                                      | `boolean`                                              | `true`      |
| showHeader     | 是否显示标题栏                                    | `boolean`                                              | `true`      |
| showFooter     | 是否显示底部区域                                  | `boolean`                                              | `true`      |
| confirmText    | 默认确认按钮文字                                  | `string`                                               | `确定`      |
| beforeConfirm  | 默认确认前拦截；返回 `false` 或 reject 时保持打开 | `() => boolean \| Promise<boolean>`                    | —           |
| cancelText     | 默认取消按钮文字                                  | `string`                                               | `取消`      |
| animation      | 动画预设名称                                      | `keyof ANIMATION_PRESETS`                              | `scale`     |
| animationType  | 内置动画类型，支持全部 `TransitionName`           | [`TransitionConfig['name']`](./animation#内置动画类型) | `undefined` |
| duration       | 动画持续时间                                      | `number`                                               | `undefined` |
| delay          | 动画延迟                                          | `number`                                               | `undefined` |
| easing         | 动画缓动函数                                      | `TransitionConfig['easing']`                           | `undefined` |

### Events

| 事件名            | 说明                                    | 回调参数             |
| ----------------- | --------------------------------------- | -------------------- |
| update:modelValue | 显示状态变化                            | `(visible: boolean)` |
| open              | 入场动画结束后触发                      | `()`                 |
| close             | 离场动画结束后触发                      | `()`                 |
| confirm           | 默认确认动作通过 `beforeConfirm` 后触发 | `()`                 |
| cancel            | 点击默认取消按钮时触发                  | `()`                 |
| click-overlay     | 点击遮罩时触发                          | `()`                 |
| click-close       | 点击右上角关闭按钮时触发                | `()`                 |
| after-enter       | 入场动画结束后触发                      | `()`                 |
| after-leave       | 离场动画结束后触发                      | `()`                 |

::: warning
`confirm` 只由默认确认按钮触发；遮罩、右上角关闭按钮和取消按钮不会触发 `confirm`。
:::

### Slots

| 插槽名  | 说明                       |
| ------- | -------------------------- |
| default | 弹框主体内容               |
| header  | 自定义头部（会覆盖 title） |
| footer  | 自定义底部按钮区域         |

## 使用建议

::: tip
如果只需要一个自定义浮层容器，请用 `lk-popup`；如果需要标准对话框结构与默认操作按钮，请用 `lk-modal`。
:::

## 发布验收

发布前必须从全新构建进入 Modal Demo，分别执行 H5 与微信小程序 Peekit。下面是待执行的选择器、动作与客观通过条件；构建成功或源码单测不能替代这些运行态证据。

| 场景             | H5 Peekit selector / action                                                                                 | 微信 Peekit selector / action                                                                                       | 客观后置条件                                                                                                                                                                                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 遮罩不关闭       | 点击 `#modal-overlay-open-controlled-false`，再点击 `.lk-overlay`                                           | 在 Modal Demo scope 点击打开按钮；进入 Modal 的 Overlay 子组件 scope，对 `.lk-overlay` 执行一次 `tap`               | `.lk-modal__panel` 仍存在；`#modal-overlay-probe-visible` 为 `visible=true`；click 为 1、update 为 0                                                                                                                                                                                      |
| 遮罩受控关闭     | 点击 `#modal-overlay-open-controlled-true`，再点击 `.lk-overlay`，等待离场时长                              | 同一路径进入 Overlay scope 执行一次 `tap` 并等待离场                                                                | panel 由 1 变 0；visible 为 false；click、update 均严格为 1，lastUpdate 为 false                                                                                                                                                                                                          |
| 父级仅观察更新   | 点击 `#modal-overlay-open-observe-true`，再点击一次 `.lk-overlay`                                           | 在 Modal Demo scope 打开 observe 场景，再进入 Overlay scope `tap` 遮罩                                              | panel 保持存在且 visible 为 true；click、update 均严格为 1，证明单次关闭请求没有内部双发；最后点击 `#modal-overlay-force-close` 清场                                                                                                                                                      |
| 异步成功与防重   | 点击 `#modal-async-open-resolve`，对 `.lk-modal__confirm` 在 50ms 内点击两次；分别在 500ms、1200ms 读取状态 | 在 Modal Demo scope 打开 resolve 场景；进入 Modal scope 找到 `.lk-modal__confirm` 子组件，连续 `tap` 两次并分时读取 | 500ms 时 panel 含 `is-confirming`；H5 确认按钮或微信 LkButton scope 内 `.lk-button` 含 `is-loading`、`is-disabled` 且 disabled=true；hook=1、confirm=0、update=0；1200ms 后 visible=false，outcome=resolved，confirm=1、update=1，events 精确为 `before:resolve > confirm > update:false` |
| 异步失败         | 点击 `#modal-async-open-reject` 与 `.lk-modal__confirm`，等待 1200ms                                        | 在 Modal Demo scope 打开 reject 场景；进入 Modal scope `tap` 确认子组件并等待                                       | panel 仍存在，visible=true，outcome=rejected，hook=1、confirm=0、update=0；`is-confirming` 与按钮 loading/disabled 已移除，可再次操作                                                                                                                                                     |
| 过期结果竞态     | 打开 resolve 场景并点击确认，500ms 内点击 `#modal-async-race-reopen`，等待旧任务超过 1000ms                 | 同一顺序在 Modal scope 找到内部重开按钮子组件并 `tap`                                                               | 新实例状态保持 visible=true、mode=reject、outcome=idle；hook、confirm、update 均为 0，events=none，旧 Promise 不得关闭重开的 Modal                                                                                                                                                        |
| 取消与右上角防重 | 分别重新打开异步探针，对 `.lk-modal__cancel` 或 `.lk-modal__close` 在 50ms 内点击两次                       | 分别在 Modal scope 对取消按钮子组件或关闭图标连续两次 `tap`                                                         | 对应 cancel 或 closeClick 计数严格为 1，update 严格为 1；另一个业务计数与 confirm 均为 0                                                                                                                                                                                                  |

微信端先从 `PreviewDemoRenderer` 进入 `modal-demo` 自定义组件 scope，再按表格逐层进入 Modal、Overlay 或 LkButton scope。页面级全局 selector 无法穿透组件边界时不能判为失败；若自定义组件 `tap` 不稳定，可按 Peekit 规范调用对应组件事件方法后读取同一组状态。每个场景开始前都使用对应打开按钮重置计数，不跨场景复用旧状态。

::: warning
上述表格定义验收方法和通过条件，不表示当前构建已经完成 H5 或微信小程序运行态抓取。实际发布记录必须附本次构建的 selector 读数、事件文本和 console/runtime error 结果。
:::
