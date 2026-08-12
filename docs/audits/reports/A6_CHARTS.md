# A6 图表组件逐行静态审计

## 结论

审计对象为 lk-chart-area、lk-chart-bar、lk-chart-line、lk-chart-pie、lk-chart-radar-lite、lk-chart-ring、lk-chart-sparkline、lk-chart-stat-card。基线为 audit/lucky-ui-full-review-20260813 @ c8071e67f93cc95ee1ddc12cac7bfccdf74058c1。

本批次冻结分母为 89 个唯一文件、16,425 个物理行，重复文件 0，分母内未读文件 0。八个组件目录的 32 个文件全部逐行读取；同时覆盖共享 Canvas、主题与颜色调用链、九份图表文档、九个 Demo、直接 unit/visual、preview、showcase、component-detail、playground 与 i18n preview。

本报告只代表静态审计完成，不代表 H5 或微信小程序运行态通过。本批次没有启动 H5、微信开发者工具或 Peekit，也没有运行测试；仓库已有 verified、评分、单元测试和截图均只作为被审计证据，不能替代后文的真实双端门禁。

共登记 28 项：P0 0 项、P1 17 项、P2 11 项。当前不应依据 docs/OPEN_SOURCE_COMPONENT_SCORE.md 中的 A/B 评分或 showcase 的 verified 状态发布八图组件。

## 范围与口径

| 层 | 唯一文件 | 物理行 |
|---|---:|---:|
| 八个组件目录 | 32 | 5,216 |
| Canvas、图表核心、主题、颜色、公共 props、导出与类型 | 12 | 2,395 |
| 文档与评分 | 11 | 1,092 |
| 直接与聚合 Demo | 9 | 2,826 |
| 直接 unit/visual/事件契约 | 15 | 1,907 |
| preview/showcase/playground/component-detail/i18n 载体 | 10 | 2,989 |
| 合计 | 89 | 16,425 |

物理行包含空行和注释，按文件当前字节内容读取；SHA256 见文末总账。.codegraph 不存在，因此没有用索引结果代替源码逐行阅读。tests/miniprogram 目录清单只有 button、tab、timeline 三类直接用例，没有任何 chart 直接用例。

## 验收前置

每项下方的 Peekit 是修复后的客观门禁设计，不是本轮执行结果。应先在演练场增加确定性 A6 fixture：每个场景有固定 id、固定数据、事件日志 #a6-events、Canvas 命令/像素探针 #a6-probe，且探针只存在于验收载体，不进入发布组件。H5 通过真实浏览器页面执行；微信小程序通过当前工作树的 dist/dev/mp-weixin、唯一 watcher 和微信开发者工具自动化通道执行。每项都必须保存 action、events、rect、computed/Canvas probe、errors 五类结构化证据，截图只能附加，不能单独判通过。

## 问题总览

| ID | 等级 | 类别 | 主要范围 |
|---|---|---|---|
| A6-01 | P1 | 调度/状态 | useChartCanvas |
| A6-02 | P1 | 尺寸/DPR/兼容 | 七个 Canvas 图 |
| A6-03 | P1 | 响应式 ID/API | 八图 |
| A6-04 | P1 | 品牌色/暗色/跨端 | 八图、主题 |
| A6-05 | P1 | 主题响应 | 七个 Canvas 图 |
| A6-06 | P1 | 响应式 props | Pie |
| A6-07 | P1 | 数据身份/事件 | Pie |
| A6-08 | P1 | 定时器/清理 | Bar、Line、Pie |
| A6-09 | P1 | NaN/几何 | Line |
| A6-10 | P1 | 负值/NaN/语义 | Bar |
| A6-11 | P1 | 动画竞争 | Bar、Line、Pie |
| A6-12 | P1 | 持续动画/无障碍 | Area、Radar、Ring、Sparkline、StatCard |
| A6-13 | P1 | 交互/键盘/无障碍 | 八图 |
| A6-14 | P1 | 微信原生层/文档 | Bar、Line、Pie |
| A6-15 | P1 | 验证证据失真 | showcase/visual/评分/MP |
| A6-16 | P1 | 演练场缺失 | 八图 |
| A6-17 | P1 | 颜色解析 | Area、Bar 及共享颜色 |
| A6-18 | P2 | API 文档 | Bar、Line、Pie |
| A6-19 | P2 | 聚合文档/契约测试 | chart-lite 四子图 |
| A6-20 | P2 | Demo 随机性/掩盖 | Area、Bar、Line、Pie |
| A6-21 | P2 | 冗余公共 API | 八图 |
| A6-22 | P2 | 数值边界 | 八图 |
| A6-23 | P2 | i18n | Pie、Ring |
| A6-24 | P2 | 语义色/对比度 | Bar、Line |
| A6-25 | P2 | 交互反馈 | Pie |
| A6-26 | P2 | 空状态 | 八图 |
| A6-27 | P2 | 组合配置 | StatCard/Sparkline |
| A6-28 | P2 | 八图 API 一致性 | 八图 |

## 逐项证据与最佳方案

### A6-01 P1：同一帧 scheduleRender 丢弃最新 payload

- 类别：调度、受控状态、动画。
- H5 影响：同一帧内数据、hover、动画进度连续更新时，只绘制第一次调用捕获的 progress/extra，画面可落后于 Vue 状态。
- 微信影响：小程序 rAF/定时调度同样走该闭包，触摸与自动提示竞争时可显示旧索引或旧动画帧。
- 精确证据：src/uni_modules/lucky-ui/composables/useChartCanvas.ts:478-483 在 rafId 已存在时直接 return；真正回调闭包永久捕获第一次调用的 progress 与 extra。area、bar、line、pie、radar-lite、ring、sparkline 均高频调用 chart.scheduleRender。
- 根因：把“同帧去重”实现成 first-write-wins，没有保存待绘制的最新参数。
- 最佳修复层：useChartCanvas。增加 pendingProgress/pendingExtra，所有调用都覆盖 pending，单个 rAF 消费最后一份快照；渲染中再次入队应进入下一帧。用伪时钟验证 last-write-wins 和卸载清理。
- H5 Peekit：selector=#a6-01、#a6-01__canvas、#a6-events、#a6-probe；action=同一宏任务依次 scheduleRender(0.1,{tag:first}) 与 scheduleRender(1,{tag:last}) 后等待两帧；events=render 日志只含 last 且无 hoverChange；rect=wrapper 与 canvas CSS rect 都为 320×180；computed=探针最后 progress=1、tag=last、Canvas backing=rect×DPR；errors=console.error/pageerror/unhandledrejection 均 0。
- 微信 Peekit：selector=#a6-01、#a6-01__canvas、#a6-events、#a6-probe；action=页面方法同 tick 连续入队 first/last 并等待 requestAnimationFrame；events=只提交 last；rect=selectorQuery 的 width/height 为 320×180；computed=node.width/height 与 pixelRatio 匹配且探针 tag=last；errors=运行时错误、警告、Promise 拒绝均 0。

### A6-02 P1：只在初始化测量，容器、视口与 DPR 变化后 Canvas 被拉伸

- 类别：宽高、对齐、DPR、跨端兼容。
- H5 影响：响应式布局、横竖屏、父容器宽度或 height prop 改变后，只改 CSS 盒子，物理画布仍是旧尺寸，导致模糊、坐标偏移和点击错位。
- 微信影响：窗口变化、分栏或动态高度后 node.width/node.height 与真实 rect 分离；触摸点仍减旧 wrapperRect。
- 精确证据：useChartCanvas.ts:337-355 只有 measure；401-427 只有被调用时才更新 DPR/backing size；617-629 仅 init 调用一次，437-453 只重试初始 0×0；631-639 没有 ResizeObserver、window resize 或 uni.onWindowResize 注册。area.vue:320-336、sparkline.vue:266-284、ring.vue:250-270 等虽 watch height，却只重新动画，不重新 measure。tests/visual/screenshot.spec.ts:14-18 在导航和 networkidle 后才 setViewportSize，正好可能把旧画布拉伸后截图。
- 根因：共享适配层把 autoSize 误当成“初始化自动测量”，没有生命周期 resize 契约和异步测量序列保护。
- 最佳修复层：useChartCanvas。H5 使用 ResizeObserver 并监听 DPR/窗口变化；微信注册 uni.onWindowResize/offWindowResize，同时暴露 resize；每次重测重新读取 DPR、更新 wrapperRect/backing size 并最后绘制，使用 generation 防止旧 query 回写。
- H5 Peekit：selector=#a6-02、#a6-02__canvas、#a6-probe；action=先以 390px viewport/112px height 渲染，再改为 320px/180px 并把 deviceScaleFactor 场景分别跑 1 与 2；events=每次有效尺寸只记一次 resize+render，无 hover 伪事件；rect=canvas 与 wrapper rect 完全相等；computed=canvas.width=round(rect.width×DPR)、height 同理，触摸中心返回中心坐标±1px，无 CSS stretch；errors=0。
- 微信 Peekit：selector=#a6-02、#a6-02__canvas、#a6-probe；action=调用演练页将容器 320×112 改为 280×180，再触发 onWindowResize；events=一次 resize+render；rect=boundingClientRect 与新值一致；computed=fields({node,size}) 的 node.width/height=rect×pixelRatio、触摸中心命中同一数据点；errors=0。

### A6-03 P1：DOM ID 响应式变化与 composable 的 ID 快照脱节，StatCard 又完全忽略 id

