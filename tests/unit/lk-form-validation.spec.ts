import { describe, expect, it, vi } from 'vitest';
import { effectScope, ref } from 'vue';
import type {
  FormContext,
  FormItemContext,
  FormRule,
} from '../../src/uni_modules/lucky-ui/components/lk-form/context';
import {
  createFormItemValidationController,
  watchFormItemInitialValueSources,
} from '../../src/uni_modules/lucky-ui/components/lk-form/form.validation';
import {
  captureFormItemInitialValues,
  restoreFormItemInitialValues,
  validateRegisteredFormFields,
  type FormValidateStatus,
} from '../../src/uni_modules/lucky-ui/components/lk-form/form.utils';

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>(nextResolve => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

function createForm(options: {
  model: Record<string, unknown>;
  rules?: Record<string, FormRule | FormRule[]>;
  customValidator?: FormContext['customValidator'];
}): FormContext {
  return {
    model: options.model,
    rules: options.rules,
    customValidator: options.customValidator,
    showMessage: true,
    disabled: false,
    addField: vi.fn(),
    removeField: vi.fn(),
    invalidateValidation: vi.fn(),
    validateField: vi.fn(),
    emitFieldBlur: vi.fn(),
    emitFieldChange: vi.fn(),
    validate: vi.fn(),
    resetFields: vi.fn(),
    clearValidate: vi.fn(),
    scrollToField: vi.fn(),
  };
}

function createController(
  form: FormContext,
  prop: string | string[] = 'title',
  onState?: (status: FormValidateStatus, message: string) => void
) {
  let status: FormValidateStatus = 'idle';
  let message = '';
  const setState = vi.fn((nextStatus: FormValidateStatus, nextMessage: string) => {
    status = nextStatus;
    message = nextMessage;
    onState?.(nextStatus, nextMessage);
  });
  const controller = createFormItemValidationController({
    getForm: () => form,
    getProp: () => prop,
    getStatus: () => status,
    getMessage: () => message,
    setState,
    fallbackMessage: () => 'Invalid',
  });
  return {
    controller,
    setState,
    getStatus: () => status,
    getMessage: () => message,
  };
}

describe('form item validation generations', () => {
  it.each([
    {
      label: 'a pass / b fail',
      aValid: true,
      bValid: false,
      expected: [
        { prop: 'a', ok: true, errorFields: [] },
        { prop: 'b', ok: false, errorFields: ['b'] },
      ],
    },
    {
      label: 'a fail / b pass',
      aValid: false,
      bValid: true,
      expected: [
        { prop: 'a', ok: false, errorFields: ['a'] },
        { prop: 'b', ok: true, errorFields: [] },
      ],
    },
    {
      label: 'a fail / b fail',
      aValid: false,
      bValid: false,
      expected: [
        { prop: 'a', ok: false, errorFields: ['a'] },
        { prop: 'b', ok: false, errorFields: ['b'] },
      ],
    },
  ])('validates every grouped prop and reports exact results: $label', async testCase => {
    const validateA = vi.fn(async () => testCase.aValid);
    const validateB = vi.fn(async () => testCase.bValid);
    const form = createForm({
      model: { a: 'a', b: 'b' },
      rules: {
        a: { message: 'A invalid', validator: validateA },
        b: { message: 'B invalid', validator: validateB },
      },
    });
    const state = createController(form, ['a', 'b']);
    const field: FormItemContext = {
      prop: ['a', 'b'],
      setValidateStatus: vi.fn(),
      beginValidation: state.controller.begin,
      isValidationCurrent: state.controller.isCurrent,
      captureValidationGeneration: state.controller.captureGeneration,
      commitValidation: state.controller.commitGeneration,
      rollbackValidation: state.controller.rollbackGeneration,
      releaseValidation: state.controller.releaseGeneration,
      getValidationProps: state.controller.getValidationProps,
      invalidateValidation: state.controller.invalidate,
      validate: state.controller.validate,
      validateGeneration: state.controller.validateGeneration,
      reset: vi.fn(),
    };
    const result = await validateRegisteredFormFields({
      fields: [field],
      model: form.model,
    });

    expect(result.errors.map(error => error.field)).toEqual(
      testCase.expected.filter(item => !item.ok).map(item => item.prop)
    );
    expect(
      result.reports.map(({ prop, ok, errors }) => ({
        prop,
        ok,
        errorFields: (errors || []).map(error => error.field),
      }))
    ).toEqual(testCase.expected);
    expect(validateA).toHaveBeenCalledOnce();
    expect(validateB).toHaveBeenCalledOnce();
  });

  it('keeps a newer blur result when an older change result resolves last', async () => {
    const oldResult = deferred<boolean>();
    const newResult = deferred<boolean>();
    const model = { title: 'old' };
    const form = createForm({
      model,
      rules: {
        title: {
          message: 'Rejected',
          validator: value => (value === 'old' ? oldResult.promise : newResult.promise),
        },
      },
    });
    const state = createController(form);

    const oldValidation = state.controller.validate('change');
    model.title = 'new';
    const newValidation = state.controller.validate('blur');

    newResult.resolve(true);
    await expect(newValidation).resolves.toBe('validated');
    expect(state.getStatus()).toBe('success');

    oldResult.resolve(false);
    await expect(oldValidation).resolves.toBe('stale');
    expect(state.getStatus()).toBe('success');
    expect(state.getMessage()).toBe('');
  });

  it('stops before later rules when a pending rule is superseded', async () => {
    const firstResult = deferred<boolean>();
    const laterValidator = vi.fn(() => true);
    const form = createForm({
      model: { title: 'value' },
      rules: {
        title: [{ validator: () => firstResult.promise }, { validator: laterValidator }],
      },
    });
    const state = createController(form);

    const pending = state.controller.validate('change');
    state.controller.invalidate(true);
    firstResult.resolve(true);

    await expect(pending).resolves.toBe('stale');
    expect(laterValidator).not.toHaveBeenCalled();
    expect(state.getStatus()).toBe('idle');
  });

  it('returns the generation owned before a validating-state observer starts a newer run', async () => {
    const oldResult = deferred<boolean>();
    const newResult = deferred<boolean>();
    let nestedValidation: Promise<'validated' | 'skipped' | 'stale'> | undefined;
    let validationCall = 0;
    const form = createForm({
      model: { title: 'value' },
      rules: {
        title: {
          validator: () => {
            validationCall += 1;
            return validationCall === 1 ? oldResult.promise : newResult.promise;
          },
        },
      },
    });
    const state = createController(form, 'title', status => {
      if (status !== 'validating' || nestedValidation) return;
      nestedValidation = Promise.resolve('skipped');
      validationCall += 1;
      nestedValidation = state.controller.validate();
    });

    const oldValidation = state.controller.validate();
    newResult.resolve(true);
    await expect(nestedValidation).resolves.toBe('validated');
    oldResult.resolve(false);

    await expect(oldValidation).resolves.toBe('stale');
    expect(state.getStatus()).toBe('success');
    expect(state.getMessage()).toBe('');
  });

  it('rolls back only the stale commit when a synchronous state observer invalidates it', async () => {
    let shouldInvalidate = false;
    const form = createForm({
      model: { title: 'valid' },
      rules: { title: { validator: () => true } },
    });
    const state = createController(form, 'title', status => {
      if (status === 'success' && shouldInvalidate) state.controller.invalidate();
    });
    shouldInvalidate = true;

    await expect(state.controller.validate()).resolves.toBe('stale');
    expect(state.getStatus()).toBe('idle');
    expect(state.getMessage()).toBe('');
  });

  it('sync success observer reentry inherits the pre-commit idle lineage', async () => {
    const nestedRule = deferred<boolean>();
    let nested: Promise<'validated' | 'skipped' | 'stale'> | undefined;
    let calls = 0;
    const form = createForm({
      model: { title: 'value' },
      rules: {
        title: {
          validator: () => {
            calls += 1;
            return calls === 1 ? true : nestedRule.promise;
          },
        },
      },
    });
    const state = createController(form, 'title', status => {
      if (status !== 'success' || nested) return;
      nested = state.controller.validate();
      state.controller.invalidate(true);
    });

    await expect(state.controller.validate()).resolves.toBe('stale');
    nestedRule.resolve(true);
    await expect(nested).resolves.toBe('stale');

    expect(state.getStatus()).toBe('idle');
    expect(state.getMessage()).toBe('');
  });

  it('keeps a newer custom-validator success when an older error resolves last', async () => {
    const oldResult = deferred<Record<string, string> | null>();
    const newResult = deferred<Record<string, string> | null>();
    const model = { title: 'old' };
    const form = createForm({
      model,
      customValidator: currentModel => {
        return currentModel.title === 'old' ? oldResult.promise : newResult.promise;
      },
    });
    const state = createController(form);

    const oldValidation = state.controller.validate('change');
    model.title = 'new';
    const newValidation = state.controller.validate('change');
    newResult.resolve(null);
    await expect(newValidation).resolves.toBe('validated');

    oldResult.resolve({ title: 'Old error' });
    await expect(oldValidation).resolves.toBe('stale');
    expect(state.getStatus()).toBe('success');
    expect(state.getMessage()).toBe('');
  });

  it('clears only still-current custom fields when a direct item validation supersedes the form run', async () => {
    const oldFormResult = deferred<Record<string, string> | null>();
    let validationCall = 0;
    const form = createForm({
      model: { a: 'a', b: 'b' },
      customValidator: () => {
        validationCall += 1;
        return validationCall === 1 ? oldFormResult.promise : null;
      },
    });
    const a = createController(form, 'a');
    const b = createController(form, 'b');
    const makeField = (
      prop: string,
      state: ReturnType<typeof createController>
    ): FormItemContext => ({
      prop,
      setValidateStatus(nextStatus, message) {
        state.setState(nextStatus, message || '');
      },
      beginValidation: state.controller.begin,
      isValidationCurrent: state.controller.isCurrent,
      captureValidationGeneration: state.controller.captureGeneration,
      commitValidation: state.controller.commitGeneration,
      rollbackValidation: state.controller.rollbackGeneration,
      releaseValidation: state.controller.releaseGeneration,
      getValidationProps: state.controller.getValidationProps,
      invalidateValidation: state.controller.invalidate,
      validate: state.controller.validate,
      validateGeneration: state.controller.validateGeneration,
      reset: vi.fn(),
    });
    const aField = makeField('a', a);
    const bField = makeField('b', b);
    const oldFormValidation = validateRegisteredFormFields({
      fields: [aField, bField],
      model: form.model,
      customValidator: form.customValidator,
    });
    expect(a.getStatus()).toBe('idle');
    expect(b.getStatus()).toBe('idle');
    expect(a.setState).not.toHaveBeenCalled();
    expect(b.setState).not.toHaveBeenCalled();

    await expect(a.controller.validate()).resolves.toBe('validated');
    expect(a.getStatus()).toBe('success');
    oldFormResult.resolve({ a: 'Old A error', b: 'Old B error' });

    const error = await oldFormValidation.catch(reason => reason);
    expect(error).toMatchObject({ code: 'FORM_VALIDATION_SUPERSEDED' });
    expect(a.getStatus()).toBe('success');
    expect(a.getMessage()).toBe('');
    expect(b.getStatus()).toBe('idle');
    expect(b.getMessage()).toBe('');
  });

  it('does not let an older form-wide custom begin supersede a newer direct field run', async () => {
    const oldAResult = deferred<Record<string, string> | null>();
    let validationCall = 0;
    const form = createForm({
      model: { a: 'a', b: 'b' },
      customValidator: () => {
        validationCall += 1;
        return validationCall === 1 ? oldAResult.promise : null;
      },
    });
    let directB: Promise<'validated' | 'skipped' | 'stale'> | undefined;
    let armDirectB = false;
    const b = createController(form, 'b');
    const a = createController(form, 'a', status => {
      if (armDirectB && status === 'idle' && !directB) directB = b.controller.validate();
    });
    const makeField = (
      prop: string,
      state: ReturnType<typeof createController>
    ): FormItemContext => ({
      prop,
      setValidateStatus: state.controller.setStatus,
      beginValidation: state.controller.begin,
      isValidationCurrent: state.controller.isCurrent,
      captureValidationGeneration: state.controller.captureGeneration,
      commitValidation: state.controller.commitGeneration,
      rollbackValidation: state.controller.rollbackGeneration,
      releaseValidation: state.controller.releaseGeneration,
      getValidationProps: state.controller.getValidationProps,
      invalidateValidation: state.controller.invalidate,
      validate: state.controller.validate,
      validateGeneration: state.controller.validateGeneration,
      reset: vi.fn(),
    });
    const oldDirectA = a.controller.validate();
    armDirectB = true;

    const formWide = validateRegisteredFormFields({
      fields: [makeField('a', a), makeField('b', b)],
      model: form.model,
      customValidator: form.customValidator,
    });

    await expect(formWide).rejects.toMatchObject({ code: 'FORM_VALIDATION_SUPERSEDED' });
    await expect(directB).resolves.toBe('validated');
    oldAResult.resolve(null);
    await expect(oldDirectA).resolves.toBe('stale');
    expect(a.getStatus()).toBe('idle');
    expect(b.getStatus()).toBe('success');
  });

  it('rejects a stale silent custom result after a direct item validation starts', async () => {
    const oldSilentResult = deferred<Record<string, string> | null>();
    let validationCall = 0;
    const form = createForm({
      model: { title: 'current' },
      customValidator: () => {
        validationCall += 1;
        return validationCall === 1 ? oldSilentResult.promise : null;
      },
    });
    const state = createController(form);
    const field: FormItemContext = {
      prop: 'title',
      setValidateStatus(nextStatus, message) {
        state.setState(nextStatus, message || '');
      },
      beginValidation: state.controller.begin,
      isValidationCurrent: state.controller.isCurrent,
      captureValidationGeneration: state.controller.captureGeneration,
      commitValidation: state.controller.commitGeneration,
      rollbackValidation: state.controller.rollbackGeneration,
      releaseValidation: state.controller.releaseGeneration,
      getValidationProps: state.controller.getValidationProps,
      invalidateValidation: state.controller.invalidate,
      validate: state.controller.validate,
      validateGeneration: state.controller.validateGeneration,
      reset: vi.fn(),
    };
    const oldSilentValidation = validateRegisteredFormFields({
      fields: [field],
      model: form.model,
      customValidator: form.customValidator,
      validateOptions: { silent: true },
    });
    expect(state.getStatus()).toBe('idle');
    expect(state.setState).not.toHaveBeenCalled();

    await expect(state.controller.validate()).resolves.toBe('validated');
    expect(state.getStatus()).toBe('success');
    oldSilentResult.resolve({ title: 'Old silent error' });

    const error = await oldSilentValidation.catch(reason => reason);
    expect(error).toMatchObject({ code: 'FORM_VALIDATION_SUPERSEDED' });
    expect(state.getStatus()).toBe('success');
    expect(state.getMessage()).toBe('');
  });

  it('does not restore a pending error after reset or disable invalidates it', async () => {
    const firstResult = deferred<Record<string, string> | null>();
    const secondResult = deferred<Record<string, string> | null>();
    const model = { title: 'initial' };
    let activeResult = firstResult;
    const form = createForm({ model, customValidator: () => activeResult.promise });
    const state = createController(form);

    model.title = 'edited';
    const beforeReset = state.controller.validate('change');
    state.controller.invalidate(true);
    model.title = 'initial';
    firstResult.resolve({ title: 'Reset old error' });
    await expect(beforeReset).resolves.toBe('stale');
    expect(state.getStatus()).toBe('idle');

    activeResult = secondResult;
    const beforeDisable = state.controller.validate('change');
    form.disabled = true;
    state.controller.invalidate(true);
    secondResult.resolve({ title: 'Disabled old error' });
    await expect(beforeDisable).resolves.toBe('stale');
    expect(state.getStatus()).toBe('idle');
  });

  it('validates only the silent field subset without changing visible state', async () => {
    const titleValidator = vi.fn(async () => false);
    const notesValidator = vi.fn(async () => false);
    const form = createForm({
      model: { title: '', notes: '' },
      rules: {
        title: { message: 'Title required', validator: titleValidator },
        notes: { message: 'Notes required', validator: notesValidator },
      },
    });
    const state = createController(form, ['title', 'notes']);

    await expect(
      state.controller.validate(undefined, { fields: ['title'], silent: true })
    ).rejects.toEqual([expect.objectContaining({ field: 'title', message: 'Title required' })]);
    expect(titleValidator).toHaveBeenCalledOnce();
    expect(notesValidator).not.toHaveBeenCalled();
    expect(state.setState).not.toHaveBeenCalled();
    expect(state.getStatus()).toBe('idle');
  });

  it('marks a silent result stale when form state changes while it is pending', async () => {
    const result = deferred<boolean>();
    const form = createForm({
      model: { title: 'old' },
      rules: { title: { validator: () => result.promise } },
    });
    const state = createController(form);

    const pending = state.controller.validate(undefined, { silent: true });
    state.controller.invalidate();
    result.resolve(false);

    await expect(pending).resolves.toBe('stale');
    expect(state.setState).not.toHaveBeenCalled();
  });

  it('lets a newer silent run supersede a pending stateful run without changing stable UI', async () => {
    const oldResult = deferred<boolean>();
    const newResult = deferred<boolean>();
    let call = 0;
    const form = createForm({
      model: { title: 'current' },
      rules: {
        title: {
          validator: () => {
            call += 1;
            return call === 1 ? oldResult.promise : newResult.promise;
          },
        },
      },
    });
    const state = createController(form);

    state.controller.setStatus('error', 'stable error');
    const oldValidation = state.controller.validate();
    expect(state.getStatus()).toBe('validating');
    const silentValidation = state.controller.validate(undefined, { silent: true });
    expect(state.getStatus()).toBe('error');
    expect(state.getMessage()).toBe('stable error');

    newResult.resolve(true);
    await expect(silentValidation).resolves.toBe('validated');
    oldResult.resolve(false);
    await expect(oldValidation).resolves.toBe('stale');
    expect(state.getStatus()).toBe('error');
    expect(state.getMessage()).toBe('stable error');
  });

  it('rebuilds the reset snapshot synchronously for model and prop identity changes', () => {
    const model = ref<Record<string, unknown>>({ title: 'first' });
    const prop = ref<string | string[] | undefined>('title');
    let initialValues = captureFormItemInitialValues(model.value, prop.value);
    const rebuild = () => {
      initialValues = captureFormItemInitialValues(model.value, prop.value);
    };
    const scope = effectScope();
    scope.run(() => {
      watchFormItemInitialValueSources({
        model: () => model.value,
        prop: () => prop.value,
        rebuild,
      });
    });

    model.value = { notes: 'next baseline' };
    prop.value = 'notes';
    model.value.notes = 'edited after identity switch';
    restoreFormItemInitialValues(model.value, initialValues, ['notes']);

    expect(model.value).toEqual({ notes: 'next baseline' });
    scope.stop();
  });
});
