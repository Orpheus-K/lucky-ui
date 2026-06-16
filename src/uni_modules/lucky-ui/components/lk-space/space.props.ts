import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

// 预设间距类型
export type SpaceGap = number | string | [number | string, number | string] | 'sm' | 'md' | 'lg';

export const SpaceDirection = {
  Horizontal: 'horizontal',
  Vertical: 'vertical',
} as const;

export const SpaceAlign = {
  Start: 'start',
  Center: 'center',
  End: 'end',
  Baseline: 'baseline',
  Stretch: 'stretch',
} as const;

export const spaceProps = {
  ...baseProps,

  /**
   * 间距大小 (替代原 size)
   * @description
   * - 传入数字: 默认为 rpx
   * - 传入数组 [水平间距, 垂直间距]
   * - 传入字符串: 'sm'|'md'|'lg' 或带单位的 '10px'
   */
  gap: {
    type: [Number, Array, String] as PropType<SpaceGap>,
    default: 'md',
  },

  /** 方向: horizontal 水平, vertical 垂直 */
  direction: LkProp.enum(
    Object.values(SpaceDirection),
    SpaceDirection.Horizontal,
    'Space.direction'
  ),

  /** 对齐方式: start, center, end, baseline, stretch */
  align: {
    type: String as PropType<(typeof SpaceAlign)[keyof typeof SpaceAlign]>,
    required: false,
    validator: (v: unknown) => !v || (Object.values(SpaceAlign) as string[]).includes(String(v)),
  },

  /** 是否换行 */
  wrap: LkProp.boolean(false),

  /** 是否填满父容器宽度 */
  fill: LkProp.boolean(false),
} as const;

export type SpaceProps = ExtractPropTypes<typeof spaceProps>;