- 类别：响应式状态、选择器、公共 API。
- H5 影响：父组件运行中改 id 后，DOM 已换成新 id，但 Canvas 初始化/查询仍持有旧字符串；重新显示、重测或降级选择器可能找不到节点。StatCard 传 id 也无法定位根节点。
- 微信影响：selectorQuery 对 id 更敏感，动态 id 后重初始化与测量失败；测试和无障碍定位不稳定。
- 精确证据：area.vue:43-44/65-68、bar.vue:52-53/94-97、line.vue:46-47/126-129、pie.vue:52-53/90-93、radar-lite.vue:40-41/55-58、ring.vue:39-40/54-57、sparkline.vue:42-43/64-67 都把 computed 的 .value 一次性传给 useChartCanvas；模板继续绑定 computed。stat-card.vue:45 根节点没有 :id。
- 根因：id 的公共语义没有定义为挂载期稳定还是运行期响应式；DOM 与共享层采用两套生命周期。
- 最佳修复层：先在图表公共契约决定 id 挂载期不可变，内部 uid 用 shallowRef 固定；若允许动态 id，则 useChartCanvas 接受 Ref/MaybeRef 并在变化时取消旧任务、重新查询。StatCard 必须绑定同一公共 id。
- H5 Peekit：selector=#a6-03-old、#a6-03-new、#a6-stat；action=挂载后 old→new，再触发 resize、hover 与隐藏/显示；events=新节点继续产生正确 hoverChange，旧节点 0 个；rect=新 wrapper/canvas 非 0 且一致，StatCard 可由 #a6-stat 唯一找到；computed=canvas backing 仍匹配新 rect；errors=0。
- 微信 Peekit：selector=#a6-03-old、#a6-03-new、#a6-stat；action=setData 改 id 后触发 window resize 和 touch；events=仅新 selector 有 hoverChange；rect=旧 selector null、新 selector 与 canvas 非 0；computed=node 查询和 DPR 正常；errors=0。

### A6-04 P1：品牌色在微信固定回退，暗色 H5 也可能因 rgb 色阶回退为 #6965db

- 类别：颜色搭配、主题、跨端差异。
- H5 影响：亮色可偶然读到 hex；暗色 --lk-color-primary 指向 brand500，而运行时 generateShade 返回 rgb(...)，resolveBrandBaseColor 又只接受 # 开头，最终退回固定紫色。
- 微信影响：getCssVarColor 编译分支直接返回 null，所有未显式传色的图固定从 #6965db 建 palette，页面的 brandStyleVars 对 Canvas 不生效。
- 精确证据：chart-colors.ts:108-135 明确只有 H5 读取 CSS；149-158 只接受 hex 并固定 fallback。component-vars.scss:163 亮色 primary=brand600、296 暗色 primary=brand500、533-549 定义图表变量。brand-color.ts:28-34 非 600 色阶返回 rgb。theme-store.ts:94-98 只在 H5 写根变量，190-203/221-225 才提供跨端 JS 品牌值。
- 根因：Canvas palette 反向读取 CSS，而主题真源其实已经是 JS 响应式状态；解析器又把合法 rgb 错当作不可用。
- 最佳修复层：主题/颜色共享层。Canvas resolver 直接消费 themeStore/useTheme 的 brandColor 与 theme，统一把 hex/rgb/rgba 解析成 RGB，不依赖微信 CSS 读取；明确暗色用哪个品牌阶并为 H5/MP 生成同一语义 palette。
- H5 Peekit：selector=#a6-04 .a6-chart、#a6-probe；action=品牌改为 #336699，依次 light/dark，effect=none，采集七图 Canvas 命令；events=每次 brand/theme 变更一次 render；rect=所有图非 0 且不变；computed=ctx 主色来自 #336699 对应约定色阶，任何 frame 不含 #6965db；errors=0。
- 微信 Peekit：selector=#a6-04、各 #a6-04-*-canvas、#a6-probe；action=setBrandColor(#336699) 并切 light/dark；events=每图各一次 render；rect=不变；computed=Canvas stroke/fill/gradient 色阶与 H5 语义相同且无 #6965db 回退；errors=0。

### A6-05 P1：主题或品牌运行中变化不会触发静态 Canvas 重绘

- 类别：受控状态、暗色模式、颜色。
- H5 影响：DOM 主题类与文本立即变化，但 effect=none 或动画停止的 Canvas 保留旧色，形成同页两套主题；默认持续动画会偶然刷新，反而掩盖缺陷。
- 微信影响：brandStyleVars 更新后静态画布不变，切换暗色会出现中心文字、网格和背景对比错误。
- 精确证据：component-detail/index.vue:18、26-31 提供真实 toggleTheme；theme-store.ts:182-204 暴露响应式 theme/brandColor。七个 Canvas 组件的 watch 仅枚举 data/自身 props，例如 pie.vue:315-380、area.vue:320-345；useChartCanvas.ts:617-639 也不订阅主题。
- 根因：Canvas 绘制依赖未被建模为 Vue 依赖，只有 render 函数执行时才重新解析颜色。
- 最佳修复层：共享 chart theme composable。暴露响应式 palette/version，主题或品牌变化时所有已 ready 图只重绘一次；不要靠持续 rAF 刷新。
- H5 Peekit：selector=#a6-05、#a6-05__canvas、#a6-probe；action=effect=none 下 light→dark→自定义品牌；events=每步恰好一次 theme-render，无 hoverChange；rect=前后相等；computed=背景/标签 computedStyle 与 Canvas 探针同时切换，三帧稳定 hash 相同；errors=0。
- 微信 Peekit：selector=#a6-05、#a6-05__canvas、#a6-probe；action=页面主题状态切换并等待 nextTick+rAF；events=一次 render；rect=不变；computed=ctx 色值与 brandStyleVars 的主题语义一致，非旧帧；errors=0。

### A6-06 P1：Pie 大部分视觉 props 不在 watch 中，Demo 用随机改 data 掩盖

- 类别：响应式 props、尺寸、交互。
- H5 影响：保持 data 引用不变时修改 height、padding、donut、donutWidth、showTrack、tooltip、showCenterText、centerTitle、highlightPulse，不会可靠重绘；height 还叠加 A6-02 的 backing size 问题。
- 微信影响：控制面板看似更新 prop，但 Canvas 可保持旧环厚、旧中心文案、旧 track 或旧 tooltip。
- 精确证据：pie.vue:315-328 只 watch data；330-372 只管理 autoTooltip/interval/always/defaultIndex/原数组 length；375-380 只 watch ready。chart-pie.props.ts:20-64 暴露上述视觉 props。chart-pie-demo.vue:92-109 监听几乎所有控件后调用 randomize，使 data 改变并触发唯一的重绘 watcher。
- 根因：组件没有完整 render-dependency 清单，示例用无关数据突变补偿缺失响应。
- 最佳修复层：Pie 组件，最好抽成 computed render signature；纯视觉变化 scheduleRender，几何/height 变化走 resize+render，data/入场配置变化才重启动画，tooltip=false 同时清状态和 timer。
- H5 Peekit：selector=#a6-06、#a6-06__canvas、.lk-chart__tooltip、#a6-probe；action=固定 data，依次切 donut、donutWidth 20→48、showTrack、centerTitle、tooltip、height 240→320；events=无数据事件，每项一次 render，tooltip 关闭后 hoverChange=-1 至多一次；rect=height 最终 320 且 canvas 等于 wrapper；computed=命令探针分别反映 fill/arc thickness/track/text，data JSON hash 不变；errors=0。
- 微信 Peekit：selector=#a6-06、#a6-06__canvas、.lk-chart__tooltip、#a6-probe；action=setData 只改各 prop，不改数据数组；events=与 H5 同契约；rect=height 与 node backing 同步；computed=Canvas 命令签名逐项改变、数据 hash 不变、tooltip 关闭后节点消失；errors=0。

### A6-07 P1：Pie 过滤数据后丢失源索引，事件索引与 props.data 不一致，自动轮播还捕获旧长度

- 类别：数据身份、事件、空/NaN、定时器。
- H5 影响：数据 [无效,A,无效,B] 点击 A/B 发出 0/1，而调用方通常按 props.data 取值会取错项。
- 微信影响：触摸命中同样回报过滤后索引；同长度数组内某值由有效变无效时，旧 interval 闭包仍按旧有效长度轮播，可能发越界索引。
- 精确证据：chart-pie.utils.ts:67-69 直接 filter 并丢下标；pie.vue:118 使用过滤数组绘制，417-426 命中后直接 emit 过滤索引。自动 watcher 依赖原数组 length（337），但闭包捕获过滤后 len（344-363）；有效性变化不改变原 length。
- 根因：归一化模型没有 sourceIndex/stable key，timer 依赖也不是规范化数据签名。
- 最佳修复层：Pie data normalization。输出 {item,sourceIndex,key}，绘制、defaultIndex、hoverChange 明确以源索引为公共契约；timer 基于规范化 key/length 响应式重建。若决定公开“有效切片索引”，必须更名事件并把映射一起返回，不能模糊。
- H5 Peekit：selector=#a6-07、#a6-07__canvas、#a6-events；action=数据 [0,A,NaN,B]，按几何中心点击 A/B，再原位把 A.value 设 0 并等待两个 interval；events=A/B 分别为源索引 1/3，变化后只出现 3；rect=命中点在 canvas rect 内；computed=探针 slice keys 与事件 sourceIndex 一致，无无效扇区；errors=0。
- 微信 Peekit：selector=#a6-07、#a6-07__canvas、#a6-events；action=touchstart/touchend 两扇区并同长度修改有效性；events=1、3，之后 timer 只发 3；rect=触点换算后落在目标扇区；computed=规范化条目保留 sourceIndex，timerCount=1；errors=0。

### A6-08 P1：Bar/Line/Pie 的自动 Tooltip watcher 漏掉 tooltip，关闭后 timer 可继续运行

