# A4 表单与输入组件逐行审计

## 结论与证据边界

- 基线：docs/lucky-ui-full-audit，提交 c8071e67f93cc95ee1ddc12cac7bfccdf74058c1。
- 范围：Form、FormGroup、Input、Textarea、Checkbox、Radio、Choice、SelectList、Slider、Stepper、Switch、Rate、Upload、VerifyCode、Keyboard，共 15 个组件。
- 覆盖：123/123 个唯一文件，20,045/20,045 个物理行，未读 0。
- 发现：P0 0 项、P1 24 项、P2 16 项，共 40 项。
- 本报告是静态审计证据，不代表 H5 或微信小程序运行态已经通过。现有 unit、Showcase 的 verified 字段、截图或构建成功均不能替代真实交互验证。

## 问题明细

### A4-01 P1｜Form reset 不是恢复初始值

form.utils.ts:146-151 按当前值类型清空，lk-form-item.vue:136-145 直接覆盖模型，与 lk-form.vue:111 的“初始状态”语义冲突。组件从未保存字段挂载时的初始快照，因而编辑后 reset 会得到空值而不是原值。

最佳修复层：FormItem 注册层深拷贝字段初始值；模型对象身份或 prop 改变时明确重建快照；另设语义独立的 clearFields。

### A4-02 P1｜Form disabled 完全无效

disabled 声明在 form.props.ts:54-57，文档 form.md:215 也承诺整表禁用，但 context.ts:34-59 与 lk-form.vue:244-275 都没有传递它。子控件只能看到自己的 disabled。

最佳修复层：在 FormContext 提供响应式 disabled，并用共享 useFormDisabled 合并控件自身状态与最近祖先 Form 状态。

### A4-03 P1｜FormItem prop 不能自动连接子控件

Input 仅在自身 prop 存在时联动表单（lk-input.vue:47-65）；Textarea、CheckboxGroup、RadioGroup、Slider、Stepper、Switch、Rate 也重复要求控件 prop；Choice、SelectList、Upload、VerifyCode 没有完整表单桥接。用户按常见写法只给 FormItem prop 时，校验与状态不会连接。

最佳修复层：共享 useFormField，优先读取控件 prop，否则继承最近 FormItem prop，并由一个协议统一 change、blur、reset 与校验状态。

### A4-04 P1｜Input/Textarea 的 change 规则在正常输入时不运行

Input onInput 总以 change=false 提交（lk-input.vue:47-60），失焦只触发 blur；Textarea onInput 没有表单调用（lk-textarea.vue:59-79）。lk-form-item.vue:90-111 在当前 trigger 没有匹配规则时还会错误地把字段写成 success，掩盖旧错误。

最佳修复层：把原生 input、change、blur 归一到明确的表单触发协议；零匹配规则时保持原状态。

### A4-05 P1｜validate 的 fields 与 silent 契约失效

lk-form.vue:34-69 的自定义校验分支先更新全部字段状态并发出事件，最后才过滤 fields；silent 从未读取。结果可能是“目标字段校验成功”，同时非目标字段已经被改成 error。

最佳修复层：先解析目标字段集合，再只对集合内字段校验、落状态、发事件；实现 silent 的零副作用契约，或从公开 API 删除该参数。

### A4-06 P2｜嵌套路径与动态 prop 不工作

lk-form-item.vue:94、136-142 通过 form.model[p] 读写，user.name 等路径被当成普通键；itemCtx.prop 在 114-116 行 setup 时捕获一次，运行期改变 prop 不会更新注册。

最佳修复层：共享安全 path getter/setter；注册上下文把 prop 暴露为响应式 getter，并处理字段换名后的状态迁移。

### A4-07 P1｜异步验证会被旧结果覆盖

lk-form-item.vue:63-112 与 lk-form.vue:123-140 没有 generation 或取消机制。先发起的慢校验可以在后发快校验完成后回写 error，造成陈旧状态闪回。

最佳修复层：每字段维护 validation generation，只有最新 generation 能提交状态与事件；卸载、reset 和 prop 改变时使旧任务失效。

### A4-08 P2｜H5 scrollToField 全局、模糊且可被特殊字符破坏

lk-form.vue:158-169 使用 document.querySelector 和 data-prop 的 contains 选择器。多 Form、user/username 会错配，带引号等字符的 prop 可造成 selector 异常。

最佳修复层：通过已注册字段实例或唯一 ID 定位，查询限定在当前 Form 根节点内，禁止拼接未转义 CSS selector。

### A4-09 P2｜Input ignoreCompositionEvent 不控制本地逻辑

input.props.ts:201-202 暴露配置，但 lk-input.vue:75-85 永远进入 composing 并抑制 input。公开参数与真实事件流无关。

最佳修复层：Input 与 Textarea 共用 composition 状态机，由配置明确决定是否上报输入法合成中间值。

### A4-10 P2｜Textarea 输入法合成可能重复提交

lk-textarea.vue:59-63、94-105 对每次 input 都发事件，compositionend 又手工提交一次；ignoreCompositionEvent 没有参与。中文输入可能出现中间值与最终值重复。

最佳修复层：复用统一 composition 状态机，并用事件序列测试精确约束 update/input/change 次数。

### A4-11 P2｜Textarea blur 计时器泄漏并产生陈旧 change

lk-textarea.vue:71-80 的 100ms timer 不保存、不清理。清空先发 change，blur timer 随后又发一次；卸载或重新聚焦后仍可能回调旧值。

最佳修复层：保存 timer，在重新聚焦、再次 blur、清空和卸载时取消；只提交捕获的最终值一次。

### A4-12 P2｜Textarea readonly 被实现为 disabled

lk-textarea.vue:125-133 将 readonly 映射为 disabled，导致 H5 无法聚焦、选择或复制，也丢失 readonly 与 disabled 的语义差别。

