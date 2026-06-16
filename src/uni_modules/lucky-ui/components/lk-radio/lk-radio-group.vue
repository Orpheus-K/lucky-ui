<script setup lang="ts">
import type { StyleValue } from 'vue';
import { provide, computed, inject } from 'vue';
import type { RadioValue } from './radio.props';
import { radioGroupProps, radioGroupEmits } from './radio.props';
import { formContextKey } from '../lk-form/context';
import { resolveRadioGroupClass } from './radio.utils';

defineOptions({ name: 'LkRadioGroup' });

const props = defineProps(radioGroupProps);
const emit = defineEmits(radioGroupEmits);

const form = inject(formContextKey, null);

const LK_RADIO_GROUP_KEY = Symbol.for('LkRadioGroup');

const style = computed(() => props.customStyle as StyleValue);

function updateValue(value: RadioValue) {
  if (value === props.modelValue) return;
  emit('update:modelValue', value);
  emit('change', value);
  emit('item-change', value);
  if (props.validateEvent && props.prop) {
    form?.emitFieldChange(props.prop, value);
  }
}

provide(LK_RADIO_GROUP_KEY, {
  props,
  updateValue,
});

const groupClass = computed(() => {
  return resolveRadioGroupClass({
    direction: props.direction,
    customClass: props.customClass,
  });
});
</script>

<template>
  <view :id="id" :class="groupClass" :style="style">
    <slot />
  </view>
</template>

<style lang="scss">
@use './lk-radio.scss';
</style>
