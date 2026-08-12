# A1 高风险组件逐行审计报告

## 范围与结论边界

- 基线：`c8071e67f93cc95ee1ddc12cac7bfccdf74058c1`。
- 强制范围：Picker、TabbarContainer、Tooltip、Waterfall 的组件实现、文档、demo、直接 unit 与 showcase 高风险调用链。
- 覆盖：29/29 个强制文件、7,184/7,184 个物理行；未读 0。
- 本批只做静态语义审计，没有编辑组件、没有把 unit、showcase `verified` 或构建成功当作双端运行证据。
- 下列问题均已达到 E1；没有 H5 与微信修复前后对照前保持 open。

## Picker

### A1-01｜P1｜内联模式没有提交入口，`v-model` 永远不更新

- 证据：滚动/点击只在 `lk-picker.vue:297-327` 更新草稿索引并发 `pick`；唯一 `update:modelValue/change` 在 `:406-415` 的 `onConfirm`；内联模板 `:455-516` 没有确认按钮，文档 `picker.md:72-76` 却直接展示 `inline v-model`。
- 根因：弹层“草稿后确认”状态机被复用于没有确认入口的内联形态。
- 最佳方案：内联在列索引落稳时提交 model/change；弹层仍只在确认后提交，两个模式共享列计算但不共享提交时机。
- 客观验收：固定 `.audit-picker-inline`，选择第二项后 `.audit-picker-inline-value` 立即改变；事件严格为 `pick → update:modelValue → change` 且各一次。弹层同样操作在确认前 model 不变。H5 与微信执行同一数据和选择器。

### A1-16｜P2｜工具栏标题不保证几何居中

- 证据：`lk-picker.scss:24-31` 使用 `justify-content:space-between`，模板 `lk-picker.vue:527-534` 是三个普通兄弟；左右按钮文案不等宽时中间标题按剩余空间分布而非容器中心。
- 最佳方案：三列 grid `1fr auto 1fr`，左右按钮分别贴边，标题中心以 toolbar 为参照。
- 客观验收：cancelText=`暂不选择`、confirmText=`确定`，标题中心与 toolbar 中心偏差不超过 1 CSS px/平台舍入值。

### A1-17A｜P3｜内联与弹层复制完整列模板

- 证据：`lk-picker.vue:461-515` 与 `:536-590` 复制列、虚拟列表、active/disabled 语义。
- 最佳方案：提取跨端安全的内部列渲染单元，平台条件边界保留在外层；先用事件、slot props 与结构契约锁定行为再去重。
- 验收：内联/弹层两条路径对相同数据输出相同列数、选中/禁用 class、slot 参数和 `pick` 事件。

## TabbarContainer

### A1-02｜P1｜模块级单例让多个容器互相覆盖

- 证据：全局状态在 `core/src/tabbar-container/index.ts:72-78`；每次 init `:93-110` 清空 maps；每个组件挂载及深 watch 都调用 init（`lk-tabbar-container.vue:175-199`）；现有 demo 同页正好有两个实例（`tabbar-container-demo.vue:110-146`）。
- 最佳方案：`createTabbarContainer()` 产生实例状态并由组件 provide/inject；模块 singleton 只能作为显式 legacy API。
- 客观验收：点击 `.tabbar-safe-shell` 的 Cart 只改变该实例 `.is-active` 与 pane title，`.tabbar-preview-shell` 完全不变；反向切换亦然，H5/微信都记录两个状态快照。

### A1-03｜P1｜异步切换按最后完成提交，而不是最后点击

- 证据：`switchTab` 在 loader resolve 后才写 activeId（`core/.../index.ts:121-163`），组件 `handleTabClick` 直接等待该 Promise（`lk-tabbar-container.vue:150-164`）。
- 最佳方案：单调 switch generation 表达 latest intent；加载 Promise 可缓存，但只有最新 generation 能提交 active/visited，reset/re-init 使旧 Promise 失效。
- 客观验收：依次点 slow(300 ms)、fast(20 ms)，先 resolve fast 后 resolve slow；400 ms 后 active/title 始终 fast，旧 slow 不发 change。

### A1-04｜P2｜默认视觉模式的实现、注释、文档三方不一致

