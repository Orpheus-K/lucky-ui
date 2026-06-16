import {
  CalendarMode,
  CalendarViewMode,
  type CalendarDay,
  type CalendarMarker,
  type CalendarValue,
} from './calendar.props';

export function padCalendarNumber(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

export function formatCalendarDate(date: Date): string {
  return `${date.getFullYear()}-${padCalendarNumber(date.getMonth() + 1)}-${padCalendarNumber(date.getDate())}`;
}

export function parseCalendarDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value || '');
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3] || 1);
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  return date;
}

export function addCalendarDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function addCalendarMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function getCalendarMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function clampCalendarWeekStart(value: number): number {
  return Math.min(6, Math.max(0, Number.isFinite(value) ? value : 1));
}

export function normalizeCalendarValue(value: CalendarValue): string[] {
  if (Array.isArray(value)) return value.filter(Boolean).sort();
  return value ? [value] : [];
}

export function resolveCalendarInitialDate(options: {
  viewDate: string;
  modelValue: CalendarValue;
  now?: Date;
}): Date {
  const viewDate = parseCalendarDate(options.viewDate);
  if (viewDate) return viewDate;
  const selected = parseCalendarDate(normalizeCalendarValue(options.modelValue)[0] || '');
  return selected || options.now || new Date();
}

export function createCalendarMarkerMap(markers: CalendarMarker[]): Map<string, CalendarMarker[]> {
  const map = new Map<string, CalendarMarker[]>();
  markers.forEach(marker => {
    if (!parseCalendarDate(marker.date)) return;
    const list = map.get(marker.date) || [];
    list.push({ type: 'dot', ...marker });
    map.set(marker.date, list);
  });
  return map;
}

export function resolveCalendarWeekdays(options: {
  weekdayNames: string[];
  firstDayOfWeek: number;
}): string[] {
  const start = clampCalendarWeekStart(options.firstDayOfWeek);
  return Array.from({ length: 7 }, (_, index) => options.weekdayNames[(start + index) % 7]);
}

export function getCalendarViewDateValue(cursor: Date): string {
  return `${cursor.getFullYear()}-${padCalendarNumber(cursor.getMonth() + 1)}`;
}

export function resolveCalendarSelectedSummary(options: {
  values: string[];
  mode: string;
  selectDateText: string;
  selectEndDateText: string;
  rangeSeparator: string;
  multipleSelectedText: string;
}): string {
  if (!options.values.length) return options.selectDateText;
  if (options.mode === CalendarMode.Range) {
    return options.values.length > 1
      ? `${options.values[0]} ${options.rangeSeparator} ${options.values[1]}`
      : options.selectEndDateText;
  }
  if (options.mode === CalendarMode.Multiple) return options.multipleSelectedText;
  return options.values[0];
}

export function resolveCalendarRootClass(options: {
  size: string;
  mode: string;
  viewMode: string;
  disabled: boolean;
  readonly: boolean;
  customClass: unknown;
}) {
  return [
    'lk-calendar',
    `lk-calendar--${options.size}`,
    `lk-calendar--${options.mode}`,
    `lk-calendar--${options.viewMode}`,
    {
      'is-disabled': options.disabled,
      'is-readonly': options.readonly,
    },
    options.customClass,
  ];
}

export function resolveCalendarGridStyle(options: {
  dragOffset: number;
  dragging: boolean;
  switching: boolean;
}) {
  return {
    transform: `translate3d(${options.dragOffset}px, 0, 0)`,
    transition: options.dragging || options.switching ? 'none' : '',
  };
}

export function resolveCalendarGridClass(options: {
  dragging: boolean;
  switching: boolean;
  switchDirection: 'prev' | 'next';
}) {
  return [
    'lk-calendar__grid',
    {
      'is-dragging': options.dragging,
      'is-switching': options.switching,
      'is-switching-prev': options.switching && options.switchDirection === 'prev',
      'is-switching-next': options.switching && options.switchDirection === 'next',
    },
  ];
}

export function isCalendarOutOfBounds(options: {
  date: string;
  minDate: string;
  maxDate: string;
}): boolean {
  return Boolean(
    (options.minDate && options.date < options.minDate) ||
      (options.maxDate && options.date > options.maxDate)
  );
}

