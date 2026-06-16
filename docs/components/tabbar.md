---
title: Tabbar 底部导航
phone: tabbar
---

# Tabbar 底部导航

页面底部的导航切换栏，支持三种视觉风格模式，配备丝滑的动画效果。

## lk-tabbar 与 lk-tabbar-container：怎么选？

两者都带「底部 Tab 栏」，但职责不同：

| 需求 | 推荐 |
|------|------|
| 只要底部导航条，**上面内容由你自己**用 `v-if`、路由等控制 | 使用 **lk-tabbar**（配合 **lk-tabbar-item** 或 `list`） |
| 使用 `pages.json` 里多个 `switchTab` 页面，底部栏样式统一 | 使用 **lk-tabbar**，可开启 `switch-page` 配合 `pagePath` |
| **单个页面**里要做「多 Tab 主框架」：懒加载各 Tab 子组件、`v-show` 保活、避免整页重绘闪烁 | 使用 **[lk-tabbar-container](./tabbar-container)** |

**引入方式（给其它项目用）**：不要依赖本仓库的 `src/...` 路径。把 `lucky-ui` 放到 `src/uni_modules/` 后，模板里直接写 `<lk-tabbar>` 即可（easycom）；需要类型或 `TabConfig` 时再按需 `import`。npm 包场景见 [安装与引入](/guide/install)。

## 特性

- 🎨 **三种模式**：Fixed（简约）、Slider（滑块）、Bump（中间凸起）
- ✨ **丝滑动画**：使用 `cubic-bezier` 贝塞尔曲线，点击有缩放回弹效果
- 📱 **安全区适配**：完美适配 iPhone X 等机型的底部安全区域
- 🎭 **毛玻璃效果**：支持 `glassBg` 实现磨砂玻璃质感
- 🔢 **徽标支持**：数字徽标、小红点、脉冲动画
- 🎯 **跟随品牌色**：默认使用系统品牌色，支持自定义

## 在页面中使用

`lk-tabbar` 通常放在 Uni-app 页面组件的模板底部，例如 `src/pages/app-main/index.vue`、`src/pages/home/index.vue` 等。该组件本身并不是 `pages.json` 的配置项，必须写在页面 `.vue` 文件内。

下面是一个最小可运行的页面示例：

```vue
<template>
  <view class="page-shell">
    <view class="page-content">页面主体内容</view>

    <lk-tabbar v-model="active" mode="fixed">
      <lk-tabbar-item name="home" icon="house-fill" label="首页" />
      <lk-tabbar-item name="category" icon="grid-3x3-gap-fill" label="分类" />
      <lk-tabbar-item name="cart" icon="cart-fill" label="购物车" :badge="3" />
      <lk-tabbar-item name="profile" icon="person-fill" label="我的" />
    </lk-tabbar>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const active = ref('home');
</script>

<!--
  说明：如果你使用本工程或本地 lucky-ui 源码，uni-app 会自动通过 easycom 注册
  `lk-tabbar` / `lk-tabbar-item`，因此无需在 script 中手动 import 组件。
-->
```

如果你在自己的项目里使用 `lucky-ui` 包，则导入路径可能为 `lucky-ui/components/lk-tabbar/lk-tabbar.vue` 和 `lucky-ui/components/lk-tabbar/lk-tabbar-item.vue`。

## 基础用法 - Fixed 模式

简约风格，仅颜色渐变过渡，默认模式。

```vue
<template>
  <lk-tabbar v-model="active" mode="fixed">
    <lk-tabbar-item name="home" icon="house-fill" label="首页" />
    <lk-tabbar-item name="category" icon="grid-3x3-gap-fill" label="分类" />
    <lk-tabbar-item name="cart" icon="cart-fill" label="购物车" :badge="3" />
    <lk-tabbar-item name="profile" icon="person-fill" label="我的" />
  </lk-tabbar>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const active = ref('home');
</script>
```

## Slider 模式 - 滑块风格

Tabbar 背景有一个半透明滑块，切换时平滑移动到目标位置。

```vue
<template>
  <lk-tabbar v-model="active" mode="slider">
    <lk-tabbar-item name="home" icon="house-fill" label="首页" />
    <lk-tabbar-item name="discover" icon="compass-fill" label="发现" />
    <lk-tabbar-item name="message" icon="chat-dots-fill" label="消息" dot />
    <lk-tabbar-item name="profile" icon="person-fill" label="我的" />
  </lk-tabbar>
</template>
```

## Bump 模式 - 中间凸起风格

中间按钮悬浮突出（适合奇数个 Tab），点击有缩放回弹效果。

```vue
<template>
  <lk-tabbar v-model="active" mode="bump" :border="false">
    <lk-tabbar-item name="home" icon="house-fill" label="首页" />
    <lk-tabbar-item name="discover" icon="compass-fill" label="发现" />
    <lk-tabbar-item name="add" icon="plus-lg" label="" />
    <lk-tabbar-item name="message" icon="chat-dots-fill" label="消息" />
    <lk-tabbar-item name="profile" icon="person-fill" label="我的" />
  </lk-tabbar>
</template>
```

