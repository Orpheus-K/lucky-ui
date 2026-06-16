import { createSSRApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

export function createApp() {
  const app = createSSRApp(App);

  // 注册 Pinia
  const pinia = createPinia();
  app.use(pinia);

  // 全局 mixin - 确保 tabBar 始终隐藏（作为 App.vue onLaunch 的补充）
  app.mixin({
    onShow() {
      // 静默隐藏，不需要判断页面类型
      uni.hideTabBar({ animation: false, fail: () => {} });
    },
  });

  return {
    app,
  };
}