- 证据：prop 默认实际为 `text-raise`（`tabbar-container.props.ts:47-52`），组件注释/fallback 声称历史默认 `block`（`lk-tabbar-container.vue:63-66`），文档也写 `block`（`tabbar-container.md:99-104`）。
- 最佳方案：一个导出的默认常量作为实现、类型、文档、demo 唯一真源；若维持 text-raise，必须按 breaking/default-change 管理。
- 验收：无 mode fixture 的根 class 与公开文档默认严格相同，双端 snapshot 只出现一个模式类。

### A1-05｜P2｜`keepAlive` 未实现，配置变化又会无差别销毁状态

- 证据：`keepAlive` 仅声明于 core `:28-29`；所有已访问面板由 `v-if + v-show` 常驻（组件 `:206-210,247-283`），所以 false 也保活；tabs 任意深变更触发 init 清空全部实例（`:194-199`、core `:93-105`），所以 true 又可能丢状态；preloadAll timer `:182-190` 无 owner/cleanup。
- 最佳方案：按 id 增量 reconcile；true 保留已访问实例，false 离开即卸载；定时器归属组件实例并在卸载/配置变更时取消。
- 客观验收：带计数器的 true/false 两面板来回切换并动态改 badge；true 保持计数，false 重新挂载，badge 变化不重置 true 面板，卸载后 timer=0。

### A1-06｜P2｜`fixed=false` 仍强制叠加安全区

- 证据：safe-area padding 无条件应用（`lk-tabbar-container.vue:421-425`），fixed=false 只改变定位/placeholder（`:444-455`）；文档却建议已有安全区或嵌套容器使用 fixed=false（`tabbar-container.md:30-35,74-95`）。
- 最佳方案：将 fixed 与 `safeAreaInsetBottom` 解耦，后者用独立 boolean/number prop。
- 客观验收：外层已有等效 34 px 安全区时，关闭组件安全区后总底部间距只出现一次；读取 tabbar rect 与 computed padding，不以截图目测。

### A1-17B｜P3｜scroll-view 与普通 view 面板主体复制

- 证据：`lk-tabbar-container.vue:208-246` 与 `:247-283` 重复 loading/error/slot/component 主体。
- 最佳方案：抽取单一 panel renderer，外层只选择滚动宿主。
- 验收：两条分支的 loading/error、slot props、组件实例和事件序列严格相同。

## Tooltip

### A1-07｜P2｜切换 disabled 无法关闭已打开浮层

- 证据：disabled watcher 调 `doOpen(false)`（`lk-tooltip.vue:147-151`），但 `doOpen` guard 在 disabled 时拒绝所有变化，包括关闭（`tooltip.utils.ts:23-30`、组件 `:54-68`）。
- 最佳方案：disabled 只拦 `nextOpen=true`，关闭始终允许；禁用同步清 show/hide timer。
- 客观验收：打开 `.audit-tooltip-disable .lk-tooltip__pop` 后切 disabled，浮层消失，`close/hide/update:modelValue(false)` 各一次，timer=0。

### A1-08｜P2｜受控模式生命周期事件与真实可见状态不同步

- 证据：受控 setter 只请求父更新（组件 `:33-45`），`doOpen` 却无论父是否接受都立即发 show/open（`:54-83`）；父级直接设 modelValue=true 时没有边沿生命周期，现有 watch 只定位（`:256-260`）；timers `:48-49` 无卸载清理。
- 最佳方案：request 与 resolved open 分离；所有生命周期事件由 resolved state 的真实边沿统一产生，并保存 source；effect scope 清 timer。
- 客观验收：父拒绝 update 时 pop 不出现且 show/open=0；父外部设 true 时 pop 出现且 show/open 各一次；卸载后无延迟事件。

### A1-09｜P2｜自定义内容点击冒泡到根触发器并关闭

- 证据：根绑定 `@tap="onTriggerClick"`（组件 `:264-273`），pop/content `:278-295` 不阻止 tap；文档宣传复杂可交互内容（`tooltip.md:26-37`）。
- 最佳方案：pop 根 `@tap.stop`，交互内容补键盘/可访问性语义。
- 客观验收：打开后点击 `.tooltip-custom-content`，pop 保持可见；只有 trigger 或明确外部关闭动作才消失。

### A1-10｜P2｜边界算法只 flip 不 shift，长内容仍越界

