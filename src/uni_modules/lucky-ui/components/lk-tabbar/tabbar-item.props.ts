import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps } from '../common/props';

export const tabbarItemProps = {
  ...baseProps,

  /** 唯一标识（必填） */
  name: {
    type: [String, Number] as PropType<string | number>,
    required: true,
  },

  /** 图标名称（lk-icon 内置图标） */
  icon: {
    type: String as PropType<string>,
    default: '',
  },

  /** 选中态图标名称 */
  selectedIcon: {
    type: String as PropType<string>,
    default: '',
  },

  /** 选中时优先尝试 icon-fill 变体 */
  activeIconFill: {
    type: Boolean as PropType<boolean>,
    default: false,
  },

  /** 文字标签 */
  label: {
    type: String as PropType<string>,
    default: '',
  },

  /** 是否使用自定义图标（图片路径模式） */
  customIcon: {
    type: Boolean as PropType<boolean>,
    default: false,
  },

  /** 徽标数字 */
  badge: {
    type: [String, Number] as PropType<string | number>,
    default: '',
  },

  /** 小红点 */
  dot: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
} as const;

export type TabbarItemProps = ExtractPropTypes<typeof tabbarItemProps>;
