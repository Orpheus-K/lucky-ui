<script setup lang="ts">
import { computed } from 'vue';
import type { StyleValue } from 'vue';
import { dropdownDividerProps } from './dropdown.props';

defineOptions({ name: 'LkDropdownDivider' });

const props = defineProps(dropdownDividerProps);

const dividerClass = computed(() => [
  'lk-dropdown-divider',
  {
    'is-inset': props.inset,
  },
  props.customClass,
]);
const dividerStyle = computed<StyleValue>(() => props.customStyle as StyleValue);
</script>

<template>
  <view :id="id" :class="dividerClass" :style="dividerStyle" />
</template>

<style lang="scss">
@use './lk-dropdown.scss';
</style>
