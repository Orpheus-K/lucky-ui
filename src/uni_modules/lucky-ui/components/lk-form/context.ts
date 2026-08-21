import type { InjectionKey, Ref } from 'vue';

export interface ValidateError {
  field: string;
  message: string;
  rule?: unknown;
}

export type RuleValidator = (
  value: unknown,
  rule: FormRule,
  model?: Record<string, unknown>
) => boolean | string | Promise<boolean | string>;

export interface FormRule {
  required?: boolean;
  message?: string;
  trigger?: 'blur' | 'change' | Array<'blur' | 'change'>;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: RuleValidator;
  // 允许额外自定义扩展字段
  [k: string]: unknown;
}

export type FormRules = Record<string, FormRule | FormRule[]>;

export interface FormValidateOptions {
  silent?: boolean;
  fields?: string[];
}

export interface FormItemValidateOptions {
  silent?: boolean;
  fields?: string[];
  /** Internal owner predicate for automatic validation started by a control interaction. */
  isCurrent?: () => boolean;
}

export type FormItemValidationResult = 'validated' | 'skipped' | 'stale';

export const FORM_VALIDATION_SUPERSEDED = 'FORM_VALIDATION_SUPERSEDED';

export class FormValidationSupersededError extends Error {
  readonly code = FORM_VALIDATION_SUPERSEDED;

  constructor() {
    super('Form validation was superseded by a newer form state');
    this.name = 'FormValidationSupersededError';
  }
}

export function isFormValidationSupersededError(
  error: unknown
): error is FormValidationSupersededError {
  return (
    error instanceof FormValidationSupersededError ||
    (typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === FORM_VALIDATION_SUPERSEDED)
  );
}

export interface FormContext {
  model: Record<string, unknown>;
  rules: FormRules | undefined;
  labelWidth?: string | number;
  /** 继承自表单的标签对齐方式 */
  labelAlign?: string;
  showMessage: boolean;
  disabled: boolean;
  border?: boolean;
  card?: boolean;
  customValidator?: (
    model: Record<string, unknown>
  ) => Record<string, string> | null | Promise<Record<string, string> | null>;
  asteriskPosition?: 'left' | 'right';
  addField: (field: FormItemContext) => void;
  removeField: (field: FormItemContext) => void;
  /** Supersede pending validation for a field subset, or all fields when omitted. */
  invalidateValidation: (fields?: string[]) => void;
  validateField: (prop: string) => Promise<void>;
  emitFieldBlur: (prop: string, owner?: FormFieldInteractionOwner) => Promise<void>;
  /** value 为可选，供需要做业务拦截的场景使用 */
  emitFieldChange: (
    prop: string,
    value?: unknown,
    owner?: FormFieldInteractionOwner
  ) => Promise<void>;
  validate: (opts?: FormValidateOptions) => Promise<void>;
  resetFields: (fields?: string[]) => void;
  /** 仅清除验证状态，不重置字段值 */
  clearValidate: (fields?: string[]) => void;
  /** 滚动到指定字段 */
  scrollToField: (prop: string) => void;
}

/** Keeps automatic validation owned by the control interaction that proposed it. */
export interface FormFieldInteractionOwner {
  isCurrent: () => boolean;
  awaitCurrent: () => Promise<boolean>;
}

export interface FormItemContext {
  prop?: string | string[];
  validateStatus?: Readonly<Ref<'idle' | 'validating' | 'success' | 'error'>>;
  getBoundingClientRect?: () => Promise<{ top?: number; height?: number } | null>;
  setValidateStatus: (
    status: 'idle' | 'validating' | 'success' | 'error',
    message?: string
  ) => void;
  /** Reserve a validation generation; silent reservations preserve stable visible state. */
  beginValidation: (silent?: boolean) => number;
  /** Test whether a stateful validation generation may still commit. */
  isValidationCurrent: (generation: number) => boolean;
  /** Capture the current generation without changing visible state. */
  captureValidationGeneration: () => number;
  /** Commit a generation after checking for synchronous supersession. */
  commitValidation: (generation: number, errors: ValidateError[]) => number | undefined;
  /** Clear state owned by a still-current superseded generation. */
  rollbackValidation: (generation: number, commitToken?: number) => void;
  /** Release rollback metadata after all external observers accepted a commit. */
  releaseValidation: (commitToken: number) => void;
  /** Resolve the concrete props that have rules for this validation request. */
  getValidationProps: (trigger?: 'blur' | 'change', fields?: string[]) => string[];
  /** Supersede pending validation, optionally clearing a visible validating state. */
  invalidateValidation: (clearPending?: boolean) => void;
  validate: (
    trigger?: 'blur' | 'change',
    options?: FormItemValidateOptions
  ) => Promise<FormItemValidationResult>;
  /** Execute a generation already reserved by a form-wide atomic validation. */
  validateGeneration: (
    generation: number,
    trigger?: 'blur' | 'change',
    options?: FormItemValidateOptions
  ) => Promise<FormItemValidationResult>;
  reset: (fields?: string[]) => void;
}

export const formContextKey: InjectionKey<FormContext> = Symbol('LkFormContext');
export const formItemContextKey: InjectionKey<FormItemContext | null> = Symbol('LkFormItemContext');
