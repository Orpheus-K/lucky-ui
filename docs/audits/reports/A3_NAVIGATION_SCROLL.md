# A3 导航与滚动组件审计报告

## 1. 审计基线

- 分支：`audit/lucky-ui-full-review-20260813`
- 基线提交：`c8071e67f93cc95ee1ddc12cac7bfccdf74058c1`
- 审计方式：只读逐行审查组件目录全部文件、对应文档与 demo、直接单元/视觉/showcase/小程序测试，以及判断问题所必需的共享依赖。
- 审计对象：`lk-anchor`、`lk-backtop`、`lk-carousel`、`lk-collapse`、`lk-horizontal-scroll`、`lk-navbar`、`lk-pull-refresh`、`lk-sticky`、`lk-tab`、`lk-tabbar`、`lk-virtual-list`。
- 本报告不以构建成功、静态快照、`verifyStatus: 'verified'` 或 miniprogram-simulate 结果替代 H5/微信小程序真实运行证据。

### 1.1 覆盖分母

| 范围 | 已读/分母 | 物理行 |
|---|---:|---:|
| 11 个组件目录全部文件 | 50/50 | 6,736 |
| 对应文档 | 11/11 | 1,807 |
| 对应 demo | 11/11 | 2,667 |
| pull-refresh 独立页面 | 1/1 | 178 |
| preview/showcase/detail 必要链路 | 6/6 | 1,672 |
| 必要共享依赖 | 7/7 | 726 |
| 直接 unit/MP/visual 测试 | 14/14 | 1,481 |
| **总计** | **100 个唯一文件** | **15,267** |

- 未读文件：**0**。
- 重复计数：**0**。
- 直接命名单元测试：**10/11**；唯一缺失 `tests/unit/lk-tab.spec.ts`。
- 直接微信相关测试只有 `tests/miniprogram/tab.spec.js`，且属于 simulate 测试，不是微信开发者工具或真机运行证据。

### 1.2 严重度与合理边界

- **P1**：公开 API 或主要交互确定失效、跨端行为明显不一致、可能造成错误页面导航/布局/状态，修复前不应宣称组件稳定。
- **P2**：在动态属性、特定结构、响应式布局、文档/演练场或可访问性场景中造成真实缺陷，但通常存在规避方式。
- 静态审计确认的是源码、文档、测试之间可直接证明的矛盾及根因；需要浏览器布局引擎、微信原生组件事件时序或设备数据才能最终判定的视觉结果，列入第 4 节运行验收，不写成“已通过”。
- 范围不扩展到未列出的 Lucky UI 组件；共享文件只在它们直接影响上述 11 个组件时纳入。
- 本报告不修改组件、demo、测试、Issue 总账或验收矩阵，也不对修复结果作提前背书。

## 2. 问题清单

### Anchor

#### A3-01 P1：`offsetTop` 的 px/rpx 契约错误

- **精确证据**：`src/uni_modules/lucky-ui/components/lk-anchor/anchor.props.ts:39-42` 接受 px/rpx；`anchor.utils.ts:15-21` 仅执行 `parseFloat`；结果在 `lk-anchor.vue:57-61,144-151` 直接与 px 制的 rect/scrollTop 混算。`tests/unit/lk-anchor.spec.ts:33-37` 还把 `20rpx` 固化为数值 `20`。
- **根因**：单位字符串被丢弃，几何层没有统一的 px 边界；rpx 只在 750px 设计宽度附近偶然与预期相近。
- **最佳方案**：在属性入口识别单位并用 `uni.upx2px` 统一为 px，后续所有测量与阈值只使用 px；补 390/750 宽度参数化测试。

#### A3-02 P1：外部 `scroll-view` 在微信端不受 `scrollTo()` 控制

- **精确证据**：H5 在 `lk-anchor.vue:254-274` 查目标容器并滚动；非 H5 在 `276-292` 始终调用 `uni.pageScrollTo`。文档与 demo 反而要求消费者在 `@click` 中自己设置 `scroll-into-view`：`docs/components/anchor.md:25-27,48-52`、`src/components/demos/anchor-demo.vue:131-133,178-185`。
- **根因**：组件公开方法把页面滚动和嵌套滚动容器混为一个实现；微信原生 scroll-view 不受 pageScrollTo 控制，同一 href 再次赋同一 scroll-into-view 值也可能不触发。
- **最佳方案**：统一输出目标 ID 与容器内目标 scrollTop，或由组件拥有并控制 scroll-view；明确 page/container 两种方法语义并保证重复点击可触发。

#### A3-03 P2：测量结果会陈旧，延时任务未清理

- **精确证据**：`lk-anchor.vue:301-323` 只监听子项数量、scrollTop、selector；href、字体/图片加载、视口与容器尺寸变化不会重测。`333-337` 的延时任务未保存，也未在卸载时取消。
- **根因**：测量生命周期仅覆盖初始渲染和少量 prop，没有布局失效机制；异步任务没有所有权。
- **最佳方案**：H5 使用 `ResizeObserver`，微信端提供显式 refresh 并响应 resize/image load；所有测量任务使用 generation token 并在卸载时清理。

### Backtop

#### A3-04 P1：页面滚动模式的可见性不响应

- **精确证据**：`lk-backtop.vue:28-30` 的 `latestScrollTop` 是普通变量；`43-47` 的 `computedVisible` 读取它但不会响应。`51-58` 虽更新另一个 `visible` ref，模板 `107-123` 只使用 `computedVisible`。`tests/visual/needs-hardening-showcase.spec.ts:58-73` 只测试受控 visible，`tests/unit/lk-backtop.spec.ts:11-75` 只覆盖 utils。
- **根因**：存在两个可见性状态源，滚动回调更新的状态不是渲染依赖。
- **最佳方案**：把最新滚动值改为 ref，并只保留一个可见性 source；卸载时清理 frame/timer，增加真实 page scroll 阈值测试。

### Carousel

#### A3-05 P1：`effect`、`indicatorAlign`、`indicatorAnimated` 是无效公开属性

