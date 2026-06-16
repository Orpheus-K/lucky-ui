---
title: NumberRoller 数字翻牌
phone: number-roller
---

# NumberRoller 数字翻牌

用于数据看板、订单金额、实时统计、营收数字等需要“数字滚动增长感”的场景。组件支持整数、小数、千分位与自定义格式化输出。

## 交互式调试

<PropsPlayground
  component="number-roller"
  :props-def="[
    { key: 'value', type: 'number', label: '数值', default: 12345 },
    { key: 'speed', type: 'number', label: '动画速度(ms)', default: 800 },
    { key: 'digitHeight', type: 'number', label: '数字高度', default: 56 },
    { key: 'grouping', type: 'boolean', label: '千分位', default: true },
  ]"
/>

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(12890)
</script>

<template>
  <lk-number-roller :value="count" />
</template>
```

## 调整动画时长

```vue
<lk-number-roller :value="3560" :speed="1200" />
```

## 金额显示

```vue
<view style="display:flex;align-items:flex-end;gap:8rpx">
  <text style="font-size:48rpx;color:var(--lk-color-primary)">¥</text>
  <lk-number-roller :value="482345.78" :decimals="2" :digit-height="64" :speed="600" />
</view>
```

## 千分位与分隔符

```vue
<lk-number-roller
  :value="1234567.89"
  :decimals="2"
  :grouping="true"
  group-separator=","
  decimal-separator="."
/>
```

## 自定义格式化

适合在数字前后拼接单位或做业务型文本格式化。

```vue
<lk-number-roller
  :value="85"
  :formatter="(value) => `${value}%`"
/>
```

## 关闭滚动动画

```vue
<lk-number-roller :value="9999" :autoplay="false" />
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import NumberRollerDemo from '@/components/demos/number-roller-demo.vue'
</script>

<template>
  <NumberRollerDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-number-roller />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| value | 最终展示的值 | `number \| string` | `0` |
| speed | 动画时长，单位 ms | `number` | `800` |
| easing | 动画缓动曲线 | `string` | `'cubic-bezier(0.33, 1, 0.68, 1)'` |
| digitHeight | 单个数字视窗高度，单位 rpx | `number` | `56` |
| decimals | 小数位数，传 `null` 表示跟随原值 | `number \| null` | `null` |
| grouping | 是否启用千分位分隔 | `boolean` | `true` |
| groupSeparator | 千分位分隔符 | `string` | `','` |
| decimalSeparator | 小数分隔符 | `string` | `'.'` |
| autoplay | 是否启用滚动动画 | `boolean` | `true` |
| formatter | 自定义格式化函数 | `(value) => string \| number` | `null` |

### Events

当前版本未额外暴露自定义事件。

### Slots

当前版本未提供插槽。

## 使用建议

::: tip
如果你的场景对布局稳定性要求较高，建议在同一块看板中统一 `digitHeight` 和字体大小，避免不同数字组件之间的视觉跳动。
:::
