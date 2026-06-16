---
name: lucky-ui-icon
description: 用于在 lucky-ui 中添加、修改或管理图标。包括新增 SVG 图标到图标集、重建图标字体、查询现有图标命名、在组件中正确使用 lk-icon 组件。
---

# Lucky-UI 图标系统指南

## 图标系统概述

Lucky-UI 使用**自托管字体图标**方案，基于以下工具链：
- **SVG 来源**：Bootstrap Icons（+ 自定义 SVG）
- **字体构建**：`svgtofont`
- **图标目录**：`src/uni_modules/lucky-ui/components/lk-icon/`
- **构建脚本**：`src/uni_modules/lucky-ui/scripts/`

---

## lk-icon 组件使用

### 基础用法

```vue
<lk-icon name="heart-fill" />
<lk-icon name="star" size="40" />
<lk-icon name="check-circle" color="#52c41a" />
<lk-icon name="arrow-right" size="32" color="var(--lk-color-primary)" />
```

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string` | `''` | 图标名称（不含前缀） |
| `size` | `string \| number` | `''` | 图标大小（单位 rpx，纯数字默认 rpx） |
| `color` | `string` | `''` | 图标颜色（支持 CSS 变量） |
| `customClass` | `string` | `''` | 自定义类名 |
| `customStyle` | `string \| object` | `''` | 自定义样式 |

### 在组件中引用 lk-icon

```vue
<script setup lang="ts">
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
</script>

<template>
  <!-- 前缀插槽示例 -->
  <lk-input>
    <template #prefix>
      <lk-icon name="search" size="28" color="var(--lk-text-placeholder)" />
    </template>
  </lk-input>
</template>
```

---

## 图标目录结构

```
lk-icon/
├── lk-icon.vue              # 图标组件
├── icon.props.ts            # Props 定义
├── fonts/                   # 构建的字体文件
│   ├── lk-icon.woff2
│   ├── lk-icon.woff
│   ├── lk-icon.ttf
│   └── lk-icon.eot
├── svgs/                    # 原始 SVG 文件（mobile 风格）
│   ├── heart.svg
│   ├── star.svg
│   └── ...
└── index.scss               # @font-face 声明 + 图标类名
```

---

## 添加新图标

### 方法一：从 Bootstrap Icons 添加（推荐）

1. **查看图标配置文件**：`src/uni_modules/lucky-ui/scripts/iconset.mobile.config.js`

   ```javascript
   // 在 icons 数组中添加图标名称（Bootstrap Icons 的 slug）
   module.exports = {
     icons: [
       'heart',
       'heart-fill',
       'star',
       // 新增图标：
       'camera',
       'camera-fill',
     ]
   };
   ```

2. **准备 Bootstrap Icons**（仅首次）：

   ```bash
   pnpm run icons:prepare
   ```

3. **重新构建字体**：

   ```bash
   pnpm run icons:all
   ```

### 方法二：添加自定义 SVG 图标

1. 将 SVG 文件放入 `src/uni_modules/lucky-ui/components/lk-icon/svgs/`，命名格式：`{icon-name}.svg`

   **SVG 规范**：
   - 尺寸：建议 `viewBox="0 0 16 16"`
   - 纯 path，无 stroke（使用 fill）
   - 删除 `fill` 属性（让 CSS 控制颜色）

   ```svg
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
     <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/>
   </svg>
   ```

2. **重新构建字体**：

   ```bash
   pnpm run icons:build
   ```

---

## 图标构建命令

```bash
# 从 Bootstrap Icons 准备 SVG 文件
pnpm run icons:prepare

# 构建字体文件（svgtofont）
pnpm run icons:build

# 生成 Base64 内嵌字体（小程序兼容）
pnpm run icons:base64

# 完整流程（prepare + build）
pnpm run icons:all
```

---

## 查询现有图标

### 查看图标配置

```bash
# 查看已配置的图标列表
cat src/uni_modules/lucky-ui/scripts/iconset.mobile.config.js
```

### 图标锁文件

`src/uni_modules/lucky-ui/scripts/iconset.mobile.lock.json` 包含所有已构建图标的完整列表和哈希。

---

## 图标颜色规范

图标应使用以下 CSS 变量适配主题：

```vue
<!-- 默认跟随文字色（推荐）-->
<lk-icon name="heart" />

<!-- 主色 -->
<lk-icon name="star-fill" :color="'var(--lk-color-primary)'" />

<!-- 危险色 -->
<lk-icon name="trash" :color="'var(--lk-color-danger)'" />

<!-- 成功色 -->
<lk-icon name="check-circle-fill" :color="'var(--lk-color-success)'" />

<!-- 占位符色 -->
<lk-icon name="search" :color="'var(--lk-text-placeholder)'" />
```

---

## 注意事项

> [!WARNING]
> 修改 SVG 文件后必须重新运行 `pnpm run icons:build` 才能生效。

> [!TIP]
> 小程序平台不支持网络字体，图标字体已通过 `icons:base64` 转换为 Base64 内嵌格式，直接在 SCSS 中引用。

> [!NOTE]
> 图标名称中的 `-fill` 后缀表示实心图标，无后缀为线框图标（与 Bootstrap Icons 命名一致）。
