import { describe, expect, it } from 'vitest';
import {
  normalizeMetaRowCustomStyle,
  resolveMetaRowClass,
  resolveMetaRowRootStyle,
  resolveMetaRowSideStyle,
  resolveMetaRowStyleVars,
} from '../../src/uni_modules/lucky-ui/components/lk-meta-row/meta-row.utils';

describe('lk-meta-row layout rules', () => {
  it('builds alignment classes with custom class passthrough', () => {
    expect(resolveMetaRowClass({
      align: 'center',
      customClass: 'profile-row',
    })).toEqual([
      'lk-meta-row',
      'lk-meta-row--center',
      'profile-row',
    ]);
  });

  it('resolves gap variables with unit normalization', () => {
    expect(resolveMetaRowStyleVars({
      gap: 16,
      mainGap: '4px',
    })).toEqual({
      '--lk-meta-row-gap': '16rpx',
      '--lk-meta-row-main-gap': '4px',
    });
  });

  it('resolves fixed side widths', () => {
    expect(resolveMetaRowSideStyle(88)).toEqual({
      width: '88rpx',
      minWidth: '88rpx',
    });
    expect(resolveMetaRowSideStyle('6em')).toEqual({
      width: '6em',
      minWidth: '6em',
    });
    expect(resolveMetaRowSideStyle('')).toEqual({
      width: undefined,
      minWidth: undefined,
    });
  });

  it('normalizes custom style for root style composition', () => {
    const objectStyle = { marginTop: '8rpx' };
    expect(normalizeMetaRowCustomStyle('padding: 8rpx')).toBe('padding: 8rpx');
    expect(normalizeMetaRowCustomStyle(objectStyle)).toBe(objectStyle);
    expect(normalizeMetaRowCustomStyle(false)).toBeUndefined();

    const styleVars = { '--lk-meta-row-gap': '16rpx' };
    expect(resolveMetaRowRootStyle({
      styleVars,
      customStyle: objectStyle,
    })).toEqual([styleVars, objectStyle]);
  });
});
