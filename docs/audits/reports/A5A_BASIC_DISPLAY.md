# A5A 基础与展示组件逐行审计

## 结论与状态

- 基线：audit/lucky-ui-full-review-20260813，c8071e67f93cc95ee1ddc12cac7bfccdf74058c1。
- 强制范围：lk-avatar、lk-badge、lk-button、lk-card、lk-cell、lk-divider、lk-fab、lk-grid、lk-icon、lk-image、lk-meta-row、lk-page、lk-progress、lk-segmented、lk-space、lk-tag。
- 覆盖分母：176 个唯一文件，其中 174 个文本文件、35,603 个物理行；2 个字体二进制、148,404 bytes。逐文件未读数为 0，重复计数为 0。
- 审计内容：组件目录全部文件、16 篇组件文档、16 个 demo、直接 unit/visual/showcase/playground/preview/微信小程序测试，以及 Fab→Overlay、Grid→Carousel、Ripple、主题 token、字体初始化等必要共享调用链。
- 本报告只记录静态审计结果；未启动 H5、未构建或打开微信开发者工具、未执行 Peekit、未把截图或 verifyStatus=verified 当作运行证据。因此运行态通过数是 0/60，不能表述为“已修复”或“已跨端验证”。
- 等级：P0 阻断核心流程且无可用绕行；P1 核心契约失效、明显跨端故障或严重误导；P2 边界、兼容、布局或可访问性缺陷；P3 冗余、维护性或较低频一致性缺陷。本批次没有静态证据足以定为 P0。

## 最佳总体方案

1. 先修公共契约层：主题暗色 token、baseProps 根节点透传、单位解析、事件与可访问性语义；避免在 16 个组件内复制补丁。
2. 再修组件状态机：Fab 的 tap/drag/overlay、Image 的请求代际、Segmented 的测量与滚动、Grid 的逐项 ripple。
3. 以源码生成或校验文档/Playground schema，禁止手写默认值与已删除 prop；showcase 的 verified 必须来自可追溯运行产物。
4. 每个修复先加纯逻辑单测，再加真实 H5 与微信小程序 Peekit 运行探针。验收必须同时保存 selector、action、events、rect、computed、errors；截图仅作为附属材料。
5. 修复层级按“共享 token/工具 → 组件 → demo/docs → 测试与证据产物”推进，避免通过 demo 特例或固定截图掩盖组件根因。

## 稳定问题清单

### 公共主题、根契约与演练场

#### A5A-01 [P1][兼容性/颜色] 微信自动暗色缺失语义色 token

- 端影响：H5 使用 .lk-theme-dark 时较完整；微信小程序跟随系统暗色时，Badge、Icon box、Progress、Tag 等语义成功/警告/危险/信息色仍取亮色值。
- 精确证据：src/uni_modules/lucky-ui/theme/src/component-vars.scss:295-308 在 .lk-theme-dark 重写 success/warning/danger/info 及 soft 色；同文件:426-466 的 MP-WEIXIN prefers-color-scheme page 块只重写 primary、文字、背景、边框等，遗漏上述语义色。
- 根因：手工维护了两份暗色变量清单，自动暗色分支不是完整暗色主题的同源展开。
- 最佳修复层：抽出唯一 dark-token mixin，同时供 .lk-theme-dark 与微信 media page 使用；为全部语义 token 做键集合相等测试。
- 运行态门禁：V01。

#### A5A-02 [P3][代码冗余/边距] 间距 token 存在两套相互冲突的尺度

- 端影响：H5 与微信都受影响；组件使用 CSS 变量时 lg/xl/xxl 为 24/32/48rpx，直接使用 Sass token 时为 20/24/32rpx，组合页面出现不可解释的 4～16rpx 漂移。
- 精确证据：src/uni_modules/lucky-ui/theme/src/tokens/_spacing.scss:3-12 定义 lg=20、xl=24、xxl=32、xxxl=48；component-vars.scss:3 已导入 spacing，却在 :28-34 再次硬编码 lg=24、xl=32、xxl=48。
- 根因：CSS 变量未从 Sass token 派生，命名层级发生错位。
- 最佳修复层：建立单一 spacing map，由它生成 Sass alias 与 CSS custom properties；提供迁移表，不直接静默改尺寸。
- 运行态门禁：V02。

#### A5A-03 [P1][根节点/测试定位] baseProps.id 被多个组件吞掉

- 端影响：H5 与微信均无法通过公开 id 精确定位 Avatar、Divider、Icon、Space、CellGroup；Grid 普通与轮播分支也都丢 id，影响锚点、无障碍关联和 Peekit。
- 精确证据：components/common/props/index.ts:5-12 声明 id 用于表单、动画和测试；lk-avatar.vue:62-66、lk-divider.vue:48-62、lk-icon.vue:80-98、lk-space.vue:32-37、lk-cell-group.vue:28-34 均未绑定 id；lk-grid.vue:67-102 与 :104-130 两分支均未绑定，而 docs/components/grid.md:98 明确承诺根节点 id。
- 根因：扩展 baseProps 后未建立“全部 base prop 必须落到可视根”的模板约束，多根/分支组件各自遗漏。
- 最佳修复层：提供共享 rootAttrs/rootStyle 解析器，并以组件清单 AST/渲染测试断言 id、customClass、customStyle 的唯一可视根归属。
- 运行态门禁：V03。

#### A5A-04 [P1][测试真实性/文档] verified 只是静态标签，不是跨端证据

- 端影响：H5 截图可能绿灯，微信没有同等运行证据；本报告发现的交互、暗色、加载失败与样式隔离问题均可被“已验证”标签掩盖。
- 精确证据：showcase-cases.ts:17-50、71-86、98-104、188-212、359-428、566-599、656-662 将本批组件写死为 verified；pages_sub/showcase/index.vue:36-39、110-123 只把该元数据渲染成标签；tests/visual/screenshot.spec.ts:4-18 仅在 H5 390×844 截图；直接 unit 以工具函数为主，例如 tests/unit/lk-avatar.spec.ts:1-75 没有挂载模板；微信直接测试只有 button，且 tests/miniprogram/button.spec.js:36-70 传入已废弃 type 并只断言对象、tap 绑定；dynamic-visual-showcase.spec.ts:17-26 还期待当前页面已不存在的“✅ 全平台已验证”。
- 根因：验证状态不是由测试运行结果生成，没有 target/build/commit/time/probe 的证据链。
- 最佳修复层：verified 改为由 CI 导入的不可手填结果；每条结果必须带提交、构建目标、设备/基础库、Peekit JSON 与时间，过期或缺任一目标自动 pending。
- 运行态门禁：V04。

#### A5A-05 [P1][演练场/交互] Segmented 的“交互式调试”实际为空

- 端影响：H5 文档 iframe 与微信 playground 都显示空轨道/空组件，无法演练 v-model、禁用、长文案或滑块。
- 精确证据：docs/components/segmented.md:12-18 的 props-def 只有 size、animated；segmented.props.ts:16-17 默认 modelValue=''、options=[]；pages_sub/playground/index.vue:247-251 仅 v-bind currentProps，没有注入 options 或 v-model。
- 根因：通用 Playground 只支持标量 prop，没有组件级初始数据和双向状态。
- 最佳修复层：为 Segmented 注册可序列化 fixture（唯一 options、初始 modelValue、事件日志），并让 Playground schema 支持 array/object 与 v-model。
- 运行态门禁：V05。

#### A5A-06 [P1][演练场/默认值] Image Playground 的 preview 默认值与源码相反

- 端影响：H5 文档生成的“不含 preview”示例运行时默认会预览；微信 playground 也会把用户看到的 false 与真实组件 true 混为一谈。
- 精确证据：docs/components/image.md:12-23 把 preview default 写成 false；image.props.ts:51-52 实际为 true；PropsPlayground.vue:58-71 跳过与 schema 默认值相等的字段，因此 false 不生成属性。
- 根因：Playground schema 手工复制组件默认值。
- 最佳修复层：从 Vue props 元数据生成 schema；在此之前把文档默认修正为 true，并允许显式生成 :preview=false。
- 运行态门禁：V06。

#### A5A-07 [P1][文档/API 漂移] 多篇示例继续使用已删除的 Button/Tag API

- 端影响：H5 与微信示例看似能渲染，但 type=primary、plain、Tag type=primary 都是无效透传/校验值，用户复制后得不到文档声称的视觉。
- 精确证据：docs/components/card.md:53-54、page.md:60、progress.md:84、space.md:90 使用 Button type/plain；button.props.ts:90、:116-119 的现行入口是 variant、block、fill；card.md:65 使用 Tag type=primary，而 tag.props.ts:35 只允许 light/solid/outline。
- 根因：文档没有参与类型检查或模板编译契约测试。
- 最佳修复层：文档 fenced Vue 片段进入 CI 编译；所有 prop 名和值从公开类型校验，提供旧 API 迁移对照。
- 运行态门禁：V07。

### Avatar、Badge、Button

#### A5A-08 [P1][文档/尺寸/兜底] Avatar 文档描述了不存在的 API

- 端影响：H5 与微信的 icon/fallbackIcon/fallbackText 都不生效；size=sm/md/lg/xl 经 addUnit 原样成为无效 CSS 尺寸。MetaRow 文档和 demo 也用 Avatar icon，左侧头像实际为空。
- 精确证据：docs/components/avatar.md:8、15-18、27-31、41-43、51-59 宣称图标、兜底图标/文字与预设尺寸；avatar.props.ts:18-49 只有 shape/size/src/alt/bg/radius/text/color；avatar.utils.ts:35-47 直接 addUnit(size)；meta-row.md:13-16、32-35 与 meta-row-demo.vue:21-59 使用不存在的 icon。
- 根因：Avatar API 已重写，文档、组合 demo 和迁移兼容层没有同步。
- 最佳修复层：二选一并明确版本：实现 icon/fallback 与预设尺寸兼容；或删除承诺、替换 MetaRow fixture，并提供迁移文档与编译测试。
- 运行态门禁：V08。

#### A5A-09 [P1][无障碍/加载失败] Avatar.alt 是死 prop，且失败不可观测

- 端影响：H5 图片没有可访问替代文本；微信没有 accessibility-label；两端业务都收不到 load/error，alt 也不参与失败文案。
- 精确证据：avatar.props.ts:32-36 定义 alt；lk-avatar.vue:57-65 只在内部置 hasError，image 未绑定 alt，fallback 只用 avatar.utils.ts:62-64 的 text；组件没有 emits。
- 根因：alt 被当作文档注释而未纳入渲染/事件契约。
- 最佳修复层：H5 绑定原生 alt，微信绑定 accessibility-label；text 为空时用 alt 作可见兜底；透出包含 src 的 load/error 事件。
- 运行态门禁：V09。

#### A5A-10 [P1][样式/颜色] Badge.color 被子 text 的白色规则覆盖

- 端影响：H5 与微信设置 color=#000 仍显示白字；官方 demo 的 primary/warning 黑字示例失真。
- 精确证据：badge.utils.ts:33-44 把 color 写到 .lk-badge；lk-badge.scss:37-39 又强制直接子 text 为 --lk-color-white；badge-demo.vue:67-77 明确传 color=#000。
- 根因：父级公开颜色与子级历史防护规则冲突。
- 最佳修复层：子 text 使用 color:inherit，或把解析后的文字色写入共享 --_color；加 computed color 断言。
- 运行态门禁：V10。

#### A5A-11 [P1][布局/独立模式] 独立 Badge 不占布局尺寸

- 端影响：H5 与微信的无默认插槽 Badge 根节点为 0×0，徽标绝对定位且不占流，容易覆盖相邻内容或被父容器裁切。
- 精确证据：docs/components/badge.md:28-35 宣称独立使用；lk-badge.vue:68-80 的 wrapper 只有空 slot 与 badge；lk-badge.scss:3-8 wrapper 为 inline-block，:18-35 badge 为 absolute。
- 根因：包装模式和 standalone 模式共用绝对定位结构，却没有无插槽分支。
- 最佳修复层：检测默认插槽；standalone 时徽标改为 position:relative/inline-flex 并正常占流，包装模式才绝对定位。
- 运行态门禁：V11。

#### A5A-12 [P2][样式/形状] Button square 与 default 圆角完全相同

- 端影响：H5 与微信“方形/直角”按钮仍为默认圆角，形状对比 demo 无法区分。
- 精确证据：button.props.ts:100-107 定义 square=直角；lk-button.scss:7、:26 默认 --_radius=--lk-radius-md，:68-70 的 shape-square 仍设置同一值；button-demo.vue:61-66 并列展示。
- 根因：modifier 复制了默认 token。
- 最佳修复层：square 使用 0 或明确的 xs radius；若产品要“方角”而非直角，应重命名并同步文档。
- 运行态门禁：V12。

### Card、Cell、Divider

#### A5A-13 [P1][文档/API] Card 的 hoverable 是不存在的 prop

