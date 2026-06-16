import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export interface GridItem {
  icon?: string;
  text: string;
  disabled?: boolean;
  [key: string]: unknown;
}

export const gridProps = {
  ...baseProps,

  /** 列数 */
  columns: {
    type: Number,
    default: undefined,
  },

  /** 间距 */
  gap: {
    type: Number,
    default: undefined,
  },

  /** 项目间距 */
  itemGap: {
    type: Number,
    default: undefined,
  },

  /** 是否轮播模式 */
  carousel: LkProp.boolean(false),

  /** 是否裁剪溢出内容 */
  clip: LkProp.boolean(false),

  /** 行数（轮播模式使用） */
  rows: {
    type: Number,
    default: undefined,
  },

  /** 宫格数据 */
  items: {
    type: Array as PropType<GridItem[]>,
    default: () => [],
  },
} as const;

export type GridProps = ExtractPropTypes<typeof gridProps>;

export const gridEmits = {
  click: (_payload: { item: GridItem; index: number; pageIndex: number; event?: unknown }) => true,
  'click-disabled': (_payload: {
    item: GridItem;
    index: number;
    pageIndex: number;
    event?: unknown;
  }) => true,
  'page-change': (_index: number, _oldIndex?: number) => true,
};
