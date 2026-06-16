<script setup lang="ts">
import { markRaw, ref } from 'vue';
import { useThemeStore, type TabbarMode } from '@/stores/theme';
import type { TabConfig } from '@/uni_modules/lucky-ui/core/src/tabbar-container';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkTabbarContainer from '@/uni_modules/lucky-ui/components/lk-tabbar-container/lk-tabbar-container.vue';
import TabbarPreviewPane from './tabbar-preview-pane.vue';

const themeStore = useThemeStore();
const currentMode = ref<TabbarMode>(themeStore.tabbarMode);

const modeOptions: Array<{ label: string; value: TabbarMode }> = [
  { label: '基础', value: 'plain' },
  { label: '高亮块', value: 'block' },
  { label: '手电筒', value: 'flashlight' },
  { label: '浮动', value: 'float' },
  { label: '顶部标记', value: 'marker-top' },
  { label: '底部标记', value: 'marker-bottom' },
  { label: '圆点滑动', value: 'dot-slide' },
  { label: '气泡', value: 'bubble' },
  { label: '涟漪', value: 'ripple' },
  { label: '遮罩填充', value: 'mask-fill' },
  { label: '文字抬升', value: 'text-raise' },
];

const demoTabs: TabConfig[] = [
  {
    id: 'home',
    label: '首页',
    icon: 'house',
    component: markRaw(TabbarPreviewPane),
    keepAlive: true,
  },
  {
    id: 'cart',
    label: '购物车',
    icon: 'cart',
    badge: 2,
    component: markRaw(TabbarPreviewPane),
    keepAlive: true,
  },
  {
    id: 'detail',
    label: '详情',
    icon: 'list',
    component: markRaw(TabbarPreviewPane),
    keepAlive: true,
  },
  {
    id: 'mine',
    label: '我的',
    icon: 'gear',
    component: markRaw(TabbarPreviewPane),
    keepAlive: true,
  },
  {
    id: 'overview',
    label: '预览',
    icon: 'grid',
    component: markRaw(TabbarPreviewPane),
    keepAlive: true,
  },
];

const slotTabs: TabConfig[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'house',
  },
  {
    id: 'cart',
    label: 'Cart',
    icon: 'cart',
    badge: 1,
  },
  {
    id: 'mine',
    label: 'Mine',
    icon: 'gear',
  },
];

function changeMode(mode: TabbarMode) {
  currentMode.value = mode;
  themeStore.setTabbarMode(mode);
}
</script>

<template>
  <view class="tabbar-container-demo">
    <demo-block
      title="模式预览（与预览设置一致）"
      desc="这里使用与 App 预览页同一套 Tabbar 模式，包括手电筒、浮动、涟漪等。"
    >
      <scroll-view class="mode-scroll" scroll-x show-scrollbar="false">
        <view class="mode-list">
          <view
            v-for="item in modeOptions"
            :key="item.value"
            class="mode-chip"
            :class="{ 'mode-chip--active': item.value === currentMode }"
            @tap="changeMode(item.value)"
          >
            <text>{{ item.label }}</text>
          </view>
        </view>
      </scroll-view>

      <view class="tabbar-preview-shell">
        <lk-tabbar-container
          :tabs="demoTabs"
          :mode="currentMode"
          :preload-all="false"
          :preload-delay="0"
        />
      </view>
    </demo-block>

    <demo-block
      title="Safe slot render"
      desc="Use render-mode=slot, safe-mode and fixed=false for nested shells or low-effect platforms."
    >
      <view class="tabbar-safe-shell">
        <lk-tabbar-container
          :tabs="slotTabs"
          default-tab="home"
          mode="flashlight"
          render-mode="slot"
          safe-mode
          :fixed="false"
          :preload-all="false"
          :preload-delay="0"
          :panel-scrollable="false"
        >
          <template #tab-home="{ tabId, isActive }">
            <tabbar-preview-pane :tab-id="tabId" :is-active="isActive" />
          </template>
          <template #tab-cart="{ tabId, isActive }">
            <tabbar-preview-pane :tab-id="tabId" :is-active="isActive" />
          </template>
          <template #tab-mine="{ tabId, isActive }">
            <tabbar-preview-pane :tab-id="tabId" :is-active="isActive" />
          </template>
        </lk-tabbar-container>
      </view>
    </demo-block>
  </view>
</template>

<style scoped lang="scss">
.tabbar-container-demo {
  display: flex;
  flex-direction: column;

  > :not(:first-child) {
    margin-top: 24rpx;
  }
}

.mode-scroll {
  width: 100%;
  white-space: nowrap;
  margin-bottom: 20rpx;
}

.mode-list {
  display: inline-flex;

  > .mode-chip:not(:first-child) {
    margin-left: 12rpx;
  }
}

.mode-chip {
  height: 56rpx;
  padding: 0 22rpx;
  border-radius: 28rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--lk-bg-hover);
  color: var(--lk-text-secondary);
  font-size: 22rpx;

  &--active {
    background: var(--lk-color-primary-soft);
    color: var(--lk-color-primary);
  }
}

.tabbar-preview-shell {
  height: 760rpx;
  border-radius: var(--lk-radius-lg);
  overflow: hidden;
  border: 1rpx solid var(--lk-color-border-light);
}

.tabbar-safe-shell {
  height: 620rpx;
  border-radius: var(--lk-radius-lg);
  overflow: hidden;
  border: 1rpx solid var(--lk-color-border-light);
}
</style>
