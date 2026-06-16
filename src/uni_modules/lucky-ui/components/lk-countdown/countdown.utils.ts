import type { StyleValue } from 'vue';
import type { CountdownTimeData } from './countdown.props';

export type CountdownSegmentKind = 'value' | 'separator' | 'unit';

export interface CountdownSegment {
  key: string;
  kind: CountdownSegmentKind;
  value: string;
}

export interface CountdownUnitMap {
  day: string;
  hour: string;
  minute: string;
  second: string;
  millisecond: string;
}

export const COUNTDOWN_SECOND = 1000;
export const COUNTDOWN_MINUTE = 60 * COUNTDOWN_SECOND;
export const COUNTDOWN_HOUR = 60 * COUNTDOWN_MINUTE;
export const COUNTDOWN_DAY = 24 * COUNTDOWN_HOUR;

export function normalizeCountdownTargetTime(value: string | number): number {
  if (typeof value === 'number') {
    return value < 1e12 ? value * 1000 : value;
  }

  const trimmed = value.trim();
  if (!trimmed) return 0;

  const numeric = Number(trimmed);
  if (Number.isFinite(numeric)) {
    return numeric < 1e12 ? numeric * 1000 : numeric;
  }

  const parsed = new Date(trimmed.replace(/-/g, '/')).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeCountdownDuration(options: {
  time: number;
  targetTime: string | number;
  now: number;
}): number {
  if (options.targetTime !== '') {
    const timestamp = normalizeCountdownTargetTime(options.targetTime);
    return Math.max(0, timestamp ? timestamp - options.now : 0);
  }

  return Math.max(0, options.time);
}

export function getCountdownTimeData(total: number, format: string): CountdownTimeData {
  const safeTotal = Math.max(0, total);
  const hasDayToken = /D{1,2}/.test(format);
  const days = Math.floor(safeTotal / COUNTDOWN_DAY);
  const hours = hasDayToken
    ? Math.floor((safeTotal % COUNTDOWN_DAY) / COUNTDOWN_HOUR)
    : Math.floor(safeTotal / COUNTDOWN_HOUR);
  const minutes = Math.floor((safeTotal % COUNTDOWN_HOUR) / COUNTDOWN_MINUTE);
  const seconds = Math.floor((safeTotal % COUNTDOWN_MINUTE) / COUNTDOWN_SECOND);
  const milliseconds = Math.floor(safeTotal % COUNTDOWN_SECOND);

  return {
    total: safeTotal,
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
  };
}

export function normalizeCountdownDisplayRemaining(options: {
  total: number;
  millisecond: boolean;
}): number {
  if (options.millisecond || options.total <= 0) return Math.max(0, options.total);
  return Math.ceil(options.total / COUNTDOWN_SECOND) * COUNTDOWN_SECOND;
}

export function getCountdownVisibleRemaining(options: {
  remaining: number;
  finished: boolean;
  showZero: boolean;
}): number {
  if (options.showZero) return options.remaining;
  return options.finished ? 0 : options.remaining;
}

export function padCountdownValue(value: number, length: number, padZero: boolean): string {
  if (!padZero) return String(value);
  return String(value).padStart(length, '0');
}

export function formatCountdownTime(options: {
  format: string;
  data: CountdownTimeData;
  padZero: boolean;
  trimZeroDay: boolean;
}) {
  let output = options.format || 'HH:mm:ss';

  if (options.trimZeroDay && options.data.days <= 0) {
    output = output
      .replace(/D{1,2}\s*天\s*/, '')
      .replace(/D{1,2}\s*d\s*/i, '')
      .replace(/D{1,2}\s*[:：-]\s*/, '');
  }

  const values: Record<string, string> = {
    DD: padCountdownValue(options.data.days, 2, options.padZero),
    D: String(options.data.days),
    HH: padCountdownValue(options.data.hours, 2, options.padZero),
    H: String(options.data.hours),
    mm: padCountdownValue(options.data.minutes, 2, options.padZero),
    m: String(options.data.minutes),
    ss: padCountdownValue(options.data.seconds, 2, options.padZero),
    s: String(options.data.seconds),
    SSS: padCountdownValue(options.data.milliseconds, 3, options.padZero),
    SS: padCountdownValue(Math.floor(options.data.milliseconds / 10), 2, options.padZero),
    S: String(Math.floor(options.data.milliseconds / 100)),
  };

  return output.replace(/DD|D|HH|H|mm|m|ss|s|SSS|SS|S/g, token => values[token] ?? token);
}

export function resolveCountdownUnitMap(options: {
  unitMap: Partial<CountdownUnitMap>;
  fallback: CountdownUnitMap;
}): CountdownUnitMap {
  return {
    day: options.unitMap.day || options.fallback.day,
    hour: options.unitMap.hour || options.fallback.hour,
    minute: options.unitMap.minute || options.fallback.minute,
    second: options.unitMap.second || options.fallback.second,
    millisecond: options.unitMap.millisecond || options.fallback.millisecond,
  };
}

export function parseCountdownSegments(
  text: string,
  unitMap: CountdownUnitMap
): CountdownSegment[] {
  const unitValues = Object.values(unitMap).filter((item): item is string => !!item);
  const source = text || '0';
  const result: CountdownSegment[] = [];
  let index = 0;

  while (index < source.length) {
    const unit = unitValues.find(item => source.slice(index).startsWith(item));
    if (unit) {
      result.push({ key: `unit-${index}`, kind: 'unit', value: unit });
      index += unit.length;
      continue;
    }

    const char = source[index];
    result.push({
      key: `${/\d/.test(char) ? 'value' : 'separator'}-${index}`,
      kind: /\d/.test(char) ? 'value' : 'separator',
      value: char,
    });
    index += 1;
  }

  return result;
}

export function resolveCountdownClass(options: {
  variant: string;
  size: string;
  type: string;
  running: boolean;
  finished: boolean;
  millisecond: boolean;
  customClass?: unknown;
}) {
  return [
    'lk-countdown',
    `lk-countdown--${options.variant}`,
    `lk-countdown--${options.size}`,
    `lk-countdown--${options.type}`,
    {
      'is-running': options.running,
      'is-finished': options.finished,
      'is-millisecond': options.millisecond,
    },
    options.customClass,
  ];
}

export function resolveCountdownRootStyle(customStyle: StyleValue): StyleValue {
  return customStyle;
}

export function getCountdownInterval(millisecond: boolean): number {
  return millisecond ? 30 : COUNTDOWN_SECOND;
}

export function getCountdownScheduleDelay(options: {
  millisecond: boolean;
  interval: number;
  currentRemaining: number;
}) {
  const delay = options.millisecond
    ? options.interval
    : options.currentRemaining % COUNTDOWN_SECOND || COUNTDOWN_SECOND;
  return Math.max(16, delay);
}
