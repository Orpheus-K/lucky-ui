# App 热更新与升级策略

> 最后校准日期：2026-05-25

UniApp 的 App 升级不要只理解成“热更新”。真实线上应同时设计整包更新、wgt 资源更新、灰度、强制更新、回滚和审核规避策略。热更新只适合修前端资源层问题，不适合绕过应用市场审核发布新能力。

## 先定升级类型

| 类型 | 适用 | 不适用 |
|------|------|--------|
| 整包更新 | 原生 SDK、权限、模块、证书、包名、原生插件、iOS / Android 审核版本 | 只修文案、样式、小型页面逻辑 |
| wgt 资源更新 | Vue / JS / CSS / 图片等前端资源修复 | 原生能力、权限、SDK、UTS 原生代码、manifest 原生配置 |
| 服务端开关 | 关闭入口、降级功能、灰度策略 | 修复客户端本地崩溃或资源缺失 |
| 小程序发布 | 微信后台审核后自动更新 | App 的 `plus.runtime.install` 流程 |

::: warning
微信小程序使用平台自己的版本更新机制，App 的 wgt 热更新不适用于小程序。`uni.getUpdateManager()` 是小程序更新 API，App 更新请走整包或 wgt 方案。
:::

## 推荐架构

新项目建议用 DCloud 官方 `uni-upgrade-center`：

- 同时管理 Android 整包、iOS App Store 跳转、wgt 资源包。
- 后台可配置版本、平台、最低版本、是否强制、灰度和更新说明。
- 客户端只做检查、提示、下载、安装、重启和异常上报。
- 发布记录集中在后台，便于复盘和回滚。

最小架构：

| 模块 | 职责 |
|------|------|
| 客户端 | 读取 App 版本、wgt 版本、平台、渠道，向升级接口查询 |
| 升级接口 | 判断是否有整包 / wgt，返回版本、URL、强制、说明、灰度策略 |
| 文件存储 | 托管 APK、wgt，必须 HTTPS |
| 管理后台 | 管理版本、灰度、强制更新、回滚状态 |
| 监控 | 记录检查、下载、安装、重启、失败码 |

## 版本模型

至少维护两类版本：

| 字段 | 含义 | 来源 |
|------|------|------|
| App 版本 | 原生安装包版本 | `plus.runtime.version` 或系统信息 |
| wgt 版本 | 应用资源版本 | `plus.runtime.getProperty()` |
| 编译器版本 | wgt 编译时使用的 uni 编译器版本 | `uniCompileVersion` |
| 运行时版本 | 当前原生包内置的 uni 运行时版本 | `uniRuntimeVersion` |
| 渠道 | Android 市场、TestFlight、App Store、企业包 | 打包渠道或服务端下发 |

DCloud 文档强调，热更新时 App 版本和 wgt 资源版本可能不一致。判断热更新不能只看 `plus.runtime.version`，应使用 `plus.runtime.getProperty()` 读取当前资源信息。

## 什么时候必须整包

以下变更必须走整包，不能靠 wgt：

- 新增、删除或升级原生 SDK。
- 新增原生插件、UTS 原生代码、Android `aar/jar/so`、iOS 原生库。
- 修改包名、应用名称、图标、启动图、证书、权限、URL Scheme、Universal Links。
- 修改 `manifest.json` 中需要原生打包生效的 App 配置。
- 新增地图、推送、支付、登录、广告等原生模块。
- 升级导致 `uniCompileVersion` 与旧包 `uniRuntimeVersion` 不兼容。
- HBuilderX / Vue / Pinia 等底层版本跨越官方标注的不兼容边界。
- iOS 审核要求通过 App Store 更新的能力变更。

## wgt 能修什么

适合：

- 文案错误、样式错位、轻量交互 bug。
- 接口字段兼容处理。
- 页面逻辑缺陷。
- 静态图片、图标、页面资源。
- 非原生依赖的 Vue 组件修复。

不适合：

- 新增需要权限的功能。
- 新增支付、定位、推送、地图、广告、蓝牙等原生能力。
- 绕过审核上线新业务。
- 改隐私采集范围。
- 改登录、支付、订阅等影响平台利益的规则。

## 生成 wgt

发布前动作：

