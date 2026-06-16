import type { StyleValue } from 'vue';
import {
  CarouselIndicatorPosition,
  CarouselIndicatorType,
  type CarouselIndicatorPosition as CarouselIndicatorPositionValue,
  type CarouselIndicatorType as CarouselIndicatorTypeValue,
} from './carousel.props';

export type CarouselChangeSource = 'swiper' | 'indicator' | 'api';

export interface CarouselSwiperChangeEventLike {
  detail?: {
    current?: unknown;
  };
}

export interface CarouselNodeRectLike {
  height?: number;
}

export function getCarouselLength(list?: unknown[]): number {
  return list?.length || 0;
}

export function isCarouselAutoplayEnabled(options: { autoPlay: boolean; length: number }): boolean {
  return options.autoPlay && options.length > 1;
}

export function isCarouselCircular(options: { loop: boolean; length: number }): boolean {
  return !!options.loop && options.length > 1;
}

export function resolveCarouselIndicatorPosition(options: {
  indicatorPosition: CarouselIndicatorPositionValue;
  vertical: boolean;
}): CarouselIndicatorPositionValue {
  if (options.indicatorPosition && options.indicatorPosition !== CarouselIndicatorPosition.Auto) {
    return options.indicatorPosition;
  }

  return options.vertical ? CarouselIndicatorPosition.Right : CarouselIndicatorPosition.Bottom;
}

export function isCarouselIndicatorVertical(position: CarouselIndicatorPositionValue): boolean {
  return (
    position === CarouselIndicatorPosition.Left || position === CarouselIndicatorPosition.Right
  );
}

export function shouldShowCarouselIndicators(options: {
  showIndicators: boolean;
  indicatorType: CarouselIndicatorTypeValue;
  length: number;
}): boolean {
  return (
    options.showIndicators &&
    options.indicatorType !== CarouselIndicatorType.None &&
    options.length > 1
  );
}

export function isCarouselIndicatorOutside(options: {
  indicatorOverlay: boolean;
  showIndicators: boolean;
}): boolean {
  return !options.indicatorOverlay && options.showIndicators;
}

export function resolveCarouselIndicatorInactiveColor(options: {
  indicatorInactiveColor: string;
}): string | undefined {
  return options.indicatorInactiveColor || undefined;
}

export function resolveCarouselPreviousMargin(options: {
  card?: boolean;
  cardPrevMargin: string;
  peek?: boolean;
  peekPrevMargin: string;
}) {
  if (options.card) return options.cardPrevMargin || '60rpx';
  if (options.peek) return options.peekPrevMargin;
  return '0';
}

export function resolveCarouselNextMargin(options: {
  card?: boolean;
  cardNextMargin: string;
  peek?: boolean;
  peekNextMargin: string;
}) {
  if (options.card) return options.cardNextMargin || '60rpx';
  if (options.peek) return options.peekNextMargin;
  return '0';
}

export function resolveCarouselHeightProp(height: string | number) {
  if (!height) return 'var(--lk-rpx-320)';
  return typeof height === 'number' ? `${height}rpx` : height;
}

export function resolveCarouselIndicatorSpace(options: {
  indicatorOutside: boolean;
  indicatorType: CarouselIndicatorTypeValue;
}) {
  if (!options.indicatorOutside) return 'var(--lk-rpx-0)';
  if (options.indicatorType === CarouselIndicatorType.Number) return 'var(--lk-rpx-50)';
  return 'var(--lk-rpx-40)';
}

export function resolveCarouselOuterStyle(options: {
  autoHeight?: boolean;
  currentHeight: number;
  indicatorOutside: boolean;
  indicatorHeightPx: number;
  heightProp: string;
  indicatorSpaceRpx: string;
}) {
  if (options.autoHeight) {
    const total =
      options.currentHeight + (options.indicatorOutside ? options.indicatorHeightPx : 0);
    return {
      height: total > 0 ? `${total}px` : 'var(--lk-rpx-200)',
      transition: 'height 0.3s ease',
    };
  }

  return {
    height: options.heightProp,
    '--lk-indicator-space': options.indicatorSpaceRpx,
  };
}

export function resolveCarouselSwiperStyle(options: {
  autoHeight?: boolean;
  currentHeight: number;
  indicatorOutside?: boolean;
  heightProp?: string;
}) {
  const { autoHeight, currentHeight, indicatorOutside, heightProp } = options;
  if (autoHeight) {
    return { height: currentHeight > 0 ? `${currentHeight}px` : '100%' };
  }

  const baseHeight = heightProp || '100%';

  if (indicatorOutside) {
    return { height: `calc(${baseHeight} - var(--lk-indicator-space))` };
  }

  return { height: baseHeight };
}

export function resolveCarouselCardStyleVars(options: {
  card?: boolean;
  cardScale?: number;
  cardRadius: string;
  cardShadow: string;
}) {
  if (!options.card) return {};

  return {
    '--lk-card-scale': options.cardScale ? String(options.cardScale) : '0.9',
    '--lk-card-radius': options.cardRadius || 'var(--lk-rpx-16)',
    '--lk-card-shadow': options.cardShadow || '0 var(--lk-rpx-8) var(--lk-rpx-24) rgba(0,0,0,0.12)',
  };
}

export function clampCarouselIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return Math.max(0, Math.min(index, length - 1));
}

export function shouldUpdateCarouselActive(oldValue: number, nextValue: number): boolean {
  return oldValue !== nextValue;
}

export function getCarouselSwiperCurrent(event: CarouselSwiperChangeEventLike): number {
  const value = event.detail?.current;
  return typeof value === 'number' ? value : 0;
}

export function resolveCarouselRootStyle(
  outerStyle: StyleValue,
  customStyle: StyleValue
): StyleValue {
  return [outerStyle, customStyle];
}

export function resolveCarouselItemClass(options: {
  card?: boolean;
  active: boolean;
  autoHeight?: boolean;
}) {
  return {
    'is-card': options.card,
    'is-active': options.active,
    'is-inactive': !options.active,
    'is-auto-height': options.autoHeight,
  };
}

export function resolveCarouselIndicatorsClass(options: {
  position: CarouselIndicatorPositionValue;
  indicatorAlign: string;
  indicatorVertical: boolean;
  indicatorAnimated?: boolean;
}) {
  return [
    `lk-carousel__indicators--pos-${options.position}`,
    `is-align-${options.indicatorAlign}`,
    {
      'is-vertical': options.indicatorVertical,
      'is-animated': options.indicatorAnimated,
    },
  ];
}

export function resolveCarouselIndicatorClass(options: {
  active: boolean;
  indicatorType: CarouselIndicatorTypeValue;
}) {
  return {
    'is-active': options.active,
    'is-dot': options.indicatorType === CarouselIndicatorType.Dots,
    'is-bar': options.indicatorType === CarouselIndicatorType.Bars,
  };
}

export function resolveCarouselIndicatorStyle(options: {
  active: boolean;
  indicatorActiveColor: string;
  indicatorInactiveColor?: string;
}) {
  return {
    backgroundColor: options.active
      ? options.indicatorActiveColor || undefined
      : options.indicatorInactiveColor,
  };
}

export function getCarouselRectHeight(rect: unknown): number {
  const value = Array.isArray(rect) ? rect[0] : rect;
  if (typeof value === 'object' && value !== null && 'height' in value) {
    const height = (value as CarouselNodeRectLike).height;
    return typeof height === 'number' ? height : 0;
  }

  return 0;
}
