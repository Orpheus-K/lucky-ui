import type { SpaceGap } from './space.props';

export type SpaceAlignValue = 'start' | 'center' | 'end' | 'baseline' | 'stretch';
export type SpaceDirectionValue = 'horizontal' | 'vertical';

export const spacePresetGapMap = { sm: 8, md: 16, lg: 24 } as const;

export function formatSpaceGap(value: string | number): string {
  if (typeof value === 'number') return `${value}rpx`;
  if (value in spacePresetGapMap) {
    return `${spacePresetGapMap[value as keyof typeof spacePresetGapMap]}rpx`;
  }
  return /^[0-9]+$/.test(String(value)) ? `${value}rpx` : String(value);
}

export function resolveSpaceGaps(gap: SpaceGap): { rowGap: string; colGap: string } {
  if (Array.isArray(gap)) {
    const colGap = formatSpaceGap(gap[0]);
    const rowGap = formatSpaceGap(gap[1] ?? gap[0]);
    return { rowGap, colGap };
  }

  const value = formatSpaceGap(gap);
  return {
    rowGap: value,
    colGap: value,
  };
}

export function resolveSpaceStyle(gap: SpaceGap): Record<string, string> {
  const { rowGap, colGap } = resolveSpaceGaps(gap);
  return {
    '--lk-space-row-gap': rowGap,
    '--lk-space-col-gap': colGap,
  };
}

export function resolveSpaceAlign(options: {
  align?: SpaceAlignValue;
  direction: SpaceDirectionValue;
}): SpaceAlignValue {
  if (options.align) return options.align;
  return options.direction === 'horizontal' ? 'center' : 'stretch';
}

export function resolveSpaceClass(options: {
  direction: SpaceDirectionValue;
  align?: SpaceAlignValue;
  wrap: boolean;
  fill: boolean;
}) {
  const mergedAlign = resolveSpaceAlign({
    align: options.align,
    direction: options.direction,
  });

  return [
    'lk-space',
    `lk-space--${options.direction}`,
    `lk-space--align-${mergedAlign}`,
    {
      'lk-space--wrap': options.wrap,
      'lk-space--fill': options.fill || options.direction === 'vertical',
    },
  ];
}
