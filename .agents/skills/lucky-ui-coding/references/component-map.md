# Lucky UI 组件业务映射

路径均相对于仓库根目录。每行组件源码与文档一一对应；先读文档，API 不清楚时再读源码。

## 基础、布局与导航

| 业务关键词 | 组件 | 文档 | 源码 |
|---|---|---|---|
| 用户头像、成员、个人资料 | `lk-avatar` | `docs/components/avatar.md` | `src/uni_modules/lucky-ui/components/lk-avatar/` |
| 未读数、消息数量、角标、提醒 | `lk-badge` | `docs/components/badge.md` | `src/uni_modules/lucky-ui/components/lk-badge/` |
| 提交、确认、主操作、CTA | `lk-button` | `docs/components/button.md` | `src/uni_modules/lucky-ui/components/lk-button/` |
| 状态、分类、筛选标签 | `lk-tag` | `docs/components/tag.md` | `src/uni_modules/lucky-ui/components/lk-tag/` |
| 图标、状态标识、操作图形 | `lk-icon` | `docs/components/icon.md` | `src/uni_modules/lucky-ui/components/lk-icon/` |
| 分区、内容分隔、标题分割 | `lk-divider` | `docs/components/divider.md` | `src/uni_modules/lucky-ui/components/lk-divider/` |
| 设置项、菜单项、详情行、列表项 | `lk-cell` | `docs/components/cell.md` | `src/uni_modules/lucky-ui/components/lk-cell/` |
| 页面容器、安全区、页面背景 | `lk-page` | `docs/components/page.md` | `src/uni_modules/lucky-ui/components/lk-page/` |
| 应用根节点、主题上下文、全局配置 | `lk-root` | `docs/components/root.md` | `src/uni_modules/lucky-ui/components/lk-root/` |
| 功能入口、分类入口、九宫格 | `lk-grid` | `docs/components/grid.md` | `src/uni_modules/lucky-ui/components/lk-grid/` |
| 间距、按钮组、行列排布 | `lk-space` | `docs/components/space.md` | `src/uni_modules/lucky-ui/components/lk-space/` |
| 标题副标题、作者时间、元信息 | `lk-meta-row` | `docs/components/meta-row.md` | `src/uni_modules/lucky-ui/components/lk-meta-row/` |
| 快捷选项、套餐选择、规格选择 | `lk-choice` | `docs/components/choice.md` | `src/uni_modules/lucky-ui/components/lk-choice/` |
| 顶栏、返回、页面标题、右侧操作 | `lk-navbar` | `docs/components/navbar.md` | `src/uni_modules/lucky-ui/components/lk-navbar/` |
| 分类切换、内容标签页、顶部标签 | `lk-tab` | `docs/components/tab.md` | `src/uni_modules/lucky-ui/components/lk-tab/` |
| 主导航、底部标签、应用分区 | `lk-tabbar` | `docs/components/tabbar.md` | `src/uni_modules/lucky-ui/components/lk-tabbar/` |
| 底部导航页面承载、Tab 内容布局 | `lk-tabbar-container` | `docs/components/tabbar-container.md` | `src/uni_modules/lucky-ui/components/lk-tabbar-container/` |
| 视图切换、状态分段、列表模式切换 | `lk-segmented` | `docs/components/segmented.md` | `src/uni_modules/lucky-ui/components/lk-segmented/` |
| 长页目录、楼层导航、章节定位 | `lk-anchor` | `docs/components/anchor.md` | `src/uni_modules/lucky-ui/components/lk-anchor/` |
| 吸顶标题、吸顶筛选栏 | `lk-sticky` | `docs/components/sticky.md` | `src/uni_modules/lucky-ui/components/lk-sticky/` |
| 长列表、返回顶部 | `lk-backtop` | `docs/components/backtop.md` | `src/uni_modules/lucky-ui/components/lk-backtop/` |
| 横向商品、横向卡片、标签带 | `lk-horizontal-scroll` | `docs/components/horizontal-scroll.md` | `src/uni_modules/lucky-ui/components/lk-horizontal-scroll/` |

## 表单与选择

