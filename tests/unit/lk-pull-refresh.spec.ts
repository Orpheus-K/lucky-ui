import { describe, expect, it } from 'vitest';
import { PullRefreshStatus } from '../../src/uni_modules/lucky-ui/components/lk-pull-refresh/pull-refresh.props';
import {
  getNextPullRefreshScrollTop,
  getPullRefreshDistance,
  isPullRefreshIndicatorVisible,
  normalizePullRefreshSuccessDuration,
  resolvePullingStatus,
  resolvePullRefreshClass,
  resolvePullRefreshIndicatorStyle,
  resolvePullRefreshIndicatorText,
  resolvePullRefreshInitialStatus,
  resolvePullRefreshMergedStyle,
  resolvePullRefreshProgress,
  resolvePullRefreshRootStyle,
  shouldIgnorePulling,
  shouldShowRefreshSuccess,
} from '../../src/uni_modules/lucky-ui/components/lk-pull-refresh/pull-refresh.utils';

describe('lk-pull-refresh state and indicator rules', () => {
  it('resolves initial status from model value', () => {
    expect(resolvePullRefreshInitialStatus(true)).toBe(PullRefreshStatus.Refreshing);
    expect(resolvePullRefreshInitialStatus(false)).toBe(PullRefreshStatus.Idle);
  });

  it('builds root class and styles', () => {
    expect(resolvePullRefreshClass({
      status: PullRefreshStatus.Pulling,
      disabled: true,
      indicatorVisible: false,
      customClass: 'custom-refresh',
    })).toEqual([
      'lk-pull-refresh',
      'lk-pull-refresh--pulling',
      { 'is-disabled': true, 'is-active': false },
      'custom-refresh',
    ]);

    const rootStyle = resolvePullRefreshRootStyle({
      height: 320,
      background: '#fff',
    });
    const customStyle = { marginTop: '12rpx' };
    expect(rootStyle).toEqual({ height: '320rpx', background: '#fff' });
    expect(resolvePullRefreshMergedStyle(rootStyle, customStyle)).toEqual([rootStyle, customStyle]);
  });

  it('resolves indicator text by status', () => {
    const texts = {
      loadingText: '加载中',
      successText: '完成',
      loosingText: '释放',
      pullingText: '下拉',
    };

    expect(resolvePullRefreshIndicatorText({
      status: PullRefreshStatus.Refreshing,
      ...texts,
    })).toBe('加载中');
    expect(resolvePullRefreshIndicatorText({
      status: PullRefreshStatus.Success,
      ...texts,
    })).toBe('完成');
    expect(resolvePullRefreshIndicatorText({
      status: PullRefreshStatus.Loosing,
      ...texts,
    })).toBe('释放');
    expect(resolvePullRefreshIndicatorText({
      status: PullRefreshStatus.Pulling,
      ...texts,
    })).toBe('下拉');
  });

  it('resolves visibility, progress and indicator transform', () => {
    expect(isPullRefreshIndicatorVisible({
      refresherActive: false,
      status: PullRefreshStatus.Refreshing,
      pullingDistance: 0,
    })).toBe(false);

    expect(isPullRefreshIndicatorVisible({
      refresherActive: true,
      status: PullRefreshStatus.Pulling,
      pullingDistance: 10,
    })).toBe(true);

    expect(resolvePullRefreshProgress({
      status: PullRefreshStatus.Pulling,
      pullingDistance: 40,
      threshold: 80,
    })).toBe(0.5);
    expect(resolvePullRefreshProgress({
      status: PullRefreshStatus.Refreshing,
      pullingDistance: 0,
      threshold: 80,
    })).toBe(1);

    expect(resolvePullRefreshIndicatorStyle({
      visible: true,
      progress: 2,
    })).toEqual({
      opacity: 1,
      transform: 'translate3d(0, 18rpx, 0)',
    });
  });

  it('resolves pulling distance and threshold status', () => {
    expect(getPullRefreshDistance({ detail: { dy: -12 } })).toBe(0);
    expect(getPullRefreshDistance({ detail: { dy: '64' } })).toBe(64);
    expect(resolvePullingStatus({ distance: 0, threshold: 80 })).toBe(PullRefreshStatus.Idle);
    expect(resolvePullingStatus({ distance: 40, threshold: 80 })).toBe(PullRefreshStatus.Pulling);
    expect(resolvePullingStatus({ distance: 80, threshold: 80 })).toBe(PullRefreshStatus.Loosing);
  });

  it('guards pulling and success settle behavior', () => {
    expect(shouldIgnorePulling({
      disabled: true,
      status: PullRefreshStatus.Pulling,
    })).toBe(true);
    expect(shouldIgnorePulling({
      disabled: false,
      status: PullRefreshStatus.Refreshing,
    })).toBe(true);
    expect(shouldIgnorePulling({
      disabled: false,
      status: PullRefreshStatus.Pulling,
    })).toBe(false);

    expect(shouldShowRefreshSuccess({
      status: PullRefreshStatus.Refreshing,
      showSuccess: true,
    })).toBe(true);
    expect(shouldShowRefreshSuccess({
      status: PullRefreshStatus.Idle,
      showSuccess: true,
    })).toBe(false);
    expect(normalizePullRefreshSuccessDuration(-100)).toBe(0);
  });

  it('toggles scroll top to force native scroll reset', () => {
    expect(getNextPullRefreshScrollTop(0)).toBe(1);
    expect(getNextPullRefreshScrollTop(20)).toBe(0);
  });
});
