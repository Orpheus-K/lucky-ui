# A2 遮罩、弹层与反馈组件逐行审计

## 结论

审计基线为 `c8071e6`，分支为 `docs/lucky-ui-full-audit`。本批覆盖 `lk-action-sheet`、`lk-curtain`、`lk-dropdown`、`lk-modal`、`lk-overlay`、`lk-popup`、`lk-toast`、`lk-loading`、`lk-skeleton`、`lk-empty`、`lk-notice-bar` 的全部目录文件，以及对应组件文档、Demo、直接单元/视觉/showcase/微信小程序测试和必要共享调用链。

- 逐行读取：116 个文件，16,120 个物理行；未读文件 0，未读物理行 0。
- 发现：31 项可执行问题，其中 P1 23 项、P2 8 项；未发现需要定为 P0 的证据。
- 高风险主链：共享滚动锁缺失、Modal 遮罩关闭重复、Popup/Dropdown 动画参数快照化、Toast 生命周期重复、微信小程序真实运行验收为零。
- 本报告没有把 `verified` 标签、构建成功、生成 WXML、工具函数单测或静态截图当成运行验收。生成的微信 WXML只用于确认节点与事件绑定形态，不能证明真机交互正确。
- 本次只做静态逐行审计和编译结构核对，没有执行 Peekit；下文 Peekit 条目是修复分支必须实际跑通并留证的验收合同，不是“已通过”声明。

## 审计方法与验收原则

1. 组件目录按物理文件逐行读完，再追到 Props、utils、样式、`useTransition`、主题、`LkRoot`、文档 Playground、showcase、视觉测试与微信测试入口。
2. H5 运行入口使用 `/#/pages_sub/component-detail/index?name=<slug>`；微信小程序使用 `/pages_sub/component-detail/index?name=<slug>`。现有 Demo 无法表达的竞态、事件计数和双实例场景，修复时应加入同一真实组件构成的确定性审计演练场，不得用仿造 DOM 替代组件。
3. 下文以组件真实类名为主选择器，例如 `.lk-overlay`、`.lk-popup__panel`。事件次数在演练场用稳定 `#probe-*-count` 文本节点或页面数据记录；H5 与微信共用同一数据源。
4. 样式验收读取运行态 computed style/bounding box；交互验收读取真实事件计数、组件可见状态和背景 `scrollTop`；动画验收同时读取类名、时长、时序和最终状态。
5. 截图只用于说明外观。凡涉及滚动、点击穿透、事件次数、异步确认、动画结束、轮播 payload 的问题，必须以运行态状态或事件为主断言。

## 最佳修复顺序

1. 先建立共享 `scroll-lock` 所有权层和单一弹层生命周期约束，修复 A2-01、A2-04、A2-12、A2-14、A2-17、A2-18。
2. 再修 Popup/Dropdown/Toast 的响应式动画、竞态和定位架构，避免子组件各自再造定时器。
3. 修复组件公开契约和样式尺寸，包括 ActionSheet 安全区、Popup 侧向宽度、Loading 尺寸、Skeleton 稳定宿主、Empty 局部主题、NoticeBar 循环索引。
4. 最后同步文档、Demo 和演练场，补 H5 与微信小程序 Peekit 自动化；只有双端运行断言通过后才能更新 `verified`。

## 可执行问题

### A2-01 · P1 · Overlay 滚动锁没有所有权，微信端也没有原生拦截

类型：兼容性、交互、层级。

证据与根因：`src/uni_modules/lucky-ui/components/lk-overlay/lk-overlay.vue:58-94` 直接覆盖 `document.body.style.overflow`，没有保存原值和引用计数；两个遮罩并存时关闭任一个就会解锁，原有 `overflow` 也被清空。只监听 `modelValue`，显示期间把 `lockScroll` 从 `true` 改成 `false` 不会释放，且 `unlock()` 因 `!props.lockScroll` 提前返回，卸载时也可能遗留锁。`watch(..., immediate)` 和 `onMounted` 还会重复获取。`lk-overlay.vue:96-112` 依赖事件对象 `preventDefault()`；微信编译节点是 `bindtouchmove` 而不是原生 `catchtouchmove`，不能把生成成功当成阻止页面滚动。

最佳修复层：新增库级 scroll-lock composable，以 token/引用计数持有锁、保存并恢复原始 body 样式，响应 `[visible, lockScroll]`，保证 acquire/release 幂等；微信模板使用可验证的原生 catch 语义。

- H5 Peekit：演练场预置 `body.style.overflow='clip'`，依次打开 `#overlay-a`、`#overlay-b`，关闭 B 后断言 `body` 仍锁定，关闭 A 后精确恢复 `clip`；显示时切换 `lockScroll` 再断言立即释放/重获。选择器 `.lk-overlay`，同时读取 `body` computed `overflow` 和两个事件计数。
- 微信 Peekit：在 `#probe-scroll` 上先记录 `scrollTop`，打开 `.lk-overlay` 后做真实纵向拖动，断言 `scrollTop` 不变且 `touchmove` 事件可记录；切换 `lockScroll=false` 后同动作应改变 `scrollTop`。只检查 WXML 的 `catchtouchmove` 不算通过。

### A2-02 · P1 · ActionSheet 与 Popup 重复添加底部安全区

类型：嵌套、边距、高度、跨端差异。

证据与根因：`src/uni_modules/lucky-ui/components/lk-action-sheet/lk-action-sheet.vue:94-108` 未把 `safeArea` 传给 Popup；Popup 默认 `safeArea=true`（`lk-popup/popup.props.ts:90-94`），并在 `lk-popup.vue:456` 渲染 `.lk-popup__safe`。ActionSheet 又在 `lk-action-sheet.vue:150` 渲染 `.lk-action-sheet__safe`。因此 `safeArea=true` 出现双 inset，`safeArea=false` 仍留下 Popup 的一层。

最佳修复层：安全区只能有一个所有者。ActionSheet 显式给 Popup 传 `:safe-area="false"` 并保留自己的条件节点，或删掉自身节点并把 prop 完整转交 Popup；不要用负 margin 掩盖。

- H5 Peekit：打开 `.lk-action-sheet`，`safeArea=true` 时断言其祖先 `.lk-popup__panel` 内安全区节点总数为 1，底部空白等于一次 `env(safe-area-inset-bottom)`；切换 false 后 `.lk-popup__safe,.lk-action-sheet__safe` 总数为 0。
- 微信 Peekit：用带模拟 `safeAreaInsets.bottom` 的演练场打开 ActionSheet，查询 `.lk-popup__safe` 与 `.lk-action-sheet__safe`，分别断言 true 总数 1、false 总数 0，并用 bounding box 校验面板高度只增加一次 inset。

### A2-03 · P1 · ActionSheet 文档承诺的“空串隐藏取消按钮”不可实现

类型：文档、交互、API。

证据与根因：`action-sheet.props.ts:38` 默认 `cancelText=''`；`action-sheet.utils.ts:9-12` 用 `cancelText || fallback`；模板 `lk-action-sheet.vue:141-147` 的条件又是 `cancelText || t('cancel')`。空串总被本地化文案替换，和 `docs/components/action-sheet.md:146` 的“传空字符串可隐藏”矛盾。

最佳修复层：在 Props/API 层提供明确 `showCancel`，或用 `undefined` 表示采用本地化默认、空串表示隐藏；渲染条件和文案解析共用一个 resolver。

- H5 Peekit：在 action-sheet 演练场依次传未设置、`''`、自定义文本，查询 `.lk-action-sheet__cancel`；期望分别为 1、0、1，且自定义文本精确一致。
- 微信 Peekit：同三组状态查询 `.lk-action-sheet__cancel` 数量与 `text()`；空串场景点击面板底部不应产生 `cancel` 或 `update:modelValue`。