- 端影响：H5 与微信文档 Playground 和复制示例打开 hoverable 后没有任何悬浮/按压效果；ripple、overflow 这些真实能力反而未记录。
- 精确证据：docs/components/card.md:12-21、72-77、108-120 配置并列出 hoverable；card.props.ts:4-33 没有 hoverable，存在未文档化的 ripple、overflow。
- 根因：文档 schema 与公开 props 分叉。
- 最佳修复层：从 cardProps 生成 API/Playground；若需要 hoverable，明确 H5 hover 与 MP active 的跨端降级后再实现。
- 运行态门禁：V13。

#### A5A-14 [P1][交互/嵌套] Card 子区域事件边界不一致并向根 click 冒泡

- 端影响：H5 与微信点击标题会同时发 header-click 与 click；点击 footer 同时发 footer-click 与 click；点击 header-extra 却只有 click，和“点击卡片头部”描述不一致。
- 精确证据：lk-card.vue:63 根 view 绑定 handleClick；:70-79 只在 title 子节点绑定 header；:86-92 footer 绑定 handler；两个子 handler 都未 stop。docs/components/card.md:126-128 把 header-click 描述为头部点击。
- 根因：事件区域没有先定义“区域事件是否排他”的契约，handler 绑点也只覆盖标题。
- 最佳修复层：先定事件矩阵；推荐 header/footer 在整个区域绑定并 stop，根 click 仅空白/body；若保留冒泡则文档与 payload 必须明确 source。
- 运行态门禁：V14。

#### A5A-15 [P2][样式/内边距] Card.padding 接受 shorthand，但 header/footer 会拼成无效 CSS

- 端影响：H5 与微信传 16rpx 24rpx 时 body 正常，header/footer 分别被拼为 5 个值，浏览器/小程序丢弃 padding，三段对不齐。
- 精确证据：card.props.ts:13-14 接受任意 string；card.utils.ts:60-69 用 “padding padding 0” 和 “0 padding padding” 字符串拼接，只有单值输入才合法。
- 根因：把完整 CSS shorthand 当作一个原子边值复用。
- 最佳修复层：解析 1～4 值为 top/right/bottom/left，再派生三段；或拆成 paddingX/paddingY/headerPadding/footerPadding。
- 运行态门禁：V15。

#### A5A-16 [P2][对齐] Cell.center=false 与 true 的样式相同

- 端影响：H5 与微信无法获得预期的顶对齐长标题/多行描述；center prop 是视觉 no-op。
- 精确证据：lk-cell.scss:13-18 默认 align-items:center；:20-22 .is-center 仍为 center；docs/components/cell.md:58 将 center 描述为“是否垂直居中”，默认 false。
- 根因：默认态和 modifier 没有差异。
- 最佳修复层：默认改为 flex-start、center 才切 center，或删除 prop 并明确永远居中；用多行内容矩形中心差验收。
- 运行态门禁：V16。

#### A5A-17 [P1][文档/小程序样式隔离] CellGroup.border 默认值冲突且边框依赖父样式穿透子组件

- 端影响：两端默认行为与文档相反；微信默认组件样式隔离下，Group 样式中的 .lk-cell + .lk-cell 很可能无法命中子组件内部根，border=true 仍无分隔线。
- 精确证据：docs/components/cell.md:38-45 写 border 默认 true；lk-cell-group.vue:9-15 实际默认 false；lk-cell.scss:129-132 在 Group 样式里用后代选择器直接选择子自定义组件内部 .lk-cell。
- 根因：默认值手工漂移，并用跨组件 CSS 结构耦合表达组上下文。
- 最佳修复层：统一默认值；通过 provide/inject 把 group border 传给 Cell，由 Cell 自己绘制边线，避免依赖 styleIsolation shared。
- 运行态门禁：V17。

#### A5A-18 [P2][宽度/长文本] Cell flex 子项缺少收缩边界

- 端影响：H5 与微信长 title/value 或右侧插槽可能撑出容器、挤压箭头，showcase 风险说明声称持续回归但 demo 没有长文案。
- 精确证据：lk-cell.scss:36-59 left/titles 有 flex:1 但没有 min-width:0；:72-84 right 没有 flex-shrink 约束；showcase-cases.ts:80-86 明示长文本风险。
- 根因：flex 溢出规则不完整，也未定义 wrap/ellipsis 策略。
- 最佳修复层：left/titles min-width:0，right/arrow flex-shrink:0；新增可选 ellipsis/lineClamp 并以极长中英文、数字串验收。
- 运行态门禁：V18。

#### A5A-19 [P1][文档/方向] Divider 垂直示例使用不存在的 direction

- 端影响：H5 与微信复制“垂直分割线”示例仍渲染水平线。
- 精确证据：docs/components/divider.md:30-40 使用 direction=vertical；同文档:51 与 divider.props.ts:21-22 的真实 API 都是 boolean vertical。
- 根因：示例与 API 表没有同一模板编译校验。
- 最佳修复层：改为 <lk-divider vertical />，并将所有文档示例纳入 prop 名/类型检查。
- 运行态门禁：V19。

### Fab

#### A5A-20 [P1][交互/手势] Fab 主按钮没有独立 tap/click，点击被错误绑在拖拽生命周期

- 端影响：H5 鼠标和键盘无法激活；微信 draggable=false 时完全无点击；默认触摸按住超过 200ms 即使未移动也不 click。每次短点又会先发 drag-start/drag-end。
- 精确证据：lk-fab.vue:89-106 在 draggable=false 直接 return 并立即发 drag-start；:146-172 只有处于 dragging 且 duration<200 才 handleClick；:300-329 container 只有 touchstart/move/end，主按钮没有 tap/click。
- 根因：把点击识别作为拖拽结束的副产物，没有分离 press、tap 与 drag 状态。
- 最佳修复层：主按钮用 @tap 和 H5 keyboard 触发；只有位移超过阈值后才进入 drag 并发 drag-start/move/end，拖动完成仅抑制一次 tap。
- 运行态门禁：V20。

#### A5A-21 [P1][交互/嵌套] Fab 的 overlay=true 仍不会显示遮罩

- 端影响：H5 与微信展开 Fab 时没有遮罩，也无法触发 overlay-click/closeOnOverlay。
- 精确证据：lk-fab.vue:293-298 向 LkOverlay 传 :show=isExpanded；overlay.props.ts:4-8 只声明 modelValue；lk-overlay.vue:19-23 只从 props.modelValue 计算可见性。
- 根因：父子 v-model prop 名错配，静态测试只测工具函数，没有挂载调用链。
- 最佳修复层：改为 :model-value=isExpanded 或 v-model，并增加 Fab+Overlay 集成测试，断言展开、点击遮罩、关闭事件顺序。
- 运行态门禁：V21。

#### A5A-22 [P1][交互/禁用] Fab 的 action-disabled 事件在真实 UI 中不可达

- 端影响：H5 与微信点击禁用 action 不会进入 handler，因此文档承诺的 action-disabled 永远不发。
- 精确证据：lk-fab.vue:192-200 有 action-disabled 分支，:307-320 也绑定 tap；lk-fab.scss:89-92 却对 .is-disabled 设置 pointer-events:none；docs/components/fab.md:141-143 声明事件。
- 根因：禁用状态同时采用“阻断命中”和“handler 内报告”两种互斥策略。
- 最佳修复层：保留命中，handler 阻止业务动作并发 action-disabled；补 aria-disabled/accessibility-state，禁用视觉不承担事件控制。
- 运行态门禁：V22。

#### A5A-23 [P1][API/文档/颜色] FabAction.color 未使用，zIndex 默认值也漂移

- 端影响：两端 action 自定义色没有任何效果；文档按 999 设计层级，实际默认 400，容易与导航/遮罩预期不一致。
- 精确证据：fab.props.ts:27-38 声明 action.color，docs/components/fab.md:154-160 也承诺；lk-fab.vue:307-323 未绑定 color，lk-fab.scss:67-78 固定背景/文字；fab.props.ts:106-109 默认 zIndex=400，而 fab.md:128 写 999。
- 根因：数据模型、模板和文档三处没有契约测试。
- 最佳修复层：定义 color 是 action 背景还是前景，解析语义色并绑定；统一 zIndex 到全局层级 token，文档由源码生成。
- 运行态门禁：V23。

#### A5A-24 [P1][单位/宽度] Fab 把 px 固定乘 2 再按 rpx 转回

- 端影响：H5 与微信在非 375px 视口/不同设备上 size=56px 不再是 56px，按钮尺寸和边距随视口漂移。
- 精确证据：fab.utils.ts:8-13 对 px parseFloat×2；lk-fab.vue:37-43 随后调用 uni.upx2px。
- 根因：把 1px=2rpx 当作所有视口恒等式。
- 最佳修复层：使用能保留单位的长度解析器；px 直接返回 px 数值，rpx/number 才 upx2px，其他 CSS 单位在 H5 用测量或明确拒绝。
- 运行态门禁：V24。

#### A5A-25 [P1][响应式/安全区] Fab 位置只在 setup 时按一次系统几何计算

- 端影响：H5 resize/旋转与微信横竖屏、分屏、safe-area 变化后位置越界；position/size/offset/safeAreaInsetBottom 响应式更新也不重新锚定。
- 精确证据：lk-fab.vue:32-35 把 windowWidth/windowHeight/safeBottom 存成常量；:51-68 只初始化一次 posX/posY；:82-87 只 watch modelValue。
- 根因：位置状态和输入 props/窗口几何没有依赖关系。
- 最佳修复层：用响应式 window info，监听 onWindowResize/page show 与相关 props；区分“仍锚定”与“用户拖过”状态，统一 clamp。
- 运行态门禁：V25。

#### A5A-26 [P2][响应式/事件] Fab 在 computed 求值时发 direction-change

- 端影响：H5 与微信渲染求值可触发父更新，依赖变化时可能重复发事件或产生更新回路，事件时机不可预测。
- 精确证据：lk-fab.vue:237-253 的 resolvedDirection computed 在 next!==preferred 时直接 emit。
- 根因：把有副作用的通知放入应保持纯函数的 computed。
- 最佳修复层：computed 只返回方向；watch resolvedDirection 的新旧值并去重后 emit，明确首次是否通知。
- 运行态门禁：V26。

### Grid

#### A5A-27 [P1][微信/交互/波纹] Grid 多项共用首个 .lk-ripple 的 MP 矩形

- 端影响：H5 使用 offsetX/Y 基本正确；微信点击第 2 项以后，波纹坐标仍相对第 1 个匹配节点，波纹偏移甚至落在项外。
- 精确证据：lk-grid.vue:24-25 仅创建一个 useRipple，:79-99、:104-126 重复多个 .lk-ripple；useRipple.ts:3-9、23-25 默认 selector=.lk-ripple，:114-140 用 select(selector) 只取首项。
- 根因：共享 ripple 状态没有携带被点击项的唯一查询目标。
- 最佳修复层：每项使用稳定 data/id 并把 selector/rect 传给 trigger，或让 useRipple 优先使用事件 currentTarget 的组件内节点信息。
- 运行态门禁：V27。

#### A5A-28 [P2][边距/零值] Grid.itemGap=0 会被改回 8rpx

- 端影响：H5 与微信无法取消图标与文字间距。
- 精确证据：grid.utils.ts:25-28 使用 itemGap || 8；tests/unit/lk-grid.spec.ts:28-33 只测 undefined 和 16，没有覆盖 0。
- 根因：用 truthy fallback 处理合法零值。
- 最佳修复层：改为 itemGap ?? 8，并加 0、负值策略与小数测试。
- 运行态门禁：V28。

#### A5A-29 [P1][分页/宽度] Grid 轮播模式在未传 columns 时退化为每页一项

- 端影响：两端普通 Grid 未传 columns 会 auto-fill；一旦 carousel=true，同一数据却每页只有一个入口。
- 精确证据：grid.utils.ts:7-16 普通布局使用 auto-fill；:35-45 paginate 的 columns||1、rows||1 使每页 1；docs/components/grid.md:90-96 说 columns 可不传且 carousel 只需结合 columns/rows。
- 根因：视觉自动列数不能参与 JS 分页，API 又没有规定 carousel 必填 columns。
- 最佳修复层：carousel 模式显式要求并校验 columns，或先测量容器/最小项宽再计算页容量；文档不能同时承诺自动填充。
- 运行态门禁：V29。

#### A5A-30 [P2][分支/根节点] Grid 轮播分支丢失 id 与 clip 语义

- 端影响：两端同一 props 在 carousel 开关前后改变根节点与 overflow；clip=true 在轮播分支无效，id 始终缺失。
- 精确证据：lk-grid.vue:40-42 计算 clip/root；:67-102 轮播只传 customClass/customStyle；:104-130 普通分支才使用 rootClass，且也没有 id。
- 根因：模板两分支没有共享可视根契约。
- 最佳修复层：在稳定外层 root 上统一绑定 id/class/style/clip，Carousel 仅作为内部内容；增加 branch parity 测试。
- 运行态门禁：V30。

