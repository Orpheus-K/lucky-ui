# A5B 动态、时间与布局组件逐行审计

## 1. 结论与边界

- 审计基线：docs/lucky-ui-full-audit，c8071e67f93cc95ee1ddc12cac7bfccdf74058c1。
- 强制范围：lk-calendar、lk-calendar-picker、lk-countdown、lk-number-roller、lk-timeline、lk-watermark。
- 覆盖结果：79 个唯一文件，14,598 个物理行，未读文件 0，未读物理行 0。文件总账与 SHA-256 见第 8 节。
- 结论：共确认 31 项可执行问题，其中 P1 20 项、P2 11 项。问题覆盖日期边界、受控状态、计时语义、动画竞态、尺寸与触摸、暗色对比度、微信小程序滚动兼容、文档与测试真实性。
- 本报告仅完成静态逐行审计，没有启动 H5、微信开发者工具或 Peekit，没有宣称任何运行态通过。构建成功、单元测试通过、截图生成、showcase 中的 verified/已验证文案都不能代替下述运行验收。
- 未把 dist、截图和构建产物纳入源码分母；它们会随环境变化，不能替代对应源文件。所有路径、行号和哈希均针对上述基线。

### 问题分布

| 范围 | P1 | P2 | 合计 |
| --- | ---: | ---: | ---: |
| Calendar | 5 | 3 | 8 |
| Calendar Picker | 3 | 1 | 4 |
| Countdown | 4 | 1 | 5 |
| Number Roller | 2 | 2 | 4 |
| Timeline | 3 | 2 | 5 |
| Watermark | 2 | 2 | 4 |
| 文档、演练场与测试真实性 | 1 | 0 | 1 |
| 合计 | 20 | 11 | 31 |

## 2. 最佳修复顺序

1. 先修公共输入规范化与状态机：严格日期解析、firstDay 整数化、Picker 草稿/提交边界、Countdown 绝对目标语义、Number Roller 数值边界、Watermark 数量上限。
2. 再修生命周期与跨端结构：Calendar 延时任务集中清理、Timeline 水平模式使用微信可滚动结构、Watermark 全屏层级放到正确宿主。
3. 再修视觉合同：Calendar 尺寸和 ring marker、Countdown 暗色反差、Timeline 线动画和 active halo、全部触摸热区。
4. 为每项建立确定性演练场：注入时钟、公开事件计数和当前状态，不依赖肉眼等待；H5 与真实微信小程序各跑一次 Peekit。
5. 最后更新文档和测试结论。只有双端 selector、events、rect、computed style、errors 都满足本报告的条件，才允许把状态改成已验证。

以下验收中的 .a5b-case--* 是修复分支演练页的稳定场景宿主；除明确标成“修复后的新增结构”外，组件内部 selector 均来自当前实现。演练页应把 emitted events、model、clock 和错误记录渲染到同一场景的 .a5b-events、.a5b-state、.a5b-errors，避免仅凭截图推断状态。

## 3. Calendar

### A5B-01 · P1 · 时间边界 / 状态

证据：src/uni_modules/lucky-ui/components/lk-calendar/lk-calendar.vue:103 在 setup 时只计算一次 today；后续 day class 在同文件 380-388 使用该快照。组件若跨过本地午夜继续驻留，今天高亮仍停在前一天。

影响：H5 长驻标签页和微信小程序前后台切换都可能显示错误的“今天”，并影响用户对当前日期的判断。

最佳修复层：组件状态层。用可注入的 now provider 维护 reactive today，在下一次本地午夜刷新，并在页面/应用重新进入前台时校正；统一清理午夜 timer。

- H5 Peekit：selector .a5b-case--calendar-midnight .lk-calendar__day.is-today；动作把确定性时钟从 2028-02-28 23:59:59 推到闰日 00:00:01；events 中 select/change 均为 0；rect 必须只对应一个可见日期格，内部 .lk-calendar__date 文本从 28 变为 29；computed 的 today 前景/背景转移到 29；.a5b-errors 及控制台 errors 为 0。
- 微信 MP Peekit：page.$(.a5b-case--calendar-midnight) 后在 calendar 组件内查询 .lk-calendar__day.is-today；同样推进时钟并模拟 hide/show；事件计数保持 0，selector 唯一且 rect 非零，computed 高亮转移到 29，页面错误和组件错误均为 0。

### A5B-02 · P2 · 生命周期 / 动画竞态

证据：src/uni_modules/lucky-ui/components/lk-calendar/lk-calendar.vue:113-115、234-247、291-297 建立三组 setTimeout 延时回弹或切月；文件只导入 computed、ref、watch，没有 onBeforeUnmount/onUnmounted 清理。卸载后回调仍会写入 ref，并可能与新一次手势交错。

影响：H5 路由切换、Picker 关闭以及微信小程序页面销毁时可能出现卸载后写状态、残留回调和切月闪动。

最佳修复层：组件生命周期层。使用单一 timer registry 和递增 generation；每次新手势取消旧任务，卸载时清空全部任务。

- H5 Peekit：selector .a5b-case--calendar-unmount .lk-calendar__grid；动作开始左右滑动后在 50ms 内卸载场景并等待超过所有 timeout；events/model 在卸载后不得变化，旧 selector 数量为 0，宿主 rect 保持稳定，computed 不出现残留 transform/transition，console 与 .a5b-errors 为 0。
- 微信 MP Peekit：在组件 .lk-calendar__grid 上 touchstart/touchmove 后立即 wx.navigateBack 或条件卸载；等待 500ms，select/change/month-change 均无新增，selector 已消失，页面 rect 无幽灵占位，computed 无残余位移，errors 为 0。

### A5B-03 · P1 · 输入校验 / 跨组件一致性

证据：src/uni_modules/lucky-ui/components/lk-calendar/calendar.props.ts:73-77 和 lk-calendar-picker/calendar-picker.props.ts:98-102 只验证 firstDay 位于 0 到 6，允许 1.5；src/uni_modules/lucky-ui/components/lk-calendar/calendar.utils.ts:44-45、75-80、210-213、292-298 将它用于数组下标与网格偏移，分数下标产生空星期名和非整数格位。

影响：H5 与微信小程序都会生成缺失星期标题、错列日期或不同编译器下的不一致布局。

最佳修复层：公共 prop 与 calendar utils。要求 Number.isInteger(value) && value >= 0 && value <= 6，并在所有计算入口 canonicalize；非法值采用明确 fallback 并发出开发态警告。

- H5 Peekit：selector .a5b-case--calendar-first-day .lk-calendar__weekday 与 .lk-calendar__day；动作依次传 1.5、-1、7、NaN；events 不产生伪 select，星期项始终 7 个且文本非空，七列 rect 左边界一致，computed grid/width 无 NaN，errors 仅允许一次约定的开发态校验警告且无运行异常。
- 微信 MP Peekit：通过 setData 更新 first-day 为同一组非法值；组件内 selector 数量保持 7 个标题和完整日期格，事件为 0，rect 均为有限值并按七列对齐，computed 中无 undefined/NaN，页面 errors 为 0。

### A5B-04 · P1 · 日期合同 / 范围与标记

证据：src/uni_modules/lucky-ui/components/lk-calendar/calendar.utils.ts:17-28 的日期解析接受 YYYY-MM；48-50 对 disabledDates 只做过滤/排序，没有严格校验或去重；64-71 的 marker map 会保留永远匹配不到日格的 YYYY-MM key；153-180 直接依赖字符串范围；对应 props 位于 calendar.props.ts:27-68。视图月份和公共“具体日期”共用宽松解析合同。

影响：无效日、月级字符串、重复值和未规范化边界会静默进入 H5 与微信小程序，造成标记缺失、禁用判断错误和选择结果与文档不一致。

