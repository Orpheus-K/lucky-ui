---
name: lucky-ui-workflow
description: >-
  lucky-ui 端到端开发工作流与质量治理规范。
  用于指导从需求归因、/grill-me 方案对齐、跨端编码、Peekit 运行态验收到三位一体（组件+Demo+文档）交付的全流程。
---

# Lucky UI 端到端开发工作流与治理规范

本技能规范了 Lucky UI 从需求接入到最终交付的标准工程流水线，确保每一次功能演进或缺陷修复都**有规律、防回退、有据可依**。

---

## 一、 标准开发流水线 (5-Stage Pipeline)

```
[阶段 1: 归因诊断] ──> [阶段 2: /grill-me 对齐] ──> [阶段 3: 跨端研发] ──> [阶段 4: 运行态验收] ──> [阶段 5: 三位一体交付]
  (lucky-ui-diagnose)     (方案与接口澄清)           (lucky-ui-component)   (lucky-ui-peekit-acceptance)  (组件 + Demo + 文档)
```

---

## 二、 阶段操作要点

### 阶段 1：归因诊断与双轨审查 (Dual-Track Review & Diagnosis)
* 调起 [`lucky-ui-diagnose`](../lucky-ui-diagnose/SKILL.md) 技能。
* **代码与 UI 双轨审查**：不仅审核 Props / Events / 状态逻辑，必须依据专业 UI 审查标准对暗色/亮色色彩对比度、元素空间节奏、堆叠紧贴、微观基线对齐进行理性判断。
* **明确问题归因**：准确辨别是组件库核心封装缺陷、Demo 示例组合与排版不当，还是主题 Token 配置问题。
* 严禁将业务兜底样式硬编码进 `src/uni_modules/lucky-ui/`。

### 阶段 2：方案对齐与 `/grill-me` (Design Alignment)
在编写或重构组件前，必须与开发者对齐以下核心要素：
1. **Props / Events / Slots 契约**：
   - 命名是否符合 Vue 3 + UniApp 惯例（如 `modelValue`, `disabled`, `customClass`）。
   - 事件命名（如 `@change`, `@click`, `@confirm`）。
2. **跨端限制与兼容方案**：
   - 微信小程序限制：无 `document`/`window`、样式隔离（`styleIsolation`）、原生组件层级（`cover-view`）。
   - H5/App 端特性与手势差异。
3. **破坏性变更评估**：
   - 是否影响既有业务页面调用，是否需要向下兼容。

### 阶段 3：跨端规范研发 (Implementation)
* 遵循 [`lucky-ui-component`](../lucky-ui-component/SKILL.md) 规范。
* 样式一律采用 SCSS 并绑定 CSS 变量（`var(--lk-*)`）。
* 导出组件类型定义至 `src/uni_modules/lucky-ui/components.d.ts`。

### 阶段 4：真实运行态验收 (Peekit Acceptance)
* 调起 [`lucky-ui-peekit-acceptance`](../lucky-ui-peekit-acceptance/SKILL.md)。
* 调用 Peekit MCP 工具抓取 H5 运行态真实 DOM 与计算样式。
* 确保在 375px 经典移动端视口下无布局错位、无文字溢出。

### 阶段 5：三位一体交付 (Trinity Delivery)
任何组件的新增或功能调整，必须同时完成以下 3 项交付：
1. **组件源码与类型**：`src/uni_modules/lucky-ui/components/lk-xxx/` 与 `components.d.ts`
2. **交互示例页面**：`src/pages/xxx/xxx.vue`（涵盖默认、各状态与事件监听）
3. **官方组件文档**：`docs/components/xxx.md`（含 Props/Events/Slots 表格与 CSS 变量表）