- 证据：pop 在 trigger 局部绝对定位（`lk-tooltip.scss:15-46`）；`getFallbackPlacement` 只换方向（`tooltip.utils.ts:67-90`）；body 默认 nowrap（SCSS `:48-60`）；demo 的 width=50% 实际相对 inline trigger（`tooltip-demo.vue:43-49`）；transition config 是初始值快照（组件 `:226-244`）。
- 最佳方案：统一 flip+shift/clamp 与 maxWidth；明确百分比参照物。H5 可 portal，微信使用 root-portal 或记录局部限制；动画方向随最终 placement 更新。
- 客观验收：trigger 位于四角、长文本 320rpx，pop 满足四边距 ≥12 px、箭头仍指向 trigger；记录 rect/placement/computed transform。

## Waterfall

### A1-11｜P1｜同长度替换或重排继续显示旧 item

- 证据：card 缓存旧 item 引用（`lk-waterfall.vue:133-149`），watch 只看 `props.items.length`（`:282-292`）。
- 最佳方案：按 id、顺序和几何字段增量 diff；无法安全增量时重建，并提供明确 `refreshLayout()`。
- 客观验收：`[A,B]` 替换为同长度 `[X,Y]`，首卡 title/id/click payload 全部变 X，位置与新 ratio 对应。

### A1-12｜P1｜三个公开 prop 未接入，真实图片尺寸也不触发布局修正

- 证据：`preloadScreens/preloadImage/errorPlaceholder` 声明于 `waterfall.props.ts:115-132` 但实现未读；load/error 只改 loadingState（组件 `:216-241`）；无 ratio 时永久使用 estimate（`waterfall.utils.ts:90-118`）；文档仍承诺能力（`waterfall.md:61-72,114-117`）。
- 最佳方案：preloadImage 使用 `uni.getImageInfo`/load 尺寸并从受影响索引重排，preloadScreens 进入阈值，error 真正切 placeholder；若不实现则按 breaking 流程移除空 API。
- 客观验收：两张无 ratio 且比例差异明显的本地固定图片，load 后 card 高度匹配真实比例；错误图显示指定 placeholder；preloadScreens=0/2 的首次 load-more scrollTop 有可量化差异。

### A1-13｜P1｜`load-more` 从 scroll 与 scrolltolower 重复连续触发

- 证据：阈值内每次 scroll 都 emit（组件 `:170-187`），scrolltolower 又发 reach-bottom 与 load-more（`:190-193`）；文档示例把同一函数同时绑定两个事件（`waterfall.md:49-58`），但验收要求不重复（`:168`）。
- 最佳方案：以数据版本/请求周期 latch；reach-bottom 是观测，load-more 是一次性请求，追加数据或显式结束请求后解锁。
- 客观验收：连续滚动阈值并触底、数据未变时 `.audit-waterfall-load-count=1`；追加数据后下一周期才可为 2。

### A1-14｜P2｜已加载空数组被永久当骨架，底部加载点也永久存在

- 证据：空数组时 `processNewItems` 在设置 ready 前返回（组件 `:126-156`）；默认 showSkeleton 导致永久骨架（`:356-359`）；有卡片时 footer 点永久渲染（`:483-490`）；SCSS 有 empty 样式但模板无空状态。
- 最佳方案：显式 loading/finished，empty/footer slot；测量完成允许空状态 ready，footer 仅 loading/hasMore 时显示。
- 客观验收：finished 且 items=[] 时 skeleton=0、empty=1；finished=true 时 loading-dot=0；切回 loading 时对应状态恢复。

### A1-15｜P2｜窗口、容器和多数几何 prop 变化不重排

- 证据：容器仅 mounted 测量一次（组件 `:244-276`），后续 watch 只看 items.length 和由旧 containerWidth 算出的 columnWidth（`:282-299`），无 ResizeObserver/uni.onWindowResize 及 cleanup。
- 最佳方案：H5 ResizeObserver、微信 onWindowResize/页面尺寸回调，统一 debounce 后重新测量；rowGap/paddingY/estimateHeight/defaultExtraHeight 等几何 prop 同步触发。
- 客观验收：H5 390→844 和微信模拟器旋转后，两列 card 全在容器内、gap 正确，无重叠、越界、旧宽度，卸载后 listener=0。

### A1-18｜P2｜`ratio` 文档语义与实现容易反向

