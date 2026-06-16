import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';
import {
  CalendarMode,
  CalendarSize,
  CalendarViewMode,
  type CalendarDay,
  type CalendarMarker,
  type CalendarValue,
} from '../lk-calendar/calendar.props';
import { PopupPosition } from '../lk-popup/popup.props';

export const CalendarPickerTimePrecision = {
  Hour: 'hour',
  Minute: 'minute',
  Second: 'second',
} as const;
export type CalendarPickerTimePrecision =
  (typeof CalendarPickerTimePrecision)[keyof typeof CalendarPickerTimePrecision];

export type CalendarPickerValue = CalendarValue;

export const calendarPickerProps = {
  ...baseProps,

  /** 绑定值: showTime=false 为日期，showTime=true 为日期时间 */
  modelValue: {
    type: [String, Array] as PropType<CalendarPickerValue>,
    default: '',
  },

  /** 是否显示弹层，支持 v-model:show */
  show: LkProp.boolean(false),

  /** 选择模式 */
  mode: LkProp.enum(Object.values(CalendarMode), CalendarMode.Single, 'CalendarPicker.mode'),

  /** 日历尺寸 */
  size: LkProp.enum(Object.values(CalendarSize), CalendarSize.Md, 'CalendarPicker.size'),

  /** 日历视图 */
  viewMode: LkProp.enum(
    Object.values(CalendarViewMode),
    CalendarViewMode.Month,
    'CalendarPicker.viewMode'
  ),

  /** 当前展示月份，格式 YYYY-MM-DD 或 YYYY-MM */
  viewDate: LkProp.string(''),

  /** 弹层标题 */
  title: LkProp.string(''),

  /** 占位文案 */
  placeholder: LkProp.string(''),

  /** 确认按钮文案 */
  confirmText: LkProp.string(''),

  /** 重置文案 */
  resetText: LkProp.string(''),

  /** 是否显示重置 */
  showReset: LkProp.boolean(true),

  /** 是否开启时间滑块 */
  showTime: LkProp.boolean(false),

  /** 时间精度 */
  timePrecision: LkProp.enum(
    Object.values(CalendarPickerTimePrecision),
    CalendarPickerTimePrecision.Minute,
    'CalendarPicker.timePrecision'
  ),

  /** 时间步长，按 timePrecision 对应单位递增 */
  timeStep: LkProp.number(1),

  /** 默认开始时间 */
  defaultStartTime: LkProp.string('00:00:00'),

  /** 默认结束时间 */
  defaultEndTime: LkProp.string('23:59:59'),

  /** 最小可选日期 YYYY-MM-DD */
  minDate: LkProp.string(''),

  /** 最大可选日期 YYYY-MM-DD */
  maxDate: LkProp.string(''),

  /** 禁用日期列表 YYYY-MM-DD */
  disabledDates: LkProp.array<string>(),

  /** 标记点 */
  markers: LkProp.array<CalendarMarker>(),

  /** 周起始日 */
  firstDayOfWeek: {
    type: Number as PropType<number>,
    default: 1,
    validator: (value: unknown) => typeof value === 'number' && value >= 0 && value <= 6,
  },

  /** 是否显示相邻月份日期 */
  showAdjacentDays: LkProp.boolean(true),

  /** 是否显示今日快捷入口 */
  showToday: LkProp.boolean(true),

  /** 是否显示年份 */
  showYear: LkProp.boolean(true),

  /** 是否支持日历滑动 */
  swipeable: LkProp.boolean(true),

  /** 弹出方向 */
  popupPosition: LkProp.enum(
    Object.values(PopupPosition),
    PopupPosition.Bottom,
    'CalendarPicker.popupPosition'
  ),

  /** 弹层高度 */
  popupHeight: LkProp.string(''),

  /** 点击遮罩关闭 */
  closeOnOverlay: LkProp.boolean(true),

  /** 确认后关闭 */
  closeOnConfirm: LkProp.boolean(true),

  /** 只读 */
  readonly: LkProp.boolean(false),

  /** 禁用 */
  disabled: LkProp.boolean(false),
} as const;

export type CalendarPickerProps = ExtractPropTypes<typeof calendarPickerProps>;

export const calendarPickerEmits = {
  'update:modelValue': (_value: CalendarPickerValue) => true,
  'update:show': (_value: boolean) => true,
  change: (_value: CalendarPickerValue) => true,
  confirm: (_value: CalendarPickerValue) => true,
  reset: () => true,
  open: () => true,
  close: () => true,
  select: (_day: CalendarDay) => true,
};
