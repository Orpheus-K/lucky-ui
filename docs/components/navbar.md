---
title: Navbar 导航栏
phone: navbar
---

# Navbar 导航栏

自定义顶部导航栏，深度适配 H5、App 安全区域与微信/多端小程序胶囊按钮对齐与避让。

## 基础用法

```vue
<template>
  <lk-navbar title="页面标题" />
</template>
```

## 详情导航（带副标题与操作）

```vue
<script setup lang="ts">
function handleBack() {
  uni.showToast({ title: '返回', icon: 'none' })
}

function handleMore() {
  uni.showToast({ title: '更多', icon: 'none' })
}
</script>

<template>
  <lk-navbar
    title="订单详情"
    subtitle="已同步最新状态"
    left-text="返回"
    right-text="更多"
    @click-left="handleBack"
    @click-right="handleMore"
  />
</template>
```

## 标题左对齐

```vue
<template>
  <lk-navbar
    title="发现灵感"
    subtitle="为你推荐新内容"
    title-align="left"
    :show-back="false"
  >
    <template #left>
      <lk-icon name="house-fill" size="var(--lk-rpx-36)" />
    </template>
  </lk-navbar>
</template>
```

## 视觉变体与浮层导航

支持 `default`、`frosted`（毛玻璃）、`transparent`（透明）与 `elevated`（悬浮卡片式）：

```vue
<template>
  <!-- 悬浮卡片式导航 -->
  <lk-navbar
    title="资产看板"
    variant="elevated"
    title-align="left"
    :show-back="false"
    shadow
  >
    <template #right>
      <lk-icon name="bell" size="var(--lk-rpx-36)" />
    </template>
  </lk-navbar>
</template>
```

## 沉浸式渐变背景

```vue
<template>
  <lk-navbar
    title="旅行计划"
    subtitle="周末出发，轻松抵达"
    background="linear-gradient(to right, var(--lk-color-primary), var(--lk-color-success))"
    :show-back="false"
    :border="false"
  >
    <template #right>
      <lk-icon name="share" size="var(--lk-rpx-36)" />
    </template>
  </lk-navbar>
</template>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import NavbarDemo from '@/pages_sub/components/demos/navbar-demo.vue'
</script>

<template>
  <NavbarDemo />
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 标题文字 | `string` | `''` |
| subtitle | 副标题文字 | `string` | `''` |
| leftText | 左侧文本 | `string` | `''` |
| rightText | 右侧文本 | `string` | `''` |
| showBack | 是否显示返回按钮 | `boolean` | `true` |
| backIcon | 返回图标名称 | `string` | `'chevron-left'` |
| backIconSize | 返回图标尺寸 | `string \| number` | `var(--lk-rpx-36)` |
| variant | 视觉风格：`default` 默认、`frosted` 毛玻璃、`transparent` 透明、`elevated` 悬浮卡片 | `default \| frosted \| transparent \| elevated` | `default` |
| titleAlign | 标题对齐方式：`center` 居中、`left` 居左 | `center \| left` | `center` |
| background | 自定义背景色或渐变 | `string` | `''` |
| fixed | 是否固定在顶部 | `boolean` | `true` |
| placeholder | 固定在顶部时是否生成占位节点 | `boolean` | `true` |
| safeArea | 是否开启状态栏安全区域适配 | `boolean` | `true` |
| border | 是否显示底部分割线 | `boolean` | `true` |
| shadow | 是否显示阴影 | `boolean` | `false` |
| zIndex | 导航栏层级 | `number` | `200` |
| id | 根节点 id | `string` | `''` |
| customClass | 根节点自定义类名 | `string \| object \| array` | — |
| customStyle | 根节点自定义样式 | `string \| object` | — |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| back | `showBack=true` 时点击左侧区域触发，组件同时尝试历史回退 | `()` |
| click-left | 点击左侧区域时触发 | `()` |
| click-right | 点击右侧区域时触发 | `()` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 标题区域自定义内容（居中模式下与 center 同级） |
| left | 左侧操作区域自定义内容 |
| center | 中间区域自定义内容（优先于 title） |
| right | 右侧操作区域自定义内容 |

## 发布验收

- H5：`fixed=false` 的 Demo 变体应保持非 fixed 定位；自定义标题及左右操作区不得互相遮挡。
- App：重点复核安全区顶部高度、自定义背景和沉浸式页面状态栏文字颜色。
- 小程序：重点复核胶囊按钮安全距离、返回事件，以及缺省左右操作区时的标题布局。
- 自动回归：`tests/visual/needs-hardening-showcase.spec.ts` 覆盖 Showcase 元数据、非 fixed Demo 和插槽内容可见性。
