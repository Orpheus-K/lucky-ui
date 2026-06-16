---
title: Avatar 头像
phone: avatar
---

# Avatar 头像

展示用户或实体头像，支持图片、文字、图标三种形态，适合用户信息、成员列表和评论区场景。

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

## 尺寸与形状

```vue
<template>
  <view class="demo-row">
    <lk-avatar src="https://i.pravatar.cc/100?img=2" size="sm" />
    <lk-avatar src="https://i.pravatar.cc/100?img=2" size="md" />
    <lk-avatar src="https://i.pravatar.cc/100?img=2" size="lg" />
    <lk-avatar src="https://i.pravatar.cc/100?img=2" shape="square" />
    <lk-avatar src="https://i.pravatar.cc/100?img=2" shape="rounded" />
  </view>
</template>
```

## 图片兜底

```vue
<template>
  <view class="demo-row">
    <lk-avatar src="invalid-url.jpg" fallback-icon="person" />
    <lk-avatar src="invalid-url.jpg" fallback-text="U" />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| src | 图片地址 | `string` | `''` |
| text | 文字内容，无图片时显示 | `string` | `''` |
| icon | 图标名，无图片和文字时显示 | `string` | `'person'` |
| size | 尺寸，支持预设或数字 rpx | `sm / md / lg / xl / number` | `md` |
| shape | 形状 | `circle / square / rounded` | `circle` |
| fallbackIcon | 图片加载失败时的图标 | `string` | `'person'` |
| fallbackText | 图片加载失败时的文字 | `string` | `''` |
| customClass | 自定义类名 | `string / object / array` | — |
| customStyle | 自定义样式 | `string / object` | — |

### Events

当前版本未额外暴露自定义事件。
