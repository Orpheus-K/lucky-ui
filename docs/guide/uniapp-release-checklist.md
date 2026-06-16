# 上线与提审清单

> 最后校准日期：2026-05-25

这篇是发布前最后一关。适合在微信小程序、Android App、iOS App 每次提审前逐项勾选，也适合驳回后复盘。

## 版本清单

| 项目 | 微信小程序 | Android App | iOS App |
|------|------------|-------------|---------|
| 版本号 | 上传版本号 | `versionName` | App Store 版本号 |
| 构建号 | 上传备注 | `versionCode` | Build |
| App 标识 | AppID | 包名 | Bundle ID |
| 构建产物 | `mp-weixin` | APK / AAB | IPA / App Store Connect Build |
| 审核入口 | 微信公众平台 | 各应用市场后台 | App Store Connect |
| 灰度能力 | 灰度发布 | 市场灰度 / 渠道包 | Phased Release |

## 提审前总清单

- [ ] 版本号、构建号递增。
- [ ] 生产接口、生产域名、生产支付、生产推送已切换。
- [ ] 测试入口、mock、debug 面板、测试账号硬编码已移除。
- [ ] 隐私政策、用户协议、注销说明可访问。
- [ ] SDK 清单、权限清单、数据清单已更新。
- [ ] 首次启动不提前采集设备信息。
- [ ] 拒绝权限后可继续使用基础功能。
- [ ] 审核账号可登录，验证码策略已处理。
- [ ] 核心路径有审核备注。
- [ ] 真机跑通冷启动、登录、核心业务、上传、支付、分享、退出。
- [ ] 线上监控、错误日志、版本标识已准备。
- [ ] 服务端保留降级开关。

## 微信小程序清单

后台：

- [ ] AppID 正确。
- [ ] 服务类目覆盖实际能力。
- [ ] 用户隐私保护指引已配置并发布。
- [ ] `request`、`uploadFile`、`downloadFile`、`socket` 合法域名已配置。
- [ ] 体验成员已添加。
- [ ] 审核账号和测试数据可用。

代码与构建：

- [ ] `src/manifest.json` 的 `mp-weixin.appid` 是正式 AppID。
- [ ] 主包体积可控，业务页进入分包。
- [ ] `pages.json` 不包含无关测试页。
- [ ] 微信专属能力使用 `MP-WEIXIN` 条件编译。
- [ ] 不依赖开发者工具“不校验合法域名”。
- [ ] 上传密钥、privateKey、IP 白名单、CI 机器人编号配置正确。

审核备注：

- [ ] 登录方式。
- [ ] 核心页面路径。
- [ ] 权限用途。
- [ ] 支付或下单测试方式。
- [ ] 特殊类目资质说明。

## Android App 清单

配置：

- [ ] 包名与市场后台一致。
- [ ] `versionCode` 递增。
- [ ] 未使用模块未勾选。
- [ ] 无业务入口权限已删除。
- [ ] SDK 清单覆盖登录、支付、推送、地图、广告、统计、客服等。
- [ ] 隐私弹窗使用合规模式，早于 SDK 初始化。

材料：

- [ ] 应用图标、截图、简介、描述。
- [ ] 隐私政策 URL、用户协议 URL、注销说明。
- [ ] 备案、软著、商标、授权、行业资质。
- [ ] 权限用途说明。
- [ ] SDK 隐私链接。
- [ ] 测试账号与审核路径。

真机：

- [ ] 首次启动未同意隐私前无敏感采集。
- [ ] 拒绝权限不强退。
- [ ] 安装、升级、覆盖安装正常。
- [ ] 主流 Android 版本和厂商系统验收。
- [ ] 加固后重新安装验收，不只验收加固前包。

## iOS App Store 清单

构建：

- [ ] 当前上传包满足 Apple 2026 SDK 要求。
- [ ] DCloud 云打包环境符合目标版本要求。
- [ ] Bundle ID、证书、profile 一致。
- [ ] 构建号递增。
- [ ] 权限描述文案具体。
- [ ] 未使用 IDFA 或广告模块时没有误声明追踪。

App Store Connect：

- [ ] App 信息、名称、Subtitle、描述、关键词完整。
- [ ] 截图符合目标设备要求。
- [ ] 隐私政策 URL 可访问。
- [ ] App Privacy 隐私营养标签准确。
- [ ] Export Compliance 已处理。
- [ ] 年龄分级准确。
- [ ] Accessibility Nutrition Labels 已按实际情况填写或规划。
- [ ] TestFlight 通过核心路径验收。
- [ ] 审核账号、备注、测试说明已填写。

