import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export type AnyItem = Record<string, unknown> & { id?: PropertyKey };
export type VirtualListCustomClass = string | object | Array<string | object>;
export type VirtualListCustomStyle = string | Record<string, unknown>;

/** 定位策略 */
const VirtualListPositionStrategy = {
  Transform: 'transform',
  Absolute: 'absolute',
  Padding: 'padding',
} as const;
export type VirtualListPositionStrategy =
  (typeof VirtualListPositionStrategy)[keyof typeof VirtualListPositionStrategy];

export const virtualListProps = {
  ...baseProps,
  /** 列表数据 */
  items: { type: Array as PropType<AnyItem[]>, default: () => [] },
  /** 每项高度 */
  itemHeight: LkProp.number(100),
  /** 列表高度 */
  height: LkProp.number(600),
  /** 缓冲数量 */
  buffer: LkProp.number(5),
  /** 动态 overscan：根据滚动速度增加额外缓冲行数（减少快速滚动白屏） */
  dynamicOverscan: LkProp.boolean(true),
  /** 最大 overscan 行数 */
  maxOverscanRows: LkProp.number(30),
  /** 单次 rAF 计算中的"行增益系数"，越大快速滚动时缓冲行数越多 */
  overscanBoostFactor: LkProp.number(0.6),
  /** 触底阈值 */
  lowerThreshold: {
    type: [Number, String] as PropType<number | string>,
    default: 'var(--lk-rpx-80)',
  },
  /** 预取行数 */
  prefetchRows: LkProp.number(0),
  /** 保留行数 */
  reserveRows: LkProp.number(0),
  /** 定位策略 */
  positionStrategy: LkProp.enum(
    Object.values(VirtualListPositionStrategy),
    VirtualListPositionStrategy.Transform,
    'VirtualList.positionStrategy'
  ),
  /** 初始滚动索引 */
  initialScrollIndex: LkProp.number(0),
  /** 滚动时是否启用动画 */
  scrollWithAnimation: LkProp.boolean(false),
  /** 是否启用滚动锚定 */
  scrollAnchoring: LkProp.boolean(true),
  /** 是否启用 passive 事件 */
  enablePassive: LkProp.boolean(true),
  /** 是否启用 scroll-view enhanced */
  enhanced: LkProp.boolean(true),
  /** 是否启用回弹效果 */
  bounces: LkProp.boolean(false),
  /** 可视内容容器自定义类名 */
  contentClass: {
    type: [String, Object, Array] as PropType<VirtualListCustomClass>,
    default: '',
  },
  /** 可视内容容器自定义样式 */
  contentStyle: {
    type: [String, Object] as PropType<VirtualListCustomStyle>,
    default: '',
  },
  /** 透传给默认插槽的列表项类名，便于统一绑定业务行样式 */
  itemClass: {
    type: [String, Object, Array] as PropType<VirtualListCustomClass>,
    default: '',
  },
  /** 透传给默认插槽的列表项样式，便于统一绑定业务行样式 */
  itemStyle: {
    type: [String, Object] as PropType<VirtualListCustomStyle>,
    default: '',
  },
} as const;

export type VirtualListProps = ExtractPropTypes<typeof virtualListProps>;

export interface VirtualListScrollPayload {
  scrollTop: number;
  start: number;
  end: number;
}

export const virtualListEmits = {
  scroll: (_payload: VirtualListScrollPayload) => true,
  'reach-bottom': () => true,
  prefetch: () => true,
};
