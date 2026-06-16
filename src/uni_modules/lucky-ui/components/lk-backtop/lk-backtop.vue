<script setup lang="ts">
import type { StyleValue } from 'vue';
import { ref, computed, watch } from 'vue';
import { onPageScroll } from '@dcloudio/uni-app';
import { backtopProps, backtopEmits } from './backtop.props';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import { scrollToTop } from '@/uni_modules/lucky-ui/core/src/utils/scroll';
import {
  createBacktopPayload,
  resolveBacktopClass,
  resolveBacktopStyle,
  resolveBacktopVisible,
  resolveBacktopWrapperStyle,
  shouldBacktopScrollPage,
} from './backtop.utils';

/**
 * Backtop 回到顶部
 * - 页面滚动到一定距离后显示悬浮按钮，点击快速返回顶部
 */

defineOptions({ name: 'LkBacktop' });

const props = defineProps(backtopProps);

const emit = defineEmits(backtopEmits);

const visible = ref(false);
let framePending = false;
let latestScrollTop = 0;

function syncVisibleFromScrollTop(scrollTop: number) {
  const next = resolveBacktopVisible({
    scrollTop,
    visibilityHeight: props.visibilityHeight,
  });
  if (next !== visible.value) {
    visible.value = next;
    emit('change:visible', next, scrollTop);
  }
}

const computedVisible = computed(() => {
  return resolveBacktopVisible({
    scrollTop: props.usePageScroll ? latestScrollTop : props.scrollTop,
    visibilityHeight: props.visibilityHeight,
  });
});

if (props.usePageScroll) {
  onPageScroll(e => {
    latestScrollTop = e.scrollTop;
    if (framePending) return;
    framePending = true;
    setTimeout(() => {
      framePending = false;
      syncVisibleFromScrollTop(latestScrollTop);
    }, 16);
  });
} else {
  // 受控模式，根据外部传入的 scrollTop 判断显隐
  watch(
    () => props.scrollTop,
    st => {
      syncVisibleFromScrollTop(st);
    },
    { immediate: true }
  );
}

function toTop(event?: unknown) {
  emit('click', event);
  if (shouldBacktopScrollPage(props.usePageScroll)) {
    scrollToTop({
      duration: props.duration,
      easing: props.easing,
      startScrollTop: latestScrollTop,
    });
  }
  // 无论哪种模式都抛出事件，受控模式由外部自行将容器滚动置 0
  emit(
    'to-top',
    createBacktopPayload({
      usePageScroll: props.usePageScroll,
      duration: props.duration,
      easing: props.easing,
      event,
    })
  );
}

const wrapperStyle = computed(() => {
  return resolveBacktopWrapperStyle({
    right: props.right,
    bottom: props.bottom,
    zIndex: props.zIndex,
  });
});

const backtopStyle = computed<StyleValue>(() =>
  resolveBacktopStyle({
    wrapperStyle: wrapperStyle.value,
    customStyle: props.customStyle as StyleValue,
  })
);

const classes = computed(() =>
  resolveBacktopClass({
    size: props.size,
    shape: props.shape,
    visible: computedVisible.value,
    customClass: props.customClass,
  })
);
</script>

<template>
  <view
    v-show="computedVisible"
    :id="id"
    :class="classes"
    :style="backtopStyle"
    aria-label="Back to top"
    role="button"
    @tap="toTop"
  >
    <slot>
      <view class="lk-backtop__icon">
        <LkIcon :name="icon" size="32" color="currentColor" />
      </view>
      <text v-if="text" class="lk-backtop__text">{{ text }}</text>
    </slot>
  </view>
</template>

<style lang="scss">
@use './lk-backtop.scss';
</style>