- 类别：交互、资源清理、受控状态。
- H5 影响：autoTooltip=true 时把 tooltip 改为 false，依赖数组不变，interval 不会清理；后台仍更新索引、触发 pulse/动画或发事件。
- 微信影响：隐藏提示后仍有定时任务和事件，页面留存时耗电；快速切页更容易与下一次渲染竞争。
- 精确证据：bar.vue:311-352、line.vue:381-420、pie.vue:330-372 的回调内部都检查 props.tooltip，但依赖数组都没有 props.tooltip。
- 根因：资源生命周期由手写不完整依赖数组驱动，三个组件复制了同一模式。
- 最佳修复层：抽共享 useChartAutoTooltip；依赖 enabled=tooltip && autoTooltip、有效数据 signature、interval、defaultIndex，watch cleanup 和 onScopeDispose 统一清 timer/动画/hover。
- H5 Peekit：selector=#a6-08-bar/#a6-08-line/#a6-08-pie、各 tooltip、#a6-events/#a6-probe；action=开启 autoTooltip 等待一次，再 tooltip=false 等待至少 2×interval；events=关闭后不再新增 hoverChange；rect=tooltip 节点不存在且三图 rect 不变；computed=activeInterval=0、activeAutoAnimation=0；errors=0。
- 微信 Peekit：selector=#a6-08-bar、#a6-08-line、#a6-08-pie、各 .lk-chart__tooltip、#a6-events、#a6-probe；action=setData tooltip=false 后跨两个周期并切出/切回页面；events=关闭后计数不变；rect=tooltip 节点 null；computed=fixture timer registry=0、无遗留 rAF；errors=0。

### A6-09 P1：Line 量程用归一化值，点位却重新读原始 NaN/Infinity

- 类别：NaN、几何、Canvas 兼容。
- H5 影响：量程把非有限数当 0，但 build points 用原始 item.value，得到 NaN y/v；bezierCurveTo、arc、tooltip 可接收非有限参数并导致整条路径消失或异常。
- 微信影响：不同 Canvas 实现对 NaN 的容忍不同，可能静默丢图、报错或污染后续 path，形成明显跨端差异。
- 精确证据：chart-line.utils.ts:119-120 把非有限值归零；line.vue:158-160 用该数组算 range；chart-line.utils.ts:236-250 又从 options.data 的原值计算 y。tests/unit/lk-chart-line.spec.ts:50-55 只单测 normalization，85-95 的 build points 只传有限数，未串起真实管线。
- 根因：数据规范化不是单一真源，范围与几何各自读取不同表示。
- 最佳修复层：Line utils。一次生成带 valid/value/sourceIndex 的 normalized points；明确无效值是 gap、过滤还是 0，并让 range、path、tooltip、事件全部消费同一模型。推荐 gap 而不是伪造业务 0。
- H5 Peekit：selector=#a6-09、#a6-09__canvas、#a6-events、#a6-probe；action=注入 [10,NaN,Infinity,30]，移动指针跨四位置；events=只为可用点发源索引，gap 无伪 0；rect=canvas 非 0、路径不越界；computed=所有 ctx 数字参数 Number.isFinite=true，gap 策略与文档一致；errors=0。
- 微信 Peekit：selector=#a6-09、#a6-09__canvas、#a6-events、#a6-probe；action=相同数据和 touchmove；events=与 H5 相同；rect=可用点坐标在 plot rect 内；computed=命令探针无 NaN/Infinity，Canvas 后续正常绘制；errors=0。

### A6-10 P1：Bar 混合正负值没有零基线，NaN 又被画成真实 0

- 类别：数据语义、几何、坐标轴。
- H5 影响：[-10,0,20] 使用 min→max 比例后都从 plotBottom 向上长，0 也成为有高度柱，负值不在零线下；NaN 被静默变成 0，无法区分缺失与业务零。
- 微信影响：同样产生错误财务/指标语义，tooltip 还会把无效值报告为 0。
- 精确证据：chart-bar.utils.ts:127-129 非有限值→0；135-171 虽算含负值范围，却只返回比率。bar.vue:221-227 把 x 轴固定在 plotBottom，233-250 所有柱统一 bottom=plotBottom、height=ratio×innerHeight。tests/unit/lk-chart-bar.spec.ts:78-83 固化 NaN→0，却没有验证负值画法。
- 根因：scale 有 min/max，但布局模型没有 value=0 的 pixel baseline，也没有 invalid 状态。
- 最佳修复层：Bar scale/layout utils。计算 zeroY=scale(0)，正值从 zeroY 向上、负值向下；无效值作为 gap/invalid marker，不进 tooltip 为 0。axis 与柱共享 scale。
- H5 Peekit：selector=#a6-10、#a6-10__canvas、#a6-events、#a6-probe；action=渲染 [-10,0,20,NaN] 并依次 hover；events=前三项值准确，NaN 项不伪报 0；rect=负柱在 zeroY 下、正柱在上、0 高度≤1px、全部在 plot rect；computed=命令参数有限，axis zero tick 与柱基线同坐标；errors=0。
- 微信 Peekit：selector=#a6-10、#a6-10__canvas、#a6-events、#a6-probe；action=相同数据与触摸；events=同契约；rect=selector rect 非 0，探针 bounds 满足正负方向；computed=NaN 不产生 fillRect/path，tooltip 不显示 0；errors=0。

### A6-11 P1：入场、pulse 和自动游标共用一个 animRafId，后启动者取消前动画

- 类别：动画、交互竞争。
- H5 影响：Line animateHoverTo 先 triggerPulse，紧接着 animateTo(260)；第二次调用立即取消 pulse。自动 tooltip 也可能取消入场动画，表现随时序变化。
- 微信影响：帧率和计时差异使取消时点更不稳定，pulse 或入场经常缺失；Bar/Pie 的 pulse 与 intro 也共享同一通道。
- 精确证据：line.vue:97-123 在 110 调 triggerPulse、111 再调 chart.animateTo。useChartCanvas.ts:486-490 每次 animateTo 先取消唯一 animRafId；512-521 repeated 动画也取消同一 id。bar.vue、pie.vue 的 triggerIntro/triggerPulse 同样调用该单通道。
- 根因：共享适配器把所有独立动画语义压成一个互斥 rAF 槽。
- 最佳修复层：useChartCanvas 动画调度器。提供命名 channel 或独立 tween；intro、autoCursor、highlight 可组合，只有同 channel 新任务才取消旧任务。数据变化可显式取消 intro，卸载统一清理。
- H5 Peekit：selector=#a6-11-line/#a6-11-bar/#a6-11-pie、#a6-probe；action=入场中启动 autoTooltip 与 pulse；events=auto hoverChange 顺序完整；rect=游标/tooltip 始终落在图内；computed=intro progress 到 1、pulse 至少经历上升和回落、active channels 最终 0；errors=0。
- 微信 Peekit：selector=#a6-11-line、#a6-11-bar、#a6-11-pie、#a6-probe；action=相同竞争时序，低帧率节流场景再跑一次；events=不丢索引；rect=高亮 bounds 有效；computed=三个 channel 的 completed/cancelled 原因符合预期，无跨 channel cancel；errors=0。

### A6-12 P1：默认持续动画没有 reduced-motion、可见性暂停与稳定截图模式

- 类别：性能、动画、无障碍、测试稳定。
- H5 影响：Area/Radar/Ring/Sparkline 默认 premium 在入场后持续 rAF；页面隐藏、离屏和 prefers-reduced-motion 仍运行。StatCard 的 CSS 入场动画也无 reduced-motion。
- 微信影响：后台/隐藏 tab 中循环继续，移动设备耗电；视觉截图在任意相位采样，基线不确定。
- 精确证据：useChartCanvas.ts:512-550 的 animationRepeat=0 永不 onDone，562-584 的 startLoop 永久自调度，只有卸载停止。area.vue:310-317、radar-lite.vue:272-297、ring.vue:222-247、sparkline.vue:256-263 启动循环。stat-card.scss:14、56、122-143 无 reduced-motion。showcase-cases.ts:224-293 又把全部图 visualEnabled=true。
- 根因：运动策略分散到组件，缺少用户偏好、页面可见性、演练/截图确定性和离屏生命周期。
- 最佳修复层：共享 chart motion policy。H5 监听 matchMedia 与 visibility/IntersectionObserver；微信使用页面 show/hide 或组件 active 信号；reduced/audit 模式直接绘制最终静帧。animationRepeat=0 可保留为显式 opt-in，不应由验收载体默认启用。
- H5 Peekit：selector=#a6-12 .a6-chart、#a6-probe；action=开启 prefers-reduced-motion，切 document hidden/visible，连续采三次像素 hash；events=不产生业务事件；rect=不因停动改变；computed=reduced 下 activeRAF=0、三次 hash 相同，hidden 后循环计数停止；errors=0。
- 微信 Peekit：selector=#a6-12、#a6-probe；action=页面 onHide→等待两个 effectDuration→onShow；events=无伪 hover；rect=恢复后仍一致；computed=hide 时 frameCount 不增长、show 时按策略恢复且 audit 静态模式 frameCount 稳定；errors=0。

### A6-13 P1：交互只覆盖部分鼠标/触摸，没有键盘与可访问数据替代

