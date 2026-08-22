<script setup lang="ts">
import { computed, ref } from 'vue';
import { keyboardProps, keyboardEmits, type KeyboardKey } from './keyboard.props';
import {
  resolveKeyboardLayout,
  resolveKeyboardPressAction,
  type KeyboardPlateMode,
} from './keyboard.utils';
import LkIcon from '../lk-icon/lk-icon.vue';
import LkPopup from '../lk-popup/lk-popup.vue';
import { useFormDisabled } from '../lk-form/useFormField';
import { useLocale } from '../../composables/useLocale';

defineOptions({ name: 'LkKeyboard' });

const props = defineProps(keyboardProps);
const emit = defineEmits(keyboardEmits);
const { t } = useLocale('keyboard');
const formDisabled = useFormDisabled(() => false);
const isDisabled = formDisabled.disabled;

const plateMode = ref<KeyboardPlateMode>('province');

const currentLayout = computed((): KeyboardKey[][] =>
  resolveKeyboardLayout({
    type: props.type,
    random: props.random,
    showDot: props.showDot,
    extraKey: props.extraKey,
    showDelete: props.showDelete,
    keys: props.keys,
    plateMode: plateMode.value,
    abcText: t('abc'),
    provinceText: t('province'),
  })
);

const resolvedConfirmText = computed(() => props.confirmText || t('confirm'));
const popupStyle = computed<string | Record<string, unknown>>(() => {
  if (typeof props.customStyle === 'string') {
    return `--lk-popup-surface-bg: var(--lk-keyboard-bg); border: 0; box-shadow: none; ${props.customStyle}`;
  }

  return {
    '--lk-popup-surface-bg': 'var(--lk-keyboard-bg)',
    border: 0,
    boxShadow: 'none',
    ...props.customStyle,
  };
});

function triggerHaptic() {
  if (!props.vibrate) return;

  // #ifdef APP-PLUS || MP-WEIXIN
  uni.vibrateShort({ type: 'light' });
  // #endif
}

async function closeKeyboard() {
  emit('update:visible', false);
  if (!(await formDisabled.awaitActive())) return;
  emit('close');
}

async function onPopupModelChange(visible: boolean) {
  if (visible) {
    emit('update:visible', true);
    return;
  }

  await closeKeyboard();
}

async function onConfirm() {
  if (isDisabled.value) return;
  triggerHaptic();
  emit('confirm', props.modelValue);
  if (!(await formDisabled.awaitActive())) return;
  await closeKeyboard();
}

async function onKeyPress(key: KeyboardKey) {
  if (isDisabled.value) return;
  const interaction = formDisabled.captureInteraction();
  const action = resolveKeyboardPressAction({
    key,
    modelValue: props.modelValue,
    maxLength: props.maxLength,
    plateMode: plateMode.value,
  });

  if (action.kind === 'ignore') return;

  triggerHaptic();
  emit('key-press', key);
  if (!(await formDisabled.awaitInteractionCurrent(interaction))) return;

  if (action.kind === 'delete') {
    emit('delete');
    if (!(await formDisabled.awaitInteractionCurrent(interaction))) return;
    if (props.modelValue.length > 0) {
      emit('update:modelValue', action.nextValue);
    }
    return;
  }

  if (action.kind === 'confirm') {
    emit('confirm', props.modelValue);
    if (!(await formDisabled.awaitActive())) return;
    await closeKeyboard();
    return;
  }

  if (action.kind === 'switch') {
    plateMode.value = action.nextPlateMode;
    return;
  }

  emit('input', action.input);
  if (!(await formDisabled.awaitInteractionCurrent(interaction))) return;
  emit('update:modelValue', action.nextValue);
}

function getKeyClass(key: KeyboardKey) {
  return [
    'lk-keyboard__key',
    {
      'lk-keyboard__key--delete': key.type === 'delete',
      'lk-keyboard__key--extra': key.type === 'extra',
      'lk-keyboard__key--empty': key.type === 'empty',
      'lk-keyboard__key--disabled': key.disabled,
    },
  ];
}

function getKeyStyle(key: KeyboardKey): Record<string, number> {
  return key.flex && key.flex !== 1 ? { flex: key.flex } : {};
}
</script>

<template>
  <lk-popup
    :model-value="visible"
    position="bottom"
    round
    :overlay="overlay"
    :close-on-overlay="closeOnOverlay"
    :safe-area="safeAreaInsetBottom"
    :z-index="zIndex"
    :custom-style="popupStyle"
    @update:model-value="onPopupModelChange"
  >
    <view
      :id="id"
      class="lk-keyboard"
      :class="[`lk-keyboard--${type}`, customClass, { 'is-disabled': isDisabled }]"
      :data-disabled="isDisabled ? 'true' : 'false'"
      :aria-disabled="isDisabled"
    >
      <view v-if="title || showClose || showConfirm" class="lk-keyboard__header">
        <view class="lk-keyboard__header-side">
          <view
            v-if="showClose"
            class="lk-keyboard__header-action lk-keyboard__close"
            @tap="closeKeyboard"
          >
            <text>{{ t('hide') }}</text>
          </view>
        </view>

        <text class="lk-keyboard__title">{{ title }}</text>

        <view class="lk-keyboard__header-side lk-keyboard__header-side--end">
          <view
            v-if="showConfirm"
            class="lk-keyboard__header-action lk-keyboard__done"
            @tap="onConfirm"
          >
            <text>{{ resolvedConfirmText }}</text>
          </view>
        </view>
      </view>

      <view class="lk-keyboard__body">
        <view v-for="(row, rowIndex) in currentLayout" :key="rowIndex" class="lk-keyboard__row">
          <view
            v-for="(key, keyIndex) in row"
            :key="keyIndex"
            :class="getKeyClass(key)"
            :style="getKeyStyle(key)"
            :data-key="key.text"
            @tap="onKeyPress(key)"
          >
            <lk-icon v-if="key.type === 'delete'" name="eraser" :size="40" />
            <text v-else-if="key.type !== 'empty'" class="lk-keyboard__key-text">
              {{ key.text }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </lk-popup>
</template>

<style lang="scss">
@use './lk-keyboard.scss';
</style>