1. 修改 `manifest.json` 中的 `versionName`。
2. 使用 HBuilderX 发行菜单生成 App 资源升级包，或使用团队既定 CLI 流程生成 wgt。
3. 记录构建使用的 HBuilderX / CLI / uni 编译器版本。
4. 用同一批线上原生包做兼容测试。
5. 上传 wgt 到 HTTPS 存储。
6. 在升级中心配置灰度规则。

命名建议：

```text
app-1.4.2-wgt.20260525.1.wgt
```

同时保存：

- commit id。
- `versionName`。
- `uniCompileVersion`。
- 目标最低 App 版本。
- 目标平台和渠道。
- 文件 hash。

## 客户端流程

典型流程：

1. App 启动后延迟检查，不阻塞首屏。
2. 读取 App 版本和 wgt 版本。
3. 请求升级接口。
4. 若需整包，按 Android / iOS 分端处理。
5. 若有 wgt，提示或静默下载。
6. 下载完成后校验文件大小、hash、版本。
7. 使用 `plus.runtime.install()` 安装。
8. 安装成功后调用 `plus.runtime.restart()`。
9. 失败时上报错误并保留当前版本。

原理示例：

```ts
// #ifdef APP-PLUS
plus.runtime.getProperty(plus.runtime.appid, (widgetInfo) => {
  uni.request({
    url: 'https://api.example.com/app/upgrade',
    data: {
      appid: plus.runtime.appid,
      version: widgetInfo.version,
      name: widgetInfo.name,
    },
    success: ({ data }) => {
      if (!data?.wgtUrl) return

      uni.downloadFile({
        url: data.wgtUrl,
        success: (res) => {
          if (res.statusCode !== 200) return

          plus.runtime.install(
            res.tempFilePath,
            { force: false },
            () => plus.runtime.restart(),
            (error) => {
              console.error('wgt install failed', error)
            },
          )
        },
      })
    },
  })
})
// #endif
```

生产代码还要补齐：

- HTTPS 证书校验。
- hash / size 校验。
- 下载进度与取消。
- 失败重试次数。
- 灰度命中记录。
- 安装失败码上报。
- 重启前保存未提交表单和关键状态。

## 服务端返回协议

建议协议：

```json
{
  "update": true,
  "type": "wgt",
  "version": "1.4.2",
  "minAppVersion": "1.4.0",
  "force": false,
  "silent": false,
  "title": "修复更新",
  "description": "修复部分页面展示异常",
  "url": "https://cdn.example.com/app/app-1.4.2.wgt",
  "sha256": "a1b2c3...",
  "size": 5242880
}
```

字段规则：

| 字段 | 规则 |
|------|------|
| `type` | `wgt`、`android-apk`、`ios-store` |
| `minAppVersion` | 低于该版本时必须整包，不下发 wgt |
| `force` | 只用于严重兼容、合规、安全问题 |
| `silent` | 只用于小修复，不影响隐私和功能边界 |
| `sha256` | 客户端下载后校验 |
| `url` | 必须 HTTPS，避免明文劫持 |

## 灰度策略

灰度不要只按百分比，还要按风险维度切：

- 平台：Android / iOS 分开。
- 渠道：华为、小米、OPPO、vivo、App Store、TestFlight 分开。
- App 版本：只给兼容的原生包下发。
- 用户范围：内部账号、白名单、城市、组织、随机百分比。
- 设备：系统版本、机型、CPU 架构。

推荐节奏：

1. 内部白名单 1 小时。
2. 1% 普通用户 2-4 小时。
3. 10% 观察核心指标。
4. 50% 后再全量。

观察指标：

- 检查成功率。
- 下载成功率。
- 安装成功率。
- 重启成功率。
- 启动白屏率。
- JS 错误率。
- 登录、支付、提交表单等关键转化。

## 回滚策略

wgt 回滚不是“删除 CDN 文件”。

正确做法：

- 升级中心把问题版本标记为下线。
- 发布一个更高 wgt 版本修复或回退。
- 对已安装问题版本的用户命中修复版本。
- 服务器兼容问题版本请求，避免用户卡死。
- 如果是原生层问题，停止 wgt 下发并提示整包升级。

版本规则：

