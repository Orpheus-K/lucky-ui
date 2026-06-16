---
title: Space 间距
phone: space
---

# Space 间距

用于在多个子元素之间统一管理间距，避免在每个子元素上单独写 `margin`。

## 交互式调试

<PropsPlayground
  component="space"
  :props-def="[
    { key: 'gap', type: 'string', label: '间距', default: 'md' },
    { key: 'direction', type: 'enum', label: '方向', values: ['horizontal', 'vertical'], default: 'horizontal' },
    { key: 'wrap', type: 'boolean', label: '自动换行', default: false },
    { key: 'fill', type: 'boolean', label: '填满', default: false },
  ]"
/>

## 基础用法

```vue
<template>
  <lk-space>
    <lk-button>按钮一</lk-button>
    <lk-button>按钮二</lk-button>
    <lk-button>按钮三</lk-button>
  </lk-space>
</template>
```

## 设置间距

`gap` 支持预设值、数字、带单位字符串，以及 `[水平间距, 垂直间距]` 数组。

```vue
<template>
  <lk-space gap="lg">
    <lk-tag>大间距</lk-tag>
    <lk-tag>大间距</lk-tag>
  </lk-space>

  <lk-space :gap="24">
    <lk-tag>24rpx</lk-tag>
    <lk-tag>24rpx</lk-tag>
  </lk-space>

  <lk-space :gap="['24rpx', '12rpx']" wrap>
    <lk-tag v-for="item in 6" :key="item">标签 {{ item }}</lk-tag>
  </lk-space>
</template>
```

## 垂直布局

列表、设置项、表单块之间的排版推荐使用 `direction="vertical"`。

```vue
<template>
  <lk-space direction="vertical" :gap="16">
    <view>项目 A</view>
    <view>项目 B</view>
    <view>项目 C</view>
  </lk-space>
</template>
```

## 自动换行

在标签流、筛选项等横向密集场景中，可开启 `wrap`。

```vue
<template>
  <lk-space wrap gap="md">
    <lk-tag v-for="item in 12" :key="item">标签 {{ item }}</lk-tag>
  </lk-space>
</template>
```

## 填满父容器

`fill` 常用于让每个子项更容易做等宽布局或拉伸布局。

```vue
<template>
  <lk-space fill>
    <lk-button block>保存</lk-button>
    <lk-button block plain>取消</lk-button>
  </lk-space>
</template>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import SpaceDemo from '@/components/demos/space-demo.vue'
</script>

<template>
  <SpaceDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-space />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customClass | 组件可视根节点自定义类名 | `string \| object \| array` | `''` |
| customStyle | 组件可视根节点自定义样式 | `string \| object` | `''` |
| gap | 间距大小。支持预设值、数字、带单位字符串或数组 `[水平, 垂直]` | `number \| string \| [number \| string, number \| string] \| 'sm' \| 'md' \| 'lg'` | `md` |
| direction | 排列方向 | `horizontal \| vertical` | `horizontal` |
| align | 交叉轴对齐方式 | `start \| center \| end \| baseline \| stretch` | `horizontal` 时默认 `center`；`vertical` 时默认 `stretch` |
| wrap | 是否自动换行 | `boolean` | `false` |
| fill | 是否填满父容器宽度 | `boolean` | `false` |

### Events

当前版本未额外暴露自定义事件。

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 需要统一管理间距的子元素 |

## 使用建议

::: tip
优先把 `lk-space` 当作“布局容器”使用，而不是简单的视觉间距工具，这样更方便统一维护页面结构。
:::

::: warning
当 `gap` 传数组时，顺序是 `[水平间距, 垂直间距]`，不是 `[垂直, 水平]`。
:::
