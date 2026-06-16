---
title: Calendar 日历
phone: calendar
---

# Calendar 日历

`lk-calendar` 是纯日历面板，不自带卡片背景、边框、阴影和外层留白，适合放进卡片、表单、弹层、抽屉等任意容器中。它负责日期网格、选中状态、范围连接、标记点、周视图和滑动切换。

## 设计定位

- 面板型组件：容器视觉由外部决定，组件本身只表达日期状态。
- 移动优先：默认支持左右滑动切换月份或周。
- 状态清晰：非本月日期降级，选中态使用品牌色，区间选择保持连续底色。
- 可组合：需要弹层选择、确认按钮和时间滑块时，使用 `CalendarPicker`。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const date = ref('2026-05-14')
</script>

<template>
  <view class="panel">
    <lk-calendar v-model="date" view-date="2026-05" />
  </view>
</template>
```

## 单选日历

可以通过 `title` 指定头部标题。默认头部左侧显示月份和年份，右侧显示当前选择和“今天”入口。

```vue
<lk-calendar
  v-model="date"
  view-date="2026-05"
  title="五月计划"
/>
```

## 区间选择

`mode="range"` 时，绑定值为数组。区间中间日期会使用连续底色连接，开始和结束日期使用品牌色强调。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const range = ref(['2026-05-18', '2026-05-22'])
</script>

<template>
  <lk-calendar
    v-model="range"
    mode="range"
    view-date="2026-05"
    min-date="2026-05-03"
    max-date="2026-05-28"
    :disabled-dates="['2026-05-12', '2026-05-13']"
  />
</template>
```

## 多选与标记

`mode="multiple"` 支持多日期选择。`markers` 可用于展示业务状态点、环形标记或徽标。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const dates = ref(['2026-05-08', '2026-05-15'])
const markers = [
  { date: '2026-05-05', type: 'dot', color: 'var(--lk-color-success)' },
  { date: '2026-05-20', type: 'ring', color: 'var(--lk-color-warning)' },
]
</script>

<template>
  <lk-calendar
    v-model="dates"
    mode="multiple"
    view-date="2026-05"
    :markers="markers"
  />
</template>
```

::: tip
如果今天被选中，不建议再用文字徽标表达“今”。组件会把 today 的“今/Today”类徽标降级为点，避免底部信息拥挤。
:::

## 单行周视图

`view-mode="week"` 会切换为单行周视图，适合行程、打卡、横向日期导航等高频扫读场景。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const date = ref('2026-05-01')
</script>

<template>
  <lk-calendar
    v-model="date"
    view-mode="week"
    view-date="2026-05-01"
    :first-day-of-week="0"
    :show-header="false"
  />
</template>
```

## 滑动切换

默认开启 `swipeable`：

- 月视图：左滑下一月，右滑上一月。
- 周视图：左滑下一周，右滑上一周。
- 横向手势才会触发切换，竖向滚动不会被抢占。

```vue
<lk-calendar v-model="date" swipeable />
```

## 自定义日期格

通过 `day` 插槽可以完全接管日期格渲染，作用域参数会包含选中、区间、禁用、今日、非本月等状态。

```vue
<lk-calendar v-model="date">
  <template #day="{ day }">
    <view class="custom-day" :class="{ active: day.isSelected }">
      <text>{{ day.day }}</text>
      <text v-if="day.markers.length">•</text>
    </view>
  </template>
</lk-calendar>
```

## 国际化

`Calendar` 使用 Lucky UI 全局语言包，调用 `Locale.use()` 后会自动更新月份、星期、今天和选中摘要。

```ts
import { Locale } from '@/uni_modules/lucky-ui'

Locale.use('en')
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| modelValue | 绑定值，`single` 为字符串，`multiple/range` 为数组 | `string / string[]` | — | `''` |
| mode | 选择模式 | `string` | `single / multiple / range` | `single` |
| size | 尺寸 | `string` | `sm / md / lg` | `md` |
| viewMode | 视图模式 | `string` | `month / week` | `month` |
| viewDate | 当前展示月份，支持 `v-model:viewDate` | `string` | `YYYY-MM / YYYY-MM-DD` | `''` |
| title | 头部标题 | `string` | — | 当前月份 |
| minDate | 最小可选日期 | `string` | `YYYY-MM-DD` | `''` |
| maxDate | 最大可选日期 | `string` | `YYYY-MM-DD` | `''` |
| disabledDates | 禁用日期列表 | `string[]` | — | `[]` |
| markers | 日期标记 | `CalendarMarker[]` | — | `[]` |
| firstDayOfWeek | 周起始日，0 为周日，1 为周一 | `number` | `0-6` | `1` |
| showAdjacentDays | 是否显示相邻月份日期 | `boolean` | — | `true` |
| showHeader | 是否显示头部 | `boolean` | — | `true` |
| showToday | 是否显示今日快捷入口 | `boolean` | — | `true` |
| showYear | 是否显示年份 | `boolean` | — | `true` |
| swipeable | 是否支持左右滑动切换 | `boolean` | — | `true` |
| readonly | 是否只读 | `boolean` | — | `false` |
| disabled | 是否禁用 | `boolean` | — | `false` |
| customClass | 自定义类名 | `string / object / array` | — | `''` |
| customStyle | 自定义样式 | `string / object` | — | `''` |

### CalendarMarker

| 字段 | 说明 | 类型 |
|------|------|------|
| date | 标记日期 | `string` |
| label | 徽标文本，仅 `badge` 类型展示 | `string` |
| color | 标记颜色 | `string` |
| type | 标记类型 | `dot / badge / ring` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 选中值变化 | `(value: CalendarValue)` |
| update:viewDate | 展示月份变化 | `(value: string)` |
| change | 选中值变化 | `(value: CalendarValue, day: CalendarDay)` |
| select | 点击可选日期 | `(day: CalendarDay)` |
| month-change | 月份切换 | `(value: string)` |
| week-change | 周视图切换 | `({ start, end, viewDate })` |
| panel-change | 面板切换 | `({ year, month })` |
| click-disabled | 点击禁用日期 | `(day: CalendarDay)` |

### Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| header | 自定义头部 | `{ title, subtitle, viewDate, summary, prev, next, today }` |
| day | 自定义日期格 | `{ day }` |
| marker | 自定义标记点 | `{ markers, day }` |
| footer | 自定义底部 | `{ value, viewDate }` |

## 注意事项

::: tip
所有日期均使用 `YYYY-MM-DD` 字符串。区间模式下再次点击日期会开启新的区间选择。
:::

::: warning
`Calendar` 是面板，不负责弹层、确认按钮和表单触发器。需要完整选择器体验时请使用 `CalendarPicker`。
:::
