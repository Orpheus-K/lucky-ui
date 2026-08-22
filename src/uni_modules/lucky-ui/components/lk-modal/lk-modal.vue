<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useSlots, watch } from 'vue';
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
  createModalActionController,
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
const confirming = ref(false);
const closeRequested = ref(false);
const actionController = createModalActionController({
  isVisible: () => props.modelValue,
  isLeaving: () => state.value.leaving,
  isConfirming: () => confirming.value,
  setConfirming: value => {
    confirming.value = value;
  },
  isCloseRequested: () => closeRequested.value,
  setCloseRequested: value => {
    closeRequested.value = value;
  },
  getBeforeConfirm: () => props.beforeConfirm,
  onUpdateModelValue: value => emit('update:modelValue', value),
  onConfirm: () => emit('confirm'),
  onCancel: () => emit('cancel'),
  onClickOverlay: () => emit('click-overlay'),
  onClickClose: () => emit('click-close'),
});
const actionsDisabled = computed(() => !actionController.canAct());
const overlayCloseOnClick = computed(() =>
  actionController.shouldCloseOnOverlay(props.closeOnOverlay)
);
const panelClass = computed(() => [
  transitionClasses.value,
  props.customClass,
  { 'is-confirming': confirming.value },
]);

watch(
  () => props.modelValue,
  () => actionController.syncVisibility(),
  { flush: 'sync' }
);
onBeforeUnmount(() => actionController.destroy());

function confirm() {
  void actionController.confirm();
}

function onOverlayClick() {
  actionController.clickOverlay();
}

function onOverlayModelUpdate(value: boolean) {
  if (!value) actionController.closeFromOverlay();
}

function cancel() {
  actionController.cancel();
}

function onCloseClick() {
  actionController.clickClose();
}
</script>

<template>
  <!-- 遮罩层保持原始 show，避免动画干扰 -->
  <lk-overlay
    :model-value="props.modelValue"
    :z-index="zIndex"
    :close-on-click="overlayCloseOnClick"
    @update:model-value="onOverlayModelUpdate"
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
          :class="{ 'is-disabled': actionsDisabled }"
          :aria-disabled="actionsDisabled"
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
              class="lk-modal__footer-btn lk-modal__footer-btn--cancel lk-modal__cancel"
              block
              size="md"
              variant="soft"
              :disabled="actionsDisabled"
              @click="cancel"
            >
              {{ resolvedCancelText }}
            </lk-button>
            <lk-button
              class="lk-modal__footer-btn lk-modal__confirm"
              block
              size="md"
              variant="solid"
              :loading="confirming"
              :disabled="actionsDisabled"
              @click="confirm"
            >
              {{ resolvedConfirmText }}
            </lk-button>
          </template>
          <template v-else>
            <view
              v-if="showCancel"
              class="lk-modal__text-btn lk-modal__text-btn--cancel lk-modal__cancel"
              :class="{ 'is-disabled': actionsDisabled }"
              :aria-disabled="actionsDisabled"
              @tap="cancel"
            >
              {{ resolvedCancelText }}
            </view>
            <view
              class="lk-modal__text-btn lk-modal__text-btn--confirm lk-modal__confirm"
              :class="{ 'is-disabled': actionsDisabled, 'is-loading': confirming }"
              :aria-disabled="actionsDisabled"
              @tap="confirm"
            >
              <view v-if="confirming" class="lk-modal__confirm-loader" />
              <text v-else>{{ resolvedConfirmText }}</text>
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
