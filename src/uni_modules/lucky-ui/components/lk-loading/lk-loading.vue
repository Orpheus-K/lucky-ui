<script setup lang="ts">
import { computed } from 'vue';
import type { StyleValue } from 'vue';
import { loadingProps } from './loading.props';
import {
  resolveLoadingBarStyle,
  resolveLoadingHeightStyle,
  resolveLoadingRootClass,
  resolveLoadingRootStyle,
  resolveLoadingSquareStyle,
  resolveLoadingText,
  shouldRenderLoadingText,
} from './loading.utils';

defineOptions({ name: 'LkLoading' });

const props = defineProps(loadingProps);

const rootClass = computed(() =>
  resolveLoadingRootClass({
    type: props.variant,
    vertical: props.vertical,
    customClass: props.customClass,
  })
);
const rootStyle = computed(() =>
  resolveLoadingRootStyle({
    color: props.color,
    showTrack: props.showTrack,
    trackColor: props.trackColor,
    customStyle: props.customStyle as StyleValue,
  })
);
const squareStyle = computed(() => resolveLoadingSquareStyle(props.size));
const heightStyle = computed(() => resolveLoadingHeightStyle(props.size));
const barStyle = computed(() => resolveLoadingBarStyle(props.size));
const displayText = computed(() =>
  resolveLoadingText({
    type: props.variant,
    text: props.text,
  })
);
const showBottomText = computed(() =>
  shouldRenderLoadingText({
    type: props.variant,
    text: props.text,
  })
);
</script>

<template>
  <view class="lk-loading" :class="rootClass" :style="rootStyle" role="status" aria-live="polite">
    <!-- Spinner（改进） -->
    <view v-if="variant === 'spinner'" class="lk-loading__spinner" :style="squareStyle"></view>

    <!-- Circular -->
    <view v-else-if="variant === 'circular'" class="lk-loading__circular" :style="squareStyle">
      <view class="lk-loading__circular-dot"></view>
    </view>

    <!-- Dots -->
    <view v-else-if="variant === 'dots'" class="lk-loading__dots" :style="heightStyle">
      <view v-for="i in 3" :key="i" class="dot"></view>
    </view>

    <!-- Bar -->
    <view v-else-if="variant === 'bar'" class="lk-loading__bar" :style="barStyle">
      <view class="bar-indicator"></view>
    </view>

    <!-- Bounce -->
    <view v-else-if="variant === 'bounce'" class="lk-loading__bounce" :style="heightStyle">
      <view v-for="i in 3" :key="i" class="bounce-ball"></view>
    </view>

    <!-- Wave -->
    <view v-else-if="variant === 'wave'" class="lk-loading__wave" :style="heightStyle">
      <view v-for="i in 5" :key="i" class="wave-bar"></view>
    </view>

    <!-- Ring -->
    <view v-else-if="variant === 'ring'" class="lk-loading__ring" :style="squareStyle"></view>

    <!-- Ellipsis -->
    <view v-else-if="variant === 'ellipsis'" class="lk-loading__ellipsis" :style="heightStyle">
      <view v-for="i in 3" :key="i" class="ellipsis-dot"></view>
    </view>

    <!-- Text Shine -->
    <view v-else-if="variant === 'text'" class="lk-loading__text-shine">
      <text class="loading-text">{{ displayText }}</text>
    </view>

    <text v-if="showBottomText" class="lk-loading__text">{{ displayText }}</text>
  </view>
</template>

<style lang="scss">
@use './lk-loading.scss';
</style>
