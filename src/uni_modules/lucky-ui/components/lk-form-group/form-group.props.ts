import type { ExtractPropTypes } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const formGroupProps = {
  ...baseProps,

  /** 分组标题 */
  title: LkProp.string(''),

  /** 是否为圆角卡片布局 */
  card: LkProp.boolean(false),
} as const;

export type FormGroupProps = ExtractPropTypes<typeof formGroupProps>;
