<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed } from 'vue';
import { formGroupProps } from './form-group.props';

defineOptions({ name: 'LkFormGroup' });
const props = defineProps(formGroupProps);

const cls = computed(() => [
  'lk-form-group',
  {
    'lk-form-group--card': props.card,
  },
  props.customClass,
]);

const rootStyle = computed(() => props.customStyle as StyleValue);
</script>

<template>
  <view :id="id" :class="cls" :style="rootStyle">
    <view v-if="title || $slots.title" class="lk-form-group__title">
      <slot name="title">
        <text class="lk-form-group__title-text">{{ title }}</text>
      </slot>
    </view>
    <view class="lk-form-group__content">
      <slot />
    </view>
  </view>
</template>

<style lang="scss">
@use './index.scss';
</style>
