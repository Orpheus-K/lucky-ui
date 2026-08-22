import { watch, type WatchSource, type WatchStopHandle } from 'vue';
import type {
  FormContext,
  FormItemValidateOptions,
  FormItemValidationResult,
  ValidateError,
} from './context';
import {
  filterFormRulesByTrigger,
  getFormFieldRules,
  resolveFormItemProps,
  validateFormValue,
  type FormValidateStatus,
  type FormValidateTrigger,
} from './form.utils';

export function watchFormItemInitialValueSources(options: {
  model: WatchSource<Record<string, unknown> | undefined>;
  prop: WatchSource<string | string[] | undefined>;
  rebuild: () => void;
}): WatchStopHandle[] {
  return [
    watch(options.model, options.rebuild, { flush: 'sync' }),
    watch(options.prop, options.rebuild, { deep: true, flush: 'sync' }),
  ];
}

export interface FormItemValidationController {
  begin: (silent?: boolean) => number;
  isCurrent: (generation: number) => boolean;
  captureGeneration: () => number;
  commitGeneration: (generation: number, errors: ValidateError[]) => number | undefined;
  rollbackGeneration: (generation: number, commitToken?: number) => void;
  releaseGeneration: (commitToken: number) => void;
  setStatus: (status: FormValidateStatus, message?: string) => void;
  getValidationProps: (trigger?: FormValidateTrigger, fields?: string[]) => string[];
  invalidate: (clearPending?: boolean) => void;
  validate: (
    trigger?: FormValidateTrigger,
    options?: FormItemValidateOptions
  ) => Promise<FormItemValidationResult>;
  validateGeneration: (
    generation: number,
    trigger?: FormValidateTrigger,
    options?: FormItemValidateOptions
  ) => Promise<FormItemValidationResult>;
}

