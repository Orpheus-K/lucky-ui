---
title: ChartStatCard 指标卡
phone: chart-stat-card
---

# ChartStatCard 指标卡

指标卡用于首页概览、经营看板、健康摘要和账户概览。它把标题、主数值、单位、趋势标签、辅助描述和迷你趋势图组合成一个完整信息单元。

## 直接 Demo

项目内置可运行示例位于 `src/components/demos/chart-stat-card-demo.vue`，文档预览、preview catalog 与 showcase 都使用这个独立 Demo，不再借用 `chart-lite` 聚合页。

## 基础用法

```vue
<template>
  <lk-chart-stat-card
    title="今日步数"
    value="12,680"
    unit="steps"
    description="比上周同日更活跃"
    trend="up"
    trend-text="+18%"
    :data="steps"
  />
</template>

<script setup lang="ts">
const steps = [
  { label: 'Mon', value: 6800 },
  { label: 'Tue', value: 7600 },
  { label: 'Wed', value: 7300 },
  { label: 'Thu', value: 9100 },
  { label: 'Fri', value: 10200 },
  { label: 'Sat', value: 11800 },
  { label: 'Sun', value: 12600 },
];
</script>
```

## 无图模式

```vue
<lk-chart-stat-card
  title="转化率"
  value="18.6"
  unit="%"
  trend="flat"
  trend-text="稳定"
  :show-chart="false"
/>
```

## 自定义图表色

`color` 只影响内嵌迷你趋势线，不影响标题、主数值、单位、趋势文案和辅助描述。文本默认使用中性色 token，避免在业务卡片中被品牌色过度染色。

```vue
<lk-chart-stat-card
  title="净收入"
  value="71k"
  trend="up"
  trend-text="+8.6%"
  :data="revenue"
  color="#2563eb"
/>
```

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
| title | 指标标题 | `string` | `''` |
| value | 主数值 | `string / number` | `''` |
| unit | 数值单位 | `string` | `''` |
| description | 辅助描述 | `string` | `''` |
| trendText | 趋势文案 | `string` | `''` |
| trend | 趋势方向 | `up / down / flat` | `flat` |
| data | 迷你趋势数据 | `LiteChartPoint[]` | `[]` |
| showChart | 是否显示迷你趋势图 | `boolean` | `true` |
| chartHeight | 图表高度，数字按 rpx 处理 | `number / string` | `112` |
| chartLineWidth | 内嵌趋势线线宽，单位 rpx | `number` | `5` |
| chartAnimationDuration | 内嵌趋势线入场动画时长，单位 ms | `number` | `560` |
| chartAnimationRepeat | 内嵌趋势线入场动画重复次数，`0` 表示持续循环 | `number` | `1` |
| chartEffect | 内嵌趋势线动效等级 | `none / subtle / premium` | `premium` |
| color | 内嵌趋势线主色，不影响文本颜色 | `string` | `primary` |

## 使用建议

- 主数值由业务侧格式化后传入，组件不负责金额、百分比、千分位格式化。
- 两列指标卡并排时，保持 `title` 和 `description` 文案长度接近，避免高度不一致。
- 数据不足或业务只需要展示 KPI 时，关闭 `showChart`。
- 需要强调品牌或状态时优先使用图表色、趋势方向和业务文案，不建议把标题、数值整体改成品牌色。
- 更自由的布局可以用 [Card](./card) + [ChartSparkline](./chart-sparkline) 自行组合。

## 注意事项

> [!TIP]
> `trend` 只表达视觉语义，不会自动根据数据计算涨跌；建议服务端或业务层明确给出趋势方向。
