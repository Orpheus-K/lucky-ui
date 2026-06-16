import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const SwitchSize = {
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
} as const;

export type SwitchSize = (typeof SwitchSize)[keyof typeof SwitchSize];
export type SwitchValue = boolean | string | number;

export const switchProps = {
  ...baseProps,

  /** 绑定值 */
  modelValue: {
    type: [Boolean, String, Number] as PropType<SwitchValue>,
    default: false,
  },

  /** 开启时的值 */
  activeValue: {
    type: [Boolean, String, Number] as PropType<SwitchValue>,
    default: true,
  },

  /** 关闭时的值 */
  inactiveValue: {
    type: [Boolean, String, Number] as PropType<SwitchValue>,
    default: false,
  },

  /** 尺寸: sm | md | lg */
  size: LkProp.enum(Object.values(SwitchSize), SwitchSize.Md, 'Switch.size'),

  /** 开启时的背景色 */
  activeColor: String,

  /** 关闭时的背景色 */
  inactiveColor: String,

  /** 是否禁用 */
  disabled: LkProp.boolean(false),

  /** 是否加载中 */
  loading: LkProp.boolean(false),

  /** 切换前的拦截函数，返回 false 或 Promise<false> 阻止切换 */
  beforeChange: {
    type: Function as PropType<(val: SwitchValue) => boolean | Promise<boolean>>,
    default: null,
  },

  /**
   * 开关内显示文字（ON/OFF）
   * @default false
   */
  inlinePrompt: LkProp.boolean(false),

  /** 开启时内嵌文字 */
  activeText: LkProp.string(''),

  /** 关闭时内嵌文字 */
  inactiveText: LkProp.string(''),

  /**
   * 是否开启轻震动反馈（需要用户授权）
   * @default false
   */
  hapticFeedback: LkProp.boolean(false),

  /** 表单字段名，用于表单验证联动 */
  prop: LkProp.string(''),

  /** 是否触发表单验证（默认 true） */
  validateEvent: LkProp.boolean(true),
} as const;

export type SwitchProps = ExtractPropTypes<typeof switchProps>;

export const switchEmits = {
  'update:modelValue': (_val: SwitchValue) => true,
  change: (_val: SwitchValue) => true,
  click: (_event: unknown, _checked: boolean) => true,
  'before-change': (_nextValue: SwitchValue) => true,
  'change-cancel': (_nextValue: SwitchValue, _reason: 'before-change' | 'error') => true,
};
