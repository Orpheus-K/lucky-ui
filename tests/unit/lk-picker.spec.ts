import { describe, expect, it } from 'vitest';
import {
  buildCascadePickerColumns,
  buildCascadePickerColumnsByIndexes,
  dispatchPickerCancelEvents,
  dispatchPickerConfirmEvents,
  dispatchPickerSelectionEvents,
  getPickerOptionsByIndexes,
  getPickerValueByIndexes,
  normalizePickerColumns,
  resolveCascadePickerIndexes,
  resolvePickerClass,
  resolvePickerColumnSelection,
  resolvePickerColumns,
  resolvePickerDistanceBucket,
  resolvePickerDraftSelection,
  resolvePickerIndexes,
  resolvePickerIndicatorStyle,
  resolvePickerItemLabelClass,
  resolvePickerSelectionSnapshot,
  resolvePickerViewHeight,
  resolvePickerViewWrapStyle,
  syncPickerInnerValueFromModel,
} from '../../src/uni_modules/lucky-ui/components/lk-picker/picker.utils';
import type {
  PickerOption,
  PickerValue,
} from '../../src/uni_modules/lucky-ui/components/lk-picker/picker.props';

type PickerEventRecord = [name: string, ...payload: unknown[]];

function recordPickerEvent(events: PickerEventRecord[], name: string) {
  return (...payload: unknown[]) => {
    events.push([name, ...payload]);
  };
}

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
    expect(
      buildCascadePickerColumns(cascade, ['js']).map(column => column.map(item => item.value))
    ).toEqual([
      ['zj', 'js'],
      ['nj', 'sz'],
    ]);

    expect(
      resolvePickerColumns({
        mode: 'cascade',
        columns: cascade,
        innerValue: ['zj', 'nb'],
      }).map(column => column.map(item => item.value))
    ).toEqual([
      ['zj', 'js'],
      ['hz', 'nb'],
    ]);
  });

  it('syncs draft value only for multi and cascade modes', () => {
    expect(syncPickerInnerValueFromModel({ mode: 'single', modelValue: 'bj' })).toEqual([]);
    expect(syncPickerInnerValueFromModel({ mode: 'multi', modelValue: ['bj', 2] })).toEqual([
      'bj',
      2,
    ]);
    expect(syncPickerInnerValueFromModel({ mode: 'cascade', modelValue: 'zj' })).toEqual([]);
  });

  it('resolves selected indexes for single and multi modes with fallback to first item', () => {
    expect(
      resolvePickerIndexes({
        mode: 'single',
        columns: [singleColumn],
        modelValue: 'sh',
      })
    ).toEqual([1]);
    expect(
      resolvePickerIndexes({
        mode: 'single',
        columns: [singleColumn],
        modelValue: 'missing',
      })
    ).toEqual([0]);
    expect(
      resolvePickerIndexes({
        mode: 'multi',
        columns: multiColumns,
        modelValue: ['bj', 2],
      })
    ).toEqual([0, 1]);
  });

  it('resolves values and options by indexes', () => {
    expect(
      getPickerValueByIndexes({
        mode: 'single',
        columns: [singleColumn],
        indexes: [1],
      })
    ).toBe('sh');
    expect(
      getPickerValueByIndexes({
        mode: 'multi',
        columns: multiColumns,
        indexes: [1, 0],
      })
    ).toEqual(['sh', 1]);
    expect(getPickerOptionsByIndexes(multiColumns, [1, 0]).map(item => item.label)).toEqual([
      '上海',
      '上午',
    ]);
  });

  it('resets following indexes when cascade parent changes', () => {
    expect(
      resolveCascadePickerIndexes({
        mode: 'cascade',
        previousIndexes: [0, 1, 1],
        nextIndexes: [1, 1, 1],
      })
    ).toEqual([1, 0, 0]);
    expect(
      resolveCascadePickerIndexes({
        mode: 'multi',
        previousIndexes: [0, 1],
        nextIndexes: [1, 1],
      })
    ).toEqual([1, 1]);
  });

  it('builds distance bucket and label class metadata', () => {
    expect(
      resolvePickerDistanceBucket({
        selectedIndexes: [2],
        columnIndex: 0,
        optionIndex: 2,
      })
    ).toBe(0);
    expect(
      resolvePickerDistanceBucket({
        selectedIndexes: [2],
        columnIndex: 0,
        optionIndex: 8,
      })
    ).toBe(3);
    expect(
      resolvePickerItemLabelClass({
        selectedIndexes: [1],
        columnIndex: 0,
        optionIndex: 2,
      })
    ).toBe('lk-picker__item-label lk-picker__item-label--dist1');
  });

  it('builds view styles and root classes', () => {
    expect(resolvePickerViewHeight({ itemHeight: 88, visibleCount: 5 })).toBe('440rpx');
    expect(resolvePickerViewWrapStyle(88)).toBe('--lk-picker-item-height: 88rpx;');
    expect(resolvePickerIndicatorStyle(88)).toContain('height: 88rpx');
    expect(resolvePickerClass({ inline: true, customClass: 'custom' })).toEqual([
      'lk-picker',
      { 'lk-picker--inline': true },
      'custom',
    ]);
  });
});

