import { describe, expect, it } from 'vitest';
import {
  getSelectListText,
  getSelectListValue,
  isSelectListOptionDisabled,
  isSelectListSelected,
  normalizeSelectListMultipleValue,
  resolveSelectListClass,
  resolveSelectListColumnCount,
  resolveSelectListItemRadius,
  resolveSelectListOptionClass,
  resolveSelectListSelection,
  resolveSelectListStyle,
} from '../../src/uni_modules/lucky-ui/components/lk-select-list/select-list.utils';

describe('lk-select-list option and selection rules', () => {
  const option = {
    label: '标准版',
    value: 'pro',
    description: '适合团队',
    disabled: false,
    id: 7,
    title: '自定义标题',
  };

  it('clamps columns and normalizes item radius', () => {
    expect(resolveSelectListColumnCount(0)).toBe(1);
    expect(resolveSelectListColumnCount(2.8)).toBe(2);
    expect(resolveSelectListColumnCount(9)).toBe(4);
    expect(resolveSelectListItemRadius(16)).toBe('16rpx');
    expect(resolveSelectListItemRadius('var(--radius)')).toBe('var(--radius)');
    expect(resolveSelectListItemRadius('')).toBe('');
  });

  it('merges grid and active color variables into object or string styles', () => {
    expect(resolveSelectListStyle({
      customStyle: { color: 'red' },
      columnCount: 2,
      itemRadius: '16rpx',
      activeColor: '#14b8a6',
    })).toEqual({
      color: 'red',
      '--lk-select-list-columns': '2',
      '--lk-select-list-item-radius': '16rpx',
      '--lk-select-list-selected-border': '#14b8a6',
      '--lk-select-list-icon-color': '#14b8a6',
      '--lk-select-list-selected-color': '#14b8a6',
    });

    expect(resolveSelectListStyle({
      customStyle: 'padding: 8rpx',
      columnCount: 2,
      itemRadius: '',
      activeColor: '',
    })).toBe('padding: 8rpx;--lk-select-list-columns: 2');
  });

  it('reads values and display text from custom keys', () => {
    expect(getSelectListValue(option, 'id')).toBe(7);
    expect(getSelectListText(option, 'title')).toBe('自定义标题');
    expect(getSelectListText(option, 'missing')).toBe('');
  });

  it('detects disabled and selected state', () => {
    expect(isSelectListOptionDisabled({
      option,
      disabled: false,
      disabledKey: 'disabled',
    })).toBe(false);
    expect(isSelectListOptionDisabled({
      option,
      disabled: true,
      disabledKey: 'disabled',
    })).toBe(true);
    expect(isSelectListSelected({
      option,
      valueKey: 'value',
      modelValue: 'pro',
      multiple: false,
    })).toBe(true);
    expect(isSelectListSelected({
      option,
      valueKey: 'value',
      modelValue: ['basic', 'pro'],
      multiple: true,
    })).toBe(true);
  });

  it('normalizes multiple values without mutating the source array', () => {
    const source = ['a', 'b'];
    const copy = normalizeSelectListMultipleValue(source);

    copy.push('c');

    expect(source).toEqual(['a', 'b']);
    expect(normalizeSelectListMultipleValue('a')).toEqual([]);
  });

  it('resolves single and multiple selection transitions', () => {
    expect(resolveSelectListSelection({
      option,
      valueKey: 'value',
      modelValue: '',
      multiple: false,
      max: 0,
      disabled: false,
    })).toEqual({ type: 'select', value: 'pro', selected: true });

    expect(resolveSelectListSelection({
      option,
      valueKey: 'value',
      modelValue: 'pro',
      multiple: false,
      max: 0,
      disabled: false,
    })).toEqual({ type: 'unchanged' });

    expect(resolveSelectListSelection({
      option,
      valueKey: 'value',
      modelValue: ['basic'],
      multiple: true,
      max: 2,
      disabled: false,
    })).toEqual({ type: 'select', value: ['basic', 'pro'], selected: true });

    expect(resolveSelectListSelection({
      option,
      valueKey: 'value',
      modelValue: ['pro'],
      multiple: true,
      max: 1,
      disabled: false,
    })).toEqual({ type: 'select', value: [], selected: false });

    expect(resolveSelectListSelection({
      option,
      valueKey: 'value',
      modelValue: ['basic'],
      multiple: true,
      max: 1,
      disabled: false,
    })).toEqual({ type: 'overlimit' });
  });

  it('builds root and option classes', () => {
    expect(resolveSelectListClass({
      size: 'lg',
      inset: true,
      disabled: false,
      bordered: false,
      selectedBg: false,
      selectedBorder: true,
      columnCount: 3,
      customClass: 'custom',
    })).toEqual([
      'lk-select-list',
      'lk-select-list--lg',
      {
        'is-inset': true,
        'is-disabled': false,
        'is-borderless': true,
        'is-selected-bg-disabled': true,
        'is-selected-border-disabled': false,
        'is-grid': true,
      },
      'custom',
    ]);

    expect(resolveSelectListOptionClass({
      selected: true,
      disabled: true,
    })).toEqual([
      'lk-select-list__item',
      {
        'is-selected': true,
        'is-disabled': true,
      },
    ]);
  });
});
