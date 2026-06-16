---
title: Page 页面容器
phone: page
---

# Page 页面容器

页面基础布局容器，集成顶部状态栏/导航栏高度自适应避让、左侧返回及首页键的胶囊按钮物理垂直居中对齐、以及底部安全区（Safe Area）适配等功能。

## 基础用法
默认状态下，页面内容直接贴顶渲染。适用于不需要自定义导航栏，或者使用原生导航栏的页面。

```vue
<template>
  <lk-page>
    <view class="content">页面主体内容区域</view>
  </lk-page>
</template>
```

## 预留顶部导航高度
开启 `reserve-top` 时，组件将自动预留出「状态栏 + 标准导航栏」的高度，防止页面主体内容被自定义导航栏（如 `lk-navbar`）遮挡。

```vue
<template>
  <lk-page reserve-top>
    <view class="content">页面主体内容区域（不会被遮挡）</view>
  </lk-page>
</template>
```

## 胶囊垂直居中对齐 (左侧插槽)
当需要配合小程序胶囊按钮，在左侧放置自定义操作区（如返回、主页等）时，开启 `capsule-align`，左侧插槽 (`#left`) 内的元素会与小程序右上角的胶囊按钮保持物理层面的垂直居中对齐。

```vue
<template>
  <lk-page reserve-top capsule-align>
    <template #left>
      <view class="back-home-wrap">
        <lk-icon name="arrow-left" size="36" />
        <lk-icon name="house" size="34" />
      </view>
    </template>
    <view class="content">页面主体内容区域</view>
  </lk-page>
</template>
```

## 底部安全区适配 & 吸底操作栏
可以通过底部插槽 `#bottom` 放置固定在页面底部的操作栏（如提交按钮）。开启 `safe-area-bottom` 时，若使用了底部插槽，该插槽会自动为各设备的底部安全区留白，防止按钮被操作条遮挡。
若未提供底部插槽，安全区留白将自动作用在默认插槽的内容滚动区域最底端。

```vue
<template>
  <lk-page reserve-top safe-area-bottom>
    <view class="content">可滚动的长页面内容...</view>
    
    <template #bottom>
      <view class="action-footer">
        <lk-button type="primary" block>提交订单</lk-button>
      </view>
    </template>
  </lk-page>
</template>
```

## 不可滚动模式
默认状态下内容区域会包裹在 `scroll-view` 内。当页面需要自定义更复杂的滚动（如配合 `pull-refresh` 等）或者为非滚动全屏页面时，可关闭 `scrollable`。

```vue
<template>
  <lk-page :scrollable="false">
    <view class="full-screen-content">全屏非滚动展示</view>
  </lk-page>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| reserve-top | 是否预留状态栏加标准导航栏的高度 | `boolean` | `false` |
| capsule-align | 是否开启左侧插槽与小程序胶囊按钮物理居中对齐 | `boolean` | `false` |
| safe-area-bottom | 是否开启底部安全区适配 | `boolean` | `true` |
| scrollable | 默认插槽内容是否包裹在滚动区域中 | `boolean` | `true` |
| scroll-class | 滚动区域的自定义类名 | `string` | `''` |
| scroll-style | 滚动区域的自定义样式 | `string \| object` | `''` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 页面的核心内容滚动/展示区域 |
| left | 顶部左侧操作区，支持开启胶囊对齐逻辑 |
| bottom | 固定在底部的操作栏（自动承接底部安全区适配） |
