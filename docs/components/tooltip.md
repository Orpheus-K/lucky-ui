---
title: Tooltip 文字提示
phone: tooltip
---

# Tooltip 文字提示

用于围绕一个触发元素显示轻量提示信息，支持 `hover`、`click`、手动控制和自定义内容。默认 `hover` 在桌面细指针设备上使用悬停，在 H5 触屏和微信小程序上自动回退为轻点切换。

## 基础用法

```vue
<lk-tooltip content="提示内容">
  <lk-button>悬停或轻点</lk-button>
</lk-tooltip>
```

## 点击触发

```vue
<lk-tooltip content="点击触发" trigger="click">
  <lk-button>点击看看</lk-button>
</lk-tooltip>
```

## 自定义内容

```vue
<lk-tooltip trigger="click">
  <lk-button>自定义内容</lk-button>
  <template #content>
    <view style="display:flex;align-items:center;gap:12rpx">
      <view style="flex:0 0 20rpx;width:20rpx;height:20rpx;border-radius:50%;background:#16a34a" />
      <text style="min-width:0;white-space:normal">支持复杂内容</text>
    </view>
  </template>
</lk-tooltip>
```

## 位置与宽度

```vue
<template>
  <lk-tooltip content="Top" placement="top"><lk-button>Top</lk-button></lk-tooltip>
  <lk-tooltip content="Bottom" placement="bottom" :width="260"
    ><lk-button>Bottom</lk-button></lk-tooltip
  >
</template>
```

## 手动控制与常驻显示

```vue
<script setup lang="ts">
import { ref } from 'vue';

const open = ref(false);
</script>

<template>
  <lk-tooltip :model-value="open" trigger="manual" content="手动控制">
    <lk-button @click="open = !open">切换</lk-button>
  </lk-tooltip>

  <lk-tooltip content="我会一直显示" always>
    <lk-button>常驻</lk-button>
  </lk-tooltip>
</template>
```

## 交互与受控状态语义

- `hover`：桌面细指针使用进入/离开；H5 触屏和微信小程序使用轻点切换，默认配置在移动端同样可达。
- `click`：只在触发区域轻点时切换。自定义内容区域会停止向触发区冒泡，内容按钮、链接或其他操作不会意外关闭 Tooltip。
- `manual`：组件不自行切换，由业务更新 `modelValue`。组件没有跨端全局“点击外部关闭”监听；需要该行为时请在业务层控制 `modelValue`。
- `update:modelValue` 表示组件提出的状态请求；`show/open` 与 `hide/close` 只在解析后的可见状态真正发生边沿变化时触发。受控父级拒绝请求时不会伪造生命周期事件。
- `disabled` 优先于 `always`、受控值和内部值。切换为禁用会清除显示/隐藏延时并立即隐藏；非常驻状态还会请求 `update:modelValue(false)`。受控用法应接受该更新，避免解除禁用后因旧的 `true` 再次显示。
- `always` 与 `disabled` 同时存在时，禁用只临时遮蔽常驻内容，不发送 `update:modelValue`；解除禁用后内容恢复，并产生新的真实显示边沿。

同步接受状态请求时，打开事件顺序为 `update:modelValue → show → open`，关闭顺序为 `update:modelValue → hide → close`；每个真实可见边沿各触发一次。

## 动画配置

`animation` 用于选择动画预设；`animationType` 用于直接指定内置动画类型，完整列表见 [Animation 动画](./animation)。

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import TooltipDemo from '@/pages_sub/components/demos/tooltip-demo.vue';
</script>

<template>
  <TooltipDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-tooltip />
  </view>
