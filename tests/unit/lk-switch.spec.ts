import { describe, expect, it } from 'vitest';
import {
  canToggleSwitch,
  isSwitchChecked,
  resolveSwitchClass,
  resolveSwitchNextValue,
  resolveSwitchPromptText,
  resolveSwitchStyle,
  shouldValidateSwitchField,
} from '../../src/uni_modules/lucky-ui/components/lk-switch/switch.utils';

describe('lk-switch state rules', () => {
  it('matches checked state by activeValue with strict equality', () => {
    expect(isSwitchChecked({ modelValue: true, activeValue: true })).toBe(true);
    expect(isSwitchChecked({ modelValue: 1, activeValue: '1' })).toBe(false);
    expect(isSwitchChecked({ modelValue: 'enabled', activeValue: 'enabled' })).toBe(true);
  });

  it('resolves next value from active and inactive values', () => {
    expect(resolveSwitchNextValue({
      checked: true,
      activeValue: 'on',
      inactiveValue: 'off',
    })).toBe('off');
    expect(resolveSwitchNextValue({
      checked: false,
      activeValue: 1,
      inactiveValue: 0,
    })).toBe(1);
  });

  it('blocks toggles while disabled, loading or changing', () => {
    expect(canToggleSwitch({ disabled: false, loading: false, changing: false })).toBe(true);
    expect(canToggleSwitch({ disabled: true, loading: false, changing: false })).toBe(false);
    expect(canToggleSwitch({ disabled: false, loading: true, changing: false })).toBe(false);
    expect(canToggleSwitch({ disabled: false, loading: false, changing: true })).toBe(false);
  });

  it('resolves inline prompt text with defaults', () => {
    expect(resolveSwitchPromptText({
      inlinePrompt: false,
      checked: true,
      activeText: '启',
      inactiveText: '关',
    })).toBe('');
    expect(resolveSwitchPromptText({
      inlinePrompt: true,
      checked: true,
      activeText: '',
      inactiveText: '',
    })).toBe('ON');
    expect(resolveSwitchPromptText({
      inlinePrompt: true,
      checked: false,
      activeText: '启',
      inactiveText: '关',
    })).toBe('关');
  });

  it('builds style variables and state classes', () => {
    expect(resolveSwitchStyle({
      activeColor: '#14b8a6',
      inactiveColor: '#94a3b8',
      customStyle: { marginTop: '8rpx' },
    })).toEqual([
      {
        '--switch-active-color': '#14b8a6',
        '--switch-inactive-color': '#94a3b8',
      },
      { marginTop: '8rpx' },
    ]);

    expect(resolveSwitchClass({
      customClass: 'custom',
      size: 'lg',
      checked: true,
      disabled: false,
      loading: false,
      changing: true,
      inlinePrompt: true,
    })).toEqual([
      'custom',
      'lk-switch--lg',
      {
        'is-checked': true,
        'is-disabled': false,
        'is-loading': true,
        'has-prompt': true,
      },
    ]);
  });

  it('only validates when both validateEvent and prop are present', () => {
    expect(shouldValidateSwitchField({ validateEvent: true, prop: 'enabled' })).toBe(true);
    expect(shouldValidateSwitchField({ validateEvent: true, prop: '' })).toBe(false);
    expect(shouldValidateSwitchField({ validateEvent: false, prop: 'enabled' })).toBe(false);
  });
});
