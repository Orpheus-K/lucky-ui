<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { StyleValue } from 'vue';
import LkOverlay from '../lk-overlay/lk-overlay.vue';
import LkIcon from '../lk-icon/lk-icon.vue';
import { popupProps, popupEmits } from './popup.props';
import { useTransition } from '@/uni_modules/lucky-ui/composables/useTransition';
import {
  applyPopupRubberBand,
  getPopupInitialOpenTranslateY,
  getPopupMinSnapY,
  getPopupTouchClientY,
  isPopupBottomDraggable,
  isPopupSheetExpanded,
  normalizePopupSnapPixels,
  resolvePopupAdjacentSnapTarget,
  resolvePopupPanelStyle,
  resolvePopupSize,
  resolvePopupTransitionConfig,
  resolvePopupWrapperClass,
  resolvePopupWrapperStyle,
  shouldPopupSheetHandOffToContentScroll,
  shouldPopupSheetTakeContentGesture,
} from './popup.utils';

defineOptions({ name: 'LkPopup' });

const props = defineProps(popupProps);
const emit = defineEmits(popupEmits);
const popupHeight = computed(() => resolvePopupSize(props.height));
const popupWidth = computed(() => resolvePopupSize(props.width));

const transitionConfig = computed(() =>
  resolvePopupTransitionConfig({
    position: props.position,
    draggable: props.draggable,
    animation: props.animation,
    animationType: props.animationType,
    duration: props.duration,
    delay: props.delay,
    easing: props.easing,
  })
);

const {
  classes: transitionClasses,
  styles: transitionStyles,
  display,
} = useTransition(() => props.modelValue, transitionConfig.value, {
  onAfterEnter: () => emit('after-enter'),
  onAfterLeave: () => emit('after-leave'),
});

function onOverlayClick() {
  emit('click-overlay');
  if (props.closeOnOverlay) emit('update:modelValue', false);
}

function onCloseClick() {
  emit('click-close');
  emit('update:modelValue', false);
}

const wrapperClass = computed(() => [
  ...resolvePopupWrapperClass({
    position: props.position,
    round: props.round,
    draggable: props.draggable,
  }),
]);

const wrapperStyle = computed(() =>
  resolvePopupWrapperStyle({
    zIndex: props.zIndex,
    radius: props.radius,
  })
);

const isBottomDraggable = computed(() =>
  isPopupBottomDraggable({
    position: props.position,
    draggable: props.draggable,
  })
);

const translateY = ref(0);
const isPanelGestureActive = ref(false);
const isPanelAnimating = ref(false);
const internalContentScrollTop = ref(0);

type PopupTouchEvent = {
  touches?: ArrayLike<{ clientY?: number }>;
  changedTouches?: ArrayLike<{ clientY?: number }>;
};

const windowHeight = uni.getSystemInfoSync().windowHeight;

let startY = 0;
let startTranslateY = 0;
let velocity = 0;
let lastTime = 0;
let lastY = 0;
let isContentGesturePending = false;
let animationLockTimer: ReturnType<typeof setTimeout> | undefined;

const snapPixelsSorted = computed(() => {
  return normalizePopupSnapPixels({
    snapPoints: props.snapPoints,
    windowHeight,
  });
});

const initialOpenTranslateY = computed(() => {
  return getPopupInitialOpenTranslateY({
    snapPoints: props.snapPoints,
    windowHeight,
  });
});

const minSnapY = computed(() =>
  getPopupMinSnapY({
    snapPixels: snapPixelsSorted.value,
    windowHeight,
  })
);

function touchClientY(e: PopupTouchEvent): number {
  return getPopupTouchClientY(e);
}

function doubleRaf(cb: () => void): void {
  const raf =
    typeof globalThis.requestAnimationFrame === 'function'
      ? globalThis.requestAnimationFrame.bind(globalThis)
      : (fn: FrameRequestCallback) => globalThis.setTimeout(fn, 16);
  raf(() => {
    raf(cb);
  });
}

function preventTouchMoveIfPossible(e: unknown): void {
  // #ifdef H5
  const ev = e as { preventDefault?: () => void };
  ev.preventDefault?.();
  // #endif
}

function getSheetTransitionDuration(): number {
  return Math.max(
    typeof transitionConfig.value.duration === 'number' ? transitionConfig.value.duration : 300,
    260
  );
}

function clearPanelAnimationLock(): void {
  if (!animationLockTimer) return;
  clearTimeout(animationLockTimer);
  animationLockTimer = undefined;
}

