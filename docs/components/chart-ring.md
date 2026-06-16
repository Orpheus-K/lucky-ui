---
title: ChartRing 环形图
phone: chart-ring
---

# ChartRing 环形图

用于完成率、预算占比、健康环、多段配额等场景。支持单值进度和多段占比两种模式，内置中心文案、底轨和进入动画。

## 单值模式

```vue
<lk-chart-ring
  title="76%"
  subtitle="完成率"
  :value="76"
  :max="100"
/>
```

## 直接 Demo

项目内置可运行示例位于 `src/components/demos/chart-ring-demo.vue`，文档预览、preview catalog 与 showcase 都使用这个独立 Demo，不再借用 `chart-lite` 聚合页。

## 多段模式

```vue
<template>
  <lk-chart-ring
    title="92%"
    subtitle="Activity"
    :segments="segments"
    :height="260"
    :stroke-width="26"
  />
</template>

<script setup lang="ts">
const segments = [
  { label: 'Move', value: 52, color: '#2563eb' },
  { label: 'Exercise', value: 28, color: '#38bdf8' },
  { label: 'Stand', value: 20, color: '#1d4ed8' },
];
</script>
```

## 数据格式

```ts
interface RingChartSegment {
  label?: string;
  value: number;
  color?: string;
}
```

传入 `segments` 后优先使用多段模式；未传时使用 `value / max` 计算单值进度。

`color` 支持 Canvas 可识别颜色。分段未传 `color` 时，组件会按主题品牌色阶自动生成多段颜色。

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| value | 单值模式当前值 | `number` | `0` |
| max | 单值模式最大值 | `number` | `100` |
| segments | 多段占比数据，优先于 `value / max`；可通过 `color` 自定义分段色 | `RingChartSegment[]` | `[]` |
| height | 容器高度，数字按 rpx 处理 | `number / string` | `240` |
| strokeWidth | 圆环厚度，单位 rpx | `number` | `24` |
| padding | 内边距，单位 rpx | `number` | `20` |
| showTrack | 是否显示底轨 | `boolean` | `true` |
| title | 中心主标题 | `string` | `''` |
| subtitle | 中心副标题 | `string` | `''` |
| showCenter | 是否显示中心文字 | `boolean` | `true` |
| animationDuration | 入场动画时长，单位 ms | `number` | `700` |
| animationRepeat | 入场动画重复次数，`0` 表示持续循环 | `number` | `1` |
| effect | 图表特效等级 | `none / subtle / premium` | `premium` |
| effectDuration | 图表特效周期，单位 ms | `number` | `2600` |

## 使用建议

- 单一完成率用 `value / max`，多类配额用 `segments`。
- `segments` 的 `value` 建议使用业务原值，组件负责按总和计算占比。
- 图例列表建议使用与 `segments[].color` 相同的色点，避免图例和环图视觉脱节。
- 中心文案建议由业务侧格式化，例如 `92%`、`¥12.8k`、`3/5`。
- 多段数据超过 5 段时可考虑改用柱状图或列表，避免环图辨识度下降。

## 注意事项

> [!WARNING]
> `ChartRing` 当前不暴露点击分段事件；如果需要分段交互，应在图表外提供图例列表或操作区。
