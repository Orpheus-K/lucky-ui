<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  provide,
  ref,
  watch,
} from 'vue';
import type { StyleValue } from 'vue';
// #ifdef H5
import { bindHorizontalScrollDesktop } from './horizontal-scroll.h5';
// #endif
import {
  horizontalScrollContextKey,
  type MeasureHorizontalScrollItem,
} from './horizontal-scroll.context';
import { horizontalScrollProps } from './horizontal-scroll.props';
import {
  resolveHorizontalScrollClass,
  resolveHorizontalScrollTargets,
  resolveHorizontalScrollIndex,
  resolveHorizontalScrollContainerStyle,
  resolveHorizontalScrollRootStyle,
  shouldShowHorizontalScrollbar,
} from './horizontal-scroll.utils';

defineOptions({ name: 'LkHorizontalScroll' });

const props = defineProps(horizontalScrollProps);
const instance = getCurrentInstance();
const scrollViewRef = ref<{ $el?: unknown } | null>(null);
const targets = ref<number[]>([]);
const activeIndex = ref(0);
const offset = ref(0);
const nativeScrollLeft = ref(0);
const dragging = ref(false);
const snapEnabled = computed(() => props.snap && targets.value.length > 1);
const trackStyle = computed(() =>
  snapEnabled.value
    ? {
        transform: `translateX(${-offset.value}px)`,
        transition: dragging.value ? 'none' : 'transform 240ms ease-out',
      }
    : {}
);

interface TouchPoint {
  identifier?: number;
  clientX: number;
  clientY: number;
}
interface TouchInput {
  touches: TouchPoint[];
  changedTouches: TouchPoint[];
}
interface ItemRect {
  left: number;
  width: number;
}
interface Gesture {
  touch: TouchPoint;
  index: number;
  origin: number;
  axis: 'x' | 'y' | null;
}
let gesture: Gesture | undefined;
let disposed = false;
let measureVersion = 0;
const itemMeasures = new Set<MeasureHorizontalScrollItem>();
provide(horizontalScrollContextKey, {
  refresh,
  register(measure) {
    itemMeasures.add(measure);
    void refresh();
    return () => {
      itemMeasures.delete(measure);
      void refresh();
    };
  },
});

// 容器与子项各自在自己的组件作用域测量，兼容小程序插槽。
async function refresh() {
  const version = ++measureVersion;
  await nextTick();
  if (disposed || !props.snap || dragging.value || version !== measureVersion) return;
  const query = uni.createSelectorQuery().in(instance?.proxy);
  query.select('.lk-horizontal-scroll').boundingClientRect();
  query.select('.lk-horizontal-scroll__container').boundingClientRect();
  query.exec(async result => {
    if (disposed || version !== measureVersion || dragging.value || !props.snap) return;
    const [viewport, container] = result as [ItemRect | null, ItemRect | null];
    const measured = await Promise.all(Array.from(itemMeasures, measure => measure()));
    if (disposed || version !== measureVersion || dragging.value || !props.snap) return;
    const items = measured.every((item): item is ItemRect => item !== null)
      ? measured.sort((a, b) => a.left - b.left)
      : [];
    const nextTargets = resolveHorizontalScrollTargets(viewport, container, items);
    if (!snapEnabled.value && nextTargets.length > 1 && nativeScrollLeft.value !== 0) {
      // 切换前先通过 scroll-view 的公开属性清除自由滚动的位置。
      nativeScrollLeft.value = 0;
      await nextTick();
      if (disposed || version !== measureVersion || dragging.value || !props.snap) return;
    }
    if (JSON.stringify(nextTargets) !== JSON.stringify(targets.value)) targets.value = nextTargets;
    activeIndex.value = Math.min(activeIndex.value, Math.max(0, nextTargets.length - 1));
    offset.value = nextTargets[activeIndex.value] ?? 0;
  });
}

function cancelGesture() {
  if (gesture) {
    activeIndex.value = gesture.index;
    offset.value = targets.value[gesture.index] ?? 0;
  }
  gesture = undefined;
  dragging.value = false;
}

