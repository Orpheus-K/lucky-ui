<script setup lang="ts">
import type { StyleValue } from 'vue';
import { ref, watch, computed, onBeforeUnmount, useSlots } from 'vue';
import { useFormField } from '../lk-form/useFormField';
import type { InputEventPayload, InputValue } from './input.props';
import { inputProps, inputEmits } from './input.props';
import LkIcon from '../lk-icon/lk-icon.vue';
import {
  applyInputMaxlength,
  hasInputValue,
  readInputValue,
  resolveFakeInputText,
  resolveInputClass,
  resolveInputCount,
  resolveInputNativeState,
  shouldCommitInputBlur,
  shouldShowPasswordToggle,
  shouldShowSuffix,
  shouldShowTrailingBalance,
} from './input.utils';

defineOptions({ name: 'LkInput' });

const props = defineProps(inputProps);
const emit = defineEmits(inputEmits);
const slots = useSlots();

const inner = ref<InputValue>(props.modelValue);
const composing = ref(false);
let compositionInteraction: number | null = null;
let compositionInputValue: InputValue | null = null;
const passwordVisible = ref(false);
const formField = useFormField({
  prop: () => props.prop,
  disabled: () => props.disabled,
  validateEvent: () => props.validateEvent,
  inheritFormItemProp: true,
  interactionLocked: () => props.readonly || props.fake,
});
const isDisabled = formField.disabled;
const resolvedFormProp = formField.prop;
const isNativeDisabled = computed(() => {
  // H5 keeps readonly text focusable/selectable; mini-programs need disabled to suppress keyboards.
  let disabled = isDisabled.value || props.readonly;
  // #ifdef H5
  disabled = isDisabled.value;
  // #endif
  return disabled;
});

const nativeState = computed(() =>
  resolveInputNativeState({
    type: props.type,
    passwordVisible: passwordVisible.value,
  })
);
const nativeType = computed(() => nativeState.value.nativeType);
const nativePassword = computed(() => nativeState.value.nativePassword);

const style = computed(() => props.customStyle as StyleValue);
const isFocused = computed(() => props.focus || props.autofocus);
const hasValidationError = formField.hasError;

async function commit(
  val: InputValue,
  change = false,
  interaction = formField.captureInteraction()
) {
  if (!formField.isInteractionCurrent(interaction) || props.readonly || props.fake) return;
  inner.value = val;
  emit('update:modelValue', val);
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  emit('input', val);
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  if (change) {
    emit('change', val);
    if (!(await formField.awaitInteractionCurrent(interaction))) return;
  }
  await formField.emitChange(val, interaction);
}

async function onInput(e: InputEventPayload, interaction = formField.captureInteraction()) {
  if (!formField.isInteractionCurrent(interaction) || props.readonly || props.fake) return;
  const v = applyInputMaxlength(readInputValue(e), props.maxlength);
  if (composing.value) {
    if (interaction === compositionInteraction) compositionInputValue = v;
    return;
  }
  await commit(v, false, interaction);
}
async function onBlur(e: InputEventPayload) {
  const interaction = formField.captureInteraction();
  emit('blur', e);
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  if (!shouldCommitInputBlur({ disabled: isDisabled.value, readonly: props.readonly })) return;
  emit('change', inner.value);
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  await formField.emitBlur(interaction);
}
function onFocus(e: InputEventPayload) {
  if (isDisabled.value) return;
  emit('focus', e);
}
function onConfirm(e: InputEventPayload) {
  if (isDisabled.value) return;
  emit('confirm', e);
}
function onKeyboardHeightChange(e: InputEventPayload) {
  if (isDisabled.value) return;
  emit('keyboardheightchange', e);
}
async function onCompositionStart(e: InputEventPayload) {
  if (isDisabled.value || props.readonly || props.fake) return;
  const interaction = formField.captureInteraction();
  compositionInteraction = interaction;
  compositionInputValue = null;
  composing.value = true;
  emit('compositionstart', e);
  if (!(await formField.awaitInteractionCurrent(interaction))) {
    if (compositionInteraction === interaction) compositionInteraction = null;
    compositionInputValue = null;
    composing.value = false;
  }
}
function onCompositionUpdate(e: InputEventPayload) {
  if (
    compositionInteraction === null ||
    !formField.isInteractionCurrent(compositionInteraction) ||
    !composing.value
  )
    return;
  emit('compositionupdate', e);
}
async function onCompositionEnd(e: InputEventPayload) {
  const interaction = compositionInteraction;
  if (
    interaction === null ||
    !composing.value ||
    props.readonly ||
    props.fake ||
    !formField.isInteractionCurrent(interaction)
  )
    return;
  const value = compositionInputValue ?? applyInputMaxlength(readInputValue(e), props.maxlength);
  compositionInteraction = null;
  compositionInputValue = null;
  composing.value = false;
  emit('compositionend', e);
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  await commit(value, false, interaction);
}
async function clear() {
  if (isDisabled.value || props.readonly || !hasInputValue(inner.value)) return;
  const interaction = formField.captureInteraction();
  await commit('', true, interaction);
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  emit('clear');
}

// 密码明暗切换
function togglePassword() {
  passwordVisible.value = !passwordVisible.value;
}

function onFakeClick(e: unknown) {
  if (isDisabled.value) return;
  emit('click', e);
}

