import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export type SelectValue = string | number | boolean;

export type SelectListOption = {
  label?: string;
  value?: SelectValue;
  description?: string;
  disabled?: boolean;
  icon?: string;
  [key: string]: unknown;
};

export const SelectListSize = {
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
} as const;

export type SelectListSize = (typeof SelectListSize)[keyof typeof SelectListSize];

export const selectListProps = {
  ...baseProps,

  /** 绑定值，单选为基础值，多选为数组 */
  modelValue: {
    type: [String, Number, Boolean, Array] as PropType<SelectValue | SelectValue[]>,
    default: '',
  },

  /** 选项列表 */
  options: LkProp.array<SelectListOption>(),

  /** 是否多选 */
  multiple: LkProp.boolean(false),

  /** 是否禁用 */
  disabled: LkProp.boolean(false),

  /** 最大可选数，0 表示不限制，仅多选生效 */
  max: LkProp.number(0),

  /** 标题字段名 */
  titleKey: LkProp.string('label'),

  /** 值字段名 */
  valueKey: LkProp.string('value'),

  /** 描述字段名 */
  descKey: LkProp.string('description'),

  /** 禁用字段名 */
  disabledKey: LkProp.string('disabled'),

  /** 右侧选中图标 */
  icon: LkProp.string('check-all'),

  /** 是否显示右侧选中图标 */
  showIcon: LkProp.boolean(true),

  /** 选中时是否显示背景 */
  selectedBg: LkProp.boolean(true),

  /** 选中时是否显示边框 */
  selectedBorder: LkProp.boolean(true),

  /** 是否显示普通边框 */
  bordered: LkProp.boolean(true),

  /** 是否使用内嵌卡片间距 */
  inset: LkProp.boolean(false),

  /** 列数，1 表示列表，2/3/4 表示网格 */
  columns: LkProp.number(1),

  /** 选项圆角，数字按 rpx 处理，字符串可传 CSS 长度或变量 */
  itemRadius: LkProp.stringNumber(''),

  /** 尺寸 */
  size: LkProp.enum(Object.values(SelectListSize), SelectListSize.Md, 'SelectList.size'),

  /** 选中颜色 */
  activeColor: LkProp.string(''),
} as const;

export type SelectListProps = ExtractPropTypes<typeof selectListProps>;

export const selectListEmits = {
  'update:modelValue': (_value: SelectValue | SelectValue[]) => true,
  change: (_value: SelectValue | SelectValue[], _option: SelectListOption) => true,
  select: (_option: SelectListOption, _selected: boolean) => true,
  overlimit: (_option: SelectListOption, _max: number) => true,
};
