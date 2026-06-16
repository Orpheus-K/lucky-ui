/**
 * 主题状态管理 (Pinia Store 封装)
 * 内部代理至 lucky-ui 的核心 theme-store 实现，保持逻辑统一且支持 DevTools。
 */
import { ref } from 'vue';
import { defineStore } from 'pinia';
import { themeStore, useTheme } from '@/uni_modules/lucky-ui/theme/src/theme-store';
import { PRESET_COLORS, DEFAULT_BRAND_COLOR } from '@/uni_modules/lucky-ui/theme/src/brand-color';
import { TabbarContainerMode } from '@/uni_modules/lucky-ui/components/lk-tabbar-container/tabbar-container.props';

const TABBAR_MODE_STORAGE_KEY = 'lk-tabbar-container-mode';

type TabbarModeValue = (typeof TabbarContainerMode)[keyof typeof TabbarContainerMode];

function readStoredTabbarMode(): TabbarModeValue {
  try {
    const raw = uni.getStorageSync(TABBAR_MODE_STORAGE_KEY);
    if (typeof raw !== 'string') return TabbarContainerMode.TextRaise;
    const allowed = Object.values(TabbarContainerMode) as string[];
    return allowed.includes(raw) ? (raw as TabbarModeValue) : TabbarContainerMode.TextRaise;
  } catch {
    return TabbarContainerMode.TextRaise;
  }
}

/** 与 lk-tabbar-container 的 mode 一致，供设置页与演示同步 */
export type TabbarMode = TabbarModeValue;

export { PRESET_COLORS, DEFAULT_BRAND_COLOR };

export const useThemeStore = defineStore('theme', () => {
  const {
    theme,
    isDark,
    themeClass,
    brandColor,
    brandStyleVars,
    setTheme,
    toggleTheme,
    setBrandColor,
  } = useTheme();

  const tabbarMode = ref<TabbarModeValue>(readStoredTabbarMode());

  function init() {
    themeStore.init();
    tabbarMode.value = readStoredTabbarMode();
  }

  function setTabbarMode(mode: TabbarModeValue) {
    if (tabbarMode.value === mode) return;
    tabbarMode.value = mode;
    try {
      uni.setStorageSync(TABBAR_MODE_STORAGE_KEY, mode);
    } catch (e) {
      console.error('Tabbar mode persistence failed', e);
    }
  }

  return {
    theme,
    isDark,
    themeClass,
    brandColor,
    brandStyleVars,
    setTheme,
    toggleTheme,
    setBrandColor,
    init,
    tabbarMode,
    setTabbarMode,
  };
});
