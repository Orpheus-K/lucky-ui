import { describe, expect, it } from 'vitest';
import {
  ensureCurtainNegativeOffset,
  isCurtainHttpLink,
  resolveCurtainCloseOffset,
  resolveCurtainCloseStyle,
  resolveCurtainContentStyle,
  resolveCurtainCopySuccessText,
  resolveCurtainHeight,
  resolveCurtainRootStyle,
  resolveCurtainTransitionConfig,
  resolveCurtainWidth,
  shouldCloseCurtainOnOverlay,
  shouldNavigateCurtainLink,
} from '../../src/uni_modules/lucky-ui/components/lk-curtain/curtain.utils';

describe('lk-curtain layout and link rules', () => {
  it('normalizes width, height and copy text fallback', () => {
    expect(resolveCurtainWidth(600)).toBe('600rpx');
    expect(resolveCurtainHeight('80vh')).toBe('80vh');
    expect(resolveCurtainCopySuccessText({
      copySuccessText: '',
      fallback: '复制成功',
    })).toBe('复制成功');
    expect(resolveCurtainCopySuccessText({
      copySuccessText: '链接已复制',
      fallback: '复制成功',
    })).toBe('链接已复制');
  });

  it('builds root and content style layers', () => {
    const customStyle = { marginTop: '24rpx' };
    expect(resolveCurtainRootStyle({
      customStyle,
      zIndex: 10090,
      show: true,
    })).toEqual([
      customStyle,
      {
        zIndex: 10090,
        pointerEvents: 'auto',
      },
    ]);
    expect(resolveCurtainRootStyle({
      customStyle: '',
      zIndex: 10090,
      show: false,
    })).toEqual([
      '',
      {
        zIndex: 10090,
        pointerEvents: 'none',
      },
    ]);
    expect(resolveCurtainContentStyle({
      zIndex: 10091,
      width: '600rpx',
      height: '800rpx',
    })).toEqual({
      zIndex: 10091,
      width: '600rpx',
      height: '800rpx',
    });
  });

  it('resolves close button negative offsets by position', () => {
    expect(ensureCurtainNegativeOffset('24rpx')).toBe('-24rpx');
    expect(ensureCurtainNegativeOffset('-18px')).toBe('-18px');
    expect(resolveCurtainCloseOffset({
      closePosition: 'bottom',
      closeOffset: 24,
      closeOffsetBottom: 36,
    })).toBe('-36rpx');
    expect(resolveCurtainCloseStyle({
      closePosition: 'top-right',
      closeOffset: 24,
      closeOffsetBottom: 36,
    })).toEqual({
      top: '24rpx',
      right: '24rpx',
    });
    expect(resolveCurtainCloseStyle({
      closePosition: 'top-right',
      closeOffset: -24,
      closeOffsetBottom: 36,
    })).toEqual({
      top: 'calc(-24rpx - var(--lk-rpx-72))',
      right: '0',
    });
    expect(resolveCurtainCloseStyle({
      closePosition: 'bottom',
      closeOffset: 24,
      closeOffsetBottom: 'var(--lk-rpx-36)',
    })).toEqual({
      bottom: 'calc(var(--lk-rpx-36) * -1)',
    });
  });

  it('resolves transition, overlay close and link type rules', () => {
    expect(resolveCurtainTransitionConfig()).toEqual({
      name: 'zoom-in',
      duration: 220,
      easing: 'ease-out',
    });
    expect(shouldCloseCurtainOnOverlay(true)).toBe(true);
    expect(shouldCloseCurtainOnOverlay(false)).toBe(false);
    expect(shouldNavigateCurtainLink('')).toBe(false);
    expect(shouldNavigateCurtainLink('/pages/home/index')).toBe(true);
    expect(isCurtainHttpLink('https://example.com')).toBe(true);
    expect(isCurtainHttpLink('/pages/home/index')).toBe(false);
  });
});