### A2-04 · P1 · Modal 未透传 closeOnOverlay，false 仍关闭，true 还会重复更新

类型：交互、层级、事件。

证据与根因：`src/uni_modules/lucky-ui/components/lk-modal/lk-modal.vue:127-156` 自己判断 `closeOnOverlay`，却没有把该值传给 LkOverlay。Overlay 默认点击关闭并触发 `update:modelValue=false`；Modal 又在 `@click` 中调用 `close()`。因此 false 仍会经 `@update:model-value="close"` 关闭，true 时同一次点击存在两条 `update:modelValue` 路径。

最佳修复层：Modal 应把 `:close-on-click="closeOnOverlay"` 传下去，并选择唯一关闭所有者；推荐 Overlay 只报告点击，Modal 统一决定并发出一次更新。

- H5 Peekit：打开 `.lk-modal`，`closeOnOverlay=false` 点击 `.lk-overlay` 后面板仍可见、`#probe-overlay-click-count=1`、`#probe-update-count=0`；true 时面板离场且两个计数均为 1。
- 微信 Peekit：对同一 `.lk-overlay` 执行 tap，读取 Modal 组件可见状态和页面事件计数；false 不关闭，true 只产生一次 false 更新，不能只断言节点最终消失。

### A2-05 · P1 · Modal“异步确认”Demo 实际立即关闭

类型：交互、文档、演练场。

证据与根因：`lk-modal.vue:121-125` 发出 `confirm` 后同步发出 `update:modelValue=false`，不会等待监听器返回值。`src/components/demos/modal-demo.vue:43-50,76-81` 却返回一个 1 秒 Promise 并标为“异步确认”；`docs/components/modal.md:185-193` 还把异步确认稳定列为发布验收。

最佳修复层：先确定公开契约。若支持异步，新增 `beforeConfirm`（boolean/Promise）、确认 loading 与重复点击保护；若不支持，就把 Demo 改成父级受控关闭并删除错误承诺。不要捕获 emit 返回值冒充 Promise 链。

- H5 Peekit：点击 `.lk-modal__confirm` 后 500ms 仍可见且确认按钮处于 loading/disabled，1.1s 后才离场；`confirm` 和 false 更新均精确 1 次。
- 微信 Peekit：同样 tap `.lk-modal__confirm`，在 500ms 与 1.1s 分两次读取节点、loading 类和 `#probe-confirm-count`；连续双击也只能启动一个异步任务。

### A2-06 · P2 · Modal 取消/关闭图标事件在离场期间可重复

类型：交互、代码冗余、状态机。

证据与根因：`lk-modal.vue:115-145` 只在 `close()` 内检查 `leaving`；`cancel()` 先 emit `cancel`，`onCloseClick()` 先 emit `click-close`，然后才调用带 guard 的 `close()`。快速重复点击会被阻止重复更新，却不会阻止业务事件重复。

最佳修复层：所有动作先经过同一个 `canAct`/状态机，再一次性 emit 业务事件与更新；按钮在 leaving/confirming 期间同步禁用。

- H5 Peekit：对 `.lk-modal__cancel` 和 `.lk-modal__close` 分别执行 50ms 内双击，断言对应事件计数和 false 更新均为 1。
- 微信 Peekit：用连续两次 tap 重放相同场景，读取页面事件计数与组件 `leaving`；第二次 tap 不得再触发业务事件。

### A2-07 · P1 · Curtain 的 navigateBack 使用了错误参数协议

类型：兼容性、交互、API。

证据与根因：`curtain.props.ts:41-47` 把 `navigateBack` 列为合法 `linkType`；`lk-curtain.vue:85-121` 又要求非空 `link`，并对全部导航函数统一传 `{ url: props.link }`。`uni.navigateBack` 需要 `{ delta }`，不接受 URL。

最佳修复层：用可辨识 union 拆分前进导航与返回导航；返回场景提供 `delta` prop 且不要求 link，或从支持列表删除 navigateBack。

- H5 Peekit：在演练场用可观察的 uni 导航适配器点击 `.lk-curtain__content`，`navigateBack` 场景断言只调用一次 `{delta:2}`、无 `url`；普通 `navigateTo` 仍传正确 URL。
- 微信 Peekit：真实打开两级测试页后点 `.lk-curtain__content`，断言返回一页；同时通过页面记录的调用参数确认 `{delta:1|2}`，不能只看 Curtain 消失。

### A2-08 · P2 · Curtain 微信复制链接失败仍提示成功

类型：兼容性、交互、反馈真实性。

证据与根因：`lk-curtain.vue:109-113` 调用 `uni.setClipboardData` 后立即 `showToast` 成功，没有等待 success/fail。权限或系统失败时用户收到虚假成功反馈。

最佳修复层：在平台适配层 Promise 化剪贴板调用，成功才显示成功，失败显示失败并发出可观察 result/error 事件。

- H5 Peekit：HTTP 链接点击 `.lk-curtain__content` 应只走浏览器导航适配路径，不调用剪贴板；非 HTTP 导航仍保持原行为。
- 微信 Peekit：分别注入 setClipboardData success/fail，tap `.lk-curtain__content`；成功提示一次并含正确链接，失败绝不能出现成功文案，且 `#probe-copy-error-count=1`。

### A2-09 · P1 · Popup 运行时动画参数被 setup 快照冻结

类型：交互、动画、响应式。

证据与根因：`src/uni_modules/lucky-ui/components/lk-popup/lk-popup.vue:30-52` 虽把解析结果做成 computed，却以 `transitionConfig.value` 传入 `useTransition`。后续修改 `position`、`draggable`、`animation`、`animationType`、`duration`、`delay`、`easing` 都不会更新 useTransition 读取的 config。

最佳修复层：像 Modal 一样给 `useTransition` 传字段 getter/ref，或扩展 composable 接受 computed config；同一修复会覆盖 ActionSheet 对 Popup 的动态透传。

- H5 Peekit：关闭状态把 position 从 bottom 改为 right、duration 改为 700，再打开；`.lk-popup__panel` 必须出现对应 transition 类且 computed `transition-duration=700ms`。
- 微信 Peekit：修改演练场响应式 props 后打开 Popup，读取 `.lk-popup__panel` 的 class/style；再改一次并重开，类名、duration、easing 均应随新值变化。

### A2-10 · P1 · Popup 拖拽高度永久取首次窗口值，双 RAF 会在关闭后回写

类型：兼容性、高度、竞态。

证据与根因：`lk-popup.vue:96-124` 在 setup 时一次性读取 `windowHeight`；旋转、分屏、H5 resize 后 snap point 全部过期。`lk-popup.vue:131-139,217-238` 的双 RAF 没有保存/取消句柄或世代号，快速打开再关闭时旧回调仍可能把 `translateY` 回写为打开目标。

最佳修复层：维护响应式 viewport（H5 resize、uni window resize，卸载解绑）；集中登记两层 RAF/timeout，并以 generation 防止陈旧回调提交。

- H5 Peekit：390×844 打开可拖拽 `.lk-popup__panel`，改为 844×390 后重开，snap 高度按新 viewport 计算；随后执行 open→立即 close，两个 RAF 后 panel 必须隐藏且无正向 transform 回写。
- 微信 Peekit：通过设备旋转/resize 回调后读取面板 bounding box；快速开关两次，等待 100ms 后断言 `.lk-popup` 不可见、`after-enter` 不在 close 之后迟到。

### A2-11 · P1 · Popup 左右宽度被 70% wrapper 二次缩放

类型：宽度、样式、布局。

证据与根因：`lk-popup.scss:70-95` 把 left/right wrapper 固定为视口 70%；`popup.utils.ts:308-314` 又把公开 `width` 应用到内部 panel。`width="80%"` 最终约 56vw，`width="100%"` 也最多 70vw，违背宽度 API 的直觉。