| 当前状态 | 处理 |
|----------|------|
| 少量用户安装失败 | 暂停灰度，定位失败码 |
| 已安装后白屏 | 下发更高版本 wgt 修复，或走强制整包 |
| 原生能力缺失 | 停止 wgt，改整包 |
| iOS 审核期 | 不弹热更新提示，不下发会改变功能边界的 wgt |

## iOS 审核边界

Apple App Review Guidelines 2.5.2 对下载、安装、执行会引入或改变 App 功能的代码有严格限制。实践中要保守处理：

- 不用热更新新增核心功能。
- 不用热更新绕过 App Review。
- 不改虚拟商品、订阅、支付、登录、隐私采集。
- 不下载可执行原生代码。
- 审核期间不要弹出热更新提示。
- 热更新内容走 HTTPS，防止劫持。
- 审核包内应包含可完整审核的主要功能。

适合 iOS wgt 的场景：

- 修 UI、文案、图片、轻量 JS bug。
- 修接口兼容。
- 下线问题入口。
- 调整非合规敏感页面展示。

不适合：

- 新增未审核功能。
- 新增小程序、小游戏、插件、远程模块市场。
- 变更支付路径。
- 新增数据采集或追踪。

## Android 市场边界

国内 Android 市场普遍关注热更新是否绕过审核、是否提前采集、是否动态加载违规代码。处理原则：

- 隐私弹窗同意前不检查和下载更新。
- 不下载 APK 外的可执行原生代码。
- 更新说明不要写“绕过审核”“动态下发功能”。
- 权限、SDK、隐私采集变更必须走整包并重新提审。
- 加固后再验热更新，不要只验加固前包。
- 若市场要求关闭热更新，按对应渠道禁用 wgt 下发。

## 常见失败

| 现象 | 原因 | 处理 |
|------|------|------|
| 安装后没生效 | 未调用 `plus.runtime.restart()` | 安装成功后重启 |
| 版本不匹配提示 | wgt 编译器版本高于旧包运行时 | 用旧编译器打 wgt，或整包升级 |
| 真机运行拿到的是 HBuilder 信息 | 开发基座不是正式包 | 用自定义基座或正式包测试 |
| iOS 审核风险 | 审核期弹热更新或改变功能 | 审核期关闭热更新策略 |
| Android 驳回动态更新 | 权限 / SDK / 功能通过热更新变化 | 原生变更走整包 |
| UTS 代码不生效 | wgt 不能热更新 UTS 原生部分 | 打整包 |
| 下载失败 | HTTP、证书、CDN、弱网、重定向 | HTTPS、校验域名、增加重试 |
| 安装失败后卡死 | 未保留旧版本入口 | 安装失败回退旧版本并上报 |

## 发布清单

- [ ] 判断这次变更是否允许 wgt，原生能力变更一律整包。
- [ ] 记录 HBuilderX / CLI / uni 编译器版本。
- [ ] 用目标线上 App 版本测试安装。
- [ ] 配置最低兼容 App 版本。
- [ ] wgt 使用 HTTPS 下载。
- [ ] 文件 hash、大小、版本号可校验。
- [ ] 灰度从白名单开始。
- [ ] 审核期关闭非必要热更新提示。
- [ ] iOS 不通过热更新新增或改变功能边界。
- [ ] Android 隐私同意前不检查、不下载、不安装更新。
- [ ] 安装失败有上报和回退。
- [ ] 已准备更高版本修复包作为回滚方案。

## 官方入口

- [DCloud App 升级中心 uni-upgrade-center](https://doc.dcloud.net.cn/uniCloud/upgrade-center.html)
- [DCloud uni-app 资源在线升级 / 热更新](https://ask.dcloud.net.cn/article/35667)
- [DCloud uni-app 整包升级 / 更新方案](https://ask.dcloud.net.cn/article/34972)
- [DCloud uni 版本说明：wgt 热更新版本兼容](https://uniapp.dcloud.net.cn/tutorial/version.html)
- [DCloud manifest.json 应用版本说明](https://uniapp.dcloud.net.cn/collocation/manifest.html)
- [DCloud uni.getUpdateManager 小程序更新 API](https://uniapp.dcloud.net.cn/api/other/update)
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
