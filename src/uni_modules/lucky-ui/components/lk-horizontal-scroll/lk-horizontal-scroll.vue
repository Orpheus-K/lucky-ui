<script setup lang="ts">
import { computed } from 'vue';
import type { StyleValue } from 'vue';
import { horizontalScrollProps } from './horizontal-scroll.props';
import {
  resolveHorizontalScrollClass,
  resolveHorizontalScrollContainerStyle,
  resolveHorizontalScrollRootStyle,
  shouldShowHorizontalScrollbar,
} from './horizontal-scroll.utils';

defineOptions({ name: 'LkHorizontalScroll' });

const props = defineProps(horizontalScrollProps);

const rootClass = computed(() => resolveHorizontalScrollClass(props.customClass));
const rootStyle = computed(() => resolveHorizontalScrollRootStyle(props.customStyle as StyleValue));
const showScrollbar = computed(() => shouldShowHorizontalScrollbar(props.hideScrollbar));
const containerStyle = computed(() =>
  resolveHorizontalScrollContainerStyle({
    gap: props.gap,
    padding: props.padding,
  })
);
</script>

<template>
  <scroll-view
    :class="rootClass"
    :style="rootStyle"
    scroll-x
    :show-scrollbar="showScrollbar"
    enable-flex
  >
    <view class="lk-horizontal-scroll__container" :style="containerStyle">
      <slot />
    </view>
  </scroll-view>
</template>

<style lang="scss" scoped>
@use './lk-horizontal-scroll.scss';
</style>
