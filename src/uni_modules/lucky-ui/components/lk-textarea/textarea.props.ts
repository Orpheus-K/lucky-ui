import type { ExtractPropTypes } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const TextareaVariant = {
  Outline: 'outline',
  Filled: 'filled',
  Flush: 'flush',
} as const;

export const TextareaConfirmType = {
  Send: 'send',
  Search: 'search',
  Next: 'next',
  Go: 'go',
  Done: 'done',
  Return: 'return',
} as const;

export const TextareaInputMode = {
  None: 'none',
  Text: 'text',
  Decimal: 'decimal',
  Numeric: 'numeric',
  Tel: 'tel',
  Search: 'search',
  Email: 'email',
  Url: 'url',
} as const;

export type TextareaVariant = (typeof TextareaVariant)[keyof typeof TextareaVariant];
export type TextareaConfirmType = (typeof TextareaConfirmType)[keyof typeof TextareaConfirmType];
export type TextareaInputMode = (typeof TextareaInputMode)[keyof typeof TextareaInputMode];
export type TextareaEventPayload =
  | Event
  | {
      detail?: {
        value?: string;
        cursor?: number;
        height?: number;
        heightRpx?: number;
        duration?: number;
        lineCount?: number;
      };
      target?: {
        value?: string;
      };
    };

export const textareaProps = {
  ...baseProps,

  /** 绑定值 */
  modelValue: LkProp.string(''),

  /** 标签 */
  label: LkProp.string(''),

  /** 占位符 */
  placeholder: LkProp.string(''),

  /** 占位符样式 */
  placeholderStyle: LkProp.string(''),

  /** 占位符类名 */
  placeholderClass: LkProp.string('lk-textarea__placeholder'),

  /** 原生表单字段名 */
  name: LkProp.string(''),

  /**
   * 风格变体 outline | filled | flush
   * @default outline
   */
  variant: LkProp.enum(Object.values(TextareaVariant), TextareaVariant.Outline, 'Textarea.variant'),

  /** 是否禁用 */
  disabled: LkProp.boolean(false),

  /** 是否只读 */
  readonly: LkProp.boolean(false),

  /** 最大输入长度，-1 表示不限制 */
  maxlength: LkProp.number(-1),

  /** 是否自动增高 */
  autoHeight: LkProp.boolean(false),

  /** 是否显示字数统计 */
  showCount: LkProp.boolean(false),

  /** 是否可清空 */
  clearable: LkProp.boolean(false),

  /** 是否自动聚焦 */
  autofocus: LkProp.boolean(false),

  /** 是否聚焦，受控聚焦状态 */
  focus: LkProp.boolean(false),

  /** 键盘右下角按钮文字 */
  confirmType: LkProp.enum(
    Object.values(TextareaConfirmType),
    TextareaConfirmType.Return,
    'Textarea.confirmType'
  ),

  /** 点击键盘右下角按钮时是否保持键盘不收起 */
  confirmHold: LkProp.boolean(false),

  /** 键盘弹起时，是否自动上推页面（小程序原生属性） */
  adjustPosition: LkProp.boolean(true),

  /** 光标与键盘的距离，单位 px（小程序原生属性） */
  cursorSpacing: LkProp.number(0),

  /** 指定 focus 时的光标位置 */
  cursor: LkProp.number(-1),

  /** 光标起始位置，需与 selectionEnd 搭配使用 */
  selectionStart: LkProp.number(-1),

  /** 光标结束位置，需与 selectionStart 搭配使用 */
  selectionEnd: LkProp.number(-1),

  /** 是否展示在键盘上方 */
  fixed: LkProp.boolean(false),

  /** 是否显示键盘上方带有完成按钮那一栏 */
  showConfirmBar: LkProp.boolean(true),

  /** 是否去掉 iOS 默认内边距 */
  disableDefaultPadding: LkProp.boolean(true),

  /** 聚焦时点击页面是否保持键盘不收起 */
  holdKeyboard: LkProp.boolean(false),

  /** 键盘收起时是否自动失焦 */
  autoBlur: LkProp.boolean(false),

  /** H5/App 输入模式提示 */
  inputmode: LkProp.enum(
    Object.values(TextareaInputMode),
    TextareaInputMode.Text,
    'Textarea.inputmode'
  ),

  /** 是否忽略系统组合输入事件 */
  ignoreCompositionEvent: LkProp.boolean(true),

  /** 表单字段名，用于表单验证联动 */
  prop: LkProp.string(''),

  /** 是否触发表单验证（默认 true） */
  validateEvent: LkProp.boolean(true),
} as const;

export const textareaEmits = {
  'update:modelValue': (_val: string) => true,
  input: (_val: string) => true,
  /** 失焦时触发，携带最终值 */
  change: (_val: string) => true,
  focus: (_e: TextareaEventPayload) => true,
  blur: (_e: TextareaEventPayload) => true,
  confirm: (_e: TextareaEventPayload) => true,
  clear: () => true,
  linechange: (_e: TextareaEventPayload) => true,
  keyboardheightchange: (_e: TextareaEventPayload) => true,
  compositionstart: (_e: TextareaEventPayload) => true,
  compositionupdate: (_e: TextareaEventPayload) => true,
  compositionend: (_e: TextareaEventPayload) => true,
};

export type TextareaProps = ExtractPropTypes<typeof textareaProps>;
