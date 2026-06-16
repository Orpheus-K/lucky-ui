# iOS App Store 上架

> 最后校准日期：2026-05-25

这篇聚焦 UniApp iOS 从证书、云打包、TestFlight 到 App Store 审核。iOS 审核不是只看能否安装，它会同时检查 SDK 版本、隐私营养标签、隐私清单、ATT、账号体系、业务完整度和 App Review Guidelines。

## 2026 关键口径

| 项目 | 当前要点 |
|------|----------|
| Apple 上传要求 | 自 2026-04-28 起，上传到 App Store Connect 的 App 必须使用 Xcode 26 或更高版本，并使用 iOS 26 / iPadOS 26 / tvOS 26 / visionOS 26 / watchOS 26 对应 SDK |
| DCloud 云打包 | DCloud 文档显示 HBuilderX 5.05+ 云打包环境为 Xcode 26.3、iOS SDK 26.2 |
| 最低系统 | DCloud 文档标注更新 Xcode 26.3 后最低支持 iOS 13 |
| 隐私营养标签 | 新 App 和更新都需要在 App Store Connect 提供准确隐私信息 |
| 隐私清单 | 使用必要理由 API、采集数据、第三方 SDK 时，需要关注 `PrivacyInfo.xcprivacy` |
| Accessibility Nutrition Labels | App Store Connect 已提供可访问性营养标签管理入口，建议提审前补齐 |

## 上架总流程

1. Apple Developer Program 账号准备。
2. 创建 Bundle ID。
3. 配置证书、Identifiers、Profiles。
4. 在 DCloud / HBuilderX 配置 iOS 包名、证书、描述文件、权限描述。
5. 云打包产出 iOS 构建。
6. 上传 App Store Connect。
7. 配置 App 信息、截图、隐私、年龄分级、出口合规、价格和可用地区。
8. TestFlight 内测。
9. 提交 App Review。
10. 根据审核意见修复或申诉。
11. 发布、分阶段发布或手动发布。

## Apple 账号与 Bundle ID

创建 App 前确认：

- Apple Developer Program 会员有效。
- 团队角色至少有 App Manager / Developer / Admin 所需权限。
- Bundle ID 与 UniApp iOS 配置完全一致。
- App Groups、Associated Domains、Push Notifications、Sign in with Apple 等能力按业务开启。
- App Store Connect 中 App 记录的 Bundle ID 上传构建后不能随意更换。

命名建议：

| 项目 | 示例 |
|------|------|
| Bundle ID | `com.company.product` |
| SKU | `product-ios` |
| 版本号 | `1.2.0` |
| 构建号 | `120001` |

构建号每次上传都要递增；同一版本号可以有多个构建号。

## 证书与描述文件

| 文件 | 用途 | 注意 |
|------|------|------|
| `.p12` | 包含证书和私钥 | 密码要保存到团队密钥库，不能进 Git |
| `.mobileprovision` | 描述文件 | App Store 发布使用 Distribution Profile |
| Bundle ID | 应用唯一标识 | 与描述文件、App Store Connect、DCloud 配置一致 |

常见错误：

- 使用 Development Profile 打 App Store 包。
- Bundle ID 多一个后缀或大小写不一致。
- 证书过期、profile 未更新。
- 开启推送、通用链接等能力后，没有重新生成 profile。

## DCloud iOS 打包配置

在 `src/manifest.json` 中确认：

- `app-plus.distribute.ios` 已配置目标包名和必要描述。
- 权限描述文案真实、具体，不要写“用于提供服务”这种空泛话术。
- 未使用的 SDK 和模块不要勾选。
- 使用 IDFA、推送、登录、支付、地图时，对应 Apple 后台能力和隐私信息同步配置。

权限描述示例方向：

| 能力 | 描述方向 |
|------|----------|
| 相机 | 用于扫码、拍摄资料或上传头像 |
| 相册 | 用于选择图片并上传到用户主动提交的内容 |
| 定位 | 用于展示附近门店或配送地址推荐 |
| 麦克风 | 用于录制用户主动提交的音频 |
| 通知 | 用于订单状态、预约提醒或系统消息 |

## 隐私营养标签

App Store Connect 的 App Privacy 必须覆盖：