最佳修复层：H5 使用原生 readonly；微信端采用可聚焦但拦截变更的兼容层，同时输出 aria-readonly。

### A4-13 P1｜交互控件缺键盘/无障碍且命中区过小

Checkbox/Radio 只有 role，没有 tabindex 与键盘处理，indeterminate 仍输出普通布尔 aria（lk-checkbox.vue:117-126）。Choice、SelectList、Slider、Stepper、Rate、Keyboard 主要是 view + tap。Stepper 默认 56rpx、Switch 52rpx、Choice 约 52rpx，均可能低于 44 CSS px / 88rpx 的最小触控目标。

最佳修复层：共享 pressable 与 roving-tabindex 基元；H5 支持 Space、Enter、方向键，微信端补 role/name/state；视觉尺寸可小，但命中层至少 88rpx。

### A4-14 P2｜Choice 不支持 Showcase 声称的禁用场景

choice.utils.ts:5-9 的 option 类型没有 disabled，lk-choice.vue:29-42、68-81 永远允许选择，根节点还未透传 base id；showcase-cases.ts:296-302 却标为已覆盖禁用态。

最佳修复层：实现 option 与 root disabled、aria 和禁用样式，或删除虚假 Showcase 声明。

### A4-15 P1｜SelectList 缺失/重复 value 会合并选中状态

select-list.props.ts:6-12 将 value 设为可选，select-list.utils.ts:52-54 强转；lk-select-list.vue:123-126 及 utils:75-85 使多个 undefined 项共用 key 并同时命中。

最佳修复层：类型和运行时都要求稳定且唯一的 value；无效项不参与选择并发出结构化诊断事件。

### A4-16 P1｜Slider 快速按下/松开会卡在 dragging

lk-slider.vue:190-197 在设置 dragging 前 await 异步测量，早到的 touchend 会被 205-213 行忽略。同一节点还同时绑定 tap 与 mouse/touch（230-243），可重复触发 change。

最佳修复层：正式 pointer/gesture 状态机；await 前登记活动指针，缓存 pending end，并抑制拖拽后的合成 tap。

### A4-17 P1｜Slider 配置变化与受控值未重新规范化

组件只 watch modelValue（lk-slider.vue:46-61），range、min、max、step 动态改变不会重算；拖动期间跳过的父级更新可能永久丢失。slider.utils.ts:16-30 的初始化不 clamp、排序或 step-align。

最佳修复层：纯 normalize 函数监听完整配置 tuple；拖动结束强制与最新受控 prop 同步。

### A4-18 P2｜Slider 轨道几何会陈旧

只在 mounted 和 touchstart 测量；tap 仅 width<=0 时重测（lk-slider.vue:125-137、215-227）。容器 resize、横竖屏变化后，点击位置仍按旧宽度计算。

最佳修复层：每次交互起点保证新鲜测量；H5 用 ResizeObserver，跨端监听窗口 resize，并在卸载时清理。

### A4-19 P1｜Stepper 异步 beforeChange 与长按竞态

lk-stepper.vue:68-112、141-151 允许多个 Promise 基于同一个 current 并发计算，完成顺序不受控，造成丢增量或旧结果覆盖。

最佳修复层：串行变更队列，或 generation 加 pending committed value；父级受控更新必须并入同一状态机。

### A4-20 P1｜Stepper timer 泄漏且非法数字产生 NaN

lk-stepper.vue:137-163 未在卸载时清长按 timer；stepper.utils.ts:20、145-158 未校验有限正 step 与有效 min/max。

最佳修复层：生命周期统一清理；props/runtime 数值规范化并提供开发期诊断，渲染层不得出现 NaN。

### A4-21 P1｜Switch 异步切换陈旧提交

lk-switch.vue:61-109、137-138 没有 latest-intent 控制；beforeChange 尚未批准就先震动；等待时也没有 spinner。父级值改变或较新的切换完成后，旧 Promise 仍能提交。

最佳修复层：generation 检查最新 prop 与 intent；loading 或 changing 均显示等待态；只有成功提交后触发 haptic。

### A4-22 P1｜Rate 的 click-disabled 真实点击永远到不了处理器

lk-rate.vue:57-74 试图发 click-disabled，但 lk-rate.scss:7-14 对 disabled/readonly 使用 pointer-events:none，物理上阻断事件。

最佳修复层：保留命中与事件，在处理器内阻止值变化并输出正确禁用语义。

### A4-23 P2｜Showcase 声称半星，组件没有半星能力

showcase-cases.ts:386-392 宣称覆盖 half；rate.utils.ts:1、30-32 与 rate.props.ts:4-45 没有 allowHalf 或半填充模型。

最佳修复层：实现跨端 allowHalf 与半星几何，或删除能力和 verified 声明。

### A4-24 P1｜Upload 文件类型跨端失真

