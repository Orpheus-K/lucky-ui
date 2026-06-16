---
title: Countdown 倒计时
phone: countdown
---

# Countdown 倒计时

用于活动截止、支付剩余时间、任务时限等场景，支持目标时间、毫秒刷新、自定义格式与手动控制。

## 基础用法

```vue
<lk-countdown :time="30 * 60 * 1000" />
```

## 目标时间

```vue
<lk-countdown
  :target-time="Date.now() + 2 * 60 * 60 * 1000"
  format="HH:mm:ss"
  type="danger"
  variant="card"
  size="lg"
/>
```

## 自定义格式

```vue
<lk-countdown :time="26 * 60 * 60 * 1000" format="DD天 HH:mm:ss" />
<lk-countdown :time="90 * 1000" format="ss.SS秒" millisecond />
```

## 手动控制

```vue
<template>
  <lk-countdown ref="countdownRef" :time="20000" :auto-start="false" @finish="onFinish" />
  <lk-button @tap="countdownRef?.start()">开始</lk-button>
  <lk-button @tap="countdownRef?.pause()">暂停</lk-button>
  <lk-button @tap="countdownRef?.reset(true)">重置</lk-button>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| time | 剩余时长，单位 ms | `number` | `0` |
| targetTime | 截止时间，时间戳或日期字符串 | `number / string` | `''` |
| format | 展示格式，支持 `DD/HH/mm/ss/SSS` 等占位 | `string` | `'HH:mm:ss'` |
| autoStart | 是否自动开始 | `boolean` | `true` |
| millisecond | 是否毫秒级刷新 | `boolean` | `false` |
| padZero | 是否补零 | `boolean` | `true` |
| trimZeroDay | 是否隐藏 0 天 | `boolean` | `false` |
| showZero | 结束后是否保留 00:00:00 | `boolean` | `true` |
| type | 语义色 | `default / primary / success / warning / danger / info` | `default` |
| variant | 视觉形态 | `plain / block / card` | `block` |
| size | 尺寸 | `sm / md / lg` | `md` |
| prefix | 前缀文本 | `string` | `''` |
| suffix | 后缀文本 | `string` | `''` |
| unitMap | 单位文本映射 | `object` | `{}` |
| formatter | 自定义格式化函数 | `(timeData) => string / number` | `null` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| start | 开始时触发 | - |
| pause | 暂停时触发 | `(remaining: number)` |
| reset | 重置时触发 | `(remaining: number)` |
| finish | 倒计时结束时触发 | - |
| change | 时间变化时触发 | `(timeData: CountdownTimeData)` |

### Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|------------|
| default | 自定义展示内容 | `{ timeData }` |

### Methods

| 方法名 | 说明 |
|--------|------|
| start() | 开始倒计时 |
| pause() | 暂停倒计时 |
| reset(autoStart?: boolean) | 重置倒计时 |

## Demo

项目演示位于 `src/components/demos/countdown-demo.vue`。
