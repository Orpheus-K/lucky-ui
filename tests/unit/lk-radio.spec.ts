import { describe, expect, it } from 'vitest';
import {
  isRadioChecked,
  isRadioDisabled,
  resolveRadioClass,
  resolveRadioGroupClass,
  resolveRadioIconSize,
  resolveRadioIconStyle,
  resolveRadioIconType,
  resolveRadioShape,
  resolveRadioSize,
  resolveRadioValue,
  type RadioGroupLike,
} from '../../src/uni_modules/lucky-ui/components/lk-radio/radio.utils';

describe('lk-radio selection and inheritance rules', () => {
  const group: RadioGroupLike = {
    modelValue: 'b',
    disabled: true,
    shape: 'square',
    iconType: 'check',
    size: 'lg',
    activeColor: '#1677ff',
  };

  it('uses name as value before label, including false and zero values', () => {
    expect(resolveRadioValue('id', 'Label')).toBe('id');
    expect(resolveRadioValue(0, 'Label')).toBe(0);
    expect(resolveRadioValue(false, 'Label')).toBe(false);
    expect(resolveRadioValue('', 'Label')).toBe('Label');
  });

  it('detects checked state in standalone and group modes', () => {
    expect(isRadioChecked({
      modelValue: 'a',
      radioValue: 'a',
    })).toBe(true);
    expect(isRadioChecked({
      group,
      modelValue: 'a',
      radioValue: 'b',
    })).toBe(true);
    expect(isRadioChecked({
      group,
      modelValue: 'b',
      radioValue: 'a',
    })).toBe(false);
  });

  it('inherits disabled, shape, icon type and size from group', () => {
    expect(isRadioDisabled({ disabled: false, group })).toBe(true);
    expect(resolveRadioShape('', group)).toBe('square');
    expect(resolveRadioShape('circle', group)).toBe('circle');
    expect(resolveRadioIconType('', group)).toBe('check');
    expect(resolveRadioIconType('dot', group)).toBe('dot');
    expect(resolveRadioSize(group)).toBe('lg');
    expect(resolveRadioSize(null)).toBe('md');
  });

  it('resolves icon size from explicit prop or group size', () => {
    expect(resolveRadioIconSize({ iconSize: '40rpx', size: 'sm' })).toBe('40rpx');
    expect(resolveRadioIconSize({ iconSize: '', size: 'sm' })).toBe(24);
    expect(resolveRadioIconSize({ iconSize: '', size: 'md' })).toBe(30);
    expect(resolveRadioIconSize({ iconSize: '', size: 'lg' })).toBe(36);
  });

  it('builds active icon style with color and explicit size', () => {
    expect(resolveRadioIconStyle({
      checked: true,
      activeColor: '#1677ff',
      iconSize: 32,
    })).toEqual({
      borderColor: '#1677ff',
      backgroundColor: '#1677ff',
      width: '32rpx',
      height: '32rpx',
    });

    expect(resolveRadioIconStyle({
      checked: false,
      activeColor: '#1677ff',
      iconSize: '',
    })).toEqual({});
  });

  it('builds item and group classes', () => {
    expect(resolveRadioClass({
      size: 'lg',
      shape: 'square',
      iconType: 'check',
      checked: true,
      disabled: false,
      customClass: 'custom',
    })).toEqual([
      'lk-radio',
      'lk-radio--lg',
      'lk-radio--square',
      'lk-radio--icon-check',
      {
        'lk-radio--checked': true,
        'lk-radio--disabled': false,
      },
      'custom',
    ]);

    expect(resolveRadioGroupClass({
      direction: 'column',
      customClass: 'group',
    })).toEqual(['lk-radio-group', 'lk-radio-group--column', 'group']);
  });
});
