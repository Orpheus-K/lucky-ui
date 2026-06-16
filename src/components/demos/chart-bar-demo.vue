<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import LkChartBar from '@/uni_modules/lucky-ui/components/lk-chart-bar/lk-chart-bar.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkSlider from '@/uni_modules/lucky-ui/components/lk-slider/lk-slider.vue';
import LkSwitch from '@/uni_modules/lucky-ui/components/lk-switch/lk-switch.vue';
import LkSegmented from '@/uni_modules/lucky-ui/components/lk-segmented/lk-segmented.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';

type Item = { label: string; value: number; color?: string };

const dataset = ref<'week' | 'tiny' | 'colorful'>('week');
const options = [
  { label: '一周', value: 'week' },
  { label: '极小值', value: 'tiny' },
  { label: '渠道', value: 'colorful' },
];

const week = ref<Item[]>([
  { label: 'Mon', value: 24 },
  { label: 'Tue', value: 12 },
  { label: 'Wed', value: 36 },
  { label: 'Thu', value: 18 },
  { label: 'Fri', value: 42 },
  { label: 'Sat', value: 8 },
  { label: 'Sun', value: 28 },
]);

const tiny = ref<Item[]>([
  { label: 'A', value: 1 },
  { label: 'B', value: 0.4 },
  { label: 'C', value: 2 },
  { label: 'D', value: 0.8 },
  { label: 'E', value: 1.2 },
]);

const colorful = ref<Item[]>([
  { label: 'iOS', value: 38 },
  { label: 'Android', value: 44 },
  { label: 'H5', value: 22 },
  { label: 'MP', value: 30 },
]);

const tooltip = ref(true);
const tooltipAlways = ref(false);
const autoTooltip = ref(false);
const autoTooltipInterval = ref(900);
const duration = ref(600);
const padding = ref(24);
const radius = ref(18);
const maxBarWidth = ref(40);

const gradient = ref(true);
const showAxis = ref(false);
const yAxisTicks = ref(4);
const yAxisAutoScale = ref(true);
const showXAxisLabel = ref(false);
const highlightPulse = ref(true);

const data = computed(() => {
  if (dataset.value === 'tiny') return tiny.value;
  if (dataset.value === 'colorful') return colorful.value;
  return week.value;
});

function randomize() {
  const next = data.value.map(it => ({ ...it, value: Math.round(Math.random() * 50) + 1 }));
  if (dataset.value === 'tiny') tiny.value = next;
  else if (dataset.value === 'colorful') colorful.value = next;
  else week.value = next;
}

function reset() {
  dataset.value = 'week';
  tooltip.value = true;
  tooltipAlways.value = false;
  autoTooltip.value = false;
  autoTooltipInterval.value = 900;
  duration.value = 600;
  padding.value = 24;
  radius.value = 18;
  maxBarWidth.value = 40;
  gradient.value = true;
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
    radius.value,
    maxBarWidth.value,
    gradient.value,
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
    <demo-block title="ChartBar 柱状图" desc="圆角顶部 + 渐变填充 + 触摸 Tooltip + RAF 丝滑动画">
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
            <lk-slider v-model="duration" :min="0" :max="1200" :step="50" show-value />
          </view>
        </view>
        <view class="row">
          <text class="label">Padding: {{ padding }}rpx</text>
          <view class="slider">
            <lk-slider v-model="padding" :min="0" :max="48" :step="2" show-value />
          </view>
        </view>
        <view class="row">
          <text class="label">圆角: {{ radius }}rpx</text>
          <view class="slider">
            <lk-slider v-model="radius" :min="0" :max="30" :step="1" show-value />
          </view>
        </view>
        <view class="row">
          <text class="label">最大柱宽: {{ maxBarWidth }}rpx</text>
          <view class="slider">
            <lk-slider v-model="maxBarWidth" :min="0" :max="80" :step="2" show-value />
          </view>
        </view>
        <view class="row">
          <text class="label">渐变</text>
          <lk-switch v-model="gradient" />
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
            <text class="eyebrow">Mobile Analytics</text>
            <text class="metric">42k</text>
          </view>
          <text class="trend">+12.8%</text>
        </view>
        <view class="chart-wrap">
          <lk-chart-bar
            :data="data"
            :height="360"
            :tooltip="tooltip"
            :tooltip-always="tooltipAlways"
            :auto-tooltip="autoTooltip"
            :auto-tooltip-interval="autoTooltipInterval"
            :animation-duration="duration"
            :padding="padding"
            :bar-radius="radius"
            :gradient="gradient"
            :max-bar-width="maxBarWidth"
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
