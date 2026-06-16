# Git Commit Message 规范

基于 Angular Commit Convention，适用于人工编写与 AI 辅助生成。

## 格式

```
<type>(<scope>): <subject>
```

- `scope` 可选，使用 kebab-case（如 `lk-button`、`utils`）
- 冒号 `:` 后必须跟一个半角空格
- `subject` 使用中文，不加句号，首字母不大写

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
scope 用 kebab-case，subject 用中文，中英文间加空格，末尾不加句号。
只输出一行提交信息，不要解释。
```
