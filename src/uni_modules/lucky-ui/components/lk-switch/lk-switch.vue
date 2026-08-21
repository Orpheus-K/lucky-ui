<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { switchProps, switchEmits } from './switch.props';
import { useFormField } from '../lk-form/useFormField';
import {
  canToggleSwitch,
  isSwitchChecked,
  resolveSwitchClass,
  resolveSwitchNextValue,
  resolveSwitchPromptText,
  resolveSwitchStyle,
} from './switch.utils';

defineOptions({ name: 'LkSwitch' });

const props = defineProps(switchProps);
const emit = defineEmits(switchEmits);

const formField = useFormField({
  prop: () => props.prop,
  disabled: () => props.disabled,
  validateEvent: () => props.validateEvent,
});
const isDisabled = formField.disabled;

const isChecked = computed(() =>
  isSwitchChecked({
    modelValue: props.modelValue,
    activeValue: props.activeValue,
  })
);

const changing = ref(false);
let changeGeneration = 0;
let changingGeneration: number | null = null;

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

const rootStyle = computed(() => {
  return resolveSwitchStyle({
    activeColor: props.activeColor,
    inactiveColor: props.inactiveColor,
    customStyle: props.customStyle as StyleValue,
  });
});

const promptText = computed(() => {
  return resolveSwitchPromptText({
    inlinePrompt: props.inlinePrompt,
    checked: isChecked.value,
    activeText: props.activeText,
    inactiveText: props.inactiveText,
  });
});

const classes = computed(() =>
  resolveSwitchClass({
    customClass: props.customClass,
    size: props.size,
    checked: isChecked.value,
    disabled: isDisabled.value,
    loading: props.loading,
    changing: changing.value,
    inlinePrompt: props.inlinePrompt,
  })
);

async function toggle(interaction: number, generation: number) {
  if (!isChangeCurrent(generation, interaction)) return;
  if (
    !canToggleSwitch({
      disabled: isDisabled.value,
      loading: props.loading,
      changing: changing.value,
    })
  )
    return;

  const nextValue = resolveSwitchNextValue({
    checked: isChecked.value,
    activeValue: props.activeValue,
    inactiveValue: props.inactiveValue,
  });
  emit('before-change', nextValue);
  if (!(await awaitChangeCurrent(generation, interaction))) return;

  // 轻震动反馈（只在支持的平台上触发）
  if (props.hapticFeedback) {
    try {
      uni.vibrateShort({ type: 'light', success: () => {} });
    } catch {
      // 不支持时静默失败
    }
  }

  // beforeChange 拦截
  if (props.beforeChange) {
    changingGeneration = generation;
    changing.value = true;
    try {
      const allowed = await props.beforeChange(nextValue);
      if (!(await awaitChangeCurrent(generation, interaction))) return;
      if (!allowed) {
        emit('change-cancel', nextValue, 'before-change');
        return;
      }
    } catch {
      if (!(await awaitChangeCurrent(generation, interaction))) return;
      emit('change-cancel', nextValue, 'error');
      return;
    } finally {
      if (changingGeneration === generation) {
        changingGeneration = null;
        changing.value = false;
      }
    }
  }

  if (!isChangeCurrent(generation, interaction)) return;

  emit('update:modelValue', nextValue);
  if (!(await awaitChangeCurrent(generation, interaction))) return;
  emit('change', nextValue);
  if (!(await awaitChangeCurrent(generation, interaction))) return;

  await formField.emitChange(nextValue, interaction);
}

async function onClick(e: unknown) {
  if (
    !canToggleSwitch({
      disabled: isDisabled.value,
      loading: props.loading,
      changing: changing.value,
    })
  )
    return;
  const generation = ++changeGeneration;
  const interaction = formField.captureInteraction();
  emit('click', e, isChecked.value);
  if (!(await awaitChangeCurrent(generation, interaction))) return;
  await toggle(interaction, generation);
}

watch(
  isDisabled,
  disabled => {
    if (!disabled) return;
    changeGeneration += 1;
    changingGeneration = null;
    changing.value = false;
  },
  { flush: 'sync' }
);

onBeforeUnmount(() => {
  changeGeneration += 1;
  changingGeneration = null;
});
</script>

<template>
  <view
    :id="id"
    class="lk-switch"
    :class="classes"
    :style="rootStyle"
    :aria-checked="isChecked"
    :aria-disabled="isDisabled"
    role="switch"
    @tap="onClick"
  >
    <view class="lk-switch__knob">
      <view v-if="loading" class="lk-switch__spinner" />
      <text v-else-if="inlinePrompt && promptText" class="lk-switch__prompt">{{ promptText }}</text>
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-switch.scss';
</style>
