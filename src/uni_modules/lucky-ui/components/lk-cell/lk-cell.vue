<script setup lang="ts">
import { computed } from 'vue';
import type { StyleValue } from 'vue';
import { cellProps, cellEmits } from './cell.props';
import { useRipple } from '@/uni_modules/lucky-ui/composables/useRipple';
import {
  resolveCellClass,
  resolveCellStyle,
  resolveCellTapAction,
  shouldTriggerCellRipple,
} from './cell.utils';

defineOptions({ name: 'LkCell' });

const props = defineProps(cellProps);
const emit = defineEmits(cellEmits);

const { rippleActive, rippleWaveStyle, triggerRipple } = useRipple({ duration: 800 });

const cellClass = computed(() =>
  resolveCellClass({
    customClass: props.customClass,
    clickable: props.clickable,
    ripple: props.ripple,
    disabled: props.disabled,
    center: props.center,
    rippleActive: rippleActive.value,
  })
);

const cellStyle = computed(() => resolveCellStyle(props.customStyle as StyleValue));

function onTap(e: unknown) {
  const action = resolveCellTapAction(props.disabled);
  if (action === 'click-disabled') {
    emit('click-disabled', e);
    return;
  }
  if (shouldTriggerCellRipple(props)) {
    triggerRipple(e);
  }
  emit('click', e);
}
</script>

<template>
  <view :id="id" class="lk-cell" :class="cellClass" :style="cellStyle" @tap="onTap">
    <view class="lk-cell__left">
      <slot name="left">
        <lk-icon v-if="icon" :name="icon" size="36" class="lk-cell__icon" />
        <view class="lk-cell__titles" :class="{ 'lk-cell__titles--with-icon': icon }">
          <view v-if="$slots.title" class="lk-cell__title">
            <slot name="title" />
          </view>
          <text v-else-if="title" class="lk-cell__title">{{ title }}</text>

          <view v-if="$slots.label" class="lk-cell__label">
            <slot name="label" />
          </view>
          <text v-else-if="label" class="lk-cell__label">{{ label }}</text>
        </view>
      </slot>
    </view>
    <view class="lk-cell__right">
      <slot name="right">
        <view v-if="$slots.value" class="lk-cell__value">
          <slot name="value" />
        </view>
        <text v-else-if="value" class="lk-cell__value">{{ value }}</text>
        <lk-icon
          v-if="arrow"
          :name="arrowName"
          size="30"
          :color="arrowColor"
          class="lk-cell__arrow"
        />
      </slot>
    </view>
    <view v-if="clickable && ripple" class="lk-ripple__wave" :style="rippleWaveStyle" />
  </view>
</template>

<style lang="scss">
@use './lk-cell.scss';
</style>