- 证据：`waterfall.utils.ts:98-114` 用 `columnWidth * ratio`，所以 ratio 实际是 height/width；props/doc 称“宽高比”（`waterfall.props.ts:16-17`、`waterfall.md:132`），通常理解为 width/height。
- 最佳方案：兼容版本明确命名/文档为 `heightWidthRatio`；若切标准 aspectRatio，则实现为 `columnWidth / ratio` 并提供迁移。
- 客观验收：同图分别传 imageWidth/imageHeight 与约定 ratio，最终 card height 一致。

### A1-20｜P2｜现有 Waterfall demo 不能生成确定性基线

- 证据：`waterfall-demo.vue:20-23,273-295` 使用 Math.random，`:25-234` 依赖外网 Unsplash，`:299-320` 人工 600 ms 延迟，`:343-350` 以 windowHeight-180 猜容器高度。
- 最佳方案：独立 audit fixture 使用本地固定图片、固定 seed、明确 empty/error/same-length-replace/load counter；普通展示 demo 可保留随机趣味，但不能进入验收基线。
- 验收：断网、重复运行与不同时区下，fixture DOM 数据、布局关键值和截图 hash 保持稳定。

## 验收体系缺口

### A1-19｜P2｜Showcase 的“已验证”是自证标签

- 证据：四项元数据直接写 verified（`showcase-cases.ts:548-635`）；`high-risk-showcase.spec.ts:23-36` 主要断言标签。Picker 只开关、Tooltip 只看可见/箭头、Waterfall 只数卡、Tabbar 两实例只点共有 Cart，均会绕开上述问题；四个 unit 只测 utils。
- 最佳方案：verifyStatus 只能由 H5+微信证据 manifest 生成，包含 platform、viewport/device、commit、步骤、selector rect、event trace、screenshot hash、console/error 与结论。
- 验收：删除任一证据或让任一行为断言失败时，showcase 不再显示 verified 且 CI 非零退出。

## 合理特例

- Picker 在微信端关闭 label transition 是明确的性能降级，不在没有 Peekit 证据时判错。
- Tabbar 微信动态组件使用具名 slot fallback 已有文档边界；正确提供 slot 时不判错。
- `flashlight/float/mask-fill` 的 filter/动画差异已有 safeMode 与文档说明，必须先取双端运行证据。
- Waterfall 的 id 已声明唯一，本批不重复登记“重复 id”输入错误。

## 强制文件覆盖与 SHA-256

