import type { ExtractPropTypes } from 'vue';
import { baseProps, LkProp } from '../common/props';

/**
 * 时间轴排列方向
 */
export const TimelineDirection = ['vertical', 'horizontal'] as const;
export type TimelineDirection = (typeof TimelineDirection)[number];

/**
 * 节点默认样式变体
 */
export const TimelineDotVariant = ['filled', 'outlined', 'numbered'] as const;
export type TimelineDotVariant = (typeof TimelineDotVariant)[number];

/**
 * 轴线样式变体
 */
export const TimelineLineVariant = ['solid', 'dashed', 'dotted'] as const;
export type TimelineLineVariant = (typeof TimelineLineVariant)[number];

/**
 * 轴线模式
 */
export const TimelineLineMode = ['normal', 'streaming'] as const;
export type TimelineLineMode = (typeof TimelineLineMode)[number];

export const timelineProps = {
  ...baseProps,

  /**
   * 排列方向
   * @value vertical 垂直（默认）
   * @value horizontal 水平滚动
   */
  direction: LkProp.enum(TimelineDirection, 'vertical', 'Timeline.direction'),

  /**
   * 节点总数（用于同步依次流光动效）
   */
  total: LkProp.number(4),

  /**
   * 是否显示连接线
   */
  showLine: LkProp.boolean(true),

  /**
   * 轴线样式变体
   * @value solid 实线（默认）
   * @value dashed 虚线
   * @value dotted 点线
   */
  lineVariant: LkProp.enum(TimelineLineVariant, 'solid', 'Timeline.lineVariant'),

  /**
   * 轴线模式
   * @value normal 普通（默认）
   * @value streaming 主题色流光特效
   */
  lineMode: LkProp.enum(TimelineLineMode, 'normal', 'Timeline.lineMode'),

  /**
   * 是否开启动态流动效果
   */
  lineAnimated: LkProp.boolean(false),

  /**
   * 激活节点索引（0-based），-1 表示不高亮
   */
  activeIndex: LkProp.number(-1),

  /**
   * 节点样式变体
   * @value filled 实心圆（默认）
   * @value outlined 空心圆描边
   * @value numbered 数字序号
   */
  dotVariant: LkProp.enum(TimelineDotVariant, 'filled', 'Timeline.dotVariant'),
} as const;

export type TimelineProps = ExtractPropTypes<typeof timelineProps>;
