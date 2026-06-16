---
title: Button 按钮
phone: button
---

# Button 按钮

用于触发操作的按钮，支持多种变体、尺寸与形状。

## 交互式调试

<PropsPlayground
  component="button"
  :props-def="[
    { key: 'variant', type: 'enum', label: '按钮变体', values: ['solid', 'outline', 'text', 'soft'], default: 'solid' },
    { key: 'size', type: 'enum', label: '按钮尺寸', values: ['sm', 'md', 'lg'], default: 'md' },
    { key: 'shape', type: 'enum', label: '按钮形状', values: ['default', 'square', 'round', 'circle'], default: 'default' },
    { key: 'loading', type: 'boolean', label: '加载状态', default: false },
    { key: 'disabled', type: 'boolean', label: '禁用状态', default: false },
    { key: 'block', type: 'boolean', label: '块级按钮', default: false },
    { key: 'fill', type: 'boolean', label: '填满父容器', default: false },
  ]"
  slot-content="按钮文字"
/>

## 基础用法

```vue
<template>
  <view class="demo-row">
    <lk-button>默认按钮</lk-button>
    <lk-button variant="outline">描边按钮</lk-button>
    <lk-button variant="soft">柔和按钮</lk-button>
    <lk-button variant="text">文字按钮</lk-button>
  </view>
</template>
```

## 尺寸

```vue
<template>
  <view class="demo-row">
    <lk-button size="sm">小</lk-button>
    <lk-button size="md">中（默认）</lk-button>
    <lk-button size="lg">大</lk-button>
  </view>
  <lk-button block size="lg" shape="round" style="margin-top:24rpx">
    块级胶囊按钮
  </lk-button>
</template>
```

## 形状

```vue
<template>
  <view class="demo-row">
    <lk-button shape="default">默认圆角</lk-button>
    <lk-button shape="square">直角</lk-button>
    <lk-button shape="round">胶囊</lk-button>
    <lk-button shape="circle">
      <lk-icon name="plus" />
    </lk-button>
  </view>
</template>
```

## 加载与禁用

```vue
<script setup lang="ts">
import { ref } from 'vue'
const loading = ref(false)
function submit() {
  loading.value = true
  setTimeout(() => { loading.value = false }, 2000)
}
</script>

<template>
  <view class="demo-row">
    <lk-button :loading="loading" @click="submit">
      {{ loading ? '提交中...' : '点击提交' }}
    </lk-button>
    <lk-button disabled>已禁用</lk-button>
  </view>
</template>
```

## 图标按钮

```vue
<template>
  <view class="demo-row">
    <lk-button icon="search">搜索</lk-button>
    <lk-button variant="outline" icon="download">下载</lk-button>
    <lk-button shape="circle" variant="soft">
      <lk-icon name="heart" />
    </lk-button>
  </view>
</template>
```

## 原生开放能力

`openType` 透传到 UniApp 原生 `button` 的 `open-type`，用于小程序分享、授权、客服、手机号、头像等开放能力。开放能力存在平台差异，实际可用范围以当前平台基础库为准。

```vue
<template>
  <view class="demo-row">
    <lk-button open-type="share">分享</lk-button>
    <lk-button
      open-type="getPhoneNumber"
      @getphonenumber="onPhoneNumber"
    >
      获取手机号
    </lk-button>
    <lk-button
      open-type="chooseAvatar"
      @chooseavatar="onChooseAvatar"
    >
      获取头像
    </lk-button>
  </view>
</template>
```

## 表单提交

