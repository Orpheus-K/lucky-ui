<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { StepperAction } from './stepper.props';
import { stepperProps, stepperEmits } from './stepper.props';
import { useFormField } from '../lk-form/useFormField';
import {
  formatStepperValue,
  isStepperMinusDisabled,
  isStepperPlusDisabled,
  normalizeStepperBlurValue,
  readStepperInputValue,
  resolveStepperChange,
  resolveStepperClass,
  resolveStepperStyle,
} from './stepper.utils';

defineOptions({ name: 'LkStepper' });

const props = defineProps(stepperProps);
const emit = defineEmits(stepperEmits);
const formField = useFormField({
  prop: () => props.prop,
  disabled: () => props.disabled,
  validateEvent: () => props.validateEvent,
});
const isDisabled = formField.disabled;

const current = ref(format(props.modelValue));
let changeGeneration = 0;

function beginChange() {
  changeGeneration += 1;
  return changeGeneration;
}

function isChangeCurrent(generation: number, interaction: number) {
  return generation === changeGeneration && formField.isInteractionCurrent(interaction);
}

async function awaitChangeCurrent(generation: number, interaction: number) {
  return (
    generation === changeGeneration &&
    (await formField.awaitInteractionCurrent(interaction)) &&
    generation === changeGeneration
  );
}

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
    disabled: isDisabled.value,
    current: current.value,
    min: props.min,
  })
);

const isPlusDisabled = computed(() =>
  isStepperPlusDisabled({
    disabled: isDisabled.value,
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
    disabled: isDisabled.value,
  })
);

async function handleChange(
  type: StepperAction,
  val?: string,
  interaction = formField.captureInteraction(),
  generation = beginChange()
) {
  if (!isChangeCurrent(generation, interaction)) return;
  const result = resolveStepperChange({
    action: type,
    inputValue: val,
    current: current.value,
    disabled: isDisabled.value,
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
  if (!(await awaitChangeCurrent(generation, interaction))) return;

  if (props.beforeChange) {
    try {
      const allow = await props.beforeChange(clampedVal);
      if (!(await awaitChangeCurrent(generation, interaction))) return;
      if (!allow) {
        current.value = String(props.modelValue);
        emit('change-cancel', clampedVal, type, 'before-change');
        return;
      }
    } catch {
      if (!(await awaitChangeCurrent(generation, interaction))) return;
      current.value = String(props.modelValue);
      emit('change-cancel', clampedVal, type, 'error');
      return;
    }
  }

  if (!isChangeCurrent(generation, interaction)) return;

  current.value = String(clampedVal);
  emit('update:modelValue', clampedVal);
  if (!(await awaitChangeCurrent(generation, interaction))) return;
  emit('change', clampedVal, type);
  if (!(await awaitChangeCurrent(generation, interaction))) return;
  if (type === 'plus') {
    emit('plus', clampedVal);
    if (!(await awaitChangeCurrent(generation, interaction))) return;
  }
  if (type === 'minus') {
    emit('minus', clampedVal);
    if (!(await awaitChangeCurrent(generation, interaction))) return;
  }
  await formField.emitChange(clampedVal, interaction);
}

function onInput(e: Event | { detail?: { value?: string }; target?: { value?: string } }) {
  if (isDisabled.value || props.disableInput) return;
  beginChange();
  const value = readStepperInputValue(e);
  current.value = value;
  emit('input', value);
}

async function onBlur(e: unknown) {
  const interaction = formField.captureInteraction();
  const generation = beginChange();
  emit('blur', e);
  if (!(await awaitChangeCurrent(generation, interaction)) || props.disableInput) return;
  await handleChange(
    'input',
    normalizeStepperBlurValue({
      current: current.value,
      min: props.min,
      max: props.max,
      integer: props.integer,
    }),
    interaction,
    generation
  );
}

function onFocus(e: unknown) {
  if (isDisabled.value || props.disableInput) return;
  emit('focus', e);
}

let longPressTimer: ReturnType<typeof setTimeout> | null = null;
let touchHandledTimer: ReturnType<typeof setTimeout> | null = null;
// 移动端 touch 后可能继续触发 click，需屏蔽重复变更。
let touchHandled = false;

function onTouchStart(type: 'minus' | 'plus') {
  if (isDisabled.value) return;
  const interaction = formField.captureInteraction();
  if (touchHandledTimer) {
    clearTimeout(touchHandledTimer);
    touchHandledTimer = null;
  }
  touchHandled = true;
  void handleChange(type, undefined, interaction);

  if (!props.longPress || !formField.isInteractionCurrent(interaction)) return;

  longPressTimer = setTimeout(() => {
    if (!formField.isInteractionCurrent(interaction)) {
      longPressTimer = null;
      return;
    }
    longPressTimer = setInterval(() => {
      if (!formField.isInteractionCurrent(interaction)) {
        if (longPressTimer) clearInterval(longPressTimer);
        longPressTimer = null;
        return;
      }
      void handleChange(type, undefined, interaction);
    }, 200);
  }, 600);
}

function onTouchEnd() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    clearInterval(longPressTimer);
    longPressTimer = null;
  }
  if (touchHandledTimer) clearTimeout(touchHandledTimer);
  touchHandledTimer = setTimeout(() => {
    touchHandled = false;
    touchHandledTimer = null;
  }, 300);
}

watch(
  isDisabled,
  disabled => {
    if (!disabled) return;
    beginChange();
    current.value = format(props.modelValue);
    onTouchEnd();
  },
  { flush: 'sync' }
);

onBeforeUnmount(() => {
  beginChange();
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    clearInterval(longPressTimer);
    longPressTimer = null;
  }
  if (touchHandledTimer) {
    clearTimeout(touchHandledTimer);
    touchHandledTimer = null;
  }
});

async function onClick(type: 'minus' | 'plus') {
  if (touchHandled || isDisabled.value) return;
  await handleChange(type);
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
  <view
    :id="id"
    class="lk-stepper"
    :class="classes"
    :style="wrapperStyle"
    :aria-disabled="isDisabled"
  >
    <view
      class="lk-stepper__btn lk-stepper__minus"
      :class="{ 'is-disabled': isMinusDisabled }"
      @touchstart.passive="onTouchStart('minus')"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
      @tap.stop="onClick('minus')"
    />

    <input
      :value="current"
      class="lk-stepper__input"
      :class="{ 'is-disabled': disableInput }"
      :type="integer ? 'number' : 'digit'"
      :disabled="isDisabled || disableInput"
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