最佳修复层：日期领域工具层。拆分 parseViewMonth 与 parsePublicDay；公共日必须严格 YYYY-MM-DD 且真实存在，归一化、去重并显式处理非法输入；比较使用本地日序号而非原始字符串。

- H5 Peekit：selector .a5b-case--calendar-invalid-date .lk-calendar__day、.lk-calendar__marker；动作输入 2026-02-30、2026-08、重复 disabledDates 与倒置 min/max 后点击相关格；events 只包含合同允许的日期且不重复，rect/网格不塌陷，computed 不给非法日错误 marker/disabled 样式，errors 显示约定校验结果而无异常。
- 微信 MP Peekit：用 properties/setData 注入同组输入并 tap 相关 .lk-calendar__day；select/change payload 必须为规范 YYYY-MM-DD 或完全不发出，marker selector 只对应合法日，rect 有限，computed 禁用状态与 H5 相同，errors 为 0 或仅约定开发警告。

### A5B-05 · P1 · 性能 / 范围选择

证据：src/uni_modules/lucky-ui/components/lk-calendar/calendar.utils.ts:182-207 逐日扫描区间内是否存在 disabled date，316-342 在范围选择时调用它。外部 modelValue 可给出极远起点，下一次点击会做与日数成正比且无上限的循环。

影响：极端或脏数据可让 H5 主线程和微信小程序 JS 线程长时间卡死，是可由组件输入触发的拒绝服务型性能问题。

最佳修复层：range 算法层。预先建立禁用日有序集合/日序号索引，在两个端点间做二分查询；同时对可选范围建立明确上限和非法外部值回退。

- H5 Peekit：selector .a5b-case--calendar-long-range .lk-calendar__day:not(.is-disabled) 及其 .lk-calendar__date；动作预置 1900-01-01 起点、把 viewDate 切到 2100-12，再在 selector 集合中点击日期文本为 31 的格；下一动画帧内 .a5b-state 必须可读，change 最多一次且结果遵循上限策略，grid rect/computed 不冻结，Performance long task 不超过约定预算且 errors 为 0。
- 微信 MP Peekit：预置相同起点并 tap 终点；Peekit 在约定 100ms 预算内重新读到 .a5b-state，change 最多一次，组件 rect 可查询、computed 未停在 pressed 状态，自动化连接不中断且 errors 为 0。

### A5B-06 · P2 · 尺寸 / 对齐

证据：src/uni_modules/lucky-ui/components/lk-calendar/lk-calendar.scss:14-27 依次定义 sm、lg、week 三个根节点 modifier；week view 与 size class 会同时挂在根节点，而源序更后的 week 把 sm/lg 的 --lk-calendar-day-size 都覆盖成 104rpx。因此 week 模式下 small 与 large 实际失去尺寸差异。

影响：H5 与微信小程序的 small/large 视觉密度不一致，星期标题和日期列可能出现纵向间距、点击中心对不齐。

最佳修复层：Calendar 样式 token 层。为 week-size、day-size 使用独立变量，或以组合 modifier 明确覆盖；不要依赖源序顺序碰撞。

- H5 Peekit：selector .a5b-case--calendar-size-sm/.a5b-case--calendar-size-lg 下的 .lk-calendar--week .lk-calendar__day；不交互，读取 rect；同一 size 的七列中心误差不超过 1px，week-sm 与 week-lg 高度分别命中设计 token且互不相同，computed height/gap 不被 week modifier 意外覆盖，errors 为 0。
- 微信 MP Peekit：分别查询 week 模式两种 size 的首尾 day rect；七列中心一致，sm 明显小于 lg，computed 尺寸换算稳定且无空值，事件计数为 0、errors 为 0。

### A5B-07 · P1 · Marker 样式合同

证据：src/uni_modules/lucky-ui/components/lk-calendar/lk-calendar.vue:479-484 对所有 marker 都内联 backgroundColor；lk-calendar.scss:299-310 的 ring 类型却要求透明背景和 warning 色边框。docs/components/calendar.md:76-80 与 src/components/demos/calendar-demo.vue:12-16 还给 ring 显式传 color，最终得到实心圆而不是彩色空心环。

影响：H5 与微信小程序均违背公开的 ring 类型视觉语义，文档示例本身会展示错误结果。

最佳修复层：Marker 渲染合同。写入 --marker-color 或类型化 style；dot/badge 使用背景色，ring 强制透明并用同一颜色作为 border-color。

- H5 Peekit：selector .a5b-case--calendar-ring .lk-calendar__marker--ring；动作切换 marker color；rect 为设计直径，computed background-color 必须透明、border-style 为 solid、border-color 等于输入色，marker 不触发额外事件且 errors 为 0。
- 微信 MP Peekit：组件内查询同 selector 并更新 color；rect 直径不变，computed/内联样式显示透明背景与目标边框色，select/change 仍为 0，errors 为 0。

### A5B-08 · P2 · 触摸热区 / 可访问性

证据：src/uni_modules/lucky-ui/components/lk-calendar/lk-calendar.scss:92-105 的 today 控件高 44rpx，152-155 的 small day 为 64rpx；lk-calendar-picker.scss:54-66 的关闭区为 56rpx，80-91 的 reset 没有最小高度。按常见 750rpx 设计宽度换算，它们低于 44×44 CSS px 的可靠触摸目标。

影响：H5 小屏和微信小程序真机上容易误触或漏触；文字本身可见不代表热区合格。

最佳修复层：交互布局层。保留视觉尺寸，通过 padding 或伪元素扩展真实 hit box，保证所有可点击项至少 44×44 逻辑像素且不重叠。

- H5 Peekit：selector .lk-calendar__today、.lk-calendar--sm .lk-calendar__day、.lk-calendar-picker__close、.lk-calendar-picker__reset；在 390px viewport 读取 rect，四者 width/height 均至少 44px，相邻 rect 不重叠；点击中心各只产生一次预期 event，computed cursor/pointer-events 正确，errors 为 0。
- 微信 MP Peekit：在目标真机视口查询相同内部类；rect 均至少 44×44 逻辑 px，按四个角与中心只触发目标控件一次，events 无串扰，computed/样式没有被组件隔离丢失，errors 为 0。

## 4. Calendar Picker

### A5B-09 · P1 · disabled/readonly 受控绕过

证据：src/uni_modules/lucky-ui/components/lk-calendar-picker/lk-calendar-picker.vue:119-127 只在 trigger 点击时检查 disabled/readonly；151-156 的外部 show watcher 可直接打开；206-222 的内嵌 Calendar 未接收这两个状态；129-145 的 reset/confirm 与 224-255 的 sliders 也没有保护。根节点禁用 CSS 不能可靠约束 Popup 的跨层内容，readonly 更完全没有阻断。

影响：父级程序化打开后，H5 与微信小程序都可能在禁用或只读状态修改草稿、触发 change/confirm，并造成受控值被越权改写。

最佳修复层：Picker 状态机。所有 open、calendar select、slider、reset、confirm 入口统一 gate；进入 disabled/readonly 时强制关闭或转为纯展示；状态传递给子 Calendar 和 sliders。

- H5 Peekit：selector .a5b-case--picker-locked .lk-calendar-picker__trigger、.lk-calendar-picker__panel、.lk-calendar-picker__reset 及内部 .lk-slider；动作先设置 show=true，再点击日期、拖 slider、reset/confirm；panel 必须不出现或全部不可交互，model 与所有 events 为 0，rect/computed 显示 disabled/readonly 且 pointer 行为一致，errors 为 0。
- 微信 MP Peekit：通过 setData 把 show 设为 true 并对同类 selector 执行 tap/touch；面板关闭或控件禁用，model 不变，change/confirm/reset 为 0，rect 不产生可点击浮层，computed disabled 状态存在，errors 为 0。

