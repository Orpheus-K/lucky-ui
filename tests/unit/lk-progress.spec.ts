import { describe, expect, it } from 'vitest';
import {
  formatProgressText,
  normalizeProgressPercentage,
  progressStatusColors,
  resolveProgressBarStyle,
  resolveProgressRootClass,
  resolveProgressRootStyle,
  resolveProgressTrackStyle,
  shouldEmitProgressComplete,
} from '../../src/uni_modules/lucky-ui/components/lk-progress/progress.utils';

describe('lk-progress display and completion rules', () => {
  it('clamps percentage into the visible range', () => {
    expect(normalizeProgressPercentage(-20)).toBe(0);
    expect(normalizeProgressPercentage(45)).toBe(45);
    expect(normalizeProgressPercentage(120)).toBe(100);
  });

  it('builds track style from stroke width and track color', () => {
    expect(resolveProgressTrackStyle({
      strokeWidth: 12,
      trackColor: '#eee',
    })).toEqual({
      height: '12rpx',
      backgroundColor: '#eee',
    });

    expect(resolveProgressTrackStyle({
      strokeWidth: 0,
      trackColor: '',
    })).toEqual({});
  });

  it('builds bar style with custom color before status color', () => {
    expect(resolveProgressBarStyle({
      percentage: 120,
      color: '#1677ff',
      status: 'error',
    })).toEqual({
      width: '100%',
      backgroundColor: '#1677ff',
    });

    expect(resolveProgressBarStyle({
      percentage: 40,
      color: '',
      status: 'warning',
    })).toEqual({
      width: '40%',
      backgroundColor: progressStatusColors.warning,
    });
  });

  it('builds root class and style passthrough', () => {
    expect(resolveProgressRootClass({
      striped: true,
      animated: false,
      customClass: 'custom-progress',
    })).toEqual([
      { 'is-striped': true, 'is-animated': false },
      'custom-progress',
    ]);

    const customStyle = { marginTop: '16rpx' };
    expect(resolveProgressRootStyle(customStyle)).toBe(customStyle);
  });

  it('emits complete only on transition into 100', () => {
    expect(shouldEmitProgressComplete(100, 99)).toBe(true);
    expect(shouldEmitProgressComplete(100, 100)).toBe(false);
    expect(shouldEmitProgressComplete(80, 70)).toBe(false);
  });

  it('formats display text from normalized percentage', () => {
    expect(formatProgressText(120)).toBe('100%');
    expect(formatProgressText(32)).toBe('32%');
  });
});
