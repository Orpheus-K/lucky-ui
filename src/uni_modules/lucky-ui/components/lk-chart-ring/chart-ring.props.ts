import type { ExtractPropTypes, PropType } from 'vue';
import { LiteChartEffect } from '../../core/src/chart';
import { baseProps, LkProp } from '../common/props';

export interface RingChartSegment {
  label?: string;
  value: number;
  color?: string;
}

export const chartRingProps = {
  ...baseProps,
  /** 单值模式的当前值 */
  value: LkProp.number(0),
  /** 单值模式的最大值 */
  max: LkProp.number(100),
  /** 多段占比数据，传入后优先于 value/max */
  segments: {
    type: Array as PropType<RingChartSegment[]>,
    default: () => [],
  },
  /** 容器高度 */
  height: LkProp.stringNumber(240),
  /** 圆环厚度，单位 rpx */
  strokeWidth: LkProp.number(24),
  /** 内边距，单位 rpx */
  padding: LkProp.number(20),
  /** 是否显示底轨 */
  showTrack: LkProp.boolean(true),
  /** 中心主标题 */
  title: LkProp.string(''),
  /** 中心副标题 */
  subtitle: LkProp.string(''),
  /** 是否显示中心文字 */
  showCenter: LkProp.boolean(true),
  /** 动画时长 */
  animationDuration: LkProp.number(700),
  /** 入场动画重复次数，0 表示持续循环 */
  animationRepeat: LkProp.number(1),
  /** 图表特效等级 */
  effect: LkProp.enum(Object.values(LiteChartEffect), LiteChartEffect.Premium, 'ChartRing.effect'),
  /** 图表特效周期 */
  effectDuration: LkProp.number(2600),
} as const;

export type ChartRingProps = ExtractPropTypes<typeof chartRingProps>;
