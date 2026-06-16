<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import LkChartPie from '@/uni_modules/lucky-ui/components/lk-chart-pie/lk-chart-pie.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkSlider from '@/uni_modules/lucky-ui/components/lk-slider/lk-slider.vue';
import LkSwitch from '@/uni_modules/lucky-ui/components/lk-switch/lk-switch.vue';
import LkSegmented from '@/uni_modules/lucky-ui/components/lk-segmented/lk-segmented.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkInput from '@/uni_modules/lucky-ui/components/lk-input/lk-input.vue';

type Slice = { label: string; value: number; color?: string };

const dataset = ref<'traffic' | 'budget' | 'many'>('traffic');
const options = [
  { label: '流量来源', value: 'traffic' },
  { label: '预算占比', value: 'budget' },
  { label: '多扇区', value: 'many' },
];

const traffic = ref<Slice[]>([
  { label: 'Search', value: 42 },
  { label: 'Ads', value: 18 },
  { label: 'Direct', value: 26 },
  { label: 'Other', value: 14 },
]);

const budget = ref<Slice[]>([
  { label: 'R&D', value: 35 },
  { label: 'Market', value: 25 },
  { label: 'Ops', value: 18 },
  { label: 'Other', value: 22 },
]);

const many = ref<Slice[]>(
  Array.from({ length: 9 }, (_, i) => ({ label: `S${i + 1}`, value: 5 + i }))
);

const donut = ref(true);
const donutWidth = ref(30);
const tooltip = ref(true);
const tooltipAlways = ref(false);
const autoTooltip = ref(false);
const autoTooltipInterval = ref(900);
const duration = ref(700);
const padding = ref(24);

const showTrack = ref(true);
const showCenterText = ref(true);
const centerTitle = ref('Total');
const highlightPulse = ref(true);
const progressValue = ref(68);

const data = computed(() => {
  if (dataset.value === 'budget') return budget.value;
  if (dataset.value === 'many') return many.value;
  return traffic.value;
});

function randomize() {
  const next = data.value.map(it => ({ ...it, value: Math.round(Math.random() * 40) + 5 }));
  if (dataset.value === 'budget') budget.value = next;
  else if (dataset.value === 'many') many.value = next;
  else traffic.value = next;
}

function reset() {
  dataset.value = 'traffic';
  donut.value = true;
  donutWidth.value = 30;
  tooltip.value = true;
  tooltipAlways.value = false;
  autoTooltip.value = false;
  autoTooltipInterval.value = 900;
  duration.value = 700;
  padding.value = 24;
  showTrack.value = true;
  showCenterText.value = true;
  centerTitle.value = 'Total';
  highlightPulse.value = true;
  progressValue.value = 68;
}

const progressData = computed<Slice[]>(() => [
  { label: '完成', value: progressValue.value, color: '#6366f1' },
  {
    label: '剩余',
    value: Math.max(0, 100 - progressValue.value),
    color: 'rgba(148, 163, 184, 0.18)',
  },
]);

watch(
  () => [
    dataset.value,
    donut.value,
    donutWidth.value,
    tooltip.value,
    tooltipAlways.value,
    autoTooltip.value,
    autoTooltipInterval.value,
    duration.value,
    padding.value,
    showTrack.value,
    showCenterText.value,
    centerTitle.value,
    highlightPulse.value,
  ],
  () => randomize()
);
</script>

<template>
  <view class="component-demo">
    <demo-block
      title="ChartPie 饼/环图"
      desc="圆环端帽圆润（lineCap=round）+ 触摸 Tooltip + RAF 动画"
    >
      <view class="panel">
        <view class="row">
          <text class="label">数据集</text>
          <lk-segmented v-model="dataset" :options="options" size="sm" />
        </view>
        <view class="row">
          <text class="label">圆环模式</text>
          <lk-switch v-model="donut" />
        </view>
        <view class="row">
          <text class="label">厚度: {{ donutWidth }}rpx</text>
          <view class="slider">
            <lk-slider v-model="donutWidth" :min="10" :max="60" :step="2" show-value />
          </view>
        </view>
        <view class="row">
          <text class="label">底轨</text>
          <lk-switch v-model="showTrack" :disabled="!donut" />
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
          <text class="label">中心信息</text>
          <lk-switch v-model="showCenterText" />
        </view>
        <view class="row">
          <text class="label">中心标题</text>
          <lk-input v-model="centerTitle" :disabled="!showCenterText" placeholder="Title" />
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
            <text class="eyebrow">Budget Rings</text>
            <text class="metric">{{ centerTitle }}</text>
          </view>
          <text class="trend">Share</text>
        </view>
        <view class="chart-wrap">
          <lk-chart-pie
            :data="data"
            :height="360"
            :donut="donut"
            :donut-width="donutWidth"
            :tooltip="tooltip"
            :tooltip-always="tooltipAlways"
            :auto-tooltip="autoTooltip"
            :auto-tooltip-interval="autoTooltipInterval"
            :animation-duration="duration"
            :padding="padding"
            :show-track="showTrack"
            :show-center-text="showCenterText"
            :center-title="centerTitle"
            :highlight-pulse="highlightPulse"
          />
        </view>
      </view>

      <view class="chart-card">
        <view class="chart-card__head">
          <view>
            <text class="eyebrow">Single Progress</text>
            <text class="metric">{{ progressValue }}%</text>
          </view>
          <text class="trend">Progress</text>
        </view>
        <view class="row">
          <text class="label">进度</text>
          <view class="slider">
            <lk-slider v-model="progressValue" :min="0" :max="100" :step="1" show-value />
          </view>
        </view>
        <view class="chart-wrap">
          <lk-chart-pie
            :data="progressData"
            :height="260"
            :donut="true"
            :donut-width="24"
            :tooltip="false"
            :animation-duration="500"
            :show-track="false"
            center-title="完成度"
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
