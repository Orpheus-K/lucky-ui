import { describe, expect, it, vi } from 'vitest';
import {
  captureFormItemInitialValues,
  cloneFormValue,
  filterFormRulesByTrigger,
  getFormFieldRules,
  isEmptyFormValue,
  normalizeFormRules,
  normalizeValidateErrors,
  resolveFormClass,
  resolveFormItemClass,
  resolveFormItemLabelStyle,
  resolveFormItemProps,
  resolveFormItemRequired,
  resolveFormControlProp,
  resolveTargetFormFields,
  restoreFormItemInitialValues,
  validateRegisteredFormFields,
  validateFormValue,
} from '../../src/uni_modules/lucky-ui/components/lk-form/form.utils';
import type {
  FormItemContext,
  FormRule,
} from '../../src/uni_modules/lucky-ui/components/lk-form/context';
import { isFormValidationSupersededError } from '../../src/uni_modules/lucky-ui/components/lk-form/context';

describe('lk-form validation rules', () => {
  const generationMethods = {
    beginValidation: () => 1,
    isValidationCurrent: () => true,
    captureValidationGeneration: () => 1,
    commitValidation: () => 1,
    rollbackValidation: () => undefined,
    releaseValidation: () => undefined,
    getValidationProps: (_trigger?: 'blur' | 'change', fields?: string[]) => fields || [],
    invalidateValidation: () => undefined,
    validateGeneration: async () => 'validated' as const,
  };

  it('normalizes field rules and filters them by trigger', () => {
    const blurRule: FormRule = { required: true, trigger: 'blur' };
    const changeRule: FormRule = { min: 2, trigger: ['change'] };
    const sharedRule: FormRule = { max: 6 };

    expect(normalizeFormRules(blurRule)).toEqual([blurRule]);
    expect(getFormFieldRules({ name: [blurRule, changeRule, sharedRule] }, 'name')).toEqual([
      blurRule,
      changeRule,
      sharedRule,
    ]);
    expect(filterFormRulesByTrigger([blurRule, changeRule, sharedRule], 'blur')).toEqual([
      blurRule,
      sharedRule,
    ]);
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

    await expect(
      validateFormValue({
        field: 'username',
        value: 'bb',
        rules,
        model: { username: 'bb' },
        fallbackMessage: 'Invalid',
      })
    ).resolves.toEqual([
      { field: 'username', message: 'Too short', rule: rules[1] },
      { field: 'username', message: 'Only a', rule: rules[2] },
      { field: 'username', message: 'Rejected by server', rule: rules[3] },
    ]);

    await expect(
      validateFormValue({
        field: 'age',
        value: 17,
        rules: [{ min: 18, message: 'Adult only' }],
        fallbackMessage: 'Invalid',
      })
    ).resolves.toEqual([
      { field: 'age', message: 'Adult only', rule: { min: 18, message: 'Adult only' } },
    ]);
  });

  it('normalizes thrown validator errors', async () => {
    const rule: FormRule = {
      validator: async () => {
        throw new Error('Network error');
      },
    };

    await expect(
      validateFormValue({
        field: 'code',
        value: '1234',
        rules: [rule],
        fallbackMessage: 'Invalid',
      })
    ).resolves.toEqual([{ field: 'code', message: 'Network error', rule }]);
  });

  it('resolves target fields and external validation errors', () => {
    const makeField = (prop: string): FormItemContext => ({
      prop,
      setValidateStatus: () => undefined,
      ...generationMethods,
      validate: async () => 'validated',
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

  it('restores mount-time values without sharing nested references', () => {
    const model: Record<string, unknown> = {
      title: 'Initial title',
      settings: { tags: ['initial'], enabled: true },
    };
    const initialValues = captureFormItemInitialValues(model, ['title', 'settings', 'missing']);

    model.title = 'Edited title';
    model.settings = { tags: ['edited'], enabled: false };
    model.missing = 'created later';
    restoreFormItemInitialValues(model, initialValues);

    expect(model).toEqual({
      title: 'Initial title',
      settings: { tags: ['initial'], enabled: true },
    });

    (model.settings as { tags: string[] }).tags.push('mutated after reset');
    restoreFormItemInitialValues(model, initialValues);
    expect(model.settings).toEqual({ tags: ['initial'], enabled: true });
  });

  it('deep-clones cyclic JSON-like field values', () => {
    const source: { name: string; self?: unknown } = { name: 'root' };
    source.self = source;
    const cloned = cloneFormValue(source);

    expect(cloned).not.toBe(source);
    expect(cloned.self).toBe(cloned);
  });

  it('inherits only an unambiguous FormItem prop', () => {
    expect(resolveFormControlProp('explicit', 'item')).toBe('explicit');
    expect(resolveFormControlProp('', 'item')).toBe('item');
    expect(resolveFormControlProp('', ['item'])).toBe('item');
    expect(resolveFormControlProp('', ['first', 'second'])).toBeUndefined();
    expect(resolveFormItemProps(['first', 'first', 'second'], ['second'])).toEqual(['second']);
  });

  it('keeps silent and fields validation free of unrelated state and events', async () => {
    const titleStatus = vi.fn();
    const notesStatus = vi.fn();
    const makeField = (
      prop: string,
      setValidateStatus: ReturnType<typeof vi.fn>
    ): FormItemContext => ({
      prop,
      setValidateStatus,
      ...generationMethods,
      validate: async () => 'validated',
      reset: () => undefined,
    });
    const fields = [makeField('title', titleStatus), makeField('notes', notesStatus)];

    await expect(
      validateRegisteredFormFields({
        fields,
        model: { title: '', notes: '' },
        customValidator: () => ({ title: 'Title required', notes: 'Notes required' }),
        validateOptions: { fields: ['title'], silent: true },
      })
    ).resolves.toEqual({
      errors: [{ field: 'title', message: 'Title required' }],
      stale: false,
    });

    expect(titleStatus).not.toHaveBeenCalled();
    expect(notesStatus).not.toHaveBeenCalled();
  });

  it('passes silent target options through default field validation', async () => {
    const validateTitle = vi.fn(async () => {
      throw [{ field: 'title', message: 'Title required' }];
    });
    const validateNotes = vi.fn(async () => 'validated' as const);
    const makeField = (prop: string, validate: FormItemContext['validate']): FormItemContext => ({
      prop,
      setValidateStatus: () => undefined,
      ...generationMethods,
      validate,
      validateGeneration: validate,
      reset: () => undefined,
    });

    const errors = await validateRegisteredFormFields({
      fields: [makeField('title', validateTitle), makeField('notes', validateNotes)],
      model: { title: '', notes: '' },
      validateOptions: { fields: ['title'], silent: true },
    });

    expect(errors).toEqual({
      errors: [{ field: 'title', message: 'Title required' }],
      stale: false,
    });
    expect(validateTitle).toHaveBeenCalledWith(1, undefined, {
      fields: ['title'],
      silent: true,
    });
    expect(validateNotes).not.toHaveBeenCalled();
  });

  it('does not report success when a field has no matching validation rule', async () => {
    const field: FormItemContext = {
      prop: 'title',
      setValidateStatus: () => undefined,
      ...generationMethods,
      validate: async () => 'skipped',
      reset: () => undefined,
    };

    await expect(
      validateRegisteredFormFields({
        fields: [field],
        model: { title: 'unchanged' },
      })
    ).resolves.toEqual({ errors: [], stale: false });
  });

  it('rejects a superseded imperative validation without reporting stale fields', async () => {
    let resolveValidation!: (result: 'validated') => void;
    const deferredValidation = new Promise<'validated'>(resolve => {
      resolveValidation = resolve;
    });
    let current = true;
    const field: FormItemContext = {
      prop: 'title',
      setValidateStatus: vi.fn(),
      ...generationMethods,
      getValidationProps: () => ['title'],
      validate: () => deferredValidation,
      validateGeneration: () => deferredValidation,
      reset: vi.fn(),
    };

    const pending = validateRegisteredFormFields({
      fields: [field],
      model: { title: 'old' },
      isCurrent: () => current,
    });
    current = false;
    resolveValidation('validated');

    const error = await pending.catch(reason => reason);
    expect(isFormValidationSupersededError(error)).toBe(true);
    expect(error).toMatchObject({
      name: 'FormValidationSupersededError',
      code: 'FORM_VALIDATION_SUPERSEDED',
    });
    expect(field.setValidateStatus).not.toHaveBeenCalled();
  });

  it('keeps form-wide field state and reports atomic when a later field is superseded', async () => {
    let current = true;
    let resolveSecond!: (result: 'validated') => void;
    let markSecondStarted!: () => void;
    const secondValidation = new Promise<'validated'>(resolve => {
      resolveSecond = resolve;
    });
    const secondStarted = new Promise<void>(resolve => {
      markSecondStarted = resolve;
    });
    const firstStatus = vi.fn();
    const secondStatus = vi.fn();
    const makeField = (options: {
      prop: string;
      status: ReturnType<typeof vi.fn>;
      validate: FormItemContext['validate'];
    }): FormItemContext => ({
      prop: options.prop,
      setValidateStatus: options.status,
      beginValidation: () => 1,
      isValidationCurrent: () => true,
      captureValidationGeneration: () => 1,
      commitValidation: (_generation, errors) => {
        options.status(errors.length ? 'error' : 'success', errors[0]?.message || '');
        return true;
      },
      rollbackValidation: vi.fn(),
      releaseValidation: vi.fn(),
      getValidationProps: () => [options.prop],
      invalidateValidation: vi.fn(),
      validate: options.validate,
      validateGeneration: options.validate,
      reset: vi.fn(),
    });
    const firstField = makeField({
      prop: 'a',
      status: firstStatus,
      validate: async () => {
        throw [{ field: 'a', message: 'A invalid' }];
      },
    });
    const secondField = makeField({
      prop: 'b',
      status: secondStatus,
      validate: () => {
        markSecondStarted();
        return secondValidation;
      },
    });

    const pending = validateRegisteredFormFields({
      fields: [firstField, secondField],
      model: { a: '', b: '' },
      isCurrent: () => current,
    });
    await secondStarted;
    current = false;
    resolveSecond('validated');

    const error = await pending.catch(reason => reason);
    expect(isFormValidationSupersededError(error)).toBe(true);
    expect(firstStatus).not.toHaveBeenCalled();
    expect(secondStatus).not.toHaveBeenCalled();
  });

  it('rolls back earlier committed field state when a later commit supersedes the form run', async () => {
    let current = true;
    const states = { a: 'idle', b: 'idle' };
    let revisionA = 0;
    let revisionB = 0;
    const rollbackA = vi.fn((_generation: number, commitToken?: number) => {
      if (commitToken === revisionA) states.a = 'idle';
    });
    const rollbackB = vi.fn((_generation: number, commitToken?: number) => {
      if (commitToken === revisionB) states.b = 'idle';
    });
    const makeField = (
      prop: 'a' | 'b',
      commit: FormItemContext['commitValidation'],
      rollback: FormItemContext['rollbackValidation']
    ): FormItemContext => ({
      prop,
      setValidateStatus: vi.fn(),
      beginValidation: () => 1,
      isValidationCurrent: () => true,
      captureValidationGeneration: () => 1,
      commitValidation: commit,
      rollbackValidation: rollback,
      releaseValidation: vi.fn(),
      getValidationProps: () => [prop],
      invalidateValidation: vi.fn(),
      validate: async () => 'validated',
      validateGeneration: async () => 'validated',
      reset: vi.fn(),
    });
    const a = makeField(
      'a',
      () => {
        states.a = 'success';
        revisionA += 1;
        return revisionA;
      },
      rollbackA
    );
    const b = makeField(
      'b',
      () => {
        states.b = 'success';
        revisionB += 1;
        current = false;
        return revisionB;
      },
      rollbackB
    );
    const error = await validateRegisteredFormFields({
      fields: [a, b],
      model: { a: 'a', b: 'b' },
      isCurrent: () => current,
    }).catch(reason => reason);

    expect(isFormValidationSupersededError(error)).toBe(true);
    expect(states).toEqual({ a: 'idle', b: 'idle' });
    expect(rollbackA).toHaveBeenCalledWith(1, 1);
    expect(rollbackB).toHaveBeenCalledWith(1, 1);
  });

  it('does not begin custom validation for a FormItem without props', async () => {
    const beginValidation = vi.fn(() => 1);
    const customValidator = vi.fn(() => ({ orphan: 'ignored' }));
    const field: FormItemContext = {
      prop: undefined,
      setValidateStatus: vi.fn(),
      beginValidation,
      isValidationCurrent: () => true,
      captureValidationGeneration: () => 0,
      commitValidation: () => 1,
      rollbackValidation: vi.fn(),
      releaseValidation: vi.fn(),
      getValidationProps: () => [],
      invalidateValidation: vi.fn(),
      validate: async () => 'skipped',
      validateGeneration: async () => 'skipped',
      reset: vi.fn(),
    };

    await expect(
      validateRegisteredFormFields({
        fields: [field],
        model: {},
        customValidator,
      })
    ).resolves.toEqual({ errors: [], stale: false });
    expect(beginValidation).not.toHaveBeenCalled();
    expect(customValidator).not.toHaveBeenCalled();
    expect(field.setValidateStatus).not.toHaveBeenCalled();
  });

  it('builds form and form item display metadata', () => {
    expect(
      resolveFormClass({ border: true, card: false, disabled: true, customClass: 'custom' })
    ).toEqual([
      'lk-form',
      { 'lk-form--border': true, 'lk-form--card': false, 'is-disabled': true },
      'custom',
    ]);

    expect(resolveFormItemLabelStyle(160)).toEqual({ width: '160rpx' });
    expect(resolveFormItemLabelStyle('6em')).toEqual({ width: '6em' });
    expect(
      resolveFormItemRequired({
        explicitRequired: undefined,
        rules: [{ required: true }],
      })
    ).toBe(true);
    expect(
      resolveFormItemRequired({
        explicitRequired: false,
        rules: [{ required: true }],
      })
    ).toBe(false);

    expect(
      resolveFormItemClass({
        customClass: 'x',
        status: 'error',
        labelAlign: 'top',
        topLayout: true,
        border: true,
        link: true,
      })
    ).toEqual([
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
