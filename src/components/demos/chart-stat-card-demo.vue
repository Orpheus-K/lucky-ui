<script setup lang="ts">
import { ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkChartStatCard from '@/uni_modules/lucky-ui/components/lk-chart-stat-card/lk-chart-stat-card.vue';
import LkSwitch from '@/uni_modules/lucky-ui/components/lk-switch/lk-switch.vue';
import LkSlider from '@/uni_modules/lucky-ui/components/lk-slider/lk-slider.vue';
import { LiteChartEffect, type LiteChartPoint } from '@/uni_modules/lucky-ui/core/src/chart';

const showChart = ref(true);
const chartHeight = ref(112);
const chartLineWidth = ref(5);

const revenue: LiteChartPoint[] = [
  { label: '1', value: 28 },
  { label: '2', value: 34 },
  { label: '3', value: 32 },
  { label: '4', value: 45 },
  { label: '5', value: 52 },
  { label: '6', value: 49 },
  { label: '7', value: 64 },
];

const retention: LiteChartPoint[] = [
  { label: 'D1', value: 76 },
  { label: 'D2', value: 72 },
  { label: 'D3', value: 69 },
  { label: 'D4', value: 67 },
  { label: 'D5', value: 63 },
];
</script>

<template>
  <view class="component-demo chart-stat-card-demo">
    <demo-block title="指标卡组合">
      <view class="chart-stat-card-demo__grid">
        <lk-chart-stat-card
          title="Revenue"
          value="71.2"
          unit="k"
          description="Last 7 days"
          trend="up"
          trend-text="+18.4%"
          :data="revenue"
          :show-chart="showChart"
          :chart-height="chartHeight"
          :chart-line-width="chartLineWidth"
          :chart-effect="LiteChartEffect.Premium"
        />
        <lk-chart-stat-card
          title="Retention"
          value="58"
          unit="%"
          description="D7 cohort"
          trend="down"
          trend-text="-4.2%"
          color="#be123c"
          :data="retention"
          :show-chart="showChart"
          :chart-height="chartHeight"
          :chart-line-width="chartLineWidth"
          :chart-effect="LiteChartEffect.Subtle"
        />
      </view>
    </demo-block>

    <demo-block title="参数控制">
      <view class="chart-stat-card-demo__controls">
        <view class="chart-stat-card-demo__row">
          <text class="chart-stat-card-demo__label">显示趋势图</text>
          <lk-switch v-model="showChart" />
        </view>
        <view class="chart-stat-card-demo__row chart-stat-card-demo__row--slider">
          <text class="chart-stat-card-demo__label">图表高度 {{ chartHeight }}rpx</text>
          <lk-slider v-model="chartHeight" :min="80" :max="180" :step="8" show-value />
        </view>
        <view class="chart-stat-card-demo__row chart-stat-card-demo__row--slider">
          <text class="chart-stat-card-demo__label">线宽 {{ chartLineWidth }}rpx</text>
          <lk-slider v-model="chartLineWidth" :min="2" :max="10" :step="1" show-value />
        </view>
      </view>
    </demo-block>

    <demo-block title="无图表模式">
      <lk-chart-stat-card
        title="Latency"
        value="126"
        unit="ms"
        description="P95 response time"
        trend="flat"
        trend-text="stable"
        :show-chart="false"
      />
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

.chart-stat-card-demo {
  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20rpx;
  }

  &__controls {
    padding: 8rpx 24rpx 24rpx;
    border-radius: var(--lk-radius-lg);
    background: var(--lk-bg-container);
    box-shadow: var(--lk-shadow-sm);
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
}
</style>
