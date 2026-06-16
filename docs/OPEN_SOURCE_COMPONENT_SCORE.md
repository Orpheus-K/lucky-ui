# Lucky UI 组件开源发布评分报告（Fresh Audit）

> 生成时间：2026-06-12；范围：当前 worktree 中 `src/uni_modules/lucky-ui/components/` 下 73 个 `lk-*` 目录。
> 本轮为重新评分，不沿用旧报告分数；所有结论来自当前文件树、导出入口、全局类型、文档、Demo、showcase 源数据与视觉测试文件。

## 评分口径

- 总分 100：结构完整度、类型与导出、文档与 Demo、验证基线、发布风险各 20 分。
- 等级：A 90-100 可优先发布；B 80-89 小修/补验证后发布；C 70-79 需补关键验证或直连示例；D 0-69 不建议进入公开首批。
- `lk-preload-debugger` 按 dev-only 内部工具处理，不进入公开组件均分。
- `chart-lite` 聚合 showcase 只给聚合验证分，不再等同于子组件 direct demo/direct showcase。
- `verified` 仅取自 `src/components/showcase/showcase-cases.ts` 的 `verifyStatus`；自动回归覆盖还需看 `tests/visual/*`。

## 总体分布

| 指标 | 数量 |
|------|------|
| 实际 `lk-*` 目录 | 73 |
| 公开评分组件 | 72 |
| Showcase case | 72 |
| 公开组件均分 | 92.1 |
| A | 57 |
| B | 15 |
| C | 0 |
| D | 0 |
| Internal | 1 |

## 真实结论

这轮分数以当前 worktree 重新计算，不沿用旧报告的历史修复批次叙述。当前仓库实际已有 73 个 `lk-*` 目录，其中新增或此前未计入的 `lk-form-group`、`lk-chart-area`、`lk-root` 等改变了底部风险分布。

最低分不是 `lk-anchor`。`lk-anchor` 当前已经有 `baseProps`、导出、全局类型、直接文档、直接 Demo 和 verified showcase，本轮为 90 分。`lk-form-group` 已在本轮补齐直接文档、直接 Demo、preview 入口和 verified showcase，从 58 D 重评为 93 A；`lk-chart-area` 已补齐 direct Demo、独立预览入口和 verified showcase，从 67 D 重评为 92 A；`chart-lite` 四个子组件已补齐 direct Demo、独立文档预览、preview 入口和 verified showcase。当前 C/D 级已清零，真正剩余低分链路集中在：

1. `lk-root`：作为基础设施组件已有文档与导出，但缺 showcase 证据；是否进入公开首批需要明确策略。
2. `lk-tabbar-container`：已补 slot/safeMode/fixed=false 降级，但固定底栏、动态组件和小程序插槽策略仍需持续平台回归。
3. `lk-pull-refresh/horizontal-scroll/chart-sparkline`：已不再是 C/D，但仍有滚动、触摸或 Canvas 平台风险，发布前需要持续验收。

## 优先级队列

| 优先级 | 状态 | 目标 | 原因 | 完成标准 |
|------|------|------|------|----------|
| P0 | 已完成 | `lk-form-group` | 本轮从 58 D 补齐 direct 文档/Demo/showcase 后重评为 93 A | 持续保留 direct 文档、Demo、preview 入口和 visual showcase 覆盖 |
| P0 | 已完成 | `lk-chart-area` | 本轮从 67 D 补齐 direct Demo、preview、showcase 后重评为 92 A | 持续保留 direct Demo、独立文档预览、visual showcase 和 Canvas 边界数据覆盖 |
| P1 | 已完成 | `chart-lite` 子组件 | `ring/sparkline/stat-card/radar-lite` 已补 direct Demo、独立 preview 和 showcase 证据 | 独立公开时保留 direct Demo；聚合页只作为组合示例，不再作为唯一证据 |
| P1 | 已完成 | `lk-overlay/backtop/navbar` | 已补平台验收说明、visual showcase 覆盖和 needs-hardening 交互断言 | 持续保留 H5/App/小程序验收说明与 Playwright 回归 |

## Bottom 风险清单

| 组件 | 分数 | 等级 | 主要问题 |
|------|------|------|----------|
| lk-root | 80 | B | infrastructure；no showcase |
| lk-tabbar-container | 84 | B | high risk；fixed/filter/dynamic-component/scroll；已有 slot/safeMode/fixed=false 降级但仍需平台矩阵 |

## 全量评分表

