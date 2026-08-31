import { describe, expect, it } from 'vitest';
import { pageProps } from '../../src/uni_modules/lucky-ui/components/lk-page/page.props';
import {
  resolvePageLeftSlotStyle,
  resolvePageNavbarContentHeight,
  resolvePageReservedTopHeight,
  resolvePageRootClass,
} from '../../src/uni_modules/lucky-ui/components/lk-page/page.utils';

describe('lk-page layout and calculations', () => {
  it('has standard default props', () => {
    expect(pageProps.reserveTop.default).toBe(false);
    expect(pageProps.capsuleAlign.default).toBe(false);
    expect(pageProps.safeAreaBottom.default).toBe(true);
    expect(pageProps.scrollable.default).toBe(true);
    expect(pageProps.scrollClass.default).toBe('');
    expect(pageProps.scrollStyle.default).toBe('');
  });

  it('calculates navbar content height and reserved top spacing', () => {
    // 小程序胶囊存在时的计算
    const navHeightWithCapsule = resolvePageNavbarContentHeight({
      statusBarHeight: 20,
      menuButtonInfo: {
        height: 32,
        top: 26,
        left: 280,
      },
    });
    // 32 + (26 - 20) * 2 = 32 + 12 = 44
    expect(navHeightWithCapsule).toBe(44);

    const totalReservedTop = resolvePageReservedTopHeight({
      statusBarHeight: 20,
      navbarContentHeight: navHeightWithCapsule,
    });
    expect(totalReservedTop).toBe(64);

    // 无胶囊（如 H5/App）时的回退计算
    const navHeightFallback = resolvePageNavbarContentHeight({
      statusBarHeight: 0,
      menuButtonInfo: {},
    });
    expect(navHeightFallback).toBe(44);

    const customDefaultHeight = resolvePageNavbarContentHeight({
      statusBarHeight: 0,
      menuButtonInfo: {},
      defaultHeight: 48,
    });
    expect(customDefaultHeight).toBe(48);
  });

  it('resolves left slot style for standard and capsule alignments', () => {
    // 1. 标准居中对齐 (capsuleAlign: false)
    const standardStyle = resolvePageLeftSlotStyle({
      capsuleAlign: false,
      statusBarHeight: 24,
      navbarContentHeight: 44,
      menuButtonInfo: { height: 32, top: 30 },
      zIndex: 99,
    });
    expect(standardStyle).toEqual({
      zIndex: '99',
      top: '24px',
      height: '44px',
    });

    // 2. 胶囊居中对齐 (capsuleAlign: true) - 存在胶囊信息
    const capsuleStyle = resolvePageLeftSlotStyle({
      capsuleAlign: true,
      statusBarHeight: 24,
      navbarContentHeight: 44,
      menuButtonInfo: { height: 32, top: 30 },
      zIndex: 100,
    });
    expect(capsuleStyle).toEqual({
      zIndex: '100',
      top: '30px',
      height: '32px',
    });

    // 3. 胶囊居中对齐 (capsuleAlign: true) - 无胶囊信息 (H5/App Fallback)
    const fallbackCapsuleStyle = resolvePageLeftSlotStyle({
      capsuleAlign: true,
      statusBarHeight: 0,
      navbarContentHeight: 44,
      menuButtonInfo: {},
    });
    expect(fallbackCapsuleStyle).toEqual({
      top: '6px',
      height: '32px',
    });
  });

  it('builds root classes according to scrollable and customClass', () => {
    // 可滚动模式
    const scrollableClasses = resolvePageRootClass({
      customClass: 'custom-page-class',
      scrollable: true,
    });
    expect(scrollableClasses).toEqual([
      'lk-page',
      'custom-page-class',
      {
        'lk-page--non-scrollable': false,
      },
    ]);

    // 非滚动全屏/原生滚动模式
    const nonScrollableClasses = resolvePageRootClass({
      scrollable: false,
    });
    expect(nonScrollableClasses).toEqual([
      'lk-page',
      undefined,
      {
        'lk-page--non-scrollable': true,
      },
    ]);
  });
});