最佳修复层：侧向 Popup 的宽度只由一个层承担；推荐把 width 放到 fixed wrapper，panel 固定 100%，默认值在 props/resolver 给 70vw。

- H5 Peekit：viewport 400px，`position=left,width=80%` 时读取 `.lk-popup`/`.lk-popup__panel` bounding box，最终可视宽必须为 320px±1。
- 微信 Peekit：同配置读取 `.lk-popup__panel` bounding box，断言 `panel.width/page.width≈0.8`；再测 `100%` 接近整屏。

### A2-12 · P1 · Popup overlay=false 时 lockScroll 完全失效

类型：交互、层级、兼容性。

证据与根因：`lk-popup.vue:389-396` 只有 `overlay && display` 时才创建 LkOverlay，且 `lockScroll` 只传给 LkOverlay；因此无视觉遮罩但要求锁滚动的合法组合没有任何锁。

最佳修复层：Popup 自己持有滚动锁，Overlay 只负责视觉层与点击；所有 overlay/popup/modal/dropdown 复用 A2-01 的共享锁。

- H5 Peekit：配置 `overlay=false,lockScroll=true` 打开 `.lk-popup`，滚轮/触摸滚动后 `window.scrollY` 不变；切换 lockScroll=false 后应可滚。
- 微信 Peekit：在 `#probe-scroll` 上记录 scrollTop，打开无 `.lk-overlay` 的 Popup 后拖动背景，scrollTop 不变；关闭或关锁后恢复。

### A2-13 · P1 · Popup 文档把字符串位置绑定给 boolean v-model

类型：文档、API、演练场。

证据与根因：`docs/components/popup.md:32-48` 定义 `pos` 为位置字符串，却写 `<lk-popup v-model="pos">`；组件关闭会把 `false` 写进字符串 ref，示例既类型错误又污染 position 状态。

最佳修复层：文档用独立 `visible:boolean` 与 `position:PopupPosition`；加入可编译示例测试并让文档 Playground 真正运行该示例。

- H5 Peekit：按修正文档依次点四个方向按钮，`.lk-popup` 显示且关闭后 `#probe-position` 仍为所选字符串、`#probe-visible=false`。
- 微信 Peekit：同示例依次打开/关闭，读取页面数据类型；visible 始终 boolean，position 始终合法字符串，四个方向都能重开。

### A2-14 · P1 · Dropdown 的 lockScroll 只是透明 mask，并不锁滚动

类型：交互、兼容性、层级。

证据与根因：`lk-dropdown.vue:267-275,326-368` 把 lockScroll 只用于决定是否渲染 mask；`lk-dropdown.scss:22-29` 的 mask 只是 fixed 透明 view，没有 touch catch、body lock 或 scroll-view 控制。文档 `docs/components/dropdown.md:252` 明确承诺锁定背景。

最佳修复层：复用共享 scroll-lock；mask 的 outside-click 与滚动锁职责分离，微信端用可运行验证的触摸拦截。

- H5 Peekit：打开 `.lk-dropdown__menu` 后滚轮/触摸背景，`window.scrollY` 不变；关闭后恢复。点击 `.lk-dropdown__mask` 仍只产生一次 outside/close。
- 微信 Peekit：记录 `#probe-scroll` scrollTop，打开菜单后对 mask 区域纵向拖动，scrollTop 不变；`lockScroll=false` 时相同动作可滚，outside-click 配置独立生效。

### A2-15 · P1 · Dropdown 动画响应式冻结，预设时序被默认 props 覆盖

类型：动画、代码逻辑、API。

证据与根因：`lk-dropdown.vue:234-251` 同 Popup 一样把 `transitionConfig.value` 快照传入。另有 `dropdown.props.ts:123-133` 把 duration/easing 默认设为 180/`ease-out`，而 `dropdown.utils.ts:278-285` 用 `??` 合并预设；默认值永远非空，所以 bounce 等预设自己的时长/easing 永远不生效。

最佳修复层：useTransition 传响应式 getter；duration/delay/easing 改成 undefined 表示“未覆盖”，resolver 最后才落默认值，或显式跟踪用户是否传入。

- H5 Peekit：选 bounce 预设打开 `.lk-dropdown__menu`，断言类名、computed duration/easing 等于预设；再运行时改 duration=900，重开后应为 900ms。
- 微信 Peekit：读取菜单 class/style 与进入/离开事件时间戳；默认 bounce 使用预设时序，显式覆盖才使用用户值，变更后无需重建组件。

### A2-16 · P1 · Dropdown 没有视口碰撞、翻转或位移约束

类型：布局、宽高、跨端差异。

证据与根因：`dropdown.utils.ts:89-147` 只按请求 placement 和 triggerRect 计算一侧坐标，没有测量 menu rect，也没有 flip/shift/max-height。非 H5 的原地定位同样由 `lk-dropdown.scss:65-111` 固定方向。屏幕边缘、横屏和长菜单会被裁出视口。

最佳修复层：打开后两阶段测量 trigger/menu/viewport，统一执行 flip + cross-axis shift + 可用高度约束；H5 用 DOM rect，微信用 selectorQuery，输出 resolvedPlacement 状态类。

- H5 Peekit：把 trigger 放到四个角，打开 `.lk-dropdown__menu`，断言 bounding box 四边均在 viewport 内且空间不足时 placement 状态类翻转；长菜单可内部滚动。
- 微信 Peekit：同四角 fixture 查询菜单 bounding box，断言 `left>=0,top>=0,right<=windowWidth,bottom<=windowHeight`；翻转后的类/页面数据与实际方向一致。

### A2-17 · P1 · 受控 Toast 初始显示不计时，关闭与 after-leave 会重复

类型：交互、代码冗余、状态机。

证据与根因：`src/uni_modules/lucky-ui/components/lk-toast/lk-toast.vue:20-54` 的自有 watcher 没有 `immediate`，初始 `modelValue=true` 时不会 emit `open` 或安排自动关闭。`close()` 自己 emit `close`，父级同步 v-model 后 watcher 又 emit 一次。watcher 还创建未登记的 260ms `after-leave` timeout，而 `lk-toast.vue:68-77` 的 useTransition callback 再 emit 一次；重开和卸载都不能取消前一个 timeout。

最佳修复层：受控 Toast 只保留一个状态机：immediate watcher 负责调度，`close()` 只请求 false，业务 close/after-leave 分别由状态转换和 transition callback 唯一发出；所有计时器带 generation 并在重开/卸载时取消。

- H5 Peekit：页面初始渲染 `modelValue=true,duration=500`，`.lk-toast` 立即可见、`open=1`，500ms 后开始离场，最终 `close=1,after-leave=1`；在离场 100ms 时重开，旧 after-leave 不得触发。
- 微信 Peekit：同一 fixture 读取 `.lk-toast` 和三个计数；分别覆盖初始 true、手动 close、自动 close、快速重开，任何路径的 close/after-leave 都只能各一次。

### A2-18 · P1 · Toast 的 forbidClick 与 overlay 语义相互绑反

类型：交互、层级、样式。

证据与根因：`lk-toast.vue:63-64,87-93` 只有 `overlay && show` 才渲染阻挡层，所以 `forbidClick=true,overlay=false` 完全不阻挡。反过来，`lk-toast.scss:73-84` 无论是否 `.is-lock` 都是 `pointer-events:auto`，所以 `overlay=true,forbidClick=false` 仍阻挡点击；关闭时遮罩还在 Toast 离场动画开始前立即消失。

最佳修复层：把“是否显示底色”和“是否拦截指针”拆成两个正交状态；阻挡节点条件为 overlay 或 forbidClick，opacity/background 由 overlay 控制，pointer-events 由 forbidClick 控制，并与 display/离场生命周期一致。