| 组件 | 总分 | 等级 | 结构 | 类型导出 | 文档Demo | 验证 | 风险 | Showcase | 风险级别 | 备注 |
|------|------|------|------|----------|----------|------|------|----------|----------|------|
| lk-root | 80 | B | 20 | 20 | 20 | 0 | 20 | missing | missing | no showcase; filter/webkit |
| lk-tabbar-container | 84 | B | 20 | 20 | 18 | 17 | 9 | verified | high | fixed/filter/webkit/dynamic-component/scroll/gesture |
| lk-pull-refresh | 85 | B | 20 | 20 | 18 | 12 | 15 | verified | medium | scroll/gesture |
| lk-horizontal-scroll | 86 | B | 20 | 20 | 18 | 15 | 13 | verified | medium | filter/webkit/scroll/gesture |
| lk-chart-sparkline | 86 | B | 20 | 20 | 20 | 15 | 11 | verified | low | direct doc/demo/showcase; filter/webkit/scroll/gesture/canvas |
| lk-form | 87 | B | 20 | 20 | 20 | 12 | 15 | verified | medium | runtime-api/scroll/gesture |
| lk-slider | 87 | B | 20 | 20 | 20 | 15 | 12 | verified | medium | runtime-api/scroll/gesture |
| lk-sticky | 87 | B | 20 | 20 | 18 | 15 | 14 | verified | medium | runtime-api |
| lk-upload | 87 | B | 20 | 20 | 18 | 12 | 17 | verified | medium | runtime-api |
| lk-segmented | 88 | B | 20 | 20 | 18 | 15 | 15 | verified | low | filter/webkit/runtime-api |
| lk-chart-bar | 89 | B | 20 | 20 | 18 | 15 | 16 | verified | low | scroll/gesture/canvas |
| lk-chart-line | 89 | B | 20 | 20 | 18 | 15 | 16 | verified | low | scroll/gesture/canvas |
| lk-fab | 89 | B | 20 | 20 | 18 | 17 | 14 | verified | medium | fixed/filter/webkit/scroll/gesture |
| lk-notice-bar | 89 | B | 20 | 20 | 20 | 12 | 17 | verified | medium |  |
| lk-tabbar | 89 | B | 20 | 15 | 18 | 20 | 16 | verified | medium | fixed/filter/webkit |
| lk-action-sheet | 90 | A | 20 | 20 | 18 | 12 | 20 | verified | medium |  |
| lk-anchor | 90 | A | 20 | 20 | 20 | 15 | 15 | verified | medium | runtime-api/scroll/gesture |
| lk-dropdown | 90 | A | 20 | 20 | 20 | 12 | 18 | verified | medium | fixed |
| lk-empty | 90 | A | 20 | 20 | 18 | 15 | 17 | verified | low | runtime-api |
| lk-overlay | 90 | A | 20 | 20 | 20 | 20 | 10 | verified | medium | fixed/runtime-api/scroll/gesture; platform acceptance + interaction spec |
| lk-watermark | 90 | A | 20 | 20 | 20 | 15 | 15 | verified | medium | fixed |
| lk-backtop | 91 | A | 20 | 20 | 20 | 20 | 11 | verified | medium | fixed/filter/webkit/scroll/gesture; platform acceptance + interaction spec |
| lk-radio | 91 | A | 20 | 20 | 18 | 15 | 18 | verified | low | filter/webkit |
| lk-select-list | 91 | A | 20 | 20 | 18 | 15 | 18 | verified | low | filter/webkit |
| lk-stepper | 91 | A | 20 | 20 | 20 | 15 | 16 | verified | low | filter/webkit/scroll/gesture |
| lk-waterfall | 91 | A | 20 | 20 | 20 | 20 | 11 | verified | high | filter/webkit/runtime-api/scroll/gesture |
| lk-chart-pie | 92 | A | 20 | 20 | 18 | 15 | 19 | verified | low | scroll/gesture/canvas |
| lk-chart-area | 92 | A | 20 | 20 | 20 | 15 | 17 | verified | low | direct doc/demo/showcase; filter/webkit/scroll/gesture/canvas |
| lk-chart-stat-card | 92 | A | 20 | 20 | 20 | 15 | 17 | verified | low | direct doc/demo/showcase |
| lk-countdown | 92 | A | 20 | 20 | 20 | 12 | 20 | verified | medium |  |
| lk-curtain | 92 | A | 20 | 20 | 20 | 17 | 15 | verified | medium | fixed/runtime-api |
| lk-image | 92 | A | 20 | 20 | 20 | 15 | 17 | verified | medium |  |
| lk-navbar | 92 | A | 20 | 20 | 20 | 20 | 12 | verified | medium | fixed/runtime-api; platform acceptance + interaction spec |
| lk-avatar | 93 | A | 20 | 20 | 18 | 15 | 20 | verified | low |  |
| lk-carousel | 93 | A | 20 | 20 | 20 | 20 | 13 | verified | medium | filter/webkit/runtime-api/scroll/gesture |
| lk-cell | 93 | A | 20 | 20 | 18 | 15 | 20 | verified | low |  |
| lk-checkbox | 93 | A | 20 | 20 | 20 | 15 | 18 | verified | low | filter/webkit |
| lk-chart-radar-lite | 93 | A | 20 | 20 | 20 | 15 | 18 | verified | low | direct doc/demo/showcase; canvas |
| lk-chart-ring | 93 | A | 20 | 20 | 20 | 15 | 18 | verified | low | direct doc/demo/showcase; canvas |
| lk-collapse | 93 | A | 20 | 20 | 18 | 15 | 20 | verified | medium |  |
| lk-divider | 93 | A | 20 | 20 | 18 | 15 | 20 | verified | low |  |
| lk-form-group | 93 | A | 18 | 20 | 20 | 15 | 20 | verified | low | direct doc/demo/showcase |
| lk-grid | 93 | A | 20 | 20 | 18 | 15 | 20 | verified | low |  |
| lk-icon | 93 | A | 20 | 20 | 20 | 15 | 18 | verified | low | filter/webkit |
| lk-keyboard | 93 | A | 20 | 20 | 20 | 17 | 16 | verified | medium | fixed/filter/webkit |
| lk-number-roller | 93 | A | 20 | 20 | 18 | 15 | 20 | verified | low |  |
| lk-popup | 93 | A | 20 | 20 | 20 | 17 | 16 | verified | medium | fixed/scroll/gesture |
| lk-rate | 93 | A | 20 | 20 | 18 | 15 | 20 | verified | low |  |
| lk-tab | 93 | A | 20 | 20 | 20 | 20 | 13 | verified | low | filter/webkit/runtime-api/scroll/gesture |
| lk-tag | 93 | A | 20 | 20 | 20 | 15 | 18 | verified | low | filter/webkit |
| lk-verify-code | 93 | A | 20 | 20 | 18 | 15 | 20 | verified | low |  |
| lk-calendar | 95 | A | 20 | 20 | 20 | 15 | 20 | verified | low | scroll/gesture |
| lk-calendar-picker | 95 | A | 20 | 20 | 20 | 15 | 20 | verified | low |  |
| lk-choice | 95 | A | 20 | 20 | 20 | 15 | 20 | verified | low |  |
| lk-input | 95 | A | 20 | 20 | 20 | 15 | 20 | verified | medium |  |
| lk-loading | 95 | A | 20 | 20 | 20 | 20 | 15 | verified | medium | filter/webkit |
| lk-meta-row | 95 | A | 20 | 20 | 20 | 15 | 20 | verified | low |  |
| lk-modal | 95 | A | 20 | 20 | 20 | 17 | 18 | verified | medium | fixed |
| lk-progress | 95 | A | 20 | 20 | 20 | 15 | 20 | verified | low |  |
| lk-skeleton | 95 | A | 20 | 20 | 20 | 15 | 20 | verified | low |  |
| lk-space | 95 | A | 20 | 20 | 20 | 15 | 20 | verified | low |  |
| lk-textarea | 95 | A | 20 | 20 | 20 | 15 | 20 | verified | low | fixed |
| lk-toast | 95 | A | 20 | 20 | 20 | 17 | 18 | verified | medium | fixed |
| lk-page | 96 | A | 18 | 20 | 18 | 20 | 20 | verified | low | scroll/gesture |
| lk-picker | 96 | A | 20 | 20 | 20 | 20 | 16 | verified | high | scroll/gesture |
| lk-timeline | 96 | A | 20 | 20 | 18 | 20 | 18 | verified | medium | filter/webkit |
| lk-virtual-list | 96 | A | 20 | 20 | 20 | 20 | 16 | verified | medium | filter/webkit/scroll/gesture |
| lk-button | 98 | A | 20 | 20 | 18 | 20 | 20 | verified | low |  |
| lk-card | 98 | A | 20 | 20 | 18 | 20 | 20 | verified | low |  |
| lk-switch | 98 | A | 20 | 20 | 20 | 20 | 18 | verified | medium | filter/webkit |
| lk-tooltip | 98 | A | 20 | 20 | 20 | 20 | 18 | verified | high |  |
| lk-badge | 100 | A | 20 | 20 | 20 | 20 | 20 | verified | low |  |
| lk-preload-debugger | — | Internal | 20 | 0 | 8 | 0 | 4 | missing | missing | dev-only |

## 后续判断

当前四个优先级均已完成；若继续优化，下一步应转向非本轮队列的剩余低 B：

1. `lk-form-group` 本轮已按公开组件标准补齐 direct 文档、Demo、preview catalog、preview renderer 和 showcase case。
2. `lk-chart-area` 本轮已按独立公开组件标准补齐 direct Demo、preview 入口、文档预览目标和 showcase case。
3. `chart-lite` 四个子组件本轮已补 direct Demo、独立文档预览、preview catalog、preview renderer 和 showcase case；`chart-lite` 聚合页保留为组合示例。
4. `lk-overlay/backtop/navbar` 本轮已补 H5/App/小程序验收说明、visual showcase 覆盖和 needs-hardening Playwright 交互断言。
