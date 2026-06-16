# UniApp 真实开发技巧

> 最后校准日期：2026-05-25

这篇面向已经准备真实交付的 UniApp 项目。目标不是把 demo 跑起来，而是让同一套业务能稳定进入微信小程序、Android App、iOS App Store，并且把常见审核风险前置到开发期。

## 交付基线

先把“要交付什么”写进项目说明或发版单，不要等打包时临时补：

| 维度 | 必填内容 | 核查点 |
|------|----------|--------|
| 目标端 | `mp-weixin`、Android App、iOS App、H5 | 每个端都有独立验收机和账号权限 |
| 版本 | `versionName`、`versionCode`、构建号 | iOS 每次上传构建号递增，Android 市场也要求版本号递增 |
| 账号 | 微信小程序 AppID、DCloud AppID、Apple Team、应用市场账号 | 账号主体、应用名称、隐私政策主体保持一致 |
| 域名 | API、上传、下载、WebSocket、图片 CDN | 小程序后台配置合法域名，App 端配置证书和 ATS/网络策略 |
| 权限 | 相机、相册、定位、通知、蓝牙、通讯录等 | 权限只在用户触发功能时申请，隐私文案覆盖真实用途 |
| SDK | 登录、支付、地图、推送、统计、广告、客服 | 每个 SDK 有隐私条款、版本号、用途、初始化时机 |
| 包体 | 主包、分包、静态资源、原生模块 | 小程序控制主包；App 控制启动首屏、图片和原生 SDK 体积 |

::: tip 实战原则
跨端项目不要追求“完全不分端”。公共业务保持统一，平台能力通过条件编译、平台适配层和配置清单显式隔离。
:::

## 环境隔离

真实项目至少准备三套环境：

| 环境 | 用途 | 建议 |
|------|------|------|
| `dev` | 本地联调 | 可开调试域名、mock、日志面板 |
| `staging` | 提审前验收 | 数据接近线上，账号、支付、推送走沙箱或灰度 |
| `prod` | 正式发布 | 禁调试入口，禁测试账号泄漏，接口启用限流和风控 |

配置建议：

```ts
export const API_BASE = import.meta.env.VITE_API_BASE
export const RELEASE_CHANNEL = import.meta.env.VITE_RELEASE_CHANNEL
```

不要把环境判断散落在页面里。把域名、开关、埋点、分享链路集中到 `config` 或 `services` 层，再让页面只消费业务语义。

### 反例

```ts
const url = process.env.NODE_ENV === 'production'
  ? 'https://api.example.com'
  : 'http://192.168.1.8:3000'
```

问题：

- H5、微信小程序、App 的运行域名和证书约束不同。
- 局域网地址容易进入构建产物。
- 无法区分预发提审包和正式生产包。

### 正解

- 统一在构建环境里注入 `VITE_API_BASE`。
- 微信小程序后台只配置正式 HTTPS 域名；调试阶段使用开发者工具“不校验合法域名”只能作为本地调试。
- App 端不要依赖小程序合法域名白名单，但仍要处理证书、HTTPS、重定向、弱网重试。

## 条件编译

UniApp 官方推荐用条件编译处理多端差异。常用平台值包括：

| 平台值 | 说明 |
|--------|------|
| `MP-WEIXIN` | 微信小程序 |
| `MP` | 各类小程序统称 |
| `APP` | App 统称 |
| `APP-PLUS` | uni-app js 引擎版 App |
| `APP-IOS` | iOS App |
| `APP-ANDROID` | Android App |
| `WEB` / `H5` | Web / H5 |

JS / TS：

```ts
// #ifdef MP-WEIXIN
export const platformChannel = 'wechat-mini-program'
// #endif

// #ifdef APP-IOS
export const platformChannel = 'ios-app'
// #endif
```

模板：

```vue
<template>
  <view>
    <!-- #ifdef MP-WEIXIN -->
    <official-account />
    <!-- #endif -->
  </view>
</template>
```

样式必须使用 CSS 注释：

```scss
/* #ifdef APP-IOS */
.safe-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
/* #endif */
```

### 条件编译边界

- 适合隔离平台 API、配置、页面入口、原生组件。
- 不适合包住大段业务流程；业务差异应抽到适配层。
- JSON 中条件编译要保证编译前后都是合法 JSON，不要留下多余逗号。
- `pages.json` 可用条件编译剔除平台无关页面，减少包体和审核暴露面。

## 平台适配层

建议把平台能力做成薄适配：

```ts
export async function openPrivacySettings() {
  // #ifdef MP-WEIXIN
  return uni.openPrivacyContract?.()
  // #endif

  // #ifdef APP
  return uni.navigateTo({ url: '/pages/privacy/index' })
  // #endif
}
```

页面侧只调用 `openPrivacySettings()`，不要直接判断平台。这样后续新增支付宝、鸿蒙或海外 App 渠道时，变更集中。

## 网络与域名

