import type { CSSProperties } from 'vue';
import type { FormItemContext, FormRule, FormRules, ValidateError } from './context';

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
}): Promise<ValidateError[]> {
  const errors: ValidateError[] = [];

  for (const rule of options.rules) {
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
        if (result === false) {
          errors.push({ field: options.field, message, rule });
        } else if (typeof result === 'string') {
          errors.push({ field: options.field, message: result, rule });
        }
      } catch (error: unknown) {
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

export function resolveFormClass(options: {
  border: boolean;
  card: boolean;
  customClass: unknown;
}) {
  return [
    'lk-form',
    {
      'lk-form--border': options.border,
      'lk-form--card': options.card,
    },
    options.customClass,
  ];
}

export function resolveFormItemResetValue(value: unknown): unknown {
  if (Array.isArray(value)) return [];
  if (typeof value === 'boolean') return false;
  if (typeof value === 'number') return 0;
  if (value === null || value === undefined) return null;
  return '';
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
