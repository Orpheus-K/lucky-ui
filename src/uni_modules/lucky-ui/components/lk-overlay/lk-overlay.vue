<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { overlayProps, overlayEmits } from './overlay.props';
import { useTransition } from '../../composables/useTransition';
import {
  resolveOverlayStyle,
  resolveOverlayVisible,
  shouldCloseOverlayOnClick,
  shouldLockOverlayScroll,
  shouldPreventOverlayTouchMove,
} from './overlay.utils';

defineOptions({ name: 'LkOverlay' });

const props = defineProps(overlayProps);
const emit = defineEmits(overlayEmits);

const externalShow = computed(() =>
  resolveOverlayVisible({
    modelValue: props.modelValue,
  })
);

const {
  display,
  classes: transitionClasses,
  styles: transitionStyles,
} = useTransition(
  () => externalShow.value,
  {
    name: 'fade',
    duration: () => props.duration,
  },
  {
    onAfterEnter: () => emit('after-enter'),
    onAfterLeave: () => emit('after-leave'),
  }
);
const overlayStyle = computed(() =>
  resolveOverlayStyle({
    zIndex: props.zIndex,
    background: props.background,
    opacity: props.opacity,
    transitionStyles: transitionStyles.value,
    customStyle: props.customStyle as StyleValue,
  })
);

function onClick(event?: unknown) {
  emit('click', event);
  if (shouldCloseOverlayOnClick(props.closeOnClick)) {
    emit('update:modelValue', false);
    emit('close', event);
  }
}

function lock() {
  if (
    !shouldLockOverlayScroll({
      visible: externalShow.value,
      lockScroll: props.lockScroll,
    })
  )
    return;
  // #ifdef H5
  document.body.style.overflow = 'hidden';
  // #endif
}
function unlock() {
  if (!props.lockScroll) return;
  // #ifdef H5
  document.body.style.overflow = '';
  // #endif
}

// 滚动锁定逻辑随外部显示状态切换
watch(
  externalShow,
  v => {
    if (v) {
      emit('open');
      lock();
    } else {
      unlock();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (externalShow.value) lock();
});
onBeforeUnmount(unlock);

function onTouchMove(e: TouchEvent) {
  emit('touchmove', e);
  if (shouldPreventOverlayTouchMove(props.lockScroll)) {
    e.preventDefault();
  }
}
</script>

<template>
  <view
    v-if="display"
    :id="id"
    class="lk-overlay"
    :class="[customClass, transitionClasses]"
    :style="overlayStyle"
    @tap="onClick"
    @touchmove="onTouchMove"
  >
    <slot />
  </view>
</template>

<style lang="scss">
@use './lk-overlay.scss';
</style>