- **精确证据**：`carousel.props.ts:66` 定义 effect，但组件未消费；`80-84,99` 定义 indicatorAlign/indicatorAnimated，`lk-carousel.vue:315-320,355-360` 只生成类，而整个 `lk-carousel.scss` 没有对应 align/animated 选择器。文档仍在 `docs/components/carousel.md:140,145,158,196-198` 宣称支持。
- **根因**：API、模板类与样式实现没有形成闭环，测试也只验证静态结构。
- **最佳方案**：实现真实 slide/fade 和指示器定位/动画，并以 computed/rect 断言；无法实现时删除公开属性和文档，不保留空开关。

#### A3-06 P1：`autoHeight` 无法处理晚到内容，card 模式不能降高

- **精确证据**：`lk-carousel.vue:156-179` 只在当前时刻及 150/300ms 测量；`210-226` 只在 current/length 变化时重测；`167` 在 card 且已有高度时拒绝较小实测高度。
- **根因**：用固定延迟猜测内容稳定时间，并把防抖逻辑错误地变成单向增高。
- **最佳方案**：H5 对活动项使用 `ResizeObserver`；微信端由图片 load、slot 更新或显式 refresh 触发测量；每次接受活动项真实高度并取消旧任务。

#### A3-07 P2：`autoplay-change` 把手动滑动也标成自动播放

- **精确证据**：swiper change 入口在 `lk-carousel.vue:238-241`；`updateActive:235` 只根据 autoPlay 发 `autoplay-change`，没有使用事件 source。`docs/components/carousel.md:175` 将其描述为自动轮播事件。
- **根因**：事件来源在适配层被丢弃，是否启用 autoplay 被误当成此次变化是否由 autoplay 触发。
- **最佳方案**：读取平台 change 事件 source，或合并为包含 source 的统一 change 事件，并补手滑/自动切换计数测试。

### Collapse

#### A3-08 P1：运行时属性不响应，关闭没有动画

- **精确证据**：父级只在 `lk-collapse.vue:23` 监听 modelValue；`69-75` provide 的 accordion/duration/timing 是快照。内容用 `lk-collapse-item.vue:79` 的 `v-show`；`lk-collapse.scss:101-124` 只有进入 keyframe，关闭立即 `display:none`。
- **根因**：父子上下文不是响应式引用，动画又只实现了打开方向。
- **最佳方案**：provide `toRef/computed` 并监听 `[modelValue,accordion]`；以实测高度状态机完成打开和关闭 transition，结束后再切 display/height。

#### A3-09 P1：标题 slot 在微信端产生不合理嵌套

- **精确证据**：`lk-collapse-item.vue:67-69` 用 `<text>` 包裹 title slot；`docs/components/collapse.md:67-83` 的官方示例在该 slot 内放 `<view>`。
- **根因**：可承载任意结构的 slot 被放进文本原生节点，违反微信端节点结构约束。
- **最佳方案**：标题 slot 容器使用 `<view>`，默认纯文字再单独包 `<text>`；增加真实 WXML 结构断言。

#### A3-10 P2：文档遗漏动画属性

- **精确证据**：`collapse.props.ts:34-38` 定义 animationDuration/animationTiming；`collapse-demo.vue:16-35` 已使用；`docs/components/collapse.md:116-125` 的 API 表没有两项。
- **根因**：demo 和源码演进后文档表未同步。
- **最佳方案**：补齐类型、默认值、单位、运行时变更语义，并让文档示例成为可执行契约测试。

### HorizontalScroll

#### A3-11 P1：H5 的 `hide-scrollbar=false` 无效

- **精确证据**：`lk-horizontal-scroll.vue:18,28-34` 正确传递 show-scrollbar；`lk-horizontal-scroll.scss:10-15` 却无条件隐藏 WebKit scrollbar。文档在 `docs/components/horizontal-scroll.md:33-39` 承诺 false 时显示。
- **根因**：原生属性与 H5 CSS 是两条实现路径，CSS 没有按 prop 加状态类。
- **最佳方案**：只在 hide 类存在时应用 scrollbar 隐藏规则；分别验证 WebKit 伪元素和微信 scroll-view 属性。

#### A3-12 P2：gap 只适用于部分直接子节点

- **精确证据**：`lk-horizontal-scroll.scss:45-47` 只给直接 `view/text` 设置间距，image、其他原生节点或部分自定义组件根不命中。
- **根因**：用节点名枚举模拟 gap，公开 slot 却允许任意内容。
- **最佳方案**：优先使用 flex `column-gap`；不支持的平台增加统一 item wrapper/fallback，并覆盖 view/text/image/custom-root。

### Navbar

#### A3-13 P1：文档对应另一套 API，返回示例会双退页

- **精确证据**：`docs/components/navbar.md:18-29,57-65,79-88` 使用不存在的 back/transparent/dark，并写 z-index 100；真实 API 是 `navbar.props.ts:20-71` 的 showBack/variant、默认 z-index 200 等。组件在 `lk-navbar.vue:115-132` 已执行 `uni.navigateBack`，文档示例父级又退一次。
- **根因**：旧版文档没有随 API 迁移，且返回行为同时被定义成命令和通知事件。
- **最佳方案**：按源码重写 API；返回采用“组件自动执行”或“可取消事件”中的一个清晰契约，不能在官方示例叠加导航。

#### A3-14 P2：自定义中心区不可交互，系统尺寸不会刷新

- **精确证据**：`lk-navbar.scss:144-155` 对 `.lk-navbar__center` 固定 `pointer-events:none`；系统/胶囊信息只在 `lk-navbar.vue:37-40,68-83` setup 时读取一次。
- **根因**：标题防遮挡策略直接禁用了整个 center slot，布局数据也被当作常量。
- **最佳方案**：自定义 center slot 恢复 pointer events，并通过结构层避免遮挡；监听 resize/orientation/page show 刷新系统尺寸。

#### A3-15 P2：demo 不能代表微信安全区与胶囊布局

