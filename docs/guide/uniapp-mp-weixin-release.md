# 微信小程序开发到发布

> 最后校准日期：2026-05-25

这篇覆盖 UniApp 发布微信小程序的真实流程：账号准备、配置、隐私、合法域名、构建、自动上传、体验版、提交审核、发布与驳回修复。

## 总流程

1. 注册微信小程序并拿到 AppID。
2. 配置服务类目、主体信息、隐私保护指引、服务器域名。
3. 在 `src/manifest.json` 配置 `mp-weixin.appid`、暗黑模式、组件模式等。
4. 本地运行到微信开发者工具和真机。
5. 构建 `mp-weixin` 产物。
6. 通过微信开发者工具或 miniprogram-ci 上传代码。
7. 在微信公众平台生成体验版，分配体验成员。
8. 提交审核，按类目和功能补齐材料。
9. 审核通过后全量发布或灰度发布。

## 账号与后台准备

| 项目 | 要求 | 常见坑 |
|------|------|--------|
| AppID | 使用正式小程序 AppID | 测试号不能提交正式审核 |
| 主体 | 与业务、隐私政策、备案主体一致 | 公司名、品牌名、服务主体不一致会触发补充材料 |
| 服务类目 | 覆盖小程序实际能力 | 医疗、教育、金融、社交、电商等类目需要资质 |
| 隐私保护指引 | 后台完成并覆盖 API / SDK | 前端弹隐私授权不等于后台指引已配置 |
| 服务器域名 | 配置 request/upload/download/socket | 开发者工具可跳过，真机和审核不能跳过 |
| 体验成员 | 添加产品、测试、审核前自测账号 | 未加入体验成员无法打开体验版 |

## UniApp 配置

在 `src/manifest.json` 中维护微信小程序配置：

```json
{
  "mp-weixin": {
    "appid": "wx0000000000000000",
    "darkmode": true,
    "themeLocation": "theme.json",
    "usingComponents": true,
    "setting": {
      "urlCheck": true,
      "ignoreDevUnusedFiles": false,
      "ignoreUploadUnusedFiles": true
    }
  }
}
```

建议：

- 正式提审前把 `urlCheck` 恢复为符合线上要求的状态。
- `ignoreUploadUnusedFiles` 可减少上传体积，但必须确认静态资源没有被动态路径引用。
- `project.config.json` 由构建产物生成后再进入微信开发者工具，不要手工改产物再回填源码。

## 合法域名

微信小程序网络域名需要在后台配置：

- `request`：接口请求域名。
- `uploadFile`：文件上传域名。
- `downloadFile`：文件下载、图片、文档域名。
- `socket`：WebSocket 域名。

上线标准：

- 全部使用 HTTPS / WSS。
- 证书链完整，域名与证书匹配。
- 不使用 IP、局域网、临时测试域名。
- 不依赖 302 到未配置域名。
- CDN 图片如果通过 `downloadFile` 或文件能力访问，也要确认域名策略。

::: warning
开发者工具里的“不校验合法域名”只能用于本地调试。体验版、真机、审核和正式版都应按后台域名配置验收。
:::

## 隐私保护指引

微信小程序涉及用户信息、相册、位置、摄像头、录音、蓝牙、通讯录、剪贴板等能力时，需要同步处理三层合规：

1. 微信公众平台后台的用户隐私保护指引。
2. 小程序内的隐私授权流程。
3. 业务页面对权限用途的解释和降级。

推荐流程：

```ts
export async function ensurePrivacyReady() {
  // #ifdef MP-WEIXIN
  const setting = await wx.getPrivacySetting?.()
  if (setting?.needAuthorization) {
    await wx.requirePrivacyAuthorize?.()
  }
  // #endif
}
```

实战注意：

- 隐私授权应出现在用户进入相关功能前，不要在首页无差别弹出。
- 后台指引里声明的用途必须与页面实际用途一致。
- 接入第三方 SDK 时，要把 SDK 采集项纳入隐私说明。
- 审核账号必须能看到完整隐私协议、用户协议和注销入口。

## 构建与上传

本项目已经有脚本：

```bash
pnpm run dev:mp-weixin
pnpm run build:mp-weixin
```

手动上传：

1. 运行 `pnpm run build:mp-weixin`。
2. 打开微信开发者工具。
3. 导入 `unpackage/dist/build/mp-weixin`。
4. 使用正式 AppID，确认编译模式。
5. 预览真机，确认核心链路。
6. 点击上传，填写版本号和项目备注。

