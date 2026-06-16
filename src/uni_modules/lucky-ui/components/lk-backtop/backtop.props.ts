import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

/**
 * 返回顶部按钮形状
 */
export const BacktopShape = {
  Circle: 'circle',
  Square: 'square',
  Round: 'round',
} as const;

/**
 * 返回顶部按钮尺寸
 */
export const BacktopSize = {
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
} as const;

export type BacktopShape = (typeof BacktopShape)[keyof typeof BacktopShape];
export type BacktopSize = (typeof BacktopSize)[keyof typeof BacktopSize];

export const backtopProps = {
  ...baseProps,

  /** 层级 (默认 400，导航层) */
  zIndex: LkProp.number(400),

  /** 滚动高度达到此值时显示 */
  visibilityHeight: LkProp.number(200),

  /** 距离右侧距离 */
  right: {
    type: [String, Number] as PropType<string | number>,
    default: 'var(--lk-rpx-32)',
  },

  /** 距离底部距离 */
  bottom: {
    type: [String, Number] as PropType<string | number>,
    default: 'var(--lk-rpx-80)',
  },

  /** 返回顶部动画持续时间（毫秒） */
  duration: LkProp.number(300),

  /** 回顶动画缓动函数，支持 linear / easeOutCubic / cubic-bezier(x1,y1,x2,y2) */
  easing: LkProp.string('linear'),

  /**
   * 按钮形状
   * @value circle 圆形
   * @value square 方形
   * @value round 圆角
   */
  shape: LkProp.enum(Object.values(BacktopShape), BacktopShape.Circle, 'Backtop.shape'),

  /**
   * 按钮尺寸
   * @value sm 小尺寸
   * @value md 中尺寸
   * @value lg 大尺寸
   */
  size: LkProp.enum(Object.values(BacktopSize), BacktopSize.Md, 'Backtop.size'),

  /** 图标名称 */
  icon: LkProp.string('arrow-up'),

  /** 按钮文字 */
  text: LkProp.string(''),

  /** 是否使用页面滚动 */
  usePageScroll: LkProp.boolean(true),

  /** 当前滚动位置 */
  scrollTop: LkProp.number(0),
} as const;

export type BacktopProps = ExtractPropTypes<typeof backtopProps>;

export const backtopEmits = {
  click: (_event?: unknown) => true,
  'to-top': (_payload: {
    usePageScroll: boolean;
    duration: number;
    easing: string;
    event?: unknown;
  }) => true,
  'change:visible': (_visible: boolean, _scrollTop?: number) => true,
};
