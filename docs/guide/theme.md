# 主题定制

Lucky UI 基于完整的 **Design Token** 体系构建，支持三种层次的自定义。

## Design Token 层次

```
┌─────────────────────────────────────────────┐
│  组件样式层  (lk-button / lk-input / ...)    │  ← 使用 CSS 变量
├─────────────────────────────────────────────┤
│  语义 Token  (--lk-color-primary / ...)     │  ← 语义映射
├─────────────────────────────────────────────┤
│  基础 Token  ($color-brand-600 / ...)       │  ← SCSS 变量
└─────────────────────────────────────────────┘
```

## 快速修改品牌色

在引入主题 SCSS 之前覆盖 `$color-brand-base` 变量：

```scss
// src/uni.scss

// 1. 覆盖品牌主色（其余色阶自动推导）
$color-brand-base: #0ea5e9;   // 改为青蓝色

// 2. 引入主题
@use './uni_modules/lucky-ui/theme/src/index.scss';
```

## CSS 变量覆盖（运行时）

所有间距、颜色、圆角均通过 CSS 变量暴露，可在任意层级覆盖：

```css
/* 全局覆盖 */
:root {
  --lk-color-primary: #10b981;
  --lk-color-primary-light: rgba(16, 185, 129, 0.12);
  --lk-radius-base: 12rpx;
  --lk-radius-lg: 20rpx;
}

/* 局部覆盖（仅影响某个容器内的组件） */
.my-page {
  --lk-color-primary: #f59e0b;
}
```

## 暗色模式

Lucky UI 基于 CSS 类名切换明暗主题。  
在应用根节点添加 `lk-theme-dark` 类即可：

```vue
<template>
  <view :class="isDark ? 'lk-theme-dark' : 'lk-theme-light'">
    <!-- 页面内容 -->
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const isDark = ref(false)
</script>
```

也可监听系统主题：

```ts
// 跟随系统主题
const mediaQuery = uni.getSystemInfoSync()
isDark.value = mediaQuery.theme === 'dark'
```

## 主要 CSS 变量参考

### 颜色

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `--lk-color-primary` | 主品牌色 | `#6965db` |
| `--lk-color-primary-light` | 主色浅色背景 | `rgba(105,101,219,.12)` |
| `--lk-color-success` | 成功色 | `#22c55e` |
| `--lk-color-warning` | 警告色 | `#f59e0b` |
| `--lk-color-danger` | 危险色 | `#ef4444` |
| `--lk-color-info` | 信息色 | `#64748b` |
| `--lk-text-primary` | 主文本 | `#1a1a2e` |
| `--lk-text-secondary` | 次要文本 | `#6b7280` |
| `--lk-bg-page` | 页面背景 | `#f8f8fc` |
| `--lk-bg-container` | 卡片背景 | `#ffffff` |

### 圆角

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `--lk-radius-sm` | 小圆角 | `8rpx` |
| `--lk-radius-base` | 基础圆角 | `12rpx` |
| `--lk-radius-lg` | 大圆角 | `20rpx` |
| `--lk-radius-xl` | 超大圆角 | `32rpx` |
| `--lk-radius-full` | 全圆角 | `9999rpx` |

### 间距

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `--lk-spacing-xs` | 超小间距 | `8rpx` |
| `--lk-spacing-sm` | 小间距 | `16rpx` |
| `--lk-spacing-base` | 基础间距 | `24rpx` |
| `--lk-spacing-lg` | 大间距 | `32rpx` |
| `--lk-spacing-xl` | 超大间距 | `48rpx` |