- **精确证据**：`navbar-demo.vue:23-105` 的嵌入案例均 fixed=false，但 safeArea 默认 true；`lk-navbar.vue:148-152` 仍渲染状态栏，`navbar.utils.ts:76-94` 又在非 fixed 时禁用胶囊补偿。
- **根因**：全页导航栏参数被直接放进普通文档卡片，测试场景与组件使用上下文不一致。
- **最佳方案**：嵌入示例显式 safe-area=false；另建独立全页 fixed 微信 fixture，采集状态栏、胶囊和左右槽 rect。

### PullRefresh

#### A3-16 P1：`loadingType/loadingSize/loadingColor` 全部无效

- **精确证据**：属性定义于 `pull-refresh.props.ts:49-56`；模板 `lk-pull-refresh.vue:263-267` 把 LkLoading 固定为 `variant="text"`，只传文字。`docs/components/pull-refresh.md:57-59` 仍承诺三项。
- **根因**：公开 props 没有传到实际渲染组件。
- **最佳方案**：真实透传 variant/size/color 并增加 class/computed/WXML 断言；若不支持则删除 API。

#### A3-17 P1：Success 状态可能被原生 restore 立即清掉

- **精确证据**：model false 经 `lk-pull-refresh.vue:92-103` 进入 settle；`179-189` 设置 Success 和延时；`refresherrestore` 在 `138-141,195-201` 又立即 reset indicator。
- **根因**：业务刷新状态和原生 refresher 生命周期分别修改同一状态，没有统一状态机与事件优先级。
- **最佳方案**：建立 Idle/Pulling/Ready/Refreshing/Success 状态机；Success 期间忽略 restore，只由 success timer 完整复位 refresherActive 和 indicator。

#### A3-18 P2：slot 文档过期，三个 demo 相互污染

- **精确证据**：`docs/components/pull-refresh.md:79-83` 仅声明 `{status,distance}`；实际 `lk-pull-refresh.vue:239-261` 暴露 status/pulling-distance/refreshing/progress，icon slot 与方法也未写。`pull-refresh-demo.vue:14-18,28-50` 的三个示例共享同一 list，timer 未清理。
- **根因**：文档、实现和演练场分别演进；示例没有 fixture 隔离。
- **最佳方案**：按真实 slot/method 重写文档；除明确同步对比外，每个 demo 使用独立状态和可清理的确定性动作。

### Sticky

#### A3-19 P1：`container` 是空 API，offset 又混用 rpx/px

- **精确证据**：`sticky.props.ts:10-14` 定义 container，但 `lk-sticky.vue` 未读取；`docs/components/sticky.md:45-55` 仍宣传容器限制。`sticky.utils.ts:13-16` 生成 rpx CSS，H5 rootMargin 与微信 rect 阈值在 `32-38` 按 px 使用。
- **根因**：视觉单位和观测几何单位没有归一化，容器边界仅停留在 API 声明。
- **最佳方案**：offset 在逻辑入口统一成 px；container 真正成为 observer root/relativeTo 和粘性边界，否则删除属性与文档。

#### A3-20 P2：微信 observer 可能跨实例命中，也不响应配置变化

- **精确证据**：`lk-sticky.vue:69-72` 在 mounted/nextTick 后才调用 `getCurrentInstance()`；异步后 current instance 可能为空，通用 sentinel selector 在多实例中可能选到错误节点。offset/container 改变时也不重建 observer。
- **根因**：实例上下文捕获过晚，selector 不唯一，observer 生命周期未与 props 绑定。
- **最佳方案**：setup 同步捕获 proxy，为每实例生成唯一 selector/ref；watch 配置，先断开旧 observer 再重建。

#### A3-21 P2：Sticky demo 的滚动容器跨端无效

- **精确证据**：`sticky-demo.vue:11-50,73-79` 用普通 view 加 CSS overflow-y:auto；微信应使用 scroll-view。demo 未使用 container prop，底部案例 `52-59,168-179` 是手写 CSS sticky，不是组件。
- **根因**：H5 DOM 滚动模型被当成跨端通用模型，演练场还混入非组件实现。
- **最佳方案**：统一使用可双端运行的 scroll-view fixture；container 和 bottom boundary 必须由真实组件完成。

### Tab

#### A3-22 P1：双模型同步的 oldValue 与数字 0 均错误

- **精确证据**：activeIndex watcher 在 `lk-tab.vue:85-97` 先更新 active，再用当前 active 发 oldValue，导致新旧值相同；`docs/components/tab.md:248` 承诺真实 oldValue。挂载逻辑 `180-195` 使用 `props.modelValue &&`，合法数字 0 被跳过。
- **根因**：更新过程没有统一 transition，也用 truthy 代替“值是否存在/是否匹配”。
- **最佳方案**：所有点击、model、activeIndex 更新进入同一 selection transition；变更前捕获旧值，以 options 匹配结果判断 0/空字符串等合法值。

#### A3-23 P2：slider 对响应式布局陈旧，且没有直接单测

- **精确证据**：`lk-tab.vue:120-124` 的布局 watcher 不含 scrollable/align/showSlider/viewport，也没有 ResizeObserver；`225-327` 还有两份近重复的滚动/非滚动模板。不存在 `tests/unit/lk-tab.spec.ts`；`tests/miniprogram/tab.spec.js:22-40` 只是 simulate。
- **根因**：slider 测量没有完整失效条件，双模板增加行为漂移风险，测试分母缺口又没有被视觉测试补上。
- **最佳方案**：统一 item renderer；监听所有布局输入及 ResizeObserver，新增直接 unit 和真实 H5/微信 rect 测试。

### Tabbar

#### A3-24 P1：`mode="fixed"` 与定位 `fixed` 的类名冲突

- **精确证据**：`tabbar.utils.ts:105-122` 既为 mode 生成 `lk-tabbar--fixed`，又为布尔 fixed 生成同名类；`lk-tabbar.scss:18-23` 将其设为 `position:fixed`。`lk-tabbar.vue:271-276` 仅在布尔 fixed 为真时生成 placeholder。`tabbar-demo.vue:26` 正好使用 `mode="fixed" :fixed="false"`。
- **根因**：视觉交互模式和布局定位状态共享同一 BEM modifier。
- **最佳方案**：分成 `lk-tabbar--mode-fixed` 与 `lk-tabbar--is-fixed` 等互不重叠类，并分别测试 position 与 placeholder。

