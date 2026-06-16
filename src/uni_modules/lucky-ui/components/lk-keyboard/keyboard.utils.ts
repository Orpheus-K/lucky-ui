import type { StyleValue } from 'vue';
import {
  KeyboardType,
  type KeyboardKey,
  type KeyboardType as KeyboardTypeValue,
} from './keyboard.props';

export type KeyboardPlateMode = 'province' | 'alphanum';

export interface KeyboardNumberLayoutOptions {
  random?: boolean;
  showDot?: boolean;
  extraKey?: string;
  showDelete?: boolean;
  randomFn?: () => number;
}

export interface KeyboardLayoutOptions extends KeyboardNumberLayoutOptions {
  type: KeyboardTypeValue;
  keys: KeyboardKey[][];
  plateMode: KeyboardPlateMode;
  abcText: string;
  provinceText: string;
}

export type KeyboardPressAction =
  | { kind: 'ignore' }
  | { kind: 'delete'; nextValue: string }
  | { kind: 'confirm' }
  | { kind: 'switch'; nextPlateMode: KeyboardPlateMode }
  | { kind: 'input'; input: string; nextValue: string };

export const keyboardPlateProvinces = [
  '京',
  '津',
  '沪',
  '渝',
  '冀',
  '豫',
  '云',
  '辽',
  '黑',
  '湘',
  '皖',
  '鲁',
  '新',
  '苏',
  '浙',
  '赣',
  '鄂',
  '桂',
  '甘',
  '晋',
  '蒙',
  '陕',
  '吉',
  '闽',
  '贵',
  '粤',
  '青',
  '藏',
  '川',
  '宁',
  '琼',
];

export const keyboardPlateAlphaNum = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'M',
  'N',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
];

export function generateKeyboardNumberKeys(
  options: {
    random?: boolean;
    randomFn?: () => number;
  } = {}
): string[] {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  if (!options.random) return digits;

  const randomFn = options.randomFn || Math.random;
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }

  return digits;
}

export function buildNumberKeyboardLayout(
  options: KeyboardNumberLayoutOptions = {}
): KeyboardKey[][] {
  const digits = generateKeyboardNumberKeys(options);

  return [
    [
      { text: digits[0], value: digits[0] },
      { text: digits[1], value: digits[1] },
      { text: digits[2], value: digits[2] },
    ],
    [
      { text: digits[3], value: digits[3] },
      { text: digits[4], value: digits[4] },
      { text: digits[5], value: digits[5] },
    ],
    [
      { text: digits[6], value: digits[6] },
      { text: digits[7], value: digits[7] },
      { text: digits[8], value: digits[8] },
    ],
    [
      options.showDot
        ? { text: '.', value: '.' }
        : options.extraKey
          ? { text: options.extraKey, value: options.extraKey, type: 'extra' }
          : { text: '', type: 'empty' },
      { text: '0', value: '0' },
      options.showDelete === false ? { text: '', type: 'empty' } : { text: '', type: 'delete' },
    ],
  ];
}

export function buildIdCardKeyboardLayout(
  options: {
    random?: boolean;
    randomFn?: () => number;
  } = {}
): KeyboardKey[][] {
  const layout = buildNumberKeyboardLayout({ ...options, showDelete: true });
  return [
    ...layout.slice(0, 3),
    [
      { text: 'X', value: 'X' },
      { text: '0', value: '0' },
      { text: '', type: 'delete' },
    ],
  ];
}

export function buildKeyboardRows(keys: string[], itemsPerRow: number): KeyboardKey[][] {
  const rows: KeyboardKey[][] = [];

  for (let i = 0; i < keys.length; i += itemsPerRow) {
    rows.push(
      keys.slice(i, i + itemsPerRow).map(key => ({
        text: key,
        value: key,
      }))
    );
  }

  return rows;
}

export function buildPlateProvinceKeyboardLayout(abcText: string): KeyboardKey[][] {
  return [
    ...buildKeyboardRows(keyboardPlateProvinces, 10),
    [
      { text: abcText, type: 'extra', value: '__switch__' },
      { text: '', type: 'delete' },
    ],
  ];
}

