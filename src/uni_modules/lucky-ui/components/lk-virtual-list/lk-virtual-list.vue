<script setup lang="ts">
import type { StyleValue } from 'vue';
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { virtualListEmits, virtualListProps } from './virtual-list.props';
import {
  clampVirtualListIndex,
  extractVirtualListScrollTop,
  resolveVirtualListClass,
  resolveVirtualListItemPx,
  resolveVirtualListMetrics,
  resolveVirtualListOverscan,
  resolveVirtualListOverscanBoost,
  resolveVirtualListPx,
  resolveVirtualListRootStyle,
  resolveVirtualWindow,
  shouldEmitVirtualPrefetch,
  shouldEmitVirtualReachBottom,
  shouldResetVirtualPrefetch,
  shouldResetVirtualReachBottom,
} from './virtual-list.utils';
import type { VirtualListScrollEvent } from './virtual-list.utils';

defineOptions({ name: 'LkVirtualList' });

const props = defineProps(virtualListProps);
const emit = defineEmits(virtualListEmits);

const wrapperRef = ref<unknown>();
const currentScrollTop = ref(0);
// Ensure scroll-top is always a number to avoid native event handler errors in some runtimes
const boundScrollTop = ref<number>(0);

// rAF 滚动调度（带降级）
const latestScrollTop = ref(0);
const lastProcessedTop = ref(0);
const rafPending = ref(false);
let rafId: number | null = null;
// Fallback for environments without requestAnimationFrame (e.g., some mini-program runtimes)
type RAFHandle = number;
const hasRAF = typeof requestAnimationFrame === 'function';
function rAF(cb: (t: number) => void): RAFHandle {
  return hasRAF
    ? requestAnimationFrame(cb)
    : (setTimeout(
        () =>
          cb(
            typeof performance !== 'undefined' && typeof performance.now === 'function'
              ? performance.now()
              : Date.now()
          ),
        16
      ) as unknown as number);
}

function cAF(id: RAFHandle) {
  if (hasRAF) cancelAnimationFrame(id);
  else clearTimeout(id);
}

// 根据滚动速度动态增加 overscan 行数
const currentOverscanBoost = ref(0);

function upx2px(value: number) {
  return typeof uni !== 'undefined' && uni.upx2px ? uni.upx2px(value) : value;
}
const itemPx = computed(() => resolveVirtualListItemPx(props.itemHeight, upx2px));
const containerHeightPx = computed(() => resolveVirtualListPx(props.height, 600, upx2px));
const lowerThresholdPx = computed(() => resolveVirtualListPx(props.lowerThreshold, 80, upx2px));
// const overscanCount = computed(() => props.buffer);
const overscanCount = computed(() =>
  resolveVirtualListOverscan({
    buffer: props.buffer,
    dynamicOverscan: props.dynamicOverscan,
    maxOverscanRows: props.maxOverscanRows,
    currentOverscanBoost: currentOverscanBoost.value,
  })
);

const list = computed(() => props.items);
const windowInfo = computed(() =>
  resolveVirtualWindow({
    itemCount: list.value.length,
    itemPx: itemPx.value,
    containerHeightPx: containerHeightPx.value,
    scrollTop: currentScrollTop.value,
    overscanCount: overscanCount.value,
  })
);
const visibleCount = computed(() => windowInfo.value.visibleCount);

const windowStart = ref(0);
const startIndex = computed(() => windowStart.value);
const endIndex = computed(() =>
  Math.min(list.value.length, windowStart.value + visibleCount.value)
);
const visibleItems = computed(() => list.value.slice(startIndex.value, endIndex.value));

const metrics = computed(() =>
  resolveVirtualListMetrics({
    itemCount: list.value.length,
    itemPx: itemPx.value,
    start: startIndex.value,
    end: endIndex.value,
    reserveRows: props.reserveRows,
  })
);
const totalHeight = computed(() => metrics.value.totalHeight);
const topPadding = computed(() => metrics.value.topPadding);
const bottomPaddingTotal = computed(() => metrics.value.bottomPaddingTotal);
const totalScrollable = computed(() => metrics.value.totalScrollable);
const rootClass = computed(() => resolveVirtualListClass(props.customClass));
const rootStyle = computed(() =>
  resolveVirtualListRootStyle({
    heightPx: containerHeightPx.value,
    customStyle: props.customStyle,
  })
);
const contentClass = computed(() => ['lk-virtual-list__content', props.contentClass]);
const paddingContentStyle = computed<StyleValue>(() => [
  {
    paddingTop: `${topPadding.value}px`,
    paddingBottom: `${bottomPaddingTotal.value}px`,
  },
  props.contentStyle as StyleValue,
]);
const positionedContentStyle = computed<StyleValue>(() => [
  { transform: `translate3d(0, ${topPadding.value}px, 0)` },
  props.contentStyle as StyleValue,
]);
const itemSlotClass = computed(() => props.itemClass);
const itemSlotStyle = computed<StyleValue>(() => props.itemStyle as StyleValue);

const nearBottomEmitted = ref(false);
const prefetchEmitted = ref(false);
const prevLength = ref(0);

const localScrollAnchoring = ref(props.scrollAnchoring);
const localScrollWithAnimation = ref(props.scrollWithAnimation);

watch(
  () => props.scrollAnchoring,
  v => (localScrollAnchoring.value = v)
);
watch(
  () => props.scrollWithAnimation,
  v => (localScrollWithAnimation.value = v)
);

