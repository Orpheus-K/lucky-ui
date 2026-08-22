# Lucky UI 73/73 静态审计总览

## 1. 先读结论

- 基线：`develop@c8071e67f93cc95ee1ddc12cac7bfccdf74058c1`；审计分支 `docs/lucky-ui-full-audit`。
- 静态覆盖：73/73 个组件目录、324 个组件文件；其中 322 个文本文件共 58,674 个物理行，另有 2 个字体二进制。共享层 77/77 个文件、10,338/10,338 个物理行。
- 八份逐行报告共登记 289 条问题记录：P0=0、P1=173、P2=111、P3=5。
- 289 是“报告问题记录数”，不是去重后的根因数。报告间已确认存在同根因重复或重叠，当前不能诚实给出“唯一缺陷总数”。
- 组件矩阵的 73 行“主归属问题数”合计 212。它只用于回答每个组件直接背负多少问题，不能代替 289 条报告记录，也不是唯一根因数。
- `ISSUE_LEDGER.md` 有 24 条 open 基础设施/治理记录（P1=3、P2=19、P3=2）。其中既有报告的别名/重复项，也有未进入八份报告的设施问题，禁止把 24 简单加到 289 得出 313。
- 运行证据：H5 只有 Anchor 滚动和 Form 校验两个部分 E2 场景，不能折算为任一组件全场景通过；微信小程序为 0/73，低于 E3。静态 73/73 不等于修复完成，更不等于跨端通过。
- 当前所有问题仍应视为 open 或待归一化；构建、类型、单测、截图、showcase `verified`/已验证标签都不能改变这个结论。

本页是修复规划与追溯入口。逐条源码行号、SHA-256、根因与 Peekit 配方仍以各批报告为准。

## 2. 权威材料与职责

| 材料 | 用途 | 不能证明什么 |
| --- | --- | --- |
| [跨端审计协议](./CROSS_PLATFORM_COMPONENT_AUDIT.md) | 分类、严重度、证据等级、修复与关闭门槛 | 不代表任何场景已经执行 |
| [基线结果](./BASELINE_RESULTS.md) | 文件分母、命令结果、H5 部分 E2 与微信阻塞证据 | build/test 退出 0 不等于运行正确 |
| [组件审计矩阵](./COMPONENT_AUDIT_MATRIX.md) | 73 组件静态进度与主归属问题数 | 文档/单测/demo 的 Y 不代表内容充分 |
| [问题台账](./ISSUE_LEDGER.md) | 24 条工具、测试、文档、Root/Preload 治理记录 | 不能与报告数直接相加 |
| [A0 共享基础](./reports/A0_SHARED_FOUNDATION.md) | common、core、composables、utils、theme、locale、包入口 | 不替代各组件运行回归 |
| [A1 高风险组件](./reports/A1_HIGH_RISK_COMPONENTS.md) | Picker、TabbarContainer、Tooltip、Waterfall；Root/Debugger 见 ledger/矩阵 | 只达到 E1 |
| [A2 浮层反馈](./reports/A2_OVERLAY_FEEDBACK.md) | 11 个浮层、提示、加载与空态组件 | 未执行双端关闭门槛 |
| [A3 导航滚动](./reports/A3_NAVIGATION_SCROLL.md) | 11 个导航、滚动、长列表组件 | 仅 Anchor 一个部分 E2 场景 |
| [A4 表单输入](./reports/A4_FORM_INPUT.md) | 15 个表单、选择、上传、键盘组件 | 仅 Form 一个部分 E2 场景 |
| [A5A 基础展示](./reports/A5A_BASIC_DISPLAY.md) | 16 个基础视觉和布局组件 | V01～V60 都是待执行配方 |
| [A5B 动态时间](./reports/A5B_DYNAMIC_TIME.md) | 6 个日期、计时、动画、布局组件 | 31 项均为静态结论 |
| [A6 图表](./reports/A6_CHARTS.md) | 8 个 Canvas/组合图表 | 微信 direct runtime 覆盖为 0 |

## 3. 289 条报告记录的准确口径

