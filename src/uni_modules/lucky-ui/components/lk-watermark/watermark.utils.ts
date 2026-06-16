import type { StyleValue } from 'vue';
import { addUnit } from '@/uni_modules/lucky-ui/core/src/utils/unit';
import type { WatermarkSize, WatermarkVariant } from './watermark.props';

export const DEFAULT_WATERMARK_SIZE_MAP = {
  sm: { width: 170, height: 112, fontSize: 20, gapX: 40, gapY: 34 },
  md: { width: 260, height: 168, fontSize: 24, gapX: 60, gapY: 48 },
  lg: { width: 340, height: 224, fontSize: 32, gapX: 82, gapY: 64 },
} as const;

export type WatermarkSizeParams = {
  width?: string | number;
  height?: string | number;
  fontSize?: string | number;
  gapX?: string | number;
  gapY?: string | number;
};

export function normalizeWatermarkContent(content: string | string[]): string[] {
  return (Array.isArray(content) ? content : [content]).filter(item => item !== '');
}

export function resolveWatermarkParams(
  size: WatermarkSize,
  overrides: WatermarkSizeParams
): Required<WatermarkSizeParams> {
  const sizeConfig = DEFAULT_WATERMARK_SIZE_MAP[size] || DEFAULT_WATERMARK_SIZE_MAP.md;

  return {
    width: overrides.width ?? sizeConfig.width,
    height: overrides.height ?? sizeConfig.height,
    fontSize: overrides.fontSize ?? sizeConfig.fontSize,
    gapX: overrides.gapX ?? sizeConfig.gapX,
    gapY: overrides.gapY ?? sizeConfig.gapY,
  };
}

export function resolveWatermarkCellCount(rows: number, columns: number): number {
  return Math.max(1, rows) * Math.max(1, columns);
}

export function resolveWatermarkItems(rows: number, columns: number): number[] {
  return Array.from({ length: resolveWatermarkCellCount(rows, columns) }, (_, index) => index);
}

export function resolveWatermarkClass(options: {
  variant: WatermarkVariant;
  size: WatermarkSize;
  customClass?: string | object | Array<string | object>;
  fullPage: boolean;
}) {
  return [
    'lk-watermark',
    `lk-watermark--${options.variant}`,
    `is-size-${options.size}`,
    options.customClass,
    {
      'is-full-page': options.fullPage,
    },
  ];
}

export function resolveWatermarkRootStyle(
  customStyle: string | Record<string, unknown>
): StyleValue {
  return customStyle as StyleValue;
}

export function resolveWatermarkLayerStyle(options: {
  zIndex: number;
  color?: string;
  opacity: number;
  columns: number;
  params: Required<WatermarkSizeParams>;
}): StyleValue {
  return {
    zIndex: options.zIndex,
    color: options.color || undefined,
    opacity: options.opacity,
    gap: `${addUnit(options.params.gapY)} ${addUnit(options.params.gapX)}`,
    gridTemplateColumns: `repeat(${Math.max(1, options.columns)}, ${addUnit(options.params.width)})`,
  };
}

export function resolveWatermarkItemStyle(options: {
  params: Required<WatermarkSizeParams>;
  rotate: number;
  skewX: number;
  skewY: number;
  fontWeight: string | number;
}): StyleValue {
  return {
    width: addUnit(options.params.width),
    height: addUnit(options.params.height),
    transform: `rotate(${options.rotate}deg) skew(${options.skewX}deg, ${options.skewY}deg)`,
    fontSize: addUnit(options.params.fontSize),
    fontWeight: options.fontWeight,
  };
}
