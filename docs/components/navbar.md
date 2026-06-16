---
title: Navbar 导航栏
phone: navbar
---

# Navbar 导航栏

自定义顶部导航栏，适配 H5 安全区域和小程序状态栏高度。

## 基础用法

```vue
<template>
  <lk-navbar title="页面标题" />
</template>
```

## 带返回按钮

```vue
<template>
  <lk-navbar title="订单详情" back @back="handleBack" />
</template>

<script setup lang="ts">
function handleBack() {
  uni.navigateBack()
}
</script>
```

## 自定义左侧 / 中间 / 右侧

```vue
<template>
  <lk-navbar>
    <template #left>
      <lk-button variant="text" size="sm" @click="goHome">
        <lk-icon name="house" :size="20" />
      </lk-button>
    </template>
    <template #center>
      <view style="flex:1; text-align:center;">
        <text class="lk-navbar__title">自定义标题</text>
      </view>
    </template>
    <template #right>
      <view style="display:flex; gap:16rpx">
        <lk-icon name="search" :size="22" @click="openSearch" />
        <lk-icon name="person-circle" :size="22" @click="goProfile" />
      </view>
    </template>
  </lk-navbar>
</template>
```

## 透明导航栏

```vue
<template>
  <!-- 适合有封面大图的页面 -->
  <lk-navbar title="详情" transparent dark back />

  <view class="cover-image" style="height:500rpx; background:#7c3aed" />
</template>
```

## 发布验收

- H5：`fixed=false` 的 demo 变体应保持非 fixed 定位；插槽标题、左侧和右侧操作区不得挤压标题。
- App：重点复核安全区顶部高度、透明背景和沉浸式页面状态栏文字颜色。
- 小程序：重点复核胶囊按钮安全距离、返回事件和自定义右侧操作区点击。
- 自动回归：`tests/visual/needs-hardening-showcase.spec.ts` 覆盖 showcase 元数据、非 fixed demo 和插槽内容可见性。

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 标题文字 | `string` | `''` |
| back | 是否显示返回按钮 | `boolean` | `false` |
| transparent | 是否透明背景 | `boolean` | `false` |
| dark | 暗色文字（配合透明） | `boolean` | `false` |
| fixed | 是否固定在顶部 | `boolean` | `true` |
| border | 是否显示底部边框 | `boolean` | `true` |
| zIndex | 层级 | `number` | `100` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| back | 点击返回按钮 | `()` |
| click-left | 点击左侧区域时触发 | `()` |
| click-right | 点击右侧区域时触发 | `()` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 标题区域自定义内容 |
| left | 左侧区域自定义 |
| center | 中间区域自定义（在屏幕中心显示，优先于 title） |
| right | 右侧区域自定义 |
