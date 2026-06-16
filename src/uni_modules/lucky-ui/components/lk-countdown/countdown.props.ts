import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export type CountdownFormatter = (timeData: CountdownTimeData) => string | number;

export interface CountdownTimeData {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export const CountdownType = {
  Default: 'default',
  Primary: 'primary',
  Success: 'success',
  Warning: 'warning',
  Danger: 'danger',
  Info: 'info',
} as const;
export type CountdownType = (typeof CountdownType)[keyof typeof CountdownType];

export const CountdownVariant = {
  Plain: 'plain',
  Block: 'block',
  Card: 'card',
} as const;
export type CountdownVariant = (typeof CountdownVariant)[keyof typeof CountdownVariant];

export const CountdownSize = {
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
} as const;
export type CountdownSize = (typeof CountdownSize)[keyof typeof CountdownSize];

export const countdownProps = {
  ...baseProps,

  /** 剩余时长，单位 ms */
  time: LkProp.number(0),

  /** 截止时间，支持时间戳或可被 Date 解析的字符串 */
  targetTime: {
    type: [Number, String] as PropType<number | string>,
    default: '',
  },

  /** 展示格式，支持 DD/D/HH/H/mm/m/ss/s/SSS/SS/S */
  format: LkProp.string('HH:mm:ss'),

  /** 是否自动开始 */
  autoStart: LkProp.boolean(true),

  /** 是否开启毫秒级刷新 */
  millisecond: LkProp.boolean(false),

  /** 是否补零 */
  padZero: LkProp.boolean(true),

  /** 是否隐藏为 0 的天数段 */
  trimZeroDay: LkProp.boolean(false),

  /** 倒计时结束后保留 00:00:00 */
  showZero: LkProp.boolean(true),

  /** 类型 */
  type: LkProp.enum(Object.values(CountdownType), CountdownType.Default, 'Countdown.type'),

  /** 视觉变体 */
  variant: LkProp.enum(
    Object.values(CountdownVariant),
    CountdownVariant.Block,
    'Countdown.variant'
  ),

  /** 尺寸 */
  size: LkProp.enum(Object.values(CountdownSize), CountdownSize.Md, 'Countdown.size'),

  /** 前缀文本 */
  prefix: LkProp.string(''),

  /** 后缀文本 */
  suffix: LkProp.string(''),

  /** 单位文本映射 */
  unitMap: {
    type: Object as PropType<
      Partial<Record<'day' | 'hour' | 'minute' | 'second' | 'millisecond', string>>
    >,
    default: () => ({}),
  },

  /** 自定义格式化函数 */
  formatter: {
    type: Function as unknown as PropType<CountdownFormatter | null>,
    default: null,
  },
} as const;

export type CountdownProps = ExtractPropTypes<typeof countdownProps>;

export const countdownEmits = {
  start: () => true,
  pause: (_remaining: number) => true,
  reset: (_remaining: number) => true,
  finish: () => true,
  change: (_timeData: CountdownTimeData) => true,
};
