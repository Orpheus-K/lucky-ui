import type { ExtractPropTypes, InjectionKey, PropType, Ref } from 'vue';
import { baseProps, LkProp } from '../common/props';

export type CollapseName = string | number;

export const CollapseVariant = {
  Default: 'default',
  Group: 'group',
  Card: 'card',
  Ghost: 'ghost',
} as const;
export type CollapseVariant = (typeof CollapseVariant)[keyof typeof CollapseVariant];

export const collapseProps = {
  ...baseProps,

  /** 当前展开的面板 */
  modelValue: {
    type: [Array, String, Number] as PropType<CollapseName[] | CollapseName>,
    default: () => [],
  },

  /** 是否手风琴模式 */
  accordion: LkProp.boolean(false),

  /** 折叠面板布局风格：默认线条列表(default)、整块分组(group)、分离卡片(card)、轻量无框(ghost) */
  variant: LkProp.enum(Object.values(CollapseVariant), CollapseVariant.Default, 'Collapse.variant'),

  /** 卡片与轻量模式下的项目间距 */
  gap: LkProp.stringNumber('var(--lk-spacing-sm)'),

  /** 是否显示边框/分割线 */
  bordered: LkProp.boolean(true),

  /** 是否显示右侧箭头/操作区 */
  arrow: LkProp.boolean(true),

  /** 全局收起时的图标名 */
  arrowIcon: LkProp.string(''),

  /** 全局展开时的图标名 */
  openIcon: LkProp.string(''),

  /** 动画持续时间（为空时自动继承全局 Token） */
  animationDuration: LkProp.string(''),

  /** 动画缓动函数（为空时自动继承全局 Token） */
  animationTiming: LkProp.string(''),

  /** 切换面板前的拦截钩子，支持异步 Promise */
  beforeToggle: {
    type: Function as PropType<(name: CollapseName, expanded: boolean) => boolean | Promise<boolean>>,
    default: undefined,
  },
} as const;

export type CollapseProps = ExtractPropTypes<typeof collapseProps>;

export const collapseItemProps = {
  ...baseProps,

  /** 面板唯一标识 */
  name: { type: [String, Number] as PropType<CollapseName>, required: true as const },

  /** 标题文本 */
  title: LkProp.string(''),

  /** 是否禁用当前面板 */
  disabled: LkProp.boolean(false),

  /** 是否显示右侧箭头（未设置时继承父级 arrow） */
  arrow: {
    type: Boolean,
    default: undefined,
  },

  /** 自定义收起时的图标名（如 'chevron-down', 'plus-lg'） */
  arrowIcon: LkProp.string(''),

  /** 自定义展开时的图标名（如 'chevron-up', 'dash-lg'） */
  openIcon: LkProp.string(''),

  /** 自定义收起时的文本（如 '展开'） */
  arrowText: LkProp.string(''),

  /** 自定义展开时的文本（如 '收起'） */
  openText: LkProp.string(''),

  /** 图标尺寸 */
  iconSize: LkProp.stringNumber('var(--lk-rpx-28)'),

  /** 切换当前面板前的拦截钩子，支持异步 Promise */
  beforeToggle: {
    type: Function as PropType<(name: CollapseName, expanded: boolean) => boolean | Promise<boolean>>,
    default: undefined,
  },
} as const;

export type CollapseItemProps = ExtractPropTypes<typeof collapseItemProps>;

export const collapseEmits = {
  'update:modelValue': (_value: CollapseName[] | CollapseName) => true,
  change: (_value: CollapseName[] | CollapseName | undefined, _name?: CollapseName) => true,
  'item-click': (_payload: { name: CollapseName; expanded: boolean; event?: unknown }) => true,
  open: (_name: CollapseName, _value: CollapseName[] | CollapseName | undefined) => true,
  close: (_name: CollapseName, _value: CollapseName[] | CollapseName | undefined) => true,
  'click-disabled': (_payload: { name: CollapseName; event?: unknown }) => true,
};

export const collapseItemEmits = {
  click: (_payload: { name: CollapseName; expanded: boolean; event?: unknown }) => true,
  'click-disabled': (_payload: { name: CollapseName; event?: unknown }) => true,
};

export interface CollapseContext {
  active: Ref<CollapseName[]>;
  accordion: boolean;
  arrow: boolean;
  arrowIcon: string;
  openIcon: string;
  animationDuration: string;
  animationTiming: string;
  beforeToggle?: (name: CollapseName, expanded: boolean) => boolean | Promise<boolean>;
  toggle: (name: CollapseName, event?: unknown) => void;
  clickDisabled: (name: CollapseName, event?: unknown) => void;
}

export const collapseInjectionKey = Symbol('LkCollapse') as InjectionKey<CollapseContext>;
