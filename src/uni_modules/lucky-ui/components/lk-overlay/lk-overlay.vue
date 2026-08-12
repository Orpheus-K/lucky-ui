<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, watch } from 'vue';
import { overlayProps, overlayEmits } from './overlay.props';
import { useTransition } from '../../composables/useTransition';
import { createBodyScrollLock } from '../../utils/scroll-lock';
import {
  resolveOverlayStyle,
  resolveOverlayVisible,
  preventOverlayTouchMove,
  shouldCloseOverlayOnClick,
  shouldLockOverlayScroll,
  useOverlayScrollLock,
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

const bodyScrollLock = createBodyScrollLock();

function resolveShouldLockScroll(): boolean {
  return shouldLockOverlayScroll({
    visible: externalShow.value,
    lockScroll: props.lockScroll,
  });
}

const scrollLocked = useOverlayScrollLock(resolveShouldLockScroll, {
  sync(shouldLock) {
    let locked = shouldLock;
    // #ifdef H5
    locked = bodyScrollLock.sync(shouldLock);
    // #endif
    return locked;
  },
  release() {
    bodyScrollLock.release();
  },
});

watch(
  externalShow,
  visible => {
    if (visible) emit('open');
  },
  { immediate: true }
);

function onTouchMove(e: TouchEvent) {
  emit('touchmove', e);
  // #ifdef H5
  preventOverlayTouchMove(e, scrollLocked.value);
  // #endif
}
</script>

<template>
  <!-- #ifdef MP-WEIXIN -->
  <view
    v-if="display && scrollLocked"
    :id="id"
    class="lk-overlay"
    :class="[customClass, transitionClasses]"
    :style="overlayStyle"
    data-testid="lk-overlay"
    data-scroll-locked="true"
    @tap="onClick"
    @touchmove.stop.prevent="onTouchMove"
  >
    <slot />
  </view>
  <view
    v-else-if="display"
    :id="id"
    class="lk-overlay"
    :class="[customClass, transitionClasses]"
    :style="overlayStyle"
    data-testid="lk-overlay"
    data-scroll-locked="false"
    @tap="onClick"
    @touchmove="onTouchMove"
  >
    <slot />
  </view>
  <!-- #endif -->

  <!-- #ifndef MP-WEIXIN -->
  <view
    v-if="display"
    :id="id"
    class="lk-overlay"
    :class="[customClass, transitionClasses]"
    :style="overlayStyle"
    data-testid="lk-overlay"
    :data-scroll-locked="scrollLocked ? 'true' : 'false'"
    @tap="onClick"
    @touchmove="onTouchMove"
  >
    <slot />
  </view>
  <!-- #endif -->
</template>

<style lang="scss">
@use './lk-overlay.scss';
</style>
