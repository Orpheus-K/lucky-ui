import { addUnit } from '@/uni_modules/lucky-ui/core/src/utils/unit';

export function resolveMetaRowClass(options: { align: string; customClass?: unknown }) {
  return ['lk-meta-row', `lk-meta-row--${options.align}`, options.customClass];
}

export function resolveMetaRowStyleVars(options: {
  gap: string | number;
  mainGap: string | number;
}) {
  return {
    '--lk-meta-row-gap': addUnit(options.gap),
    '--lk-meta-row-main-gap': addUnit(options.mainGap),
  };
}

export function resolveMetaRowSideStyle(width: string | number) {
  return {
    width: addUnit(width),
    minWidth: addUnit(width),
  };
}

export function normalizeMetaRowCustomStyle(customStyle: unknown) {
  if (typeof customStyle === 'string') return customStyle;
  if (customStyle && typeof customStyle === 'object') {
    return customStyle as Record<string, string | number>;
  }
  return undefined;
}

export function resolveMetaRowRootStyle(options: {
  styleVars: Record<string, string | undefined>;
  customStyle: unknown;
}) {
  return [options.styleVars, normalizeMetaRowCustomStyle(options.customStyle)];
}
