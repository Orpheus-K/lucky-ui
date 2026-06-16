<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, onUnmounted, ref, watch } from 'vue';
import LkLoading from '../lk-loading/lk-loading.vue';
import { PullRefreshStatus, pullRefreshEmits, pullRefreshProps } from './pull-refresh.props';
import type { PullRefreshStatus as PullRefreshStatusType } from './pull-refresh.props';
import {
  getNextPullRefreshScrollTop,
  getPullRefreshDistance,
  isPullRefreshIndicatorVisible,
  normalizePullRefreshSuccessDuration,
  resolvePullingStatus,
  resolvePullRefreshClass,
  resolvePullRefreshIndicatorStyle,
  resolvePullRefreshIndicatorText,
  resolvePullRefreshInitialStatus,
  resolvePullRefreshMergedStyle,
  resolvePullRefreshProgress,
  resolvePullRefreshRootStyle,
  shouldIgnorePulling,
  shouldShowRefreshSuccess,
  type PullRefreshPullingEventLike,
} from './pull-refresh.utils';
import { useLocale } from '../../composables/useLocale';

defineOptions({ name: 'LkPullRefresh' });

const props = defineProps(pullRefreshProps);
const emit = defineEmits(pullRefreshEmits);
const { t } = useLocale('pullRefresh');

const status = ref<PullRefreshStatusType>(resolvePullRefreshInitialStatus(props.modelValue));
const triggered = ref(props.modelValue);
const refresherActive = ref(props.modelValue);
const pullingDistance = ref(0);
const scrollTop = ref(0);
let successTimer: ReturnType<typeof setTimeout> | null = null;

const classes = computed(() =>
  resolvePullRefreshClass({
    status: status.value,
    disabled: props.disabled,
    indicatorVisible: isIndicatorVisible.value,
    customClass: props.customClass,
  })
);

const rootStyle = computed(() =>
  resolvePullRefreshRootStyle({
    height: props.height,
    background: props.background,
  })
);
const mergedStyle = computed<StyleValue>(() =>
  resolvePullRefreshMergedStyle(rootStyle.value, props.customStyle as StyleValue)
);

const indicatorText = computed(() =>
  resolvePullRefreshIndicatorText({
    status: status.value,
    loadingText: props.loadingText || t('loading'),
    successText: props.successText || t('success'),
    loosingText: props.loosingText || t('loosing'),
    pullingText: props.pullingText || t('pulling'),
  })
);

const isIndicatorVisible = computed(() =>
  isPullRefreshIndicatorVisible({
    refresherActive: refresherActive.value,
    status: status.value,
    pullingDistance: pullingDistance.value,
  })
);

const progress = computed(() =>
  resolvePullRefreshProgress({
    status: status.value,
    pullingDistance: pullingDistance.value,
    threshold: props.threshold,
  })
);

const indicatorStyle = computed(() =>
  resolvePullRefreshIndicatorStyle({
    visible: isIndicatorVisible.value,
    progress: progress.value,
  })
);

watch(
  () => props.modelValue,
  value => {
    if (value) {
      clearSuccessTimer();
      triggered.value = true;
      refresherActive.value = true;
      status.value = PullRefreshStatus.Refreshing;
      return;
    }
    settleRefresh();
  }
);

onUnmounted(() => {
  clearSuccessTimer();
});

function onPulling(event: PullRefreshPullingEventLike) {
  if (shouldIgnorePulling({ disabled: props.disabled, status: status.value })) return;
  pullingDistance.value = getPullRefreshDistance(event);
  if (pullingDistance.value <= 0) {
    resetIndicator();
    return;
  }
  refresherActive.value = true;
  status.value = resolvePullingStatus({
    distance: pullingDistance.value,
    threshold: props.threshold,
  });
}

function onRefresh() {
  if (props.disabled) {
    triggered.value = false;
    return;
  }
  clearSuccessTimer();
  triggered.value = true;
  refresherActive.value = true;
  status.value = PullRefreshStatus.Refreshing;
  pullingDistance.value = props.threshold;
  emit('update:modelValue', true);
  emit('refresh');
}

