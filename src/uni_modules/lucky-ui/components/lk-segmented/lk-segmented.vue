<script setup lang="ts">
import type { StyleValue } from 'vue';
import { ref, watch, nextTick, getCurrentInstance, computed, onMounted, onBeforeUnmount } from 'vue';
import { segmentedProps, segmentedEmits, type SegmentedOption } from './segmented.props';
import {
  resolveSegmentedRootStyle,
  resolveSegmentedSelection,
  resolveSegmentedSliderStyle,
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
    return;
  }
  active.value = result.value;
  emit('update:modelValue', result.value);
  emit('select', { value: result.value, option: opt, oldValue: result.oldValue });
  emit('change', result.value, opt, result.oldValue);
  setTimeout(updateSlider, 50);
}

watch(
  () => props.modelValue,
  v => {
    active.value = v;
    updateSlider();
  }
);
watch(
  [() => props.options, () => props.size, () => props.block, () => props.inset, () => props.gutter],
  () => nextTick(updateSlider),
  { deep: true }
);

function updateSlider() {
  const q = uni.createSelectorQuery().in(inst);
  q.select('.lk-segmented').boundingClientRect();
  q.selectAll('.lk-segmented__item').boundingClientRect();
  q.exec(res => {
    const wrap = res?.[0];
    const items = res?.[1];
    if (!wrap || !items?.length) return;

    sliderStyle.value = resolveSegmentedSliderStyle({
      wrap,
      items,
      options: props.options,
      activeValue: active.value,
      animated: props.animated,
      duration: props.duration,
      easing: props.easing,
    });
  });
}

onMounted(() => {
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
