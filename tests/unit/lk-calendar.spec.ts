import { describe, expect, it } from 'vitest';
import {
  addCalendarDays,
  addCalendarMonths,
  clampCalendarWeekStart,
  createCalendarDay,
  createCalendarDays,
  createCalendarMarkerMap,
  formatCalendarDate,
  getCalendarMonthStart,
  getCalendarViewDateValue,
  hasCalendarBlockedDateBetween,
  isCalendarBlockedDate,
  normalizeCalendarValue,
  parseCalendarDate,
  resolveCalendarDateClass,
  resolveCalendarDayClass,
  resolveCalendarGridClass,
  resolveCalendarGridStyle,
  resolveCalendarMarkerType,
  resolveCalendarRootClass,
  resolveCalendarSelectedSummary,
  resolveCalendarWeekdays,
  resolveCalendarInitialDate,
  resolveNextCalendarValue,
  shouldShowCalendarMarkers,
} from '../../src/uni_modules/lucky-ui/components/lk-calendar/calendar.utils';
import { CalendarMode, CalendarViewMode, type CalendarDay } from '../../src/uni_modules/lucky-ui/components/lk-calendar/calendar.props';

function makeDay(overrides: Partial<CalendarDay> = {}): CalendarDay {
  return {
    date: '2026-05-15',
    day: 15,
    month: 5,
    year: 2026,
    weekday: 5,
    isToday: false,
    isCurrentMonth: true,
    isSelected: false,
    isRangeStart: false,
    isRangeEnd: false,
    isRangeRowStart: false,
    isRangeRowEnd: false,
    isInRange: false,
    isDisabled: false,
    markers: [],
    ...overrides,
  };
}

