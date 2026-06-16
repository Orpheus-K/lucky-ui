<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { numberRollerProps } from './number-roller.props';
import {
  buildNumberRollerSegments,
  NUMBER_ROLLER_DIGITS_POOL,
  normalizeNumberRollerValue,
  primeNumberRollerDigits,
  resolveNumberRollerClass,
  resolveNumberRollerRenderSegments,
  resolveNumberRollerRootStyle,
  resolveNumberRollerStyle,
  resolveNumberRollerTargetDigits,
  resolveNumberRollerTrackStyle,
  type NumberRollerAnimatedDigits,
  type NumberRollerSegment,
} from './number-roller.utils';
import type { StyleValue } from 'vue';

defineOptions({ name: 'LkNumberRoller' });

const props = defineProps(numberRollerProps);

const digitsPool = NUMBER_ROLLER_DIGITS_POOL;

const classes = computed(() => resolveNumberRollerClass(props.customClass));

const rollerStyle = computed(() =>
  resolveNumberRollerStyle({
    autoplay: props.autoplay,
    speed: props.speed,
    easing: props.easing,
    digitHeight: props.digitHeight,
  })
);

const rootStyle = computed(() =>
  resolveNumberRollerRootStyle(rollerStyle.value, props.customStyle as StyleValue)
);

const formattedText = computed(() =>
  normalizeNumberRollerValue(props.value, {
    formatter: props.formatter,
    decimals: props.decimals,
    grouping: props.grouping,
    groupSeparator: props.groupSeparator,
    decimalSeparator: props.decimalSeparator,
  })
);

const segments = computed<NumberRollerSegment[]>(() =>
  buildNumberRollerSegments(formattedText.value)
);

const animatedDigitByKey = ref<NumberRollerAnimatedDigits>({});

const renderSegments = computed<NumberRollerSegment[]>(() =>
  resolveNumberRollerRenderSegments({
    autoplay: props.autoplay,
    segments: segments.value,
    animatedDigitByKey: animatedDigitByKey.value,
  })
);

function primeAndAnimateDigits() {
  if (!props.autoplay) return;
  const { next, changed } = primeNumberRollerDigits(segments.value, animatedDigitByKey.value);
  if (changed) animatedDigitByKey.value = next;
  nextTick(() => {
    animatedDigitByKey.value = resolveNumberRollerTargetDigits(
      segments.value,
      animatedDigitByKey.value
    );
  });
}

onMounted(() => {
  primeAndAnimateDigits();
});

watch(
  () => segments.value,
  () => {
    primeAndAnimateDigits();
  }
);
</script>

<template>
  <view :class="classes" :style="rootStyle">
    <template v-for="segment in renderSegments" :key="segment.key">
      <view v-if="segment.type === 'digit'" class="lk-number-roller__segment">
        <view class="lk-number-roller__window">
          <view
            class="lk-number-roller__track"
            :style="resolveNumberRollerTrackStyle(segment.digit)"
          >
            <text v-for="digit in digitsPool" :key="digit" class="lk-number-roller__digit">{{
              digit
            }}</text>
          </view>
        </view>
      </view>
      <text v-else class="lk-number-roller__symbol">{{ segment.symbol }}</text>
    </template>
  </view>
</template>

<style lang="scss">
@use './lk-number-roller.scss';
</style>
