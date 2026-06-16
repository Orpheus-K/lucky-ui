import type { ExtractPropTypes, PropType } from 'vue';
import { LiteChartEffect, type LiteChartPoint } from '../../core/src/chart';
import { baseProps, LkProp } from '../common/props';

export const StatCardTrend = {
  Up: 'up',
  Down: 'down',
  Flat: 'flat',
} as const;

export type StatCardTrend = (typeof StatCardTrend)[keyof typeof StatCardTrend];

export type StatCardPoint = LiteChartPoint;

export const chartStatCardProps = {
  ...baseProps,
  /** 指标标题 */
  title: LkProp.string(''),
  /** 主数值 */
  value: LkProp.stringNumber(''),
  /** 数值单位 */
  unit: LkProp.string(''),
  /** 辅助描述 */
  description: LkProp.string(''),
  /** 趋势文案 */
  trendText: LkProp.string(''),
  /** 趋势方向 */
  trend: LkProp.enum(Object.values(StatCardTrend), StatCardTrend.Flat, 'ChartStatCard.trend'),
  /** 迷你趋势数据 */
  data: {
    type: Array as PropType<StatCardPoint[]>,
    default: () => [],
  },
  /** 是否显示迷你趋势图 */
  showChart: LkProp.boolean(true),
  /** 图表高度 */
  chartHeight: LkProp.stringNumber(112),
  /** 内嵌趋势线线宽，单位 rpx */
  chartLineWidth: LkProp.number(5),
  /** 内嵌趋势线动画时长 */
  chartAnimationDuration: LkProp.number(560),
  /** 内嵌趋势线入场动画重复次数，0 表示持续循环 */
  chartAnimationRepeat: LkProp.number(1),
  /** 内嵌趋势线动效等级 */
  chartEffect: LkProp.enum(
    Object.values(LiteChartEffect),
    LiteChartEffect.Premium,
    'ChartStatCard.chartEffect'
  ),
  /** 主题色 */
  color: LkProp.string('primary'),
} as const;

export type ChartStatCardProps = ExtractPropTypes<typeof chartStatCardProps>;
