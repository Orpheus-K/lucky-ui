---
title: Avatar 头像
phone: avatar
---

# Avatar 头像

展示用户或实体头像，支持图片、文字、图标三种形式。

## 交互式调试

<PropsPlayground
  component="avatar"
  :props-def="[
    { key: 'shape', type: 'enum', label: '形状', values: ['circle', 'square', 'rounded'], default: 'circle' },
    { key: 'size', type: 'string', label: '尺寸', default: '48' },
    { key: 'text', type: 'string', label: '文本', default: '' },
    { key: 'src', type: 'string', label: '图片地址', default: '' },
  ]"
/>

## 基础用法

```vue
<template>
  <view class="demo-row">
    <lk-avatar src="https://i.pravatar.cc/100?img=1" />
    <lk-avatar text="张" />
    <lk-avatar icon="person" />
  </view>
</template>
```

## 尺寸

```vue
<template>
  <view class="demo-row" style="align-items:flex-end">
    <lk-avatar src="https://i.pravatar.cc/100" size="sm" />
    <lk-avatar src="https://i.pravatar.cc/100" size="md" />
    <lk-avatar src="https://i.pravatar.cc/100" size="lg" />
    <lk-avatar src="https://i.pravatar.cc/100" size="xl" />
    <lk-avatar src="https://i.pravatar.cc/100" :size="90" />
  </view>
</template>
```

## 形状

```vue
<template>
  <view class="demo-row">
    <lk-avatar src="https://i.pravatar.cc/100?img=2" shape="circle" />
    <lk-avatar src="https://i.pravatar.cc/100?img=2" shape="square" />
    <lk-avatar src="https://i.pravatar.cc/100?img=2" shape="rounded" />
  </view>
</template>
```

## 头像堆叠

```vue
<script setup lang="ts">
const avatars = [
  'https://i.pravatar.cc/100?img=1',
  'https://i.pravatar.cc/100?img=2',
  'https://i.pravatar.cc/100?img=3',
]
</script>

<template>
  <view style="display:flex">
    <lk-avatar
      v-for="(src, i) in avatars" :key="i"
      :src="src"
      :style="{ marginLeft: i > 0 ? '-16rpx' : 0, zIndex: avatars.length - i }"
    />
    <lk-avatar
      text="+3"
      :style="{ marginLeft: '-16rpx', background: '#e2e8f0', color: '#64748b' }"
    />
  </view>
</template>
```

## 图片加载兜底

```vue
<template>
  <view class="demo-row">
    <!-- 有效图片 -->
    <lk-avatar src="https://i.pravatar.cc/100?img=3" />
    <!-- 无效图片 → 显示备用图标 -->
    <lk-avatar src="invalid-url.jpg" fallback-icon="person" />
    <!-- 无效图片 → 显示备用文字 -->
    <lk-avatar src="invalid-url.jpg" fallback-text="U" />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| src | 图片地址 | `string` | `''` |
| text | 文字内容（无 src 时显示） | `string` | `''` |
| icon | 图标名（无 src 和 text 时显示） | `string` | `'person'` |
| size | 尺寸，支持预设或数字（rpx） | `sm \| md \| lg \| xl \| number` | `md` |
| shape | 形状 | `circle \| square \| rounded` | `circle` |
| fallbackIcon | 图片加载失败时的图标 | `string` | `'person'` |
| fallbackText | 图片加载失败时的文字 | `string` | `''` |
| customClass | 额外类名 | `string` | `''` |
| customStyle | 额外样式 | `string \| object` | `''` |
