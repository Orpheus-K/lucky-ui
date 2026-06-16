<script setup lang="ts">
import { computed, markRaw } from 'vue';
import { useThemeStore } from '@/stores/theme';
import type { TabConfig } from '@/uni_modules/lucky-ui/core/src/tabbar-container';

// 同步导入首页（首屏需要立即显示）
import HomeTab from './tabs/home-tab.vue';
// 非 H5 平台不支持动态 import()（App 使用 iife 格式不兼容代码分包），统一静态导入
import CartTab from './tabs/cart-tab.vue';
import DetailTab from './tabs/detail-tab.vue';
import MineTab from './tabs/mine-tab.vue';
import OverviewTab from './tabs/overview-tab.vue';

const themeStore = useThemeStore();
const themeClass = computed(() => themeStore.themeClass);
const brandStyleVars = computed(() => themeStore.brandStyleVars);

// Tab 配置（预览 Tab 置首，便于首屏展示组件库）
const tabConfig: TabConfig[] = [
  {
    id: 'overview',
    label: '预览',
    icon: 'grid',
    activeIconFill: true,
    keepAlive: true,
  },
  {
    id: 'home',
    label: '首页',
    icon: 'house',
    activeIconFill: true,
    keepAlive: true,
  },
  {
    id: 'cart',
    label: '智言',
    icon: 'lightning-charge',
    activeIconFill: true,
    keepAlive: true,
  },
  {
    id: 'detail',
    label: '详情',
    icon: 'list',
    activeIconFill: false,
    keepAlive: true,
  },
  {
    id: 'mine',
    label: '我的',
    icon: 'gear',
    activeIconFill: false,
    keepAlive: true,
  },
];

const tabComponents: Record<string, typeof HomeTab> = {
  overview: OverviewTab,
  home: HomeTab,
  cart: CartTab,
  detail: DetailTab,
  mine: MineTab,
};

tabConfig.forEach(tab => {
  const component = tabComponents[tab.id];
  if (component) {
    tab.component = markRaw(component);
  }
});

const handleTabChange = (tabId: string) => {
  console.log('[App] Tab changed to:', tabId);
};
</script>

<template>
  <view class="app-main" :class="themeClass" :style="brandStyleVars">
    <lk-tabbar-container
      class="app-main__tabbar"
      style="
        display: flex;
        flex-direction: column;
        flex: 1;
        width: 100%;
        height: 100%;
        min-height: 0;
      "
      :tabs="tabConfig"
      :mode="themeStore.tabbarMode"
      default-tab="overview"
      :panel-scrollable="false"
      @change="handleTabChange"
    >
      <!-- #ifdef MP-WEIXIN -->
      <template #tab-overview>
        <overview-tab
          class="app-main__tab-view"
          style="display: flex; flex-direction: column; width: 100%; height: 100%; min-height: 0"
        />
      </template>
      <template #tab-home>
        <home-tab
          class="app-main__tab-view"
          style="display: flex; flex-direction: column; width: 100%; height: 100%; min-height: 0"
        />
      </template>
      <template #tab-cart>
        <cart-tab
          class="app-main__tab-view"
          style="display: flex; flex-direction: column; width: 100%; height: 100%; min-height: 0"
        />
      </template>
      <template #tab-detail>
        <detail-tab
          class="app-main__tab-view"
          style="display: flex; flex-direction: column; width: 100%; height: 100%; min-height: 0"
        />
      </template>
      <template #tab-mine>
        <mine-tab
          class="app-main__tab-view"
          style="display: flex; flex-direction: column; width: 100%; height: 100%; min-height: 0"
        />
      </template>
      <!-- #endif -->
    </lk-tabbar-container>
  </view>
</template>

<style lang="scss" scoped>
.app-main {
  width: 100%;
  height: 100vh;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.app-main__tabbar {
  display: block;
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.app-main__tab-view {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
