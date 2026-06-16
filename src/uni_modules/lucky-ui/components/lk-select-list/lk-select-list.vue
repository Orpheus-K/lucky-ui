<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed } from 'vue';
import LkIcon from '../lk-icon/lk-icon.vue';
import {
  selectListEmits,
  selectListProps,
  type SelectListOption,
  type SelectValue,
} from './select-list.props';
import {
  getSelectListText,
  getSelectListValue,
  isSelectListOptionDisabled,
  isSelectListSelected,
  resolveSelectListClass,
  resolveSelectListColumnCount,
  resolveSelectListItemRadius,
  resolveSelectListOptionClass,
  resolveSelectListSelection,
  resolveSelectListStyle,
} from './select-list.utils';

defineOptions({ name: 'LkSelectList' });

const props = defineProps(selectListProps);
const emit = defineEmits(selectListEmits);

const rootClass = computed(() => [
  ...resolveSelectListClass({
    size: props.size,
    inset: props.inset,
    disabled: props.disabled,
    bordered: props.bordered,
    selectedBg: props.selectedBg,
    selectedBorder: props.selectedBorder,
    columnCount: columnCount.value,
    customClass: props.customClass,
  }),
]);

const columnCount = computed(() => resolveSelectListColumnCount(props.columns));

const itemRadiusValue = computed(() => {
  return resolveSelectListItemRadius(props.itemRadius);
});

const rootStyle = computed<StyleValue>(() => {
  return resolveSelectListStyle({
    customStyle: props.customStyle as StyleValue,
    columnCount: columnCount.value,
    itemRadius: itemRadiusValue.value,
    activeColor: props.activeColor,
  });
});

function getValue(option: SelectListOption): SelectValue {
  return getSelectListValue(option, props.valueKey);
}

function getTitle(option: SelectListOption): string {
  return getSelectListText(option, props.titleKey);
}

function getDescription(option: SelectListOption): string {
  return getSelectListText(option, props.descKey);
}

function isOptionDisabled(option: SelectListOption): boolean {
  return isSelectListOptionDisabled({
    option,
    disabled: props.disabled,
    disabledKey: props.disabledKey,
  });
}

function isSelected(option: SelectListOption): boolean {
  return isSelectListSelected({
    option,
    valueKey: props.valueKey,
    modelValue: props.modelValue,
    multiple: props.multiple,
  });
}

function optionClass(option: SelectListOption) {
  return resolveSelectListOptionClass({
    selected: isSelected(option),
    disabled: isOptionDisabled(option),
  });
}

function onSelect(option: SelectListOption) {
  const result = resolveSelectListSelection({
    option,
    valueKey: props.valueKey,
    modelValue: props.modelValue,
    multiple: props.multiple,
    max: props.max,
    disabled: isOptionDisabled(option),
  });

  if (result.type === 'disabled' || result.type === 'unchanged') {
    return;
  }

  if (result.type === 'overlimit') {
    emit('overlimit', option, props.max);
    return;
  }

  if (result.type === 'select') {
    emit('update:modelValue', result.value);
    emit('change', result.value, option);
    emit('select', option, result.selected);
  }
}
</script>

<template>
  <view :id="id" :class="rootClass" :style="rootStyle">
    <view
      v-for="option in options"
      :key="String(getValue(option))"
      :class="optionClass(option)"
      @tap="onSelect(option)"
    >
      <view v-if="option.icon" class="lk-select-list__prefix">
        <lk-icon :name="option.icon" size="36" color="primary" />
      </view>

      <view class="lk-select-list__content">
        <text class="lk-select-list__title">{{ getTitle(option) }}</text>
        <text v-if="getDescription(option)" class="lk-select-list__desc">
          {{ getDescription(option) }}
        </text>
      </view>

      <view v-if="showIcon" class="lk-select-list__suffix">
        <lk-icon
          v-if="isSelected(option)"
          :name="icon"
          size="34"
          color="var(--lk-select-list-icon-color)"
        />
      </view>
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-select-list.scss';
</style>
