import { describe, expect, it } from 'vitest';
import {
  filterFormRulesByTrigger,
  getFormFieldRules,
  isEmptyFormValue,
  normalizeFormRules,
  normalizeValidateErrors,
  resolveFormClass,
  resolveFormItemClass,
  resolveFormItemLabelStyle,
  resolveFormItemRequired,
  resolveFormItemResetValue,
  resolveTargetFormFields,
  validateFormValue,
} from '../../src/uni_modules/lucky-ui/components/lk-form/form.utils';
import type { FormItemContext, FormRule } from '../../src/uni_modules/lucky-ui/components/lk-form/context';

describe('lk-form validation rules', () => {
  it('normalizes field rules and filters them by trigger', () => {
    const blurRule: FormRule = { required: true, trigger: 'blur' };
    const changeRule: FormRule = { min: 2, trigger: ['change'] };
    const sharedRule: FormRule = { max: 6 };

    expect(normalizeFormRules(blurRule)).toEqual([blurRule]);
    expect(getFormFieldRules({ name: [blurRule, changeRule, sharedRule] }, 'name'))
      .toEqual([blurRule, changeRule, sharedRule]);
    expect(filterFormRulesByTrigger([blurRule, changeRule, sharedRule], 'blur'))
      .toEqual([blurRule, sharedRule]);
  });

  it('detects empty values consistently for required fields', () => {
    expect(isEmptyFormValue(undefined)).toBe(true);
    expect(isEmptyFormValue(null)).toBe(true);
    expect(isEmptyFormValue('   ')).toBe(true);
    expect(isEmptyFormValue([])).toBe(true);
    expect(isEmptyFormValue(Number.NaN)).toBe(true);
    expect(isEmptyFormValue(0)).toBe(false);
    expect(isEmptyFormValue(false)).toBe(false);
  });

  it('validates required, length, range, pattern and async validator rules', async () => {
    const rules: FormRule[] = [
      { required: true, message: 'Required' },
      { min: 3, message: 'Too short' },
      { pattern: /^a+$/g, message: 'Only a' },
      { validator: async () => 'Rejected by server' },
    ];

    await expect(validateFormValue({
      field: 'username',
      value: 'bb',
      rules,
      model: { username: 'bb' },
      fallbackMessage: 'Invalid',
    })).resolves.toEqual([
      { field: 'username', message: 'Too short', rule: rules[1] },
      { field: 'username', message: 'Only a', rule: rules[2] },
      { field: 'username', message: 'Rejected by server', rule: rules[3] },
    ]);

    await expect(validateFormValue({
      field: 'age',
      value: 17,
      rules: [{ min: 18, message: 'Adult only' }],
      fallbackMessage: 'Invalid',
    })).resolves.toEqual([
      { field: 'age', message: 'Adult only', rule: { min: 18, message: 'Adult only' } },
    ]);
  });

  it('normalizes thrown validator errors', async () => {
    const rule: FormRule = {
      validator: async () => {
        throw new Error('Network error');
      },
    };

    await expect(validateFormValue({
      field: 'code',
      value: '1234',
      rules: [rule],
      fallbackMessage: 'Invalid',
    })).resolves.toEqual([{ field: 'code', message: 'Network error', rule }]);
  });

  it('resolves target fields and external validation errors', () => {
    const makeField = (prop: string): FormItemContext => ({
      prop,
      setValidateStatus: () => undefined,
      validate: async () => undefined,
      reset: () => undefined,
    });
    const fields = [makeField('name'), makeField('age')];
    const error = { field: 'name', message: 'Required' };

    expect(resolveTargetFormFields(fields, ['age'])).toEqual([fields[1]]);
    expect(resolveTargetFormFields(fields)).toEqual(fields);
    expect(normalizeValidateErrors(error)).toEqual([error]);
    expect(normalizeValidateErrors([error])).toEqual([error]);
    expect(normalizeValidateErrors(null)).toEqual([]);
  });

  it('resolves reset values by current field value type', () => {
    expect(resolveFormItemResetValue(['a'])).toEqual([]);
    expect(resolveFormItemResetValue(true)).toBe(false);
    expect(resolveFormItemResetValue(5)).toBe(0);
    expect(resolveFormItemResetValue(null)).toBeNull();
    expect(resolveFormItemResetValue(undefined)).toBeNull();
    expect(resolveFormItemResetValue('hello')).toBe('');
    expect(resolveFormItemResetValue({ value: 1 })).toBe('');
  });

  it('builds form and form item display metadata', () => {
    expect(resolveFormClass({ border: true, card: false, customClass: 'custom' })).toEqual([
      'lk-form',
      { 'lk-form--border': true, 'lk-form--card': false },
      'custom',
    ]);

    expect(resolveFormItemLabelStyle(160)).toEqual({ width: '160rpx' });
    expect(resolveFormItemLabelStyle('6em')).toEqual({ width: '6em' });
    expect(resolveFormItemRequired({
      explicitRequired: undefined,
      rules: [{ required: true }],
    })).toBe(true);
    expect(resolveFormItemRequired({
      explicitRequired: false,
      rules: [{ required: true }],
    })).toBe(false);

    expect(resolveFormItemClass({
      customClass: 'x',
      status: 'error',
      labelAlign: 'top',
      topLayout: true,
      border: true,
      link: true,
    })).toEqual([
      'x',
      'is-error',
      'lk-form-item--top',
      {
        'lk-form-item--top': true,
        'lk-form-item--border': true,
        'lk-form-item--link': true,
      },
    ]);
  });
});