#### A5A-31 [P2][交互/颜色/无障碍] Grid.disabled 只有类名，没有视觉或语义

- 端影响：H5 与微信禁用项外观与可用项相同，也没有 aria-disabled/accessibility-state，用户只能在点击后从业务事件猜测。
- 精确证据：grid.utils.ts:52-64 生成 is-disabled；lk-grid.scss:1-33 没有对应样式；lk-grid.vue:80-99、107-126 的 view 没有禁用语义。
- 根因：状态只在 JS 事件分支实现，设计与可访问层未消费。
- 最佳修复层：定义 token 化 disabled opacity/color/cursor，绑定状态语义；click-disabled 仍可报告但不得发 click。
- 运行态门禁：V31。

#### A5A-32 [P2][公开类型/冗余] Grid barrel 导出的是空 types 文件

- 端影响：TypeScript 用户从组件入口无法导入 GridItem/GridProps，文档的 GridItem[] 缺少实际公共出口。
- 精确证据：lk-grid/index.ts:1-2 export * from ./types；types.ts:1 只有 export {}；实际 GridItem 位于 grid.props.ts 并仅被内部导入。
- 根因：类型移动后 barrel 没同步，空 README/types 形成假入口。
- 最佳修复层：从 index 明确导出 grid.props 的类型，或让 types.ts 成为唯一类型定义；加 public-import 编译测试。
- 运行态门禁：V32。

### Icon

#### A5A-33 [P1][微信/字体/集成] Icon 的微信字体初始化依赖宿主 App.vue 私有代码

- 端影响：库消费者只引入 lk-icon 时，H5 因静态 @font-face 可显示；微信仅有 class/codepoint 没有字体，显示空白方框。
- 精确证据：lk-icon.vue:8-15 在 MP 只导入 definitions；真正 initLkIconsFont 调用只存在本仓库 src/App.vue:5-9、35-42；docs/components/icon.md:76-78 只说“通过 loadFontFace 注入”，没有安装步骤。
- 根因：组件包没有 install/bootstrap 契约，demo 宿主恰好补了隐藏前置条件。
- 最佳修复层：在 Lucky UI 插件安装入口提供幂等字体初始化，或发布明确的一行启动 API 与失败状态；消费方集成测试不得复用仓库 App.vue。
- 运行态门禁：V33。

#### A5A-34 [P1][微信/生命周期] 字体全局加载失败后的“局部成功”被永久标为 loaded

- 端影响：微信某页 fallback 局部注入成功后 loaded=true，之后页面不再加载；新页面图标可能消失。
- 精确证据：init-lk-icons.ts:6、36-38 用模块级 loaded 短路；:57-67 全局成功置 true；:68-81 global 失败后不带 global 的局部加载也置同一 true。
- 根因：一个布尔值混淆 global scope 与 page-local scope。
- 最佳修复层：状态至少区分 globalLoaded 与已加载 page route/instance；局部 fallback 在 page onShow 重试，不得阻止未来全局升级。
- 运行态门禁：V34。

#### A5A-35 [P1][无障碍/属性透传] Icon 丢弃除 class/style 外的 attrs，却始终 aria-hidden

- 端影响：H5 与微信给可点击图标传 id、role、aria-label、data-* 或 accessibility-label 都不会落节点；同时 click 事件存在但辅助技术被强制隐藏。
- 精确证据：lk-icon.vue:17 inheritAttrs=false；:43-63 只合并 attrs.class/style；:75-98 两分支都 @tap 且 aria-hidden=true。
- 根因：装饰图标与交互图标没有模式区分，手工 attr 白名单过窄。
- 最佳修复层：默认装饰可 hidden；出现 click 或显式 interactive 时要求 label、role/button、tabindex/键盘，并把剩余 attrs v-bind 到唯一根。
- 运行态门禁：V35。

#### A5A-36 [P2][宽高/单位] Icon box 自动尺寸不理解 px/rem/calc

- 端影响：两端 size=24px 且 box=true 时图标是 24px，但 box 回退 64rpx；比例随端和视口变化。
- 精确证据：docs/components/icon.md:20-40 说 size 支持 CSS 值且 box 默认按图标派生；icon.utils.ts:95-104 只匹配纯数字或 rpx，其余统一 64rpx。
- 根因：自动计算只在 rpx 数值域内实现，却向 API 暴露任意 CSS 长度。
- 最佳修复层：同单位用 calc(size + 32rpx) 或要求非 rpx 时显式 boxSize；建立 px/rem/var/calc 的确定降级规则。
- 运行态门禁：V36。

#### A5A-37 [P3][散乱/死代码] icons.ts 的 SVG loader 路径永远匹配不到且未被组件使用

- 端影响：当前字体路径不受影响；任何调用 getBuiltInIcon 的 H5/App 代码都只得到 null，维护者会误判存在 SVG fallback。
- 精确证据：icons.ts:5-7 glob key 带 ./bootstrap-icons；:17-21 构造的 key 缺少 ./；组件目录没有 bootstrap-icons/icons；lk-icon.vue 也未导入该模块。
- 根因：旧 SVG 方案残留在字体方案旁，缺少可达性测试。
- 最佳修复层：若不再支持就删除并记录迁移；若支持则修 key/资源入口、公开导出，并加至少一个真实 SVG 加载测试。
- 运行态门禁：V37。

### Image、MetaRow、Page

#### A5A-38 [P1][跨端 API/加载模式] Image 把 CSS fit 值原样传给 Uni image.mode，demo 又传不存在的 mode

- 端影响：微信原生 image 不认识 cover/contain/fill/none/scale-down；H5 与 MP 的裁剪可能不同。官方 demo 的 scaleToFill/aspectFit/aspectFill 都作为未声明 attrs 被忽略，实际仍是默认 cover。
- 精确证据：image.props.ts:7-13、32-40 定义 CSS fit；lk-image.vue:67-74 直接 :mode=fit；image-demo.vue:60-92 使用未声明 mode；docs/components/image.md:42-51 用 fit 展示。
- 根因：CSS object-fit 词汇与 Uni/微信 mode 词汇混用，demo 又沿用旧 API。
- 最佳修复层：显式映射 cover→aspectFill、contain→aspectFit、fill→scaleToFill；为 none/scale-down 定义 H5 与 MP 可实现的降级，或直接公开 native mode。
- 运行态门禁：V38。

#### A5A-39 [P1][加载失败/状态] Image 空 src 可能永久停在 loading

- 端影响：H5 与微信对空 src 不保证发 error；默认 <lk-image /> 可一直显示 loading 占位。
- 精确证据：image.utils.ts:8-16 初始和 src 变化均设 loading=true/error=false；lk-image.vue:67-79 即使 src='' 仍创建 image 并显示 loading；docs/components/image.md:92-100 推荐裸组件组合。
- 根因：状态机没有 idle/empty 状态，把“还没请求”当作“请求中”。
- 最佳修复层：src 为空时进入 idle 或 error-empty，停止 loading；仅非空请求才置 loading，并明确空态 slot。
- 运行态门禁：V39。

#### A5A-40 [P1][异步竞态/交互] Image 旧请求可覆盖新 src，失败后仍允许预览

- 端影响：两端快速换 src 时旧 load/error 会改写当前状态；错误占位根仍可 tap 并调用 previewImage；预览回调还读取变化后的 props.src，事件可能报告错误 URL。
- 精确证据：lk-image.vue:25-40 重置状态但回调没有 request token；:41-51 shouldPreview 只看 preview+src，success/fail 闭包读 props.src；:66-83 error 时仅移除 inner image，根 tap 仍在；image.utils.ts:49-50 不检查 error。
- 根因：异步结果没有绑定请求代际，预览状态也不属于同一状态机。
- 最佳修复层：每个 src 生成 requestId/key，旧回调丢弃；回调捕获 requestedSrc；preview 需当前已成功且非 error，或把错误占位点击定义为 retry。
- 运行态门禁：V40。

#### A5A-41 [P2][无障碍/交互] Image 没有 alt 与键盘预览语义

- 端影响：H5 图片对读屏无名称，preview=true 的根 view 不能键盘聚焦/Enter；微信也没有 accessibility-label。
- 精确证据：image.props.ts:17-53 没有 alt；lk-image.vue:65-84 根只绑 tap，inner image 无替代文本或状态语义。
- 根因：把 Image 只当视觉容器，没有区分装饰、内容图片与交互预览。
- 最佳修复层：增加 alt/decorative；H5 绑定原生 alt，并让预览根具有 button/键盘语义；微信绑定 accessibility-label。
- 运行态门禁：V41。

#### A5A-42 [P1][布局/嵌套] MetaRow 空 slot wrapper 仍制造左右与上下间距

- 端影响：两端只有 main 的行仍被空 start/end 挤出左右 gap；只有 main-bottom 时也会因隐藏的 main-top 相邻规则产生上间距。
- 精确证据：lk-meta-row.vue:41-58 无条件渲染 start、main-top、main-bottom、end；lk-meta-row.scss:24-30 给 start margin-right，:62-68 给 end padding-left；:44-55 仅把空 main 子块 display:none，而 :58-60 的相邻 selector 仍匹配。
- 根因：布局依赖空元素，而非 slot 存在性或 :not(:empty)。
- 最佳修复层：用 useSlots/v-if 不渲染空区；间距只在实际存在的相邻区之间加，或使用可靠的 :not(:empty) 规则。
- 运行态门禁：V42。

#### A5A-43 [P2][对齐] MetaRow.align 对左右 slot 内容基本无效

- 端影响：两端 align=start/end 只改变 main 的位置；start/end wrapper 因 stretch 后内部 center，侧内容仍垂直居中。
- 精确证据：lk-meta-row.scss:12-22 在 root 改 align-items；:24-30 与 :62-66 又给 side align-self:stretch、align-items:center。
- 根因：子项显式 self alignment 覆盖父交叉轴策略。
- 最佳修复层：side 继承 root align，或按 modifier 同步 justify/align；用高矮不等内容分别测 start/center/end。
- 运行态门禁：V43。

#### A5A-44 [P1][响应式/安全区] Page 的状态栏和胶囊几何是 setup 快照

- 端影响：H5 resize 与微信旋转/窗口变化后 reserveTop、left slot 物理对齐不会更新。
- 精确证据：lk-page.vue:15-35 只调用一次 getSystemInfoSync/getMenuButtonBoundingClientRect；:40-73 computed 依赖的都是非响应式常量，没有 onWindowResize/onShow。
- 根因：动态窗口几何被建模为不可变配置。
- 最佳修复层：封装响应式 safe-area/navbar provider，在 onWindowResize、page show、胶囊变化时刷新；保留 SSR/异常降级。
- 运行态门禁：V44。

#### A5A-45 [P1][文档/类型/测试盲区] Page.scrollStyle 文档允许 object，源码只接受 string，且无直接单测

- 端影响：H5 与微信传对象会触发 prop 类型警告/拒绝，文档示例契约无法保证；showcase 却仍标 verified。
- 精确证据：docs/components/page.md:87-90 写 string | object；page.props.ts:32-35 使用 LkProp.string；本批直接单测中没有 tests/unit/lk-page.spec.ts；showcase-cases.ts:593-599 写 verified。
- 根因：Page 未进入直接契约测试，文档类型手工维护。
- 最佳修复层：若需 object，使用 StyleValue PropType 并验证 MP 序列化；否则修文档。补模板挂载与系统几何 mock 单测。
- 运行态门禁：V45。

### Progress、Segmented、Space、Tag

#### A5A-46 [P1][颜色/文档] Progress 宣称支持渐变，却写入 backgroundColor

- 端影响：H5 与微信传 linear-gradient 时该声明无效，进度条退回透明/旧背景；官方 demo 的渐变例直接失真。
- 精确证据：docs/components/progress.md:124、145 宣称 color 支持渐变；progress-demo.vue:46-52 传 linear-gradient；progress.utils.ts:27-45 把 color 赋给 backgroundColor。
- 根因：纯色属性和背景图语法没有区分。
- 最佳修复层：检测 gradient 后写 background，纯色可写 backgroundColor；更稳妥是统一写 background 并测试语义色与自定义渐变。
- 运行态门禁：V46。

#### A5A-47 [P2][无障碍] Progress 没有 progressbar 语义和值

- 端影响：H5 读屏无法知道这是进度、当前值和范围；微信也没有 accessibility value。
- 精确证据：lk-progress.vue:55-64 只有 view/text，没有 role、aria-valuemin/max/now 或 accessibility-label。
- 根因：视觉百分比文本被误当作可访问语义。
- 最佳修复层：根绑定 role=progressbar、0/100/当前规范化值及可定制 label；微信映射平台支持的 accessibility 属性。
- 运行态门禁：V47。

#### A5A-48 [P2][高度/输入校验] Progress.strokeWidth 的 0 和负值没有确定语义

