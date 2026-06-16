<script setup lang="ts">
import type { StyleValue } from 'vue';
import { ref, watch, computed, inject, useSlots } from 'vue';
import { formContextKey } from '../lk-form/context';
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
  shouldShowPasswordToggle,
  shouldShowSuffix,
  shouldShowTrailingBalance,
} from './input.utils';

defineOptions({ name: 'LkInput' });

const props = defineProps(inputProps);
const emit = defineEmits(inputEmits);
const slots = useSlots();

const form = inject(formContextKey, null);

const inner = ref<InputValue>(props.modelValue);
const composing = ref(false);
const passwordVisible = ref(false);

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

function commit(val: InputValue, change = false) {
  inner.value = val;
  emit('update:modelValue', val);
  emit('input', val);
  if (change) {
    emit('change', val);
    if (props.prop) form?.emitFieldChange(props.prop, val);
  }
}

function onInput(e: InputEventPayload) {
  const v = applyInputMaxlength(readInputValue(e), props.maxlength);
  if (!composing.value) commit(v, false);
}
function onBlur(e: InputEventPayload) {
  emit('blur', e);
  emit('change', inner.value);
  if (props.prop) form?.emitFieldBlur(props.prop);
}
function onFocus(e: InputEventPayload) {
  emit('focus', e);
}
function onConfirm(e: InputEventPayload) {
  emit('confirm', e);
}
function onKeyboardHeightChange(e: InputEventPayload) {
  emit('keyboardheightchange', e);
}
function onCompositionStart(e: InputEventPayload) {
  composing.value = true;
  emit('compositionstart', e);
}
function onCompositionUpdate(e: InputEventPayload) {
  emit('compositionupdate', e);
}
function onCompositionEnd(e: InputEventPayload) {
  composing.value = false;
  emit('compositionend', e);
  onInput(e);
}
function clear() {
  if (props.disabled || props.readonly || !hasInputValue(inner.value)) return;
  commit('', true);
  emit('clear');
}

// 密码明暗切换
function togglePassword() {
  passwordVisible.value = !passwordVisible.value;
}

function onFakeClick(e: unknown) {
  if (props.disabled) return;
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
    disabled: props.disabled,
    readonly: props.readonly,
    fake: props.fake,
    value: props.fake ? props.fakeText : inner.value,
    borderless: props.borderless,
    inputAlign: props.inputAlign,
    prefixIcon: props.prefixIcon,
    trailingBalance: showTrailingBalance.value,
    count: count.value,
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
    disabled: props.disabled,
    readonly: props.readonly,
    fake: props.fake,
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
    !props.disabled &&
    !props.readonly &&
    hasInputValue(inner.value) &&
    !props.fake
);

watch(
  () => props.modelValue,
  v => (inner.value = v)
);
</script>

<template>
  <view :id="id" :class="classes" :style="style" @tap="fake ? onFakeClick($event) : undefined">
    <view v-if="$slots.prefix || prefixIcon" class="lk-input__prefix">
      <slot name="prefix">
        <lk-icon v-if="prefixIcon" :name="prefixIcon" size="36" />
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
        :disabled="disabled"
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
        :aria-disabled="disabled"
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
      <lk-icon name="x-circle-fill" size="36" />
    </view>

    <!-- 密码明暗切换按钮 -->
    <view v-if="showPasswordToggle" class="lk-input__password-toggle" @tap.stop="togglePassword">
      <lk-icon :name="passwordVisible ? 'eye' : 'eye-slash'" size="36" />
    </view>

    <!-- 后缀图标/插槽 -->
    <view v-if="showSuffix" class="lk-input__suffix">
      <slot name="suffix">
        <lk-icon v-if="suffixIcon" :name="suffixIcon" size="36" />
      </slot>
    </view>

    <view v-if="count && !fake" class="lk-input__count">{{ count }}</view>
  </view>
</template>

<style lang="scss">
@use './lk-input.scss';
</style>
