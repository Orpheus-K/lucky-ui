import { describe, expect, it } from 'vitest';
import {
  resolveNavbarContentHeight,
  resolveNavbarContentStyle,
  resolveNavbarMergedStyle,
  resolveNavbarPlaceholderStyle,
  resolveNavbarRootClass,
  resolveNavbarSafeStyle,
  shouldNavigateBack,
} from '../../src/uni_modules/lucky-ui/components/lk-navbar/navbar.utils';

describe('lk-navbar layout and back rules', () => {
  it('builds root class and merged style', () => {
    expect(resolveNavbarRootClass({
      variant: 'elevated',
      titleAlign: 'left',
      customClass: 'page-navbar',
      fixed: true,
      border: false,
      shadow: true,
      background: 'linear-gradient(red, blue)',
    })).toEqual([
      'lk-navbar',
      'lk-navbar--elevated',
      'lk-navbar--title-left',
      'page-navbar',
      {
        'is-fixed': true,
        'is-border': false,
        'is-shadow': true,
        'has-background': true,
      },
    ]);

    expect(resolveNavbarMergedStyle({
      zIndex: 300,
      background: '#fff',
      customStyle: '',
    })).toEqual({
      zIndex: 300,
      background: '#fff',
    });
    expect(resolveNavbarMergedStyle({
      zIndex: 300,
      background: '',
      customStyle: { color: 'red' },
    })).toEqual({ zIndex: 300, color: 'red' });
  });

  it('calculates content height and capsule safe padding', () => {
    expect(resolveNavbarContentHeight({
      statusBarHeight: 20,
      menuButtonInfo: {
        height: 32,
        top: 26,
      },
    })).toBe(44);
    expect(resolveNavbarContentHeight({
      statusBarHeight: 20,
      menuButtonInfo: {},
    })).toBe(44);

    expect(resolveNavbarSafeStyle({
      fixed: true,
      safeArea: true,
      menuButtonLeft: 300,
      windowWidth: 375,
      rpxToPx: value => value / 2,
    })).toEqual({
      '--lk-navbar-content-padding-right': '79px',
    });
    expect(resolveNavbarSafeStyle({
      fixed: false,
      safeArea: true,
      menuButtonLeft: 300,
      windowWidth: 375,
      rpxToPx: value => value / 2,
    })).toEqual({});
  });

  it('builds content and placeholder style', () => {
    expect(resolveNavbarContentStyle({
      navbarContentHeight: 44,
      capsuleSafeStyle: {
        '--lk-navbar-content-padding-right': '79px',
      },
    })).toEqual({
      height: '44px',
      '--lk-navbar-content-padding-right': '79px',
    });
    expect(resolveNavbarPlaceholderStyle({
      safeArea: true,
      statusBarHeight: 20,
      navbarContentHeight: 44,
    })).toEqual({ height: '64px' });
    expect(resolveNavbarPlaceholderStyle({
      safeArea: false,
      statusBarHeight: 20,
      navbarContentHeight: 44,
    })).toEqual({ height: '44px' });
  });

  it('navigates back only when page stack has history', () => {
    expect(shouldNavigateBack([{}, {}])).toBe(true);
    expect(shouldNavigateBack([{}])).toBe(false);
    expect(shouldNavigateBack(undefined)).toBe(false);
  });
});