- 端影响：两端 strokeWidth=0 因 falsy 不写高度而回退默认 12rpx；负值写成无效 CSS 后也回退，调用方无法发现错误。
- 精确证据：progress.props.ts:22-23 接受任意 number；progress.utils.ts:15-24 仅在 if(strokeWidth) 时写 height，没有 clamp/validator。
- 根因：合法零值与缺省混淆，非法负值没有输入边界。
- 最佳修复层：定义最小值并 validator/clamp；如果 0 代表隐藏则必须显式写 0rpx并同步文字布局。
- 运行态门禁：V48。

#### A5A-49 [P3][散乱/动画] lk-progress-move 在全局与组件中反向重复定义

- 端影响：两端最终条纹移动方向取决于样式加载顺序，按需引入与全量主题可能表现相反。
- 精确证据：theme/src/base/_animations.scss:730-737 定义 0→80rpx；lk-progress.scss:80-86 用同名 keyframes 定义 80rpx→0。
- 根因：全局动画与组件私有动画未命名空间化。
- 最佳修复层：只保留一份 canonical keyframe，或改为组件私有 lk-progress-stripe-move；加编译 CSS 唯一性测试。
- 运行态门禁：V49。

#### A5A-50 [P2][微信兼容/横向滚动] Segmented 用普通 view 的 overflow-x 承诺内置滚动

- 端影响：H5 通常可滚；微信不同基础库/组件样式环境对普通 view overflow 滚动、scrollOffset 查询和手势处理存在风险，文档却把它当稳定能力。
- 精确证据：docs/components/segmented.md:74-95、201-205 明确承诺内部横向滚动；lk-segmented.vue:170-191 根是 view；lk-segmented.scss:18-36 仅靠 overflow-x:auto，而不是 scroll-view。
- 根因：把浏览器滚动容器实现直接移植到小程序。
- 最佳修复层：MP 使用 scroll-view scroll-x 并管理 scrollLeft/active into-view；H5 可保留 overflow，二者共享滑块坐标模型。
- 运行态门禁：V50。

#### A5A-51 [P1][无障碍/键盘] Segmented 是 tap-only views

- 端影响：H5 无 tablist/tab、aria-selected、键盘箭头/Enter；微信禁用/选中状态也没有可访问描述。
- 精确证据：lk-segmented.vue:170-190 根和 item 都是 view，仅 @tap 与 CSS class。
- 根因：分段器只实现视觉和触摸状态。
- 最佳修复层：H5 实现 tablist/tab、roving tabindex、方向键/Home/End/Enter；MP 绑定 accessibility role/label/state，并保证 disabled 不可选择。
- 运行态门禁：V51。

#### A5A-52 [P2][数据/滑块] Segmented 不校验重复 value

- 端影响：两端重复 value 会产生重复 key、多个 is-active 项；滑块却只对齐 findIndex 的第一项。
- 精确证据：lk-segmented.vue:180-189 以 opt.value 作 key 并逐项比较 active；segmented.utils.ts:64-83 用 findIndex 找首个 active。
- 根因：公开数据模型要求值唯一但没有运行/开发期校验。
- 最佳修复层：开发期对重复 value 明确警告或抛错；内部 key 可允许独立 id，但选择值仍必须定义唯一性。
- 运行态门禁：V52。

#### A5A-53 [P2][响应式/测量] Segmented 只观察根尺寸，子项字体/slot 变化可让滑块过期

- 端影响：H5 自定义 slot、异步字体或同宽根内文案变化后 slider width/left 不更新；微信没有 ResizeObserver，更依赖手工 watch，slot 内部变化完全不可见。
- 精确证据：lk-segmented.vue:58-85 watch props；:106-123 H5 读 child offset；:146-159 只 observe root；:162-167 未清理 :148 的 setTimeout；MP 查询也只在这些调度点执行。
- 根因：测量依赖没有覆盖真实影响项宽的子节点、字体与 slot 内容。
- 最佳修复层：H5 observe 每个 item 并监听 fonts.ready；MP 在 slot 数据变更后暴露 refresh/nextTick 测量；跟踪并清理 timer。
- 运行态门禁：V53。

#### A5A-54 [P1][布局/宽度] Space.fill=false 仍由外层占满 100%

- 端影响：H5 与微信非 fill Space 不能与兄弟保持行内排列；fill 开关只改变内层，文档“是否填满父容器”契约失真。
- 精确证据：lk-space.vue:32-37 永远渲染外层 container；lk-space.scss:3-6 外层 width:100%；:8-16 内层才从 inline-flex 切 flex；docs/components/space.md:84-92、125-131 说明 fill 控制宽度/可视根。
- 根因：为裁切/样式增加的包装层改变了 display formatting context。
- 最佳修复层：去掉无必要 wrapper，或外层默认 inline-block/width:auto、fill 时才 block/100%；customClass/style/id 绑定同一可视根。
- 运行态门禁：V54。

#### A5A-55 [P2][边距/单位] Space 的十进制数字字符串生成无效 gap

- 端影响：两端 gap="1.5" 被保留为无单位 1.5，CSS row-gap/column-gap 无效；数值 1.5 却是 1.5rpx。
- 精确证据：space.utils.ts:8-14 只用 /^[0-9]+$/ 识别字符串数字；space.props.ts:23-32 接受 string/number/array。
- 根因：组件自建单位解析器与共享 addUnit 的数值规则分叉。
- 最佳修复层：统一使用共享长度解析器，支持有符号/小数的明确策略并拒绝 NaN；增加 string “0”“1.5” 与 CSS var 测试。
- 运行态门禁：V55。

#### A5A-56 [P1][交互/禁用/无障碍] Tag 的禁用事件不可达，且可点击/关闭节点无键盘语义

- 端影响：H5 与微信 pointer-events:none 让 click-disabled/close-disabled 永不触发；H5 可点击标签和 × 不能键盘聚焦，微信没有 disabled/close label。
- 精确证据：lk-tag.vue:12-27 有 disabled 事件分支，:51-63 用 tap-only view；lk-tag.scss:58-61 阻断所有 pointer events；docs/components/tag.md:61-68 声明四类事件。
- 根因：禁用命中策略与事件报告冲突，交互元素用纯 view 实现。
- 最佳修复层：保留命中并在 handler 守卫；H5 使用 button/role+tabindex+Enter/Space，关闭按钮提供可本地化 label；MP 绑定 accessibility-state。
- 运行态门禁：V56。

#### A5A-57 [P1][样式/圆角] Tag.round=false 没有效果

- 端影响：H5 与微信 round=false 仍是胶囊全圆角。
- 精确证据：lk-tag.scss:3-14 基础 --_radius 已是 --lk-radius-full；:63-65 .is-round 仍设 full；tag.props.ts:51-52 默认 true。
- 根因：默认样式和状态 modifier 重复。
- 最佳修复层：基础使用 md/sm radius，is-round 才 full；或若产品只允许胶囊，删除 round prop。
- 运行态门禁：V57。

#### A5A-58 [P2][API/颜色/文档] Tag.bgColor 在 outline 中被解释为边框色，公开 color 又未进 API 表

- 端影响：两端用户按“背景颜色”传 bgColor，在 outline 下却得到透明背景+同色内描边；demo 依赖 color 的语义色能力，但文档 Props 表遗漏，API 难以发现。
- 精确证据：tag.utils.ts:84-107 在 outline+bgColor 时写 boxShadow 并 background=transparent；tests/unit/lk-tag.spec.ts:48-57 固化该行为；tag.props.ts:54-60 同时有 color/textColor/bgColor，而 docs/components/tag.md:49-59 只列 textColor/bgColor。
- 根因：一个 prop 被不同 variant 复用为不同语义，文档又没完整公开颜色模型。
- 最佳修复层：增加独立 borderColor，bgColor 始终表示背景；完整记录 color 的语义色/自定义色派生规则并提供迁移。
- 运行态门禁：V58。

#### A5A-59 [P2][Avatar/文字/尺寸] 兜底文字会截断 Unicode 字素且不随头像缩放

- 端影响：H5 与微信遇到 emoji、部分扩展汉字或组合字符时，slice(0,1) 可能得到半个代理项/残缺字素；64rpx 与大尺寸头像又共用固定字号，比例失衡。
- 精确证据：avatar.utils.ts:62-64 对字符串直接 slice(0,1).toUpperCase；lk-avatar.scss:3-16 把字号固定为 --lk-control-font-size-md，而实际 width/height 由 avatar.utils.ts:35-47 的 size 独立控制。
- 根因：以 UTF-16 code unit 代替用户可见字素，并把兜底字号从尺寸模型中剥离。
- 最佳修复层：优先 Intl.Segmenter(grapheme)，降级 Array.from；由 size 派生有上下限的 font-size，或增加明确的 textSize prop。
- 运行态门禁：V59。

#### A5A-60 [P1][横切交互/无障碍] 多个会发 click 的自定义 view 没有按钮与键盘语义

- 端影响：H5 键盘用户无法触发 Badge、Card、Cell、Grid item 与 Fab action；微信辅助功能无法识别其可点击/禁用状态。可见文本并不能替代控件角色。
- 精确证据：lk-badge.vue:71-79、lk-card.vue:63、lk-cell.vue:47、lk-grid.vue:80-99 与 :107-126、lk-fab.vue:307-320 均在 view 上绑定 tap；这些节点没有 role、tabindex、键盘 handler 或 accessibility state。
- 根因：跨端模板只实现触摸事件，没有共享的 interactive-root 语义层；部分组件还在“始终可点”和 clickable prop 间语义不一致。
- 最佳修复层：建立共享 action attrs/keyboard composable；H5 用 button 或 role=button+roving tabindex+Enter/Space，微信映射 accessibility-label/state；静态展示态不得无条件暴露按钮语义。
- 运行态门禁：V60。

## 客观验收原则

以下 V01～V60 都是修复后的必做 Peekit 运行配方，不是本次已执行结果。每条必须在 H5 390×844 与微信小程序至少一个当前稳定基础库各跑一次；涉及响应式的再跑 320×568、430×932 或旋转态。每次保存原始 JSON：target、commit、build、device/baseLibrary、route、selector、action、events、rect、computed、errors、timestamp。rect 必须是数值几何，computed 必须来自运行节点，events 必须由页面监听器记录；errors 同时收集 console、pageerror、网络/平台 API fail。任何选择器不存在、事件缺失、样式值不可读或 errors 非空都算失败；截图、肉眼和静态 verified 不得替代这些字段。

### H5 + 微信小程序 Peekit 验收表

表内“H5/MP”分别表示浏览器 DOM probe 与微信开发者工具 automator/selectorQuery probe；“共同”断言必须在两端各自成立。未特别说明时 errors 均要求 console error、uncaught、资源/平台 API fail 为 `[]`。