| 批次 | 范围 | P1 | P2 | P3 | 记录数 |
| --- | --- | ---: | ---: | ---: | ---: |
| A0 | 共享基础 | 23 | 20 | 0 | 43 |
| A1 | 高风险组件 | 6 | 13 | 2 | 21 |
| A2 | 浮层与反馈 | 23 | 8 | 0 | 31 |
| A3 | 导航与滚动 | 23 | 12 | 0 | 35 |
| A4 | 表单与输入 | 24 | 16 | 0 | 40 |
| A5A | 基础展示 | 37 | 20 | 3 | 60 |
| A5B | 动态、时间与布局 | 20 | 11 | 0 | 31 |
| A6 | 图表 | 17 | 11 | 0 | 28 |
| 合计 | 八份报告 | 173 | 111 | 5 | 289 |

A1 的编号看似到 A1-20，但序号 17 拆成 A1-17A 与 A1-17B，因此实际是 21 条。289 的机器复算应从报告标题的稳定 ID 与 P 级提取，不按最大编号推测。

### 3.1 212 个组件主归属如何得到

| 批次 | 组件数 | 矩阵主归属计数 |
| --- | ---: | ---: |
| A1 | 6 | 26 |
| A2 | 11 | 28 |
| A3 | 11 | 32 |
| A4 | 15 | 36 |
| A5A | 16 | 54 |
| A5B | 6 | 30 |
| A6 | 8 | 6 |
| 合计 | 73 | 212 |

六个组件当前为 0 个直接主归属：`lk-form-group`、`lk-radio`、`lk-chart-area`、`lk-chart-radar-lite`、`lk-chart-ring`、`lk-chart-sparkline`。这表示报告没有把问题唯一主归属给它们，不表示它们已经通过；它们仍受共享、批次横切与运行态缺口影响。

### 3.2 289 与 212 为什么相差 77

两种统计不是同一集合：

~~~text
289 = A0 共享层 43 + A1～A6 报告记录 246

212 = 246
      - 40 条批次级/跨组件/文档/演练场/测试/无障碍记录
      + 6 条矩阵从共享层或独立 ledger 吸收的组件记录

289 - 212 = 43 + 40 - 6 = 77
~~~

40 条未进入组件主归属列的批次记录分布为 A1=1、A2=3、A3=3、A4=4、A5A=6、A5B=1、A6=22。A6 的共享 Canvas、主题、文档、能力矩阵和演练场问题很多，因此八图直接主归属只有 6，不应误读为“图表问题少”。

矩阵吸收的 6 条是：

- `lk-root` 2：LK-ROOT-CMP-001、LK-ROOT-DOC-001。
- `lk-preload-debugger` 3：LK-PRELOAD-INT-001、LK-PRELOAD-INT-002、LK-PRELOAD-STY-001。
- `lk-tabbar-container` 额外 1：A0-14；它与 A1-02 是同一模块级单例根因的两处报告记录。

矩阵只保存每组件数量，没有保存 issue ID 关系；上述映射由报告分组、ledger 与计数闭合得出。后续必须补 canonical issue manifest，不能继续靠标题推导。

### 3.3 已确认重复、别名与严重度冲突

以下是已经能确定的重叠，不是完整去重结果：

| 记录 A | 记录 B | 关系 |
| --- | --- | --- |
| A0-14 | A1-02 | TabbarContainer 模块级全局单例 |
| A0-25 | A6-01 | ChartCanvas 同帧调度丢最新 payload |
| A0-31 | A6-04 | 微信 Canvas 品牌色固定回退 |
| A0-33 | A5A-01 | 微信自动暗色语义 token 不完整 |
| A0-35 | A5A-02 | 两套 spacing token 数值冲突/高度重叠 |
| A5A-03 | A5B-21 | baseProps.id 被多个组件根节点吞掉 |
| A0-03 | CORE-PRELOAD-INT-001 | 同一 Preload 重试状态集合问题 |
| A0-39 | THEME-RESET-CMP-001 | 同一 select 选择器泄漏 |

严重度还存在冲突：A0-03 为 P1，而 CORE-PRELOAD-INT-001 为 P2；A0-39 为 P1，而 THEME-RESET-CMP-001 为 P2；A0-35 为 P2，而高度重叠的 A5A-02 为 P3。关闭前必须选一个 canonical ID、一个最终严重度和多个 alias，不允许两个状态独立漂移。

下一治理步骤应建立 `canonicalId`、`aliases[]`、`reportRefs[]`、`componentOwners[]`、`rootCauseOwner`、`severity`、`evidence[]`、`status` 的结构化 manifest。完成归一化前，本页只报告 289 条记录，绝不给虚假的“唯一问题总数”。

