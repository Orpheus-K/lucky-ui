import { describe, expect, it } from 'vitest';
import {
  hasDividerText,
  isStandardDividerPosition,
  resolveDividerClass,
  resolveDividerLineStyle,
} from '../../src/uni_modules/lucky-ui/components/lk-divider/divider.utils';

describe('lk-divider layout rules', () => {
  it('detects text from prop or default slot', () => {
    expect(hasDividerText({ text: 'Title', hasDefaultSlot: false })).toBe(true);
    expect(hasDividerText({ text: '', hasDefaultSlot: true })).toBe(true);
    expect(hasDividerText({ text: '', hasDefaultSlot: false })).toBe(false);
  });

  it('recognizes only built-in text positions as standard', () => {
    expect(isStandardDividerPosition('left')).toBe(true);
    expect(isStandardDividerPosition('center')).toBe(true);
    expect(isStandardDividerPosition('right')).toBe(true);
    expect(isStandardDividerPosition('20%')).toBe(false);
  });

  it('does not customize line style for standard positions, no text or vertical mode', () => {
    expect(resolveDividerLineStyle({ textPosition: 'left', hasText: true, vertical: false }))
      .toEqual({ left: {}, right: {} });
    expect(resolveDividerLineStyle({ textPosition: '20%', hasText: false, vertical: false }))
      .toEqual({ left: {}, right: {} });
    expect(resolveDividerLineStyle({ textPosition: '20%', hasText: true, vertical: true }))
      .toEqual({ left: {}, right: {} });
  });

  it('splits remaining line space by clamped percentage positions', () => {
    expect(resolveDividerLineStyle({ textPosition: '30%', hasText: true, vertical: false }))
      .toEqual({ left: { flex: '30' }, right: { flex: '70' } });
    expect(resolveDividerLineStyle({ textPosition: 120, hasText: true, vertical: false }))
      .toEqual({ left: { flex: '100' }, right: { flex: '0' } });
    expect(resolveDividerLineStyle({ textPosition: -10, hasText: true, vertical: false }))
      .toEqual({ left: { flex: '0' }, right: { flex: '100' } });
  });

  it('uses fixed left width for non-percent custom positions', () => {
    expect(resolveDividerLineStyle({ textPosition: 'var(--lk-rpx-100)', hasText: true, vertical: false }))
      .toEqual({ left: { flex: '0 0 var(--lk-rpx-100)' }, right: { flex: '1' } });
  });

  it('builds divider classes from layout state', () => {
    const classes = resolveDividerClass({
      textPosition: '24%',
      vertical: true,
      dashed: true,
      hairline: false,
      hasText: true,
      customClass: 'custom-divider',
    });

    expect(classes).toContain('lk-divider');
    expect(classes).toContain('lk-divider--custom-pos');
    expect(classes).toContain('custom-divider');
    expect(classes[2]).toMatchObject({
      'is-vertical': true,
      'is-dashed': true,
      'is-hairline': false,
      'has-text': true,
    });
  });
});
