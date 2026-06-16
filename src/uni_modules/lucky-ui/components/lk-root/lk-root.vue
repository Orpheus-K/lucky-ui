<script setup lang="ts">
import { computed, watch, type StyleValue } from 'vue';
import { Locale } from '../../locale';
import { useTheme } from '../../theme';
import LkToastManager from '../lk-toast/lk-toast-manager.vue';
import { rootProps } from './root.props';
import {
  resolveRootClass,
  resolveRootStyle,
  resolveRootTheme,
  type RootSafeAreaInsets,
} from './root.utils';

defineOptions({ name: 'LkRoot' });

const props = defineProps(rootProps);

const { theme: currentTheme, brandStyleVars } = useTheme();

let runtimeSafeAreaInsets: RootSafeAreaInsets | undefined;

// #ifdef MP || APP-PLUS
try {
  const systemInfo = uni.getSystemInfoSync() as {
    safeAreaInsets?: RootSafeAreaInsets;
  };
  runtimeSafeAreaInsets = systemInfo.safeAreaInsets;
} catch {
  runtimeSafeAreaInsets = undefined;
}
// #endif

const resolvedTheme = computed(() =>
  resolveRootTheme({
    theme: props.theme,
    currentTheme: currentTheme.value,
  })
);

const rootClass = computed(() =>
  resolveRootClass({
    theme: resolvedTheme.value,
    background: props.background,
    fullHeight: props.fullHeight,
    safeArea: props.safeArea,
    customClass: props.customClass,
  })
);

const rootStyle = computed<StyleValue>(() =>
  resolveRootStyle({
    brandColor: props.brandColor,
    currentBrandStyle: brandStyleVars.value,
    safeArea: props.safeArea,
    safeAreaInsets: runtimeSafeAreaInsets,
    customStyle: props.customStyle as StyleValue,
  })
);

watch(
  () => props.locale,
  value => {
    if (value) Locale.use(value);
  },
  { immediate: true }
);
</script>

<template>
  <view :id="id" :class="rootClass" :style="rootStyle">
    <slot />
    <lk-toast-manager v-if="toast" />
  </view>
</template>

<style lang="scss">
@use './lk-root.scss';
</style>
