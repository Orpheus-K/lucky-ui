# 测试页面样式系统 - 快速参考

## 为什么需要独立的测试样式？

在 `src/pages/` 下的测试页面中，我们需要预览 lucky-ui 组件库的效果。如果页面装饰（背景、卡片、标题等）也使用组件库的样式变量，会导致：

1. ❌ 难以区分哪些是组件的样式，哪些是页面装饰
2. ❌ 修改组件库主题色时，整个测试页面视觉混乱
3. ❌ 无法清晰展示组件本身的样式特性

## 解决方案

创建独立的测试页面样式系统，使用不同的色彩体系和命名空间。

## 使用规则

### ✅ 应该使用测试样式（`TestPageColors` / `$test-*`）

- 页面背景色
- 统计卡片、搜索框等页面装饰元素
- 页面级标题、说明文字
- 页面导航、分类标签
- 所有非组件的 UI 元素

### ❌ 不应该使用测试样式

- lucky-ui 组件库源码（`src/uni_modules/lucky-ui/`）
- 组件演示代码（`src/components/demos/`）
- 传递给 lucky-ui 组件的 props（如 `<lk-tag text-color="var(--lk-color-primary)">`）

## 两种使用方式

### 方式 1：SCSS 变量（推荐用于 `<style>` 块）

```vue
<style scoped lang="scss">
@import '@/styles/test-page.scss';

.page-header {
  background: $test-bg-card;
  color: $test-text-primary;
  border-bottom: 1rpx solid $test-border-color;
}
</style>
```

### 方式 2：CSS 变量（用于少量内联样式）

```vue
<template>
  <text :style="{ color: 'var(--test-text-secondary)' }"> 统计信息 </text>
</template>
```

## 常用颜色对照表

| 用途     | SCSS 变量              | CSS 变量                     | 值        |
| -------- | ---------------------- | ---------------------------- | --------- |
| 页面背景 | `$test-bg-page`        | `var(--test-bg-page)`        | `#f5f5f7` |
| 卡片背景 | `$test-bg-card`        | `var(--test-bg-card)`        | `#ffffff` |
| 主要文本 | `$test-text-primary`   | `var(--test-text-primary)`   | `#1f2937` |
| 次要文本 | `$test-text-secondary` | `var(--test-text-secondary)` | `#6b7280` |
| 辅助文本 | `$test-text-tertiary`  | `var(--test-text-tertiary)`  | `#9ca3af` |
| 主题色   | `$test-primary`        | `var(--test-primary)`        | `#3b82f6` |
| 边框色   | `$test-border-color`   | `var(--test-border-color)`   | `#e5e7eb` |

## 示例对比

```vue
<!-- ❌ 错误：测试页面装饰使用了组件库变量 -->
<view class="stats-card" style="background: var(--lk-color-bg-surface)">
  <text style="color: var(--lk-color-text)">总访问量</text>
</view>

<!-- ✅ 正确：测试页面使用独立样式 -->
<view class="stats-card" :style="{ background: TestPageColors.bgCard }">
  <text :style="{ color: TestPageColors.textPrimary }">总访问量</text>
</view>

<!-- ✅ 正确：组件 props 可以使用 lucky-ui 变量 -->
<lk-tag text-color="var(--lk-color-primary)">标签</lk-tag>
```

## 完整文档

详细说明请参考 [TEST_PAGE_STYLES.md](./TEST_PAGE_STYLES.md)
