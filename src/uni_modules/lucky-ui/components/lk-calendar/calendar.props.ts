import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const CalendarMode = {
  Single: 'single',
  Multiple: 'multiple',
  Range: 'range',
} as const;
export type CalendarMode = (typeof CalendarMode)[keyof typeof CalendarMode];

export const CalendarSize = {
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
} as const;
export type CalendarSize = (typeof CalendarSize)[keyof typeof CalendarSize];

export const CalendarViewMode = {
  Month: 'month',
  Week: 'week',
} as const;
export type CalendarViewMode = (typeof CalendarViewMode)[keyof typeof CalendarViewMode];

export interface CalendarMarker {
  date: string;
  label?: string;
  color?: string;
  type?: 'dot' | 'badge' | 'ring';
}

export type CalendarValue = string | string[];

export const calendarProps = {
  ...baseProps,

  /** 绑定值: single 为字符串, multiple/range 为字符串数组 */
  modelValue: {
    type: [String, Array] as PropType<CalendarValue>,
    default: '',
  },

  /** 选择模式 */
  mode: LkProp.enum(Object.values(CalendarMode), CalendarMode.Single, 'Calendar.mode'),

  /** 尺寸 */
  size: LkProp.enum(Object.values(CalendarSize), CalendarSize.Md, 'Calendar.size'),

  /** 视图模式 */
  viewMode: LkProp.enum(
    Object.values(CalendarViewMode),
    CalendarViewMode.Month,
    'Calendar.viewMode'
  ),

  /** 当前展示月份，格式 YYYY-MM-DD 或 YYYY-MM */
  viewDate: LkProp.string(''),

  /** 标题 */
  title: LkProp.string(''),

  /** 最小可选日期 YYYY-MM-DD */
  minDate: LkProp.string(''),

  /** 最大可选日期 YYYY-MM-DD */
  maxDate: LkProp.string(''),

  /** 禁用日期列表 YYYY-MM-DD */
  disabledDates: LkProp.array<string>(),

  /** 标记点 */
  markers: LkProp.array<CalendarMarker>(),

  /** 周起始日，0 为周日，1 为周一 */
  firstDayOfWeek: {
    type: Number as PropType<number>,
    default: 1,
    validator: (value: unknown) => typeof value === 'number' && value >= 0 && value <= 6,
  },

  /** 是否显示相邻月份日期 */
  showAdjacentDays: LkProp.boolean(true),

  /** 是否显示头部 */
  showHeader: LkProp.boolean(true),

  /** 是否显示今日快捷入口 */
  showToday: LkProp.boolean(true),

  /** 是否显示年份 */
  showYear: LkProp.boolean(true),

  /** 是否支持左右滑动切换月份 */
  swipeable: LkProp.boolean(true),

  /** 是否只读 */
  readonly: LkProp.boolean(false),

  /** 是否禁用 */
  disabled: LkProp.boolean(false),
} as const;

export type CalendarProps = ExtractPropTypes<typeof calendarProps>;

export interface CalendarDay {
  date: string;
  day: number;
  month: number;
  year: number;
  weekday: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isRangeRowStart: boolean;
  isRangeRowEnd: boolean;
  isInRange: boolean;
  isDisabled: boolean;
  markers: CalendarMarker[];
}

export const calendarEmits = {
  'update:modelValue': (_value: CalendarValue) => true,
  'update:viewDate': (_value: string) => true,
  change: (_value: CalendarValue, _day: CalendarDay) => true,
  select: (_day: CalendarDay) => true,
  'month-change': (_value: string) => true,
  'week-change': (_payload: { start: string; end: string; viewDate: string }) => true,
  'panel-change': (_payload: { year: number; month: number }) => true,
  'click-disabled': (_day: CalendarDay) => true,
};