### 3.4 24 条 ledger 的正确用法

- 24 条全部 open：P1=3、P2=19、P3=2。
- AUD-CI-002、AUD-MP-001 与 A1-19、A2-31、A3-33、A4-40、A5A-04、A5B-31、A6-15 都在描述运行证据失真或缺失。
- AUD-COMPAT-002、THEME-RESET-CMP-001 与 A0-39 交叉。
- CORE-PRELOAD-INT-001 与 A0-03 相同。
- LK-ROOT-* 与 LK-PRELOAD-* 被矩阵吸收为组件主归属。
- AUD-VIS-001、AUD-LINT-001、AUD-UNIT-002、AUD-MP-002、AUD-PROBE-001、AUD-PEEKIT-001、LK-CARD-CMP-001 等包含报告之外的治理/设施记录。
- 矩阵尾部 AUD-TOOL-001 与 ledger AUD-RISK-001 实质重复，AUD-TEST-001 与 AUD-UNIT-001 实质重复；AUD-DEMO-001 尚无 ledger 对应。

因此 24 是治理视图，既非 289 的纯子集，也非完全互斥集合。正确动作是 canonicalize，不是相加。

## 4. 用户关心的问题类别索引

类别按审计协议的主分类组织。下表给出高频根因和代表性稳定 ID；完整命中项应在 canonical manifest 中逐条标注，不能从标题关键词伪造精确分类数量。

| 用户问题 | 协议代码 | 高频根因 | 可追溯代表项 |
| --- | --- | --- | --- |
| 样式问题 | STY | selector 与模板不匹配、状态 modifier 无效、裁剪/动画名冲突、组件隔离穿透失败 | A2-11、A3-26、A5A-10/12/57、A5B-07/23/24、A6-24 |
| 对齐问题 | ALG | flex/grid 契约缺失、左右内容不等宽、测量值陈旧 | A1-16、A5A-16/43、A5B-06、A6-02 |
| 代码冗余 | RED | 双模板分支复制、重复 keyframes/token、无效公共 props/barrel | A1-17A/17B、A5A-02/32/49、A5B-26、A6-21 |
| 边距问题 | SPC | safe-area 重复、0 被默认值吞掉、shorthand 未解析、空 slot 留 gap | A1-06、A2-02/23、A5A-15/28/42/55、A5B-08 |
| 嵌套问题 | NST | slot wrapper 永久存在、父样式穿透子组件、浮层定位上下文错误 | A1-09、A3-09、A5A-14/17/42、A5B-28/29 |
| 散乱问题 | ORG | 多个状态真源、模块单例、magic z-index、demo 样式混入发布包 | A0-07/14/32、A2-19、A5A-37/49、A5B-26、LK-PRELOAD-STY-001 |
| UI 不合理 | UI | 空态/加载态混淆、默认形态无效、信息反馈与真实行为相反 | A1-14、A2-05/25、A4-36/38、A5A-11/12、A6-26 |
| 宽度高度问题 | DIM | px/rpx 二次换算、初次测量快照、缺 min-width、无限/非法尺寸 | A2-10/11/23/29、A3-01/06/32、A4-18/33、A5A-18/24/36/48/54、A5B-19/27/29、A6-02/22 |
| 交互问题 | INT | disabled/readonly gate 缺失、事件重复/不可达、受控草稿错位、latest-wins 缺失 | A0-11/15/28、A1-01/03/07/08/13、A2-01/04/17/18/27、A3-17/22/29/30、A4-01～07/16～31/35、A5A-20～22/40/56、A5B-09/11/13/18、A6-07/08/13 |
| 文档问题 | DOC | API/默认值/示例与实现漂移、旧 demo 路径、手填 verified | A0-18、A1-04/18/19、A2-03/13/20/22/28、A3-10/13/18、A4-23/37/40、A5A-04/07/08/13/19/45、A5B-31、A6-14/15/18/19 |
| 兼容性问题 | CMP | DOM API/selector 泄漏、Uni 原生值映射错误、组件样式隔离、Canvas/scroll-view 平台结构 | A0-02/20/21/27/39/43、A2-07/08、A3-02/09/20、A4-24/29、A5A-17/33/38/50、A5B-14/25/28、A6-03/04/14 |
| 颜色搭配 | COL | 语义 token 不完整、硬编码颜色、反色配对错误、Canvas 颜色解析过窄 | A0-31/33/34/36/37、A2-21/26、A5A-01/10/23/31/46/58、A5B-07/17/24、A6-04/05/17/24 |
| 不同端差异 | XPF | H5 能力直接编译到 MP、MP 原生滚动/图片/字体/Canvas 契约不同、只验证一端 | A0-20/21/27/33/39、A2-01/07/08/14/30/31、A3-02/09/11/15/20/21、A4-08/24/29/35/39/40、A5A-17/27/33/34/38/50、A5B-14/25/28/31、A6-04/14/15/16 |

