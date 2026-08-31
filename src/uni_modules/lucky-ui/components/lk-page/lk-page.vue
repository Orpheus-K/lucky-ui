<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed } from 'vue';
import { pageProps } from './page.props';
import {
  resolvePageLeftSlotStyle,
  resolvePageNavbarContentHeight,
  resolvePageReservedTopHeight,
  resolvePageRootClass,
  type PageMenuButtonInfo,
} from './page.utils';

defineOptions({ name: 'LkPage' });

const props = defineProps(pageProps);

type SysInfoLike = {
  statusBarHeight?: number;
  windowWidth?: number;
};

// 获取系统信息
const sys: SysInfoLike = typeof uni !== 'undefined' ? (uni.getSystemInfoSync() as SysInfoLike) : {};
const statusBarHeight = sys.statusBarHeight ?? 0;

// 获取胶囊按钮信息（仅小程序）
let menuButtonInfo: PageMenuButtonInfo = { height: 0, top: 0, left: 0 };
// #ifdef MP
try {
  if (typeof uni !== 'undefined' && uni.getMenuButtonBoundingClientRect) {
    const rect = uni.getMenuButtonBoundingClientRect();
    if (rect) {
      menuButtonInfo = {
        height: rect.height || 0,
        top: rect.top || 0,
        left: rect.left || 0,
      };
    }
  }
} catch {
  // ignore
}
// #endif

// 计算导航栏内容高度
// 在小程序中，导航栏高度应该与胶囊按钮对齐
const navbarContentHeight = computed(() =>
  resolvePageNavbarContentHeight({
    statusBarHeight,
    menuButtonInfo,
  })
);

// 计算预留的顶部总高度
const reservedTopHeight = computed(() =>
  resolvePageReservedTopHeight({
    statusBarHeight,
    navbarContentHeight: navbarContentHeight.value,
  })
);

// 计算左侧插槽的定位与高度样式，实现精准物理居中对齐
const leftSlotStyle = computed(() =>
  resolvePageLeftSlotStyle({
    capsuleAlign: props.capsuleAlign,
    statusBarHeight,
    navbarContentHeight: navbarContentHeight.value,
    menuButtonInfo,
    zIndex: props.zIndex,
  })
);

const rootClass = computed(() =>
  resolvePageRootClass({
    customClass: props.customClass,
    scrollable: props.scrollable,
  })
);

const rootStyle = computed(() => props.customStyle as StyleValue);
const resolvedScrollStyle = computed(() => props.scrollStyle as StyleValue);
</script>

<template>
  <view :id="id" :class="rootClass" :style="rootStyle">
    <!-- 左侧插槽：用于放置返回键、首页键等，支持胶囊对齐逻辑 -->
    <view v-if="$slots.left" class="lk-page__left-slot" :style="leftSlotStyle">
      <slot name="left" />
    </view>

    <!-- 顶部布局配置：是否预留状态栏+导航栏高度 -->
    <view
      v-if="reserveTop"
      class="lk-page__top-placeholder"
      :style="{ height: reservedTopHeight + 'px' }"
    />

    <!-- 默认插槽：页面的核心内容区域 -->
    <scroll-view
      v-if="scrollable"
      class="lk-page__scroll-view"
      :class="scrollClass"
      :style="resolvedScrollStyle"
      scroll-y
    >
      <view
        class="lk-page__content"
        :class="{ 'lk-page__content--safe-area': safeAreaBottom && !$slots.bottom }"
      >
        <slot />
      </view>
    </scroll-view>

    <view v-else class="lk-page__normal-view" :class="scrollClass" :style="resolvedScrollStyle">
      <view
        class="lk-page__content"
        :class="{ 'lk-page__content--safe-area': safeAreaBottom && !$slots.bottom }"
      >
        <slot />
      </view>
    </view>

    <!-- 底部插槽：用于放置吸底的操作栏（如提交按钮），支持底部安全区适配 -->
    <view
      v-if="$slots.bottom"
      class="lk-page__bottom-slot"
      :class="{ 'lk-page__bottom-slot--safe-area': safeAreaBottom }"
    >
      <slot name="bottom" />
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-page.scss';
</style>
