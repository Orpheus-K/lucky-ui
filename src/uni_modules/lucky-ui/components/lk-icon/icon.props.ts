import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const IconBoxShape = {
  Rounded: 'rounded',
  Circle: 'circle',
  Square: 'square',
} as const;

export type IconBoxShape = (typeof IconBoxShape)[keyof typeof IconBoxShape];

export const iconProps = {
  ...baseProps,

  /** 图标名称 */
  name: {
    type: String,
    required: true as const,
    default: '',
  },

  /** 图标颜色 */
  color: LkProp.string(''),

  /** 图标大小 */
  size: {
    type: [String, Number] as PropType<string | number>,
    default: '',
  },

  /** 是否启用图标背景容器 */
  box: LkProp.boolean(false),

  /** 背景容器尺寸，数字默认按 rpx 处理；留空时根据 size 自动推导 */
  boxSize: LkProp.stringNumber(''),

  /** 背景容器颜色；语义色会使用对应浅底色 */
  boxColor: LkProp.string(''),

  /** 背景容器圆角，数字默认按 rpx 处理 */
  boxRadius: LkProp.stringNumber(''),

  /** 背景容器形状 */
  boxShape: LkProp.enum(Object.values(IconBoxShape), IconBoxShape.Rounded, 'Icon.boxShape'),
} as const;

export const iconEmits = {
  click: (event: Event) => !!event,
};

export type IconProps = ExtractPropTypes<typeof iconProps>;
