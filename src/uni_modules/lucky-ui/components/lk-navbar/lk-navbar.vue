<script setup lang="ts">
import { computed, type StyleValue } from 'vue';
import { navbarProps, navbarEmits } from './navbar.props';
import { useRipple } from '@/uni_modules/lucky-ui/composables/useRipple';
import {
  resolveNavbarContentHeight,
  resolveNavbarContentStyle,
  resolveNavbarMergedStyle,
  resolveNavbarPlaceholderStyle,
  resolveNavbarRootClass,
  resolveNavbarSafeStyle,
  shouldNavigateBack,
} from './navbar.utils';

defineOptions({ name: 'LkNavbar' });

const props = defineProps(navbarProps);
const emit = defineEmits(navbarEmits);

const {
  rippleActive: leftActive,
  rippleWaveStyle: leftRippleStyle,
  triggerRipple: triggerLeft,
} = useRipple({ selector: '.lk-navbar__left' });

const {
  rippleActive: rightActive,
  rippleWaveStyle: rightRippleStyle,
  triggerRipple: triggerRight,
} = useRipple({ selector: '.lk-navbar__right' });

type SysInfoLike = {
  statusBarHeight?: number;
  windowWidth?: number;
};

// 获取系统信息
const sys: SysInfoLike = typeof uni !== 'undefined' ? (uni.getSystemInfoSync() as SysInfoLike) : {};
const statusBarHeight = sys.statusBarHeight ?? 0;
const windowWidth: number = typeof sys.windowWidth === 'number' ? sys.windowWidth : 0;

const rootClass = computed(() =>
  resolveNavbarRootClass({
    variant: props.variant,
    titleAlign: props.titleAlign,
    customClass: props.customClass,
    fixed: props.fixed,
    border: props.border,
    shadow: props.shadow,
    background: props.background,
  })
);

const mergedStyle = computed<StyleValue>(() =>
  resolveNavbarMergedStyle({
    zIndex: props.zIndex,
    background: props.background,
    customStyle: props.customStyle as StyleValue,
  })
);

type MenuButtonInfoLike = {
  height?: number;
  top?: number;
  left?: number;
};

// 获取胶囊按钮信息（仅小程序）
let menuButtonInfo: MenuButtonInfoLike = { height: 0, top: 0 };
// #ifdef MP
if (typeof uni !== 'undefined' && uni.getMenuButtonBoundingClientRect) {
  menuButtonInfo = uni.getMenuButtonBoundingClientRect() as MenuButtonInfoLike;
}
// #endif

// 计算导航栏内容高度
// 在小程序中，导航栏高度应该与胶囊按钮对齐
const navbarContentHeight = computed(() =>
  resolveNavbarContentHeight({
    statusBarHeight,
    menuButtonInfo,
  })
);

function rpxToPx(value: number) {
  return typeof uni !== 'undefined' && typeof uni.upx2px === 'function'
    ? uni.upx2px(value)
    : value / 2;
}

const capsuleSafeStyle = computed<Record<string, string>>(() =>
  resolveNavbarSafeStyle({
    fixed: props.fixed,
    safeArea: props.safeArea,
    menuButtonLeft: menuButtonInfo.left,
    windowWidth,
    rpxToPx,
  })
);

const contentStyle = computed<StyleValue>(() =>
  resolveNavbarContentStyle({
    navbarContentHeight: navbarContentHeight.value,
    capsuleSafeStyle: capsuleSafeStyle.value,
  })
);
const placeholderStyle = computed<StyleValue>(() =>
  resolveNavbarPlaceholderStyle({
    safeArea: props.safeArea,
    statusBarHeight,
    navbarContentHeight: navbarContentHeight.value,
  })
);

function tryNavigateBack() {
  try {
    const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
    if (shouldNavigateBack(pages)) {
      uni.navigateBack({ delta: 1 });
    }
  } catch {
    // ignore
  }
}

function onBackTap(event: unknown) {
  // 点击返回图标：行为更符合直觉
  triggerLeft(event);
  emit('click-left');
  emit('back');
  tryNavigateBack();
}

function onLeftClick(event: unknown) {
  triggerLeft(event);
  emit('click-left');
}

function onRightClick(event: unknown) {
  triggerRight(event);
  emit('click-right');
}
</script>

<template>
  <view :id="id" :class="rootClass" :style="mergedStyle">
    <!-- 状态栏占位 -->
    <view
      v-if="safeArea"
      class="lk-navbar__status-bar"
      :style="[{ height: statusBarHeight + 'px' }, background ? { background } : {}]"
    />

    <!-- 导航栏内容 -->
    <view class="lk-navbar__content" :style="contentStyle">
      <view
        class="lk-navbar__left lk-ripple"
        :class="{ 'lk-ripple--active': leftActive }"
        @tap="onLeftClick"
      >
        <lk-icon
          v-if="showBack"
          :name="backIcon"
          size="36"
          class="lk-navbar__back"
          @tap.stop="onBackTap"
        />
        <text v-if="leftText" class="lk-navbar__text">{{ leftText }}</text>
        <slot name="left" />
        <view class="lk-ripple__wave" :style="leftRippleStyle" />
      </view>
      <view class="lk-navbar__center">
        <slot name="center">
          <view class="lk-navbar__title-wrap">
            <text v-if="title" class="lk-navbar__title">{{ title }}</text>
            <text v-if="subtitle" class="lk-navbar__subtitle">{{ subtitle }}</text>
          </view>
          <slot />
        </slot>
      </view>
      <view
        class="lk-navbar__right lk-ripple"
        :class="{ 'lk-ripple--active': rightActive }"
        @tap="onRightClick"
      >
        <text v-if="rightText" class="lk-navbar__text">{{ rightText }}</text>
        <slot name="right" />
        <view class="lk-ripple__wave" :style="rightRippleStyle" />
      </view>
    </view>
  </view>

  <!-- 占位符，当 fixed 时撑起高度 -->
  <view v-if="fixed && placeholder" class="lk-navbar__placeholder" :style="placeholderStyle" />
</template>

<style lang="scss">
@use './lk-navbar.scss';
</style>
