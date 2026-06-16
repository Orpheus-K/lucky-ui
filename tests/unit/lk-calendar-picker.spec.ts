import { describe, expect, it } from 'vitest';
import { CalendarMode } from '../../src/uni_modules/lucky-ui/components/lk-calendar/calendar.props';
import { CalendarPickerTimePrecision } from '../../src/uni_modules/lucky-ui/components/lk-calendar-picker/calendar-picker.props';
import {
  canOpenCalendarPicker,
  formatCalendarPickerTime,
  getCalendarPickerDatePart,
  getCalendarPickerTimeMax,
  getCalendarPickerTimePart,
  getCalendarPickerTimeStep,
  getCalendarPickerTimeUnit,
  mergeCalendarPickerTime,
  normalizeCalendarPickerValue,
  parseCalendarPickerTime,
  resolveCalendarPickerClass,
  resolveCalendarPickerDisplayValue,
  resolveCalendarPickerResetValue,
  syncCalendarPickerDraft,
} from '../../src/uni_modules/lucky-ui/components/lk-calendar-picker/calendar-picker.utils';

describe('lk-calendar-picker value and time rules', () => {
  it('normalizes values and splits date/time parts', () => {
    expect(normalizeCalendarPickerValue('2026-05-15')).toEqual(['2026-05-15']);
    expect(normalizeCalendarPickerValue(['2026-05-15', ''])).toEqual(['2026-05-15']);
    expect(getCalendarPickerDatePart('2026-05-15 12:30:45')).toBe('2026-05-15');
    expect(getCalendarPickerTimePart('2026-05-15T12:30')).toBe('12:30');
  });

  it('parses and formats time by precision', () => {
    expect(parseCalendarPickerTime('25:99:99', 0)).toBe(86399);
    expect(parseCalendarPickerTime('', 123)).toBe(123);
    expect(formatCalendarPickerTime({
      value: 3661,
      precision: CalendarPickerTimePrecision.Hour,
    })).toBe('01:00');
    expect(formatCalendarPickerTime({
      value: 3661,
      precision: CalendarPickerTimePrecision.Minute,
    })).toBe('01:01');
    expect(formatCalendarPickerTime({
      value: 3661,
      precision: CalendarPickerTimePrecision.Second,
    })).toBe('01:01:01');
  });

  it('resolves time unit, max and step', () => {
    expect(getCalendarPickerTimeUnit(CalendarPickerTimePrecision.Hour)).toBe(3600);
    expect(getCalendarPickerTimeUnit(CalendarPickerTimePrecision.Minute)).toBe(60);
    expect(getCalendarPickerTimeMax(60)).toBe(86340);
    expect(getCalendarPickerTimeStep({ timeStep: 0, timeUnit: 60 })).toBe(60);
    expect(getCalendarPickerTimeStep({ timeStep: 5, timeUnit: 60 })).toBe(300);
  });

  it('merges time into single and range values', () => {
    expect(mergeCalendarPickerTime({
      value: '2026-05-15',
      showTime: false,
      mode: CalendarMode.Single,
      startTime: 3600,
      endTime: 7200,
      precision: CalendarPickerTimePrecision.Minute,
    })).toBe('2026-05-15');

    expect(mergeCalendarPickerTime({
      value: ['2026-05-15', '2026-05-20'],
      showTime: true,
      mode: CalendarMode.Range,
      startTime: 3600,
      endTime: 7200,
      precision: CalendarPickerTimePrecision.Minute,
    })).toEqual(['2026-05-15 01:00', '2026-05-20 02:00']);
  });

  it('syncs draft value from model value', () => {
    expect(syncCalendarPickerDraft({
      value: ['2026-05-15 01:30', '2026-05-20 20:00'],
      viewDate: '',
      defaultStartTime: '00:00:00',
      defaultEndTime: '23:59:59',
      currentStartTime: 0,
      currentEndTime: 86399,
    })).toEqual({
      tempValue: ['2026-05-15', '2026-05-20'],
      startTime: 5400,
      endTime: 72000,
      panelDate: '2026-05-15',
    });
  });

  it('resolves display text and reset value', () => {
    expect(resolveCalendarPickerDisplayValue({
      modelValue: '',
      mode: CalendarMode.Single,
      placeholder: '请选择',
      rangeSeparator: '至',
      multipleSelectedText: '已选 2 个',
    })).toBe('请选择');
    expect(resolveCalendarPickerDisplayValue({
      modelValue: ['2026-05-15', '2026-05-20'],
      mode: CalendarMode.Range,
      placeholder: '请选择',
      rangeSeparator: '至',
      multipleSelectedText: '已选 2 个',
    })).toBe('2026-05-15 至 2026-05-20');
    expect(resolveCalendarPickerResetValue(CalendarMode.Single)).toBe('');
    expect(resolveCalendarPickerResetValue(CalendarMode.Range)).toEqual([]);
  });

  it('builds root class and open guard', () => {
    expect(resolveCalendarPickerClass({
      disabled: true,
      readonly: false,
      customClass: 'custom',
    })).toEqual([
      'lk-calendar-picker',
      { 'is-disabled': true, 'is-readonly': false },
      'custom',
    ]);
    expect(canOpenCalendarPicker({ disabled: false, readonly: false })).toBe(true);
    expect(canOpenCalendarPicker({ disabled: true, readonly: false })).toBe(false);
  });
});
