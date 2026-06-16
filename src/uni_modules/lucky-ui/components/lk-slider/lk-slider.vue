<script setup lang="ts">
import {
  ref,
  watch,
  computed,
  inject,
  getCurrentInstance,
  onMounted,
  nextTick,
  type StyleValue,
} from 'vue';
import { formContextKey } from '../lk-form/context';
import type { SliderValue } from './slider.props';
import { sliderProps, sliderEmits } from './slider.props';
import {
  formatSliderDisplayValue,
  getSliderEmitValue,
  getSliderPointX,
  initSliderValue,
  resolveSliderBarStyle,
  resolveSliderBlockStyle,
  resolveSliderRootClass,
  resolveSliderRootStyle,
  resolveSliderStops,
  resolveSliderThumbStyle,
  resolveSliderTrackStyle,
  resolveSliderUpdate,
  shouldValidateSliderField,
  type SliderPointerEvent,
} from './slider.utils';

defineOptions({ name: 'LkSlider' });

const props = defineProps(sliderProps);
const emit = defineEmits(sliderEmits);
const form = inject(formContextKey, null);

const currentVal = ref<number[]>([]);
const dragging = ref(false);
const draggingIndex = ref(-1);

const instance = getCurrentInstance();
const trackId = `lk-slider-track-${instance?.uid ?? Math.random().toString(36).slice(2)}`;
const trackRect = ref<{ left: number; width: number }>({ left: 0, width: 0 });

watch(
  () => props.modelValue,
  newVal => {
    if (dragging.value) return;
    initValue(newVal);
  },
  { immediate: true, deep: true }
);

function initValue(val: number | number[]) {
  currentVal.value = initSliderValue({
    value: val,
    range: props.range,
    min: props.min,
    max: props.max,
  });
}

const stops = computed(() => {
  return resolveSliderStops({
    showStops: props.showStops,
    step: props.step,
    min: props.min,
    max: props.max,
  });
});

const barStyle = computed(() => {
  return resolveSliderBarStyle({
    activeColor: props.activeColor,
    dragging: dragging.value,
    range: props.range,
    values: currentVal.value,
    min: props.min,
    max: props.max,
  });
});

const rootClass = computed(() => [
  ...resolveSliderRootClass({
    size: props.size,
    disabled: props.disabled,
    dragging: dragging.value,
    customClass: props.customClass,
  }),
]);

const rootStyle = computed(() => {
  return resolveSliderRootStyle({
    customStyle: props.customStyle as StyleValue,
    activeColor: props.activeColor,
    inactiveColor: props.inactiveColor,
  });
});

const trackStyle = computed(() => {
  return resolveSliderTrackStyle({
    barHeight: props.barHeight,
    inactiveColor: props.inactiveColor,
  });
});

function getThumbStyle(index: number) {
  return resolveSliderThumbStyle({
    value: currentVal.value[index],
    min: props.min,
    max: props.max,
    dragging: dragging.value,
    active: draggingIndex.value === index,
  });
}

const blockCustomStyle = computed(() => {
  return resolveSliderBlockStyle({
    blockSize: props.blockSize,
    blockColor: props.blockColor,
  });
});

function measureTrack(): Promise<{ left: number; width: number }> {
  return new Promise(resolve => {
    const q = uni.createSelectorQuery();
    if (instance?.proxy) q.in(instance.proxy);
    q.select(`#${trackId}`)
      .boundingClientRect(data => {
        const node = Array.isArray(data) ? data[0] : data;
        trackRect.value = { left: node?.left ?? 0, width: node?.width ?? 0 };
        resolve(trackRect.value);
      })
      .exec();
  });
}

function getPointX(e: Event | SliderPointerEvent): number {
  return getSliderPointX(e);
}

function formatDisplayValue(value: number) {
  return formatSliderDisplayValue(value, props.formatValue);
}

function emitValue(): SliderValue {
  return getSliderEmitValue({
    range: props.range,
    values: currentVal.value,
  });
}

