<script setup lang="ts">
import { computed } from 'vue';
import type { StyleValue } from 'vue';
import { spaceProps } from './space.props';
import { resolveSpaceAlign, resolveSpaceClass, resolveSpaceStyle } from './space.utils';

defineOptions({ name: 'LkSpace' });

const props = defineProps(spaceProps);

const style = computed(() => resolveSpaceStyle(props.gap));

const mergedAlign = computed(() => {
  return resolveSpaceAlign({
    align: props.align,
    direction: props.direction,
  });
});

const klass = computed(() =>
  resolveSpaceClass({
    direction: props.direction,
    align: mergedAlign.value,
    wrap: props.wrap,
    fill: props.fill,
  })
);
const rootClass = computed(() => ['lk-space-container', props.customClass]);
const rootStyle = computed<StyleValue>(() => props.customStyle as StyleValue);
</script>

<template>
  <view :class="rootClass" :style="rootStyle">
    <view :class="klass" :style="style">
      <slot />
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-space.scss';
</style>
