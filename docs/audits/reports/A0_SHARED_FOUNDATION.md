# A0 共享基础层逐行审计

## 结论与证据边界

- 基线：`docs/lucky-ui-full-audit`，提交 `c8071e67f93cc95ee1ddc12cac7bfccdf74058c1`。
- 范围：通用 Props、Core、Composables、Utils、Theme、Locale 与包入口，共 77/77 个文件、10,338/10,338 个物理行；未读文件 0、未读物理行 0。
- 分组：Common 1/195、Core 21/3,782、Composables 6/1,593、Utils 4/293、Theme 32/2,632、Locale 9/1,374、Package 4/469。
- 发现：P0 0 项、P1 23 项、P2 20 项，共 43 项。编号为 A0-01～A0-43，连续且不复用。
- 本报告是静态逐行证据，不声称 H5 或微信小程序运行态已经通过。下文的 Peekit 条目是修复分支必须执行的验收合同；构建成功、生成 WXML、工具函数单测或静态截图均不能替代真实交互结果。
- 共享层影响所有组件，修复必须按功能点建立独立工作树与独立分支；不得在当前审计分支直接混入功能修改。

## 最小竞态复现

1. **Request generation**：旧请求 R1 使用 `requestId=x,retry=1`，首次失败后进入 retryDelay；此时启动 R2(x)，再放行 R1 的延时。当前 R1 重试会先 `cancel(x)`，从而中止更新的 R2。修复后 R1 必须以 cancelled 终止，R2 不得被 abort，且只有 x 的最新 generation 可提交。
2. **Transition exactly-once**：进入动画 30ms 触发根节点 `transitionend`，100ms fallback 仍会再次 finish；当前 `onAfterEnter` 可为 2。修复后 150ms 时必须严格为 1，子节点冒泡事件不能提前结束根动画，卸载后回调/计时器/监听器均为 0。
3. **Tabbar isolation/latest wins**：A、B 两个容器依次初始化；当前后者会清空前者全局 Map。再发起 slow→fast 切换并按 fast→slow 完成；当前 slow 会回抢 activeId。修复后容器状态隔离，active 始终为 fast，reset/re-init 后旧 Promise 不得回写。
4. **Preload retry ledger**：一个 `maxRetries=1` 的任务先失败后成功。当前等待重试期间同一任务同时存在于 completed 与稍后的 pending，统计总数和 loading 状态失真。修复后任一时刻一个 taskId 只能属于一个状态集合，状态序列必须是 pending→running→retry-wait→pending→running→completed。

## 问题明细

### Common：2 项

### A0-01 P2｜通用 throttle/debounce Props 是无行为的公开契约

类型：交互、API、代码冗余、文档。

证据与根因：`components/common/props/index.ts:30-44` 把 `throttle` 与 `debounce` 放入所有组件共享的 `baseProps`，但共享层没有点击包装器、优先级规则或事件白名单；逐组件使用链也不存在统一消费。结果是组件会在运行时接受参数，却可能完全不改变事件频率，不同组件若自行实现还会产生不同语义。

最佳修复层：建立单一 `usePressGuard`，明确 throttle 与 debounce 互斥/优先级、leading/trailing、disabled 与卸载取消；只让真正支持受控触发的组件声明这些 Props。若不准备提供该能力，就从通用 Props 和文档中删除，不能保留“接受但无效”的参数。

验收合同：H5 与微信用同一演练场在 100ms 内触发 10 次真实 tap/click，分别验证默认 10 次、`throttle=100` 的明确次数、`debounce=100` 的一次 trailing；卸载后等待 150ms 不得新增事件。所有不支持该能力的组件类型与运行时 attributes 中均不得再暴露它。

### A0-02 P2｜DOM 专属 teleport 被污染到所有跨端组件

类型：兼容性、嵌套、API、类型。

证据与根因：`components/common/props/index.ts:54-60` 在 universal `baseProps` 中声明 `string | HTMLElement | boolean`，默认 `body`。`HTMLElement` 与 `body` 都是 H5 DOM 概念；普通展示/表单组件也因此接受无效 teleport，微信端既无法表达 HTMLElement，也没有统一降级合同。

最佳修复层：从 universal Props 移除 teleport，将它放入 Popup/Overlay 等宿主专用 Props；公开类型使用平台无关的目标描述，并由 H5 adapter 解析 Element，由微信 adapter 明确“不传送/顶层宿主”的行为。

验收合同：类型测试分别在无 DOM lib 的微信配置和 H5 配置编译；H5 Popup 对 `body`、selector 与 false 的真实父节点分别断言，微信 WXML/运行态断言层级、z-index 与关闭事件一致；普通 Button/Input 等 API 不再出现 teleport。

### Core：20 项

### A0-03 P1｜Preload 重试任务被同时登记为 completed 与 pending

类型：状态机、统计、交互反馈。

证据与根因：`core/src/preload/queue.ts:359-378` 失败后将任务改回 PENDING、移出 running 并安排重入队列，但 `:385-390` 的 finally 无条件把同一任务放进 `completedTasks`。重试等待和再次运行期间 `getStats():174-193` 因此双计 total，pending/running/completed 与 `usePreload.isLoading` 都可能失真。

最佳修复层：将 retry-wait 设为显式状态或独立集合；用单一 transition 函数原子地从一个集合移到另一个集合，finally 只做当前 attempt 的资源清理，只有 terminal 状态才能进入 completed ledger。

验收合同：H5 与微信受控 executor 按“失败一次→成功”运行，逐帧记录状态；taskId 始终只出现一次，total 恒为 1，重试等待与第二次运行时 isLoading=true，最终 completed=1、failed=0、pending/running=0，事件序列无重复。

### A0-04 P2｜Preload 的 listener、retry/fallback timer 没有可销毁所有权

类型：生命周期、代码散乱、资源泄漏。

证据与根因：`queue.ts:42-63` 用匿名函数注册 `visibilitychange`，类中没有 dispose；`:255-262`、`:328-330`、`:367-376` 创建的 fallback、timeout、retry 计时器没有完整登记与清除。`resetPreloadQueue():433-438` 只 clear 队列并置空单例，旧 listener 与延时回调仍可触发旧实例。

最佳修复层：队列持有所有 listener/timer/idle handle，提供幂等 `dispose()`；reset 必须先 dispose。延时回调携带 generation，销毁或 clear 后直接失效。

验收合同：H5 创建/重置队列 20 次后 `visibilitychange` 监听数回到基线，fake timers 全部为 0；微信连续进入/离开演练页后旧队列不再新增任务或事件。两端 reset 后推进全部计时器，事件计数保持不变。

### A0-05 P1｜Preload timeout/cancel 只改账本，不能终止真实 executor

类型：交互、竞态、资源、兼容性。

证据与根因：`queue.ts:123-142` 对运行任务仅把 status 改为 CANCELLED；`:327-347` 用 `Promise.race` 报 timeout，却没有 AbortSignal/取消句柄，原 executor 仍会继续请求、写缓存或追加 link。超时后重试还可能与旧 executor 并行并产生重复副作用。

最佳修复层：executor 接收 attempt-scoped AbortSignal/上下文并可返回 cleanup；timeout、cancel、clear、dispose 均先 abort，再关闭该 attempt 的提交权。对无法物理中断的平台 API，至少用 generation 阻断完成回写。

