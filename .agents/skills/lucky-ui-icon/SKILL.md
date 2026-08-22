---
name: lucky-ui-icon
description: 查询、使用、新增或重建 lucky-ui 图标字体与 SVG 资源。用于核对 lk-icon 名称和 Props、从 Bootstrap Icons 纳入图标、接入自定义 SVG、本地字体生成、Base64 小程序字体与图标命名；纯业务页面选图标时可与 lucky-ui-coding 组合。
---

# Lucky UI 图标维护

## 基准

所有路径均相对仓库根目录。当前图标链路是统一 SVG 资产管线，不使用旧的 `icons:*` 命令、`iconset.mobile.config.js` 或 `components/lk-icon/svgs/`。

事实来源：

- 使用文档：`docs/components/icon.md`。
- 组件 API：`src/uni_modules/lucky-ui/components/lk-icon/icon.props.ts` 与 `lk-icon.vue`。
- 可用字体图标：`src/uni_modules/lucky-ui/components/lk-icon/codepoints.ts`。
- 资产配置：`src/uni_modules/lucky-ui/scripts/svg-assets.config.js`。
- 管线实现：`src/uni_modules/lucky-ui/scripts/svg-assets/`。
- 已选择 SVG：`src/uni_modules/lucky-ui/assets/bootstrap-icons-selected/`。
- 生成字体：`src/uni_modules/lucky-ui/components/lk-icon/fonts/`。

不要凭 Bootstrap Icons 网站上的名称断言仓库已包含图标；先查 `codepoints.ts`。

## 业务中使用

```vue
<lk-icon name="search" size="28" color="var(--lk-text-placeholder)" />
```

Props、背景容器能力与事件必须从 `icon.props.ts` 读取。业务图标默认选择线性名称；除非用户明确要求，不用 `-fill` 变体。

## 从 Bootstrap Icons 新增

1. 确认 `node_modules/bootstrap-icons/icons/<name>.svg` 存在。
2. 检查 `svg-assets.config.js` 的 `bootstrapIconRules`。
3. 名称若未被 `include` 规则覆盖，将它加入 `explicit`；不要直接编辑生成目录或 codepoints。
4. 运行统一生成命令。

```bash
pnpm run assets:svg
pnpm run assets:svg:check
```

`assets:svg` 会按配置准备 SVG、生成字体、codepoints、CSS 定义、Base64 字体与锁文件。提交前审查所有生成差异，避免无意扩展整个图标集。

## 自定义 SVG

当前配置没有面向图标字体的自定义 SVG 目录。需要接入自定义图标时：

1. 在 `src/uni_modules/lucky-ui/` 下创建明确、受 Git 跟踪的源目录。
2. 在 `svg-assets.config.js` 的 `sources` 中新增 `type: 'local'`、`targets: ['iconFont']` 的来源，并让 `dir` 指向该目录。
3. 使用唯一的 kebab-case 文件名，保留正确 `viewBox`，确保单色字体图标可正常归一化。
4. 运行 `pnpm run assets:svg` 与 `pnpm run assets:svg:check`。

不要把自定义 SVG 放进不存在的旧路径，也不要手改生成的字体、CSS 或 codepoints。

## 校验

```bash
pnpm run assets:svg:check
pnpm run type-check
pnpm run build:h5
pnpm run build:mp-weixin
```

最后确认：

- `codepoints.ts` 包含目标名称。
- H5 字体文件可加载。
- 微信小程序使用生成的 Base64 字体且能渲染。
- `lk-icon` 名称与文档、Demo 一致。
