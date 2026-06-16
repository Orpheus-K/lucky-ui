<script setup lang="ts">
import type { StyleValue } from 'vue';
import { ref, watch, computed, inject } from 'vue';
import { formContextKey } from '../lk-form/context';
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

const form = inject(formContextKey, null);

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

function select(index: number, event?: unknown) {
  const result = resolveRateSelection({
    currentValue: innerValue.value,
    index,
    allowClear: props.allowClear,
    disabled: props.disabled,
    readonly: props.readonly,
  });

  if (result.blocked) {
    emit('click-disabled', {
      value: innerValue.value,
      index,
      disabled: props.disabled,
      readonly: props.readonly,
      event,
    });
    return;
  }

  const newValue = result.value;
  const oldValue = result.oldValue;
  emit('click', { value: newValue, oldValue, index, event });

  // 点击当前已选中的星才清零
  if (result.cleared) {
    emit('clear', { oldValue, index, event });
  }

  if (!result.changed) return;

  innerValue.value = newValue;
  emit('update:modelValue', newValue);
  emit('change', newValue, oldValue);

  if (props.prop) {
    form?.emitFieldChange(props.prop, newValue);
  }
}

function onTap(_e: unknown, index: number) {
  select(index, _e);
}
</script>

<template>
  <view
    :id="id"
    class="lk-rate"
    :class="[
      customClass,
      {
        'is-disabled': props.disabled,
        'is-readonly': props.readonly,
      },
    ]"
    :style="rootStyle"
  >
    <view v-for="item in stars" :key="item" class="lk-rate__item" @tap="onTap($event, item)">
      <lk-icon :name="getStarIcon(item)" :size="iconSize" :color="getStarColor(item)" />
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-rate.scss';
</style>
