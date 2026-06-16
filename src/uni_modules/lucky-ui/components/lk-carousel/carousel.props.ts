import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const CarouselEffect = {
  Fade: 'fade',
  Slide: 'slide',
} as const;

export const CarouselIndicatorType = {
  Dots: 'dots',
  Bars: 'bars',
  Number: 'number',
  None: 'none',
} as const;

/**
 * 指示器位置
 * 增加了角落位置定义
 */
export const CarouselIndicatorPosition = {
  Bottom: 'bottom', // 底部居中
  Top: 'top', // 顶部居中
  Left: 'left', // 左侧垂直居中
  Right: 'right', // 右侧垂直居中
  TopLeft: 'top-left', // 左上
  TopRight: 'top-right', // 右上
  BottomLeft: 'bottom-left', // 左下
  BottomRight: 'bottom-right', // 右下
  Auto: 'auto',
} as const;

export const CarouselIndicatorAlign = {
  Center: 'center',
  Start: 'start',
  End: 'end',
} as const;

export type CarouselEffect = (typeof CarouselEffect)[keyof typeof CarouselEffect];
export type CarouselIndicatorType =
  (typeof CarouselIndicatorType)[keyof typeof CarouselIndicatorType];
export type CarouselIndicatorPosition =
  (typeof CarouselIndicatorPosition)[keyof typeof CarouselIndicatorPosition];
export type CarouselIndicatorAlign =
  (typeof CarouselIndicatorAlign)[keyof typeof CarouselIndicatorAlign];
export type CarouselObjectItem = Record<string, unknown> & {
  src?: string;
  url?: string;
  image?: string;
  title?: string;
  text?: string;
  tag?: string;
  subtitle?: string;
  meta?: string;
  desc?: string;
  stats?: string[];
};
// 轮播项可为图片地址、数值 id、业务对象或分页对象数组，slot 侧按透传数据处理。
export type CarouselItem = string | number | CarouselObjectItem | CarouselObjectItem[];

export const carouselProps = {
  ...baseProps,
  carouselList: { type: Array as PropType<CarouselItem[]>, default: () => [] },
  current: LkProp.number(0),
  autoPlay: LkProp.boolean(true),
  interval: LkProp.number(3000),
  effect: LkProp.enum(Object.values(CarouselEffect), CarouselEffect.Fade, 'Carousel.effect'),
  vertical: LkProp.boolean(false),
  showIndicators: LkProp.boolean(true),
  indicatorType: LkProp.enum(
    Object.values(CarouselIndicatorType),
    CarouselIndicatorType.Dots,
    'Carousel.indicatorType'
  ),
  indicatorPosition: LkProp.enum(
    Object.values(CarouselIndicatorPosition),
    CarouselIndicatorPosition.Auto,
    'Carousel.indicatorPosition'
  ),

  indicatorAlign: LkProp.enum(
    Object.values(CarouselIndicatorAlign),
    CarouselIndicatorAlign.Center,
    'Carousel.indicatorAlign'
  ),
  indicatorClickable: { type: Boolean, default: undefined },
  /** 指示器非激活颜色 */
  indicatorInactiveColor: LkProp.string(''),
  /** 指示器激活颜色 */
  indicatorActiveColor: LkProp.string(''),
  card: { type: Boolean, default: undefined },
  cardPrevMargin: LkProp.string(''),
  cardNextMargin: LkProp.string(''),
  cardScale: { type: Number, default: undefined },
  cardRadius: LkProp.string(''),
  cardShadow: LkProp.string(''),
  peek: { type: Boolean, default: undefined },
  peekPrevMargin: LkProp.string(''),
  peekNextMargin: LkProp.string(''),
  indicatorAnimated: { type: Boolean, default: undefined },
  autoHeight: { type: Boolean, default: undefined },

  // 保持默认高度，防止坍塌
  height: { type: [String, Number] as PropType<string | number>, default: 'var(--lk-rpx-320)' },

  indicatorOverlay: LkProp.boolean(true),
  loop: LkProp.boolean(true),
} as const;

export type CarouselProps = ExtractPropTypes<typeof carouselProps>;

export const carouselEmits = {
  'update:current': (_value: number) => true,
  change: (_value: number, _oldValue?: number, _source?: 'swiper' | 'indicator' | 'api') => true,
  click: (_item: CarouselItem, _index: number, _event?: unknown) => true,
  'indicator-click': (_index: number, _oldValue: number, _event?: unknown) => true,
  'autoplay-change': (_index: number, _oldValue: number) => true,
  'height-change': (_height: number) => true,
};
