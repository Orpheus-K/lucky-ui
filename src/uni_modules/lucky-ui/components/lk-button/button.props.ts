import type { ExtractPropTypes } from 'vue';
import { baseProps, LkProp } from '../common/props';

/**
 * 按钮变体
 */
export const ButtonVariant = {
  Solid: 'solid',
  Outline: 'outline',
  Text: 'text',
  Soft: 'soft',
} as const;

/**
 * 按钮尺寸
 */
export const ButtonSize = {
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
} as const;

/**
 * 按钮形状
 */
export const ButtonShape = {
  Default: 'default',
  Square: 'square',
  Round: 'round',
  Circle: 'circle',
} as const;

/**
 * 原生按钮类型
 */
export const ButtonNativeType = {
  Button: 'button',
  Submit: 'submit',
  Reset: 'reset',
} as const;

/**
 * 原生开放能力
 */
export const ButtonOpenType = {
  None: '',
  Feedback: 'feedback',
  Share: 'share',
  GetUserInfo: 'getUserInfo',
  Contact: 'contact',
  GetPhoneNumber: 'getPhoneNumber',
  GetRealtimePhoneNumber: 'getRealtimePhoneNumber',
  LaunchApp: 'launchApp',
  OpenSetting: 'openSetting',
  ChooseAvatar: 'chooseAvatar',
  AgreePrivacyAuthorization: 'agreePrivacyAuthorization',
  UploadDouyinVideo: 'uploadDouyinVideo',
  Im: 'im',
  GetAuthorize: 'getAuthorize',
  Lifestyle: 'lifestyle',
  ContactShare: 'contactShare',
  OpenGroupProfile: 'openGroupProfile',
  OpenGuildProfile: 'openGuildProfile',
  ChooseInvoiceTitle: 'chooseInvoiceTitle',
  Login: 'login',
  Subscribe: 'subscribe',
  Favorite: 'favorite',
  WatchLater: 'watchLater',
  OpenProfile: 'openProfile',
  AddGroupApp: 'addGroupApp',
  ChooseAddress: 'chooseAddress',
} as const;

export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];
export type ButtonSize = (typeof ButtonSize)[keyof typeof ButtonSize];
export type ButtonShape = (typeof ButtonShape)[keyof typeof ButtonShape];
export type ButtonNativeType = (typeof ButtonNativeType)[keyof typeof ButtonNativeType];
export type ButtonOpenType = (typeof ButtonOpenType)[keyof typeof ButtonOpenType];

export const buttonProps = {
  ...baseProps,

  /**
   * 按钮变体
   * @value solid 实体按钮
   * @value outline 轮廓按钮
   * @value text 文字按钮
   * @value soft 柔和按钮
   */
  variant: LkProp.enum(Object.values(ButtonVariant), ButtonVariant.Solid, 'Button.variant'),

  /**
   * 按钮尺寸
   * @value sm 小尺寸
   * @value md 中等尺寸
   * @value lg 大尺寸
   */
  size: LkProp.enum(Object.values(ButtonSize), ButtonSize.Md, 'Button.size'),

  /**
   * 按钮形状
   * @value default 默认圆角
   * @value square 直角
   * @value round 胶囊形
   * @value circle 圆形
   */
  shape: LkProp.enum(Object.values(ButtonShape), ButtonShape.Default, 'Button.shape'),

  /** 是否为加载状态 */
  loading: LkProp.boolean(false),

  /** 是否为禁用状态 */
  disabled: LkProp.boolean(false),

  /** 是否为块级按钮 */
  block: LkProp.boolean(false),

  /** 是否填满父容器 */
  fill: LkProp.boolean(false),

  /** 图标类名 */
  icon: LkProp.string(''),

  /**
   * 原生按钮类型
   * @value button 普通按钮
   * @value submit 提交按钮
   * @value reset 重置按钮
   */
  nativeType: LkProp.enum(
    Object.values(ButtonNativeType),
    ButtonNativeType.Button,
    'Button.nativeType'
  ),

  /**
   * 原生开放能力，对应 uni-app button 的 open-type
   */
  openType: LkProp.enum(Object.values(ButtonOpenType), ButtonOpenType.None, 'Button.openType'),

  /** 指定按钮按下去的样式类，none 表示无点击态 */
  hoverClass: LkProp.string('button-hover'),

  /** 按住后多久出现点击态，单位 ms */
  hoverStartTime: LkProp.number(20),

  /** 手指松开后点击态保留时间，单位 ms */
  hoverStayTime: LkProp.number(70),

  /** 打开 App 时传递的参数，open-type="launchApp" 时有效 */
  appParameter: LkProp.string(''),

  /** 指定返回用户信息的语言 */
  lang: LkProp.string('en'),

  /** 会话来源，open-type="contact" 时有效 */
  sessionFrom: LkProp.string(''),

  /** 会话内消息卡片标题，open-type="contact" 时有效 */
  sendMessageTitle: LkProp.string(''),

  /** 会话内消息卡片点击跳转路径，open-type="contact" 时有效 */
  sendMessagePath: LkProp.string(''),

  /** 会话内消息卡片图片，open-type="contact" 时有效 */
  sendMessageImg: LkProp.string(''),

  /** 是否显示会话内消息卡片，open-type="contact" 时有效 */
  showMessageCard: LkProp.boolean(false),

  /** QQ 群号，open-type="openGroupProfile" 时有效 */
  groupId: LkProp.string(''),

  /** QQ 频道 ID，open-type="openGuildProfile" 时有效 */
  guildId: LkProp.string(''),

  /** 生活号 ID，生活号 open-type="lifestyle" 时有效 */
  publicId: LkProp.string(''),

  /** 授权范围，支付宝小程序 open-type="getAuthorize" 时有效 */
  scope: LkProp.string(''),

  /** 是否开启水波纹效果 */
  ripple: LkProp.boolean(true),
} as const;

export const buttonEmits = {
  click: (event: unknown) => event !== undefined,
  getuserinfo: (event: unknown) => event !== undefined,
  getphonenumber: (event: unknown) => event !== undefined,
  getrealtimephonenumber: (event: unknown) => event !== undefined,
  error: (event: unknown) => event !== undefined,
  opensetting: (event: unknown) => event !== undefined,
  launchapp: (event: unknown) => event !== undefined,
  contact: (event: unknown) => event !== undefined,
  chooseavatar: (event: unknown) => event !== undefined,
  agreeprivacyauthorization: (event: unknown) => event !== undefined,
  addgroupapp: (event: unknown) => event !== undefined,
  chooseaddress: (event: unknown) => event !== undefined,
  chooseinvoicetitle: (event: unknown) => event !== undefined,
  subscribe: (event: unknown) => event !== undefined,
  login: (event: unknown) => event !== undefined,
  im: (event: unknown) => event !== undefined,
};

export type ButtonProps = ExtractPropTypes<typeof buttonProps>;
