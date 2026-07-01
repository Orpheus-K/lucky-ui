<script setup lang="ts">
import type { StyleValue } from 'vue';
import { ref, watch, nextTick, getCurrentInstance, computed, onMounted, onBeforeUnmount } from 'vue';
import { segmentedProps, segmentedEmits, type SegmentedOption } from './segmented.props';
import {
  resolveSegmentedRootStyle,
  resolveSegmentedSelection,
  resolveSegmentedSliderStyle,
  type SegmentRect,
  type SegmentWrapRect,
} from './segmented.utils';

defineOptions({ name: 'LkSegmented' });
const props = defineProps(segmentedProps);
const emit = defineEmits(segmentedEmits);
const inst = getCurrentInstance();

const active = ref(props.modelValue);
const sliderStyle = ref<Record<string, string>>({ opacity: '0' });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rootRef = ref<any>(null);
let resizeObserver: ResizeObserver | null = null;

const rootStyle = computed<StyleValue>(() =>
  resolveSegmentedRootStyle({
    radius: props.radius,
    duration: props.duration,
    easing: props.easing,
    inset: props.inset,
    gutter: props.gutter,
    height: props.height,
    customStyle: props.customStyle as StyleValue,
  })
);

function select(opt: SegmentedOption, event?: unknown) {
  const result = resolveSegmentedSelection({
    option: opt,
    activeValue: active.value,
  });

  emit('click', { value: opt.value, option: opt, event });
  if (result.disabled) {
    emit('click-disabled', { value: opt.value, option: opt, event });
    return;
  }
  if (result.reselected) {
    emit('reselect', { value: opt.value, option: opt, event });
    scheduleSliderUpdate();
    return;
  }
  active.value = result.value;
  emit('update:modelValue', result.value);
  emit('select', { value: result.value, option: opt, oldValue: result.oldValue });
  emit('change', result.value, opt, result.oldValue);
  scheduleSliderUpdate();
}

watch(
  () => props.modelValue,
  v => {
    active.value = v;
    scheduleSliderUpdate();
  }
);
watch(
  [
    () => props.options,
    () => props.size,
    () => props.block,
    () => props.inset,
    () => props.gutter,
    () => props.animated,
    () => props.duration,
    () => props.easing,
    () => props.radius,
    () => props.height,
    () => props.customStyle,
  ],
  scheduleSliderUpdate,
  { deep: true }
);

function scheduleSliderUpdate() {
  nextTick(updateSlider);
}

function applySliderMetrics(wrap: SegmentWrapRect, items: SegmentRect[]) {
  sliderStyle.value = resolveSegmentedSliderStyle({
    wrap,
    items,
    options: props.options,
    activeValue: active.value,
    animated: props.animated,
    duration: props.duration,
    easing: props.easing,
  });
}

function getRootElement(): HTMLElement | null {
  if (typeof HTMLElement === 'undefined') return null;
  const raw = rootRef.value ? (rootRef.value.$el || rootRef.value) : null;
  return raw instanceof HTMLElement ? raw : null;
}

function updateH5Slider() {
  const root = getRootElement();
  if (!root) return false;

  const items = Array.from(root.children)
    .filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && el.classList.contains('lk-segmented__item')
    )
    .map(item => ({
      left: item.offsetLeft,
      width: item.offsetWidth,
    }));

  if (!items.length) return false;

  applySliderMetrics({ left: 0 }, items);
  return true;
}

function updateSlider() {
  if (updateH5Slider()) return;
  if (!inst?.proxy) return;

  const q = uni.createSelectorQuery().in(inst.proxy);
  q.select('.lk-segmented').fields({
    rect: true,
    size: true,
    scrollOffset: true,
  }, () => {});
  q.selectAll('.lk-segmented__item').boundingClientRect();
  q.exec(res => {
    const wrap = res?.[0];
    const items = res?.[1];
    if (!wrap || typeof wrap.left !== 'number' || !items?.length) return;

    applySliderMetrics(wrap, items);
  });
}

onMounted(() => {
  scheduleSliderUpdate();
  setTimeout(updateSlider, 50);
  // #ifdef H5
  if (typeof ResizeObserver !== 'undefined') {
    const el = rootRef.value ? (rootRef.value.$el || rootRef.value) : null;
    if (el && el instanceof HTMLElement) {
      resizeObserver = new ResizeObserver(() => {
        updateSlider();
      });
      resizeObserver.observe(el);
    }
  }
  // #endif
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});
</script>

<template>
  <view
    :id="id"
    ref="rootRef"
    class="lk-segmented"
    :class="[customClass, `lk-segmented--${size}`, { 'lk-segmented--block': block }]"
    :style="rootStyle"
  >
    <view class="lk-segmented__slider" :style="sliderStyle" />

    <view
      v-for="opt in options"
      :key="opt.value"
      class="lk-segmented__item"
      :class="{ 'is-active': opt.value === active, 'is-disabled': opt.disabled }"
      @tap="select(opt, $event)"
    >
      <slot name="item" :option="opt" :active="opt.value === active">
        <text class="lk-segmented__label">{{ opt.label }}</text>
      </slot>
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-segmented.scss';
</style>
