<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, ref, inject } from 'vue';
import { switchProps, switchEmits } from './switch.props';
import { formContextKey } from '../lk-form/context';
import {
  canToggleSwitch,
  isSwitchChecked,
  resolveSwitchClass,
  resolveSwitchNextValue,
  resolveSwitchPromptText,
  resolveSwitchStyle,
  shouldValidateSwitchField,
} from './switch.utils';

defineOptions({ name: 'LkSwitch' });

const props = defineProps(switchProps);
const emit = defineEmits(switchEmits);

const form = inject(formContextKey, null);

const isChecked = computed(() =>
  isSwitchChecked({
    modelValue: props.modelValue,
    activeValue: props.activeValue,
  })
);

const changing = ref(false);

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
    disabled: props.disabled,
    loading: props.loading,
    changing: changing.value,
    inlinePrompt: props.inlinePrompt,
  })
);

async function toggle() {
  if (
    !canToggleSwitch({
      disabled: props.disabled,
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
    changing.value = true;
    try {
      const allowed = await props.beforeChange(nextValue);
      if (!allowed) {
        emit('change-cancel', nextValue, 'before-change');
        return;
      }
    } catch {
      emit('change-cancel', nextValue, 'error');
      return;
    } finally {
      changing.value = false;
    }
  }

  emit('update:modelValue', nextValue);
  emit('change', nextValue);

  if (shouldValidateSwitchField({ validateEvent: props.validateEvent, prop: props.prop })) {
    form?.emitFieldChange(props.prop, nextValue);
  }
}

function onClick(e: unknown) {
  if (
    !canToggleSwitch({
      disabled: props.disabled,
      loading: props.loading,
      changing: changing.value,
    })
  )
    return;
  emit('click', e, isChecked.value);
  toggle();
}
</script>

<template>
  <view
    :id="id"
    class="lk-switch"
    :class="classes"
    :style="rootStyle"
    :aria-checked="isChecked"
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
