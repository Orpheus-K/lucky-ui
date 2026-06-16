---
title: CalendarPicker 日历选择器
phone: calendar-picker
---

# CalendarPicker 日历选择器

`lk-calendar-picker` 是弹层式日期选择器。它内部复用 `lk-popup`、`lk-calendar`、`lk-button` 和 `lk-slider`，适合表单日期、预约时间、行程范围、活动起止时间等需要“打开选择、确认保存”的场景。

## 设计定位

- 选择器组件：自带触发器、弹层、确认按钮和重置入口。
- 内容自适应：弹层默认按内容高度展开，避免底部大块留白。
- 组合能力：日期面板来自 `lk-calendar`，时间选择来自 `lk-slider`。
- 移动优先：日期切换依赖滑动，底部确认按钮使用胶囊形主按钮。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const date = ref('2026-05-14')
</script>

<template>
  <lk-calendar-picker v-model="date" />
</template>
```

## 自定义标题和占位

`title` 控制弹层标题，`placeholder` 控制未选择时触发器文案。

```vue
<lk-calendar-picker
  v-model="date"
  title="选择入住日期"
  placeholder="请选择入住日期"
/>
```

## 区间选择

`mode="range"` 时绑定值为数组。点击保存后才会把临时选择提交到 `v-model`。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const trip = ref(['2026-09-30', '2026-10-03'])
</script>

<template>
  <lk-calendar-picker
    v-model="trip"
    mode="range"
    title="Trip Dates"
    view-date="2026-09-30"
    :first-day-of-week="0"
  />
</template>
```

## 日期 + 时间滑块

开启 `show-time` 后，底部会出现基于 `lk-slider` 的时间滑块。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const value = ref('2026-05-14 10:00')
</script>

<template>
  <lk-calendar-picker
    v-model="value"
    show-time
    time-precision="minute"
    :time-step="15"
  />
</template>
```

## 范围日期 + 起止时间

范围模式下会显示开始、结束两条时间滑块。即使只选了开始日期，结束滑块也会保留禁用占位，弹层高度不会在选择过程中跳变。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const trip = ref(['2026-09-30 10:00', '2026-10-03 18:15'])
</script>

<template>
  <lk-calendar-picker
    v-model="trip"
    mode="range"
    title="Trip Dates"
    view-date="2026-09-30"
    show-time
    time-precision="minute"
    :time-step="15"
  />
</template>
```

## 时间精度

`timePrecision` 控制时间格式和滑块粒度：

| 精度 | 输出示例 | 说明 |
|------|----------|------|
| `hour` | `2026-05-14 10:00` | 整点选择 |
| `minute` | `2026-05-14 10:15` | 分钟选择 |
| `second` | `2026-05-14 10:15:30` | 秒级选择 |

`timeStep` 会按当前精度单位递增。例如 `time-precision="minute"` 且 `:time-step="15"` 表示 15 分钟一步。

## 自定义触发器

通过 `trigger` 插槽可以接入表单项、列表行或自定义按钮。

```vue
<lk-calendar-picker v-model="date">
  <template #trigger="{ open, displayValue }">
    <view class="date-row" @tap="open">
      <text>出发日期</text>
      <text>{{ displayValue }}</text>
    </view>
  </template>
</lk-calendar-picker>
```

## 控制弹层显示

使用 `v-model:show` 可以从外部控制弹层。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const show = ref(false)
const date = ref('')
</script>

<template>
  <lk-calendar-picker v-model="date" v-model:show="show" />
</template>
```

## 国际化

`CalendarPicker` 使用 Lucky UI 全局语言包，调用 `Locale.use()` 后会自动更新标题、占位、保存、重置、开始、结束、时间等文案。

```ts
import { Locale } from '@/uni_modules/lucky-ui'

Locale.use('en')
```

## 与 Calendar 的关系

- `Calendar` 是内联面板，适合被放进任意容器。
- `CalendarPicker` 是完整选择器，适合表单和弹层交互。
- `CalendarPicker` 的日期能力继承 `Calendar` 的常用配置，例如 `viewDate`、`minDate`、`maxDate`、`disabledDates`、`markers`、`firstDayOfWeek`、`showToday`、`showYear`、`swipeable`。

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| modelValue | 绑定值 | `string / string[]` | — | `''` |
| show | 是否显示弹层，支持 `v-model:show` | `boolean` | — | `false` |
| mode | 选择模式 | `string` | `single / multiple / range` | `single` |
| size | 日历尺寸 | `string` | `sm / md / lg` | `md` |
| viewMode | 日历视图 | `string` | `month / week` | `month` |
| viewDate | 当前展示月份，支持 `YYYY-MM / YYYY-MM-DD` | `string` | — | `''` |
| title | 弹层标题 | `string` | — | `''` |
| placeholder | 触发器占位文案 | `string` | — | `''` |
| confirmText | 确认按钮文案 | `string` | — | `''` |
| resetText | 重置文案 | `string` | — | `''` |
| showReset | 是否显示重置入口 | `boolean` | — | `true` |
| showTime | 是否显示时间滑块 | `boolean` | — | `false` |
| timePrecision | 时间精度 | `string` | `hour / minute / second` | `minute` |
| timeStep | 时间步长，按精度单位递增 | `number` | — | `1` |
| defaultStartTime | 默认开始时间 | `string` | `HH:mm:ss` | `00:00:00` |
| defaultEndTime | 默认结束时间 | `string` | `HH:mm:ss` | `23:59:59` |
| minDate | 最小可选日期 | `string` | `YYYY-MM-DD` | `''` |
| maxDate | 最大可选日期 | `string` | `YYYY-MM-DD` | `''` |
| disabledDates | 禁用日期列表 | `string[]` | — | `[]` |
| markers | 日期标记 | `CalendarMarker[]` | — | `[]` |
| firstDayOfWeek | 周起始日，0 为周日，1 为周一 | `number` | `0-6` | `1` |
| showAdjacentDays | 是否显示相邻月份日期 | `boolean` | — | `true` |
| showToday | 是否显示今日快捷入口 | `boolean` | — | `true` |
| showYear | 是否显示年份 | `boolean` | — | `true` |
| swipeable | 是否支持日历滑动 | `boolean` | — | `true` |
| popupPosition | 弹出方向 | `string` | `center / top / bottom / left / right` | `bottom` |
| popupHeight | 弹层高度，空值表示内容自适应 | `string` | — | `''` |
| closeOnOverlay | 点击遮罩关闭 | `boolean` | — | `true` |
| closeOnConfirm | 确认后关闭 | `boolean` | — | `true` |
| readonly | 是否只读 | `boolean` | — | `false` |
| disabled | 是否禁用 | `boolean` | — | `false` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 选中值变化 | `(value)` |
| update:show | 弹层显示状态变化 | `(show)` |
| change | 确认后触发 | `(value)` |
| confirm | 点击保存 | `(value)` |
| reset | 点击重置 | `()` |
| open | 打开弹层 | `()` |
| close | 关闭弹层 | `()` |
| select | 选择日期 | `(day)` |

### Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| trigger | 自定义触发器 | `{ open, value, displayValue }` |

## 注意事项

::: tip
开启 `show-time` 后，输出值会变成 `YYYY-MM-DD HH:mm` 或 `YYYY-MM-DD HH:mm:ss`。未开启时只输出日期。
:::

::: warning
`CalendarPicker` 是选择器，不是纯面板。若只需要把日历嵌入自定义容器，请使用 `Calendar`。
:::
