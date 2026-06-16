<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, ref, inject } from 'vue';
import type { TextareaEventPayload } from './textarea.props';
import { textareaProps, textareaEmits } from './textarea.props';
import { formContextKey } from '../lk-form/context';
import { useLocale } from '../../composables/useLocale';
import {
  applyTextareaMaxlength,
  isTextareaNativeFocused,
  readTextareaValue,
  resolveTextareaClass,
  resolveTextareaCount,
  resolveTextareaPlaceholder,
  shouldShowTextareaClear,
  shouldShowTextareaFooter,
} from './textarea.utils';

defineOptions({ name: 'LkTextarea' });

const props = defineProps(textareaProps);
const emit = defineEmits(textareaEmits);
const { t } = useLocale('textarea');

const form = inject(formContextKey, null);
const isFocused = ref(false);

const cls = computed(() => [
  ...resolveTextareaClass({
    variant: props.variant,
    disabled: props.disabled,
    focused: isFocused.value,
    autoHeight: props.autoHeight,
    label: props.label,
    customClass: props.customClass,
  }),
]);

const style = computed(() => props.customStyle as StyleValue);
const currentCount = computed(() => resolveTextareaCount(props.modelValue));
const isTextareaFocused = computed(() =>
  isTextareaNativeFocused({
    focus: props.focus,
    autofocus: props.autofocus,
  })
);
const resolvedPlaceholder = computed(() =>
  resolveTextareaPlaceholder(props.placeholder, t('placeholder'))
);
const showClear = computed(() =>
  shouldShowTextareaClear({
    clearable: props.clearable,
    value: props.modelValue,
    disabled: props.disabled,
    readonly: props.readonly,
  })
);

function onInput(e: TextareaEventPayload) {
  const val = applyTextareaMaxlength(readTextareaValue(e), props.maxlength);
  emit('update:modelValue', val);
  emit('input', val);
}

function onFocus(e: TextareaEventPayload) {
  if (props.disabled) return;
  isFocused.value = true;
  emit('focus', e);
}

function onBlur(e: TextareaEventPayload) {
  setTimeout(() => {
    isFocused.value = false;
    emit('blur', e);
    emit('change', props.modelValue);
    if (props.validateEvent && props.prop) {
      form?.emitFieldBlur(props.prop);
    }
  }, 100);
}

function onConfirm(e: TextareaEventPayload) {
  emit('confirm', e);
}

function onLineChange(e: TextareaEventPayload) {
  emit('linechange', e);
}

function onKeyboardHeightChange(e: TextareaEventPayload) {
  emit('keyboardheightchange', e);
}

function onCompositionStart(e: TextareaEventPayload) {
  emit('compositionstart', e);
}

function onCompositionUpdate(e: TextareaEventPayload) {
  emit('compositionupdate', e);
}

function onCompositionEnd(e: TextareaEventPayload) {
  emit('compositionend', e);
  onInput(e);
}

function onClear() {
  if (props.disabled || props.readonly) return;
  emit('update:modelValue', '');
  emit('input', '');
  emit('change', '');
  emit('clear');
  if (props.validateEvent && props.prop) {
    form?.emitFieldChange(props.prop, '');
  }
}
</script>

<template>
  <view :id="id" :class="cls" :style="style">
    <!-- Label -->
    <view v-if="label" class="lk-textarea__label">{{ label }}</view>

    <view class="lk-textarea__wrapper">
      <textarea
        class="lk-textarea__inner"
        :name="name"
        :value="modelValue"
        :placeholder="resolvedPlaceholder"
        :placeholder-style="placeholderStyle"
        :placeholder-class="placeholderClass"
        :disabled="disabled || readonly"
        :maxlength="maxlength"
        :auto-height="autoHeight"
        :focus="isTextareaFocused"
        :cursor-spacing="cursorSpacing"
        :cursor="cursor"
        :selection-start="selectionStart"
        :selection-end="selectionEnd"
        :fixed="fixed"
        :confirm-type="confirmType"
        :confirm-hold="confirmHold"
        :adjust-position="adjustPosition"
        :show-confirm-bar="showConfirmBar"
        :disable-default-padding="disableDefaultPadding"
        :hold-keyboard="holdKeyboard"
        :auto-blur="autoBlur"
        :inputmode="inputmode"
        :ignore-composition-event="ignoreCompositionEvent"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @confirm="onConfirm"
        @linechange="onLineChange"
        @keyboardheightchange="onKeyboardHeightChange"
        @compositionstart="onCompositionStart"
        @compositionupdate="onCompositionUpdate"
        @compositionend="onCompositionEnd"
      />

      <!-- 清空按钮 -->
      <view v-if="clearable || $slots.suffix" class="lk-textarea__suffix">
        <view v-if="showClear" class="lk-textarea__clear" @tap.stop.prevent="onClear">
          <view class="lk-icon-close" />
        </view>
        <slot name="suffix" />
      </view>
    </view>

    <!-- 底部栏：左侧 footer 插槽，右侧计数 -->
    <view
      v-if="
        shouldShowTextareaFooter({
          showCount,
          maxlength,
          hasFooterSlot: !!$slots.footer,
        })
      "
      class="lk-textarea__footer"
    >
      <view class="lk-textarea__footer-slot">
        <slot name="footer" />
      </view>
      <view v-if="showCount && maxlength !== -1" class="lk-textarea__count">
        {{ currentCount }} / {{ maxlength }}
      </view>
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-textarea.scss';
</style>