- 类别：交互、键盘、无障碍、跨端。
- H5 影响：Area 与 Sparkline 只有 touch，无 mouse/pointer；所有 Canvas 图都不可聚焦、无 role/aria-label、无键盘点位浏览，屏幕阅读器无法获得数据。
- 微信影响：触摸可用但没有 accessibilityLabel/语义摘要；Ring/Radar 没有交互或数据替代，StatCard 内嵌趋势也不可读。
- 精确证据：area.vue:353-365、sparkline.vue:301-313 只绑定 touch。bar.vue:442-456、line.vue:509-523、pie.vue:451-468 有 mouse+touch，但模板仍无 tabindex、keydown、role、aria。radar/ring 模板只有 view+canvas（radar.vue:336-339、ring.vue:287-290）。
- 根因：Canvas 被当成纯视觉实现，没有统一输入模型和可访问内容契约。
- 最佳修复层：图表交互/a11y 公共 composable。H5 用 pointer events，方向键切点、Escape 清除；提供 aria-label/summary 或 visually-hidden 数据表/slot。微信绑定可访问 label，并保证触摸事件与 H5 事件载荷一致。纯展示 Ring/Radar 也至少暴露摘要。
- H5 Peekit：selector=#a6-13-area/#a6-13-spark/#a6-13-bar、各 [role=img] 与 #a6-events；action=mousemove、Tab、ArrowRight、Escape；events=pointer 与键盘产生相同源索引，Escape=-1；rect=焦点轮廓不裁剪且 tooltip 在图内；computed=tabindex=0、role=img、aria-label 含标题和关键数据、focus-visible 可见；errors=0。
- 微信 Peekit：selector=#a6-13 .a6-chart、#a6-events；action=touch 点位并读取 accessibilityLabel；events=与 H5 触点同索引、touchend 按契约清除；rect=点击目标在 canvas rect 内；computed=每图可访问 label 非空且包含数据摘要，隐藏表不影响布局；errors=0。

### A6-14 P1：文档声称 Tooltip 绘制在 Canvas 内，实际是 sibling view，微信原生层结论未经证实

- 类别：文档、嵌套/层级、微信兼容。
- H5 影响：文档让使用者误以为 tooltip 不受 DOM 层叠/overflow 影响；实际 sibling 的 z-index、裁剪和定位都需验证。
- 微信影响：Canvas/native layer 与普通 view 的覆盖关系正是风险点，现实现没有 cover-view 或 Canvas 内绘制，却宣称已规避。
- 精确证据：docs/components/chart-bar.md:38、chart-line.md:34、chart-pie.md:35 都写“绘制在 Canvas 内”。实际 bar.vue:453-456、line.vue:520-523、pie.vue:464-467 都是 canvas 后的 view.lk-chart__tooltip。
- 根因：文档沿用了未实现的架构结论，没有对应真机证据。
- 最佳修复层：先做真实 MP 门禁再选架构。若普通 view 不能稳定覆盖，改为 Canvas 内 tooltip 或经验证的 cover-view；若当前方案可覆盖，则文档按真实 sibling 层级、overflow 和限制改写。
- H5 Peekit：selector=#a6-14、#a6-14__canvas、.lk-chart__tooltip；action=hover 边缘点并置于有 overflow/z-index 的父容器；events=正确 hoverChange；rect=tooltip rect 与目标点相交且完全位于允许可视区；computed=position/z-index/pointer-events/transform 符合契约，elementFromPoint 命中可见 tooltip；errors=0。
- 微信 Peekit：selector=#a6-14、#a6-14__canvas、.lk-chart__tooltip；action=真机/模拟器 touch 中央与边缘扇区或点；events=索引准确；rect=tooltip 与 canvas 坐标换算正确、未被原生层遮挡；computed=节点类型/层级为最终选定架构且探针确认可见像素，不以截图单判；errors=0。

### A6-15 P1：verified、评分与截图链路不能证明运行态正确，且微信图表直接覆盖为 0

- 类别：测试、证据、发布状态。
- H5 影响：截图只证明某一时刻有像素，无法发现事件、timer、DPR、主题重绘和 NaN 参数；当前截图还在 Canvas 初始化后才改变 viewport。
- 微信影响：没有任何 chart 直接 miniprogram 用例，showcase 元数据却称 verified/低风险，容易把 H5 静态存在误当全平台通过。
- 精确证据：showcase-cases.ts:224-293 把八图全部设为 verified、visualEnabled，除 chart-lite 外均标 low。component-case.vue:40-44 永远渲染 empty-state，172-175 又无条件 display:none，因此 Demo 缺失也不会显露。tests/visual/screenshot.spec.ts:14-18 先导航等待，再 setViewportSize 后截图。dynamic-visual-showcase.spec.ts:4-27 只跟踪 chart-lite 聚合元数据和文案。OPEN_SOURCE_COMPONENT_SCORE.md:12 明说 verified 仅取元数据，却在 62、68-69、84-86、95-96 继续给图表 B/A 评分。tests/miniprogram 清单没有 chart 文件。
- 根因：状态是人工枚举而非证据产物；视觉、交互和平台矩阵没有形成可追溯门禁。
- 最佳修复层：测试与发布治理。verified 必须由最近一次 H5+微信 Peekit artifact 生成，artifact 含基线 SHA、scenario、selector、action、events、rect、computed、errors。截图先设置 viewport 再导航；Canvas 场景需等待明确 ready/stable 标志。删除无条件隐藏 empty 的做法，renderer 缺失直接失败。
- H5 Peekit：selector=[data-showcase=chart-area] 至八图、.empty-state、#a6-evidence；action=逐路由执行最小交互、故意在校验分支移除一个 renderer；events=artifact 记录预期事件，缺 renderer 时门禁失败；rect=每图 wrapper/canvas 非 0；computed=evidence SHA=当前 HEAD、viewport 在导航前为 390×844、ready/stable=true；errors=0 才可 verified。
- 微信 Peekit：selector=八个固定 id、#a6-evidence；action=逐组件直接场景执行 touch/主题/resize，不复用 chart-lite 代替；events=交互图事件逐项入账；rect=每图真实 query 结果；computed=artifact 标记 platform=mp-weixin、build SHA、Canvas node/DPR；errors=0，缺任一字段状态必须 non-verified。

### A6-16 P1：现有 Playground 完全不支持八图，无法进行确定性参数演练

- 类别：演练场、可测试性、文档载体。
- H5 影响：无法用 query 或固定状态直达边界场景，只能依赖带随机数据和持续动画的 Demo，不利于复现。
- 微信影响：无法在同一真实组件载体远程切换 NaN、负值、resize、主题、事件日志等场景，Peekit 也缺稳定 selector。
- 精确证据：preview-catalog.ts:389-459 已列出九个 chart 页面；playground/index.vue:5-29 只导入非图表组件，96-252 没有图表分支，254-258 对所有 chart 显示“暂不支持”。
- 根因：展示 Demo 与验收演练场混为一谈，图表没有确定性、可脚本化的状态入口。
- 最佳修复层：pages_sub/playground 的审计载体，不改发布 API。增加八图真实组件分支、固定 fixture、query scenario、事件日志、Canvas 探针、主题与尺寸控制；禁止 Math.random，所有场景可由 seed/JSON 重放。
- H5 Peekit：selector=#a6-playground、#a6-playground-chart、#a6-events、#a6-probe；action=打开 component=chart-line&case=nan，再切 case=resize；events=日志与场景契约匹配；rect=真实 .lk-chart 根与 canvas 非 0，页面不出现 unsupported；computed=fixture seed/data hash 固定、实际组件名 LkChartLine；errors=0。
- 微信 Peekit：selector=#a6-playground、#a6-playground-chart、#a6-events、#a6-probe；action=通过页面 query/setData 切 chart-bar/negative 与 chart-pie/index-map；events=各自日志隔离；rect=真实组件 node 非 0；computed=unsupported 节点不存在、probe 平台=mp-weixin 且 data hash 可重放；errors=0。

### A6-17 P1：自定义颜色虽宣称支持 Canvas 颜色，Area/Bar 的衍生透明色却只会解析 hex

- 类别：颜色、渐变、跨端兼容。
- H5 影响：Area 传 rgb()/rgba()/命名色时主线可用原色，但 area/高亮通过 rgbaFromHex 失败并回退黑色；Bar item.color 非 hex 时渐变顶部回退品牌紫、底部却仍是原色。
- 微信影响：不同 Canvas 对命名色支持本就不同，再叠加错误衍生色，渐变会黑/紫/原色混杂。
- 精确证据：chart-colors.ts:43-46 的 rgbaFromHex 解析失败固定 {0,0,0}。area.vue:91-94 原样返回 props.color，却在 156-170、190-192、258 用 rgbaFromHex。bar.vue:122-134 的 buildGradient 用 hexToRgb，失败固定 {105,101,219}，同时 stop 1 仍写 baseHex。相比 sparkline.vue:134-137 和 radar-lite.vue:190-191 已使用 rgbaFromColor。docs/chart-area.md:68、chart-lite.md:81 又宣称支持 Canvas 颜色。
- 根因：八图颜色管线未统一，部分组件仍假设所有用户色都是 hex。
- 最佳修复层：chart-colors.ts。建立 parseColor/withAlpha/mix 的统一契约，支持 hex/rgb/rgba；命名色若跨端不可可靠解析，应明确拒绝并回退整个颜色而非混搭。Area、Bar、Ring、Pie 全部消费同一函数。
- H5 Peekit：selector=#a6-17-area/#a6-17-bar、#a6-probe；action=依次传 #336699、rgb(51,102,153)、rgba(51,102,153,.8) 与命名色；events=无业务事件；rect=图形 bounds 不变；computed=每个 gradient stop 可追溯到输入色，绝不出现非预期 black/#6965db，命名色按文档的支持或一致回退执行；errors=0。
- 微信 Peekit：selector=#a6-17-area、#a6-17-bar、#a6-probe；action=同一颜色矩阵；events=无；rect=非 0；computed=命令探针色值与 H5 的规范化结果一致，createGradient/addColorStop 无非法值；errors=0。

### A6-18 P2：Bar/Line/Pie 文档 API 明显少于真实 props