- H5 Peekit：Toast 下放 `#probe-under-button`。四组 overlay×forbidClick 组合逐一点击 `.lk-toast__overlay` 所在区域；只有 forbidClick=true 时底层计数不增加，只有 overlay=true 时 computed background 非透明。
- 微信 Peekit：同四组合对底层按钮执行 tap；读取按钮事件计数、遮罩节点数量和 background/pointer 行为。关闭动画未结束前 forbidClick 仍应生效。

### A2-19 · P1 · ToastManager 是模块全局列表，多宿主重复渲染且同位置消息重叠

类型：架构、层级、散乱、交互。

证据与根因：`lk-toast/toast-manager.ts:5-39` 的 list/seed 是模块全局；每个 `LkRoot` 又在 `lk-root.vue:69-72` 渲染 manager，因此两个宿主会把同一消息渲染两次，并可能跨页面/SSR 请求残留。`lk-toast.scss:120-135` 把同 position 的每条 item 绝对定位到同一坐标，连续消息完全重叠。自动关闭 timeout 也未登记、不可统一取消。

最佳修复层：明确库级单例宿主或 app-scope store，不允许每个 root 重复消费同一队列；同时定义 replace/queue/stack 策略。若 stack，计算稳定 offset；若 queue，一次只显示一条。统一登记 timer。

- H5 Peekit：同时挂两个 `.lk-toast-manager` fixture 后调用一次 show，页面只能出现一个 `.lk-toast-mgr__item`；连续 show 两条时按选定策略要么排队，要么两个 bounding box 不相交，计时结束后都清空。
- 微信 Peekit：两个 LkRoot 同页重复上述动作，查询 manager/item 数量、文字和 bounding box；页面切换/卸载后旧消息不得在新页重现。

### A2-20 · P1 · Toast 文档、类型与视觉测试指向不存在的行为

类型：文档、测试、兼容性。

证据与根因：代码只允许 `zoom-in`（`toast.props.ts:15-20,44`），文档却在 `docs/components/toast.md:100-108,150-159` 使用/声明 `zoom`。文档还列出 manager 的 `customClass/customStyle`，但 `toast.utils.ts:4-11,67-82` 的 ToastItem 没有这些字段，`lk-toast-item.vue:26-35` 也不应用。`tests/visual/toast-animation.spec.ts:4-15` 使用无效路由 `/components/demos/toast-demo`，并找受控 Toast 的 `.lk-toast__inner`，而 Demo 实际调用 manager、节点是 `.lk-toast-mgr__inner`。

最佳修复层：统一 public type、文档与 renderer；使用 `zoom-in`，若保留自定义样式就真实加入 item 并安全绑定，否则删文档。视觉测试走实际 showcase/component-detail 路由和 manager selector。

- H5 Peekit：点击真实 Toast Demo 的“缩放”动作，`.lk-toast-mgr__inner` 必须带 `.lk-transition-zoom-in`；传 customClass/style 时要么按文档真实生效，要么文档 UI 不再暴露。测试先断言路由与按钮确实存在。
- 微信 Peekit：同 Demo tap 后查询 `.lk-toast-mgr__inner` class/style；无 prop validator 警告，动画结束后 item 被移除。文档生成代码必须可直接复制到微信演练页运行。

### A2-21 · P2 · Manager Toast 丢失受控 Toast 的文字样式

类型：样式、颜色、对齐。

证据与根因：受控 Toast 在 `lk-toast.scss:101-107` 定义字号、颜色、字重、行高和居中；manager 只定义 `.lk-toast-mgr__inner`（`lk-toast.scss:138-150`），没有任何 `.lk-toast-mgr__text` 规则。两条公共入口视觉契约因此依赖平台默认 text 样式，H5/微信会有差异。

最佳修复层：提取 Toast surface/text 共用 SCSS mixin/token，受控与 manager 只保留必要尺寸差异。

- H5 Peekit：同时显示 `.lk-toast__text` 与 `.lk-toast-mgr__text`，读取 computed `font-size/color/font-weight/line-height/text-align`，应按统一契约一致。
- 微信 Peekit：同屏查询两类 text 的 computed style 与 bounding box；文字垂直居中、颜色可读且不依赖页面继承。

### A2-22 · P1 · Loading 文档与 Playground 暴露不存在的 type prop

类型：文档、演练场、API。

证据与根因：实现只有 `variant`（`loading.props.ts:21-52`），组件始终读取 `props.variant`（`lk-loading.vue:19-47`）。文档 Playground 在 `docs/components/loading.md:12-19` 发送 `type`，Props 表和警告又在 `loading.md:100-124,140-142` 宣称 type 优先；`src/pages_sub/playground/index.vue:147-150` 只会把未知 attr 原样传给组件，切换控件不会改变动画。

最佳修复层：保持一个公开名称。推荐文档、Playground、生成代码全部改为 `variant`；若为了兼容新增 type，必须有正式 prop、解析优先级、弃用计划和双端测试。

- H5 Peekit：在文档 `.props-playground` 依次选 dots/bar，iframe 内 `.lk-loading__dots`/`.lk-loading__bar` 必须真实切换，生成代码只能出现受支持 prop。
- 微信 Peekit：演练页切换同一配置，查询对应 `.lk-loading__*` 节点；页面控制值与组件实际 variant 一致，控制台无 extraneous attr 警告。

### A2-23 · P2 · Loading 的 size 对多数变体只改容器一维，且 vertical 无文本仍残留间距

类型：宽高、边距、UI 一致性。

证据与根因：`loading.utils.ts:35-52` 只给 spinner/circular/ring 同时设置宽高；dots/bounce/wave/ellipsis 仅设置容器 height，子元素尺寸仍固定（`lk-loading.scss:66-206`）；bar 只改 width，height 固定。`lk-loading.scss:15-19` 试图清除单图标 margin，但 vertical 规则 `lk-loading.scss:231-237` 又给唯一首子节点加 `margin-bottom`。

最佳修复层：把规范化 size 输出为 `--lk-loading-size`，各变体按比例推导主尺寸、点/条厚度和 gap；用 `:only-child` 或显式 hasText 类同时处理横竖间距。

- H5 Peekit：对每个 `.lk-loading__spinner/.lk-loading__dots/.lk-loading__bar/.lk-loading__bounce/.lk-loading__wave/.lk-loading__ring/.lk-loading__ellipsis` 比较 size=32 与 64 的 bounding box，主尺度应接近 2 倍；vertical 且无 text 时唯一动画节点 margin-bottom=0。
- 微信 Peekit：同矩阵读取 bounding box/computed margin；不得出现只增高容器、点本体不变或空白尾间距。

### A2-24 · P1 · Skeleton loaded 分支丢失 BaseProps 并改变宿主布局契约

类型：嵌套、布局、API、兼容性。

证据与根因：`lk-skeleton.vue:40-67` 加载态根节点应用 `rootClass/hostStyle`，但没有绑定 id；完成态换成一个裸 `<view>`，id、customClass、customStyle 全丢。额外 wrapper 还会改变 slot 作为 flex/grid direct child 的身份，加载前后布局跳变。

最佳修复层：保留同一个稳定宿主，始终绑定 id/class/style，只切换内部 skeleton/slot；若确需 fragment，需明确跨端能力与布局契约，不能两个分支不一致。

- H5 Peekit：给 Skeleton 设置 `id=audit-skeleton`、自定义 display/grid-area，切换 loading；`#audit-skeleton` 始终存在且 class/style 不变，slot bounding box 不发生非内容导致的跳变。
- 微信 Peekit：同配置切换，查询 `#audit-skeleton` 和直接子节点数量；id/class/style持续存在，父 flex/grid 中位置不变。

### A2-25 · P2 · Skeleton round 只作用于 avatar，和“是否圆角”契约不符

类型：样式、文档、API。

证据与根因：`skeleton.props.ts:40-44` 把 round 描述为全局“是否圆角”；实际只有 `skeleton.utils.ts:38-43` 用它把 avatar 设成圆形，title/row 在 `lk-skeleton.scss:44-52` 永远使用固定 md radius。