| 业务关键词 | 组件 | 文档 | 源码 |
|---|---|---|---|
| 表单提交、校验、错误提示 | `lk-form` | `docs/components/form.md` | `src/uni_modules/lucky-ui/components/lk-form/` |
| 资料分区、分组表单、设置分组 | `lk-form-group` | `docs/components/form-group.md` | `src/uni_modules/lucky-ui/components/lk-form-group/` |
| 搜索、账号、手机号、文本输入 | `lk-input` | `docs/components/input.md` | `src/uni_modules/lucky-ui/components/lk-input/` |
| 评价、备注、留言、长文本 | `lk-textarea` | `docs/components/textarea.md` | `src/uni_modules/lucky-ui/components/lk-textarea/` |
| 单选、唯一答案、支付方式 | `lk-radio` | `docs/components/radio.md` | `src/uni_modules/lucky-ui/components/lk-radio/` |
| 多选、协议勾选、批量选择 | `lk-checkbox` | `docs/components/checkbox.md` | `src/uni_modules/lucky-ui/components/lk-checkbox/` |
| 单选列表、多选列表、设置选择 | `lk-select-list` | `docs/components/select-list.md` | `src/uni_modules/lucky-ui/components/lk-select-list/` |
| 设置开关、权限开关、功能启停 | `lk-switch` | `docs/components/switch.md` | `src/uni_modules/lucky-ui/components/lk-switch/` |
| 商品数量、购物车数量、人数调整 | `lk-stepper` | `docs/components/stepper.md` | `src/uni_modules/lucky-ui/components/lk-stepper/` |
| 价格区间、音量、连续数值调节 | `lk-slider` | `docs/components/slider.md` | `src/uni_modules/lucky-ui/components/lk-slider/` |
| 评分、满意度、星级评价 | `lk-rate` | `docs/components/rate.md` | `src/uni_modules/lucky-ui/components/lk-rate/` |
| 头像上传、凭证、文件、图片上传 | `lk-upload` | `docs/components/upload.md` | `src/uni_modules/lucky-ui/components/lk-upload/` |
| 地区、枚举选项、多级选择 | `lk-picker` | `docs/components/picker.md` | `src/uni_modules/lucky-ui/components/lk-picker/` |
| 月历、排期、签到、日程展示 | `lk-calendar` | `docs/components/calendar.md` | `src/uni_modules/lucky-ui/components/lk-calendar/` |
| 日期选择、预约、入住离店、日期范围 | `lk-calendar-picker` | `docs/components/calendar-picker.md` | `src/uni_modules/lucky-ui/components/lk-calendar-picker/` |
| 数字键盘、金额、支付密码 | `lk-keyboard` | `docs/components/keyboard.md` | `src/uni_modules/lucky-ui/components/lk-keyboard/` |
| 短信验证码、OTP、安全码输入 | `lk-verify-code` | `docs/components/verify-code.md` | `src/uni_modules/lucky-ui/components/lk-verify-code/` |

## 数据展示与状态

| 业务关键词 | 组件 | 文档 | 源码 |
|---|---|---|---|
| 商品卡、内容卡、会员卡、摘要卡 | `lk-card` | `docs/components/card.md` | `src/uni_modules/lucky-ui/components/lk-card/` |
| Banner、活动轮播、图集 | `lk-carousel` | `docs/components/carousel.md` | `src/uni_modules/lucky-ui/components/lk-carousel/` |
| FAQ、折叠详情、高级筛选 | `lk-collapse` | `docs/components/collapse.md` | `src/uni_modules/lucky-ui/components/lk-collapse/` |
| 物流、审批、历史记录、进程 | `lk-timeline` | `docs/components/timeline.md` | `src/uni_modules/lucky-ui/components/lk-timeline/` |
| 任务进度、上传进度、完成度 | `lk-progress` | `docs/components/progress.md` | `src/uni_modules/lucky-ui/components/lk-progress/` |
| 列表刷新、下拉更新 | `lk-pull-refresh` | `docs/components/pull-refresh.md` | `src/uni_modules/lucky-ui/components/lk-pull-refresh/` |
| 局部加载、分页加载、按钮等待 | `lk-loading` | `docs/components/loading.md` | `src/uni_modules/lucky-ui/components/lk-loading/` |
| 秒杀、活动截止、验证码倒计时 | `lk-countdown` | `docs/components/countdown.md` | `src/uni_modules/lucky-ui/components/lk-countdown/` |
| 首屏加载、列表占位、卡片占位 | `lk-skeleton` | `docs/components/skeleton.md` | `src/uni_modules/lucky-ui/components/lk-skeleton/` |
| 无数据、搜索为空、无订单 | `lk-empty` | `docs/components/empty.md` | `src/uni_modules/lucky-ui/components/lk-empty/` |
| 营收、里程、累计数字动画 | `lk-number-roller` | `docs/components/number-roller.md` | `src/uni_modules/lucky-ui/components/lk-number-roller/` |
| 图片、封面、懒加载、失败占位 | `lk-image` | `docs/components/image.md` | `src/uni_modules/lucky-ui/components/lk-image/` |
| 海量列表、高性能长列表 | `lk-virtual-list` | `docs/components/virtual-list.md` | `src/uni_modules/lucky-ui/components/lk-virtual-list/` |
| 瀑布流、图文社区、作品流 | `lk-waterfall` | `docs/components/waterfall.md` | `src/uni_modules/lucky-ui/components/lk-waterfall/` |
| 版权、机密标识、防泄露 | `lk-watermark` | `docs/components/watermark.md` | `src/uni_modules/lucky-ui/components/lk-watermark/` |

## 图表与指标