- 类别：文档、API 可发现性。
- H5 影响：使用者不知道常驻/自动 tooltip、坐标标签、渐变、高亮等公开能力，也不知道哪些 prop 变更应响应。
- 微信影响：自动提示和原生层相关选项缺文档，无法按平台限制正确选型。
- 精确证据：chart-bar.md:18-27 只列 10 项，遗漏 gradient、tooltipAlways、defaultIndex、autoTooltip、autoTooltipInterval、showXAxisLabel、highlightPulse。chart-line.md:18-23 更遗漏 gradient、areaGradient、全部 auto/always/default、axis 与 highlight。chart-pie.md:18-24 遗漏 showTrack、全部 auto/always/default、showCenterText、centerTitle、highlightPulse。对应 props 文件 bar:11-70、line:10-68、pie:11-63 均公开这些字段。
- 根因：文档手写且没有从 prop schema 校验，功能新增后表格未同步。
- 最佳修复层：文档工具链。由 props schema 生成或在 CI 比对名称、类型、默认值；补充索引语义、无效数据、负值、动画、可访问性和平台差异。
- H5 Peekit：selector=#a6-18-doc-bar/#a6-18-doc-line/#a6-18-doc-pie、对应真实 Demo；action=从文档 API 控件逐项切换 always/auto/axis/gradient；events=文档声明与实际 hoverChange 一致；rect=示例和 tooltip 不溢出；computed=文档提取 prop 集合=代码 prop 集合减去明确公共项；errors=0。
- 微信 Peekit：selector=三份直接 Demo 的固定 id；action=按同一文档步骤操作每个跨端 prop；events=与文档完全一致；rect=Canvas/tooltip 合法；computed=运行时默认值与表格默认值相等；errors=0。

### A6-19 P2：chart-lite 聚合文档仍称子图复用聚合 Demo，事件契约也绕过直接文档

- 类别：文档散乱、测试覆盖、聚合关系。
- H5 影响：独立页面与聚合说明互相矛盾，维护者不清楚哪个 Demo/文档才是发布真源。
- 微信影响：只验聚合页会遗漏四个子图独立路由、独立尺寸和直接导入问题。
- 精确证据：chart-lite.md:204-215 仍称子组件由聚合 dynamic visual 覆盖，215 明说当前 Demo/showcase 复用 chart-lite；但 chart-ring.md:21-23、chart-sparkline.md:56-58、chart-stat-card.md:10-12、chart-radar-lite.md:52-54 都说已经使用独立 Demo。PreviewDemoRenderer.vue:107-110 与 showcase-cases.ts:260-293 也确有独立入口。lk-events-contract.spec.ts:10-15、153-156 却仍把四个直接文档 alias 到 chart-lite；dynamic-visual-showcase.spec.ts:4-27 也只列 chart-lite。
- 根因：拆分独立入口后，聚合文档与测试别名没有迁移，形成两套事实。
- 最佳修复层：docs/tests。chart-lite 只保留组合示例与子页链接；删除四个 docAliases，事件契约读取直接文档；视觉矩阵既测独立八图，也可额外测聚合组合。
- H5 Peekit：selector=#a6-19-ring/#a6-19-spark/#a6-19-stat/#a6-19-radar；action=分别从四份直接文档路由打开并执行各自最小场景；events=Sparkline direct doc 的 hoverChange 被契约检查，其余按文档无自定义事件；rect=四个独立 Demo 均非 0；computed=路由 slug 与实际 renderer 一一对应；errors=0。
- 微信 Peekit：selector=#a6-19-ring、#a6-19-spark、#a6-19-stat、#a6-19-radar；action=分别进入四个 direct preview，不经过 chart-lite；events=Sparkline 记录 hoverChange，其余按直接文档记录无自定义事件；rect=四个独立组件及 Canvas 均非 0；computed=每份证据独立记录且 artifact sourceDoc 不得为 chart-lite；errors=0。

### A6-20 P2：Demo 的参数控制会随机改数据，既不可重放又掩盖响应式缺陷

- 类别：Demo、随机性、客观验证。
- H5 影响：切换视觉 prop 同时得到新数据，无法判断画面变化来自 prop 还是数据；截图和问题复现不稳定。
- 微信影响：每端 Math.random 序列不同，不能做相同输入的跨端比较。
- 精确证据：bar-demo.vue:66-67、line-demo.vue:64-65、pie-demo.vue:59-60 用 Math.random；其 watchers 分别在 91-109、89-107、92-108 监听几乎所有控件并调用 randomize。Pie 因而掩盖 A6-06。area-demo.vue:24/26 将 defaultIndex=5、activeIndex=-1，85-89 的 Current 初始却回退到最后一个点，图上默认高亮与摘要不一致；109-116 的随机按钮也不可重放。
- 根因：Demo 把“制造视觉变化”当成“验证单变量响应”，没有 seed 与状态日志。
- 最佳修复层：Demo/演练场。控件只改变自身变量；数据更新是独立按钮，使用固定样例或可见 seed；输出 data hash、active index、事件日志。Area 初始摘要应与 defaultIndex 同一真源。
- H5 Peekit：selector=#a6-20-controls、#a6-20-chart、#a6-events、#a6-probe；action=相同 seed 运行两次，单独切 donut/gradient，再点“更新数据”；events=视觉 prop 不产生数据事件，更新才改变 data hash；rect=重复运行相同；computed=两次像素/命令 hash 相同，Area Current 与 defaultIndex 对应值相同；errors=0。
- 微信 Peekit：selector=#a6-20-controls、#a6-20-chart、#a6-events、#a6-probe；action=使用相同 seed 和动作序列；events=与 H5 日志相同；rect=容差内一致；computed=data JSON hash 与 H5 相同，禁止运行时 Math.random；errors=0。

### A6-21 P2：八图继承了 throttle/debounce/animation/teleport/zIndex 等无效公共 props

- 类别：代码冗余、API 散乱。
- H5 影响：类型提示允许这些 props，但组件不消费；使用者以为 zIndex、animation 等会生效，实际静默无效。
- 微信影响：无效 teleport 尤其会制造错误平台预期；zIndex 无法解决 Canvas tooltip 层级。
- 精确证据：common/props/index.ts:5-68 的 baseProps 包含 id、customClass/customStyle、throttle、debounce、animation、teleport、zIndex。八个 chart props 文件都 spread baseProps，例如 area props:8、bar:11、line:10、pie:11、radar:12、ring:12、sparkline:8、stat:16；模板只实际消费 id/class/style 的一部分，没有消费后五项。
- 根因：过宽 baseProps 被机械复用，没有按组件能力裁剪或实现。
- 最佳修复层：公共 props 架构。拆 visualBaseProps/interactiveBaseProps/overlayBaseProps，图表只继承真实支持字段；若 zIndex 是 tooltip 必需能力则明确绑定并文档化，不保留静默假 API。
- H5 Peekit：selector=#a6-21、.lk-chart__tooltip；action=按最终 API 传 customClass/customStyle/id 及允许的 zIndex；events=无未知 fallthrough 警告；rect=样式按文档生效；computed=公开 prop manifest 不含未实现字段，允许字段的 computedStyle 可观测；errors=0。
- 微信 Peekit：selector=#a6-21；action=同一公开 prop 集合编译并渲染；events=无多余事件；rect=自定义尺寸/类有效；computed=组件 JSON/WXML 与 runtime props 不含未实现 teleport/throttle 等，或实现项确实生效；errors=0。

### A6-22 P2：数字 props 没有统一有限数/范围约束，负线宽和超大厚度可进入 Canvas

- 类别：边界、宽高、兼容。
- H5 影响：负数、Infinity、小数 ticks/levels 等会产生非法 lineWidth/arc、超界 stroke 或极端循环；不同图的 clamp 行为不一致。
- 微信影响：Canvas API 对负 lineWidth、负半径和非有限数的报错/忽略策略不同，平台差异被放大。
- 精确证据：common/props/index.ts:130-133 的 LkProp.number 只有 type/default，没有 validator/normalizer。area.vue:120-125、sparkline.vue:114-119 对 padding 有部分 clamp，却直接使用 lineWidth。radar.vue:97 把 lineWidth clamp≥1；ring.vue:98 clamp≥2。chart-pie.utils.ts:89-99 只把 donutWidth clamp≥2，不限制到 radius，过厚 stroke 仍可能裁剪。各 props 文件公开大量无范围 number。
- 根因：数值边界散落于 renderer，没有共享有限数和几何范围策略。
- 最佳修复层：chart numeric utils + props 文档。所有数值先 finite normalization；padding、stroke、donutWidth、ticks、levels、duration、interval 分别按语义 clamp/round，开发态警告但生产稳定降级。
- H5 Peekit：selector=#a6-22 .a6-chart、#a6-probe；action=矩阵传 -1、NaN、Infinity、0.5、超大值到 padding/width/ticks/duration；events=不产生伪业务事件；rect=所有绘制 bounds 位于 canvas，组件盒非负；computed=所有 ctx 参数有限、lineWidth≥0、循环次数有上限；errors=0。
- 微信 Peekit：selector=#a6-22 .a6-chart、#a6-probe；action=相同 fuzz 矩阵；events=无；rect=非 0 或明确 empty fallback；computed=命令参数有限且与 H5 归一化结果一致；errors=0。

### A6-23 P2：Pie/Ring 的 Canvas 文案硬编码英文，只有 StatCard 接了 locale

