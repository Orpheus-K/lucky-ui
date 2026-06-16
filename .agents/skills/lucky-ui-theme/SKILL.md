---
name: lucky-ui-theme
description: 用于定制、修改或扩展 lucky-ui 的主题系统，包括品牌色替换、亮暗模式配置、CSS 变量新增、组件级主题变量覆盖、字体/圆角/间距等设计 token 调整。
---

# Lucky-UI 主题系统指南

## 主题文件结构

```
src/uni_modules/lucky-ui/theme/src/
├── component-vars.scss     # 主题 CSS 变量定义（亮色 + 暗色）
├── index.scss              # 主入口，组合所有主题文件
├── helper.scss             # SCSS 辅助工具
├── brand-color.ts          # 品牌色 TS 定义（运行时切换）
├── theme-store.ts          # Pinia 主题状态管理
├── tokens/                 # 设计 token
│   ├── colors.scss         # 颜色 token
│   ├── typography.scss     # 字体 token
│   ├── spacing.scss        # 间距 token
│   ├── shadow.scss         # 阴影 token
│   └── ...
├── base/                   # 全局基础样式
│   ├── reset.scss          # 重置样式
│   ├── animation.scss      # 动画关键帧
│   └── ...
├── mixins/                 # SCSS 混入
│   ├── flex.scss
│   ├── text.scss
│   └── ...
└── utilities/              # 工具类
```

---

## CSS 变量体系

### 命名规则

所有变量统一使用 `--lk-*` 前缀，通过 `.lk-theme-light` / `.lk-theme-dark` 类切换主题（兼容小程序无 `prefers-color-scheme`）。

### 变量层级说明

| 层级 | 位置 | 说明 |
|------|------|------|
| **Token 变量** | `:root, page` | 原始值，不随主题变化（如 `--lk-brand-500`） |
| **语义变量** | `.lk-theme-light / .lk-theme-dark` | 主题相关，随模式变化 |
| **组件变量** | 各组件 SCSS | 直接引用语义变量 |

---

## 修改品牌色

### 方法一：修改 SCSS Token（最简方式）

品牌色由 `generate-color-shade` 函数**自动生成色阶**，只需修改基础色：

```scss
// src/uni_modules/lucky-ui/theme/src/tokens/_colors.scss
// 第 13 行：只需修改这一个变量，即可更换整套品牌色系
$color-brand-base: #1677ff !default;  // 改为你的品牌色
```

色阶会自动生成：100（最浅）→ 600（=基础色）→ 1000（最深）

> [!NOTE]
> Token 文件路径：`src/uni_modules/lucky-ui/theme/src/tokens/_colors.scss`（注意下划线前缀）

### 方法二：运行时动态切换（JavaScript）

```typescript
// src/uni_modules/lucky-ui/theme/src/brand-color.ts
// 已内置品牌色预设，可直接调用

import { setBrandColor } from '@/uni_modules/lucky-ui/theme/src/brand-color';

// 切换到自定义品牌色
setBrandColor('#ff6b00');
```

### 方法三：CSS 变量覆盖（页面级）

在全局 CSS 或页面样式中覆盖：

```css
/* App.vue 或全局 CSS */
page {
  --lk-brand-600: #ff6b00;  /* 亮色主色 */
  --lk-brand-500: #ff8c33;  /* 暗色主色 */
  --lk-brand-100: #fff3e0;  /* 柔和背景 */
  --lk-color-primary: var(--lk-brand-600);
}
```

---

## 亮色/暗色主题切换

### 使用 Pinia ThemeStore

```typescript
// src/uni_modules/lucky-ui/theme/src/theme-store.ts
import { useThemeStore } from '@/uni_modules/lucky-ui/theme/src/theme-store';

const themeStore = useThemeStore();

// 切换到暗色
themeStore.setDark();

// 切换到亮色
themeStore.setLight();

// 跟随系统
themeStore.setAuto();

// 当前主题
console.log(themeStore.isDark); // boolean
```

### 手动控制（给根元素添加类）

```typescript
// 在 App.vue 的 onLaunch 中
const isDark = true;
const rootEl = document.documentElement; // H5
rootEl.classList.toggle('lk-theme-dark', isDark);
rootEl.classList.toggle('lk-theme-light', !isDark);
```

---

