<script setup lang="ts">
import { computed, ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkChartArea from '@/uni_modules/lucky-ui/components/lk-chart-area/lk-chart-area.vue';
import LkSegmented from '@/uni_modules/lucky-ui/components/lk-segmented/lk-segmented.vue';
import LkSlider from '@/uni_modules/lucky-ui/components/lk-slider/lk-slider.vue';
import LkSwitch from '@/uni_modules/lucky-ui/components/lk-switch/lk-switch.vue';
import {
  LiteChartEffect,
  type LiteChartEffect as LiteChartEffectValue,
  type LiteChartPoint,
} from '@/uni_modules/lucky-ui/core/src/chart';

type DatasetKey = 'revenue' | 'active' | 'retention';

const dataset = ref<DatasetKey>('revenue');
const chartHeight = ref(320);
const padding = ref(28);
const lineWidth = ref(5);
const tooltip = ref(true);
const showGrid = ref(true);
const showXAxisLabel = ref(true);
const defaultIndex = ref(5);
const chartEffect = ref<LiteChartEffectValue>(LiteChartEffect.Premium);
const activeIndex = ref(-1);

const datasetOptions = [
  { label: '收入', value: 'revenue' },
  { label: '活跃', value: 'active' },
  { label: '留存', value: 'retention' },
];

const effectOptions = [
  { label: '无', value: LiteChartEffect.None },
  { label: '轻', value: LiteChartEffect.Subtle },
  { label: '强', value: LiteChartEffect.Premium },
];

const revenue = ref<LiteChartPoint[]>([
  { label: '09:30', value: 62 },
  { label: '10:00', value: 66 },
  { label: '10:30', value: 64 },
  { label: '11:00', value: 73 },
  { label: '13:00', value: 76 },
  { label: '14:00', value: 82 },
  { label: '15:00', value: 88 },
]);

const active = ref<LiteChartPoint[]>([
  { label: 'Mon', value: 42 },
  { label: 'Tue', value: 48 },
  { label: 'Wed', value: 47 },
  { label: 'Thu', value: 58 },
  { label: 'Fri', value: 64 },
  { label: 'Sat', value: 61 },
  { label: 'Sun', value: 71 },
]);

const retention = ref<LiteChartPoint[]>([
  { label: 'D1', value: 76 },
  { label: 'D2', value: 72 },
  { label: 'D3', value: 69 },
  { label: 'D4', value: 67 },
  { label: 'D5', value: 63 },
  { label: 'D6', value: 61 },
  { label: 'D7', value: 58 },
]);

const flatTrend: LiteChartPoint[] = [
  { label: 'A', value: 42 },
  { label: 'B', value: 42 },
  { label: 'C', value: 42 },
  { label: 'D', value: 42 },
];

const singleTrend: LiteChartPoint[] = [{ label: 'Only', value: 16 }];

const currentData = computed(() => {
  if (dataset.value === 'active') return active.value;
  if (dataset.value === 'retention') return retention.value;
  return revenue.value;
});

const activePoint = computed(() => {
  const data = currentData.value;
  const fallback = data[data.length - 1];
  if (activeIndex.value < 0 || activeIndex.value >= data.length) return fallback;
  return data[activeIndex.value];
});

const peakValue = computed(() => Math.max(...currentData.value.map(point => point.value)));
const deltaValue = computed(() => {
  const data = currentData.value;
  if (data.length < 2) return 0;
  return data[data.length - 1].value - data[0].value;
});

function onHoverChange(index: number) {
  activeIndex.value = index;
}

function assignCurrentData(next: LiteChartPoint[]) {
  if (dataset.value === 'active') active.value = next;
  else if (dataset.value === 'retention') retention.value = next;
  else revenue.value = next;
}

function randomize() {
  const next = currentData.value.map((point, index) => ({
    ...point,
    value: Math.max(8, Math.round(point.value * (0.88 + Math.random() * 0.24) + index * 1.5)),
  }));
  assignCurrentData(next);
  activeIndex.value = -1;
}

function resetConfig() {
  dataset.value = 'revenue';
  chartHeight.value = 320;
  padding.value = 28;
  lineWidth.value = 5;
  tooltip.value = true;
  showGrid.value = true;
  showXAxisLabel.value = true;
  defaultIndex.value = 5;
  chartEffect.value = LiteChartEffect.Premium;
  activeIndex.value = -1;
}
</script>

<template>
  <view class="component-demo chart-area-demo">
    <demo-block title="页面级面积趋势" desc="面积渐变、柔和网格、默认高亮与触摸 Tooltip">
      <view class="chart-area-demo__panel">
        <view class="chart-area-demo__summary">
          <view>
            <text class="chart-area-demo__eyebrow">Current</text>
            <text class="chart-area-demo__value">{{ activePoint?.value ?? 0 }}</text>
          </view>
          <view class="chart-area-demo__summary-side">
            <text>Peak {{ peakValue }}</text>
            <text :class="['chart-area-demo__delta', { 'is-negative': deltaValue < 0 }]">
              {{ deltaValue >= 0 ? '+' : '' }}{{ deltaValue }}
            </text>
          </view>
        </view>

        <lk-chart-area
          :data="currentData"
          :height="chartHeight"
          :padding="padding"
          :line-width="lineWidth"
          :tooltip="tooltip"
          :show-grid="showGrid"
          :show-x-axis-label="showXAxisLabel"
          :default-index="defaultIndex"
          :effect="chartEffect"
          @hover-change="onHoverChange"
        />
      </view>
    </demo-block>

    <demo-block title="参数控制">
      <view class="chart-area-demo__controls">
        <view class="chart-area-demo__row">
          <text class="chart-area-demo__label">数据集</text>
          <lk-segmented v-model="dataset" :options="datasetOptions" size="sm" />
        </view>
        <view class="chart-area-demo__row">
          <text class="chart-area-demo__label">特效</text>
          <lk-segmented v-model="chartEffect" :options="effectOptions" size="sm" />
        </view>
        <view class="chart-area-demo__row">
          <text class="chart-area-demo__label">Tooltip</text>
          <lk-switch v-model="tooltip" />
        </view>
        <view class="chart-area-demo__row">
          <text class="chart-area-demo__label">网格线</text>
          <lk-switch v-model="showGrid" />
        </view>
        <view class="chart-area-demo__row">
          <text class="chart-area-demo__label">X 轴标签</text>
          <lk-switch v-model="showXAxisLabel" />
        </view>
        <view class="chart-area-demo__row chart-area-demo__row--slider">
          <text class="chart-area-demo__label">高度 {{ chartHeight }}rpx</text>
          <lk-slider v-model="chartHeight" :min="220" :max="480" :step="20" show-value />
        </view>
        <view class="chart-area-demo__row chart-area-demo__row--slider">
          <text class="chart-area-demo__label">线宽 {{ lineWidth }}rpx</text>
          <lk-slider v-model="lineWidth" :min="2" :max="12" :step="1" show-value />
        </view>
        <view class="chart-area-demo__actions">
          <lk-button size="sm" @click="randomize">随机更新数据</lk-button>
          <lk-button size="sm" variant="outline" @click="resetConfig">重置</lk-button>
        </view>
      </view>
    </demo-block>

    <demo-block title="边界数据">
      <view class="chart-area-demo__edge-grid">
        <view class="chart-area-demo__edge-card">
          <text class="chart-area-demo__edge-title">平稳数据</text>
          <lk-chart-area
            :data="flatTrend"
            :height="180"
            :tooltip="false"
            :show-grid="false"
            :effect="LiteChartEffect.Subtle"
          />
        </view>
        <view class="chart-area-demo__edge-card">
          <text class="chart-area-demo__edge-title">单点数据</text>
          <lk-chart-area
            :data="singleTrend"
            :height="180"
            :tooltip="false"
            :show-grid="false"
            :effect="LiteChartEffect.None"
          />
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

.chart-area-demo {
  &__panel,
  &__controls,
  &__edge-card {
    border-radius: var(--lk-radius-lg);
    background: var(--lk-bg-container);
    box-shadow: var(--lk-shadow-sm);
  }

  &__panel {
    padding: 28rpx 24rpx 18rpx;
  }

  &__summary,
  &__row,
  &__actions,
  &__edge-grid {
    display: flex;
    align-items: center;
  }

  &__summary,
  &__row,
  &__actions {
    justify-content: space-between;
    gap: 24rpx;
  }

  &__summary {
    margin-bottom: 12rpx;
  }

  &__summary-side {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6rpx;
    font-size: var(--lk-font-size-sm);
    color: var(--lk-text-secondary);
  }

  &__eyebrow {
    display: block;
    font-size: var(--lk-font-size-xs);
    color: var(--lk-text-secondary);
  }

  &__value {
    display: block;
    margin-top: 4rpx;
    font-size: 48rpx;
    line-height: 1;
    font-weight: 700;
    color: var(--lk-text-primary);
  }

  &__delta {
    color: var(--lk-color-success);
    font-weight: 600;

    &.is-negative {
      color: var(--lk-color-danger);
    }
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
    padding: 18rpx 0 20rpx;
  }

  &__label {
    flex: 0 0 auto;
    font-size: var(--lk-font-size-base);
    color: var(--lk-text-primary);
  }

  &__actions {
    padding-top: 24rpx;
    justify-content: flex-start;
  }

  &__edge-grid {
    align-items: stretch;
    gap: 20rpx;
  }

  &__edge-card {
    flex: 1;
    min-width: 0;
    padding: 20rpx 12rpx 8rpx;
  }

  &__edge-title {
    display: block;
    margin: 0 8rpx 8rpx;
    font-size: var(--lk-font-size-sm);
    color: var(--lk-text-secondary);
  }
}
</style>