## List 配置模式

通过 `list` 属性传入配置数组，无需使用 slot。

```vue
<template>
  <lk-tabbar
    v-model="active"
    mode="slider"
    :list="tabbarList"
    @click="handleClick"
    @reselect="handleReselect"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const active = ref(0);
const tabbarList = [
  { icon: 'house-fill', text: '首页' },
  { icon: 'compass-fill', text: '发现' },
  { icon: 'chat-dots-fill', text: '消息', badge: 12 },
  { icon: 'person-fill', text: '我的' },
];
</script>
```

## 毛玻璃效果

开启 `glassBg` 呈现磨砂玻璃质感。

```vue
<lk-tabbar v-model="active" glass-bg :border="false">
  <!-- items -->
</lk-tabbar>
```

## 选中态图标切换

支持未选中/选中使用不同图标。

```vue
<lk-tabbar-item 
  name="home" 
  icon="house" 
  selected-icon="house-fill" 
  label="首页" 
/>
```

## LkTabbar Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| customClass | 组件可视根节点自定义类名 | `string \| object \| array` | `''` |
| customStyle | 组件可视根节点自定义样式 | `string \| object` | `''` |
| v-model | 当前激活项的索引或 name | `string \| number` | `0` |
| mode | 模式：`fixed` / `slider` / `bump` | `string` | `'fixed'` |
| list | 导航项配置数组（简化用法） | `TabbarItemConfig[]` | `[]` |
| fixed | 是否固定在底部 | `boolean` | `true` |
| safeArea | 是否适配底部安全区域 | `boolean` | `true` |
| border | 是否显示顶部边框线 | `boolean` | `true` |
| activeColor | 激活项颜色（默认品牌色） | `string` | - |
| inactiveColor | 未激活项颜色 | `string` | `#909399` |
| bgColor | 背景颜色 | `string` | - |
| glassBg | 是否启用毛玻璃效果 | `boolean` | `false` |
| switchPage | 点击是否跳转页面 | `boolean` | `false` |
| zIndex | 层级 | `number` | `300` |

## LkTabbarItem Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| customClass | 组件可视根节点自定义类名 | `string \| object \| array` | `''` |
| customStyle | 组件可视根节点自定义样式 | `string \| object` | `''` |
| name | 唯一标识（必填） | `string \| number` | - |
| icon | 图标名称 | `string` | - |
| selectedIcon | 选中态图标名称 | `string` | - |
| activeIconFill | 选中态优先尝试 `icon-fill` 图标 | `boolean` | `false` |
| label | 文字标签 | `string` | - |
| customIcon | 是否使用自定义图标（图片路径） | `boolean` | `false` |
| badge | 徽标数字 | `string \| number` | - |
| dot | 是否显示小红点 | `boolean` | `false` |

## TabbarItemConfig 类型

```typescript
interface TabbarItemConfig {
  pagePath?: string;       // 页面路径
  icon: string;            // 图标名称
  selectedIcon?: string;   // 选中态图标
  activeIconFill?: boolean;// 选中态优先使用 fill 图标
  text: string;            // 文字标签
  customIcon?: boolean;    // 是否自定义图标
  badge?: string | number; // 徽标
  dot?: boolean;           // 小红点
}
```

## Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 激活项变化 | `(value: string \| number)` |
| change | 切换选中项时触发 | `(value, item?)` |
| click | 点击导航项时触发，重复点击也会触发 | `(value, item?, index?, event?)` |
| reselect | 点击当前激活项时触发 | `(value, item?, index?, event?)` |
| switch-page-success | `switchPage` 跳转成功时触发 | `({ value, item, index, result })` |
| switch-page-fail | `switchPage` 跳转失败时触发 | `({ value, item, index, error })` |

## 动画说明

所有动画使用 Material Design 标准曲线：

- **颜色过渡**：`cubic-bezier(0.4, 0, 0.2, 1)` - 0.3s
- **滑块移动**：`cubic-bezier(0.4, 0, 0.2, 1)` - 0.35s
- **点击缩放**：`cubic-bezier(0.34, 1.56, 0.64, 1)` - 0.2s（回弹效果）
- **小红点脉冲**：2s 无限循环

## 参考

- 组件演示：`src/components/demos/tabbar-demo.vue`
- 单页多 Tab 容器（另一种场景）：[Tabbar 容器 tabbar-container](./tabbar-container)

## 发布验收

`lk-tabbar` 已纳入 needs-hardening showcase 回归，发布前按下面边界验收：

| 场景 | 验收方式 | 要点 |
|------|----------|------|
| 展示台基线 | 自动回归 | `tests/visual/needs-hardening-showcase.spec.ts` 校验组件路由、verified 状态与中风险标记 |
| 底部定位 | 人工验收 | fixed 底栏、safe area、页面内容底部留白在 H5/App/小程序端稳定 |
| 视觉模式 | 人工验收 | `fixed/slider/bump` 的激活态、徽标和重复点击事件一致 |

