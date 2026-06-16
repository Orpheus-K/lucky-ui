<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, watch } from 'vue';
import { progressEmits, progressProps } from './progress.props';
import {
  formatProgressText,
  normalizeProgressPercentage,
  resolveProgressBarStyle,
  resolveProgressRootClass,
  resolveProgressRootStyle,
  resolveProgressTrackStyle,
  shouldEmitProgressComplete,
} from './progress.utils';

defineOptions({ name: 'LkProgress' });

const props = defineProps(progressProps);
const emit = defineEmits(progressEmits);

const pct = computed(() => normalizeProgressPercentage(props.percentage));

const trackStyle = computed(() =>
  resolveProgressTrackStyle({
    strokeWidth: props.strokeWidth,
    trackColor: props.trackColor,
  })
);

const barStyle = computed(() =>
  resolveProgressBarStyle({
    percentage: props.percentage,
    color: props.color,
    status: props.status,
  })
);

watch(pct, (value, oldValue) => {
  emit('change', value, oldValue);
  if (shouldEmitProgressComplete(value, oldValue)) emit('complete', value);
});

const rootStyle = computed<StyleValue>(() =>
  resolveProgressRootStyle(props.customStyle as StyleValue)
);
const rootClass = computed(() =>
  resolveProgressRootClass({
    striped: props.striped,
    animated: props.animated,
    customClass: props.customClass,
  })
);
const progressText = computed(() => formatProgressText(pct.value));
</script>

<template>
  <view :id="id" class="lk-progress" :class="rootClass" :style="rootStyle">
    <view class="lk-progress__track" :style="trackStyle">
      <view class="lk-progress__bar" :style="barStyle">
        <view v-if="striped" class="lk-progress__stripe" :class="{ 'is-animated': animated }" />
        <text v-if="textInside && showText" class="lk-progress__text-in">{{ progressText }}</text>
      </view>
    </view>
    <text v-if="showText && !textInside" class="lk-progress__text">{{ progressText }}</text>
  </view>
</template>

<style lang="scss">
@use './lk-progress.scss';
</style>
