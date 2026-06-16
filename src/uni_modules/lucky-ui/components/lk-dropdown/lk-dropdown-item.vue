<script setup lang="ts">
import { inject, computed } from 'vue';
import type { Ref, StyleValue } from 'vue';
import { baseProps } from '../common/props';
import {
  dropdownItemEmits,
  type DropdownSelectPayload,
  type DropdownValue,
} from './dropdown.props';
import {
  canSelectDropdownItem,
  createDropdownItemPayload,
  resolveDropdownItemActive,
  resolveDropdownItemClass,
} from './dropdown.utils';

defineOptions({ name: 'LkDropdownItem' });

const props = defineProps({
  ...baseProps,
  name: { type: [String, Number], required: true },
  disabled: { type: Boolean, default: false },
  icon: { type: String, default: '' },
});
const emit = defineEmits(dropdownItemEmits);
interface DropdownContext {
  active: Ref<DropdownValue>;
  selectItem: (name: DropdownValue, payload: DropdownSelectPayload) => void;
}

const dropdown = inject<DropdownContext | null>('LkDropdown', null);
const active = computed(() =>
  resolveDropdownItemActive({
    activeValue: dropdown?.active.value,
    name: props.name,
  })
);
const itemClass = computed(() =>
  resolveDropdownItemClass({
    active: active.value,
    disabled: props.disabled,
    customClass: props.customClass,
  })
);
const itemStyle = computed<StyleValue>(() => props.customStyle as StyleValue);

function click(event: unknown) {
  const payload = createDropdownItemPayload({
    name: props.name,
    event,
  });
  if (!canSelectDropdownItem(props.disabled)) {
    emit('click-disabled', payload);
    return;
  }
  emit('click', payload);
  dropdown?.selectItem(props.name, payload);
}
</script>

<template>
  <view class="lk-dropdown-item" :class="itemClass" :style="itemStyle" @tap="click">
    <lk-icon v-if="icon" :name="icon" size="34" class="lk-dropdown-item__icon" />
    <text class="lk-dropdown-item__label"><slot /></text>
    <lk-icon v-if="active" name="check" size="28" />
  </view>
</template>

<style lang="scss">
@use './lk-dropdown.scss';
</style>