- 类别：i18n、文档、跨端一致性。
- H5 影响：中文页面中 Pie 默认显示 Total，Ring 显示 Total/Progress/Completed，与 StatCard 本地化趋势文案混用。
- 微信影响：切换 locale 后 Canvas 内文字不会变化；静态图又不会因 locale 改变自动重绘。
- 精确证据：chart-pie.utils.ts:214-225 默认 title='Total'。chart-ring.utils.ts:23-40、61-65 硬编码 Total、Progress、Completed。stat-card.vue:12、17、33-38 已通过 useLocale('chartStatCard')。i18n-preview/index.vue:7、127 只预览 StatCard。useLocale.ts:4-25 已提供 locale 依赖。
- 根因：Canvas 文本绕过 locale 层，图表 namespace 不完整。
- 最佳修复层：locale + 图表组件。增加 chartPie/chartRing 翻译键，默认文案从 useLocale 获得，locale 变化触发静态重绘；显式 title/subtitle 仍优先。
- H5 Peekit：selector=#a6-23-pie/#a6-23-ring、#a6-probe；action=zh-Hans→en→ja，保持数据与 props 不变；events=每次 locale 一次 render、无 hover 伪事件；rect=中心文本不越环；computed=fillText 文案属于当前 locale，三次切换无旧英文残留；errors=0。
- 微信 Peekit：selector=#a6-23-pie、#a6-23-ring、#a6-probe；action=Locale.use 切换并等待重绘；events=同契约；rect=文字 bounds 在中心；computed=Canvas 探针文案与 H5 同 locale 词条一致；errors=0。

### A6-24 P2：Bar/Line 坐标轴颜色硬编码，绕过已有图表语义 token

- 类别：颜色搭配、暗色、可读性。
- H5 影响：亮暗主题都使用同一 slate rgba，不能跟随 --lk-chart-grid/label，暗色对比度和品牌定制不可控。
- 微信影响：页面虽内联主题变量，Canvas 仍固定同一颜色；用户无法通过文档声明的图表 token 覆盖。
- 精确证据：bar.vue:42-44 与 line.vue:36-38 硬编码三组 rgba，并在 bar:202-223/273、line:203-224/340 使用。component-vars.scss:540-544 已定义 --lk-chart-track、grid、label、center text，却没有被两图轴线消费。
- 根因：Bar/Line 早期实现保留局部常量，未接共享 semantic palette。
- 最佳修复层：共享图表 theme palette。网格、轴、标签全部从 JS theme semantic colors 解析，H5 CSS 可覆盖、微信由同一主题对象注入；增加对比度门禁。
- H5 Peekit：selector=#a6-24-bar/#a6-24-line、#a6-probe；action=light/dark 和覆盖 --lk-chart-grid/label；events=每次一次 render；rect=轴标签在 plot/label 区内；computed=ctx colors 等于覆盖值，文本对背景对比度满足约定阈值；errors=0。
- 微信 Peekit：selector=#a6-24-bar、#a6-24-line、#a6-probe；action=切主题和页面级语义色配置；events=一次 render；rect=标签不裁剪；computed=Canvas 色值与 H5 语义输入相同、无固定 rgba(148,163,184,...)；errors=0。

### A6-25 P2：Pie 的 highlightPulse 仅在 donut 分支绘制，普通饼图开关无效果

- 类别：交互反馈、API 一致性。
- H5 影响：donut=false 时 hoverChange 和 timer 正常运行，但 highlightPulse 不产生任何扇区高亮，用户只看到外部 tooltip。
- 微信影响：触摸反馈更依赖图形高亮，普通饼图缺反馈容易被认为未命中。
- 精确证据：pie.vue:205-213 只在 donut 分支画 pulse stroke；238-255 的普通扇区循环没有 effectiveIndex/highlightPulse 分支。chart-pie.props.ts 仍把 highlightPulse 作为无条件公开 prop。
- 根因：新增非 donut 渲染分支时没有实现同一交互状态，也没有把 prop 限制写进文档。
- 最佳修复层：Pie renderer。普通饼图对活动扇区做一致且不过度的描边/位移/alpha，高亮不改变命中几何；若产品明确不需要，则仅在 donut 模式公开或文档化，timer 也不应做无效 pulse。
- H5 Peekit：selector=#a6-25、#a6-25__canvas、#a6-probe；action=donut=false、highlightPulse=true，hover 同一扇区并与 false 对照；events=两组同一 sourceIndex；rect=扇区仍在原 chart bounds；computed=true 时活动扇区命令/像素有可测差异，false 无 pulse；errors=0。
- 微信 Peekit：selector=#a6-25、#a6-25__canvas、#a6-probe；action=touch 普通扇区，切 pulse on/off；events=索引一致；rect=触点命中不因高亮位移改变；computed=探针有明确 active overlay 且不越界；errors=0。

### A6-26 P2：八图没有统一空/无效数据状态，Ring 甚至伪造 Total=0

- 类别：空状态、UI 合理性、数据语义。
- H5 影响：Bar/Line/Pie/Area/Sparkline/Radar 多数只留下空白盒；StatCard showChart=true+data=[] 仍保留空图区域；Ring 全无效 segments 被替换为 Total=0，像真实业务数据。
- 微信影响：空白 Canvas 难区分加载失败、无数据和渲染错误；伪造英文 Total 又叠加 i18n 问题。
- 精确证据：bar.vue:189-191、pie.vue:128-136、area.vue:125-128、sparkline.vue:119-123 在无数据时只 return/hide tooltip。chart-ring.utils.ts:29-31 在全无效时返回 [{label:'Total',value:0}]。stat-card.vue:62-75 只由 showChart 决定图表区域，不判断 data。各直接文档未定义 empty/invalid 策略。
- 根因：每个 renderer 自行降级，没有发布级 empty contract、slot 或状态语义。
- 最佳修复层：图表公共空状态协议。区分 empty、all-invalid、zero-valid；提供轻量 empty slot/aria summary，默认不伪造业务数据。StatCard 可不保留空图高度或显示明确占位，行为需文档化。
- H5 Peekit：selector=#a6-26 .a6-chart、.lk-chart-empty、#a6-probe；action=依次 []、全 NaN、全 0；events=无 hover 或统一 -1；rect=empty 占位居中且不溢出，zero-valid 仍画合法零态；computed=aria/status 文案区分 empty/invalid/zero，无合成 Total 数据；errors=0。
- 微信 Peekit：selector=#a6-26 .a6-chart、.lk-chart-empty、#a6-probe；action=相同三状态；events=同契约；rect=占位与组件高度合理；computed=accessibilityLabel 与状态一致、Canvas 命令量符合 empty/zero 策略；errors=0。

### A6-27 P2：StatCard 无法把 effectDuration 等 Sparkline 配置透传，组合 API 不闭合

- 类别：嵌套、组合、动画配置。
- H5 影响：StatCard 暴露 chartEffect 与入场动画参数，却不能配置 effectDuration；premium 内嵌图始终继承 Sparkline 2400ms，使用者无法与看板运动节奏同步。
- 微信影响：组合组件中的持续动画无法单独调节或关闭周期，测试也难等待稳定点。
- 精确证据：chart-stat-card.props.ts:39-49 只有 chartLineWidth、chartAnimationDuration、chartAnimationRepeat、chartEffect，没有 chartEffectDuration。stat-card.vue:63-73 透传上述字段但没有 effect-duration。chart-sparkline.props.ts:29-39 公开 animation/effect/effectDuration，默认 effectDuration=2400。StatCard 的 showChart=true 又默认创建这个内嵌持续动效。
- 根因：组合组件手工复制部分子组件 API，缺少显式 pass-through contract。
- 最佳修复层：StatCard API。增加 chartEffectDuration，或提供受类型约束的 chartProps（禁止覆盖 data/height 等已托管字段）；默认运动策略与 A6-12 一致。文档明确哪些子图能力被托管。
- H5 Peekit：selector=#a6-27、#a6-27 .lk-chart-sparkline、#a6-probe；action=effectDuration 600→2400、effect none；events=StatCard 不冒泡内部 hover；rect=内嵌图保持 chartHeight；computed=frame phase 周期匹配传入值，none 后 activeRAF=0；errors=0。
- 微信 Peekit：selector=#a6-27、#a6-27 .lk-chart-sparkline、#a6-probe；action=setData 修改组合配置；events=无意外事件；rect=内嵌 Canvas 与容器等高；computed=probe duration/effect 为父级输入且卸载后 loop=0；errors=0。

### A6-28 P2：八图共享概念命名与能力矩阵不一致，难以形成稳定跨图 API

- 类别：API 设计、代码散乱、维护性。
- H5 影响：Bar/Line/Pie 只有 animationDuration，Area 有 effect 但无 animationRepeat，四个 lite 图又有 repeat/effect/effectDuration；交互、颜色、空态和 index 语义也不统一，替换图型成本高。
- 微信影响：相同 prop 名在不同图上的平台行为不同，统一演练与文档难以复用。
- 精确证据：八份 props 文件显示三套模型：bar props:35-67、line:34-68、pie:35-63；area props:27-39；radar/ring/sparkline/stat-card 各自 repeat/effect。height 默认值从 112 到 320；只有 Area/Bar/Line/Pie/Sparkline 发 hoverChange，Ring/Radar 静态，StatCard 组合。公共 id、颜色和 invalid 策略又存在前述差异。
- 根因：组件按批次独立演进，没有先定义 chart family 的公共能力/可选能力 schema。
- 最佳修复层：图表公共类型与文档架构，而不是强行让所有图功能相同。定义 ChartBaseProps（id/size/theme/motion/a11y/empty）、ChartInteractiveProps、ChartAutoTooltipProps；每图显式声明能力矩阵与合理例外，生成 API 文档和验收场景。
- H5 Peekit：selector=#a6-28-manifest、八个 #a6-28-*；action=通过统一 controls 改 height/theme/motion，再只对 interactive 图执行 hover/keyboard；events=能力矩阵声明的图才发事件且 payload schema 一致；rect=统一 height 输入产生一致盒模型；computed=运行时 manifest=类型/文档 manifest，例外有 reason；errors=0。
- 微信 Peekit：selector=#a6-28-manifest、八个 #a6-28-*；action=相同 manifest 驱动场景；events=与 H5 能力矩阵一致；rect=同一尺寸规则；computed=公共 props 的默认值和归一化跨端相同，unsupported capability 不被静默接受；errors=0。

## 最佳修复顺序

