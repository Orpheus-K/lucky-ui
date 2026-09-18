---
title: HorizontalScroll 横向滚动
phone: horizontal-scroll
---

# HorizontalScroll 横向滚动

一个轻量的横向滚动容器，适合标签组、卡片列表、频道入口、音乐封面流等需要左右滑动浏览的内容。

## 基础用法

```vue
<lk-horizontal-scroll gap="24rpx">
  <view v-for="i in 10" :key="i" style="width: 180rpx">Item {{ i }}</view>
</lk-horizontal-scroll>
```

## 卡片流布局

```vue
<lk-horizontal-scroll gap="24rpx" padding="0rpx">
  <view v-for="i in 6" :key="i" style="width: 320rpx">
    <image
      src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
      mode="aspectFill"
      style="width:320rpx;height:220rpx;border-radius:16rpx"
    />
    <text>推荐歌单 {{ i }}</text>
  </view>
</lk-horizontal-scroll>
```

## 逐项滑动

默认保留原生自由滚动。设置 `snap` 并使用 `lk-horizontal-scroll-item` 包裹每张卡片后，触摸横滑每次最多前进或后退一个停靠点，按 1 → 2 → 3 的顺序浏览。位移不足 24px 时回到当前项，纵向手势仍用于页面滚动。

```vue
<lk-horizontal-scroll snap gap="20rpx">
  <lk-horizontal-scroll-item v-for="i in 6" :key="i">
    <view style="width: 560rpx">卡片 {{ i }}</view>
  </lk-horizontal-scroll-item>
</lk-horizontal-scroll>
```

逐项模式使用 uni-app 节点查询、模板触摸事件和受控位移，不访问 H5 内部 DOM。子项组件在自己的作用域测量并注册到容器，避免小程序插槽查询限制。请给所有卡片设置明确宽度并逐个包裹，不要只包裹整个列表。未使用子项组件、测量不可用、少于两个子项、内容无需滚动或存在宽于视口的子项时，自动保留自由滚动。末尾能同时显示的子项共享末端停靠点。

窗口尺寸及组件更新后会重新测量；图片加载或外部布局变化后，也可通过组件 ref 调用 `refresh()` 重新测量。逐项模式不显示原生滚动进度。H5 同时支持鼠标拖动、触控板横滑和 Shift + 滚轮，每次手势移动一项，普通纵向滚轮仍用于页面滚动。

需要自由惯性滚动时，设置 `:snap="false"`：

```vue
<lk-horizontal-scroll :snap="false">
  <view v-for="i in 10" :key="i" style="width: 180rpx; flex-shrink: 0">Item {{ i }}</view>
</lk-horizontal-scroll>
```

## 显示滚动条

```vue
<lk-horizontal-scroll :hide-scrollbar="false">
  <view v-for="i in 12" :key="i" style="width: 200rpx">模块 {{ i }}</view>
</lk-horizontal-scroll>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import HorizontalScrollDemo from '@/pages_sub/components/demos/horizontal-scroll-demo.vue'
</script>

<template>
  <HorizontalScrollDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-horizontal-scroll />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| gap | 子项间距 | `string \| number` | `'20rpx'` |
| padding | 内容区域左右内边距 | `string \| number` | `'0rpx'` |
| hideScrollbar | 是否隐藏滚动条 | `boolean` | `true` |
| snap | 触摸逐项停靠；配合 `lk-horizontal-scroll-item` 组件使用 | `boolean` | `false` |

### Events

当前版本未额外暴露自定义事件。

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 横向排列的子项内容 |

## 使用建议

::: tip
`lk-horizontal-scroll` 只负责横向滚动容器本身，不负责子项宽度布局。为了获得稳定效果，建议给每个子项设置明确宽度。
:::