附加高频主题：

- 无障碍/触摸：A3-35、A4-13、A5A-09/35/41/47/51/56/60、A5B-08、A6-13。
- 性能/资源所有权：A0-03～16/22/24/28/29、A2-10/17、A3-03/32、A4-11/19/20/21/26、A5B-02/05/13/18、A6-01/08/11/12。
- 类型与发布：A0-17/23/42/43、A5A-32/45、A6-21/27/28。
- 输入边界：A0-19/30、A4-15/17/20/33、A5A-48/52/55/59、A5B-03/04/10/14/19/27、A6-09/10/22/26。

## 5. 高频根因与最佳修复架构

### 5.1 状态、异步与所有权

高频模式是状态存在两个真源、旧 Promise/timer/RAF 覆盖新意图、模块单例跨实例串扰、卸载不取消。

最佳层级：

1. core 提供 instance factory、generation/latest-wins、AbortController/task owner、统一 timer/RAF registry。
2. composable 只暴露响应式状态和显式 dispose，不保存调用方无法观察的布尔副本。
3. 组件区分 request、draft、committed、visible 等状态，事件只从真实边沿产生。
4. demo 不以 sleep、随机数或静态文案模拟成功。

优先覆盖 A0 Request/Preload/Tabbar/Transition，随后 A1 TabbarContainer、A2 Popup/Toast、A4 Form/Upload/numeric controls、A5B timer/animation、A6 Canvas scheduler。

### 5.2 跨端结构与能力适配

高频模式是把 H5 的 DOM selector、URL、overflow、portal、img/select、CSS fit 或鼠标语义直接当成微信能力。

最佳层级：

1. 建立 platform adapter：scroll host、portal host、media mode、measure/query、system geometry、Canvas color/theme。
2. 公共状态保持同一语义；确实不同的宿主结构用明确条件编译，不让平台差异泄漏为不同公共事件。
3. 微信组件隔离下由子组件绘制自己的边界和状态；不要依赖父 scoped/:deep 穿透。
4. compat checker 同时消费编译器 warning fixture，不再只相信自身规则。

### 5.3 主题、颜色、间距与层级

高频模式是 Sass/CSS 两套 token、暗色只覆盖半套、text token 被当背景、硬编码 z-index 与 Canvas fallback。

最佳层级：

1. 建立唯一生成源输出 Sass/CSS/TS token；spacing、surface/foreground、inverse、chart、z-index 分别是明确语义。
2. theme 切换原子化并 latest-wins；H5/MP 系统 UI 与页面 token 同源。
3. 颜色对使用数值对比度门禁；Canvas 接受完整合法颜色并在端内解析。
4. 组件只消费语义 token，demo 的视觉值不得沉入默认实现。

### 5.4 几何、单位与测量

高频模式是 setup 时只测一次、px/rpx 双重换算、Resize 后不重算、flex 子项缺收缩边界、无界数字进入 style/Canvas。

最佳层级：

1. 一个 unit parser 明确 number/string 的单位合同，0、负值、非有限值均有策略。
2. 一个跨端 measurement owner 负责 resize/font/slot/content/DPR/system geometry 变化和 cleanup。
3. 布局组件把 rect、scroll、active identity 解耦；不能用数组位置或首次宽度当永久 identity。
4. 所有数量、精度、尺寸、时长和索引先 finite/integer/range canonicalize。

### 5.5 API、文档、demo 与证据

高频模式是手写默认值/旧 prop/旧路径、showcase verified 自证、unit 只测 utils、随机 demo 与外网资源。

最佳层级：

1. 从 props/emits/slots/methods schema 生成或校验文档、Playground 控件和 consumer types。
2. demo registry 是 slug/route 的单一真源，文档只引用 registry，不复制路径。
3. verified 从 evidence manifest 派生；缺任一平台、commit、selector、event、rect、computed、errors 即 pending。
4. unit/SFC contract/visual/runtime 分层，任何一层不冒充另一层。

