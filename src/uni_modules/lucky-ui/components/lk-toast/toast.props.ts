import type { ExtractPropTypes } from 'vue';
import { baseProps, LkProp } from '../common/props';

/**
 * Toast 位置
 */
export const ToastPosition = {
  Top: 'top',
  Center: 'center',
  Bottom: 'bottom',
} as const;

export type ToastPosition = (typeof ToastPosition)[keyof typeof ToastPosition];

/**
 * Toast 动画名称（对齐 useTransition 内置动画）
 */
export const ToastTransitionNames = ['fade', 'slide-up', 'slide-down', 'zoom-in'] as const;

export type ToastTransitionName = (typeof ToastTransitionNames)[number];

export const toastProps = {
  ...baseProps,

  /** 是否显示 */
  modelValue: LkProp.boolean(false),

  /** 层级 (默认 2000，消息层最高优先级) */
  zIndex: LkProp.number(2000),

  /** 提示内容 */
  message: LkProp.string(''),

  /** 展示时长（毫秒） */
  duration: LkProp.number(2000),

  /**
   * 动画名称
   * @value fade 淡入淡出
   * @value slide-up 向上滑动
   * @value slide-down 向下滑动
   * @value zoom-in 缩放
   */
  transition: LkProp.enum(ToastTransitionNames, 'slide-up', 'Toast.transition'),

  /**
   * 位置
   * @value top 顶部
   * @value center 居中
   * @value bottom 底部
   */
  position: LkProp.enum(Object.values(ToastPosition), ToastPosition.Center, 'Toast.position'),

  /** 是否显示遮罩层 */
  overlay: LkProp.boolean(false),

  /** 是否禁止点击穿透 */
  forbidClick: LkProp.boolean(false),
} as const;

export type ToastProps = ExtractPropTypes<typeof toastProps>;

export const toastEmits = {
  'update:modelValue': (_val: boolean) => true,
  open: () => true,
  close: () => true,
  'after-leave': () => true,
};
