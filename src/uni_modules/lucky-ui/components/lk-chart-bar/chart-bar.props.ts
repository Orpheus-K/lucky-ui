import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export interface BarChartItem {
  label?: string;
  value: number;
  color?: string;
}

export const chartBarProps = {
  ...baseProps,

  /** 数据 */
  data: {
    type: Array as PropType<BarChartItem[]>,
    default: () => [],
  },

  /** 容器高度（rpx 或 css 字符串），用于自动撑开父容器 */
  height: LkProp.stringNumber(320),

  /** 内边距（rpx） */
  padding: LkProp.number(24),

  /** 柱子顶部圆角（rpx） */
  barRadius: LkProp.number(16),

  /** 是否启用渐变填充 */
  gradient: LkProp.boolean(true),

  /** 柱子最大宽度（rpx），0 表示自动 */
  maxBarWidth: LkProp.number(40),

  /** 动画时长（ms） */
  animationDuration: LkProp.number(600),

  /** 是否启用触摸 tooltip */
  tooltip: LkProp.boolean(true),

  /** tooltip 常驻（无触摸也显示） */
  tooltipAlways: LkProp.boolean(false),

  /** tooltip 默认索引（常驻/初始高亮） */
  defaultIndex: LkProp.number(0),

  /** 自动轮播 tooltip */
  autoTooltip: LkProp.boolean(false),

  /** 自动轮播间隔（ms） */
  autoTooltipInterval: LkProp.number(1600),

  /** 是否渲染坐标轴与网格 */
  showAxis: LkProp.boolean(false),

  /** y 轴刻度数量 */
  yAxisTicks: LkProp.number(4),

  /** Y 轴是否根据数据最小值/最大值自适应缩放 */
  yAxisAutoScale: LkProp.boolean(true),

  /** 是否显示 x 轴标签 */
  showXAxisLabel: LkProp.boolean(false),

  /** 高亮脉冲动效（触摸/轮播切换时更有反馈） */
  highlightPulse: LkProp.boolean(true),
} as const;

export type ChartBarProps = ExtractPropTypes<typeof chartBarProps>;

export const chartBarEmits = {
  /** 触摸高亮项变化 */
  hoverChange: (_index: number) => true,
};
