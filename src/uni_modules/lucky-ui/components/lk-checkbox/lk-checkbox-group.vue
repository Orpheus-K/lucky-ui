<script setup lang="ts">
import type { StyleValue } from 'vue';
import { provide, computed, inject } from 'vue';
import type { CheckboxValue } from './checkbox.props';
import { checkboxGroupProps, checkboxGroupEmits } from './checkbox.props';
import { formContextKey } from '../lk-form/context';
import { resolveCheckboxGroupClass, resolveCheckboxGroupToggle } from './checkbox.utils';

defineOptions({ name: 'LkCheckboxGroup' });

const props = defineProps(checkboxGroupProps);
const emit = defineEmits(checkboxGroupEmits);

const form = inject(formContextKey, null);

const LK_CHECKBOX_GROUP_KEY = Symbol.for('LkCheckboxGroup');

const style = computed(() => props.customStyle as StyleValue);

function updateValue(value: CheckboxValue[], changedValue: CheckboxValue, checked: boolean) {
  emit('update:modelValue', value);
  emit('change', value);
  emit('item-change', changedValue, checked, value);
  if (props.validateEvent && props.prop) {
    form?.emitFieldChange(props.prop, value);
  }
}

function toggleValue(name: CheckboxValue) {
  const result = resolveCheckboxGroupToggle({
    currentValue: props.modelValue,
    name,
    max: props.max,
  });

  if (result.overlimit) {
    emit('overlimit', name, props.max);
    return;
  }

  updateValue(result.value, name, result.checked);
}

provide(LK_CHECKBOX_GROUP_KEY, {
  props,
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
  <view :id="id" :class="groupClass" :style="style">
    <slot />
  </view>
</template>

<style lang="scss">
@use './lk-checkbox.scss';
</style>
