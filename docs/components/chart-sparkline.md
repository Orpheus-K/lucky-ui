---
title: ChartSparkline 迷你趋势线
phone: chart-sparkline
---

# ChartSparkline 迷你趋势线

用于卡片、列表行、指标摘要中的轻量趋势展示。相比完整折线图，Sparkline 去掉坐标轴和复杂标尺，只保留走势、面积渐变、末端点和触摸高亮。

## 基础用法

```vue
<template>
  <lk-chart-sparkline :data="revenue" :height="160" />
</template>

<script setup lang="ts">
const revenue = [
  { label: '1', value: 28 },
  { label: '2', value: 34 },
  { label: '3', value: 32 },
  { label: '4', value: 45 },
  { label: '5', value: 52 },
  { label: '6', value: 49 },
  { label: '7', value: 64 },
  { label: '8', value: 71 },
];
</script>
```

## 紧凑模式

```vue
<lk-chart-sparkline
  :data="trend"
  :height="96"
  :padding="8"
  :line-width="4"
  :area="false"
  :show-end-point="false"
/>
```

## 自定义颜色

`color` 控制折线、面积渐变、端点和触摸高亮。组件不会把外部标题、数值等文本自动改成该颜色。

```vue
<lk-chart-sparkline
  :data="trend"
  color="#0f766e"
  :line-width="6"
/>
```

## 直接 Demo

项目内置可运行示例位于 `src/components/demos/chart-sparkline-demo.vue`，文档预览、preview catalog 与 showcase 都使用这个独立 Demo，不再借用 `chart-lite` 聚合页。

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
| height | 容器高度，数字按 rpx 处理 | `number / string` | `120` |
| padding | 内边距，单位 rpx | `number` | `12` |
| lineWidth | 线宽，单位 rpx | `number` | `5` |
| color | 图表主色，控制折线、面积、端点和触摸高亮 | `string` | `primary` |
| area | 是否显示面积渐变 | `boolean` | `true` |
| showEndPoint | 是否显示末端高亮点 | `boolean` | `true` |
| tooltip | 是否启用触摸高亮 | `boolean` | `true` |
| animationDuration | 入场动画时长，单位 ms | `number` | `560` |
| animationRepeat | 入场动画重复次数，`0` 表示持续循环 | `number` | `1` |
| effect | 图表特效等级 | `none / subtle / premium` | `premium` |
| effectDuration | 图表特效周期，单位 ms | `number` | `2400` |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| hoverChange | 触摸高亮点变化，无高亮时为 `-1` | `(index: number)` |

## 使用建议

- 卡片指标内嵌趋势优先用 `ChartSparkline`。
- 如果需要坐标轴、网格和更明确的触摸提示，改用 [ChartLine](./chart-line)。
- 列表行中使用时建议关闭 `area` 和 `tooltip`，降低视觉和交互负担。

## 注意事项

> [!TIP]
> Sparkline 应服务于“趋势感”，不要承载过细的数据读取任务；精确数值建议在卡片主文案或详情页展示。
