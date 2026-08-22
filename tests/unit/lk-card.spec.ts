import { describe, expect, it, vi } from 'vitest';
import { cardProps } from '../../src/uni_modules/lucky-ui/components/lk-card/card.props';
import {
  cardShadowMap,
  resolveCardBodyStyle,
  resolveCardClass,
  resolveCardFooterStyle,
  resolveCardHeaderStyle,
  resolveCardRootStyle,
  resolveCardStyle,
} from '../../src/uni_modules/lucky-ui/components/lk-card/card.utils';

describe('lk-card display rules', () => {
  it('exposes the documented interaction and overflow props', () => {
    expect(cardProps).not.toHaveProperty('hoverable');
    expect(cardProps.ripple.default).toBe(false);
    expect(cardProps.overflow.default).toBe('hidden');
    expect(cardProps.overflow.validator?.('visible')).toBe(true);

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(cardProps.overflow.validator?.('clip')).toBe(false);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('builds root classes from border and ripple state', () => {
    expect(
      resolveCardClass({
        customClass: 'custom-card',
        border: true,
        ripple: true,
        rippleActive: true,
      })
    ).toEqual([
      'lk-card',
      'custom-card',
      {
        'is-border': true,
        'lk-ripple': true,
        'lk-ripple--active': true,
      },
    ]);

    expect(
      resolveCardClass({
        customClass: '',
        border: false,
        ripple: true,
        rippleActive: false,
      })[2]
    ).toMatchObject({
      'lk-ripple': true,
      'lk-ripple--active': false,
    });
  });

  it('resolves background, overflow and shadow variables', () => {
    expect(
      resolveCardStyle({
        transparent: true,
        bgColor: '#fff',
        overflow: 'visible',
        shadow: 'lg',
      })
    ).toEqual({
      '--_bg': 'transparent',
      '--_overflow': 'visible',
      '--_shadow': cardShadowMap.lg,
    });

    expect(
      resolveCardStyle({
        transparent: false,
        bgColor: '#101010',
        overflow: 'hidden',
        shadow: 'never',
      })
    ).toEqual({
      '--_bg': '#101010',
      '--_overflow': 'hidden',
      '--_shadow': 'none',
    });

    expect(
      resolveCardStyle({
        transparent: false,
        bgColor: '',
        overflow: 'hidden',
        shadow: 'unknown',
      })
    ).toEqual({
      '--_overflow': 'hidden',
    });
  });

  it('combines computed style with custom style', () => {
    const cardStyle = { '--_overflow': 'hidden' };
    const customStyle = { marginTop: '12rpx' };

    expect(resolveCardRootStyle(cardStyle, customStyle)).toEqual([cardStyle, customStyle]);
  });

  it('builds section padding styles', () => {
    expect(resolveCardHeaderStyle('32rpx')).toEqual({ padding: '32rpx 32rpx 0' });
    expect(resolveCardBodyStyle('32rpx')).toEqual({ padding: '32rpx' });
    expect(resolveCardFooterStyle('32rpx')).toEqual({ padding: '0 32rpx 32rpx' });
  });
});