验收合同：H5 用可观察 fetch/link executor，微信用可观察 `uni.request` task；timeout/cancel 后 abort 恰好一次、缓存/DOM/事件均不提交，推进旧 Promise 后仍无副作用。重试只允许最新 attempt 写入一次。

### A0-06 P1｜requestIdleCallback 超时唤醒时可能永久空转

类型：性能、兼容性、调度。

证据与根因：`queue.ts:241-253` 给 idle callback 配了 5 秒 timeout，但 deadline 类型和 `processWithDeadline():266-283` 只读取 `timeRemaining()`，忽略 `didTimeout`。浏览器因 timeout 唤醒且剩余时间为 0 时，循环不会启动任何任务，只会再次安排 idle callback；配置的 `idleThreshold` 会放大饥饿。

最佳修复层：完整接收 IdleDeadline；`didTimeout=true` 时至少启动一个满足并发限制的任务，否则按 timeRemaining/threshold 批量启动。把调度器抽成可注入 adapter，微信 fallback 使用同一公平性合同。

验收合同：H5 注入 `{didTimeout:true,timeRemaining:()=>0}`，一次 callback 后必须启动一项；连续繁忙帧也要在上界内完成。微信 setTimeout fallback 以相同任务集验证顺序、并发上限和 pause，不能只测“最终某时完成”。

### A0-07 P1｜Manager 与 Queue 两套 reset 会产生分裂单例

类型：架构、状态、嵌套。

证据与根因：`queue.ts:421-438` 与 `manager.ts:320-345` 各自维护单例。`resetPreloadManager` 清 manager/cache，却不 reset queue；`resetPreloadQueue` 又可能让现存 manager 继续持有旧 queue。公开入口同时导出这些能力，调用顺序会得到不可预测的旧配置、旧任务或两个队列世界。

最佳修复层：只保留一个所有权根，Manager 创建并销毁自己的 Queue，或由统一 runtime container 原子 reset manager、queue、cache 与 listener；禁止公开可拆开的 reset。

验收合同：H5 与微信遍历“manager reset”“queue reset”“交错 reset”序列，下一次 get 必须指向同一新 runtime，旧任务不回写，新配置生效且统计为零；对象身份和事件宿主均可观测。

### A0-08 P1｜usePreload autoStart=false 不会阻止任务自动开始

类型：API、交互、全局状态。

证据与根因：`usePreload.ts:63-99` 的 `autoStart` 只决定 mounted 后是否延时调用 `manager.resume()`；但 `queue.ts:99-120` 的 addTask 会立即 schedule，默认队列也未暂停。因此 false 不是“手动开始”，true 只是对已经运行的全局单例再调用 resume。多个 composable 还共享 pause/resume，彼此可覆盖。

最佳修复层：明确 API：若 autoStart 表示挂载后批量启动，则实例应持有独立 scope 并在 false 时保持 paused；若任务添加即启动，则删除 autoStart/startDelay。全局 manager 的 pause 不得用作组件局部状态。

验收合同：双端挂载 `autoStart=false` 后添加任务并等待 2 秒，executor 次数必须为 0；手动 resume 后为 1。两个 scope 中暂停 A 不影响 B，卸载 A 后它的 delay 不得恢复全局队列。

### A0-09 P1｜Tabbar preload 把“已请求”伪装成“已加载”

类型：交互反馈、状态、文档。

证据与根因：`usePreload.ts:221-238` 调用 `manager.preloadPage` 后立即把 page.id 加入 `preloadedPages`，不等待 task complete，甚至 manager 返回空 taskId、平台不支持 preload 或任务最终失败时也标为 true。`isPreloaded():254` 因而无法证明资源可用。

最佳修复层：拆分 requested/loading/loaded/failed；pageId 与 taskId 建立映射，只在对应 terminal success 事件提交 loaded，失败/取消可重试并暴露原因。

验收合同：双端让一页成功、一页失败、一页取消，演练场状态必须分别是 loaded/failed/cancelled；失败页 `isPreloaded=false`，不得出现成功 UI。真实切换到成功页时记录资源命中，失败页仍走正常加载且不白屏。

### A0-10 P1｜同一资源在首次完成前可重复排队和执行

类型：性能、网络、状态冗余。

证据与根因：`manager.ts:57-66,119-133,151-159` 仅用 `loadedResources` 去重，而 key 只在 executor 成功末尾加入；并发两次 preload 同一路径/组件/图片会创建两个 task，失败重试期间也可继续重复入队。`prefetchData():210-228` 同样只看完成缓存。

最佳修复层：建立 resourceKey→inflight Promise/taskId 的 single-flight registry；相同请求复用同一结果与引用计数，terminal 后原子移出，明确失败后能否新建下一代。

验收合同：H5 和微信在同一 tick 调用 20 次相同资源，只允许一个底层 link/loader/`getImageInfo`/request；所有调用观察同一 terminal 结果。失败后下一次调用创建且只创建一个新 generation。

### A0-11 P1｜Request cancel 会进入 retry，旧 generation 还能取消新请求

类型：网络、竞态、交互。

证据与根因：`request.ts:316-377` 每次递归重试都重新生成/复用 requestId，并在 `:323-326` 先 cancel 同 ID 任务；`fail` 对 abort 没有特殊终止分支，会进入 retry。公开 `cancel():499-507` 因此不保证逻辑请求停止；旧 R1 retryDelay 结束后还会取消更新的 R2。

最佳修复层：每个逻辑请求持有稳定 owner 与单调 generation；abort/cancel 是不可重试 terminal 原因。task registry 只允许同 generation 移除/取消自己，旧 generation 永远无权操作新 task。

验收合同：执行本报告“Request generation”场景；H5 与微信均断言 R2 abort=0、R1 cancelled、底层调用次数符合策略、loading 最终为 0。再直接 cancel 一个 retry=3 请求，推进时间后底层不得出现第二次调用。

### A0-12 P2｜重试最终错误被旧错误覆盖

类型：错误反馈、可诊断性。

证据与根因：`request.ts:350-371` 捕获递归重试的 reject 后不保存异常，随后用第一次 `err` 构造并 reject。若第一次是断网、最后一次是 401/业务错误，调用方仍收到最旧原因，状态码、响应数据和排查方向均错误。

最佳修复层：用循环式 attempt runner 保存最后一次结构化错误与 attempt history；最终 reject 最新错误，并可选附加 causes，不要在递归 catch 中吞掉。

验收合同：双端依次注入 network error→500→401，最终错误必须是 401 且保留三次 attempt 元数据；日志与 UI 不得显示第一次错误。拦截器只收到一次最终 reject。

### A0-13 P1｜请求拦截器提前失败会释放别人的 loading

类型：交互反馈、并发、所有权。

证据与根因：`request.ts:383-431` 以 mergedConfig 初始化 `finalConfig`；只有 dispatch 时才 `showLoading`，但 finally 只看 `finalConfig.loading` 就 `hideLoading`。若 request interceptor 在 dispatch 前 reject，当前请求从未 acquire loading，却会递减全局 `loadingCount:275-293`，可能提前隐藏另一条仍在运行的请求。

最佳修复层：每个请求持有 loading token/布尔 acquired；只有成功 acquire 的 owner 才 release，且幂等一次。文本与 mask 的并发策略也要显式定义，不能只用裸计数。

验收合同：双端先启动 loading 请求 A，再让 loading 请求 B 在拦截器中失败；B 结束后 loading 仍可见且计数为 1，A 结束后才恰好 hide 一次。任意失败/取消/重试序列后计数不得为负。