describe('lk-picker inline and popup commit behavior', () => {
  const singleColumn: PickerOption[] = [
    { label: '北京', value: 'bj' },
    { label: '上海', value: 'sh' },
  ];
  const multiColumns: PickerOption[][] = [
    singleColumn,
    [
      { label: '上午', value: 'am' },
      { label: '下午', value: 'pm' },
    ],
  ];
  const cascadeColumns: PickerOption[] = [
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
  const deepCascadeColumns: PickerOption[] = [
    {
      label: '旧父级',
      value: 'old-parent',
      children: [
        {
          label: '旧共享值',
          value: 'shared-child',
          children: [{ label: '旧叶子', value: 'old-leaf' }],
        },
      ],
    },
    {
      label: '新父级',
      value: 'new-parent',
      children: [
        {
          label: '新首项',
          value: 'new-first-child',
          children: [{ label: '正确叶子', value: 'correct-leaf' }],
        },
        {
          label: '新共享值',
          value: 'shared-child',
          children: [{ label: '错误分支叶子', value: 'wrong-branch-leaf' }],
        },
      ],
    },
  ];

  function dispatchSelection(
    inline: boolean,
    selection: ReturnType<typeof resolvePickerColumnSelection>,
    events: PickerEventRecord[]
  ) {
    return dispatchPickerSelectionEvents({
      inline,
      selection,
      onPick: recordPickerEvent(events, 'pick'),
      onUpdateModelValue: recordPickerEvent(events, 'update:modelValue'),
      onChange: recordPickerEvent(events, 'change'),
    });
  }

  it('rebuilds controlled draft state after model, columns and mode updates', () => {
    expect(
      resolvePickerDraftSelection({
        mode: 'single',
        columns: singleColumn,
        modelValue: 'sh',
      })
    ).toMatchObject({ innerValue: [], indexes: [1] });

    expect(
      resolvePickerDraftSelection({
        mode: 'multi',
        columns: multiColumns,
        modelValue: ['bj', 'pm'],
      })
    ).toMatchObject({ innerValue: ['bj', 'pm'], indexes: [0, 1] });

    const cascadeDraft = resolvePickerDraftSelection({
      mode: 'cascade',
      columns: cascadeColumns,
      modelValue: ['js', 'sz'],
    });
    expect(cascadeDraft.innerValue).toEqual(['js', 'sz']);
    expect(cascadeDraft.indexes).toEqual([1, 1]);
    expect(cascadeDraft.columns[1].map(option => option.value)).toEqual(['nj', 'sz']);

    expect(
      resolvePickerDraftSelection({
        mode: 'single',
        columns: [{ label: '广州', value: 'gz' }],
        modelValue: 'sh',
      }).indexes
    ).toEqual([0]);
  });

  it('commits an inline single selection once in pick-update-change order', () => {
    const selection = resolvePickerColumnSelection({
      mode: 'single',
      columns: singleColumn,
      resolvedColumns: [singleColumn],
      previousIndexes: [0],
      columnIndex: 0,
      optionIndex: 1,
    });
    const events: PickerEventRecord[] = [];

    expect(dispatchSelection(true, selection, events)).toBe(true);
    expect(events.map(([name]) => name)).toEqual(['pick', 'update:modelValue', 'change']);
    expect(events.map(([, value]) => value)).toEqual(['sh', 'sh', 'sh']);
    expect(events[0][2]).toEqual([1]);
    expect((events[0][3] as PickerOption[]).map(option => option.value)).toEqual(['sh']);
  });

  it('does not emit for an unchanged index and commits a full multi value', () => {
    const unchanged = resolvePickerColumnSelection({
      mode: 'multi',
      columns: multiColumns,
      resolvedColumns: multiColumns,
      previousIndexes: [0, 1],
      columnIndex: 0,
      optionIndex: 0,
    });
    const events: PickerEventRecord[] = [];

    expect(dispatchSelection(true, unchanged, events)).toBe(false);
    expect(events).toEqual([]);

    const changed = resolvePickerColumnSelection({
      mode: 'multi',
      columns: multiColumns,
      resolvedColumns: multiColumns,
      previousIndexes: [0, 1],
      columnIndex: 0,
      optionIndex: 1,
    });
    expect(dispatchSelection(true, changed, events)).toBe(true);
    expect(events.map(([name]) => name)).toEqual(['pick', 'update:modelValue', 'change']);
    expect(events.map(([, value]) => value)).toEqual([
      ['sh', 'pm'],
      ['sh', 'pm'],
      ['sh', 'pm'],
    ]);
  });

  it('commits the rebuilt full cascade value when a parent column changes', () => {
    const resolvedColumns = resolvePickerColumns({
      mode: 'cascade',
      columns: cascadeColumns,
      innerValue: ['zj', 'nb'],
    });
    const selection = resolvePickerColumnSelection({
      mode: 'cascade',
      columns: cascadeColumns,
      resolvedColumns,
      previousIndexes: [0, 1],
      columnIndex: 0,
      optionIndex: 1,
    });
    const events: PickerEventRecord[] = [];

    expect(selection.indexes).toEqual([1, 0]);
    expect(selection.value).toEqual(['js', 'nj']);
    expect(selection.options.map(option => option.value)).toEqual(['js', 'nj']);
    expect(dispatchSelection(true, selection, events)).toBe(true);
    expect(events.map(([name]) => name)).toEqual(['pick', 'update:modelValue', 'change']);
    expect(events.map(([, value]) => value)).toEqual([
      ['js', 'nj'],
      ['js', 'nj'],
      ['js', 'nj'],
    ]);
  });

  it('rebuilds deep cascade columns from reset indexes instead of matching stale branch values', () => {
    const resolvedColumns = resolvePickerColumns({
      mode: 'cascade',
      columns: deepCascadeColumns,
      innerValue: ['old-parent', 'shared-child', 'old-leaf'],
    });
    const selection = resolvePickerColumnSelection({
      mode: 'cascade',
      columns: deepCascadeColumns,
      resolvedColumns,
      previousIndexes: [0, 0, 0],
      columnIndex: 0,
      optionIndex: 1,
    });

    expect(selection.indexes).toEqual([1, 0, 0]);
    expect(selection.value).toEqual(['new-parent', 'new-first-child', 'correct-leaf']);
    expect(selection.options.map(option => option.value)).toEqual([
      'new-parent',
      'new-first-child',
      'correct-leaf',
    ]);
    expect(
      buildCascadePickerColumnsByIndexes(deepCascadeColumns, [1, 0, 0]).map(column =>
        column.map(option => option.value)
      )
    ).toEqual([
      ['old-parent', 'new-parent'],
      ['new-first-child', 'shared-child'],
      ['correct-leaf'],
    ]);
  });

  it('keeps popup selection as draft until confirm commits it', () => {
    const selection = resolvePickerColumnSelection({
      mode: 'single',
      columns: singleColumn,
      resolvedColumns: [singleColumn],
      previousIndexes: [0],
      columnIndex: 0,
      optionIndex: 1,
    });
    const events: PickerEventRecord[] = [];

    expect(dispatchSelection(false, selection, events)).toBe(true);
    expect(events.map(([name]) => name)).toEqual(['pick']);

    dispatchPickerConfirmEvents({
      snapshot: selection,
      onUpdateModelValue: recordPickerEvent(events, 'update:modelValue'),
      onChange: recordPickerEvent(events, 'change'),
      onConfirm: recordPickerEvent(events, 'confirm'),
      onVisibleChange: recordPickerEvent(events, 'update:visible'),
    });

    expect(events.map(([name]) => name)).toEqual([
      'pick',
      'update:modelValue',
      'change',
      'confirm',
      'update:visible',
    ]);
    expect(events[1][1]).toBe('sh');
    expect(events[4][1]).toBe(false);
  });

  it('resets popup cancel payload to the controlled value without committing', () => {
    const draft = resolvePickerDraftSelection({
      mode: 'single',
      columns: singleColumn,
      modelValue: 'bj',
    });
    const resetSnapshot = resolvePickerSelectionSnapshot({
      mode: 'single',
      columns: singleColumn,
      resolvedColumns: draft.columns,
      indexes: draft.indexes,
    });
    const events: PickerEventRecord[] = [];

    dispatchPickerCancelEvents({
      snapshot: resetSnapshot,
      onCancel: recordPickerEvent(events, 'cancel'),
      onVisibleChange: recordPickerEvent(events, 'update:visible'),
    });

    expect(events.map(([name]) => name)).toEqual(['cancel', 'update:visible']);
    expect(events[0][1]).toBe('bj');
    expect(events[1][1]).toBe(false);
    expect(events.some(([name]) => name === 'update:modelValue' || name === 'change')).toBe(false);
  });

  it('keeps callback payloads within the public PickerValue contract', () => {
    const values: PickerValue[] = [];
    const selection = resolvePickerColumnSelection({
      mode: 'single',
      columns: singleColumn,
      resolvedColumns: [singleColumn],
      previousIndexes: [0],
      columnIndex: 0,
      optionIndex: 1,
    });

    dispatchPickerSelectionEvents({
      inline: true,
      selection,
      onPick: value => values.push(value),
      onUpdateModelValue: value => values.push(value),
      onChange: value => values.push(value),
    });

    expect(values).toEqual(['sh', 'sh', 'sh']);
  });
});
