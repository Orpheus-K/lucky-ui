import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

/**
 * Tabbar 模式
 */
export const TabbarMode = {
  /** 简约风格 - 仅颜色变化 */
  Fixed: 'fixed',
  /** 滑块风格 - 带滑动指示器 */
  Slider: 'slider',
  /** 中间凸起风格 - 中间项特殊处理 */
  Bump: 'bump',
} as const;

export type TabbarMode = (typeof TabbarMode)[keyof typeof TabbarMode];

/**
 * 导航项配置接口
 */
export interface TabbarItemConfig {
  /** 页面路径 */
  pagePath?: string;
  /** 图标名称（lk-icon 内置图标） */
  icon: string;
  /** 选中态图标名称 */
  selectedIcon?: string;
  /** 选中态优先使用 fill 图标 */
  activeIconFill?: boolean;
  /** 文字标签 */
  text: string;
  /** 是否使用自定义图标（图片路径） */
  customIcon?: boolean;
  /** 徽标数字 */
  badge?: string | number;
  /** 小红点 */
  dot?: boolean;
}

/**
 * LkTabbar 底部导航栏 Props
 * 支持三种风格模式：fixed（简约）、slider（滑块）、bump（中间凸起）
 */
export const tabbarProps = {
  ...baseProps,

  /** 当前选中项的索引值 */
  modelValue: {
    type: [String, Number] as PropType<string | number>,
    default: 0,
  },

  /**
   * 导航项列表配置
   * 当使用 list 时，会渲染为简化模式，不需要使用 slot
   */
  list: {
    type: Array as PropType<TabbarItemConfig[]>,
    default: () => [],
  },

  /**
   * 展示模式
   * @value fixed 简约风格 - 仅颜色变化
   * @value slider 滑块风格 - 带滑动指示器
   * @value bump 中间凸起风格 - 中间项特殊处理
   */
  mode: LkProp.enum(Object.values(TabbarMode), TabbarMode.Fixed, 'Tabbar.mode'),

  /** 层级 (默认 300，低于弹出层) */
  zIndex: LkProp.number(300),

  /** 是否固定在底部 */
  fixed: LkProp.boolean(true),

  /** 是否适配底部安全区域（iPhone X 等机型） */
  safeArea: LkProp.boolean(true),

  /** 是否显示顶部边框线 */
  border: LkProp.boolean(true),

  /** 激活项的颜色（默认使用品牌色） */
  activeColor: LkProp.string(''),

  /** 未激活项的颜色（默认使用柔和灰色） */
  inactiveColor: LkProp.string(''),

  /** 背景颜色 */
  bgColor: LkProp.string(''),

  /** 是否使用毛玻璃效果 */
  glassBg: LkProp.boolean(false),

  /** 点击是否跳转页面（需要配合 list.pagePath 使用） */
  switchPage: LkProp.boolean(false),
} as const;

export type TabbarProps = ExtractPropTypes<typeof tabbarProps>;

export const tabbarEmits = {
  'update:modelValue': (_val: string | number) => true,
  change: (_val: string | number, _item?: TabbarItemConfig) => true,
  click: (_val: string | number, _item?: TabbarItemConfig, _index?: number, _event?: unknown) =>
    true,
  reselect: (_val: string | number, _item?: TabbarItemConfig, _index?: number, _event?: unknown) =>
    true,
  'switch-page-success': (_payload: {
    value: string | number;
    item: TabbarItemConfig;
    index: number;
    result: unknown;
  }) => true,
  'switch-page-fail': (_payload: {
    value: string | number;
    item: TabbarItemConfig;
    index: number;
    error: unknown;
  }) => true,
};
