---
name: lucky-ui-component
description: 用于在 lucky-ui UniApp 多端组件库中新增、修改或调试组件。当用户需要：新建组件、修改现有组件逻辑/样式/props、调试组件问题、或为组件添加新功能时，必须使用本 skill。
---

# Lucky-UI 组件开发指南

## 组件库优先原则

当页面问题暴露出 Lucky UI 组件的跨端渲染、样式隔离、组合使用或默认行为缺陷时，必须优先从组件库层面修复，而不是只在业务页面用局部样式兜底掩盖问题。

- 先判断问题是否来自组件自身：小程序样式隔离、CSS 变量缺失、默认 `overflow` 裁剪、slot 结构、定位上下文、组件组合边界等。
- 若缺陷会影响开发者复用，修复应落在 `src/uni_modules/lucky-ui/components/`、主题 token、props 或文档示例中。
- 页面层修改只承担语义化配置，例如传入组件新增的 prop；不要通过深层选择器、硬编码内联样式或替换组件结构绕过组件短板。
- 新增能力要保持默认行为兼容；需要改变默认值时，必须确认不会破坏现有组件场景。
- 组件修复后至少验证一个真实业务组合场景，确保开发者按常规写法也能稳定渲染。
- 小程序兼容样式禁止使用通配选择器 `*` 作为兜底方案；需要覆盖子节点时，使用显式选择器、结构包装或组件 prop，不用无法编译或不可控的选择器掩盖问题。

## 项目概览

- **框架**：UniApp + Vue 3 + TypeScript + SCSS
- **包管理**：pnpm
- **组件根目录**：`src/uni_modules/lucky-ui/components/`
- **主题目录**：`src/uni_modules/lucky-ui/theme/src/`
- **Composables**：`src/uni_modules/lucky-ui/composables/`
- **核心工具**：`src/uni_modules/lucky-ui/core/src/`
- **文档**：`docs/` 使用 VitePress

---

## 组件文件结构规范

每个组件目录包含如下文件：

```
lk-{name}/
├── lk-{name}.vue          # 主组件（SFC）
├── {name}.props.ts        # Props + Emits 类型定义
└── index.scss             # 组件样式
```

复合组件（如 Tabs、Collapse）还包含子组件：

```
lk-{name}/
├── lk-{name}.vue
├── lk-{name}-item.vue     # 子组件
├── {name}.props.ts
└── index.scss
```

---

## Props 定义规范（必须严格遵守）

所有 Props 使用 `LkProp` 工具类和 `baseProps` 基础 props：

```typescript
// {name}.props.ts
import type { ExtractPropTypes } from 'vue';
import { baseProps, LkProp } from '../common/props';

// 1. 枚举常量（使用 const object 而非 enum）
export const MyVariant = {
  Primary: 'primary',
  Secondary: 'secondary',
} as const;
export type MyVariant = (typeof MyVariant)[keyof typeof MyVariant];

// 2. Props 定义
export const myProps = {
  ...baseProps,  // 必须扩展 baseProps（包含 id/customClass/customStyle/throttle/debounce/animation/zIndex）

  /** 变体类型 */
  variant: LkProp.enum(Object.values(MyVariant), MyVariant.Primary, 'MyComponent.variant'),

  /** 文本内容 */
  label: LkProp.string(''),

  /** 数值 */
  count: LkProp.number(0),

  /** 布尔 */
  disabled: LkProp.boolean(false),

  /** 字符串或数字（尺寸类） */
  size: LkProp.stringNumber('md'),

  /** 数组 */
  items: LkProp.array<string>(),

  /** 对象 */
  config: LkProp.object<{ key: string }>(),
} as const;

// 3. Emits 定义
export const myEmits = {
  click: (event: unknown) => event !== undefined,
  change: (value: string) => typeof value === 'string',
  'update:modelValue': (value: boolean) => typeof value === 'boolean',
};

export type MyProps = ExtractPropTypes<typeof myProps>;
```

### LkProp 可用方法

| 方法 | 用途 | 示例 |
|------|------|------|
| `LkProp.string(def)` | 字符串 | `LkProp.string('')` |
| `LkProp.number(def)` | 数字 | `LkProp.number(0)` |
| `LkProp.boolean(def)` | 布尔 | `LkProp.boolean(false)` |
| `LkProp.stringNumber(def)` | 字符串\|数字 | `LkProp.stringNumber('md')` |
| `LkProp.enum(values, def, name?)` | 枚举（有校验） | `LkProp.enum(['a','b'], 'a', 'Comp.prop')` |
| `LkProp.array<T>()` | 数组 | `LkProp.array<Item>()` |
| `LkProp.object<T>()` | 对象 | `LkProp.object<Config>()` |
| `LkProp.func<T>()` | 函数 | `LkProp.func<() => void>()` |

