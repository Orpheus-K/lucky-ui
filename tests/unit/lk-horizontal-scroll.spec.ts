import { describe, expect, it } from 'vitest';
import {
  resolveHorizontalScrollClass,
  resolveHorizontalScrollContainerStyle,
  resolveHorizontalScrollRootStyle,
  shouldShowHorizontalScrollbar,
} from '../../src/uni_modules/lucky-ui/components/lk-horizontal-scroll/horizontal-scroll.utils';

describe('lk-horizontal-scroll layout rules', () => {
  it('builds root class and forwards custom style', () => {
    expect(resolveHorizontalScrollClass('quick-row')).toEqual([
      'lk-horizontal-scroll',
      'quick-row',
    ]);

    const customStyle = { marginTop: '12rpx' };
    expect(resolveHorizontalScrollRootStyle(customStyle)).toBe(customStyle);
  });

  it('inverts hideScrollbar into show-scrollbar', () => {
    expect(shouldShowHorizontalScrollbar(true)).toBe(false);
    expect(shouldShowHorizontalScrollbar(false)).toBe(true);
  });

  it('normalizes gap and horizontal padding units', () => {
    expect(resolveHorizontalScrollContainerStyle({
      gap: 20,
      padding: '16px',
    })).toEqual({
      '--lk-hs-gap': '20rpx',
      paddingLeft: '16px',
      paddingRight: '16px',
    });

    expect(resolveHorizontalScrollContainerStyle({
      gap: 'var(--lk-rpx-20)',
      padding: '',
    })).toEqual({
      '--lk-hs-gap': 'var(--lk-rpx-20)',
      paddingLeft: undefined,
      paddingRight: undefined,
    });
  });
});
