import type { ExtractPropTypes } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const overlayProps = {
  ...baseProps,

  /** 是否显示（v-model） */
  modelValue: LkProp.boolean(false),

  /** 层级 */
  zIndex: LkProp.number(900),

  /** 透明度 */
  opacity: LkProp.number(0.55),

  /** 背景颜色 */
  background: LkProp.string(''),

  /** 点击是否关闭 */
  closeOnClick: LkProp.boolean(true),

  /** 是否锁定滚动 */
  lockScroll: LkProp.boolean(true),

  /** 动画持续时间（毫秒） */
  duration: LkProp.number(240),
} as const;

export type OverlayProps = ExtractPropTypes<typeof overlayProps>;

export const overlayEmits = {
  click: (_event?: unknown) => true,
  close: (_event?: unknown) => true,
  open: () => true,
  'update:modelValue': (_value: boolean) => true,
  'after-enter': () => true,
  'after-leave': () => true,
  touchmove: (_event?: unknown) => true,
};