最佳修复层：若语义是 avatarRound 就重命名并兼容弃用；若确为全局 round，就通过根状态类/CSS 变量一致应用到 avatar、title、row，并在文档说明圆形还是大圆角。

- H5 Peekit：切换 round，读取 `.lk-skeleton__avatar,.lk-skeleton__title,.lk-skeleton__row` computed border-radius；实际值必须与最终文档语义一一对应。
- 微信 Peekit：同节点读取 computed border radius；不同 avatar 配置和无 avatar 场景也要可观察到 round 的预期作用。

### A2-26 · P1 · Empty 不跟随最近 LkRoot 的局部品牌色

类型：颜色、主题、跨端兼容。

证据与根因：`lk-empty.vue:77-110` 在 H5 只读/监听 `document.documentElement`，微信则退回持久化全局品牌色。LkRoot 明确把局部 `brandColor` 生成的变量放在自身 view（`lk-root.vue:50-57,69-72`，`root.utils.ts:71-95`），所以嵌套 Empty 的 SVG 插画不会跟随局部 root。另 `empty-illustrations.ts:23-38` 只解析 hex/rgb/rgba，任意 CSS 变量或命名色会静默回退默认色，而文档 `docs/components/empty.md:87` 只写 string。

最佳修复层：建立可注入的主题/品牌上下文，LkRoot provide 局部品牌值，Empty inject 后生成 SVG；H5 DOM computed style 只能做无 provider 的后备。收紧 color 类型/文档，或用可靠颜色解析支持承诺格式。

- H5 Peekit：并排两个 LkRoot（`brandColor=#ff0000/#00aa00`），各放 `.lk-empty__image`，读取 image src/data URI，必须含各自派生色；改变外层 prop 后两个实例独立更新。
- 微信 Peekit：同双 root fixture 查询两张 `.lk-empty__image` 的 src，二者品牌色不同且与各自 root 一致；命名色/CSS var 要么正确解析，要么开发态明确拒绝，不能静默用默认蓝色。

### A2-27 · P1 · NoticeBar 循环补位帧点击 payload 越界，末到首还漏 change 事件

类型：交互、轮播、事件。

证据与根因：`lk-notice-bar.vue:75-109` 在最后一条后把 `currentIndex` 加到 `messages.length`，停留 300ms 的克隆首项再无缝归零；这条路径没有 emit `message-change` 到首条。点击逻辑 `lk-notice-bar.vue:141-150` 和 `notice-bar.utils.ts:71-83` 直接用当前 index 访问原 messages，因此补位帧会发 `{index:N,text:''}`。

最佳修复层：区分 visualIndex 与 logicalIndex，所有公开 payload 先 modulo 归一；进入首条视觉帧时发一次 `{index:0,text:first}`，无缝 reset 只发 loop-reset，不重复 change。

- H5 Peekit：`messages=['A','B'],speed=.5`，等待进入克隆首项的 300ms 窗口后点击 `.lk-notice-bar`；click 必须为 `{index:0,text:'A'}`，末→首 `message-change` 恰好一次，`loop-reset` 恰好一次。
- 微信 Peekit：同真实定时场景 tap `.lk-notice-bar__message` 所在区域，读取三类事件日志；任何时刻 index 都只能 0/1，text 不为空。

### A2-28 · P2 · NoticeBar 文档 Playground 用 boolean 控件承载四态 scrollable

类型：文档、演练场、交互。

证据与根因：实现支持 `false | true | 'horizontal' | 'vertical'`（`notice-bar.props.ts:17-26`），文档 Playground 却在 `docs/components/notice-bar.md:12-20` 声明 `type:'boolean'` 且默认给字符串 `'horizontal'`。控件只能切 true/false，无法验收 vertical，初始类型也不一致。

最佳修复层：Playground 支持带 boolean 的 union 枚举，或为 scrollable 做专用 `off/horizontal/vertical` 映射；生成代码保留正确 boolean/string 类型。

- H5 Peekit：在 `.props-playground` 依次选 off/horizontal/vertical，iframe 内分别出现静态 content、横向 scroll 和 `.lk-notice-bar__vertical-list`；生成代码值类型正确。
- 微信 Peekit：把文档相同配置同步到演练页，三种选择分别查询对应节点和运动状态；vertical 必须可从 UI 直接选到。

### A2-29 · P2 · Modal、Popup、NoticeBar 的关闭触控区低于移动端 44px

类型：尺寸、UI 合理性、可访问性。

证据与根因：Modal close 为 `44rpx` 加很小 padding（`lk-modal.scss:40-55`），Popup close 为 `64rpx`（`lk-popup.scss:155-164`），NoticeBar close 只有 `32rpx` icon 且容器无最小尺寸（`lk-notice-bar.vue:197-199`、`lk-notice-bar.scss:79-90`）。在 750rpx 设计宽度下都低于约 44 CSS px 的可靠移动触控区。

最佳修复层：建立共享 interactive-size token（建议最小 88rpx/44px），用透明 hit area 扩大点击区，图标视觉尺寸保持不变；标题/header 同步预留空间防重叠。

- H5 Peekit：读取 `.lk-modal__close,.lk-popup__close,.lk-notice-bar__close` bounding box，宽高均 >=44 CSS px；点四角仍只触发一次关闭事件。
- 微信 Peekit：在常见 375px 逻辑宽设备读取三者 bounding box，宽高均 >=44px；使用 hit-area 边缘坐标 tap，事件必须命中且不触发父 click。

### A2-30 · P2 · Demo/文档依赖不可控外部图片，微信域名与离线场景不稳定

类型：演练场、兼容性、测试稳定性。

证据与根因：Curtain Demo 使用 yzcdn（`src/components/demos/curtain-demo.vue:59,92,104`），Empty Demo 使用外站 SVG（`empty-demo.vue:11-12`），Skeleton Demo 使用 picsum（`skeleton-demo.vue:54`）；Curtain 文档也在 `docs/components/curtain.md:24,34,46,73` 引用外域。微信需要合法 download 域名，网络/内容变化会导致演练场空白或视觉漂移。

最佳修复层：把确定性小体积 fixture 放入仓库 static，双端 Demo 只用本地资源；外链能力另设显式网络演示并标明域名要求，不进入基线截图。

- H5 Peekit：网络离线/拦截外域后打开 curtain/empty/skeleton Demo，目标 `.lk-curtain__image,.lk-empty__image` 与 skeleton loaded 内容仍能加载，尺寸和截图稳定。
- 微信 Peekit：清空网络缓存并打开三页，读取 image load/error 计数；本地资源全部 load、error=0，包内路径存在且无需配置第三方 download 域名。

### A2-31 · P1 · 本批没有微信运行测试，单测与大部分视觉用例也未触达组件行为

类型：测试、验收、跨端兼容。

证据与根因：11 个直接 unit spec 全部只 import 各组件 `*.utils`，没有挂载 Vue 组件、触发模板事件或读取样式。`tests/miniprogram/run-miniprogram-tests.js:1-12` 只执行 button/timeline，连现有 tab 文件都未纳入，本批 11 组件为零。`showcase-cases.ts:62-67,134-157,179-184,332-355,404-409,467-472,539-562` 给本批全部打 `verified`，但 action-sheet/curtain/dropdown/modal/notice-bar/popup/toast 的 visualEnabled 为 false；`tests/visual/needs-hardening-showcase.spec.ts:21-43` 主要检查标题、badge 和风险文案，只有 Overlay 有一次简单开关。

最佳修复层：建立同一确定性 probe 数据驱动的 H5 Playwright/Peekit 与微信 miniprogram-automator/Peekit 套件，覆盖本报告每个 selector、事件和状态断言；utils 单测保留但不替代组件测试。`verified` 必须由双端证据生成或至少关联证据清单。

