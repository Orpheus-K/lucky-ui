<script setup lang="ts">
import type { StyleValue } from 'vue';
import { provide, computed } from 'vue';
import type { CheckboxValue } from './checkbox.props';
import { checkboxGroupProps, checkboxGroupEmits } from './checkbox.props';
import { useFormField } from '../lk-form/useFormField';
import { resolveCheckboxGroupClass, resolveCheckboxGroupToggle } from './checkbox.utils';

defineOptions({ name: 'LkCheckboxGroup' });

const props = defineProps(checkboxGroupProps);
const emit = defineEmits(checkboxGroupEmits);

const formField = useFormField({
  prop: () => props.prop,
  disabled: () => props.disabled,
  validateEvent: () => props.validateEvent,
});
const isDisabled = formField.disabled;

const LK_CHECKBOX_GROUP_KEY = Symbol.for('LkCheckboxGroup');

const style = computed(() => props.customStyle as StyleValue);

async function toggleValue(name: CheckboxValue, interaction = formField.captureInteraction()) {
  if (!formField.isInteractionCurrent(interaction)) return;
  const result = resolveCheckboxGroupToggle({
    currentValue: props.modelValue,
    name,
    max: props.max,
  });

  if (result.overlimit) {
    emit('overlimit', name, props.max);
    return;
  }

  emit('update:modelValue', result.value);
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  emit('change', result.value);
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  emit('item-change', name, result.checked, result.value);
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  await formField.emitChange(result.value, interaction);
}

provide(LK_CHECKBOX_GROUP_KEY, {
  props,
  disabled: isDisabled,
  captureInteraction: formField.captureInteraction,
  toggleValue,
});

const groupClass = computed(() => {
  return resolveCheckboxGroupClass({
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
@use './lk-checkbox.scss';
</style>
