import type { StyleValue } from 'vue';
import type {
  TimelineDirection,
  TimelineDotVariant,
  TimelineLineMode,
  TimelineLineVariant,
} from './timeline.props';
import type { TimelineItemStatus } from './timeline-item.props';

export interface TimelineContextValue {
  direction: TimelineDirection;
  total: number;
  showLine: boolean;
  activeIndex: number;
  dotVariant: TimelineDotVariant;
  lineVariant: TimelineLineVariant;
  lineMode: TimelineLineMode;
  lineAnimated: boolean;
}

export const defaultTimelineContext: TimelineContextValue = {
  direction: 'vertical',
  total: 4,
  showLine: true,
  activeIndex: -1,
  dotVariant: 'filled',
  lineVariant: 'solid',
  lineMode: 'normal',
  lineAnimated: false,
};

export function resolveTimelineContext(
  options: Partial<TimelineContextValue>
): TimelineContextValue {
  return {
    ...defaultTimelineContext,
    ...options,
  };
}

export function resolveTimelineRootClass(direction: TimelineDirection, customClass?: unknown) {
  return ['lk-timeline', `lk-timeline--${direction}`, customClass];
}

export function isTimelineItemActive(options: {
  status: TimelineItemStatus;
  index: number;
  activeIndex: number;
}): boolean {
  return (
    options.status === 'active' || (options.index >= 0 && options.index === options.activeIndex)
  );
}

export function resolveTimelineItemState(status: TimelineItemStatus) {
  return {
    completed: status === 'completed',
    pending: status === 'pending',
    error: status === 'error',
  };
}

export function resolveTimelineItemClass(options: {
  horizontal: boolean;
  hasLeft: boolean;
  active: boolean;
  completed: boolean;
  pending: boolean;
  error: boolean;
  customClass?: unknown;
}) {
  return [
    'lk-timeline-item',
    options.horizontal ? 'lk-timeline-item--horizontal' : 'lk-timeline-item--vertical',
    options.hasLeft && 'has-left',
    options.active && 'is-active',
    options.completed && 'is-completed',
    options.pending && 'is-pending',
    options.error && 'is-error',
    options.customClass,
  ];
}

export function resolveTimelineTrackClass(options: { last: boolean; showLine: boolean }) {
  return {
    'is-last': options.last || !options.showLine,
  };
}

export function resolveTimelineLineClass(options: {
  lineVariant: string;
  lineMode: string;
  lineAnimated: boolean;
}) {
  return [
    'lk-timeline-item__line',
    `is-${options.lineVariant}`,
    `is-${options.lineMode}`,
    options.lineAnimated && 'is-animated',
  ];
}

export function resolveTimelineItemStyle(options: {
  accentColor: string;
  index: number;
  total: number;
  customStyle?: StyleValue;
}): StyleValue {
  return [
    {
      '--lk-ti-accent': options.accentColor,
      '--lk-ti-index': options.index >= 0 ? options.index : 0,
      '--lk-ti-total': options.total,
    },
    options.customStyle || '',
  ] as StyleValue;
}

export function resolveTimelineInheritedValue<T>(
  itemValue: T | '' | undefined,
  contextValue: T,
  fallback: T
): T {
  return itemValue || contextValue || fallback;
}

export function resolveTimelineLineAnimated(
  itemValue: boolean | undefined,
  contextValue: boolean
): boolean {
  return itemValue !== undefined ? itemValue : contextValue;
}

export function resolveTimelineDisplayNumber(index: number): number | '' {
  return index >= 0 ? index + 1 : '';
}

export function resolveTimelineAccentColor(color: string): string {
  return color || 'var(--lk-color-primary)';
}

export function hasTimelineLeftContent(options: {
  hasLeftSlot: boolean;
  time: string;
  date: string;
}): boolean {
  return !!(options.hasLeftSlot || options.time || options.date);
}
