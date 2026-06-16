<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, useAttrs, watch } from 'vue';
import { iconProps, iconEmits } from './icon.props';
import { iconCharOf } from './codepoints';
import { resolveIconBoxStyle, resolveIconStyle, shouldWarnMissingIcon } from './icon.utils';

// #ifdef H5 || APP-PLUS
// H5 / App 使用 @font-face 静态加载字体（本地文件，不依赖 loadFontFace）
import './fonts/lk-icons.css';
// #endif
// #ifdef MP-WEIXIN
// 小程序端：仅导入 icon class 定义，字体文件通过 loadFontFace 动态加载
import './fonts/lk-icons-definitions.css';
// #endif

defineOptions({ name: 'LkIcon', inheritAttrs: false });

const props = defineProps(iconProps);
const emit = defineEmits(iconEmits);
const attrs = useAttrs();

const iconChar = computed(() => iconCharOf(props.name));

const iconStyle = computed(() =>
  resolveIconStyle({
    color: props.color,
    size: props.size,
  })
);

const iconBoxStyle = computed(() =>
  resolveIconBoxStyle({
    color: props.color,
    size: props.size,
    boxSize: props.boxSize,
    boxColor: props.boxColor,
    boxRadius: props.boxRadius,
    boxShape: props.boxShape,
  })
);

const iconBoxClass = computed(() => [
  'lk-icon-bg-box',
  `lk-icon-bg-box--${props.boxShape}`,
  props.customClass,
  attrs.class,
]);

const iconClass = computed(() => ['lk-icon', props.customClass, attrs.class]);

const mergedIconStyle = computed<StyleValue>(() => [
  iconStyle.value,
  props.customStyle as StyleValue,
  attrs.style as StyleValue,
]);

const mergedIconBoxStyle = computed<StyleValue>(() => [
  iconBoxStyle.value,
  iconStyle.value,
  props.customStyle as StyleValue,
  attrs.style as StyleValue,
]);

watch(
  () => props.name,
  n => {
    if (shouldWarnMissingIcon(iconChar.value)) {
      console.warn(`[lk-icon] 内置图标 "${n}" 未找到（不在当前字体集）。`);
    }
  },
  { immediate: true }
);

function handleClick(e: Event) {
  emit('click', e);
}
</script>

<template>
  <view
    v-if="props.box"
    :class="iconBoxClass"
    :style="mergedIconBoxStyle"
    aria-hidden="true"
    @tap="handleClick"
  >
    <text class="lk-icon">{{ iconChar }}</text>
  </view>
  <text
    v-else
    :class="iconClass"
    :style="mergedIconStyle"
    aria-hidden="true"
    @tap="handleClick"
  >
    {{ iconChar }}
  </text>
</template>

<style lang="scss">
@use './lk-icon.scss';
</style>
