<script setup lang="ts">
import { computed, type StyleValue } from 'vue';
import { watermarkProps } from './watermark.props';
import {
  normalizeWatermarkContent,
  resolveWatermarkClass,
  resolveWatermarkItemStyle,
  resolveWatermarkItems,
  resolveWatermarkLayerStyle,
  resolveWatermarkParams,
  resolveWatermarkRootStyle,
} from './watermark.utils';

defineOptions({ name: 'LkWatermark' });

const props = defineProps(watermarkProps);

const normalizedContent = computed(() => normalizeWatermarkContent(props.content));

const effectiveParams = computed(() => {
  return resolveWatermarkParams(props.size, {
    width: props.width,
    height: props.height,
    fontSize: props.fontSize,
    gapX: props.gapX,
    gapY: props.gapY,
  });
});

const watermarkItems = computed(() => resolveWatermarkItems(props.rows, props.columns));

const rootClass = computed(() => [resolveWatermarkClass(props), props.customClass]);

const rootStyle = computed<StyleValue>(() => resolveWatermarkRootStyle(props.customStyle));

const layerStyle = computed<StyleValue>(() =>
  resolveWatermarkLayerStyle({
    zIndex: props.zIndex,
    color: props.color,
    opacity: props.opacity,
    columns: props.columns,
    params: effectiveParams.value,
  })
);

const itemStyle = computed<StyleValue>(() =>
  resolveWatermarkItemStyle({
    params: effectiveParams.value,
    rotate: props.rotate,
    skewX: props.skewX,
    skewY: props.skewY,
    fontWeight: props.fontWeight,
  })
);
</script>

<template>
  <view :id="id" :class="rootClass" :style="rootStyle">
    <slot />
    <view
      v-if="visible && normalizedContent.length"
      class="lk-watermark__layer"
      :style="layerStyle"
    >
      <view
        v-for="item in watermarkItems"
        :key="item"
        class="lk-watermark__item"
        :style="itemStyle"
      >
        <text v-for="line in normalizedContent" :key="line" class="lk-watermark__text">
          {{ line }}
        </text>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-watermark.scss';
</style>