### 微信小程序

上线前必须在微信公众平台配置并校验：

- `request` 合法域名。
- `uploadFile` 合法域名。
- `downloadFile` 合法域名。
- `socket` 合法域名。
- 证书链完整，使用 HTTPS，避免自签名、过期证书、弱 TLS。

开发者工具里的“不校验合法域名”只用于本地调试，不代表真机和审核通过。

### App

App 不走微信域名白名单，但审核更看重隐私和安全：

- 登录、支付、用户协议、隐私政策必须可访问。
- 首次启动不能在用户同意前初始化会采集设备信息的 SDK。
- 不要把测试、灰度、内网域名暴露给审核员。
- 证书错误、HTTP 明文、WebView 加载远端核心页面，都会提高拒审概率。

### 请求封装

必须有统一请求层：

- 自动追加版本、平台、渠道、语言、灰度标识。
- 统一超时、重试、取消、错误码映射。
- 登录态过期只刷新一次，避免并发刷新风暴。
- 记录 request id，方便定位审核机、体验版、TestFlight 的问题。

## 权限时机

权限不是启动流程的一部分，而是功能流程的一部分。

| 权限 | 正确触发 | 高风险触发 |
|------|----------|------------|
| 定位 | 用户点击“获取附近门店” | `onLaunch`、首页 `onShow` 自动弹 |
| 相机 | 用户点击“扫码”或“拍照上传” | 打开页面即申请 |
| 相册 | 用户点击“选择图片” | 注册页默认弹 |
| 通知 | 用户开启提醒、物流通知、日程提醒 | 首次启动立即弹 |
| 蓝牙 | 用户进入设备连接页 | 首页初始化扫描 |

拒绝权限后必须给出可继续路径：

- 允许继续浏览基础功能。
- 说明缺失权限影响的具体功能。
- 提供再次授权入口。
- 不要循环弹窗，不要拒绝后退出 App。

## 包体治理

### 小程序

- 主包只放启动页、首页、登录、基础组件和关键图标。
- 业务重页面进入分包。
- 大图放 CDN，首屏图做压缩和尺寸裁剪。
- 平台专属资源放条件编译目录，避免进入其他端。
- 组件库按需引入，避免把演示页、测试页、无关图标打进主包。

### App

- 原生 SDK 逐项确认用途，未使用的登录、支付、广告、地图、推送模块不要勾选。
- 启动图、引导图按设备尺寸压缩，不要把设计源图打包。
- WebView 资源能本地化就本地化，审核不喜欢核心能力依赖远程网页。
- Android 按市场需要选择 APK / AAB / 加固；iOS 只提交 App Store Connect 可识别的构建。

## 性能与稳定性

真实上线前至少处理这些点：

- 长列表使用分页、虚拟列表或瀑布流懒加载，避免一次性渲染全量数据。
- 首屏接口并发控制，非首屏数据延迟加载。
- 图片使用固定尺寸容器，避免加载后布局抖动。
- 下拉刷新、上拉加载、空状态、失败重试都要完整。
- 支付、登录、上传、地图等链路加超时和用户可恢复操作。
- 页面返回、Tab 切换、重复点击要做防抖或状态锁。
- App 端监听网络变化、前后台切换、热启动恢复。

## 跨端排查

| 现象 | 优先检查 |
|------|----------|
| 微信真机正常，审核失败 | 合法域名、隐私授权、类目、登录态、审核账号权限 |
| 开发者工具正常，真机失败 | 基础库版本、证书链、网络白名单、权限弹窗 |
| App 启动白屏 | 首屏远程依赖、启动图配置、资源路径、JS 异常 |
| iOS 拒审 | 隐私营养标签、ATT、IDFA、账号登录、演示账号、重复应用 |
| Android 市场驳回 | 隐私弹窗、提前采集、权限过度、SDK 隐私条款、备案材料 |
| H5 正常，小程序异常 | DOM/BOM 依赖、样式单位、组件能力、异步授权 |

## 上线前动作

1. 锁定版本号、构建号和提交分支。
2. 清理调试入口、测试账号、mock、console 噪声。
3. 产出提审包，并记录构建环境、commit、构建机、渠道。
4. 使用真机跑核心路径：启动、登录、隐私、首页、搜索、表单、上传、支付、分享、退出。
5. 审核账号写入后台白名单，保证审核员不需要内部说明也能走通主流程。
6. 保留发版记录：包名、Bundle ID、AppID、版本号、提交时间、审核结论、驳回原因。

## 官方入口

- [DCloud 条件编译处理多端差异](https://uniapp.dcloud.net.cn/tutorial/platform.html)
- [DCloud uni-app 组成和跨端原理](https://uniapp.dcloud.net.cn/tutorial/index.html)
- [DCloud 小程序运行日志回显](https://uniapp.dcloud.net.cn/tutorial/run/mp-log.html)
- [微信小程序网络能力](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html)
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
