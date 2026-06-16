import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const TabSize = { Sm: 'sm', Md: 'md', Lg: 'lg' } as const;
export type TabSize = (typeof TabSize)[keyof typeof TabSize];

export const TabAlign = { Left: 'left', Center: 'center', Right: 'right' } as const;
export type TabAlign = (typeof TabAlign)[keyof typeof TabAlign];

export interface TabOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  badge?: string | number;
  badgeDot?: boolean;
  subtitle?: string;
}

export type TabValue = TabOption['value'];

export const tabProps = {
  ...baseProps,
  /**
   * 当前激活的 tab 值，支持 v-model
   */
  modelValue: {
    type: [String, Number] as PropType<TabValue>,
    default: '',
  },
  /**
   * 当前激活的 tab 索引，支持 v-model:activeIndex
   */
  activeIndex: {
    type: Number,
    default: 0,
  },
  /**
   * 标签选项列表
   */
  options: {
    type: Array as PropType<TabOption[]>,
    default: () => [],
  },
  /**
   * 尺寸: sm (22rpx font), md (26rpx font), lg (30rpx font)
   */
  size: LkProp.enum(Object.values(TabSize), TabSize.Md, 'Tab.size'),
  /**
   * 等宽块状模式（平分容器宽度）
   */
  block: Boolean,
  /**
   * 允许横向滚动（多 Tab 时使用）
   */
  scrollable: Boolean,
  /**
   * 是否开启滑块动画
   */
  animated: {
    type: Boolean,
    default: true,
  },
  /**
   * 动画过渡时长 (ms)
   */
  duration: {
    type: Number,
    default: 280,
  },
  /**
   * 动画缓动函数
   */
  easing: {
    type: String,
    default: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  /**
   * 字母大写转化（美式排版常见）
   */
  uppercase: {
    type: Boolean,
    default: true,
  },
  /**
   * 字母间距，留白感 (如 0.08em, 2rpx)
   */
  letterSpacing: {
    type: String,
    default: '0.06em',
  },
  /**
   * 底部滑块宽度 (例如: '40rpx', '100%')。默认 'auto' 随 Tab 标签宽度
   */
  underlineWidth: {
    type: String,
    default: 'auto',
  },
  /**
   * 底部滑块高度
   */
  underlineHeight: {
    type: String,
    default: '3rpx',
  },
  /**
   * 是否显示底部滑动下划线
   */
  showSlider: {
    type: Boolean,
    default: true,
  },
  /**
   * 对齐方式（非 block 且非 scrollable 时生效）
   */
  align: LkProp.enum(Object.values(TabAlign), TabAlign.Center, 'Tab.align'),
  /**
   * 是否显示整体底部细边框
   */
  border: {
    type: Boolean,
    default: true,
  },
} as const;

export type TabProps = ExtractPropTypes<typeof tabProps>;

export const tabEmits = {
  'update:modelValue': (_: TabValue) => true,
  'update:activeIndex': (_: number) => true,
  change: (_value: TabValue, _option?: TabOption, _oldValue?: TabValue) => true,
  click: (_payload: { value: TabValue; option: TabOption; event?: unknown }) => true,
  select: (_payload: { value: TabValue; option: TabOption; oldValue: TabValue }) => true,
  reselect: (_payload: { value: TabValue; option: TabOption; event?: unknown }) => true,
  'click-disabled': (_payload: { value: TabValue; option: TabOption; event?: unknown }) => true,
};