function lockPanelAnimation(): void {
  clearPanelAnimationLock();
  isPanelAnimating.value = true;
  animationLockTimer = setTimeout(() => {
    isPanelAnimating.value = false;
    animationLockTimer = undefined;
  }, getSheetTransitionDuration() + 40);
}

function applyRubberBand(nextY: number): number {
  return applyPopupRubberBand({
    nextY,
    minSnapY: minSnapY.value,
    damping: props.dragDamping,
  });
}

function updateVelocitySample(currentY: number): void {
  const currentTime = Date.now();
  const timeDelta = currentTime - lastTime;
  if (timeDelta > 0) {
    velocity = (currentY - lastY) / timeDelta;
  }
  lastY = currentY;
  lastTime = currentTime;
}

function resolveSnapTarget(currentY: number, vel: number): number {
  return resolvePopupAdjacentSnapTarget({
    startY: startTranslateY,
    currentY,
    velocity: vel,
    snapPixels: snapPixelsSorted.value,
    windowHeight,
  });
}

function canUseBottomSheetGesture(): boolean {
  return props.draggable && props.position === 'bottom' && !isPanelAnimating.value;
}

function finalizeSheetPosition(): void {
  const current = translateY.value;
  const target = resolveSnapTarget(current, velocity);

  if (target >= windowHeight - 2) {
    translateY.value = windowHeight;
    lockPanelAnimation();
    emit('update:modelValue', false);
    return;
  }

  translateY.value = target;
  lockPanelAnimation();
}

watch(
  () => props.modelValue,
  (val, oldVal) => {
    if (val !== oldVal) emit(val ? 'open' : 'close');
    if (props.position === 'bottom' && props.draggable) {
      if (val) {
        clearPanelAnimationLock();
        isPanelGestureActive.value = false;
        isContentGesturePending = false;
        internalContentScrollTop.value = 0;
        translateY.value = windowHeight;
        const target = initialOpenTranslateY.value;
        doubleRaf(() => {
          translateY.value = target;
          lockPanelAnimation();
        });
      } else {
        isPanelGestureActive.value = false;
        isContentGesturePending = false;
        translateY.value = windowHeight;
      }
    }
  }
);

function beginSheetGesture(e: PopupTouchEvent, active: boolean) {
  if (!canUseBottomSheetGesture()) return;
  isPanelGestureActive.value = active;
  startY = touchClientY(e);
  startTranslateY = translateY.value;
  lastY = startY;
  lastTime = Date.now();
  velocity = 0;
}

function releaseSheetGestureToContentScroll(): void {
  translateY.value = minSnapY.value;
  isPanelGestureActive.value = false;
  isContentGesturePending = false;
  velocity = 0;
}

function updateSheetGesture(e: PopupTouchEvent, options?: { allowContentScrollHandOff?: boolean }) {
  if (!isPanelGestureActive.value) return;
  const currentY = touchClientY(e);
  updateVelocitySample(currentY);
  const deltaY = currentY - startY;
  const rawNextY = startTranslateY + deltaY;
  if (
    options?.allowContentScrollHandOff &&
    shouldPopupSheetHandOffToContentScroll({
      startTranslateY,
      nextY: rawNextY,
      minSnapY: minSnapY.value,
      deltaY,
    })
  ) {
    releaseSheetGestureToContentScroll();
    return;
  }
  let nextY = rawNextY;
  nextY = applyRubberBand(nextY);
  translateY.value = nextY;
  preventTouchMoveIfPossible(e);
}

function endSheetGesture() {
  if (!isPanelGestureActive.value) return;
  isPanelGestureActive.value = false;
  finalizeSheetPosition();
}

function onHandleTouchStart(e: PopupTouchEvent) {
  beginSheetGesture(e, true);
}

function onHandleTouchMove(e: PopupTouchEvent) {
  if (!canUseBottomSheetGesture()) return;
  updateSheetGesture(e, { allowContentScrollHandOff: true });
}

function onHandleTouchEnd() {
  endSheetGesture();
}

function onContentScroll(e: { detail?: { scrollTop?: number; scrollHeight?: number } }) {
  const d = e.detail;
  internalContentScrollTop.value = typeof d?.scrollTop === 'number' ? d.scrollTop : 0;
}

function getGestureScrollTop(): number {
  return Math.max(0, internalContentScrollTop.value);
}

const isSheetExpanded = computed(() =>
  isPopupSheetExpanded({
    translateY: translateY.value,
    minSnapY: minSnapY.value,
  })
);

