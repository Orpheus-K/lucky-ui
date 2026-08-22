<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue';
import type { StyleValue } from 'vue';
import { useTransition } from '@/uni_modules/lucky-ui/composables/useTransition';
import { createToastLifecycle, watchToastLifecycle } from './toast.lifecycle';
import { toastProps, toastEmits } from './toast.props';
import {
  resolveToastOverlayClass,
  resolveToastOverlayStyle,
  resolveToastRootClass,
  resolveToastRootStyle,
  resolveToastTransition,
} from './toast.utils';

defineOptions({ name: 'LkToast' });

const props = defineProps(toastProps);
const emit = defineEmits(toastEmits);

const show = computed(() => props.modelValue);
const lifecycle = createToastLifecycle({
  getDuration: () => props.duration,
  onOpen: () => emit('open'),
  onRequestClose: () => emit('update:modelValue', false),
  onClose: () => emit('close'),
  onAfterLeave: () => emit('after-leave'),
});

const stopLifecycleWatches = watchToastLifecycle(lifecycle, {
  visible: () => props.modelValue,
  duration: () => props.duration,
});

const transitionName = computed(() => {
  return resolveToastTransition({
    transition: props.transition,
    position: props.position,
  });
});

const overlayClass = computed(() => resolveToastOverlayClass(props.forbidClick));
const overlayStyle = computed(() => resolveToastOverlayStyle(props.zIndex));
const rootClass = computed(() => resolveToastRootClass(props.position));
const rootStyle = computed(() => resolveToastRootStyle(props.zIndex));

const {
  classes: transitionClasses,
  styles: transitionStyles,
  display,
  cancel: cancelTransition,
} = useTransition(
  () => props.modelValue,
  { name: transitionName.value, duration: 260, easing: 'ease-out' },
  {
    onAfterLeave: () => lifecycle.finishLeave(),
  }
);
const innerClass = computed(() => [transitionClasses.value, props.customClass]);
const innerStyle = computed<StyleValue>(
  () => [props.customStyle, transitionStyles.value] as StyleValue
);

onBeforeUnmount(() => {
  stopLifecycleWatches();
  lifecycle.dispose();
  cancelTransition();
});
</script>

<template>
  <view
    v-if="overlay && show"
    class="lk-toast__overlay"
    :class="overlayClass"
    :style="overlayStyle"
  />
  <view v-if="display" class="lk-toast" :class="rootClass" :style="rootStyle">
    <view class="lk-toast__inner" :class="innerClass" :style="innerStyle">
      <text class="lk-toast__text"
        ><slot>{{ message }}</slot></text
      >
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-toast.scss';
</style>
