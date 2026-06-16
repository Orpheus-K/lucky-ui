<script setup lang="ts">
import { computed } from 'vue';
import type { StyleValue } from 'vue';
import { baseProps } from '../common/props';
import { resolveCellGroupClass } from './cell.utils';

defineOptions({ name: 'LkCellGroup' });

const props = defineProps({
  ...baseProps,
  title: { type: String, default: '' },
  inset: { type: Boolean, default: false },
  border: { type: Boolean, default: false },
  card: { type: Boolean, default: false },
});

const groupClass = computed(() =>
  resolveCellGroupClass({
    inset: props.inset,
    card: props.card,
    border: props.border,
    customClass: props.customClass,
  })
);
const groupStyle = computed<StyleValue>(() => props.customStyle as StyleValue);
</script>

<template>
  <view class="lk-cell-group" :class="groupClass" :style="groupStyle">
    <view v-if="title" class="lk-cell-group__title">{{ title }}</view>
    <view class="lk-cell-group__body">
      <slot />
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-cell.scss';
</style>
