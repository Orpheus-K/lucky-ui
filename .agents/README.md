# Lucky UI × Antigravity 开发者 AI 协作手册

本目录整合了 **Antigravity** 核心扩展机制（**MCP、Skills、Rules、Hooks**），为 `lucky-ui` 组件库提供标准化的 AI 辅助研发、跨端（H5 + 微信小程序）真实运行态验收与质量治理体系。

---

## 1. 架构总览

```
.agents/
├── mcp_config.json                 # Peekit MCP 双端探针配置 (H5 + 微信小程序)
├── hooks.json                      # 生命周期守卫 (PreToolUse 权限/限流拦截 & Stop 交付检查)
├── scripts/                        # 核心运行与守卫脚本
│   ├── peekit-mcp-runner.cjs       # [MCP Runner] 单例进程锁 + 60s 端口长轮询 (防冷启动误判)
│   ├── guard-pre-tool.cjs          # [Hook Guard] 前置构建命令与 30s CLI 防刷拦截
│   └── check-delivery-stop.cjs     # [Hook Guard] 结束前交付完整性检查
└── skills/                         # 三层技能矩阵
    ├── lucky-ui-component/         # [研发] 组件核心开发与跨端实现
    ├── lucky-ui-theme/             # [研发] 主题 Token 与 CSS 变量维护
    ├── lucky-ui-icon/              # [研发] 图标字体与 SVG 管理
    ├── lucky-ui-coding/            # [研发] 业务页面组装与组件映射
    ├── lucky-ui-peekit-acceptance/ # [验收] 基于 Peekit MCP 的双端运行态走查
    ├── lucky-ui-workflow/          # [治理] 端到端开发流与 /grill-me 方案对齐
    ├── lucky-ui-diagnose/          # [治理] 组件库 vs Demo 缺陷归因分流
    └── lucky-ui-docs/              # [治理] VitePress 文档与 API 同步
```

---

## 2. 核心机制使用指南

### ① Peekit MCP (H5 + 微信小程序双端真实运行态验收)
* **配置文件**：[`mcp_config.json`](./mcp_config.json) 驱动 [`scripts/peekit-mcp-runner.cjs`](./scripts/peekit-mcp-runner.cjs)
* **核心能力**：
  - **H5 验收**：直连本地 Vite 预览服务 (`http://localhost:5173`)，通过 Playwright 毫秒级提取 DOM 结构与计算样式。
  - **微信小程序验收**：连接 DevTools 自动化端口 (`ws://127.0.0.1:9420`)，通过 `miniprogram-automator` 提取 WXML 与组件样式。
* **冷启动防误判机制 (四重防线)**：
  1. **MCP Runner**：启动 CLI 时使用文件锁防重入，并在端口 9420 开启 60 秒长轮询等待，抹平 20~45s 冷启动时延。
  2. **PreToolUse Hook**：30 秒内物理拦截重复启动 CLI，避免并发进程冲突。
  3. **Rules 规则**：在 `AGENTS.md` 明确声明冷启动时延正常，严禁循环重试。
  4. **Skills 规范**：提供统一的双端验收与排障操作。

### ② 三层 Skills 矩阵
| 分层 | 技能名称 | 核心职责 | 触发时机 |
| :--- | :--- | :--- | :--- |
| **组件研发层** | [`lucky-ui-component`](./skills/lucky-ui-component/SKILL.md) | 新增/修改 Vue 3 + TS 跨端组件，维护 `components.d.ts` | 编写或重构组件代码 |
| | [`lucky-ui-theme`](./skills/lucky-ui-theme/SKILL.md) | 管理设计 Token、颜色变量、暗黑模式 | 修改品牌色或全局样式变量 |
| | [`lucky-ui-icon`](./skills/lucky-ui-icon/SKILL.md) | 图标库引入、SVG 转换与 Base64 字体 | 增加或调整图标资源 |
| | [`lucky-ui-coding`](./skills/lucky-ui-coding/SKILL.md) | 业务界面组装与 Lucky UI 组件快速选型 | 编写业务页面/示例 |
| **运行态验收层** | [`lucky-ui-peekit-acceptance`](./skills/lucky-ui-peekit-acceptance/SKILL.md) | 调用 Peekit MCP 双端探针验证 DOM/WXML 与视觉样式 | 组件交付/修复后的运行态核验 |
| **流程治理层** | [`lucky-ui-workflow`](./skills/lucky-ui-workflow/SKILL.md) | 串联 5 阶段流水线与 `/grill-me` 方案对齐 | 开启新任务或跨模块大改动 |
| | [`lucky-ui-diagnose`](./skills/lucky-ui-diagnose/SKILL.md) | 判定缺陷属于组件库、Demo 还是主题 Token | 收到 bug / fix / 样式错位反馈 |
| | [`lucky-ui-docs`](./skills/lucky-ui-docs/SKILL.md) | 维护 VitePress 文档、API 表格与 Demo 映射 | 组件 Props/Events 变更后同步文档 |

### ③ 规则与生命周期守卫 (Rules & Hooks)
* **分层规则**（`AGENTS.md` / `GEMINI.md`）：
  - **AI 执行守则**：禁止未经用户主动要求擅自执行全局 build、test 或全量 lint。
  - **归因守则**：严禁在组件库内硬编码业务兜底样式来掩盖 Demo 问题。
  - **冷启动守则**：微信工具冷启动期间禁止中断或高频重复拉起 CLI。
* **Lifecycle Hooks**（[`hooks.json`](./hooks.json)）：
  - **`PreToolUse`**：自动拦截非预期的重型构建命令、锁文件篡改及 30s 内 CLI 高频重复启动。
  - **`Stop`**：提供统一的结束钩子入口；当前默认放行，后续可扩展三位一体交付物自动检查。

---

## 3. 标准开发流水线与 `/grill-me`

任何组件开发或重大重构任务，严格遵循以下 5 步：

```
[1. 归因诊断] ──> [2. /grill-me 方案对齐] ──> [3. 跨端编码] ──> [4. 双端 Peekit 验收] ──> [5. 三位一体交付]
```

1. **归因分流**：使用 `lucky-ui-diagnose` 确定修改目标目录。
2. **方案对齐**：输入 `/grill-me`，交互式澄清 Props/Events 契约、跨端差异边界与向下兼容性。
3. **规范编码**：遵循 `lucky-ui-component` 开发，使用 CSS 变量与 SCSS。
4. **运行态验收**：使用 `lucky-ui-peekit-acceptance` 检查 H5 DOM 与微信 WXML。
5. **三位一体交付**：保证 **组件源码 (`src/uni_modules/`) + 演示页面 (`src/pages/`) + 文档 (`docs/`)** 同步交付。
