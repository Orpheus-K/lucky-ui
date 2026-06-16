import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

/**
 * 节点状态
 */
export const TimelineItemStatus = ['default', 'active', 'completed', 'pending', 'error'] as const;
export type TimelineItemStatus = (typeof TimelineItemStatus)[number];

/**
 * 节点样式变体（可覆盖父级 dotVariant）
 */
export const TimelineItemDotVariant = ['filled', 'outlined', 'numbered'] as const;
export type TimelineItemDotVariant = (typeof TimelineItemDotVariant)[number];

export const timelineItemProps = {
  ...baseProps,

  /**
   * 节点序号（配合 dotVariant="numbered"）
   */
  index: LkProp.number(-1),

  /**
   * 节点状态
   * @value default 默认
   * @value active 进行中（高亮）
   * @value completed 已完成
   * @value pending 待处理（灰色）
   * @value error 错误
   */
  status: LkProp.enum(TimelineItemStatus, 'default', 'TimelineItem.status'),

  /**
   * 主标题
   */
  title: LkProp.string(''),

  /**
   * 副标题 / 地点等辅助信息
   */
  subtitle: LkProp.string(''),

  /**
   * 正文描述
   */
  desc: LkProp.string(''),

  /**
   * 时间文本（主，如 "09:00" 或 "Jan 12"）
   */
  time: LkProp.string(''),

  /**
   * 日期文本（辅助日期标签，如 "Today"）
   */
  date: LkProp.string(''),

  /**
   * 节点颜色（覆盖默认 accent 色）
   */
  color: LkProp.string(''),

  /**
   * 可选节点图标名（lk-icon name）
   */
  icon: LkProp.string(''),

  /**
   * 节点样式变体（覆盖父级设置）
   * 不传时跟随父级 dotVariant
   */
  dotVariant: LkProp.string(''),

  /**
   * 轴线样式变体（覆盖父级设置）
   */
  lineVariant: LkProp.string(''),

  /**
   * 轴线模式（覆盖父级设置）
   */
  lineMode: LkProp.string(''),

  /**
   * 轴线是否开启动态流动效果（覆盖父级设置）
   */
  lineAnimated: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },

  /**
   * 是否为最后一项（隐藏连接线），不传时自动判断
   */
  last: LkProp.boolean(false),
} as const;

export type TimelineItemProps = ExtractPropTypes<typeof timelineItemProps>;

export const timelineItemEmits = {
  click: (_event: Event) => true,
};
