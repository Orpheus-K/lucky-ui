import { describe, expect, it } from 'vitest';
import {
  addStepperValue,
  clampStepperValue,
  formatStepperValue,
  isStepperMinusDisabled,
  isStepperPlusDisabled,
  normalizeStepperBlurValue,
  readStepperInputValue,
  resolveStepperChange,
  resolveStepperClass,
  resolveStepperStyle,
  shouldValidateStepperField,
} from '../../src/uni_modules/lucky-ui/components/lk-stepper/stepper.utils';

describe('lk-stepper number rules', () => {
  it('adds decimal steps without common floating point drift', () => {
    expect(addStepperValue(0.1, 0.2)).toBe(0.3);
    expect(addStepperValue(1, -0.2)).toBe(0.8);
  });

  it('clamps and formats values by min, max and integer mode', () => {
    expect(clampStepperValue({ value: 12, min: 1, max: 10, integer: false })).toBe(10);
    expect(clampStepperValue({ value: 1.9, min: 1, max: 10, integer: true })).toBe(1);
    expect(formatStepperValue({ value: '', min: 1, max: 10, integer: false })).toBe('');
    expect(formatStepperValue({ value: 'abc', min: 2, max: 10, integer: false })).toBe('2');
    expect(formatStepperValue({ value: '9.9', min: 1, max: 10, integer: true })).toBe('9');
  });

  it('detects disabled button states by boundary', () => {
    expect(isStepperMinusDisabled({ disabled: false, current: '1', min: 1 })).toBe(true);
    expect(isStepperMinusDisabled({ disabled: true, current: '5', min: 1 })).toBe(true);
    expect(isStepperPlusDisabled({ disabled: false, current: '10', max: 10 })).toBe(true);
    expect(isStepperPlusDisabled({ disabled: false, current: '9', max: 10 })).toBe(false);
  });

  it('resolves change results for plus, minus, input and overlimit', () => {
    expect(resolveStepperChange({
      action: 'plus',
      current: '1',
      disabled: false,
      min: 0,
      max: 10,
      step: 0.2,
      integer: false,
    })).toEqual({ type: 'change', action: 'plus', value: 1.2 });

    expect(resolveStepperChange({
      action: 'minus',
      current: '1',
      disabled: false,
      min: 1,
      max: 10,
      step: 1,
      integer: false,
    })).toEqual({ type: 'overlimit', action: 'minus', limit: 1 });

    expect(resolveStepperChange({
      action: 'input',
      inputValue: '20',
      current: '1',
      disabled: false,
      min: 1,
      max: 10,
      step: 1,
      integer: false,
    })).toEqual({ type: 'change', action: 'input', value: 10 });
  });

  it('reads input payloads and normalizes blur values', () => {
    expect(readStepperInputValue({ detail: { value: '3' } })).toBe('3');
    expect(readStepperInputValue({ target: { value: '4' } })).toBe('4');
    expect(readStepperInputValue({})).toBe('');
    expect(normalizeStepperBlurValue({
      current: 'abc',
      min: 2,
      max: 10,
      integer: false,
    })).toBe('2');
  });

  it('builds style variables and classes', () => {
    expect(resolveStepperStyle({
      buttonSize: 56,
      inputWidth: '120rpx',
      customStyle: { marginTop: '8rpx' },
    })).toEqual([
      {
        '--stepper-btn-size': '56rpx',
        '--stepper-input-width': '120rpx',
      },
      { marginTop: '8rpx' },
    ]);

    expect(resolveStepperClass({
      customClass: 'custom',
      size: 'lg',
      disabled: true,
    })).toEqual([
      'custom',
      'lk-stepper--lg',
      { 'is-disabled': true },
    ]);
  });

  it('only validates when both validateEvent and prop are present', () => {
    expect(shouldValidateStepperField({ validateEvent: true, prop: 'count' })).toBe(true);
    expect(shouldValidateStepperField({ validateEvent: true, prop: '' })).toBe(false);
    expect(shouldValidateStepperField({ validateEvent: false, prop: 'count' })).toBe(false);
  });
});
