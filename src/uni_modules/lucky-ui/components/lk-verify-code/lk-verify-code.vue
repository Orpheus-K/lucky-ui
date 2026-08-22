<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch, computed } from 'vue';
import type { StyleValue } from 'vue';
import { verifyCodeProps, verifyCodeEmits, VerifyCodeStatus } from './verify-code.props';
import {
  normalizeVerifyCodeValue,
  resolveVerifyCodeActiveIndex,
  resolveVerifyCodeCellClass,
  resolveVerifyCodeCellStyle,
  resolveVerifyCodeContainerStyle,
  resolveVerifyCodeCountdownText,
  resolveVerifyCodeFocusIndex,
  resolveVerifyCodeInputValue,
  resolveVerifyCodeKeydownValue,
  resolveVerifyCodeRootClass,
  resolveVerifyCodeStatusClass,
  shouldFinishVerifyCode,
  type VerifyCodeInputEventLike,
  type VerifyCodeKeydownEventLike,
} from './verify-code.utils';
import { useLocale } from '../../composables/useLocale';
import { useFormDisabled } from '../lk-form/useFormField';

defineOptions({ name: 'LkVerifyCode' });

const props = defineProps(verifyCodeProps);
const emit = defineEmits(verifyCodeEmits);
const { t } = useLocale('verifyCode');
const formDisabled = useFormDisabled(() => props.disabled);
const isDisabled = formDisabled.disabled;

interface FocusableInput {
  focus?: () => void;
  blur?: () => void;
}

const val = ref(props.modelValue || '');
const inputRef = ref<FocusableInput | null>(null);
const isFocused = ref(false);
const focusIndex = ref(0);

const isCountingDown = ref(false);
const countdownRemaining = ref(0);
let countdownTimer: ReturnType<typeof setInterval> | null = null;
let countdownInteraction: number | null = null;

// 当前激活的单元格索引（基于输入值长度）
const activeIndex = computed(() => resolveVerifyCodeActiveIndex(val.value, props.length));

const cellStyle = computed(() =>
  resolveVerifyCodeCellStyle({
    cellSize: props.cellSize,
    fontSize: props.fontSize,
  })
);

const containerStyle = computed(() => resolveVerifyCodeContainerStyle(props.gap));

const countdownDisplayText = computed(() =>
  resolveVerifyCodeCountdownText({
    isCountingDown: isCountingDown.value,
    countdownRemaining: countdownRemaining.value,
    value: val.value,
    countdownText: props.countdownText || t('countdown'),
    sendText: props.sendText || t('send'),
    resendText: props.resendText || t('resend'),
  })
);

const statusClass = computed(() =>
  resolveVerifyCodeStatusClass({
    status: props.status,
    isFocused: isFocused.value,
  })
);

const rootClass = computed(() =>
  resolveVerifyCodeRootClass({
    variant: props.variant,
    statusClass: statusClass.value,
    disabled: isDisabled.value,
    customClass: props.customClass,
  })
);
const rootStyle = computed<StyleValue>(() => props.customStyle as StyleValue);

watch(
  () => props.modelValue,
  v => {
    if (v !== val.value) {
      val.value = normalizeVerifyCodeValue({
        value: v,
        type: props.type,
        length: props.length,
      });
      focusIndex.value = resolveVerifyCodeFocusIndex(val.value, props.length);
    }
  }
);

function focus() {
  if (isDisabled.value) return;
  // #ifdef H5
  try {
    inputRef.value?.focus?.();
  } catch (e) {
    console.warn('Focus failed', e);
  }
  // #endif
  // #ifdef MP-WEIXIN
  isFocused.value = true;
  // #endif
}

function blur() {
  // #ifdef H5
  try {
    inputRef.value?.blur?.();
  } catch (e) {
    console.warn('Blur failed', e);
  }
  // #endif
  isFocused.value = false;
}

function onFocus() {
  if (isDisabled.value) return;
  isFocused.value = true;
  emit('focus');
}

function onBlur() {
  isFocused.value = false;
  emit('blur');
}

async function onInput(e: Event | VerifyCodeInputEventLike) {
  if (isDisabled.value) return;
  const interaction = formDisabled.captureInteraction();

  const v = resolveVerifyCodeInputValue({
    event: e,
    type: props.type,
    length: props.length,
  });

  val.value = v;
  focusIndex.value = resolveVerifyCodeFocusIndex(v, props.length);
  emit('update:modelValue', v);
  if (!(await formDisabled.awaitInteractionCurrent(interaction))) return;

  if (shouldFinishVerifyCode(v, props.length)) {
    emit('finish', v);
  }
}

// 处理粘贴（H5平台）
async function onPaste(e: ClipboardEvent) {
  if (isDisabled.value) return;
  const interaction = formDisabled.captureInteraction();

  // #ifdef H5
  try {
    const pastedText = normalizeVerifyCodeValue({
      value: e.clipboardData?.getData('text') || '',
      type: props.type,
      length: props.length,
    });

    if (pastedText) {
      e.preventDefault?.();
      val.value = pastedText;
      focusIndex.value = resolveVerifyCodeFocusIndex(pastedText, props.length);
      emit('update:modelValue', pastedText);
      if (!(await formDisabled.awaitInteractionCurrent(interaction))) return;

      if (shouldFinishVerifyCode(pastedText, props.length)) {
        emit('finish', pastedText);
      }
    }
  } catch (err) {
    console.warn('Paste handling failed', err);
  }
  // #endif
}

