---
title: AI Skills
description: 使用 Lucky UI 仓库专属 skills，把业务关键词对准组件文档与源码。
---

# Lucky UI AI Skills

Lucky UI 在 `.agents/skills/` 提供仓库级 skills。请以 `lucky-ui` 为当前工作目录；AI 编码助手会从当前目录向上发现这些 skills。可以自然描述任务自动匹配，也可以用 `$skill-name` 明确指定。

## 30 秒上手

```text
使用 $lucky-ui-coding 实现“登录 / 注册页”。
先按业务关键词选择最小组件集合，逐个读取组件文档，再开始编码；不要猜测 API。
```

预期先对准 `form`、`input`、`verify-code`、`button`，再读取它们的正式文档。

## Skills 选择

| Skill | 何时使用 | 相对路径 |
|---|---|---|
| `$lucky-ui-coding` | 业务页面、UI 还原、组件选择与组合 | `.agents/skills/lucky-ui-coding/SKILL.md` |
| `$lucky-ui-component` | 新增或修改组件、公共 API、跨端行为 | `.agents/skills/lucky-ui-component/SKILL.md` |
| `$lucky-ui-docs` | 组件文档、Demo、VitePress 导航与预览 | `.agents/skills/lucky-ui-docs/SKILL.md` |
| `$lucky-ui-theme` | 品牌色、明暗模式、设计 Token | `.agents/skills/lucky-ui-theme/SKILL.md` |
| `$lucky-ui-icon` | SVG、字体图标、图标命名与构建 | `.agents/skills/lucky-ui-icon/SKILL.md` |

业务页面默认从 `$lucky-ui-coding` 开始；修改组件时叠加 `$lucky-ui-component`，同步文档时再叠加 `$lucky-ui-docs`，主题或图标任务按需组合对应 skill。

## Coding 对准链路

所有路径均相对仓库根目录：

```text
业务关键词
  → .agents/skills/lucky-ui-coding/references/component-map.md
  → docs/components/<name>.md
  → src/uni_modules/lucky-ui/components/lk-<name>/
  → 业务页面代码
```

1. 从需求提取关键词，在映射表中选择最小组件集合。
2. 先读 `docs/components/<name>.md`，确认 Props、Events、Slots 与用法。
3. 文档不明确时再读源码；源码是 API 真相。
4. 需要运行示例时，从文档 `phone` 或预览目录取得 `<preview-slug>`，再读取 `src/pages_sub/components/demos/<preview-slug>-demo.vue`。

不要读取旧的 `docs/components/basic/`。新增或重命名组件时，必须同步维护组件源码、正式文档和关键词映射，保持一一对应。

## 常见关键词

| 业务关键词 | 推荐组件 | 正式文档 |
|---|---|---|
| 登录、注册、验证码 | `lk-form`、`lk-input`、`lk-verify-code`、`lk-button` | [Form](/components/form)、[Input](/components/input)、[Verify Code](/components/verify-code)、[Button](/components/button) |
| 搜索、筛选、商品列表 | `lk-input`、`lk-dropdown`、`lk-card`、`lk-skeleton`、`lk-empty` | [Input](/components/input)、[Dropdown](/components/dropdown)、[Card](/components/card)、[Skeleton](/components/skeleton)、[Empty](/components/empty) |
| 会员中心、等级、权益 | `lk-avatar`、`lk-badge`、`lk-grid`、`lk-cell`、`lk-card` | [Avatar](/components/avatar)、[Badge](/components/badge)、[Grid](/components/grid)、[Cell](/components/cell)、[Card](/components/card) |
| 数据看板、趋势、占比 | `lk-chart-stat-card`、趋势图、占比图、`lk-segmented` | [Stat Card](/components/chart-stat-card)、[Line](/components/chart-line)、[Pie](/components/chart-pie)、[Segmented](/components/segmented) |
| 确认、警告、轻提示 | `lk-modal`、`lk-popup`、`lk-toast` | [Modal](/components/modal)、[Popup](/components/popup)、[Toast](/components/toast) |

完整的 73 个组件映射见 `.agents/skills/lucky-ui-coding/references/component-map.md`。

## 可复制提示词

```text
$lucky-ui-coding 用 Lucky UI 实现登录 / 注册页，先按关键词映射并读取组件文档，再编码。
```

```text
$lucky-ui-component $lucky-ui-docs 新增 lk-result，保持跨端兼容，并同步组件文档、Demo、导出和导航。
```

```text
$lucky-ui-theme 将品牌色调整为 #1677ff，并保持亮暗主题语义变量一致。
```

```text
$lucky-ui-icon 增加 person 线性图标，重建字体并说明 lk-icon 用法。
```
