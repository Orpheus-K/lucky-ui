---
name: lucky-ui-coding
description: 将业务与 UI 关键词精准映射到 lucky-ui 组件，并按仓库相对路径串联组件文档和源码。用于编写或还原 UniApp 业务页面、选择与组合 Lucky UI 组件、实现登录表单、商品订单、会员中心、搜索筛选、数据看板、弹层反馈等界面，以及核对组件 API；修改组件库内部实现时同时使用 lucky-ui-component。
---

# Lucky UI 业务编码

## 工作流

1. 从需求提取业务关键词，读取 [references/component-map.md](references/component-map.md)，选择满足需求的最小组件集合。
2. 先读取 canonical 文档 `docs/components/<name>.md`，不要使用旧的 `docs/components/basic/`；不得凭印象编造 prop、event、slot 或方法。
3. 文档不明确或与实现冲突时，读取 `src/uni_modules/lucky-ui/components/lk-<name>/` 下的 props、主组件与工具；源码是 API 真相，并同步修正文档。
4. 所有文件引用均以仓库根目录为基准，使用 `/` 分隔的相对路径；不要输出机器绝对路径。
5. 业务页面优先组合现有组件并使用 Lucky UI 主题变量；业务图标使用线性图标，除非用户明确要求填充图标。
6. 使用前在 `src/uni_modules/lucky-ui/components/index.ts` 核对公共导出；需要运行示例时，从文档 `phone` 或 `src/components/preview/preview-catalog.ts` 取得 `<preview-slug>`，再读 `src/components/demos/<preview-slug>-demo.vue`。
7. 新增或改名组件时，同步维护组件源码、`docs/components/<name>.md` 与映射表，保持一一对应。

## 边界

- 修改组件公共 API、跨端行为或默认样式：同时读取 `../lucky-ui-component/SKILL.md`。
- 编写组件文档、Demo 或 VitePress 导航：同时读取 `../lucky-ui-docs/SKILL.md`。
- 需要主题或图标细节：分别读取 `../lucky-ui-theme/SKILL.md`、`../lucky-ui-icon/SKILL.md`。