| ID | H5 selector / action | 微信小程序 selector / action | rect / computed / events / errors 客观断言 |
|---|---|---|---|
| V01 | `.audit-dark-semantic .lk-tag,.lk-progress__bar,.lk-badge`；切换 `.lk-theme-dark` | `page .audit-dark-semantic`；切系统深色并重进页 | computed 采集四类 semantic 与 soft 色；两端同主题色族、亮暗值发生预期变化；events=`theme-change` 一次；errors=[]。 |
| V02 | `.audit-spacing-token > *`；逐一应用 Sass/CSS lg/xl/xxl fixture | 同选择器；重渲染 fixture | rect 间距分别严格等于迁移表；computed 自定义变量与编译 token 同值；events 无；errors=[]。 |
| V03 | `#audit-avatar,#audit-divider,#audit-icon,#audit-space,#audit-cell-group,#audit-grid`；普通/轮播切换 | 对六个 id 分别 `selectorQuery.select`；切 Grid carousel | 每个 selector 恰一节点且 rect 非零；computed class/style 不丢；切分支后 id 稳定；events 无；errors=[]。 |
| V04 | `.showcase-block [data-evidence-id]`；打开 16 个 case | 同 selector；逐路由打开 case | computed/data 必含 commit、target=h5/mp-weixin、build、device/baseLibrary、timestamp、probe URI；events=`evidence-load`; 任一字段缺失时状态必须 pending；errors=[]。 |
| V05 | `.playground-preview .lk-segmented__item`；依次点三项 | 同 selector；tap 第 2/3 项 | rect 至少 3 项且 slider 非零、与 active rect 对齐；computed active 唯一；events=`update:modelValue→select→change`; errors=[]。 |
| V06 | `.playground-preview .lk-image`；默认加载后点击，再显式关闭 preview 点击 | 同 selector；相同动作 | rect 非零；computed/props 记录默认 preview=true、显式 false；events 默认含 click/preview，false 只含 click；errors=[]。 |
| V07 | `.audit-doc-contract` 内 Card/Page/Progress/Space fixture；点击按钮 | 同 selector；tap | computed variant/class 必符合现行 API；events 只有合法 click；构建日志无 unknown prop/value；errors=[]。 |
| V08 | `.avatar-demo .lk-avatar,.meta-row-demo .lk-avatar`；依次加载、失败、预设尺寸 | 同 selectors/actions | rect 尺寸与公开表相等；computed fallback 图标/文字可见且非空；events 按新契约；errors=[]。 |
| V09 | `#audit-avatar-alt image`；模拟成功与 404 | `#audit-avatar-alt`；成功/失败各一次 | rect 非零；computed alt/accessibility-label=`测试头像`；events 每次只发对应 load/error 且 payload.src 正确；404 为预期资源状态，不得出现未处理错误。 |
| V10 | `#audit-badge-color .lk-badge > text`；设 color=#000 | 同 selector/action | rect 可见；computed color 为 rgb(0,0,0)；events 无；errors=[]。 |
| V11 | `#audit-badge-standalone .lk-badge-wrapper`；前后放行内文本 | 同 selector/action | wrapper rect.width/height ≥ badge rect，兄弟 rect 不重叠；computed badge 非 absolute 或 wrapper 有真实占位；events 点击只发 badge click；errors=[]。 |
| V12 | `#audit-button-default,#audit-button-square` | 同 selectors | rect 同尺寸；computed square radius=0/约定方角且小于 default；events 各 click 一次；errors=[]。 |
| V13 | `#audit-card-hover`；鼠标 hover、pointer down/up | 同 selector；touchstart/end | computed 必出现已定义的 hover/active 降级，或组件明确无 hoverable 且 fixture 编译拒绝旧 prop；events 不含未知 prop 警告；errors=[]。 |
| V14 | `#audit-card .lk-card__title,.lk-card__extra,.lk-card__footer,.lk-card__body`；逐区点击 | 同 selectors；逐区 tap | 各 rect 在 card 内；events 严格匹配修复后的 source 矩阵且每动作无重复根 click；errors=[]。 |
| V15 | `#audit-card-padding .lk-card__header,#audit-card-padding .lk-card__body,#audit-card-padding .lk-card__footer`；设 `16rpx 24rpx` | 分别查询三个完整 selector；相同 action | rect 左右边界按 24rpx 对齐，上下按 16rpx/区域规则；computed padding 每项为合法四值；events 无；errors=[]。 |
| V16 | `#audit-cell-top,#audit-cell-center`；放两行 title 与单行 value | 同 selectors/action | top 的左右首行 top 差在容差内；center 的内容中心差≤1px；computed align-items 分别 flex-start/center；events 无；errors=[]。 |
| V17 | `#audit-cell-group .lk-cell`；border 默认与显式 true/false 切换 | `#audit-cell-group` 内逐 Cell selectorQuery；同动作 | 相邻 rect 连续；computed border-top true 时非 0、false 时 0，默认与文档一致；events 无；errors=[]。 |
| V18 | `#audit-cell-long .lk-cell__left,#audit-cell-long .lk-cell__titles,#audit-cell-long .lk-cell__right,#audit-cell-long .lk-cell__arrow`；注入 200 字及长数字 | 分别查询四个完整 selector；相同 action | 全部 rect 在 cell rect 内、arrow 不被挤出；computed min-width=0、right shrink 策略明确；events click 一次；errors=[]。 |
| V19 | `#audit-divider-vertical`；渲染文档修正示例 | 同 selector | rect.height>rect.width；computed aria-orientation/accessibility orientation=vertical；events 无；errors=[]。 |
| V20 | `#audit-fab .lk-fab__main`；鼠标 click、Enter、短 tap、300ms 不移动长按、实际拖动 | 同 selector；tap、longpress、touch drag | rect 非零；click/tap 各发 click 一次，draggable=false 仍可点；非移动不发 drag，真实移动严格 drag-start→move+→end 且不 click；errors=[]。 |
| V21 | `#audit-fab-overlay .lk-overlay`；展开后点遮罩 | 同 selector/action | 展开时 overlay rect 覆盖 viewport，computed z-index=Fab-1；events open→overlay-click→update:false→close；errors=[]。 |
| V22 | `#audit-fab-disabled .lk-fab__action.is-disabled`；点击 | 同 selector；tap | rect 可命中、computed disabled 视觉与 accessibility state；events 只有 action-disabled，无 action-click/close；errors=[]。 |
| V23 | `#audit-fab-color .lk-fab__action`；设置 action.color 与默认 zIndex | 同 selector/action | computed 背景/前景等于契约色、根 z-index 等于文档/层级 token；events action-click payload.color 正确；errors=[]。 |
| V24 | `#audit-fab-px .lk-fab__main`；在 320/390/430px 视口设 size=56px | 同 selector；三种模拟窗口 | 每个 rect.width/height 都为 56px±1，不随视口变化；computed 长度无二次 rpx 换算；events 无；errors=[]。 |
| V25 | `#audit-fab-responsive`；resize、旋转、动态改 position/size/offset | 同 selector；模拟 resize/旋转并 setData/props | 每步 rect 都在 safe viewport 内并保持锚点偏移；computed position 更新；events 无重复 direction-change；errors=[]。 |
| V26 | `#audit-fab-direction`；改变空间和 preferred direction | 同 selector/action | rect action 全在 viewport；computed resolved direction 正确；events 每次实际方向变化只发一次，纯读取不发；errors=[]。 |
| V27 | `#audit-grid-ripple .lk-grid__item:nth-child(3)`；点第三项中心 | 对第三项唯一 id/data selector tap | wave rect 中心落在第三项点击点容差内、不在第一项；computed active 只在第三项；events click index=2；errors=[]。 |
| V28 | `#audit-grid-gap .lk-grid__item-text`；itemGap=0 | 同 selector/action | text 与 icon rect 间距=0；computed margin-top=0px；events 无；errors=[]。 |
| V29 | `#audit-grid-pages .lk-carousel__item-wrap`；carousel=true、columns 缺省/显式切换 | 同 selector/action | 未提供 columns 时按新契约拒绝并有诊断，或每页容量与自动列数一致；rect 每页非单项意外退化；events page-change 合法；errors 无未处理异常。 |
| V30 | `#audit-grid-root`；切 carousel/clip | 同 id/action | 根 rect 与 id 稳定；computed overflow 在 clip=true 为 hidden、false 为 visible；events 无；errors=[]。 |
| V31 | `#audit-grid-disabled .lk-grid__item.is-disabled`；点击/键盘尝试 | 同 selector；tap | computed opacity/color/disabled state 可区分；events 只有 click-disabled；rect 与普通项尺寸一致；errors=[]。 |
| V32 | `#audit-grid-public-type .lk-grid`；先以公开 barrel 编译 H5/MP fixture，再运行 | 同 selector/action | 两目标类型构建成功；rect 非零；computed columns 正确；events click payload 符合 GridItem；errors=[]。 |
| V33 | 独立 consumer harness `.audit-icon-consumer .lk-icon`，不复用仓库 App.vue | 同独立 harness selector；冷启动 | rect 非零；computed font-family=lk-icons 且 glyph 非空；events/font-init 记录 scope=global；errors 无字体加载失败。 |
| V34 | `.audit-icon-page-a .lk-icon` 后导航 `.audit-icon-page-b .lk-icon`；强制 global 首次失败 | 两个真实页面依次进入；相同故障注入 | 两页 rect/glyph 都可见；computed font-family 正确；events 记录 page fallback 后 global retry/每页加载，不被单一 loaded 短路；errors 仅包含受控首次失败且最终 cleared。 |
| V35 | `#audit-icon-action[aria-label]`；Tab→Enter/Space→click | 同 id；检查 accessibility-label 后 tap | rect 命中尺寸≥约定；computed role/button、aria-hidden=false；events 每动作 click 一次；装饰 icon 仍 aria-hidden；errors=[]。 |
| V36 | `#audit-icon-box-px .lk-icon-bg-box` 与内部 icon；size=24px | 同 selectors/action | icon rect=24px；box rect 按明示规则且两端比例一致，不是隐式 64rpx 漂移；computed box size 有合法单位；events 无；errors=[]。 |
| V37 | `#audit-icon-loader-result`；调用 getBuiltInIcon(已知名/未知名) 并渲染结果 | 同 harness；确认 MP 构建不引入不支持 loader、字体 icon 仍显示 | H5 known 结果非空且 rect 可见、unknown=null；events=`loader-resolve` payload 明确；MP rect 非零；errors=[]。 |
| V38 | `#audit-image-cover,#audit-image-contain,#audit-image-fill`；用同一非方图 | 同 selectors/action | 三者 rect 同尺寸；computed/native mode 分别为映射后的 aspectFill/aspectFit/scaleToFill，像素裁切策略与契约一致；events load 一次；errors=[]。 |
| V39 | `#audit-image-empty`；src='' 后再赋有效 URL | 同 selector/action | 空态 rect 稳定，computed loading=false/idle；赋值后 loading→loaded；events 空态不发 load/error，有效源只发 load；errors=[]。 |
| V40 | `#audit-image-race`；A 慢、切 B 快、A 后返回，再令 B 失败点击占位 | 同 selector；用受控本地/测试域请求顺序 | 最终 computed/占位只代表 B；events 中旧 A 标记 ignored，失败态点击不发 preview；preview callback src 固定为请求时 URL；errors=[]。 |
| V41 | `#audit-image-accessible[aria-label]`；Tab→Enter，装饰图片另测 | 同 id；读 accessibility-label 后 tap | rect 非零；computed role/alt/label 正确，装饰态 hidden；events 键盘/触摸各 click→preview 一次；errors=[]。 |
| V42 | `#audit-meta-main-only .lk-meta-row__start,#audit-meta-main-only .lk-meta-row__main,#audit-meta-main-only .lk-meta-row__end,#audit-meta-bottom-only .lk-meta-row__main-top,#audit-meta-bottom-only .lk-meta-row__main-bottom` | 分别执行五个完整 selectorQuery；相同 action | 空区 selector 不存在或 rect=0；main-only 左右贴合根；bottom-only 无 phantom top gap；computed margin/padding 只出现在非空相邻区；events 无；errors=[]。 |
| V43 | `#audit-meta-start .lk-meta-row__start,#audit-meta-start .lk-meta-row__main,#audit-meta-start .lk-meta-row__end,#audit-meta-center .lk-meta-row__start,#audit-meta-center .lk-meta-row__main,#audit-meta-center .lk-meta-row__end,#audit-meta-end .lk-meta-row__start,#audit-meta-end .lk-meta-row__main,#audit-meta-end .lk-meta-row__end` | 分别执行对应九个完整 selectorQuery；相同 action | side 与 main rect 分别按顶部/中心/底部在≤1px 容差对齐；computed align/self 不互相覆盖；events 无；errors=[]。 |
| V44 | `#audit-page .lk-page__left-slot,#audit-page .lk-page__top-placeholder`；resize/旋转 | 分别查询两个完整 selector；旋转模拟器并触发 onShow | rect 与最新状态栏/胶囊 bounding rect 对齐且不遮内容；computed top/height 实时变化；events geometry-change 每次一次；errors=[]。 |
| V45 | `#audit-page-style .lk-page__scroll-view`；传 string 与 object 两 fixture | 同 selector/action | 两目标构建无 prop warning；rect 非零；computed color/padding 等于对象与字符串输入；events scroll 按契约；errors=[]。 |
| V46 | `#audit-progress-gradient .lk-progress__bar`；color=linear-gradient | 同 selector/action | rect.width=percentage；computed background-image 包含 linear-gradient 且不为 none；events change 合法；errors=[]。 |
| V47 | `#audit-progress-a11y`；把 percentage 20→70→100 | 同 selector/action | rect 宽度递增；computed role/min/max/now 或 MP accessibility value 依次 20/70/100；events change，跨 100 只 complete 一次；errors=[]。 |
| V48 | `#audit-progress-zero .lk-progress__track,#audit-progress-negative .lk-progress__track`；设 0、-1 | 分别查询两个完整 selector；相同 action | rect.height 严格符合新契约（0 或 clamp min）；computed 非无效/意外 12px 回退；events/诊断与 validator 一致；errors 无未处理异常。 |
| V49 | `#audit-progress-stripe .lk-progress__stripe`；取 t0/t500 背景位置，分别全量/按需样式构建 | 同 selector/action | 两构建 computed animation-name 唯一且位移方向相同；events animationstart/iteration 可观测；errors=[]。 |
| V50 | `#audit-segmented-scroll`；横向拖到末项并选择 | 微信 `scroll-view#audit-segmented-scroll`；scrollTo/tap 末项 | scrollWidth>clientWidth，scrollLeft 增长；末项 rect 进入 viewport，slider 与其重合；events scroll→update/select/change；errors=[]。 |
| V51 | `#audit-segmented-a11y [role=tab]`；Tab、ArrowRight、Home/End、Enter | 同 items；读取 accessibility state 并 tap | H5 role/tabindex/aria-selected 唯一且键盘序列正确；MP label/selected/disabled 正确；events 每次选择一次；errors=[]。 |
| V52 | `#audit-segmented-duplicate .lk-segmented__item`；传重复 value | 同 selector/action | 修复策略若拒绝则不渲染歧义项且输出一条结构化诊断；若规范化则 keys 唯一且 active 唯一；events 不得多发；errors 无 uncaught。 |
| V53 | `#audit-segmented-dynamic .lk-segmented__item,.lk-segmented__slider`；异步换长文案/slot/字体 | 同 selectors；更新数据后调用受支持 refresh/等待 nextTick | item rect 改变后 slider width/left 同帧或约定帧更新并重合；events 无伪 change；卸载后 timer/observer=0；errors=[]。 |
| V54 | `#audit-space-inline-a,#audit-space-inline-b,#audit-space-fill`；切 fill | 同 selectors/action | fill=false 两个 root rect 同行且宽度等于内容；fill=true rect.width=父宽；computed display/width 符合契约；events 无；errors=[]。 |
| V55 | `#audit-space-decimal .lk-space`；gap='1.5' | 同 selector/action | 相邻 child rect gap=对应 1.5rpx 转换值；computed row/column-gap 有单位且非 invalid；events 无；errors=[]。 |
| V56 | `#audit-tag-disabled,#audit-tag-disabled .lk-tag__close`；click、Tab/Enter/Space | 同 selectors；tap tag/close | rect 可命中；computed disabled/role/label 正确；events 分别只 click-disabled、close-disabled，不发 click/close；errors=[]。 |
| V57 | `#audit-tag-square,#audit-tag-round` | 同 selectors | rect 同高；computed square radius 小于 round，round≈height/2；events 无；errors=[]。 |
| V58 | `#audit-tag-outline-bg,#audit-tag-outline-border`；分别设 bgColor/borderColor/color | 同 selectors/action | computed bgColor 始终体现在 background，borderColor 只在边框，语义 color 派生可预测；events click payload 不受影响；errors=[]。 |
| V59 | `#audit-avatar-grapheme,#audit-avatar-small,#audit-avatar-large`；分别传 emoji/组合字与 48/128rpx | 同 selectors/action | grapheme fixture 各只显示一个完整用户可见字素且 textContent 无 U+FFFD/孤立代理；rect 为 48/128rpx，computed font-size 按约定比例且在上下限内；events 无；errors=[]。 |
| V60 | `#audit-badge-action,#audit-card-action,#audit-cell-action,#audit-grid-action,#audit-fab-action`；逐个 Tab→Enter/Space，再鼠标点 | 同五个 selector；读取 accessibility 属性后逐个 tap | 每个 rect 非零且焦点可见；computed role/name/disabled 正确；events 每个动作只发一次相应 click，禁用态只发 disabled 事件；静态态不伪装按钮；errors=[]。 |

