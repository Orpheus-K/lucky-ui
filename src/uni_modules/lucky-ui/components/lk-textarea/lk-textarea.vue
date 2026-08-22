<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { TextareaEventPayload } from './textarea.props';
import { textareaProps, textareaEmits } from './textarea.props';
import { useFormField } from '../lk-form/useFormField';
import { useLocale } from '../../composables/useLocale';
import {
  applyTextareaMaxlength,
  createTextareaBlurController,
  isTextareaNativeFocused,
  readTextareaValue,
  resolveTextareaClass,
  resolveTextareaCount,
  resolveTextareaPlaceholder,
  shouldCommitTextareaBlur,
  shouldShowTextareaClear,
  shouldShowTextareaFooter,
} from './textarea.utils';

defineOptions({ name: 'LkTextarea' });

const props = defineProps(textareaProps);
const emit = defineEmits(textareaEmits);
const { t } = useLocale('textarea');

const isFocused = ref(false);
let compositionInteraction: number | null = null;
let compositionInputValue: string | null = null;
const composing = ref(false);
const formField = useFormField({
  prop: () => props.prop,
  disabled: () => props.disabled,
  validateEvent: () => props.validateEvent,
  inheritFormItemProp: true,
  interactionLocked: () => props.readonly,
});
const isDisabled = formField.disabled;
const resolvedFormProp = formField.prop;
const blurController = createTextareaBlurController();
const isNativeDisabled = computed(() => {
  // H5 keeps readonly text focusable/selectable; mini-programs retain the native disabled fallback.
  let disabled = isDisabled.value || props.readonly;
  // #ifdef H5
  disabled = isDisabled.value;
  // #endif
  return disabled;
});

const cls = computed(() => [
  ...resolveTextareaClass({
    variant: props.variant,
    disabled: isDisabled.value,
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
    disabled: isDisabled.value,
    readonly: props.readonly,
  })
);

async function onInput(e: TextareaEventPayload, interaction = formField.captureInteraction()) {
  if (isDisabled.value || props.readonly) return;
  if (!formField.isInteractionCurrent(interaction)) return;
  const val = applyTextareaMaxlength(readTextareaValue(e), props.maxlength);
  if (composing.value) {
    if (interaction === compositionInteraction) compositionInputValue = val;
    return;
  }
  emit('update:modelValue', val);
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  emit('input', val);
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  await formField.emitChange(val, interaction);
}

function onFocus(e: TextareaEventPayload) {
  blurController.cancel();
  if (isDisabled.value) return;
  isFocused.value = true;
  emit('focus', e);
}

function onBlur(e: TextareaEventPayload) {
  const interaction = formField.captureInteraction();
  const canCommitAtSchedule = shouldCommitTextareaBlur({
    disabled: isDisabled.value,
    readonly: props.readonly,
  });
  blurController.schedule(async () => {
    if (!formField.isInteractionCurrent(interaction)) return;
    isFocused.value = false;
    emit('blur', e);
    if (!(await formField.awaitInteractionCurrent(interaction))) return;
    if (
      !canCommitAtSchedule ||
      !shouldCommitTextareaBlur({ disabled: isDisabled.value, readonly: props.readonly })
    ) {
      return;
    }
    emit('change', props.modelValue);
    if (!(await formField.awaitInteractionCurrent(interaction))) return;
    await formField.emitBlur(interaction);
  });
}

watch(
  isDisabled,
  disabled => {
    if (!disabled) return;
    blurController.cancel();
    isFocused.value = false;
    compositionInteraction = null;
    compositionInputValue = null;
    composing.value = false;
  },
  { flush: 'sync' }
);
watch(
  () => props.readonly,
  readonly => {
    if (readonly) {
      blurController.cancel();
      compositionInteraction = null;
      compositionInputValue = null;
      composing.value = false;
    }
  },
  { flush: 'sync' }
);

onBeforeUnmount(() => {
  compositionInteraction = null;
  compositionInputValue = null;
  composing.value = false;
  blurController.dispose();
});

function onConfirm(e: TextareaEventPayload) {
  if (isDisabled.value) return;
  emit('confirm', e);
}

function onLineChange(e: TextareaEventPayload) {
  if (isDisabled.value) return;
  emit('linechange', e);
}

function onKeyboardHeightChange(e: TextareaEventPayload) {
  if (isDisabled.value) return;
  emit('keyboardheightchange', e);
}

async function onCompositionStart(e: TextareaEventPayload) {
  if (isDisabled.value || props.readonly) return;
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

function onCompositionUpdate(e: TextareaEventPayload) {
  if (
    compositionInteraction === null ||
    !formField.isInteractionCurrent(compositionInteraction) ||
    !composing.value
  )
    return;
  emit('compositionupdate', e);
}

async function onCompositionEnd(e: TextareaEventPayload) {
  const interaction = compositionInteraction;
  if (
    interaction === null ||
    !composing.value ||
    props.readonly ||
    !formField.isInteractionCurrent(interaction)
  )
    return;
  const value =
    compositionInputValue ?? applyTextareaMaxlength(readTextareaValue(e), props.maxlength);
  compositionInteraction = null;
  compositionInputValue = null;
  composing.value = false;
  emit('compositionend', e);
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  emit('update:modelValue', value);
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  emit('input', value);
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  await formField.emitChange(value, interaction);
}

async function onClear() {
  if (isDisabled.value || props.readonly) return;
  const interaction = formField.captureInteraction();
  blurController.cancel();
  emit('update:modelValue', '');
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  emit('input', '');
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  emit('change', '');
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  emit('clear');
  if (!(await formField.awaitInteractionCurrent(interaction))) return;
  await formField.emitChange('', interaction);
}
</script>

<template>
  <view
    :id="id"
    :class="cls"
    :style="style"
    :data-form-prop="resolvedFormProp || ''"
    :data-disabled="isDisabled ? 'true' : 'false'"
  >
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
        :disabled="isNativeDisabled"
        :readonly="readonly"
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
        :aria-disabled="isDisabled"
        :aria-readonly="readonly"
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
