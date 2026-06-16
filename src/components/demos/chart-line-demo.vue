<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import LkChartLine from '@/uni_modules/lucky-ui/components/lk-chart-line/lk-chart-line.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkSlider from '@/uni_modules/lucky-ui/components/lk-slider/lk-slider.vue';
import LkSwitch from '@/uni_modules/lucky-ui/components/lk-switch/lk-switch.vue';
import LkSegmented from '@/uni_modules/lucky-ui/components/lk-segmented/lk-segmented.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';

type Point = { label: string; value: number };

const dataset = ref<'day' | 'wave' | 'spike'>('day');
const options = [
  { label: '日趋势', value: 'day' },
  { label: '平滑波动', value: 'wave' },
  { label: '尖峰', value: 'spike' },
];

const day = ref<Point[]>([
  { label: '00:00', value: 12 },
  { label: '04:00', value: 18 },
  { label: '08:00', value: 22 },
  { label: '12:00', value: 16 },
  { label: '16:00', value: 28 },
  { label: '20:00', value: 24 },
  { label: '24:00', value: 20 },
]);
const wave = ref<Point[]>(
  Array.from({ length: 16 }, (_, i) => ({ label: `${i}`, value: 18 + Math.sin(i / 2) * 6 }))
);
const spike = ref<Point[]>([
  { label: '1', value: 8 },
  { label: '2', value: 9 },
  { label: '3', value: 10 },
  { label: '4', value: 28 },
  { label: '5', value: 12 },
  { label: '6', value: 11 },
  { label: '7', value: 26 },
  { label: '8', value: 13 },
]);

const tooltip = ref(true);
const tooltipAlways = ref(false);
const autoTooltip = ref(false);
const autoTooltipInterval = ref(900);
const duration = ref(700);
const padding = ref(24);
const lineWidth = ref(6);

const gradient = ref(false);
const areaGradient = ref(false);
const showAxis = ref(false);
const yAxisTicks = ref(4);
const yAxisAutoScale = ref(true);
const showXAxisLabel = ref(false);
const highlightPulse = ref(true);

const data = computed(() => {
  if (dataset.value === 'wave') return wave.value;
  if (dataset.value === 'spike') return spike.value;
  return day.value;
});

function randomize() {
  const next = data.value.map(it => ({ ...it, value: Math.round(Math.random() * 30) + 5 }));
  if (dataset.value === 'wave') wave.value = next;
  else if (dataset.value === 'spike') spike.value = next;
  else day.value = next;
}

function reset() {
  dataset.value = 'day';
  tooltip.value = true;
  tooltipAlways.value = false;
  autoTooltip.value = false;
  autoTooltipInterval.value = 900;
  duration.value = 700;
  padding.value = 24;
  lineWidth.value = 6;
  gradient.value = false;
  areaGradient.value = false;
  showAxis.value = false;
  yAxisTicks.value = 4;
  yAxisAutoScale.value = true;
  showXAxisLabel.value = false;
  highlightPulse.value = true;
}

watch(
  () => [
    dataset.value,
    tooltip.value,
    tooltipAlways.value,
    autoTooltip.value,
    autoTooltipInterval.value,
    duration.value,
    padding.value,
    lineWidth.value,
    gradient.value,
    areaGradient.value,
    showAxis.value,
    yAxisTicks.value,
    yAxisAutoScale.value,
    showXAxisLabel.value,
    highlightPulse.value,
  ],
  () => randomize()
);
</script>

