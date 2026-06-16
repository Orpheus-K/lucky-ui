<script setup lang="ts">
import { ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkChartRadarLite from '@/uni_modules/lucky-ui/components/lk-chart-radar-lite/lk-chart-radar-lite.vue';
import LkSegmented from '@/uni_modules/lucky-ui/components/lk-segmented/lk-segmented.vue';
import LkSlider from '@/uni_modules/lucky-ui/components/lk-slider/lk-slider.vue';
import LkSwitch from '@/uni_modules/lucky-ui/components/lk-switch/lk-switch.vue';
import { LiteChartEffect, type LiteChartEffect as LiteChartEffectValue } from '@/uni_modules/lucky-ui/core/src/chart';
import type { RadarLiteItem } from '@/uni_modules/lucky-ui/components/lk-chart-radar-lite/chart-radar-lite.props';

const levels = ref(4);
const lineWidth = ref(2);
const showLabel = ref(true);
const showPoint = ref(true);
const chartEffect = ref<LiteChartEffectValue>(LiteChartEffect.Premium);

const effectOptions = [
  { label: '无', value: LiteChartEffect.None },
  { label: '轻', value: LiteChartEffect.Subtle },
  { label: '强', value: LiteChartEffect.Premium },
];

const wellness: RadarLiteItem[] = [
  { label: '睡眠', value: 88 },
  { label: '活力', value: 76 },
  { label: '专注', value: 82 },
  { label: '恢复', value: 72 },
  { label: '压力', value: 62 },
  { label: '运动', value: 91 },
];

const riskProfile: RadarLiteItem[] = [
  { label: '身份', value: 4, max: 5 },
  { label: '设备', value: 3.5, max: 5 },
  { label: '行为', value: 4.6, max: 5 },
  { label: '交易', value: 3.8, max: 5 },
  { label: '环境', value: 4.2, max: 5 },
];

const twoAxis: RadarLiteItem[] = [
  { label: 'One', value: 60 },
  { label: 'Two', value: 82 },
];
</script>

<template>
  <view class="component-demo chart-radar-lite-demo">
    <demo-block title="能力雷达">
      <view class="chart-radar-lite-demo__card">
        <lk-chart-radar-lite
          :data="wellness"
          :height="340"
          :levels="levels"
          :line-width="lineWidth"
          :show-label="showLabel"
          :show-point="showPoint"
          :effect="chartEffect"
        />
      </view>
    </demo-block>

    <demo-block title="不同最大值">
      <view class="chart-radar-lite-demo__card">
        <lk-chart-radar-lite
          :data="riskProfile"
          :height="320"
          :max="5"
          color="#0f766e"
          :levels="5"
          :line-width="lineWidth"
          :show-point="showPoint"
        />
      </view>
    </demo-block>

    <demo-block title="参数与边界">
      <view class="chart-radar-lite-demo__controls">
        <view class="chart-radar-lite-demo__row">
          <text class="chart-radar-lite-demo__label">特效</text>
          <lk-segmented v-model="chartEffect" :options="effectOptions" size="sm" />
        </view>
        <view class="chart-radar-lite-demo__row">
          <text class="chart-radar-lite-demo__label">标签</text>
          <lk-switch v-model="showLabel" />
        </view>
        <view class="chart-radar-lite-demo__row">
          <text class="chart-radar-lite-demo__label">顶点</text>
          <lk-switch v-model="showPoint" />
        </view>
        <view class="chart-radar-lite-demo__row chart-radar-lite-demo__row--slider">
          <text class="chart-radar-lite-demo__label">层级 {{ levels }}</text>
          <lk-slider v-model="levels" :min="2" :max="6" :step="1" show-value />
        </view>
        <view class="chart-radar-lite-demo__row chart-radar-lite-demo__row--slider">
          <text class="chart-radar-lite-demo__label">线宽 {{ lineWidth }}rpx</text>
          <lk-slider v-model="lineWidth" :min="1" :max="6" :step="1" show-value />
        </view>
        <view class="chart-radar-lite-demo__edge">
          <text>双轴降级</text>
          <lk-chart-radar-lite :data="twoAxis" :height="220" :show-label="false" />
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

.chart-radar-lite-demo {
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
