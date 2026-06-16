<script setup lang="ts">
import { computed, useSlots } from 'vue';
import type { StyleValue } from 'vue';
import LkOverlay from '../lk-overlay/lk-overlay.vue';
import LkIcon from '../lk-icon/lk-icon.vue';
import LkButton from '../lk-button/lk-button.vue';
import { modalProps, modalEmits } from './modal.props';
import { useLocale } from '../../composables/useLocale';
import {
  useTransition,
  type TransitionConfig,
} from '@/uni_modules/lucky-ui/composables/useTransition';
import {
  canTriggerModalAction,
  resolveModalFooterClass,
  resolveModalHeaderClass,
  resolveModalPanelStyle,
  resolveModalRootStyle,
  resolveModalText,
  resolveModalTransitionConfig,
  resolveModalTransitionDelay,
  resolveModalTransitionDuration,
  resolveModalTransitionEasing,
  resolveModalTransitionName,
  shouldCloseModalOnOverlay,
  shouldModalHeaderRender,
} from './modal.utils';

defineOptions({ name: 'LkModal' });

const props = defineProps(modalProps);

const emit = defineEmits(modalEmits);
const { t } = useLocale('modal');
const slots = useSlots();

const resolvedConfirmText = computed(() =>
  resolveModalText({
    value: props.confirmText,
    fallback: t('confirm'),
  })
);
const resolvedCancelText = computed(() =>
  resolveModalText({
    value: props.cancelText,
    fallback: t('cancel'),
  })
);

const transitionConfig = computed<TransitionConfig>(() => {
  return resolveModalTransitionConfig({
    animationType: props.animationType,
    animation: props.animation,
    duration: props.duration,
    delay: props.delay,
    easing: props.easing,
  });
});

const transitionName = computed(() => resolveModalTransitionName(transitionConfig.value));

const transitionDuration = computed<number>(() =>
  resolveModalTransitionDuration(transitionConfig.value)
);

const transitionDelay = computed<number>(() => resolveModalTransitionDelay(transitionConfig.value));

const transitionEasing = computed<string>(() =>
  resolveModalTransitionEasing(transitionConfig.value)
);

const rootStyle = computed(() => resolveModalRootStyle(props.zIndex));
const panelStyle = computed(() =>
  resolveModalPanelStyle({
    transitionStyles: transitionStyles.value,
    width: props.width,
    customStyle: props.customStyle as StyleValue,
  })
);
const showResolvedHeader = computed(() =>
  shouldModalHeaderRender({
    showHeader: props.showHeader,
    title: props.title,
    showClose: props.showClose,
    hasHeaderSlot: !!slots.header,
  })
);

const {
  classes: transitionClasses,
  styles: transitionStyles,
  display,
  state,
} = useTransition(
  () => props.modelValue,
  {
    name: () => transitionName.value,
    duration: () => transitionDuration.value,
    delay: () => transitionDelay.value,
    easing: () => transitionEasing.value,
  },
  {
    onAfterEnter: () => {
      emit('open');
      emit('after-enter');
    },
    onAfterLeave: () => {
      emit('close');
      emit('after-leave');
    },
  }
);
const panelClass = computed(() => [transitionClasses.value, props.customClass]);

function close() {
  // 如果正在离开，直接返回（防止重复触发）
  if (!canTriggerModalAction(state.value.leaving)) return;
  emit('update:modelValue', false);
}

function confirm() {
  if (!canTriggerModalAction(state.value.leaving)) return;
  emit('confirm');
  emit('update:modelValue', false);
}

function onOverlayClick() {
  emit('click-overlay');
  if (
    shouldCloseModalOnOverlay({
      leaving: state.value.leaving,
      closeOnOverlay: props.closeOnOverlay,
    })
  )
    close();
}

function cancel() {
  emit('cancel');
  close();
}

function onCloseClick() {
  emit('click-close');
  close();
}
</script>

<template>
  <!-- 遮罩层保持原始 show，避免动画干扰 -->
  <lk-overlay
    :model-value="props.modelValue"
    :z-index="zIndex"
    @update:model-value="close"
    @click="onOverlayClick"
  />

  <!-- 模态框主体：动画容器 -->
  <view v-if="display" class="lk-modal" :style="rootStyle">
    <view class="lk-modal__panel" :class="panelClass" :style="panelStyle">
      <!-- Header -->
      <view
        v-if="showResolvedHeader"
        class="lk-modal__header"
        :class="resolveModalHeaderClass(titleAlign)"
      >
        <slot name="header">
          <text class="lk-modal__title">{{ title }}</text>
        </slot>
        <lk-icon
          v-if="showClose"
          name="x"
          size="48"
          class="lk-modal__close"
          @click="onCloseClick"
        />
      </view>

      <!-- Body -->
      <view class="lk-modal__body">
        <slot />
      </view>

      <!-- Footer -->
      <view
        v-if="showFooter"
        class="lk-modal__footer"
        :class="resolveModalFooterClass({ footerType, showCancel })"
      >
        <slot name="footer">
          <template v-if="footerType === 'button'">
            <lk-button
              v-if="showCancel"
              class="lk-modal__footer-btn lk-modal__footer-btn--cancel"
              block
              size="md"
              variant="soft"
              @click="cancel"
            >
              {{ resolvedCancelText }}
            </lk-button>
            <lk-button
              class="lk-modal__footer-btn"
              block
              size="md"
              variant="solid"
              @click="confirm"
            >
              {{ resolvedConfirmText }}
            </lk-button>
          </template>
          <template v-else>
            <view
              v-if="showCancel"
              class="lk-modal__text-btn lk-modal__text-btn--cancel"
              @tap="cancel"
            >
              {{ resolvedCancelText }}
            </view>
            <view class="lk-modal__text-btn lk-modal__text-btn--confirm" @tap="confirm">
              {{ resolvedConfirmText }}
            </view>
          </template>
        </slot>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-modal.scss';
</style>
