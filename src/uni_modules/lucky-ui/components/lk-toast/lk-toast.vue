<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { StyleValue } from 'vue';
import { useTransition } from '@/uni_modules/lucky-ui/composables/useTransition';
import { createToastLifecycle, watchToastLifecycle } from './toast.lifecycle';
import { toastProps, toastEmits } from './toast.props';
import {
  createToastBlockerState,
  resolveToastOverlayClass,
  resolveToastOverlayStyle,
  resolveToastRootClass,
  resolveToastRootStyle,
  resolveToastTransition,
  shouldRenderToastBlocker,
} from './toast.utils';

defineOptions({ name: 'LkToast' });

const props = defineProps(toastProps);
const emit = defineEmits(toastEmits);

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

const overlayStyle = computed(() => resolveToastOverlayStyle(props.zIndex));
const rootClass = computed(() => resolveToastRootClass(props.position));
const rootStyle = computed(() => resolveToastRootStyle(props.zIndex));
const blockerState = createToastBlockerState();
const blockerConfig = ref(
  blockerState.sync({
    visible: props.modelValue,
    overlay: props.overlay,
    forbidClick: props.forbidClick,
  })
);
const stopBlockerWatch = watch(
  [() => props.modelValue, () => props.overlay, () => props.forbidClick],
  ([visible, overlay, forbidClick]) => {
    blockerConfig.value = blockerState.sync({ visible, overlay, forbidClick });
  },
  { flush: 'pre' }
);

const {
  classes: transitionClasses,
  styles: transitionStyles,
  display,
  cancel: cancelTransition,
} = useTransition(
  () => props.modelValue,
  { name: transitionName.value, duration: 260, easing: 'ease-out' },
  {
    onAfterLeave: () => {
      blockerState.finishLeave();
      lifecycle.finishLeave();
    },
  }
);
const showBlocker = computed(() =>
  shouldRenderToastBlocker({
    display: display.value,
    overlay: blockerConfig.value.overlay,
    forbidClick: blockerConfig.value.forbidClick,
  })
);
const overlayClass = computed(() =>
  resolveToastOverlayClass({
    overlay: blockerConfig.value.overlay,
    forbidClick: blockerConfig.value.forbidClick,
  })
);
const innerClass = computed(() => [transitionClasses.value, props.customClass]);
const innerStyle = computed<StyleValue>(
  () => [props.customStyle, transitionStyles.value] as StyleValue
);

onBeforeUnmount(() => {
  stopBlockerWatch();
  blockerState.dispose();
  stopLifecycleWatches();
  lifecycle.dispose();
  cancelTransition();
});
</script>

<template>
  <view v-if="showBlocker" class="lk-toast__overlay" :class="overlayClass" :style="overlayStyle" />
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
