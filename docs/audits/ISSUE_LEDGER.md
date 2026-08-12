# Lucky UI 全量审计问题台账

本台账只登记至少达到 `E1` 的问题。问题未完成 H5 与微信运行态前后对照时保持 open 或 verifying；“静态已确认”不等于“问题已修复”。完整字段和关闭门槛见 [跨端组件全量审计协议](./CROSS_PLATFORM_COMPONENT_AUDIT.md)。

## 汇总

| 状态 | P0 | P1 | P2 | P3 | 合计 |
| --- | ---: | ---: | ---: | ---: | ---: |
| open | 0 | 3 | 19 | 2 | 24 |
| fixing | 0 | 0 | 0 | 0 | 0 |
| verifying | 0 | 0 | 0 | 0 | 0 |
| closed | 0 | 0 | 0 | 0 | 0 |

## 工具、测试与文档基线

### AUD-CI-001 兼容错误在 CI 中不阻断

- 严重度：P1
- 状态：open
- 分类：CMP、test-gap
- 归属：tooling
- 影响：H5、MP-WEIXIN
- 证据等级：E1
- 证据：`.github/workflows/uni-compat.yml` 执行 `pnpm run compat-check`；`scripts/compat-check.js` 只有 strict 模式且存在 error 时才设置非零退出码。
- 根因：CI 使用报告模式而不是 `compat-check:strict`，所以扫描器识别出的明确跨端 error 不会阻断合并。
- 最佳方案：单独工程分支把 CI 切到 strict，并为 strict/non-strict 退出语义补脚本测试；保留 warn 报告供运行态回归使用。
- 验收：注入一个已知 error fixture 时 CI 步骤失败；仅 warn fixture 时步骤成功且报告完整；真实仓库扫描仍为 0 error。

### AUD-CI-002 CI 未执行组件行为与运行态测试

- 严重度：P2
- 状态：open
- 分类：INT、XPF、test-gap
- 归属：tooling
- 影响：H5、MP-WEIXIN
- 证据等级：E1
- 证据：CI 未调用 `test:unit`、`test:visual`、`test:mp`；现有构建成功不能证明组件事件、样式或交互正确。
- 最佳方案：先让三套测试可确定、可重复，再分层接入 CI；微信真实 DevTools 探针可作为受控环境门禁，不能用 simulate 冒充真机/开发者工具证据。

### AUD-VIS-001 Playwright 端口和路由不一致

- 严重度：P2
- 状态：open
- 分类：DOC、XPF、test-gap
- 归属：tooling
- 影响：H5
- 证据等级：E1
- 证据：`dev:h5` 固定 5188，`playwright.config.ts` 默认 5173，旧测试文档写 5174；个别测试硬编码 5173，Toast 测试使用未注册路由；配置没有 `webServer`。
- 最佳方案：建立单一 baseURL 来源、由 Playwright 管理确定性 H5 服务、统一 hash 路由生成器并清除各测试硬编码。

### AUD-VIS-002 仓库没有可追溯视觉基线

- 严重度：P2
- 状态：open
- 分类：STY、test-gap
- 归属：tooling
- 影响：H5
- 证据等级：E1
- 证据：视觉测试调用 `toHaveScreenshot`，但截图基线目录被 `.gitignore` 忽略，仓库内基线 PNG 数量为 0。
- 最佳方案：提交确定性基线或提交可验证的证据 manifest 与制品哈希；动态组件优先使用结构化断言，不能把动画噪声固化成宽容阈值。

### AUD-MP-001 微信测试既非全量也非真实运行态

- 严重度：P2
- 状态：open
- 分类：CMP、INT、XPF、test-gap
- 归属：tooling
- 影响：MP-WEIXIN
- 证据等级：E1
- 证据：现有三个 spec 中 runner 只执行 Button 与 Timeline，Tab 未接入；测试基于 `miniprogram-simulate` 和既有构建产物，不读取真实 DevTools WXML/computed style。
- 最佳方案：保留 simulate 作为快速逻辑层，新增 Peekit/DevTools CLI + `miniprogram-automator` 运行态层，逐组件记录 WXML、offset/size/style、事件和错误。

### AUD-UNIT-001 四个组件缺少直接单测

- 严重度：P2
- 状态：open
- 分类：INT、test-gap
- 归属：tests
- 影响：H5、MP-WEIXIN
- 证据等级：E1
- 证据：`lk-form-group`、`lk-page`、`lk-root`、`lk-tab` 没有同名 spec；现有 77 个 spec、428 个 `it` 主要测试抽取纯函数，几乎不挂载真实 SFC。
- 最佳方案：先为公开契约和平台无关状态补纯函数/编译契约，再由运行态探针覆盖模板、slot、样式和原生事件，不虚构 SFC 单测能够代替跨端运行。

