---
title: ChartArea 面积趋势图
phone: chart-area
---

# ChartArea 面积趋势图

适合展示连续趋势、增长曲线、收益走势、活跃度变化等页面级数据。组件基于 uni-app Canvas 2D 绘制，内置柔和面积渐变、轻网格、触摸高亮与进入动画。

## 基础用法

```vue
<template>
  <lk-chart-area :data="trend" :height="300" show-x-axis-label />
</template>

<script setup lang="ts">
const trend = [
  { label: '09:30', value: 62 },
  { label: '10:00', value: 66 },
  { label: '10:30', value: 64 },
  { label: '11:00', value: 73 },
  { label: '13:00', value: 76 },
  { label: '14:00', value: 82 },
  { label: '15:00', value: 88 },
];
</script>
```

## 默认高亮

```vue
<script setup lang="ts">
import { ref } from 'vue'

const activeIndex = ref(-1)
</script>

<lk-chart-area
  :data="trend"
  :default-index="trend.length - 1"
  show-x-axis-label
  @hover-change="index => activeIndex = index"
/>
```

## 直接 Demo

项目内置可运行示例位于 `src/components/demos/chart-area-demo.vue`，文档预览、preview catalog 与 showcase 都使用这个独立 Demo，不再借用 `chart-lite` 聚合页。

## 数据格式

```ts
interface LiteChartPoint {
  label?: string;
  value: number;
}
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| data | 趋势数据 | `LiteChartPoint[]` | `[]` |
| height | 容器高度，数字按 rpx 处理 | `number / string` | `300` |
| padding | 内边距，单位 rpx | `number` | `28` |
| lineWidth | 线宽，单位 rpx | `number` | `5` |
| color | 图表主色，支持主题色或 Canvas 颜色 | `string` | `primary` |
| showGrid | 是否显示柔和网格线 | `boolean` | `true` |
| showXAxisLabel | 是否显示 X 轴首尾标签 | `boolean` | `false` |
| tooltip | 是否显示触摸提示 | `boolean` | `true` |
| defaultIndex | 默认高亮索引，`-1` 表示不高亮 | `number` | `-1` |
| animationDuration | 动画时长，单位 ms | `number` | `700` |
| effect | 图表特效等级 | `none / subtle / premium` | `premium` |
| effectDuration | 图表特效周期，单位 ms | `number` | `2800` |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| hoverChange | 触摸高亮点变化，无高亮时为 `-1` | `(index: number)` |

## 使用建议

- 页面级趋势优先用 `ChartArea`，卡片内迷你趋势优先用 [ChartSparkline](./chart-sparkline)。
- 数据点过少时建议关闭 `showXAxisLabel`，避免首尾标签造成视觉噪声。
- 金额、比例、步数等展示格式应在外部处理，组件只消费数值。
- `ChartArea` 是独立公开组件，发布验收应覆盖基础趋势、参数控制和边界数据，不只依赖 `ChartLite` 聚合展示。

## 注意事项

> [!WARNING]
> 图表基于 Canvas 绘制，H5、App、小程序在字体度量、渐变和抗锯齿上可能存在细微差异。

> [!TIP]
> 如果需要固定 CSS 高度，可以传入字符串，例如 `height="180px"`；数字高度按 rpx 处理。
