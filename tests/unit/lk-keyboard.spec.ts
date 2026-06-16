import { describe, expect, it } from 'vitest';
import { KeyboardType, type KeyboardKey } from '../../src/uni_modules/lucky-ui/components/lk-keyboard/keyboard.props';
import {
  buildIdCardKeyboardLayout,
  buildNumberKeyboardLayout,
  buildPlateAlphaNumKeyboardLayout,
  buildPlateProvinceKeyboardLayout,
  canKeyboardInput,
  generateKeyboardNumberKeys,
  getNextKeyboardPlateMode,
  resolveKeyboardClass,
  resolveKeyboardKeyClass,
  resolveKeyboardKeyStyle,
  resolveKeyboardLayout,
  resolveKeyboardPressAction,
  resolveKeyboardStyle,
} from '../../src/uni_modules/lucky-ui/components/lk-keyboard/keyboard.utils';

describe('lk-keyboard input and layout rules', () => {
  it('builds number layout with dot, extra and delete slots', () => {
    expect(buildNumberKeyboardLayout().map(row => row.map(key => key.text))).toEqual([
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', ''],
    ]);

    expect(buildNumberKeyboardLayout({ showDot: true })[3][0]).toEqual({ text: '.', value: '.' });
    expect(buildNumberKeyboardLayout({ extraKey: '00' })[3][0]).toEqual({
      text: '00',
      value: '00',
      type: 'extra',
    });
    expect(buildNumberKeyboardLayout({ showDelete: false })[3][2]).toEqual({
      text: '',
      type: 'empty',
    });
  });

  it('supports deterministic number shuffling for random keyboard mode', () => {
    expect(generateKeyboardNumberKeys({ random: true, randomFn: () => 0 })).toEqual([
      '2', '3', '4', '5', '6', '7', '8', '9', '1',
    ]);
  });

  it('builds id-card and plate layouts', () => {
    expect(buildIdCardKeyboardLayout()[3]).toEqual([
      { text: 'X', value: 'X' },
      { text: '0', value: '0' },
      { text: '', type: 'delete' },
    ]);

    const provinceLayout = buildPlateProvinceKeyboardLayout('ABC');
    expect(provinceLayout[0][0]).toEqual({ text: '京', value: '京' });
    expect(provinceLayout.at(-1)).toEqual([
      { text: 'ABC', type: 'extra', value: '__switch__' },
      { text: '', type: 'delete' },
    ]);

    const alphaNumLayout = buildPlateAlphaNumKeyboardLayout('省份');
    expect(alphaNumLayout[0][0]).toEqual({ text: 'A', value: 'A' });
    expect(alphaNumLayout.at(-1)?.[0]).toEqual({
      text: '省份',
      type: 'extra',
      value: '__switch__',
    });
  });

  it('resolves current layout by keyboard type', () => {
    const customKeys: KeyboardKey[][] = [[{ text: 'OK', value: 'ok', type: 'confirm' }]];

    expect(resolveKeyboardLayout({
      type: KeyboardType.Custom,
      keys: customKeys,
      plateMode: 'province',
      abcText: 'ABC',
      provinceText: '省份',
    })).toBe(customKeys);

    expect(resolveKeyboardLayout({
      type: KeyboardType.Plate,
      keys: [],
      plateMode: 'alphanum',
      abcText: 'ABC',
      provinceText: '省份',
    })[0][0]).toEqual({ text: 'A', value: 'A' });
  });

  it('resolves key press actions without emitting disabled or overflowing input', () => {
    expect(canKeyboardInput('123', 0)).toBe(true);
    expect(canKeyboardInput('123', 3)).toBe(false);
    expect(getNextKeyboardPlateMode('province')).toBe('alphanum');

    expect(resolveKeyboardPressAction({
      key: { text: '1', value: '1', disabled: true },
      modelValue: '',
      maxLength: 0,
      plateMode: 'province',
    })).toEqual({ kind: 'ignore' });

    expect(resolveKeyboardPressAction({
      key: { text: '1', value: '1' },
      modelValue: '12',
      maxLength: 2,
      plateMode: 'province',
    })).toEqual({ kind: 'ignore' });

    expect(resolveKeyboardPressAction({
      key: { text: '1', value: '1' },
      modelValue: '12',
      maxLength: 3,
      plateMode: 'province',
    })).toEqual({ kind: 'input', input: '1', nextValue: '121' });

    expect(resolveKeyboardPressAction({
      key: { text: '', type: 'delete' },
      modelValue: '123',
      maxLength: 0,
      plateMode: 'province',
    })).toEqual({ kind: 'delete', nextValue: '12' });

    expect(resolveKeyboardPressAction({
      key: { text: 'ABC', value: '__switch__', type: 'extra' },
      modelValue: '',
      maxLength: 0,
      plateMode: 'province',
    })).toEqual({ kind: 'switch', nextPlateMode: 'alphanum' });

    expect(resolveKeyboardPressAction({
      key: { text: 'OK', type: 'confirm' },
      modelValue: '123',
      maxLength: 0,
      plateMode: 'province',
    })).toEqual({ kind: 'confirm' });
  });

  it('builds root and key styles', () => {
    expect(resolveKeyboardClass({
      type: 'number',
      isVisible: true,
      blur: false,
      customClass: 'custom-keyboard',
    })).toEqual([
      'lk-keyboard',
      'lk-keyboard--number',
      { 'is-visible': true, 'is-blur': false },
      'custom-keyboard',
    ]);

    expect(resolveKeyboardStyle({
      zIndex: 100,
      safeAreaInsetBottom: true,
      safeBottom: 12,
      customStyle: { backgroundColor: '#fff' },
    })).toEqual([{ zIndex: 100, paddingBottom: '12px' }, { backgroundColor: '#fff' }]);

    expect(resolveKeyboardKeyClass({ text: 'OK', type: 'confirm', flex: 2 })).toEqual([
      'lk-keyboard__key',
      {
        'lk-keyboard__key--delete': false,
        'lk-keyboard__key--confirm': true,
        'lk-keyboard__key--extra': false,
        'lk-keyboard__key--empty': false,
        'lk-keyboard__key--disabled': undefined,
        'lk-keyboard__key--wide': true,
      },
    ]);
    expect(resolveKeyboardKeyStyle({ text: 'OK', flex: 2 })).toEqual({ flex: 2 });
    expect(resolveKeyboardKeyStyle({ text: 'OK', flex: 1 })).toEqual({});
  });
});
