---
title: Empty 空状态
phone: empty
---

# Empty 空状态

用于数据为空、搜索无结果、网络异常、权限受限等占位场景。内置插画由 SVG 资产转换器生成，也支持业务传入自定义图片。

## 基础用法

```vue
<template>
  <lk-empty />
</template>
```

## 内置插画

```vue
<template>
  <lk-empty name="search" />
  <lk-empty name="network" />
  <lk-empty name="permission" />
</template>
```

内置名称：`empty`、`search`、`network`、`error`、`permission`、`inbox`、`cart`、`favorite`。

## 自定义图片与文案

`image` 优先级高于 `src`，两者都高于内置 `name` 插画。

```vue
<template>
  <lk-empty
    image="https://example.com/empty.svg"
    title="门店暂未营业"
    description="稍后再来看看"
  />
</template>
```

## 品牌色

内置插画默认跟随 Lucky UI 品牌色，也可用 `color` 覆盖当前实例。

```vue
<template>
  <lk-empty name="cart" color="#13c2c2" />
</template>
```

## 操作区

```vue
<template>
  <lk-empty name="network">
    <template #action>
      <lk-button size="sm">重新加载</lk-button>
    </template>
  </lk-empty>
</template>
```

## 插画资产扩展

内置空态 SVG 源文件、标题描述、来源信息和生成产物统一在 [SVG 资产转换](../guide/svg-assets) 中配置。

```bash
pnpm run assets:svg:check
pnpm run assets:svg
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| name | 内置插画名称 | `string` | `empty / search / network / error / permission / inbox / cart / favorite` | `empty` |
| image | 自定义图片地址，优先级最高 | `string` | — | `''` |
| src | 自定义图片地址别名，优先级低于 `image` | `string` | — | `''` |
| title | 主标题 | `string` | — | 内置文案 |
| description | 副描述 | `string` | — | 内置文案 |
| imageSize | 插画尺寸，数字按 `rpx` 处理 | `string / number` | — | `240` |
| color | 内置插画主题色，默认跟随品牌色 | `string` | — | `''` |
| layout | 布局模式 | `string` | `default / compact / page` | `default` |
| showImage | 是否显示插画 | `boolean` | — | `true` |
| customClass | 自定义类名 | `string / object / array` | — | — |
| customStyle | 自定义样式 | `string / object` | — | — |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| load | 图片加载成功时触发 | `(event: unknown)` |
| error | 图片加载失败时触发 | `(event: unknown)` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| image | 自定义插画区域 |
| title | 自定义标题 |
| description | 自定义描述 |
| action | 底部操作区 |

## 兼容说明

内置插画通过 UniApp `<image>` 渲染 SVG data URI，不依赖 DOM、`v-html` 或远程网络。
