import { describe, expect, it } from 'vitest';
import {
  resolveCellClass,
  resolveCellGroupClass,
  resolveCellStyle,
  resolveCellTapAction,
  shouldTriggerCellRipple,
} from '../../src/uni_modules/lucky-ui/components/lk-cell/cell.utils';

describe('lk-cell interaction and group rules', () => {
  it('resolves tap action and ripple guard', () => {
    expect(resolveCellTapAction(false)).toBe('click');
    expect(resolveCellTapAction(true)).toBe('click-disabled');

    expect(shouldTriggerCellRipple({
      clickable: true,
      ripple: true,
      disabled: false,
    })).toBe(true);

    expect(shouldTriggerCellRipple({
      clickable: true,
      ripple: true,
      disabled: true,
    })).toBe(false);

    expect(shouldTriggerCellRipple({
      clickable: false,
      ripple: true,
      disabled: false,
    })).toBe(false);
  });

  it('builds cell classes from interaction state', () => {
    expect(resolveCellClass({
      customClass: 'custom-cell',
      clickable: true,
      ripple: true,
      disabled: false,
      center: true,
      rippleActive: true,
    })).toEqual([
      'custom-cell',
      {
        'lk-ripple': true,
        'is-clickable': true,
        'is-disabled': false,
        'is-center': true,
        'lk-ripple--active': true,
      },
    ]);
  });

  it('passes through custom style without unsafe casting at template callsite', () => {
    const customStyle = { padding: '24rpx' };
    expect(resolveCellStyle(customStyle)).toBe(customStyle);
  });

  it('builds cell group classes', () => {
    expect(resolveCellGroupClass({
      inset: true,
      card: true,
      border: false,
      customClass: 'custom-group',
    })).toEqual([
      {
        'is-inset': true,
        'is-card': true,
        'is-border': false,
      },
      'custom-group',
    ]);
  });
});
