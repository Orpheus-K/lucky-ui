---
title: ChartPie 饼/环图
phone: chart-pie
---

# ChartPie 饼/环图

高性能饼图/圆环图组件。圆环模式通过 `lineCap=round` 实现末端圆润，支持 DPR 防模糊、RAF 进入动画与触摸 Tooltip。

## 基础用法

```vue
<lk-chart-pie :data="data" donut :donut-width="30" :height="360" />
```

## Props

- `data`: `{ label?: string; value: number; color?: string }[]`
- `height`: `number | string`（默认 `320`，数字按 `rpx` 处理）
- `padding`: `number`（默认 `24`，rpx）
- `donut`: `boolean`（默认 `true`）
- `donutWidth`: `number`（默认 `28`，rpx）
- `animationDuration`: `number`（默认 `700`，ms）
- `tooltip`: `boolean`（默认 `true`）

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| hoverChange | 触摸高亮扇区变化，无高亮时为 `-1` | `(index: number)` |

## 注意事项

- 组件会自动读取父容器宽高，建议通过 `height` 或父容器样式明确高度。
- 小程序中 Canvas 为原生层，Tooltip 采用“绘制在 Canvas 内”的方式避免层级问题。
- 样式入口已独立为组件内 `lk-chart-pie.scss`，主题可通过 `--lk-chart-tooltip-*` 变量覆盖。