### baseProps 包含的通用 Props

| Prop | 类型 | 说明 |
|------|------|------|
| `id` | String | 组件唯一标识 |
| `customClass` | String\|Object\|Array | 自定义类名 |
| `customStyle` | String\|Object | 自定义样式 |
| `throttle` | Number | 节流（ms） |
| `debounce` | Number | 防抖（ms） |
| `animation` | String\|Object | 动画类名 |
| `teleport` | String\|Element\|Boolean | 传送门（默认 'body'） |
| `zIndex` | Number | 层级（默认 99） |

---

## Vue SFC 规范（.vue 文件）

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import { myProps, myEmits } from './my.props';
// 按需引入 composables
import { useRipple } from '@/uni_modules/lucky-ui/composables/useRipple';
import { useTransition } from '@/uni_modules/lucky-ui/composables/useTransition';
// 按需引入工具函数
import { addUnit } from '@/uni_modules/lucky-ui/core/src/utils/unit';

defineOptions({ name: 'LkMyComponent' });  // 必须定义组件名（PascalCase，Lk 前缀）

const props = defineProps(myProps);
const emit = defineEmits(myEmits);

// 类名计算属性（固定模式）
const cls = computed(() => [
  'lk-my-component',
  `lk-my-component--${props.variant}`,
  {
    'is-disabled': props.disabled,
    'is-active': isActive.value,
  },
  props.customClass,  // 支持自定义类名
]);
</script>

<template>
  <view :class="cls" :style="props.customStyle">
    <slot />
  </view>
</template>

<style lang="scss" scoped>
@use './index.scss';
</style>
```

### 命名规范

- **组件名**：`defineOptions({ name: 'LkXxx' })` — `Lk` 开头 PascalCase
- **类名前缀**：`.lk-{component-name}--{modifier}` — 使用 BEM 变体
- **状态类名**：`is-active`, `is-disabled`, `is-loading` 等 `is-*` 前缀

---

## SCSS 样式规范

```scss
// index.scss — 不使用 scoped，通过 @use 引入

// 1. 引入主题变量（按需）
@use '../../theme/src/tokens/colors' as colors;
@use '../../theme/src/mixins/flex' as flex;

// 2. 组件根类
.lk-my-component {
  // 使用 CSS 变量（主题系统）
  color: var(--lk-text-primary);
  background: var(--lk-bg-container);
  border-radius: var(--lk-radius-md);
  transition: var(--lk-transition-base);

  // BEM 修饰符
  &--primary { color: var(--lk-color-primary); }
  &--sm { font-size: var(--lk-font-size-sm); }

  // 状态类
  &.is-disabled { opacity: 0.5; pointer-events: none; }
  &.is-active { color: var(--lk-color-primary); }

  // 子元素
  &__label { font-size: var(--lk-font-size-base); }
  &__icon { color: var(--lk-icon-color); }
}
```

### 常用 CSS 变量速查

**颜色**

| 变量 | 用途 |
|------|------|
| `--lk-color-primary` | 主色 |
| `--lk-color-success/warning/danger/info` | 语义色 |
| `--lk-text-primary/regular/secondary/placeholder` | 文字色 |
| `--lk-bg-container/page` | 背景色 |
| `--lk-color-border/border-light` | 边框色 |
| `--lk-fill-1/2` | 填充色 |
| `--lk-bg-input` | 输入框背景 |

**尺寸**

| 变量 | 值 |
|------|-----|
| `--lk-spacing-xs/sm/md/lg/xl/xxl` | 8/12/16/24/32/48rpx |
| `--lk-radius-xs/sm/md/lg/xl/full` | 4/8/16/24/32/9999px |
| `--lk-font-size-xs/sm/base/lg/xl` | 各级字号 |
| `--lk-control-height-xs/sm/md/lg` | 48/64/80/96rpx |

**动画**

| 变量 | 值 |
|------|-----|
| `--lk-transition-fast/base/slow` | 0.15s/0.25s/0.35s ease |

**层级**

| 变量 | 值 |
|------|-----|
| `--lk-z-index-sticky/navbar/dropdown/overlay/popup/toast` | 递增层级 |

---

## 可用 Composables

### useRipple — 波纹效果

```typescript
import { useRipple } from '@/uni_modules/lucky-ui/composables/useRipple';

const { rippleActive, rippleWaveStyle, triggerRipple } = useRipple({ duration: 800 });
// 在 template 中：
// <view class="lk-ripple" :class="{ 'lk-ripple--active': rippleActive }">
//   <view class="lk-ripple__wave" :style="rippleWaveStyle" />
// </view>
```

### useTransition — 显隐动画

```typescript
import { useTransition } from '@/uni_modules/lucky-ui/composables/useTransition';

