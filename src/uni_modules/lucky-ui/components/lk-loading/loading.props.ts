import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

/**
 * 加载动画类型
 */
export const LoadingVariant = {
  Spinner: 'spinner',
  Circular: 'circular',
  Dots: 'dots',
  Bar: 'bar',
  Bounce: 'bounce',
  Wave: 'wave',
  Ring: 'ring',
  Ellipsis: 'ellipsis',
  Text: 'text',
} as const;

export type LoadingVariant = (typeof LoadingVariant)[keyof typeof LoadingVariant];

export const loadingProps = {
  ...baseProps,

  /** 图标大小 */
  size: {
    type: [String, Number] as PropType<string | number>,
    default: '40',
  },

  /** 图标颜色 */
  color: LkProp.string('var(--lk-color-primary)'),

  /**
   * 动画类型
   * @value spinner 转圈
   * @value circular 圆形
   * @value dots 点状
   */
  variant: LkProp.enum(Object.values(LoadingVariant), LoadingVariant.Spinner, 'Loading.variant'),

  /** 是否垂直排列 */
  vertical: LkProp.boolean(false),

  /** 是否显示轨道（仅对 circular/spinner 有效） */
  showTrack: LkProp.boolean(true),

  /** 轨道颜色 */
  trackColor: LkProp.string(''),

  /** 加载文字 */
  text: LkProp.string(''),
} as const;

export type LoadingProps = ExtractPropTypes<typeof loadingProps>;