## 6. 修复依赖顺序

1. 治理先行：当前 P0=0；先建 canonical issue manifest，统一 alias、严重度与状态，避免重复分支。
2. 修运行基础设施：AUD-MP-002、AUD-VIS-001、AUD-UNIT-002、AUD-PROBE-001、AUD-PEEKIT-001、AUD-PLAYGROUND-001；否则后续证据不可信。
3. 修发布与共享状态根因：A0-42/43、Request/Preload/Tabbar、Transition、scroll owner、timer/RAF owner。
4. 修跨端 theme/unit/measure/platform adapter：A0-20/21/25～39；先让所有消费者有一致底座。
5. 修高影响组件状态机：Picker/TabbarContainer、Popup/Overlay/Toast、Form/Upload、VirtualList/Tabbar、CalendarPicker/Countdown、Pie/Bar/Line。
6. 修视觉与结构：颜色、层级、安全区、触摸尺寸、alignment、slot wrapper、长文本、空态。
7. 同步 public API/types/docs/demo/Playground；删除死 API 需单独迁移设计，不能在视觉修复中顺带 breaking change。
8. 每个分支双端 E4 后才关闭；所有分支集成后从干净 develop 建新的总体验收工作树，重新跑 73/73，不复用旧缓存和旧截图。

## 7. 建议的独立功能分支与工作树

规则：以下每行是一个 root cause batch，不是一个巨型阶段分支。表中写明“继续拆”的行只是同类队列/命名模板，实施时必须一组件或一根因一工作树，不能直接创建覆盖整行的集合分支。组件实现、定向测试、该功能 demo/docs 和证据 manifest 可同分支闭环，无关格式化与其他根因不得混入。