### AUD-RISK-001 风险矩阵没有覆盖全部组件

- 严重度：P2
- 状态：open
- 分类：DOC、ORG、test-gap
- 归属：tooling
- 影响：H5、MP-WEIXIN
- 证据等级：E1
- 证据：输出 72 行包含非独立组件目录的 `lk-chart-lite`，实际组件覆盖 71/73；`lk-root` 与 `lk-preload-debugger` 漏失；风险与 verified 状态来自手填元数据而非证据。
- 最佳方案：从组件目录与公开/内部分类自动生成清单；风险与状态引用结构化证据，不允许手填 verified 作为通过依据。

### AUD-DOC-001 组件文档大量引用旧 demo 路径

- 严重度：P2
- 状态：open
- 分类：DOC、ORG
- 归属：docs
- 影响：H5、MP-WEIXIN
- 证据等级：E1
- 证据：42 个组件文档仍引用旧 `src/components/demos` 或 `@/components/demos` 路径，而当前实际 demo 位于 `src/pages_sub/components/demos`；组件总览漏列 `lk-page`。
- 最佳方案：在独立文档分支基于 registry 自动核对 slug、真实路径和文档 frontmatter，避免再次手工漂移。

### AUD-DOC-002 历史完成度与评分报告已过时

- 严重度：P2
- 状态：open
- 分类：DOC、ORG
- 归属：docs
- 影响：项目治理
- 证据等级：E1
- 证据：多份文档仍写 52/59 个组件或已不存在页面；手工开源评分报告没有 commit、公式或证据链，报告后已有多批组件改动却未更新。
- 最佳方案：历史文档明确归档；当前状态只由本审计矩阵、证据索引和可重放脚本产生，不能沿用 92.1 或手填 A/B 结论。

### AUD-LINT-001 现有 lint 不能覆盖所需质量类别

- 严重度：P3
- 状态：open
- 分类：RED、ORG、COL、test-gap
- 归属：tooling
- 影响：全仓库
- 证据等级：E1
- 证据：常规 ESLint 只扫描 `src`，tests/scripts/config 不在范围；Stylelint 关闭了重复选择器、优先级下降、冗余长属性等规则；关键规则存在 warning 但 CI 不限制 warning。
- 最佳方案：先记录现有债务基线，再逐规则启用或写审计脚本，确保新门禁不会用批量自动修复掩盖语义问题。

### AUD-UNIT-002 单测命令在 WebSocket 服务冲突时仍返回成功

- 严重度：P2
- 状态：open
- 分类：INT、test-gap
- 归属：tooling/tests
- 影响：测试可信度
- 证据等级：E1
- 证据：基线 `pnpm test:unit` 输出 `WebSocket server error: Port is already in use`，同时以退出码 0 汇报 77 个 spec、428 个 `it` 全部通过。
- 根因：测试进程没有把其运行时服务启动失败纳入失败聚合，测试完成数与测试基础设施健康被混成一个结论。
- 最佳方案：测试启动时绑定动态端口或独占端口；任何服务 `error` 都应让当前 run 非零退出，并在 afterAll 释放 owner。
- 验收：预占目标端口后运行测试必须明确失败并指出 owner；正常运行无该错误、退出 0，结束后没有 listener 残留。

### AUD-COMPAT-002 严格兼容扫描漏掉微信编译器已确认的不支持选择器

- 严重度：P1
- 状态：open
- 分类：CMP、XPF、test-gap
- 归属：tooling
- 影响：MP-WEIXIN
- 证据等级：E1
- 证据：`compat-check:strict` 报 0 error、60 warning并退出 0；同一基线的 `build:mp-weixin` 明确警告 `select` 与 `img` 选择器在组件样式中不受支持。
- 根因：兼容扫描器与 UniApp/微信编译器的选择器规则不一致，strict 只对自身 error 集合负责，所以形成“严格通过、目标编译器仍警告”的假门禁。
- 最佳方案：抽取微信编译器 warning fixture 为 compat checker 的规则测试，并让构建日志中的新 unsupported selector 也进入门禁；已接受 warning 必须有稳定问题编号和范围。
- 验收：`select`、`img` fixture 在 strict 模式非零退出；修复真实源文件后 strict 与微信构建同时无这两条 warning。

### AUD-MP-002 微信 DevTools AUTO 会话在创建阶段内部崩溃

