import { describe, expect, it } from 'vitest';
import {
  isCheckboxChecked,
  isCheckboxDisabled,
  resolveCheckboxClass,
  resolveCheckboxGroupClass,
  resolveCheckboxGroupToggle,
  resolveCheckboxIconSize,
  resolveCheckboxIconStyle,
  resolveCheckboxIconType,
  resolveCheckboxShape,
  resolveCheckboxSize,
  resolveCheckboxValue,
  type CheckboxGroupLike,
} from '../../src/uni_modules/lucky-ui/components/lk-checkbox/checkbox.utils';

describe('lk-checkbox selection and group rules', () => {
  const group: CheckboxGroupLike = {
    modelValue: ['a', 0],
    disabled: true,
    shape: 'circle',
    iconType: 'dot',
    size: 'sm',
    activeColor: '#52c41a',
  };

  it('uses name as value before label, including false and zero values', () => {
    expect(resolveCheckboxValue('id', 'Label')).toBe('id');
    expect(resolveCheckboxValue(0, 'Label')).toBe(0);
    expect(resolveCheckboxValue(false, 'Label')).toBe(false);
    expect(resolveCheckboxValue('', 'Label')).toBe('Label');
  });

  it('detects checked state in standalone and group modes', () => {
    expect(isCheckboxChecked({
      modelValue: true,
      checkboxValue: 'a',
    })).toBe(true);
    expect(isCheckboxChecked({
      group,
      modelValue: false,
      checkboxValue: 0,
    })).toBe(true);
    expect(isCheckboxChecked({
      group,
      modelValue: true,
      checkboxValue: 'b',
    })).toBe(false);
  });

  it('inherits disabled, shape, icon type and size from group', () => {
    expect(isCheckboxDisabled({ disabled: false, group })).toBe(true);
    expect(resolveCheckboxShape('', group)).toBe('circle');
    expect(resolveCheckboxShape('square', group)).toBe('square');
    expect(resolveCheckboxIconType('', group)).toBe('dot');
    expect(resolveCheckboxIconType('check', group)).toBe('check');
    expect(resolveCheckboxSize(group)).toBe('sm');
    expect(resolveCheckboxSize(null)).toBe('md');
  });

  it('resolves icon size from explicit prop or inherited size', () => {
    expect(resolveCheckboxIconSize({ iconSize: '40rpx', size: 'sm' })).toBe('40rpx');
    expect(resolveCheckboxIconSize({ iconSize: '', size: 'sm' })).toBe(24);
    expect(resolveCheckboxIconSize({ iconSize: '', size: 'md' })).toBe(30);
    expect(resolveCheckboxIconSize({ iconSize: '', size: 'lg' })).toBe(36);
  });

  it('builds icon style for checked or indeterminate state', () => {
    expect(resolveCheckboxIconStyle({
      checked: false,
      indeterminate: true,
      activeColor: '#52c41a',
      iconSize: 32,
    })).toEqual({
      borderColor: '#52c41a',
      backgroundColor: '#52c41a',
      width: '32rpx',
      height: '32rpx',
    });
    expect(resolveCheckboxIconStyle({
      checked: false,
      indeterminate: false,
      activeColor: '#52c41a',
      iconSize: '',
    })).toEqual({});
  });

  it('toggles group values and respects max limits', () => {
    expect(resolveCheckboxGroupToggle({
      currentValue: ['a'],
      name: 'b',
      max: 0,
    })).toEqual({ value: ['a', 'b'], checked: true, overlimit: false });

    expect(resolveCheckboxGroupToggle({
      currentValue: ['a', 'b'],
      name: 'a',
      max: 1,
    })).toEqual({ value: ['b'], checked: false, overlimit: false });

    expect(resolveCheckboxGroupToggle({
      currentValue: ['a'],
      name: 'b',
      max: 1,
    })).toEqual({ value: ['a'], checked: false, overlimit: true });
  });

  it('builds item and group classes', () => {
    expect(resolveCheckboxClass({
      size: 'lg',
      shape: 'circle',
      iconType: 'dot',
      checked: true,
      disabled: false,
      indeterminate: true,
      customClass: 'custom',
    })).toEqual([
      'lk-checkbox',
      'lk-checkbox--lg',
      'lk-checkbox--circle',
      'lk-checkbox--icon-dot',
      {
        'lk-checkbox--checked': true,
        'lk-checkbox--disabled': false,
        'lk-checkbox--indeterminate': true,
      },
      'custom',
    ]);

    expect(resolveCheckboxGroupClass({
      direction: 'column',
      customClass: 'group',
    })).toEqual(['lk-checkbox-group', 'lk-checkbox-group--column', 'group']);
  });
});