- H5 Peekit：逐组件跑 A2-01～A2-30 合同，输出 selector、computed style、事件日志、viewport 和时间戳；故意破坏一个 invariant 时套件必须失败，恢复后才可标 verified。
- 微信 Peekit：runner 必须真实 reLaunch 11 个组件/审计演练场并执行同合同，产出页面数据、bounding box、computed style、scrollTop 和事件日志；只扫描 dist 文本、WXML 快照或报告 build success 均判为未验收。

## 合理特例与不应误报项

- Dropdown 在 H5 teleport 到 body、微信留在组件树内，是平台能力差异；只要定位、层级、outside click、局部主题与运行测试明确，不应仅因 DOM 层级不同判错。A2-16 指向的是两端都缺少碰撞处理，不是要求 DOM 完全一致。
- Overlay slot 内交互内容要求调用方阻止冒泡，是合理事件边界，文档已有说明；不能据此否认 A2-01 的滚动锁缺陷。
- Curtain 对微信 HTTP 链接采用“复制而非直接打开”是合理降级；A2-08 只要求复制结果真实，不要求突破平台导航限制。
- NoticeBar 的 `speed` 在当前契约里是每条停留秒数，`resolveNoticeBarInterval()` 与文档可一致；本报告不把它误报成 px/s。
- ActionSheet select payload 保留原 action 对象，运行时可携带额外业务字段；类型是否泛型化可以后续增强，不是当前阻断问题。
- Empty 的 `empty-illustrations.generated.ts` 是生成产物，和包装模块并存属于可接受构建结构，不按“代码重复”删除。
- 动画组件不做像素截图基线可以接受，因为中间帧不确定；前提是有确定性的类名、时序、事件和最终状态测试。当前缺口在 A2-31，而不是强制所有动画截图。
- `verifyStatus:'verified'` 可作为人工盘点字段，但它本身不是运行证据；构建成功和生成 WXML 也只证明可编译。

## 修复完成后的整体确认

1. 每个问题在独立修复工作树/分支处理，先修共享层再修组件，避免多个组件各自复制 scroll-lock 或 timer 逻辑。
2. 每个 PR 先跑相关 unit/component tests，再由 Peekit 分别抓 H5 与微信运行态；记录 viewport、主题、safe-area、输入参数、动作、selector、computed style/事件结果。
3. 单项修复后回归其共享消费者：Overlay 要回归 Modal/Popup/ActionSheet/Dropdown/Toast；useTransition 要回归 Popup/ActionSheet/Dropdown/Toast；主题上下文要回归两个 LkRoot 并存。
4. 全部合入后重新从空页面状态跑 11 组件全矩阵，清理前一用例的 body lock、timer、toast store、路由和主题，防止测试互相影响。
5. 验收结论只允许“运行断言通过/失败/未执行”。`verified`、类型检查、build、截图存在、WXML 含节点均不得写成运行通过。

## 文件、物理行与 SHA-256 总账

口径：物理行以基线文件逐行读取计数；SHA-256 为审计时内容哈希。主范围 84 个文件/11,518 行，共享与测试调用链 32 个文件/4,602 行，合计 116 个文件/16,120 行；未读=0。