describe('lk-calendar date and selection rules', () => {
  it('formats, parses and moves calendar dates', () => {
    expect(formatCalendarDate(new Date(2026, 4, 5))).toBe('2026-05-05');
    expect(parseCalendarDate('2026-05')?.getDate()).toBe(1);
    expect(parseCalendarDate('2026-02-31')).toBeNull();
    expect(formatCalendarDate(addCalendarDays(new Date(2026, 4, 15), 2))).toBe('2026-05-17');
    expect(formatCalendarDate(addCalendarMonths(new Date(2026, 4, 15), 1))).toBe('2026-06-01');
    expect(formatCalendarDate(getCalendarMonthStart(new Date(2026, 4, 15)))).toBe('2026-05-01');
  });

  it('normalizes values, week starts and initial date', () => {
    expect(clampCalendarWeekStart(-2)).toBe(0);
    expect(clampCalendarWeekStart(9)).toBe(6);
    expect(normalizeCalendarValue(['2026-05-15', '', '2026-05-10']))
      .toEqual(['2026-05-10', '2026-05-15']);
    expect(resolveCalendarInitialDate({
      viewDate: '2026-05',
      modelValue: '',
      now: new Date(2026, 0, 1),
    }).getMonth()).toBe(4);
    expect(resolveCalendarInitialDate({
      viewDate: '',
      modelValue: '2026-06-08',
      now: new Date(2026, 0, 1),
    }).getMonth()).toBe(5);
  });

  it('builds marker maps and weekday headers', () => {
    const markerMap = createCalendarMarkerMap([
      { date: '2026-05-15', label: 'A' },
      { date: 'bad-date', label: 'B' },
    ]);

    expect(markerMap.get('2026-05-15')).toEqual([{ type: 'dot', date: '2026-05-15', label: 'A' }]);
    expect(resolveCalendarWeekdays({
      weekdayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      firstDayOfWeek: 1,
    })).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    expect(getCalendarViewDateValue(new Date(2026, 4, 15))).toBe('2026-05');
  });

  it('summarizes selected values by mode', () => {
    expect(resolveCalendarSelectedSummary({
      values: [],
      mode: CalendarMode.Single,
      selectDateText: 'Select date',
      selectEndDateText: 'Select end',
      rangeSeparator: 'to',
      multipleSelectedText: '3 selected',
    })).toBe('Select date');
    expect(resolveCalendarSelectedSummary({
      values: ['2026-05-10'],
      mode: CalendarMode.Range,
      selectDateText: 'Select date',
      selectEndDateText: 'Select end',
      rangeSeparator: 'to',
      multipleSelectedText: '3 selected',
    })).toBe('Select end');
    expect(resolveCalendarSelectedSummary({
      values: ['2026-05-10', '2026-05-15'],
      mode: CalendarMode.Range,
      selectDateText: 'Select date',
      selectEndDateText: 'Select end',
      rangeSeparator: 'to',
      multipleSelectedText: '3 selected',
    })).toBe('2026-05-10 to 2026-05-15');
  });

  it('detects blocked dates and blocked dates between ranges', () => {
    expect(isCalendarBlockedDate({
      date: '2026-05-09',
      minDate: '2026-05-10',
      maxDate: '2026-05-20',
      disabledDates: [],
    })).toBe(true);
    expect(hasCalendarBlockedDateBetween({
      start: '2026-05-10',
      end: '2026-05-13',
      minDate: '',
      maxDate: '',
      disabledDates: ['2026-05-12'],
    })).toBe(true);
  });

  it('creates calendar days and month grids', () => {
    const markerMap = createCalendarMarkerMap([{ date: '2026-05-15', label: 'Today' }]);
    const day = createCalendarDay({
      date: new Date(2026, 4, 15),
      cursor: new Date(2026, 4, 1),
      today: '2026-05-15',
      values: ['2026-05-10', '2026-05-20'],
      mode: CalendarMode.Range,
      viewMode: CalendarViewMode.Month,
      firstDayOfWeek: 1,
      disabled: false,
      minDate: '',
      maxDate: '',
      disabledDates: [],
      showAdjacentDays: true,
      markerMap,
    });

    expect(day).toMatchObject({
      date: '2026-05-15',
      isToday: true,
      isCurrentMonth: true,
      isInRange: true,
      markers: [{ type: 'dot', date: '2026-05-15', label: 'Today' }],
    });
    expect(createCalendarDays({
      viewMode: CalendarViewMode.Month,
      cursor: new Date(2026, 4, 1),
      firstDayOfWeek: 1,
      createDay: date => makeDay({ date: formatCalendarDate(date) }),
    })).toHaveLength(42);
    expect(createCalendarDays({
      viewMode: CalendarViewMode.Week,
      cursor: new Date(2026, 4, 15),
      firstDayOfWeek: 1,
      createDay: date => makeDay({ date: formatCalendarDate(date) }),
    }).map(item => item.date)).toEqual([
      '2026-05-11',
      '2026-05-12',
      '2026-05-13',
      '2026-05-14',
      '2026-05-15',
      '2026-05-16',
      '2026-05-17',
    ]);
  });

  it('resolves next selected value by mode', () => {
    const day = makeDay({ date: '2026-05-15' });
    expect(resolveNextCalendarValue({
      day,
      mode: CalendarMode.Single,
      selectedValues: [],
      minDate: '',
      maxDate: '',
      disabledDates: [],
    })).toBe('2026-05-15');
    expect(resolveNextCalendarValue({
      day,
      mode: CalendarMode.Multiple,
      selectedValues: ['2026-05-10'],
      minDate: '',
      maxDate: '',
      disabledDates: [],
    })).toEqual(['2026-05-10', '2026-05-15']);
    expect(resolveNextCalendarValue({
      day,
      mode: CalendarMode.Range,
      selectedValues: ['2026-05-10'],
      minDate: '',
      maxDate: '',
      disabledDates: [],
    })).toEqual(['2026-05-10', '2026-05-15']);
    expect(resolveNextCalendarValue({
      day,
      mode: CalendarMode.Range,
      selectedValues: ['2026-05-10'],
      minDate: '',
      maxDate: '',
      disabledDates: ['2026-05-12'],
    })).toEqual(['2026-05-15']);
  });

  it('builds classes and marker metadata', () => {
    const selectedDay = makeDay({
      isToday: true,
      isSelected: true,
      isDisabled: false,
      markers: [{ date: '2026-05-15', type: 'badge', label: 'Today' }],
    });

    expect(resolveCalendarRootClass({
      size: 'lg',
      mode: 'range',
      viewMode: 'week',
      disabled: true,
      readonly: false,
      customClass: 'custom',
    })[0]).toBe('lk-calendar');
    expect(resolveCalendarGridStyle({ dragOffset: 12, dragging: true, switching: false }))
      .toEqual({ transform: 'translate3d(12px, 0, 0)', transition: 'none' });
    expect(resolveCalendarGridClass({
      dragging: true,
      switching: true,
      switchDirection: 'next',
    })[1]).toMatchObject({ 'is-switching-next': true });
    expect(resolveCalendarDayClass({
      day: selectedDay,
      showAdjacentDays: true,
      viewMode: CalendarViewMode.Week,
    })[1]).toMatchObject({ 'is-today': true, 'is-selected': true });
    expect(resolveCalendarDateClass({
      day: selectedDay,
      viewMode: CalendarViewMode.Week,
    })[1]).toMatchObject({ 'is-today': true, 'is-selected': true });
    expect(shouldShowCalendarMarkers({ day: selectedDay, showAdjacentDays: true })).toBe(true);
    expect(resolveCalendarMarkerType({
      day: selectedDay,
      marker: { date: '2026-05-15', type: 'badge', label: 'Today' },
      todayText: 'Today',
    })).toBe('dot');
  });
});
