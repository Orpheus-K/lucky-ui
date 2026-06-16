---
title: ChartLite 轻量图表
phone: chart-lite
---

# ChartLite 轻量图表

一组移动端优先的轻量图表组件，适合健康、财务、运营看板等场景。组件使用 uni-app Canvas 2D 绘制，不依赖 ECharts，默认采用 Apple Health 风格的柔和渐变与弱坐标视觉。

## 组件清单

- `LkChartStatCard`：指标卡，组合主数值、趋势标签与迷你趋势线。
- `LkChartSparkline`：迷你趋势线，适合嵌入卡片。
- `LkChartRing`：环形进度 / 多段占比图，适合完成率、健康环、预算占比。
- `LkChartRadarLite`：轻量雷达图，适合能力模型、健康维度、评分分布。

## 子组件索引

| 子组件 | 适用场景 | 数据模型 | 主要能力 |
|--------|----------|----------|----------|
| [LkChartStatCard](./chart-stat-card) | 经营指标、健康摘要、账户概览 | `LiteChartPoint[]` | 主数值、趋势标记、内嵌迷你趋势 |
| [LkChartSparkline](./chart-sparkline) | 卡片内趋势线、列表行走势 | `LiteChartPoint[]` | 折线、面积渐变、末端高亮、触摸索引 |
| [LkChartRing](./chart-ring) | 完成率、预算占比、多段占比 | `value/max` 或 `RingChartSegment[]` | 单值环、多段环、中心文案 |
| [LkChartRadarLite](./chart-radar-lite) | 能力模型、维度评分、健康雷达 | `RadarLiteItem[]` | 多维雷达、层级网格、标签与顶点 |

### 选择建议

- 要在信息卡中展示“数值 + 趋势”，优先使用 `LkChartStatCard`。
- 要在已有卡片里嵌一条小趋势线，使用 `LkChartSparkline`。
- 要表达完成率或占比，使用 `LkChartRing`。
- 要比较多个维度分值，使用 `LkChartRadarLite`。

## 基础用法

```vue
<template>
  <lk-chart-stat-card
    title="今日步数"
    value="12,680"
    unit="steps"
    trend="up"
    trend-text="+18%"
    :data="steps"
  />

  <lk-chart-sparkline :data="trend" :height="160" />

  <lk-chart-radar-lite :data="wellness" :height="320" />
</template>
```

## 数据格式

### 趋势数据

`LkChartSparkline`、`LkChartStatCard` 使用相同的数据点：

```ts
interface LiteChartPoint {
  label?: string;
  value: number;
}
```

### 环图数据

```ts
interface RingChartSegment {
  label?: string;
  value: number;
  color?: string;
}
```

## 颜色与文本

`ChartLite` 系列支持自定义图表颜色，但文本默认保持中性色，不会因为品牌色或图表色自动染色。

- `LkChartSparkline`、`LkChartRadarLite`、`LkChartStatCard` 通过 `color` 控制图形线条、填充、顶点和内嵌趋势线。
- `LkChartRing` 通过 `segments[].color` 控制每个分段；未传 `color` 时使用主题品牌色阶。
- `color` 支持 `primary`、十六进制色、`rgb()/rgba()` 等 Canvas 可识别颜色；跨端场景建议优先使用明确色值。
- 聚合 Demo 的参数面板提供颜色 swatch，可在运行态切换品牌、湖蓝、松绿、莓红方案。

```vue
<template>
  <lk-chart-sparkline :data="trend" color="#2563eb" />

  <lk-chart-radar-lite :data="wellness" color="#0f766e" />

  <lk-chart-ring :segments="segments" />
</template>

<script setup lang="ts">
const segments = [
  { label: 'Move', value: 52, color: '#2563eb' },
  { label: 'Exercise', value: 28, color: '#38bdf8' },
  { label: 'Stand', value: 20, color: '#1d4ed8' },
];
</script>
```

### 雷达图数据

```ts
interface RadarLiteItem {
  label: string;
  value: number;
  max?: number;
}
```

## API

### LkChartStatCard Props

| 参数        | 说明               | 类型                     | 默认值      |
| ----------- | ------------------ | ------------------------ | ----------- |
| title       | 指标标题           | `string`                 | `''`        |
| value       | 主数值             | `string / number`        | `''`        |
| unit        | 数值单位           | `string`                 | `''`        |
| description | 辅助描述           | `string`                 | `''`        |
| trend       | 趋势方向           | `'up' / 'down' / 'flat'` | `'flat'`    |
| trendText   | 趋势文案           | `string`                 | `''`        |
| data        | 迷你趋势数据       | `LiteChartPoint[]`       | `[]`        |
| showChart   | 是否显示迷你趋势图 | `boolean`                | `true`      |
| chartHeight | 图表高度           | `number / string`        | `112`       |
| chartLineWidth | 内嵌趋势线线宽，单位 rpx | `number` | `5` |
| chartAnimationDuration | 内嵌趋势线入场动画时长，单位 ms | `number` | `560` |
| chartAnimationRepeat | 内嵌趋势线入场动画重复次数，`0` 表示持续循环 | `number` | `1` |
| chartEffect | 内嵌趋势线动效等级 | `none / subtle / premium` | `'premium'` |
| color       | 内嵌趋势线主色，不影响标题、数值、趋势文案 | `string`                 | `'primary'` |

### LkChartSparkline Props