#### A3-25 P1：slider 模式的字符串 name 会回到第一项

- **精确证据**：`docs/components/tabbar.md:85-98` 明确使用字符串 name；`tabbar.utils.ts:32-35` 通过 parseInt 求 index，非数字回 0；父级 `lk-tabbar.vue:82-93` 在 model watcher/mount 重算，覆盖子项点击提供的真实 index。
- **根因**：业务值被错误解释为视觉位置，没有 name 到当前顺序的映射。
- **最佳方案**：维护响应式 keyed registry，按当前 DOM 顺序映射 name/index，禁止 parseInt 业务值。

#### A3-26 P1：bump 背板 SCSS 选择器不匹配 DOM

- **精确证据**：模板类是 `lk-tabbar-item__bump-bg`：`lk-tabbar.vue:229`、`lk-tabbar-item.vue:107`；`lk-tabbar.scss:153-195` 在 `&--bump` 内写 `&__bump-bg`，编译为 `.lk-tabbar-item--bump__bump-bg`。
- **根因**：嵌套 SCSS 把 element 错接在 modifier 后，而模板遵循根 block 的 element 命名。
- **最佳方案**：modifier 内使用后代 `.lk-tabbar-item__bump-bg`，或把 element 规则移到根层；双端检查最终 CSS/WXSS 选择器。

#### A3-27 P1：动态注册顺序会腐化，模式变化不刷新 slider

- **精确证据**：`lk-tabbar.vue:48-59` 使用单调递增 counter，卸载只减少 count；移除再插入后 index 可超过当前 count。slider watcher `82-93` 只看 model，不看 mode/list/itemCount。
- **根因**：注册表不是可重排的 keyed collection，视觉位置又只在单一状态变化时重算。
- **最佳方案**：用响应式 keyed registry 按实际子项顺序重排；watch `[mode,list,itemCount,model]`，布局变化后重新测量。

#### A3-28 P1：list 渲染路径的激活文字不变色

- **精确证据**：`lk-tabbar.vue:263` 的 label 没有 active style；`lk-tabbar.scss:115-138` 只有默认色，文件内无 active label 规则。slot item 在 `lk-tabbar-item.vue:91-98,123` 则正确内联颜色。
- **根因**：list 与 slot 是两套渲染实现，active token 只接入其中一套。
- **最佳方案**：两条路径共用 item renderer/active token，或至少为 list 补充同一 active class 与颜色规则。

### VirtualList

#### A3-29 P1：`scrollToTop/scrollToIndex` 不能可靠重复执行

- **精确证据**：`lk-virtual-list.vue:28-35,246-250` 的 boundScrollTop 初始为 0，用户滚动时不回写；`264-268` 的 scrollToTop 再写 0，Vue/native 看不到属性变化。重复滚到同一 index 也存在同样问题。
- **根因**：命令式滚动依赖声明式 prop 的“值发生变化”，却没有同步原生滚动状态或命令序列。
- **最佳方案**：同步真实 scrollTop，或用不同值脉冲/scroll-into-view 命令确保每次执行；真实 DOM/WXML 中连续调用两次验证。

#### A3-30 P1：到达底部会重复发 `reach-bottom`

- **精确证据**：rAF 路径在 `lk-virtual-list.vue:205-218` 有 latch；原生 scrolltolower 在 `252-254` 无条件 emit，不共享门闩。`docs/components/virtual-list.md:32-43` 的示例常把 prefetch 与 reach-bottom 接到同一加载器。
- **根因**：同一语义存在自算阈值与原生事件两个入口，各自独立发事件。
- **最佳方案**：两个入口统一经过同一个幂等 gate，native handler 同样设置 latch，并按离开底部区域后再解锁。

#### A3-31 P1：`positionStrategy="absolute"` 是无效选项

- **精确证据**：enum/API 位于 `virtual-list.props.ts:8-15,42-47`，文档在 `docs/components/virtual-list.md:186-190` 宣称两种策略；模板 `lk-virtual-list.vue:304-333` 只特判 padding，两个策略都使用 phantom 和 translate 容器；`lk-virtual-list.scss:23-33` 始终 absolute + transform。
- **根因**：策略名称进入公开 API，但没有进入模板与样式分支。
- **最佳方案**：实现真正独立的 absolute item 定位与 transform 容器方案，并测试结构/computed 差异；否则删除 enum 与文档。

#### A3-32 P1：运行时几何变化不重算窗口，append 恢复有竞态

- **精确证据**：`lk-virtual-list.vue:149-197` 的 windowStart 只由列表长度或滚动更新；itemHeight/height/buffer/overscan 改变后不重算。`virtual-list.utils.ts:152-159` 的 customStyle 还能覆盖实际高度。append 恢复 `lk-virtual-list.vue:161-170` 使用未跟踪 timer，可能在卸载或父级再次修改后恢复旧 animation 值。
- **根因**：虚拟几何缺少统一依赖图，算法高度与可覆盖 CSS 高度不受同一约束，异步恢复没有版本控制。
- **最佳方案**：watch 全部几何输入并 recompute/clamp；禁止 customStyle 覆盖算法高度或引入实测模式；timer 使用 generation token 并清理。

### 测试、演练场与通用交互

#### A3-33 P1：showcase 的 verified 是自我证明，空案例也能通过

- **精确证据**：`showcase-cases.ts:575-581` 等记录直接写 verified；`dynamic-visual-showcase.spec.ts:9-27`、`needs-hardening-showcase.spec.ts:21-43` 主要断言静态元数据。`component-case.vue:40-45,172-176` 的“暂无展示内容”固定 display:none，即使 registry 未渲染 demo 也会通过。Backtop visual 仅测受控 visible。
- **根因**：测试 oracle 来自被测元数据自身，没有证明组件被渲染、更没有触发行为和测量结果。
- **最佳方案**：删除 verified 作为通过条件；每个案例必须产生行为事件、rect/computed 或真实 WXML 断言；空态由 registry/slot 实际存在性决定。

