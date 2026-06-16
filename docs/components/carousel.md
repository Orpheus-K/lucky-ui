---
title: Carousel 轮播
phone: carousel
---

# Carousel 轮播

用于图片、卡片、营销 Banner、专题推荐等内容轮播。组件支持横向/纵向轮播、卡片模式、露出预览、自适应高度和多种指示器样式。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const current = ref(0)
const list = [
  'https://img01.yzcdn.cn/vant/cat.jpeg',
  'https://img01.yzcdn.cn/vant/cat.jpeg',
  'https://img01.yzcdn.cn/vant/cat.jpeg',
]
</script>

<template>
  <lk-carousel
    v-model:current="current"
    :carousel-list="list"
  />
</template>
```

## 自定义指示器样式

```vue
<lk-carousel
  v-model:current="current"
  :carousel-list="list"
  indicator-type="bars"
  indicator-position="top-right"
  indicator-active-color="#fff"
  indicator-inactive-color="rgba(255,255,255,0.4)"
/>
```

## 纵向轮播

```vue
<lk-carousel
  v-model:current="current"
  :carousel-list="list"
  vertical
  indicator-position="right"
  height="360rpx"
/>
```

## 卡片模式

```vue
<lk-carousel
  v-model:current="current"
  :carousel-list="list"
  :card="true"
  card-prev-margin="50rpx"
  card-next-margin="50rpx"
  :card-scale="0.9"
  card-radius="24rpx"
  indicator-type="bars"
/>
```

## 自定义轮播内容

当 `carouselList` 中不只是图片地址时，可以配合作用域插槽自定义内容。

```vue
<script setup lang="ts">
const cards = [
  { title: '专题一', desc: '新品推荐' },
  { title: '专题二', desc: '限时折扣' },
]
</script>

<template>
  <lk-carousel :carousel-list="cards" :auto-height="true">
    <template #default="{ item, index }">
      <view style="padding: 40rpx; background: #fff; border-radius: 24rpx">
        <view style="font-size: 32rpx; font-weight: 600">{{ index + 1 }}. {{ item.title }}</view>
        <view style="margin-top: 12rpx; color: #666">{{ item.desc }}</view>
      </view>
    </template>
  </lk-carousel>
</template>
```

## 自适应高度

```vue
<lk-carousel
  :carousel-list="cards"
  :auto-height="true"
  indicator-type="dots"
/>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import CarouselDemo from '@/components/demos/carousel-demo.vue'
</script>

<template>
  <CarouselDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-carousel />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| carouselList | 轮播数据源 | `any[]` | `[]` |
| current | 当前激活索引，支持 `v-model:current` | `number` | `0` |
| autoPlay | 是否自动轮播 | `boolean` | `true` |
| interval | 自动轮播间隔，单位 ms | `number` | `3000` |
| effect | 切换效果 | `fade \| slide` | `fade` |
| vertical | 是否纵向轮播 | `boolean` | `false` |
| showIndicators | 是否显示指示器 | `boolean` | `true` |
| indicatorType | 指示器类型 | `dots \| bars \| number \| none` | `dots` |
| indicatorPosition | 指示器位置 | `bottom \| top \| left \| right \| top-left \| top-right \| bottom-left \| bottom-right \| auto` | `auto` |
| indicatorAlign | 指示器排列对齐方式 | `center \| start \| end` | `center` |
| indicatorClickable | 指示器是否可点击切换 | `boolean` | `undefined` |
| indicatorInactiveColor | 未激活指示器颜色 | `string` | `''` |
| indicatorActiveColor | 激活指示器颜色 | `string` | `''` |
| card | 是否启用卡片模式 | `boolean` | `undefined` |
| cardPrevMargin | 卡片模式前侧留白 | `string` | `''` |
| cardNextMargin | 卡片模式后侧留白 | `string` | `''` |
| cardScale | 非激活卡片缩放比例 | `number` | `undefined` |
| cardRadius | 卡片圆角 | `string` | `''` |
| cardShadow | 卡片阴影 | `string` | `''` |
| peek | 是否启用露出预览模式 | `boolean` | `undefined` |
| peekPrevMargin | 露出模式前侧留白 | `string` | `''` |
| peekNextMargin | 露出模式后侧留白 | `string` | `''` |
| indicatorAnimated | 指示器是否带动画 | `boolean` | `undefined` |
| autoHeight | 是否根据当前内容自适应高度 | `boolean` | `undefined` |
| height | 固定高度；关闭自适应时生效 | `string \| number` | `'320rpx'` |
| indicatorOverlay | 指示器是否覆盖在内容上方 | `boolean` | `true` |
| loop | 是否循环播放 | `boolean` | `true` |
| id | 根节点 id | `string` | `''` |
| customClass | 根节点自定义类名 | `string \| object \| array` | — |
| customStyle | 根节点自定义样式 | `string \| object` | — |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:current | 当前索引变化 | `(index: number)` |
| change | 切换时触发 | `(index, oldIndex, source)` |
| click | 点击当前项时触发 | `(item, index, event)` |
| indicator-click | 点击指示器时触发 | `(index, oldIndex, event)` |
| autoplay-change | 自动轮播导致索引变化时触发 | `(index, oldIndex)` |
| height-change | 自适应高度测量变化时触发 | `(height: number)` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 自定义轮播项内容，作用域参数为 `{ item, index }` |

## 使用建议

::: tip
纯图片轮播直接传 `carouselList` 即可；当每一页是复杂卡片时，推荐使用默认插槽来自定义内容。
:::

## 发布验收

`lk-carousel` 已纳入 dynamic-visual showcase 回归，发布前按下面边界验收：

| 场景 | 验收方式 | 要点 |
|------|----------|------|
| 展示台基线 | 自动回归 | `tests/visual/dynamic-visual-showcase.spec.ts` 校验组件路由、verified 状态与中风险标记 |
| 动态视觉 | 自动/人工 | fade、slide、卡片模式、指示器位置在截图中保持稳定 |
| 平台差异 | 人工验收 | autoplay、纵向轮播、filter/阴影在低端 App WebView 下可接受 |
