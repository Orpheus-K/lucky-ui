export type RGB = { r: number; g: number; b: number };

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function toHexChannel(n: number) {
  const v = Math.max(0, Math.min(255, Math.round(n)));
  return v.toString(16).padStart(2, '0');
}

export function rgbToHex(rgb: RGB) {
  return `#${toHexChannel(rgb.r)}${toHexChannel(rgb.g)}${toHexChannel(rgb.b)}`;
}

export function hexToRgb(hex: string): RGB | null {
  const raw = hex.trim();
  const m = raw.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!m) return null;
  let v = m[1];
  if (v.length === 3)
    v = v
      .split('')
      .map(c => c + c)
      .join('');
  const n = parseInt(v, 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

export function mixRgb(a: RGB, b: RGB, aWeight: number): RGB {
  const w = clamp01(aWeight);
  return {
    r: a.r * w + b.r * (1 - w),
    g: a.g * w + b.g * (1 - w),
    b: a.b * w + b.b * (1 - w),
  };
}

export function rgbaFromHex(hex: string, alpha: number) {
  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  const a = clamp01(alpha);
  return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${a})`;
}

export function cssColorToRgb(color: string): RGB | null {
  const hex = hexToRgb(color);
  if (hex) return hex;

  const raw = color.trim();
  const match = raw.match(/^rgba?\((.*)\)$/i);
  if (!match) return null;

  const channels = match[1]
    .replace(/\//g, ' ')
    .split(/[,\s]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map(value => Number.parseFloat(value));

  if (channels.length < 3 || channels.some(value => !Number.isFinite(value))) return null;
  return {
    r: channels[0],
    g: channels[1],
    b: channels[2],
  };
}

export function rgbaFromColor(color: string, alpha: number, fallback = '#000000') {
  const rgb = cssColorToRgb(color) ?? hexToRgb(fallback) ?? { r: 0, g: 0, b: 0 };
  const a = clamp01(alpha);
  return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${a})`;
}

export function generateBrandShade(brandBaseHex: string, level: number): string {
  // 对齐 theme/src/tokens/_colors.scss 的算法：以 600 为基准色
  const base = hexToRgb(brandBaseHex) ?? { r: 105, g: 101, b: 219 }; // #6965db
  const white: RGB = { r: 255, g: 255, b: 255 };
  const black: RGB = { r: 0, g: 0, b: 0 };

  if (level === 600) return rgbToHex(base);

  if (level < 600) {
    const ratio = ((600 - level) / 500) * 0.85; // 100 级别混合 85% 白色
    return rgbToHex(mixRgb(white, base, ratio));
  }

  const ratio = ((level - 600) / 400) * 0.7; // 1000 级别混合 70% 黑色
  return rgbToHex(mixRgb(black, base, ratio));
}

function resolveCssColorValue(value: string, source?: unknown, depth = 0): string | null {
  const raw = value.trim();
  if (!raw || depth > 8) return null;

  const match = raw.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/);
  if (!match) return raw;

  return (
    getCssVarColor(match[1], source, depth + 1) ||
    (match[2] ? resolveCssColorValue(match[2], source, depth + 1) : null)
  );
}

export function getCssVarColor(varName: string, source?: unknown, depth = 0): string | null {
  let result: string | null = null;

  // ⚠️可能存在平台差异：只有 H5 可以读取 document 上的 CSS 变量，小程序端返回 null 走默认色阶。
  // #ifdef H5
  try {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const targets: Element[] = [];
      if (typeof Element !== 'undefined' && source instanceof Element) targets.push(source);
      if (document.documentElement && !targets.includes(document.documentElement)) {
        targets.push(document.documentElement);
      }

      for (const target of targets) {
        const val = getComputedStyle(target).getPropertyValue(varName).trim();
        const resolved = val ? resolveCssColorValue(val, target, depth) : null;
        if (resolved) {
          result = resolved;
          break;
        }
      }
    }
  } catch {
    result = null;
  }
  // #endif

  return result;
}

export function resolveCanvasCssColor(options: {
  source?: unknown;
  varName: string;
  fallback: string;
  alpha?: number;
}): string {
  const color = getCssVarColor(options.varName, options.source) || options.fallback;
  if (options.alpha === undefined || options.alpha >= 1) return color;
  return rgbaFromColor(color, options.alpha, options.fallback);
}

export function resolveBrandBaseColor(): string {
  // H5: 尝试读取真实主题色；其他端 fallback 到设计令牌默认品牌基色
  const css =
    getCssVarColor('--lk-chart-primary') ||
    getCssVarColor('--color-brand-primary') ||
    getCssVarColor('--lk-color-primary');
  const rgb = css ? css.trim() : '';
  // 只在能解析成 hex 时才用（避免返回 rgb()/var() 导致 canvas 不识别）
  if (rgb && rgb.startsWith('#')) return rgb;
  return '#6965db';
}

export function buildBrandPalette(brandBaseHex: string) {
  const base = brandBaseHex || '#6965db';
  return {
    brand100: generateBrandShade(base, 100),
    brand200: generateBrandShade(base, 200),
    brand300: generateBrandShade(base, 300),
    brand400: generateBrandShade(base, 400),
    brand500: generateBrandShade(base, 500),
    brand600: generateBrandShade(base, 600),
    brand700: generateBrandShade(base, 700),
    brand800: generateBrandShade(base, 800),
  };
}