#### A3-34 P2：多个 demo 共用状态，视觉案例不独立

- **精确证据**：`carousel-demo.vue:73-80,132-160` 的两块轮播共用 currentBars；`collapse-demo.vue:7-11,19-69` 多案例复用 activeNames1/2；`pull-refresh-demo.vue:14-18,28-50` 三例共用 list。
- **根因**：演练场把多个独立 fixture 当作一个业务页面管理，交互和 timer 会跨案例传播。
- **最佳方案**：除明确同步对比外，一 fixture 一状态；时间依赖改成显式 probe 动作，卸载时清理。

#### A3-35 P2：H5 可访问性与键盘契约不完整

- **精确证据**：Tab/Tabbar 没有完整 tablist/tab/aria-selected 与方向键、Enter 交互；Collapse 没有 aria-expanded/aria-controls；同批组件之间焦点、禁用和可访问名称策略不一致。
- **根因**：跨端模板只覆盖触摸/点击主路径，没有把 H5 语义与键盘状态作为组件公共契约。
- **最佳方案**：建立统一 a11y contract，补 keyboard/focus/aria 运行测试；微信端验证 accessible 文本、状态与触控目标，不机械照搬 DOM ARIA。

## 3. 修复顺序建议

1. 先修会直接破坏公开行为的 P1：A3-04、A3-24、A3-25、A3-29、A3-30、A3-22。
2. 再修单位、容器和状态机类跨端根因：A3-01、A3-02、A3-17、A3-19、A3-32。
3. 完成公开空 API/视觉模式：A3-05、A3-06、A3-11、A3-16、A3-26、A3-28、A3-31。
4. 修复 Collapse 与 Navbar 契约：A3-08、A3-09、A3-13。
5. 补 P2、文档与演练场；最后移除 verified 自证并执行整套双端运行验收。

每个功能点应使用独立 branch/worktree；组件实现、直接测试、demo/文档和该功能的 Peekit 证据在同一修复范围内闭环，不能以批量格式化或无关重构扩大差异。

## 4. H5 与微信小程序 Peekit 客观验收

本节定义修复后的验收协议，不代表本次静态审计已经运行通过。每个修复分支应提供稳定 probe id，避免依赖易变的 `nth-child`。

| 组件 | H5 selector 与动作 | 微信小程序 selector 与动作 | 必须采集的通过条件 |
|---|---|---|---|
| Anchor | 在 `#a3-anchor-scroller` 手动滚动，再连续点击 `#a3-anchor-link-2`；390px 宽测 `96rpx` | 在真实开发者工具查询 `#a3-anchor-scroller/#a3-anchor-target-2`，两次点击同 href，中间手动改 scrollTop | target/container rect、scrollTop；390px 下偏移约 49.92px而非96px；active/change 各一次；无 console/page error |
| Backtop | 页面滚到 threshold-1 与 threshold+1，查询 `.lk-backtop` 并点击 | `page.scrollTo` 后查询对应 WXML 节点并 tap | display/opacity/pointer-events 随阈值切换；点击后 scrollTop=0；事件一次 |
| Carousel | probe 切换 effect/align/animated，显式增高再降高活动 slide；分别手滑和 autoplay | 对 swiper 真滑动，并通过按钮改变异步内容高度 | carousel/slide/indicator rect 与 computed transform/opacity/height；可降高；手滑不发 autoplay-change，自动切换只发一次 |
| Collapse | 点击 `.lk-collapse-item__header` 开/关，采样 t0/mid/end；运行时改 duration/accordion | 查询 WXML title 层级并 tap | 开关两方向高度/opacity 连续，最终 display/height 正确；无 `text > view`；change 载荷准确 |
| HorizontalScroll | 横向滚动 `#a3-hscroll-visible`，读取 scrollbar 伪元素 | 查询 scroll-view show-scrollbar 并执行横滑 | scrollWidth>clientWidth；hide=false 可见、true 隐藏；view/text/image/custom-root 间 gap 相同 |
| Navbar | 点击 back/right/可交互 center，viewport 390→844 | fixed 全页 fixture 获取 status/capsule rect | 不双 navigate；center 可点；标题不被左右槽覆盖；安全区与胶囊 bounds 正确；旋转后更新 |
| PullRefresh | probe 调 `start()/finish()` 并记录状态时间线 | 对真实 scroll-view 下拉并等待 restore | loading variant/size/color 生效；事件序列恰为 refresh→Success→Idle；Success 可见不少于 successDuration |
| Sticky | 在真实 scroll container 中滚过 sentry | 使用 scroll-view，多实例同时查询 | sticky rect.top=`container.top+offsetPx`；到容器底停止；change 每个边界一次；改 offset/container 后重建 |
| Tab | 初始 value=0 位于第二项，外部改 activeIndex，再把 viewport 390→320 | 真 WXML tap 0 值项并外部 setData | active/value/index 一致；change old/new 正确；slider 与 active item 中心误差不超过1px |
| Tabbar | 运行 `mode=fixed,fixed=false`、字符串 name slider、bump/list 激活与动态增删 | 同一 fixture 真 WXML tap、增删子项 | 非定位模式 position≠fixed 且无覆盖；slider 中心误差不超过1px；bump 背板 rect 非零；active icon/label 同色；顺序正确 |
| VirtualList | 用户滚到 >1000，连续两次 scrollToTop；滚到底；切 strategy 与 geometry | 真 scroll-view 重复相同动作 | 每次 scrollTop=0；一次到底只发一次；首渲染 index 等于 clamp 后计算值；两种 strategy 的 DOM/computed 确实不同 |

### 4.1 每次采集的共同字段

- 页面/组件 URL、commit、branch、viewport；微信端同时记录基础库、设备、DPR。
- 动作前后 selector、目标和容器 rect、scrollTop、事件序列与次数。
- 相关 computed：`position`、`display`、`height`、`overflow`、`color`、`transform`、`opacity`、`pointer-events`。
- console.warn/error、未捕获 page error；截图仅作辅助，不能替代数值和事件证据。
- 微信证据必须来自开发者工具/automator 的真实 WXML 与 selector query，不得用 miniprogram-simulate 替代。
- 失败时保留原始数值和时间线，不通过放宽阈值、遮挡、删除案例、更新静态截图或写 verified 掩盖。

