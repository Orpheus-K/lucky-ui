import { describe, expect, it } from 'vitest';
import {
  formatSpaceGap,
  resolveSpaceAlign,
  resolveSpaceClass,
  resolveSpaceGaps,
  resolveSpaceStyle,
} from '../../src/uni_modules/lucky-ui/components/lk-space/space.utils';

describe('lk-space layout rules', () => {
  it('formats numeric, preset and css gap values', () => {
    expect(formatSpaceGap(12)).toBe('12rpx');
    expect(formatSpaceGap('16')).toBe('16rpx');
    expect(formatSpaceGap('sm')).toBe('8rpx');
    expect(formatSpaceGap('md')).toBe('16rpx');
    expect(formatSpaceGap('lg')).toBe('24rpx');
    expect(formatSpaceGap('2rem')).toBe('2rem');
  });

  it('resolves single and tuple gaps into row and column gaps', () => {
    expect(resolveSpaceGaps('md')).toEqual({ rowGap: '16rpx', colGap: '16rpx' });
    expect(resolveSpaceGaps([8, 20])).toEqual({ rowGap: '20rpx', colGap: '8rpx' });
    expect(resolveSpaceGaps(['10px'])).toEqual({ rowGap: '10px', colGap: '10px' });
  });

  it('builds negative margin style and css variables', () => {
    expect(resolveSpaceStyle([8, 20])).toEqual({
      margin: 'calc(20rpx * -0.5) calc(8rpx * -0.5)',
      '--lk-space-row-gap': '20rpx',
      '--lk-space-col-gap': '8rpx',
    });
  });

  it('uses default alignment by direction unless align is provided', () => {
    expect(resolveSpaceAlign({ direction: 'horizontal' })).toBe('center');
    expect(resolveSpaceAlign({ direction: 'vertical' })).toBe('stretch');
    expect(resolveSpaceAlign({ direction: 'horizontal', align: 'end' })).toBe('end');
  });

  it('builds classes and fills vertical layouts by default', () => {
    const horizontal = resolveSpaceClass({
      direction: 'horizontal',
      align: undefined,
      wrap: true,
      fill: false,
    });
    expect(horizontal).toContain('lk-space');
    expect(horizontal).toContain('lk-space--horizontal');
    expect(horizontal).toContain('lk-space--align-center');
    expect(horizontal[3]).toEqual({
      'lk-space--wrap': true,
      'lk-space--fill': false,
    });

    const vertical = resolveSpaceClass({
      direction: 'vertical',
      align: undefined,
      wrap: false,
      fill: false,
    });
    expect(vertical).toContain('lk-space--align-stretch');
    expect(vertical[3]).toMatchObject({ 'lk-space--fill': true });
  });
});
