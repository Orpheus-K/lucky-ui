---
title: Waterfall 瀑布流
phone: waterfall
---

# Waterfall 瀑布流

适合图文卡片流、内容社区、商品种草流等双列不等高内容布局。组件内置双列贪心布局、骨架屏、图片预计算与滚动加载能力。

## 基础用法

```vue
<script setup lang="ts">
const items = [
  { id: 1, image: 'https://img01.yzcdn.cn/vant/cat.jpeg', ratio: 1.3, title: '卡片 1' },
  { id: 2, image: 'https://img01.yzcdn.cn/vant/cat.jpeg', ratio: 0.8, title: '卡片 2' },
]
</script>

<template>
  <lk-waterfall :items="items" height="100vh" />
</template>
```

## 自定义卡片模板

默认通过 `item` 作用域插槽渲染单卡内容。

```vue
<lk-waterfall :items="items" :card-radius="20">
  <template #item="{ item, loading, onImageLoad, onImageError }">
    <view style="background:#fff;border-radius:20rpx;overflow:hidden">
      <image
        :src="item.image"
        mode="aspectFill"
        style="width:100%;height:300rpx"
        @load="onImageLoad()"
        @error="onImageError()"
      />
      <view style="padding:24rpx">
        <view style="font-size:28rpx;font-weight:600">{{ item.title }}</view>
        <view v-if="loading" style="margin-top:12rpx;color:#999">图片加载中...</view>
      </view>
    </view>
  </template>
</lk-waterfall>
```

## 无限加载

```vue
<lk-waterfall
  :items="list"
  :lower-threshold="200"
  :preload-screens="2"
  @load-more="loadMore"
  @reach-bottom="loadMore"
/>
```

## 图片预计算与骨架屏

```vue
<lk-waterfall
  :items="list"
  :show-skeleton="true"
  :preload-image="true"
  :default-extra-height="56"
/>
```

如果业务数据能提前提供 `ratio`、`imageWidth`、`imageHeight`，瀑布流布局会更稳定。

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import WaterfallDemo from '@/components/demos/waterfall-demo.vue'
</script>

<template>
  <WaterfallDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-waterfall />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| items | 瀑布流数据 | `WaterfallItem[]` | `[]` |
| height | 容器高度 | `string \| number` | `'100vh'` |
| gutter | 列间距 | `string \| number` | `16` |
| rowGap | 行间距 | `string \| number` | `16` |
| paddingX | 左右内边距 | `string \| number` | `16` |
| paddingY | 上下内边距 | `string \| number` | `16` |
| defaultExtraHeight | 默认卡片额外高度 | `number` | `60` |
| estimateHeight | 无法预估时使用的兜底高度 | `number` | `200` |
| imageLoadTimeout | 图片加载超时，单位 ms | `number` | `5000` |
| lowerThreshold | 触底阈值 | `number` | `200` |
| preloadScreens | 预加载屏数 | `number` | `2` |
| showSkeleton | 是否显示初始骨架屏 | `boolean` | `true` |
| preloadImage | 是否启用图片高度预计算 | `boolean` | `true` |
| errorPlaceholder | 图片失败占位图 | `string` | `''` |
| cardRadius | 卡片圆角 | `string \| number` | `16` |
| scrollWithAnimation | 是否启用滚动动画 | `boolean` | `false` |
| bounces | 是否启用回弹效果 | `boolean` | `true` |
| enhanced | 小程序增强模式 | `boolean` | `true` |
| showScrollbar | 是否显示滚动条 | `boolean` | `false` |

### WaterfallItem

| 字段 | 说明 | 类型 |
|------|------|------|
| id | 唯一标识 | `string \| number` |
| image | 图片地址 | `string` |
| imageWidth | 图片原始宽度 | `number` |
| imageHeight | 图片原始高度 | `number` |
| ratio | 图片宽高比，高于 `imageWidth/imageHeight` 优先级 | `number` |
| extraHeight | 卡片底部额外高度 | `number` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| scroll | 滚动时触发 | `({ scrollTop, scrollHeight })` |
| reach-bottom | 滚动到列表底部 | `()` |
| load-more | 需要加载更多数据时触发 | `()` |
| card-click | 点击某一张卡片 | `(item, index)` |
| image-loaded | 某卡片图片加载完成 | `(item, index)` |
| image-error | 某卡片图片加载失败 | `(item, index)` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| header | 列表顶部内容 |
| item | 自定义卡片内容，作用域参数为 `{ item, index, width, height, loading, image-state, on-image-load, on-image-error }` |
| loading | 底部加载中区域 |

## 使用建议

::: tip
推荐在数据中提前提供 `ratio`，这样组件无需等待图片真实加载完成也能更早计算布局，滚动体验会更稳定。
:::

## 发布验收

`lk-waterfall` 已纳入 high-risk showcase 回归，发布前按下面边界验收：

| 场景 | 验收方式 | 要点 |
|------|----------|------|
| 展示台基线 | 自动回归 | `tests/visual/high-risk-showcase.spec.ts` 校验组件路由、verified 状态与高风险标记 |
| 图片加载 | 人工验收 | 有 `ratio`、无 `ratio`、加载失败三类数据下列高稳定 |
| 滚动加载 | 人工验收 | `reach-bottom/load-more` 不重复触发，新增数据后列顺序不抖动 |

::: warning
瀑布流列高依赖图片加载节奏。公开示例建议业务数据提前提供 `ratio`，否则不同网络和 WebView 下可能出现首屏重排。
:::