### A5B-10 · P1 · 时间解析 / step 对齐

证据：src/uni_modules/lucky-ui/components/lk-calendar-picker/calendar-picker.utils.ts:19-25 会把 25:99:99 静默钳制为合法时间，tests/unit/lk-calendar-picker.spec.ts:29-31 甚至固化了这一行为；41-53 定义 precision 上限。lk-calendar-picker.vue:67-76、104-116、230-255 没有在 precision、timeStep、外部值变化时重新钳制并吸附。共享 slider.utils.ts:16-36 只钳制视觉百分比，不保证初始 model 合法。

影响：双端 UI 可显示端点，但 confirm 仍提交越界或不在 step 网格上的时间；输入错误被静默篡改，调用方无法区分用户值与修正值。

最佳修复层：Picker 时间领域工具。严格解析 HH:mm[:ss]，非法值显式拒绝/回退；所有同步、reset、precision/step 更新都走同一 clamp-and-snap 函数，最终 payload 再校验一次。

- H5 Peekit：selector .a5b-case--picker-time .lk-calendar-picker__slider 与 .lk-calendar-picker__confirm；动作注入 25:99:99、23:59:59，切换 precision 和 step=15 后确认；非法输入不得被静默确认，合法值必须在范围且对 step 取整；slider thumb rect 落在 track 内，computed left/transform 有限，change/confirm 计数准确且 errors 为 0。
- 微信 MP Peekit：properties/setData 注入同组值，拖动三个 slider 并 tap confirm；读取 events payload 必须与可见文本一致并满足 step，thumb rect 不越界，computed 无 NaN/% 溢出，非法值有明确策略且 errors 为 0。

### A5B-11 · P1 · 草稿事务 / 外部同步

证据：docs/components/calendar-picker.md:43-45 将面板描述为保存后才提交；但 lk-calendar-picker.vue:129-137 的 reset 立即 emit model/update/change。159-165 在面板打开时忽略外部 modelValue 更新，随后 confirm 可用旧草稿覆盖父状态。

影响：H5 与微信小程序都存在“取消前已提交 reset”和“打开期间父级更新被旧草稿反向覆盖”的受控竞态。

最佳修复层：受控事务状态机。draft 与 committed 明确分离；reset 默认只重置 draft，confirm 才提交；外部更新采用明确策略（立即同步、关闭并同步或显式冲突），文档与事件保持一致。

- H5 Peekit：selector .a5b-case--picker-transaction .lk-calendar-picker__reset/.lk-calendar-picker__confirm；动作打开、改草稿、reset、父级外部更新、再 confirm；reset 前后 model/change 必须为 0，外部值在 .a5b-state 与可见日期一致，confirm 恰好一次且不提交旧值；panel rect/computed 状态稳定，errors 为 0。
- 微信 MP Peekit：同一动作通过 tap 与 setData 完成；读取 update:modelValue/change/confirm 日志，顺序和次数与事务合同一致，calendar/slider rect 显示最新值，computed 无闪回，errors 为 0。

### A5B-12 · P2 · 弹层方向与动画

证据：src/uni_modules/lucky-ui/components/lk-calendar-picker/calendar-picker.props.ts:116-121 和 docs/components/calendar-picker.md:201 允许 center/top/bottom/left/right；lk-calendar-picker.vue:185-193 却固定 animation=slide-up。

影响：top/left/right 在 H5 与微信小程序会从错误方向入场，空间方向与动效方向冲突。

最佳修复层：Picker 到 Popup 的适配层。按 position 映射 slide-down/slide-left/slide-right/zoom 等，或不覆盖 Popup 的位置默认动画。

- H5 Peekit：selector .a5b-case--picker-position .lk-calendar-picker__panel；动作依次打开 top/left/right/center；events 每次 open/close 各一次，首帧与终帧 rect 位移方向和 position 一致，computed animation-name/transform-origin 对应方向，errors 为 0。
- 微信 MP Peekit：对每个 position tap trigger 并连续采样 panel rect；位移轴与方向正确，computed animation/transform 不再统一 slide-up，open/close events 无重复，errors 为 0。

## 5. Countdown

### A5B-13 · P1 · 绝对目标语义 / 暂停与重置

证据：src/uni_modules/lucky-ui/components/lk-countdown/lk-countdown.vue:48-54 在 computed baseDuration 内调用非响应式 Date.now；162-170 启动时把绝对 target 转成相对 deadline；180-197 的 reset 复用首次计算值。暂停再继续会把 deadline 向后延，reset 也不会重新按 target-now 计算。

影响：绝对截止时间在 H5 与微信小程序被错误当作可暂停的时长，页面恢复或手工 reset 后会晚于真实目标完成。

最佳修复层：计时状态机。duration 与 absolute target 分成两种明确模式；绝对模式每次 tick/reset/resume 都以 targetEpoch - now 为真值，pause 只能暂停渲染而不能移动目标；时钟可注入以便测试。

- H5 Peekit：selector .a5b-case--countdown-target .lk-countdown__segment--value；动作设定 now+10s 的 target，运行 2s、暂停 3s、恢复、reset；可见剩余值始终等于 target-now 允许一个 tick 误差，finish 恰好一次，segment rect 不抖动，computed transition 无倒退，errors 为 0。
- 微信 MP Peekit：用确定性 clock 驱动同一序列并模拟 hide/show；change payload 单调不增，target 时刻 finish 一次，value rect/文本与 .a5b-state 一致，computed 无负值样式，errors 为 0。

### A5B-14 · P1 · 时间戳单位 / 时区兼容

证据：src/uni_modules/lucky-ui/components/lk-countdown/countdown.utils.ts:25-40 以数值是否小于 1e12 猜测秒/毫秒，并对日期字符串全量替换连字符后交给 Date.parse；这会破坏 ISO 日期及偏移表示，且不同 JS 引擎解析结果不同。docs/components/countdown.md:16-25、53 只写“时间戳或日期字符串”，没有单位和时区合同。

影响：同一 target 在 Chromium H5 和微信 JSCore/V8 环境可能得到不同 epoch 或 Invalid Date，倒计时长度跨端不一致。

最佳修复层：公开 API 与 parser。明确 targetMs/targetSeconds 或只接受毫秒；字符串只接受严格 ISO 8601（含时区）或明确定义的本地格式，禁止改写后再猜测；文档给出时区示例。

- H5 Peekit：selector .a5b-case--countdown-parse .lk-countdown__segment--value；动作依次传 10 位秒、13 位毫秒、2028-02-29T00:00:00+08:00 与 Z 形式；events 的 remaining epoch 与期望完全一致，rect 稳定，computed 无 invalid/hidden，错误输入有明确状态且 console errors 为 0。
- 微信 MP Peekit：在同一固定 now 下 setData 相同输入；文本与 H5 相同，change payload epoch 相同，selector rect 非零，computed 不含 NaN，errors 为 0；禁止用“两个端都能渲染”代替 epoch 对比。

### A5B-15 · P2 · showZero 无效

证据：src/uni_modules/lucky-ui/components/lk-countdown/countdown.props.ts:66-67 和 docs/components/countdown.md:59 暴露 showZero；countdown.utils.ts:84-91 在 false 且完成时仍返回 0；lk-countdown.vue:223-243 始终渲染 segment。tests/unit/lk-countdown.spec.ts:56-61 固化了这一无效结果。

影响：双端调用方无法按文档隐藏归零后的内容，页面会永久留下 00。

最佳修复层：组件渲染合同。定义 showZero=false 是隐藏 body、隐藏零 unit 还是结束后移除，并按该定义条件渲染；修正单测与文档。

