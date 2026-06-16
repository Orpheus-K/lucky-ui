import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export type NumberRollerFormatter = (value: number | string) => string | number;

export const numberRollerProps = {
  ...baseProps,

  /** 最终展示的数值 */
  value: {
    type: [Number, String] as PropType<number | string>,
    default: 0,
  },

  /** 动画时长（ms） */
  speed: {
    type: Number,
    default: 800,
  },

  /** 缓动曲线 */
  easing: LkProp.string('cubic-bezier(0.33, 1, 0.68, 1)'),

  /** 单个数字视窗高度（rpx） */
  digitHeight: {
    type: Number,
    default: 56,
  },

  /** 小数位数，null 表示跟随原始值 */
  decimals: {
    type: Number as PropType<number | null>,
    default: null,
  },

  /** 是否自动添加千分位分隔 */
  grouping: LkProp.boolean(true),

  /** 千分位分隔符 */
  groupSeparator: LkProp.string(','),

  /** 小数分隔符 */
  decimalSeparator: LkProp.string('.'),

  /** 是否启用滚动动画 */
  autoplay: LkProp.boolean(true),

  /** 自定义格式化函数，返回字符串或数字 */
  formatter: {
    type: Function as unknown as PropType<NumberRollerFormatter | null>,
    default: null,
  },
} as const;

export type NumberRollerProps = ExtractPropTypes<typeof numberRollerProps>;
