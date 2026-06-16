<script setup lang="ts">
import { computed } from 'vue';
import type { StyleValue } from 'vue';
import { choiceProps, choiceEmits } from './choice.props';
import LkIcon from '../lk-icon/lk-icon.vue';
import {
  isChoiceSelected,
  resolveChoiceContainerStyle,
  resolveChoiceItemClass,
  resolveChoiceRootClass,
  resolveChoiceSelection,
  type ChoiceOption,
  type ChoiceValue,
} from './choice.utils';

defineOptions({ name: 'LkChoice' });

const props = defineProps(choiceProps);
const emit = defineEmits(choiceEmits);

function isSelected(value: ChoiceValue) {
  return isChoiceSelected({
    modelValue: props.modelValue,
    value,
    multiple: props.multiple,
  });
}

function handleSelect(option: ChoiceOption) {
  const value = option.value;
  const result = resolveChoiceSelection({
    modelValue: props.modelValue,
    value,
    multiple: props.multiple,
    allowUnselect: props.allowUnselect,
  });

  if (result.changed) {
    emit('update:modelValue', result.value);
    emit('change', result.value);
  }
  emit('click', option);
}

const containerStyle = computed(() =>
  resolveChoiceContainerStyle({
    gap: props.gap || 0,
    wrap: props.wrap,
    customStyle: props.customStyle as StyleValue,
  })
);

function itemClass(option: ChoiceOption) {
  return resolveChoiceItemClass({
    size: props.size,
    selected: isSelected(option.value),
  });
}

const rootClass = computed(() =>
  resolveChoiceRootClass({
    wrap: props.wrap,
    customClass: props.customClass,
  })
);
</script>

<template>
  <view class="lk-choice-container" :class="{ 'lk-choice-container--nowrap': !wrap }">
    <view :class="rootClass" :style="containerStyle">
      <view
        v-for="(opt, index) in options"
        :key="index"
        :class="itemClass(opt)"
        @tap="handleSelect(opt)"
      >
        <slot name="item" :option="opt" :selected="isSelected(opt.value)">
          <lk-icon v-if="opt.icon" :name="opt.icon" class="lk-choice__icon" />
          <text class="lk-choice__label">{{ opt.label }}</text>
        </slot>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-choice.scss';
</style>
