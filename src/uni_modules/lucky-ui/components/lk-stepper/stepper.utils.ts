import type { CSSProperties, StyleValue } from 'vue';
import { addUnit } from '../../core/src/utils/unit';
import type { StepperAction, StepperValue } from './stepper.props';

export function addStepperValue(num1: number, num2: number): number {
  const card = Math.pow(10, 10);
  return Math.round((num1 + num2) * card) / card;
}

export function clampStepperValue(options: {
  value: number;
  min: StepperValue;
  max: StepperValue;
  integer: boolean;
}): number {
  let num = options.value;
  if (options.integer) {
    num = Math.floor(num);
  }
  return Math.max(Number(options.min), Math.min(Number(options.max), num));
}

export function formatStepperValue(options: {
  value: StepperValue;
  min: StepperValue;
  max: StepperValue;
  integer: boolean;
}): string {
  if (options.value === '') return '';
  let num = Number(options.value);
  if (Number.isNaN(num)) num = Number(options.min);

  return String(
    clampStepperValue({
      value: num,
      min: options.min,
      max: options.max,
      integer: options.integer,
    })
  );
}

export function isStepperMinusDisabled(options: {
  disabled: boolean;
  current: string;
  min: StepperValue;
}): boolean {
  return options.disabled || Number(options.current) <= Number(options.min);
}

export function isStepperPlusDisabled(options: {
  disabled: boolean;
  current: string;
  max: StepperValue;
}): boolean {
  return options.disabled || Number(options.current) >= Number(options.max);
}

export function resolveStepperStyle(options: {
  buttonSize: StepperValue;
  inputWidth: StepperValue;
  customStyle: StyleValue;
}): StyleValue {
  const style: CSSProperties = {};

  if (options.buttonSize) {
    const buttonSize = addUnit(options.buttonSize);
    if (buttonSize) style['--stepper-btn-size'] = buttonSize;
  }

  if (options.inputWidth) {
    const inputWidth = addUnit(options.inputWidth);
    if (inputWidth) style['--stepper-input-width'] = inputWidth;
  }

  return [style, options.customStyle] as StyleValue;
}

export function resolveStepperClass(options: {
  customClass: unknown;
  size: string;
  disabled: boolean;
}) {
  return [options.customClass, `lk-stepper--${options.size}`, { 'is-disabled': options.disabled }];
}

export function readStepperInputValue(
  event:
    | Event
    | {
        detail?: { value?: string };
        target?: { value?: string } | null;
      }
): string {
  const payload = event as {
    detail?: { value?: string };
    target?: { value?: string } | null;
  };
  return payload.detail?.value ?? payload.target?.value ?? '';
}

export type StepperChangeResult =
  | { type: 'disabled' }
  | { type: 'overlimit'; action: 'minus' | 'plus'; limit: number }
  | { type: 'change'; value: number; action: StepperAction };

export function resolveStepperChange(options: {
  action: StepperAction;
  inputValue?: string;
  current: string;
  disabled: boolean;
  min: StepperValue;
  max: StepperValue;
  step: StepperValue;
  integer: boolean;
}): StepperChangeResult {
  if (options.disabled) return { type: 'disabled' };

  let nextValue: number;

  if (options.action === 'input') {
    nextValue = Number(options.inputValue);
  } else {
    const now = Number(options.current || 0);
    if (
      options.action === 'minus' &&
      isStepperMinusDisabled({
        disabled: options.disabled,
        current: options.current,
        min: options.min,
      })
    ) {
      return { type: 'overlimit', action: 'minus', limit: Number(options.min) };
    }
    if (
      options.action === 'plus' &&
      isStepperPlusDisabled({
        disabled: options.disabled,
        current: options.current,
        max: options.max,
      })
    ) {
      return { type: 'overlimit', action: 'plus', limit: Number(options.max) };
    }
    const step = Number(options.step);
    nextValue =
      options.action === 'minus' ? addStepperValue(now, -step) : addStepperValue(now, step);
  }

  return {
    type: 'change',
    action: options.action,
    value: clampStepperValue({
      value: nextValue,
      min: options.min,
      max: options.max,
      integer: options.integer,
    }),
  };
}

export function normalizeStepperBlurValue(options: {
  current: string;
  min: StepperValue;
  max: StepperValue;
  integer: boolean;
}): string {
  const value = Number(options.current);
  const normalized = Number.isNaN(value) ? Number(options.min) : value;
  return String(
    clampStepperValue({
      value: normalized,
      min: options.min,
      max: options.max,
      integer: options.integer,
    })
  );
}

export function shouldValidateStepperField(options: {
  validateEvent: boolean;
  prop: string;
}): boolean {
  return options.validateEvent && !!options.prop;
}
