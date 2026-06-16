import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const WatermarkVariant = {
  Text: 'text',
  Block: 'block',
  Outline: 'outline',
} as const;
export type WatermarkVariant = (typeof WatermarkVariant)[keyof typeof WatermarkVariant];

export const WatermarkSize = {
  Small: 'sm',
  Middle: 'md',
  Large: 'lg',
} as const;
export type WatermarkSize = (typeof WatermarkSize)[keyof typeof WatermarkSize];

const optionalStringNumberProp = {
  type: [String, Number] as PropType<string | number | undefined>,
  default: undefined,
};

export const watermarkProps = {
  ...baseProps,

  /** 水印内容 */
  content: {
    type: [String, Array] as PropType<string | string[]>,
    default: 'Lucky UI',
  },

  /** 尺寸 */
  size: LkProp.enum(Object.values(WatermarkSize), WatermarkSize.Middle, 'Watermark.size'),

  /** 视觉风格 */
  variant: LkProp.enum(Object.values(WatermarkVariant), WatermarkVariant.Text, 'Watermark.variant'),

  /** 是否全屏固定铺水印 */
  fullPage: LkProp.boolean(false),

  /** 是否启用水印 */
  visible: LkProp.boolean(true),

  /** 层级：默认低于 Navbar(200)、Backtop(400)、Overlay(900)、Popup(1000) */
  zIndex: LkProp.number(8),

  /** 单个水印宽度 */
  width: optionalStringNumberProp,

  /** 单个水印高度 */
  height: optionalStringNumberProp,

  /** 横向间距 */
  gapX: optionalStringNumberProp,

  /** 纵向间距 */
  gapY: optionalStringNumberProp,

  /** 行数 */
  rows: LkProp.number(6),

  /** 列数 */
  columns: LkProp.number(3),

  /** 旋转角度 */
  rotate: LkProp.number(-22),

  /** 横向倾斜角度 */
  skewX: LkProp.number(0),

  /** 纵向倾斜角度 */
  skewY: LkProp.number(0),

  /** 字体大小 */
  fontSize: optionalStringNumberProp,

  /** 字体粗细 */
  fontWeight: LkProp.stringNumber(500),

  /** 透明度 */
  opacity: LkProp.number(0.15),

  /** 自定义颜色 */
  color: LkProp.string(''),
} as const;

export type WatermarkProps = ExtractPropTypes<typeof watermarkProps>;
