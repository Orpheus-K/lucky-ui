<script setup lang="ts">
import { computed } from 'vue';
import type { StyleValue } from 'vue';
import { baseProps } from '../common/props';
import { toastStore } from './toast-manager';
import LkToastItem from './lk-toast-item.vue';

defineOptions({ name: 'LkToastManager' });

const props = defineProps(baseProps);
const managerClass = computed(() => ['lk-toast-manager', props.customClass]);
const managerStyle = computed<StyleValue>(() => props.customStyle as StyleValue);
</script>

<template>
  <view :class="managerClass" :style="managerStyle">
    <lk-toast-item v-for="t in toastStore.list" :key="t.id" :item="t" />
  </view>
</template>

<style lang="scss">
@use './lk-toast.scss';
</style>
