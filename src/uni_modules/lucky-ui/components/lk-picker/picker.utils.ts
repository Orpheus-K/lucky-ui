import type { PickerColumns, PickerMode, PickerOption, PickerValue } from './picker.props';

export type PickerPrimitiveValue = string | number;

const PICKER_ANIMATION_DURATION_BASE = 260;
const PICKER_ANIMATION_DURATION_MAX = 520;
const PICKER_INERTIA_TIME = 300;
const PICKER_INERTIA_DISTANCE = 15;
const PICKER_MOMENTUM_DECELERATION = 0.005;
const PICKER_VIRTUAL_THRESHOLD = 100;
const PICKER_VIRTUAL_BUFFER = 8;
const PICKER_FAST_VIRTUAL_BUFFER = 12;

export interface PickerRenderedColumn {
  options: PickerOption[];
  startIndex: number;
  offsetY: number;
  totalHeight: number;
  virtual: boolean;
}

export function normalizePickerColumns(columns: PickerColumns): PickerOption[][] {
  if (!Array.isArray(columns) || columns.length === 0) return [];
  if (Array.isArray(columns[0])) return columns as PickerOption[][];
  return [columns as PickerOption[]];
}

export function buildCascadePickerColumns(
  data: PickerOption[],
  value: PickerPrimitiveValue[]
): PickerOption[][] {
  const result: PickerOption[][] = [];
  let currentLevel = data;

  for (let i = 0; currentLevel && currentLevel.length > 0; i++) {
    result.push(currentLevel);
    const index =
      value[i] !== undefined ? currentLevel.findIndex(item => item.value === value[i]) : 0;
    const selected = currentLevel[Math.max(0, index)] || currentLevel[0];
    currentLevel = selected?.children || [];
  }

  return result;
}

export function resolvePickerColumns(options: {
  mode: PickerMode;
  columns: PickerColumns;
  innerValue: PickerPrimitiveValue[];
}): PickerOption[][] {
  if (options.mode === 'cascade' && Array.isArray(options.columns)) {
    return buildCascadePickerColumns(options.columns as PickerOption[], options.innerValue);
  }

  return normalizePickerColumns(options.columns);
}

export function syncPickerInnerValueFromModel(options: {
  mode: PickerMode;
  modelValue: PickerValue | undefined;
}): PickerPrimitiveValue[] {
  if (options.mode !== 'cascade' && options.mode !== 'multi') return [];
  return Array.isArray(options.modelValue) ? options.modelValue.slice() : [];
}

export function resolvePickerIndexes(options: {
  mode: PickerMode;
  columns: PickerOption[][];
  modelValue: PickerValue | undefined;
}): number[] {
  if (!options.columns.length) return [];

  if (options.mode === 'single') {
    const index = options.columns[0].findIndex(option => option.value === options.modelValue);
    return [Math.max(0, index)];
  }

  const value = Array.isArray(options.modelValue) ? options.modelValue : [];
  return options.columns.map((column, index) => {
    const optionIndex = column.findIndex(option => option.value === value[index]);
    return Math.max(0, optionIndex);
  });
}

export function getPickerValueByIndexes(options: {
  mode: PickerMode;
  columns: PickerOption[][];
  indexes: number[];
}): PickerValue {
  if (options.mode === 'single') {
    return options.columns[0]?.[options.indexes[0]]?.value ?? '';
  }

  return options.columns.map((column, index) => column[options.indexes[index]]?.value ?? '');
}

export function getPickerOptionsByIndexes(
  columns: PickerOption[][],
  indexes: number[]
): PickerOption[] {
  return columns
    .map((column, index) => column[indexes[index]])
    .filter((item): item is PickerOption => !!item);
}

export function resolveCascadePickerIndexes(options: {
  nextIndexes: number[];
  previousIndexes: number[];
  mode: PickerMode;
}): number[] {
  const indexes = [...options.nextIndexes];
  if (options.mode !== 'cascade') return indexes;

  for (let i = 0; i < indexes.length; i++) {
    if (indexes[i] !== options.previousIndexes[i]) {
      for (let j = i + 1; j < indexes.length; j++) {
        indexes[j] = 0;
      }
      break;
    }
  }

  return indexes;
}

export function clampPickerNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function clampPickerIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return clampPickerNumber(Math.round(index), 0, count - 1);
}

export function resolvePickerColumnOffset(index: number, itemHeight: number): number {
  return -clampPickerIndex(index, Number.MAX_SAFE_INTEGER) * itemHeight;
}

export function resolvePickerColumnOffsetByDelta(options: {
  startOffset: number;
  delta: number;
  count: number;
  itemHeight: number;
}): number {
  if (options.count <= 0 || options.itemHeight <= 0) return 0;
  const minOffset = -(options.count - 1) * options.itemHeight;
  return clampPickerNumber(options.startOffset + options.delta, minOffset, 0);
}

export function resolvePickerMomentumDistance(distance: number, duration: number): number {
  if (duration <= 0) return 0;
  const speed = Math.abs(distance / duration);
  return (speed / PICKER_MOMENTUM_DECELERATION) * (distance < 0 ? -1 : 1);
}

