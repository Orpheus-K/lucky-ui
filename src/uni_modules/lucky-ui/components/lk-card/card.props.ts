import type { ExtractPropTypes } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const cardProps = {
  ...baseProps,

  /** 标题 */
  title: LkProp.string(''),

  /** 副标题 */
  subTitle: LkProp.string(''),

  /** 内边距 */
  padding: LkProp.string('var(--lk-rpx-32)'),

  /** 是否显示边框 */
  border: LkProp.boolean(false),

  /** 阴影强度 */
  shadow: LkProp.enum(['none', 'never', 'sm', 'md', 'base', 'lg'] as const, 'sm', 'Card.shadow'),

  /** 自定义背景色（传入空字符串表示使用默认） */
  bgColor: LkProp.string(''),

  /** 透明背景 */
  transparent: LkProp.boolean(false),

  /** 是否开启波纹效果 */
  ripple: LkProp.boolean(false),

  /** 内容溢出策略 */
  overflow: LkProp.enum(['hidden', 'visible'] as const, 'hidden', 'Card.overflow'),
} as const;

export type CardProps = ExtractPropTypes<typeof cardProps>;

export const cardEmits = {
  click: (_event?: unknown) => true,
  'header-click': (_event?: unknown) => true,
  'footer-click': (_event?: unknown) => true,
};
