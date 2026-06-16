<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { countdownEmits, countdownProps } from './countdown.props';
import {
  formatCountdownTime,
  getCountdownInterval,
  getCountdownScheduleDelay,
  getCountdownTimeData,
  getCountdownVisibleRemaining,
  normalizeCountdownDisplayRemaining,
  normalizeCountdownDuration,
  parseCountdownSegments,
  resolveCountdownClass,
  resolveCountdownRootStyle,
  resolveCountdownUnitMap,
  type CountdownSegment,
} from './countdown.utils';
import { useLocale } from '../../composables/useLocale';

defineOptions({ name: 'LkCountdown' });

const props = defineProps(countdownProps);
const emit = defineEmits(countdownEmits);
const { t } = useLocale('countdown');

let timer: ReturnType<typeof setTimeout> | null = null;
let deadline = 0;

const remaining = ref(0);
const running = ref(false);
const finished = ref(false);

const classes = computed(() =>
  resolveCountdownClass({
    variant: props.variant,
    size: props.size,
    type: props.type,
    running: running.value,
    finished: finished.value,
    millisecond: props.millisecond,
    customClass: props.customClass,
  })
);

const interval = computed(() => getCountdownInterval(props.millisecond));

const baseDuration = computed(() =>
  normalizeCountdownDuration({
    time: props.time,
    targetTime: props.targetTime,
    now: Date.now(),
  })
);

const timeData = computed(() => getCountdownTimeData(displayRemaining.value, props.format));

const visibleRemaining = computed(() =>
  getCountdownVisibleRemaining({
    remaining: remaining.value,
    finished: finished.value,
    showZero: props.showZero,
  })
);

const displayRemaining = computed(() =>
  normalizeCountdownDisplayRemaining({
    total: visibleRemaining.value,
    millisecond: props.millisecond,
  })
);

const formattedText = computed(() => {
  const formatted = props.formatter?.(timeData.value);
  return formatted !== undefined && formatted !== null
    ? String(formatted)
    : formatCountdownTime({
        format: props.format,
        data: timeData.value,
        padZero: props.padZero,
        trimZeroDay: props.trimZeroDay,
      });
});

const unitMap = computed(() =>
  resolveCountdownUnitMap({
    unitMap: props.unitMap,
    fallback: {
      day: t('day'),
      hour: t('hour'),
      minute: t('minute'),
      second: t('second'),
      millisecond: t('millisecond'),
    },
  })
);

const segments = computed<CountdownSegment[]>(() =>
  parseCountdownSegments(formattedText.value, unitMap.value)
);
const rootStyle = computed<StyleValue>(() =>
  resolveCountdownRootStyle(props.customStyle as StyleValue)
);

watch(
  () => [props.time, props.targetTime],
  () => {
    reset(props.autoStart);
  }
);

watch(
  () => props.millisecond,
  () => {
    if (!running.value) return;
    clearTimer();
    scheduleTick(remaining.value);
  }
);

onMounted(() => {
  reset(props.autoStart);
});

onUnmounted(() => {
  clearTimer();
});

function tick() {
  const next = Math.max(0, deadline - Date.now());
  remaining.value = next;
  emit(
    'change',
    getCountdownTimeData(
      normalizeCountdownDisplayRemaining({
        total: next,
        millisecond: props.millisecond,
      }),
      props.format
    )
  );

  if (next <= 0) {
    finish();
    return;
  }

  scheduleTick(next);
}

function scheduleTick(currentRemaining: number) {
  timer = setTimeout(
    tick,
    getCountdownScheduleDelay({
      millisecond: props.millisecond,
      interval: interval.value,
      currentRemaining,
    })
  );
}

function start() {
  if (running.value || remaining.value <= 0) return;
  clearTimer();
  running.value = true;
  finished.value = false;
  deadline = Date.now() + remaining.value;
  emit('start');
  scheduleTick(remaining.value);
}

function pause() {
  if (!running.value) return;
  remaining.value = Math.max(0, deadline - Date.now());
  running.value = false;
  clearTimer();
  emit('pause', remaining.value);
}

function reset(autoStart = props.autoStart) {
  clearTimer();
  running.value = false;
  finished.value = false;
  remaining.value = baseDuration.value;
  emit('reset', remaining.value);
  emit(
    'change',
    getCountdownTimeData(
      normalizeCountdownDisplayRemaining({
        total: remaining.value,
        millisecond: props.millisecond,
      }),
      props.format
    )
  );
  if (autoStart && remaining.value > 0) start();
  if (remaining.value <= 0) finished.value = true;
}

function finish() {
  clearTimer();
  running.value = false;
  finished.value = true;
  remaining.value = 0;
  emit('finish');
}

function clearTimer() {
  if (!timer) return;
  clearTimeout(timer);
  timer = null;
}

defineExpose({
  start,
  pause,
  reset,
  getTimeData: () => timeData.value,
  getRemaining: () => remaining.value,
});
</script>

<template>
  <view :id="props.id" :class="classes" :style="rootStyle">
    <slot :time-data="timeData" :formatted="formattedText" :remaining="remaining">
      <text v-if="props.prefix" class="lk-countdown__affix lk-countdown__prefix">
        {{ props.prefix }}
      </text>
      <view class="lk-countdown__body">
        <text
          v-for="segment in segments"
          :key="segment.key"
          class="lk-countdown__segment"
          :class="`lk-countdown__segment--${segment.kind}`"
        >
          {{ segment.value }}
        </text>
      </view>
      <text v-if="props.suffix" class="lk-countdown__affix lk-countdown__suffix">
        {{ props.suffix }}
      </text>
    </slot>
  </view>
</template>

<style lang="scss">
@use './lk-countdown.scss';
</style>
