import { describe, expect, it } from 'vitest';
import {
  applyInputMaxlength,
  hasInputValue,
  readInputValue,
  resolveFakeInputText,
  resolveInputClass,
  resolveInputCount,
  resolveInputNativeState,
  shouldShowPasswordToggle,
  shouldShowSuffix,
  shouldShowTrailingBalance,
} from '../../src/uni_modules/lucky-ui/components/lk-input/input.utils';

describe('lk-input value and display rules', () => {
  it('reads values from uni-app detail payloads and web target payloads', () => {
    expect(readInputValue({ detail: { value: 'abc' } })).toBe('abc');
    expect(readInputValue({ detail: { value: 0 } })).toBe(0);
    expect(readInputValue({ target: { value: 'target' } })).toBe('target');
    expect(readInputValue({})).toBe('');
  });

  it('applies maxlength without changing values under the limit', () => {
    expect(applyInputMaxlength('abcdef', 3)).toBe('abc');
    expect(applyInputMaxlength('ab', 3)).toBe('ab');
    expect(applyInputMaxlength(123456, 4)).toBe('1234');
    expect(applyInputMaxlength(12, -1)).toBe(12);
  });

  it('treats numeric zero as a clearable value', () => {
    expect(hasInputValue(0)).toBe(true);
    expect(hasInputValue(false)).toBe(true);
    expect(hasInputValue('0')).toBe(true);
    expect(hasInputValue('')).toBe(false);
    expect(hasInputValue(null)).toBe(false);
    expect(hasInputValue(undefined)).toBe(false);
  });

  it('resolves native password state for cross-platform input props', () => {
    expect(resolveInputNativeState({ type: 'password', passwordVisible: false }))
      .toEqual({ nativeType: 'text', nativePassword: true });
    expect(resolveInputNativeState({ type: 'password', passwordVisible: true }))
      .toEqual({ nativeType: 'text', nativePassword: false });
    expect(resolveInputNativeState({ type: 'number', passwordVisible: false }))
      .toEqual({ nativeType: 'number', nativePassword: false });
  });

  it('builds count text from showCount and showWordLimit aliases', () => {
    expect(resolveInputCount({
      value: 'hello',
      maxlength: 10,
      showCount: false,
      showWordLimit: true,
    })).toBe('5/10');
    expect(resolveInputCount({
      value: 123,
      maxlength: -1,
      showCount: true,
      showWordLimit: false,
    })).toBe('3');
    expect(resolveInputCount({
      value: 'hidden',
      maxlength: 10,
      showCount: false,
      showWordLimit: false,
    })).toBe('');
  });

  it('prioritizes password toggle over suffix content', () => {
    const passwordToggle = shouldShowPasswordToggle({
      showPassword: true,
      type: 'password',
      disabled: false,
      readonly: false,
      fake: false,
    });

    expect(passwordToggle).toBe(true);
    expect(shouldShowPasswordToggle({
      showPassword: true,
      type: 'password',
      disabled: true,
      readonly: false,
      fake: false,
    })).toBe(false);
    expect(shouldShowSuffix({
      hasSuffixSlot: true,
      suffixIcon: 'calendar-fill',
      showPasswordToggle: passwordToggle,
    })).toBe(false);
  });

  it('adds trailing balance for centered input controls that need right-side affordances', () => {
    expect(shouldShowTrailingBalance({
      inputAlign: 'center',
      prefixIcon: '',
      hasPrefixSlot: false,
      showPasswordToggle: false,
      showSuffix: false,
      value: 0,
      clearable: true,
      count: '',
    })).toBe(true);

    expect(shouldShowTrailingBalance({
      inputAlign: 'center',
      prefixIcon: 'search',
      hasPrefixSlot: false,
      showPasswordToggle: false,
      showSuffix: false,
      value: 'abc',
      clearable: true,
      count: '',
    })).toBe(false);
  });

  it('builds root classes and fake display text', () => {
    expect(resolveInputClass({
      size: 'lg',
      disabled: true,
      readonly: false,
      fake: true,
      borderless: true,
      inputAlign: 'center',
      prefixIcon: 'search',
      trailingBalance: true,
      count: '1/10',
      customClass: 'custom',
    })).toEqual([
      'lk-input',
      'lk-input--lg',
      {
        'is-disabled': true,
        'is-readonly': false,
        'is-fake': true,
        'is-borderless': true,
        'is-center-align': true,
        'has-leading': true,
        'has-trailing': true,
        'has-count': true,
      },
      'custom',
    ]);
    expect(resolveFakeInputText('选择城市', '请选择')).toBe('选择城市');
    expect(resolveFakeInputText('', '请选择')).toBe('请选择');
  });
});