watch(
  () => list.value.length,
  newLen => {
    nearBottomEmitted.value = false;
    prefetchEmitted.value = false;
    windowStart.value = resolveVirtualWindow({
      itemCount: newLen,
      itemPx: itemPx.value,
      containerHeightPx: containerHeightPx.value,
      scrollTop: currentScrollTop.value,
      overscanCount: overscanCount.value,
    }).start;
    if (newLen > prevLength.value) {
      // Temporarily disable anchoring/animation on append for anti-jitter
      const needRestoreAnchoring = localScrollAnchoring.value;
      const needRestoreAnim = localScrollWithAnimation.value;
      if (needRestoreAnchoring) localScrollAnchoring.value = false;
      if (needRestoreAnim) localScrollWithAnimation.value = false;
      setTimeout(() => {
        localScrollAnchoring.value = needRestoreAnchoring;
        localScrollWithAnimation.value = needRestoreAnim;
      }, 50);
    }
    prevLength.value = newLen;
  }
);

function flushScroll() {
  const top = latestScrollTop.value;
  const delta = top - lastProcessedTop.value;
  lastProcessedTop.value = top;
  currentScrollTop.value = top;

  // 动态 overscan：根据本帧移动距离估算需要增加的行数
  currentOverscanBoost.value = resolveVirtualListOverscanBoost({
    delta,
    itemPx: itemPx.value,
    maxOverscanRows: props.maxOverscanRows,
    overscanBoostFactor: props.overscanBoostFactor,
  });

  const desiredStart = resolveVirtualWindow({
    itemCount: list.value.length,
    itemPx: itemPx.value,
    containerHeightPx: containerHeightPx.value,
    scrollTop: top,
    overscanCount: overscanCount.value,
  }).start;
  if (desiredStart !== windowStart.value) windowStart.value = desiredStart;

  emit('scroll', {
    scrollTop: top,
    start: startIndex.value,
    end: endIndex.value,
  });

  // 到底与预取触发在 rAF 中合并，避免抖动
  const remain = totalHeight.value - (top + containerHeightPx.value);
  if (
    shouldEmitVirtualReachBottom({
      remain,
      lowerThresholdPx: lowerThresholdPx.value,
      emitted: nearBottomEmitted.value,
    })
  ) {
    nearBottomEmitted.value = true;
    emit('reach-bottom');
  } else if (shouldResetVirtualReachBottom({ remain, lowerThresholdPx: lowerThresholdPx.value })) {
    nearBottomEmitted.value = false;
  }

  if (props.prefetchRows > 0) {
    const remainingItems = list.value.length - endIndex.value;
    if (
      shouldEmitVirtualPrefetch({
        remainingItems,
        prefetchRows: props.prefetchRows,
        emitted: prefetchEmitted.value,
      })
    ) {
      prefetchEmitted.value = true;
      emit('prefetch');
    } else if (shouldResetVirtualPrefetch({ remainingItems, prefetchRows: props.prefetchRows })) {
      prefetchEmitted.value = false;
    }
  }
}

function scheduleFlush() {
  if (rafPending.value) return;
  rafPending.value = true;
  rafId = rAF(() => {
    rafPending.value = false;
    flushScroll();
  });
}

function onScroll(e: VirtualListScrollEvent) {
  const top = extractVirtualListScrollTop(e);
  latestScrollTop.value = top;
  scheduleFlush();
}

function onScrollToLower() {
  emit('reach-bottom');
}

function scrollToIndex(index: number) {
  const i = clampVirtualListIndex(index, list.value.length);
  const top = i * itemPx.value;
  boundScrollTop.value = top;
  latestScrollTop.value = top;
  scheduleFlush();
}

function scrollToTop() {
  boundScrollTop.value = 0;
  latestScrollTop.value = 0;
  scheduleFlush();
}

onMounted(() => {
  if (props.initialScrollIndex > 0) {
    nextTick(() => scrollToIndex(props.initialScrollIndex));
  } else {
    nextTick(() => {
      latestScrollTop.value = 0;
      flushScroll();
    });
  }
});

onUnmounted(() => {
  if (rafId != null) cAF(rafId);
});

defineExpose({ scrollToIndex, scrollToTop });
</script>

<template>
  <scroll-view
    ref="wrapperRef"
    scroll-y
    :class="rootClass"
    :style="rootStyle"
    :lower-threshold="lowerThresholdPx"
    :scroll-top="boundScrollTop"
    :scroll-with-animation="localScrollWithAnimation"
    :scroll-anchoring="localScrollAnchoring"
    :enable-passive="enablePassive"
    :enhanced="enhanced"
    :bounces="bounces"
    @scroll="onScroll"
    @scrolltolower="onScrollToLower"
  >
    <view
      v-if="positionStrategy === 'padding'"
      :class="['lk-virtual-list__inner', contentClass]"
      :style="paddingContentStyle"
    >
      <slot
        :items="visibleItems"
        :start="startIndex"
        :end="endIndex"
        :item-height="itemPx"
        :item-class="itemSlotClass"
        :item-style="itemSlotStyle"
      />
    </view>
    <template v-else>
      <view class="lk-virtual-list__phantom" :style="{ height: totalScrollable + 'px' }" />
      <view
        :class="['lk-virtual-list__container', contentClass]"
        :style="positionedContentStyle"
      >
        <slot
          :items="visibleItems"
          :start="startIndex"
          :end="endIndex"
          :item-height="itemPx"
          :item-class="itemSlotClass"
          :item-style="itemSlotStyle"
        />
      </view>
    </template>
  </scroll-view>
</template>

<style lang="scss">
@use './lk-virtual-list.scss';
</style>
