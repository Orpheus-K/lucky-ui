<script setup lang="ts">
import { computed } from 'vue';
import type { StyleValue } from 'vue';
import { toastStore } from './toast-manager';
import { toastManagerProps } from './toast.props';
import { resolveToastManagerStyle } from './toast.utils';
import LkToastItem from './lk-toast-item.vue';

defineOptions({ name: 'LkToastManager' });

const props = defineProps(toastManagerProps);
const managerClass = computed(() => ['lk-toast-manager', props.customClass]);
const managerStyle = computed<StyleValue>(() =>
  resolveToastManagerStyle({
    customStyle: props.customStyle as StyleValue,
    zIndex: props.zIndex,
  })
);
</script>

<template>
  <view :class="managerClass" :style="managerStyle">
    <lk-toast-item v-for="t in toastStore.list" :key="t.id" :item="t" />
  </view>
</template>

<style lang="scss">
@use './lk-toast.scss';
</style>
