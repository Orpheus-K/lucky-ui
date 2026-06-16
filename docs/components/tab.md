---
title: Tab 标签页
phone: tab
---

# Tab 标签页

用于页面顶部或局部区域的平级内容切换。`lk-tab` 只负责标签导航与激活态，不内置内容面板；内容区可由 `v-if`、`swiper` 或业务状态自行承载。

## 怎么选

| 场景 | 推荐组件 |
|------|----------|
| 顶部频道、详情页分区、局部内容切换 | `lk-tab` |
| 少量胶囊式互斥切换 | [Segmented 分段器](./segmented) |
| 底部主导航 | [Tabbar 底部导航](./tabbar) |
| 单页底部多 Tab 主框架，带面板懒加载 | [Tabbar 容器](./tabbar-container) |

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const active = ref('overview')
const options = [
  { label: 'Overview', value: 'overview' },
  { label: 'Details', value: 'details' },
  { label: 'Reviews', value: 'reviews' },
]
</script>

<template>
  <lk-tab v-model="active" :options="options" />
</template>
```

## 块级等宽

`block` 会让每个 Tab 平分容器宽度，适合固定数量的页面分区。

```vue
<lk-tab v-model="active" :options="options" block />
```

## 横向滚动

选项较多时开启 `scrollable`，点击后激活项会尽量滚动到可视区域中间。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const active = ref('new')
const options = [
  { label: 'New In', value: 'new' },
  { label: 'Clothing', value: 'clothing' },
  { label: 'Shoes', value: 'shoes' },
  { label: 'Bags & Accessories', value: 'bags' },
  { label: 'Beauty & Grooming', value: 'beauty' },
]
</script>

<template>
  <lk-tab v-model="active" :options="options" scrollable />
</template>
```

## 与 Swiper 联动

使用 `v-model:active-index` 可以和 `swiper` 的 `current` 直接同步。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const activeIndex = ref(0)
const options = [
  { label: 'Collection', value: 'collection' },
  { label: 'Editorial', value: 'editorial' },
  { label: 'Campaign', value: 'campaign' },
]

function onSwiperChange(event: { detail: { current: number } }) {
  activeIndex.value = event.detail.current
}
</script>

<template>
  <lk-tab v-model:active-index="activeIndex" :options="options" block />

  <swiper :current="activeIndex" @change="onSwiperChange">
    <swiper-item v-for="item in options" :key="item.value">
      <view>{{ item.label }}</view>
    </swiper-item>
  </swiper>
</template>
```

## 对齐方式

非 `block`、非 `scrollable` 时，`align` 控制未铺满容器的标签排列。

```vue
<lk-tab v-model="active" :options="options" align="left" />
<lk-tab v-model="active" :options="options" align="center" />
<lk-tab v-model="active" :options="options" align="right" />
```

## 徽标、副标题与禁用

`TabOption` 支持 `badge`、`badgeDot`、`subtitle` 和 `disabled`。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const active = ref('message')
const options = [
  { label: 'Messages', value: 'message', badge: 12 },
  { label: 'Notify', value: 'notify', badgeDot: true },
  { label: 'Archive', value: 'archive', subtitle: '03' },
  { label: 'Disabled', value: 'disabled', disabled: true },
]
</script>

<template>
  <lk-tab v-model="active" :options="options" block />
</template>
```

## 左右固定插槽

`left` / `right` 插槽固定在两侧，中间标签区仍可滚动。

```vue
<lk-tab v-model="active" :options="options" scrollable>
  <template #left>
    <lk-icon name="search" size="36rpx" />
  </template>

  <template #right>
    <lk-icon name="funnel" size="36rpx" />
  </template>
</lk-tab>
```

## 自定义标签内容

`item` 插槽可完全接管单个标签项的内容渲染。

```vue
<lk-tab v-model="active" :options="options">
  <template #item="{ option, active, index }">
    <view style="display:flex;align-items:center;gap:8rpx">
      <text>{{ index + 1 }}</text>
      <text :style="{ fontWeight: active ? 700 : 400 }">{{ option.label }}</text>
    </view>
  </template>
</lk-tab>
```

## 下划线样式

通过 `underlineWidth`、`underlineHeight` 和 `showSlider` 调整滑块表现。

```vue
<lk-tab
  v-model="active"
  :options="options"
  block
  underline-width="48rpx"
  underline-height="4rpx"
/>

<lk-tab v-model="active" :options="options" :show-slider="false" />
```

## 推荐示例

### 1. 直接复用项目 Demo

```vue
<script setup lang="ts">
import TabDemo from '@/components/demos/tab-demo.vue'
</script>

<template>
  <TabDemo />
</template>
```

