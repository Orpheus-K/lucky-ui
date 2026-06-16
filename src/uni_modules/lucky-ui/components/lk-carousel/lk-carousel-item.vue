<script lang="ts" setup>
import { computed } from 'vue';
import type { StyleValue } from 'vue';
import { baseProps, LkProp } from '../common/props';

defineOptions({ name: 'LkCarouselItem' });

const props = defineProps({
  ...baseProps,
  src: LkProp.string(''),
});

const itemClass = computed(() => ['lk-carousel-item', props.customClass]);
const itemStyle = computed<StyleValue>(() => props.customStyle as StyleValue);
</script>

<template>
  <view :class="itemClass" :style="itemStyle">
    <image
      v-if="src"
      class="lk-carousel-item__image"
      :src="src"
      mode="aspectFill"
      :draggable="false"
    />
    <slot v-else />
  </view>
</template>

<style lang="scss" scoped>
/* 确保组件宿主节点在小程序中也能占满高度 */
:host {
  display: block;
  width: 100%;
  height: 100%;
}

.lk-carousel-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: inherit;
  /* 解决某些浏览器 flex 容器下高度塌陷 */
  position: relative;

  &__image {
    width: 100%;
    height: 100%;
    display: block;
    will-change: transform;
    /* 解决小程序 image 标签默认 240px 宽度问题 */
    min-width: 100%;
    min-height: 100%;
  }
}
</style>
