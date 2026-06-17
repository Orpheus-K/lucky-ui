# Git Commit Message 规范

基于 Angular Commit Convention，适用于 Lucky UI 后续所有日常开发、修复、文档、工程维护和发布准备提交。该规范不是单次发布专用规则，人工编写与 AI 辅助生成都必须遵守。

## 适用范围

- 面向长期开发流程，不随某一次版本发布结束而失效。
- 单次发布相关提交也使用同一套规范，例如版本号、CHANGELOG、发布文档或 CI 调整。
- 每个 commit 只描述本次提交实际包含的变更，不把后续计划或发布目标写进提交信息。

## 格式

```
<type>(<scope>): <subject>
```

- `scope` 可选，使用 kebab-case（如 `lk-button`、`utils`）
- 冒号 `:` 后必须跟一个半角空格
- `subject` 使用简短中文，不加句号，首字母不大写
- `subject` 只写核心动作和对象，避免长句、背景说明和发布计划
- `subject` 中出现英文单词、数字、变量名时，前后都要留一个半角空格

## 类型

| type | 说明 |
| :--- | :--- |
| `feat` | 新功能 |
| `fix` | 修复 Bug |
| `docs` | 文档变更 |
| `style` | 代码格式（不影响逻辑） |
| `refactor` | 重构（非新增、非修复） |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `build` | 构建/依赖变更 |
| `ci` | CI 配置变更 |
| `chore` | 其他杂项 |
| `revert` | 回退提交 |

`style` 只表示代码格式调整，例如缩进、空格、换行、分号、格式化；修改 CSS、SCSS、主题变量或视觉样式时不要使用 `style`，应按实际影响使用 `fix`、`feat`、`refactor` 或 `chore`。

## 中英文混排空格（盘古之白）

中文与英文、数字、变量名之间**必须加一个半角空格**。

```
x  feat(lk-button): 新增button组件支持disabled属性
o  feat(lk-button): 新增 button 组件支持 disabled 属性

x  chore: 优化vite配置升级webpack5
o  chore: 优化 vite 配置升级 webpack 5

x  fix(lk-input): 修复ios下input显示bug
o  fix(lk-input): 修复 iOS 下 input 显示 bug
```

## 示例

```
feat(lk-button): 新增 loading 状态与 disabled 属性
fix(router): 修复 H5 平台路由参数丢失问题
style(components): 格式化组件代码
refactor(composables): 将 useRequest 提取为独立 hooks
chore: 初始化 vite 打包配置
chore(deps): 升级 vue 至 3.4.0
build(vite): 修改 build 输出路径
ci(github): 添加 GitHub Actions 部署流程
docs: 更新 README 使用说明
```

## AI Prompt

生成 commit message 时可使用以下提示词：

```
根据 git diff 生成提交信息。格式：<type>(<scope>): <subject>。
scope 用 kebab-case，subject 用简短中文，符合 Angular Commit Convention，末尾不加句号。
subject 中的英文单词、数字、变量名前后都要留一个半角空格。
style 只用于代码格式，不用于 CSS、SCSS、主题变量或视觉样式修改。
只描述当前 diff 中已经发生的改动，不写发布计划、后续计划或无关背景。
只输出一行提交信息，不要解释。
```
