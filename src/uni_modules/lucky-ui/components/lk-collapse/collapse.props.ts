import type { ExtractPropTypes, InjectionKey, PropType, Ref } from 'vue';
import { baseProps, LkProp } from '../common/props';

export type CollapseName = string | number;

export const CollapseVariant = {
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

  /** 折叠面板布局风格 */
  variant: LkProp.enum(Object.values(CollapseVariant), CollapseVariant.Group, 'Collapse.variant'),

  /** 分离卡片模式下的项目间距 */
  gap: LkProp.stringNumber('var(--lk-spacing-sm)'),

  /** 是否显示边框 */
  bordered: LkProp.boolean(true),

  /** 动画持续时间 */
  animationDuration: LkProp.string('0.3s'),

  /** 动画缓动函数 */
  animationTiming: LkProp.string('cubic-bezier(0.4, 0, 0.2, 1)'),
} as const;

export type CollapseProps = ExtractPropTypes<typeof collapseProps>;

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
  animationDuration: string;
  animationTiming: string;
  toggle: (name: CollapseName, event?: unknown) => void;
  clickDisabled: (name: CollapseName, event?: unknown) => void;
}

export const collapseInjectionKey = Symbol('LkCollapse') as InjectionKey<CollapseContext>;