- 严重度：P1
- 状态：open
- 分类：CMP、XPF、test-gap
- 归属：tooling/environment
- 影响：MP-WEIXIN 全部运行态验收
- 证据等级：E1
- 版本与时序证据：当前微信开发者工具为 stable `2.01.2510290`。日志 `%LOCALAPPDATA%/微信开发者工具/User Data/55126b9b1fbd2eea43836dbd96109a3e/WeappLog/logs/2026-08-13-00-00-32-490-ggqLtLGyJQ.log:1065,1067-1071` 在 `01:51:19.759` 记录了 `type:'AUTO'`、精确审计项目路径、`port:'9420'` 与 `trustProject:true`；`:1076` 到 `01:53:04.521` 才记录 `TypeError: Cannot read property 'split' of undefined`，相差 104.762 秒。9420 最终未监听，helper 有界退出；这不是请求解析阶段的即时缺参特征。
- 请求字段证据：`miniprogram-automator@0.12.1` 的 `out/Launcher.d.ts:9-13` 将 `account`、`ticket`、`trustProject` 均声明为可选；`out/Launcher.js` 只在 `account` 为 truthy 时追加 `--auto-account`。DevTools CLI 的 `js/common/cli/index.js:237` 虽暴露这些参数，但 `core.wxvpkg` 虚拟文件 `/5e8540575badd1b38ed06c69f76ea9ba.js`（offset 7,795,964）中的 AUTO schema 没有把 `port/account/testTicket/ticket/trustProject` 标为 required，handler `/3f4b5a7224d7b710a48a9b753d705048.js`（offset 5,499,631）也只在 `if(o.account)` 时读取账户。因此不能把异常归因于缺少 `auto-account`、`ticket` 或其它 AUTO 请求字段，置信度 0.97。
- 异常逃逸边界：AUTO handler 关闭旧窗口的调用没有 `await`；未设置 `waitRealOpend` 时，项目窗口打开后的 `p()` 同样没有 `await`。这提供了延迟窗口启动异常绕过 WS callback、最终进入 `process uncaughtException` 的实际路径；结合 104.762 秒延迟，异常位于项目窗口启动后期路径的置信度为 0.86。全局记录器只持久化 `${error}` 而未写 `error.stack`，所以现有证据不能确定 `.split()` 的具体接收者。
- 已排除与禁止推断：邻近窗口逻辑虽存在 `e.address.split(':')[2]`，但它受 Electron-only 分支保护，当前进程明确以 NW.js `--nwjs` 运行，不能认定它是根因。也不能声称 `account`、`ticket`、`project`、`port`、AppID 或 Lucky UI 业务代码就是接收者；不能以伪造账户、空 `--auto-account` 或切换账户模式掩盖问题。
- 最佳方案：把“IDE HTTP health”“AUTO session creation”“transport health”“page health”拆成四个有界预检；保留 DevTools 版本、精确项目、HTTP/automation port owner、请求参数、时间线与完整 stack。在隔离 Windows 账户或 VM、旁路 DevTools 安装和独立本地数据目录中，以空闲 automation 端口执行不带 replay 参数的 `auto-replay --project <dist/dev/mp-weixin> --auto-port <port> --trust-project`；该路径设置 `waitRealOpend:true`，更可能把窗口打开错误留在受控 callback 链内，但在拿到 stack 前仍不能宣称精确根因。
- 验收：专用审计项目在 30 秒内建立 9420 automation listener，`Tool.getInfo` 和 `App.getCurrentPage` 均有界返回非空 page stack，可读取当前页 WXML、size/style、控制台与错误；关闭后仅该会话端口/helper/watcher 退出，共享 IDE 与其他项目不受影响。未达成前微信组件状态一律不得标记完成。

### AUD-PROBE-001 Anchor H5 旧探针把 Playwright 矩形字段序列化错

- 严重度：P2
- 状态：open
- 分类：DIM、test-gap
- 归属：tooling/tests
- 影响：H5
- 证据等级：E1
- 证据：`artifacts/anchor-runtime/capture-h5-lk-anchor.js:7-14` 读取 `rect.left/top`；调用点 `:124` 传入 Playwright `boundingBox()`，真实字段为 `x/y/width/height`，因此 `clickedTargetRect.left/top` 会得到 `NaN`，JSON 中表现为 `null`。
- 根因：DOMRect 与 Playwright BoundingBox 两套结构没有在边界归一化。
- 最佳方案：探针使用显式 adapter，把 `x/y` 转为 `left/top`，并对每个数值执行 finite 断言；结构化证据生成失败必须让 probe 非零退出。
- 验收：已知元素的 `x/y/left/top/width/height` 全为有限数，且与浏览器内 `getBoundingClientRect()` 误差不超过 1 CSS px；注入缺字段 fixture 时 probe 失败。