H5 默认 inputAccept=image/* 会覆盖 accept=video/all（upload.props.ts:104-109、lk-upload.vue:121-133）；微信端 all 实际仍走 chooseImage（95-119）。

最佳修复层：统一 accept capability adapter；微信端 all 使用 chooseMessageFile/chooseMedia，并明确记录平台降级。

### A4-25 P1｜Upload beforeRead 并发会上传未入列表文件

lk-upload.vue:136-175 在 await 后按最新列表 slice，但 afterRead 与 doUpload 仍遍历原 valid，可能上传已超 maxCount 或索引错误的文件。

最佳修复层：为选择建立 reservation 或串行锁，仅对真正 accepted 的子集发事件和上传。

### A4-26 P1｜Upload 任务、Blob URL 与 timer 全部泄漏

Blob 创建于 upload.utils.ts:38-52；上传任务只存在于 lk-upload.vue:217-249 的局部变量；209-211、237-239 的 timer 不清理；删除、清空、prop 替换、卸载都不会 abort/revoke。customRequest 也没有取消句柄契约。

最佳修复层：uid 到 task/timer/objectURL 的 registry，在删除、清空、替换与卸载时统一 cancel、clear、revoke。

### A4-27 P1｜Upload 直接变异父组件对象

watch 只浅复制数组（lk-upload.vue:19-25），随后在 178-208、223-247 行直接改 status、progress、response，破坏单向数据流与冻结对象。

最佳修复层：内部使用标准化深副本和不可变替换，所有 emit 输出克隆。

### A4-28 P1｜Upload 把 HTTP 4xx/5xx 标为 success

lk-upload.vue:223-230 的 uni.uploadFile success 回调不检查 statusCode。

最佳修复层：默认仅 2xx 成功，并允许配置 response validator。

### A4-29 P1｜Upload 把所有 blob/wxfile URL 当图片

upload.utils.ts:20-29 使 H5 PDF blob 进入 image；lk-upload.spec.ts:105-110 还把错误行为固化为单测。

最佳修复层：优先使用 UploadFile.type/mediaKind，URL 扩展名只作后备；测试覆盖 PDF blob、微信视频和无扩展名图片。

### A4-30 P2｜Upload confirmRemove 绕过 beforeDelete

正常删除走 removeFile，确认回调却直接 doRemove（lk-upload.vue:252-287）；Modal 还始终挂载（404-412）。

最佳修复层：统一删除状态机；确认后仍执行 beforeDelete；Modal 按需挂载。

### A4-31 P1｜VerifyCode 发送/重发由验证码内容误判

verify-code.utils.ts:106-119 与 lk-verify-code.vue:201-220 用输入值判断 send/resend。预填值会让首次点击变成 resend，发送后清空又退回 send。

最佳修复层：使用独立 hasSent/request-cycle 状态，输入内容不得决定业务阶段。

### A4-32 P2｜VerifyCode focus 状态与点击索引是死状态

focus 枚举在 verify-code.props.ts:19-25，解析函数 utils:121-129 不处理；focusIndex 在 lk-verify-code.vue:37、43-44、195-199、292-326 多次赋值，但模板只用 activeIndex。type/length 动态改变也不重新规范化。

最佳修复层：明确单隐藏输入的 caret 契约；实现或删除死 API/状态，并监听配置 tuple。

### A4-33 P2｜VerifyCode 默认 8 格横向溢出且文档不一致

默认 cell 96rpx、gap 12rpx，总宽约 852rpx；SCSS:17-25 不收缩、不换行。verify-code.md:158 写 autofocus=true，props:48-49 默认 false；根节点也未绑定 id。

最佳修复层：响应式 grid/clamp；修正文档与默认值；透传基础 id。

### A4-34 P2｜Keyboard sound 未实现，showDelete 只对 number 生效

keyboard.props.ts:73、138-141 声明 sound/showDelete，但 keyboard.utils.ts:156-171、188-217 的 idcard/plate 布局始终包含删除键。

最佳修复层：所有布局统一消费 layout options；实现带能力检测的音效，或删除 sound 公共 API。

### A4-35 P1｜Keyboard 覆盖层不锁页面滚动

keyboard.md:258 明确要求锁滚动，lk-keyboard.vue:174-234 却没有 scroll lock 或卸载恢复。

最佳修复层：复用引用计数的 popup scroll-lock；close 与 unmount 必须释放。

### A4-36 P2｜车牌键盘布局散乱

31 个省份按十列形成 10/10/10/1（keyboard.utils.ts:33-65、173-195），lk-keyboard.scss:238-246 把最后一个孤立键居中。

最佳修复层：采用平衡 grid 或显式占位单元；键、删除、确认、关闭都补 role、name 与键盘操作。

### A4-37 P2｜文档示例不可用

input.md:105-106 使用不存在的 value prop；169-185 把 rules 传给没有该 prop 的 FormItem；radio.md:140-147 的 Form 缺必填 model。

最佳修复层：把文档示例抽成可编译 SFC fixtures，同时进入类型检查与 H5/MP 双构建门禁。

### A4-38 P2｜Demo 硬编码颜色且文案与行为不符

form-demo.vue:321、333、513、535、614-629 大量硬编码 #111/#999，Slider/Stepper Demo 也硬编码灰色；form-group-demo.vue:86 使用不存在的 --lk-border-light；textarea-demo.vue:39 声称清空会震动，组件并未实现。

最佳修复层：全部使用主题 token；演示文案从能力清单生成，或补齐真实行为。

### A4-39 P1｜当前 Playground 不是有效演练场

playground/index.vue:96-259 只支持本批 9/15，缺 Form、FormGroup、Choice、SelectList、Upload、Keyboard；交互组件仅 v-bind，没有 v-model 回写或事件 journal；83-93 行消息通道仅 H5，微信端无驱动入口。

最佳修复层：建立独立跨端 audit harness，提供稳定 ID、受控模型、事件 journal、API stub、主题/尺寸切换，以及 H5/MP 等价控制入口。

### A4-40 P1｜测试与 verified 标签制造虚假安全感

14 个直接 unit 文件只导入 utils/props，真实 SFC 执行为 0/15；FormGroup 无同名 unit。视觉截图只覆盖 visualEnabled 的 12/15，排除 Form、Upload、Keyboard；Keyboard hardening 只检查元数据。MP runner 只运行 Button/Timeline，本批为 0/15。

最佳修复层：增加 SFC contract tests 与 H5/微信 Peekit 真运行证据；verified 必须由事件、rect、computed、error 证据清单自动计算，禁止手填。

## 最佳修复分组与独立工作树

1. fix/a4-form-contract：A4-01 至 A4-08。
2. fix/a4-text-selection-a11y：A4-09 至 A4-15。
3. fix/a4-numeric-controls：A4-16 至 A4-23。
4. fix/a4-upload-lifecycle：A4-24 至 A4-30。
5. fix/a4-verify-keyboard：A4-31 至 A4-36。
6. test/a4-crossend-harness-docs：A4-37 至 A4-40。

每组必须从同一审计基线创建独立 worktree 与分支；先补会失败的 SFC contract 与演练场场景，再修改共享层和组件层。单分支完成只代表局部结果，合并后仍须重新跑 15/15 全量双端验收。

## H5 与微信小程序 Peekit 验收矩阵

统一要求：

- H5 使用真实 H5 build；微信端使用真实 mp-weixin build 和微信开发者工具，不使用 miniprogram-simulate 代替。
- 每项根节点固定为 #a4-XX，事件输出到 data-a4-events=A4-XX。
- 每项都保存 selector 唯一性、动作前后事件序列、关键 rect、computed style/aria/原生属性，以及 console、pageerror、MP runtime、unhandled rejection。
- 除滚动专项外，关键 rect 必须为有限正数且包含于场景根；交互目标至少 44×44 CSS px；错误集合必须为 0。

| 编号 | H5 与微信动作 | 客观断言 |
| --- | --- | --- |
| A4-01 | 编辑 Input/Stepper 后调用 reset | 值严格回到挂载初值；reset=1；布局不跳变 |
| A4-02 | 点击、输入所有祖先 Form disabled 的控件 | update/change=0；disabled/aria/class 同步 |
| A4-03 | 只给 FormItem prop 后输入或选择 | field-change/blur 各一次；错误归属正确 item |
| A4-04 | 输入后依次触发 change、blur 规则 | 每类规则各一次；无匹配 trigger 不清旧错误 |
| A4-05 | 调用 validate fields/silent | silent 零事件；fields 只改变目标字段 |
| A4-06 | 修改 user.name 与动态 prop 后 validate/reset | 新路径生效；嵌套值和状态正确 |
| A4-07 | bad 慢校验后立刻 good 快校验 | 最终只有 latest 结果，无旧 error 闪回 |
| A4-08 | 两个 Form 含 user/username/特殊字符 prop 后滚动 | 只命中当前 Form 精确字段，无 selector exception |
| A4-09 | compositionstart→input→end，切换配置 | 抑制模式仅最终一次；非抑制模式无重复 |
| A4-10 | Textarea 执行同一 composition 序列 | update/input/change 数量符合契约 |
| A4-11 | blur 后立即 clear、refocus、unmount | change 不重复；卸载后 callback=0 |
| A4-12 | readonly Textarea 聚焦、选择、复制并尝试输入 | 可聚焦复制但 update=0；readonly 与 disabled 区分 |
| A4-13 | H5 Tab/Space/Arrow/Home/End；MP tap 并读 aria | 事件各一次；role/name/state 正确；目标≥44px |
| A4-14 | 点击/键盘操作禁用 Choice | update/change=0；aria-disabled 与样式存在 |
| A4-15 | 操作缺失/重复 value 的 SelectList 项 | 不批量选中、不重复 key；有结构化诊断 |
| A4-16 | touchstart/mousedown 后立即结束 | dragstart/end/change 各一次；最终 dragging=false |
| A4-17 | 动态切 range/min/max/step 并注入父级值 | 值有限、clamp/排序/步进正确，thumb 数正确 |
| A4-18 | resize 后点击轨道 50% | value≈50；thumb 中心≈track 中心 |
| A4-19 | 延迟 beforeChange 下长按并父级改值 | 值单调，无丢步、重复或旧提交 |
| A4-20 | 长按时卸载，并传 step=0/-1/NaN/min>max | 卸载后事件=0；无 NaN；目标≥44px |
| A4-21 | 延迟/拒绝 beforeChange，同时父级改值 | 无旧 update；拒绝 haptic=0；spinner 生命周期正确 |
| A4-22 | 点击 disabled/readonly Rate 星 | click-disabled=1、change=0，节点仍可命中 |
| A4-23 | 渲染 2.5 并点击半星 | 半填充宽严格 50%，或能力声明已删除 |
| A4-24 | H5 检查 file input accept；MP 监听选择 API | picker 类型与 accept 一致，降级可观测 |
| A4-25 | 连续选择两批并延迟 beforeRead | 只上传 accepted 子集，index 正确，数量≤maxCount |
| A4-26 | 上传中 delete/clear/unmount | abort/revoke 各一次，无 late progress/success |
| A4-27 | 使用 frozen model 后触发 retry/progress | 通过新数组/对象更新，父对象不被原地修改 |
| A4-28 | stub HTTP 500 与 201 | 500 仅 fail；201 仅 success；状态样式对应 |
| A4-29 | 渲染 PDF blob、无扩展图片、wxfile 视频 | MIME 决定 mediaKind；PDF 不出现 image rect |
| A4-30 | confirmRemove 下让 beforeDelete 返回 false/true | false 删除=0；true 删除=1；Modal 状态正确 |
| A4-31 | 预填首次发送、发送后清空、倒计时后再点 | send=1 后 resend=1，文案由 hasSent 驱动 |
| A4-32 | status=focus、点击早期 cell、动态 length/type | 活跃 cell 唯一，focus/caret 与明确契约一致 |
| A4-33 | 320/375 宽度渲染默认 8 格 | 全部 cell 在 root/viewport 内，无横向滚动 |
| A4-34 | idcard/plate 切 sound/showDelete | false 时删除节点=0；音频和 key 事件次数精确 |
| A4-35 | Keyboard 打开时 wheel/touch/page scroll | scrollTop 不变，关闭后恢复，overlay 覆盖 viewport |
| A4-36 | 查询车牌键盘每行并逐键操作 | 行宽平衡、无孤立键，role/name 正确 |
| A4-37 | 双端构建并交互所有文档 fixtures | 无 unknown/missing prop，示例承诺行为发生 |
| A4-38 | Demo 切亮/暗主题并检查颜色与文案 | token 全可解析；正文对比度≥4.5:1；文案真实 |
| A4-39 | H5 postMessage 与 MP 控制入口遍历 15 tabs | 15/15 可见可操作，有受控值与事件 journal |
| A4-40 | 运行 evidence dashboard | 两端事件/rect/computed/error 齐全才 verified=true |

## 覆盖分母

| 分类 | 文件 | 物理行 |
| --- | ---: | ---: |
| 15 个组件目录 | 63/63 | 9,584 |
| 对应 docs、Demo、直接 unit | 44/44 | 7,479 |
| Preview、Showcase、Playground 调用链 | 7/7 | 2,477 |
| 相关 visual | 4/4 | 241 |
| MP 覆盖链 | 5/5 | 264 |
| 合计 | 123/123 | 20,045 |

逐文件 SHA-256 总账见本报告末尾的“逐文件覆盖总账”；每个条目均按基线文件重新计算，作为未读为 0 的可复核凭据。

## 逐文件覆盖总账

~~~text
docs/components/checkbox.md|231|91c430fe547b6b9e302fac1dc7aef42302cd097b9c7556bb9b0fc1d25366d2a5
docs/components/choice.md|78|94fffa9561b1f35cff41ca0cd2118d8f53cee0d6fe79b8c35207630e6030480b
docs/components/form.md|301|ba40ce88dd9d9449fab42a6ef2fcc9fc76302b471fac7de2be0355a265ad2991
docs/components/form-group.md|98|b39e09a8d8e0e29a2b812a83f074dc9fd66afbda18b08b5cbb2f7e9d28675140
docs/components/input.md|268|8d753a39d45d3422eb64c2605e3b42581816e7f4e61f90ab9ebd64cc77899ccc
docs/components/keyboard.md|259|ba056aabf92c367ff6d21903f24abd2b5c2f81070a76674c949737d8ea9131ca
docs/components/radio.md|208|69736fbeb6cb2599f919a1137ef898c0f6c4f4aa27d5d6b2e5141d5b84ce114a
docs/components/rate.md|139|bfa505bbd46bf3c3af18a9beb2aa7f74a095b608a926d043b9c4479ed030bc58
docs/components/select-list.md|87|6db9ebec55a8e96c16254f583d2882b6d9cf4a3d73e09fb160a37f33e93f3b4e
docs/components/slider.md|181|2dd0171b9062a26bf9a14e7b613d805fe93146a0b24a9d01402c5c6eb6fadb5e
docs/components/stepper.md|187|bd25bd4ac6d97e086d857120479e43fd6ab491a3b8f56f6569b48f124dbe8deb
docs/components/switch.md|165|94f0ac06c4f2ae9def831a99ac45da1539beb22c2ab6ff50c8e3696be6445dc2
docs/components/textarea.md|222|7e25e98f2fcc0a8a7b7e82a9bdd9ececd0be9ebc9018fd62298617d7ab990703
docs/components/upload.md|276|90b6a9a09c74f5dd22dd1769c8f0b2253927a708eb667cc90acd5c9d6fb8c199
docs/components/verify-code.md|210|7e2f6286656b112e0308dc66ff8e454205d6fe1a6e9406455ee17e55a558d014
src/components/demos/checkbox-demo.vue|197|5bc71324699d0e9413b78128cfe03e01e9862ea8831da44d87b2d128f8b2851a
src/components/demos/choice-demo.vue|56|6fe289046a8621839af8a975323f461e1fa2d99cc8d56a7fa03b437affaf80b2
src/components/demos/form-demo.vue|690|605b3b8c099093b7156ec4510d82bf5a54cb94441d08e82dade4c9eb74fccba5
src/components/demos/form-group-demo.vue|113|a3d702c64b9ba66270316fce5d1ee81e163e130bae86169df8288af3ca557ea7
src/components/demos/input-demo.vue|122|d8a8093ff457dc308585daac3c2b3b835b96064a0c37ad5701be07bb78d60e24
src/components/demos/keyboard-demo.vue|249|cc637a70a8689014c38834e8d7d854eb7355984b34530c20a85ec02f581f3b82
src/components/demos/radio-demo.vue|138|d4f05526aecb530ed68d97a323f705329cc426c62e9fee7337fc16b9b557e688
src/components/demos/rate-demo.vue|74|6657ff222e5268e29621231666c81cab97240ae35a353dff4e9ae266dd88fe28
src/components/demos/select-list-demo.vue|161|5def2987592be507f141107c9f7f19d08882835eec20070166c014c23ea4ea97
src/components/demos/slider-demo.vue|109|67a8385862ae942caf35556948733d0a9eab46e36c60e96711a2595fd7daa793
src/components/demos/stepper-demo.vue|112|e28b0a875e849861fb9160459c976f42563fe89df8fdc5896843d5846b3a89ff
src/components/demos/switch-demo.vue|134|7b7e14e864206087fcd5f01525fb45cc383fa0d3774ed526c9e3574866bb8c44
src/components/demos/textarea-demo.vue|103|2e69aa54167f461952126e58d92bafd3aac7a743889e1496a410645fae96fd4f
src/components/demos/upload-demo.vue|253|6ffbb2c89388c7551b62e541aed6da2b985c95695f5dfab2b7475f935f1dd7e8
src/components/demos/verify-code-demo.vue|247|c1a87dc0af1099219a6c4300de5c4f760a19dbe3908e7b1d771464bb85474fc1
src/components/preview/preview-catalog.ts|684|967afcad48654589aeae4de9e49f80bb2c912e3d4fed8b70a39c40d03f28ed52
src/components/preview/preview-demo-registry.ts|85|2a7b9ca6a53344c4b5b6d5723886ca0e197479c2ba9c51beeab4371939f45a5d
src/components/preview/PreviewDemoRenderer.vue|167|384ebd26037ad17260d3e1e9075e848ba51fefed6e76a76ebe5fc028f36da297
src/components/showcase/showcase-cases.ts|664|ab131d0afac2823dae26d1ce783136c16417c0aaa34e5abe8dfec6bef6dc032f
src/pages_sub/component-detail/index.vue|273|2d585a5bdb2207fd56ad1bbb3d1d5987c2d1e47bf2d0fc592930707272f5cf0f
src/pages_sub/playground/index.vue|303|7827193da2343621e7fb21e7cd586390e115a44ea16383163d583a303ab90389
src/pages_sub/showcase/index.vue|301|9650fdb2050e05c413450ae2797be358b968520881ce4287365d672d76db8380
src/uni_modules/lucky-ui/components/lk-checkbox/checkbox.props.ts|110|bf5737fc69373eede37812de03efaaf1bb31b76333e8102aeb572e39617fe2c3
src/uni_modules/lucky-ui/components/lk-checkbox/checkbox.utils.ts|133|7c87807ef411909b6869d613f7e7e54744d056c01b4d3f6097922fb1257415f0
src/uni_modules/lucky-ui/components/lk-checkbox/lk-checkbox.scss|186|39ebcb9a43f6f35ab2109e78c90ba1e0efb63579214c5af4b3defb12aadd6109
src/uni_modules/lucky-ui/components/lk-checkbox/lk-checkbox.vue|164|84c41ce6794fb2c8bfb429527ebc579d543af37cbbdc077d3f7743f79343e86e
src/uni_modules/lucky-ui/components/lk-checkbox/lk-checkbox-group.vue|65|3c34abd842aece530b908241a69b30dcb642c581a2278ab5e88fcb558563d31e
src/uni_modules/lucky-ui/components/lk-choice/choice.props.ts|29|06f93b9902a2d781893ecf6abbf9e065de47d0fa5c4263eefc4fa37e86402609
src/uni_modules/lucky-ui/components/lk-choice/choice.utils.ts|100|312747bb8331fa351a0761ceacf6fa0381ff2b95a78ad3e11322eb7408e8361b
src/uni_modules/lucky-ui/components/lk-choice/lk-choice.scss|74|9564664e3534da7f005ad4d233f756cd2afcbbcca0c24d9e2d41dfab4e452de3
src/uni_modules/lucky-ui/components/lk-choice/lk-choice.vue|88|9c8385e528c030aedf6a675a25b42b2529e36d5c632b598d5bbee2d4a67e1229
src/uni_modules/lucky-ui/components/lk-form/context.ts|74|94020b7eb45efb40bec8a9f4c882a79d9b09888ddef1d17878cf18ec2c5e6f43
src/uni_modules/lucky-ui/components/lk-form/form.props.ts|159|3c214bdc22f46aa2a72cdfab6ff45fe712ab64b9ae48b97f23502488a53562d7
src/uni_modules/lucky-ui/components/lk-form/form.utils.ts|185|6d7906ee32f6802ad336b1597d726eaa047e3f60ddc0ad444ee92093cb43bbfb
src/uni_modules/lucky-ui/components/lk-form/lk-form.scss|181|9ef505f63dc227f8afd5408bb0baffcc2212d3ad147a9a50cc9b9ed30448549b
src/uni_modules/lucky-ui/components/lk-form/lk-form.vue|294|7a1bb66fce39ec6458b90d84e381e4054599d12b332f130c23c6ae4305b94ff2
src/uni_modules/lucky-ui/components/lk-form/lk-form-item.vue|254|5d6b30ce925c82159d93e7b57fe195e2bdb84a525fd9eb5d2acc43af0a9038ca
src/uni_modules/lucky-ui/components/lk-form-group/form-group.props.ts|14|af9e76e93ef5a35a2c7b62ba36b6cf4954f9fa4f245975373dedc74a6b35a366
src/uni_modules/lucky-ui/components/lk-form-group/index.scss|29|ac26225ea1dc8c5ca436246010927f22fe75c626f9f6845acf82313aadbef9f2
src/uni_modules/lucky-ui/components/lk-form-group/lk-form-group.vue|35|7f2ede76a51c7f1e9ca3ec5a8419e49fccda44350bda99272872dcfcb30d7f64
src/uni_modules/lucky-ui/components/lk-input/input.props.ts|241|dd2e1cb6dc3d0ed07d5bfe99b802ad207dd02177effc693138dfe30af3efe9ae
src/uni_modules/lucky-ui/components/lk-input/input.utils.ts|125|7a86fcf8f582252e3355612184671a8f01be7367c1365377d2fac53a363dfbcf
src/uni_modules/lucky-ui/components/lk-input/lk-input.scss|207|57bf2b51f5c52306b368b322ddda69049211033a674bcfc8ef4c79f175a4f36c
src/uni_modules/lucky-ui/components/lk-input/lk-input.vue|259|4390015c572e6cc64a907084b5bccb8948e6d02ceaf8d959eaab249c5c880eff
src/uni_modules/lucky-ui/components/lk-keyboard/keyboard.props.ts|216|7dc02f6031c9cdaef4f823e91d7cf32df9791f09a7d6f6beec161a4d7c174302
src/uni_modules/lucky-ui/components/lk-keyboard/keyboard.utils.ts|314|b473f3150314aa32eb4c32ac45156210944d667a284203455d15dc46bb538db7
src/uni_modules/lucky-ui/components/lk-keyboard/lk-keyboard.scss|254|9d4f3c04130b85ef368bd2440185006369c7b7578ed620bcbe12f8db771afd4e
src/uni_modules/lucky-ui/components/lk-keyboard/lk-keyboard.vue|239|27581f8012ce4a51fedd399786bfd3ab2068eb5100e5dfdc0cecec738d81f9af
src/uni_modules/lucky-ui/components/lk-radio/lk-radio.scss|153|ed2afa479e196da745e7937d9905f9efbf1b69c889c8fa0603768df2be373f08
src/uni_modules/lucky-ui/components/lk-radio/lk-radio.vue|147|a9645790548bd56fb1bb7d189e7da461dfc7b9b8871e63e6a91258268ea6467a
src/uni_modules/lucky-ui/components/lk-radio/lk-radio-group.vue|51|4713e623d7fcbfea50571ad4f81141addfd3b6eb3bdfc44dbd2ee8007a1a040f
src/uni_modules/lucky-ui/components/lk-radio/radio.props.ts|100|6231554ac8fb86c9e46f998b2361015b0382d83a8cc8749d8a42ce2d939719c2
src/uni_modules/lucky-ui/components/lk-radio/radio.utils.ts|102|f9669e26c22d2b27e5ee003dc2a8e26f6c46f9564c915e26ec3ace024e503f0c
src/uni_modules/lucky-ui/components/lk-rate/lk-rate.scss|24|730ca907a6581698c8b231bfa5d76f72f891d9049a59adf48cc3ebd5c9f13876
src/uni_modules/lucky-ui/components/lk-rate/lk-rate.vue|123|5497495bdd76963cf2eba83f954e0d3b9233c0f1d67b417a5b814417ebe401a7
src/uni_modules/lucky-ui/components/lk-rate/rate.props.ts|61|a21d3f02408ebfc220715b4ebfae9c95e002c19659737286ed47cc20fe20da63
src/uni_modules/lucky-ui/components/lk-rate/rate.utils.ts|56|8aa8f177a7809edf01b8b3e75e7cdb4a1cf86079c7072e8fe14085127542c6cb
src/uni_modules/lucky-ui/components/lk-select-list/lk-select-list.scss|142|c16af3dc6599b9446e252ed3ac04985bfd410e121600a40aa47b27b8495dd717
src/uni_modules/lucky-ui/components/lk-select-list/lk-select-list.vue|153|579e3f4c3f06ea868710bc7729b438e39ea87d44cd4bdb6b8a24e5647c4d66db
src/uni_modules/lucky-ui/components/lk-select-list/select-list.props.ts|94|3f415712a5bc86c37747557a0c34bcb773d5a37d140e8ba181d96876dadea690
src/uni_modules/lucky-ui/components/lk-select-list/select-list.utils.ts|162|4836c988b76fbc844c5e2a54e37cb3b1aa1872ec6c29cc61a06a74dbd83863f8
src/uni_modules/lucky-ui/components/lk-slider/lk-slider.scss|134|1aaa02fc160c2cb05163675a5fd216c3df9f4c128b5bca87dcad11ae0d10f1ef
src/uni_modules/lucky-ui/components/lk-slider/lk-slider.vue|285|36bea590a4a84bb20af52387b6bfdebfd79aa4e624c0a78222cd4d6b1e22e2a0
src/uni_modules/lucky-ui/components/lk-slider/slider.props.ts|79|97c4603b83fe32a74d58011ffb44d67dfba4b51c97e9721774095c28bfe12178
src/uni_modules/lucky-ui/components/lk-slider/slider.utils.ts|269|41cb0552499d1c7049f24f4b714c09dd5f942d97733b5a51632a6e7fdca16322
src/uni_modules/lucky-ui/components/lk-stepper/lk-stepper.scss|105|56b0022ba9368d888a9cf5d5c167907ee97424c0cfd1a6599bfbe2fcf689a4c4
src/uni_modules/lucky-ui/components/lk-stepper/lk-stepper.vue|215|1b13d7181b8b1d80de70507d10884010a399a3a1e30f112644c27a5102c65800
src/uni_modules/lucky-ui/components/lk-stepper/stepper.props.ts|79|fb066b2327fb9e3254df6e47fa5e224764618852783b8997a82b8a95cb539b22
src/uni_modules/lucky-ui/components/lk-stepper/stepper.utils.ts|185|136dc060b05e8657c2f9aef65ef839a6a87092abe3a79c7f8de3ccd28f878e4a
src/uni_modules/lucky-ui/components/lk-switch/lk-switch.scss|109|bcae3055ca8235957731dac5d261ff9439f3d1e8b4b7136d9fb5d3fb74fbe5ff
src/uni_modules/lucky-ui/components/lk-switch/lk-switch.vue|145|41b1674ad8ffea0c0eb98f39a896faa3a69b57cec28fa699907c3f59a7af2de9
src/uni_modules/lucky-ui/components/lk-switch/switch.props.ts|88|29dc9ee374f7df8a0ea8d15eb774a7251e364818d26cb3f3a6731090b9c15079
src/uni_modules/lucky-ui/components/lk-switch/switch.utils.ts|82|39ed2b37d9e345c4e1efea6e33d4e44e61ae5d3a25e8ba65d21ab1b40e617431
src/uni_modules/lucky-ui/components/lk-textarea/lk-textarea.scss|158|ecea612bbfba4d97246dc46e673b110c7b9ef1bce6b95ca430f21e8c652de0c6
src/uni_modules/lucky-ui/components/lk-textarea/lk-textarea.vue|193|468b2a921e233b8ed89e70d51d58adbf04a064a09a877f98b8c46a6e296c310d
src/uni_modules/lucky-ui/components/lk-textarea/textarea.props.ts|173|9883fcb85212e6b97b9ea4699877d3de19dc51064e77f0336131845a723c0032
src/uni_modules/lucky-ui/components/lk-textarea/textarea.utils.ts|70|4d8cda9f724bc65dfa31f2203da8f35337b2b4e816132832a30beec611fb561d
src/uni_modules/lucky-ui/components/lk-upload/lk-upload.scss|250|33b3c3d6a18e97e3e0f37b605eae5df30b9113fe8298be46a50337336d01c149
src/uni_modules/lucky-ui/components/lk-upload/lk-upload.vue|419|59f32009eaae2fbc6d328633c55880a85268c323639134d7084495df56ce5a0d
src/uni_modules/lucky-ui/components/lk-upload/upload.props.ts|212|9f86fc7c11986665483990e72232199b4478731700e7c1bab2ab1a9fbdb3b9f5
src/uni_modules/lucky-ui/components/lk-upload/upload.utils.ts|86|8aaff231c3f7b19fb1efbb85900fa442a2213708c0b1405bf8de124102c6136a
src/uni_modules/lucky-ui/components/lk-verify-code/lk-verify-code.scss|231|1b5e09e81222a443807ea87b2618ff0ef12fc85cf4024d76f9a9ee9429f6551c
src/uni_modules/lucky-ui/components/lk-verify-code/lk-verify-code.vue|351|0ff463a931e35badc07c5751ef2560ce676f26fe93257f667fbc64c2ec458f1d
src/uni_modules/lucky-ui/components/lk-verify-code/verify-code.props.ts|109|7b9a3f47cfbe5ae1756c70e1be1aa608fc83c964c1d5f10d839bb22a3e7d6931
src/uni_modules/lucky-ui/components/lk-verify-code/verify-code.utils.ts|160|cdf96e548c039f0f8361f3c4b2708143280c3d182f579b308586703dd5dad0b3
tests/miniprogram/button.spec.js|76|3300e50e9c2e59cdcdf9bb28b544e4170fd3f204fcc2ee6e15cca88bc97830a8
tests/miniprogram/run-miniprogram-tests.js|20|8e42f5ef5c835f97a7a6fddbbec6cc2619f01e2e316ce1798daf8052fdd593d6
tests/miniprogram/setup-miniprogram-env.js|58|112f218c610ad87340e0551069d54efbb2c0292530b46394578d17a68e374a59
tests/miniprogram/tab.spec.js|45|067ee2bc8f3e8ba49305064f0d0a5ffff3281cbbecdae06f8ef93e89765ccbe9
tests/miniprogram/timeline.spec.js|65|141459f94c8adc5d8c22a8afd76d6172c71c96faf7dba0169f4f885fe6ca8e09
tests/unit/lk-checkbox.spec.ts|135|b8e05c2426fd0a8b4463d7865a49c268ebeb722670b9ccdce950c5909610f812
tests/unit/lk-choice.spec.ts|102|a5a29c0f93cbb1344054104b01789b19cf653442c6c56c6812a5200eb3d983e9
tests/unit/lk-form.spec.ts|149|3b25845eb7714037c1b139b8e86949de46bfecce102e39abb8d37b8b7e3659ee
tests/unit/lk-input.spec.ts|151|a056d11dd3877d7545f93a69b5cba356e2082a94e502e4d904eaa9bbe4c1af05
tests/unit/lk-keyboard.spec.ts|186|8c19769f7e9f1472462ca0855fe6d314001b55e9088d6939e3a63fd9f5855d84
tests/unit/lk-radio.spec.ts|111|566abcedffb5cbc9ece18137115a26b8d88f23de1172a113cb7140dd6bd2908e
tests/unit/lk-rate.spec.ts|76|3404e5e81fc2c12307ba331cd31eae36c9d98eecc43c04541b5a96b5b1efd56f
tests/unit/lk-select-list.spec.ts|181|cd5e67dde7ce1f01b408e0d500b84912170bb00364f13d491d6b62db212a9541
tests/unit/lk-slider.spec.ts|151|4d084ad789801bd3b6ddef0499478a241bc6ecad329380c9d2d735c494093cfa
tests/unit/lk-stepper.spec.ts|111|19b589a616801df51a7e9a9273c35bdc9e8995a17dc7909059a8de0be26ceed1
tests/unit/lk-switch.spec.ts|98|8aec0ae128b72512d990fe03c6b8b7ee4e10636be9bc8a1bd9b0de51ed975271
tests/unit/lk-textarea.spec.ts|98|d158c51a62838ba1c3a650b320f240242699425abb364ca0963db4ba7f698c5e
tests/unit/lk-upload.spec.ts|113|40ade594149304534da07affc477cbf1fd938842db4b34f86ccc9a59f0cdeebf
tests/unit/lk-verify-code.spec.ts|149|0a4276305d941da7baf28efbb060b0a865ec5929bb923fc947a2bc66816004ae
tests/visual/dynamic-visual-showcase.spec.ts|29|8c3a9a3e22692c5cf2c7440f4c2922d625cb2de5029bfb1e220d485df8909904
tests/visual/high-risk-showcase.spec.ts|104|9a2d7f7d8ab9fa5cd9c8b125cf7b16bb446fb58ae63fe51954fcceb5183d9e7b
tests/visual/needs-hardening-showcase.spec.ts|88|776d128290c080b7f0f0352e30b419c7eecefd50c4e50ae65302aedec25a651a
tests/visual/screenshot.spec.ts|20|e60e1a1f4bcfae013a7cf1c3bd776f3c73a5edd167df542d183e31024bb3e396
~~~
