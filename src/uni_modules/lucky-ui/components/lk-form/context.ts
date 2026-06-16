import type { InjectionKey } from 'vue';

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

export interface FormContext {
  model: Record<string, unknown>;
  rules: FormRules | undefined;
  labelWidth?: string | number;
  /** 继承自表单的标签对齐方式 */
  labelAlign?: string;
  showMessage: boolean;
  border?: boolean;
  card?: boolean;
  customValidator?: (
    model: Record<string, unknown>
  ) => Record<string, string> | null | Promise<Record<string, string> | null>;
  asteriskPosition?: 'left' | 'right';
  addField: (field: FormItemContext) => void;
  removeField: (field: FormItemContext) => void;
  validateField: (prop: string) => Promise<void>;
  emitFieldBlur: (prop: string) => void;
  /** value 为可选，供需要做业务拦截的场景使用 */
  emitFieldChange: (prop: string, value?: unknown) => void;
  validate: (opts?: FormValidateOptions) => Promise<void>;
  resetFields: (fields?: string[]) => void;
  /** 仅清除验证状态，不重置字段值 */
  clearValidate: (fields?: string[]) => void;
  /** 滚动到指定字段 */
  scrollToField: (prop: string) => void;
}

export interface FormItemContext {
  prop?: string | string[];
  getBoundingClientRect?: () => Promise<{ top?: number; height?: number } | null>;
  setValidateStatus: (
    status: 'idle' | 'validating' | 'success' | 'error',
    message?: string
  ) => void;
  validate: (trigger?: 'blur' | 'change') => Promise<void>;
  reset: () => void;
}

export const formContextKey: InjectionKey<FormContext> = Symbol('LkFormContext');
export const formItemContextKey: InjectionKey<FormItemContext> = Symbol('LkFormItemContext');
