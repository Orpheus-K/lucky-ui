import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export type SliderSize = 'small' | 'default' | 'large';
export type SliderValue = number | number[];
const sliderSizeValues = ['small', 'default', 'large'] as const;

export const sliderProps = {
  ...baseProps,

  /** 绑定值 (number | number[]) */
  modelValue: {
    type: [Number, Array] as PropType<SliderValue>,
    default: 0,
  },

  /** 是否开启双滑块范围选择 */
  range: LkProp.boolean(false),

  /** 最小值 */
  min: LkProp.number(0),

  /** 最大值 */
  max: LkProp.number(100),

  /** 步长 */
  step: LkProp.number(1),

  /** 是否显示间断点 */
  showStops: LkProp.boolean(false),

  /** 是否禁用 */
  disabled: LkProp.boolean(false),

  /** 是否显示当前值 */
  showValue: LkProp.boolean(false),

  /** 格式化显示值 */
  formatValue: LkProp.func<(value: number) => string | number>(),

  /** 是否显示滑块右侧独立值，仅单滑块模式生效 */
  showValueText: LkProp.boolean(true),

  /** 尺寸 */
  size: LkProp.enum(sliderSizeValues, 'default', 'Slider.size'),

  /** 激活条颜色 */
  activeColor: LkProp.string(''),

  /** 背景条颜色 */
  inactiveColor: LkProp.string(''),

  /** 滑块大小 */
  blockSize: LkProp.string(''),

  /** 滑块颜色 */
  blockColor: LkProp.string(''),

  /** 轨道高度 */
  barHeight: LkProp.string(''),

  /** 表单字段名，用于表单验证联动 */
  prop: LkProp.string(''),

  /** 是否触发表单验证（默认 true） */
  validateEvent: LkProp.boolean(true),
} as const;

export type SliderProps = ExtractPropTypes<typeof sliderProps>;

export const sliderEmits = {
  'update:modelValue': (_val: SliderValue) => true,
  change: (_val: SliderValue) => true,
  input: (_val: SliderValue) => true,
  dragstart: (_val: SliderValue, _index: number, _event: unknown) => true,
  dragend: (_val: SliderValue, _index: number, _event: unknown) => true,
  'drag-release': (_val: SliderValue) => true,
  click: (_val: SliderValue, _event: unknown) => true,
};