### A0-14 P1｜Tabbar 全局单例使多容器互相清空

类型：架构、嵌套、交互。

证据与根因：`core/src/tabbar-container/index.ts:72-78` 定义模块级 state；每次 `initTabbarContainer():93-110` 都 clear 全局 maps。页面同挂两个 `lk-tabbar-container` 时，后挂载者会抹掉前者的 tabs；任一 props deep watch/re-init 也会重置所有实例。

最佳修复层：改为 factory 创建 per-container store，由组件 provide/inject 或直接持有；全局 helper 只作显式 opt-in registry，不能承载普通实例状态。

验收合同：H5 与微信同页渲染 A/B 两容器，分别连续切换，两个 activeId、visited、component 与事件计数完全独立；销毁/重建 A 不改变 B。

### A0-15 P1｜异步 Tab 切换没有 latest-wins，慢请求会回抢 activeId

类型：竞态、交互、状态。

证据与根因：`tabbar-container/index.ts:121-163` await 组件 loader 后无 generation/目标复核，最终无条件 `state.activeId=tabId`。slow→fast 的 fast 先完成后，slow 仍会在末尾把 activeId 写回；reset/re-init 期间的旧 Promise 也能写入新状态。

最佳修复层：每个容器维护 switch generation；发起切换即记录 intent，loader 只缓存组件，只有当前 generation 可提交 active/事件。reset/dispose 递增 epoch 使所有旧 Promise 失效。

验收合同：执行本报告 Tabbar latest-wins 场景；双端在 fast 完成、slow 完成、再等待一帧三个观察点都必须是 fast，change 只报告最终有效 intent；reset 后旧 Promise resolve 不得改变新容器。

### A0-16 P1｜Vue 函数组件被误当成异步 loader 直接调用

类型：兼容性、API、组件加载。

证据与根因：`tabbar-container/index.ts:25-27,138-148,208-217` 用 `typeof component === 'function'` 区分异步 loader。但 Vue functional component 本身就是函数，会被无 props/context 地调用，再对其返回值读取 `module.default`，导致空组件或运行异常。

最佳修复层：公开配置使用可辨识 union，例如 `{kind:'component',value}` 与 `{kind:'loader',load}`，或单独 `loader` 字段；不要靠 JavaScript typeof 猜语义。

验收合同：双端各注册对象组件、函数组件和异步 loader；三者都只按正确协议调用，函数组件收到真实 props/context，loader 仅执行一次，最终节点与事件完整。

### A0-17 P2｜Core barrel 漏导 format，文档和应用只能越层引用

类型：包结构、文档、代码散乱。

证据与根因：`core/src/utils/index.ts:1-7` 未 export `./format`，`core/src/index.ts` 只转出 utils；但 `docs/components/hooks-utils.md:136` 声称可从 Core 导入 format，应用 `pages_sub/i18n-preview/index.vue:22` 被迫引用 `core/src/utils/format` 私有路径。发布或重构目录后该入口不稳定。

最佳修复层：先确定 format 是否属于公开 API；属于则从 utils/core/root 的正式 exports 与 types 同步导出并把内部引用迁移到公开入口，不属于则修正文档并迁到明确内部包。

验收合同：H5 与微信类型/构建分别只通过公开 subpath 导入全部文档 API，禁止 `core/src` 深导入；打包产物运行 formatPrice/formatTime/formatFileSize 结果一致。

### A0-18 P2｜Request 文档首个 get 示例与真实签名相反

类型：文档、API、可用性。

证据与根因：`docs/components/hooks-utils.md:184-201` 创建 Request 后写 `request.get({url:'/user/profile'})`，而 `request.ts:434-443` 的签名是 `get(url, config?)`。同一文档后部又使用正确形式，导致示例互相矛盾且首个示例不能通过类型检查。

最佳修复层：文档代码块进入可编译示例测试，统一使用真实 public import 与签名；若要支持对象式调用，必须以 overload 和运行实现正式提供，不能只写在文档。

验收合同：所有 Request 文档代码块在 H5/微信 tsconfig 下零错误编译；演练页点击示例后真实请求 URL、method、loading 与返回结果符合展示，不能只做语法扫描。

### A0-19 P2｜formatFileSize 对负数、非有限值和超大值输出损坏

类型：边界、文档、显示。

证据与根因：`core/src/utils/format.ts:25-33` 对 bytes 直接取对数并用结果索引五个单位。负数得到 NaN，`Infinity`/超过 TB 的值会访问不存在的 unit；小数、NaN 也没有公开输入合同。

最佳修复层：定义有限非负输入策略，限制或扩展单位范围；非法值返回明确占位/抛结构化错误，并用 Intl/固定 rounding 统一展示。

验收合同：双端对 -1、NaN、Infinity、0、1023、1024、1PB 与极大有限数执行相同用例，输出不得含 `undefined`/`NaN`/`Infinity`，文档明确非法值策略。

### A0-20 P2｜H5 手机同时被判为桌面且不是移动端

类型：跨端差异、响应式、API。

证据与根因：`platform.ts:437-451` 的 `isMobile` 只认 App/MP/QuickApp，`isDesktop` 则把所有 H5/Web 都判为桌面；手机浏览器因此 mobile=false、desktop=true。调用者若据此决定 hover、触摸目标或布局，会在 H5 手机走错分支。

最佳修复层：拆分“运行平台”和“设备形态”；`isH5` 只回答 runtime，mobile/desktop 使用可注入 system info、pointer/viewport 策略并允许 unknown，不把二者设为简单平台枚举。

验收合同：H5 用真实 390px 触屏与桌面 viewport 分别读取结果，手机为 mobile、桌面为 desktop；微信始终按设备信息判定。旋转/resize 后响应式消费者应更新，不能固定在模块加载值。

### A0-21 P2｜isUrl 依赖全局 URL，微信运行环境不保证存在

类型：兼容性、校验、错误处理。

证据与根因：`core/src/utils/validate.ts:135-143` 直接 `new URL(url)` 并只捕获输入异常；在没有 WHATWG URL 全局的微信/旧运行时中，合法 URL 也会因构造器缺失返回 false。它还未声明是否接受相对路径、协议白名单和危险协议。

最佳修复层：使用平台无关 parser/明确正则与协议 allowlist；把 absolute URL、relative route、safe navigation URL 分成不同函数，避免一个布尔函数承载三种语义。

验收合同：H5 与微信在真实运行态测试 https、带端口/查询、相对路径、mailto、javascript、畸形字符串；两端结果按同一表一致，危险协议明确拒绝，不依赖注入全局 URL。

### A0-22 P2｜自定义滚动动画没有取消句柄，旧动画可覆盖新意图

类型：交互、动画、生命周期。

证据与根因：`core/src/utils/scroll.ts:112-137` 递归 `setTimeout(step,16)`，不返回 handle、不支持 cancel；`scrollToTop():173-203` 和 `scrollControlledToTop():211-225` 每次调用都可并行。用户中途手动滚动、再次点击或组件卸载后，旧动画仍继续写 scrollTop。

最佳修复层：动画器返回幂等 cancel/dispose，按 scroll owner 采用 latest-wins generation；优先 requestAnimationFrame，尊重 reduced-motion，并在触摸/新命令/卸载时停止旧任务。

