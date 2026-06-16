import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export interface PieChartSlice {
  label?: string;
  value: number;
  color?: string;
}

export const chartPieProps = {
  ...baseProps,

  /** 数据 */
  data: {
    type: Array as PropType<PieChartSlice[]>,
    default: () => [],
  },

  /** 容器高度（rpx 或 css 字符串） */
  height: LkProp.stringNumber(320),

  /** 内边距（rpx） */
  padding: LkProp.number(24),

  /** 圆环模式 */
  donut: LkProp.boolean(true),

  /** 圆环厚度（rpx） */
  donutWidth: LkProp.number(28),

  /** 是否渲染圆环底轨（提升单一扇区辨识度） */
  showTrack: LkProp.boolean(true),

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

  /** 是否在中心绘制信息（避免只看到一个圆圈） */
  showCenterText: LkProp.boolean(true),

  /** 中心标题（不传则显示 Total） */
  centerTitle: LkProp.string(''),

  /** 高亮脉冲动效（触摸/轮播切换时更有反馈） */
  highlightPulse: LkProp.boolean(true),
} as const;

export type ChartPieProps = ExtractPropTypes<typeof chartPieProps>;

export const chartPieEmits = {
  hoverChange: (_index: number) => true,
};
