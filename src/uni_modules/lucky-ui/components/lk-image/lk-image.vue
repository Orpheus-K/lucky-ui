<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, reactive, watch } from 'vue';
import { imageProps, imageEmits } from './image.props';
import { useLocale } from '../../composables/useLocale';
import {
  createImageInitialState,
  resolveImageClickPayload,
  resolveImagePreviewPayload,
  resolveImageRootStyle,
  resolveImageStateOnError,
  resolveImageStateOnLoad,
  resolveImageStateOnSrcChange,
  shouldPreviewImage,
} from './image.utils';

defineOptions({ name: 'LkImage' });

const props = defineProps(imageProps);
const emit = defineEmits(imageEmits);
const { t } = useLocale('image');

const state = reactive(createImageInitialState());

watch(
  () => props.src,
  () => {
    Object.assign(state, resolveImageStateOnSrcChange());
  }
);

function onLoad(e: unknown) {
  Object.assign(state, resolveImageStateOnLoad());
  emit('load', e);
}

function onError(e: unknown) {
  Object.assign(state, resolveImageStateOnError());
  emit('error', e);
}
function onClick(event?: unknown) {
  emit('click', resolveImageClickPayload({ src: props.src, event }));
  if (shouldPreviewImage({ preview: props.preview, src: props.src })) {
    const payload = resolveImagePreviewPayload({ src: props.src, event });
    emit('preview', payload);
    uni.previewImage({
      current: props.src,
      urls: payload.urls,
      success: result => emit('preview-success', { src: props.src, result }),
      fail: error => emit('preview-fail', { src: props.src, error }),
    });
  }
}

const rootStyle = computed<StyleValue>(() =>
  resolveImageRootStyle({
    width: props.width,
    height: props.height,
    radius: props.radius,
    customStyle: props.customStyle as StyleValue,
  })
);
</script>

<template>
  <view :id="id" class="lk-image" :class="customClass" :style="rootStyle" @tap="onClick">
    <image
      v-if="!state.error"
      class="lk-image__inner"
      :src="src"
      :mode="fit"
      :lazy-load="lazy"
      @load="onLoad"
      @error="onError"
    />
    <view
      v-if="showLoading && state.loading"
      class="lk-image__placeholder lk-image__placeholder--loading"
    />
    <view v-else-if="showError && state.error" class="lk-image__placeholder">
      <lk-icon name="image" size="44" />
      <text class="lk-image__text">{{ t('loadFailed') }}</text>
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-image.scss';
</style>
