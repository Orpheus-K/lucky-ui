<script setup lang="ts">
import { ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkChartRing from '@/uni_modules/lucky-ui/components/lk-chart-ring/lk-chart-ring.vue';
import LkSegmented from '@/uni_modules/lucky-ui/components/lk-segmented/lk-segmented.vue';
import LkSlider from '@/uni_modules/lucky-ui/components/lk-slider/lk-slider.vue';
import LkSwitch from '@/uni_modules/lucky-ui/components/lk-switch/lk-switch.vue';
import { LiteChartEffect, type LiteChartEffect as LiteChartEffectValue } from '@/uni_modules/lucky-ui/core/src/chart';
import type { RingChartSegment } from '@/uni_modules/lucky-ui/components/lk-chart-ring/chart-ring.props';

const progress = ref(68);
const strokeWidth = ref(24);
const showCenter = ref(true);
const showTrack = ref(true);
const chartEffect = ref<LiteChartEffectValue>(LiteChartEffect.Premium);

const effectOptions = [
  { label: '无', value: LiteChartEffect.None },
  { label: '轻', value: LiteChartEffect.Subtle },
  { label: '强', value: LiteChartEffect.Premium },
];

const segments: RingChartSegment[] = [
  { label: 'Move', value: 52, color: '#2563eb' },
  { label: 'Exercise', value: 28, color: '#14b8a6' },
  { label: 'Stand', value: 20, color: '#8b5cf6' },
];

const tinySegments: RingChartSegment[] = [
  { label: 'Tiny', value: 1 },
  { label: 'Large', value: 999 },
];
</script>

<template>
  <view class="component-demo chart-ring-demo">
    <demo-block title="单值环形图">
      <view class="chart-ring-demo__card">
        <lk-chart-ring
          :value="progress"
          :max="100"
          :height="260"
          :stroke-width="strokeWidth"
          :show-center="showCenter"
          :show-track="showTrack"
          title="完成率"
          subtitle="今日"
          :effect="chartEffect"
        />
      </view>
    </demo-block>

    <demo-block title="多段占比">
      <view class="chart-ring-demo__card">
        <lk-chart-ring
          :segments="segments"
          :height="280"
          :stroke-width="strokeWidth"
          title="Activity"
          subtitle="100%"
          :show-track="showTrack"
          :effect="chartEffect"
        />
        <view class="chart-ring-demo__legend">
          <text v-for="item in segments" :key="item.label">{{ item.label }} {{ item.value }}</text>
        </view>
      </view>
    </demo-block>

    <demo-block title="参数与边界">
      <view class="chart-ring-demo__controls">
        <view class="chart-ring-demo__row">
          <text class="chart-ring-demo__label">特效</text>
          <lk-segmented v-model="chartEffect" :options="effectOptions" size="sm" />
        </view>
        <view class="chart-ring-demo__row">
          <text class="chart-ring-demo__label">中心文字</text>
          <lk-switch v-model="showCenter" />
        </view>
        <view class="chart-ring-demo__row">
          <text class="chart-ring-demo__label">底轨</text>
          <lk-switch v-model="showTrack" />
        </view>
        <view class="chart-ring-demo__row chart-ring-demo__row--slider">
          <text class="chart-ring-demo__label">进度 {{ progress }}%</text>
          <lk-slider v-model="progress" :min="0" :max="100" :step="1" show-value />
        </view>
        <view class="chart-ring-demo__row chart-ring-demo__row--slider">
          <text class="chart-ring-demo__label">环宽 {{ strokeWidth }}rpx</text>
          <lk-slider v-model="strokeWidth" :min="12" :max="42" :step="2" show-value />
        </view>
        <view class="chart-ring-demo__edge">
          <text>极小分段</text>
          <lk-chart-ring :segments="tinySegments" :height="180" :stroke-width="18" />
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

.chart-ring-demo {
  &__card,
  &__controls,
  &__edge {
    border-radius: var(--lk-radius-lg);
    background: var(--lk-bg-container);
    box-shadow: var(--lk-shadow-sm);
  }

  &__card,
  &__controls {
    padding: 24rpx;
  }

  &__legend {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    font-size: var(--lk-font-size-sm);
    color: var(--lk-text-secondary);
  }

  &__row {
    min-height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
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

  &__edge {
    margin-top: 24rpx;
    padding: 18rpx 12rpx 4rpx;

    text {
      display: block;
      margin: 0 8rpx;
      font-size: var(--lk-font-size-sm);
      color: var(--lk-text-secondary);
    }
  }
}
</style>
