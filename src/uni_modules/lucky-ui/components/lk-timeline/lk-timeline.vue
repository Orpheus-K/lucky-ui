<script setup lang="ts">
import { computed, provide } from 'vue';
import type { StyleValue } from 'vue';
import { timelineProps } from './timeline.props';
import { resolveTimelineContext, resolveTimelineRootClass } from './timeline.utils';

defineOptions({ name: 'LkTimeline' });

const props = defineProps(timelineProps);

const ctx = computed(() =>
  resolveTimelineContext({
    direction: props.direction,
    total: props.total,
    showLine: props.showLine,
    activeIndex: props.activeIndex,
    dotVariant: props.dotVariant,
    lineVariant: props.lineVariant,
    lineMode: props.lineMode,
    lineAnimated: props.lineAnimated,
  })
);

provide('LkTimelineCtx', ctx);

const rootClass = computed(() => resolveTimelineRootClass(props.direction, props.customClass));
const rootStyle = computed<StyleValue>(() => props.customStyle as StyleValue);
</script>

<template>
  <view :class="rootClass" :style="rootStyle" role="list">
    <slot />
  </view>
</template>

<style lang="scss">
@use './lk-timeline.scss';
</style>