- H5 Peekit：selector .a5b-case--countdown-zero .lk-countdown__body/.lk-countdown__segment；动作把剩余推进到 0；finish 恰好一次，showZero=false 时 segment 数量为 0 或 computed display=none（按最终合同），根 rect 不残留意外高度，errors 为 0。
- 微信 MP Peekit：同样推进到完成并查询内部 selector；finish 一次，零 segment 按合同消失，root/body rect 与 H5 约定一致，computed 不保留可见 00，errors 为 0。

### A5B-16 · P1 · 本地化 token 词法冲突

证据：src/uni_modules/lucky-ui/components/lk-countdown/countdown.utils.ts:143-170 用 Object.values().find 按 day/hour/minute/second/ms 顺序匹配单位；英文 minute 的 m 会先吃掉 millisecond 的 ms，剩余 s 再被 second 命中。98-128 的格式替换也会误替普通文本中的 m/s 字母。

影响：英文及其他前缀重叠语言在 H5 与微信小程序会把 ms 拆成两个单位；自定义 format 中的普通文字也可能被改写。

最佳修复层：Countdown formatter/lexer。按最长 token 优先做一次结构化词法分析，支持 literal escaping；渲染直接消费 segments，不再对已生成文本二次猜单位。

- H5 Peekit：selector .a5b-case--countdown-token .lk-countdown__segment--unit；动作切换 en 并使用 ss:SSS 与含普通 m/s 字母的 literal；单位节点必须只有一个 ms 且 literal 原样，change events 数值不受影响，rect 不出现碎片小列，computed 对齐一致，errors 为 0。
- 微信 MP Peekit：切换相同 locale/format；读取全部 unit/text，序列与 H5 完全一致，events payload 相同，rect 列数和宽度稳定，computed 无额外 gap，errors 为 0。

### A5B-17 · P1 · 暗色卡片对比度

证据：src/uni_modules/lucky-ui/components/lk-countdown/lk-countdown.scss:9-12、155-164 让 card 背景使用 --lk-text-primary、文字固定 white；src/uni_modules/lucky-ui/theme/src/tokens/_colors.scss:88-93 的暗色 text-primary 为接近白的 #e1e1e1，component-vars.scss:295-323、426-466 将暗色 token 传播到组件。白字落在浅灰背景上对比度极低。

影响：H5 暗色媒体和微信小程序暗色主题中的核心数字几乎不可读。

最佳修复层：主题语义 token。为 inverse/card 建立成对的 background/foreground token，分别在亮暗主题保证 WCAG 对比度；禁止用“text token 当背景 + 固定白字”。

- H5 Peekit：selector .a5b-case--countdown-dark .lk-countdown__segment--value；动作切换 light/dark；读取 computed color/background-color 并计算对比度，两种主题普通文本均至少 4.5:1，rect 字形未裁切，change events 正常，errors 为 0。
- 微信 MP Peekit：模拟系统暗色并查询 value；computed/最终样式颜色与 H5 token 对应，对比度至少 4.5:1，rect 可读且无溢出，events 不因主题重复，errors 为 0。

## 6. Number Roller

### A5B-18 · P1 · autoplay 受控同步

证据：src/uni_modules/lucky-ui/components/lk-number-roller/lk-number-roller.vue:65-86 只 watch segments；autoplay=false 时值变化直接跳过动画状态更新，之后仅把 autoplay 切回 true 不会触发 watcher，animatedDigitByKey 会无限保留旧数字，直到下一次 value 变化。

影响：H5 与微信小程序的可见数字可与 modelValue 不一致，是受控 prop 组合变化导致的确定性陈旧状态。

最佳修复层：Roller 状态机。watch segments 与 autoplay；关闭动画时同步提交当前 digits，重新开启时以当前渲染状态为基线，并用 generation 防止旧 transition 提交。

- H5 Peekit：selector .a5b-case--roller-autoplay .lk-number-roller__window/.lk-number-roller__digit/.lk-number-roller__track；动作 autoplay=false 时把 123 改 456，再只切 autoplay=true；以每个 digit rect 是否覆盖 window 中心判定的可见数位和 .a5b-state 立即同为 456，event 计数按合同不重复，computed transform 对应 456，errors 为 0。
- 微信 MP Peekit：用 setData 执行相同序列；逐列比较 window 与十个 digit 的 rect，中心可见数位依次为 4、5、6，列数稳定，computed translateY 不保留 123 的位置，events 无额外触发，errors 为 0。

### A5B-19 · P1 · 数值与尺寸上界缺失

证据：src/uni_modules/lucky-ui/components/lk-number-roller/number-roller.props.ts:24-34 对 digitHeight 和 decimals 只有 Number 类型声明，没有有限值、整数、正数或上界 validator；number-roller.utils.ts:91-96 将 decimals 直接传给 toFixed，超过 100 或 Infinity 会抛 RangeError；25-35 也会让负数/非有限 digitHeight 进入动画距离计算。

影响：H5 与微信小程序都可被公开 props 直接触发运行异常、NaN transform 或不可见数字。

最佳修复层：prop validator 与 formatter 边界。decimals 必须为有限整数且在明确上限内；digitHeight、speed 等必须有限且为正；运行函数自身仍需防御性 canonicalize。

- H5 Peekit：selector .a5b-case--roller-invalid .lk-number-roller；动作传 decimals=101、Infinity、digitHeight=-1/NaN；组件采用文档化 fallback 或拒绝渲染，events 不产生伪完成，root/digit rect 为有限非负值，computed transform/height 无 NaN，console 与 .a5b-errors 无 RangeError。
- 微信 MP Peekit：properties/setData 注入同组边界；组件仍可查询，rect 有限，computed/内联 style 无 NaN/Infinity，事件计数符合 fallback 策略，errors 为 0。

### A5B-20 · P2 · 数位 identity 错位

证据：src/uni_modules/lucky-ui/components/lk-number-roller/number-roller.utils.ts:124-131 从左到右以位置生成 key；插入分组符、符号或位数增长时旧列被错误复用。tests/unit/lk-number-roller.spec.ts:58-68 还把这种左对齐 key 固化为期望。999 到 1,000 时可能把原有百十个位映射到错误列，产生错误中间帧。

影响：H5 与微信小程序在金额跨千位、正负号切换和整数位增长时出现错误滚动方向或短暂错误数字。

最佳修复层：segment identity。数字从小数点向左右按 place value 建稳定 key，符号与分组符独立；长度变化先 reconcile 再启动动画。

- H5 Peekit：selector .a5b-case--roller-place .lk-number-roller__digit/.lk-number-roller__symbol；动作 999→1,000→-1,000；每一动画帧的列 identity 与个位/十位/百位绑定，最终文本准确，events 次数准确，rect 列顺序不跳位，computed transform 方向符合数值变化，errors 为 0。
- 微信 MP Peekit：setData 执行同样序列并连续采样各 track；不得出现 9,900 等错误中间映射，最终文本相同，rect/symbol 顺序稳定，computed translateY 有限，errors 为 0。

### A5B-21 · P2 · 公共 id 合同被丢弃

证据：src/uni_modules/lucky-ui/components/common/props/index.ts:5-12 明确把 id 定义为测试和定位入口；lk-number-roller.vue:89-106、lk-timeline.vue:30-33、lk-timeline-item.vue:146-205 的根节点都没有 :id="id"。调用方传 id 后 DOM/小程序节点仍不可定位。

影响：双端可访问性关联、自动化 selector 和业务定位不可靠，正好削弱本批次要求的客观运行验收。

最佳修复层：组件根节点 attribute forwarding。所有消费 baseProps 的组件统一绑定 id；建立共享 contract test，避免逐组件遗漏。

- H5 Peekit：分别传 id=a5b-roller-root、a5b-timeline-root、a5b-timeline-item；selector #a5b-roller-root/#a5b-timeline-root/#a5b-timeline-item 各命中且唯一，rect 等于对应根节点，computed display 正常，交互 events 不变，errors 为 0。
- 微信 MP Peekit：page.$ 使用相同三个 #id 必须直接定位对应组件根或文档约定节点，各 rect 唯一且非零，computed 可读，事件仍由原组件发出且无重复，errors 为 0。

