<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, onBeforeUnmount, onMounted, ref, useSlots } from 'vue';
import { DEFAULT_BRAND_COLOR, loadBrandColor } from '../../theme';
import { emptyEmits, emptyProps } from './empty.props';
import { getEmptyIllustrationSrc, getEmptyPreset } from './empty-illustrations';
import {
  isReadableBrandColor,
  resolveEmptyColor,
  resolveEmptyDescription,
  resolveEmptyImage,
  resolveEmptyImageStyle,
  resolveEmptyRootClass,
  resolveEmptyRootStyle,
  resolveEmptyTitle,
} from './empty.utils';

defineOptions({ name: 'LkEmpty' });

const props = defineProps(emptyProps);
const emit = defineEmits(emptyEmits);
const slots = useSlots();
const runtimeBrandColor = ref(DEFAULT_BRAND_COLOR);
let brandObserver: MutationObserver | null = null;

const preset = computed(() => getEmptyPreset(props.name));
const resolvedTitle = computed(() =>
  resolveEmptyTitle({
    title: props.title,
    preset: preset.value,
  })
);
const resolvedDescription = computed(() =>
  resolveEmptyDescription({
    description: props.description,
    preset: preset.value,
  })
);
const resolvedColor = computed(() =>
  resolveEmptyColor({
    color: props.color,
    runtimeBrandColor: runtimeBrandColor.value,
  })
);
const resolvedImage = computed(() =>
  resolveEmptyImage({
    image: props.image,
    src: props.src,
    name: props.name,
    color: resolvedColor.value,
    getIllustrationSrc: getEmptyIllustrationSrc,
  })
);

const rootClass = computed(() =>
  resolveEmptyRootClass({
    layout: props.layout,
    showImage: props.showImage,
    customClass: props.customClass,
  })
);

const rootStyle = computed<StyleValue>(() =>
  resolveEmptyRootStyle(props.customStyle as StyleValue)
);

const imageStyle = computed<StyleValue>(() => resolveEmptyImageStyle(props.imageSize));

function handleLoad(event: unknown) {
  emit('load', event);
}

function handleError(event: unknown) {
  emit('error', event);
}

function readBrandColor() {
  // #ifdef H5
  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    const rootStyle = window.getComputedStyle(document.documentElement);
    const cssColor =
      rootStyle.getPropertyValue('--lk-color-primary').trim() ||
      rootStyle.getPropertyValue('--lk-brand-600').trim();
    if (isReadableBrandColor(cssColor)) return cssColor;
  }
  // #endif
  return loadBrandColor() || DEFAULT_BRAND_COLOR;
}

function syncBrandColor() {
  runtimeBrandColor.value = readBrandColor();
}

onMounted(() => {
  syncBrandColor();

  // #ifdef H5
  if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
    brandObserver = new MutationObserver(syncBrandColor);
    brandObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style', 'data-theme'],
    });
  }
  // #endif
});

onBeforeUnmount(() => {
  brandObserver?.disconnect();
  brandObserver = null;
});
</script>

<template>
  <view :id="props.id" :class="rootClass" :style="rootStyle">
    <view v-if="props.showImage" class="lk-empty__image-wrap">
      <slot name="image">
        <image
          class="lk-empty__image"
          :src="resolvedImage"
          :style="imageStyle"
          mode="aspectFit"
          @load="handleLoad"
          @error="handleError"
        />
      </slot>
    </view>

    <view v-if="slots.title || resolvedTitle" class="lk-empty__title">
      <slot name="title">{{ resolvedTitle }}</slot>
    </view>

    <view v-if="slots.description || resolvedDescription" class="lk-empty__description">
      <slot name="description">{{ resolvedDescription }}</slot>
    </view>

    <view v-if="slots.action" class="lk-empty__action">
      <slot name="action" />
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-empty.scss';
</style>