### AUD-PEEKIT-001 Windows 上 Peekit MCP 关闭后可能遗留包装器与浏览器进程

- 严重度：P2
- 状态：open
- 分类：ORG、test-gap
- 归属：tooling
- 影响：H5、MP-WEIXIN 自动化稳定性
- 证据等级：E1
- 证据：多次临时 MCP client 调用 `client.close()` 后，仍观察到本次 `npx @peekit/cli mcp` wrapper 及其浏览器子进程；只有按本次 PID 树精确清理后才消失。
- 根因：client transport 生命周期与 Windows `npx` 包装器/浏览器子树没有形成可等待的退出契约。
- 最佳方案：运行器记录启动 PID 与子进程，close 后有界等待；超时只清理该会话确认过的 PID 树，并报告泄漏。不得按进程名批量终止。
- 验收：连续运行 20 个 connect/snapshot/close case 后，基线进程集与监听端口集不增长；故意卡住的 fixture 只结束本次 owner。

### AUD-PLAYGROUND-001 演练页继承持久化主题，基线不是确定性的

- 严重度：P2
- 状态：open
- 分类：STY、COL、test-gap
- 归属：demo/tooling
- 影响：H5，且同类持久状态可能影响 MP-WEIXIN
- 证据等级：E2
- 证据：首次 H5 Peekit 抓取在未指定暗色场景时，body/root 实际为暗色背景与亮色文本；同一路由继承了先前持久化主题状态。
- 根因：组件详情页没有为审计模式固定或重置 theme、brand、locale、motion 等全局状态。
- 最佳方案：独立的 audit fixture 在挂载前显式设置全部环境输入并输出当前配置；普通用户 demo 继续保留持久主题体验，两者不能共用隐式初始状态。
- 验收：在预先写入任意旧主题/品牌/语言后打开相同 audit URL，DOM 根属性、CSS token、文本与截图 hash 均回到声明配置；不带 audit 参数的普通页面仍按产品契约持久化。

### THEME-RESET-CMP-001 全局 reset 的 `select` 选择器泄漏到微信 app.wxss

- 严重度：P2
- 状态：open
- 分类：CMP、STY、XPF
- 归属：theme
- 影响：MP-WEIXIN
- 证据等级：E1
- 证据：`theme/src/base/_reset.scss:28-33` 把 `select` 与 button/input/textarea 共同 reset；微信构建产物 `app.wxss` 保留该选择器并触发编译器 unsupported selector warning。
- 根因：Web 原生元素 reset 没有放在 H5 条件编译边界内。
- 最佳方案：跨端 reset 只保留 UniApp/微信支持的标签；H5 专属 `select` 放入 H5 条件文件或平台 mixin，避免让微信编译器接收无意义 selector。
- 验收：H5 原生 select reset 仍生效；微信 `app.wxss` 不再含不支持 selector，构建日志无对应 warning，其他输入控件 computed style 无回归。

### LK-CARD-CMP-001 Card cover 的 `img` 深选择器泄漏到微信组件样式

- 严重度：P2
- 状态：open
- 分类：CMP、STY、XPF
- 归属：component
- 影响：MP-WEIXIN
- 证据等级：E1
- 证据：`components/lk-card/lk-card.scss:29-35` 同时写 `:deep(image)` 与 `:deep(img)`；微信产物保留 `.lk-card__cover img` 并触发 unsupported selector warning。
- 根因：H5 DOM 的 `img` 兼容分支没有条件隔离，组件跨端样式被无差别编译。
- 最佳方案：公共样式只覆盖 `image`/slot 契约；确需兼容 H5 原生 `img` 时放入 H5 条件样式，并补 slot 中两类节点的 H5 断言。
- 验收：H5 `<image>` 与原生 `<img>` cover 都保持 object-fit/尺寸；微信 wxss 无 `img` selector 和编译 warning，真实 WXML cover 尺寸正确。

## 组件与共享实现

### LK-ROOT-CMP-001 `safeArea=false` 不会重置对外安全区别名

