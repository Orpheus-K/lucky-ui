import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const StepperSize = {
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
} as const;
export type StepperSize = (typeof StepperSize)[keyof typeof StepperSize];
export type StepperValue = number | string;
export type StepperAction = 'minus' | 'plus' | 'input';

export const stepperProps = {
  ...baseProps,

  /** 绑定值 */
  modelValue: {
    type: [Number, String] as PropType<number | string>,
    default: 0,
  },

  /** 最小值 */
  min: { type: [Number, String] as unknown as PropType<number | string>, default: 1 },

  /** 最大值 */
  max: { type: [Number, String] as unknown as PropType<number | string>, default: Infinity },

  /** 步长 */
  step: { type: [Number, String] as unknown as PropType<number | string>, default: 1 },

  /** 是否只允许整数 */
  integer: LkProp.boolean(false),

  /** 是否禁用 */
  disabled: LkProp.boolean(false),

  /** 是否禁用输入框 */
  disableInput: LkProp.boolean(false),

  /** 是否开启长按手势 */
  longPress: LkProp.boolean(true),

  /** 尺寸 */
  size: LkProp.enum(Object.values(StepperSize), StepperSize.Md, 'Stepper.size'),

  /** 输入框宽度 (rpx) */
  inputWidth: { type: [Number, String] as unknown as PropType<number | string>, default: '' },

  /** 按钮宽度 (rpx) */
  buttonSize: { type: [Number, String] as unknown as PropType<number | string>, default: '' },

  /** 变更前拦截: return false 或 Promise<false> 阻止 */
  beforeChange: {
    type: Function as PropType<(val: number) => boolean | Promise<boolean>>,
    default: null,
  },

  /** 表单字段名，用于表单验证联动 */
  prop: LkProp.string(''),

  /** 是否触发表单验证（默认 true） */
  validateEvent: LkProp.boolean(true),
} as const;

export type StepperProps = ExtractPropTypes<typeof stepperProps>;

export const stepperEmits = {
  'update:modelValue': (_val: StepperValue) => true,
  change: (_val: StepperValue, _action: StepperAction) => true,
  input: (_val: string) => true,
  plus: (_val: number) => true,
  minus: (_val: number) => true,
  overlimit: (_type: 'minus' | 'plus', _limit: number) => true,
  'before-change': (_val: number, _action: StepperAction) => true,
  'change-cancel': (_val: number, _action: StepperAction, _reason: 'before-change' | 'error') =>
    true,
  focus: (_e: unknown) => true,
  blur: (_e: unknown) => true,
};