| 业务关键词 | 组件 | 文档 | 源码 |
|---|---|---|---|
| 排名、分类对比、柱状统计 | `lk-chart-bar` | `docs/components/chart-bar.md` | `src/uni_modules/lucky-ui/components/lk-chart-bar/` |
| 趋势、时间序列、增长曲线 | `lk-chart-line` | `docs/components/chart-line.md` | `src/uni_modules/lucky-ui/components/lk-chart-line/` |
| 趋势面积、流量区间、累计变化 | `lk-chart-area` | `docs/components/chart-area.md` | `src/uni_modules/lucky-ui/components/lk-chart-area/` |
| 占比、构成、份额 | `lk-chart-pie` | `docs/components/chart-pie.md` | `src/uni_modules/lucky-ui/components/lk-chart-pie/` |
| 完成率、目标达成、环形指标 | `lk-chart-ring` | `docs/components/chart-ring.md` | `src/uni_modules/lucky-ui/components/lk-chart-ring/` |
| 表格内走势、迷你趋势线 | `lk-chart-sparkline` | `docs/components/chart-sparkline.md` | `src/uni_modules/lucky-ui/components/lk-chart-sparkline/` |
| KPI、数据看板、指标卡 | `lk-chart-stat-card` | `docs/components/chart-stat-card.md` | `src/uni_modules/lucky-ui/components/lk-chart-stat-card/` |
| 能力画像、多维评分、雷达对比 | `lk-chart-radar-lite` | `docs/components/chart-radar-lite.md` | `src/uni_modules/lucky-ui/components/lk-chart-radar-lite/` |

## 反馈、浮层与高级交互

| 业务关键词 | 组件 | 文档 | 源码 |
|---|---|---|---|
| 确认、警告、删除、打断式表单 | `lk-modal` | `docs/components/modal.md` | `src/uni_modules/lucky-ui/components/lk-modal/` |
| 抽屉、底部弹层、自定义浮层 | `lk-popup` | `docs/components/popup.md` | `src/uni_modules/lucky-ui/components/lk-popup/` |
| 成功、失败、保存完成、轻提示 | `lk-toast` | `docs/components/toast.md` | `src/uni_modules/lucky-ui/components/lk-toast/` |
| 更多操作、分享菜单、底部操作单 | `lk-action-sheet` | `docs/components/action-sheet.md` | `src/uni_modules/lucky-ui/components/lk-action-sheet/` |
| 遮罩、蒙层、阻断背景操作 | `lk-overlay` | `docs/components/overlay.md` | `src/uni_modules/lucky-ui/components/lk-overlay/` |
| 字段解释、悬浮提示、帮助信息 | `lk-tooltip` | `docs/components/tooltip.md` | `src/uni_modules/lucky-ui/components/lk-tooltip/` |
| 筛选、排序、下拉菜单 | `lk-dropdown` | `docs/components/dropdown.md` | `src/uni_modules/lucky-ui/components/lk-dropdown/` |
| 公告、系统通知、风险提示 | `lk-notice-bar` | `docs/components/notice-bar.md` | `src/uni_modules/lucky-ui/components/lk-notice-bar/` |
| 浮动操作、新建、发布 | `lk-fab` | `docs/components/fab.md` | `src/uni_modules/lucky-ui/components/lk-fab/` |
| 开屏广告、节日活动、运营幕帘 | `lk-curtain` | `docs/components/curtain.md` | `src/uni_modules/lucky-ui/components/lk-curtain/` |
| 实验性预加载调试（使用前核对公共导出） | `lk-preload-debugger` | `docs/components/preload-debugger.md` | `src/uni_modules/lucky-ui/components/lk-preload-debugger/` |

> `lk-preload-debugger` 当前未从公共 `components/index.ts` 导出。除非任务明确需要实验性调试并允许直接引入，否则不要在业务页面中推荐。

## 非组件能力文档

以下文档没有同名 `lk-*` 组件目录，不计入一一对应表：

| 业务关键词 | 文档 |
|---|---|
| 动画、入场、离场、过渡 | `docs/components/animation.md` |
| 组合图表能力 | `docs/components/chart-lite.md` |
| Hooks、composables、工具函数 | `docs/components/hooks-utils.md` |
| 资源预加载方案 | `docs/components/preload.md` |
| 网络请求、拦截器 | `docs/components/request.md` |

## 组合提示

- 登录/注册：`lk-form` + `lk-input` + `lk-verify-code` + `lk-button`。
- 商品列表：`lk-navbar` + `lk-dropdown` + `lk-card`/`lk-waterfall` + `lk-skeleton` + `lk-empty`。
- 购物车：`lk-checkbox` + `lk-image` + `lk-stepper` + `lk-button`。
- 订单详情：`lk-navbar` + `lk-cell` + `lk-timeline` + `lk-card` + `lk-button`。
- 会员中心：`lk-avatar` + `lk-badge` + `lk-grid` + `lk-cell` + `lk-card`。
- 数据看板：`lk-chart-stat-card` + 趋势/占比图表 + `lk-segmented`。
- 首屏异步内容使用 `lk-skeleton`；仅局部或分页等待使用 `lk-loading`。
