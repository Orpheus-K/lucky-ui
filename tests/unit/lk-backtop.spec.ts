import { describe, expect, it } from 'vitest';
import {
  createBacktopPayload,
  resolveBacktopClass,
  resolveBacktopStyle,
  resolveBacktopVisible,
  resolveBacktopWrapperStyle,
  shouldBacktopScrollPage,
} from '../../src/uni_modules/lucky-ui/components/lk-backtop/backtop.utils';

describe('lk-backtop visibility and style rules', () => {
  it('resolves visibility from scroll threshold', () => {
    expect(resolveBacktopVisible({
      scrollTop: 199,
      visibilityHeight: 200,
    })).toBe(false);
    expect(resolveBacktopVisible({
      scrollTop: 200,
      visibilityHeight: 200,
    })).toBe(true);
  });

  it('builds wrapper style and style layers', () => {
    const wrapperStyle = resolveBacktopWrapperStyle({
      right: 40,
      bottom: '160rpx',
      zIndex: 500,
    });

    expect(wrapperStyle).toEqual({
      right: '40rpx',
      bottom: '160rpx',
      zIndex: '500',
    });
    expect(resolveBacktopStyle({
      wrapperStyle,
      customStyle: { color: 'red' },
    })).toEqual([
      wrapperStyle,
      { color: 'red' },
    ]);
  });

  it('builds size, shape and visible classes', () => {
    expect(resolveBacktopClass({
      size: 'sm',
      shape: 'round',
      visible: true,
      customClass: 'custom',
    })).toEqual([
      'lk-backtop',
      'lk-backtop--sm',
      'lk-backtop--shape-round',
      { 'is-visible': true },
      'custom',
    ]);
  });

  it('resolves page scroll behavior and emitted payload', () => {
    expect(shouldBacktopScrollPage(true)).toBe(true);
    expect(shouldBacktopScrollPage(false)).toBe(false);

    const event = { type: 'tap' };
    expect(createBacktopPayload({
      usePageScroll: false,
      duration: 300,
      easing: 'linear',
      event,
    })).toEqual({
      usePageScroll: false,
      duration: 300,
      easing: 'linear',
      event,
    });
  });
});