自动上传：

DCloud 文档说明 HBuilderX 支持通过微信小程序 CI 自动上传。自动上传需要：

- 微信小程序 AppID。
- 上传密钥。
- `privateKey` 或 `privateKeyPath`。
- 如开启 IP 白名单，需要在微信平台配置构建机出口 IP。
- CI 机器人编号；DCloud 文档标注微信 CI 机器人编号支持 HBuilderX 3.6.18+。

miniprogram-ci 典型配置：

```js
const ci = require('miniprogram-ci')

const project = new ci.Project({
  appid: 'wx0000000000000000',
  type: 'miniProgram',
  projectPath: 'unpackage/dist/build/mp-weixin',
  privateKeyPath: './keys/private.wx.key',
  ignores: ['node_modules/**/*'],
})

ci.upload({
  project,
  version: '1.0.0',
  desc: 'release: 1.0.0',
  robot: 1,
})
```

密钥管理要求：

- 上传密钥不能进 Git。
- CI 只放加密密钥或通过平台 secret 注入。
- IP 白名单开启后，本地上传和云端上传出口不同，要分别配置。
- 机器人编号要和发布通道绑定，例如 `1` 内测、`2` 预发、`3` 正式候选。

## 体验版验收

体验版不是走马观花，至少验证：

| 场景 | 核查 |
|------|------|
| 首次打开 | 隐私弹窗、冷启动、首屏接口、默认路由 |
| 登录 | 微信登录、手机号授权、游客态、登录失败 |
| 网络 | 弱网、断网、接口 401/403/500、超时重试 |
| 分享 | 分享标题、路径参数、海报、落地页 |
| 文件 | 上传、下载、预览、大小限制 |
| 支付 | 支付前校验、取消支付、失败回退、订单状态同步 |
| 权限 | 拒绝权限、再次授权、无权限降级 |
| 分包 | 首次进入分包、返回首页、分享直达分包页 |

## 提交审核

提交审核前准备：

- 审核版本号、版本描述。
- 服务类目和资质材料。
- 可登录审核账号，账号不要绑定内部 IP、企业微信、短信白名单。
- 核心功能路径说明，尤其是隐藏入口、付费功能、企业认证功能。
- 隐私政策和用户协议 URL。
- 如有支付、电商、直播、内容发布、UGC、医疗、金融等功能，提前准备资质。

审核备注建议写清：

```text
审核账号：review@example.com
密码：请在后台查看提审专用密码
核心路径：首页 -> 登录 -> 功能 A -> 提交表单
测试数据：选择“演示门店”，不要使用真实支付；支付页可走 0.01 元测试商品
需要权限：相机用于扫码；相册用于上传头像；定位用于附近门店
```

## 发布策略

- 审核通过后先灰度给内部用户或低比例用户。
- 观察接口错误率、登录成功率、支付成功率、首屏耗时。
- 如发现问题，优先使用后台开关降级；不能降级时回滚到上一稳定版本。
- 正式发布后记录发布时间、版本号、构建号、审核结论。

## 常见驳回

| 驳回点 | 根因 | 处理 |
|--------|------|------|
| 类目不符 | 实际功能超出服务类目 | 调整类目或移除功能后再审 |
| 隐私不完整 | 后台指引、弹窗、协议不一致 | 对齐 API、SDK、权限用途 |
| 无法登录 | 审核账号受限或验证码不可用 | 准备固定审核账号和测试数据 |
| 页面空白 | 合法域名、证书、分包路径、接口异常 | 真机体验版复现，补错误页 |
| 功能不可用 | 依赖内部网络、灰度开关未开 | 提审前创建审核白名单 |
| 诱导分享 | 分享文案或奖励机制不合规 | 移除强制分享、诱导利益 |

## 官方入口

- [DCloud uni-app 发行到微信小程序](https://uniapp.dcloud.net.cn/tutorial/build/publish-mp-weixin-cli.html)
- [DCloud uni-app 快速上手：发布为小程序](https://uniapp.dcloud.net.cn/quickstart-hx.html)
- [微信小程序 CI](https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html)
- [微信小程序用户隐私保护指引](https://developers.weixin.qq.com/miniprogram/dev/framework/user-privacy/)
- [微信小程序网络能力](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html)
- [微信开发者工具 project.config.json](https://developers.weixin.qq.com/miniprogram/dev/devtools/projectconfig.html)
