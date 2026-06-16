import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export type CheckboxValue = string | number | boolean;

export const CheckboxGroupDirection = {
  Row: 'row',
  Column: 'column',
} as const;
export type CheckboxGroupDirection =
  (typeof CheckboxGroupDirection)[keyof typeof CheckboxGroupDirection];

export const CheckboxShape = {
  Square: 'square',
  Circle: 'circle',
} as const;
export type CheckboxShape = (typeof CheckboxShape)[keyof typeof CheckboxShape];

export const CheckboxIconType = {
  Check: 'check',
  Dot: 'dot',
} as const;
export type CheckboxIconType = (typeof CheckboxIconType)[keyof typeof CheckboxIconType];

export const CheckboxSize = {
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
} as const;
export type CheckboxSize = (typeof CheckboxSize)[keyof typeof CheckboxSize];

export const checkboxGroupProps = {
  ...baseProps,
  /** 绑定值 */
  modelValue: {
    type: Array as PropType<CheckboxValue[]>,
    default: () => [],
  },
  /** 尺寸 sm | md | lg */
  size: LkProp.enum(Object.values(CheckboxSize), CheckboxSize.Md, 'CheckboxGroup.size'),
  /** 是否禁用所有子项 */
  disabled: LkProp.boolean(false),
  /** 排列方向 row | column */
  direction: LkProp.enum(
    Object.values(CheckboxGroupDirection),
    CheckboxGroupDirection.Row,
    'CheckboxGroup.direction'
  ),
  /** 形状 circle | square */
  shape: LkProp.enum(Object.values(CheckboxShape), CheckboxShape.Square, 'CheckboxGroup.shape'),
  /** 图标类型 check | dot */
  iconType: LkProp.enum(
    Object.values(CheckboxIconType),
    CheckboxIconType.Check,
    'CheckboxGroup.iconType'
  ),
  /** 选中时的颜色 */
  activeColor: LkProp.string(''),
  /** 最大可选数，0 表示不限制 */
  max: LkProp.number(0),
  /** 表单字段名，用于表单验证联动 */
  prop: LkProp.string(''),
  /** 是否触发表单验证（默认 true） */
  validateEvent: LkProp.boolean(true),
} as const;

export const checkboxProps = {
  ...baseProps,
  /** 单独使用时的绑定值 */
  modelValue: {
    type: [Boolean, String, Number] as PropType<CheckboxValue>,
    default: false,
  },
  /** 在 group 中作为唯一标识符 */
  name: {
    type: [String, Number, Boolean] as PropType<CheckboxValue>,
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
  /** 是否为不确定状态（半选） */
  indeterminate: LkProp.boolean(false),
} as const;

export type CheckboxGroupProps = ExtractPropTypes<typeof checkboxGroupProps>;
export type CheckboxProps = ExtractPropTypes<typeof checkboxProps>;

export const checkboxGroupEmits = {
  'update:modelValue': (_val: CheckboxValue[]) => true,
  change: (_val: CheckboxValue[]) => true,
  'item-change': (_value: CheckboxValue, _checked: boolean, _list: CheckboxValue[]) => true,
  overlimit: (_value: CheckboxValue, _max: number) => true,
};
export const checkboxEmits = {
  'update:modelValue': (_val: boolean) => true,
  change: (_val: boolean) => true,
  click: (_event: unknown, _checked: boolean, _value: CheckboxValue) => true,
};
