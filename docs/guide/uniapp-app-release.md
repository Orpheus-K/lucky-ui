# App 打包与应用市场上架

> 最后校准日期：2026-05-25

这篇覆盖 UniApp App 端从 `manifest.json`、云打包、隐私合规到 Android 国内应用市场、Google Play、iOS 前置事项的完整准备。iOS App Store 的深水区见下一篇《iOS App Store 上架》。

## 总流程

1. 确认 DCloud AppID、应用名称、包名、版本号。
2. 梳理 App 模块、原生 SDK、权限和隐私政策。
3. 配置 Android / iOS 打包信息。
4. 使用云打包或离线打包产出安装包。
5. 真机安装验收，确认首次启动和权限时机。
6. 准备应用市场材料。
7. 提交应用市场审核。
8. 根据驳回报告定位 SDK、权限、隐私、资质或包格式问题。

## manifest 核查

App 端核心配置在 `src/manifest.json` 的 `app-plus` 下：

```json
{
  "app-plus": {
    "modules": {},
    "distribute": {
      "android": {
        "permissions": []
      },
      "ios": {},
      "sdkConfigs": {}
    }
  }
}
```

上线前逐项核查：

- `name`：与应用市场后台名称一致。
- `appid`：DCloud AppID 已绑定当前项目。
- `versionName`：面向用户展示，例如 `1.2.0`。
- `versionCode`：整数递增，Android 市场依赖它判断升级。
- `app-plus.modules`：只勾选真实使用的模块。
- `sdkConfigs`：登录、支付、地图、推送、统计、广告配置完整。
- `android.permissions`：只保留业务必需权限。
- `ios`：Bundle ID、证书、描述文件、权限描述、通用链接等与 Apple 后台一致。

::: warning
很多 Android 市场驳回并不是“代码错”，而是 manifest 勾选了未使用模块、权限过宽、SDK 隐私未披露，或首次启动前 SDK 已采集设备信息。
:::

## 权限治理

上线前做一张权限表：

| 权限 | 使用页面 | 触发动作 | 必需性 | 隐私政策说明 | 可降级方案 |
|------|----------|----------|--------|--------------|------------|
| 相机 | 扫码页 | 点击扫码 | 必需 | 用于扫描二维码 | 手动输入 |
| 相册 | 头像页 | 点击上传头像 | 可选 | 用于选择头像图片 | 使用默认头像 |
| 定位 | 门店页 | 点击附近门店 | 可选 | 用于展示附近服务 | 手动选择城市 |
| 通知 | 设置页 | 开启提醒 | 可选 | 用于订单或日程提醒 | 站内消息 |

规则：

- 不在 `onLaunch`、首页 `onShow`、应用未同意隐私前申请权限。
- 用户拒绝后不要强退，不要循环弹窗。
- 没有业务入口的权限必须删除。
- 第三方 SDK 间接使用的权限也要披露。

## Android 隐私弹窗

DCloud Android 上架文档强调：

- 应用必须有隐私政策。
- 首次启动需要弹出隐私政策并取得同意。
- 建议使用 DCloud 的隐私与政策提示框 `template` 模式。
- 用户同意前，App 和 SDK 不应采集设备信息。

上线实现要点：

1. 隐私弹窗必须早于统计、广告、推送、定位、设备信息读取等 SDK 初始化。
2. “不同意”不能直接让用户无路可走；至少提供二次说明或退出选项。
3. 隐私政策里要清楚列出收集目的、方式、范围、SDK 名称和第三方隐私链接。
4. DCloud App 引擎相关隐私说明按官方文档要求加入隐私政策。
5. 隐私政策 URL 不要加载会读取定位、设备信息或初始化统计的脚本。

### 反例

```ts
onLaunch(() => {
  initAnalytics()
  initPush()
  uni.getLocation()
})
```

问题：

- 用户尚未同意隐私政策。
- 定位不是用户主动触发。
- 推送、统计 SDK 可能提前采集设备信息。

### 正解

- 启动只做最小渲染和隐私状态判断。
- 用户同意后再初始化 SDK。
- 权限放到具体功能按钮后触发。

## 云打包

云打包前检查：

- DCloud 账号登录状态正确。
- AppID 对应当前应用，不要误用 demo AppID。
- Android 包名、iOS Bundle ID 与各市场后台一致。
- 证书、profile、keystore 密码可用。
- 渠道包、广告、推送、登录、支付模块只勾选目标市场需要的能力。
- 生产包关闭调试、mock、测试入口。

打包产物管理：

| 文件 | 用途 | 注意 |
|------|------|------|
| APK | 国内 Android 市场常见格式 | 是否加固、签名、渠道包按市场要求处理 |
| AAB | Google Play 推荐格式 | 提交 Google Play 时按当前后台要求选择 |
| IPA | iOS App Store / TestFlight | 由 App Store Connect 处理，不直接给用户安装 |