```text
docs/components/action-sheet.md|188|18bdc99214af0d00037a168f967ccc23910b5448b7957712bb58e032b056473a
docs/components/curtain.md|153|e469f9b2c00508c665237d91fb91b977e3d281733ac772f77e4c3dc3aa62f6e2
docs/components/dropdown.md|320|a7f58800dd4fdedd792d74adb333dff81fe58b1ca5027a231da14a9a00bbb3ba
docs/components/empty.md|111|5f6e7efe28cb84308b5544424efddafc89d92441dacc610326724084a4b322e0
docs/components/loading.md|142|6ab9ce7a40428590a305e4393442114b81244cea3253e5a7953ed7866483bea1
docs/components/modal.md|193|efda443f19f0ef925ccc3d671bb45b784b2a52e165c4e4cb8e30be96aecfdf8a
docs/components/notice-bar.md|163|41fa071c3d62f6b30ec1adccd6965f49e8d4e324ce671316a24063216222a707
docs/components/overlay.md|124|b7739ad7c87af21ef352a1f90ab7a9d2ce5a3e61553012b5a1d782200ed49b76
docs/components/popup.md|215|313e53d76e1ced889a3b9143d6f0c6870371d85f143fb81f715ce623955290e3
docs/components/skeleton.md|143|9f38d7f0300e915cfae960382ecb4f0ba854bfa87d49873e6fa208dee30d5453
docs/components/toast.md|186|aedb0d55254fb71c9e47d31172e3ac63d5695f050c9c43127e8c584beb29dd97
src/components/demos/action-sheet-demo.vue|93|f6ac819bc615ec1c3094da694f83375214f51b10e4fa600b73451658da357397
src/components/demos/curtain-demo.vue|238|162a8fffcbeab1458478ff9f5e006e62851ac5d5cf433793b85efd3f42837b75
src/components/demos/dropdown-demo.vue|200|0140f1f1aa69680ed86b06d8c3af2e310185a4bc2c80b743da639099677b3c72
src/components/demos/empty-demo.vue|161|fde00a802c525d18647b4b3903cb9031c3942b4872485e8afbf8d4f4214fc91e
src/components/demos/loading-demo.vue|135|92cc7d01498dd35189d5e39134708ceeb397bbfdb75840fb8390a9ddbed9db29
src/components/demos/modal-demo.vue|221|78533e37e97cb5fd3a81020e78e04c9570dfbeae6ed39a2decc4870bebb5b0a7
src/components/demos/notice-bar-demo.vue|164|4cf35898ea1a60171fc71a338693bf3cf2e5d231b99621815e1f0a7ee3aaadb9
src/components/demos/overlay-demo.vue|86|1f826435d7b13d1b2f0a973243bdc1589ae368a1f298c6722cc6b4f78554bf79
src/components/demos/popup-demo.vue|289|996f75a8f7cf45fa7f4e9ce1fc20e01573647850124c29d79d77a0498a97f0bf
src/components/demos/skeleton-demo.vue|118|a0aae6e064ea96fbea1fee9007ad141ee71c30cc964eecac07b3ed5c4d3e2cf3
src/components/demos/toast-demo.vue|97|357f5c2a5e9ef4167576fab73dc2e045b59210bd17c766d4d8781c5c98ab9056
src/uni_modules/lucky-ui/components/lk-action-sheet/action-sheet.props.ts|90|548ee5eaba5f8deec756bad49f9fa6122777753d586e5498baf2402d0d0f1b9a
src/uni_modules/lucky-ui/components/lk-action-sheet/action-sheet.utils.ts|68|adc45128d0c9177be36b628086b6c20a52583491188e3b5b4bead587ebfdd709
src/uni_modules/lucky-ui/components/lk-action-sheet/lk-action-sheet.scss|125|397309bcebd357330672fda9005ab9fb3671e688f670625e99ea3318f0cea6c3
src/uni_modules/lucky-ui/components/lk-action-sheet/lk-action-sheet.vue|157|82bd4593644bf8392f8f174fdb2f6b7069d1c7172ac5e175607e447cd5bd6b0f
src/uni_modules/lucky-ui/components/lk-curtain/curtain.props.ts|120|75b218b690555a6e253174aef581d6a405ad847adf5da4e4ec74a38f7a380093
src/uni_modules/lucky-ui/components/lk-curtain/curtain.utils.ts|126|843e9c58d286b44bc8981fd8c834922f1ea2068b8d2b76e630a5f2e155d68cda
src/uni_modules/lucky-ui/components/lk-curtain/lk-curtain.scss|62|0d2a02acb15bc44af3a127a10c26165cdd61fc00e2f73c6efe1ea65e64a253ac
src/uni_modules/lucky-ui/components/lk-curtain/lk-curtain.vue|170|20358281bfe4a34b1c5bda54cce1ba181195d7dd4d7b93c4cfb9fedb5d626dca
src/uni_modules/lucky-ui/components/lk-dropdown/dropdown.props.ts|162|953e457e73d34e09c5689e87f78b32b4c0adcd837cb1d69dd9e2694464f50acd
src/uni_modules/lucky-ui/components/lk-dropdown/dropdown.utils.ts|340|cdb834eed15ad984de9fcb55bcb1079a93ab5dbd44faea82c79f27c0aeecaec5
src/uni_modules/lucky-ui/components/lk-dropdown/lk-dropdown.scss|206|f31d8423b1190bcd2fc64d0593f9859d8d872f3c5e8067328073c86daaf384f4
src/uni_modules/lucky-ui/components/lk-dropdown/lk-dropdown.vue|391|750ea5875771a8800586722fd7b8b4491b7ba43306f8d8ec5624d2f89171ad9d
src/uni_modules/lucky-ui/components/lk-dropdown/lk-dropdown-divider.vue|26|189e6ba7b51d115f30f6cfdc633f4d0f0c1d56c9cf64f9408f4f26d223064418
src/uni_modules/lucky-ui/components/lk-dropdown/lk-dropdown-item.vue|80|4c464b1dc4416c2f7e74287d7b9e6aae226e392af91de5fbff94ace7a57eb587
src/uni_modules/lucky-ui/components/lk-empty/empty.props.ts|56|9ebb5f6f6a7457d3affe1ee0480a7d6537fff29cdd6edd1f007d3657052e044d
src/uni_modules/lucky-ui/components/lk-empty/empty.utils.ts|57|da3ce33981d151d84c40fad0b4e2658fed37ac9418903b027235e5a5b9ed1a86
src/uni_modules/lucky-ui/components/lk-empty/empty-illustrations.generated.ts|122|89b053fcd93792a8722b716463bdeaf0e545a5a18c91b61dc30289059eb21d7a
src/uni_modules/lucky-ui/components/lk-empty/empty-illustrations.ts|89|567b8a36086a7e2162c79f18f6287190f99d785bf6ce495b44c0ae4335ceaefb
src/uni_modules/lucky-ui/components/lk-empty/lk-empty.scss|71|6be90cb2ad6e726b625f74cb0847bebd892a88406701f3e6ffb6c739187ee41e
src/uni_modules/lucky-ui/components/lk-empty/lk-empty.vue|145|e7c91d916a42a802d53d9a5ebb906daa05bec0eb965ce21008551673b4b8841f
src/uni_modules/lucky-ui/components/lk-loading/lk-loading.scss|243|6a948e7d670e150adcabd9ecc1cc2f4a5f6ac181363c81fda96d4d95e5c38d4d
src/uni_modules/lucky-ui/components/lk-loading/lk-loading.vue|100|ba9305cc026dd1e3e8be2d7e395155557de60b559805fffafcfe6990bac510d2
src/uni_modules/lucky-ui/components/lk-loading/loading.props.ts|54|441ccba6e2e94e50b990b9903935e948c05ede13602ae11aad8a5b68fe2381ec
src/uni_modules/lucky-ui/components/lk-loading/loading.utils.ts|61|6ed293d74509fc860408fd4f05d6cc5bcd618e39963808b16c72aa1cdf535b3a
src/uni_modules/lucky-ui/components/lk-modal/lk-modal.scss|144|aabf8510e65cf539d0648cb2d0ae798a99f0f685f7047e20f924fab6f365c646
src/uni_modules/lucky-ui/components/lk-modal/lk-modal.vue|232|69a4de75cce9cbb5351eb8282461bebce247e8bc75de972e723ab7d682731b37
src/uni_modules/lucky-ui/components/lk-modal/modal.props.ts|101|2fd26f82ef4983bd0f84d1f68dd5d7070744c333dd2749fec063eb2e01f4bd62
src/uni_modules/lucky-ui/components/lk-modal/modal.utils.ts|97|342faea5dfa5dbf36e2e28bc64460d71d5926e8579251df717cd07be557359e5
src/uni_modules/lucky-ui/components/lk-notice-bar/lk-notice-bar.scss|91|77fd585ca2c65bb16017ac0b6dc4d6fd4f8ab2329adbb7fa497bc9711951df60
src/uni_modules/lucky-ui/components/lk-notice-bar/lk-notice-bar.vue|205|2f25b3c9a2a6e23f494725e18475c3ba38081d2486ad6f01f9bdcfb126020475
src/uni_modules/lucky-ui/components/lk-notice-bar/notice-bar.props.ts|62|9fa893adb4b3479ce7f607692eb2177a4cca65e1be60ffe811c6c892c0937681
src/uni_modules/lucky-ui/components/lk-notice-bar/notice-bar.utils.ts|84|bbafeb73f2e3cdb288f53b6d184a7a099622f9c98687049924c320047d669acf
src/uni_modules/lucky-ui/components/lk-overlay/lk-overlay.scss|14|579008680c69b56a967be2522c7f115998916e632e25994de67823451e834ac8
src/uni_modules/lucky-ui/components/lk-overlay/lk-overlay.vue|120|21b62286700394ba8279e1df7ed47ea0c7d4c6d525568b4873ee0926e41f1f55
src/uni_modules/lucky-ui/components/lk-overlay/overlay.props.ts|39|1392037dfc7feda64bc18e3b18e093db1c842f880a48c23ca192f4c6670bfc32
src/uni_modules/lucky-ui/components/lk-overlay/overlay.utils.ts|45|79de60a03f280d2ac09d60ec8c781277975c414f06a6b4ee7c8ac2a5e486a6a2
src/uni_modules/lucky-ui/components/lk-popup/lk-popup.scss|194|651f44dfead900062cb901d1200ce5d59c85bcb1d446420a36e251edc760de09
src/uni_modules/lucky-ui/components/lk-popup/lk-popup.vue|463|363ad09df1de39a4ee1a3e6a5b6a4a52919724b95b91fcd1aa95bda4f53372cf
src/uni_modules/lucky-ui/components/lk-popup/popup.props.ts|149|572357141f108935c58d51babf46f88d42a6776081a061a9555c18de1f5083c5
src/uni_modules/lucky-ui/components/lk-popup/popup.utils.ts|316|99664ca056badeaa8bd3e34278463b366637e32c6bf44f8a8e7811c9aa9b26f7
src/uni_modules/lucky-ui/components/lk-skeleton/lk-skeleton.scss|64|e7102fa581350d13b393ff2ba87a3f68644ff242b8d2d446c75d4e5c0ede03af
src/uni_modules/lucky-ui/components/lk-skeleton/lk-skeleton.vue|72|00eb2f1942d49a29245488e66998a82bef100f3259a63fcf9c5107de64150655
src/uni_modules/lucky-ui/components/lk-skeleton/skeleton.props.ts|56|025bece7d4c90fd71cb6c066efe9c051188686199ba8fec4693710b44baacb75
src/uni_modules/lucky-ui/components/lk-skeleton/skeleton.utils.ts|66|d2284f8e6434688e54eef877354439103a5b52d1d0ac9f49ea791bfd2361c3d5
src/uni_modules/lucky-ui/components/lk-toast/lk-toast.scss|193|f4c7d731b0c4c45b71be57642f30de1b35ec50a3afafeee368c4d6dd4fa1c747
src/uni_modules/lucky-ui/components/lk-toast/lk-toast.vue|105|33f3a49ce8e9e0872b3b6d1c0bf6e547d0a79102479a7976432bf0ae7215d1ca
src/uni_modules/lucky-ui/components/lk-toast/lk-toast-item.vue|41|0c0e80006cd4246c3966d010bf54e3c236d3776c3678e47b57053cf47b3c8e87
src/uni_modules/lucky-ui/components/lk-toast/lk-toast-manager.vue|27|6a79a6de036e7bf6d9225598e37842c72362dc8f0b35437beebfda1ea87f55b6
src/uni_modules/lucky-ui/components/lk-toast/toast.props.ts|77|7eb8d4ef7212470542f0ef14ae85c40e37cb9e91748f72d6269cc889d1827a7f
src/uni_modules/lucky-ui/components/lk-toast/toast.utils.ts|83|f3d12a9e033346549941d1bd4b68e7a2299f099e5d6d265402d28a42e18d3740
src/uni_modules/lucky-ui/components/lk-toast/toast-manager.ts|42|95f873f1baac61908f2494da09102d6af204d83b35870f764f404066ae183aa1
tests/unit/lk-action-sheet.spec.ts|105|2dc4dfb2dc3e2222b7920e6039d9330f301963c04ebb98ea77712e4849740500
tests/unit/lk-curtain.spec.ts|117|a13b4eaed909036d09222e0bc9a713167f052f9eaf6b86a9309ccfbffed140d3
tests/unit/lk-dropdown.spec.ts|307|519ff4d8d1d2f56be608a123c27b69b4051e45770cb433ca9951a13afaeabf86
tests/unit/lk-empty.spec.ts|95|0b1a746844fea72bd7be2a3753cda316f6c78405601c1e754d0ee30bd74dd2b2
tests/unit/lk-loading.spec.ts|66|e72345cb73bff3e6da50cdd8bb06c424e3fef4514781a02ae2cea6a429daff20
tests/unit/lk-modal.spec.ts|105|b71a7afb06c6b2bef3058a0cf541c04356b22325d809eeb6e1eb4b5464df729f
tests/unit/lk-notice-bar.spec.ts|103|f986491747f60dd00d77292ad8282064013cab453e1dbc8e845e482b74403bc8
tests/unit/lk-overlay.spec.ts|80|d7578584b164eba82471b0b62466f2b7241a584df8055e3c51d7ab93323410ac
tests/unit/lk-popup.spec.ts|324|3369108db554d70c1e8cd155909145b3a9b06b61d9228bfbe2d2946b58194be8
tests/unit/lk-skeleton.spec.ts|76|b28189ad5d6f291c3c6950a9c64b3e8bf4838ce486e4d7ef758f1006abfef493
tests/unit/lk-toast.spec.ts|97|2d52a333b81ff4020974fa6c874959c62e5bf000e3781c50a73a344e5482c14e
docs/.vitepress/theme/components/PropsPlayground.vue|674|f9f2c7bdd94218a436c09d6bc9480dcda4e1e55d6021809b0ded83c12396addb
src/pages_sub/playground/index.vue|303|7827193da2343621e7fb21e7cd586390e115a44ea16383163d583a303ab90389
src/uni_modules/lucky-ui/composables/useTransition.ts|676|aaaf2e926b74891c1c5ed4439c14b34bf0455e5c3ca6d7e768ebd25998f027c4
src/uni_modules/lucky-ui/components/common/props/index.ts|195|42959195090c409562b91481b05d13af3ebcc511b21590b495ec1da7bb04bd4b
src/uni_modules/lucky-ui/composables/useRipple.ts|165|0961c388d6271e58f5c5d70de9d7f890001b16af9e3ba35e1de7a6fd4ea4c5ab
src/uni_modules/lucky-ui/composables/useLocale.ts|26|643152c4e2582a10bb35f4e5acd1bed60d3fedd71e696e9da327a982374699e1
src/uni_modules/lucky-ui/core/src/utils/unit.ts|11|8e551db4748a516e2ae1ac474ee409c28f4a90d92efc36e352e1b2f1d2512de9
src/uni_modules/lucky-ui/theme/index.ts|2|28dde2451895b98700d3322e6a00a062ad726f171f627ecb7cdea1aa13615777
src/uni_modules/lucky-ui/theme/src/brand-color.ts|136|e96323b5a58db5e772b6446b9efb3133ad1de5ee6f6bb810891f3f21720035f9
src/uni_modules/lucky-ui/theme/src/theme-store.ts|240|be5cf33ea5efc8ce34d82926fd3e31c78f4b4768b6d92a5ff418f08870b2043f
src/uni_modules/lucky-ui/locale/index.ts|116|ed6de82735dca6f9863a0a7caeb42dce2c7a738271559f2fca0fca6a2e3d431a
src/uni_modules/lucky-ui/components/lk-root/lk-root.scss|33|b340ff80204f7ba32670d6949afba49bb0711e9e6ed9ce175fc6ef2b86b9d17d
src/uni_modules/lucky-ui/components/lk-root/lk-root.vue|78|876acc31a782f1e9722f108f85c4147ef4fc37d03babe2ff854292342e676fae
src/uni_modules/lucky-ui/components/lk-root/root.props.ts|45|540110121b394c877b0b43779b264585bca432555aef4f2218da0bcba4e0293a
src/uni_modules/lucky-ui/components/lk-root/root.utils.ts|96|fb8bedf4017ef7d98ffb103b36542983a7f38dea6698cb5b6e296e1c727c539a
src/stores/theme.ts|73|a5dfa54c7fdb694c60958666195786cf77482577910d9409f0aaf707aa2248de
src/components/showcase/showcase-cases.ts|664|ab131d0afac2823dae26d1ce783136c16417c0aaa34e5abe8dfec6bef6dc032f
src/components/showcase/component-case.vue|182|058fedfe129ccf84158163128b94923ace9ed82bfa3d100ff7d3abc4d87b6cad
src/components/preview/PreviewDemoRenderer.vue|167|384ebd26037ad17260d3e1e9075e848ba51fefed6e76a76ebe5fc028f36da297
tests/visual/needs-hardening-showcase.spec.ts|88|776d128290c080b7f0f0352e30b419c7eecefd50c4e50ae65302aedec25a651a
tests/visual/high-risk-showcase.spec.ts|104|9a2d7f7d8ab9fa5cd9c8b125cf7b16bb446fb58ae63fe51954fcceb5183d9e7b
tests/visual/dynamic-visual-showcase.spec.ts|29|8c3a9a3e22692c5cf2c7440f4c2922d625cb2de5029bfb1e220d485df8909904
tests/visual/screenshot.spec.ts|20|e60e1a1f4bcfae013a7cf1c3bd776f3c73a5edd167df542d183e31024bb3e396
tests/visual/toast-animation.spec.ts|16|fa78c639c0286ef7691138e5bd9978fd494815db3f782666d5424e379c83ba74
tests/unit/component-style-selectors.spec.ts|87|6aa6f50ff6f64b853dbd70f21d6695db5f9f9854e1e0c3cdf4834fd673f19316
tests/unit/compat-check.spec.ts|60|7a6ff070c5f8661f5382d87105ddf9090246494d4efd90018462efca11514919
tests/unit/theme-base-styles.spec.ts|52|210353235e311a29bc3c64c8b5f8bef33af07a06b6e7305ff022766188a2face
tests/miniprogram/timeline.spec.js|65|141459f94c8adc5d8c22a8afd76d6172c71c96faf7dba0169f4f885fe6ca8e09
tests/miniprogram/tab.spec.js|45|067ee2bc8f3e8ba49305064f0d0a5ffff3281cbbecdae06f8ef93e89765ccbe9
tests/miniprogram/setup-miniprogram-env.js|58|112f218c610ad87340e0551069d54efbb2c0292530b46394578d17a68e374a59
tests/miniprogram/run-miniprogram-tests.js|20|8e42f5ef5c835f97a7a6fddbbec6cc2619f01e2e316ce1798daf8052fdd593d6
tests/miniprogram/button.spec.js|76|3300e50e9c2e59cdcdf9bb28b544e4170fd3f204fcc2ee6e15cca88bc97830a8
```

总账复核：116/116 文件已读，16,120/16,120 物理行已读，未读=0。
