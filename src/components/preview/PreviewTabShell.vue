<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@/stores/theme';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkNavbar from '@/uni_modules/lucky-ui/components/lk-navbar/lk-navbar.vue';

const props = withDefaults(
  defineProps<{
    title?: string;
    showNavbar?: boolean;
    contentScrollable?: boolean;
  }>(),
  {
    title: '',
    showNavbar: false,
    contentScrollable: true,
  }
);

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);
const toggleTheme = () => themeStore.toggleTheme();
</script>

<template>
  <view class="preview-tab-shell">
    <lk-navbar v-if="props.showNavbar" :title="props.title" :show-back="false">
      <template #right>
        <view class="preview-tab-shell__theme-toggle" @tap="toggleTheme">
          <lk-icon :name="isDark ? 'sun' : 'moon'" size="28" />
        </view>
      </template>
    </lk-navbar>

    <view
      class="preview-tab-shell__content"
      :class="{ 'preview-tab-shell__content--hidden': !props.contentScrollable }"
    >
      <slot />
    </view>
  </view>
</template>

<style lang="scss" scoped>
@use '@/styles/test-page.scss' as test;

.preview-tab-shell {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex !important;
  flex-direction: column !important;
  background: test.$test-bg-page;
}

.preview-tab-shell__content {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 0;
  min-height: 0;
}

.preview-tab-shell__content--hidden {
  overflow: hidden;
}

.preview-tab-shell__theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  background: test.$test-primary-soft;
  color: test.$test-primary;
  border-radius: 50%;
  transition: all 0.3s;

  &:active {
    background: test.$test-primary;
    color: test.$test-text-inverse;
    transform: scale(0.9);
  }
}
</style>
