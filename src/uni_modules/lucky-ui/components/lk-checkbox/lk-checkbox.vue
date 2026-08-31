<script setup lang="ts">
import type { Ref, StyleValue } from 'vue';
import { inject, computed } from 'vue';
import type { CheckboxValue } from './checkbox.props';
import { checkboxProps, checkboxEmits } from './checkbox.props';
import LkIcon from '../lk-icon/lk-icon.vue';
import { useFormField } from '../lk-form/useFormField';
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
  disabled: Readonly<Ref<boolean>>;
  captureInteraction: () => number;
  toggleValue: (name: CheckboxValue, interaction?: number) => void | Promise<void>;
};

const group = inject<CheckboxGroupContext | null>(LK_CHECKBOX_GROUP_KEY, null);
const formField = useFormField({
  prop: () => props.prop,
  disabled: () => props.disabled || !!group?.disabled.value,
  validateEvent: () => props.validateEvent,
});

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
    disabled: formField.disabled.value,
    group: group ? { ...group.props, disabled: group.disabled.value } : undefined,
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

async function handleToggle(event?: unknown) {
  if (isDisabled.value) return;
  const interaction = formField.captureInteraction();
  const groupInteraction = group?.captureInteraction();
  emit('click', event, isChecked.value, checkboxValue.value);
  if (!(await formField.awaitInteractionCurrent(interaction)) || isDisabled.value) return;
  if (group) {
    await group.toggleValue(checkboxValue.value, groupInteraction);
  } else {
    const nextValue = !props.modelValue;
    emit('update:modelValue', nextValue);
    if (!(await formField.awaitInteractionCurrent(interaction)) || isDisabled.value) return;
    emit('change', nextValue);
    if (!(await formField.awaitInteractionCurrent(interaction)) || isDisabled.value) return;
    await formField.emitChange(nextValue, interaction);
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
          <view v-if="props.indeterminate" class="lk-checkbox__dash">
            <lk-icon
              name="dash"
              :size="mergedIconSize"
              color="var(--lk-checkbox-check-color)"
            />
          </view>
          <template v-else>
            <view v-if="mergedIconType === 'check'" class="lk-checkbox__check">
              <lk-icon
                name="check"
                :size="mergedIconSize"
                color="var(--lk-checkbox-check-color)"
              />
            </view>
            <view v-else class="lk-checkbox__dot" />
          </template>
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
