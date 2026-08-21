import type { CSSProperties } from 'vue';
import type {
  FormItemContext,
  FormRule,
  FormRules,
  FormValidateOptions,
  ValidateError,
} from './context';
import { FormValidationSupersededError } from './context';

export type FormValidateTrigger = 'blur' | 'change';
export type FormValidateStatus = 'idle' | 'validating' | 'success' | 'error';

export function normalizeFormRules(rule?: FormRule | FormRule[]): FormRule[] {
  if (!rule) return [];
  return Array.isArray(rule) ? rule : [rule];
}

export function getFormFieldRules(
  rules: FormRules | undefined,
  prop?: string | string[]
): FormRule[] {
  if (!prop || !rules) return [];
  const props = Array.isArray(prop) ? prop : [prop];
  const result: FormRule[] = [];
  props.forEach(p => {
    if (rules[p]) {
      result.push(...normalizeFormRules(rules[p]));
    }
  });
  return result;
}

export function filterFormRulesByTrigger(
  rules: FormRule[],
  trigger?: FormValidateTrigger
): FormRule[] {
  if (!trigger) return rules;
  return rules.filter(rule => {
    if (!rule.trigger) return true;
    const triggers = Array.isArray(rule.trigger) ? rule.trigger : [rule.trigger];
    return triggers.includes(trigger);
  });
}

export function isEmptyFormValue(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'number' && Number.isNaN(value))
  );
}

export async function validateFormValue(options: {
  field: string;
  value: unknown;
  rules: FormRule[];
  model?: Record<string, unknown>;
  fallbackMessage: string;
  isCurrent?: () => boolean;
}): Promise<ValidateError[] | null> {
  const errors: ValidateError[] = [];

  for (const rule of options.rules) {
    if (options.isCurrent?.() === false) return null;
    const message = rule.message || options.fallbackMessage;

    if (rule.required && isEmptyFormValue(options.value)) {
      errors.push({ field: options.field, message, rule });
      continue;
    }

    if (rule.min != null && typeof options.value === 'string' && options.value.length < rule.min) {
      errors.push({ field: options.field, message, rule });
      continue;
    }

    if (rule.max != null && typeof options.value === 'string' && options.value.length > rule.max) {
      errors.push({ field: options.field, message, rule });
      continue;
    }

    if (rule.min != null && typeof options.value === 'number' && options.value < rule.min) {
      errors.push({ field: options.field, message, rule });
      continue;
    }

    if (rule.max != null && typeof options.value === 'number' && options.value > rule.max) {
      errors.push({ field: options.field, message, rule });
      continue;
    }

    if (rule.pattern && typeof options.value === 'string') {
      rule.pattern.lastIndex = 0;
      if (!rule.pattern.test(options.value)) {
        errors.push({ field: options.field, message, rule });
        continue;
      }
    }

    if (rule.validator) {
      try {
        const result = await rule.validator(options.value, rule, options.model);
        if (options.isCurrent?.() === false) return null;
        if (result === false) {
          errors.push({ field: options.field, message, rule });
        } else if (typeof result === 'string') {
          errors.push({ field: options.field, message: result, rule });
        }
      } catch (error: unknown) {
        if (options.isCurrent?.() === false) return null;
        const errorMessage = error instanceof Error ? error.message : message;
        errors.push({ field: options.field, message: errorMessage || message, rule });
      }
    }
  }

  return errors;
}

export function normalizeValidateErrors(error: unknown): ValidateError[] {
  if (!error) return [];
  return Array.isArray(error) ? (error as ValidateError[]) : [error as ValidateError];
}

export function resolveTargetFormFields(
  fields: FormItemContext[],
  names?: string[]
): FormItemContext[] {
  if (!names?.length) return fields;
  return fields.filter(field => {
    if (!field.prop) return false;
    if (Array.isArray(field.prop)) {
      return field.prop.some(p => names.includes(p));
    }
    return names.includes(field.prop);
  });
}

export function resolveFormItemProps(prop?: string | string[], names?: string[]): string[] {
  const props = (Array.isArray(prop) ? prop : [prop]).filter(
    (item): item is string => typeof item === 'string' && item.length > 0
  );
  const uniqueProps = Array.from(new Set(props));
  if (!names?.length) return uniqueProps;
  return uniqueProps.filter(item => names.includes(item));
}

export function resolveFormControlProp(
  controlProp?: string,
  itemProp?: string | string[]
): string | undefined {
  if (controlProp) return controlProp;
  const itemProps = resolveFormItemProps(itemProp);
  return itemProps.length === 1 ? itemProps[0] : undefined;
}

