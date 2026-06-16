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
import HorizontalScrollDemo from '@/components/demos/horizontal-scroll-demo.vue'
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
