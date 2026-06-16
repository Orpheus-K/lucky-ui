import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

/**
 * 徽章类型
 */
export const BadgeType = {
  Primary: 'primary',
  Success: 'success',
  Warning: 'warning',
  Danger: 'danger',
  Info: 'info',
} as const;

export type BadgeType = (typeof BadgeType)[keyof typeof BadgeType];

export const badgeProps = {
  ...baseProps,

  /** 徽章内容 */
  value: {
    type: [Number, String] as PropType<number | string>,
    default: '',
  },

  /** 最大值，超过则显示 {max}+ */
  max: LkProp.number(99),

  /** 是否显示为圆点 */
  dot: LkProp.boolean(false),

  /** 是否隐藏徽章 */
  hidden: LkProp.boolean(false),

  /** 徽章偏移量 [x, y] */
  offset: {
    type: Array as unknown as PropType<[number, number]>,
    default: () => [0, 0],
    validator: (value: unknown) =>
      Array.isArray(value) &&
      value.length === 2 &&
      typeof value[0] === 'number' &&
      typeof value[1] === 'number',
  },

  /**
   * 徽章类型
   * @value primary 主要
   * @value success 成功
   * @value warning 警告
   * @value danger 危险
   * @value info 信息
   */
  type: LkProp.enum(Object.values(BadgeType), BadgeType.Primary, 'Badge.type'),

  /** 文字颜色 */
  color: LkProp.string(''),

  /** 背景颜色 */
  bgColor: LkProp.string(''),
} as const;

export type BadgeProps = ExtractPropTypes<typeof badgeProps>;

export const badgeEmits = {
  click: (_payload: { value: string | number; displayValue: string | number; event?: unknown }) =>
    true,
};
