import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export interface LineChartPoint {
  label?: string;
  value: number;
}

export const chartLineProps = {
  ...baseProps,

  /** 数据 */
  data: {
    type: Array as PropType<LineChartPoint[]>,
    default: () => [],
  },

  /** 容器高度（rpx 或 css 字符串） */
  height: LkProp.stringNumber(320),

  /** 内边距（rpx） */
  padding: LkProp.number(24),

  /** 线宽（rpx） */
  lineWidth: LkProp.number(6),

  /** 线条是否使用渐变（从左到右） */
  gradient: LkProp.boolean(false),

  /** 是否填充到 x 轴的面积渐变（类似瀑布） */
  areaGradient: LkProp.boolean(true),

  /** 动画时长（ms） */
  animationDuration: LkProp.number(700),

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

export type ChartLineProps = ExtractPropTypes<typeof chartLineProps>;

export const chartLineEmits = {
  hoverChange: (_index: number) => true,
};