</template>
```

## API

### Props

| 参数          | 说明                                     | 类型                                                   | 默认值           |
| ------------- | ---------------------------------------- | ------------------------------------------------------ | ---------------- |
| content       | 提示文本                                 | `string`                                               | `''`             |
| zIndex        | 层级                                     | `number`                                               | `600`            |
| trigger       | 触发方式；`hover` 在触屏端回退为轻点切换 | `hover \| click \| manual`                             | `hover`          |
| placement     | 展示位置                                 | `top \| bottom \| left \| right`                       | `top`            |
| modelValue    | 手动控制显示状态                         | `boolean`                                              | `undefined`      |
| disabled      | 是否禁用                                 | `boolean`                                              | `false`          |
| always        | 是否常驻显示                             | `boolean`                                              | `false`          |
| defaultOpen   | 初次挂载时是否默认展开一次               | `boolean`                                              | `false`          |
| offset        | 与触发元素的间距（rpx）                  | `number`                                               | `8`              |
| width         | 浮层宽度                                 | `number \| string`                                     | `undefined`      |
| showDelay     | 显示延时（ms）                           | `number`                                               | `80`             |
| hideDelay     | 隐藏延时（ms）                           | `number`                                               | `80`             |
| animation     | 动画预设名称                             | `keyof ANIMATION_PRESETS`                              | `undefined`      |
| animationType | 内置动画类型，支持全部 `TransitionName`  | [`TransitionConfig['name']`](./animation#内置动画类型) | `undefined`      |
| duration      | 动画持续时间                             | `number`                                               | `220`            |
| delay         | 动画延迟                                 | `number`                                               | `0`              |
| easing        | 缓动函数                                 | `TransitionConfig['easing']`                           | `ease-out-cubic` |
| id            | 根节点 id                                | `string`                                               | `''`             |
| customClass   | 根节点自定义类名                         | `string \| object \| array`                            | —                |
| customStyle   | 根节点自定义样式                         | `string \| object`                                     | —                |

### Events

| 事件名             | 说明                                       | 参数                                |
| ------------------ | ------------------------------------------ | ----------------------------------- |
| update:modelValue  | 请求父级更新显示状态                       | `(value: boolean) => void`          |
| show               | 解析后的状态真正变为显示时触发             | `({ trigger, event }) => void`      |
| hide               | 解析后的状态真正变为隐藏时触发             | `({ trigger, event }) => void`      |
| open               | 与 `show` 同一真实显示边沿触发的语义化别名 | `({ trigger, event }) => void`      |
| close              | 与 `hide` 同一真实隐藏边沿触发的语义化别名 | `({ trigger, event }) => void`      |
| click-trigger      | 点击触发区域时触发                         | `(event?: Event) => void`           |
| mouseenter-trigger | 鼠标进入触发区域时触发                     | `(event?: Event) => void`           |
| mouseleave-trigger | 鼠标离开触发区域时触发                     | `(event?: Event) => void`           |
| mouseenter-content | 鼠标进入提示内容时触发                     | `(event?: Event) => void`           |
| mouseleave-content | 鼠标离开提示内容时触发                     | `(event?: Event) => void`           |
| placement-change   | 自动修正展示位置时触发                     | `(placement, oldPlacement) => void` |
| after-enter        | 进入动画结束后触发                         | `() => void`                        |
| after-leave        | 离开动画结束后触发                         | `() => void`                        |

### Slots

| 插槽名  | 说明             |
| ------- | ---------------- |
| default | 触发器内容       |
| content | 自定义提示层内容 |

## 使用建议

::: tip
同一业务若同时面向桌面与触屏，可保留默认 `hover`：细指针悬停，触屏轻点。需要所有端都以轻点切换时显式设置 `trigger="click"`。
:::

## 发布验收

发布前必须在全新干净构建上分别抓取 H5 与微信小程序运行态，并按下面边界验收：

| 场景           | H5 与微信 Peekit 操作                                                                              | 客观通过条件                                                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 默认触屏可达   | 在触屏 viewport 轻点 `#tooltip-touch-demo .lk-tooltip__trigger`                                    | `.lk-tooltip__pop` 由 0 变 1；`#tooltip-touch-state` 为 `open=true`，事件严格为 `update:true > show > open`，无 console/runtime error |
| 内容点击隔离   | 打开 `#tooltip-content-demo`，轻点 `#tooltip-content-action`                                       | `#tooltip-content-state` 的 `contentTap` 恰增 1 且 `open=true`；浮层 rect 仍存在，没有 `update:false/hide/close`                      |
| 打开后禁用     | 轻点 `#tooltip-disable-trigger`，再轻点 `#tooltip-disable-toggle`，等待超过 `hideDelay + duration` | `#tooltip-disable-state` 为 `open=false；disabled=true`；事件尾部严格为 `update:false > hide > close`；浮层为 0，继续等待不回开       |
| 组件结构与样式 | 分别在 H5 页面作用域、微信组件 scope 查询触发区和浮层                                              | 触发区、浮层 rect 非零；浮层 computed `pointer-events=auto`，z-index 为配置值；无重复匹配、无溢出 viewport                            |

微信端必须在组件 scope 内查询内部节点；全局 selector 查不到自定义组件内部结构不能判为组件失败。构建成功、showcase `verified` 字段或只点击外层 stage 均不属于运行验收证据。

触屏回退必须使用真实 touch 输入或明确的 coarse-pointer 环境；在细指针环境中用普通 DOM `click()` 只能证明 click 路径，不能冒充触屏可达证据。

::: warning
Tooltip 的定位依赖触发器尺寸与页面边界，H5 与微信小程序可能存在测量时序差异；复杂浮层场景建议使用 `manual` 控制显示状态。
:::