- 严重度：P2
- 状态：open
- 分类：CMP、NST、XPF
- 归属：component
- 影响：H5、MP-WEIXIN
- 证据等级：E1
- 源码：`root.utils.ts` 在关闭安全区时只把 `--lk-root-safe-area-*` 设为 0；`lk-root.scss` 仅在 `lk-root--safe-area` 类存在时才定义 `--lk-safe-area-*`。
- 根因：内部变量重置与对外别名开关分属两套路径。嵌套 Root 关闭安全区时，对外别名可能继续继承父 Root 的安全区值，与 prop 语义冲突。
- 最佳方案：先用单测锁定嵌套作用域契约，再让关闭状态在自身根节点显式把四个对外别名设为 0；不通过页面内联变量兜底。
- 待验证：H5 与微信嵌套 Root 中读取四个 CSS 变量，并确认实际依赖组件的 offset。

### LK-ROOT-DOC-001 Root 没有运行态 showcase 与直接测试

- 严重度：P2
- 状态：open
- 分类：DOC、test-gap
- 归属：demo/tests
- 影响：H5、MP-WEIXIN
- 证据等级：E1
- 证据：有组件 demo 和文档，但 showcase/risk matrix 漏项且无 `lk-root.spec.ts`，所以主题、品牌色、安全区与 Toast 宿主没有可追溯运行证据。
- 最佳方案：Root 加入确定性演练场，覆盖嵌套、safeArea on/off、theme、brandColor、toast on/off；单测只锁纯解析契约。

### LK-PRELOAD-INT-001 调试面板暂停状态会与全局队列失同步

- 严重度：P2
- 状态：open
- 分类：INT、ORG
- 归属：component/core
- 影响：H5、MP-WEIXIN
- 证据等级：E1
- 源码：调试面板把 `isPaused` 独立初始化为 false，只在自身按钮中翻转；全局 manager/queue 没有可读取暂停状态，外部 `usePreload().pause()` 或其他调用不会同步面板。
- 根因：单例队列状态存在，读取契约缺失，各调用方各自维护布尔副本。
- 最佳方案：在队列/manager 提供只读状态或把状态纳入 stats，并让面板监听 `queue:pause/resume`；不要在面板猜测全局状态。
- 待验证：外部先暂停队列，再打开面板，记录按钮文案、点击后的队列状态和事件次数。

### LK-PRELOAD-INT-002 同毫秒日志可能产生重复 key 和滚动目标

- 严重度：P3
- 状态：open
- 分类：INT、ORG
- 归属：component
- 影响：H5、MP-WEIXIN
- 证据等级：E1
- 源码：日志 ID 只有 `log_${Date.now()}`；并发任务可在同一毫秒触发多个 start/complete/error 事件。
- 根因：时间戳被当作唯一标识。
- 最佳方案：使用单调序列或事件任务 ID + 序列生成稳定唯一键；补同毫秒多事件测试并在双端确认日志数量与末项滚动。

### CORE-PRELOAD-INT-001 重试任务会暂时同时存在于等待与完成集合

- 严重度：P2
- 状态：open
- 分类：INT、RED、ORG
- 归属：core
- 影响：H5、MP-WEIXIN
- 证据等级：E1
- 源码：`queue.ts` 的重试分支把任务设回 pending 并计划重新入队后 return，但 `finally` 仍无条件把同一任务写入 `completedTasks`；重试入队后 stats 的 total 会同时计算 queue 与 completed map。
- 根因：重试、终态收尾共用无条件 finally，状态集合不互斥。
- 最佳方案：只对 completed/failed/cancelled 终态写入 completed map；重试状态只离开 running 并重入 queue。补失败一次后成功、连续失败、重试等待期与 clear/cancel 的确定性测试。

### LK-PRELOAD-STY-001 调试面板层级硬编码并绕过层级体系

- 严重度：P2
- 状态：open
- 分类：STY、CMP
- 归属：component/theme
- 影响：H5、MP-WEIXIN
- 证据等级：E1
- 源码：组件 scoped style 固定 `z-index: 9999`，已有主题层级 token 与浮层指南未参与。
- 根因：内部调试工具采用绝对魔法层级，没有声明它应高于或低于 Toast/Modal/Dev overlays 的语义关系。
- 最佳方案：先在演练场测量与 Navbar、Tabbar、Popup、Toast 组合；再新增或复用明确 debugger 层级 token，并写层级契约测试，不能简单把数字换成另一个数字。

## 处理顺序

1. 先修审计/运行态基础：AUD-CI-001、AUD-VIS-001、AUD-MP-001、AUD-RISK-001。
2. 建立确定性演练场并补 Root/Debugger 入口。
3. 对 `LK-ROOT-*`、`LK-PRELOAD-*` 和 `CORE-PRELOAD-*` 完成双端复现，再为每个独立根因创建专用工作树与分支。
4. 其余组件按覆盖矩阵批次继续逐行审查，新增问题追加完整模板。
