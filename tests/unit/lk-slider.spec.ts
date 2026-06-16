import { describe, expect, it } from 'vitest';
import {
  chooseSliderThumbIndex,
  formatSliderDisplayValue,
  formatSliderStepValue,
  getSliderEmitValue,
  getSliderPercent,
  getSliderPointX,
  initSliderValue,
  resolveSliderBarStyle,
  resolveSliderBlockStyle,
  resolveSliderRootClass,
  resolveSliderRootStyle,
  resolveSliderStops,
  resolveSliderThumbStyle,
  resolveSliderTrackStyle,
  resolveSliderUpdate,
  shouldValidateSliderField,
} from '../../src/uni_modules/lucky-ui/components/lk-slider/slider.utils';

describe('lk-slider value and display rules', () => {
  it('initializes single and range values', () => {
    expect(initSliderValue({ value: 30, range: false, min: 0, max: 100 })).toEqual([30]);
    expect(initSliderValue({ value: [20, 80], range: true, min: 0, max: 100 })).toEqual([20, 80]);
    expect(initSliderValue({ value: 50, range: true, min: 10, max: 90 })).toEqual([10, 50]);
  });

  it('calculates percent and stops defensively', () => {
    expect(getSliderPercent({ value: 50, min: 0, max: 100 })).toBe(50);
    expect(getSliderPercent({ value: 150, min: 0, max: 100 })).toBe(100);
    expect(getSliderPercent({ value: 50, min: 10, max: 10 })).toBe(0);
    expect(resolveSliderStops({ showStops: true, step: 20, min: 0, max: 100 }))
      .toEqual([20, 40, 60, 80]);
    expect(resolveSliderStops({ showStops: true, step: 1, min: 0, max: 100 })).toEqual([]);
  });

  it('builds bar, track, thumb and block styles', () => {
    expect(resolveSliderBarStyle({
      activeColor: '#1677ff',
      dragging: true,
      range: true,
      values: [20, 80],
      min: 0,
      max: 100,
    })).toEqual({
      backgroundColor: '#1677ff',
      transition: 'none',
      left: '20%',
      width: '60%',
    });

    expect(resolveSliderTrackStyle({ barHeight: '8rpx', inactiveColor: '#ddd' }))
      .toEqual({ height: '8rpx', backgroundColor: '#ddd' });
    expect(resolveSliderThumbStyle({
      value: 25,
      min: 0,
      max: 100,
      dragging: true,
      active: true,
    })).toEqual({ left: '25%', transition: 'none', zIndex: 2 });
    expect(resolveSliderBlockStyle({ blockSize: '36rpx', blockColor: '#fff' }))
      .toEqual({ width: '36rpx', height: '36rpx', backgroundColor: '#fff' });
  });

  it('keeps custom style strings intact while adding root variables', () => {
    expect(resolveSliderRootClass({
      size: 'large',
      disabled: true,
      dragging: false,
      customClass: 'custom',
    })).toEqual([
      'lk-slider',
      'lk-slider--large',
      { 'is-disabled': true, 'is-dragging': false },
      'custom',
    ]);

    expect(resolveSliderRootStyle({
      customStyle: 'margin: 8rpx',
      activeColor: '#1677ff',
      inactiveColor: '#ddd',
    })).toEqual([
      { '--_active-bg': '#1677ff', '--_inactive-bg': '#ddd' },
      'margin: 8rpx',
    ]);
  });

  it('reads pointer x from touch, mouse and detail payloads', () => {
    expect(getSliderPointX({ changedTouches: [{ clientX: 120 }] })).toBe(120);
    expect(getSliderPointX({ touches: [{ clientX: 88 }] })).toBe(88);
    expect(getSliderPointX({ clientX: 42 })).toBe(42);
    expect(getSliderPointX({ detail: { x: 18 } })).toBe(18);
    expect(getSliderPointX({})).toBe(0);
  });

  it('snaps values to step relative to min', () => {
    expect(formatSliderStepValue({ percent: 0.5, min: 10, max: 40, step: 5 })).toBe(25);
    expect(formatSliderStepValue({ percent: 0.66, min: 0, max: 1, step: 0.1 })).toBe(0.7);
    expect(formatSliderStepValue({ percent: -1, min: 0, max: 100, step: 10 })).toBe(0);
    expect(formatSliderStepValue({ percent: 2, min: 0, max: 100, step: 10 })).toBe(100);
  });

  it('emits sorted range values and picks the nearest range thumb', () => {
    expect(getSliderEmitValue({ range: false, values: [30] })).toBe(30);
    expect(getSliderEmitValue({ range: true, values: [80, 20] })).toEqual([20, 80]);
    expect(chooseSliderThumbIndex({ range: false, values: [30], value: 70 })).toBe(0);
    expect(chooseSliderThumbIndex({ range: true, values: [20, 80], value: 25 })).toBe(0);
    expect(chooseSliderThumbIndex({ range: true, values: [20, 80], value: 75 })).toBe(1);
  });

  it('resolves pointer updates without mutating source values', () => {
    const values = [20, 80];
    const result = resolveSliderUpdate({
      clientX: 50,
      rect: { left: 0, width: 100 },
      values,
      draggingIndex: -1,
      isClick: true,
      range: true,
      min: 0,
      max: 100,
      step: 10,
    });

    expect(values).toEqual([20, 80]);
    expect(result).toEqual({
      values: [50, 80],
      emitValue: [50, 80],
      draggingIndex: 0,
      changed: true,
    });
    expect(resolveSliderUpdate({
      clientX: 50,
      rect: { left: 0, width: 0 },
      values,
      draggingIndex: -1,
      isClick: true,
      range: true,
      min: 0,
      max: 100,
      step: 10,
    })).toBeNull();
  });

  it('formats display value and form validation guard', () => {
    expect(formatSliderDisplayValue(20)).toBe(20);
    expect(formatSliderDisplayValue(20, value => `${value}%`)).toBe('20%');
    expect(shouldValidateSliderField({ validateEvent: true, prop: 'progress' })).toBe(true);
    expect(shouldValidateSliderField({ validateEvent: true, prop: '' })).toBe(false);
  });
});
