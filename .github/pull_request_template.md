## 📌 变更说明 (Summary)

- **变更背景/原因**：
- **核心改动内容**：
- **关联 Issue**：Close #

---

## 🏷️ 变更类型 (Change Type)

- [ ] `feat`: 新功能 / 新特性
- [ ] `fix`: 缺陷修复
- [ ] `style`: 代码格式化（仅限空格/缩进/Prettier，不含样式修改）
- [ ] `refactor`: 代码重构
- [ ] `perf`: 性能优化
- [ ] `docs`: 文档/Demo 变更
- [ ] `test`: 单元测试补充或修正
- [ ] `chore` / `build` / `ci`: 构建、依赖或工程配置变更

---

## ✅ 提 PR 前自检清单 (Checklist)

### 1. 规范与提交 (Commit & Spec)
- [ ] Commit 信息符合 Angular 规范（中文描述、中英文保留半角空格、小写 scope）。
- [ ] 若使用 `style` 类型，确认**仅用于代码格式化**，未混入 CSS/SCSS/UI 样式修改。

### 2. 代码质量与验证 (Quality & Test)
- [ ] 已执行 `pnpm run type-check`，TypeScript 类型检查无报错。
- [ ] 已执行 `pnpm run test:unit`，所有单元测试全部通过。
- [ ] 已执行 `pnpm run format`，代码风格统一。

### 3. 多端兼容与文档 (Compatibility & Docs)
- [ ] 已在 **H5** 与 **微信小程序** 平台完成基本功能与布局验证。
- [ ] 若涉及组件 API、Props、Events 变更，已同步更新对应 Markdown 文档。

---

## 📸 视觉/效果演示 (Screenshots / Demos)

*(如涉及 UI 布局、交互效果变更，请附上效果图或 GIF)*
