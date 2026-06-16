import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const stickyProps = {
  ...baseProps,

  /** 距离顶部偏移量 */
  offsetTop: LkProp.number(0),

  /** 容器选择器 */
  container: {
    type: [String, Object] as PropType<string | object>,
    default: '',
  },
} as const;

export type StickyProps = ExtractPropTypes<typeof stickyProps>;

export const stickyEmits = {
  change: (_value: boolean) => true,
};