验收合同：双端先发 1000→0 的 500ms 动画，100ms 后发 800→400；最终严格为 400，旧动画不再写入。卸载后推进时间写入次数为 0；H5 reduced-motion 时立即到达，微信 fallback 保持相同 latest-wins。

### Composables：7 项

### A0-23 P2｜Composables 公开入口漏掉 usePagePullRefresh

类型：包结构、文档、代码散乱。

证据与根因：`composables/usePagePullRefresh.ts` 实现并对外导出函数和 Options，但 `composables/index.ts:1-16` 只导 Transition、Ripple、ChartCanvas 与 Locale。调用者只能越过 package exports 深导入文件；发布器或重命名文件后入口不稳定。

最佳修复层：将 hook 与类型加入正式 barrel、root exports 和声明产物；增加 public-API type test，禁止 docs/demo 深导入未公开源码。

验收合同：H5 与微信消费者项目只写 `import { usePagePullRefresh } from 'uni-lucky-ui/composables'` 即可编译并运行；打包内容、exports 和声明解析到同一实现，深导入扫描为零。

### A0-24 P2｜下拉刷新最短时长只覆盖成功路径，等待也无法在卸载时取消

类型：交互反馈、生命周期、竞态。

证据与根因：`usePagePullRefresh.ts:10-43` 只在 `onRefresh` 成功后等待 `minDuration`；失败会立即进入 catch/finally，刷新指示器闪退。`wait():46-50` 的 timer 没有句柄或卸载清理；重入时还会直接 `stopPullDownRefresh`，可能结束仍由第一次调用持有的原生刷新。

最佳修复层：一个 refresh owner 管理开始、最短可见时长、完成与取消；成功/失败都满足同一 duration，卸载使 timer 和回调失效。重入只返回当前 Promise，不替其他 owner stop。

验收合同：双端让 onRefresh 在 10ms 成功和失败，刷新态都保持至少配置时长且 stop 恰好一次；100ms 内重入不提前 stop。卸载后推进 timer，onFinish/onError/stop 不新增。

### A0-25 P1｜ChartCanvas 合帧时丢弃最新 render 参数

类型：图表、动画、竞态。

证据与根因：`useChartCanvas.ts:478-483` 在已有 rafId 时直接 return，因此同一帧内 `scheduleRender(0.2,old)` 后 `scheduleRender(1,new)`，最终闭包仍渲染 old；响应式数据和交互高亮可能落后一帧甚至停在旧状态。

最佳修复层：保存 latest pending payload；RAF 只负责合并调度，执行时读取并清空最新值。若 render 中再次调度，下一帧继续而不覆盖。

验收合同：H5 Canvas 与微信 Canvas 同一 tick 连续投递 100 个不同 progress/extra，只渲染最后 payload；render 内再调度可在下一帧提交。像素/记录器和 tooltip 数据都必须对应最新值。

### A0-26 P2｜Ripple duration 只控制 JS 消失，CSS 动画仍固定 800ms

类型：动画、样式、交互。

证据与根因：`useRipple.ts:23-25,93-98,149-164` 接受 duration 并用于 timer/返回值，却未把时长放进 `rippleWaveStyle`；`theme/src/base/ripple.scss:39-40` 动画固定 0.8s。自定义 200ms 时状态先消失或动画被截断，1200ms 时 CSS 已结束但 active 仍占用。

最佳修复层：输出 `--lk-ripple-duration` 并让 CSS 与 JS 使用同一 resolved duration；更稳妥的是以 animationend 为主、可取消 fallback 为辅，并尊重 reduced-motion。

验收合同：双端分别设置 200/1200ms，读取运行态 class/style 和结束事件；实际可见时长误差在一帧内，active 恰好结束一次。H5 reduced-motion 与微信 fallback 都不残留节点/timer。

### A0-27 P2｜Ripple 微信坐标协议不稳定，重复实例会选中第一个节点

类型：跨端差异、对齐、嵌套。

证据与根因：`useRipple.ts:42-65` 假设 touches 的 clientX/clientY 或 detail.x/y 是 viewport 坐标；不同 uni 事件可能只给 x/y、pageX/pageY 或已相对坐标。`:114-140` 又在组件实例内 `select(selector)`，一个组件多个 ripple 宿主时永远量第一个，坐标会偏移到错误按钮。

最佳修复层：事件适配器明确坐标空间与回退优先级；每次触发使用 currentTarget 的稳定 data-id/selector 或调用方传入 rect，不用通用类名猜宿主。

验收合同：微信同一组件渲染三个不同位置/尺寸按钮，逐个点击四角，波纹中心相对误差≤2px 且只出现在目标；H5 mouse/touch 均重复同表。页面滚动后再点也不得产生 page/client 偏移。

### A0-28 P1｜Transition 的 end event 与 fallback 会双完成，子节点冒泡会提前结束

类型：动画、事件、交互。

证据与根因：`useTransition.ts:282-315` 监听根节点 transitionend/animationend，但未验证 `event.target===el`；`:317-359` event 结束后没有清除对应 fallback timer，也没有全路径 exactly-once guard。子节点事件可提前 finish，timer 随后再次触发 after callback。

最佳修复层：每次 enter/leave 创建 generation-scoped completion token；只接受根节点目标和相关属性，任一 event/fallback 成功后原子 settle 并清除 listener/timer/RAF，后续完成源无效。

验收合同：执行本报告 Transition 场景；双端 after-enter/after-leave 严格各 1。先触发 child end 时状态不结束，随后 root end 才结束；若无 event，fallback 仍只完成一次。

### A0-29 P1｜Transition 卸载时不清 listener/timer/RAF，旧动画可回写新状态

类型：生命周期、竞态、资源。

证据与根因：`useTransition.ts:162-190,282-359,363-411` 持有 RAF、enter/leave timer 和 DOM listener，但 composable 没有 onUnmounted disposal。切换方向、替换 elRef 或卸载后，旧回调仍能修改 visible/classes 并触发业务 callback。

最佳修复层：集中 `cancelCurrentTransition(reason)`，在方向改变、el 变化和卸载时移除全部资源、递增 generation，并定义取消是否调用 after/cancel 回调；旧回调不得提交。

验收合同：H5 与微信启动 enter 后立即卸载，等待两倍 duration；after callback=0、timer=0、listener=0、无 Vue warning。enter→leave→enter 快速切换最终与最新 intent 一致，旧 generation 事件无效。

### Utils：2 项

### A0-30 P2｜严格日期解析会接受并归一化不存在的日期

类型：校验、显示、边界。

证据与根因：`utils/date-utils.ts:6-13` 正则只检查 YYYY-MM-DD 形状，再用 JavaScript Date 构造；`2026-02-31` 会归一化为三月而不是 invalid。日期范围与 Calendar 可因此悄悄移动用户选择。

最佳修复层：构造后反查 year/month/day 与输入完全一致，并明确支持的年份；日期区间用日历日迭代且测试 DST 时区，不把非法输入自动纠正。

验收合同：双端测试闰年、2 月 29/30、月 00/13、日 00/32 与 DST 边界；非法值一律 invalid/空范围，合法范围首尾和天数严格一致，H5 与微信同一时区表结果相同。

### A0-31 P2｜Canvas 品牌色解析过窄，微信永远退回固定紫色

类型：颜色搭配、跨端差异、主题。

证据与根因：`utils/chart-colors.ts:112-160` 只有 H5 能从 DOM CSS var 取色，`resolveBrandBaseColor` 又只接受以 # 开头的结果；rgb()/rgba()/嵌套 var 即使合法也被丢弃。微信没有 DOM，始终返回 `#6965db`，与 LkRoot 局部主题和运行时品牌色脱节。