```vue
<template>
  <form @submit="submit" @reset="reset">
    <lk-button native-type="submit">提交</lk-button>
    <lk-button variant="outline" native-type="reset">重置</lk-button>
  </form>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| fill | 是否填满父容器 | `boolean` | - | `false` |
| variant | 按钮变体 | `string` | `solid / outline / soft / text` | `solid` |
| size | 按钮尺寸 | `string` | `sm / md / lg` | `md` |
| shape | 按钮形状 | `string` | `default / square / round / circle` | `default` |
| disabled | 是否禁用 | `boolean` | — | `false` |
| loading | 是否加载中，加载时禁止点击与开放能力事件 | `boolean` | — | `false` |
| block | 是否块级 | `boolean` | — | `false` |
| icon | 左侧图标名称 | `string` | — | `''` |
| nativeType | 表单行为，对应原生 `form-type` | `string` | `button / submit / reset` | `button` |
| openType | 开放能力，对应原生 `open-type` | `string` | 见下方 OpenType | `''` |
| hoverClass | 按下态样式类，`none` 表示无点击态 | `string` | — | `button-hover` |
| hoverStartTime | 按住后多久出现点击态，单位 ms | `number` | — | `20` |
| hoverStayTime | 松手后点击态保留时间，单位 ms | `number` | — | `70` |
| appParameter | 打开 App 传参，`openType="launchApp"` 时有效 | `string` | — | `''` |
| lang | 返回用户信息的语言 | `string` | — | `en` |
| sessionFrom | 会话来源，`openType="contact"` 时有效 | `string` | — | `''` |
| sendMessageTitle | 会话内消息卡片标题 | `string` | — | `''` |
| sendMessagePath | 会话内消息卡片跳转路径 | `string` | — | `''` |
| sendMessageImg | 会话内消息卡片图片 | `string` | — | `''` |
| showMessageCard | 是否显示会话内消息卡片 | `boolean` | — | `false` |
| groupId | QQ 群号，`openType="openGroupProfile"` 时有效 | `string` | — | `''` |
| guildId | QQ 频道 ID，`openType="openGuildProfile"` 时有效 | `string` | — | `''` |
| publicId | 生活号 ID，`openType="lifestyle"` 时有效 | `string` | — | `''` |
| scope | 授权范围，支付宝小程序 `openType="getAuthorize"` 时有效 | `string` | — | `''` |
| id | 根节点 id | `string` | — | `''` |
| customClass | 额外类名 | `string / object / array` | — | `''` |
| customStyle | 额外样式 | `string / object` | — | `''` |

### OpenType

| 值 | 说明 | 主要平台 |
|----|------|----------|
| share | 触发分享 | 多数小程序 |
| getUserInfo | 获取用户信息 | 微信、QQ、百度、快手、京东、小红书小程序 |
| getPhoneNumber | 获取手机号 | 微信等小程序 |
| getRealtimePhoneNumber | 实时获取手机号 | 微信小程序 |
| contact | 打开客服会话 | 微信、QQ、百度、快手小程序 |
| launchApp | 从小程序打开 App | 微信、QQ、快手、京东小程序 |
| openSetting | 打开授权设置页 | 微信、QQ、百度、快手、京东、小红书小程序 |
| chooseAvatar | 获取用户头像 | 微信、支付宝小程序 |
| agreePrivacyAuthorization | 用户同意隐私协议 | 微信小程序 |
| feedback | 打开意见反馈 | App、微信、QQ小程序 |
| uploadDouyinVideo | 发布抖音视频 | 抖音小程序 |
| im | 跳转抖音 IM 客服 | 抖音小程序 |
| getAuthorize | 支付宝授权 | 支付宝小程序 |
| lifestyle | 关注生活号 | 支付宝小程序 |
| contactShare | 分享到通讯录好友 | 支付宝小程序 |
| openGroupProfile | 打开 QQ 群资料卡 | QQ 小程序 |
| openGuildProfile | 打开 QQ 频道 | QQ 小程序 |
| chooseInvoiceTitle | 选择发票抬头 | 百度小程序 |
| login | 登录回调 | 百度小程序 |
| subscribe | 订阅消息授权 | 百度小程序 |
| favorite | 触发收藏 | 快手小程序 |
| watchLater | 触发稍后再看 | 快手小程序 |
| openProfile | 打开用户主页 | 快手小程序 |
| addGroupApp | 添加群应用 | QQ 小程序 |
| chooseAddress | 选择收货地址 | 百度小程序 |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 非禁用、非加载状态下点击时触发 | `(event: Event)` |
| getuserinfo | 获取用户信息回调，`openType="getUserInfo"` 时有效 | `(event: Event)` |
| getphonenumber | 获取手机号回调，`openType="getPhoneNumber"` 时有效 | `(event: Event)` |
| getrealtimephonenumber | 实时获取手机号回调，`openType="getRealtimePhoneNumber"` 时有效 | `(event: Event)` |
| contact | 客服消息回调，`openType="contact"` 时有效 | `(event: Event)` |
| error | 开放能力错误回调，通常在 `openType="launchApp"` 时有效 | `(event: Event)` |
| opensetting | 授权设置页关闭后回调，`openType="openSetting"` 时有效 | `(event: Event)` |
| launchapp | 打开 App 成功回调，`openType="launchApp"` 时有效 | `(event: Event)` |
| chooseavatar | 获取头像回调，`openType="chooseAvatar"` 时有效 | `(event: Event)` |
| agreeprivacyauthorization | 同意隐私协议回调，`openType="agreePrivacyAuthorization"` 时有效 | `(event: Event)` |
| addgroupapp | 添加群应用回调，`openType="addGroupApp"` 时有效 | `(event: Event)` |
| chooseaddress | 选择收货地址回调，`openType="chooseAddress"` 时有效 | `(event: Event)` |
| chooseinvoicetitle | 选择发票抬头回调，`openType="chooseInvoiceTitle"` 时有效 | `(event: Event)` |
| subscribe | 订阅消息授权回调，`openType="subscribe"` 时有效 | `(event: Event)` |
| login | 登录回调，`openType="login"` 时有效 | `(event: Event)` |
| im | 跳转 IM 成功回调，`openType="im"` 时有效 | `(event: Event)` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 按钮内容 |

## 注意事项

::: tip
`disabled` 或 `loading` 为 `true` 时，按钮会禁用原生 `button`，不会触发 `click` 与开放能力事件。
:::

::: warning
开放能力事件只在对应平台与对应 `openType` 下生效。H5、App、小程序之间存在实现差异，请以 UniApp 原生 `button` 的平台能力为准。
:::
