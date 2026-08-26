# Lucky UI Git Commit 规范

遵循 **Angular Commit 规范**，适用于所有人工与 AI 提交。

---

## 1. 提交格式

```text
<type>(<scope>): <subject>
```

- **`type`**（必填）：提交类型（小写英文）。
- **`scope`**（可选）：作用域（小写 kebab-case，如 `lk-button`、`deps`、`utils`）。
- **`:`** 冒号后必须紧跟一个**半角空格**。
- **`subject`**（必填）：简要**中文**描述，句末**不加句号**。

---

## 2. Type 类型表

| Type | 说明 | 适用场景 |
| :--- | :--- | :--- |
| `feat` | 新功能 | 新增组件、新增属性或功能特性 |
| `fix` | 修复缺陷 | 修复组件 Bug、逻辑错误或样式异常 |
| `style` | **代码格式化** | **仅用于空格、缩进、分号、Prettier 格式化等，不改变代码逻辑** |
| `refactor`| 代码重构 | 代码结构调整（非新增功能、非修复 Bug） |
| `perf` | 性能优化 | 提升运行性能、减少重绘等 |
| `docs` | 文档变更 | 修改 README、组件文档等 |
| `test` | 测试用例 | 新增或修改单元测试、集成测试 |
| `build` | 构建系统 | 修改 Vite、打包配置、依赖升级（如 `deps`） |
| `ci` | CI 配置 | 修改 GitHub Actions、工作流脚本 |
| `chore` | 日常杂项 | 辅助工具、项目配置、脚本微调 |
| `revert` | 撤销提交 | 回滚历史 commit |

> [!CAUTION]
> **关于 `style` 的严格限制：**
> - ✅ `style` **只能用于代码格式化**（如执行 `prettier` 格式化、调整缩进换行）。
> - ❌ **严禁用于修改 CSS、SCSS、主题变量或 UI 视觉样式！**
> - 修改 UI 样式 / 布局时，请根据性质使用 `fix`（修复样式问题）、`feat`（新增视觉特性）或 `refactor`（样式重构）。

---

## 3. 中英文空格规范

中文与英文单词、数字、属性名、组件名之间**必须保留一个半角空格**：

- ❌ `feat(lk-button): 新增button组件的loading状态`
- ✅ `feat(lk-button): 新增 button 组件的 loading 状态`
- ❌ `fix(lk-input): 修复ios端input失去焦点bug`
- ✅ `fix(lk-input): 修复 iOS 端 input 失去焦点 bug`
- ❌ `style: 格式化vue代码`
- ✅ `style: 格式化 Vue 代码`

---

## 4. 提交示例

```text
feat(lk-button): 新增 disabled 禁用状态与 ripple 水波纹效果
fix(lk-picker): 修复多列模式下联动值不更新的 bug
style: 运行 prettier 统一代码格式与缩进
refactor(core): 优化虚拟列表滚动计算逻辑
docs(form): 更新 form-item 校验规则说明文档
test(unit): 补充 lk-switch 单元测试用例
build(deps): 升级 vue 至 3.4.0
chore: 清理无用临时构建产物
```