最佳修复层：Theme 提供平台无关的 resolved token store/context，Canvas 从最近主题上下文读取规范化 RGB/hex；H5 DOM 读取只作 adapter，完整支持 hex/rgb/rgba/var。

验收合同：H5 与微信分别把品牌色设置成 hex、rgb 与局部 LkRoot 覆盖，读取图表 stroke/fill 实际像素/绘图参数；两端均等于设置值，不得回退紫色。切换主题后下一帧重绘为最新色。

### Theme：8 项

### A0-32 P1｜主题快速切换不是 latest-wins

类型：主题、竞态、交互。

证据与根因：`theme/src/theme-store.ts:112-143` 只清理 250ms 的 switchingTimer，却不保存/清理 32ms 的 switch timer。连续 `setTheme(light)`→`setTheme(dark)` 时，第二次可能因当前 _theme 仍是 dark 而直接 return；随后第一条延时仍把主题改成 light，最终违背最新意图。

最佳修复层：主题切换使用单调 generation 与单一可取消 timer；比较 pending intent 而非仅比较 committed theme。DOM、system UI、storage 必须由同一有效 generation 原子提交。

验收合同：H5 与微信在 32ms 内发送 light→dark→light→dark，等待 400ms 后 DOM/class、store、storage、导航栏和背景都严格为最后 dark；中间旧 timer 不得再写。反向序列同样验证。

### A0-33 P1｜微信系统暗色媒体查询只覆盖半套 token

类型：颜色、兼容性、跨端差异。

证据与根因：`component-vars.scss:295-424` 的显式 `.lk-theme-dark` 定义完整暗色语义变量；`:426-468` 的 MP `prefers-color-scheme:dark` 只复制到 icon，漏掉 skeleton/loading、input/form、switch/slider、keyboard、preload-debugger、checkbox/radio 等后半部分。系统暗色但未包 class 时，同页会混合亮暗 token。

最佳修复层：把暗色 token 定义成一个 Sass map/mixin，显式 class 与 MP media 共用同一源；再明确 class override 与系统跟随的优先级，禁止复制两套清单。

验收合同：微信真实切系统亮/暗，抓取每个语义 token 与代表组件 computed style；media dark 与 `.lk-theme-dark` 的 token key/value 集完全一致。H5 class 模式执行同一 token snapshot，缺 key 即失败。

### A0-34 P1｜CSS 页面背景与原生系统 UI 背景使用两套常量

类型：颜色搭配、对齐、跨端差异。

证据与根因：`theme-store.ts:20-34` 的 light system background 是 `#f4f5f9`、dark 是 `#0f1014`；`tokens/_colors.scss:104-118`/`component-vars.scss` 的页面背景却是 light `#f7f7f7`、dark `#000000`。微信下拉露底、导航栏/页面接缝与 H5 页面因此出现可见色差。

最佳修复层：系统 UI adapter 从同一 resolved semantic token 生成颜色；若原生 API 不能接 CSS var，在构建或主题 store 中共享常量映射，不手写第二份近似值。

验收合同：微信上下拉页面、打开/关闭弹层并截图之外同时读取页面 token与 system API 调用参数，背景 RGB 必须相同；H5 html/body/page computed background 也等于同一 token。亮暗和自定义品牌均重复。

### A0-35 P2｜Sass 与 CSS spacing 同名 token 数值不一致

类型：边距、对齐、设计令牌。

证据与根因：`tokens/_spacing.scss:3-12` 定义 lg=20、xl=24、xxl=32rpx；`component-vars.scss:28-34` 却定义同名 lg=24、xl=32、xxl=48rpx。组件用 Sass 变量和 CSS var 时即使写相同语义名，也会差一个等级，造成 H5/微信或静态/运行主题间距不齐。

最佳修复层：只保留一份 spacing scale，由 Sass map 同时生成编译变量与 CSS vars；迁移时建立旧值兼容别名并逐组件核对，禁止仅改一侧掩盖差异。

验收合同：编译生成 token snapshot，所有同名 Sass/CSS spacing 数值严格相等；H5/微信演练页按 xxs～xxxl 排列方块，bounding-box 差值与规范表一致，无跳级。

### A0-36 P1｜预设品牌色上的白字多数达不到正文对比度

类型：颜色搭配、可访问性、UI。

证据与根因：`brand-color.ts:103-134` 提供绿、橙、蓝、红、粉、青等预设；主题又广泛把 primary 背景与固定 `--lk-color-white` 文本/勾选组合。按当前基色计算，白字对 #52c41a≈2.27:1、#fa8c16≈2.38、#1890ff≈3.24、#f5222d≈4.08、#eb2f96≈3.90、#13c2c2≈2.21，均低于普通正文 4.5:1。

最佳修复层：为每个背景 token生成 `on-primary` 前景，通过对比算法选择深/浅字并设最低阈值；Button、Badge、Checkbox、Radio、Switch 等消费语义前景，不硬编码 white。

验收合同：H5 与微信遍历所有预设和自定义边界色，抓取真实背景/前景 RGB；普通文字≥4.5:1，大号文字/关键图形≥3:1。失败必须阻断视觉契约，不能用截图主观放行。

### A0-37 P1｜非法品牌色会部分写入并持久化，主题状态非原子

类型：颜色、状态、错误处理。

证据与根因：`theme-store.ts:159-165` 不校验 color 就先写 _brandColor、DOM 和 storage；`brand-color.ts:34-64` 在解析失败时把原字符串写入九个 brand shade，却因为 rgb=null 不更新 `--lk-brand-rgb`。结果是 CSS 变量一半非法、一半保留旧色，store/storage 又宣称新色已生效。

最佳修复层：先 parse/normalize/验证可用色与对比策略，生成完整变量集合成功后再原子提交；失败返回结构化结果且不改变 store、DOM、system UI 或 storage。

验收合同：双端依次设置合法 hex、`red`、`var(...)`、空串和恶意值；按公开支持表，非法输入的所有状态保持旧快照，合法输入的全部 brand vars/RGB 同一事务更新。刷新后 storage 恢复一致。

### A0-38 P2｜hairline(all) 用一个伪元素互相覆盖四条边

类型：样式、边框、代码逻辑。

证据与根因：`mixins/_hairline.scss:20-62` 对 `all` 连续执行 top/bottom/left/right 四组声明，但都写同一个 `::after` 的 top/bottom/left/right、width/height、transform-origin 与 transform；后面的 right 分支覆盖前面 transform，最终不是四边 hairline，而是尺寸/缩放冲突的单元素。

最佳修复层：all 使用一层完整 border 再整体 scale(0.5) 的经典 200% box，或用多背景/独立伪元素；单边继续走专用分支。每种模式只产生一套互斥声明。

验收合同：H5 与微信在 1x/2x/3x DPR 渲染 top/bottom/left/right/all，读取 bounding box 并做像素采样；all 四边连续、视觉厚度一致、内容尺寸不变，单边不出现对侧残线。

### A0-39 P1｜全局 reset 的 select 选择器污染微信 app.wxss

类型：兼容性、样式、构建质量。

证据与根因：`theme/src/base/_reset.scss:28-33` 把 H5 `select` 与跨端 button/input/textarea 混写。微信编译器已明确警告 app.wxss 不支持 `select`；现有 compat checker 又没有把这个编译期错误面纳入 strict gate，导致“strict 0 errors”与真实编译警告并存。

