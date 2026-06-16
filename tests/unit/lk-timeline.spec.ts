import { describe, expect, it } from 'vitest';
import {
  defaultTimelineContext,
  hasTimelineLeftContent,
  isTimelineItemActive,
  resolveTimelineAccentColor,
  resolveTimelineContext,
  resolveTimelineDisplayNumber,
  resolveTimelineInheritedValue,
  resolveTimelineItemClass,
  resolveTimelineItemState,
  resolveTimelineItemStyle,
  resolveTimelineLineAnimated,
  resolveTimelineLineClass,
  resolveTimelineRootClass,
  resolveTimelineTrackClass,
} from '../../src/uni_modules/lucky-ui/components/lk-timeline/timeline.utils';

describe('lk-timeline context and item rules', () => {
  it('builds timeline context and root classes', () => {
    expect(resolveTimelineContext({
      direction: 'horizontal',
      activeIndex: 2,
      lineAnimated: true,
    })).toEqual({
      ...defaultTimelineContext,
      direction: 'horizontal',
      activeIndex: 2,
      lineAnimated: true,
    });

    expect(resolveTimelineRootClass('horizontal', 'custom-timeline')).toEqual([
      'lk-timeline',
      'lk-timeline--horizontal',
      'custom-timeline',
    ]);
  });

  it('resolves active and status flags', () => {
    expect(isTimelineItemActive({ status: 'active', index: 0, activeIndex: -1 })).toBe(true);
    expect(isTimelineItemActive({ status: 'default', index: 2, activeIndex: 2 })).toBe(true);
    expect(isTimelineItemActive({ status: 'default', index: -1, activeIndex: 0 })).toBe(false);

    expect(resolveTimelineItemState('completed')).toEqual({
      completed: true,
      pending: false,
      error: false,
    });
    expect(resolveTimelineItemState('error')).toMatchObject({ error: true });
  });

  it('inherits dot and line options from context with item override priority', () => {
    expect(resolveTimelineInheritedValue('', 'outlined', 'filled')).toBe('outlined');
    expect(resolveTimelineInheritedValue('numbered', 'outlined', 'filled')).toBe('numbered');
    expect(resolveTimelineLineAnimated(undefined, true)).toBe(true);
    expect(resolveTimelineLineAnimated(false, true)).toBe(false);
  });

  it('builds item, track and line classes', () => {
    expect(resolveTimelineItemClass({
      horizontal: false,
      hasLeft: true,
      active: true,
      completed: false,
      pending: false,
      error: false,
      customClass: 'custom-item',
    })).toEqual([
      'lk-timeline-item',
      'lk-timeline-item--vertical',
      'has-left',
      'is-active',
      false,
      false,
      false,
      'custom-item',
    ]);

    expect(resolveTimelineTrackClass({ last: false, showLine: false })).toEqual({
      'is-last': true,
    });
    expect(resolveTimelineLineClass({
      lineVariant: 'dashed',
      lineMode: 'streaming',
      lineAnimated: true,
    })).toEqual([
      'lk-timeline-item__line',
      'is-dashed',
      'is-streaming',
      'is-animated',
    ]);
  });

  it('builds display number, accent and style variables', () => {
    expect(resolveTimelineDisplayNumber(2)).toBe(3);
    expect(resolveTimelineDisplayNumber(-1)).toBe('');
    expect(resolveTimelineAccentColor('')).toBe('var(--lk-color-primary)');
    expect(resolveTimelineAccentColor('#f00')).toBe('#f00');

    expect(resolveTimelineItemStyle({
      accentColor: '#f00',
      index: -1,
      total: 6,
      customStyle: { marginTop: '8rpx' },
    })).toEqual([{
      '--lk-ti-accent': '#f00',
      '--lk-ti-index': 0,
      '--lk-ti-total': 6,
    }, { marginTop: '8rpx' }]);
  });

  it('detects left column content', () => {
    expect(hasTimelineLeftContent({ hasLeftSlot: false, time: '', date: '' })).toBe(false);
    expect(hasTimelineLeftContent({ hasLeftSlot: true, time: '', date: '' })).toBe(true);
    expect(hasTimelineLeftContent({ hasLeftSlot: false, time: '09:00', date: '' })).toBe(true);
  });
});
