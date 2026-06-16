# 测试页面样式系统

## 概述

为了更好地区分 `lucky-ui` 组件库的样式和测试预览页面的样式，我们为 `src/pages/` 下的测试界面创建了独立的样式系统。

## 设计原则

1. **独立性**：测试页面使用完全独立的颜色变量和样式令牌，不依赖 `lucky-ui` 的 CSS 变量（`--lk-*`）
2. **区分性**：采用不同的色彩方案（蓝紫色系），与 `lucky-ui` 的品牌色明显区分
3. **一致性**：测试页面内部保持统一的视觉风格

## 样式文件

**位置**：`src/styles/test-page.scss`

包含以下内容：

- 独立的颜色系统（主题色、中性色）
- 背景色、文本色、边框等样式变量
- 渐变效果、阴影等视觉效果

## 使用方法

### 在 SCSS 中使用

在测试页面的 `<style>` 标签中引入：

```vue
<style scoped lang="scss">
@import '@/styles/test-page.scss';

.my-test-element {
  background: $test-bg-card;
  color: $test-text-primary;
  border: 1rpx solid $test-border-color;
}
</style>
```

### 在模板内联样式中使用

预览页默认优先使用 class + SCSS 变量。确需内联时，直接使用 `var(--test-*)` 变量：

```vue
<template>
  <text :style="{ fontSize: '24rpx', color: 'var(--test-text-secondary)' }">
    这是次要文本
  </text>
</template>
```

**重要**：模板中不要使用 `var(--lk-*)` 作为测试页面的装饰样式，它们应该只用于传递给 lucky-ui 组件的 props。

#### 示例对比

```vue
<!-- ❌ 错误：测试页面的装饰使用了组件库的样式变量 -->
<text style="color: var(--lk-color-text-secondary)">次要文本</text>

<!-- ✅ 正确：测试页面使用独立的预览变量 -->
<text :style="{ color: 'var(--test-text-secondary)' }">次要文本</text>

<!-- ✅ 正确：传递给组件的 props 可以使用 var(--lk-*) -->
<lk-tag text-color="var(--lk-color-primary)">标签</lk-tag>
```

## 主要变量

### 主题色

- `$test-primary`: #3b82f6（蓝色）
- `$test-success`: #10b981
- `$test-warning`: #f59e0b
- `$test-danger`: #ef4444
- `$test-info`: #06b6d4

### 中性色

- `$test-gray-50` ~ `$test-gray-900`: 完整的灰度色阶

### 背景色

- `$test-bg-page`: #f5f5f7（页面背景）
- `$test-bg-card`: #ffffff（卡片背景）
- `$test-bg-hover`: rgba(0, 0, 0, 0.04)
- `$test-bg-active`: rgba(0, 0, 0, 0.08)

### 文本色

- `$test-text-primary`: #1f2937（主要文本）
- `$test-text-secondary`: #6b7280（次要文本）
- `$test-text-tertiary`: #9ca3af（辅助文本）
- `$test-text-inverse`: #ffffff（反色文本）

### 其他

- `$test-border-color`: #e5e7eb
- `$test-border-radius`: 12rpx
- `$test-shadow-sm/md/lg`: 三级阴影
- `$test-gradient-*`: 渐变效果

## 已应用页面

- ✅ `src/pages/index/index.vue`（主容器）
- ✅ `src/pages/index/OverviewPage.vue`（组件总览）
- ✅ `src/pages/component-detail/index.vue`（组件详情）
- 🔄 `src/pages/index/DiscoverPage.vue`（待更新内联样式）
- 🔄 `src/pages/index/MinePage.vue`（待更新内联样式）
- 🔄 `src/pages/index/ShowcasePage.vue`（待更新内联样式）
- 🔄 `src/pages/index/StatisticsPage.vue`（待更新内联样式）

> **注意**：标记为 🔄 的页面主要包含内联样式（`style="..."`），需要逐步迁移到使用 `TestPageColors` 常量。

## 规则

### ✅ 应该使用测试样式的地方

- `src/pages/` 下的所有页面
- 页面级的布局、导航、背景
- 统计卡片、搜索框、分类标题等页面装饰元素

### ❌ 不应该使用测试样式的地方

- `src/uni_modules/lucky-ui/` 组件库源码
- `src/components/demos/` 组件演示（这些演示用于展示组件本身的样式）

## 效果对比

| 元素     | 使用前（lucky-ui 令牌）      | 使用后（测试样式）   |
| -------- | ---------------------------- | -------------------- |
| 页面背景 | `var(--lk-color-bg-page)`    | `$test-bg-page`      |
| 卡片背景 | `var(--lk-color-bg-surface)` | `$test-bg-card`      |
| 主题色   | `var(--lk-color-primary)`    | `$test-primary`      |
| 文本颜色 | `var(--lk-color-text)`       | `$test-text-primary` |

这样做的好处是：

1. 一眼就能区分哪些是组件库的样式，哪些是测试页面的装饰
2. 修改组件库的主题色不会影响测试页面的整体视觉
3. 测试页面可以独立设计，突出组件本身的展示效果
