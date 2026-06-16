import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const skeletonProps = {
  ...baseProps,

  /** 是否加载中 */
  loading: LkProp.boolean(true),

  /** 是否显示头像 */
  avatar: LkProp.boolean(false),

  /** 头像大小 */
  avatarSize: LkProp.string('var(--lk-rpx-72)'),

  /** 是否显示标题 */
  title: LkProp.boolean(false),

  /** 标题宽度 */
  titleWidth: LkProp.string('40%'),

  /** 标题高度 */
  titleHeight: LkProp.string('var(--lk-rpx-32)'),

  /** 行数 */
  rows: LkProp.number(3),

  /** 行宽度 */
  rowWidth: {
    type: [String, Array] as PropType<string | string[]>,
    default: '100%',
  },

  /** 行高度 */
  rowHeight: {
    type: [String, Array] as PropType<string | string[]>,
    default: 'var(--lk-rpx-32)',
  },

  /** 是否开启动画 */
  animated: LkProp.boolean(true),

  /** 是否圆角 */
  round: LkProp.boolean(false),

  /** 动画时长（秒） */
  duration: {
    type: [Number, String] as PropType<number | string>,
    default: 2.4,
  },

  /** 动画缓动函数 */
  easing: LkProp.string('ease-in-out'),
} as const;

export type SkeletonProps = ExtractPropTypes<typeof skeletonProps>;
