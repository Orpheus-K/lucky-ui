---
title: Notice Bar 通知栏
phone: notice-bar
---

# Notice Bar 通知栏

用于展示系统公告、活动提醒、滚动消息等强调性文本，支持静态、横向滚动、竖向轮播三种展示方式。

## 交互式调试

<PropsPlayground
  component="notice-bar"
  :props-def="[
    { key: 'text', type: 'string', label: '通知内容', default: '这是一条通知信息' },
    { key: 'scrollable', type: 'boolean', label: '滚动', default: 'horizontal' },
    { key: 'closeable', type: 'boolean', label: '可关闭', default: false },
    { key: 'icon', type: 'string', label: '图标', default: '' },
    { key: 'noBackground', type: 'boolean', label: '无背景', default: false },
  ]"
/>

## 基础用法

```vue
<lk-notice-bar text="这是一条通知" scrollable="horizontal" />
```

## 横向滚动

当文案较长时，推荐开启横向滚动，并通过 `speed` 控制节奏。

```vue
<lk-notice-bar
  text="系统升级通知：今晚 22:00-23:00 将进行系统维护，请提前保存数据。"
  scrollable="horizontal"
  :speed="15"
/>
```

## 竖向轮播

用于多条通知逐条轮播展示。竖向模式优先读取 `messages`。
循环到补位的首条消息时，公开的 `click` 与 `message-change` 都使用真实首项
`{ index: 0, text: messages[0] }`；无缝归位仅额外触发一次 `loop-reset`，不会重复
触发 `message-change`。

```vue
<script setup lang="ts">
const messages = ['📢 您有新的订单待处理', '🎁 双11 活动即将开始', '⚠️ 请及时更新个人信息'];
</script>

<template>
  <lk-notice-bar scrollable="vertical" :messages="messages" :speed="3" />
</template>
```

## 可关闭

```vue
<lk-notice-bar text="这是一条可以关闭的通知" closeable @close="show = false" />
```

## 自定义左右区域

支持自定义左侧图标、右侧操作区与右侧图标区。

```vue
<lk-notice-bar text="点击右侧查看详情">
  <template #left-icon>
    <lk-icon name="info-circle-fill" size="32" />
  </template>

  <template #right>
    <view class="link-text">详情 ></view>
  </template>
</lk-notice-bar>
```

## 自定义颜色与无背景

```vue
<template>
  <lk-notice-bar text="自定义颜色消息" color="#ff6b6b" background="#ffe0e0" />
  <lk-notice-bar text="无背景通知" no-background scrollable="horizontal" />
</template>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import NoticeBarDemo from '@/pages_sub/components/demos/notice-bar-demo.vue';
</script>

<template>
  <NoticeBarDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-notice-bar />
  </view>
</template>
```

## API

### Props

| 参数         | 说明                                            | 类型                                    | 默认值                    |
| ------------ | ----------------------------------------------- | --------------------------------------- | ------------------------- |
| text         | 通知文本                                        | `string`                                | `''`                      |
| scrollable   | 滚动模式；`false` 不滚动，`true` 等价于横向滚动 | `boolean \| 'horizontal' \| 'vertical'` | `horizontal`              |
| speed        | 滚动速度或竖向轮播停留时长（秒）                | `number`                                | `10`                      |
| closeable    | 是否可关闭                                      | `boolean`                               | `false`                   |
| icon         | 左侧图标名                                      | `string`                                | `''`                      |
| color        | 文本颜色                                        | `string`                                | `var(--lk-color-warning)` |
| background   | 背景色                                          | `string`                                | `var(--lk-fill-1)`        |
| noBackground | 是否移除背景与默认文字色注入                    | `boolean`                               | `false`                   |
| messages     | 竖向滚动时的消息数组                            | `string[]`                              | `[]`                      |
| id           | 根节点 id                                       | `string`                                | `''`                      |
| customClass  | 根节点自定义类名                                | `string \| object \| array`             | —                         |
| customStyle  | 根节点自定义样式                                | `string \| object`                      | —                         |

### Events

| 事件名         | 说明                           | 参数                               |
| -------------- | ------------------------------ | ---------------------------------- |
| click          | 点击通知栏主体                 | `({ text, index, event }) => void` |
| close          | 点击关闭按钮                   | `(event?: Event) => void`          |
| message-change | 竖向轮播切换消息时触发         | `({ index, text }) => void`        |
| loop-reset     | 竖向轮播无缝重置到第一条时触发 | `() => void`                       |

### Slots

| 插槽名     | 说明                                    |
| ---------- | --------------------------------------- |
| default    | 自定义主体文本内容                      |
| left-icon  | 左侧图标区域                            |
| right      | 右侧完整操作区域                        |
| right-icon | 右侧图标区域；仅在未提供 `right` 时使用 |

## 使用建议

::: tip
单条长文案优先用横向滚动；多条消息优先用竖向轮播，这样阅读负担更低。
:::

::: warning
`speed` 在横向与竖向模式下都以秒为单位，但语义不同：横向是动画时长，竖向是每条停留时长。
:::

## Peekit 循环验收合同

Demo 提供 `#notice-bar-loop-fixture`、`#notice-bar-loop-probe`、
`#notice-bar-loop-state` 与 `#notice-bar-loop-reset`。探针固定使用 `['A', 'B']` 和
`speed=0.5`：

1. 重置后等待 500ms，`data-change-log` 只能新增 `{index:1,text:'B'}`。
2. 再等待 500ms 进入克隆首帧，在 300ms 归位窗口内点击
   `#notice-bar-loop-probe`；`data-change-log` 恰好新增一次 `{index:0,text:'A'}`，
   `data-click-log` 最后一项也必须是 `{index:0,text:'A'}`。
3. 归位前 `data-reset-count=0`，300ms 后恰好为 1，且 change 数量不再增加。
4. H5 和微信小程序都需读取上述 data 属性与真实事件；构建、WXML 文本或截图不能
   代替运行态事件验收。
