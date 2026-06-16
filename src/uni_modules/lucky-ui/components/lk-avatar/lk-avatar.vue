<script setup lang="ts">
import { computed, ref, watch, type StyleValue } from 'vue';
import { avatarProps } from './avatar.props';
import {
  resolveAvatarClass,
  resolveAvatarFallbackText,
  resolveAvatarStyle,
  shouldShowAvatarImage,
} from './avatar.utils';

defineOptions({ name: 'LkAvatar' });

const props = defineProps(avatarProps);
const hasError = ref(false);

/**
 * 组件内联样式
 * - 小程序端优先使用直出样式，避免 CSS 变量透传兼容差异
 */
const avatarStyle = computed(() =>
  resolveAvatarStyle({
    shape: props.shape,
    size: props.size,
    radius: props.radius,
    bg: props.bg,
    color: props.color,
  })
);

/**
 * 合并样式，避免在模板中使用 any 断言
 */
const mergedStyle = computed<StyleValue>(() => [
  avatarStyle.value,
  props.customStyle as unknown as StyleValue,
]);
const showImage = computed(() =>
  shouldShowAvatarImage({
    src: props.src,
    hasError: hasError.value,
  })
);
const avatarClass = computed(() =>
  resolveAvatarClass({
    shape: props.shape,
    fallback: !showImage.value,
    customClass: props.customClass,
  })
);
const fallbackText = computed(() => resolveAvatarFallbackText(props.text));

watch(
  () => props.src,
  () => (hasError.value = false)
);

function onError() {
  hasError.value = true;
}
</script>

<template>
  <view class="lk-avatar" :class="avatarClass" :style="mergedStyle">
    <image v-if="showImage" class="lk-avatar__img" :src="src" mode="aspectFill" @error="onError" />
    <slot v-else>{{ fallbackText }}</slot>
  </view>
</template>

<style lang="scss">
@use './lk-avatar.scss';
</style>
