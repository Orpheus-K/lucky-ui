import type { DividerTextPosition } from './divider.props';

export type DividerPosition = DividerTextPosition | string | number;

export function hasDividerText(options: { text: string; hasDefaultSlot: boolean }): boolean {
  return Boolean(options.text || options.hasDefaultSlot);
}

export function isStandardDividerPosition(
  position: DividerPosition
): position is DividerTextPosition {
  return position === 'left' || position === 'right' || position === 'center';
}

export function resolveDividerLineStyle(options: {
  textPosition: DividerPosition;
  hasText: boolean;
  vertical: boolean;
}): { left: Record<string, string>; right: Record<string, string> } {
  const position = options.textPosition;
  if (isStandardDividerPosition(position) || !options.hasText || options.vertical) {
    return { left: {}, right: {} };
  }

  const leftStyle: Record<string, string> = {};
  const rightStyle: Record<string, string> = {};
  const stringPosition = String(position);
  const numericValue = parseFloat(stringPosition);
  const isPercent =
    typeof position === 'number' ||
    stringPosition.endsWith('%') ||
    /^\d+(\.\d+)?$/.test(stringPosition);

  if (isPercent && !Number.isNaN(numericValue)) {
    const leftRatio = Math.max(0, Math.min(100, numericValue));
    const rightRatio = 100 - leftRatio;
    leftStyle.flex = `${leftRatio}`;
    rightStyle.flex = `${rightRatio}`;
  } else {
    leftStyle.flex = `0 0 ${stringPosition}`;
    rightStyle.flex = '1';
  }

  return { left: leftStyle, right: rightStyle };
}

export function resolveDividerClass(options: {
  textPosition: DividerPosition;
  vertical: boolean;
  dashed: boolean;
  hairline: boolean;
  hasText: boolean;
  customClass: unknown;
}) {
  const isStandardPosition = isStandardDividerPosition(options.textPosition);

  return [
    'lk-divider',
    isStandardPosition ? `lk-divider--${options.textPosition}` : 'lk-divider--custom-pos',
    {
      'is-vertical': options.vertical,
      'is-dashed': options.dashed,
      'is-hairline': options.hairline,
      'has-text': options.hasText,
    },
    options.customClass,
  ];
}
