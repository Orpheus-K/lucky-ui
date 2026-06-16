import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';
import type {
  ANIMATION_PRESETS,
  TransitionConfig,
} from '@/uni_modules/lucky-ui/composables/useTransition';

export interface Action {
  name: string;
  sub?: string;
  disabled?: boolean;
  color?: string;
  loading?: boolean;
}

export const actionSheetProps = {
  ...baseProps,

  /** 是否显示 */
  modelValue: LkProp.boolean(false),

  /** 层级 (默认 1000，与 Popup 相同) */
  zIndex: LkProp.number(1000),

  /** 标题 */
  title: LkProp.string(''),

  /** 描述信息 */
  description: LkProp.string(''),

  /** 选项列表 */
  actions: {
    type: Array as PropType<Action[]>,
    default: () => [],
  },

  /** 取消按钮文字 */
  cancelText: LkProp.string(''),

  /** 点击选项后是否关闭 */
  closeOnClickAction: LkProp.boolean(true),

  /** 是否开启安全区域适配 */
  safeArea: LkProp.boolean(true),

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
  duration: {
    type: Number,
    default: undefined,
  },

  /** 动画延迟 */
  delay: {
    type: Number,
    default: undefined,
  },

  /** 动画缓动函数 */
  easing: {
    type: String as PropType<TransitionConfig['easing']>,
    default: undefined,
  },
} as const;

export type ActionSheetProps = ExtractPropTypes<typeof actionSheetProps>;

export const actionSheetEmits = {
  'update:modelValue': (_v: boolean) => true,
  select: (_payload: { action: Action; index: number; event?: unknown }) => true,
  cancel: (_event?: unknown) => true,
  'click-action': (_payload: { action: Action; index: number; event?: unknown }) => true,
  'click-cancel': (_event?: unknown) => true,
  'click-overlay': (_event?: unknown) => true,
  open: () => true,
  close: () => true,
  'after-enter': () => true,
  'after-leave': () => true,
};