### 2. 业务页内组合内容面板

```vue
<template>
  <lk-tab v-model="active" :options="options" block />

  <view v-if="active === 'overview'">概览内容</view>
  <view v-else-if="active === 'details'">详情内容</view>
  <view v-else>评价内容</view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 当前激活值，支持 `v-model` | `string \| number` | `''` |
| activeIndex | 当前激活索引，支持 `v-model:active-index` | `number` | `0` |
| options | 标签选项列表 | `TabOption[]` | `[]` |
| size | 尺寸 | `sm \| md \| lg` | `md` |
| block | 是否等宽铺满父容器 | `boolean` | `false` |
| scrollable | 是否横向滚动 | `boolean` | `false` |
| animated | 是否开启动画 | `boolean` | `true` |
| duration | 滑块动画时长，单位 ms | `number` | `280` |
| easing | 滑块动画缓动函数 | `string` | `'cubic-bezier(0.16, 1, 0.3, 1)'` |
| uppercase | 是否将标签文案转为大写 | `boolean` | `true` |
| letterSpacing | 标签字间距 | `string` | `'0.06em'` |
| underlineWidth | 下划线宽度，`auto` 表示跟随激活项宽度 | `string` | `'auto'` |
| underlineHeight | 下划线高度 | `string` | `'3rpx'` |
| showSlider | 是否显示下划线滑块 | `boolean` | `true` |
| align | 对齐方式，非 `block` 且非 `scrollable` 时生效 | `left \| center \| right` | `center` |
| border | 是否显示底部分割线 | `boolean` | `true` |
| id | 根节点 id | `string` | `''` |
| customClass | 根节点自定义类名 | `string \| object \| array` | `''` |
| customStyle | 根节点自定义样式 | `string \| object` | `''` |

### TabOption

| 字段 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| label | 标签文案 | `string` | — |
| value | 标签值 | `string \| number` | — |
| disabled | 是否禁用 | `boolean` | `undefined` |
| badge | 徽标内容 | `string \| number` | `undefined` |
| badgeDot | 是否显示红点徽标 | `boolean` | `undefined` |
| subtitle | 副标题/序号文案 | `string` | `undefined` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 激活值变化时触发 | `(value)` |
| update:activeIndex | 激活索引变化时触发 | `(index)` |
| change | 选择值变化后触发 | `(value, option, oldValue)` |
| click | 点击任意标签时触发 | `({ value, option, event })` |
| select | 选择值发生变化时触发 | `({ value, option, oldValue })` |
| reselect | 点击当前已选标签时触发 | `({ value, option, event })` |
| click-disabled | 点击禁用标签时触发 | `({ value, option, event })` |

### Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|------------|
| left | 左侧固定内容 | — |
| right | 右侧固定内容 | — |
| item | 自定义标签项内容 | `{ option, active, index }` |

## 主题定制

通过 CSS 变量覆盖视觉样式：

| CSS 变量 | 说明 | 默认值 |
|----------|------|--------|
| `--lk-tab-bg` | 根节点背景 | `transparent` |
| `--lk-tab-border-color` | 底部分割线颜色 | `var(--lk-border-secondary, #e8eaed)` |
| `--lk-tab-text-color` | 未激活文字颜色 | `var(--lk-text-secondary, #909399)` |
| `--lk-tab-text-active-color` | 激活文字颜色 | `var(--lk-text-primary, #090909)` |
| `--lk-tab-slider-bg` | 下划线颜色 | `var(--lk-color-primary, #6965db)` |
| `--lk-tab-letter-spacing` | 标签字间距 | `0.06em` |
| `--lk-tab-underline-width` | 下划线宽度 | `100%` |
| `--lk-tab-underline-height` | 下划线高度 | `3rpx` |
| `--lk-tab-duration` | 动画时长 | `280ms` |
| `--lk-tab-easing` | 动画缓动函数 | `cubic-bezier(0.25, 1, 0.5, 1)` |

```vue
<lk-tab
  v-model="active"
  :options="options"
  block
  style="
    --lk-tab-text-color: #8c8c8c;
    --lk-tab-text-active-color: #111111;
    --lk-tab-slider-bg: #111111;
    --lk-tab-border-color: #eaeaea;
  "
/>
```

## 使用建议

::: tip
`lk-tab` 不管理内容面板。需要手势滑动时，用 `v-model:active-index` 连接 `swiper`；只需要普通内容切换时，用 `v-model` 管理业务状态即可。
:::

::: warning
禁用项仍会触发 `click` 与 `click-disabled`，但不会触发选中态变化。
:::
