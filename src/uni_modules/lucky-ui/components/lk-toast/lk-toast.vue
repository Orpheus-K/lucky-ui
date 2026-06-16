<script setup lang="ts">
import { watch, computed, onUnmounted } from 'vue';
import type { StyleValue } from 'vue';
import { useTransition } from '@/uni_modules/lucky-ui/composables/useTransition';
import { toastProps, toastEmits } from './toast.props';
import {
  resolveToastOverlayClass,
  resolveToastOverlayStyle,
  resolveToastRootClass,
  resolveToastRootStyle,
  resolveToastTransition,
  shouldScheduleToastClose,
} from './toast.utils';

defineOptions({ name: 'LkToast' });

const props = defineProps(toastProps);
const emit = defineEmits(toastEmits);

const show = computed(() => props.modelValue);
let timer: ReturnType<typeof setTimeout> | null = null;

function clearTimers() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

function scheduleClose() {
  clearTimers();
  if (shouldScheduleToastClose(props.duration)) {
    timer = setTimeout(() => close(), props.duration);
  }
}

watch(
  () => props.modelValue,
  v => {
    if (v) {
      emit('open');
      scheduleClose();
    } else {
      emit('close');
      setTimeout(() => emit('after-leave'), 260);
    }
  }
);

function close() {
  if (!show.value) return;
  emit('update:modelValue', false);
  emit('close');
}

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
} = useTransition(
  () => props.modelValue,
  { name: transitionName.value, duration: 260, easing: 'ease-out' },
  {
    onAfterLeave: () => emit('after-leave'),
  }
);
const innerClass = computed(() => [transitionClasses.value, props.customClass]);
const innerStyle = computed<StyleValue>(
  () => [props.customStyle, transitionStyles.value] as StyleValue
);

onUnmounted(() => clearTimers());
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
