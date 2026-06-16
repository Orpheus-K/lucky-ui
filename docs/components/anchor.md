---
title: Anchor 锚点导航
phone: anchor
---

# Anchor 锚点导航

用于左侧分类导航与右侧内容区域联动的场景，尤其适合点单页、楼层导航、长表单快速定位等移动端布局。

## 基础用法（ScrollView 联动）

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const anchorRef = ref()
const currentScrollTop = ref(0)
const scrollIntoViewId = ref('')

function onScroll(e) {
  currentScrollTop.value = e.detail.scrollTop
  anchorRef.value?.onScroll?.(e.detail.scrollTop)
}

function onAnchorClick(href) {
  scrollIntoViewId.value = href
}

onMounted(() => {
  setTimeout(() => {
    anchorRef.value?.measureTargets?.()
  }, 300)
})
</script>

<template>
  <view style="display:flex;height:800rpx">
    <lk-anchor
      ref="anchorRef"
      target-container="#anchor-content"
      :scroll-top="currentScrollTop"
      @click="onAnchorClick"
    >
      <lk-anchor-link href="section-a" title="分类 A" />
      <lk-anchor-link href="section-b" title="分类 B" />
    </lk-anchor>

    <scroll-view
      id="anchor-content"
      scroll-y
      :scroll-into-view="scrollIntoViewId"
      @scroll="onScroll"
    >
      <view id="section-a" style="height:600rpx">内容 A</view>
      <view id="section-b" style="height:600rpx">内容 B</view>
    </scroll-view>
  </view>
</template>
```

## 何时需要 `target-container`

- 右侧内容由 `scroll-view` 承载时，推荐始终传入 `target-container`
- 小程序环境下，组件内部无法稳定跨组件测量外部节点，传入容器选择器后更可靠
- 如果是页面整体滚动，可配合 `scrollTop` 与 `measureTargets()` 手动控制

## 自定义颜色风格

```vue
<lk-anchor
  bg-color="#f7f8fa"
  active-bg-color="#e8f3ff"
  text-color="#666"
  active-color="#1677ff"
>
  <lk-anchor-link href="hot" title="热门" />
  <lk-anchor-link href="new" title="新品" />
</lk-anchor>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import AnchorDemo from '@/components/demos/anchor-demo.vue'
</script>

<template>
  <AnchorDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-anchor />
  </view>
</template>
```

## API

### Props

#### LkAnchor

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customClass | 组件可视根节点自定义类名 | `string \| object \| array` | `''` |
| customStyle | 组件可视根节点自定义样式 | `string \| object` | `''` |
| bgColor | 侧边栏背景色 | `string` | `''` |
| activeBgColor | 激活项背景色 | `string` | `''` |
| textColor | 普通项文字颜色 | `string` | `''` |
| activeColor | 激活项文字颜色 | `string` | `''` |
| showLine | 是否显示激活装饰线 | `boolean` | `true` |
| targetContainer | 目标滚动容器选择器，例如 `#anchor-content` | `string` | `''` |
| container | 滚动容器选择器，偏 H5 场景 | `string` | `''` |
| headerOffset | 顶部偏移量，用于调整激活判断阈值 | `string \| number` | `0` |
| scrollTop | 当前滚动高度 | `number` | `0` |

#### LkAnchorLink

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customClass | 组件可视根节点自定义类名 | `string \| object \| array` | `''` |
| customStyle | 组件可视根节点自定义样式 | `string \| object` | `''` |
| title | 锚点标题 | `string` | `''` |
| href | 对应内容区元素 id，不带 `#` | `string` | `''` |
| disabled | 是否禁用 | `boolean` | `false` |

### Events

#### LkAnchor

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 当前激活锚点变化时触发 | `(href: string)` |
| click | 点击锚点时触发 | `(href: string)` |

### Slots

#### LkAnchor

| 插槽名 | 说明 |
|--------|------|
| default | 锚点链接列表 |

#### LkAnchorLink

| 插槽名 | 说明 |
|--------|------|
| default | 自定义链接内容，默认展示 `title` |

### Methods

`LkAnchor` 通过组件实例暴露了以下方法：

| 方法名 | 说明 |
|--------|------|
| measureTargets() | 重新测量所有目标节点位置 |
| setTargets(targets, baseScrollTop?) | 手动设置目标位置信息 |
| onScroll(scrollTop, headerHeight?) | 手动同步滚动位置并更新激活项 |
| scrollTo(href) | 滚动到指定锚点 |
| active | 当前激活锚点的响应式引用 |

## 使用建议

::: warning
使用 `scroll-view` 场景时，不要只依赖点击跳转，还要把右侧滚动事件同步回 `onScroll()`，否则高亮状态不会持续正确更新。
:::
