---
title: Virtual List 虚拟列表
phone: virtual-list
---

# Virtual List 虚拟列表

用于渲染超长列表，通过只渲染可视区域附近的数据来减少节点数量，显著提升滚动性能，适合消息列表、商品列表、日志流等场景。

## 基础用法

```vue
<script setup lang="ts">
const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, text: `列表项 ${i + 1}` }))
</script>

<template>
  <lk-virtual-list
    :items="items"
    :item-height="88"
    :height="600"
  >
    <template #default="{ items, start }">
      <view v-for="(item, i) in items" :key="item.id" style="height: 88px; display:flex; align-items:center; border-bottom:1px solid #eee">
        {{ start + i + 1 }}. {{ item.text }}
      </view>
    </template>
  </lk-virtual-list>
</template>
```

## 无限加载

```vue
<lk-virtual-list
  :items="list"
  :item-height="50"
  :height="400"
  :prefetch-rows="30"
  lower-threshold="120rpx"
  @prefetch="loadNextPage"
  @reach-bottom="loadNextPage"
/>
```

## 动态缓冲，减少快速滚动白屏

```vue
<lk-virtual-list
  :items="items"
  :item-height="100"
  :height="600"
  :buffer="6"
  :dynamic-overscan="true"
  :max-overscan-rows="24"
  :overscan-boost-factor="0.7"
/>
```

## 内部结构定制

`contentClass/contentStyle` 作用于虚拟列表内部可视内容容器；`itemClass/itemStyle` 不会强行包裹列表项，而是透传给默认插槽，方便业务行统一绑定样式。

```vue
<lk-virtual-list
  :items="items"
  :item-height="88"
  :height="600"
  content-class="message-list-window"
  item-class="message-row"
  :content-style="{ '--row-border-color': 'var(--lk-color-border-light)' }"
>
  <template #default="{ items, start, itemClass, itemStyle }">
    <view
      v-for="(item, i) in items"
      :key="item.id"
      :class="itemClass"
      :style="itemStyle"
    >
      {{ start + i + 1 }}. {{ item.text }}
    </view>
  </template>
</lk-virtual-list>
```

## 滚动控制

组件实例暴露了 `scrollToIndex()` 和 `scrollToTop()`，适合做“跳到某一条消息”“返回顶部”等场景。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const listRef = ref()

function jumpTo500() {
  listRef.value?.scrollToIndex?.(499)
}
</script>

<template>
  <lk-button @click="jumpTo500">跳到第 500 项</lk-button>
  <lk-virtual-list ref="listRef" :items="items" :item-height="88" :height="600" />
</template>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import VirtualListDemo from '@/components/demos/virtual-list-demo.vue'
</script>

<template>
  <VirtualListDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-virtual-list />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| items | 列表数据 | `Record<string, any>[]` | `[]` |
| itemHeight | 单项固定高度 | `number` | `100` |
| height | 列表容器高度 | `number` | `600` |
| buffer | 基础缓冲行数 | `number` | `5` |
| dynamicOverscan | 是否根据滚动速度动态增加缓冲 | `boolean` | `true` |
| maxOverscanRows | 最大额外缓冲行数 | `number` | `30` |
| overscanBoostFactor | 滚动速度到额外缓冲的增益系数 | `number` | `0.6` |
| lowerThreshold | 触底阈值 | `number \| string` | `'80rpx'` |
| prefetchRows | 距离尾部多少行时触发预取 | `number` | `0` |
| reserveRows | 额外保留的尾部占位行数 | `number` | `0` |
| positionStrategy | 渲染定位策略 | `transform \| absolute \| padding` | `transform` |
| initialScrollIndex | 初始滚动索引 | `number` | `0` |
| scrollWithAnimation | 设置滚动位置时是否启用动画 | `boolean` | `false` |
| scrollAnchoring | 是否启用滚动锚定 | `boolean` | `true` |
| enablePassive | 是否启用 passive 事件 | `boolean` | `true` |
| enhanced | 是否启用增强模式 | `boolean` | `true` |
| bounces | 是否启用回弹效果 | `boolean` | `false` |
| contentClass | 可视内容容器自定义类名 | `string \| object \| array` | `''` |
| contentStyle | 可视内容容器自定义样式 | `string \| object` | `''` |
| itemClass | 透传给默认插槽的列表项类名 | `string \| object \| array` | `''` |
| itemStyle | 透传给默认插槽的列表项样式 | `string \| object` | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| scroll | 列表滚动时触发 | `({ scrollTop, start, end })` |
| reach-bottom | 触底时触发 | `()` |
| prefetch | 接近尾部预取阈值时触发 | `()` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 自定义可视区域内容，作用域参数为 `{ items, start, end, itemHeight, itemClass, itemStyle }` |

### Methods

| 方法名 | 说明 |
|--------|------|
| scrollToIndex(index) | 滚动到指定索引 |
| scrollToTop() | 滚动回顶部 |

## 使用建议

::: warning
`lk-virtual-list` 假设每一项高度固定并由 `itemHeight` 控制。如果单项高度差异很大，建议先统一高度，或改用更适合不规则高度场景的方案。
:::

## 兼容说明

- `positionStrategy="transform"` 性能最好，但部分 App WebView 对大列表 transform 合成层有差异；出现闪烁时可切到 `absolute` 或 `padding`。
- `enhanced`、`bounces`、`enablePassive` 依赖平台滚动能力，发布示例应覆盖 H5、App 与各小程序目标端。
- 列表项必须有稳定 `key`，不要在可视区域内使用会改变高度的异步内容；图片列表建议使用固定容器或改用 `lk-waterfall`。
- `contentClass` 位于子组件内部，若在父组件 scoped 样式中覆盖它，需使用 `:deep()`；`itemClass/itemStyle` 由父组件 slot 渲染，按普通 scoped 样式生效。

## 发布验收

`lk-virtual-list` 已纳入 needs-hardening showcase 回归，发布前按下面边界验收：

| 场景 | 验收方式 | 要点 |
|------|----------|------|
| 展示台基线 | 自动回归 | `tests/visual/needs-hardening-showcase.spec.ts` 校验组件路由、verified 状态与中风险标记 |
| 滚动窗口 | 人工验收 | `start/end`、overscan 和快速滚动下的可视项数量稳定 |
| 定位策略 | 人工验收 | `transform/absolute/padding` 至少在 H5、App 与各小程序目标端各验证一轮 |
