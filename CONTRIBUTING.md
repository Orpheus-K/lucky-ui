# Contributing to Lucky UI

感谢参与 Lucky UI。所有代码、文档和工程改动都必须通过 PR 合并，不能直接推送到 `main` 或 `develop`。

## 分支

- 从 `develop` 创建日常开发分支。
- 新功能使用 `feature/<scope>-<slug>`。
- 普通修复使用 `fix/<scope>-<slug>`。
- 文档、维护、重构分别使用 `docs/<slug>`、`chore/<slug>`、`refactor/<slug>`。
- 发布使用 `release/vX.Y.Z` 或 `release/vX.Y.Z-rc.N`。
- 已发布版本紧急修复使用 `hotfix/vX.Y.Z`，并从 `main` 创建。

完整规范见 [分支管理规范](docs/guide/branching.md)。

## PR 要求

- 普通开发 PR 合并到 `develop`。
- `release/*` 和 `hotfix/*` 合并到 `main`，发布后同步回 `develop`。
- 功能和修复 PR 使用 Squash Merge。
- 公共保护分支不使用 rebase merge。
- 破坏性变更必须在 PR 描述和 CHANGELOG 中说明。
- 跨端 UI 相关改动需要说明验证平台和结果。

## 检查

PR 至少需要通过兼容性检查、ESLint、Stylelint、类型检查、H5 构建和微信小程序构建。发布 PR 还需要通过文档构建和 SVG 资源检查。

