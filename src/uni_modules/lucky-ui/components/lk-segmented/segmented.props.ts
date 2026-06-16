/* F:\luckyone\ui\src\uni_modules\lucky-ui\components\lk-segmented\segmented.props.ts */
import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const SegmentedSize = { Sm: 'sm', Md: 'md', Lg: 'lg' } as const;
export type SegmentedSize = (typeof SegmentedSize)[keyof typeof SegmentedSize];

export interface SegmentedOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}
export type SegmentedValue = SegmentedOption['value'];

export const segmentedProps = {
  ...baseProps,
  modelValue: { type: [String, Number] as PropType<SegmentedValue>, default: '' },
  options: { type: Array as PropType<SegmentedOption[]>, default: () => [] },
  size: LkProp.enum(Object.values(SegmentedSize), SegmentedSize.Md, 'Segmented.size'),
  block: Boolean,
  radius: { type: String, default: '' },
  duration: { type: Number, default: 260 },
  easing: { type: String, default: 'cubic-bezier(0.22,1,0.36,1)' },
  inset: { type: String, default: 'var(--lk-rpx-4)' },
  gutter: { type: String, default: 'var(--lk-rpx-0)' },
  animated: { type: Boolean, default: true }, // 🆕 是否开启动画
  height: { type: String, default: '' }, // 🆕 自定义高度
} as const;

export type SegmentedProps = ExtractPropTypes<typeof segmentedProps>;

export const segmentedEmits = {
  'update:modelValue': (_: SegmentedValue) => true,
  change: (_value: SegmentedValue, _option?: SegmentedOption, _oldValue?: SegmentedValue) => true,
  click: (_payload: { value: SegmentedValue; option: SegmentedOption; event?: unknown }) => true,
  select: (_payload: {
    value: SegmentedValue;
    option: SegmentedOption;
    oldValue: SegmentedValue;
  }) => true,
  reselect: (_payload: { value: SegmentedValue; option: SegmentedOption; event?: unknown }) => true,
  'click-disabled': (_payload: {
    value: SegmentedValue;
    option: SegmentedOption;
    event?: unknown;
  }) => true,
};
