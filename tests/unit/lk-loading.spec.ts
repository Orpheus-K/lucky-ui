import { describe, expect, it } from 'vitest';
import { LoadingVariant } from '../../src/uni_modules/lucky-ui/components/lk-loading/loading.props';
import {
  normalizeLoadingSize,
  resolveLoadingBarStyle,
  resolveLoadingHeightStyle,
  resolveLoadingRootClass,
  resolveLoadingRootStyle,
  resolveLoadingSquareStyle,
  resolveLoadingText,
  shouldRenderLoadingText,
} from '../../src/uni_modules/lucky-ui/components/lk-loading/loading.utils';

describe('lk-loading display rules', () => {
  it('exposes every loading variant through variant', () => {
    expect(Object.values(LoadingVariant)).toEqual([
      'spinner',
      'circular',
      'dots',
      'bar',
      'bounce',
      'wave',
      'ring',
      'ellipsis',
      'text',
    ]);
  });

  it('normalizes size and builds animation styles', () => {
    expect(normalizeLoadingSize(40)).toBe(40);
    expect(normalizeLoadingSize('48rpx')).toBe(48);
    expect(resolveLoadingSquareStyle('48rpx')).toEqual({
      width: '48rpx',
      height: '48rpx',
    });
    expect(resolveLoadingHeightStyle(32)).toEqual({ height: '32rpx' });
    expect(resolveLoadingBarStyle('30')).toEqual({ width: '60rpx' });
  });

  it('builds root class and color style', () => {
    expect(resolveLoadingRootClass({
      type: 'spinner',
      vertical: true,
      customClass: 'custom-loading',
    })).toEqual([
      'lk-loading--spinner',
      { 'is-vertical': true },
      'custom-loading',
    ]);
    expect(resolveLoadingRootStyle({
      color: '#1677ff',
      showTrack: true,
      trackColor: '',
      customStyle: { marginTop: '8rpx' },
    })).toEqual([{ '--_color': '#1677ff' }, { marginTop: '8rpx' }]);
  });

  it('resolves text display rules', () => {
    expect(resolveLoadingText({ type: 'text', text: '' })).toBe('Loading...');
    expect(resolveLoadingText({ type: 'text', text: '处理中' })).toBe('处理中');
    expect(resolveLoadingText({ type: 'spinner', text: '加载中' })).toBe('加载中');
    expect(shouldRenderLoadingText({ type: 'spinner', text: '加载中' })).toBe(true);
    expect(shouldRenderLoadingText({ type: 'text', text: '加载中' })).toBe(false);
    expect(shouldRenderLoadingText({ type: 'spinner', text: '' })).toBe(false);
  });
});