最佳修复层：用条件编译把 DOM-only reset 放到 H5，微信只输出合法选择器；同时把编译器 unsupported-selector 警告接入兼容性阻断规则。

验收合同：H5 原生 select 仍继承字体；微信 build log 中 unsupported `select` 为 0，生成 app.wxss 也不存在该 selector。compat strict 与真实编译器对同一 fixture 都必须失败/通过一致。

### Locale：2 项

### A0-40 P2｜Locale.add 是浅合并，局部覆盖会删除整棵命名空间

类型：国际化、API、文档。

证据与根因：`locale/index.ts:72-80` 对已有语言执行顶层 `Object.assign`。调用 `Locale.add({en:{lk:{common:{ok:'Yep'}}}})` 会把完整 en.lk 替换成只含 common 的新对象，其他组件翻译随后回退为 path 字符串。

最佳修复层：实现不可变/安全的深合并，只合并 plain object，数组与函数按明确规则替换；开发态校验 schema 与未知 key，保留原语言包。

验收合同：H5 与微信对 en 的一个深层 key 覆盖前后做完整 key snapshot；目标值改变，其余 key 数量和值不变。原传入对象后续变异不得污染全局 messages。

### A0-41 P2｜国际化没有复数规则，数量文案只能写成含糊单一模板

类型：国际化、文档、UI 文案。

证据与根因：`locale/index.ts:81-110` 只做路径读取与占位符替换，没有 Intl.PluralRules 或语言级选择。英文/法文/葡文等 `multipleSelected` 只能用 `{count} selected` / `sélectionné(s)` 规避真实单复数，无法表达 zero/one/few/many 等语言规则。

最佳修复层：增加 `tc/path+count` 或 message function 规范，优先 Intl.PluralRules，微信缺失时使用受测 locale rules fallback；语言包以 one/other/few 等结构存储。

验收合同：双端至少对 en、fr、pt-BR、zh 测 count=0/1/2/5/21；文案匹配该语言规则且占位替换正确。无 Intl 环境的微信结果必须与 H5 相同。

### Package：2 项

### A0-42 P1｜根 types 指向纯 GlobalComponents augmentation，公开 JS API 全部无声明

类型：包发布、类型、文档。

证据与根因：`package.json:8-18` 把根包与 `./components` 的 types 都指向 `components.d.ts`；该文件 `:1-93` 只扩充 Vue `GlobalComponents` 并 `export {}`。但 `index.ts` 实际导出默认 plugin、install、version、全部命名组件、composables、locale、theme；消费者对这些 root imports 得不到匹配声明，`./components` 也没有 props/utils 的正式导出签名。

最佳修复层：构建生成 root/index.d.ts 与各 subpath declarations；GlobalComponents augmentation 单独作为 side-effect declaration 被 root types 引用，不替代模块本身的导出类型。以 API Extractor/tsc fixture 锁定。

验收合同：建立真实消费者 fixture，分别测试默认 plugin、命名组件、props 类型、version 与子路径导入；H5/微信 tsconfig 均零 any/零缺失导出，编辑器类型与运行导出 key snapshot 一致。

### A0-43 P1｜包 exports 发布源码 TS/Vue，子路径没有完整 types/runtime 条件

类型：包发布、兼容性、构建。

证据与根因：`package.json:8-40` 的 main/module/import 直接指 `.ts`，components 指 `.vue/.ts` 源码；theme/composables/locale/utils 没有 types 条件，通配符还暴露内部源码。只有具备项目同款 uni/Vue/Sass 转译链的消费者才能偶然工作，Node/标准 bundler/type resolver 的行为不一致。

最佳修复层：发布 dist：明确 ESM JS、声明、Vue/Sass 资产与平台条件；每个公开 subpath 同时有 import/types，删除无限制源码 wildcard 或列出稳定入口。package smoke test 从打包 tarball 安装，而不是直接引用仓库源码。

验收合同：`pnpm pack` 后在空白 Vite H5 与 uni-app 微信 fixture 安装 tarball；仅用文档公开入口完成 type-check、build 和真实启动。包内不得要求消费者编译未声明的内部 TS，exports key 与声明/运行文件逐项存在。

## 修复顺序

1. 先修状态与所有权：A0-11～16（Request/Tabbar）、A0-28～29（Transition）、A0-03～10（Preload）。
2. 再修发布与公共 API：A0-42～43、A0-17～18、A0-23；先让消费者能得到稳定类型与入口，再迁移内部深导入。
3. 再修跨端主题与绘图：A0-32～39、A0-25～27、A0-31；颜色必须以数值对比和真实 Canvas/样式为证据。
4. 最后处理边界工具与国际化：A0-19～22、A0-24、A0-30、A0-40～41，并同步文档与演练场。
5. 每个功能点在独立 worktree/branch 完成；合并候选后从干净 develop 新建总体验收工作树，重跑 H5、微信与打包消费者测试，避免前序缓存或服务污染结论。

## 双端客观验收矩阵

| 主题 | H5 Peekit 主断言 | 微信 Peekit 主断言 | 不能作为通过证据 |
|---|---|---|---|
| Request/Preload/Tabbar | 底层调用、abort、generation、事件序列、最终 store | `uni.request` task、页面 data、真实容器节点与事件序列 | Promise 单测只测 happy path |
| Transition/Ripple/Scroll | 根节点事件目标、computed duration、timer/listener、最终 scroll | WXML 真节点、tap/touch、class/style、页面 scrollTop | 静态 class 或单张截图 |
| Theme/Color | DOM token、computed RGB、Canvas 参数、对比度数值 | page token、系统 UI 参数、Canvas 参数、亮暗切换 | “看起来接近”或构建成功 |
| Locale/Utils | 文案、边界表、公开 import fixture | 同一数据表与无 Intl/URL 环境 | 只在 Node 跑纯函数 |
| Package | 安装 tarball 的 Vite consumer | 安装 tarball 的 uni-app consumer 与真机页 | 仓库内 alias/源码直引 |

所有运行探针都要保存：基线 SHA、分支、平台、viewport/设备、selector、动作、前后状态、事件次数、console/runtime errors。截图仅作外观附件；竞态、滚动、异步、颜色与事件问题必须由结构化运行数据裁决。

## 文件与 SHA-256 总账

下表按路径排序。物理行数与 SHA-256 共同固定本次“逐行覆盖”的输入；任何文件 SHA 变化后，本报告对应条目必须重新复核，不能沿用“已读”状态。

