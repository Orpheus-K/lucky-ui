import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

/**
 * 输入框尺寸
 */
export const InputSize = {
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
} as const;

/**
 * 输入框类型（uni-app 跨平台兼容类型集合）
 */
export const InputType = {
  Text: 'text',
  Password: 'password',
  Number: 'number',
  Tel: 'tel',
  Email: 'email',
  /** 带小数点的数字键盘（小程序专用） */
  Digit: 'digit',
  /** 身份证输入（小程序专用） */
  Idcard: 'idcard',
} as const;

/**
 * 键盘右下角按钮类型
 */
export const InputConfirmType = {
  Send: 'send',
  Search: 'search',
  Next: 'next',
  Go: 'go',
  Done: 'done',
  Return: 'return',
} as const;

/**
 * H5/App 输入模式提示
 */
export const InputMode = {
  None: 'none',
  Text: 'text',
  Decimal: 'decimal',
  Numeric: 'numeric',
  Tel: 'tel',
  Search: 'search',
  Email: 'email',
  Url: 'url',
} as const;

export type InputSize = (typeof InputSize)[keyof typeof InputSize];
export type InputType = (typeof InputType)[keyof typeof InputType];
export type InputConfirmType = (typeof InputConfirmType)[keyof typeof InputConfirmType];
export type InputMode = (typeof InputMode)[keyof typeof InputMode];
export type InputValue = string | number;
export type InputEventPayload =
  | Event
  | {
      detail?: {
        value?: InputValue;
        height?: number;
        duration?: number;
        cursor?: number;
      };
      target?: {
        value?: InputValue;
      };
    };

export const inputProps = {
  ...baseProps,

  /** 绑定值 */
  modelValue: {
    type: [String, Number] as PropType<string | number>,
    default: '',
  },

  /**
   * 输入框尺寸
   * @value sm 小尺寸
   * @value md 中尺寸
   * @value lg 大尺寸
   */
  size: LkProp.enum(Object.values(InputSize), InputSize.Md, 'Input.size'),

  /**
   * 输入框类型
   * @value text 文本
   * @value password 密码
   * @value number 数字（小程序尾缀输入法）
   * @value tel 电话
   * @value email 邮箱
   * @value digit 带小数点的数字键盘（小程序）
   * @value idcard 身份证输入（小程序）
   */
  type: LkProp.enum(Object.values(InputType), InputType.Text, 'Input.type'),

  /** 占位符 */
  placeholder: LkProp.string(''),

  /** 占位符样式 */
  placeholderStyle: LkProp.string(''),

  /** 占位符样式类 */
  placeholderClass: LkProp.string('input-placeholder'),

  /** 原生表单字段名 */
  name: LkProp.string(''),

  /** 是否禁用 */
  disabled: LkProp.boolean(false),

  /** 是否只读 */
  readonly: LkProp.boolean(false),

  /** 是否可清空 */
  clearable: LkProp.boolean(true),

  /** 最大输入长度，-1 表示不限制 */
  maxlength: LkProp.number(-1),

  /** 是否显示字数统计 */
  showCount: LkProp.boolean(false),

  /** 表单字段名，用于表单验证联动 */
  prop: LkProp.string(''),

  /** 是否自动聚焦 */
  autofocus: LkProp.boolean(false),

  /** 是否聚焦，受控聚焦状态 */
  focus: LkProp.boolean(false),

  /** 前缀图标名 */
  prefixIcon: LkProp.string(''),

  /** 后缀图标名（showPassword=true 时被密码图标覆盖） */
  suffixIcon: LkProp.string(''),

  /** 是否显示输入字数限制 */
  showWordLimit: LkProp.boolean(false),

  /**
   * 是否显示密码明暗切换按钮
   * 仅当 type="password" 时生效
   * @default false
   */
  showPassword: LkProp.boolean(false),

  /**
   * 是否无边框 (常用于列表 Cell 内部)
   * @default false
   */
  borderless: LkProp.boolean(false),

  /**
   * 输入内容对齐方式
   * @value left 左对齐
   * @value center 居中
   * @value right 右对齐
   */
  inputAlign: LkProp.enum(['left', 'center', 'right'] as const, 'left', 'Input.inputAlign'),

  /** 键盘右下角按钮文字 */
  confirmType: LkProp.enum(
    Object.values(InputConfirmType),
    InputConfirmType.Done,
    'Input.confirmType'
  ),

  /** 点击键盘右下角按钮时是否保持键盘不收起 */
  confirmHold: LkProp.boolean(false),

  /**
   * 光标与键盘的距离（小程序原生属性，单位 px）
   */
  cursorSpacing: LkProp.number(0),

  /** 指定 focus 时的光标位置 */
  cursor: LkProp.number(-1),

  /** 光标起始位置，需与 selectionEnd 搭配使用 */
  selectionStart: LkProp.number(-1),

  /** 光标结束位置，需与 selectionStart 搭配使用 */
  selectionEnd: LkProp.number(-1),

  /** 键盘弹起时是否自动上推页面 */
  adjustPosition: LkProp.boolean(true),

  /** 聚焦时点击页面是否保持键盘不收起 */
  holdKeyboard: LkProp.boolean(false),

  /** H5/App 输入模式提示 */
  inputmode: LkProp.enum(Object.values(InputMode), InputMode.Text, 'Input.inputmode'),

  /** 是否忽略系统组合输入事件 */
  ignoreCompositionEvent: LkProp.boolean(true),

  /**
   * 是否为假输入框模式
   * 用于搜索跳转场景，点击会触发 click 事件而非聚焦
   */
  fake: LkProp.boolean(false),

  /**
   * 假输入框的显示文本
   * 当 fake=true 时使用，不设置则显示 placeholder
   */
  fakeText: LkProp.string(''),
} as const;

export type InputProps = ExtractPropTypes<typeof inputProps>;

export const inputEmits = {
  'update:modelValue': (_val: InputValue) => true,
  /** 实时输入时触发 */
  input: (_val: InputValue) => true,
  /** 失焦时触发（携带最终值） */
  change: (_val: InputValue) => true,
  blur: (_e: InputEventPayload) => true,
  focus: (_e: InputEventPayload) => true,
  /** 清空时触发 */
  clear: () => true,
  /** 键盘确认时触发（小程序） */
  confirm: (_e: InputEventPayload) => true,
  /** 键盘高度变化时触发 */
  keyboardheightchange: (_e: InputEventPayload) => true,
  /** 组合输入开始 */
  compositionstart: (_e: InputEventPayload) => true,
  /** 组合输入更新 */
  compositionupdate: (_e: InputEventPayload) => true,
  /** 组合输入结束 */
  compositionend: (_e: InputEventPayload) => true,
  /** 假输入框点击 */
  click: (_e: unknown) => true,
};
