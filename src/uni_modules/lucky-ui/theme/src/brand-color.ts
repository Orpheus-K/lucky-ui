/**
 * Lucky UI 品牌色工具
 */
import { Locale } from '../../locale';

const LEVELS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

/**
 * HEX 转 RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return match
    ? { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) }
    : null;
}

/**
 * 生成色阶
 */
export function generateShade(baseColor: string, level: number): string {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return baseColor;

  const { r, g, b } = rgb;
  if (level === 600) return baseColor;

  if (level < 600) {
    const ratio = ((600 - level) / 500) * 0.85;
    return `rgb(${Math.round(r + (255 - r) * ratio)}, ${Math.round(g + (255 - g) * ratio)}, ${Math.round(b + (255 - b) * ratio)})`;
  } else {
    const ratio = ((level - 600) / 300) * 0.6;
    return `rgb(${Math.round(r * (1 - ratio))}, ${Math.round(g * (1 - ratio))}, ${Math.round(b * (1 - ratio))})`;
  }
}

/**
 * 生成品牌色变量
 */
export function generateBrandVars(color: string): Record<string, string> {
  const vars: Record<string, string> = {};
  const rgb = hexToRgb(color);

  LEVELS.forEach(level => {
    vars[`--lk-brand-${level}`] = generateShade(color, level);
  });

  if (rgb) {
    vars['--lk-brand-rgb'] = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  }

  return vars;
}

/**
 * 应用品牌色到 DOM
 */
export function applyBrandColor(color: string): void {
  // #ifdef H5
  if (typeof document === 'undefined') return;
  const vars = generateBrandVars(color);
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  // #endif

  try {
    uni.setStorageSync('lk-brand-color', color);
  } catch {
    // ignore
  }
}

/**
 * 加载保存的品牌色
 */
export function loadBrandColor(): string | null {
  try {
    return uni.getStorageSync('lk-brand-color') || null;
  } catch {
    return null;
  }
}

/**
 * 默认品牌色
 */
export const DEFAULT_BRAND_COLOR = '#6965db';

/**
 * 预设品牌色
 */
export const PRESET_COLORS = [
  {
    get name() {
      return Locale.t('lk.theme.colors.fantasyPurple');
    },
    value: '#6965db',
  },
  {
    get name() {
      return Locale.t('lk.theme.colors.auroraBlue');
    },
    value: '#1890ff',
  },
  {
    get name() {
      return Locale.t('lk.theme.colors.emerald');
    },
    value: '#52c41a',
  },
  {
    get name() {
      return Locale.t('lk.theme.colors.vibrantOrange');
    },
    value: '#fa8c16',
  },
  {
    get name() {
      return Locale.t('lk.theme.colors.chinaRed');
    },
    value: '#f5222d',
  },
  {
    get name() {
      return Locale.t('lk.theme.colors.rosePink');
    },
    value: '#eb2f96',
  },
  {
    get name() {
      return Locale.t('lk.theme.colors.geekCyan');
    },
    value: '#13c2c2',
  },
] as const;
