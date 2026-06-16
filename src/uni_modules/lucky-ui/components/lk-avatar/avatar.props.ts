import type { ExtractPropTypes } from 'vue';
import { baseProps, LkProp } from '../common/props';

/**
 * Avatar 形状
 * @value circle 圆形
 * @value square 方形
 * @value rounded 圆角方形
 */
export const AvatarShape = {
  Circle: 'circle',
  Square: 'square',
  Rounded: 'rounded',
} as const;

export type AvatarShape = (typeof AvatarShape)[keyof typeof AvatarShape];

export const avatarProps = {
  ...baseProps,

  /**
   * 头像形状
   * @value circle 圆形
   * @value square 方形
   * @value rounded 圆角方形
   */
  shape: LkProp.enum(Object.values(AvatarShape), AvatarShape.Circle, 'Avatar.shape'),

  /** 头像尺寸，默认中等（64），数字默认按 rpx 处理，也可传 32px/2rem 等 */
  size: LkProp.stringNumber(64),

  /** 头像图片地址 */
  src: LkProp.string(''),

  /** 图片加载失败时显示的替代文本 */
  alt: LkProp.string(''),

  /** 头像背景（支持纯色/渐变，如 linear-gradient(...)） */
  bg: LkProp.string(''),

  /** 自定义圆角大小，数字默认按 rpx 处理 */
  radius: LkProp.stringNumber(''),

  /** 头像文字 */
  text: LkProp.string(''),

  /** 文字颜色 */
  color: LkProp.string(''),
} as const;

export type AvatarProps = ExtractPropTypes<typeof avatarProps>;