const count = computed(() => {
  return resolveInputCount({
    value: inner.value,
    maxlength: props.maxlength,
    showCount: props.showCount,
    showWordLimit: props.showWordLimit,
  });
});

const classes = computed(() => [
  ...resolveInputClass({
    size: props.size,
    disabled: isDisabled.value,
    readonly: props.readonly,
    fake: props.fake,
    value: props.fake ? props.fakeText : inner.value,
    borderless: props.borderless,
    inputAlign: props.inputAlign,
    prefixIcon: props.prefixIcon,
    trailingBalance: showTrailingBalance.value,
    count: count.value,
    error: hasValidationError.value,
    customClass: props.customClass,
  }),
]);

const fakeDisplayText = computed(() => {
  return resolveFakeInputText(props.fakeText, props.placeholder);
});

const showPasswordToggle = computed(() => {
  return shouldShowPasswordToggle({
    showPassword: props.showPassword,
    type: props.type,
    disabled: isDisabled.value,
    readonly: props.readonly,
    fake: props.fake,
    value: inner.value,
  });
});

const showSuffix = computed(() =>
  shouldShowSuffix({
    hasSuffixSlot: !!slots.suffix,
    suffixIcon: props.suffixIcon,
    showPasswordToggle: showPasswordToggle.value,
  })
);
const showTrailingBalance = computed(() =>
  shouldShowTrailingBalance({
    inputAlign: props.inputAlign,
    prefixIcon: props.prefixIcon,
    hasPrefixSlot: !!slots.prefix,
    showPasswordToggle: showPasswordToggle.value,
    showSuffix: showSuffix.value,
    value: inner.value,
    clearable: props.clearable,
    count: count.value,
  })
);
const showClear = computed(
  () =>
    props.clearable &&
    !isDisabled.value &&
    !props.readonly &&
    hasInputValue(inner.value) &&
    !props.fake
);

watch(
  () => props.modelValue,
  v => (inner.value = v)
);
watch(
  isDisabled,
  disabled => {
    if (disabled) {
      composing.value = false;
      compositionInteraction = null;
      compositionInputValue = null;
    }
  },
  { flush: 'sync' }
);
watch(
  () => props.readonly,
  readonly => {
    if (!readonly) return;
    composing.value = false;
    compositionInteraction = null;
    compositionInputValue = null;
  },
  { flush: 'sync' }
);

onBeforeUnmount(() => {
  composing.value = false;
  compositionInteraction = null;
  compositionInputValue = null;
});
</script>

<template>
  <view
    :id="id"
    :class="classes"
    :style="style"
    :data-form-prop="resolvedFormProp || ''"
    :data-disabled="isDisabled ? 'true' : 'false'"
    @tap="fake ? onFakeClick($event) : undefined"
  >
    <view v-if="$slots.prefix || prefixIcon" class="lk-input__prefix">
      <slot name="prefix">
        <lk-icon v-if="prefixIcon" :name="prefixIcon" size="32" />
      </slot>
    </view>

    <!-- 假输入框模式 -->
    <view v-if="fake" class="lk-input__fake">
      <slot>
        <text class="lk-input__fake-text">{{ fakeDisplayText }}</text>
      </slot>
    </view>

    <!-- 真实输入框 -->
    <template v-else>
      <view v-if="showTrailingBalance" class="lk-input__balance" />
      <input
        class="lk-input__inner"
        :class="[`lk-input__inner--${inputAlign}`]"
        :name="name"
        :value="inner"
        :type="nativeType"
        :password="nativePassword"
        :placeholder="placeholder"
        :placeholder-style="placeholderStyle"
        :placeholder-class="placeholderClass"
        :maxlength="maxlength > -1 ? maxlength : 140000"
        :disabled="isNativeDisabled"
        :readonly="readonly"
        :focus="isFocused"
        :confirm-type="confirmType"
        :confirm-hold="confirmHold"
        :cursor-spacing="cursorSpacing"
        :cursor="cursor"
        :selection-start="selectionStart"
        :selection-end="selectionEnd"
        :adjust-position="adjustPosition"
        :hold-keyboard="holdKeyboard"
        :inputmode="inputmode"
        :ignore-composition-event="ignoreCompositionEvent"
        :aria-disabled="isDisabled"
        :aria-readonly="readonly"
        :aria-label="placeholder"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @confirm="onConfirm"
        @keyboardheightchange="onKeyboardHeightChange"
        @compositionstart="onCompositionStart"
        @compositionupdate="onCompositionUpdate"
        @compositionend="onCompositionEnd"
      />
    </template>

    <!-- 内嵌通知栏插槽 -->
    <slot name="notice"></slot>

    <!-- 清空按钮 -->
    <view v-if="showClear" class="lk-input__clear" @tap.stop="clear">
      <lk-icon name="x-circle" size="28" />
    </view>

    <!-- 密码明暗切换按钮 -->
    <view v-if="showPasswordToggle" class="lk-input__password-toggle" @tap.stop="togglePassword">
      <lk-icon :name="passwordVisible ? 'eye' : 'eye-slash'" size="32" />
    </view>

    <!-- 后缀图标/插槽 -->
    <view v-if="showSuffix" class="lk-input__suffix">
      <slot name="suffix">
        <lk-icon v-if="suffixIcon" :name="suffixIcon" size="32" />
      </slot>
    </view>

    <view v-if="count && !fake" class="lk-input__count">{{ count }}</view>
  </view>
</template>

<style lang="scss">
@use './lk-input.scss';
</style>
