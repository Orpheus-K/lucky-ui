import { describe, expect, it } from 'vitest';
import {
  CarouselIndicatorPosition,
  CarouselIndicatorType,
} from '../../src/uni_modules/lucky-ui/components/lk-carousel/carousel.props';
import {
  clampCarouselIndex,
  getCarouselLength,
  getCarouselRectHeight,
  getCarouselSwiperCurrent,
  isCarouselAutoplayEnabled,
  isCarouselCircular,
  isCarouselIndicatorOutside,
  isCarouselIndicatorVertical,
  resolveCarouselCardStyleVars,
  resolveCarouselHeightProp,
  resolveCarouselIndicatorClass,
  resolveCarouselIndicatorInactiveColor,
  resolveCarouselIndicatorPosition,
  resolveCarouselIndicatorSpace,
  resolveCarouselIndicatorStyle,
  resolveCarouselIndicatorsClass,
  resolveCarouselItemClass,
  resolveCarouselNextMargin,
  resolveCarouselOuterStyle,
  resolveCarouselPreviousMargin,
  resolveCarouselRootStyle,
  resolveCarouselSwiperStyle,
  shouldShowCarouselIndicators,
  shouldUpdateCarouselActive,
} from '../../src/uni_modules/lucky-ui/components/lk-carousel/carousel.utils';

describe('lk-carousel layout and navigation rules', () => {
  it('resolves length, autoplay and circular guards', () => {
    expect(getCarouselLength(['a', 'b'])).toBe(2);
    expect(isCarouselAutoplayEnabled({ autoPlay: true, length: 2 })).toBe(true);
    expect(isCarouselAutoplayEnabled({ autoPlay: true, length: 1 })).toBe(false);
    expect(isCarouselCircular({ loop: true, length: 2 })).toBe(true);
    expect(isCarouselCircular({ loop: false, length: 2 })).toBe(false);
  });

  it('resolves indicator position and visibility', () => {
    expect(resolveCarouselIndicatorPosition({
      indicatorPosition: CarouselIndicatorPosition.Auto,
      vertical: true,
    })).toBe(CarouselIndicatorPosition.Right);
    expect(resolveCarouselIndicatorPosition({
      indicatorPosition: CarouselIndicatorPosition.TopLeft,
      vertical: false,
    })).toBe(CarouselIndicatorPosition.TopLeft);

    expect(isCarouselIndicatorVertical(CarouselIndicatorPosition.Left)).toBe(true);
    expect(shouldShowCarouselIndicators({
      showIndicators: true,
      indicatorType: CarouselIndicatorType.Dots,
      length: 2,
    })).toBe(true);
    expect(shouldShowCarouselIndicators({
      showIndicators: true,
      indicatorType: CarouselIndicatorType.None,
      length: 2,
    })).toBe(false);
    expect(isCarouselIndicatorOutside({
      indicatorOverlay: false,
      showIndicators: true,
    })).toBe(true);
  });

  it('resolves margins, height and card variables', () => {
    expect(resolveCarouselPreviousMargin({
      card: true,
      cardPrevMargin: '',
      peek: false,
      peekPrevMargin: '20rpx',
    })).toBe('60rpx');
    expect(resolveCarouselNextMargin({
      card: false,
      cardNextMargin: '',
      peek: true,
      peekNextMargin: '24rpx',
    })).toBe('24rpx');

    expect(resolveCarouselHeightProp(320)).toBe('320rpx');
    expect(resolveCarouselIndicatorSpace({
      indicatorOutside: true,
      indicatorType: CarouselIndicatorType.Number,
    })).toBe('var(--lk-rpx-50)');

    expect(resolveCarouselCardStyleVars({
      card: true,
      cardScale: undefined,
      cardRadius: '',
      cardShadow: '',
    })).toMatchObject({
      '--lk-card-scale': '0.9',
      '--lk-card-radius': 'var(--lk-rpx-16)',
    });
  });

  it('builds outer and swiper styles', () => {
    expect(resolveCarouselOuterStyle({
      autoHeight: true,
      currentHeight: 200,
      indicatorOutside: true,
      indicatorHeightPx: 30,
      heightProp: '320rpx',
      indicatorSpaceRpx: '40rpx',
    })).toEqual({
      height: '230px',
      transition: 'height 0.3s ease',
    });
    expect(resolveCarouselSwiperStyle({
      autoHeight: false,
      currentHeight: 0,
      indicatorOutside: true,
    })).toEqual({ height: 'calc(100% - var(--lk-indicator-space))' });

    const outer = { height: '320rpx' };
    const custom = { marginTop: '12rpx' };
    expect(resolveCarouselRootStyle(outer, custom)).toEqual([outer, custom]);
  });

  it('resolves active index and swiper event current', () => {
    expect(clampCarouselIndex(-1, 3)).toBe(0);
    expect(clampCarouselIndex(9, 3)).toBe(2);
    expect(shouldUpdateCarouselActive(1, 2)).toBe(true);
    expect(shouldUpdateCarouselActive(1, 1)).toBe(false);
    expect(getCarouselSwiperCurrent({ detail: { current: 2 } })).toBe(2);
    expect(getCarouselSwiperCurrent({ detail: { current: '2' } })).toBe(0);
  });

  it('builds item and indicator classes/styles', () => {
    expect(resolveCarouselItemClass({
      card: true,
      active: false,
      autoHeight: true,
    })).toEqual({
      'is-card': true,
      'is-active': false,
      'is-inactive': true,
      'is-auto-height': true,
    });
    expect(resolveCarouselIndicatorsClass({
      position: CarouselIndicatorPosition.Bottom,
      indicatorAlign: 'center',
      indicatorVertical: false,
      indicatorAnimated: true,
    })).toEqual([
      'lk-carousel__indicators--pos-bottom',
      'is-align-center',
      { 'is-vertical': false, 'is-animated': true },
    ]);
    expect(resolveCarouselIndicatorClass({
      active: true,
      indicatorType: CarouselIndicatorType.Bars,
    })).toEqual({
      'is-active': true,
      'is-dot': false,
      'is-bar': true,
    });
    expect(resolveCarouselIndicatorInactiveColor({
      indicatorInactiveColor: '#ddd',
    })).toBe('#ddd');
    expect(resolveCarouselIndicatorStyle({
      active: false,
      indicatorActiveColor: '#1677ff',
      indicatorInactiveColor: '#ddd',
    })).toEqual({ backgroundColor: '#ddd' });
  });

  it('reads selector height from single or array rect result', () => {
    expect(getCarouselRectHeight({ height: 120 })).toBe(120);
    expect(getCarouselRectHeight([{ height: 80 }])).toBe(80);
    expect(getCarouselRectHeight(null)).toBe(0);
  });
});
