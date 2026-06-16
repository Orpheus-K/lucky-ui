<script setup lang="ts">
import { ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkChartSparkline from '@/uni_modules/lucky-ui/components/lk-chart-sparkline/lk-chart-sparkline.vue';
import LkSegmented from '@/uni_modules/lucky-ui/components/lk-segmented/lk-segmented.vue';
import LkSlider from '@/uni_modules/lucky-ui/components/lk-slider/lk-slider.vue';
import LkSwitch from '@/uni_modules/lucky-ui/components/lk-switch/lk-switch.vue';
import {
  LiteChartEffect,
  type LiteChartEffect as LiteChartEffectValue,
  type LiteChartPoint,
} from '@/uni_modules/lucky-ui/core/src/chart';

const lineWidth = ref(5);
const area = ref(true);
const showEndPoint = ref(true);
const tooltip = ref(true);
const chartEffect = ref<LiteChartEffectValue>(LiteChartEffect.Premium);
const hoverIndex = ref(-1);

const effectOptions = [
  { label: '无', value: LiteChartEffect.None },
  { label: '轻', value: LiteChartEffect.Subtle },
  { label: '强', value: LiteChartEffect.Premium },
];

const revenue: LiteChartPoint[] = [
  { label: '1', value: 28 },
  { label: '2', value: 34 },
  { label: '3', value: 32 },
  { label: '4', value: 45 },
  { label: '5', value: 52 },
  { label: '6', value: 49 },
  { label: '7', value: 64 },
  { label: '8', value: 71 },
];

const flatTrend: LiteChartPoint[] = [
  { label: 'A', value: 32 },
  { label: 'B', value: 32 },
  { label: 'C', value: 32 },
];

const singleTrend: LiteChartPoint[] = [{ label: 'Only', value: 16 }];
</script>

<template>
  <view class="component-demo chart-sparkline-demo">
    <demo-block title="迷你趋势线">
      <view class="chart-sparkline-demo__card">
        <view class="chart-sparkline-demo__head">
          <view>
            <text class="chart-sparkline-demo__eyebrow">Revenue</text>
            <text class="chart-sparkline-demo__value">71k</text>
          </view>
          <text class="chart-sparkline-demo__meta">hover {{ hoverIndex }}</text>
        </view>
        <lk-chart-sparkline
          :data="revenue"
          :height="160"
          :line-width="lineWidth"
          :area="area"
          :show-end-point="showEndPoint"
          :tooltip="tooltip"
          :effect="chartEffect"
          @hover-change="hoverIndex = $event"
        />
      </view>
    </demo-block>

    <demo-block title="参数控制">
      <view class="chart-sparkline-demo__controls">
        <view class="chart-sparkline-demo__row">
          <text class="chart-sparkline-demo__label">特效</text>
          <lk-segmented v-model="chartEffect" :options="effectOptions" size="sm" />
        </view>
        <view class="chart-sparkline-demo__row">
          <text class="chart-sparkline-demo__label">面积填充</text>
          <lk-switch v-model="area" />
        </view>
        <view class="chart-sparkline-demo__row">
          <text class="chart-sparkline-demo__label">末端高亮</text>
          <lk-switch v-model="showEndPoint" />
        </view>
        <view class="chart-sparkline-demo__row">
          <text class="chart-sparkline-demo__label">Tooltip</text>
          <lk-switch v-model="tooltip" />
        </view>
        <view class="chart-sparkline-demo__row chart-sparkline-demo__row--slider">
          <text class="chart-sparkline-demo__label">线宽 {{ lineWidth }}rpx</text>
          <lk-slider v-model="lineWidth" :min="2" :max="12" :step="1" show-value />
        </view>
      </view>
    </demo-block>

    <demo-block title="边界数据">
      <view class="chart-sparkline-demo__grid">
        <view class="chart-sparkline-demo__mini">
          <text>平稳</text>
          <lk-chart-sparkline :data="flatTrend" :height="120" :tooltip="false" />
        </view>
        <view class="chart-sparkline-demo__mini">
          <text>单点</text>
          <lk-chart-sparkline :data="singleTrend" :height="120" :tooltip="false" />
        </view>
      </view>
    </demo-block>
  </view>
</template>

<style scoped lang="scss">
.component-demo {
  width: 100%;
  display: flex;
  flex-direction: column;

  > :not(:first-child) {
    margin-top: 32rpx;
  }
}

.chart-sparkline-demo {
  &__card,
  &__controls,
  &__mini {
    border-radius: var(--lk-radius-lg);
    background: var(--lk-bg-container);
    box-shadow: var(--lk-shadow-sm);
  }

  &__card {
    padding: 24rpx;
  }

  &__head,
  &__row,
  &__grid {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
  }

  &__eyebrow,
  &__meta,
  &__mini text {
    font-size: var(--lk-font-size-sm);
    color: var(--lk-text-secondary);
  }

  &__value {
    display: block;
    margin-top: 4rpx;
    font-size: 44rpx;
    line-height: 1;
    font-weight: 700;
    color: var(--lk-text-primary);
  }

  &__controls {
    padding: 8rpx 24rpx 24rpx;
  }

  &__row {
    min-height: 88rpx;
    border-bottom: 1rpx solid var(--lk-border-light);
  }

  &__row--slider {
    display: block;
    padding: 18rpx 0;
  }

  &__label {
    font-size: var(--lk-font-size-base);
    color: var(--lk-text-primary);
  }

  &__grid {
    align-items: stretch;
  }

  &__mini {
    flex: 1;
    min-width: 0;
    padding: 18rpx 12rpx 4rpx;
  }
}
</style>
