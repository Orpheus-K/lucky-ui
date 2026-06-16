import type { ExtractPropTypes } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const horizontalScrollProps = {
  ...baseProps,
  /**
   * 列表项间隙
   */
  gap: LkProp.stringNumber('var(--lk-rpx-20)'),
  /**
   * 容器内边距
   */
  padding: LkProp.stringNumber('var(--lk-rpx-0)'),
  /**
   * 是否隐藏滚动条
   */
  hideScrollbar: LkProp.boolean(true),
};

export type HorizontalScrollProps = ExtractPropTypes<typeof horizontalScrollProps>;
