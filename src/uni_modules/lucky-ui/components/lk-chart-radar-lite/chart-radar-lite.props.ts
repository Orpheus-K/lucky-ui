import type { ExtractPropTypes, PropType } from 'vue';
import { LiteChartEffect } from '../../core/src/chart';
import { baseProps, LkProp } from '../common/props';

export interface RadarLiteItem {
  label: string;
  value: number;
  max?: number;
}

export const chartRadarLiteProps = {
  ...baseProps,
  /** 雷达图维度数据 */
  data: {
    type: Array as PropType<RadarLiteItem[]>,
    default: () => [],
  },
  /** 容器高度 */
  height: LkProp.stringNumber(320),
  /** 内边距，单位 rpx */
  padding: LkProp.number(42),
  /** 网格层级 */
  levels: LkProp.number(4),
  /** 默认最大值 */
  max: LkProp.number(100),
  /** 主题色，支持 primary 或直接传入 canvas 可识别颜色 */
  color: LkProp.string('primary'),
  /** 数据面描边线宽，单位 rpx */
  lineWidth: LkProp.number(2),
  /** 是否显示维度标签 */
  showLabel: LkProp.boolean(true),
  /** 是否显示顶点 */
  showPoint: LkProp.boolean(true),
  /** 动画时长 */
  animationDuration: LkProp.number(680),
  /** 入场动画重复次数，0 表示持续循环 */
  animationRepeat: LkProp.number(1),
  /** 图表特效等级 */
  effect: LkProp.enum(
    Object.values(LiteChartEffect),
    LiteChartEffect.Premium,
    'ChartRadarLite.effect'
  ),
  /** 图表特效周期 */
  effectDuration: LkProp.number(3200),
} as const;

export type ChartRadarLiteProps = ExtractPropTypes<typeof chartRadarLiteProps>;
