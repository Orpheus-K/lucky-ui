<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';
import { useThemeStore } from '@/stores/theme';
import { generateBrandVars } from '@/uni_modules/lucky-ui/theme/src/brand-color';
// #ifdef MP-WEIXIN
// 仅微信小程序需要通过 loadFontFace 注入字体
import { initLkIconsFont } from '@/uni_modules/lucky-ui/utils/init-lk-icons';
import { LK_ICONS_WOFF_BASE64 } from '@/uni_modules/lucky-ui/components/lk-icon/fonts/lk-icons.base64';
// #endif

// #ifdef H5
try {
  const savedTheme = uni.getStorageSync('lk-theme');
  const savedBrandColor = uni.getStorageSync('lk-brand-color');
  const initialTheme = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'dark';
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.classList.add('lk-theme-booting');
    root.classList.remove('lk-theme-light', 'lk-theme-dark');
    root.classList.add(`lk-theme-${initialTheme}`);
    root.setAttribute('data-theme', initialTheme);
    root.style.colorScheme = initialTheme;

    if (typeof savedBrandColor === 'string' && savedBrandColor) {
      Object.entries(generateBrandVars(savedBrandColor)).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }
} catch {
  // ignore bootstrap theme errors
}
// #endif

onLaunch(async () => {
  // 立即隐藏原生 tabBar，防止闪烁
  uni.hideTabBar({ animation: false, fail: () => {} });

  // #ifdef MP-WEIXIN
  // 初始化图标字体（微信小程序通过 loadFontFace 加载）
  await initLkIconsFont({ source: 'base64', data: LK_ICONS_WOFF_BASE64, format: 'woff' });
  // #endif

  // 初始化主题 Store（恢复保存的主题和品牌色）
  const themeStore = useThemeStore();
  themeStore.init();

  // #ifdef H5
  // 首屏主题完成后再启用过渡，避免输入框边框在初始化阶段闪烁
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.requestAnimationFrame(() => {
      const root = document.documentElement;
      root.classList.remove('lk-theme-booting');
    });
  }
  // #endif
});
</script>

<style lang="scss">
@use '@/uni_modules/lucky-ui/theme/src/index.scss';
@use '@/styles/test-page.scss' as test;

/* 彻底隐藏原生 tabBar，防止加载时闪烁 */
/* #ifdef H5 */
uni-tabbar,
.uni-tabbar {
  display: none !important;
  height: 0 !important;
  max-height: 0 !important;
  min-height: 0 !important;
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
  overflow: hidden !important;
  position: absolute !important;
  left: -9999px !important;
  z-index: -1 !important;
}
/* #endif */

/* #ifdef MP-WEIXIN */
.weui-tabbar,
.wx-tabbar,
wx-tabbar {
  display: none !important;
  height: 0 !important;
  max-height: 0 !important;
  visibility: hidden !important;
  opacity: 0 !important;
}
/* #endif */
</style>
