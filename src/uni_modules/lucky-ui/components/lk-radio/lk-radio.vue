<script setup lang="ts">
import type { StyleValue } from 'vue';
import { inject, computed } from 'vue';
import type { RadioValue } from './radio.props';
import { radioProps, radioEmits } from './radio.props';
import LkIcon from '../lk-icon/lk-icon.vue';
import {
  isRadioChecked,
  isRadioDisabled,
  resolveRadioClass,
  resolveRadioIconSize,
  resolveRadioIconStyle,
  resolveRadioIconType,
  resolveRadioShape,
  resolveRadioSize,
  resolveRadioValue,
} from './radio.utils';

// 使用 Symbol.for 保证跨模块一致性
const LK_RADIO_GROUP_KEY = Symbol.for('LkRadioGroup');

defineOptions({ name: 'LkRadio' });

const props = defineProps(radioProps);
const emit = defineEmits(radioEmits);

type RadioGroupContext = {
  props: {
    modelValue: RadioValue;
    disabled: boolean;
    shape: string;
    iconType: string;
    size: string;
    activeColor: string;
  };
  updateValue: (value: RadioValue) => void;
};

const group = inject<RadioGroupContext | null>(LK_RADIO_GROUP_KEY, null);

const radioValue = computed(() => resolveRadioValue(props.name, props.label));
const style = computed(() => props.customStyle as StyleValue);

const isChecked = computed(() => {
  return isRadioChecked({
    group: group?.props,
    modelValue: props.modelValue,
    radioValue: radioValue.value,
  });
});

const isDisabled = computed(() => {
  return isRadioDisabled({
    disabled: props.disabled,
    group: group?.props,
  });
});

const mergedShape = computed(() => {
  return resolveRadioShape(props.shape, group?.props);
});

const mergedIconType = computed(() => {
  return resolveRadioIconType(props.iconType, group?.props);
});

const mergedSize = computed(() => {
  return resolveRadioSize(group?.props);
});

const mergedIconSize = computed(() => {
  return resolveRadioIconSize({
    iconSize: props.iconSize,
    size: mergedSize.value,
  });
});

const radioClass = computed(() => {
  return resolveRadioClass({
    size: mergedSize.value,
    shape: mergedShape.value,
    iconType: mergedIconType.value,
    checked: isChecked.value,
    disabled: isDisabled.value,
    customClass: props.customClass,
  });
});

const iconStyle = computed(() => {
  return resolveRadioIconStyle({
    checked: isChecked.value,
    activeColor: props.activeColor || group?.props.activeColor || '',
    iconSize: props.iconSize,
  });
});

function handleToggle(event?: unknown) {
  if (isDisabled.value) return;
  emit('click', event, isChecked.value, radioValue.value);
  if (isChecked.value) return;
  if (group) {
    group.updateValue(radioValue.value);
  } else {
    emit('update:modelValue', radioValue.value);
    emit('change', radioValue.value);
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
    :class="radioClass"
    :style="style"
    role="radio"
    :aria-checked="isChecked"
    :aria-disabled="isDisabled"
    :aria-label="label"
    @tap="handleToggle($event)"
  >
    <view class="lk-radio__icon-wrap">
      <slot name="icon" :checked="isChecked" :disabled="isDisabled">
        <view class="lk-radio__icon" :class="[`lk-radio__icon--${mergedShape}`]" :style="iconStyle">
          <lk-icon
            class="lk-radio__check"
            name="check"
            :size="mergedIconSize"
            color="var(--lk-radio-check-color)"
          />
          <view class="lk-radio__dot" />
        </view>
      </slot>
    </view>
    <view v-if="label || $slots.default" class="lk-radio__label" @tap.stop="handleLabelClick">
      <slot>{{ label }}</slot>
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-radio.scss';
</style>
