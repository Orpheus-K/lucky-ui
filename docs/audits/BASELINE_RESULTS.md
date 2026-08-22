# Lucky UI 全量审计基线结果

## 1. 身份与统计口径

| 字段 | 值 |
| --- | --- |
| 日期 | 2026-08-13 |
| Git 基线 | `develop@c8071e67f93cc95ee1ddc12cac7bfccdf74058c1` |
| 审计分支 | `docs/lucky-ui-full-audit` |
| 审计工作树 | `D:\project\test\.worktrees\lucky-ui-full-audit` |
| 组件分母 | 73 个 `lk-*` 目录，324 个文件 |
| 文本分母 | 322 个文件，58,674 个物理行 |
| 二进制资源 | `lk-icons.woff`、`lk-icons.woff2` |
| 共享层分母 | 77 个文件，10,338 个物理行 |

组件文本行按 UTF-8 逐文件物理行计数，覆盖 `.vue`、`.ts`、`.scss`、`.css`、`.less`、`.styl` 与空 `.md`。旧矩阵只统计部分扩展名，所以其逐组件行数保留作历史定位数据，不再用作全量分母。

## 2. 静态、测试与构建基线

| 命令/检查 | 退出 | 结构化结果 | 审计结论 |
| --- | ---: | --- | --- |
| `pnpm install --frozen-lockfile --prefer-offline` | 0 | 锁文件安装成功 | 只证明依赖可安装 |
| `pnpm test:unit` | 0 | 77 个 spec、428 个 `it` | 运行时输出 `WebSocket server error: Port is already in use`；退出码为 0，属于测试健康度假绿灯。绝大多数测试是 utils/源码契约，不证明 SFC 真实模板与样式 |
| `pnpm type-check` | 0 | 无类型错误 | 不覆盖打包产物的真实消费者类型入口，包声明断裂仍需独立 fixture |
| `pnpm lint` | 0 | 无 error，存在模块类型提示 | 主命令只扫描 `src`，tests/scripts/config 不在同一门禁 |
| `pnpm stylelint` | 0 | 13 个 warning | 多项冗余/顺序规则被关闭，不能据此否定样式散乱、重复选择器或 token 问题 |
| `pnpm build:h5` | 0 | H5 产物生成 | 有 Browserslist 数据过期提示；构建成功不证明 DOM、交互和视觉正确 |
| `pnpm build:mp-weixin` | 0 | 微信产物生成 | 编译器明确警告不支持 `select`、`img` 选择器；chart 产生空 chunk |
| `pnpm docs:build` | 0 | 文档站产物生成 | 存在大于 500 kB chunk；不证明示例路径与 API 内容正确 |
| `pnpm compat-check:strict` | 0 | 0 error、60 warning | 与微信编译器的确定性 selector warning 不一致，扫描器存在盲区 |
| SVG 完整性检查 | 0 | 1,031 个图标，8 个空图标 | 需要继续核对 8 个空定义是合法占位还是资源缺失 |
| SFC 解析检查 | 0 | 190 个 Vue 文件，0 parse error | 只证明语法可解析 |

## 3. 已取得的 H5 Peekit 证据

运行环境为审计工作树的 H5 服务 `http://127.0.0.1:5188`，视口 `390 × 844`。以下均读取真实 DOM、矩形、类名、交互结果与控制台；截图不是主断言。

### Anchor 滚动

- 路由：`/#/pages_sub/component-detail/index?name=anchor&peekit=scroll`
- 真正滚动节点：`.goods-content .uni-scroll-view-scrollbar-hidden`；外层 `.goods-content` 本身不滚动。
- 容器矩形：`left=110.22`、`top=314.94`、`width=263.16`、`height=707.83`。
- 滚动前激活项：`🔥 人气热卖`。
- 设置滚动节点 `scrollTop=1200` 并等待 650 ms 后，激活项变为 `🌿 季节新品`。
- DOM diff 显示第 1、3 个 anchor link 的 active class/background 发生对应变化；console error 与 page error 均为空。
- 结论：该场景达到 E2，但只覆盖一个滚动场景，不能把 Anchor 标记为全场景通过。

### Form 校验

- 同一 390 × 844 环境进入 Form 详情场景。
- 操作前错误行数为 0；点击 `.form-actions .lk-button` 一次。
- 操作后错误行数为 8；前四条文本依次为 `请填写项目名称`、`请选择申报领域`、`请选择众筹周期`、`请输入起筹限额`。
- 普通行高度由约 54 px 变为错误态约 74 px；textarea 组合行约 286 px；console error 与 page error 均为空。
- 结论：该场景达到 E2，但尚未覆盖异步规则、嵌套组、重置、端差和微信运行态。

### H5 演练场污染

首次抓取时页面继承了持久化暗色主题，body/root 为暗背景，说明当前详情路由没有在审计模式中固定并清空主题等持久状态。后续正式基线必须显式固定 theme、locale、brand、motion、time、network 与 seed；否则不同运行之间不可比。

## 4. 微信小程序运行态现状

- `dist/build/mp-weixin` 与 `dist/dev/mp-weixin` 均成功生成。
- 开发者工具 CLI：`C:\code-app\微信web开发者工具\cli.bat`；项目 AppID 为 `wxb517e760a35104de`。
- 自动化 WebSocket `9420` 可连接，`Tool.getInfo` 能返回 DevTools `2.01.2510290` 与基础库 `3.16.2`。
- `App.getCurrentPage` 在原始 WebSocket、`miniprogram-automator@0.12.1` 与 Peekit 连接链路中均不能返回，因此当前拿不到 page stack、WXML、offset/size/style 或交互结果。
- 开发者工具日志能证明目标路径被读取、network transport ready、触发 appservice compile/webview reload；它不能证明页面已经创建完成。
- CLI `close --project` 返回 success 后项目 renderer/watcher 可能仍存活，必须等待并按 projectPath、automation port、进程树复核。人为结束 renderer 会产生 `RESULT_CODE_KILLED`，该崩溃页不能倒推为终止前的原始原因。

结论：微信端当前证据等级仍低于 E3，所有组件的 MP 运行态状态保持“待抓取”。构建成功、WebSocket 握手成功和工具版本信息均不得替代页面级证据。

## 5. 已确认的基线设施问题

1. CI 只运行非 strict 兼容检查，明确 error 也不会阻断；CI 还遗漏 unit、visual 与 MP test。
2. Playwright 默认 5173，H5 dev 固定 5188，旧测试指南写 5174；配置无 `webServer`，个别 spec 硬编码端口或未注册路由。
3. 截图基线被 `.gitignore` 忽略，仓库内为 0，现有视觉回归不可复用。
4. MP test 只用 `miniprogram-simulate`；runner 漏掉已有 Tab spec，且 CI 不执行。
5. 风险矩阵与 showcase 的 `verified` 来自手工元数据，不读取 Peekit 证据，也不会让脚本失败。
6. 单测主要覆盖纯逻辑：69 个组件有同名 utils 直测，`lk-form-group`、`lk-page`、`lk-root`、`lk-tab` 缺失；没有 coverage 门禁。
7. H5 旧探针把 Playwright `boundingBox()` 的 `x/y` 当成 `left/top` 序列化，导致目标矩形出现伪 `null`。
8. Windows 上通过 `npx` 启动的 Peekit MCP 在 client close 后可能遗留 wrapper/browser 进程；验收脚本必须按本次会话 PID 精确清理，不能广泛结束同名进程。

详细问题及修复/验收方案见 [问题台账](./ISSUE_LEDGER.md)。
