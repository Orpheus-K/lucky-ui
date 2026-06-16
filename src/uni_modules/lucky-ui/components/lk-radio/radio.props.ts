import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export type RadioValue = string | number | boolean;

export const RadioGroupDirection = {
  Row: 'row',
  Column: 'column',
} as const;
export type RadioGroupDirection = (typeof RadioGroupDirection)[keyof typeof RadioGroupDirection];

export const RadioShape = {
  Circle: 'circle',
  Square: 'square',
} as const;
export type RadioShape = (typeof RadioShape)[keyof typeof RadioShape];

export const RadioIconType = {
  Dot: 'dot',
  Check: 'check',
} as const;
export type RadioIconType = (typeof RadioIconType)[keyof typeof RadioIconType];

export const RadioSize = {
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
} as const;
export type RadioSize = (typeof RadioSize)[keyof typeof RadioSize];

export const radioGroupProps = {
  ...baseProps,
  /** 绑定值 */
  modelValue: {
    type: [String, Number, Boolean] as PropType<RadioValue>,
    default: '',
  },
  /** 尺寸 sm | md | lg */
  size: LkProp.enum(Object.values(RadioSize), RadioSize.Md, 'RadioGroup.size'),
  /** 是否禁用 */
  disabled: LkProp.boolean(false),
  /** 排列方向 row | column */
  direction: LkProp.enum(
    Object.values(RadioGroupDirection),
    RadioGroupDirection.Row,
    'RadioGroup.direction'
  ),
  /** 选中时的颜色 */
  activeColor: LkProp.string(''),
  /** 形状 circle | square */
  shape: LkProp.enum(Object.values(RadioShape), RadioShape.Circle, 'RadioGroup.shape'),
  /** 图标类型 dot | check */
  iconType: LkProp.enum(Object.values(RadioIconType), RadioIconType.Dot, 'RadioGroup.iconType'),
  /** 表单字段名，用于表单验证联动 */
  prop: LkProp.string(''),
  /** 是否触发表单验证（默认 true） */
  validateEvent: LkProp.boolean(true),
} as const;

export const radioProps = {
  ...baseProps,
  /** 单独使用时的绑定值 */
  modelValue: {
    type: [String, Number, Boolean] as PropType<RadioValue>,
    default: '',
  },
  /** 在 group 中作为唯一标识符 */
  name: {
    type: [String, Number, Boolean] as PropType<RadioValue>,
    default: '',
  },
  /** 形状，不设则继承 group */
  shape: LkProp.string(''),
  /** 图标类型，不设则继承 group */
  iconType: LkProp.string(''),
  /** 是否禁用 */
  disabled: LkProp.boolean(false),
  /** 选中颜色，不设则继承 group */
  activeColor: LkProp.string(''),
  /** 图标大小，支持数字和 rpx 字符串 */
  iconSize: LkProp.stringNumber(''),
  /** 标签文本 */
  label: LkProp.string(''),
  /** 是否禁用标签点击 */
  labelDisabled: LkProp.boolean(false),
} as const;

export type RadioGroupProps = ExtractPropTypes<typeof radioGroupProps>;
export type RadioProps = ExtractPropTypes<typeof radioProps>;

export const radioGroupEmits = {
  'update:modelValue': (_val: RadioValue) => true,
  change: (_val: RadioValue) => true,
  'item-change': (_val: RadioValue) => true,
};
export const radioEmits = {
  'update:modelValue': (_val: RadioValue) => true,
  change: (_val: RadioValue) => true,
  click: (_event: unknown, _checked: boolean, _value: RadioValue) => true,
};