function commitChange() {
  const finalVal = emitValue();
  emit('change', finalVal);
  if (shouldValidateSliderField({ validateEvent: props.validateEvent, prop: props.prop })) {
    form?.emitFieldChange(props.prop, finalVal);
  }
  return finalVal;
}

function updateValue(clientX: number, isClick = false): SliderValue | null {
  const result = resolveSliderUpdate({
    clientX,
    rect: trackRect.value,
    values: currentVal.value,
    draggingIndex: draggingIndex.value,
    isClick,
    range: props.range,
    min: props.min,
    max: props.max,
    step: props.step,
  });

  if (!result) return null;
  if (isClick || draggingIndex.value === -1) {
    draggingIndex.value = result.draggingIndex;
  }

  if (result.changed) {
    currentVal.value = result.values;
    emit('update:modelValue', result.emitValue);
    emit('input', result.emitValue);
  }

  return result.emitValue;
}

async function onTouchStart(e: Event | SliderPointerEvent) {
  if (props.disabled) return;
  await measureTrack();
  dragging.value = true;
  const clientX = getPointX(e);
  updateValue(clientX, true);
  emit('dragstart', emitValue(), draggingIndex.value, e);
}

function onTouchMove(e: Event | SliderPointerEvent) {
  if (props.disabled || !dragging.value) return;
  const clientX = getPointX(e);
  updateValue(clientX);
}

function onTouchEnd(e?: Event | SliderPointerEvent) {
  if (props.disabled || !dragging.value) return;
  const index = draggingIndex.value;
  dragging.value = false;
  draggingIndex.value = -1;
  const finalVal = commitChange();
  emit('dragend', finalVal, index, e);
  emit('drag-release', finalVal);
}

async function onTrackClick(e: Event | SliderPointerEvent) {
  if (props.disabled || dragging.value) return;
  if (trackRect.value.width <= 0) await measureTrack();
  const clientX = getPointX(e);
  const nextValue = updateValue(clientX, true);
  if (nextValue !== null) {
    emit('click', nextValue, e);
    commitChange();
  }
  draggingIndex.value = -1;
}

onMounted(() => nextTick(() => measureTrack()));
</script>

<template>
  <view :id="id" :class="rootClass" :style="rootStyle">
    <view
      :id="trackId"
      class="lk-slider__track-container"
      @tap="onTrackClick"
      @touchstart.stop.prevent="onTouchStart"
      @touchmove.stop.prevent="onTouchMove"
      @touchend.stop.prevent="onTouchEnd"
      @touchcancel="onTouchEnd"
      @mousedown.stop.prevent="onTouchStart"
      @mousemove.stop.prevent="onTouchMove"
      @mouseup.stop.prevent="onTouchEnd"
      @mouseleave="onTouchEnd"
    >
      <view class="lk-slider__track" :style="trackStyle"></view>

      <view class="lk-slider__bar" :style="barStyle"></view>

      <view
        v-for="stop in stops"
        :key="stop"
        class="lk-slider__stop"
        :style="{ left: stop + '%' }"
      ></view>

      <view class="lk-slider__thumb-wrapper" :style="getThumbStyle(0)">
        <slot name="button" :value="currentVal[0]">
          <view class="lk-slider__thumb" :style="blockCustomStyle">
            <view v-if="showValue" class="lk-slider__tooltip">
              {{ formatDisplayValue(currentVal[0]) }}
            </view>
          </view>
        </slot>
      </view>

      <view v-if="range" class="lk-slider__thumb-wrapper" :style="getThumbStyle(1)">
        <slot name="button" :value="currentVal[1]">
          <view class="lk-slider__thumb" :style="blockCustomStyle">
            <view v-if="showValue" class="lk-slider__tooltip">
              {{ formatDisplayValue(currentVal[1]) }}
            </view>
          </view>
        </slot>
      </view>
    </view>

    <text v-if="showValue && showValueText && !range" class="lk-slider__value">
      {{ formatDisplayValue(currentVal[0]) }}
    </text>
  </view>
</template>

<style lang="scss">
@use './lk-slider.scss';
</style>
