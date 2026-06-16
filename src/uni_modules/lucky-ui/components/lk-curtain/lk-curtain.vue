<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, useSlots } from 'vue';

import LkOverlay from '../lk-overlay/lk-overlay.vue';
import LkIcon from '../lk-icon/lk-icon.vue';

import { useTransition } from '@/uni_modules/lucky-ui/composables/useTransition';
import { useLocale } from '../../composables/useLocale';
import { curtainProps, curtainEmits } from './curtain.props';
import {
  isCurtainHttpLink,
  resolveCurtainCloseStyle,
  resolveCurtainContentStyle,
  resolveCurtainCopySuccessText,
  resolveCurtainHeight,
  resolveCurtainRootStyle,
  resolveCurtainTransitionConfig,
  resolveCurtainWidth,
  shouldCloseCurtainOnOverlay,
  shouldNavigateCurtainLink,
} from './curtain.utils';

defineOptions({ name: 'LkCurtain' });

const props = defineProps(curtainProps);
const emit = defineEmits(curtainEmits);
const { t } = useLocale('curtain');

const slots = useSlots();

const widthStr = computed(() => resolveCurtainWidth(props.width));
const heightStr = computed(() => resolveCurtainHeight(props.height));
const hasDefaultSlot = computed(() => !!slots.default);
const resolvedCopySuccessText = computed(() =>
  resolveCurtainCopySuccessText({
    copySuccessText: props.copySuccessText,
    fallback: t('copySuccess'),
  })
);
const rootStyle = computed(() =>
  resolveCurtainRootStyle({
    customStyle: props.customStyle as StyleValue,
    zIndex: props.zIndex,
    show: props.modelValue,
  })
);

const contentStyle = computed(() => {
  return resolveCurtainContentStyle({
    zIndex: props.zIndex + 1,
    width: widthStr.value,
    height: heightStr.value,
  });
});

const closeStyle = computed(() => {
  return resolveCurtainCloseStyle({
    closePosition: props.closePosition,
    closeOffset: props.closeOffset,
    closeOffsetBottom: props.closeOffsetBottom,
  });
});

const transitionConfig = computed(() => resolveCurtainTransitionConfig());

const {
  classes: contentClasses,
  styles: contentStyles,
  display,
} = useTransition(() => props.modelValue, transitionConfig.value);

function onOverlayClick() {
  emit('click-overlay');
  if (shouldCloseCurtainOnOverlay(props.closeOnOverlay)) {
    onClose();
  }
}

function onClose() {
  emit('update:modelValue', false);
  emit('close');
}

function onClick() {
  emit('click');
  if (!shouldNavigateCurtainLink(props.link)) return;

  const isHttp = isCurtainHttpLink(props.link);

  // #ifdef H5
  if (isHttp) {
    window.location.href = props.link;
    return;
  }
  // #endif

  // #ifdef APP-PLUS
  if (isHttp) {
    const runtime = (globalThis as { plus?: { runtime?: { openURL?: (url: string) => void } } })
      .plus?.runtime;
    if (runtime && typeof runtime.openURL === 'function') {
      runtime.openURL(props.link);
      return;
    }
  }
  // #endif

  // #ifdef MP
  if (isHttp) {
    uni.setClipboardData({ data: props.link });
    uni.showToast({ title: resolvedCopySuccessText.value, icon: 'none' });
    return;
  }
  // #endif

  const navFn = (uni as unknown as Record<string, (...args: unknown[]) => unknown>)[props.linkType];
  if (typeof navFn === 'function') {
    navFn({
      url: props.link,
    });
  }
}
</script>

<template>
  <view v-if="display" class="lk-curtain" :class="customClass" :style="rootStyle" @tap.stop>
    <lk-overlay
      v-if="display"
      :model-value="modelValue"
      :z-index="props.zIndex"
      @tap="onOverlayClick"
    />
    <view
      class="lk-curtain__content"
      :class="contentClasses"
      :style="[contentStyle, contentStyles]"
      @tap.stop
    >
      <view
        v-if="hasDefaultSlot"
        class="lk-curtain__slot"
        style="width: 100%; height: 100%"
        @tap="onClick"
      >
        <slot />
      </view>
      <image
        v-else
        class="lk-curtain__image"
        :src="imageUrl"
        :mode="imageMode"
        :style="{ width: '100%', height: imageMode === 'widthFix' ? 'auto' : '100%' }"
        @tap="onClick"
      />
      <view
        class="lk-curtain__close"
        :class="['lk-curtain__close--' + closePosition]"
        :style="closeStyle"
        @tap.stop="onClose"
      >
        <lk-icon name="x-lg" size="32" color="white" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
@use './lk-curtain.scss';
</style>
