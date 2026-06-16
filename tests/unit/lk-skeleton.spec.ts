import { describe, expect, it } from 'vitest';
import {
  resolveSkeletonAnimatedClass,
  resolveSkeletonAvatarStyle,
  resolveSkeletonHostStyle,
  resolveSkeletonIndexedValue,
  resolveSkeletonRowStyle,
  resolveSkeletonRootClass,
  resolveSkeletonTitleStyle,
} from '../../src/uni_modules/lucky-ui/components/lk-skeleton/skeleton.utils';

describe('lk-skeleton display rules', () => {
  it('resolves indexed width and height values with last item fallback', () => {
    expect(resolveSkeletonIndexedValue(['40%', '80%'], 0, '100%')).toBe('40%');
    expect(resolveSkeletonIndexedValue(['40%', '80%'], 3, '100%')).toBe('80%');
    expect(resolveSkeletonIndexedValue([], 0, '100%')).toBe('100%');
    expect(resolveSkeletonIndexedValue('60%', 0, '100%')).toBe('60%');
  });

  it('builds host animation variables', () => {
    expect(resolveSkeletonHostStyle({
      duration: 2.4,
      easing: 'ease-in-out',
      customStyle: { marginTop: '8rpx' },
    })).toEqual([{
      '--lk-skel-duration': '2.4s',
      '--lk-skel-ease': 'ease-in-out',
    }, { marginTop: '8rpx' }]);

    expect(resolveSkeletonHostStyle({
      duration: '',
      easing: 'linear',
    })).toEqual([{
      '--lk-skel-duration': '1.8s',
      '--lk-skel-ease': 'linear',
    }, '']);

    expect(resolveSkeletonRootClass('custom-skeleton')).toEqual([
      'lk-skeleton',
      'custom-skeleton',
    ]);
  });

  it('builds avatar and title styles', () => {
    expect(resolveSkeletonAvatarStyle({
      avatarSize: '72rpx',
      round: true,
    })).toEqual({
      width: '72rpx',
      height: '72rpx',
      borderRadius: '50%',
    });

    expect(resolveSkeletonTitleStyle({
      titleWidth: '40%',
      titleHeight: '32rpx',
    })).toEqual({
      width: '40%',
      height: '32rpx',
    });
  });

  it('builds row style and animation class', () => {
    expect(resolveSkeletonRowStyle({
      rowWidth: ['100%', '60%'],
      rowHeight: '32rpx',
      index: 2,
    })).toEqual({
      width: '60%',
      height: '32rpx',
    });

    expect(resolveSkeletonAnimatedClass(true)).toEqual({ 'is-anim': true });
    expect(resolveSkeletonAnimatedClass(false)).toEqual({ 'is-anim': false });
  });
});
