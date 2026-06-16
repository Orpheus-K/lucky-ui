# 分支管理规范

Lucky UI 采用轻量发布流：`main` 保存已发布代码，`develop` 作为日常集成分支，功能、修复、文档和重构都通过短分支提交 PR。

## 长期分支

### main

- 只代表已经发布的版本。
- 禁止直接推送，只能通过 PR 合并 `release/*` 或 `hotfix/*`。
- 每次发布后必须创建 tag，格式为 `vX.Y.Z` 或 `vX.Y.Z-rc.N`。
- tag 版本必须和 `src/uni_modules/lucky-ui/package.json` 中的版本一致。

### develop

- 代表下一个版本的集成状态。
- 日常开发默认从 `develop` 创建分支，并通过 PR 合并回 `develop`。
- 不直接从 `develop` 发布 npm 包。

## 短分支

| 分支 | 来源 | 目标 | 用途 |
| --- | --- | --- | --- |
| `feature/<scope>-<slug>` | `develop` | `develop` | 新组件、新能力、较完整功能 |
| `fix/<scope>-<slug>` | `develop` | `develop` | 普通 bug 修复 |
| `docs/<slug>` | `develop` | `develop` | 文档补充或修正 |
| `chore/<slug>` | `develop` | `develop` | 工程维护、依赖、脚本 |
| `refactor/<slug>` | `develop` | `develop` | 不改变行为的重构 |
| `release/vX.Y.Z` | `develop` | `main` | 正式版发布验收 |
| `release/vX.Y.Z-rc.N` | `develop` | `main` | RC 版本发布验收 |
| `hotfix/vX.Y.Z` | `main` | `main` | 已发布版本的紧急修复 |

`release/*` 和 `hotfix/*` 合并到 `main` 并打 tag 后，必须同步回 `develop`。

## PR 规则

- 普通开发 PR：`feature/*`、`fix/*`、`docs/*`、`chore/*`、`refactor/*` 合并到 `develop`。
- 发布 PR：`release/*` 合并到 `main`，发布后同步到 `develop`。
- 热修复 PR：`hotfix/*` 合并到 `main`，发布后同步到 `develop`。
- 功能和修复 PR 使用 Squash Merge。
- `release/*` 和 `hotfix/*` 合并到 `main` 可以使用 Merge Commit，保留发布节点。
- 公共保护分支不使用 rebase merge。

## 发布流程

### RC 发布

```bash
git checkout develop
git pull
git checkout -b release/v0.1.0-rc.1
```

在 `release/*` 分支中只允许修改版本号、CHANGELOG、文档和发布阻断级 bug。验收通过后合并到 `main`，创建 `v0.1.0-rc.1` tag，再同步回 `develop`。

### 正式发布

```bash
git checkout develop
git pull
git checkout -b release/v0.1.0
```

正式版发布前确认 CHANGELOG、文档和多端构建状态。合并到 `main` 后创建 `v0.1.0` tag。

### 紧急修复

```bash
git checkout main
git pull
git checkout -b hotfix/v0.1.1
```

修复发布版本的阻断问题后合并到 `main`，创建 patch tag，再同步回 `develop`。

## 必需检查

所有 PR 必须通过兼容性、lint、类型检查、H5 构建和微信小程序构建。发布 PR 还必须通过文档构建和 SVG 资源检查。

视觉或跨端布局相关 PR 必须在 PR 描述中说明验证平台，例如 H5、微信小程序；必要时附截图或运行态尺寸结果。