export function resolvePickerScrollEnd(options: {
  offset: number;
  startOffset: number;
  moveDistance: number;
  moveDuration: number;
  count: number;
  itemHeight: number;
}): { index: number; offset: number; duration: number; fast: boolean } {
  if (options.count <= 0 || options.itemHeight <= 0) {
    return { index: 0, offset: 0, duration: 0, fast: false };
  }

  let inertiaDistance = 0;
  if (
    options.moveDuration < PICKER_INERTIA_TIME &&
    Math.abs(options.moveDistance) > PICKER_INERTIA_DISTANCE
  ) {
    inertiaDistance = resolvePickerMomentumDistance(options.moveDistance, options.moveDuration);
  }

  const minOffset = -(options.count - 1) * options.itemHeight;
  const targetOffset = clampPickerNumber(options.offset + inertiaDistance, minOffset, 0);
  const index = clampPickerIndex(-targetOffset / options.itemHeight, options.count);
  const finalOffset = resolvePickerColumnOffset(index, options.itemHeight);
  const scrollDistance = Math.abs(finalOffset - options.offset);
  const scrollItems = scrollDistance / options.itemHeight;
  const duration = Math.min(
    PICKER_ANIMATION_DURATION_MAX,
    PICKER_ANIMATION_DURATION_BASE + scrollItems * 30
  );

  return {
    index,
    offset: finalOffset,
    duration,
    fast: Math.abs(inertiaDistance) > options.itemHeight * 3,
  };
}

export function resolvePickerColumnWrapperStyle(options: {
  offset: number;
  duration: number;
  itemHeight: number;
  visibleCount: number;
}): string {
  const paddingY = ((options.visibleCount - 1) / 2) * options.itemHeight;
  return [
    `transition: transform ${options.duration}ms cubic-bezier(0.215, 0.61, 0.355, 1)`,
    `transform: translate3d(0, ${options.offset}rpx, 0)`,
    `padding: ${paddingY}rpx 0`,
  ].join(';');
}

export function resolvePickerItemStyle(itemHeight: number): string {
  return `height: ${itemHeight}rpx; line-height: ${itemHeight}rpx;`;
}

export function resolvePickerRenderedColumn(options: {
  column: PickerOption[];
  offset: number;
  itemHeight: number;
  visibleCount: number;
  endOffset?: number;
  fast?: boolean;
}): PickerRenderedColumn {
  const count = options.column.length;
  const totalHeight = count * options.itemHeight;

  if (count < PICKER_VIRTUAL_THRESHOLD || options.itemHeight <= 0) {
    return {
      options: options.column,
      startIndex: 0,
      offsetY: 0,
      totalHeight,
      virtual: false,
    };
  }

  const buffer = options.fast ? PICKER_FAST_VIRTUAL_BUFFER : PICKER_VIRTUAL_BUFFER;
  const startCenter = clampPickerIndex(
    Math.floor(Math.abs(options.offset) / options.itemHeight),
    count
  );
  const endCenter =
    options.endOffset === undefined
      ? startCenter
      : clampPickerIndex(Math.floor(Math.abs(options.endOffset) / options.itemHeight), count);
  const minCenter = Math.min(startCenter, endCenter);
  const maxCenter = Math.max(startCenter, endCenter);
  const startIndex = Math.max(0, minCenter - buffer);
  const endIndex = Math.min(count, maxCenter + options.visibleCount + buffer);

  return {
    options: options.column.slice(startIndex, endIndex),
    startIndex,
    offsetY: startIndex * options.itemHeight,
    totalHeight,
    virtual: true,
  };
}

export function resolvePickerDistanceBucket(options: {
  selectedIndexes: number[];
  columnIndex: number;
  optionIndex: number;
}): 0 | 1 | 2 | 3 {
  const selected = options.selectedIndexes[options.columnIndex];
  if (selected === undefined) return 3;
  return Math.min(Math.abs(options.optionIndex - selected), 3) as 0 | 1 | 2 | 3;
}

export function resolvePickerItemLabelClass(options: {
  selectedIndexes: number[];
  columnIndex: number;
  optionIndex: number;
}): string {
  const bucket = resolvePickerDistanceBucket(options);
  return `lk-picker__item-label lk-picker__item-label--dist${bucket}`;
}

export function resolvePickerViewHeight(options: {
  itemHeight: number;
  visibleCount: number;
}): string {
  return `${options.itemHeight * options.visibleCount}rpx`;
}

export function resolvePickerViewWrapStyle(itemHeight: number): string {
  return `--lk-picker-item-height: ${itemHeight}rpx;`;
}

export function resolvePickerIndicatorStyle(itemHeight: number): string {
  return `height: ${itemHeight}rpx;`;
}

export function resolvePickerClass(options: { inline: boolean; customClass: unknown }) {
  return [
    'lk-picker',
    {
      'lk-picker--inline': options.inline,
    },
    options.customClass,
  ];
}
