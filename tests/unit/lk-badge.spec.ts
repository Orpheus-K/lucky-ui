import { describe, expect, it } from 'vitest';
import {
  resolveBadgeClass,
  resolveBadgeClickPayload,
  resolveBadgeDisplayValue,
  resolveBadgeStyle,
  shouldShowBadge,
} from '../../src/uni_modules/lucky-ui/components/lk-badge/badge.utils';

describe('lk-badge display rules', () => {
  it('hides text in dot mode and caps numeric values by max', () => {
    expect(resolveBadgeDisplayValue({ value: 120, max: 99, dot: false })).toBe('99+');
    expect(resolveBadgeDisplayValue({ value: 8, max: 99, dot: false })).toBe(8);
    expect(resolveBadgeDisplayValue({ value: 'new', max: 99, dot: false })).toBe('new');
    expect(resolveBadgeDisplayValue({ value: 120, max: 99, dot: true })).toBe('');
  });

  it('controls visibility from hidden, dot and empty value', () => {
    expect(shouldShowBadge({ hidden: true, dot: true, value: '' })).toBe(false);
    expect(shouldShowBadge({ hidden: false, dot: true, value: '' })).toBe(true);
    expect(shouldShowBadge({ hidden: false, dot: false, value: '' })).toBe(false);
    expect(shouldShowBadge({ hidden: false, dot: false, value: 0 })).toBe(true);
  });

  it('builds inline style from offset and semantic type color', () => {
    expect(resolveBadgeStyle({
      offset: [4, -6],
      color: '',
      bgColor: '',
      type: 'warning',
    })).toEqual({
      right: '4rpx',
      top: '-6rpx',
      color: undefined,
      background: 'var(--lk-color-warning)',
    });
  });

  it('lets explicit color and bgColor override defaults', () => {
    expect(resolveBadgeStyle({
      offset: [0, 0],
      color: '#fff',
      bgColor: '#111',
      type: 'danger',
    })).toMatchObject({
      color: '#fff',
      background: '#111',
    });
  });

  it('builds class entries from type and dot state', () => {
    const classes = resolveBadgeClass({
      type: 'success',
      dot: true,
      customClass: 'custom-badge',
    });

    expect(classes).toContain('lk-badge--success');
    expect(classes).toContain('custom-badge');
    expect(classes[1]).toEqual({ 'is-dot': true });
  });

  it('creates click payload with raw and display values', () => {
    const event = { type: 'tap' };
    expect(resolveBadgeClickPayload({
      value: 120,
      displayValue: '99+',
      event,
    })).toEqual({
      value: 120,
      displayValue: '99+',
      event,
    });
  });
});
