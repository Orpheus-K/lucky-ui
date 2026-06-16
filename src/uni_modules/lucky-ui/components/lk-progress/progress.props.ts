import type { ExtractPropTypes } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const progressProps = {
  ...baseProps,

  /** 进度百分比 */
  percentage: LkProp.number(0),

  /** 是否显示条纹 */
  striped: LkProp.boolean(false),

  /** 是否动画 */
  animated: LkProp.boolean(false),

  /** 文字是否显示在进度条内 */
  textInside: LkProp.boolean(false),

  /** 是否显示文字 */
  showText: LkProp.boolean(true),

  /** 进度条高度（rpx） */
  strokeWidth: LkProp.number(12),

  /** 颜色 */
  color: LkProp.string(''),

  /** 轨道颜色 */
  trackColor: LkProp.string(''),

  /**
   * 状态
   * @value success 成功
   * @value warning 警告
   * @value error 错误
   */
  status: LkProp.string(''),
} as const;

export type ProgressProps = ExtractPropTypes<typeof progressProps>;

export const progressEmits = {
  change: (_percentage: number, _oldPercentage?: number) => true,
  complete: (_percentage: number) => true,
};