const isContentScrollEnabled = computed(() => {
  if (!isBottomDraggable.value) return true;
  return isSheetExpanded.value && !isPanelGestureActive.value;
});

function onContentTouchStart(e: PopupTouchEvent) {
  if (!canUseBottomSheetGesture()) return;
  isContentGesturePending = true;
  beginSheetGesture(e, false);
}

function onContentTouchMove(e: PopupTouchEvent) {
  if (!canUseBottomSheetGesture() || !isContentGesturePending) return;
  const currentY = touchClientY(e);
  const deltaY = currentY - startY;
  if (!isPanelGestureActive.value) {
    const shouldTake = shouldPopupSheetTakeContentGesture({
      translateY: startTranslateY,
      minSnapY: minSnapY.value,
      scrollTop: getGestureScrollTop(),
      deltaY,
    });
    if (!shouldTake) return;
    isPanelGestureActive.value = true;
    if (isPopupSheetExpanded({ translateY: startTranslateY, minSnapY: minSnapY.value })) {
      startY = currentY;
      startTranslateY = translateY.value;
      lastY = currentY;
      lastTime = Date.now();
      velocity = 0;
      preventTouchMoveIfPossible(e);
      return;
    }
  }
  updateSheetGesture(e);
}

function onContentTouchEnd() {
  if (!isContentGesturePending) return;
  isContentGesturePending = false;
  endSheetGesture();
}

function onContentScrollUpper() {
  internalContentScrollTop.value = 0;
}

onBeforeUnmount(() => {
  clearPanelAnimationLock();
});

const panelStyle = computed(() => {
  return resolvePopupPanelStyle({
    position: props.position,
    draggable: props.draggable,
    transitionStyles: transitionStyles.value,
    height: popupHeight.value,
    width: popupWidth.value,
    transitionDuration: getSheetTransitionDuration(),
    dragEasing: props.dragEasing,
    isGestureActive: isPanelGestureActive.value,
    windowHeight,
    translateY: translateY.value,
    round: props.round,
    customStyle: props.customStyle as StyleValue,
  });
});
const panelClass = computed(() => [transitionClasses.value, props.customClass]);
</script>

<template>
  <lk-overlay
    v-if="overlay && display"
    :model-value="modelValue"
    :z-index="zIndex"
    :lock-scroll="lockScroll"
    :close-on-click="closeOnOverlay"
    @click="onOverlayClick"
  />
  <view v-if="display" :class="wrapperClass" :style="wrapperStyle" @touchmove.stop>
    <view class="lk-popup__panel" :class="panelClass" :style="panelStyle">
      <view
        v-if="position === 'bottom' && draggable"
        class="lk-popup__drag-handle"
        @touchstart.stop="onHandleTouchStart"
        @touchmove.stop="onHandleTouchMove"
        @touchend="onHandleTouchEnd"
        @touchcancel="onHandleTouchEnd"
      >
        <view class="lk-popup__drag-bar" />
      </view>

      <view v-if="title || $slots.title || closable" class="lk-popup__header">
        <view class="lk-popup__title">
          <slot name="title">{{ title }}</slot>
        </view>
        <view
          v-if="closable"
          class="lk-popup__close"
          :class="`lk-popup__close--${closeIconPosition}`"
          @tap="onCloseClick"
        >
          <lk-icon :name="closeIcon" size="36" />
        </view>
      </view>

      <scroll-view
        v-if="isBottomDraggable"
        class="lk-popup__content"
        :scroll-y="isContentScrollEnabled"
        :show-scrollbar="false"
        @scroll="onContentScroll"
        @scrolltoupper="onContentScrollUpper"
        @touchstart="onContentTouchStart"
        @touchmove="onContentTouchMove"
        @touchend="onContentTouchEnd"
        @touchcancel="onContentTouchEnd"
      >
        <slot />
      </scroll-view>

      <!-- #ifdef H5 -->
      <view v-if="!isBottomDraggable" class="lk-popup__content">
        <slot />
      </view>
      <!-- #endif -->

      <!-- #ifdef MP || APP-PLUS -->
      <scroll-view
        v-if="!isBottomDraggable"
        class="lk-popup__content"
        scroll-y
        :show-scrollbar="false"
      >
        <slot />
      </scroll-view>
      <!-- #endif -->

      <view v-if="safeArea && position === 'bottom'" class="lk-popup__safe" />
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-popup.scss';
</style>