1. 先修共享运行时：A6-01、A6-02、A6-03、A6-11、A6-12。否则组件级修复仍会被旧调度、旧 rect 和动画竞争污染，运行证据也不可信。
2. 再修共享主题与数据协议：A6-04、A6-05、A6-17、A6-22、A6-24，并建立 finite/sourceIndex/empty/color/theme 单一真源。
3. 修高风险组件逻辑：A6-06 至 A6-10、A6-25、A6-27，优先 Pie 的响应式/索引/timer，随后 Line NaN 与 Bar 正负基线。
4. 补公共交互与产品语义：A6-13、A6-14、A6-23、A6-26、A6-28。
5. 最后重做证据载体：A6-15、A6-16、A6-18 至 A6-21。Demo 改成确定性后，执行八图各自 H5+微信 Peekit，不得再用 chart-lite 聚合或单元测试替代直接证据。

每一批修复应使用独立 worktree 和独立分支，仅暂存该批文件；先在组件库/共享层修真实根因，确认组件默认行为正确后再改 Demo、文档和状态元数据。

## 合理特例

- H5 与微信在字体度量、抗锯齿、渐变插值上允许小幅像素差异，但数据 identity、事件序列、几何方向、tooltip 可见性、rect、DPR 与错误数不能放宽。像素门禁应使用有解释的容差，不接受整图无限扩大阈值。
- Canvas backing width/height 随 DPR 不同是正确行为；必须比较 backing=CSS rect×DPR，而不是要求两个端物理像素相等。
- Ring、Radar 保持纯展示且不发点击事件可以是合理产品选择，但必须在能力矩阵、文档和可访问摘要中明确，不能靠“没有实现”形成隐式差异。
- Pie 过滤非正/非有限值可以是合理数据策略，但必须保留 source identity 并文档化；不能把过滤后数组下标伪装成源数据下标。
- animationRepeat=0 表示显式无限循环可以保留；必须尊重 reduced-motion、页面隐藏和卸载清理，且确定性验收不得默认选择无限循环。
- StatCard 作为组合组件不必暴露 Sparkline 的每一个内部 prop，但被省略项必须有稳定默认、可关闭并在文档列出；不能出现父 API 暗示可控而实际无法控制的运动。

## 整体验收出口

全部修复后才进行一次不受单项截图“看起来正常”影响的整体确认：

1. 固定 HEAD、H5 viewport、微信基础库、设备 pixelRatio、locale、theme、brand、seed 和 motion policy。
2. 八图分别执行 direct fixture；聚合 chart-lite 只做额外组合回归。
3. 每图至少覆盖：默认、空、全无效、零、负值或过滤（适用时）、动态 props、动态 size/DPR、light/dark/custom brand、交互/键盘（适用时）、hide/show、unmount。
4. 每场景保存 selector、action、events、rect、computed/Canvas probe、errors 和辅助截图；结构化断言失败即失败，禁止用截图覆盖错误。
5. 三次重复运行的确定性场景应得到相同数据 hash、事件日志、命令 hash；像素只允许合理平台容差。
6. 所有 interval/rAF/observer/listener 在场景结束后为 0；console/pageerror/微信运行时错误为 0。
7. 只有 H5 与微信 direct artifact 都齐全时才把对应 showcase 状态设为 verified，并让评分从 artifact 推导。

## 文件、物理行与 SHA256 总账

格式为 物理行数 | SHA256 | 仓库相对路径。报告文件本身是审计产物，不计入输入分母。