export function createFormItemValidationController(options: {
  getForm: () => FormContext | null;
  getProp: () => string | string[] | undefined;
  getStatus: () => FormValidateStatus;
  getMessage: () => string;
  setState: (status: FormValidateStatus, message: string) => void;
  fallbackMessage: () => string;
}): FormItemValidationController {
  let validationGeneration = 0;
  let stateRevision = 0;
  const pendingSnapshots = new Map<number, { status: FormValidateStatus; message: string }>();
  const commitSnapshots = new Map<number, { status: FormValidateStatus; message: string }>();

  function setStatus(status: FormValidateStatus, message = '') {
    stateRevision += 1;
    const revision = stateRevision;
    options.setState(status, message);
    return revision;
  }

  function getStableState() {
    const pending = pendingSnapshots.get(validationGeneration);
    if (options.getStatus() === 'validating' && pending) return pending;
    if (options.getStatus() === 'validating') return { status: 'idle' as const, message: '' };
    // A public validation observer may re-enter before the current commit is released.
    // Such a commit is still tentative, so descendants must inherit its accepted lineage
    // instead of treating the temporarily visible success/error as their rollback target.
    const tentative = commitSnapshots.get(stateRevision);
    if (tentative) return tentative;
    return { status: options.getStatus(), message: options.getMessage() };
  }

  function restoreState(snapshot: { status: FormValidateStatus; message: string }) {
    setStatus(snapshot.status, snapshot.message);
  }

  function begin(silent = false) {
    const previous = getStableState();
    const generation = ++validationGeneration;
    pendingSnapshots.clear();
    if (silent) {
      if (options.getStatus() === 'validating') restoreState(previous);
    } else {
      pendingSnapshots.set(generation, previous);
      setStatus('validating');
    }
    return generation;
  }

  function isCurrent(generation: number) {
    return generation === validationGeneration;
  }

  function captureGeneration() {
    return validationGeneration;
  }

  function getValidationProps(trigger?: FormValidateTrigger, fields?: string[]) {
    const form = options.getForm();
    if (!form) return [];
    const propsList = resolveFormItemProps(options.getProp(), fields);
    if (form.customValidator) return propsList;
    return propsList.filter(prop => {
      return filterFormRulesByTrigger(getFormFieldRules(form.rules, prop), trigger).length > 0;
    });
  }

  function invalidate(clearPending = false) {
    const previous = getStableState();
    validationGeneration += 1;
    pendingSnapshots.clear();
    if (clearPending && options.getStatus() === 'validating') {
      restoreState(previous);
    }
  }

  function commitGeneration(generation: number, errors: ValidateError[]) {
    if (!isCurrent(generation)) return undefined;
    const nextStatus = errors.length ? 'error' : 'success';
    const previous = pendingSnapshots.get(generation) || {
      status: options.getStatus(),
      message: options.getMessage(),
    };
    // Reserve the lineage before setState: a flush:'sync' observer may re-enter begin()
    // while the tentative success/error is being delivered.
    const expectedCommitToken = stateRevision + 1;
    commitSnapshots.set(expectedCommitToken, previous);
    const commitToken = setStatus(nextStatus, errors[0]?.message);
    if (isCurrent(generation) && stateRevision === commitToken) {
      pendingSnapshots.delete(generation);
      return commitToken;
    }

    // A synchronous state observer may mutate the model or start a newer validation.
    // Clear only the value this commit just wrote; never overwrite the newer validating state.
    commitSnapshots.delete(commitToken);
    if (stateRevision === commitToken && options.getStatus() === nextStatus) restoreState(previous);
    return undefined;
  }

  function rollbackGeneration(generation: number, commitToken?: number) {
    let previous: { status: FormValidateStatus; message: string } | undefined;
    if (commitToken !== undefined) {
      previous = commitSnapshots.get(commitToken);
      if (!previous) return;
      commitSnapshots.delete(commitToken);
      if (stateRevision !== commitToken) return;
    } else if (!isCurrent(generation)) {
      return;
    } else {
      previous = pendingSnapshots.get(generation);
    }
    if (commitToken === undefined) {
      validationGeneration += 1;
      pendingSnapshots.clear();
    }
    restoreState(previous || { status: 'idle', message: '' });
  }

  function releaseGeneration(commitToken: number) {
    commitSnapshots.delete(commitToken);
  }

  async function validateGeneration(
    generation: number,
    trigger?: FormValidateTrigger,
    validateOptions?: FormItemValidateOptions
  ): Promise<FormItemValidationResult> {
    const form = options.getForm();
    if (!form) return 'skipped';
    const propsList = resolveFormItemProps(options.getProp(), validateOptions?.fields);
    if (!propsList.length) return 'skipped';
    const silent = validateOptions?.silent === true;
    const ownsValidation = () => isCurrent(generation) && validateOptions?.isCurrent?.() !== false;
    if (!ownsValidation()) return 'stale';

    if (form.customValidator) {
      let errors: ValidateError[];
      try {
        const errorMap = (await form.customValidator(form.model)) || {};
        errors = propsList
          .filter(prop => !!errorMap[prop])
          .map(prop => ({ field: prop, message: errorMap[prop] }));
      } catch (error) {
        errors = [
          {
            field: propsList[0],
            message: error instanceof Error ? error.message : String(error),
          },
        ];
      }

      if (!ownsValidation()) return 'stale';
      if (!silent) {
        const commitToken = commitGeneration(generation, errors);
        if (commitToken === undefined) return 'stale';
        releaseGeneration(commitToken);
      }
      if (errors.length) return Promise.reject(errors);
      return 'validated';
    }

    const validationEntries = propsList.map(prop => ({
      prop,
      rules: filterFormRulesByTrigger(getFormFieldRules(form.rules, prop), trigger),
    }));
    const performed = validationEntries.some(entry => entry.rules.length > 0);
    if (!performed) return 'skipped';

    const validationErrors: ValidateError[] = [];
    for (const entry of validationEntries) {
      if (!entry.rules.length) continue;
      const errors = await validateFormValue({
        field: entry.prop,
        value: form.model[entry.prop],
        rules: entry.rules,
        model: form.model,
        fallbackMessage: options.fallbackMessage(),
        isCurrent: ownsValidation,
      });
      if (!errors || !ownsValidation()) return 'stale';
      validationErrors.push(...errors);
    }

    if (!silent) {
      const commitToken = commitGeneration(generation, validationErrors);
      if (commitToken === undefined) return 'stale';
      releaseGeneration(commitToken);
    }
    if (validationErrors.length) return Promise.reject(validationErrors);
    return 'validated';
  }

  async function validate(
    trigger?: FormValidateTrigger,
    validateOptions?: FormItemValidateOptions
  ): Promise<FormItemValidationResult> {
    const silent = validateOptions?.silent === true;
    const generation = begin(silent);
    const result = await validateGeneration(generation, trigger, validateOptions);
    if (result === 'skipped' && !silent && isCurrent(generation)) rollbackGeneration(generation);
    return result;
  }

  return {
    begin,
    isCurrent,
    captureGeneration,
    commitGeneration,
    rollbackGeneration,
    releaseGeneration,
    setStatus,
    getValidationProps,
    invalidate,
    validate,
    validateGeneration,
  };
}