| 顺序 | 建议分支 | 独立功能范围 | 主要追溯 |
| ---: | --- | --- | --- |
| 01 | `docs/audit-canonical-issue-manifest` | canonical ID、alias、severity、owner、evidence/status；不改组件 | 本页 3.3、ledger |
| 02 | `feature/component-audit-playground` | 确定性 route/schema/fixture/seed/time/theme/locale/network/motion | AUD-PLAYGROUND-001、A4-39、A6-16 |
| 03 | `fix/audit-h5-runner-baseurl` | Playwright 单一 baseURL、webServer、route builder | AUD-VIS-001 |
| 04 | `fix/audit-probe-evidence-schema` | DOMRect/BoundingBox adapter、finite 断言、artifact schema | AUD-PROBE-001 |
| 05 | `fix/audit-peekit-process-owner` | Windows session PID/port owner 与精确清理 | AUD-PEEKIT-001 |
| 06 | `fix/audit-wechat-auto-preflight` | DevTools AUTO/page health 四层预检；恢复 App.getCurrentPage | AUD-MP-002 |
| 07 | `fix/audit-ci-strict-compat` | strict 兼容和编译器 unsupported selector 门禁 | AUD-CI-001、AUD-COMPAT-002 |
| 08 | `fix/audit-test-health` | unit service error 非零退出、动态端口、cleanup | AUD-UNIT-002 |
| 09 | `fix/package-consumer-contract` | exports/types/runtime 条件与 tarball H5/uni consumer | A0-42/43 |
| 10 | `fix/core-preload-state-machine` | queue 状态互斥、retry/timeout/cancel/abort/dedupe | A0-03～12 |
| 11 | `fix/core-request-generation` | Request cancel/retry/loading owner/latest generation | A0-11～13 |
| 12 | `fix/core-tabbar-instance` | per-container factory、latest-wins、preload status | A0-09/14/15、A1-02/03 |
| 13 | `fix/core-transition-owner` | transition end/fallback、listener/timer/RAF cleanup | A0-28/29 |
| 14 | `fix/core-scroll-animation-owner` | scroll animation cancel/old intent invalidation | A0-22 |
| 15 | `fix/ripple-duration-query-scope` | CSS/JS duration 同源、MP 按实例测量 | A0-26/27 |
| 16 | `fix/theme-token-single-source` | Sass/CSS spacing、surface/inverse、z-index 生成源 | A0-34～36/38、A5A-02 |
| 17 | `fix/theme-atomic-dark-brand` | latest-wins、MP dark token、brand validation/contrast | A0-31～37、A5A-01 |
| 18 | `fix/platform-unit-measure` | finite/unit parser、resize/DPR/system geometry owner | A0-19/20、各批尺寸测量项 |
| 19 | `fix/platform-selector-reset` | H5 select/img 隔离、MP compat fixtures | A0-39、THEME-RESET、LK-CARD-CMP |
| 20 | `fix/base-props-contract` | id/attrs/customClass/customStyle 根透传 | A5A-03、A5B-21、A6-03 |
| 21 | `fix/picker-commit-contract` | inline 与 popup 提交边界、toolbar alignment | A1-01/16 |
| 22 | `fix/tabbar-container-keepalive-safearea` | keepAlive reconcile、safe-area、default mode | A1-04～06 |
| 23 | `fix/tooltip-lifecycle-position` | disabled close、controlled edges、stop、flip+shift | A1-07～10 |
| 24 | `fix/waterfall-data-layout` | identity、image ratio、load latch、empty、resize | A1-11～15/18 |
| 25 | `fix/overlay-scroll-lock-owner` | reference-count lock、MP touch/page scroll、restore | A2-01/12/14、A4-35 |
| 26 | `fix/popup-responsive-lifecycle` | animation/viewport/RAF/side width/close edge | A2-04/06/09～11/29 |
| 27 | `fix/toast-instance-lifecycle` | manager scope、timer、forbidClick、event dedupe/style | A2-17～21 |
| 28 | `fix/feedback-<component>-contract` | ActionSheet/Curtain/Loading/Skeleton/Empty/NoticeBar；每组件继续拆 | A2-02/03/07/08/22～28 |
| 29 | `fix/navigation-<component>-geometry` | Anchor/Backtop/Sticky/Navbar；每组件或共享测量根因继续拆 | A3-01～04/13～15/19～21 |
| 30 | `fix/carousel-runtime` | dynamic props、autoHeight、autoplay event | A3-05～07 |
| 31 | `fix/collapse-runtime` | runtime props、动画、MP nesting、文档 | A3-08～10 |
| 32 | `fix/tab-tabbar-identity` | model 0/string identity、registration、slider/classes | A3-22～28 |
| 33 | `fix/virtual-list-scroll-state` | repeat scroll、bottom latch、strategy、geometry append | A3-29～32 |
| 34 | `fix/form-field-contract` | reset/disabled/linkage/trigger/fields/nested/latest validation | A4-01～08 |
| 35 | `fix/text-composition-a11y` | Input/Textarea IME、readonly、blur timer、keyboard semantics | A4-09～13 |
| 36 | `fix/selection-<component>-contract` | Choice/SelectList/Rate；每组件按禁用/value/half-star 决策拆分 | A4-14/15/22/23 |
| 37 | `fix/numeric-<component>-state` | Slider/Stepper/Switch；每组件按 finite/drag/timer/async 根因拆分 | A4-16～21 |
| 38 | `fix/upload-task-owner` | media contract、beforeRead、abort/revoke、immutable state、HTTP/delete | A4-24～30 |
| 39 | `fix/verify-code-state` | sent state、focus/length、默认宽度 | A4-31～33 |
| 40 | `fix/keyboard-contract` | sound/delete、scroll lock、plate layout | A4-34～36 |
| 41 | `fix/basic-interactive-a11y` | common role/focus/keyboard/44px contract | A5A-09/35/41/47/51/56/60、A5B-08 |
| 42 | `fix/card-event-padding` | Card event boundary 与 padding parser | A5A-14/15 |
| 43 | `fix/cell-group-layout` | Cell alignment、group border、long text | A5A-16～18 |
| 44 | `fix/fab-interaction-geometry` | tap/drag/overlay/disabled/color/unit/responsive direction | A5A-20～26 |
| 45 | `fix/grid-ripple-pagination` | per-item query、gap zero、columns/root/disabled/types | A5A-27～32 |
| 46 | `fix/icon-font-runtime` | consumer init、failure retry、attrs/box units；死 loader 另拆 | A5A-33～37 |
| 47 | `fix/image-request-media` | mode adapter、idle/race/error/preview/a11y | A5A-38～41 |
| 48 | `fix/basic-<component>-layout` | Avatar/Badge/Button/MetaRow/Page/Progress/Space/Tag；必须逐组件建分支 | A5A-08～12/42～59 |
| 49 | `fix/calendar-date-domain` | strict day/month parser、firstDay、range index、today clock | A5B-01/03～05 |
| 50 | `fix/calendar-visual-lifecycle` | timer owner、week size/ring/touch | A5B-02/06～08 |
| 51 | `fix/calendar-picker-transaction` | locked gate、strict time/step、draft/commit、position animation | A5B-09～12 |
| 52 | `fix/countdown-time-domain` | absolute target、ISO/unit、showZero、lexer、inverse contrast | A5B-13～17 |
| 53 | `fix/number-roller-identity` | autoplay sync、finite props、place-value keys | A5B-18～20 |
| 54 | `fix/timeline-structure-animation` | last line、keyframes、halo、MP scroll、demo CSS ownership | A5B-22～26 |
| 55 | `fix/watermark-bounds-host` | cell cap、fullPage root/portal、local height、keys | A5B-27～30 |
| 56 | `fix/chart-canvas-runtime` | latest payload、measure/DPR/id、RAF owners、reduced motion | A6-01～03/11/12 |
| 57 | `fix/chart-color-data-domain` | theme/color parser、finite/sourceIndex/empty/axis tokens | A6-04/05/09/10/17/22/24/26 |
| 58 | `fix/chart-pie-interaction` | reactive props、source index、tooltip timer、pulse | A6-06～08/25 |
| 59 | `fix/chart-accessible-contract` | keyboard/data alternative/tooltip layer/locale/capability matrix | A6-13/14/23/28 |
| 60 | `docs/component-api-registry` | props/emits/slots/default/path 校验；按组件文档小 PR 输出 | AUD-DOC-001/002、各批 DOC |
| 61 | `test/runtime-evidence-manifest` | H5+MP artifact schema 驱动 verified，删除手填安全感 | 各批 verified 项、AUD-CI-002 |
| 62 | `test/final-73-crossend-regression` | 仅在所有修复集成后，从干净 develop 独立总验收 | 审计协议第 12 节 |

