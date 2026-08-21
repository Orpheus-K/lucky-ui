<script setup lang="ts">
import {
  ref,
  watch,
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  nextTick,
  type StyleValue,
} from 'vue';
import { useFormField } from '../lk-form/useFormField';
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
  type SliderPointerEvent,
} from './slider.utils';

defineOptions({ name: 'LkSlider' });

const props = defineProps(sliderProps);
const emit = defineEmits(sliderEmits);
const formField = useFormField({
  prop: () => props.prop,
  disabled: () => props.disabled,
  validateEvent: () => props.validateEvent,
});
const isDisabled = formField.disabled;

const currentVal = ref<number[]>([]);
const dragging = ref(false);
const draggingIndex = ref(-1);
let dragInteraction: number | null = null;
let updateGeneration = 0;
let activeDragGeneration: number | null = null;

function beginUpdate() {
  updateGeneration += 1;
  return updateGeneration;
}

function ownsUpdate(generation: number) {
  return generation === updateGeneration;
}

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
    disabled: isDisabled.value,
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

function measureTrack(
  interaction = formField.captureInteraction()
): Promise<{ left: number; width: number }> {
  return new Promise(resolve => {
    if (!formField.isInteractionCurrent(interaction)) {
      resolve(trackRect.value);
      return;
    }
    const q = uni.createSelectorQuery();
    if (instance?.proxy) q.in(instance.proxy);
    q.select(`#${trackId}`)
      .boundingClientRect(data => {
        if (!formField.isInteractionCurrent(interaction)) {
          resolve(trackRect.value);
          return;
        }
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

async function commitChange(
  interaction: number,
  ownsCommit: () => boolean = () => true
): Promise<SliderValue | null> {
  if (!ownsCommit() || !formField.isInteractionCurrent(interaction)) return null;
  const finalVal = emitValue();
  emit('change', finalVal);
  if (!(await formField.awaitInteractionCurrent(interaction)) || !ownsCommit()) return null;
  await formField.emitChange(finalVal, interaction);
  if (!(await formField.awaitInteractionCurrent(interaction)) || !ownsCommit()) return null;
  return finalVal;
}

async function updateValue(
  clientX: number,
  isClick: boolean,
  interaction: number,
  ownsUpdate: () => boolean = () => true
): Promise<SliderValue | null> {
  if (!ownsUpdate() || !formField.isInteractionCurrent(interaction)) return null;
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
    const interactionCurrent = await formField.awaitInteractionCurrent(interaction);
    if (!ownsUpdate()) return null;
    if (!interactionCurrent) {
      initValue(props.modelValue);
      return null;
    }
    emit('input', result.emitValue);
    if (!(await formField.awaitInteractionCurrent(interaction)) || !ownsUpdate()) return null;
  }

  return result.emitValue;
}

async function onTouchStart(e: Event | SliderPointerEvent) {
  if (isDisabled.value) return;
  const generation = beginUpdate();
  activeDragGeneration = generation;
  const interaction = formField.captureInteraction();
  await measureTrack(interaction);
  function ownsDrag() {
    return activeDragGeneration === generation && ownsUpdate(generation);
  }
  if (!ownsDrag() || !formField.isInteractionCurrent(interaction)) return;
  dragInteraction = interaction;
  dragging.value = true;
  const clientX = getPointX(e);
  if ((await updateValue(clientX, true, interaction, ownsDrag)) === null) return;
  if (!ownsDrag() || !formField.isInteractionCurrent(interaction)) return;
  emit('dragstart', emitValue(), draggingIndex.value, e);
}

function onTouchMove(e: Event | SliderPointerEvent) {
  if (isDisabled.value || !dragging.value || dragInteraction === null) return;
  const clientX = getPointX(e);
  const generation = activeDragGeneration;
  if (generation === null) return;
  void updateValue(
    clientX,
    false,
    dragInteraction,
    () => activeDragGeneration === generation && ownsUpdate(generation)
  );
}

async function onTouchEnd(e?: Event | SliderPointerEvent) {
  if (isDisabled.value || !dragging.value) {
    if (activeDragGeneration !== null && ownsUpdate(activeDragGeneration)) beginUpdate();
    activeDragGeneration = null;
    dragging.value = false;
    draggingIndex.value = -1;
    dragInteraction = null;
    return;
  }
  const generation = activeDragGeneration;
  const interaction = dragInteraction;
  const index = draggingIndex.value;
  activeDragGeneration = null;
  dragging.value = false;
  draggingIndex.value = -1;
  dragInteraction = null;
  if (interaction === null || generation === null) return;
  const commitGeneration = generation;
  function ownsCommit() {
    return ownsUpdate(commitGeneration);
  }
  const finalVal = await commitChange(interaction, ownsCommit);
  if (finalVal === null || !ownsCommit() || !formField.isInteractionCurrent(interaction)) return;
  emit('dragend', finalVal, index, e);
  if (!(await formField.awaitInteractionCurrent(interaction)) || !ownsCommit()) return;
  emit('drag-release', finalVal);
}

async function onTrackClick(e: Event | SliderPointerEvent) {
  if (isDisabled.value || dragging.value) return;
  const generation = beginUpdate();
  activeDragGeneration = null;
  const interaction = formField.captureInteraction();
  if (trackRect.value.width <= 0) await measureTrack(interaction);
  function ownsClick() {
    return ownsUpdate(generation);
  }
  if (!ownsClick() || !formField.isInteractionCurrent(interaction)) return;
  const clientX = getPointX(e);
  const nextValue = await updateValue(clientX, true, interaction, ownsClick);
  if (nextValue !== null && ownsClick()) {
    emit('click', nextValue, e);
    if (!(await formField.awaitInteractionCurrent(interaction)) || !ownsClick()) return;
    await commitChange(interaction, ownsClick);
  }
  if (ownsClick()) draggingIndex.value = -1;
}

onMounted(() => {
  const interaction = formField.captureInteraction();
  void nextTick(() => {
    if (formField.isInteractionCurrent(interaction)) void measureTrack(interaction);
  });
});

watch(
  isDisabled,
  disabled => {
    if (!disabled) return;
    beginUpdate();
    activeDragGeneration = null;
    dragging.value = false;
    draggingIndex.value = -1;
    dragInteraction = null;
  },
  { flush: 'sync' }
);

onBeforeUnmount(() => {
  beginUpdate();
  activeDragGeneration = null;
});
</script>

<template>
  <view :id="id" :class="rootClass" :style="rootStyle" :aria-disabled="isDisabled">
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
