import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';
import type {
  ANIMATION_PRESETS,
  TransitionConfig,
} from '@/uni_modules/lucky-ui/composables/useTransition';

/**
 * 触发方式
 */
export const TooltipTrigger = {
  Hover: 'hover',
  Click: 'click',
  Manual: 'manual',
} as const;

/**
 * 位置
 */
export const TooltipPlacement = {
  Top: 'top',
  Bottom: 'bottom',
  Left: 'left',
  Right: 'right',
} as const;

export type TooltipTrigger = (typeof TooltipTrigger)[keyof typeof TooltipTrigger];
export type TooltipPlacement = (typeof TooltipPlacement)[keyof typeof TooltipPlacement];

export const tooltipProps = {
  ...baseProps,

  /** 内容文本 */
  content: LkProp.string(''),

  /** 层级 (默认 600，弹出层-无遮罩) */
  zIndex: LkProp.number(600),

  /**
   * 触发方式
   * @value hover 鼠标悬停
   * @value click 点击
   * @value manual 手动
   */
  trigger: LkProp.enum(Object.values(TooltipTrigger), TooltipTrigger.Hover, 'Tooltip.trigger'),

  /**
   * 位置
   * @value top 上方
   * @value bottom 下方
   * @value left 左侧
   * @value right 右侧
   */
  placement: LkProp.enum(
    Object.values(TooltipPlacement),
    TooltipPlacement.Top,
    'Tooltip.placement'
  ),

  /** 是否显示（受控） */
  modelValue: {
    type: Boolean,
    default: undefined,
  },

  /** 是否禁用 */
  disabled: LkProp.boolean(false),

  /** 是否常驻显示 */
  always: LkProp.boolean(false),

  /** 初次挂载时打开一次 */
  defaultOpen: LkProp.boolean(false),

  /** 与触发元素的间距（rpx） */
  offset: LkProp.number(8),

  /** 浮层宽度 */
  width: {
    type: [Number, String] as unknown as PropType<number | string>,
    default: undefined,
  },

  /** 显示延时（ms） */
  showDelay: LkProp.number(80),

  /** 隐藏延时（ms） */
  hideDelay: LkProp.number(80),

  /** 动画预设名称 */
  animation: {
    type: String as PropType<keyof typeof ANIMATION_PRESETS>,
    default: undefined,
  },

  /** 动画类型 */
  animationType: {
    type: String as PropType<TransitionConfig['name']>,
    default: undefined,
  },

  /** 动画持续时间 */
  duration: LkProp.number(220),

  /** 动画延迟 */
  delay: LkProp.number(0),

  /** 动画缓动函数 */
  easing: {
    type: String as PropType<TransitionConfig['easing']>,
    default: 'ease-out-cubic',
  },
} as const;

export type TooltipProps = ExtractPropTypes<typeof tooltipProps>;

export const tooltipEmits = {
  'update:modelValue': (_val: boolean) => true,
  show: (_payload?: unknown) => true,
  hide: (_payload?: unknown) => true,
  open: (_payload?: unknown) => true,
  close: (_payload?: unknown) => true,
  'click-trigger': (_event?: unknown) => true,
  'mouseenter-trigger': (_event?: unknown) => true,
  'mouseleave-trigger': (_event?: unknown) => true,
  'mouseenter-content': (_event?: unknown) => true,
  'mouseleave-content': (_event?: unknown) => true,
  'after-enter': () => true,
  'after-leave': () => true,
  'placement-change': (_placement: TooltipPlacement, _oldPlacement: TooltipPlacement) => true,
};
