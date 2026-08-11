import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

/**
 * 键盘类型
 */
export const KeyboardType = {
  /** 数字键盘 */
  Number: 'number',
  /** 身份证键盘 */
  IdCard: 'idcard',
  /** 车牌号键盘 */
  Plate: 'plate',
  /** 自定义键盘 */
  Custom: 'custom',
} as const;

export type KeyboardType = (typeof KeyboardType)[keyof typeof KeyboardType];
/**
 * 自定义按键配置
 */
export interface KeyboardKey {
  /** 按键显示文本 */
  text: string;
  /** 按键值（点击时返回） */
  value?: string;
  /** 宽度比例（默认1） */
  flex?: number;
  /** 是否为特殊按键（删除/确认等） */
  type?: 'default' | 'delete' | 'confirm' | 'extra' | 'empty';
  /** 是否禁用 */
  disabled?: boolean;
}

export const keyboardProps = {
  ...baseProps,

  /**
   * 是否显示键盘
   */
  visible: LkProp.boolean(false),

  /**
   * 键盘类型
   */
  type: LkProp.enum(Object.values(KeyboardType), KeyboardType.Number, 'Keyboard.type'),

  /**
   * 键盘标题
   */
  title: LkProp.string(''),

  /**
   * 确认按钮文本
   */
  confirmText: LkProp.string(''),

  /**
   * 是否显示确认按钮
   */
  showConfirm: LkProp.boolean(false),

  /**
   * 是否显示删除按钮
   */
  showDelete: LkProp.boolean(true),

  /**
   * 是否显示小数点（数字键盘）
   */
  showDot: LkProp.boolean(false),

  /**
   * 额外按键（左下角）
   */
  extraKey: LkProp.string(''),

  /**
   * 是否随机排列数字
   */
  random: LkProp.boolean(false),

  /**
   * 最大输入长度（0表示不限制）
   */
  maxLength: LkProp.number(0),

  /**
   * 当前输入值（用于判断是否可继续输入）
   */
  modelValue: LkProp.string(''),

  /**
   * 是否显示遮罩
   */
  overlay: LkProp.boolean(true),

  /**
   * 点击遮罩关闭
   */
  closeOnOverlay: LkProp.boolean(true),

  /**
   * 是否显示关闭按钮
   */
  showClose: LkProp.boolean(false),

  /**
   * 层级
   */
  zIndex: LkProp.number(1000),

  /**
   * 安全区域底部偏移
   */
  safeAreaInsetBottom: LkProp.boolean(true),

  /**
   * 自定义按键布局（type=custom时使用）
   */
  keys: {
    type: Array as PropType<KeyboardKey[][]>,
    default: () => [],
  },

  /**
   * 是否启用触感反馈
   */
  vibrate: LkProp.boolean(true),
} as const;

export const keyboardEmits = {
  'update:visible': (val: boolean) => typeof val === 'boolean',
  'update:modelValue': (val: string) => typeof val === 'string',
  /** 按键输入 */
  input: (key: string) => typeof key === 'string',
  /** 删除 */
  delete: () => true,
  /** 确认 */
  confirm: (value: string) => typeof value === 'string',
  /** 关闭 */
  close: () => true,
  /** 按键按下 */
  'key-press': (key: KeyboardKey) => !!key,
};

export type KeyboardProps = ExtractPropTypes<typeof keyboardProps>;
export type KeyboardEmits = typeof keyboardEmits;
