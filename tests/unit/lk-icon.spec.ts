import { describe, expect, it } from 'vitest';
import { iconCharOf } from '../../src/uni_modules/lucky-ui/components/lk-icon/codepoints';
import {
  resolveIconBoxColor,
  resolveIconBoxRadius,
  resolveIconBoxSize,
  resolveIconBoxStyle,
  resolveIconColor,
  resolveIconSize,
  resolveIconStyle,
  shouldWarnMissingIcon,
} from '../../src/uni_modules/lucky-ui/components/lk-icon/icon.utils';

describe('lk-icon style rules', () => {
  it('maps semantic colors to theme variables and preserves custom colors', () => {
    expect(resolveIconColor('primary')).toBe('var(--lk-color-primary)');
    expect(resolveIconColor('textSecondary')).toBe('var(--lk-text-secondary)');
    expect(resolveIconColor('#ff0000')).toBe('#ff0000');
    expect(resolveIconColor('rgb(1, 2, 3)')).toBe('rgb(1, 2, 3)');
    expect(resolveIconColor('')).toBe('');
  });

  it('normalizes numeric sizes to rpx and preserves css sizes', () => {
    expect(resolveIconSize(44)).toBe('44rpx');
    expect(resolveIconSize('32')).toBe('32rpx');
    expect(resolveIconSize('12.5')).toBe('12.5rpx');
    expect(resolveIconSize('1.5rem')).toBe('1.5rem');
    expect(resolveIconSize('var(--lk-rpx-44)')).toBe('var(--lk-rpx-44)');
    expect(resolveIconSize('')).toBe('');
  });

  it('builds inline style only for provided color and size', () => {
    expect(resolveIconStyle({ color: 'success', size: 36 })).toEqual({
      color: 'var(--lk-color-success)',
      fontSize: '36rpx',
    });
    expect(resolveIconStyle({ color: '', size: '' })).toEqual({});
  });

  it('builds boxed icon colors from semantic and custom icon colors', () => {
    expect(resolveIconBoxColor('primary', '')).toBe('var(--lk-color-primary-soft)');
    expect(resolveIconBoxColor('', 'success')).toBe('var(--lk-color-success-soft)');
    expect(resolveIconBoxColor('', '#336699')).toBe('rgba(51, 102, 153, 0.12)');
    expect(resolveIconBoxColor('', 'rgb(10, 20, 30)')).toBe('rgba(10, 20, 30, 0.12)');
    expect(resolveIconBoxColor('', 'var(--lk-color-primary)')).toBe('var(--lk-fill-1)');
    expect(resolveIconBoxColor('#f8fafc', 'primary')).toBe('#f8fafc');
  });

  it('normalizes boxed icon geometry', () => {
    expect(resolveIconBoxSize('', 32)).toBe('64rpx');
    expect(resolveIconBoxSize('', '40rpx')).toBe('72rpx');
    expect(resolveIconBoxSize(88, 32)).toBe('88rpx');
    expect(resolveIconBoxSize('4rem', 32)).toBe('4rem');
    expect(resolveIconBoxRadius({ boxShape: 'circle', boxRadius: '' })).toBe('50%');
    expect(resolveIconBoxRadius({ boxShape: 'square', boxRadius: '' })).toBe('var(--lk-radius-xs)');
    expect(resolveIconBoxRadius({ boxShape: 'rounded', boxRadius: 20 })).toBe('20rpx');
  });

  it('builds boxed icon container style', () => {
    expect(resolveIconBoxStyle({
      color: 'warning',
      size: 36,
      boxSize: '',
      boxColor: '',
      boxRadius: '',
      boxShape: 'rounded',
    })).toEqual({
      width: '68rpx',
      height: '68rpx',
      background: 'var(--lk-color-warning-soft)',
      borderRadius: 'var(--lk-radius-md)',
    });
  });

  it('resolves built-in icon codepoints and reports missing names', () => {
    expect(iconCharOf('x')).not.toBe('');
    expect(iconCharOf('not-a-real-icon')).toBe('');
    expect(shouldWarnMissingIcon(iconCharOf('x'))).toBe(false);
    expect(shouldWarnMissingIcon(iconCharOf('not-a-real-icon'))).toBe(true);
  });
});