const { classes, styles, display } = useTransition(
  () => props.modelValue,   // 响应式 show 状态
  {
    name: 'fade-up',        // TransitionName 见下表
    duration: 300,
    easing: 'ease-out-cubic',
  },
  {
    onAfterEnter: () => emit('after-enter'),
    onAfterLeave: () => emit('after-leave'),
  }
);
// 在 template 中：
// <view v-if="display" :class="classes" :style="styles">...</view>
```

**TransitionName 完整列表**：
- fade, fade-up, fade-down, fade-left, fade-right, fade-up-left/right, fade-down-left/right
- slide-up, slide-down, slide-left, slide-right
- zoom-in, zoom-in-up/down/left/right, zoom-out, zoom-out-up/down/left/right
- flip-left, flip-right, flip-up, flip-down
- bounce-in, bounce-in-up/down/left/right
- rotate-in, rotate-in-up-left/right, rotate-in-down-left/right

### useChartCanvas — 图表 Canvas

```typescript
import { useChartCanvas } from '@/uni_modules/lucky-ui/composables/useChartCanvas';
// 用于 lk-chart-bar/line/pie 等图表组件
```

---

## 注册新组件

新组件开发完成后，必须在以下文件中注册：

### 1. `src/uni_modules/lucky-ui/components/index.ts`

```typescript
// 在对应位置添加：
export { default as LkMyComponent } from './lk-my-component/lk-my-component.vue';
export * from './lk-my-component/my-component.props';
```

### 2. `src/uni_modules/lucky-ui/components.d.ts`（全局类型）

```typescript
export declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    LkMyComponent: typeof import('./components')['LkMyComponent'];
  }
}
```

---

## 多端兼容注意事项

### 条件编译

```vue
<!-- 仅 H5 -->
<!-- #ifdef H5 -->
<view class="h5-only">...</view>
<!-- #endif -->

<!-- 仅小程序 -->
<!-- #ifdef MP -->
<view class="mp-only">...</view>
<!-- #endif -->

<!-- 仅 H5 或 APP -->
<!-- #ifdef H5 || APP-PLUS -->
<scroll-view scroll-y>...</scroll-view>
<!-- #endif -->
```

### UniApp API

- 使用 `uni.createSelectorQuery()` 替代 `document.querySelector`
- 需要绑定组件实例时：`query.in(instance.proxy)`
- 获取系统信息：`uni.getSystemInfoSync()`
- 尺寸单位使用 `rpx`（响应式像素）

### 事件处理

- 点击事件：使用 `@tap` 而非 `@click`（小程序兼容），或两者都支持
- 触摸事件：`@touchstart/@touchmove/@touchend`

---

## 常见开发模式

### 弹出层组件（Popup 类）

参考 `lk-popup`、`lk-modal`、`lk-action-sheet`：
1. 使用 `v-model:modelValue` 控制显隐
2. 使用 `useTransition` 实现动画
3. 使用 `lk-overlay` 作为背景遮罩
4. 支持 `closable`、`title`、`safeArea` 等通用 props

### 表单控件（Form 类）

参考 `lk-input`、`lk-switch`、`lk-checkbox`：
1. 实现 `v-model` 双向绑定
2. 支持 `disabled`、`readonly`、`size` 等通用 props
3. 接入 `lk-form` 的注入上下文（表单校验）

### 列表/导航类

参考 `lk-tabs`、`lk-tabbar`、`lk-collapse`：
1. 父子组件使用 `provide/inject` 通信
2. 父组件暴露 `register/unregister` 方法

---

## 开发调试命令

```bash
# H5 开发模式（热更新）
pnpm run dev:h5

# 微信小程序开发
pnpm run dev:mp-weixin

# 文档预览
pnpm run docs:dev

# 代码检查
pnpm run lint

# 自动修复
pnpm run lint:fix

# 格式化
pnpm run format

# 类型检查
pnpm run type-check
```

---

## 开发新组件完整流程

1. **创建目录**：`src/uni_modules/lucky-ui/components/lk-{name}/`
2. **创建 props 文件**：`{name}.props.ts`（参考上述规范）
3. **创建主组件**：`lk-{name}.vue`（参考 SFC 规范）
4. **创建样式文件**：`index.scss`（参考 SCSS 规范）
5. **注册组件**：在 `index.ts` 导出，在 `components.d.ts` 声明类型
6. **运行开发服务**：`pnpm run dev:h5` 验证效果
7. **代码检查**：`pnpm run lint` 确保无错误