function onRestore(event: unknown) {
  resetIndicator();
  emit('restore', event);
}

function onAbort(event: unknown) {
  resetIndicator();
  emit('abort', event);
}

function onScroll(event: unknown) {
  emit('scroll', event);
}

function onScrollToLower(event: unknown) {
  emit('scrolltolower', event);
}

function start() {
  if (props.disabled || status.value === PullRefreshStatus.Refreshing) return;
  clearSuccessTimer();
  triggered.value = true;
  refresherActive.value = true;
  status.value = PullRefreshStatus.Refreshing;
  pullingDistance.value = props.threshold;
  emit('update:modelValue', true);
  emit('refresh');
}

function finish() {
  emit('update:modelValue', false);
  settleRefresh();
}

function scrollToTop() {
  scrollTop.value = getNextPullRefreshScrollTop(scrollTop.value);
  setTimeout(() => {
    scrollTop.value = 0;
  }, 0);
}

function settleRefresh() {
  triggered.value = false;
  pullingDistance.value = 0;
  if (status.value === PullRefreshStatus.Success) return;
  if (shouldShowRefreshSuccess({ status: status.value, showSuccess: props.showSuccess })) {
    clearSuccessTimer();
    status.value = PullRefreshStatus.Success;
    successTimer = setTimeout(() => {
      status.value = PullRefreshStatus.Idle;
    }, normalizePullRefreshSuccessDuration(props.successDuration));
    return;
  }
  clearSuccessTimer();
  resetIndicator();
}

function resetIndicator() {
  clearSuccessTimer();
  triggered.value = false;
  refresherActive.value = false;
  pullingDistance.value = 0;
  status.value = PullRefreshStatus.Idle;
}

function clearSuccessTimer() {
  if (!successTimer) return;
  clearTimeout(successTimer);
  successTimer = null;
}

defineExpose({
  start,
  finish,
  scrollToTop,
});
</script>

<template>
  <view :id="props.id" :class="classes" :style="mergedStyle">
    <view class="lk-pull-refresh__indicator" :style="indicatorStyle">
      <slot
        v-if="isIndicatorVisible"
        name="indicator"
        :status="status"
        :pulling-distance="pullingDistance"
        :refreshing="status === PullRefreshStatus.Refreshing"
        :progress="progress"
      >
        <view class="lk-pull-refresh__indicator-inner">
          <view class="lk-pull-refresh__main">
            <slot
              name="icon"
              :status="status"
              :pulling-distance="pullingDistance"
              :refreshing="status === PullRefreshStatus.Refreshing"
              :progress="progress"
            />
            <slot
              name="text"
              :status="status"
              :pulling-distance="pullingDistance"
              :refreshing="status === PullRefreshStatus.Refreshing"
              :progress="progress"
            >
              <lk-loading
                v-if="status !== PullRefreshStatus.Success"
                variant="text"
                :text="indicatorText"
              />
              <text v-else class="lk-pull-refresh__text">
                {{ indicatorText }}
              </text>
            </slot>
          </view>
        </view>
      </slot>
    </view>

    <scroll-view
      class="lk-pull-refresh__scroll"
      scroll-y
      :scroll-top="scrollTop"
      :refresher-enabled="!props.disabled"
      :refresher-triggered="triggered"
      :refresher-threshold="props.threshold"
      :refresher-background="props.background"
      :refresher-default-style="props.defaultStyle"
      @refresherpulling="onPulling"
      @refresherrefresh="onRefresh"
      @refresherrestore="onRestore"
      @refresherabort="onAbort"
      @scroll="onScroll"
      @scrolltolower="onScrollToLower"
    >
      <slot />
    </scroll-view>
  </view>
</template>

<style lang="scss">
@use './lk-pull-refresh.scss';
</style>
