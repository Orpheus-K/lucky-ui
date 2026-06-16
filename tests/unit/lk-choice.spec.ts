import { describe, expect, it } from 'vitest';
import {
  isChoiceSelected,
  resolveChoiceContainerStyle,
  resolveChoiceItemClass,
  resolveChoiceRootClass,
  resolveChoiceSelection,
} from '../../src/uni_modules/lucky-ui/components/lk-choice/choice.utils';

describe('lk-choice selection rules', () => {
  it('detects selected state for single and multiple modes', () => {
    expect(isChoiceSelected({ modelValue: 'a', value: 'a', multiple: false })).toBe(true);
    expect(isChoiceSelected({ modelValue: 'a', value: 'b', multiple: false })).toBe(false);
    expect(isChoiceSelected({ modelValue: ['a', 'b'], value: 'b', multiple: true })).toBe(true);
    expect(isChoiceSelected({ modelValue: null, value: 'b', multiple: true })).toBe(false);
  });

  it('selects and unselects single values', () => {
    expect(resolveChoiceSelection({
      modelValue: null,
      value: 'a',
      multiple: false,
      allowUnselect: true,
    })).toEqual({ changed: true, value: 'a' });

    expect(resolveChoiceSelection({
      modelValue: 'a',
      value: 'a',
      multiple: false,
      allowUnselect: true,
    })).toEqual({ changed: true, value: null });
  });

  it('keeps selected value when unselect is disabled', () => {
    expect(resolveChoiceSelection({
      modelValue: 'a',
      value: 'a',
      multiple: false,
      allowUnselect: false,
    })).toEqual({ changed: false, value: 'a' });
  });

  it('adds and removes values in multiple mode', () => {
    expect(resolveChoiceSelection({
      modelValue: ['a'],
      value: 'b',
      multiple: true,
      allowUnselect: true,
    })).toEqual({ changed: true, value: ['a', 'b'] });

    expect(resolveChoiceSelection({
      modelValue: ['a', 'b'],
      value: 'a',
      multiple: true,
      allowUnselect: true,
    })).toEqual({ changed: true, value: ['b'] });
  });

  it('builds container style from gap and object custom style', () => {
    expect(resolveChoiceContainerStyle({
      gap: 20,
      wrap: true,
      customStyle: { color: 'red' },
    })).toEqual({
      margin: '-10rpx',
      '--lk-choice-gap': '20rpx',
      color: 'red',
    });

    expect(resolveChoiceContainerStyle({
      gap: 30,
      wrap: false,
      customStyle: '',
    })).toEqual({
      margin: 0,
      gap: '30rpx',
      '--lk-choice-gap': '30rpx',
    });
  });

  it('builds item classes from size and selected state', () => {
    expect(resolveChoiceItemClass({ size: 'lg', selected: true })).toEqual([
      'lk-choice__item',
      'lk-choice__item--lg',
      { 'is-selected': true },
    ]);
  });

  it('builds root classes from wrap and custom class', () => {
    expect(resolveChoiceRootClass({ wrap: true, customClass: 'tag-row' })).toEqual([
      'lk-choice',
      { 'lk-choice--nowrap': false },
      'tag-row',
    ]);

    expect(resolveChoiceRootClass({ wrap: false, customClass: '' })).toEqual([
      'lk-choice',
      { 'lk-choice--nowrap': true },
      '',
    ]);
  });
});
