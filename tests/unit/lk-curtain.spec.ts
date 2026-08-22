import { describe, expect, it } from 'vitest';
import { curtainProps } from '../../src/uni_modules/lucky-ui/components/lk-curtain/curtain.props';
import {
  type CurtainNavigationAction,
  ensureCurtainNegativeOffset,
  executeCurtainNavigation,
  isCurtainHttpLink,
  normalizeCurtainBackDelta,
  resolveCurtainCloseOffset,
  resolveCurtainCloseStyle,
  resolveCurtainContentStyle,
  resolveCurtainCopySuccessText,
  resolveCurtainHeight,
  resolveCurtainRootStyle,
  resolveCurtainNavigationAction,
  resolveCurtainTransitionConfig,
  resolveCurtainWidth,
  shouldCloseCurtainOnOverlay,
  shouldNavigateCurtainLink,
} from '../../src/uni_modules/lucky-ui/components/lk-curtain/curtain.utils';

describe('lk-curtain layout and link rules', () => {
  it('uses the public modal layer by default', () => {
    expect(curtainProps.zIndex.default).toBe(1500);
  });

  it('normalizes width, height and copy text fallback', () => {
    expect(resolveCurtainWidth(600)).toBe('600rpx');
    expect(resolveCurtainHeight('80vh')).toBe('80vh');
    expect(
      resolveCurtainCopySuccessText({
        copySuccessText: '',
        fallback: '复制成功',
      })
    ).toBe('复制成功');
    expect(
      resolveCurtainCopySuccessText({
        copySuccessText: '链接已复制',
        fallback: '复制成功',
      })
    ).toBe('链接已复制');
  });

  it('builds root and content style layers', () => {
    const customStyle = { marginTop: '24rpx' };
    expect(
      resolveCurtainRootStyle({
        customStyle,
        zIndex: 10090,
        show: true,
      })
    ).toEqual([
      customStyle,
      {
        zIndex: 10090,
        pointerEvents: 'auto',
      },
    ]);
    expect(
      resolveCurtainRootStyle({
        customStyle: '',
        zIndex: 10090,
        show: false,
      })
    ).toEqual([
      '',
      {
        zIndex: 10090,
        pointerEvents: 'none',
      },
    ]);
    expect(
      resolveCurtainContentStyle({
        zIndex: 10091,
        width: '600rpx',
        height: '800rpx',
      })
    ).toEqual({
      zIndex: 10091,
      width: '600rpx',
      height: '800rpx',
    });
  });

  it('resolves close button negative offsets by position', () => {
    expect(ensureCurtainNegativeOffset('24rpx')).toBe('-24rpx');
    expect(ensureCurtainNegativeOffset('-18px')).toBe('-18px');
    expect(
      resolveCurtainCloseOffset({
        closePosition: 'bottom',
        closeOffset: 24,
        closeOffsetBottom: 36,
      })
    ).toBe('-36rpx');
    expect(
      resolveCurtainCloseStyle({
        closePosition: 'top-right',
        closeOffset: 24,
        closeOffsetBottom: 36,
      })
    ).toEqual({
      top: '24rpx',
      right: '24rpx',
    });
    expect(
      resolveCurtainCloseStyle({
        closePosition: 'top-right',
        closeOffset: -24,
        closeOffsetBottom: 36,
      })
    ).toEqual({
      top: 'calc(-24rpx - var(--lk-rpx-72))',
      right: '0',
    });
    expect(
      resolveCurtainCloseStyle({
        closePosition: 'bottom',
        closeOffset: 24,
        closeOffsetBottom: 'var(--lk-rpx-36)',
      })
    ).toEqual({
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

  it('creates a URL request only for forward navigation', () => {
    expect(
      resolveCurtainNavigationAction({
        linkType: 'navigateTo',
        link: '/pages/home/index',
        backDelta: 4,
      })
    ).toEqual({
      type: 'navigateTo',
      options: { url: '/pages/home/index' },
    });
    expect(
      resolveCurtainNavigationAction({
        linkType: 'navigateTo',
        link: '',
        backDelta: 1,
      })
    ).toBeNull();
  });

  it('creates a delta-only navigateBack request without requiring a link', () => {
    expect(curtainProps.backDelta.default).toBe(1);
    expect(curtainProps.backDelta.validator(2)).toBe(true);
    expect(curtainProps.backDelta.validator(0)).toBe(false);
    expect(curtainProps.backDelta.validator(1.5)).toBe(false);
    expect(normalizeCurtainBackDelta(3)).toBe(3);
    expect(normalizeCurtainBackDelta(0)).toBe(1);
    expect(normalizeCurtainBackDelta(Number.NaN)).toBe(1);
    expect(
      resolveCurtainNavigationAction({
        linkType: 'navigateBack',
        link: '',
        backDelta: 2,
      })
    ).toEqual({
      type: 'navigateBack',
      options: { delta: 2 },
    });
    expect(
      resolveCurtainNavigationAction({
        linkType: 'navigateBack',
        link: '/ignored',
        backDelta: -2,
      })
    ).toEqual({
      type: 'navigateBack',
      options: { delta: 1 },
    });
  });

  it('executes each navigation protocol with its exact option shape', () => {
    const calls: Array<{ type: string; options: unknown }> = [];
    const observed: CurtainNavigationAction[] = [];
    const receivers: boolean[] = [];
    const runtime = {
      navigateTo(options: { url: string }) {
        receivers.push(this === runtime);
        calls.push({ type: 'navigateTo', options });
      },
      navigateBack(options: { delta: number }) {
        receivers.push(this === runtime);
        calls.push({ type: 'navigateBack', options });
      },
    };

    expect(
      executeCurtainNavigation(
        {
          type: 'navigateTo',
          options: { url: '/pages/home/index' },
        },
        runtime,
        action => observed.push(action)
      )
    ).toBe(true);
    expect(
      executeCurtainNavigation(
        {
          type: 'navigateBack',
          options: { delta: 2 },
        },
        runtime,
        action => observed.push(action)
      )
    ).toBe(true);
    expect(calls).toEqual([
      { type: 'navigateTo', options: { url: '/pages/home/index' } },
      { type: 'navigateBack', options: { delta: 2 } },
    ]);
    expect(receivers).toEqual([true, true]);
    expect(observed).toEqual([
      { type: 'navigateTo', options: { url: '/pages/home/index' } },
      { type: 'navigateBack', options: { delta: 2 } },
    ]);
    expect(
      executeCurtainNavigation(
        {
          type: 'switchTab',
          options: { url: '/pages/home/index' },
        },
        {},
        action => observed.push(action)
      )
    ).toBe(false);
    expect(observed).toHaveLength(2);
  });
});
