<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed } from 'vue';
import LkChartSparkline from '../lk-chart-sparkline/lk-chart-sparkline.vue';
import { chartStatCardProps } from './chart-stat-card.props';
import {
  resolveChartStatCardClass,
  resolveChartStatCardRootStyle,
  resolveChartStatCardTrendIcon,
  resolveChartStatCardTrendLabel,
} from './chart-stat-card.utils';
import { useLocale } from '../../composables/useLocale';

defineOptions({ name: 'LkChartStatCard' });

const props = defineProps(chartStatCardProps);
const { t } = useLocale('chartStatCard');

const classes = computed(() =>
  resolveChartStatCardClass({
    trend: props.trend,
    showChart: props.showChart,
    customClass: props.customClass,
  })
);

const rootStyle = computed<StyleValue>(() =>
  resolveChartStatCardRootStyle({
    customStyle: props.customStyle as StyleValue,
  })
);

const trendLabel = computed(() => {
  return resolveChartStatCardTrendLabel({
    trendText: props.trendText,
    trend: props.trend,
    t,
  });
});

const trendIcon = computed(() => resolveChartStatCardTrendIcon(props.trend));
</script>

<template>
  <view :class="classes" :style="rootStyle">
    <view class="lk-chart-stat-card__header">
      <view class="lk-chart-stat-card__copy">
        <text class="lk-chart-stat-card__title">{{ title }}</text>
        <view class="lk-chart-stat-card__value-row">
          <text class="lk-chart-stat-card__value">{{ value }}</text>
          <text v-if="unit" class="lk-chart-stat-card__unit">{{ unit }}</text>
        </view>
      </view>
      <view class="lk-chart-stat-card__trend">
        <text class="lk-chart-stat-card__trend-icon">{{ trendIcon }}</text>
        <text>{{ trendLabel }}</text>
      </view>
    </view>

    <text v-if="description" class="lk-chart-stat-card__desc">{{ description }}</text>

    <view v-if="showChart" class="lk-chart-stat-card__chart">
      <lk-chart-sparkline
        :data="data"
        :height="chartHeight"
        :color="props.color"
        :line-width="props.chartLineWidth"
        :animation-duration="props.chartAnimationDuration"
        :animation-repeat="props.chartAnimationRepeat"
        :effect="props.chartEffect"
        :tooltip="false"
        :show-end-point="true"
        :padding="8"
      />
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-chart-stat-card.scss';
</style>