## 合理边界与不误判项

- Icon 生成资产已做静态一致性核对：codepoints 与六套样式定义均为 1,031 项，无重复、无缺失、码点一致；base64 解码为 84,852 bytes，SHA256 与 lk-icons.woff 的 `d94a57b8207738256c11af353b8d169b402fed70dd99393c92c5344ddb7bedbb` 完全一致。它只能证明生成物一致，不能证明微信真机字体已加载。
- woff2 与 woff 是不同编码产物，SHA/字节数不同不是缺陷；本报告只校验 base64 明确声明的 woff 对应关系。
- CSS gap、overflow-x、@font-face、safe-area 等能力是否在某个微信基础库可用，不能仅凭静态源码下结论；A5A-50 等明确保留为运行态门禁。
- Grid 的 Carousel autoHeight 还可能继承轮播组件自身的异步内容测量边界；本批只记录 Grid 引入的分页/root/ripple 问题，不重复其他批次 Carousel 问题。
- Image 的网络失败、字体 CDN/本地 fallback 与 previewImage 授权必须使用可控测试资源/故障注入，不能把公共图片站或偶发网络成功当验收。
- 纯静态可证明的 API 漂移、不可达事件、错误 prop 名和 CSS 覆盖已列为问题；涉及“可能”的 MP 样式隔离/overflow 行为仍要求 V17/V50 实机/开发者工具证据后再关闭。
- generated screenshot、visual diff 和人工肉眼可以辅助定位，但不能代替 selector、rect、computed、events、errors 五类结构化证据。

## 完整覆盖总账

记法：L 为 UTF-8 文本的物理行数（包括空行）；BIN 为二进制字节数。SHA256 均基于基线工作树原始字节。报告自身不进入审计分母。