## 8. 确定性演练场

演练场必须使用独立 `feature/component-audit-playground` 工作树，不混入具体组件修复。每个 case 至少包含：

- 稳定 `data-audit-id` 与 case ID，不依赖 `nth-child` 或展示文案。
- commit、branch、component version、target、build hash、route、viewport/device、DPR/base library。
- 固定 theme、brand、locale、timezone、now、seed、motion、network result、system geometry；进入场景前清持久状态。
- `base`、`states`、`long-content`、`boundary`、`interaction`、`composition` 六类基本场景；动态组件另有 hide/show、unmount、race、resize/rotate。
- 页面事件 journal：输入、update、change、open/close、finish/error 等原始顺序与次数。
- 资源只用本地确定性 fixture 或受控 stub；不能依赖随机数、公共图片站和人工 sleep。
- 场景结束暴露 timer、interval、RAF、observer、listener、object URL、request task 的存活计数。
- H5 与微信使用同一 case 数据和动作语义，允许宿主结构不同，但公共状态和事件必须一致。

## 9. 客观验收与关闭门槛

### 9.1 每项必须保存的证据

| 字段 | H5 | 微信小程序 |
| --- | --- | --- |
| selector/结构 | 真实 DOM tag/class/text/attrs | 真实 WXML、组件路径、节点属性 |
| 动作 | click/touch/keyboard/scroll/resize/clock/network | tap/touch/scroll/setData/rotate/hide-show/API stub |
| 事件 | 页面 journal 的 payload、顺序、次数 | 页面/组件 journal 的 payload、顺序、次数 |
| rect | getBoundingClientRect/Playwright box，统一 left/top/width/height | selectorQuery offset/size，换算 CSS px |
| computed | display/position/overflow/color/bg/transform/opacity/z-index 等 | 可读取 computed/final style 与原生属性 |
| 状态 | model、draft、active、loading、timer/owner 数 | page data、component data、task/owner 数 |
| errors | console、pageerror、unhandled rejection、network | runtime、API fail、unhandled、DevTools error |
| 辅助 | screenshot/hash | screenshot/hash |

截图只辅助视觉对比，不得替代事件、几何、计算样式或错误。

### 9.2 通用硬门槛