- App 自己采集的数据。
- 第三方 SDK 采集的数据。
- 数据是否关联用户身份。
- 数据是否用于追踪。
- 数据用途：App 功能、分析、广告、个性化、营销等。
- 隐私政策 URL。

UniApp 项目常见数据映射：

| 场景 | 可能涉及 |
|------|----------|
| 登录注册 | 邮箱、手机号、用户 ID |
| 头像上传 | 照片或视频、用户内容 |
| 定位门店 | 精确位置或粗略位置 |
| 统计分析 | 产品交互、崩溃数据、性能数据 |
| 广告 | 设备 ID、广告数据、产品交互 |
| 支付订单 | 购买历史、联系方式 |
| 客服反馈 | 用户内容、联系方式 |

::: warning
隐私营养标签不是只填“自己代码里显式上传的数据”。接入的统计、广告、推送、登录、地图、客服 SDK 都要纳入。
:::

## 隐私清单

Apple 隐私清单关注：

- 必要理由 API。
- 隐私数据使用描述。
- 第三方 SDK 隐私清单和签名。
- `PrivacyInfo.xcprivacy`。

DCloud 文档说明：

- HBuilderX 4.08 正式版开始支持 uni-app 项目配置隐私清单。
- HBuilderX 4.13+ 开始支持 uni-app x 项目配置隐私清单。
- 通常 DCloud 会根据应用配置自动生成框架相关清单。
- 自己的原生代码、UTS 插件或未适配的原生插件可能需要补充 `PrivacyInfo.xcprivacy`。
- 补充文件可放在 `nativeResources/ios` 下，提交云打包后生效。

处理顺序：

1. 升级 HBuilderX / CLI 到当前稳定版本。
2. 列出所有原生插件、UTS 插件、第三方 SDK。
3. 检查 SDK 是否提供隐私清单和签名。
4. 如审核提示缺少必要理由 API，按 Apple 和 DCloud 文档补充 `PrivacyInfo.xcprivacy`。
5. 重新云打包上传。

## IDFA 与 ATT

如果使用广告标识、广告归因、跨 App 追踪或相关 SDK：

- App Store Connect 隐私标签里要声明 Device ID、Tracking 等真实用途。
- iOS 14.5+ 追踪需要 App Tracking Transparency 授权。
- ATT 弹窗文案必须解释用途，且在采集前出现。
- 不需要 IDFA 的应用不要误勾选广告或追踪模块。

高风险情况：

- 隐私标签声明了追踪，但 App 内没有 ATT 授权。
- 集成广告 SDK 但声称不收集任何数据。
- SDK 初始化早于 ATT 或隐私同意。
- 使用 IDFA 但审核备注没有说明用途。

## Accessibility Nutrition Labels

Apple 已在 App Store Connect 提供 Accessibility Nutrition Labels 相关入口。建议提审前做一次可访问性自查：

| 项目 | 核查 |
|------|------|
| VoiceOver | 按钮、图标按钮、表单项有可理解标签 |
| Voice Control | 关键控件可被语音命令定位 |
| Larger Text | 字体放大后不遮挡、不截断核心操作 |
| Dark Interface | 暗黑模式颜色、边框、阴影仍可辨识 |
| Differentiate Without Color Alone | 状态不只依赖颜色区分 |
| Sufficient Contrast | 文本和背景对比足够 |
| Reduced Motion | 动效可降级，加载不依赖强动画 |
| Captions / Audio Descriptions | 视频、音频内容按实际提供辅助信息 |

UniApp 页面重点检查：

- 自定义导航栏和 Tabbar。
- 只显示图标的按钮。
- 表单错误提示。
- 弹窗关闭按钮。
- 验证码、上传、支付确认。

## TestFlight 验收

TestFlight 前置：

- 构建已上传并处理完成。
- Export Compliance 已处理。
- 内部测试员已加入。
- Beta App Review 需要的信息已填写。

验收路径：

- 首次启动、隐私、权限、登录。
- 注册、注销、找回密码。
- 付费功能、内购或第三方支付边界。
- 推送授权、前后台切换。
- 弱网和断网。
- 深链、通用链接、分享回流。
- iPhone 小屏、大屏、深色模式。

