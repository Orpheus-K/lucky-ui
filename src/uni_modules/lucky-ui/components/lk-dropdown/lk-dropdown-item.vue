<script setup lang="ts">
import { inject, computed } from 'vue';
import type { Ref, StyleValue } from 'vue';
import { baseProps, LkProp } from '../common/props';
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
  resolveDropdownItemStyle,
} from './dropdown.utils';

defineOptions({ name: 'LkDropdownItem' });

const props = defineProps({
  ...baseProps,
  name: { type: [String, Number], required: true },
  disabled: { type: Boolean, default: false },
  icon: { type: String, default: '' },
  iconSize: LkProp.stringNumber(34),
  width: LkProp.stringNumber(''),
});
const emit = defineEmits(dropdownItemEmits);
interface DropdownContext {
  active: Ref<DropdownValue>;
  selectable: Readonly<Ref<boolean>>;
  selectItem: (name: DropdownValue, payload: DropdownSelectPayload) => void;
}

const dropdown = inject<DropdownContext | null>('LkDropdown', null);
const active = computed(() =>
  resolveDropdownItemActive({
    activeValue: dropdown?.active.value,
    name: props.name,
    selectable: dropdown?.selectable.value,
  })
);
const itemClass = computed(() =>
  resolveDropdownItemClass({
    active: active.value,
    disabled: props.disabled,
    customClass: props.customClass,
  })
);
const itemStyle = computed<StyleValue>(() =>
  resolveDropdownItemStyle({
    customStyle: props.customStyle as StyleValue,
    width: props.width,
  })
);

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
  <view :id="id" class="lk-dropdown-item" :class="itemClass" :style="itemStyle" @tap="click">
    <lk-icon v-if="icon" :name="icon" :size="iconSize" class="lk-dropdown-item__icon" />
    <text class="lk-dropdown-item__label"><slot /></text>
  </view>
</template>

<style lang="scss">
@use './lk-dropdown.scss';
</style>
