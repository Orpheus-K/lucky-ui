---
name: lucky-ui-docs
description: 为 lucky-ui 编写或维护 VitePress 组件文档、API 表格、UniApp Demo、手机预览映射和导航。用于新增组件文档、修正文档与源码不一致、同步 Props、Events、Slots、Methods、CSS 变量、注册 phone 预览或调整 docs/.vitepress；纯业务页面使用 lucky-ui-coding，修改组件实现时同时使用 lucky-ui-component。
---

# Lucky UI 文档维护

## 基准

- 所有路径都以仓库根目录为基准。
- 组件正式文档位于 `docs/components/<slug>.md`，不要引用旧的 `docs/components/basic/`。
- API 的事实来源按顺序核对：
  1. `src/uni_modules/lucky-ui/components/lk-<slug>/` 中实际存在的 `*.props.ts`，以及它导入的公共 props 和类型。
  2. `lk-<slug>.vue`、工具、composables 与模板 class 实际形成的行为、emits、slots 和 `defineExpose`。
  3. 同目录样式、`src/uni_modules/lucky-ui/theme/src/index.scss` 引入的全局样式及 `component-vars.scss`。
- 只记录源码真实支持的能力。不要从通用模板复制 `change`、`open`、`close`、`toggle`、`primary`、`danger`、插槽或 CSS 变量等占位 API。
- 文档与源码冲突时，以当前源码为准并修正文档；API 不明确时继续查源码，不猜测。

## 工作流

1. 读取现有组件文档、组件实现和对应样式。
2. 提取准确的 Props、Events、Slots、Methods 与 CSS 变量。
3. 使用真实属性和事件编写可复制示例。
4. 在 `docs/.vitepress/config.ts` 当前分类中只插入需要的导航项。
5. 只有需要手机预览时才补齐完整预览链路。
6. 构建文档；若改动 Demo，再运行并检查 H5 手机预览。

## 组件文档

Frontmatter 至少包含：

```yaml
---
title: 组件名
description: 一句话说明真实用途
---
```

仅当完整预览链路存在且 slug 已核对时，才添加：

```yaml
phone: <preview-slug>
```

正文保持简洁，按实际能力选择以下部分：

1. 用途与导入方式。
2. 基础用法和必要场景示例。
3. `Props`。
4. `Events`。
5. `Slots`。
6. `Methods`。
7. CSS 变量与跨端注意事项。

规则：

- Props 表沿用该目录现有文档的列结构与类型写法。
- 继承的 prop 只有在模板、computed、工具或 composable 中产生可观察行为时才作为有效 API；仅被展开声明不代表组件真实支持。
- 事件标题使用项目惯例 `Events`；只列源码已声明的事件。
- Methods 只列通过 `defineExpose` 暴露的方法。
- CSS 变量只列有意允许用户覆盖的定制变量；不要公开 `--_h` 等内部变量，也不要把 ripple 坐标、尺寸等运行时 `--lk-*` 状态误当公共 API。
- 不存在的章节直接省略，不为版式完整而造 API。

## Demo 与手机预览

- Demo 文件：`src/components/demos/<preview-slug>-demo.vue`。
- 复用 `src/uni_modules/lucky-ui/components/demo-block/demo-block.vue`。
- `DemoBlock` 的真实展示属性为 `title`、`desc` 和布尔值 `padding`；示例仍需按目标组件源码核对。
- Demo 根节点沿用项目的 `<view class="component-demo">` 结构。

手机预览必须同时核对以下链路：

1. `src/components/preview/preview-catalog.ts` 中有 kebab-case slug 元数据。
2. `src/components/demos/<preview-slug>-demo.vue` 存在。
3. `src/components/preview/preview-demo-registry.ts` 注册同一 slug。
4. `src/components/preview/PreviewDemoRenderer.vue` 导入 Demo 并包含渲染分支。
5. 文档 frontmatter 的 `phone` 指向可用 slug。
6. `docs/.vitepress/config.ts` 当前分类中有该文档入口。

VitePress 端还需核对 `docs/.vitepress/theme/index.ts` 已注册自定义 Layout，以及 `docs/.vitepress/theme/Layout.vue`、`docs/.vitepress/theme/components/PhonePreview.vue` 与 `docs/.vitepress/theme/constants/preview.ts`。默认开发地址应生成 `http://localhost:5188/#/pages_sub/component-detail/index?component=<preview-slug>`；若设置 `VITE_LUCKY_UI_H5_PREVIEW_URL`，以该基址为准。

UniApp 端核对 `src/pages.json` 已注册共享页面，并检查 `src/composables/usePreviewQuery.ts` 与 `src/pages_sub/component-detail/index.vue` 能按 slug 渲染。无需为每个组件新增 `pages.json` 页面。

类型检查不能证明 slug 命中。运行时必须正向确认目标 Demo 的标题或标志内容出现、fallback 文案未出现，并让 Demo 覆盖文档中的关键场景。

不要假定文档名与预览 slug 永远相同。已知例外包括：

- `preload-debugger` 的手机预览使用 `preload`。
- `tabbar-container` 当前不声明 `phone`。

其他别名或缺省情况必须从完整链路核对后再写。

## 校验

```bash
pnpm run docs:build
```

若改动 Demo 或预览注册，再运行：

```bash
pnpm run type-check
pnpm run lint
pnpm run dev:h5
```

同时运行 `pnpm run docs:dev`，检查组件文档中的 iframe 和 H5 直达路由。若修改组件行为，再执行对应单元测试。最后确认文档链接无误、API 与源码一致，并只提交本任务文件。