| 文件 | 行 | SHA-256 |
| --- | ---: | --- |
| `docs/components/picker.md` | 138 | `ad2730f27fb9fb540ab0cb999cdb47346c4134b21439b07b7abf0fe34abfa403` |
| `docs/components/tabbar-container.md` | 174 | `38efa042c9d8e69016b36f8905057103e59edf485c23de26db6a2477b4ef2981` |
| `docs/components/tooltip.md` | 167 | `868e33c1750bfc46fc517945ac7fb868ae096ab3d51e8c7c16a7ec337f7875a1` |
| `docs/components/waterfall.md` | 172 | `b736e0181d27ddf2ba7f104394419c6d87ac7d40913aa7a6673b56c6e0bbdec9` |
| `src/components/demos/picker-demo.vue` | 156 | `7b61f2121e78fb5e672549ac9967de5c40fabfeda799a0d7db9ae639cdfe4137` |
| `src/components/demos/tabbar-container-demo.vue` | 205 | `60e8a12ab4f30b0f95daa2ce3a1eb16ed31dada8c58a1e817bbc4b4925d63f51` |
| `src/components/demos/tooltip-demo.vue` | 147 | `cd8c9282b20d18879c3459fec7169ac65ed9ac48158d3e995ab11434ceb2dfdc` |
| `src/components/demos/waterfall-demo.vue` | 623 | `de017695552b5e1a406926d76714b9536f7c5178de34eff12b92497217a8595c` |
| `src/components/showcase/showcase-cases.ts` | 664 | `ab131d0afac2823dae26d1ce783136c16417c0aaa34e5abe8dfec6bef6dc032f` |
| `src/uni_modules/lucky-ui/components/lk-picker/lk-picker.scss` | 185 | `71d3a3be2713c0793b7b3ea33d463f0d74fbce821c6c781d2497ae72d4dd58b5` |
| `src/uni_modules/lucky-ui/components/lk-picker/lk-picker.vue` | 597 | `72295c712bf9f1f2d22351fc0cb5c12b88a3654448b550b00cab5cf10b4f3e01` |
| `src/uni_modules/lucky-ui/components/lk-picker/picker.props.ts` | 72 | `e8417c2924d37799e6162b073cc6e114a9e6b87d707600bef07c4c2f50a7aea5` |
| `src/uni_modules/lucky-ui/components/lk-picker/picker.utils.ts` | 299 | `7b46436737de3032d2f38fe3a8a8e63c828b3b2a6c43773afa37ae91a79fa0e6` |
| `src/uni_modules/lucky-ui/components/lk-tabbar-container/lk-tabbar-container.scss` | 8 | `50b15312faef94ae99ec37277696bafc95913844dc5f8d124f6ad3b7fb66b0e9` |
| `src/uni_modules/lucky-ui/components/lk-tabbar-container/lk-tabbar-container.vue` | 775 | `bfc424fa7b2c3b750f9e96e9f634b2970aa4978a68a2a079e84db3ef594a5ebf` |
| `src/uni_modules/lucky-ui/components/lk-tabbar-container/tabbar-container.props.ts` | 93 | `9aa8cb4f55343eafdbade1579a8156a1042c2b88c629a05891ad38f5502421f5` |
| `src/uni_modules/lucky-ui/components/lk-tabbar-container/tabbar-container.utils.ts` | 153 | `486f0beea14bfd284c733a3243dc9ab3f511b374689c7a8fe394e6ecfe5b427b` |
| `src/uni_modules/lucky-ui/components/lk-tooltip/lk-tooltip.scss` | 182 | `f1d8462b9a522871d30b64186c0b77f96224f2d2742d308446a98b971bbb2a65` |
| `src/uni_modules/lucky-ui/components/lk-tooltip/lk-tooltip.vue` | 301 | `e8078b49fe106fde44a76d336af3a71b7db8c1fa6030ef35baff637338013d54` |
| `src/uni_modules/lucky-ui/components/lk-tooltip/tooltip.props.ts` | 131 | `3fe7811438245bba322992d06b01c0adcc6d9fbbc73258f33c14913387307615` |
| `src/uni_modules/lucky-ui/components/lk-tooltip/tooltip.utils.ts` | 178 | `ed15401b59c1fbb7c451715f4459ad2c546d4789b32d5aa261728d27e03b7848` |
| `src/uni_modules/lucky-ui/components/lk-waterfall/lk-waterfall.scss` | 202 | `537837612bc9c67aff2e3169222140cfa13cf02ef6188292c5ab9ae27d14a1c3` |
| `src/uni_modules/lucky-ui/components/lk-waterfall/lk-waterfall.vue` | 499 | `f0d91427e6c1cfde7e69262b65f900a17daab7267a5196f185fd6d60b4c8e8af` |
| `src/uni_modules/lucky-ui/components/lk-waterfall/waterfall.props.ts` | 177 | `8dad9c1d344e59a22c70662d22b8c62e8af3c5e73773323f3521e9400da42efd` |
| `src/uni_modules/lucky-ui/components/lk-waterfall/waterfall.utils.ts` | 249 | `97511f9f852839b2ed33cbbe94f1448a29d89737456ae3827f60dbfc5f6348fa` |
| `tests/unit/lk-picker.spec.ts` | 157 | `1c3ddbb47c601a3260c55fa9759dd437bacd99c6c6507bd90555560988938410` |
| `tests/unit/lk-tabbar-container.spec.ts` | 118 | `d5a5541536334236f628e427931709f9dcbcbf5a232f7dbb72c00dde9a327f8a` |
| `tests/unit/lk-tooltip.spec.ts` | 194 | `6df11ec572cbaae17f13a68de6c2b4983e409f3253377d3678a3b23fe90ddd31` |
| `tests/unit/lk-waterfall.spec.ts` | 168 | `483b9fe5b742e2b309a867ad830b54933daefa68cbcfde4cae94f72b1ae5fd05` |

必要调用链另读 Tabbar core、Tooltip transition、base props、Popup update 链、showcase renderer/page/high-risk spec；这些已在共享层或相邻批次账本登记，不重复计入本批 29 文件分母。
