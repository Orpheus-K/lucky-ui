---
title: Icon 图标
phone: icon
---

# Icon 图标

基于 Lucky UI 字体图标渲染，适用于按钮、导航、状态提示和列表操作。

## 基础用法

```vue
<template>
  <lk-icon name="house" />
  <lk-icon name="search" size="40" />
  <lk-icon name="check-circle-fill" color="success" />
</template>
```

## 颜色与尺寸

```vue
<template>
  <lk-icon name="heart-fill" color="danger" :size="36" />
  <lk-icon name="shield-check" color="var(--lk-color-primary)" size="44" />
</template>
```

`color` 支持语义色与 CSS 颜色值；纯数字 `size` 会按 `rpx` 处理。

## 背景容器

使用 `box` 可以让图标居中显示在固定尺寸的背景容器内。容器默认会根据 `color` 的语义色派生浅底色，也可以通过 `boxColor`、`boxSize`、`boxRadius` 和 `boxShape` 精确控制。

```vue
<template>
  <lk-icon name="wallet" color="primary" size="32" box />
  <lk-icon name="bell" color="warning" size="32" box box-shape="circle" />
  <lk-icon name="shield-check" color="success" size="34" box box-size="80" box-radius="20" />
  <lk-icon name="star-fill" color="#f59e0b" size="34" box box-color="#fff7ed" />
</template>
```

## 图标资产扩展

SVG 图标库接入、筛选、重命名、构建字体与小程序 base64 字体的流程，统一在 [SVG 资产转换](../guide/svg-assets) 中配置。

```bash
pnpm run assets:svg:check
pnpm run assets:svg
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| name | 图标名称 | `string` | 必填 |
| color | 图标颜色，支持语义色或 CSS 颜色值 | `string` | `''` |
| size | 图标尺寸 | `string / number` | `''` |
| box | 是否启用背景容器 | `boolean` | `false` |
| boxSize | 背景容器尺寸，空值时根据 `size` 自动推导 | `string / number` | `''` |
| boxColor | 背景容器颜色；语义色使用对应浅底色，CSS 值原样使用 | `string` | `''` |
| boxRadius | 背景容器圆角，数字按 `rpx` 处理 | `string / number` | `''` |
| boxShape | 背景容器形状 | `rounded / circle / square` | `rounded` |
| customClass | 自定义类名 | `string / object / array` | — |
| customStyle | 自定义样式 | `string / object` | — |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击图标时触发 | `(event: Event)` |

## 兼容说明

微信小程序端通过 `uni.loadFontFace` 注入字体；H5 与 App 端使用本地 `@font-face`。
