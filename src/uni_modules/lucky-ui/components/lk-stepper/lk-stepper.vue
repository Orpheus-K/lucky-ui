<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, ref, watch, inject } from 'vue';
import type { StepperAction } from './stepper.props';
import { stepperProps, stepperEmits } from './stepper.props';
import { formContextKey } from '../lk-form/context';
import {
  formatStepperValue,
  isStepperMinusDisabled,
  isStepperPlusDisabled,
  normalizeStepperBlurValue,
  readStepperInputValue,
  resolveStepperChange,
  resolveStepperClass,
  resolveStepperStyle,
  shouldValidateStepperField,
} from './stepper.utils';

defineOptions({ name: 'LkStepper' });

const props = defineProps(stepperProps);
const emit = defineEmits(stepperEmits);
const form = inject(formContextKey, null);

const current = ref(format(props.modelValue));

function format(value: string | number): string {
  return formatStepperValue({
    value,
    min: props.min,
    max: props.max,
    integer: props.integer,
  });
}

const isMinusDisabled = computed(() =>
  isStepperMinusDisabled({
    disabled: props.disabled,
    current: current.value,
    min: props.min,
  })
);

const isPlusDisabled = computed(() =>
  isStepperPlusDisabled({
    disabled: props.disabled,
    current: current.value,
    max: props.max,
  })
);

const wrapperStyle = computed(() => {
  return resolveStepperStyle({
    buttonSize: props.buttonSize,
    inputWidth: props.inputWidth,
    customStyle: props.customStyle as StyleValue,
  });
});

const classes = computed(() =>
  resolveStepperClass({
    customClass: props.customClass,
    size: props.size,
    disabled: props.disabled,
  })
);

async function handleChange(type: StepperAction, val?: string) {
  const result = resolveStepperChange({
    action: type,
    inputValue: val,
    current: current.value,
    disabled: props.disabled,
    min: props.min,
    max: props.max,
    step: props.step,
    integer: props.integer,
  });

  if (result.type === 'disabled') return;
  if (result.type === 'overlimit') {
    emit('overlimit', result.action, result.limit);
    return;
  }

  const clampedVal = result.value;
  emit('before-change', clampedVal, type);

  if (props.beforeChange) {
    try {
      const allow = await props.beforeChange(clampedVal);
      if (!allow) {
        current.value = String(props.modelValue);
        emit('change-cancel', clampedVal, type, 'before-change');
        return;
      }
    } catch {
      current.value = String(props.modelValue);
      emit('change-cancel', clampedVal, type, 'error');
      return;
    }
  }

  current.value = String(clampedVal);
  emit('update:modelValue', clampedVal);
  emit('change', clampedVal, type);
  if (type === 'plus') emit('plus', clampedVal);
  if (type === 'minus') emit('minus', clampedVal);
  if (shouldValidateStepperField({ validateEvent: props.validateEvent, prop: props.prop })) {
    form?.emitFieldChange(props.prop, clampedVal);
  }
}

function onInput(e: Event | { detail?: { value?: string }; target?: { value?: string } }) {
  const value = readStepperInputValue(e);
  current.value = value;
  emit('input', value);
}

function onBlur(e: unknown) {
  handleChange(
    'input',
    normalizeStepperBlurValue({
      current: current.value,
      min: props.min,
      max: props.max,
      integer: props.integer,
    })
  );
  emit('blur', e);
}

function onFocus(e: unknown) {
  emit('focus', e);
}

let longPressTimer: ReturnType<typeof setTimeout> | null = null;
// 移动端 touch 后可能继续触发 click，需屏蔽重复变更。
let touchHandled = false;

function onTouchStart(type: 'minus' | 'plus') {
  touchHandled = true;
  handleChange(type);

  if (!props.longPress) return;

  longPressTimer = setTimeout(() => {
    longPressTimer = setInterval(() => {
      handleChange(type);
    }, 200);
  }, 600);
}

function onTouchEnd() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    clearInterval(longPressTimer);
    longPressTimer = null;
  }
  setTimeout(() => {
    touchHandled = false;
  }, 300);
}

function onClick(type: 'minus' | 'plus') {
  if (touchHandled) return;
  handleChange(type);
}

watch(
  () => props.modelValue,
  val => {
    if (val !== Number(current.value)) {
      current.value = format(val);
    }
  }
);
</script>

<template>
  <view :id="id" class="lk-stepper" :class="classes" :style="wrapperStyle">
    <view
      class="lk-stepper__btn lk-stepper__minus"
      :class="{ 'is-disabled': isMinusDisabled }"
      @touchstart.passive="onTouchStart('minus')"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
      @tap.stop="onClick('minus')"
    />

    <input
      v-model="current"
      class="lk-stepper__input"
      :class="{ 'is-disabled': disableInput }"
      :type="integer ? 'number' : 'digit'"
      :disabled="disabled || disableInput"
      @input="onInput"
      @blur="onBlur"
      @focus="onFocus"
    />

    <view
      class="lk-stepper__btn lk-stepper__plus"
      :class="{ 'is-disabled': isPlusDisabled }"
      @touchstart.passive="onTouchStart('plus')"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
      @tap.stop="onClick('plus')"
    />
  </view>
</template>

<style lang="scss">
@use './lk-stepper.scss';
</style>
