import { describe, expect, it } from 'vitest';
import {
  buildCascadePickerColumns,
  getPickerOptionsByIndexes,
  getPickerValueByIndexes,
  normalizePickerColumns,
  resolveCascadePickerIndexes,
  resolvePickerClass,
  resolvePickerColumns,
  resolvePickerDistanceBucket,
  resolvePickerIndexes,
  resolvePickerIndicatorStyle,
  resolvePickerItemLabelClass,
  resolvePickerMaskStyle,
  resolvePickerViewHeight,
  resolvePickerViewWrapStyle,
  syncPickerInnerValueFromModel,
} from '../../src/uni_modules/lucky-ui/components/lk-picker/picker.utils';
import type { PickerOption } from '../../src/uni_modules/lucky-ui/components/lk-picker/picker.props';

describe('lk-picker column and selection rules', () => {
  const singleColumn: PickerOption[] = [
    { label: '北京', value: 'bj' },
    { label: '上海', value: 'sh' },
  ];

  const multiColumns: PickerOption[][] = [
    singleColumn,
    [
      { label: '上午', value: 1 },
      { label: '下午', value: 2 },
    ],
  ];

  const cascade: PickerOption[] = [
    {
      label: '浙江',
      value: 'zj',
      children: [
        { label: '杭州', value: 'hz' },
        { label: '宁波', value: 'nb' },
      ],
    },
    {
      label: '江苏',
      value: 'js',
      children: [
        { label: '南京', value: 'nj' },
        { label: '苏州', value: 'sz' },
      ],
    },
  ];

  it('normalizes single and multiple column input', () => {
    expect(normalizePickerColumns([])).toEqual([]);
    expect(normalizePickerColumns(singleColumn)).toEqual([singleColumn]);
    expect(normalizePickerColumns(multiColumns)).toEqual(multiColumns);
  });

  it('builds cascade columns from current values', () => {
    expect(buildCascadePickerColumns(cascade, ['js']).map(column => column.map(item => item.value)))
      .toEqual([
        ['zj', 'js'],
        ['nj', 'sz'],
      ]);

    expect(resolvePickerColumns({
      mode: 'cascade',
      columns: cascade,
      innerValue: ['zj', 'nb'],
    }).map(column => column.map(item => item.value))).toEqual([
      ['zj', 'js'],
      ['hz', 'nb'],
    ]);
  });

  it('syncs draft value only for multi and cascade modes', () => {
    expect(syncPickerInnerValueFromModel({ mode: 'single', modelValue: 'bj' })).toEqual([]);
    expect(syncPickerInnerValueFromModel({ mode: 'multi', modelValue: ['bj', 2] }))
      .toEqual(['bj', 2]);
    expect(syncPickerInnerValueFromModel({ mode: 'cascade', modelValue: 'zj' })).toEqual([]);
  });

  it('resolves selected indexes for single and multi modes with fallback to first item', () => {
    expect(resolvePickerIndexes({
      mode: 'single',
      columns: [singleColumn],
      modelValue: 'sh',
    })).toEqual([1]);
    expect(resolvePickerIndexes({
      mode: 'single',
      columns: [singleColumn],
      modelValue: 'missing',
    })).toEqual([0]);
    expect(resolvePickerIndexes({
      mode: 'multi',
      columns: multiColumns,
      modelValue: ['bj', 2],
    })).toEqual([0, 1]);
  });

  it('resolves values and options by indexes', () => {
    expect(getPickerValueByIndexes({
      mode: 'single',
      columns: [singleColumn],
      indexes: [1],
    })).toBe('sh');
    expect(getPickerValueByIndexes({
      mode: 'multi',
      columns: multiColumns,
      indexes: [1, 0],
    })).toEqual(['sh', 1]);
    expect(getPickerOptionsByIndexes(multiColumns, [1, 0]).map(item => item.label))
      .toEqual(['上海', '上午']);
  });

  it('resets following indexes when cascade parent changes', () => {
    expect(resolveCascadePickerIndexes({
      mode: 'cascade',
      previousIndexes: [0, 1, 1],
      nextIndexes: [1, 1, 1],
    })).toEqual([1, 0, 0]);
    expect(resolveCascadePickerIndexes({
      mode: 'multi',
      previousIndexes: [0, 1],
      nextIndexes: [1, 1],
    })).toEqual([1, 1]);
  });

  it('builds distance bucket and label class metadata', () => {
    expect(resolvePickerDistanceBucket({
      selectedIndexes: [2],
      columnIndex: 0,
      optionIndex: 2,
    })).toBe(0);
    expect(resolvePickerDistanceBucket({
      selectedIndexes: [2],
      columnIndex: 0,
      optionIndex: 8,
    })).toBe(3);
    expect(resolvePickerItemLabelClass({
      selectedIndexes: [1],
      columnIndex: 0,
      optionIndex: 2,
    })).toBe('lk-picker__item-label lk-picker__item-label--dist1');
  });

  it('builds view styles and root classes', () => {
    expect(resolvePickerViewHeight({ itemHeight: 88, visibleCount: 5 })).toBe('440rpx');
    expect(resolvePickerViewWrapStyle(88)).toBe('--lk-picker-item-height: 88rpx;');
    expect(resolvePickerIndicatorStyle(88)).toContain('height: 88rpx');
    expect(resolvePickerMaskStyle()).toContain('background-image');
    expect(resolvePickerClass({ inline: true, customClass: 'custom' })).toEqual([
      'lk-picker',
      { 'lk-picker--inline': true },
      'custom',
    ]);
  });
});
