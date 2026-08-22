---
name: lucky-ui-theme
description: 定制或维护 lucky-ui 的品牌色、亮暗模式、语义 CSS 变量、组件主题变量和设计 Token。用于修改默认品牌色、运行时换肤、主题状态、颜色/字体/间距/圆角/阴影/层级 Token 或跨端主题表现；只改业务页面组合时使用 lucky-ui-coding。
---

# Lucky UI 主题维护

## 基准

所有路径均相对仓库根目录。先判断任务属于“默认主题源码”“运行时切换”还是“局部覆盖”，不要混用三种方案。

事实来源：

- 主题入口：`src/uni_modules/lucky-ui/theme/src/index.scss`。
- 语义与组件变量：`src/uni_modules/lucky-ui/theme/src/component-vars.scss`。
- 设计 Token：`src/uni_modules/lucky-ui/theme/src/tokens/` 下实际存在的 `_colors.scss`、`_typography.scss`、`_spacing.scss`、`_border-radius.scss`、`_shadow.scss`、`_motion.scss`、`_z-index.scss` 等文件。
- 运行时 API：`src/uni_modules/lucky-ui/theme/src/theme-store.ts`。
- 品牌色生成与默认值：`src/uni_modules/lucky-ui/theme/src/brand-color.ts`。
- 公共导出：`src/uni_modules/lucky-ui/theme/index.ts`。

变量和 API 必须从当前文件读取，不从旧示例猜测。

## 工作流

1. 读取目标 Token、`component-vars.scss`、运行时主题实现和实际消费者。
2. 修改默认值时保持 SCSS Token、TypeScript 默认值与必要的回退值一致。
3. 新增语义变量时同时定义亮色与暗色值，并让组件消费语义变量。
4. 保留 `--lk-*` 命名、`.lk-theme-light` / `.lk-theme-dark` 选择器和跨端 `page` 根作用域。
5. 核对 H5 与微信小程序，不引入只在 DOM 上有效的业务逻辑。

## 品牌色

永久修改默认品牌色时至少核对：

- `src/uni_modules/lucky-ui/theme/src/tokens/_colors.scss` 的 `$color-brand-base`。
- `src/uni_modules/lucky-ui/theme/src/brand-color.ts` 的 `DEFAULT_BRAND_COLOR` 与对应预设。
- `src/uni_modules/lucky-ui/` 中仍引用旧品牌色的必要回退值。

运行时换色使用公开主题 API：

```ts
import { useTheme } from '@/uni_modules/lucky-ui/theme';

const { setBrandColor } = useTheme();
setBrandColor('#1677ff');
```

局部视觉覆盖优先在页面或容器作用域覆盖现有语义变量，不复制整套色阶。

## 亮暗模式

当前只支持 `light` 与 `dark`，不存在 `auto`、`setLight` 或 `setDark` API：

```ts
import { useTheme } from '@/uni_modules/lucky-ui/theme';

const { theme, isDark, themeClass, setTheme, toggleTheme } = useTheme();

setTheme('dark');
toggleTheme();
```

非 setup 场景可读取同模块导出的 `themeStore`，其真实方法为 `init`、`setTheme`、`toggleTheme` 和 `setBrandColor`。

## 变量与 Mixins

- 原始 Token 放在 `theme/src/tokens/`。
- 通用、语义和组件 CSS 变量放在 `theme/src/component-vars.scss` 的正确区块。
- 组件 SCSS 优先消费 `var(--lk-...)`，避免硬编码重复颜色。
- Mixins 以 `theme/src/mixins/index.scss` 的当前 `@forward` 和实际声明为准；现有文本与布局 mixin 包括 `text-ellipsis`、`text-ellipsis-multiple`、`flex-center`，不要使用不存在的 `row-center`、`col-center` 或重载 `ellipsis`。

## 校验

```bash
pnpm run type-check
pnpm run build:h5
pnpm run build:mp-weixin
```

同时检查亮暗模式、运行时品牌色持久化、组件语义变量和小程序系统 UI；只提交本任务相关文件。