## 5. SHA-256 与物理行总账

格式：`物理行 SHA-256 路径`。物理行使用逐文件 `ReadAllLines` 计数。

```text
174 e18ae96b7203703da9dc264208737d1c87f59cf4942b1755deada998967bf3ed docs/components/anchor.md
149 5dba903b476c6f27ea293e576c440ccffbfd02325232d78a9fc3ba7353ebb333 docs/components/backtop.md
198 d35f72ab4b0a7bc859d977cd1d1e24726b59fc51df2ed9a248f47992aa717c70 docs/components/carousel.md
172 ea0b22dca674e1c8063ebf7c940c687d1dcf351cd52fd9fe8f8400267d82c3a9 docs/components/collapse.md
89 df285c8075e782d30071dd134fc6f511b5921ed775eba72fa27a4b62c0faa770 docs/components/horizontal-scroll.md
104 426c514b8a47e59383e92f08f91a044c7f0af9639d73108d53796b8459ee0f28 docs/components/navbar.md
87 7fcd2e5c7d020ce33f5d1bc031075c2ad0e82c105bbf0c0bd378a253c822df3b docs/components/pull-refresh.md
82 dbbcba44776b3ff8083b572a85773537492aca3abba554ed0ff4680754f621f9 docs/components/sticky.md
301 9b717a238ba2bb2f4aad3938ab761a71ab782ed3e50e3f5339a37e136eaa530d docs/components/tab.md
250 648b5e3bc223ebe2ce48b9e0a352feb51efce6abf057d1b1e1efc4523a69d56c docs/components/tabbar.md
201 62ec2ad8219829067d881ddcf86af23edebc673cffa47d47afce4d0fe33705b7 docs/components/virtual-list.md
484 9664cbe7281707d753924ea1a2e41607812eaec718369c3cf47b9fbfe2f1aeda src/components/demos/anchor-demo.vue
295 2684396dd02efda7cdba5ca1e09991342dd789934199a1f6e924ac37ff4fc162 src/components/demos/backtop-demo.vue
483 f0b0eb773be1ea29dfa4ae598ce4fac0a5667fc930cb4d8cfab29f651524506c src/components/demos/carousel-demo.vue
128 3bd593f27bd72e01e34d2600f9f5c0ecfbf5df6750fbe0ca490fbf0cb093b444 src/components/demos/collapse-demo.vue
163 d1d245d00e9d152e9177bdcaa0ce61ddbbf8eef6df2ea286744fdc1678ea3fc9 src/components/demos/horizontal-scroll-demo.vue
144 9ca42f3f61f2435b282f17023cafc90faedac20958cd72110855add962b435d2 src/components/demos/navbar-demo.vue
231 7ed2bbf7d9b25f678a2645f886bb6f37413525350cd8fc3a4c6086db000c4126 src/components/demos/pull-refresh-demo.vue
186 0f34018131ab08c757802eaffddc1b7def4c11e286a1416e9b4763731a898933 src/components/demos/sticky-demo.vue
84 6355e833eda754c99e4d185b1aaf64a7229117f12ba40b5adaf14cc081501565 src/components/demos/tabbar-demo.vue
352 aff5784bb79e28f59770d9c83abc1be809f86c8c622b0ad246940c8c0f753c20 src/components/demos/tab-demo.vue
117 9ee497a9babfe7acefe994fc56008cddd63902d4fe119a6517123bdc14230577 src/components/demos/virtual-list-demo.vue
85 2a7b9ca6a53344c4b5b6d5723886ca0e197479c2ba9c51beeab4371939f45a5d src/components/preview/preview-demo-registry.ts
167 384ebd26037ad17260d3e1e9075e848ba51fefed6e76a76ebe5fc028f36da297 src/components/preview/PreviewDemoRenderer.vue
182 058fedfe129ccf84158163128b94923ace9ed82bfa3d100ff7d3abc4d87b6cad src/components/showcase/component-case.vue
664 ab131d0afac2823dae26d1ce783136c16417c0aaa34e5abe8dfec6bef6dc032f src/components/showcase/showcase-cases.ts
273 2d585a5bdb2207fd56ad1bbb3d1d5987c2d1e47bf2d0fc592930707272f5cf0f src/pages_sub/component-detail/index.vue
178 e95e88f533164fbfb3ec5aa662956c920fe814be1b0b7b13fee467689903034e src/pages_sub/pull-refresh-page/index.vue
301 9650fdb2050e05c413450ae2797be358b968520881ce4287365d672d76db8380 src/pages_sub/showcase/index.vue
195 42959195090c409562b91481b05d13af3ebcc511b21590b495ec1da7bb04bd4b src/uni_modules/lucky-ui/components/common/props/index.ts
72 0fb3f3c9345ca1a84e8cdbf523acf95785705ef17fc43075de920c6614f4aa82 src/uni_modules/lucky-ui/components/lk-anchor/anchor.props.ts
176 b9e26be9643745c5ef43bc49ff35eeae524a4c27dc68597bdbcd62d049601d99 src/uni_modules/lucky-ui/components/lk-anchor/anchor.utils.ts
130 23280fc2f25eddc44e4f8ae2de1017f007aa89d5513aaa1afd79064c961b2490 src/uni_modules/lucky-ui/components/lk-anchor/lk-anchor.scss
369 f372a7eaf002d5f091f8c390aac90b637fdd282fa8d67bb415c5b719b4d93554 src/uni_modules/lucky-ui/components/lk-anchor/lk-anchor.vue
72 7460db697723dcb46b544bf1ccd9ccd7b895c11b9e39f2b71df8b3902997c0aa src/uni_modules/lucky-ui/components/lk-anchor/lk-anchor-link.vue
92 236d458e8104c6e76a71c2218ac5d70c027564f59dafc142117acad2609789ae src/uni_modules/lucky-ui/components/lk-backtop/backtop.props.ts
62 857f0aa34850d65ac1684ae6f95104bdeb5825f1daeea8d96dbaad66acad7dc7 src/uni_modules/lucky-ui/components/lk-backtop/backtop.utils.ts
73 a141b0bc7ecd1050af7b08af908d708855a755acda9b1a9fcb41f3d450aa8acf src/uni_modules/lucky-ui/components/lk-backtop/lk-backtop.scss
138 8109808f447a773cfc0e10f833b129a647c47b14d2dbe3a0c9b03e798b743d47 src/uni_modules/lucky-ui/components/lk-backtop/lk-backtop.vue
118 8dc39f95af5e3b13ab472065420875c2d4f3cf5239aa15ce5547ec069b1a731e src/uni_modules/lucky-ui/components/lk-carousel/carousel.props.ts
250 e666993369224fa0206a5afc1e8fdfab7d390368de5193f381989854270b3f7d src/uni_modules/lucky-ui/components/lk-carousel/carousel.utils.ts
193 29d016b00b5f0fa80e32e9d0858ad72126e740d8f636a40a509b83f9da5beb23 src/uni_modules/lucky-ui/components/lk-carousel/lk-carousel.scss
393 5db375e5f67c0ac3051312f943d8fefad1f2d1edb51f3debef7b599775ba0e54 src/uni_modules/lucky-ui/components/lk-carousel/lk-carousel.vue
59 8dbe2a2426525150307583e92a4ee3ebbb22d03e99f8d49aa98ba5a77da70c0f src/uni_modules/lucky-ui/components/lk-carousel/lk-carousel-item.vue
66 415ab3623b5e282be14bd20995311d373265246dfd29d9f42a987384ca39fe2a src/uni_modules/lucky-ui/components/lk-collapse/collapse.props.ts
108 a07d449952802f3db09fba81739f5dc36c08f1b02c8edacfaadcee1f46d4bf18 src/uni_modules/lucky-ui/components/lk-collapse/collapse.utils.ts
125 67c74ac682dc203414ae7a8e43e3536d9958b0c337aeae303379ab07951d32fe src/uni_modules/lucky-ui/components/lk-collapse/lk-collapse.scss
87 de1f92f195ee3b88eadf76edac13257b621b75a3bc1f0b0a80a04bfc6a021c03 src/uni_modules/lucky-ui/components/lk-collapse/lk-collapse.vue
87 854c24da0238f821f7602fb7e54392cdd6914e6b404ff865735dc23f947a95f7 src/uni_modules/lucky-ui/components/lk-collapse/lk-collapse-item.vue
20 2a70dffb5e5559ee2c35545903048cd8a7bcc4488de79210e893d5c65e01122b src/uni_modules/lucky-ui/components/lk-horizontal-scroll/horizontal-scroll.props.ts
26 83b1efe03a7e9e78d0d6d8b5e519d353bee0f0e6260075a1a0059be89afdb9b9 src/uni_modules/lucky-ui/components/lk-horizontal-scroll/horizontal-scroll.utils.ts
50 40cc9507f49615a5514f78091dfb460a223c0b733710206b8f8e150b916ba044 src/uni_modules/lucky-ui/components/lk-horizontal-scroll/lk-horizontal-scroll.scss
43 7266e7f6089742f82de501491846e54abecede3f90bcb15be164ea6d25e1bc03 src/uni_modules/lucky-ui/components/lk-horizontal-scroll/lk-horizontal-scroll.vue
54 441ccba6e2e94e50b990b9903935e948c05ede13602ae11aad8a5b68fe2381ec src/uni_modules/lucky-ui/components/lk-loading/loading.props.ts
221 76e7b2569305c1df6789afe1fd9ae95904e90a9a9cc61bdf853ef92a1e834dcc src/uni_modules/lucky-ui/components/lk-navbar/lk-navbar.scss
199 a3c1d6e0ad0ead3f637ad992caaf6a75f2a8813aef0e4e9a322d07bcfa0fa81e src/uni_modules/lucky-ui/components/lk-navbar/lk-navbar.vue
75 f0ef5884dd05037821bedf8e50d688b740510211c293e143bc517d3d364caa85 src/uni_modules/lucky-ui/components/lk-navbar/navbar.props.ts
118 acc364e92d70d1b5e2a39966f0691f94c79b53cf2c5040105af46164b41fed2b src/uni_modules/lucky-ui/components/lk-navbar/navbar.utils.ts
71 d7e1aceaa4fa2f431c9e9fd61a9ad5047635ff597c7bb6378e466e635bdf772e src/uni_modules/lucky-ui/components/lk-pull-refresh/lk-pull-refresh.scss
282 2f0f548b43be89ff7dbf999653ea44e04d629cade431371e80416073475376d8 src/uni_modules/lucky-ui/components/lk-pull-refresh/lk-pull-refresh.vue
83 25e0f06bac28f31b462f6205dd1658e502b295010168ba0131cbf1eb5d6592e3 src/uni_modules/lucky-ui/components/lk-pull-refresh/pull-refresh.props.ts
139 7fa1bbcdefcfa638dc36a1dd58378f2f81448ca2e4d002f463a641add701f328 src/uni_modules/lucky-ui/components/lk-pull-refresh/pull-refresh.utils.ts
5 557b2b3b7552b9b353df0d8813b2687e55ce1157ac21313ee680bb8911c556e3 src/uni_modules/lucky-ui/components/lk-sticky/lk-sticky.scss
115 f7ae6c2e475cb057722fc15057bde9b80ed67eb9914d7e9d52b10f0218ccb4db src/uni_modules/lucky-ui/components/lk-sticky/lk-sticky.vue
21 e03e783b5a28bfcec6f73248a5aef2d20be159c86e334b4fdc40dc7bf143b944 src/uni_modules/lucky-ui/components/lk-sticky/sticky.props.ts
46 886274635701bb9989ff346cc2f83917b35bca13c9bec67b267a33f5ca677515 src/uni_modules/lucky-ui/components/lk-sticky/sticky.utils.ts
239 2a3ad5b719f046896964241ab78b89f18a0419e391340648e8847bf4eab7a8bb src/uni_modules/lucky-ui/components/lk-tab/lk-tab.scss
338 acc62674cbed93e16d785bf9ffd7cd02b0cea8e8226aca9c48321a354ca49781 src/uni_modules/lucky-ui/components/lk-tab/lk-tab.vue
135 d4895d9677f5fa5d5cd0994669846731d7be78a4421858b52cda4b71370f17c6 src/uni_modules/lucky-ui/components/lk-tab/tab.props.ts
85 354ce57ac430b71b7578b2116f24f8fead48714bf4bf21671ae12588d620ba53 src/uni_modules/lucky-ui/components/lk-tab/tab.utils.ts
23 c97f050f57895be0faac5981a5613910902bac65a1bd0990bc4b24405ca870a8 src/uni_modules/lucky-ui/components/lk-tabbar/context.ts
295 ed425ed8b68d53102cb6760991ca88104b334e2030bda5ba2de18fe1cc124a94 src/uni_modules/lucky-ui/components/lk-tabbar/lk-tabbar.scss
281 90b2f8ee48f66e6a1dc62dccb39043617ab8ad2acb127766fb95e94c36e7093d src/uni_modules/lucky-ui/components/lk-tabbar/lk-tabbar.vue
129 320ef0e0bd798e30dd2be769b7d34ce90b9f07c77492f97189189d47ba6f26c0 src/uni_modules/lucky-ui/components/lk-tabbar/lk-tabbar-item.vue
119 0dab639daca2f00a062cc92f984e859a5cc0499b9f440d930e362aaf5110037d src/uni_modules/lucky-ui/components/lk-tabbar/tabbar.props.ts
212 a6e774a07174500e32801e4fbafa18db28ff745eced69abc1e6c619dd394c7e9 src/uni_modules/lucky-ui/components/lk-tabbar/tabbar.utils.ts
56 6508efbeecc1e0f23a12ee3d927128a51c23e3657f37eb50c5ee1666f0fa155c src/uni_modules/lucky-ui/components/lk-tabbar/tabbar-item.props.ts
39 19c85454a904ddb7d497d4d9b5fd4948fa2c3b50b6d07f5d8ab7a6a48fe2b778 src/uni_modules/lucky-ui/components/lk-virtual-list/lk-virtual-list.scss
339 b87e35d384df44a470d7e7eec25a55302ca3bf7e1e4c781a0dc0c429888860d6 src/uni_modules/lucky-ui/components/lk-virtual-list/lk-virtual-list.vue
94 c5854b903f59c67903089eb1c4cef0a70d7aae1795e36689193a8f3d289a80e3 src/uni_modules/lucky-ui/components/lk-virtual-list/virtual-list.props.ts
168 438bd38205446b3d15389eac80dbb1fabc8e44f5747302d350ce6830ea94ca46 src/uni_modules/lucky-ui/components/lk-virtual-list/virtual-list.utils.ts
26 643152c4e2582a10bb35f4e5acd1bed60d3fedd71e696e9da327a982374699e1 src/uni_modules/lucky-ui/composables/useLocale.ts
50 b368136804cc3d700c70957446929c1d72f45038a9873ad474922e7525e05e87 src/uni_modules/lucky-ui/composables/usePagePullRefresh.ts
165 0961c388d6271e58f5c5d70de9d7f890001b16af9e3ba35e1de7a6fd4ea4c5ab src/uni_modules/lucky-ui/composables/useRipple.ts
225 f3f7758e1c78d20b02e85c1d70e2febd4612906817bfe26bcbf953796966b40a src/uni_modules/lucky-ui/core/src/utils/scroll.ts
11 8e551db4748a516e2ae1ac474ee409c28f4a90d92efc36e352e1b2f1d2512de9 src/uni_modules/lucky-ui/core/src/utils/unit.ts
45 067ee2bc8f3e8ba49305064f0d0a5ffff3281cbbecdae06f8ef93e89765ccbe9 tests/miniprogram/tab.spec.js
170 d9b0985a1e743552a5898ff30636593efbf6dbcc15366a1ac06eb6b5d9cdad3e tests/unit/lk-anchor.spec.ts
76 b3206b92384749650b5be59d6b93c322f641e08a17f9c4e9c66525d4591e0043 tests/unit/lk-backtop.spec.ts
176 010816996accd5669cf6731bdadfd909f50fb99e14bb95b447d5ae4874f13127 tests/unit/lk-carousel.spec.ts
105 8aecc6429b98930278752a6e8ef2eb7d861f20cdcd0125203148186f7426d491 tests/unit/lk-collapse.spec.ts
44 57baa5514c37224eed417ec999b24299e6165cf078398f3d98b12e39619244e7 tests/unit/lk-horizontal-scroll.spec.ts
108 7821582799c4db700cbdc5c198a3ad8004082de32fba615f1a44287695738015 tests/unit/lk-navbar.spec.ts
170 e4b88554e0664b346901dbc115998c0d8f7164044b90664ade8466009417c50b tests/unit/lk-pull-refresh.spec.ts
58 cdb73ba78366a7fb46e6e2312bf97c863330660089c48d1f2e52e2b1784ada56 tests/unit/lk-sticky.spec.ts
189 c6d26ac5d282a9f35e7ae68bc05a42f090e6b56285ac410d11523ab413eedad0 tests/unit/lk-tabbar.spec.ts
119 dc4bf61fec33d5f5cf38208e403f1d93f9aad3b21d5eca0aa365c59c3d751381 tests/unit/lk-virtual-list.spec.ts
29 8c3a9a3e22692c5cf2c7440f4c2922d625cb2de5029bfb1e220d485df8909904 tests/visual/dynamic-visual-showcase.spec.ts
104 9a2d7f7d8ab9fa5cd9c8b125cf7b16bb446fb58ae63fe51954fcceb5183d9e7b tests/visual/high-risk-showcase.spec.ts
88 776d128290c080b7f0f0352e30b419c7eecefd50c4e50ae65302aedec25a651a tests/visual/needs-hardening-showcase.spec.ts
```
