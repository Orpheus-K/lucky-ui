import type { ExtractPropTypes } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const MetaRowAlign = {
  Start: 'start',
  Center: 'center',
  End: 'end',
} as const;

export type MetaRowAlign = (typeof MetaRowAlign)[keyof typeof MetaRowAlign];

export const metaRowProps = {
  ...baseProps,

  /** 主体区域与左右区域的垂直对齐方式 */
  align: LkProp.enum(Object.values(MetaRowAlign), MetaRowAlign.Center, 'MetaRow.align'),

  /** 左中右三栏的水平间距 */
  gap: LkProp.stringNumber(16),

  /** 主体区域上下两行的垂直间距 */
  mainGap: LkProp.stringNumber(2),

  /** 左侧区域的固定宽度 */
  startWidth: LkProp.stringNumber(''),

  /** 右侧区域的固定宽度 */
  endWidth: LkProp.stringNumber(''),
} as const;

export type MetaRowProps = ExtractPropTypes<typeof metaRowProps>;