| 仓库相对路径 | 行/字节 | SHA256 |
|---|---:|---|
| `docs/.vitepress/theme/components/PropsPlayground.vue` | L:674 | `f9f2c7bdd94218a436c09d6bc9480dcda4e1e55d6021809b0ded83c12396addb` |
| `docs/.vitepress/theme/constants/preview.ts` | L:11 | `84c95e02368a8785c718e3c7d0d3bb0442ccdbf7baa38d0f155e198bc674a169` |
| `docs/components/avatar.md` | L:65 | `1bbce0d6de0272fd1a8980b024e94f8ad08b196d6a729a3760e7c742e3ca5ae6` |
| `docs/components/badge.md` | L:65 | `c2c12a05e972bc43122d36f01da501ae634d35f32193f76ab8bf575a8423ac95` |
| `docs/components/button.md` | L:83 | `98f358ed991fa55f8fa506046ad62158d4a73331fb255b905929cc92a98dd5aa` |
| `docs/components/card.md` | L:144 | `f8dd6f27808706dee27711f1724763aea33951fc4a203547ed272976e88f6004` |
| `docs/components/cell.md` | L:77 | `d998d56c9ea2e539510f6ed41d8abd0f2daa4f2190ca0b7f059cddc50428a833` |
| `docs/components/divider.md` | L:66 | `0f5d9d11c211c1aebda4204ddc89e01c0875905706dec48348cfafb042e30378` |
| `docs/components/fab.md` | L:177 | `795e5c0e2cb291707897d85166b4cb38f2ef129553843015e95e3f332527af7f` |
| `docs/components/grid.md` | L:129 | `7308950e0d4b7140495b3377cf2a6c6ccc61dfccabe0d029d6d0ee96f5e3cd74` |
| `docs/components/icon.md` | L:78 | `78cc53ea17390c9edc89ae6b2b17390730f696c527d8ce4fdef962003be0c796` |
| `docs/components/image.md` | L:144 | `a94176d8403578eff310276a00d130920b4ec0cb434403a1e2c947625a699ca9` |
| `docs/components/meta-row.md` | L:105 | `524dde1bae4392c6bb1cdf41026ea7cb9be54ecad4c06bf28595b94734a5fdf8` |
| `docs/components/page.md` | L:101 | `a61d6279eb803ed266aab364128fd426ab8fe5187d32c31b0a1005849159a4ac` |
| `docs/components/progress.md` | L:150 | `e2cd8e05b943100f1406caf9afc6c7c811c986f06abe253c1ca31938b2f9b6de` |
| `docs/components/segmented.md` | L:205 | `da084df0604752f595dfac9b3e7dc41f4f5a426873a737166e2ac773c1e34623` |
| `docs/components/space.md` | L:151 | `a7b46462b123d819a48891f71601f3154200233e03a3fd5203a28b8a514ad672` |
| `docs/components/tag.md` | L:74 | `d80b74f313e3485a8367912ff8f87d8c07ee1262e6b1b3677139b5ed0e826fce` |
| `docs/guide/svg-assets.md` | L:214 | `b0f1eb4af97f1bab41bce2c156678187113ec4a6834754ad6e46dfdb178e0183` |
| `src/App.vue` | L:93 | `f046e161b04ae34a64259d30b771b36f9dc5e60d2afbe0c47582bd0789f26e27` |
| `src/components/demos/avatar-demo.vue` | L:107 | `d220651a1a885a6dafd334d9a0d75dc0efe0488c4171c8a90a6a5b5c636133d9` |
| `src/components/demos/badge-demo.vue` | L:145 | `6bedc3c1b8e2337fbb1cca706c304403c28d5e867c014ce16c30fdad139b0fd7` |
| `src/components/demos/button-demo.vue` | L:100 | `ee527ddd572a5a2511f88d0a525edd5434febb18d9759f38eb142324f6c2cbd6` |
| `src/components/demos/card-demo.vue` | L:428 | `897479638713036a0baa7f4cdd7cd6ed7757e07ded782edb3fa765c1a600db4f` |
| `src/components/demos/cell-demo.vue` | L:68 | `19049c6dceb770a9a703349e18835d95e61c45f6bbf9255409b9aab603b344e9` |
| `src/components/demos/divider-demo.vue` | L:92 | `ff29d4e38094624e3fbc5fa601c9d2477d0d864dc1d157ee2a6503dc75a9e0bf` |
| `src/components/demos/fab-demo.vue` | L:134 | `b703d1740805e124cd8093d5e9485c1a22b7d40041ebde2690193bbb300387a5` |
| `src/components/demos/grid-demo.vue` | L:31 | `fbdd05925cde5013dba1eaf0eb84c14e6bfac6bf3f7a93121a1aa1da80871b33` |
| `src/components/demos/icon-demo.vue` | L:352 | `c5274dcf1507dc2684a6271e5280f7311f4db3bbbfc837b32062398ef7b82530` |
| `src/components/demos/image-demo.vue` | L:266 | `b84632e8995efbd6e3fb51f7e0b422d2af6e1fabb1114757db4a92798df031de` |
| `src/components/demos/meta-row-demo.vue` | L:101 | `f12d1cb06abc4c38a3c402fb23cf7cc155dec99a52d1fe94f33374bd3e00eb7c` |
| `src/components/demos/page-demo.vue` | L:426 | `a32154d0181c2c5c1edd760ba062541b4b7c8d0eaf06e05e36cbd7000655669b` |
| `src/components/demos/progress-demo.vue` | L:84 | `907bd48e9c0f60e8166cf104baef31461d1e2ae72d1031c3fafe052a1613695e` |
| `src/components/demos/segmented-demo.vue` | L:193 | `d3600227efe475c069ec744e9b54428d32c7953e31e768a28d89663a751a26fd` |
| `src/components/demos/space-demo.vue` | L:49 | `89a8d23192d502ef288a017c80240c191b9d8d4844e1087bc0f6b2ab65955a83` |
| `src/components/demos/tag-demo.vue` | L:127 | `c1f0fc5584c1e64578e28fa19b15ccc44fb5949b550c7ee61129ce97b97ea036` |
| `src/components/preview/preview-catalog.ts` | L:684 | `967afcad48654589aeae4de9e49f80bb2c912e3d4fed8b70a39c40d03f28ed52` |
| `src/components/preview/preview-demo-registry.ts` | L:85 | `2a7b9ca6a53344c4b5b6d5723886ca0e197479c2ba9c51beeab4371939f45a5d` |
| `src/components/preview/PreviewDemoRenderer.vue` | L:167 | `384ebd26037ad17260d3e1e9075e848ba51fefed6e76a76ebe5fc028f36da297` |
| `src/components/preview/PreviewLocalePicker.vue` | L:115 | `ee5f4f2e98debdaae241a66e6279bcef42a4beab4fb4287e4e98a95205a994d8` |
| `src/components/showcase/component-case.vue` | L:182 | `058fedfe129ccf84158163128b94923ace9ed82bfa3d100ff7d3abc4d87b6cad` |
| `src/components/showcase/showcase-cases.ts` | L:664 | `ab131d0afac2823dae26d1ce783136c16417c0aaa34e5abe8dfec6bef6dc032f` |
| `src/composables/usePreviewQuery.ts` | L:68 | `9fdf1eccf8bbcb118eec98d7ddf14e9da93705f08636d889a46fd58c4352df2b` |
| `src/pages_sub/component-detail/index.vue` | L:273 | `2d585a5bdb2207fd56ad1bbb3d1d5987c2d1e47bf2d0fc592930707272f5cf0f` |
| `src/pages_sub/playground/index.vue` | L:303 | `7827193da2343621e7fb21e7cd586390e115a44ea16383163d583a303ab90389` |
| `src/pages_sub/showcase/index.vue` | L:301 | `9650fdb2050e05c413450ae2797be358b968520881ce4287365d672d76db8380` |
| `src/uni_modules/lucky-ui/components/common/props/index.ts` | L:195 | `42959195090c409562b91481b05d13af3ebcc511b21590b495ec1da7bb04bd4b` |
| `src/uni_modules/lucky-ui/components/demo-block/demo-block.scss` | L:54 | `859ee853ebc5255023573630a371a2e071ceb7678e42e7059a49add0d09aec46` |
| `src/uni_modules/lucky-ui/components/demo-block/demo-block.vue` | L:26 | `4ac1fbc8896ae6757993a66af8dc2b2737374dc2742f8d6e62cac3611a327827` |
| `src/uni_modules/lucky-ui/components/lk-avatar/avatar.props.ts` | L:51 | `d9d66cd695f92936d2a2aecfbc3fd0a1d07af54f2fb6126bcbe9d2fcfcb11919` |
| `src/uni_modules/lucky-ui/components/lk-avatar/avatar.utils.ts` | L:64 | `790b1af3af5f3bc1d35d67f96bca37d5d8a8cfe653705bfefe203c0ebdb8ef56` |
| `src/uni_modules/lucky-ui/components/lk-avatar/lk-avatar.scss` | L:41 | `5e586a0f72330eef03de662aae7de2286e0599a69f2732a54780112b676f218f` |
| `src/uni_modules/lucky-ui/components/lk-avatar/lk-avatar.vue` | L:71 | `a0c472e94f83168a94373d87af769b7694877fc4b046ba35fc7daeed4e5f71c0` |
| `src/uni_modules/lucky-ui/components/lk-badge/badge.props.ts` | L:68 | `0d233fdcd05c8a6a81b3ed001b05854b667ad363b518fbeaa9baabcb1ef04d81` |
| `src/uni_modules/lucky-ui/components/lk-badge/badge.utils.ts` | L:65 | `79253d7139367ad828a90ca36c42a9ff1353bf7e6f73319e1785114044cc7915` |
| `src/uni_modules/lucky-ui/components/lk-badge/lk-badge.scss` | L:47 | `35e6a9856e1e3e9a6630462d6706953564c211cf72f3ca46ab1b533843dedc38` |
| `src/uni_modules/lucky-ui/components/lk-badge/lk-badge.vue` | L:85 | `4ca8f039ccf4187ff5dd23e7dbe118b61e3633e9f7ce0a82b270042c9dca7409` |
| `src/uni_modules/lucky-ui/components/lk-button/button.props.ts` | L:206 | `fe0557a7782b75ceb3db1eb1507d42f318bde8984f4366279dcaa248b4cfcf4a` |
| `src/uni_modules/lucky-ui/components/lk-button/button.utils.ts` | L:69 | `587b0e057fd92ea413814634bcd8e2e5880197e5359bd14d29b89d1d4bda2dd9` |
| `src/uni_modules/lucky-ui/components/lk-button/lk-button.scss` | L:175 | `878b3468ae3364b03cfc8ec85e968b24298de6b378eaa8c1b26b93ce0bef27bc` |
| `src/uni_modules/lucky-ui/components/lk-button/lk-button.vue` | L:158 | `d9482a4ca02ef85eda682ae897fb634a30cdf3796f61c7685767c90e79ced71f` |
| `src/uni_modules/lucky-ui/components/lk-card/card.props.ts` | L:41 | `19b961945f239ee76607957e585e810b5865ae97479118726acb8740943f8842` |
| `src/uni_modules/lucky-ui/components/lk-card/card.utils.ts` | L:70 | `0c7c6705119d602e4bff12335d31eb04781031e677b16e837e8ad70dbdeef921` |
| `src/uni_modules/lucky-ui/components/lk-card/lk-card.scss` | L:83 | `73e946c70aea32a338db09fa0f2daa16d64a79aee5bcb8cbdce72e17e87ac2e0` |
| `src/uni_modules/lucky-ui/components/lk-card/lk-card.vue` | L:99 | `f1ee6fc011d334b29ab61110ceb97d1f855c686d7e11824b4631f0e439cbd76e` |
| `src/uni_modules/lucky-ui/components/lk-carousel/carousel.props.ts` | L:118 | `8dc39f95af5e3b13ab472065420875c2d4f3cf5239aa15ce5547ec069b1a731e` |
| `src/uni_modules/lucky-ui/components/lk-carousel/carousel.utils.ts` | L:250 | `e666993369224fa0206a5afc1e8fdfab7d390368de5193f381989854270b3f7d` |
| `src/uni_modules/lucky-ui/components/lk-carousel/lk-carousel.scss` | L:193 | `29d016b00b5f0fa80e32e9d0858ad72126e740d8f636a40a509b83f9da5beb23` |
| `src/uni_modules/lucky-ui/components/lk-carousel/lk-carousel.vue` | L:393 | `5db375e5f67c0ac3051312f943d8fefad1f2d1edb51f3debef7b599775ba0e54` |
| `src/uni_modules/lucky-ui/components/lk-carousel/lk-carousel-item.vue` | L:59 | `8dbe2a2426525150307583e92a4ee3ebbb22d03e99f8d49aa98ba5a77da70c0f` |
| `src/uni_modules/lucky-ui/components/lk-cell/cell.props.ts` | L:46 | `8a9560edb20ec2bd830ba224f159e1c552513ea3dc35ad7e43c4c91d6cb6db1d` |
| `src/uni_modules/lucky-ui/components/lk-cell/cell.utils.ts` | L:55 | `34731d590d425075b8cd6cd1867de0f790ae51197aff110a68976bfad3db1c88` |
| `src/uni_modules/lucky-ui/components/lk-cell/lk-cell.scss` | L:134 | `1463e8134d6ac972781440dbfdd381628b8cac73bed3319b6a94afd8cb791e0b` |
| `src/uni_modules/lucky-ui/components/lk-cell/lk-cell.vue` | L:85 | `8d97b6b0e86f925e5e63540f00e59c9df9eaf18cc1cc5deda0565142e213f032` |
| `src/uni_modules/lucky-ui/components/lk-cell/lk-cell-group.vue` | L:39 | `5cf1fb21a615f8064d08495917ce9b44c2f49ff03b2a27a56a325baec1d935ad` |
| `src/uni_modules/lucky-ui/components/lk-divider/divider.props.ts` | L:43 | `9202d5a3634dc6c9ac19539596ce81e228b163bff8e0bd7581a0aab366099832` |
| `src/uni_modules/lucky-ui/components/lk-divider/divider.utils.ts` | L:68 | `6c20bc19d94e3252d2fd872bcd1ba6ac664a3fcded4b89bf762c6d52e60307c8` |
| `src/uni_modules/lucky-ui/components/lk-divider/lk-divider.scss` | L:75 | `0525c2cebf7f5322f9a7aac050a9b8243c5feb1d9119f24b609575928ef3c3bd` |
| `src/uni_modules/lucky-ui/components/lk-divider/lk-divider.vue` | L:67 | `e45cf12775491009e16973954941b9095d43d7979c39cef0ec404332ee33862e` |
| `src/uni_modules/lucky-ui/components/lk-fab/fab.props.ts` | L:147 | `a9d58b1d3bf00c0d77f7114f51d8b202f1926fcf2b157f4a89f49b5b83df5bf7` |
| `src/uni_modules/lucky-ui/components/lk-fab/fab.utils.ts` | L:277 | `5694e42dc1422e8f477aec3d9f616987c0134c1cd2baa7ef9a84ae69677275fc` |
| `src/uni_modules/lucky-ui/components/lk-fab/lk-fab.scss` | L:131 | `dc16c23a818320902427c426c3c562009629488c4b711dc6bd506aac447a7c95` |
| `src/uni_modules/lucky-ui/components/lk-fab/lk-fab.vue` | L:336 | `60ba79d8b5c03a1eba621fbe72a8bb35974089fa5433cbab74bb34fe906f72f2` |
| `src/uni_modules/lucky-ui/components/lk-grid/grid.props.ts` | L:62 | `ab74243b690533668003296537191c2324cfb7e55ee59aa316e55a329b9fa767` |
| `src/uni_modules/lucky-ui/components/lk-grid/grid.utils.ts` | L:83 | `9ffb47b26304da76a6c727df8642a84d774a9f58898da833e719c6873fed29ca` |
| `src/uni_modules/lucky-ui/components/lk-grid/index.ts` | L:2 | `c211fba24c969a7d4a87942754b1fea4ca2b38bad9dc815a5a2e4de7e306122d` |
| `src/uni_modules/lucky-ui/components/lk-grid/lk-grid.scss` | L:33 | `3ed03f4fa831d2e4600c161db3854e2e26e4a186151e7be667c28638fcd55c1a` |
| `src/uni_modules/lucky-ui/components/lk-grid/lk-grid.vue` | L:135 | `f2a751ef0fe3434bc119cb9a480ca363fc9bacdf4cdfdf0d0f096f92bcca8ca6` |
| `src/uni_modules/lucky-ui/components/lk-grid/README.md` | L:0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `src/uni_modules/lucky-ui/components/lk-grid/types.ts` | L:1 | `f761c91419d0a89422a0004ef1a92929dd4d2d5e5c16758654d8b0467d1998c6` |
| `src/uni_modules/lucky-ui/components/lk-icon/codepoints.ts` | L:1041 | `58f73e56c16595bc27ea8a3224263c6676615bb77f999414e9c10958b56f0a13` |
| `src/uni_modules/lucky-ui/components/lk-icon/fonts/lk-icons.base64.ts` | L:3 | `e5ec609f31b87965f03b84174f770c993880b2b2aacb44cf86b66a63fcdfa0c7` |
| `src/uni_modules/lucky-ui/components/lk-icon/fonts/lk-icons.css` | L:3108 | `94869fdd96e79bc394dcc097503a6a618dda486771e76212844e1f7117b03714` |
| `src/uni_modules/lucky-ui/components/lk-icon/fonts/lk-icons.less` | L:1046 | `a544498bdbd07a8e4e9e2e7eaeee77afb99b668511f814f58031140aea43b381` |
| `src/uni_modules/lucky-ui/components/lk-icon/fonts/lk-icons.module.less` | L:1048 | `c3526aeb6f53cbb607824d30bc862f3b3e85a2bf86b75f4b92fc43588985b4c1` |
| `src/uni_modules/lucky-ui/components/lk-icon/fonts/lk-icons.scss` | L:4140 | `d4a0e712814000f4683f40fb7ba7b6bad754e3dd15c5dfa74d14184edd98a178` |
| `src/uni_modules/lucky-ui/components/lk-icon/fonts/lk-icons.styl` | L:2078 | `e1ef1cb16ec0104c6f466825425374cb33239772bcc617e1934bbe02f4aeb993` |
| `src/uni_modules/lucky-ui/components/lk-icon/fonts/lk-icons.woff` | BIN:84852B | `d94a57b8207738256c11af353b8d169b402fed70dd99393c92c5344ddb7bedbb` |
| `src/uni_modules/lucky-ui/components/lk-icon/fonts/lk-icons.woff2` | BIN:63552B | `83b7fba8f570d07eb07fc3e8e29124c6b4bf660ca67628917f52c51c55fe5c6d` |
| `src/uni_modules/lucky-ui/components/lk-icon/fonts/lk-icons-definitions.css` | L:3101 | `e68bb23c5db95620e8227e2c121bc59d38394a059e1376e8b13cc9ca1e8c438f` |
| `src/uni_modules/lucky-ui/components/lk-icon/icon.props.ts` | L:51 | `4d27248a3c9381a1811635f1fa422dc24b78a42f779627e63ab1dd22e919611d` |
| `src/uni_modules/lucky-ui/components/lk-icon/icon.utils.ts` | L:143 | `cdd0388792138e5f0e0e633f5e8fff6b2843755b27d0e803010f25a7fc7e3267` |
| `src/uni_modules/lucky-ui/components/lk-icon/icons.ts` | L:29 | `5b45768659582af486d750d9a6e1e6ac1c3828e6d686a82bbbebfdd56fcf8333` |
| `src/uni_modules/lucky-ui/components/lk-icon/lk-icon.scss` | L:36 | `660a521dae3e8fafcdfeff50242a71a5386952a890e6e8df87d162878613677b` |
| `src/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue` | L:103 | `0d7f314a938d56feb22eec47a38f40ac3fd1624a8b7a5bbea138c5d8df53fc96` |
| `src/uni_modules/lucky-ui/components/lk-image/image.props.ts` | L:64 | `359cdb230ff9be198e652cffd80d233e9da35f5a1e02d71b8dce12b66fb10812` |
| `src/uni_modules/lucky-ui/components/lk-image/image.utils.ts` | L:66 | `1c424e47cd47f8995d6a701456fe907c7dfbebc6b2f912d21e28fe035b5c7a5e` |
| `src/uni_modules/lucky-ui/components/lk-image/lk-image.scss` | L:66 | `8e422ac938f2702caeaa4c474a5a5d797bf0087e10182ca390523ba1a12d708b` |
| `src/uni_modules/lucky-ui/components/lk-image/lk-image.vue` | L:89 | `15e5da4c89a592427b820994a74c313170f9e9820bca58a46427596cac523cf2` |
| `src/uni_modules/lucky-ui/components/lk-meta-row/lk-meta-row.scss` | L:72 | `4f1ff45fbacd6e14fd4d804aedd4e77b3a20e3977b9f25944b9ec4c2cbb08817` |
| `src/uni_modules/lucky-ui/components/lk-meta-row/lk-meta-row.vue` | L:64 | `237574ae00ada8c706f310e4fa25ab70eb69be1616e4a0f98d5b66c2666e03c2` |
| `src/uni_modules/lucky-ui/components/lk-meta-row/meta-row.props.ts` | L:31 | `9d8089facd46d2f6b3b7a7387dcc723d3de4e5061d1418d1823cb731a2fb6db5` |
| `src/uni_modules/lucky-ui/components/lk-meta-row/meta-row.utils.ts` | L:37 | `17c86e57810ad27c6fc5b403a97190aaeff12d6cf347a95affa6606c5e3fb8c1` |
| `src/uni_modules/lucky-ui/components/lk-overlay/lk-overlay.scss` | L:14 | `579008680c69b56a967be2522c7f115998916e632e25994de67823451e834ac8` |
| `src/uni_modules/lucky-ui/components/lk-overlay/lk-overlay.vue` | L:120 | `21b62286700394ba8279e1df7ed47ea0c7d4c6d525568b4873ee0926e41f1f55` |
| `src/uni_modules/lucky-ui/components/lk-overlay/overlay.props.ts` | L:39 | `1392037dfc7feda64bc18e3b18e093db1c842f880a48c23ca192f4c6670bfc32` |
| `src/uni_modules/lucky-ui/components/lk-overlay/overlay.utils.ts` | L:45 | `79de60a03f280d2ac09d60ec8c781277975c414f06a6b4ee7c8ac2a5e486a6a2` |
| `src/uni_modules/lucky-ui/components/lk-page/lk-page.scss` | L:68 | `4632ded78d3eb8da84791e27fcbd754d7cfcede468402e137f4fa25ec2b60a0e` |
| `src/uni_modules/lucky-ui/components/lk-page/lk-page.vue` | L:135 | `d41d590e5b78884484ece487480ae2575abbeae8f565943fbebec61799c121fa` |
| `src/uni_modules/lucky-ui/components/lk-page/page.props.ts` | L:38 | `0fd90431dd35a6f35bf934cb0627c9a732d897b3e7888e50d5f34aef6defdc7f` |
| `src/uni_modules/lucky-ui/components/lk-progress/lk-progress.scss` | L:87 | `ae3297c6d37b617ef9a06ecbf341628c67b7f25e874f9f098a0b47a4b3322a44` |
| `src/uni_modules/lucky-ui/components/lk-progress/lk-progress.vue` | L:69 | `729b7b6bce5ba385e5d0c43b05985f69e47c683154f2ba327c307173f38045b0` |
| `src/uni_modules/lucky-ui/components/lk-progress/progress.props.ts` | L:45 | `c54582ee6ef730d4c4faea5e87aef31040ebb9f9768ad2511b50ca3fafa25a4e` |
| `src/uni_modules/lucky-ui/components/lk-progress/progress.utils.ts` | L:72 | `49836340085b23c88a35d2d3be0cbf2aca1b994ba0565b2ede33867140eeabc2` |
| `src/uni_modules/lucky-ui/components/lk-segmented/lk-segmented.scss` | L:130 | `f9c83edabc09dc0d69cdd2f5360d6ac89e2e326c6c2690b66b3c9387afcda0ab` |
| `src/uni_modules/lucky-ui/components/lk-segmented/lk-segmented.vue` | L:196 | `fd8b10b8ea822f5529a41895c17e3e4e3eb7e6e9fe4bd3d7f848aa3ad198bf24` |
| `src/uni_modules/lucky-ui/components/lk-segmented/segmented.props.ts` | L:46 | `e276bcd4d337da6daa161976fb9cf4e919de7b2fd47bb5ef754109fc283e8ba3` |
| `src/uni_modules/lucky-ui/components/lk-segmented/segmented.utils.ts` | L:100 | `4d097c7ba1d43e5cccd0802b74c6155a7519f185df57109d2bfabd4515d18ecf` |
| `src/uni_modules/lucky-ui/components/lk-space/lk-space.scss` | L:49 | `ae841ac2e287291260dd6c26ce0c3abea67373cf33714461d8b1475d6e6e1c71` |
| `src/uni_modules/lucky-ui/components/lk-space/lk-space.vue` | L:42 | `e058f20f1ff3147bad38904b64e8cc790003c64ba93c96dba26edfeaa05ef952` |
| `src/uni_modules/lucky-ui/components/lk-space/space.props.ts` | L:56 | `30a32901ec1997b65d690a59654cd91983d5ff65649fd846e2e97fc119e535cc` |
| `src/uni_modules/lucky-ui/components/lk-space/space.utils.ts` | L:66 | `c845c4522ebc6480630a51970f22480c48c5562fa665b42a58c577e0d621c9f9` |
| `src/uni_modules/lucky-ui/components/lk-tag/lk-tag.scss` | L:86 | `9c2dd1735080fab7eccc263cb8643f5806437d3cafa4350dd8eebe8ce7e208a0` |
| `src/uni_modules/lucky-ui/components/lk-tag/lk-tag.vue` | L:68 | `d8ab229458a5e19e1d4fb4a026a2c04932191e502e00cef56b0bb808fcfaa2fb` |
| `src/uni_modules/lucky-ui/components/lk-tag/tag.props.ts` | L:71 | `45d126a07a2c56a8f81fc173f45ddaaf7721eddc7d5b3a2c5efb66fe0499bfa3` |
| `src/uni_modules/lucky-ui/components/lk-tag/tag.utils.ts` | L:129 | `9a6ed5a902e0d22e1723f6e788ade7034d316b080f97d535d2bb277d15100d1e` |
| `src/uni_modules/lucky-ui/composables/useLocale.ts` | L:26 | `643152c4e2582a10bb35f4e5acd1bed60d3fedd71e696e9da327a982374699e1` |
| `src/uni_modules/lucky-ui/composables/useRipple.ts` | L:165 | `0961c388d6271e58f5c5d70de9d7f890001b16af9e3ba35e1de7a6fd4ea4c5ab` |
| `src/uni_modules/lucky-ui/composables/useTransition.ts` | L:676 | `aaaf2e926b74891c1c5ed4439c14b34bf0455e5c3ca6d7e768ebd25998f027c4` |
| `src/uni_modules/lucky-ui/core/src/utils/unit.ts` | L:11 | `8e551db4748a516e2ae1ac474ee409c28f4a90d92efc36e352e1b2f1d2512de9` |
| `src/uni_modules/lucky-ui/theme/src/base/_animations.scss` | L:755 | `ea29f669c4acf8e02b7090ec849d764cf221c58455e74b49be064c9d2f33268d` |
| `src/uni_modules/lucky-ui/theme/src/base/ripple.scss` | L:109 | `f837b0332bbc1f9a8c5ded69e3ec2bc0e6c644c1bfb4a61b6654720585d43353` |
| `src/uni_modules/lucky-ui/theme/src/component-vars.scss` | L:551 | `f6e2ac26d16dd584457f221ea0c43d6563a4fdd4613254c41696c300f5f4d410` |
| `src/uni_modules/lucky-ui/theme/src/index.scss` | L:8 | `cd4ff0aa65b88b673ad1283d388fdcfcd58ad55853e98dc78a3a73d755ce5061` |
| `src/uni_modules/lucky-ui/theme/src/tokens/_border-radius.scss` | L:9 | `c51f7e82ff9593d2ca289c3476137a7f2b601517b1edb961552990b7daff207e` |
| `src/uni_modules/lucky-ui/theme/src/tokens/_colors.scss` | L:125 | `db76f679ff907438ccf903dad92951078b59b8a337393e001f9877bc73bd1545` |
| `src/uni_modules/lucky-ui/theme/src/tokens/_shadow.scss` | L:8 | `86310bdca35dc853b5d8de7774b7b8603df1baf75cdad7a0ea6962193e4d4211` |
| `src/uni_modules/lucky-ui/theme/src/tokens/_spacing.scss` | L:16 | `047a08b525e29ea060f15f051f6924ac55564cfc08ae6e9ad3e74125713362ab` |
| `src/uni_modules/lucky-ui/theme/src/tokens/_typography.scss` | L:22 | `ad8bf6a24d2125be3a4ec20f5304a11bce88e826fc4548187caf0c6e5c972270` |
| `src/uni_modules/lucky-ui/utils/init-lk-icons.ts` | L:88 | `a6b98f6f9d8916ea57e6735efeadd2363a72abb4a3000ebf85eab146f189740f` |
| `tests/miniprogram/button.spec.js` | L:76 | `3300e50e9c2e59cdcdf9bb28b544e4170fd3f204fcc2ee6e15cca88bc97830a8` |
| `tests/miniprogram/run-miniprogram-tests.js` | L:20 | `8e42f5ef5c835f97a7a6fddbbec6cc2619f01e2e316ce1798daf8052fdd593d6` |
| `tests/miniprogram/setup-miniprogram-env.js` | L:58 | `112f218c610ad87340e0551069d54efbb2c0292530b46394578d17a68e374a59` |
| `tests/unit/component-style-selectors.spec.ts` | L:87 | `6aa6f50ff6f64b853dbd70f21d6695db5f9f9854e1e0c3cdf4834fd673f19316` |
| `tests/unit/lk-avatar.spec.ts` | L:75 | `8fe2beeced953e9dad44939d620f2b55f92d692692000e96a10f53112ce52307` |
| `tests/unit/lk-badge.spec.ts` | L:75 | `cafc04c009c0b355e2cf3d2051040d1ef2c147a2b79755c44848497cfc5639ac` |
| `tests/unit/lk-button.spec.ts` | L:61 | `075b7a95959c28b95219a00243d3c548590e38471649884d192ef639f7504935` |
| `tests/unit/lk-card.spec.ts` | L:85 | `10e2af1deed19c1ad794c9e383fc7a7433faf4bf4cab169cbb68ee1090f18465` |
| `tests/unit/lk-cell.spec.ts` | L:74 | `a73f296402865f5b5a282cf7c073986e269aeced07bee0017594f85e48b911fd` |
| `tests/unit/lk-divider.spec.ts` | L:66 | `5db6f11564dbd29de5cf6501b33c4df81683f00794565e93b49421c4dab05fbe` |
| `tests/unit/lk-fab.spec.ts` | L:201 | `2e80e7be663e2862659d7f65d42e46a5feb6d2e680f990ad9f894ba0672406d5` |
| `tests/unit/lk-grid.spec.ts` | L:78 | `cf9e8cec70fcfdf17d3c3a2ec47b4d0ad5ecd6cc9ce9a305311e9ecadb8a4272` |
| `tests/unit/lk-icon.spec.ts` | L:81 | `49c6aa46020567dd8241c36a6251baff8ddd3b14a11a62c686fb254ffba1bef1` |
| `tests/unit/lk-image.spec.ts` | L:55 | `19ac1730cb9b3c9a26a9df25a7055da4f9ac901cb9fb3a0c303c4516e3aa8b11` |
| `tests/unit/lk-meta-row.spec.ts` | L:59 | `95dea81ba3f061772efb88702ca5b0fe6ddbee1186df0e325904486dbdec2a65` |
| `tests/unit/lk-progress.spec.ts` | L:79 | `d4c9ec5449eb15bb623ab9d6bf7dc918551cc816d431ab0d988d57187027b43e` |
| `tests/unit/lk-segmented.spec.ts` | L:161 | `b2d7747e08a8d637b3574ad3bac30098088a703aec45446af22f92fd85673fd5` |
| `tests/unit/lk-space.spec.ts` | L:63 | `bc2940543707fbbb4220f8c145118e79de98405fd6579a53f1b1015497e50fb0` |
| `tests/unit/lk-tag.spec.ts` | L:86 | `018296f60273f401740b11a3d4d1d9b69987e1c2cba0d81346ed319174e89228` |
| `tests/unit/svg-assets.spec.ts` | L:151 | `752b33a60fee8e1e5613624fb0e1fdafd04e1c983fdfcb100bbd6af9638036db` |
| `tests/visual/button-loading.spec.ts` | L:46 | `089fcfd6959c1e372a7f21d7a80eadf03fdff56abf1627960adf8eb43ef86207` |
| `tests/visual/card-ripple.spec.ts` | L:18 | `3b7d2fc871fe4572d0aa422018ceb07bb18d574b08b6626db7a10824a9030c8a` |
| `tests/visual/dynamic-visual-showcase.spec.ts` | L:29 | `8c3a9a3e22692c5cf2c7440f4c2922d625cb2de5029bfb1e220d485df8909904` |
| `tests/visual/high-risk-showcase.spec.ts` | L:104 | `9a2d7f7d8ab9fa5cd9c8b125cf7b16bb446fb58ae63fe51954fcceb5183d9e7b` |
| `tests/visual/needs-hardening-showcase.spec.ts` | L:88 | `776d128290c080b7f0f0352e30b419c7eecefd50c4e50ae65302aedec25a651a` |
| `tests/visual/screenshot.spec.ts` | L:20 | `e60e1a1f4bcfae013a7cf1c3bd776f3c73a5edd167df542d183e31024bb3e396` |