| 参数              | 说明               | 类型               | 默认值      |
| ----------------- | ------------------ | ------------------ | ----------- |
| data              | 趋势数据           | `LiteChartPoint[]` | `[]`        |
| height            | 容器高度           | `number / string`  | `120`       |
| padding           | 内边距，单位 rpx   | `number`           | `12`        |
| lineWidth         | 线宽，单位 rpx     | `number`           | `5`         |
| color             | 图表主色，控制折线、面积、端点和触摸高亮 | `string`           | `'primary'` |
| area              | 是否显示面积渐变   | `boolean`          | `true`      |
| showEndPoint      | 是否显示末端高亮点 | `boolean`          | `true`      |
| tooltip           | 是否启用触摸高亮   | `boolean`          | `true`      |
| animationDuration | 入场动画时长，单位 ms | `number`           | `560`       |
| animationRepeat   | 入场动画重复次数，`0` 表示持续循环 | `number` | `1` |
| effect            | 图表特效等级 | `none / subtle / premium` | `'premium'` |
| effectDuration    | 图表特效周期，单位 ms | `number` | `2400` |

### LkChartRing Props

| 参数              | 说明                                 | 类型                 | 默认值 |
| ----------------- | ------------------------------------ | -------------------- | ------ |
| value             | 单值模式当前值                       | `number`             | `0`    |
| max               | 单值模式最大值                       | `number`             | `100`  |
| segments          | 多段占比数据，传入后优先于 value/max；可通过 `segment.color` 自定义分段色 | `RingChartSegment[]` | `[]`   |
| height            | 容器高度                             | `number / string`    | `240`  |
| strokeWidth       | 圆环厚度，单位 rpx                   | `number`             | `24`   |
| padding           | 内边距，单位 rpx                     | `number`             | `20`   |
| showTrack         | 是否显示底轨                         | `boolean`            | `true` |
| title             | 中心主标题                           | `string`             | `''`   |
| subtitle          | 中心副标题                           | `string`             | `''`   |
| showCenter        | 是否显示中心文字                     | `boolean`            | `true` |
| animationDuration | 入场动画时长，单位 ms                | `number`             | `700`  |
| animationRepeat   | 入场动画重复次数，`0` 表示持续循环   | `number`             | `1`    |
| effect            | 图表特效等级                         | `none / subtle / premium` | `'premium'` |
| effectDuration    | 图表特效周期，单位 ms                | `number`             | `2600` |

### LkChartRadarLite Props

| 参数              | 说明              | 类型              | 默认值      |
| ----------------- | ----------------- | ----------------- | ----------- |
| data              | 雷达图维度数据    | `RadarLiteItem[]` | `[]`        |
| height            | 容器高度          | `number / string` | `320`       |
| padding           | 内边距，单位 rpx  | `number`          | `42`        |
| levels            | 网格层级          | `number`          | `4`         |
| max               | 默认最大值        | `number`          | `100`       |
| color             | 图表主色，控制数据面、描边和顶点，不影响维度标签 | `string`          | `'primary'` |
| lineWidth         | 数据面描边线宽，单位 rpx | `number`          | `2`         |
| showLabel         | 是否显示维度标签  | `boolean`         | `true`      |
| showPoint         | 是否显示顶点      | `boolean`         | `true`      |
| animationDuration | 入场动画时长，单位 ms | `number`          | `680`       |
| animationRepeat   | 入场动画重复次数，`0` 表示持续循环 | `number` | `1` |
| effect            | 入场后呼吸动效等级 | `none / subtle / premium` | `premium` |
| effectDuration    | 呼吸动效周期，单位 ms | `number`          | `3200`      |

## Events

| 组件               | 事件名        | 说明           | 回调参数          |
| ------------------ | ------------- | -------------- | ----------------- |
| `LkChartSparkline` | `hoverChange` | 触摸高亮点变化 | `(index: number)` |
| `LkChartRing`      | — | 当前版本未额外暴露自定义事件 | — |
| `LkChartRadarLite` | — | 当前版本未额外暴露自定义事件 | — |
| `LkChartStatCard`  | — | 当前版本未额外暴露自定义事件 | — |

## 注意事项

> [!WARNING]
> ⚠️可能存在平台差异：图表基于 Canvas 2D 绘制，H5 与小程序在字体度量、抗锯齿、渐变渲染上可能存在细微差异。

> [!TIP]
> 数字类型高度会按 rpx 处理；如果需要固定 CSS 高度，可以传入字符串，例如 `height="180px"`。

## 发布验收

`chart-lite` 聚合覆盖 `lk-chart-ring`、`lk-chart-sparkline`、`lk-chart-stat-card`、`lk-chart-radar-lite`，已纳入 dynamic-visual showcase 回归，发布前按下面边界验收：

| 场景 | 验收方式 | 要点 |
|------|----------|------|
| 展示台基线 | 自动回归 | `tests/visual/dynamic-visual-showcase.spec.ts` 校验 `chart-lite` 聚合路由、verified 状态与中风险标记 |
| 子组件覆盖 | 自动/人工 | ring、sparkline、stat-card、radar-lite 均在聚合 Demo 中可见 |
| 平台差异 | 人工验收 | Canvas 文字度量、渐变、触摸高亮点位在 H5/App/小程序端可接受 |

> [!TIP]
> 子组件已拆出独立文档页；当前 Demo 与 showcase 仍复用 `chart-lite` 聚合演示，便于一次性覆盖 ring、sparkline、stat-card、radar-lite 的视觉回归。
