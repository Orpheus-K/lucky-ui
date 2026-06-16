import { CalendarMode, type CalendarValue } from '../lk-calendar/calendar.props';
import { CalendarPickerTimePrecision, type CalendarPickerValue } from './calendar-picker.props';

const DATE_TIME_RE = /^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}(?::\d{2})?))?$/;

export function normalizeCalendarPickerValue(value: CalendarPickerValue): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

export function getCalendarPickerDatePart(value: string): string {
  return DATE_TIME_RE.exec(value)?.[1] || value;
}

export function getCalendarPickerTimePart(value: string): string {
  return DATE_TIME_RE.exec(value)?.[2] || '';
}

export function parseCalendarPickerTime(value: string, fallback: number): number {
  const parts = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value || '');
  if (!parts) return fallback;
  const hour = Math.min(23, Math.max(0, Number(parts[1])));
  const minute = Math.min(59, Math.max(0, Number(parts[2])));
  const second = Math.min(59, Math.max(0, Number(parts[3] || 0)));
  return hour * 3600 + minute * 60 + second;
}

export function formatCalendarPickerTime(options: { value: number; precision: string }): string {
  const total = Math.min(86399, Math.max(0, Math.round(options.value)));
  const hour = Math.floor(total / 3600);
  const minute = Math.floor((total % 3600) / 60);
  const second = total % 60;
  const hh = hour < 10 ? `0${hour}` : `${hour}`;
  const mm = minute < 10 ? `0${minute}` : `${minute}`;
  const ss = second < 10 ? `0${second}` : `${second}`;
  if (options.precision === CalendarPickerTimePrecision.Hour) return `${hh}:00`;
  if (options.precision === CalendarPickerTimePrecision.Second) return `${hh}:${mm}:${ss}`;
  return `${hh}:${mm}`;
}

export function getCalendarPickerTimeUnit(precision: string): number {
  if (precision === CalendarPickerTimePrecision.Hour) return 3600;
  if (precision === CalendarPickerTimePrecision.Second) return 1;
  return 60;
}

export function getCalendarPickerTimeMax(timeUnit: number): number {
  return 86400 - timeUnit;
}

export function getCalendarPickerTimeStep(options: { timeStep: number; timeUnit: number }): number {
  return Math.max(1, options.timeStep) * options.timeUnit;
}

export function mergeCalendarPickerTime(options: {
  value: CalendarValue;
  showTime: boolean;
  mode: string;
  startTime: number;
  endTime: number;
  precision: string;
}): CalendarPickerValue {
  const values = normalizeCalendarPickerValue(options.value);
  if (!options.showTime) return Array.isArray(options.value) ? values : values[0] || '';

  const withTime = values.map((item, index) => {
    const seconds =
      index === 1 && options.mode === CalendarMode.Range ? options.endTime : options.startTime;
    return `${getCalendarPickerDatePart(item)} ${formatCalendarPickerTime({
      value: seconds,
      precision: options.precision,
    })}`;
  });

  return Array.isArray(options.value) ? withTime : withTime[0] || '';
}

export function syncCalendarPickerDraft(options: {
  value: CalendarPickerValue;
  viewDate: string;
  defaultStartTime: string;
  defaultEndTime: string;
  currentStartTime: number;
  currentEndTime: number;
}): {
  tempValue: CalendarValue;
  startTime: number;
  endTime: number;
  panelDate: string;
} {
  const values = normalizeCalendarPickerValue(options.value);
  const firstTime = getCalendarPickerTimePart(values[0] || '');
  const secondTime = getCalendarPickerTimePart(values[1] || '');
  return {
    tempValue: Array.isArray(options.value)
      ? values.map(item => getCalendarPickerDatePart(item))
      : getCalendarPickerDatePart(values[0] || ''),
    startTime: firstTime
      ? parseCalendarPickerTime(firstTime, options.currentStartTime)
      : parseCalendarPickerTime(options.defaultStartTime, 0),
    endTime: secondTime
      ? parseCalendarPickerTime(secondTime, options.currentEndTime)
      : parseCalendarPickerTime(options.defaultEndTime, 86399),
    panelDate: options.viewDate || getCalendarPickerDatePart(values[0] || '') || '',
  };
}

export function resolveCalendarPickerDisplayValue(options: {
  modelValue: CalendarPickerValue;
  mode: string;
  placeholder: string;
  rangeSeparator: string;
  multipleSelectedText: string;
}): string {
  const values = normalizeCalendarPickerValue(options.modelValue);
  if (!values.length) return options.placeholder;
  if (options.mode === CalendarMode.Range && values.length > 1) {
    return `${values[0]} ${options.rangeSeparator} ${values[1]}`;
  }
  if (options.mode === CalendarMode.Multiple) return options.multipleSelectedText;
  return values[0] || options.placeholder;
}

export function resolveCalendarPickerResetValue(mode: string): CalendarPickerValue {
  return mode === CalendarMode.Single ? '' : [];
}

export function resolveCalendarPickerClass(options: {
  disabled: boolean;
  readonly: boolean;
  customClass: unknown;
}) {
  return [
    'lk-calendar-picker',
    {
      'is-disabled': options.disabled,
      'is-readonly': options.readonly,
    },
    options.customClass,
  ];
}

export function canOpenCalendarPicker(options: { disabled: boolean; readonly: boolean }): boolean {
  return !options.disabled && !options.readonly;
}
