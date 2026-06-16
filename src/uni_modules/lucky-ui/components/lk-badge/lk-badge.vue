<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed } from 'vue';
import { badgeEmits, badgeProps } from './badge.props';
import {
  resolveBadgeClass,
  resolveBadgeClickPayload,
  resolveBadgeDisplayValue,
  resolveBadgeStyle,
  shouldShowBadge,
} from './badge.utils';
defineOptions({ name: 'LkBadge' });

const props = defineProps(badgeProps);
const emit = defineEmits(badgeEmits);

const displayValue = computed(() =>
  resolveBadgeDisplayValue({
    value: props.value,
    max: props.max,
    dot: props.dot,
  })
);

const visible = computed(() =>
  shouldShowBadge({
    hidden: props.hidden,
    dot: props.dot,
    value: props.value,
  })
);

/** 小程序端使用直出样式，避免语义色被样式隔离影响 */
const badgeStyle = computed(() =>
  resolveBadgeStyle({
    offset: props.offset as [number, number],
    color: props.color,
    bgColor: props.bgColor,
    type: props.type,
  })
);

const mergedBadgeStyle = computed<StyleValue>(() => [
  badgeStyle.value,
  props.customStyle as StyleValue,
]);

const badgeClass = computed(() =>
  resolveBadgeClass({
    type: props.type,
    dot: props.dot,
    customClass: props.customClass,
  })
);

function onClick(event: unknown) {
  emit(
    'click',
    resolveBadgeClickPayload({
      value: props.value,
      displayValue: displayValue.value,
      event,
    })
  );
}
</script>

<template>
  <view :id="id" class="lk-badge-wrapper">
    <slot />
    <view
      v-if="visible"
      class="lk-badge"
      :class="badgeClass"
      :style="mergedBadgeStyle"
      @tap="onClick"
    >
      <text v-if="!dot">{{ displayValue }}</text>
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-badge.scss';
</style>
