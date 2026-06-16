# 代码规范配置说明

本项目已配置 ESLint、Prettier 和 Stylelint 来确保代码质量和风格一致性。

## 已安装的工具

### ESLint
- **用途**：JavaScript 和 TypeScript 代码质量检查
- **配置文件**：`eslint.config.js` （ESLint 9 新格式）
- **版本**：ESLint 9.x（使用 Flat Config 格式）

### Prettier
- **用途**：代码格式化
- **配置文件**：`.prettierrc.js`
- **忽略文件**：`.prettierignore`

### Stylelint
- **用途**：CSS/SCSS 样式检查
- **配置文件**：`.stylelintrc.js`
- **忽略文件**：`.stylelintignore`

### EditorConfig
- **用途**：编辑器统一配置
- **配置文件**：`.editorconfig`

## 可用命令

### Lint 检查

```bash
# 运行所有 lint 检查
pnpm run lint

# 仅检查 ESLint
pnpm run lint:eslint

# 仅检查 Stylelint
pnpm run lint:stylelint
```

### 自动修复

```bash
# 自动修复所有 lint 问题
pnpm run lint:fix

# 仅自动修复 ESLint 问题
pnpm run lint:eslint:fix

# 仅自动修复 Stylelint 问题
pnpm run lint:stylelint:fix
```

### 代码格式化

```bash
# 格式化所有代码
pnpm run format

# 检查代码格式（不修改）
pnpm run format:check
```

## 快速开始

### 1. 格式化所有代码

首次使用时，建议先格式化所有代码：

```bash
pnpm run format
```

### 2. 修复可自动修复的问题

运行以下命令自动修复大部分 lint 问题：

```bash
pnpm run lint:fix
```

### 3. 手动修复剩余问题

某些问题需要手动修复，运行检查命令查看：

```bash
pnpm run lint
```

## VS Code 集成

项目已配置 `.vscode/settings.json`，在使用 VS Code 时会自动启用以下功能：

1. **保存时自动格式化**：使用 Prettier 格式化代码
2. **保存时自动修复**：自动修复 ESLint 和 Stylelint 问题
3. **语法高亮**：显示 lint 错误和警告

### 推荐的 VS Code 插件

确保安装以下插件以获得最佳体验：

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)
- [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)

## 配置说明

### ESLint 规则

- 使用 **ESLint 9 Flat Config** 格式
- 支持 Vue 3 和 TypeScript
- 集成 Prettier 规则避免冲突
- 支持 uni-app 全局变量（`uni`、`wx`、`plus` 等）
- 生产环境禁用 `console` 和 `debugger`
- 允许单参数箭头函数省略括号
- 强制使用 `const` 而不是 `let`（当变量不重新赋值时）

### Prettier 规则

- 每行最大 100 字符
- 使用 2 空格缩进
- 使用单引号
- 语句末尾添加分号
- 尾部逗号使用 ES5 规范
- 单参数箭头函数省略括号

### Stylelint 规则

- 支持 Vue 单文件组件
- 支持 SCSS 语法
- 支持 uni-app 的 `rpx` 单位
- 支持 Vue 的 `::v-deep`、`:deep()` 等伪类
- 集成 Prettier 规则避免冲突

## 在 Git 钩子中使用（可选）

建议配置 husky 和 lint-staged 在提交前自动运行 lint 检查：

```bash
# 安装依赖
pnpm add -D husky lint-staged

# 初始化 husky
npx husky init

# 配置 pre-commit 钩子
echo "npx lint-staged" > .husky/pre-commit
```

在 `package.json` 中添加 lint-staged 配置：

```json
{
  "lint-staged": {
    "*.{js,ts,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,vue}": [
      "stylelint --fix"
    ]
  }
}
```

## 自定义规则

如需修改规则，请编辑对应的配置文件：

- ESLint 规则：`eslint.config.js` 中的 `rules` 部分
- Prettier 规则：`.prettierrc.js`
- Stylelint 规则：`.stylelintrc.js` 中的 `rules` 部分

## 常见问题

### 1. 如何临时禁用某个规则？

**ESLint:**
```javascript
// eslint-disable-next-line rule-name
const foo = 'bar';

/* eslint-disable rule-name */
// 多行代码
/* eslint-enable rule-name */
```

**Stylelint:**
```css
/* stylelint-disable-next-line rule-name */
.foo {
  color: red;
}
```

### 2. 如何忽略某个文件？

将文件路径添加到 `eslint.config.js` 的 `ignores` 数组中，或添加到 `.prettierignore`、`.stylelintignore` 文件中。

### 3. 规则冲突怎么办？

Prettier 的规则优先级最高，已配置 `eslint-config-prettier` 和 `stylelint-config-prettier-scss` 来禁用与 Prettier 冲突的规则。

### 4. ESLint 报告的 `no-undef` 错误

某些全局变量（如 `uni`、`wx`、`HTMLElement` 等）已在配置中声明为全局变量。如果遇到新的全局变量未定义错误，可以在 `eslint.config.js` 中的 `globals` 部分添加。

### 5. 为什么使用 ESLint 9？

ESLint 9 使用新的 Flat Config 格式，提供了更好的类型支持和配置灵活性。注意：`.eslintrc.js` 已被弃用，请使用 `eslint.config.js`。

## 更多信息

- [ESLint 文档](https://eslint.org/)
- [ESLint Flat Config 迁移指南](https://eslint.org/docs/latest/use/configure/migration-guide)
- [Prettier 文档](https://prettier.io/)
- [Stylelint 文档](https://stylelint.io/)
- [EditorConfig 文档](https://editorconfig.org/)

