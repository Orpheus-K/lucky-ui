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
  const row1 = keyboardPlateProvinces.slice(0, 9).map(k => ({ text: k, value: k }));
  const row2 = keyboardPlateProvinces.slice(9, 18).map(k => ({ text: k, value: k }));
  const row3 = keyboardPlateProvinces.slice(18, 27).map(k => ({ text: k, value: k }));
  const remaining = keyboardPlateProvinces.slice(27).map(k => ({ text: k, value: k }));

  const row4: KeyboardKey[] = [
    { text: abcText, type: 'extra', value: '__switch__', flex: 1.5 },
    ...remaining,
    { text: '', type: 'delete', flex: 1.5 },
  ];

  return [row1, row2, row3, row4];
}

export function buildPlateAlphaNumKeyboardLayout(provinceText: string): KeyboardKey[][] {
  // 数字 0~9：首行 10 个
  const numbers = keyboardPlateAlphaNum.slice(24).map(k => ({ text: k, value: k }));
  // 字母前9个 (A-J)
  const lettersRow1 = keyboardPlateAlphaNum.slice(0, 9).map(k => ({ text: k, value: k }));
  // 字母次9个 (K-T)
  const lettersRow2 = keyboardPlateAlphaNum.slice(9, 18).map(k => ({ text: k, value: k }));
  // 剩余字母 (U-Z 6个)
  const remainingLetters = keyboardPlateAlphaNum.slice(18, 24).map(k => ({ text: k, value: k }));

  const row4: KeyboardKey[] = [
    { text: provinceText, type: 'extra', value: '__switch__', flex: 1.5 },
    ...remainingLetters,
    { text: '', type: 'delete', flex: 1.5 },
  ];

  return [numbers, lettersRow1, lettersRow2, row4];
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

  const inputValue = key.value !== undefined ? key.value : key.text;

  // 小数点重复输入防护
  if (inputValue === '.' && modelValue.includes('.')) {
    return { kind: 'ignore' };
  }

  if (inputValue && canKeyboardInput(modelValue, maxLength)) {
    return { kind: 'input', input: inputValue, nextValue: modelValue + inputValue };
  }

  return { kind: 'ignore' };
}