function onKeydown(e: KeyboardEvent | VerifyCodeKeydownEventLike) {
  if (isDisabled.value) return;
  const interaction = formDisabled.captureInteraction();

  const newVal = resolveVerifyCodeKeydownValue({
    event: e,
    currentValue: val.value,
  });

  if (newVal !== null) {
    val.value = newVal;
    focusIndex.value = resolveVerifyCodeFocusIndex(newVal, props.length);
    emit('update:modelValue', newVal);
    if (!formDisabled.isInteractionCurrent(interaction)) return;
  }
}

function onCellClick(index: number) {
  if (isDisabled.value) return;
  focusIndex.value = index;
  focus();
}

async function startCountdown() {
  if (isCountingDown.value || isDisabled.value) return;
  const interaction = formDisabled.captureInteraction();

  // 触发发送事件
  if (val.value.length === 0) {
    emit('send');
  } else {
    emit('resend');
  }
  if (!(await formDisabled.awaitInteractionCurrent(interaction))) return;

  isCountingDown.value = true;
  countdownRemaining.value = props.countdownDuration;
  countdownInteraction = interaction;

  countdownTimer = setInterval(() => {
    if (countdownInteraction !== interaction || !formDisabled.isInteractionCurrent(interaction)) {
      stopCountdown();
      return;
    }
    countdownRemaining.value--;
    if (countdownRemaining.value <= 0) {
      stopCountdown();
      if (!formDisabled.isInteractionCurrent(interaction)) return;
      emit('countdownEnd');
    }
  }, 1000);
}

function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  isCountingDown.value = false;
  countdownRemaining.value = 0;
  countdownInteraction = null;
}

function clear() {
  val.value = '';
  focusIndex.value = 0;
  emit('update:modelValue', '');
}

// 设置值（支持 SMS 自动填充）
function setValue(code: string) {
  code = normalizeVerifyCodeValue({
    value: code,
    type: props.type,
    length: props.length,
  });
  val.value = code;
  focusIndex.value = resolveVerifyCodeFocusIndex(code, props.length);
  emit('update:modelValue', code);
  if (shouldFinishVerifyCode(code, props.length)) {
    emit('finish', code);
  }
}

onMounted(async () => {
  if (props.autofocus) {
    const interaction = formDisabled.captureInteraction();
    await nextTick();
    if (!formDisabled.isInteractionCurrent(interaction)) return;
    focus();
  }
});

onUnmounted(() => {
  stopCountdown();
});

watch(
  isDisabled,
  disabled => {
    if (!disabled) return;
    blur();
    stopCountdown();
  },
  { flush: 'sync' }
);

defineExpose({
  focus,
  blur,
  clear,
  setValue,
  startCountdown,
  stopCountdown,
});
</script>

<template>
  <view
    :id="id"
    class="lk-verify-code"
    :class="rootClass"
    :style="rootStyle"
    :data-disabled="isDisabled ? 'true' : 'false'"
    :aria-disabled="isDisabled"
  >
    <!-- 隐藏的真实输入框 -->
    <input
      ref="inputRef"
      class="lk-verify-code__input"
      :value="val"
      :maxlength="props.length"
      :type="props.type === 'number' ? 'number' : 'text'"
      :disabled="isDisabled"
      :focus="isFocused"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="onKeydown"
      @paste="onPaste"
    />

    <view class="lk-verify-code__cells" :style="containerStyle" @tap="focus">
      <view
        v-for="(_, index) in props.length"
        :key="index"
        class="lk-verify-code__cell"
        :class="
          resolveVerifyCodeCellClass({
            index,
            isFocused,
            activeIndex,
            valueLength: val.length,
            length: props.length,
          })
        "
        :style="[
          cellStyle,
          props.focusColor && isFocused && index === activeIndex
            ? { borderColor: props.focusColor }
            : {},
          props.errorColor && props.status === VerifyCodeStatus.Error
            ? { borderColor: props.errorColor }
            : {},
        ]"
        @tap.stop="onCellClick(index)"
      >
        <!-- 已输入的值 -->
        <view v-if="index < val.length" class="lk-verify-code__value">
          <text v-if="props.mask" class="lk-verify-code__dot">•</text>
          <text v-else>{{ val[index] }}</text>
        </view>

        <view
          v-else-if="props.showCursor && isFocused && index === activeIndex"
          class="lk-verify-code__cursor"
        />
      </view>
    </view>

    <view v-if="props.errorMessage || props.tips" class="lk-verify-code__message">
      <text v-if="props.status === 'error' && props.errorMessage" class="lk-verify-code__error">
        {{ props.errorMessage }}
      </text>
      <text v-else-if="props.tips" class="lk-verify-code__tips">{{ props.tips }}</text>
    </view>

    <view v-if="props.countdown" class="lk-verify-code__countdown">
      <text
        class="lk-verify-code__countdown-btn"
        :class="{ 'is-disabled': isCountingDown || isDisabled }"
        @tap="startCountdown"
      >
        {{ countdownDisplayText }}
      </text>
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-verify-code.scss';
</style>
