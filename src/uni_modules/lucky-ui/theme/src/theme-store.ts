/**
 * Lucky UI 主题管理
 * 提供主题切换、品牌色变量与小程序系统 UI 同步。
 */
import { ref, computed, readonly } from 'vue';

export type Theme = 'light' | 'dark';

/** 无本地记录时的默认主题 */
export const DEFAULT_THEME: Theme = 'dark';

const THEME_STORAGE_KEY = 'lk-theme';
const BRAND_COLOR_STORAGE_KEY = 'lk-brand-color';
const DEFAULT_BRAND_COLOR = '#6965db';
const SYSTEM_UI_THEME = {
  light: {
    backgroundColor: '#f4f5f9',
    navigationBarBackgroundColor: '#ffffff',
    frontColor: '#000000',
  },
  dark: {
    backgroundColor: '#0f1014',
    navigationBarBackgroundColor: '#1a1a1a',
    frontColor: '#ffffff',
  },
} as const;

function readStorageValue(key: string): unknown {
  try {
    return uni.getStorageSync(key);
  } catch {
    return undefined;
  }
}

function readStoredTheme(): Theme {
  const savedTheme = readStorageValue(THEME_STORAGE_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
  return DEFAULT_THEME;
}

function readStoredBrandColor(): string {
  const savedColor = readStorageValue(BRAND_COLOR_STORAGE_KEY);
  return typeof savedColor === 'string' && savedColor ? savedColor : DEFAULT_BRAND_COLOR;
}

const _theme = ref<Theme>(readStoredTheme());
const _isSwitching = ref(false);
const _brandColor = ref<string>(readStoredBrandColor());
let switchingTimer: ReturnType<typeof setTimeout> | null = null;

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
function generateShade(baseColor: string, level: number): string {
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
 * 生成品牌色 CSS 变量
 */
function generateBrandVars(color: string): Record<string, string> {
  const vars: Record<string, string> = {};
  const rgb = hexToRgb(color);
  const levels = [100, 200, 300, 400, 500, 600, 700, 800, 900];

  levels.forEach(level => {
    vars[`--lk-brand-${level}`] = generateShade(color, level);
  });

  if (rgb) {
    vars['--lk-brand-rgb'] = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  }
  return vars;
}

/**
 * 序列化 CSS 变量为内联样式
 */
function serializeVars(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
}

/**
 * 持久化数据
 */
function persistData() {
  try {
    uni.setStorageSync(THEME_STORAGE_KEY, _theme.value);
    uni.setStorageSync(BRAND_COLOR_STORAGE_KEY, _brandColor.value);
  } catch (e) {
    console.error('Theme persistence failed', e);
  }
}

/**
 * 应用样式到 DOM (H5 端)
 */
function applyToDOM() {
  // #ifdef H5
  if (typeof document !== 'undefined') {
    const root = document.documentElement;

    // 应用主题类名
    root.classList.remove('lk-theme-light', 'lk-theme-dark');
    root.classList.add(`lk-theme-${_theme.value}`);

    if (_isSwitching.value) {
      root.classList.add('lk-theme-switching');
    } else {
      root.classList.remove('lk-theme-switching');
    }

    root.setAttribute('data-theme', _theme.value);
    root.style.colorScheme = _theme.value;

    // 应用品牌色变量
    const brandVars = generateBrandVars(_brandColor.value);
    Object.entries(brandVars).forEach(([k, v]) => {
      root.style.setProperty(k, v);
    });
  }
  // #endif
}

/**
 * 应用系统 UI 设置 (小程序端)
 */
function applySystemUI() {
  // #ifdef MP
  const ui = SYSTEM_UI_THEME[_theme.value];

  uni.setBackgroundColor?.({
    backgroundColor: ui.backgroundColor,
    backgroundColorTop: ui.navigationBarBackgroundColor,
    backgroundColorBottom: ui.backgroundColor,
    fail: () => {},
  });

  uni.setNavigationBarColor?.({
    frontColor: ui.frontColor,
    backgroundColor: ui.navigationBarBackgroundColor,
    animation: { duration: 0, timingFunc: 'linear' },
    fail: () => {},
  });
  // #endif
}

/**
 * 执行主题切换
 */
function performSetTheme(t: Theme) {
  if (_theme.value === t) return;

  if (switchingTimer) {
    clearTimeout(switchingTimer);
    switchingTimer = null;
  }

  _isSwitching.value = true;
  applyToDOM();

  // 先落禁用过渡类，再切换主题变量。
  const switchDelay = 32;

  setTimeout(() => {
    _theme.value = t;
    applyToDOM();
    applySystemUI();
    persistData();

    // 保留短暂窗口，避免主题变量切换触发全局过渡。
    switchingTimer = setTimeout(() => {
      _isSwitching.value = false;
      applyToDOM();
      switchingTimer = null;
    }, 250);
  }, switchDelay);
}

/**
 * 初始化主题系统
 */
function initTheme() {
  _theme.value = readStoredTheme();
  _brandColor.value = readStoredBrandColor();

  applyToDOM();
  applySystemUI();
}

/**
 * 设置品牌色
 */
function setBrandColor(color: string) {
  if (_brandColor.value === color) return;
  _brandColor.value = color;
  applyToDOM();
  persistData();
}

/**
 * 主题 Composable
 */
export function useTheme() {
  const theme = computed(() => _theme.value);
  const isDark = computed(() => _theme.value === 'dark');
  const themeClass = computed(() => {
    const base = `lk-theme-${_theme.value}`;
    return _isSwitching.value ? `${base} lk-theme-switching` : base;
  });

  // 品牌色 CSS 变量字符串，用于内联 style 绑定
  const brandStyleVars = computed(() => {
    return serializeVars(generateBrandVars(_brandColor.value));
  });

  return {
    theme: readonly(theme),
    isDark: readonly(isDark),
    themeClass,
    brandStyleVars,
    setTheme: performSetTheme,
    toggleTheme: () => performSetTheme(_theme.value === 'light' ? 'dark' : 'light'),
    brandColor: readonly(_brandColor),
    setBrandColor,
  };
}

/**
 * 全局 Store 对象 (非 setup 环境)
 */
export const themeStore = {
  get theme() {
    return _theme.value;
  },
  get isDark() {
    return _theme.value === 'dark';
  },
  get themeClass() {
    const base = `lk-theme-${_theme.value}`;
    return _isSwitching.value ? `${base} lk-theme-switching` : base;
  },
  get brandColor() {
    return _brandColor.value;
  },
  get brandStyleVars() {
    return serializeVars(generateBrandVars(_brandColor.value));
  },
  setTheme: performSetTheme,
  toggleTheme() {
    performSetTheme(_theme.value === 'light' ? 'dark' : 'light');
  },
  setBrandColor,
  init: initTheme,
};

// 自动初始化
// #ifdef H5
if (typeof window !== 'undefined') {
  initTheme();
}
// #endif
