<script setup lang="ts">
import type { StyleValue } from 'vue';
import { ref, watch, computed } from 'vue';
import { useFormField } from '../lk-form/useFormField';
import { rateProps, rateEmits } from './rate.props';
import {
  createRateStars,
  getRateStarStatus,
  normalizeRateSize,
  resolveRateSelection,
} from './rate.utils';
import LkIcon from '../lk-icon/lk-icon.vue';

defineOptions({ name: 'LkRate' });

const props = defineProps(rateProps);
const emit = defineEmits(rateEmits);

const formField = useFormField({
  prop: () => props.prop,
  disabled: () => props.disabled,
  validateEvent: () => props.validateEvent,
});
const isDisabled = formField.disabled;

const innerValue = ref<number>(props.modelValue);

watch(
  () => props.modelValue,
  val => {
    innerValue.value = val;
  }
);

// 尺寸归一化，支持 40 / '40' / 'var(--lk-rpx-40)'
const iconSize = computed(() => normalizeRateSize(props.size));

const activeColor = computed(() => props.color || 'var(--lk-color-warning)');
const voidColor = computed(() => props.colorVoid || 'var(--lk-color-border)');

const activeIcon = computed(() => props.icon || 'star-fill');
const voidIcon = computed(() => props.iconVoid || 'star');
const rootStyle = computed<StyleValue>(() => props.customStyle as StyleValue);

const stars = computed(() => createRateStars(props.count));

function getStarStatus(index: number): 'full' | 'void' {
  return getRateStarStatus(innerValue.value, index);
}

function getStarIcon(index: number) {
  const status = getStarStatus(index);
  if (status === 'full') return activeIcon.value;
  return voidIcon.value;
}

function getStarColor(index: number) {
  const status = getStarStatus(index);
  return status === 'void' ? voidColor.value : activeColor.value;
}

async function select(index: number, event?: unknown) {
  const interaction = formField.captureInteraction();
  const result = resolveRateSelection({
    currentValue: innerValue.value,
    index,
    allowClear: props.allowClear,
    disabled: isDisabled.value,
    readonly: props.readonly,
  });

  if (result.blocked) {
    emit('click-disabled', {
      value: innerValue.value,
      index,
      disabled: isDisabled.value,
      readonly: props.readonly,
      event,
    });
    return;
  }

  const newValue = result.value;
  const oldValue = result.oldValue;
  emit('click', { value: newValue, oldValue, index, event });
  if (!(await formField.awaitInteractionCurrent(interaction))) return;

  // 点击当前已选中的星才清零
  if (result.cleared) {
    emit('clear', { oldValue, index, event });
    if (!(await formField.awaitInteractionCurrent(interaction))) return;
  }

  if (!result.changed) return;

  innerValue.value = newValue;
  emit('update:modelValue', newValue);
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  emit('change', newValue, oldValue);
  if (!(await formField.awaitInteractionCurrent(interaction))) return;

  await formField.emitChange(newValue, interaction);
}

async function onTap(_e: unknown, index: number) {
  await select(index, _e);
}
</script>

<template>
  <view
    :id="id"
    class="lk-rate"
    :class="[
      customClass,
      {
        'is-disabled': isDisabled,
        'is-readonly': props.readonly,
      },
    ]"
    :style="rootStyle"
    :aria-disabled="isDisabled"
  >
    <view v-for="item in stars" :key="item" class="lk-rate__item" @tap="onTap($event, item)">
      <lk-icon :name="getStarIcon(item)" :size="iconSize" :color="getStarColor(item)" />
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-rate.scss';
</style>
