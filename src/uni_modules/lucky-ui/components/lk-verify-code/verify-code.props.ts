import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

/** 输入类型 */
export const VerifyCodeType = {
  Text: 'text',
  Number: 'number',
} as const;
export type VerifyCodeType = (typeof VerifyCodeType)[keyof typeof VerifyCodeType];

/** 样式变体 */
export const VerifyCodeVariant = {
  Box: 'box',
  Underline: 'underline',
  Rounded: 'rounded',
} as const;
export type VerifyCodeVariant = (typeof VerifyCodeVariant)[keyof typeof VerifyCodeVariant];

/** 状态 */
export const VerifyCodeStatus = {
  Default: 'default',
  Focus: 'focus',
  Error: 'error',
  Success: 'success',
} as const;
export type VerifyCodeStatus = (typeof VerifyCodeStatus)[keyof typeof VerifyCodeStatus];

export const verifyCodeProps = {
  ...baseProps,
  /** 验证码长度 (4/6/8) */
  length: {
    type: Number as PropType<4 | 6 | 8>,
    default: 6,
    validator: (v: unknown): v is 4 | 6 | 8 => v === 4 || v === 6 || v === 8,
  },
  /** 绑定值 */
  modelValue: LkProp.string(''),
  /** 输入类型 */
  type: LkProp.enum(Object.values(VerifyCodeType), VerifyCodeType.Number, 'VerifyCode.type'),
  /** 样式变体 */
  variant: LkProp.enum(
    Object.values(VerifyCodeVariant),
    VerifyCodeVariant.Box,
    'VerifyCode.variant'
  ),
  /** 是否密码模式（显示圆点） */
  mask: LkProp.boolean(false),
  /** 是否自动聚焦（默认不自动拉起输入框） */
  autofocus: LkProp.boolean(false),
  /** 是否禁用 */
  disabled: LkProp.boolean(false),
  /** 状态 */
  status: LkProp.enum(
    Object.values(VerifyCodeStatus),
    VerifyCodeStatus.Default,
    'VerifyCode.status'
  ),
  /** 错误提示文字 */
  errorMessage: LkProp.string(''),
  /** 是否显示光标 */
  showCursor: LkProp.boolean(true),
  /** 是否开启倒计时 */
  countdown: LkProp.boolean(false),
  /** 倒计时时长（秒） */
  countdownDuration: LkProp.number(60),
  /** 发送按钮文字 */
  sendText: LkProp.string(''),
  /** 重新发送按钮文字 */
  resendText: LkProp.string(''),
  /** 倒计时文字模板，{s}为秒数占位符 */
  countdownText: LkProp.string(''),
  /** 单元格间距 */
  gap: LkProp.number(12),
  /** 单元格尺寸 */
  cellSize: LkProp.number(96),
  /** 字体大小 */
  fontSize: LkProp.number(40),
  /** 提示文字 */
  tips: LkProp.string(''),
  /** 聚焦时的边框颜色 */
  focusColor: {
    type: String as PropType<string>,
    default: '',
  },
  /** 错误时的边框颜色 */
  errorColor: {
    type: String as PropType<string>,
    default: '',
  },
} as const;

export type VerifyCodeProps = ExtractPropTypes<typeof verifyCodeProps>;

export const verifyCodeEmits = {
  /** 值变化 */
  'update:modelValue': (_: string) => true,
  /** 输入完成 */
  finish: (_: string) => true,
  /** 发送验证码 */
  send: () => true,
  /** 重新发送 */
  resend: () => true,
  /** 聚焦 */
  focus: () => true,
  /** 失焦 */
  blur: () => true,
  /** 倒计时结束 */
  countdownEnd: () => true,
};
