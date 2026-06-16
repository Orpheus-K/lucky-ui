---
title: SVG 资产转换
---

# SVG 资产转换

Lucky UI 提供统一的 SVG 资产转换器，用一份配置接入本地 SVG 目录或 NPM 包内 SVG，并输出跨端可用产物。

当前内置两个目标：

- `iconFont`：生成 `lk-icon` 字体、codepoints、微信小程序 base64 字体。
- `emptyIllustrations`：生成 `lk-empty` 内置 SVG data URI 模板。

## 核心优势

| 能力 | 价值 |
|------|------|
| 多 SVG 库聚合 | 可同时接入 Bootstrap Icons、Lucide、本地业务图标等来源，最终合并为一套 Lucky UI 资产 |
| 一处配置 | 选入、排除、重命名、前缀、目标产物集中维护，避免脚本分散 |
| 跨端产物 | 自动生成字体、codepoints、小程序 base64 字体和空态 data URI 模板 |
| 可预检 | `assets:svg:check` 在写入前发现非法 SVG、命名冲突、来源缺失等问题 |
| 可追溯 | `assets:svg:report` 输出 JSON 报告，便于排查变更影响 |
| 链路收敛 | 图标、空态插画、报告与预检统一走 `assets:svg*` 命令 |

## 命令

```bash
# 执行转换并写入产物
pnpm run assets:svg

# 仅校验配置、SVG、命名冲突和计划写入
pnpm run assets:svg:check

# dry-run 并输出 JSON 报告
pnpm run assets:svg:report
```

## 集中配置

配置文件位于：

```text
src/uni_modules/lucky-ui/scripts/svg-assets.config.js
```

核心结构：

```js
module.exports = {
  sources: [
    {
      id: 'bootstrap-icons',
      type: 'package',
      packageName: 'bootstrap-icons',
      dir: 'icons',
      targets: ['iconFont'],
      rules: {
        include: ['^(arrow|chevron).*'],
        exclude: ['^emoji-.*'],
        explicit: ['search'],
        rename: { x: 'close' },
        prefix: '',
        colorMode: 'monochrome',
      },
    },
  ],
  targets: {
    iconFont: { enabled: true },
    emptyIllustrations: { enabled: true },
  },
};
```

## 来源类型

`type: 'local'` 读取 Lucky UI 模块内目录：

```js
{
  id: 'business-icons',
  type: 'local',
  dir: 'assets/business-icons',
  targets: ['iconFont'],
}
```

`type: 'package'` 读取已安装 NPM 包：

```js
{
  id: 'lucide',
  type: 'package',
  packageName: 'lucide-static',
  dir: 'icons',
  targets: ['iconFont'],
}
```

## 多库聚合示例

多个来源可以共同输出到 `iconFont`。建议给非默认库加 `prefix`，让图标命名天然可区分。

```js
module.exports = {
  sources: [
    {
      id: 'bootstrap-icons',
      type: 'package',
      packageName: 'bootstrap-icons',
      dir: 'icons',
      targets: ['iconFont'],
      rules: {
        include: ['^(arrow|search|check).*'],
        colorMode: 'monochrome',
      },
    },
    {
      id: 'lucide',
      type: 'package',
      packageName: 'lucide-static',
      dir: 'icons',
      targets: ['iconFont'],
      rules: {
        include: ['^(user|settings|bell).*'],
        prefix: 'lucide-',
        colorMode: 'monochrome',
      },
    },
    {
      id: 'business-icons',
      type: 'local',
      dir: 'assets/business-icons',
      targets: ['iconFont'],
      rules: {
        prefix: 'biz-',
        colorMode: 'monochrome',
      },
    },
  ],
};
```

使用时仍是同一个组件：

```vue
<template>
  <lk-icon name="search" />
  <lk-icon name="lucide-user" />
  <lk-icon name="biz-vip-card" />
</template>
```

## 规则

| 字段 | 说明 |
|------|------|
| `include` | 选入文件名，支持精确名称或正则字符串 |
| `exclude` | 排除文件名，支持精确名称或正则字符串 |
| `explicit` | 强制选入的精确名称 |
| `rename` | 输出前重命名，例如 `{ x: 'close' }` |
| `prefix` | 给输出名称加前缀，避免业务库冲突 |
| `colorMode` | `monochrome` 用于图标字体，`template` 用于空态模板 |

## 输出产物

`iconFont` 会写入：

- `assets/bootstrap-icons-selected`
- `scripts/svg-assets.icon-font.lock.json`
- `components/lk-icon/fonts`
- `components/lk-icon/codepoints.ts`
- `components/lk-icon/fonts/lk-icons.base64.ts`

H5/App 的静态 `@font-face` 只引用实际生成的 `woff2/woff`；eot、ttf、svg 等旧字体格式不作为运行时产物进入构建追踪。

`emptyIllustrations` 会写入：

- `components/lk-empty/empty-illustrations.generated.ts`

`lk-empty` 的 SVG 源文件位于：

```text
src/uni_modules/lucky-ui/assets/empty-illustrations
```

模板支持 `{{primary}}` 和 `{{primarySoft}}`，运行时会替换为当前品牌色与浅色派生值。

## 反馈与排错

转换器会输出：

- 每个目标的 SVG 数量。
- 计划写入或实际写入路径。
- 跳过数量、警告数量、错误数量。
- 命名冲突、缺少 `viewBox`、非法 SVG、来源目录缺失等错误。

常见处理：

| 问题 | 处理 |
|------|------|
| `duplicate-name` | 用 `prefix` 或 `rename` 消除重名 |
| `missing-viewbox` | 给 SVG 根节点补 `viewBox` |
| `source-missing` | 检查 `dir` 或 `packageName` |
| 图标显示异常 | 确认 SVG 是否为填充图标；复杂 stroke 图标建议先转 path |

## 注意事项

- 当前是“多库合并为一套 `lk-icons` 字体”，不是为每个 SVG 库生成独立字体族。
- 多库接入时必须治理命名冲突；推荐业务库使用 `biz-`，第三方库使用库名前缀。
- 图标字体更适合单色图标；多色 SVG、复杂渐变、滤镜、动画不建议进入 `iconFont`。
- SVG 必须包含 `viewBox`，否则跨端缩放不可控，校验会报错。
- 微信小程序端依赖 base64 字体注入，新增图标后需要重新执行 `pnpm run assets:svg`。
- `emptyIllustrations` 支持 `{{primary}}` 与 `{{primarySoft}}` 模板色；其他复杂主题变量需要在生成器中扩展。
- 接入 NPM 包前需要先安装该包，并确认包内 SVG 目录路径，例如 `icons`、`dist/icons`。