## 7. Timeline、Watermark 与验证真实性

### A5B-22 · P1 · 最后一项尾线无法自动隐藏

证据：src/uni_modules/lucky-ui/components/lk-timeline/timeline-item.props.ts:93-96 注释称 last 可自动判断；timeline.utils.ts:84-87 和 lk-timeline-item.vue:117-122、175-176 实际只看显式 last/showLine。lk-timeline.scss:34-53 的 :last-child 只移除 padding，没有隐藏 line。

影响：默认用法在 H5 与微信小程序的最后一项之后继续显示尾线，垂直/水平布局都可能越过内容。

最佳修复层：Timeline 结构层。优先用跨端可用的 last-child 规则隐藏 line；若 slot/条件节点使其不可靠，则由父级注册 item 并提供 index/last，不再宣称不存在的自动逻辑。

- H5 Peekit：selector .a5b-case--timeline-last .lk-timeline-item:last-child .lk-timeline-item__line；动作增删 timeline item；最后一项 line 应不存在或 computed display=none，前一项 line rect 正确连接两 dot，click events 只来自 item，errors 为 0。
- 微信 MP Peekit：动态 setData 改变 item 数量；最后一项内部 line 同样不可见，前项 rect 连接到下一 dot，computed display/opacity 与 H5 合同一致，tap events 无串扰，errors 为 0。

### A5B-23 · P1 · 全局 keyframes 重名

证据：src/uni_modules/lucky-ui/components/lk-timeline/lk-timeline.scss:195-205 统一引用 animation 名 lk-line-flow；280-298 又以同名先定义纵向、再在 horizontal 选择器内定义横向 keyframes。Sass 产出的 keyframes 名仍是全局名字，后定义会覆盖前定义，纵向虚线可能使用横向位移。

影响：H5 与编译后的微信 WXSS 都可能让 vertical animated line 横向抖动，而不是沿时间轴流动。

最佳修复层：Timeline SCSS。拆成 lk-line-flow-v 与 lk-line-flow-h，并让 orientation modifier 显式引用；动画距离使用对应 line token。

- H5 Peekit：selector .a5b-case--timeline-v .lk-timeline-item__line 与 .a5b-case--timeline-h 同类；动作开启 dashed+animated；computed animation-name 分别为独立 v/h 名称，连续 rect/transform 仅沿 y/x 轴变化，events 不受动画影响，errors 为 0。
- 微信 MP Peekit：在两种 orientation 中查询 line 并连续采样；computed animation-name 不同，纵向 x rect 不漂移、横向 y rect 不漂移，tap events 正常，errors 为 0。

### A5B-24 · P2 · active halo 被裁切且描边取错表面

证据：src/uni_modules/lucky-ui/components/lk-timeline/lk-timeline.scss:300-315 给 dot 设置 overflow:hidden；330-341 的 active halo 却向 dot 外扩，必然被裁切。321-324 又用 page background 作为 outline，嵌入 card 或暗色 surface 时会形成错误色块。

影响：H5 与微信小程序 active 节点的光环不可见或残缺，在非页面背景容器中出现不协调的边缘。

最佳修复层：Timeline dot 结构与 token。由外层 dot wrapper 承载 halo 并允许 overflow:visible，内层裁切内容；outline 取当前 surface/inverse token，而不是固定 page background。

- H5 Peekit：selector .a5b-case--timeline-halo .lk-timeline-item__dot 及修复后的 .lk-timeline-item__dot-halo；动作切换 active 和 dark/card surface；halo rect 必须大于 dot 且不被祖先裁切，computed overflow/outline/background 与当前 surface 匹配，events 一次，errors 为 0。
- 微信 MP Peekit：同样切换 active/theme；读取 dot 与 halo rect，halo 四边均外扩且可见，computed overflow、border/outline 使用目标 token，tap events 不重复，errors 为 0。

### A5B-25 · P1 · 水平滚动不是微信小程序可移植结构

证据：src/uni_modules/lucky-ui/components/lk-timeline/lk-timeline.vue:30-33 始终渲染 view；lk-timeline.scss:15-25 仅依赖 overflow-x:auto 实现水平滚动。微信小程序可靠横向滚动应使用 scroll-view scroll-x；tests/miniprogram/timeline.spec.js:24-60 没有构造溢出或执行滚动。

影响：H5 可滚动并不能证明微信真机可滚；长 timeline 在 MP 可能被截断且无法到达后续 item。

最佳修复层：跨端模板。horizontal 使用 scroll-view scroll-x（或经过真机证明的等价封装），vertical 保持普通 view；公开 scroll 事件/位置合同并加入长列表真机用例。

- H5 Peekit：selector .a5b-case--timeline-scroll .lk-timeline；动作横向拖动到末尾；scrollWidth 大于 clientWidth，scrollLeft 明显增加，末项 rect 进入 viewport，computed overflow/white-space 正确，scroll/item events 无误，errors 为 0。
- 微信 MP Peekit：定位 horizontal scroll-view，执行 swipe/scrollTo；读取 scrollLeft > 0 和末项 rect 进入容器，computed/属性确认 scroll-x=true，scroll event 至少一次且 item tap 不误触，errors 为 0。

### A5B-26 · P2 · 发布样式混入演练场命名空间

证据：src/uni_modules/lucky-ui/components/lk-timeline/lk-timeline.scss:431-493 定义 timeline-demo-card、timeline-demo-* 等演练专用类；src/components/demos/timeline-demo.vue:18-49 正在使用这些类。演练样式由发布组件 SCSS 承担，造成包体冗余与全局类碰撞。

影响：H5 与微信小程序消费者会携带无关演练样式；业务若恰好使用同名类，会被组件包意外改色或改布局。

最佳修复层：源码边界。把全部 demo class 移入 timeline-demo.vue 的 scoped style，发布 SCSS 只保留 lk-timeline BEM 类；用 style ownership test 防止回流。

- H5 Peekit：selector .a5b-case--timeline-css-isolation .timeline-demo-card 与正式 demo 的同类；动作加载组件包但不加载 demo，再加载正式 demo；外部同名节点 computed background/padding 不得被改变，正式 demo rect/computed 保持设计值，组件 events 正常，errors 为 0。
- 微信 MP Peekit：在仅引入组件的页面放同名业务 class；其 rect/computed 不受 Timeline 影响；进入 demo 页后 demo class 样式仍存在且布局正确，tap events 正常，errors 为 0。

### A5B-27 · P1 · Watermark 行列无上限

证据：src/uni_modules/lucky-ui/components/lk-watermark/watermark.props.ts:59-63 对 rows/columns 只有 Number 类型声明，没有有限值、整数、非负或上界 validator；watermark.utils.ts:38-43 直接计算乘积并 Array.from。Infinity、超大值和小数会抛错、耗尽内存或形成不一致数量；tests/unit/lk-watermark.spec.ts:44-48 仅覆盖 0 和负数。

影响：公开 props 可同时让 H5 与微信小程序冻结或崩溃。

最佳修复层：Watermark 输入规范化。rows/columns 必须为有限整数，总单元数有明确上限；超限采用警告+钳制或拒绝，并让 utils 自身防御。

- H5 Peekit：selector .a5b-case--watermark-bounds .lk-watermark__item；动作传 Infinity、1.5、100000×100000；item 数量不超过文档上限，events 为 0，layer/root rect 有限，computed grid-template 无 NaN，console 与 .a5b-errors 无 RangeError/OOM。
- 微信 MP Peekit：setData 注入同组值；自动化连接保持可响应，item 数量受限，rect 可查询、computed/内联 grid 值有限，events 为 0、errors 为 0。

