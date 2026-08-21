<script setup lang="ts">
import type { StyleValue } from 'vue';
import { provide, computed } from 'vue';
import type { RadioValue } from './radio.props';
import { radioGroupProps, radioGroupEmits } from './radio.props';
import { useFormField } from '../lk-form/useFormField';
import { resolveRadioGroupClass } from './radio.utils';

defineOptions({ name: 'LkRadioGroup' });

const props = defineProps(radioGroupProps);
const emit = defineEmits(radioGroupEmits);

const formField = useFormField({
  prop: () => props.prop,
  disabled: () => props.disabled,
  validateEvent: () => props.validateEvent,
});
const isDisabled = formField.disabled;

const LK_RADIO_GROUP_KEY = Symbol.for('LkRadioGroup');

const style = computed(() => props.customStyle as StyleValue);

async function updateValue(value: RadioValue, interaction = formField.captureInteraction()) {
  if (!formField.isInteractionCurrent(interaction)) return;
  if (value === props.modelValue) return;
  emit('update:modelValue', value);
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  emit('change', value);
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  emit('item-change', value);
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  await formField.emitChange(value, interaction);
}

provide(LK_RADIO_GROUP_KEY, {
  props,
  disabled: isDisabled,
  captureInteraction: formField.captureInteraction,
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
  <view :id="id" :class="groupClass" :style="style" :aria-disabled="isDisabled">
    <slot />
  </view>
</template>

<style lang="scss">
@use './lk-radio.scss';
</style>
