import type { ExtractPropTypes } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const CurtainClosePosition = {
  TopLeft: 'top-left',
  TopRight: 'top-right',
  BottomLeft: 'bottom-left',
  BottomRight: 'bottom-right',
  Bottom: 'bottom',
} as const;

export type CurtainClosePosition = (typeof CurtainClosePosition)[keyof typeof CurtainClosePosition];

export const CurtainClosePositions = [
  CurtainClosePosition.TopLeft,
  CurtainClosePosition.TopRight,
  CurtainClosePosition.BottomLeft,
  CurtainClosePosition.BottomRight,
  CurtainClosePosition.Bottom,
] as const;

export const CurtainImageModes = [
  'scaleToFill',
  'aspectFit',
  'aspectFill',
  'widthFix',
  'heightFix',
  'top',
  'bottom',
  'center',
  'left',
  'right',
  'top left',
  'top right',
  'bottom left',
  'bottom right',
] as const;

export type CurtainImageMode = (typeof CurtainImageModes)[number];

export const CurtainLinkTypes = [
  'navigateTo',
  'redirectTo',
  'reLaunch',
  'switchTab',
  'navigateBack',
] as const;

export type CurtainLinkType = (typeof CurtainLinkTypes)[number];

export const curtainProps = {
  ...baseProps,

  /**
   * 层级 (覆盖 baseProps 默认值)
   */
  zIndex: LkProp.number(10090),
  /**
   * 是否显示幕帘
   */
  modelValue: LkProp.boolean(false),
  /**
   * 幕帘图片地址
   */
  imageUrl: LkProp.string(''),
  /**
   * 图片裁剪模式
   */
  imageMode: LkProp.enum(CurtainImageModes, 'widthFix', 'Curtain.imageMode'),
  /**
   * 图片宽度
   */
  width: LkProp.stringNumber('var(--lk-rpx-600)'),
  /**
   * 图片高度
   */
  height: LkProp.stringNumber(''),
  /**
   * 关闭按钮位置
   * @default 'bottom'
   */
  closePosition: LkProp.enum(
    CurtainClosePositions,
    CurtainClosePosition.Bottom,
    'Curtain.closePosition'
  ),
  /**
   * 关闭按钮偏移距离（角位）
   */
  closeOffset: LkProp.stringNumber('var(--lk-rpx-24)'),
  /**
   * 关闭按钮偏移距离（底部位）
   */
  closeOffsetBottom: LkProp.stringNumber('var(--lk-rpx-80)'),
  /**
   * 点击遮罩层是否关闭
   */
  closeOnOverlay: LkProp.boolean(false),
  /**
   * 链接跳转地址
   */
  link: LkProp.string(''),
  /**
   * 小程序端复制链接成功提示
   */
  copySuccessText: LkProp.string(''),
  /**
   * 链接跳转类型
   */
  linkType: LkProp.enum(CurtainLinkTypes, 'navigateTo', 'Curtain.linkType'),
};

export type CurtainProps = ExtractPropTypes<typeof curtainProps>;

export const curtainEmits = {
  'update:modelValue': (show: boolean) => typeof show === 'boolean',
  close: () => true,
  click: () => true,
  'click-overlay': () => true,
};