### A5B-28 · P1 · fullPage 层级与 containing block

证据：src/uni_modules/lucky-ui/components/lk-watermark/watermark.utils.ts:69-82 把 zIndex 放在内部 layer；lk-watermark.scss:13-22 的 full-page root 自身 position:fixed 却没有 z-index。fixed root 会建立自己的层叠上下文，子层 z-index 无法让根节点越过兄弟层；H5 中 transformed/clipped ancestor 还会限制所谓 fullPage。

影响：双端全屏水印可能被 sibling 覆盖；H5 放在 transform/overflow 容器内时还会只覆盖局部区域。

最佳修复层：Watermark 宿主结构。z-index 绑定到 full-page root；H5 提供顶层 teleport/portal 或明确要求根级挂载，MP 使用页面根级宿主；layer 只负责内部排列。

- H5 Peekit：selector .a5b-case--watermark-stack .lk-watermark--full-page 与 .lk-watermark__layer；动作把组件置于 transformed+overflow hidden 容器并与不同 z-index sibling 叠放；root rect 必须覆盖 viewport，computed position=fixed 且 root z-index 命中 prop，layer 不受祖先裁切，events 为 0、errors 为 0。
- 微信 MP Peekit：在页面根级与普通容器各放场景并切换 zIndex；full-page root rect 覆盖 page viewport，computed/最终 style 的 z-index 位于 root，和 sibling 的层叠次序符合数值，events 为 0、errors 为 0。

### A5B-29 · P2 · 局部无 slot 时零高度

证据：src/uni_modules/lucky-ui/components/lk-watermark/lk-watermark.scss:8-11 的局部 root 只有 min-height:inherit；24-37 的 layer 为 absolute，不参与高度。docs/components/watermark.md:26-30 的多行示例既非 fullPage 又没有 slot/尺寸，因此父级无确定高度时整个示例为零高不可见。

影响：文档推荐用法在 H5 与微信小程序都可能什么也不显示，调用方容易误判组件坏掉。

最佳修复层：布局合同与文档。要么提供明确 intrinsic minHeight/height prop，要么要求 slot/有高度容器并在开发态警告零高；修正文档示例。

- H5 Peekit：selector .a5b-case--watermark-local .lk-watermark/.lk-watermark__layer；动作分别无 slot、有 slot、显式高度；无 slot 场景按新合同有可见高度或明确警告，root/layer rect 一致，computed min-height/position 可解释，events 为 0、errors 无异常。
- 微信 MP Peekit：同三种场景查询 root/layer；rect 不再静默为 0×0，computed 高度符合文档，item 可见，events 为 0，errors 仅允许约定开发警告。

### A5B-30 · P2 · 重复文本形成重复 key

证据：src/uni_modules/lucky-ui/components/lk-watermark/lk-watermark.vue:71-73 以 line 文本自身作为 v-for key；lines 是公开数组且允许重复，同文案会生成重复 key，更新顺序时可能复用错误节点。

影响：H5 Vue 与微信小程序编译产物在重复行增删/重排时可能丢行、错序或产生 key 警告。

最佳修复层：Watermark template identity。使用稳定的 index+content 或规范化后的行 id；若顺序可编辑，优先显式结构化 id。

- H5 Peekit：selector .a5b-case--watermark-duplicate .lk-watermark__text；动作 lines 从 [机密,机密] 改为 [机密,内部,机密] 再重排；文本顺序和数量完全一致，events 为 0，rect 各行不重叠，computed typography 相同，console 无 duplicate key/error。
- 微信 MP Peekit：setData 执行同样序列；查询全部 text 得到准确顺序/数量，rect/rotation 保持对应，computed style 未串位，events 为 0、errors 为 0。

### A5B-31 · P1 · 文档、演练场和测试制造错误安全感

证据：

- 六个 unit spec 都只直接测试 utils/props，没有 mount Vue 组件、fake timer、touch、受控同步、暗色 computed style 或真实事件链：tests/unit/lk-calendar.spec.ts、lk-calendar-picker.spec.ts、lk-countdown.spec.ts、lk-number-roller.spec.ts、lk-timeline.spec.ts、lk-watermark.spec.ts。
- tests/visual/screenshot.spec.ts:4-19 只生成截图；tests/visual/dynamic-visual-showcase.spec.ts:8-28 只检查 showcase 文本，而且 17-28 期待“全平台已验证/平台差异提示”等字样，与 src/components/showcase/component-case.vue:17-45 当前渲染合同不一致。测试既不操作组件，也不证明目标行为。
- tests/miniprogram/timeline.spec.js:24-60 把 Timeline 与 Item 分开浅渲染，只检查存在和 tap；没有父子注入、last、横向溢出、keyframes、暗色或 geometry。其他五个组件没有直接微信小程序运行用例。
- src/components/showcase/showcase-cases.ts:143-149、494-536、647-653 把六个组件都标成 verified，其中 Calendar、Calendar Picker、Number Roller 还标成 low risk；这些元数据不是证据。
- docs/components/timeline.md:103-113 没有覆盖 timeline.props.ts:38-79 已公开的 total、lineVariant、lineMode、lineAnimated；仅 Number Roller 在 src/pages_sub/playground/index.vue:235-238 有 playground 项，其余组件缺少可调演练页。

影响：H5 截图或元数据可能显示“通过”，同时本报告的计时、事件、MP 滚动和暗色问题完全未被执行；发布门禁会掩盖真实风险。

最佳修复层：验证基础设施与文档。为 31 个场景建立确定性 probe；H5 用 Peekit 采集 DOM/events/rect/computed/errors，微信必须打开本工作树真实 dist 并采集相同证据；视觉 baseline 只负责像素回归，不负责行为。文档 API 从 props 自动或半自动校验，showcase 状态由证据清单生成。

- H5 Peekit：selector .a5b-runtime-probe [data-case]、每项前文组件 selector、.a5b-events/.a5b-state/.a5b-errors；逐项执行动作，保存事件序列、rect、computed 和 console errors JSON；31 项全部通过前 verified 必须为 false/待验证，截图差异为 0 也不得改变此状态。
- 微信 MP Peekit：打开精确 worktree 的 dist/dev/mp-weixin，selector .a5b-runtime-probe 及组件内部 selector；逐项记录 properties、events、rect、computed/最终 style、page errors；至少六个组件都有直接 MP case，31 项证据与 H5 对表后才允许 verified=true。

## 8. 文件、物理行与 SHA-256 总账

统计方法：每个文件完整读取到 EOF；物理行使用 System.IO.File.ReadAllLines(path).Length；哈希为基线文件字节的 SHA-256。表中没有重复路径。

