<script setup lang="ts">
import { computed } from 'vue';
import type { StyleValue } from 'vue';
import { skeletonProps } from './skeleton.props';
import {
  resolveSkeletonAnimatedClass,
  resolveSkeletonAvatarStyle,
  resolveSkeletonHostStyle,
  resolveSkeletonRootClass,
  resolveSkeletonRowStyle,
  resolveSkeletonTitleStyle,
} from './skeleton.utils';
defineOptions({ name: 'LkSkeleton' });

const props = defineProps(skeletonProps);

const hostStyle = computed(() =>
  resolveSkeletonHostStyle({
    duration: props.duration,
    easing: props.easing,
    customStyle: props.customStyle as StyleValue,
  })
);
const rootClass = computed(() => resolveSkeletonRootClass(props.customClass));
const avatarStyle = computed(() =>
  resolveSkeletonAvatarStyle({
    avatarSize: props.avatarSize,
    round: props.round,
  })
);
const titleStyle = computed(() =>
  resolveSkeletonTitleStyle({
    titleWidth: props.titleWidth,
    titleHeight: props.titleHeight,
  })
);
const animatedClass = computed(() => resolveSkeletonAnimatedClass(props.animated));
</script>

<template>
  <view v-if="loading" :class="rootClass" :style="hostStyle">
    <view
      v-if="avatar"
      class="lk-skeleton__avatar"
      :class="animatedClass"
      :style="avatarStyle"
    ></view>
    <view class="lk-skeleton__content">
      <view v-if="title" class="lk-skeleton__title" :class="animatedClass" :style="titleStyle" />
      <view
        v-for="rowIndex in rows"
        :key="rowIndex"
        class="lk-skeleton__row"
        :style="
          resolveSkeletonRowStyle({
            rowWidth,
            rowHeight,
            index: rowIndex - 1,
          })
        "
        :class="animatedClass"
      />
    </view>
  </view>
  <view v-else>
    <slot />
  </view>
</template>

<style lang="scss">
@use './lk-skeleton.scss';
</style>