export function isCalendarDateInRange(options: {
  date: string;
  values: string[];
  mode: string;
}): boolean {
  if (options.mode !== CalendarMode.Range || options.values.length < 2) return false;
  return options.date > options.values[0] && options.date < options.values[1];
}

export function isCalendarBlockedDate(options: {
  date: string;
  minDate: string;
  maxDate: string;
  disabledDates: string[];
}): boolean {
  return isCalendarOutOfBounds(options) || options.disabledDates.includes(options.date);
}

export function hasCalendarBlockedDateBetween(options: {
  start: string;
  end: string;
  minDate: string;
  maxDate: string;
  disabledDates: string[];
}): boolean {
  const startDate = parseCalendarDate(options.start);
  const endDate = parseCalendarDate(options.end);
  if (!startDate || !endDate) return false;

  const cursorDate = addCalendarDays(startDate < endDate ? startDate : endDate, 1);
  const limit = startDate < endDate ? endDate : startDate;
  while (cursorDate < limit) {
    if (
      isCalendarBlockedDate({
        date: formatCalendarDate(cursorDate),
        minDate: options.minDate,
        maxDate: options.maxDate,
        disabledDates: options.disabledDates,
      })
    )
      return true;
    cursorDate.setDate(cursorDate.getDate() + 1);
  }
  return false;
}

export function getCalendarWeekStart(options: { date: Date; firstDayOfWeek: number }): Date {
  const offset = (options.date.getDay() - clampCalendarWeekStart(options.firstDayOfWeek) + 7) % 7;
  return addCalendarDays(options.date, -offset);
}

export function createCalendarDay(options: {
  date: Date;
  cursor: Date;
  today: string;
  values: string[];
  mode: string;
  viewMode: string;
  firstDayOfWeek: number;
  disabled: boolean;
  minDate: string;
  maxDate: string;
  disabledDates: string[];
  showAdjacentDays: boolean;
  markerMap: Map<string, CalendarMarker[]>;
}): CalendarDay {
  const dateText = formatCalendarDate(options.date);
  const currentMonth = options.cursor.getMonth();
  const currentYear = options.cursor.getFullYear();
  const isRangeStart = options.mode === CalendarMode.Range && options.values[0] === dateText;
  const isRangeEnd = options.mode === CalendarMode.Range && options.values[1] === dateText;
  const inRange = isCalendarDateInRange({
    date: dateText,
    values: options.values,
    mode: options.mode,
  });
  const weekStart = clampCalendarWeekStart(options.firstDayOfWeek);
  const weekEnd = (weekStart + 6) % 7;

  return {
    date: dateText,
    day: options.date.getDate(),
    month: options.date.getMonth() + 1,
    year: options.date.getFullYear(),
    weekday: options.date.getDay(),
    isToday: dateText === options.today,
    isCurrentMonth:
      options.date.getMonth() === currentMonth && options.date.getFullYear() === currentYear,
    isSelected:
      options.mode === CalendarMode.Range
        ? isRangeStart || isRangeEnd
        : options.values.includes(dateText),
    isRangeStart,
    isRangeEnd,
    isRangeRowStart: (isRangeStart || inRange) && options.date.getDay() === weekStart,
    isRangeRowEnd: (isRangeEnd || inRange) && options.date.getDay() === weekEnd,
    isInRange: inRange,
    isDisabled:
      options.disabled ||
      isCalendarBlockedDate({
        date: dateText,
        minDate: options.minDate,
        maxDate: options.maxDate,
        disabledDates: options.disabledDates,
      }) ||
      (options.viewMode === CalendarViewMode.Month &&
        !options.showAdjacentDays &&
        (options.date.getMonth() !== currentMonth || options.date.getFullYear() !== currentYear)),
    markers: options.markerMap.get(dateText) || [],
  };
}