| 文件 | 物理行 | SHA-256 |
| --- | ---: | --- |
| docs/.vitepress/theme/components/PropsPlayground.vue | 674 | f9f2c7bdd94218a436c09d6bc9480dcda4e1e55d6021809b0ded83c12396addb |
| docs/components/calendar.md | 222 | 7d02c23af4aa6008ec2748712fe319568e9ea5179046e04733d4573ca1be028d |
| docs/components/calendar-picker.md | 235 | a26cb337f723a3acccf5dcc8ffcd3ef0949c1ef94bfe4c59748da5fae00ede7f |
| docs/components/countdown.md | 94 | 4dc0c9de09561b3e22a7b4bf4c3c0f1e78f680a7a1a498435b976cc92d0bd70f |
| docs/components/number-roller.md | 133 | e5b1db38149d778a05404f88559a5406c79f930b19a2a0f862b8f625af80e186 |
| docs/components/timeline.md | 146 | a754dbdb99509683a8c690f8019e2e8f8870b4c140f86c32e45ae9cf2045c3ca |
| docs/components/watermark.md | 72 | b9ad456eddcc3e88121612457cb834a46f36a6b2f0a1ff4d6bd807800a21ce68 |
| src/components/demos/calendar-demo.vue | 81 | 4218ecf781acda4686377dd3a3e73e253453bd1d94aa15edf84106280d039d0f |
| src/components/demos/calendar-picker-demo.vue | 56 | 6f4188ac26e8e4e23c6f913a153e03d366afd7ba170b0c57fa5a024ba0340ef4 |
| src/components/demos/countdown-demo.vue | 255 | 216ceae7410dc3c1eaaf6ba1f0b1cfdc3e3b22c644df82af3d835878126f847c |
| src/components/demos/number-roller-demo.vue | 157 | ddf683935b6da3b1b02d2ab9f677dc14c67d2fe8dde3ad8f98ee4c6e6fed83a1 |
| src/components/demos/timeline-demo.vue | 265 | 19221d16d2ff18b3d506596932edf6c3836fb0609c51cd8b9bc7b98edb228426 |
| src/components/demos/watermark-demo.vue | 215 | 05fe9ca5bbcb40a3ea1d95516a7ebb1e2247a654d694dcb241c4bc634ad3810d |
| src/components/preview/preview-catalog.ts | 684 | 967afcad48654589aeae4de9e49f80bb2c912e3d4fed8b70a39c40d03f28ed52 |
| src/components/preview/preview-demo-registry.ts | 85 | 2a7b9ca6a53344c4b5b6d5723886ca0e197479c2ba9c51beeab4371939f45a5d |
| src/components/preview/PreviewDemoRenderer.vue | 167 | 384ebd26037ad17260d3e1e9075e848ba51fefed6e76a76ebe5fc028f36da297 |
| src/components/showcase/component-case.vue | 182 | 058fedfe129ccf84158163128b94923ace9ed82bfa3d100ff7d3abc4d87b6cad |
| src/components/showcase/showcase-cases.ts | 664 | ab131d0afac2823dae26d1ce783136c16417c0aaa34e5abe8dfec6bef6dc032f |
| src/pages_sub/component-detail/index.vue | 273 | 2d585a5bdb2207fd56ad1bbb3d1d5987c2d1e47bf2d0fc592930707272f5cf0f |
| src/pages_sub/i18n-preview/index.vue | 257 | 5c51d7e11b1d2dd936236151a5916897089f07d179b8e34fa4754d83aed70ef6 |
| src/pages_sub/playground/index.vue | 303 | 7827193da2343621e7fb21e7cd586390e115a44ea16383163d583a303ab90389 |
| src/pages_sub/showcase/index.vue | 301 | 9650fdb2050e05c413450ae2797be358b968520881ce4287365d672d76db8380 |
| src/uni_modules/lucky-ui/components/common/props/index.ts | 195 | 42959195090c409562b91481b05d13af3ebcc511b21590b495ec1da7bb04bd4b |
| src/uni_modules/lucky-ui/components/lk-calendar/calendar.props.ts | 131 | 72563f47fcaf03a632ca1ed1ab590b00f192af0f8468c48d9ca2a5602acef61e |
| src/uni_modules/lucky-ui/components/lk-calendar/calendar.utils.ts | 414 | 9ed11fb4b8320897b20253bb5b1326c92ecff226a3d511c671798f5f1c853a0b |
| src/uni_modules/lucky-ui/components/lk-calendar/lk-calendar.scss | 423 | 5d7f02a10b005d57c25c3a8d5355f30f38cc914630cf6c19928831f9b951e6c4 |
| src/uni_modules/lucky-ui/components/lk-calendar/lk-calendar.vue | 507 | 99c5402ea0c3c7d583edf5a8c3aac3c4ee9cf4b5d65af5e3786fc4205493d5bb |
| src/uni_modules/lucky-ui/components/lk-calendar-picker/calendar-picker.props.ts | 150 | 618a336967e6ebbc9aad034d1ea12f56234901e804a11b79a23d5ec0c38ad626 |
| src/uni_modules/lucky-ui/components/lk-calendar-picker/calendar-picker.utils.ts | 145 | 22a5e8c71507ac906eb50065e28f5cc4fdbcfd53caa32a2e93655b11d4a683ea |
| src/uni_modules/lucky-ui/components/lk-calendar-picker/lk-calendar-picker.scss | 129 | c0305e133b93db801a8791325d9148ce439209ecd13660a01aa1a2d9220d12e3 |
| src/uni_modules/lucky-ui/components/lk-calendar-picker/lk-calendar-picker.vue | 279 | 714c196509747a33e68b30b8d04248c76489aaaca017e68c72afda738fd99326 |
| src/uni_modules/lucky-ui/components/lk-countdown/countdown.props.ts | 111 | f14e746e629a4f4bbaa517c91f410d2df9b2f2d059088ca625a5fe458d450d80 |
| src/uni_modules/lucky-ui/components/lk-countdown/countdown.utils.ts | 212 | 57f3e24908dcf44f0c86975b997e499ec6dda792a4d8a97d500fa13fb58b4ccf |
| src/uni_modules/lucky-ui/components/lk-countdown/lk-countdown.scss | 188 | 8f4598802c2ac1dda5ccd236ecf0ee1af7628067621cc8fa253676e1ae9a9bb2 |
| src/uni_modules/lucky-ui/components/lk-countdown/lk-countdown.vue | 248 | ab76c34e4ad9b6ed863728152de0c8ca6172f8f288c36fe4b56d76ed256893f1 |
| src/uni_modules/lucky-ui/components/lk-number-roller/lk-number-roller.scss | 66 | f9ba95ad346f4b581400971da16959005b3d480aae1be33be0617bd1800579f2 |
| src/uni_modules/lucky-ui/components/lk-number-roller/lk-number-roller.vue | 111 | 234149d7bab2f753384faac14c5de49e0b5693d7aca74b1dc81c254f170b57c9 |
| src/uni_modules/lucky-ui/components/lk-number-roller/number-roller.props.ts | 55 | 39d0d46b60c60333a82d5727cd354801302fed1d8e3629d5741c1945ca77956d |
| src/uni_modules/lucky-ui/components/lk-number-roller/number-roller.utils.ts | 176 | 513594695a22cf0d83f0a28ace3b70b107c0d488d22e09b3305f0e0c244f2a23 |
| src/uni_modules/lucky-ui/components/lk-slider/lk-slider.scss | 134 | 1aaa02fc160c2cb05163675a5fd216c3df9f4c128b5bca87dcad11ae0d10f1ef |
| src/uni_modules/lucky-ui/components/lk-slider/lk-slider.vue | 285 | 36bea590a4a84bb20af52387b6bfdebfd79aa4e624c0a78222cd4d6b1e22e2a0 |
| src/uni_modules/lucky-ui/components/lk-slider/slider.props.ts | 79 | 97c4603b83fe32a74d58011ffb44d67dfba4b51c97e9721774095c28bfe12178 |
| src/uni_modules/lucky-ui/components/lk-slider/slider.utils.ts | 269 | 41cb0552499d1c7049f24f4b714c09dd5f942d97733b5a51632a6e7fdca16322 |
| src/uni_modules/lucky-ui/components/lk-timeline/lk-timeline.scss | 493 | 29ba234e8ee44fb05b38cfc11269b3610ad6b7d46a4fa9bd3eeda4be5550c18d |
| src/uni_modules/lucky-ui/components/lk-timeline/lk-timeline.vue | 38 | 5e17288117666d032a3497b002ae21217cda509088572b9755892fb640555b6f |
| src/uni_modules/lucky-ui/components/lk-timeline/lk-timeline-item.vue | 210 | e85ec4669635d01aacb9e5642c30b57865a77f69b31015b4848f65c61a4c98d5 |
| src/uni_modules/lucky-ui/components/lk-timeline/timeline-item.props.ts | 103 | b2478f869e68b63af6edb7393cc672bb8b57707d9ce0cb3f09281e2971717d63 |
| src/uni_modules/lucky-ui/components/lk-timeline/timeline.props.ts | 82 | 6fd44e295fa99a49b017f3d68de0aabd8355614bc86cc44e392573479cf4b016 |
| src/uni_modules/lucky-ui/components/lk-timeline/timeline.utils.ts | 148 | 7978c04f2ea6e2af2caf7a86b60b39df53dfb108083bbe996be38830f7d6799c |
| src/uni_modules/lucky-ui/components/lk-watermark/lk-watermark.scss | 69 | 1d5f68f3d9484af2c05fa297ac0979233208f8c544a8bbcb405294a1172c798c |
| src/uni_modules/lucky-ui/components/lk-watermark/lk-watermark.vue | 81 | 87fc6fbee8ee599e4f9fa0ac64e137654e9c552b98fd5ebe55b3b356f4c89474 |
| src/uni_modules/lucky-ui/components/lk-watermark/watermark.props.ts | 87 | 5fd6658d88f826d0db95648017a3d84c35b757dc661fc8c88735557a6a80c2f2 |
| src/uni_modules/lucky-ui/components/lk-watermark/watermark.utils.ts | 99 | a29b0efdb4325d268c75d7590c6015896c246a33bdf4400cf015906516c304e9 |
| src/uni_modules/lucky-ui/composables/useLocale.ts | 26 | 643152c4e2582a10bb35f4e5acd1bed60d3fedd71e696e9da327a982374699e1 |
| src/uni_modules/lucky-ui/core/src/utils/unit.ts | 11 | 8e551db4748a516e2ae1ac474ee409c28f4a90d92efc36e352e1b2f1d2512de9 |
| src/uni_modules/lucky-ui/locale/index.ts | 116 | ed6de82735dca6f9863a0a7caeb42dce2c7a738271559f2fca0fca6a2e3d431a |
| src/uni_modules/lucky-ui/locale/lang/en.ts | 174 | c51436d72c33f47bd46b5b89a60c5bf6d745ce620d9eaf8361783b3e03b9fd3a |
| src/uni_modules/lucky-ui/locale/lang/es.ts | 139 | b1465361c5e163001b3401f7de35dbe80d0c55d9af3ec26893b098b0101b7e03 |
| src/uni_modules/lucky-ui/locale/lang/fr.ts | 156 | 645283bdc1e41d6ea2654f3d16d19b3087502bbb505ab64ddf9717cb09ac6ac7 |
| src/uni_modules/lucky-ui/locale/lang/ja.ts | 155 | 5350e7769a50c8b1bd84ca4a44d41aefa53ad59306d164b4406d4bb16b4e76e8 |
| src/uni_modules/lucky-ui/locale/lang/ko.ts | 152 | c75ae800fb6a9fe9905e61530bd23834a6b030e6f01870f0465fbd214bf68ac2 |
| src/uni_modules/lucky-ui/locale/lang/pt-BR.ts | 143 | f86baecd60658adcdaf68381ac057fcfe16081e734de32b91defeac00aa752c6 |
| src/uni_modules/lucky-ui/locale/lang/zh-Hans.ts | 187 | 5b56403cc172ead3c6bd6f79f33240106b47a3184140e94598bfb0d358d874e2 |
| src/uni_modules/lucky-ui/locale/lang/zh-Hant.ts | 152 | 7d926c0107fe8854060bb59efab4a1d64406d50b854305150625c7381bd3b24d |
| src/uni_modules/lucky-ui/theme/src/component-vars.scss | 551 | f6e2ac26d16dd584457f221ea0c43d6563a4fdd4613254c41696c300f5f4d410 |
| src/uni_modules/lucky-ui/theme/src/tokens/_colors.scss | 125 | db76f679ff907438ccf903dad92951078b59b8a337393e001f9877bc73bd1545 |
| tests/miniprogram/run-miniprogram-tests.js | 20 | 8e42f5ef5c835f97a7a6fddbbec6cc2619f01e2e316ce1798daf8052fdd593d6 |
| tests/miniprogram/setup-miniprogram-env.js | 58 | 112f218c610ad87340e0551069d54efbb2c0292530b46394578d17a68e374a59 |
| tests/miniprogram/timeline.spec.js | 65 | 141459f94c8adc5d8c22a8afd76d6172c71c96faf7dba0169f4f885fe6ca8e09 |
| tests/unit/lk-calendar-picker.spec.ts | 122 | eac637f159d415231bf49859dbaa42276a54c6b4c7a167cbf79005860e19036c |
| tests/unit/lk-calendar.spec.ts | 257 | ecfb66b1701b3dcef81960c7f3798aaeefab61cb721b8a764a141bb887fc994c |
| tests/unit/lk-countdown.spec.ts | 156 | 0d20abe824a329d6f42233bbc3f213314871a171e751775d887ecc206017e1fe |
| tests/unit/lk-number-roller.spec.ts | 136 | 8a6e2081553411bd955f99b213bd32981088389b595b65215355c6481448bcbe |
| tests/unit/lk-timeline.spec.ts | 117 | 4aa21d4449097e412521a56720b4ec9ebfb8698c67e5d2185ccff01bb2e4f6a6 |
| tests/unit/lk-watermark.spec.ts | 101 | 8045bc6a4a41c75d9c0304920c43e68b495ebb740c4ab637fb58dea8302d0277 |
| tests/visual/dynamic-visual-showcase.spec.ts | 29 | 8c3a9a3e22692c5cf2c7440f4c2922d625cb2de5029bfb1e220d485df8909904 |
| tests/visual/high-risk-showcase.spec.ts | 104 | 9a2d7f7d8ab9fa5cd9c8b125cf7b16bb446fb58ae63fe51954fcceb5183d9e7b |
| tests/visual/needs-hardening-showcase.spec.ts | 88 | 776d128290c080b7f0f0352e30b419c7eecefd50c4e50ae65302aedec25a651a |
| tests/visual/screenshot.spec.ts | 20 | e60e1a1f4bcfae013a7cf1c3bd776f3c73a5edd167df542d183e31024bb3e396 |

