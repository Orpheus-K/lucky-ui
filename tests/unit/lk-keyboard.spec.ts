import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  keyboardProps,
  KeyboardType,
  type KeyboardKey,
} from '../../src/uni_modules/lucky-ui/components/lk-keyboard/keyboard.props';
import {
  buildIdCardKeyboardLayout,
  buildNumberKeyboardLayout,
  buildPlateAlphaNumKeyboardLayout,
  buildPlateProvinceKeyboardLayout,
  canKeyboardInput,
  generateKeyboardNumberKeys,
  getNextKeyboardPlateMode,
  resolveKeyboardLayout,
  resolveKeyboardPressAction,
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
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '1',
    ]);
  });

  it('builds id-card and plate layouts', () => {
    expect(buildIdCardKeyboardLayout()[3]).toEqual([
      { text: 'X', value: 'X' },
      { text: '0', value: '0' },
      { text: '', type: 'delete' },
    ]);

    const provinceLayout = buildPlateProvinceKeyboardLayout('ABC');
    expect(provinceLayout.length).toBe(4);
    expect(provinceLayout[0][0]).toEqual({ text: '京', value: '京' });
    expect(provinceLayout[3][0]).toEqual({
      text: 'ABC',
      type: 'extra',
      value: '__switch__',
      flex: 1.5,
    });
    expect(provinceLayout[3].at(-1)).toEqual({
      text: '',
      type: 'delete',
      flex: 1.5,
    });

    const alphaNumLayout = buildPlateAlphaNumKeyboardLayout('省份');
    expect(alphaNumLayout.length).toBe(4);
    expect(alphaNumLayout[0][0]).toEqual({ text: '0', value: '0' });
    expect(alphaNumLayout[3][0]).toEqual({
      text: '省份',
      type: 'extra',
      value: '__switch__',
      flex: 1.5,
    });
    expect(alphaNumLayout[3].at(-1)).toEqual({
      text: '',
      type: 'delete',
      flex: 1.5,
    });
  });

  it('resolves current layout by keyboard type', () => {
    const customKeys: KeyboardKey[][] = [[{ text: 'OK', value: 'ok', type: 'confirm' }]];

    expect(
      resolveKeyboardLayout({
        type: KeyboardType.Custom,
        keys: customKeys,
        plateMode: 'province',
        abcText: 'ABC',
        provinceText: '省份',
      })
    ).toBe(customKeys);

    expect(
      resolveKeyboardLayout({
        type: KeyboardType.Plate,
        keys: [],
        plateMode: 'alphanum',
        abcText: 'ABC',
        provinceText: '省份',
      })[0][0]
    ).toEqual({ text: '0', value: '0' });
  });

  it('resolves key press actions without emitting disabled or overflowing input', () => {
    expect(canKeyboardInput('123', 0)).toBe(true);
    expect(canKeyboardInput('123', 3)).toBe(false);
    expect(getNextKeyboardPlateMode('province')).toBe('alphanum');

    expect(
      resolveKeyboardPressAction({
        key: { text: '1', value: '1', disabled: true },
        modelValue: '',
        maxLength: 0,
        plateMode: 'province',
      })
    ).toEqual({ kind: 'ignore' });

    expect(
      resolveKeyboardPressAction({
        key: { text: '1', value: '1' },
        modelValue: '12',
        maxLength: 2,
        plateMode: 'province',
      })
    ).toEqual({ kind: 'ignore' });

    expect(
      resolveKeyboardPressAction({
        key: { text: '1', value: '1' },
        modelValue: '12',
        maxLength: 3,
        plateMode: 'province',
      })
    ).toEqual({ kind: 'input', input: '1', nextValue: '121' });

    // value 缺失时回退到 text
    expect(
      resolveKeyboardPressAction({
        key: { text: 'A' },
        modelValue: '',
        maxLength: 0,
        plateMode: 'province',
      })
    ).toEqual({ kind: 'input', input: 'A', nextValue: 'A' });

    // 小数点防重复输入
    expect(
      resolveKeyboardPressAction({
        key: { text: '.', value: '.' },
        modelValue: '12.3',
        maxLength: 0,
        plateMode: 'province',
      })
    ).toEqual({ kind: 'ignore' });

    expect(
      resolveKeyboardPressAction({
        key: { text: '', type: 'delete' },
        modelValue: '123',
        maxLength: 0,
        plateMode: 'province',
      })
    ).toEqual({ kind: 'delete', nextValue: '12' });

    expect(
      resolveKeyboardPressAction({
        key: { text: 'ABC', value: '__switch__', type: 'extra' },
        modelValue: '',
        maxLength: 0,
        plateMode: 'province',
      })
    ).toEqual({ kind: 'switch', nextPlateMode: 'alphanum' });

    expect(
      resolveKeyboardPressAction({
        key: { text: 'OK', type: 'confirm' },
        modelValue: '123',
        maxLength: 0,
        plateMode: 'province',
      })
    ).toEqual({ kind: 'confirm' });
  });

  it('uses Popup for a flat, card-free key surface', () => {
    const component = readFileSync(
      join(process.cwd(), 'src/uni_modules/lucky-ui/components/lk-keyboard/lk-keyboard.vue'),
      'utf8'
    );
    const styles = readFileSync(
      join(process.cwd(), 'src/uni_modules/lucky-ui/components/lk-keyboard/lk-keyboard.scss'),
      'utf8'
    );
    const keyBlockStart = styles.indexOf('@include e(key)');
    const keyBlockEnd = styles.indexOf('@include e(key-text)', keyBlockStart);
    const keyBlock = styles.slice(keyBlockStart, keyBlockEnd);

    expect(component).toContain("import LkPopup from '../lk-popup/lk-popup.vue'");
    expect(component).toContain('<lk-popup');
    expect(component).toContain('position="bottom"');
    expect(component).not.toContain('lk-keyboard__overlay');
    expect(component).not.toContain('getSystemInfoSync');
    expect(component).toContain("'--lk-popup-surface-bg': 'var(--lk-keyboard-bg)'");
    expect(keyBlockStart).toBeGreaterThan(-1);
    expect(keyBlockEnd).toBeGreaterThan(keyBlockStart);
    expect(keyBlock).not.toContain('background:');
    expect(keyBlock).not.toContain('border:');
    expect(keyBlock).not.toContain('box-shadow:');
    expect(styles).toContain('--kb-key-height: var(--lk-rpx-120)');
  });

  it('defaults to the minimal Popup presentation', () => {
    expect(keyboardProps.overlay.default).toBe(true);
    expect(keyboardProps.showClose.default).toBe(false);
    expect(keyboardProps.showConfirm.default).toBe(false);
  });
});
