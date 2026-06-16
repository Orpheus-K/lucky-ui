import { LkProp, baseProps } from '../common/props';
import type { PropType } from 'vue';
import type { ChoiceOption, ChoiceValue } from './choice.utils';

export const choiceProps = {
  ...baseProps,
  /** 绑定值 */
  modelValue: {
    type: [String, Number, Array] as PropType<ChoiceValue | ChoiceValue[] | null>,
    default: null,
  },
  /** 选项列表 */
  options: {
    type: Array as PropType<ChoiceOption[]>,
    default: () => [],
  },
  /** 是否多选 */
  multiple: LkProp.boolean(false),
  /** 尺寸 */
  size: LkProp.string('md'),
  /** 是否允许取消选中 */
  allowUnselect: LkProp.boolean(true),
  /** 间距 (rpx) */
  gap: LkProp.number(20),
  /** 是否允许选项换行；置于横向滚动容器内时应设为 false */
  wrap: LkProp.boolean(true),
} as const;

export const choiceEmits = ['update:modelValue', 'change', 'click'];
