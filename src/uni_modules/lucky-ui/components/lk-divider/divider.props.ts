import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

/**
 * 分割线文字位置
 */
export const DividerTextPosition = {
  Left: 'left',
  Center: 'center',
  Right: 'right',
} as const;

export type DividerTextPosition = (typeof DividerTextPosition)[keyof typeof DividerTextPosition];

export const dividerProps = {
  ...baseProps,

  /** 是否为虚线 */
  dashed: LkProp.boolean(false),

  /** 是否为垂直分割线 */
  vertical: LkProp.boolean(false),

  /** 分割线文字内容 */
  text: LkProp.string(''),

  /** 是否为细线 */
  hairline: LkProp.boolean(true),

  /**
   * 文字位置
   * @value left 左侧
   * @value center 居中
   * @value right 右侧
   * @value 其他 支持百分比(如 '20%', 20) 或 具体像素(如 '50px', 'var(--lk-rpx-100)')
   */
  textPosition: {
    type: [String, Number] as PropType<DividerTextPosition | string | number>,
    default: DividerTextPosition.Center,
  },
} as const;

export type DividerProps = ExtractPropTypes<typeof dividerProps>;
