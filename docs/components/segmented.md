---
title: Segmented 分段器
phone: segmented
---

# Segmented 分段控制器

用于在少量互斥选项之间快速切换，适合榜单切换、内容频道切换、筛选维度切换等场景。组件内置磁吸滑块、尺寸切换与插槽自定义能力。

## 交互式调试

<PropsPlayground
  component="segmented"
  :props-def="[
    { key: 'size', type: 'enum', label: '尺寸', values: ['sm', 'md', 'lg'], default: 'md' },
    { key: 'animated', type: 'boolean', label: '动画', default: true },
  ]"
/>

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const active = ref('daily')
const options = [
  { label: '每日精选', value: 'daily' },
  { label: '周榜', value: 'weekly' },
  { label: '月榜', value: 'monthly' },
]
</script>

<template>
  <lk-segmented
    v-model="active"
    :options="options"
    @select="handleSelect"
    @reselect="handleReselect"
  />
</template>
```

## 块级模式

适合放在页面顶部作为内容切换条。

```vue
<lk-segmented v-model="active" :options="options" block />
```

## 不同尺寸

```vue
<lk-segmented v-model="active" :options="options" size="sm" />
<lk-segmented v-model="active" :options="options" size="md" />
<lk-segmented v-model="active" :options="options" size="lg" />
```

## 自定义圆角、间距与动画

```vue
<lk-segmented
  v-model="active"
  :options="options"
  radius="20rpx"
  inset="6rpx"
  gutter="8rpx"
  :duration="500"
  easing="cubic-bezier(0.34,1.56,0.64,1)"
/>
```

## 自定义高度

```vue
<lk-segmented v-model="active" :options="options" height="96rpx" />
```

## 自定义选项内容

通过 `item` 插槽可以渲染图标、徽章或额外状态。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const value = ref('1')
const options = [
  { label: 'A', value: '1' },
  { label: 'B', value: '2' },
  { label: 'C', value: '3' },
]
</script>

<template>
  <lk-segmented v-model="value" :options="options">
    <template #item="{ option, active }">
      <view style="padding: 0 24rpx; font-weight: 600">
        <text>{{ option.label }}</text>
        <text v-if="active" style="color:#f56c6c;margin-left:6rpx">★</text>
      </view>
    </template>
  </lk-segmented>
</template>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import SegmentedDemo from '@/components/demos/segmented-demo.vue'
</script>

<template>
  <SegmentedDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-segmented />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 当前选中值，支持 `v-model` | `string \| number` | `''` |
| options | 选项列表 | `SegmentedOption[]` | `[]` |
| size | 尺寸 | `sm \| md \| lg` | `md` |
| block | 是否块级铺满父容器 | `boolean` | `false` |
| radius | 整体圆角 | `string` | `''` |
| duration | 滑块动画时长，单位 ms | `number` | `260` |
| easing | 滑块动画缓动函数 | `string` | `'cubic-bezier(0.22,1,0.36,1)'` |
| inset | 滑块与外层轨道的内缩距离 | `string` | `'4rpx'` |
| gutter | 选项之间的留缝距离 | `string` | `'0rpx'` |
| animated | 是否开启动画 | `boolean` | `true` |
| height | 自定义高度 | `string` | `''` |
| id | 根节点 id | `string` | `''` |
| customClass | 根节点自定义类名 | `string \| object \| array` | — |
| customStyle | 根节点自定义样式 | `string \| object` | — |

### SegmentedOption

| 字段 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| label | 选项文案 | `string` | — |
| value | 选项值 | `string \| number` | — |
| disabled | 是否禁用 | `boolean` | `undefined` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 选中值变化时触发 | `(value)` |
| change | 点击切换后触发 | `(value, option, oldValue)` |
| click | 点击任意选项时触发 | `({ value, option, event })` |
| select | 选择值发生变化时触发 | `({ value, option, oldValue })` |
| reselect | 点击当前已选项时触发 | `({ value, option, event })` |
| click-disabled | 点击禁用选项时触发 | `({ value, option, event })` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| item | 自定义分段项内容，作用域参数为 `{ option, active }` |

## 使用建议

::: tip
`lk-segmented` 适合少量平级选项切换。如果选项很多、需要横向滚动或二级导航，建议改用自定义导航或 `lk-horizontal-scroll` 承载选项。
:::
