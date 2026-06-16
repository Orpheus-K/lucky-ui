<script setup lang="ts">
import type { StyleValue } from 'vue';
import { inject, computed } from 'vue';
import type { CheckboxValue } from './checkbox.props';
import { checkboxProps, checkboxEmits } from './checkbox.props';
import LkIcon from '../lk-icon/lk-icon.vue';
import {
  isCheckboxChecked,
  isCheckboxDisabled,
  resolveCheckboxClass,
  resolveCheckboxIconSize,
  resolveCheckboxIconStyle,
  resolveCheckboxIconType,
  resolveCheckboxShape,
  resolveCheckboxSize,
  resolveCheckboxValue,
} from './checkbox.utils';

// 导入 Symbol key （同文件内定义）
const LK_CHECKBOX_GROUP_KEY = Symbol.for('LkCheckboxGroup');

defineOptions({ name: 'LkCheckbox' });

const props = defineProps(checkboxProps);
const emit = defineEmits(checkboxEmits);

type CheckboxGroupContext = {
  props: {
    modelValue: CheckboxValue[];
    disabled: boolean;
    shape: string;
    iconType: string;
    size: string;
    activeColor: string;
  };
  toggleValue: (name: CheckboxValue) => void;
};

const group = inject<CheckboxGroupContext | null>(LK_CHECKBOX_GROUP_KEY, null);

const checkboxValue = computed(() => resolveCheckboxValue(props.name, props.label));
const style = computed(() => props.customStyle as StyleValue);

const isChecked = computed(() => {
  return isCheckboxChecked({
    group: group?.props,
    modelValue: props.modelValue,
    checkboxValue: checkboxValue.value,
  });
});

const isDisabled = computed(() => {
  return isCheckboxDisabled({
    disabled: props.disabled,
    group: group?.props,
  });
});

const mergedShape = computed(() => {
  return resolveCheckboxShape(props.shape, group?.props);
});

const mergedIconType = computed(() => {
  return resolveCheckboxIconType(props.iconType, group?.props);
});

const mergedSize = computed(() => {
  return resolveCheckboxSize(group?.props);
});

const mergedIconSize = computed(() => {
  return resolveCheckboxIconSize({
    iconSize: props.iconSize,
    size: mergedSize.value,
  });
});

const checkboxClass = computed(() => {
  return resolveCheckboxClass({
    size: mergedSize.value,
    shape: mergedShape.value,
    iconType: mergedIconType.value,
    checked: isChecked.value,
    disabled: isDisabled.value,
    indeterminate: props.indeterminate,
    customClass: props.customClass,
  });
});

const iconStyle = computed(() => {
  return resolveCheckboxIconStyle({
    checked: isChecked.value,
    indeterminate: props.indeterminate,
    activeColor: props.activeColor || group?.props.activeColor || '',
    iconSize: props.iconSize,
  });
});

function handleToggle(event?: unknown) {
  if (isDisabled.value) return;
  emit('click', event, isChecked.value, checkboxValue.value);
  if (group) {
    group.toggleValue(checkboxValue.value);
  } else {
    const nextValue = !props.modelValue;
    emit('update:modelValue', nextValue);
    emit('change', nextValue);
  }
}

function handleLabelClick() {
  if (props.labelDisabled) return;
  handleToggle();
}
</script>

<template>
  <view
    :id="id"
    :class="checkboxClass"
    :style="style"
    role="checkbox"
    :aria-checked="isChecked"
    :aria-disabled="isDisabled"
    :aria-label="label"
    @tap="handleToggle($event)"
  >
    <view class="lk-checkbox__icon-wrap">
      <slot
        name="icon"
        :checked="isChecked"
        :disabled="isDisabled"
        :indeterminate="props.indeterminate"
      >
        <view
          class="lk-checkbox__icon"
          :class="[`lk-checkbox__icon--${mergedShape}`]"
          :style="iconStyle"
        >
          <lk-icon
            class="lk-checkbox__check"
            name="check"
            :size="mergedIconSize"
            color="var(--lk-checkbox-check-color)"
          />
          <lk-icon
            class="lk-checkbox__dash"
            name="dash"
            :size="mergedIconSize"
            color="var(--lk-checkbox-check-color)"
          />
          <view class="lk-checkbox__dot" />
        </view>
      </slot>
    </view>
    <view v-if="label || $slots.default" class="lk-checkbox__label" @tap.stop="handleLabelClick">
      <slot>{{ label }}</slot>
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-checkbox.scss';
</style>