export interface FormItemInitialValue {
  exists: boolean;
  value: unknown;
}

export type FormItemInitialValues = Map<string, FormItemInitialValue>;

export function cloneFormValue<T>(value: T, seen = new WeakMap<object, unknown>()): T {
  if (value === null || typeof value !== 'object') return value;

  const cached = seen.get(value);
  if (cached !== undefined) return cached as T;

  if (value instanceof Date) return new Date(value.getTime()) as T;
  if (value instanceof RegExp) return new RegExp(value.source, value.flags) as T;

  if (Array.isArray(value)) {
    const result = new Array(value.length) as unknown[];
    seen.set(value, result);
    for (let index = 0; index < value.length; index += 1) {
      if (index in value) result[index] = cloneFormValue(value[index], seen);
    }
    return result as T;
  }

  if (value instanceof Map) {
    const result = new Map<unknown, unknown>();
    seen.set(value, result);
    value.forEach((entryValue, entryKey) => {
      result.set(cloneFormValue(entryKey, seen), cloneFormValue(entryValue, seen));
    });
    return result as T;
  }

  if (value instanceof Set) {
    const result = new Set<unknown>();
    seen.set(value, result);
    value.forEach(entryValue => result.add(cloneFormValue(entryValue, seen)));
    return result as T;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return value;

  const result = Object.create(prototype) as Record<string, unknown>;
  seen.set(value, result);
  Object.keys(value).forEach(key => {
    result[key] = cloneFormValue((value as Record<string, unknown>)[key], seen);
  });
  return result as T;
}

export function captureFormItemInitialValues(
  model: Record<string, unknown>,
  prop?: string | string[]
): FormItemInitialValues {
  const result: FormItemInitialValues = new Map();
  resolveFormItemProps(prop).forEach(field => {
    result.set(field, {
      exists: Object.prototype.hasOwnProperty.call(model, field),
      value: cloneFormValue(model[field]),
    });
  });
  return result;
}

export function restoreFormItemInitialValues(
  model: Record<string, unknown>,
  initialValues: FormItemInitialValues,
  names?: string[]
) {
  initialValues.forEach((initial, field) => {
    if (names?.length && !names.includes(field)) return;
    if (initial.exists) {
      model[field] = cloneFormValue(initial.value);
    } else {
      delete model[field];
    }
  });
}

export interface RegisteredFormValidationResult {
  errors: ValidateError[];
  stale: boolean;
  reports: Array<{
    prop: string;
    ok: boolean;
    errors: ValidateError[] | null;
  }>;
  /** Restore only commits that are still owned by this validation run. */
  rollback: () => void;
  /** Discard rollback snapshots after all public observers accepted the run. */
  release: () => void;
  /** Verify that every target reservation and external form state still belongs to this run. */
  isCurrent: () => boolean;
}

export async function validateRegisteredFormFields(options: {
  fields: FormItemContext[];
  model: Record<string, unknown>;
  customValidator?: (
    model: Record<string, unknown>
  ) => Record<string, string> | null | Promise<Record<string, string> | null>;
  validateOptions?: FormValidateOptions;
  isCurrent?: () => boolean;
}): Promise<RegisteredFormValidationResult> {
  const names = options.validateOptions?.fields;
  const silent = options.validateOptions?.silent === true;
  const target = resolveTargetFormFields(options.fields, names);
  const createResult = (
    errors: ValidateError[],
    reports: RegisteredFormValidationResult['reports'],
    rollback: () => void,
    release: () => void,
    isCurrent: () => boolean
  ): RegisteredFormValidationResult => {
    const result = { errors, stale: false } as RegisteredFormValidationResult;
    Object.defineProperties(result, {
      reports: { value: reports },
      rollback: { value: rollback },
      release: { value: release },
      isCurrent: { value: isCurrent },
    });
    return result;
  };
  const emptyResult = () =>
    createResult(
      [],
      [],
      () => undefined,
      () => undefined,
      () => true
    );
  if (!target.length) return emptyResult();
  const reports: Array<{
    prop: string;
    ok: boolean;
    errors: ValidateError[] | null;
  }> = [];
  const candidates = target
    .map(field => ({
      field,
      props: options.customValidator
        ? resolveFormItemProps(field.prop, names)
        : field.getValidationProps(undefined, names),
    }))
    .filter(entry => entry.props.length > 0);
  if (!candidates.length) return emptyResult();
  const baselineGenerations = new Map(
    candidates.map(candidate => [candidate.field, candidate.field.captureValidationGeneration()])
  );
  const startedGenerations = new Map<FormItemContext, number>();
  const entries: Array<
    (typeof candidates)[number] & {
      generation: number;
      errors: ValidateError[];
    }
  > = [];
  const errors: ValidateError[] = [];
  const commitTokens = new Map<FormItemContext, number>();
  const isCurrent = () =>
    (!options.isCurrent || options.isCurrent()) &&
    candidates.every(candidate =>
      candidate.field.isValidationCurrent(
        startedGenerations.get(candidate.field) ??
          (baselineGenerations.get(candidate.field) as number)
      )
    );
  let ownershipClosed = false;
  const rollback = () => {
    if (ownershipClosed) return;
    ownershipClosed = true;
    entries.forEach(entry => {
      const commitToken = commitTokens.get(entry.field);
      if (commitToken !== undefined) {
        entry.field.rollbackValidation(entry.generation, commitToken);
      }
    });
  };
  const release = () => {
    if (ownershipClosed) return;
    ownershipClosed = true;
    entries.forEach(entry => {
      const commitToken = commitTokens.get(entry.field);
      if (commitToken !== undefined) entry.field.releaseValidation(commitToken);
    });
  };
  const superseded = (): never => {
    rollback();
    throw new FormValidationSupersededError();
  };

  // Reserve every target before any validator starts. Reservations are silent, so a
  // form-wide run cannot expose partially validating state while another field is pending.
  for (const candidate of candidates) {
    if (!isCurrent()) superseded();
    const generation = candidate.field.beginValidation(true);
    startedGenerations.set(candidate.field, generation);
    entries.push({ ...candidate, generation, errors: [] });
    if (!isCurrent()) superseded();
  }

  if (options.customValidator) {
    let errorMap: Record<string, string>;
    let validatorError: string | undefined;
    try {
      errorMap = (await options.customValidator(options.model)) || {};
    } catch (error) {
      errorMap = {};
      validatorError = error instanceof Error ? error.message : String(error);
    }
    if (!isCurrent()) superseded();
    entries.forEach(entry => {
      entry.errors = validatorError
        ? [{ field: entry.props[0], message: validatorError }]
        : entry.props
            .filter(prop => !!errorMap[prop])
            .map(prop => ({ field: prop, message: errorMap[prop] }));
      errors.push(...entry.errors);
    });
  } else {
    for (const entry of entries) {
      if (!isCurrent()) superseded();
      try {
        const result = await entry.field.validateGeneration(entry.generation, undefined, {
          silent: true,
          fields: names,
        });
        if (result === 'stale') superseded();
      } catch (error: unknown) {
        if (error instanceof FormValidationSupersededError) throw error;
        entry.errors = normalizeValidateErrors(error);
        errors.push(...entry.errors);
      }
      if (!isCurrent()) superseded();
    }
  }

  if (!silent) {
    for (const entry of entries) {
      const commitToken = isCurrent()
        ? entry.field.commitValidation(entry.generation, entry.errors)
        : undefined;
      if (commitToken === undefined) return superseded();
      commitTokens.set(entry.field, commitToken);
      if (!isCurrent()) superseded();
      entry.props.forEach(prop => {
        const matchedErrors = entry.errors.filter(error => error.field === prop);
        reports.push({
          prop,
          ok: matchedErrors.length === 0,
          errors: matchedErrors.length ? matchedErrors : null,
        });
      });
    }
    if (!isCurrent()) superseded();
  }
  return createResult(errors, reports, rollback, release, isCurrent);
}

export function resolveFormClass(options: {
  border: boolean;
  card: boolean;
  disabled: boolean;
  customClass: unknown;
}) {
  return [
    'lk-form',
    {
      'lk-form--border': options.border,
      'lk-form--card': options.card,
      'is-disabled': options.disabled,
    },
    options.customClass,
  ];
}

export function resolveFormItemLabelStyle(width?: string | number): CSSProperties {
  if (!width) return {};
  return { width: typeof width === 'number' ? `${width}rpx` : width };
}

export function resolveFormItemRequired(options: {
  explicitRequired?: boolean;
  rules: FormRule[];
}): boolean {
  if (options.explicitRequired !== undefined) return options.explicitRequired;
  return options.rules.some(rule => rule.required);
}

export function resolveFormItemClass(options: {
  customClass: unknown;
  status: FormValidateStatus;
  labelAlign: string;
  topLayout: boolean;
  border?: boolean;
  link: boolean;
}) {
  return [
    options.customClass,
    `is-${options.status}`,
    `lk-form-item--${options.labelAlign}`,
    {
      'lk-form-item--top': options.topLayout,
      'lk-form-item--border': options.border,
      'lk-form-item--link': options.link,
    },
  ];
}