export function createCalendarDays(options: {
  viewMode: string;
  cursor: Date;
  firstDayOfWeek: number;
  createDay: (date: Date) => CalendarDay;
}): CalendarDay[] {
  if (options.viewMode === CalendarViewMode.Week) {
    const weekStart = getCalendarWeekStart({
      date: options.cursor,
      firstDayOfWeek: options.firstDayOfWeek,
    });
    return Array.from({ length: 7 }, (_, index) =>
      options.createDay(addCalendarDays(weekStart, index))
    );
  }

  const first = getCalendarMonthStart(options.cursor);
  const offset = (first.getDay() - clampCalendarWeekStart(options.firstDayOfWeek) + 7) % 7;
  const gridStart = addCalendarDays(first, -offset);

  return Array.from({ length: 42 }, (_, index) =>
    options.createDay(addCalendarDays(gridStart, index))
  );
}

export function resolveNextCalendarValue(options: {
  day: CalendarDay;
  mode: string;
  selectedValues: string[];
  minDate: string;
  maxDate: string;
  disabledDates: string[];
}): CalendarValue {
  if (options.mode === CalendarMode.Multiple) {
    const exists = options.selectedValues.includes(options.day.date);
    return exists
      ? options.selectedValues.filter(item => item !== options.day.date)
      : [...options.selectedValues, options.day.date].sort();
  }

  if (options.mode === CalendarMode.Range) {
    const [start, end] = options.selectedValues;
    if (!start || end) return [options.day.date];
    if (options.day.date < start) {
      if (
        hasCalendarBlockedDateBetween({
          start: options.day.date,
          end: start,
          minDate: options.minDate,
          maxDate: options.maxDate,
          disabledDates: options.disabledDates,
        })
      )
        return [options.day.date];
      return [options.day.date, start];
    }
    if (
      hasCalendarBlockedDateBetween({
        start,
        end: options.day.date,
        minDate: options.minDate,
        maxDate: options.maxDate,
        disabledDates: options.disabledDates,
      })
    )
      return [options.day.date];
    return [start, options.day.date];
  }

  return options.day.date;
}

export function resolveCalendarDayClass(options: {
  day: CalendarDay;
  showAdjacentDays: boolean;
  viewMode: string;
}) {
  const day = options.day;
  return [
    'lk-calendar__day',
    {
      'is-hidden': !options.showAdjacentDays && !day.isCurrentMonth,
      'is-muted': !day.isCurrentMonth,
      'is-week-mode': options.viewMode === CalendarViewMode.Week,
      'is-today': day.isToday,
      'is-selected': day.isSelected,
      'is-in-range': day.isInRange,
      'is-range-start': day.isRangeStart,
      'is-range-end': day.isRangeEnd,
      'is-range-row-start': day.isRangeRowStart,
      'is-range-row-end': day.isRangeRowEnd,
      'is-weekend': day.weekday === 0 || day.weekday === 6,
      'is-disabled': day.isDisabled,
      'has-marker': day.markers.length,
    },
  ];
}

export function resolveCalendarDateClass(options: { day: CalendarDay; viewMode: string }) {
  const day = options.day;
  return [
    'lk-calendar__date',
    {
      'is-muted': !day.isCurrentMonth,
      'is-disabled': day.isDisabled,
      'is-week-mode': options.viewMode === CalendarViewMode.Week,
      'is-weekend': day.weekday === 0 || day.weekday === 6,
      'is-selected': day.isSelected,
      'is-in-range': day.isInRange,
      'is-today': day.isToday,
    },
  ];
}

export function shouldShowCalendarMarkers(options: {
  day: CalendarDay;
  showAdjacentDays: boolean;
}): boolean {
  return Boolean(
    (options.showAdjacentDays || options.day.isCurrentMonth) &&
      options.day.markers.length &&
      !options.day.isDisabled
  );
}

export function resolveCalendarMarkerType(options: {
  day: CalendarDay;
  marker: CalendarMarker;
  todayText: string;
}): 'dot' | 'badge' | 'ring' {
  if (
    options.day.isToday &&
    (options.marker.label === options.todayText || options.marker.label === '今')
  ) {
    return 'dot';
  }
  if (options.day.isSelected && options.marker.type === 'badge') return 'dot';
  return options.marker.type || 'dot';
}