**总计：79 个唯一文件，14,598 个物理行；未读文件 0，未读物理行 0。**

## 9. 合理特例与不应误报

- Countdown 的运行 tick 以 deadline 减 Date.now 校正，而不是简单每次减 interval；lk-countdown.vue:129-159 的基本漂移校正方向正确，125-127、208-212 也清理主 interval。A5B-13 针对的是 absolute target 被转换成可暂停 duration 和 reset 缓存，不应泛化成“所有 timer 都漂移/都未清理”。
- Number Roller 演练页的随机 interval 在 src/components/demos/number-roller-demo.vue:25-37 有 onUnmounted 清理，不报 demo 泄漏。
- Watermark 当前是 DOM/CSS 实现，不使用 canvas；因此 canvas DPR、跨域图片污染和 canvas 导出限制在本实现不适用。lk-watermark.vue 使用文本插值，没有 v-html，普通文本会转义；文档关于“水印不是安全防护”的说明也是合理的。
- Calendar 采用横向 swipe 切月是移动优先的产品选择；本批次不因缺少桌面箭头导航单独报错。真正问题是今天边界、延时任务、日期合同、复杂度、尺寸和触摸热区。
- 构建产物中的重复 keyframes、样式或节点只能作为定位线索，修复应落在本总账列出的源文件；不得直接改 dist。
- 视觉截图适合发现像素变化，但不能证明 timer、事件次数、受控同步、卸载清理、滚动可达性或微信组件样式隔离。只有第 3 至第 7 节列出的双端运行证据才构成验收。