```text
96|8a350d15deb1ce94d3ad4d4e7dfd3e86a7391fae46fed1acb44f33052c2e906b|docs/components/chart-area.md
40|58ea56123015d9cb9b6714c622f7af37447bb1e606fb679fa8dddeabd5dabe7e|docs/components/chart-bar.md
36|ef96e5e86b6fca936f0069cc79afc0170e16b8720897196d2c33e48c4136ce4b|docs/components/chart-line.md
215|cc9cfc716ab80ada49be4c8b49c519b8f2568c017dd9cac9a2f8007768ba5ed3|docs/components/chart-lite.md
37|4a63ee1f2de4ce249322975bf15a75623090db38d9d326bc36575d113c33063e|docs/components/chart-pie.md
98|57e24e4428f7d6dfa500317246d739cba1a8580e58fe10e1ee8f89beb09f7c75|docs/components/chart-radar-lite.md
91|d0d614592222c3898c7c8d55fa22868d282af75a0ef33018ccaf6ab509dce1b6|docs/components/chart-ring.md
101|37983747ce2ead75d9a8b37a1895918d745b75962199fb1fd16049b781167249|docs/components/chart-sparkline.md
109|fe37dfc7fcd2017f521b0852c059622ad0df64deff5577f93803cdb077e5816c|docs/components/chart-stat-card.md
130|c17b49f10a4b58e8e77d5b018c0e22a76f042ad5f65d1b6ac70a532c34a8e3d2|docs/components/index.md
139|270cdc3c817d94b0d0740d065d2b8e86f17dddf2d922c6fdb936b768ee1ef227|docs/OPEN_SOURCE_COMPONENT_SCORE.md
347|da53f34f37cf9a4e53e14e048ad4a843bb9afd871af53dae9cdcd432bc2fc911|src/components/demos/chart-area-demo.vue
341|2b64fac4f44f18d0a6ac585f2ac25478fc4bd56ce15fbaf8bff43c2bea64c983|src/components/demos/chart-bar-demo.vue
337|2e313797bca1d4c7bf07731c1625c14b0e9243bb4158622e80d9dd31195da21d|src/components/demos/chart-line-demo.vue
793|fa1d426d9469dfec2dc31fa6d08c7690f6f5d62de5390331ed38ea812ba0b07e|src/components/demos/chart-lite-demo.vue
350|fbb97a546790bdf16e89fa5c9085c93dcec8e161c72436d7a0965c9f4eef4023|src/components/demos/chart-pie-demo.vue
163|da44bb24004c4939931330a8309dfbded3a23995b9f62d2a1ec75d3d036a40f6|src/components/demos/chart-radar-lite-demo.vue
165|560df440f6978fd22f704aafd6b294bfb48e61f8fc47b10a483c285ce297cee8|src/components/demos/chart-ring-demo.vue
189|81d78767dd79a0a515022f1f88dafb3da8512e59f8a9458124dab4b2cfb910f8|src/components/demos/chart-sparkline-demo.vue
141|307233b0c5ca88469cfdc8fb3ad59485afa74a0529b8d396ccaa05736371420b|src/components/demos/chart-stat-card-demo.vue
684|967afcad48654589aeae4de9e49f80bb2c912e3d4fed8b70a39c40d03f28ed52|src/components/preview/preview-catalog.ts
85|2a7b9ca6a53344c4b5b6d5723886ca0e197479c2ba9c51beeab4371939f45a5d|src/components/preview/preview-demo-registry.ts
167|384ebd26037ad17260d3e1e9075e848ba51fefed6e76a76ebe5fc028f36da297|src/components/preview/PreviewDemoRenderer.vue
182|058fedfe129ccf84158163128b94923ace9ed82bfa3d100ff7d3abc4d87b6cad|src/components/showcase/component-case.vue
664|ab131d0afac2823dae26d1ce783136c16417c0aaa34e5abe8dfec6bef6dc032f|src/components/showcase/showcase-cases.ts
273|2d585a5bdb2207fd56ad1bbb3d1d5987c2d1e47bf2d0fc592930707272f5cf0f|src/pages_sub/component-detail/index.vue
257|5c51d7e11b1d2dd936236151a5916897089f07d179b8e34fa4754d83aed70ef6|src/pages_sub/i18n-preview/index.vue
303|7827193da2343621e7fb21e7cd586390e115a44ea16383163d583a303ab90389|src/pages_sub/playground/index.vue
301|9650fdb2050e05c413450ae2797be358b968520881ce4287365d672d76db8380|src/pages_sub/showcase/index.vue
73|a5dfa54c7fdb694c60958666195786cf77482577910d9409f0aaf707aa2248de|src/stores/theme.ts
93|28550c3ce3c7e853bde90ebf4bd989e648eead91de98fa91e36ffe9fa53b8312|src/uni_modules/lucky-ui/components.d.ts
195|42959195090c409562b91481b05d13af3ebcc511b21590b495ec1da7bb04bd4b|src/uni_modules/lucky-ui/components/common/props/index.ts
188|3cecd1dd98bacd80c0ce5a827a8b33eb8837914d51c502e4b1840c749f2a0c78|src/uni_modules/lucky-ui/components/index.ts
42|db62cd385dfc2656040575ec9b79af555d9fd2e675454ec1ee4f0be20f4796d6|src/uni_modules/lucky-ui/components/lk-chart-area/chart-area.props.ts
98|2d3f854e16b900659d88dea5c02c47b92cf36303b72b1ca11eb1a72aa15de2bc|src/uni_modules/lucky-ui/components/lk-chart-area/chart-area.utils.ts
50|610a1d22953cc390e542a04e771d1f4bdc4fc145173599a56a6a39029a65faac|src/uni_modules/lucky-ui/components/lk-chart-area/lk-chart-area.scss
371|fe89548d4965b6491f126b0ae901341558b5c6447c6f3f9c120294873f6aaf2c|src/uni_modules/lucky-ui/components/lk-chart-area/lk-chart-area.vue
73|b8f13bbee658475b89c799b7a173a48ba16376c9486e84501192cac969759096|src/uni_modules/lucky-ui/components/lk-chart-bar/chart-bar.props.ts
296|463ea15ef7b429af4ca83d1becdf82e6564813ed2bf966ae60068e1c16653690|src/uni_modules/lucky-ui/components/lk-chart-bar/chart-bar.utils.ts
42|b7d4c56b5d6e9bb5a82faa03b53516e11a43e723cbbd003f1ebd538926673b2e|src/uni_modules/lucky-ui/components/lk-chart-bar/lk-chart-bar.scss
462|a0560e9b1263541aef9b755223896ffe85773521749addca2b3cc8ef5494beb2|src/uni_modules/lucky-ui/components/lk-chart-bar/lk-chart-bar.vue
71|45f9444c63e56cf9ee9140810b3a5afc0b792f3a1548728c0a379ae0f6adb2b0|src/uni_modules/lucky-ui/components/lk-chart-line/chart-line.props.ts
361|726ce004f67debdcde026cf6cdbdd411c71c6643117651208c880f8c71d0ef31|src/uni_modules/lucky-ui/components/lk-chart-line/chart-line.utils.ts
42|b7d4c56b5d6e9bb5a82faa03b53516e11a43e723cbbd003f1ebd538926673b2e|src/uni_modules/lucky-ui/components/lk-chart-line/lk-chart-line.scss
529|285988e86428694170f9fb63bdf42eb6e3b4b17f92c00ac7178fade7d5b79355|src/uni_modules/lucky-ui/components/lk-chart-line/lk-chart-line.vue
66|c7e06d915994d0ec11d331879b93683ba4b68a998bac00479be77096752cd55a|src/uni_modules/lucky-ui/components/lk-chart-pie/chart-pie.props.ts
309|a86f24946859e8edbc9cdb5ed7d33ff29bf7956e2c439e5f99b20d0c05175d75|src/uni_modules/lucky-ui/components/lk-chart-pie/chart-pie.utils.ts
41|d23f79969a1684dcb22ca7fea8c3d9e545c46af6b330e7317adb0f065fd37f8a|src/uni_modules/lucky-ui/components/lk-chart-pie/lk-chart-pie.scss
473|1b80641f1e91394ddd97f0db8a83c8f83968cade43f4380f6d1a43d6e407b534|src/uni_modules/lucky-ui/components/lk-chart-pie/lk-chart-pie.vue
48|d1f1ddc67164a7c027e6d326d82e6b715ad73526d5198583b67f3bc6b1f0a4f8|src/uni_modules/lucky-ui/components/lk-chart-radar-lite/chart-radar-lite.props.ts
154|da65dfe8e361149d9c396260c77a0ed8ae634be90e1e6ae3063d7f6c2f9dcf06|src/uni_modules/lucky-ui/components/lk-chart-radar-lite/chart-radar-lite.utils.ts
16|9920dc078d393156b49ab0d5f70bec3b56230a06b2602eebf8395dc67efbc784|src/uni_modules/lucky-ui/components/lk-chart-radar-lite/lk-chart-radar-lite.scss
344|986877acaed84b7ed846697fb45deb24a0b063a81c11a7d1b7872665eeb8d740|src/uni_modules/lucky-ui/components/lk-chart-radar-lite/lk-chart-radar-lite.vue
46|6328419da275b4f19d8e3ff1ac09f342ced0e539044591abc81565acb977b863|src/uni_modules/lucky-ui/components/lk-chart-ring/chart-ring.props.ts
129|ce606798d95ba5eb0ca5caa5073376a557d76a32d0b2d84a3116645091520df2|src/uni_modules/lucky-ui/components/lk-chart-ring/chart-ring.utils.ts
15|2ebf528e06b14f81c81e7a3b2553413bee600fac93add0948511341fbce368fe|src/uni_modules/lucky-ui/components/lk-chart-ring/lk-chart-ring.scss
295|977039d1809cfe2dca0992dda961bc4fa7c9219bf1a9360dc0b02711c971babc|src/uni_modules/lucky-ui/components/lk-chart-ring/lk-chart-ring.vue
46|f487ecae77a8cd66962bf4cfab9c745b4ed6644cef1644b363ba4a3cbf815976|src/uni_modules/lucky-ui/components/lk-chart-sparkline/chart-sparkline.props.ts
109|5dad21de483c44aa01b6b1a7ff3783407056336496a61cf74c5704db535c0722|src/uni_modules/lucky-ui/components/lk-chart-sparkline/chart-sparkline.utils.ts
50|e0a48e3bdb06a537df49ea042e015d56f390098549e2bd91a70d32112a251634|src/uni_modules/lucky-ui/components/lk-chart-sparkline/lk-chart-sparkline.scss
319|f5eaddc83a6a6d96ae35b79e23f1421ce78337187cac756bdfc64cc188dd6106|src/uni_modules/lucky-ui/components/lk-chart-sparkline/lk-chart-sparkline.vue
54|33f52ac47e2d1220d132985d6acbde9312c27dd6ce20708cf51424f3ef30598c|src/uni_modules/lucky-ui/components/lk-chart-stat-card/chart-stat-card.props.ts
38|778809abead5b3a08343f9cb5e09cc333ba85282a8d6b4c2b3ef944f13989246|src/uni_modules/lucky-ui/components/lk-chart-stat-card/chart-stat-card.utils.ts
146|6ecc8b06c53b5e981aee6798816546f3f5b8baec0825ffdd5f5b4c7673913ab1|src/uni_modules/lucky-ui/components/lk-chart-stat-card/lk-chart-stat-card.scss
81|7ed7ab947169a113d20f8f8f3b256f4730ca8c7d1e83b19249bb142deec874d9|src/uni_modules/lucky-ui/components/lk-chart-stat-card/lk-chart-stat-card.vue
26|643152c4e2582a10bb35f4e5acd1bed60d3fedd71e696e9da327a982374699e1|src/uni_modules/lucky-ui/composables/useLocale.ts
660|a18caed3d27a1ed1ff4355a374c36d9a29a7f2440cd244a55b44160f34dc1cd4|src/uni_modules/lucky-ui/composables/useChartCanvas.ts
2|11052ae85b2918d18971a8e527f3e32c70061dbd94a25d3e1f111899573fa28d|src/uni_modules/lucky-ui/core/src/chart/index.ts
92|654af6cfc78bc6445e37e79cb6c0d40134aba1951358ffffe9a17a8780f809ad|src/uni_modules/lucky-ui/core/src/chart/lite.ts
39|f247ca93b5acef97185c9a5c7f20862b7d7caacf5d71540d746439fb8d19f51b|src/uni_modules/lucky-ui/core/src/chart/motion.ts
136|e96323b5a58db5e772b6446b9efb3133ad1de5ee6f6bb810891f3f21720035f9|src/uni_modules/lucky-ui/theme/src/brand-color.ts
551|f6e2ac26d16dd584457f221ea0c43d6563a4fdd4613254c41696c300f5f4d410|src/uni_modules/lucky-ui/theme/src/component-vars.scss
240|be5cf33ea5efc8ce34d82926fd3e31c78f4b4768b6d92a5ff418f08870b2043f|src/uni_modules/lucky-ui/theme/src/theme-store.ts
173|6aa556fcc34257c1a6a53f2e00cf8b4a4cdc7c8b570e6eb4099c6a01bada6339|src/uni_modules/lucky-ui/utils/chart-colors.ts
128|3f5389d1d4b0e142cfb0e4b3fba71e9b2f6bc66506f158f0a66183eb4b045db5|tests/unit/lk-chart-area.spec.ts
202|6b1fbf608481d0da2d584f56f153fbbd239a173091eaabf00e0d6e4fedfd27c7|tests/unit/lk-chart-bar.spec.ts
212|4beca54b8e15f0c5f3dcf3605d1c92ab4638237c34566d40765cea74b86df40b|tests/unit/lk-chart-line.spec.ts
223|a76f0d03c2e384f66bedc47e8c8409088a59672aefeb7b3a04125510be912a6a|tests/unit/lk-chart-pie.spec.ts
135|9206aeb09da19eba227a9c76d86719d68cc414a7bc26eedd09a8e6331c0dbe25|tests/unit/lk-chart-radar-lite.spec.ts
123|08df18b6ae33ecdb38b4fb58c4cf62798417f66b3bc150c5c4e99bc55a2385ba|tests/unit/lk-chart-ring.spec.ts
107|74fd9df567460aa0e89711b3bbb500694781dbe704a3e07472bead414ec1e7b9|tests/unit/lk-chart-sparkline.spec.ts
53|931facd190f17bf1da4f971adcd628b36eef1df05d3a05d0d496343756ba7c4e|tests/unit/lk-chart-stat-card.spec.ts
207|3999c5c9f953b91af518daffc3bd946747573161adb07fb2c7819b9e722372c1|tests/unit/lk-events-contract.spec.ts
88|2c17805d386acc0e02fbfde8887d2a9ffdf78ea782df62040c7f538e52916f81|tests/unit/theme-brand-color.spec.ts
188|e4a77c06540d1ec6622adcabfbcc40eb7d3f8c42e1621aa862dcd46274c2bf66|tests/unit/use-chart-canvas.spec.ts
29|8c3a9a3e22692c5cf2c7440f4c2922d625cb2de5029bfb1e220d485df8909904|tests/visual/dynamic-visual-showcase.spec.ts
104|9a2d7f7d8ab9fa5cd9c8b125cf7b16bb446fb58ae63fe51954fcceb5183d9e7b|tests/visual/high-risk-showcase.spec.ts
88|776d128290c080b7f0f0352e30b419c7eecefd50c4e50ae65302aedec25a651a|tests/visual/needs-hardening-showcase.spec.ts
20|e60e1a1f4bcfae013a7cf1c3bd776f3c73a5edd167df542d183e31024bb3e396|tests/visual/screenshot.spec.ts
```

总账校验：89 个唯一输入文件，16,425 个物理行，SHA 条目 89，重复 0，未读 0。报告创建前基线 HEAD 与上文一致；除本报告外未编辑组件、共享实现、文档、Demo、测试、矩阵或总 ledger。