## 新增全局 CSS 变量

### 步骤

1. 在 `component-vars.scss` 中找到对应的亮色/暗色区块
2. 在两处都添加变量（保持亮暗对称）

```scss
/* component-vars.scss */

:root, page, .lk-theme-light {
  /* === 新增：我的组件 === */
  --lk-my-component-bg: #f0f8ff;
  --lk-my-component-color: #1a6eb5;
  --lk-my-component-border: rgba(26, 110, 181, 0.3);
}

.lk-theme-dark {
  --lk-my-component-bg: rgba(26, 110, 181, 0.15);
  --lk-my-component-color: #5ba8e5;
  --lk-my-component-border: rgba(91, 168, 229, 0.3);
}
```

---

## SCSS Mixins 用法

位于 `src/uni_modules/lucky-ui/theme/src/mixins/`：

```scss
// 使用 flex 混入
@use '../../theme/src/mixins/flex' as flex;

.my-element {
  @include flex.row-center;    // display:flex; align-items:center
  @include flex.col-center;    // flex-direction:column; align-items:center
}

// 使用 text 混入（省略号）
@use '../../theme/src/mixins/text' as text;

.my-label {
  @include text.ellipsis;      // 单行省略
  @include text.ellipsis(2);   // 多行省略
}
```

---

## 组件级主题覆盖

在使用组件时，通过 CSS 变量覆盖来实现单组件定制：

```vue
<template>
  <!-- 页面级覆盖 -->
  <view class="my-page">
    <lk-button>自定义按钮</lk-button>
  </view>
</template>

<style lang="scss">
.my-page {
  /* 覆盖该页面范围内的按钮主色 */
  --lk-color-primary: #ff6b00;
  --lk-color-primary-hover: #e55f00;
  --lk-color-primary-soft: #fff3e0;
}
</style>
```

---

## 设计 Token 参考表

### 颜色 Token（`colors.scss`）

```scss
// 品牌色梯度（100-900）
$color-brand-{100..900}: ...;

// 文字色
$color-text-primary-light: #1a1a1a;
$color-text-regular-light: #333333;
$color-text-secondary-light: #666666;
$color-text-placeholder-light: #999999;
$color-text-primary-dark: rgba(255,255,255,0.9);
// ...

// 背景色
$color-bg-page-light: #f7f7f7;
$color-bg-container-light: #ffffff;
$color-bg-input-light: #f5f5f7;  // Apple 风格输入框背景

// 填充色（灰色梯度）
$color-gray-{100..900}: ...;
```

### 字体 Token（`typography.scss`）

```scss
$font-family-base: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
$font-family-code: 'SF Mono', SFMono-Regular, Consolas, monospace;

$font-size-xs: 20rpx;
$font-size-sm: 24rpx;
$font-size-base: 28rpx;
$font-size-lg: 32rpx;
$font-size-xl: 36rpx;
$font-size-xxl: 48rpx;

$font-weight-light: 300;
$font-weight-regular: 400;
$font-weight-medium: 500;
$font-weight-bold: 700;

$line-height-tight: 1.25;
$line-height-base: 1.5;
$line-height-loose: 1.75;
```

### 间距 Token（`spacing.scss`）

```scss
$spacing-xxs: 4rpx;
$spacing-xs: 8rpx;
$spacing-sm: 12rpx;
$spacing-md: 16rpx;
$spacing-lg: 24rpx;
$spacing-xl: 32rpx;
$spacing-xxl: 48rpx;
```

---

## Z-Index 层级管理

修改层级时，请遵守以下顺序（从低到高）：

```
sticky(100) → navbar(200) → tabbar(300) → fab(400)
→ dropdown(500) → tooltip(600) → popover(700)
→ overlay(900)
→ popup(1000) → modal(1500)
→ toast(2000) → notify(2100) → loading(2200)
```

在 `component-vars.scss` 中覆盖对应变量：

```css
page {
  --lk-z-index-modal: 2000;  /* 提高 modal 层级 */
}
```

---

## 动画 Token

```css
/* 内置时间 token */
--lk-transition-fast: 0.15s ease;
--lk-transition-base: 0.25s ease;
--lk-transition-slow: 0.35s ease;
```

使用 `useTransition` composable 可选择 30+ 种预置动画（详见 lucky-ui-component skill）。