export function buildPlateAlphaNumKeyboardLayout(provinceText: string): KeyboardKey[][] {
  return [
    ...buildKeyboardRows(keyboardPlateAlphaNum, 10),
    [
      { text: provinceText, type: 'extra', value: '__switch__' },
      { text: '', type: 'delete' },
    ],
  ];
}

export function resolveKeyboardLayout(options: KeyboardLayoutOptions): KeyboardKey[][] {
  switch (options.type) {
    case KeyboardType.Number:
      return buildNumberKeyboardLayout(options);
    case KeyboardType.IdCard:
      return buildIdCardKeyboardLayout(options);
    case KeyboardType.Plate:
      return options.plateMode === 'province'
        ? buildPlateProvinceKeyboardLayout(options.abcText)
        : buildPlateAlphaNumKeyboardLayout(options.provinceText);
    case KeyboardType.Custom:
      return options.keys;
    default:
      return buildNumberKeyboardLayout(options);
  }
}

export function canKeyboardInput(modelValue: string, maxLength: number): boolean {
  return maxLength <= 0 || modelValue.length < maxLength;
}

export function getNextKeyboardPlateMode(mode: KeyboardPlateMode): KeyboardPlateMode {
  return mode === 'province' ? 'alphanum' : 'province';
}

export function resolveKeyboardPressAction(options: {
  key: KeyboardKey;
  modelValue: string;
  maxLength: number;
  plateMode: KeyboardPlateMode;
}): KeyboardPressAction {
  const { key, modelValue, maxLength, plateMode } = options;

  if (key.disabled || key.type === 'empty') return { kind: 'ignore' };

  if (key.type === 'delete') {
    return {
      kind: 'delete',
      nextValue: modelValue.length > 0 ? modelValue.slice(0, -1) : modelValue,
    };
  }

  if (key.type === 'confirm') return { kind: 'confirm' };

  if (key.value === '__switch__') {
    return { kind: 'switch', nextPlateMode: getNextKeyboardPlateMode(plateMode) };
  }

  if (key.value && canKeyboardInput(modelValue, maxLength)) {
    return { kind: 'input', input: key.value, nextValue: modelValue + key.value };
  }

  return { kind: 'ignore' };
}

export function resolveKeyboardClass(options: {
  type: string;
  isVisible: boolean;
  blur: boolean;
  customClass?: unknown;
}) {
  return [
    'lk-keyboard',
    `lk-keyboard--${options.type}`,
    {
      'is-visible': options.isVisible,
      'is-blur': options.blur,
    },
    options.customClass,
  ];
}

export function resolveKeyboardStyle(options: {
  zIndex: number;
  safeAreaInsetBottom: boolean;
  safeBottom: number;
  customStyle?: StyleValue;
}): StyleValue {
  return [
    {
      zIndex: options.zIndex,
      paddingBottom: options.safeAreaInsetBottom ? `${options.safeBottom}px` : '0',
    },
    options.customStyle || '',
  ] as StyleValue;
}

export function resolveKeyboardKeyClass(key: KeyboardKey, customClass?: unknown) {
  return [
    'lk-keyboard__key',
    {
      'lk-keyboard__key--delete': key.type === 'delete',
      'lk-keyboard__key--confirm': key.type === 'confirm',
      'lk-keyboard__key--extra': key.type === 'extra',
      'lk-keyboard__key--empty': key.type === 'empty',
      'lk-keyboard__key--disabled': key.disabled,
      'lk-keyboard__key--wide': (key.flex || 1) > 1,
    },
    customClass,
    key.className,
  ];
}

export function resolveKeyboardKeyStyle(key: KeyboardKey, customStyle?: StyleValue): StyleValue {
  const baseStyle = key.flex && key.flex !== 1 ? { flex: key.flex } : {};
  return [baseStyle, customStyle || '', key.style || ''] as StyleValue;
}
