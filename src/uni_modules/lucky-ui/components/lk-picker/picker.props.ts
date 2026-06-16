import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

/** 选择器选项 */
export interface PickerOption {
  label: string;
  value: string | number;
  children?: PickerOption[];
}

/** 选项列数据 */
export type PickerColumns = PickerOption[] | PickerOption[][];

/** Picker 模式 */
export type PickerMode = 'single' | 'multi' | 'cascade';
export type PickerValue = string | number | (string | number)[];

export const pickerProps = {
  ...baseProps,

  /** 绑定值 */
  modelValue: {
    type: [Array, String, Number] as unknown as PropType<string | number | (string | number)[]>,
    default: undefined,
  },

  /** 选择器模式: single-单列, multi-多列, cascade-级联 */
  mode: LkProp.enum(['single', 'multi', 'cascade'] as const, 'single', 'mode'),

  /** 选项列数据 (single/multi/cascade 模式) */
  columns: {
    type: Array as unknown as PropType<PickerColumns>,
    default: () => [],
  },

  /** 是否内联显示 (不使用 popup) */
  inline: LkProp.boolean(false),

  /** 标题 */
  title: LkProp.string(''),

  /** 确认按钮文字 */
  confirmText: LkProp.string(''),

  /** 取消按钮文字 */
  cancelText: LkProp.string(''),

  /** 是否显示 (popup 模式) */
  visible: LkProp.boolean(false),

  /** 是否圆角 */
  round: LkProp.boolean(true),

  /** 可见选项数量 */
  visibleCount: LkProp.number(5),

  /** 选项高度 (rpx) */
  itemHeight: LkProp.number(100),
} as const;

export type PickerProps = ExtractPropTypes<typeof pickerProps>;

export const pickerEmits = {
  'update:modelValue': (_: PickerValue) => true,
  'update:visible': (_: boolean) => true,
  change: (_: PickerValue) => true,
  pick: (_value: PickerValue, _indexes: number[], _options: PickerOption[]) => true,
  confirm: (_value: PickerValue, _indexes: number[], _options: PickerOption[]) => true,
  cancel: (_value: PickerValue, _indexes: number[], _options: PickerOption[]) => true,
  open: () => true,
  close: () => true,
};