隐私与审核：

- [ ] `PrivacyInfo.xcprivacy` 按需要补充。
- [ ] 第三方 SDK 隐私清单和签名已确认。
- [ ] ATT 在追踪前触发。
- [ ] 有账号体系时提供删除账号入口。
- [ ] 有第三方登录时确认是否需要 Sign in with Apple。
- [ ] 虚拟商品按 Apple 内购规则处理。

## 热更新清单

- [ ] 已确认本次变更允许 wgt；原生 SDK、权限、隐私、支付、订阅、UTS 原生代码变更一律整包。
- [ ] wgt 目标最低 App 版本明确。
- [ ] HBuilderX / CLI / uni 编译器版本已记录。
- [ ] 用线上同版本原生包安装验证。
- [ ] 升级包 HTTPS 下载，带文件大小和 hash 校验。
- [ ] 灰度从内部白名单开始。
- [ ] 审核期间不弹热更新提示，不下发改变功能边界的 wgt。
- [ ] Android 隐私同意前不检查、不下载、不安装更新。
- [ ] iOS 不通过热更新新增核心功能、支付路径、隐私采集或追踪能力。
- [ ] 安装失败可回退旧版本并上报。
- [ ] 已准备更高 wgt 版本或整包作为回滚方案。

## 驳回定位表

| 平台 | 驳回关键词 | 优先排查 |
|------|------------|----------|
| 微信 | 类目不符 | 服务类目、资质、页面实际内容 |
| 微信 | 隐私不规范 | 后台隐私指引、弹窗、API 用途、SDK |
| 微信 | 无法打开 / 空白 | 合法域名、证书、分包、审核账号 |
| Android | 提前收集个人信息 | 隐私弹窗、SDK 初始化、应用行为记录 |
| Android | 权限过度 | manifest 权限、申请时机、隐私政策 |
| Android | 资质缺失 | 类目、备案、软著、授权、行业许可 |
| iOS | 2.1 | 审核账号、测试数据、接口稳定性 |
| iOS | 4.2 | 功能完整度、原生体验、远程网页依赖 |
| iOS | 4.3 | 模板化、重复应用、马甲包风险 |
| iOS | 5.1 | 隐私标签、隐私政策、权限、ATT |
| iOS | Missing API declaration | 隐私清单、必要理由 API、SDK |

## 回滚与降级

发布前必须准备：

- 服务端功能开关。
- 活动、广告、推荐、支付、上传、地图等高风险模块的关闭开关。
- 上一稳定版本接口兼容。
- 小程序灰度回退路径。
- Android 渠道包旧版本留存。
- iOS 分阶段发布暂停策略。

回滚决策：

| 指标 | 建议动作 |
|------|----------|
| 启动失败明显上升 | 立即暂停发布或灰度 |
| 登录失败影响主流程 | 开降级登录或回滚 |
| 支付失败 | 关闭支付入口并公告 |
| 崩溃集中在某设备 | 灰度暂停，定位设备兼容 |
| 审核后线上接口 403 | 修复审核 / 正式域名白名单 |

## 复盘模板

```md
## 版本
- 平台：
- 版本号：
- 构建号：
- 提交时间：
- 审核结果：

## 问题
- 驳回原文：
- 影响范围：
- 复现路径：

## 根因
- 代码：
- 配置：
- 后台：
- 材料：

## 修复
- 改动：
- 验证：
- 重新提交时间：

## 防复发
- 新增清单项：
- 自动化检查：
- 负责人：
```

## 官方入口

- [DCloud 应用市场上架注意事项](https://uniapp.dcloud.net.cn/tutorial/store)
- [DCloud Android 国内应用市场上架](https://uniapp.dcloud.net.cn/tutorial/android-store.html)
- [DCloud App Store 上架](https://uniapp.dcloud.net.cn/tutorial/ios-app-store.html)
- [DCloud App 升级中心 uni-upgrade-center](https://doc.dcloud.net.cn/uniCloud/upgrade-center.html)
- [DCloud iOS 平台隐私清单](https://uniapp.dcloud.net.cn/tutorial/app-ios-privacyinfo.html)
- [微信小程序 CI](https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html)
- [微信小程序用户隐私保护指引](https://developers.weixin.qq.com/miniprogram/dev/framework/user-privacy/)
- [Apple App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/)
- [Apple Submit an app](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app/)
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