## 热更新策略

App 端升级分为整包更新和 wgt 资源更新。新项目建议优先接入 DCloud `uni-upgrade-center`，用同一套后台管理 Android 整包、iOS App Store 跳转和 wgt 热更新。

必须走整包的变更：

- 新增原生模块、SDK、原生插件、UTS 原生代码。
- 修改权限、包名、证书、图标、启动图、URL Scheme、Universal Links。
- 修改 App 隐私采集范围、支付规则、订阅能力。
- wgt 编译器版本与旧包运行时不兼容。

适合 wgt 的变更：

- 修文案、样式、图片、页面逻辑。
- 修接口字段兼容、轻量 JS bug。
- 下线问题入口、调整非敏感展示。

更多灰度、回滚、审核边界见 [App 热更新与升级策略](/guide/uniapp-hot-update)。

## Android 应用市场材料

国内应用市场规则经常变化，不要把某一家的旧规则当通用规则。准备材料时用“通用底稿 + 各市场补充”的方式。

通用底稿：

- 应用名称、包名、版本号、版本说明。
- 应用图标、截图、启动图。
- 一句话简介、详细描述、关键词。
- 隐私政策 URL、用户协议 URL、注销说明。
- 备案信息、软著、商标或授权材料。
- 行业资质：电商、金融、医疗、教育、新闻、直播、游戏等按实际功能准备。
- 测试账号和核心流程说明。
- SDK 清单：SDK 名称、提供方、用途、收集信息、隐私链接。
- 权限清单：权限名、用途、触发时机、是否必需。

市场差异：

| 市场 | 关注点 |
|------|--------|
| 华为 | 备案、隐私合规、权限、SDK、应用行为检测 |
| 小米 | 资质、备案、隐私、权限、特殊行业证明 |
| OPPO | 隐私、资质、权限、应用内容合规 |
| vivo | 隐私、权限、通知、广告、备案 |
| 荣耀 | 备案、资质、权限、隐私政策 |
| Google Play | 目标 SDK、数据安全、权限声明、AAB、广告 ID、账号删除 |

## Google Play 注意

DCloud 上架注意事项中提到，面向 Google Play 时要避免：

- 应用内下载或安装 APK 的行为。
- 勾选安装 APK 相关权限。
- 引导用户安装其他应用。
- 动态加载代码。
- 使用不符合 Google Play 要求的内核或模块。

2026 年实际提交时，以 Google Play Console 当前政策为准，尤其是目标 SDK、数据安全表单、账号删除、广告 ID、权限声明和包格式要求。

## Android 常见驳回

| 驳回 | 处理 |
|------|------|
| 未同意隐私前采集信息 | 使用官方隐私弹窗，延迟 SDK 初始化，复测应用行为记录 |
| 权限过度 | 删除无业务入口权限，调整申请时机，补充用途说明 |
| 隐私政策不完整 | 加入 SDK 清单、权限用途、DCloud 引擎说明、注销和联系方式 |
| 包含广告 SDK 但未披露 | 删除误勾选广告模块或补充广告隐私说明 |
| 应用备案缺失 | 按市场后台要求补备案材料 |
| 资质不全 | 调整类目或补软著、授权、行业许可 |
| 漏洞扫描失败 | 升级 HBuilderX / SDK，重新云打包并按市场要求加固 |

## App 发布清单

- [ ] `versionName`、`versionCode` 已递增。
- [ ] 包名 / Bundle ID 与后台一致。
- [ ] 未使用模块已从 `modules` 和 `sdkConfigs` 移除。
- [ ] 权限清单与业务入口一致。
- [ ] 隐私弹窗早于 SDK 初始化。
- [ ] 隐私政策覆盖 DCloud、三方 SDK、权限、注销、联系方式。
- [ ] Android 真机首次启动无提前采集行为。
- [ ] iOS 真机 / TestFlight 核心流程可走通。
- [ ] 审核账号、测试数据、演示路径已准备。
- [ ] 包、截图、描述、资质材料归档。

## 官方入口

- [DCloud App manifest 配置](https://uniapp.dcloud.net.cn/collocation/manifest-app.html)
- [DCloud App 云端打包环境](https://uniapp.dcloud.net.cn/tutorial/app-env.html)
- [DCloud 应用市场上架注意事项](https://uniapp.dcloud.net.cn/tutorial/store)
- [DCloud Android 国内应用市场上架](https://uniapp.dcloud.net.cn/tutorial/android-store.html)
- [DCloud Android 平台隐私与政策提示框](https://uniapp.dcloud.net.cn/tutorial/app-privacy-android.html)
- [DCloud App 升级中心 uni-upgrade-center](https://doc.dcloud.net.cn/uniCloud/upgrade-center.html)
- [Google Play Console 政策中心](https://play.google.com/console/about/programs/)
