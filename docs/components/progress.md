---
title: Progress 进度条
phone: progress
---

# Progress 进度条

用于展示任务完成比例，适合上传、表单步骤、异步处理进度等场景。

## 交互式调试

<PropsPlayground
  component="progress"
  :props-def="[
    { key: 'percentage', type: 'number', label: '百分比', default: 50 },
    { key: 'strokeWidth', type: 'number', label: '线宽', default: 12 },
    { key: 'showText', type: 'boolean', label: '显示文字', default: true },
    { key: 'textInside', type: 'boolean', label: '文字内嵌', default: false },
    { key: 'striped', type: 'boolean', label: '条纹', default: false },
    { key: 'animated', type: 'boolean', label: '动画', default: false },
  ]"
/>

## 基础用法

最常见的用法是传入 `percentage`，组件会自动将值限制在 `0 ~ 100` 之间。

```vue
<lk-progress :percentage="50" />
```

## 状态色

当不想手动指定颜色时，可通过 `status` 使用内置语义色。

```vue
<template>
  <lk-progress :percentage="30" />
  <lk-progress :percentage="70" status="success" />
  <lk-progress :percentage="50" status="warning" />
  <lk-progress :percentage="100" status="error" />
</template>
```

## 条纹效果

通过 `striped` 增加进度感，通过 `animated` 让条纹流动，适合“进行中”状态。

```vue
<lk-progress :percentage="50" striped animated />
```

## 自定义高度与颜色

```vue
<lk-progress :percentage="50" :stroke-width="24" color="#f56c6c" track-color="#fee2e2" />
```

## 文字内显

当进度条高度足够时，可将百分比文字放到条内。

```vue
<lk-progress :percentage="80" :stroke-width="32" text-inside />
```

## 动态更新

`percentage` 是普通响应式属性，适合配合上传进度、轮询状态、按钮交互动态更新。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const progress = ref(20)

function increase() {
  progress.value = Math.min(progress.value + 10, 100)
}
</script>

<template>
  <lk-progress :percentage="progress" />
  <lk-button type="primary" @click="increase">继续</lk-button>
</template>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import ProgressDemo from '@/components/demos/progress-demo.vue'
</script>

<template>
  <ProgressDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-progress />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| percentage | 进度百分比，组件内部会限制在 `0 ~ 100` | `number` | `0` |
| striped | 是否显示条纹 | `boolean` | `false` |
| animated | 条纹是否流动 | `boolean` | `false` |
| textInside | 是否将文字显示在进度条内部 | `boolean` | `false` |
| showText | 是否显示进度文字 | `boolean` | `true` |
| strokeWidth | 进度条高度，数字按 `rpx` 处理 | `number` | `12` |
| color | 进度条颜色，支持纯色或渐变背景 | `string` | `''` |
| trackColor | 轨道颜色 | `string` | `''` |
| status | 状态色 | `'' \| success \| warning \| error \| danger` | `''` |
| id | 根节点 id | `string` | `''` |
| customClass | 根节点自定义类名 | `string \| object \| array` | — |
| customStyle | 根节点自定义样式 | `string \| object` | — |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 进度百分比变化时触发，值已限制在 `0 ~ 100` | `(percentage, oldPercentage)` |
| complete | 进度首次到达 `100` 时触发 | `(percentage)` |

### Slots

无

## 使用建议

::: tip
需要品牌色或渐变色时优先使用 `color`；仅表达语义状态时优先使用 `status`，便于统一主题。
:::

::: warning
启用 `textInside` 时，请同步增大 `strokeWidth`，否则文字区域会显得拥挤。
:::
