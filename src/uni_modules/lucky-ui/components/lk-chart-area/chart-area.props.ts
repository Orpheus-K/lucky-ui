import type { ExtractPropTypes, PropType } from 'vue';
import { LiteChartEffect, type LiteChartPoint } from '../../core/src/chart';
import { baseProps, LkProp } from '../common/props';

export type AreaChartPoint = LiteChartPoint;

export const chartAreaProps = {
  ...baseProps,
  /** 趋势数据 */
  data: {
    type: Array as PropType<AreaChartPoint[]>,
    default: () => [],
  },
  /** 容器高度 */
  height: LkProp.stringNumber(300),
  /** 内边距，单位 rpx */
  padding: LkProp.number(28),
  /** 线宽，单位 rpx */
  lineWidth: LkProp.number(5),
  /** 主题色，支持 primary 或直接传入 canvas 可识别颜色 */
  color: LkProp.string('primary'),
  /** 是否显示柔和网格线 */
  showGrid: LkProp.boolean(true),
  /** 是否显示 X 轴标签 */
  showXAxisLabel: LkProp.boolean(false),
  /** 是否显示触摸提示 */
  tooltip: LkProp.boolean(true),
  /** 默认高亮索引 */
  defaultIndex: LkProp.number(-1),
  /** 动画时长 */
  animationDuration: LkProp.number(700),
  /** 图表特效等级 */
  effect: LkProp.enum(Object.values(LiteChartEffect), LiteChartEffect.Premium, 'ChartArea.effect'),
  /** 图表特效周期 */
  effectDuration: LkProp.number(2800),
} as const;

export type ChartAreaProps = ExtractPropTypes<typeof chartAreaProps>;

export const chartAreaEmits = {
  hoverChange: (_index: number) => true,
};
