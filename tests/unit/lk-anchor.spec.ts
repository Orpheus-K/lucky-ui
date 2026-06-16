import { describe, expect, it } from 'vitest';
import {
  canClickAnchorLink,
  normalizeAnchorTargets,
  resolveActiveAnchorByScroll,
  resolveAnchorLinkActive,
  resolveAnchorLinkClass,
  resolveAnchorNumber,
  resolveAnchorOffset,
  resolveAnchorProgrammaticState,
  resolveAnchorScrollIntoViewId,
  resolveAnchorScrollTop,
  resolveAnchorStyle,
  resolveAnchorTargetId,
} from '../../src/uni_modules/lucky-ui/components/lk-anchor/anchor.utils';

describe('lk-anchor scroll and link rules', () => {
  it('builds css variable style from color props', () => {
    expect(resolveAnchorStyle({
      bgColor: '#fff',
      activeBgColor: '#f4f4f5',
      textColor: '#333',
      activeColor: '#1989fa',
      customStyle: { width: '200rpx' },
    })).toEqual([{
      '--lk-anchor-bg-sidebar': '#fff',
      '--lk-anchor-bg-active': '#f4f4f5',
      '--lk-anchor-text-color': '#333',
      '--lk-anchor-active-color': '#1989fa',
    }, { width: '200rpx' }]);
  });

  it('normalizes targets and parses supported numeric units', () => {
    expect(resolveAnchorNumber('24rpx')).toBe(24);
    expect(resolveAnchorNumber('16px')).toBe(16);
    expect(resolveAnchorNumber('invalid')).toBe(0);
    expect(resolveAnchorOffset({ headerOffset: '20rpx', headerHeight: 44 })).toBe(74);

    expect(normalizeAnchorTargets([
      { href: 'usage', top: 300, height: 120 },
      { href: '', top: 10 },
      { href: 'intro', top: 100 },
    ])).toEqual([
      { href: 'intro', top: 100, height: 0 },
      { href: 'usage', top: 300, height: 120 },
    ]);
  });

  it('resolves active anchor from scroll position', () => {
    const targets = normalizeAnchorTargets([
      { href: 'intro', top: 100 },
      { href: 'api', top: 300 },
      { href: 'demo', top: 600 },
    ]);

    expect(resolveActiveAnchorByScroll({
      targets,
      scrollTop: 0,
      headerOffset: 0,
    })).toBe('intro');
    expect(resolveActiveAnchorByScroll({
      targets,
      scrollTop: 290,
      headerOffset: 0,
    })).toBe('api');
    expect(resolveActiveAnchorByScroll({
      targets,
      scrollTop: 560,
      headerOffset: 40,
    })).toBe('demo');
  });

  it('keeps the last anchor active when the final section cannot align to the top', () => {
    const targets = normalizeAnchorTargets([
      { href: 'hot', top: 0 },
      { href: 'add', top: 2060 },
      { href: 'side', top: 2430 },
    ]);

    expect(resolveActiveAnchorByScroll({
      targets,
      scrollTop: 2217,
      maxScrollTop: 2217,
    })).toBe('side');
    expect(resolveActiveAnchorByScroll({
      targets,
      scrollTop: 2216,
      maxScrollTop: 2217,
    })).toBe('side');
  });

  it('resolves programmatic scroll state', () => {
    const targets = normalizeAnchorTargets([
      { href: 'intro', top: 100 },
      { href: 'api', top: 300 },
    ]);

    expect(resolveAnchorProgrammaticState({
      isProgrammaticScrolling: false,
      pendingTargetHref: 'api',
      targets,
      scrollTop: 300,
    })).toEqual({ handled: false, reached: false, targetHref: '' });

    expect(resolveAnchorProgrammaticState({
      isProgrammaticScrolling: true,
      pendingTargetHref: 'missing',
      targets,
      scrollTop: 300,
    })).toEqual({ handled: true, reached: false, targetHref: '', shouldFinish: true });

    expect(resolveAnchorProgrammaticState({
      isProgrammaticScrolling: true,
      pendingTargetHref: 'api',
      targets,
      scrollTop: 284,
      headerOffset: 0,
    })).toEqual({
      handled: true,
      reached: true,
      targetHref: 'api',
      shouldFinish: false,
    });
  });

  it('treats bottom saturation as reaching the last programmatic target', () => {
    const targets = normalizeAnchorTargets([
      { href: 'add', top: 2060 },
      { href: 'side', top: 2430 },
    ]);

    expect(resolveAnchorProgrammaticState({
      isProgrammaticScrolling: true,
      pendingTargetHref: 'side',
      targets,
      scrollTop: 2217,
      maxScrollTop: 2217,
    })).toEqual({
      handled: true,
      reached: true,
      targetHref: 'side',
      shouldFinish: false,
    });
  });

  it('resolves target id, scroll top and scroll-into-view id', () => {
    expect(resolveAnchorTargetId('#intro')).toBe('intro');
    expect(resolveAnchorTargetId('api')).toBe('api');
    expect(resolveAnchorScrollTop({ targetTop: 80, headerOffset: 120 })).toBe(0);
    expect(resolveAnchorScrollTop({ targetTop: 300, headerOffset: '44px' })).toBe(256);
    expect(resolveAnchorScrollIntoViewId('intro')).toBe('anchor-link-intro');
    expect(resolveAnchorScrollIntoViewId('')).toBe('');
  });

  it('resolves link active, class and click guard', () => {
    expect(resolveAnchorLinkActive('intro', 'intro')).toBe(true);
    expect(resolveAnchorLinkClass({
      active: true,
      disabled: false,
      customClass: 'custom-link',
    })).toEqual([
      'lk-anchor-link--active',
      '',
      'custom-link',
    ]);
    expect(canClickAnchorLink(false, 'intro')).toBe(true);
    expect(canClickAnchorLink(true, 'intro')).toBe(false);
    expect(canClickAnchorLink(false, '')).toBe(false);
  });
});
