---
title: ChartLine 折线图
phone: chart-line
---

# ChartLine 折线图

高性能折线图组件，使用平滑贝塞尔曲线（Catmull-Rom 转 Bezier）绘制折线，支持 DPR 防模糊、RAF 进入动画与触摸 Tooltip。

## 基础用法

```vue
<lk-chart-line :data="data" :height="360" />
```

## Props

- `data`: `{ label?: string; value: number }[]`
- `height`: `number | string`（默认 `320`，数字按 `rpx` 处理）
- `padding`: `number`（默认 `24`，rpx）
- `lineWidth`: `number`（默认 `6`，rpx）
- `animationDuration`: `number`（默认 `700`，ms）
- `tooltip`: `boolean`（默认 `true`）

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| hoverChange | 触摸高亮点变化，无高亮时为 `-1` | `(index: number)` |

## 注意事项

- 组件会自动读取父容器宽高，建议通过 `height` 或父容器样式明确高度。
- H5 容器尺寸变化会自动重绘；在小程序的折叠面板、Tab 或动态布局中，可在展示后调用组件的 `refresh/resize` 能力重新测量。
- `NaN` 和 `Infinity` 会规范化为 `0`，避免单个异常点破坏整条路径。
- Canvas 提供数据摘要作为读屏标签；重要数据仍建议在相邻文本中同步呈现。
- 小程序中 Canvas 为原生层，Tooltip 采用“绘制在 Canvas 内”的方式避免层级问题。
- 样式入口已独立为组件内 `lk-chart-line.scss`，主题可通过 `--lk-chart-tooltip-*` 变量覆盖。

