import { describe, expect, it } from 'vitest';
import {
  resolveAvatarBorderRadius,
  resolveAvatarClass,
  resolveAvatarFallbackText,
  resolveAvatarStyle,
  shouldShowAvatarImage,
} from '../../src/uni_modules/lucky-ui/components/lk-avatar/avatar.utils';

describe('lk-avatar display rules', () => {
  it('resolves border radius from shape and lets circle take priority', () => {
    expect(resolveAvatarBorderRadius({ shape: 'circle', radius: 12 })).toBe('50%');
    expect(resolveAvatarBorderRadius({ shape: 'rounded', radius: '' })).toBe('var(--lk-radius-lg)');
    expect(resolveAvatarBorderRadius({ shape: 'square', radius: '' })).toBe('var(--lk-radius-xs)');
  });

  it('uses custom radius for non-circle avatars', () => {
    expect(resolveAvatarBorderRadius({ shape: 'rounded', radius: 16 })).toBe('16rpx');
    expect(resolveAvatarBorderRadius({ shape: 'square', radius: '8px' })).toBe('8px');
  });

  it('builds inline size, background, radius and text color', () => {
    expect(resolveAvatarStyle({
      shape: 'rounded',
      size: 64,
      radius: '',
      bg: 'linear-gradient(red, blue)',
      color: '#fff',
    })).toEqual({
      width: '64rpx',
      height: '64rpx',
      background: 'linear-gradient(red, blue)',
      borderRadius: 'var(--lk-radius-lg)',
      color: '#fff',
    });
  });

  it('falls back to default background and preserves css size units', () => {
    expect(resolveAvatarStyle({
      shape: 'square',
      size: '40px',
      radius: '',
      bg: '',
      color: '',
    })).toMatchObject({
      width: '40px',
      height: '40px',
      background: 'var(--lk-fill-1)',
      color: undefined,
    });
  });

  it('shows image only when src exists and no loading error occurred', () => {
    expect(shouldShowAvatarImage({ src: 'https://example.com/a.png', hasError: false })).toBe(true);
    expect(shouldShowAvatarImage({ src: '', hasError: false })).toBe(false);
    expect(shouldShowAvatarImage({ src: 'https://example.com/a.png', hasError: true })).toBe(false);
  });

  it('builds class entries from shape and fallback state', () => {
    const classes = resolveAvatarClass({
      shape: 'rounded',
      fallback: true,
      customClass: 'custom-avatar',
    });

    expect(classes).toContain('lk-avatar--rounded');
    expect(classes).toContain('custom-avatar');
    expect(classes[1]).toEqual({ 'is-fallback': true });
  });

  it('uses the first uppercase character as fallback text', () => {
    expect(resolveAvatarFallbackText('lucky')).toBe('L');
    expect(resolveAvatarFallbackText('')).toBe('');
  });
});