<template>
  <view class="component-demo">
    <demo-block title="ChartLine 折线图" desc="平滑贝塞尔曲线 + 触摸 Tooltip 跟随 + RAF 动画">
      <view class="panel">
        <view class="row">
          <text class="label">数据集</text>
          <lk-segmented v-model="dataset" :options="options" size="sm" />
        </view>
        <view class="row">
          <text class="label">Tooltip</text>
          <lk-switch v-model="tooltip" />
        </view>
        <view class="row">
          <text class="label">常驻 Tooltip</text>
          <lk-switch v-model="tooltipAlways" :disabled="!tooltip" />
        </view>
        <view class="row">
          <text class="label">轮播 Tooltip</text>
          <lk-switch v-model="autoTooltip" :disabled="!tooltip" />
        </view>
        <view class="row row--slider">
          <text class="label">轮播间隔: {{ autoTooltipInterval }}ms</text>
          <view class="slider">
            <lk-slider
              v-model="autoTooltipInterval"
              :min="300"
              :max="3000"
              :step="50"
              show-value
              :disabled="!tooltip || !autoTooltip"
            />
          </view>
        </view>
        <view class="row">
          <text class="label">动画时长: {{ duration }}ms</text>
          <view class="slider">
            <lk-slider v-model="duration" :min="0" :max="1400" :step="50" show-value />
          </view>
        </view>
        <view class="row">
          <text class="label">Padding: {{ padding }}rpx</text>
          <view class="slider">
            <lk-slider v-model="padding" :min="0" :max="48" :step="2" show-value />
          </view>
        </view>
        <view class="row">
          <text class="label">线宽: {{ lineWidth }}rpx</text>
          <view class="slider">
            <lk-slider v-model="lineWidth" :min="2" :max="14" :step="1" show-value />
          </view>
        </view>
        <view class="row">
          <text class="label">线渐变</text>
          <lk-switch v-model="gradient" />
        </view>
        <view class="row">
          <text class="label">面积渐变</text>
          <lk-switch v-model="areaGradient" />
        </view>
        <view class="row">
          <text class="label">坐标轴/网格</text>
          <lk-switch v-model="showAxis" />
        </view>
        <view class="row">
          <text class="label">Y 轴自适应</text>
          <lk-switch v-model="yAxisAutoScale" :disabled="!showAxis" />
        </view>
        <view class="row">
          <text class="label">Y 轴刻度: {{ yAxisTicks }}</text>
          <view class="slider">
            <lk-slider
              v-model="yAxisTicks"
              :min="2"
              :max="8"
              :step="1"
              show-value
              :disabled="!showAxis"
            />
          </view>
        </view>
        <view class="row">
          <text class="label">X 轴标签</text>
          <lk-switch v-model="showXAxisLabel" />
        </view>
        <view class="row">
          <text class="label">高亮脉冲</text>
          <lk-switch v-model="highlightPulse" />
        </view>
        <view class="btns">
          <lk-button size="sm" @click="randomize">随机更新数据</lk-button>
          <lk-button size="sm" variant="outline" @click="reset">重置参数</lk-button>
        </view>
      </view>

      <view class="chart-card">
        <view class="chart-card__head">
          <view>
            <text class="eyebrow">Energy Trend</text>
            <text class="metric">86</text>
          </view>
          <text class="trend">Live</text>
        </view>
        <view class="chart-wrap">
          <lk-chart-line
            :data="data"
            :height="360"
            :tooltip="tooltip"
            :tooltip-always="tooltipAlways"
            :auto-tooltip="autoTooltip"
            :auto-tooltip-interval="autoTooltipInterval"
            :animation-duration="duration"
            :padding="padding"
            :line-width="lineWidth"
            :gradient="gradient"
            :area-gradient="areaGradient"
            :show-axis="showAxis"
            :y-axis-ticks="yAxisTicks"
            :y-axis-auto-scale="yAxisAutoScale"
            :show-x-axis-label="showXAxisLabel"
            :highlight-pulse="highlightPulse"
          />
        </view>
      </view>
    </demo-block>
  </view>
</template>

<style scoped lang="scss">
.component-demo {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: var(--lk-spacing-lg);
  }
}

.panel {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: var(--lk-spacing-md);
  }
  padding: var(--lk-spacing-lg);
  background: var(--lk-chart-card-bg);
  border: var(--lk-rpx-2) solid var(--lk-chart-card-border);
  border-radius: var(--lk-radius-xl);
  box-shadow: var(--lk-chart-card-shadow);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  > :not(:first-child) {
    margin-left: var(--lk-spacing-md);
  }
}

.row--slider {
  align-items: flex-start;
}

.slider {
  flex: 1;
  width: 420rpx;
}

.label {
  font-size: var(--lk-font-size-sm);
  color: var(--lk-chart-label);
  flex: 0 0 auto;
}

.btns {
  display: flex;
  > :not(:first-child) {
    margin-left: var(--lk-spacing-md);
  }
}

.chart-card {
  padding: var(--lk-spacing-lg);
  background: var(--lk-chart-card-bg);
  border: var(--lk-rpx-2) solid var(--lk-chart-card-border);
  border-radius: var(--lk-radius-xl);
  box-shadow: var(--lk-chart-card-shadow);
}

.chart-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  > :not(:first-child) {
    margin-left: var(--lk-spacing-md);
  }
  margin-bottom: var(--lk-spacing-md);
}

.eyebrow {
  display: block;
  color: var(--lk-chart-label);
  font-size: var(--lk-font-size-xs);
  line-height: 1.4;
}

.metric {
  display: block;
  margin-top: var(--lk-rpx-4);
  color: var(--lk-text-primary);
  font-size: var(--lk-rpx-48);
  font-weight: 800;
  line-height: 1;
}

.trend {
  padding: var(--lk-rpx-8) var(--lk-rpx-14);
  color: var(--lk-chart-primary);
  font-size: var(--lk-font-size-xs);
  font-weight: 700;
  background: var(--lk-chart-primary-soft);
  border-radius: var(--lk-radius-full);
}

.chart-wrap {
  padding-top: var(--lk-spacing-xs);
}
</style>
