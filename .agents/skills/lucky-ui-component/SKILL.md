---
name: lucky-ui-component
description: 新增、修改或修复 lucky-ui UniApp 跨端组件，包括 Props、Events、Slots、Methods、公共导出、样式、交互、组合组件和 H5/小程序兼容。用于组件库内部实现或公共 API 变更；只编写业务页面时使用 lucky-ui-coding，同步文档时叠加 lucky-ui-docs。
---

# Lucky UI 组件开发

## 基准

所有路径均相对仓库根目录。组件库主体位于 `src/uni_modules/lucky-ui/`，业务页面和 `src/components/demos/` 只是组合、展示与验收载体。

修改前先读：

1. `src/uni_modules/lucky-ui/components/lk-<name>/` 的主组件、`*.props.ts`、工具与样式。
2. `src/uni_modules/lucky-ui/components/common/props/` 中目标组件实际继承的公共 props。
3. `docs/components/<name>.md` 与最近似组件的实现。
4. 对应测试、Demo 和预览注册；不存在时不要猜路径。

源码是 API 真相。不得从通用模板补造 `modelValue`、`change`、`open`、插槽、Methods 或 CSS 变量。

## 工作流

1. 明确目标行为、兼容要求和公共 API 变化。
2. 选择最接近的现有组件作为结构与跨端参考。
3. 在 props、Vue、工具和 SCSS 各自职责内做最小修改。
4. 保持旧默认值和现有用法兼容；破坏性变更必须先明确说明。
5. 新组件补齐公共导出、全局类型、正式文档和关键词映射。
6. 运行静态检查、H5 与微信小程序构建，再检查相关测试和 Demo。

## 文件约定

常见单组件结构：

```text
src/uni_modules/lucky-ui/components/lk-<name>/
├── lk-<name>.vue
├── <name>.props.ts
├── <name>.utils.ts        # 按需
└── lk-<name>.scss
```

实际文件优先于约定；例如 `lk-form-group` 当前使用 `index.scss`。组合组件可以在同目录包含 item 子组件和 context，沿用最近似现有实现，不创建无用占位文件。

## API 与实现

- Props 与 Emits 放在实际 `*.props.ts`，复用 `LkProp`、`baseProps` 和现有类型工具。
- 展开公共 props 后必须实际消费或透传需要的字段；不要把仅声明但无可观察行为的 no-op prop 当成公共能力。
- Vue 文件负责组合状态、事件、slots 与渲染；复杂纯逻辑放入同目录工具文件。
- 只有真正需要外部 ref 调用时才使用 `defineExpose`。
- `v-model`、事件名、插槽和默认值必须与现有组件家族及文档一致。
- 父子组件通信优先沿用仓库已有的 provide/inject context，不自创第二套注册协议。

新增公开组件时同步：

- `src/uni_modules/lucky-ui/components/index.ts` 的组件与类型导出。
- `src/uni_modules/lucky-ui/components.d.ts` 的全局组件声明。
- `.agents/skills/lucky-ui-coding/references/component-map.md`、正式文档及需要的 Demo/预览链路。

## 样式与主题

- 根类使用 `.lk-<name>`，元素和变体沿用仓库 BEM 风格。
- 优先消费 `src/uni_modules/lucky-ui/theme/src/component-vars.scss` 中的语义 `--lk-*` 变量。
- 新公共主题变量需要同时定义亮色和暗色值；内部临时变量使用 `--_*`，不要写入公共文档。
- Mixins 从 `src/uni_modules/lucky-ui/theme/src/mixins/index.scss` 的当前导出读取，不使用旧的 `mixins/flex` 或不存在的 mixin 名。
- 跨组件状态不要使用会在 UniApp 编译中丢失的 `:global(...) &`。

## 跨端规则

- 优先使用 `uni.*` API；DOM API 仅能放在明确的 H5 条件编译中。
- 交互优先使用 UniApp 支持的事件与节点，不依赖仅浏览器可用的行为。
- 尺寸、选择器、字体加载、fixed/overflow 和样式隔离需要在 H5 与微信小程序分别验证。
- 条件编译沿用仓库现有 `#ifdef` / `#ifndef` 写法，不用运行时平台猜测替代编译边界。
- 业务图标默认使用 Lucky UI 线性图标；图标管线变更同时读取 `../lucky-ui-icon/SKILL.md`。

## 校验

```bash
pnpm run compat-check
pnpm run lint
pnpm run type-check
pnpm run build:h5
pnpm run build:mp-weixin
```

运行目标组件相关单元测试；若同步文档，再运行 `pnpm run docs:build`。最后审查生成文件和暂存列表，确保没有格式化或提交无关文件。
