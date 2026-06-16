import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

/**
 * 瀑布流项目类型
 */
export interface WaterfallItem {
  /** 唯一标识 */
  id: string | number;
  /** 图片地址 (用于预加载计算高度) */
  image?: string;
  /** 图片宽度 (可选，加速计算) */
  imageWidth?: number;
  /** 图片高度 (可选，加速计算) */
  imageHeight?: number;
  /** 宽高比 (可选，优先级高于 imageWidth/imageHeight) */
  ratio?: number;
  /** 额外高度 (如卡片标题区域) */
  extraHeight?: number;
  title?: string;
  author?: string;
  avatarColor?: string;
  likes?: number;
  tag?: string;
  /** 任意扩展字段 */
  [key: string]: unknown;
}

/**
 * 加载状态枚举
 */
export type WaterfallLoadingState = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * 布局后的卡片位置信息
 */
export interface PlacedCard {
  /** 原始数据索引 */
  index: number;
  /** 唯一标识 */
  id: string | number;
  /** 所在列 (0=左, 1=右) */
  column: 0 | 1;
  /** 顶部偏移 (px) */
  top: number;
  /** 左侧偏移 (px) - 绝对定位使用 */
  left?: number;
  /** 卡片宽度 (px) */
  width: number;
  /** 卡片高度 (px) */
  height: number;
  /** 加载状态 */
  loadingState: WaterfallLoadingState;
  /** 原始数据 */
  item: WaterfallItem;
}

export const waterfallProps = {
  ...baseProps,

  /**
   * 数据列表
   */
  items: {
    type: Array as PropType<WaterfallItem[]>,
    default: () => [],
  },

  /**
   * 容器高度 (支持 rpx/px/number)
   */
  height: LkProp.stringNumber('100vh'),

  /**
   * 列间距 (支持 rpx/px/number)
   */
  gutter: LkProp.stringNumber(16),

  /**
   * 行间距 (支持 rpx/px/number)
   */
  rowGap: LkProp.stringNumber(16),

  /**
   * 左右内边距 (支持 rpx/px/number)
   */
  paddingX: LkProp.stringNumber(16),

  /**
   * 上下内边距 (支持 rpx/px/number)
   */
  paddingY: LkProp.stringNumber(16),

  /**
   * 默认卡片额外高度 (图片下方区域，如标题)
   */
  defaultExtraHeight: LkProp.number(60),

  /**
   * 预估高度 (当无法计算时使用)
   */
  estimateHeight: LkProp.number(200),

  /**
   * 图片加载超时时间 (ms)
   */
  imageLoadTimeout: LkProp.number(5000),

  /**
   * 触底阈值 (px)
   */
  lowerThreshold: LkProp.number(200),

  /**
   * 预加载屏数 (提前加载N屏数据)
   */
  preloadScreens: LkProp.number(2),

  /**
   * 是否显示骨架屏占位
   */
  showSkeleton: LkProp.boolean(true),

  /**
   * 是否启用图片高度预计算
   */
  preloadImage: LkProp.boolean(true),

  /**
   * 图片加载失败时的占位图
   */
  errorPlaceholder: LkProp.string(''),

  /**
   * 卡片圆角 (支持 rpx/px/number)
   */
  cardRadius: LkProp.stringNumber(16),

  /**
   * 是否启用滚动动画
   */
  scrollWithAnimation: LkProp.boolean(false),

  /**
   * 是否启用回弹效果 (iOS)
   */
  bounces: LkProp.boolean(true),

  /**
   * 是否启用小程序 scroll-view enhanced
   */
  enhanced: LkProp.boolean(true),

  /**
   * 是否显示滚动条
   */
  showScrollbar: LkProp.boolean(false),
} as const;

export type WaterfallProps = ExtractPropTypes<typeof waterfallProps>;

export const waterfallEmits = {
  /** 滚动事件 */
  scroll: (_payload: { scrollTop: number; scrollHeight: number }) => true,
  /** 触底事件 */
  'reach-bottom': () => true,
  /** 需要加载更多 */
  'load-more': () => true,
  /** 卡片点击 */
  'card-click': (_item: WaterfallItem, _index: number) => true,
  /** 图片加载完成 */
  'image-loaded': (_item: WaterfallItem, _index: number) => true,
  /** 图片加载失败 */
  'image-error': (_item: WaterfallItem, _index: number) => true,
};

export type WaterfallEmits = typeof waterfallEmits;
