---
title: Watermark 水印
phone: watermark
---

# Watermark 水印

为页面或局部容器添加中低密度重复水印，适合截图溯源、内部系统标识和敏感信息展示。

## 基础用法

```vue
<template>
  <lk-watermark content="Lucky UI">
    <view class="panel">需要覆盖水印的内容</view>
  </lk-watermark>
</template>
```

## 全屏水印

```vue
<lk-watermark content="Internal" full-page :z-index="8" :rows="6" :columns="3" />
```

## 多行内容

```vue
<lk-watermark :content="['Lucky UI', 'Open Source']" variant="outline" />
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| content | 水印内容 | `string / string[]` | `'Lucky UI'` |
| size | 尺寸 | `'sm' / 'md' / 'lg'` | `'md'` |
| variant | 视觉风格 | `'text' / 'block' / 'outline'` | `'text'` |
| fullPage | 是否全屏固定铺水印 | `boolean` | `false` |
| visible | 是否启用水印 | `boolean` | `true` |
| zIndex | 层级 | `number` | `8` |
| width | 单个水印宽度 | `string / number` | — |
| height | 单个水印高度 | `string / number` | — |
| gapX | 横向间距 | `string / number` | — |
| gapY | 纵向间距 | `string / number` | — |
| rows | 行数 | `number` | `6` |
| columns | 列数 | `number` | `3` |
| rotate | 旋转角度 | `number` | `-22` |
| skewX | 横向倾斜角度 | `number` | `0` |
| skewY | 纵向倾斜角度 | `number` | `0` |
| fontSize | 字体大小 | `string / number` | — |
| fontWeight | 字体粗细 | `string / number` | `500` |
| opacity | 透明度 | `number` | `0.15` |
| color | 自定义颜色 | `string` | `''` |
| customClass | 自定义类名 | `string / object / array` | — |
| customStyle | 自定义样式 | `string / object` | — |

### Events

当前版本未额外暴露自定义事件。

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 需要覆盖水印的内容 |

## 注意事项

`fullPage` 会使用固定定位，跨端表现需要结合页面层级验证。水印不应作为强安全防护，只适合作为可视提示与溯源辅助。