## App Review 提交材料

必填材料：

- App 名称、Subtitle、描述、关键词。
- 截图和可选 App Preview。
- 隐私政策 URL。
- 年龄分级。
- 价格、地区、版权。
- 审核账号、密码、验证码处理方式。
- 审核备注。
- 如果有登录墙，必须让审核员能进入核心功能。
- 如果有付费内容、订阅、金融、医疗、UGC，要写清测试方式和资质。

审核备注模板：

```text
审核账号：review@example.com
密码：由后台审核账号管理生成
验证码：固定为 123456，或已关闭短信校验
核心路径：首页 -> 登录 -> 功能 A -> 创建记录 -> 查看详情
权限说明：相机用于扫码；定位用于附近门店；通知用于订单状态提醒
支付说明：测试商品 0.01 元；如需沙盒账号请使用以下账号
备注：本 App 主要功能均为本地包内页面，不依赖远程网页承载核心功能
```

## 常见拒审

| 拒审方向 | 典型原因 | 处理 |
|----------|----------|------|
| 2.1 App Completeness | 登录失败、空白页、测试数据缺失 | 提供稳定审核账号、修复接口、补备注 |
| 4.2 Minimum Functionality | 功能过少、像网页套壳 | 增强原生体验、离线可用性、独特价值 |
| 4.3 Spam | 马甲包、模板化、重复应用 | 明确差异化，调整 UI 和业务价值，必要时申诉 |
| 5.1 Privacy | 隐私标签、权限、SDK 不一致 | 对齐 App Privacy、隐私政策、ATT、清单 |
| IDFA / ATT | 追踪声明和授权不匹配 | 移除追踪或补 ATT 与隐私标签 |
| IAP | 虚拟商品绕过内购 | 按 Apple 规则接入 In-App Purchase |
| Account deletion | 有账号但无删除入口 | 在 App 内提供清晰注销路径 |
| Sign in with Apple | 第三方登录但未提供 Apple 登录 | 按 Apple 要求补充或调整登录方式 |

## 发布策略

- 选择手动发布，先等审核通过再安排发布窗口。
- 重要版本使用分阶段发布，观察崩溃率和关键转化。
- 准备服务端开关：关闭问题模块、隐藏入口、禁用活动。
- iOS 无法像 Web 即时回滚，服务端兼容至少保留两个 App 版本。

## 热更新边界

iOS 可以谨慎使用 wgt 修复前端资源问题，但不要把热更新当成绕过 App Review 的发布机制。Apple Guideline 2.5.2 对下载、安装、执行会引入或改变 App 功能的代码有严格限制。

上线策略：

- 审核期间关闭非必要热更新提示。
- 审核包内必须包含可完整审核的主要功能。
- 不通过 wgt 新增核心功能、支付路径、订阅规则、隐私采集或追踪能力。
- UI、文案、图片、轻量 JS bug、接口兼容可走 wgt 灰度修复。
- 原生 SDK、权限、隐私清单、ATT、IDFA、IAP 变更一律整包提审。

详细流程见 [App 热更新与升级策略](/guide/uniapp-hot-update)。

## 官方入口

- [DCloud App 云端打包环境](https://uniapp.dcloud.net.cn/tutorial/app-env.html)
- [DCloud App Store 上架](https://uniapp.dcloud.net.cn/tutorial/ios-app-store.html)
- [DCloud App 升级中心 uni-upgrade-center](https://doc.dcloud.net.cn/uniCloud/upgrade-center.html)
- [DCloud iOS 平台隐私清单](https://uniapp.dcloud.net.cn/tutorial/app-ios-privacyinfo.html)
- [DCloud iOS IDFA 配置说明](https://uniapp.dcloud.net.cn/tutorial/app-ios-idfa.html)
- [Apple SDK minimum requirements](https://developer.apple.com/news/upcoming-requirements/?id=02032026a)
- [Apple Upload builds](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/)
- [Apple Submit an app](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app/)
- [Apple App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/)
- [Apple Privacy manifest files](https://developer.apple.com/documentation/bundleresources/privacy-manifest-files)
- [Apple Accessibility Nutrition Labels](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/overview-of-accessibility-nutrition-labels/)
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
