import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';
import type {
  ANIMATION_PRESETS,
  TransitionConfig,
} from '@/uni_modules/lucky-ui/composables/useTransition';

/**
 * 下拉菜单触发方式
 */
export const DropdownTrigger = {
  Click: 'click',
  Hover: 'hover',
} as const;

/**
 * 下拉菜单位置
 */
export const DropdownPlacement = {
  Top: 'top',
  Bottom: 'bottom',
  Left: 'left',
  Right: 'right',
} as const;

/**
 * 下拉菜单与触发器的对齐方式
 */
export const DropdownMenuAlign = {
  Start: 'start',
  End: 'end',
} as const;

export type DropdownTrigger = (typeof DropdownTrigger)[keyof typeof DropdownTrigger];
export type DropdownPlacement = (typeof DropdownPlacement)[keyof typeof DropdownPlacement];
export type DropdownMenuAlign = (typeof DropdownMenuAlign)[keyof typeof DropdownMenuAlign];
export type DropdownValue = string | number;

export interface DropdownSelectPayload {
  name: DropdownValue;
  event?: unknown;
}

export const dropdownProps = {
  ...baseProps,

  /** 绑定值 */
  modelValue: {
    type: [String, Number] as PropType<DropdownValue>,
    default: '',
  },

  /** 层级（默认 500，弹出层，无遮罩） */
  zIndex: LkProp.number(500),

  /**
   * 触发方式
   * @value click 点击
   * @value hover 悬停
   */
  trigger: LkProp.enum(Object.values(DropdownTrigger), DropdownTrigger.Click, 'Dropdown.trigger'),

  /**
   * 位置
   * @value top 上方
   * @value bottom 下方
   * @value left 左侧
   * @value right 右侧
   */
  placement: LkProp.enum(
    Object.values(DropdownPlacement),
    DropdownPlacement.Bottom,
    'Dropdown.placement'
  ),

  /**
   * 菜单与触发器的对齐方式
   * @value start 起始边对齐
   * @value end 结束边对齐
   */
  menuAlign: LkProp.enum(
    Object.values(DropdownMenuAlign),
    DropdownMenuAlign.Start,
    'Dropdown.menuAlign'
  ),

  /** 菜单宽度，数字默认按 rpx 处理 */
  menuWidth: LkProp.stringNumber(''),

  /** 菜单最小宽度，数字默认按 rpx 处理 */
  menuMinWidth: LkProp.stringNumber(''),

  /** 菜单最大宽度，数字默认按 rpx 处理 */
  menuMaxWidth: LkProp.stringNumber(''),

  /** 菜单宽度是否跟随内容 */
  menuFitContent: LkProp.boolean(false),

  /** 点击菜单项时是否写入选中值并显示选中态 */
  selectable: LkProp.boolean(true),

  /** 选择后是否关闭 */
  closeOnSelect: LkProp.boolean(true),

  /** 点击菜单外部区域是否关闭 */
  closeOnClickOutside: LkProp.boolean(true),

  /** 菜单展开时是否锁定背景滚动 */
  lockScroll: LkProp.boolean(true),

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
  duration: LkProp.number(180),

  /** 动画延迟 */
  delay: LkProp.number(0),

  /** 动画缓动函数 */
  easing: {
    type: String as PropType<TransitionConfig['easing']>,
    default: 'ease-out',
  },
} as const;

export type DropdownProps = ExtractPropTypes<typeof dropdownProps>;

export const dropdownDividerProps = {
  ...baseProps,

  /** 是否按带图标菜单项缩进 */
  inset: LkProp.boolean(false),
} as const;

export type DropdownDividerProps = ExtractPropTypes<typeof dropdownDividerProps>;

export const dropdownEmits = {
  'update:modelValue': (_value: DropdownValue) => true,
  change: (_value: DropdownValue, _payload?: DropdownSelectPayload) => true,
  select: (_payload: DropdownSelectPayload) => true,
  open: () => true,
  close: () => true,
  'click-trigger': (_event?: unknown) => true,
  'click-outside': (_event?: unknown) => true,
  'after-enter': () => true,
  'after-leave': () => true,
};

export const dropdownItemEmits = {
  click: (_payload: DropdownSelectPayload) => true,
  'click-disabled': (_payload: DropdownSelectPayload) => true,
};