| 文件 | 物理行 | SHA-256 |
|---|---:|---|
| `src/uni_modules/lucky-ui/components.d.ts` | 93 | `28550c3ce3c7e853bde90ebf4bd989e648eead91de98fa91e36ffe9fa53b8312` |
| `src/uni_modules/lucky-ui/components/common/props/index.ts` | 195 | `42959195090c409562b91481b05d13af3ebcc511b21590b495ec1da7bb04bd4b` |
| `src/uni_modules/lucky-ui/components/index.ts` | 188 | `3cecd1dd98bacd80c0ce5a827a8b33eb8837914d51c502e4b1840c749f2a0c78` |
| `src/uni_modules/lucky-ui/composables/index.ts` | 16 | `778bfbc6bc7fb6dcb1333f0174d2c98cbd3c63633110868325915d673988d688` |
| `src/uni_modules/lucky-ui/composables/useChartCanvas.ts` | 660 | `a18caed3d27a1ed1ff4355a374c36d9a29a7f2440cd244a55b44160f34dc1cd4` |
| `src/uni_modules/lucky-ui/composables/useLocale.ts` | 26 | `643152c4e2582a10bb35f4e5acd1bed60d3fedd71e696e9da327a982374699e1` |
| `src/uni_modules/lucky-ui/composables/usePagePullRefresh.ts` | 50 | `b368136804cc3d700c70957446929c1d72f45038a9873ad474922e7525e05e87` |
| `src/uni_modules/lucky-ui/composables/useRipple.ts` | 165 | `0961c388d6271e58f5c5d70de9d7f890001b16af9e3ba35e1de7a6fd4ea4c5ab` |
| `src/uni_modules/lucky-ui/composables/useTransition.ts` | 676 | `aaaf2e926b74891c1c5ed4439c14b34bf0455e5c3ca6d7e768ebd25998f027c4` |
| `src/uni_modules/lucky-ui/core/src/cache/index.ts` | 6 | `d5e36ecc88624c859624eece96e14cb08a66b398f4318d967ca947f466fabce1` |
| `src/uni_modules/lucky-ui/core/src/cache/page-cache.ts` | 265 | `3d45a3bacd0b15665f4851ca0617c550bd32ec84869035918ec5d171837558e6` |
| `src/uni_modules/lucky-ui/core/src/chart/index.ts` | 2 | `11052ae85b2918d18971a8e527f3e32c70061dbd94a25d3e1f111899573fa28d` |
| `src/uni_modules/lucky-ui/core/src/chart/lite.ts` | 92 | `654af6cfc78bc6445e37e79cb6c0d40134aba1951358ffffe9a17a8780f809ad` |
| `src/uni_modules/lucky-ui/core/src/chart/motion.ts` | 39 | `f247ca93b5acef97185c9a5c7f20862b7d7caacf5d71540d746439fb8d19f51b` |
| `src/uni_modules/lucky-ui/core/src/index.ts` | 14 | `ab888fecb6e164a257c588842907ac22ef643e97f364ae9e6257b942a918915f` |
| `src/uni_modules/lucky-ui/core/src/preload/index.ts` | 42 | `e96ae4a48264909b0ffd4fb3135dcf9c612f52862f70ec6e81aa6b4dc792d759` |
| `src/uni_modules/lucky-ui/core/src/preload/manager.ts` | 345 | `e20da223ed3c66cdbc4c7673b75cb4f04c6d206f1bf3bc69b3c6e9d805703a95` |
| `src/uni_modules/lucky-ui/core/src/preload/queue.ts` | 438 | `7e1af1a90f019680f79f3a82ea0888b2b844d26a58931ddeb17a528b2302ef68` |
| `src/uni_modules/lucky-ui/core/src/preload/types.ts` | 177 | `e622402676f48eb0c4c21cefb618c3c81a7327baa9725f97c683eac8ea8e0b6b` |
| `src/uni_modules/lucky-ui/core/src/preload/usePreload.ts` | 256 | `9e2299cbc9d2511a14a39a3277e2566eb84f695871a2524fb807804180c56578` |
| `src/uni_modules/lucky-ui/core/src/tabbar-container/index.ts` | 290 | `8165846baa0f00a75f2922fc228037840c87a04ffcebee4be1dcd2c1f2d63e38` |
| `src/uni_modules/lucky-ui/core/src/utils/debounce.ts` | 29 | `661f721e5534c4e462bd44fe2c97aea932a896d75a9229a875303c21bb4bed58` |
| `src/uni_modules/lucky-ui/core/src/utils/format.ts` | 96 | `5ebfb75e5f836fc4051e96ef52919710d9cd168d72138c0149ee773629dd6cd6` |
| `src/uni_modules/lucky-ui/core/src/utils/index.ts` | 7 | `be22bb882548d4e79d78c5ec4f40c80664a409310b2480ee52428c8cf11a8781` |
| `src/uni_modules/lucky-ui/core/src/utils/platform.ts` | 544 | `6fa735d93a45580f60985b3018d54dc432603eee770f69618e6147b955a9190a` |
| `src/uni_modules/lucky-ui/core/src/utils/request.ts` | 691 | `9bca5dd8bf63af5990fb3f756c1c1f430ae6fc9051c35e0270a77bc2a6af5098` |
| `src/uni_modules/lucky-ui/core/src/utils/scroll.ts` | 225 | `f3f7758e1c78d20b02e85c1d70e2febd4612906817bfe26bcbf953796966b40a` |
| `src/uni_modules/lucky-ui/core/src/utils/throttle.ts` | 40 | `71f207684fb2afcf4a376d13d18905835a941d886576d5778cf90a501a873526` |
| `src/uni_modules/lucky-ui/core/src/utils/unit.ts` | 11 | `8e551db4748a516e2ae1ac474ee409c28f4a90d92efc36e352e1b2f1d2512de9` |
| `src/uni_modules/lucky-ui/core/src/utils/validate.ts` | 173 | `73c95645d256bf814633614b298cf66f616c7159a56140d916bdf4cda81173de` |
| `src/uni_modules/lucky-ui/index.ts` | 24 | `2913c08167b9bc96dfcbea3cd83c93b238d262816c90420d78de62d6a169f14c` |
| `src/uni_modules/lucky-ui/locale/index.ts` | 116 | `ed6de82735dca6f9863a0a7caeb42dce2c7a738271559f2fca0fca6a2e3d431a` |
| `src/uni_modules/lucky-ui/locale/lang/en.ts` | 174 | `c51436d72c33f47bd46b5b89a60c5bf6d745ce620d9eaf8361783b3e03b9fd3a` |
| `src/uni_modules/lucky-ui/locale/lang/es.ts` | 139 | `b1465361c5e163001b3401f7de35dbe80d0c55d9af3ec26893b098b0101b7e03` |
| `src/uni_modules/lucky-ui/locale/lang/fr.ts` | 156 | `645283bdc1e41d6ea2654f3d16d19b3087502bbb505ab64ddf9717cb09ac6ac7` |
| `src/uni_modules/lucky-ui/locale/lang/ja.ts` | 155 | `5350e7769a50c8b1bd84ca4a44d41aefa53ad59306d164b4406d4bb16b4e76e8` |
| `src/uni_modules/lucky-ui/locale/lang/ko.ts` | 152 | `c75ae800fb6a9fe9905e61530bd23834a6b030e6f01870f0465fbd214bf68ac2` |
| `src/uni_modules/lucky-ui/locale/lang/pt-BR.ts` | 143 | `f86baecd60658adcdaf68381ac057fcfe16081e734de32b91defeac00aa752c6` |
| `src/uni_modules/lucky-ui/locale/lang/zh-Hans.ts` | 187 | `5b56403cc172ead3c6bd6f79f33240106b47a3184140e94598bfb0d358d874e2` |
| `src/uni_modules/lucky-ui/locale/lang/zh-Hant.ts` | 152 | `7d926c0107fe8854060bb59efab4a1d64406d50b854305150625c7381bd3b24d` |
| `src/uni_modules/lucky-ui/package.json` | 164 | `5787dcbdf6a4fe50688024c1e7f2d54c1aa9186d5afca8654a789aa94ed38a62` |
| `src/uni_modules/lucky-ui/theme/index.ts` | 2 | `28dde2451895b98700d3322e6a00a062ad726f171f627ecb7cdea1aa13615777` |
| `src/uni_modules/lucky-ui/theme/src/base/_animations.scss` | 755 | `ea29f669c4acf8e02b7090ec849d764cf221c58455e74b49be064c9d2f33268d` |
| `src/uni_modules/lucky-ui/theme/src/base/_global.scss` | 15 | `0b61244585d7463c52a03acb9a9f50f9ff78cf06b7d26a557346c07f8bebc21b` |
| `src/uni_modules/lucky-ui/theme/src/base/_reset.scss` | 70 | `2710b25e0b8ffc632230c219579b5e0a68a053b5ebc37b175508132b1f684ff5` |
| `src/uni_modules/lucky-ui/theme/src/base/_theme-transition.scss` | 42 | `867b6934ac31ba8336e6b8cab2ce651f92359674ec1a5af9cdff259482462408` |
| `src/uni_modules/lucky-ui/theme/src/base/_typography.scss` | 58 | `ef7188eeb4bbba1bfa44bfec0068f847aebf9b15c271c531a5b5f8e7fe3101b6` |
| `src/uni_modules/lucky-ui/theme/src/base/index.scss` | 5 | `9e484576cbfecdd0b3fa294221a2fb843ed1836bc8efcbea46f4aef3efb31470` |
| `src/uni_modules/lucky-ui/theme/src/base/ripple.scss` | 109 | `f837b0332bbc1f9a8c5ded69e3ec2bc0e6c644c1bfb4a61b6654720585d43353` |
| `src/uni_modules/lucky-ui/theme/src/brand-color.ts` | 136 | `e96323b5a58db5e772b6446b9efb3133ad1de5ee6f6bb810891f3f21720035f9` |
| `src/uni_modules/lucky-ui/theme/src/component-vars.scss` | 551 | `f6e2ac26d16dd584457f221ea0c43d6563a4fdd4613254c41696c300f5f4d410` |
| `src/uni_modules/lucky-ui/theme/src/helper.scss` | 4 | `bd3a2829109a91d3134ff14063c43c8f01c53c60ad6fd18f4846e9e571e39c7c` |
| `src/uni_modules/lucky-ui/theme/src/index.scss` | 8 | `cd4ff0aa65b88b673ad1283d388fdcfcd58ad55853e98dc78a3a73d755ce5061` |
| `src/uni_modules/lucky-ui/theme/src/mixins/_bem.scss` | 77 | `f1ddde8aed30a5219adb8d5b9e3f21f8c5fc9742eeebc8f9c9d8f5ab3bdceae9` |
| `src/uni_modules/lucky-ui/theme/src/mixins/_hairline.scss` | 63 | `d99de590a0fe6fd6fd225f75c9b98240bc3a036aeed9273bce829f8bfafb26a7` |
| `src/uni_modules/lucky-ui/theme/src/mixins/_layout.scss` | 26 | `1c8e84d00ee6b087585d7f31b11b3e3ad32652a7587d8109e40a8b1a1e6ac261` |
| `src/uni_modules/lucky-ui/theme/src/mixins/_responsive.scss` | 20 | `0b74f317bc1ee5aa9168c26cd0c4909fefbee675edad578a44c6872c00c93628` |
| `src/uni_modules/lucky-ui/theme/src/mixins/_state.scss` | 21 | `b5d0b6d16fc01a946e1d3e891cc753470488b1583bd7dd2a2e721faa71b7a554` |
| `src/uni_modules/lucky-ui/theme/src/mixins/_text.scss` | 15 | `b95529b433031f40922ca8cf1a7d37edf033f504439c2af77aa4c28e0251bbd6` |
| `src/uni_modules/lucky-ui/theme/src/mixins/index.scss` | 6 | `917cd819c30b1ccc13b31add6dbf3106d3ccb4c99c410df37dd9b917dcf266ce` |
| `src/uni_modules/lucky-ui/theme/src/theme-store.ts` | 240 | `be5cf33ea5efc8ce34d82926fd3e31c78f4b4768b6d92a5ff418f08870b2043f` |
| `src/uni_modules/lucky-ui/theme/src/tokens/_border-radius.scss` | 9 | `c51f7e82ff9593d2ca289c3476137a7f2b601517b1edb961552990b7daff207e` |
| `src/uni_modules/lucky-ui/theme/src/tokens/_breakpoints.scss` | 6 | `ed78ed6218252abd9775ad9a7bc2e02927d8c2e2d02e052fbfa54d17d6093cb6` |
| `src/uni_modules/lucky-ui/theme/src/tokens/_colors.scss` | 125 | `db76f679ff907438ccf903dad92951078b59b8a337393e001f9877bc73bd1545` |
| `src/uni_modules/lucky-ui/theme/src/tokens/_motion.scss` | 10 | `74e7fb6c9fc46412362fa5da25ee728a98ab6f9dbbeb48386b79ca3d226ed17e` |
| `src/uni_modules/lucky-ui/theme/src/tokens/_shadow.scss` | 8 | `86310bdca35dc853b5d8de7774b7b8603df1baf75cdad7a0ea6962193e4d4211` |
| `src/uni_modules/lucky-ui/theme/src/tokens/_spacing.scss` | 16 | `047a08b525e29ea060f15f051f6924ac55564cfc08ae6e9ad3e74125713362ab` |
| `src/uni_modules/lucky-ui/theme/src/tokens/_typography.scss` | 22 | `ad8bf6a24d2125be3a4ec20f5304a11bce88e826fc4548187caf0c6e5c972270` |
| `src/uni_modules/lucky-ui/theme/src/tokens/_z-index.scss` | 33 | `0f1da0fcec2f56a41fa7f0c93dff47da8ebc62f99f9f6b244fe6b980542e7c16` |
| `src/uni_modules/lucky-ui/theme/src/tokens/index.scss` | 8 | `2cced061c93b3c2993d70fbffba91ef988851eeb65fa43f15fdfda6ed670ee1e` |
| `src/uni_modules/lucky-ui/theme/src/utilities/_display.scss` | 95 | `df66a23633504e56b57e190cc98b7e3130062fef5cb63e54d0def0f76fdd03a5` |
| `src/uni_modules/lucky-ui/theme/src/utilities/_spacing.scss` | 75 | `59a1d52a2137e46bc8247429c0c9dfb87feac143be47100f7d33724dba7a244b` |
| `src/uni_modules/lucky-ui/theme/src/utilities/index.scss` | 2 | `cc110595432732c57985a67f7478fea516d0ca7742a918c88c480027f53f2fea` |
| `src/uni_modules/lucky-ui/utils/chart-colors.ts` | 173 | `6aa556fcc34257c1a6a53f2e00cf8b4a4cdc7c8b570e6eb4099c6a01bada6339` |
| `src/uni_modules/lucky-ui/utils/date-utils.ts` | 29 | `4ec3b94a16af3807a869d58a6c643239bf4c35897de61ff3a9f87962fcebf285` |
| `src/uni_modules/lucky-ui/utils/index.ts` | 3 | `ef70f5b5006244c6ebea97c369245bc67f847d957c39fc01446753ece8d3f456` |
| `src/uni_modules/lucky-ui/utils/init-lk-icons.ts` | 88 | `a6b98f6f9d8916ea57e6735efeadd2363a72abb4a3000ebf85eab146f189740f` |

总账复核：77 个文件，10,338 个物理行。