1. canonical ID 已确定；所有 alias 同步状态和最终严重度。
2. `compat-check:strict`、定向 lint/stylelint/type/unit、H5 build、MP build 全部成功；任何已知基础设施 error 不得被退出 0 掩盖。
3. public API、类型、实现、demo、文档一致；breaking change 有迁移和版本策略。
4. H5 和微信同一 case 均有修复前/后结构化 evidence；布局、样式、颜色、交互、跨端问题达到 E4 才关闭。
5. 320、375、414 CSS px 无意外横向溢出；响应式/旋转项另测 430 或横屏。
6. 关键非原生差异 rect/offset 跨端目标误差不超过 1 CSS px；有意差异写设计依据。
7. 点击目标原则上至少 44×44 CSS px；disabled/readonly/loading 不发被禁止事件。
8. 一次手势只产生一次公共事件；model、内部状态、payload、视觉状态一致。
9. 正文对比度至少 4.5:1，大字和关键非文本图形至少 3:1；明暗主题、局部品牌和禁用态均测。
10. 所有 timer/RAF/observer/listener/request/object URL 在 close/unmount 后归零；console/page/runtime/unhandled errors 为空。
11. 三次重放得到相同状态 hash 和事件 journal；Canvas/字体像素只允许有解释的平台容差。
12. evidence manifest 缺任何平台或字段时 showcase 必须显示 pending，CI 必须失败或明确不允许合并。

纯文档、类型或可静态证明的死代码可用 E1 加自动门禁关闭，但必须写明为何无运行行为；一旦改变渲染、事件、尺寸、样式或平台分支，仍需双端。

### 9.3 当前运行态基线

| 目标 | 已有证据 | 可宣称状态 |
| --- | --- | --- |
| H5 Anchor | 390×844，一个滚动场景部分 E2 | 仅该场景已复现，组件未完成 |
| H5 Form | 390×844，一个提交校验场景部分 E2 | 仅该场景已复现，组件未完成 |
| 其余 H5 | 没有符合协议的完整前后证据 | 待抓取 |
| 微信 73 组件 | build/DevTools 握手但 `App.getCurrentPage` 无页面证据 | 0/73，全部待抓取 |

微信阻塞已进一步收窄：DevTools stable `2.01.2510290` 在收到完整 AUTO 请求 104.762 秒后，才由未受控的延迟窗口路径抛出 `split(undefined)`。类型定义、Launcher、CLI schema 与 handler 均证明 `account/ticket` 可选，因此不能以补 `auto-account` 或伪造账户作为修复。持久化日志没有 stack，精确接收者仍未知；只能在隔离 DevTools/用户数据目录中走 `waitRealOpend:true` 的 `auto-replay` 路径获取受控 stack。详情见 `AUD-MP-002`，在页面栈可读前微信仍保持 0/73。

## 10. 整体确认与防掩盖

所有修复合并后，必须从最新干净 develop 新建独立验证工作树：

1. 重建 73 组件、共享层、docs/demo/tests 的文件与 SHA 分母，确认没有漏组件、漏文件或误带其他工作树改动。
2. 重跑静态兼容、lint/stylelint、type、全量 unit、H5/MP build、consumer tarball fixtures。
3. 按风险重放确定性场景：高风险全部场景；中低风险至少 base、boundary、interaction、composition、light/dark。
4. 对 theme、Root、浮层层级/scroll lock、表单联动、导航滚动、安全区、长列表、时间、上传、图表做跨组件组合回归。
5. H5 与微信都重新抓取，不沿用修复分支服务、缓存、截图或 verified 标签。
6. 输出 canonical issue manifest：closed、verifying、open、accepted-difference、blocked 分开列；任一失败不被总体通过率掩盖。
7. 只有 73/73 的所需场景达到协议门槛、所有 P1/P2 有闭环或明确批准的接受差异，才可宣布本轮完成。

## 11. 当前可执行下一步

建议立即按依赖顺序启动但不混合以下三个独立工作树：

1. `docs/audit-canonical-issue-manifest`：先消除重复 ID、严重度和状态漂移；只改审计治理数据。
2. `feature/component-audit-playground`：建立固定环境、稳定 selector、事件 journal 与 evidence schema。
3. `fix/audit-wechat-auto-preflight`：独立解决当前微信 0/73 的页面级自动化阻塞。

在这三项完成前可以修纯静态且低耦合的文档/type 问题，但不能把任何视觉、交互或跨端组件问题关闭。修复分支必须从最新正确基线建立独立工作树，只包含对应功能点，不直接推送 develop/main，也不写任何辅助生成署名。
