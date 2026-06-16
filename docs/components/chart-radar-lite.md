---
title: ChartRadarLite 轻量雷达图
phone: chart-radar-lite
---

# ChartRadarLite 轻量雷达图

用于能力模型、健康维度、评分分布、风控画像等多维分值展示。组件基于 Canvas 绘制层级网格、填充区域、顶点和标签，适合移动端轻量看板。

## 基础用法

```vue
<template>
  <lk-chart-radar-lite :data="wellness" :height="320" />
</template>

<script setup lang="ts">
const wellness = [
  { label: '睡眠', value: 88 },
  { label: '活力', value: 76 },
  { label: '专注', value: 82 },
  { label: '恢复', value: 72 },
  { label: '压力', value: 62 },
  { label: '运动', value: 91 },
];
</script>
```

## 自定义最大值

```vue
<lk-chart-radar-lite
  :data="score"
  :max="5"
  :levels="5"
  color="#16a34a"
/>
```

## 自定义颜色

`color` 控制数据面的描边、填充和顶点；维度标签默认使用中性色，不跟随品牌色或自定义图表色。

```vue
<lk-chart-radar-lite
  :data="wellness"
  color="#be123c"
  :line-width="3"
/>
```

## 直接 Demo

项目内置可运行示例位于 `src/components/demos/chart-radar-lite-demo.vue`，文档预览、preview catalog 与 showcase 都使用这个独立 Demo，不再借用 `chart-lite` 聚合页。

## 数据格式

```ts
interface RadarLiteItem {
  label: string;
  value: number;
  max?: number;
}
```

单项传入 `max` 时优先使用该项最大值；未传时使用组件级 `max`。

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| data | 雷达图维度数据 | `RadarLiteItem[]` | `[]` |
| height | 容器高度，数字按 rpx 处理 | `number / string` | `320` |
| padding | 内边距，单位 rpx | `number` | `42` |
| levels | 网格层级 | `number` | `4` |
| max | 默认最大值 | `number` | `100` |
| color | 图表主色，控制数据面、描边和顶点，不影响维度标签 | `string` | `primary` |
| lineWidth | 数据面描边线宽，单位 rpx | `number` | `2` |
| showLabel | 是否显示维度标签 | `boolean` | `true` |
| showPoint | 是否显示顶点 | `boolean` | `true` |
| animationDuration | 入场动画时长，单位 ms | `number` | `680` |
| animationRepeat | 入场动画重复次数，`0` 表示持续循环 | `number` | `1` |
| effect | 入场后呼吸动效等级 | `none / subtle / premium` | `premium` |
| effectDuration | 呼吸动效周期，单位 ms | `number` | `3200` |

## 使用建议

- 维度数量建议控制在 4-8 个，过多会造成标签拥挤；少于 3 个维度时会降级为单轴/双轴 profile。
- 维度之间应有可比较的语义，不要把完全不同量纲的数据强行放进同一张雷达图。
- 小屏场景下可关闭 `showLabel`，在图表下方用列表解释维度。
- 雷达图使用“网格建立、轴线伸展、数据面逐维闭合、顶点落点”的入场动效；`effect` 只控制低频呼吸，不做扫描光束。
- 自定义 `color` 时仍建议保持标签中性，避免标签抢占数据面焦点。
- 如果需要多组数据对比，当前轻量版不建议叠加多面，优先使用柱状图或列表对比。

## 注意事项

> [!WARNING]
> 雷达图容易制造“面积误读”。关键业务结论应配合数值列表或说明文案展示。