function onTouchStart(event: TouchInput) {
  if (event.touches.length !== 1) {
    cancelGesture();
    return;
  }
  if (!snapEnabled.value) {
    void refresh();
    return;
  }
  gesture = {
    touch: event.touches[0],
    index: activeIndex.value,
    origin: offset.value,
    axis: null,
  };
  dragging.value = true;
}

function onTouchMove(event: TouchInput) {
  if (!gesture) return;
  if (event.touches.length !== 1) {
    cancelGesture();
    return;
  }
  const dx = event.touches[0].clientX - gesture.touch.clientX;
  const dy = event.touches[0].clientY - gesture.touch.clientY;
  if (!gesture.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 6) {
    gesture.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
  }
  if (gesture.axis !== 'x') return;
  const min = targets.value[Math.max(0, gesture.index - 1)];
  const max = targets.value[Math.min(targets.value.length - 1, gesture.index + 1)];
  offset.value = Math.max(min, Math.min(max, gesture.origin - dx));
}

function onTouchEnd(event: TouchInput) {
  if (!gesture) return;
  const touch = event.changedTouches.find(point => point.identifier === gesture?.touch.identifier);
  if (gesture.axis === 'x' && touch) {
    activeIndex.value = resolveHorizontalScrollIndex(
      gesture.index,
      touch.clientX - gesture.touch.clientX,
      targets.value.length
    );
    offset.value = targets.value[activeIndex.value];
  }
  gesture = undefined;
  dragging.value = false;
}

watch(
  () => props.snap,
  () => {
    cancelGesture();
    targets.value = [];
    activeIndex.value = 0;
    offset.value = 0;
    void refresh();
  }
);
function onScroll(event: { detail: { scrollLeft: number } }) {
  nativeScrollLeft.value = event.detail.scrollLeft;
}
onMounted(() => {
  void refresh();
  uni.onWindowResize(refresh);
});
// #ifdef H5
let unbindDesktop: (() => void) | undefined;
onMounted(() => {
  const root = scrollViewRef.value?.$el as HTMLElement | undefined;
  if (!root) return;
  unbindDesktop = bindHorizontalScrollDesktop(root, {
    enabled: () => snapEnabled.value,
    start: point => onTouchStart({ touches: [point], changedTouches: [] }),
    move: point => {
      onTouchMove({ touches: [point], changedTouches: [] });
      return gesture?.axis === 'x';
    },
    end: point => onTouchEnd({ touches: [], changedTouches: [point] }),
    cancel: cancelGesture,
    step: direction => {
      activeIndex.value = resolveHorizontalScrollIndex(
        activeIndex.value,
        -direction * 24,
        targets.value.length
      );
      offset.value = targets.value[activeIndex.value];
    },
  });
});
onBeforeUnmount(() => unbindDesktop?.());
// #endif
onUpdated(() => {
  if (!dragging.value) void refresh();
});
onBeforeUnmount(() => {
  disposed = true;
  measureVersion++;
  uni.offWindowResize(refresh);
});
defineExpose({ refresh });

const rootClass = computed(() => resolveHorizontalScrollClass(props.customClass));
const rootStyle = computed(() => resolveHorizontalScrollRootStyle(props.customStyle as StyleValue));
const showScrollbar = computed(() => shouldShowHorizontalScrollbar(props.hideScrollbar));
const containerStyle = computed(() =>
  resolveHorizontalScrollContainerStyle({
    gap: props.gap,
    padding: props.padding,
  })
);
</script>

<template>
  <scroll-view
    ref="scrollViewRef"
    :class="[rootClass, { 'lk-horizontal-scroll--snap': snapEnabled }]"
    :style="rootStyle"
    :scroll-x="!snapEnabled"
    :scroll-left="nativeScrollLeft"
    @scroll="onScroll"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="cancelGesture"
    :show-scrollbar="showScrollbar"
    enable-flex
  >
    <view class="lk-horizontal-scroll__container" :style="[containerStyle, trackStyle]">
      <slot />
    </view>
  </scroll-view>
</template>

<style lang="scss" scoped>
@use './lk-horizontal-scroll.scss';
</style>
