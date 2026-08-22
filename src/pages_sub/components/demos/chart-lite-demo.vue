<script setup lang="ts">
import { computed, ref } from 'vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkChartRadarLite from '@/uni_modules/lucky-ui/components/lk-chart-radar-lite/lk-chart-radar-lite.vue';
import LkChartRing from '@/uni_modules/lucky-ui/components/lk-chart-ring/lk-chart-ring.vue';
import LkChartSparkline from '@/uni_modules/lucky-ui/components/lk-chart-sparkline/lk-chart-sparkline.vue';
import LkChartStatCard from '@/uni_modules/lucky-ui/components/lk-chart-stat-card/lk-chart-stat-card.vue';
import LkSegmented from '@/uni_modules/lucky-ui/components/lk-segmented/lk-segmented.vue';
import LkSlider from '@/uni_modules/lucky-ui/components/lk-slider/lk-slider.vue';
import LkSwitch from '@/uni_modules/lucky-ui/components/lk-switch/lk-switch.vue';
import { usePreviewQuery } from '@/composables/usePreviewQuery';
import {
  buildBrandPalette,
  resolveBrandBaseColor,
} from '@/uni_modules/lucky-ui/utils/chart-colors';
import {
  LiteChartEffect,
  type LiteChartEffect as LiteChartEffectValue,
  type LiteChartPoint,
} from '@/uni_modules/lucky-ui/core/src/chart';
import type { RadarLiteItem } from '@/uni_modules/lucky-ui/components/lk-chart-radar-lite/chart-radar-lite.props';
import type { RingChartSegment } from '@/uni_modules/lucky-ui/components/lk-chart-ring/chart-ring.props';

const edgeMode = ref(false);
usePreviewQuery(['edge'], value => {
  edgeMode.value = value === '1' || value === 'true' || value === 'boundary';
});

const sparkLineWidth = ref(5);
const ringStrokeWidth = ref(26);
const radarLineWidth = ref(2);
const animationDuration = ref(680);
const animationRepeat = ref(1);
const chartEffect = ref<LiteChartEffectValue>(LiteChartEffect.Premium);
const chartColor = ref('primary');
const showSparkArea = ref(true);
const showChartPoint = ref(true);
const showRadarLabel = ref(true);
const previewKey = ref(0);

type ChartColorOption = {
  label: string;
  value: string;
  swatch: string;
  ring: string[];
};

const colorOptions: ChartColorOption[] = [
  { label: '品牌', value: 'primary', swatch: 'var(--lk-color-primary)', ring: [] },
  { label: '湖蓝', value: '#2563eb', swatch: '#2563eb', ring: ['#2563eb', '#38bdf8', '#1d4ed8'] },
  { label: '松绿', value: '#0f766e', swatch: '#0f766e', ring: ['#0f766e', '#14b8a6', '#115e59'] },
  { label: '莓红', value: '#be123c', swatch: '#be123c', ring: ['#be123c', '#fb7185', '#9f1239'] },
];

const effectOptions = [
  { label: '无', value: LiteChartEffect.None },
  { label: '轻', value: LiteChartEffect.Subtle },
  { label: '强', value: LiteChartEffect.Premium },
];

const repeatOptions = [
  { label: '一次', value: 1 },
  { label: '3 次', value: 3 },
  { label: '循环', value: 0 },
];

const repeatText = computed(() =>
  animationRepeat.value <= 0 ? '循环' : `${animationRepeat.value} 次`
);
const activeColorOption = computed(
  () => colorOptions.find(item => item.value === chartColor.value) ?? colorOptions[0]
);
const chartColorValue = computed(() => activeColorOption.value.value);
const primaryRingColors = computed(() => {
  const palette = buildBrandPalette(resolveBrandBaseColor());
  return [palette.brand600, palette.brand400, palette.brand700];
});

function replayCharts() {
  previewKey.value += 1;
}

function selectChartColor(value: string) {
  chartColor.value = value;
}

function resetConfig() {
  sparkLineWidth.value = 5;
  ringStrokeWidth.value = 26;
  radarLineWidth.value = 2;
  animationDuration.value = 680;
  animationRepeat.value = 1;
  chartEffect.value = LiteChartEffect.Premium;
  chartColor.value = 'primary';
  showSparkArea.value = true;
  showChartPoint.value = true;
  showRadarLabel.value = true;
  replayCharts();
}

const steps: LiteChartPoint[] = [
  { label: 'Mon', value: 6800 },
  { label: 'Tue', value: 7600 },
  { label: 'Wed', value: 7300 },
  { label: 'Thu', value: 9100 },
  { label: 'Fri', value: 10200 },
  { label: 'Sat', value: 11800 },
  { label: 'Sun', value: 12600 },
];

const sleep: LiteChartPoint[] = [
  { label: 'Mon', value: 6.8 },
  { label: 'Tue', value: 7.2 },
  { label: 'Wed', value: 6.4 },
  { label: 'Thu', value: 7.8 },
  { label: 'Fri', value: 7.6 },
  { label: 'Sat', value: 8.1 },
  { label: 'Sun', value: 7.9 },
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

const activitySegments: RingChartSegment[] = [
  { label: 'Move', value: 52 },
  { label: 'Exercise', value: 28 },
  { label: 'Stand', value: 20 },
];

const coloredActivitySegments = computed<RingChartSegment[]>(() => {
  const ringColors =
    chartColorValue.value === 'primary' ? primaryRingColors.value : activeColorOption.value.ring;
  return activitySegments.map((item, index) => ({
    ...item,
    color: ringColors[index % ringColors.length],
  }));
});

const wellness: RadarLiteItem[] = [
  { label: '睡眠', value: 88 },
  { label: '活力', value: 76 },
  { label: '专注', value: 82 },
  { label: '恢复', value: 72 },
  { label: '压力', value: 62 },
  { label: '运动', value: 91 },
];

const edgeFlatTrend: LiteChartPoint[] = [
  { label: 'Flat A', value: 42 },
  { label: 'Flat B', value: 42 },
  { label: 'Flat C', value: 42 },
];

const edgeInvalidTrend: LiteChartPoint[] = [
  { label: 'Bad', value: Number.NaN },
  { label: 'Low', value: -24 },
  { label: 'High', value: 96 },
];

const edgeSingleTrend: LiteChartPoint[] = [{ label: 'Only', value: 8 }];

const edgeZeroSegments: RingChartSegment[] = [
  { label: 'Zero A', value: 0 },
  { label: 'Zero B', value: Number.NaN },
];

const edgeTinySegments: RingChartSegment[] = [
  { label: 'Tiny', value: 1 },
  { label: 'Large', value: 999 },
];

const edgeRadar: RadarLiteItem[] = [
  { label: ' Sleep ', value: 72, max: Number.NaN },
  { label: 'Recovery', value: -18, max: 100 },
  { label: 'Focus', value: 160, max: 100 },
  { label: '', value: 50 },
  { label: 'Invalid', value: Number.NaN },
];

const edgeShortRadar: RadarLiteItem[] = [
  { label: 'One', value: 60 },
  { label: 'Two', value: 80 },
];
</script>

<template>
  <view class="component-demo">
    <template v-if="edgeMode">
      <demo-block title="ChartLite Boundary Runtime">
        <view class="edge-grid">
          <view class="edge-card edge-stat-long">
            <lk-chart-stat-card
              title="Extremely long KPI title should stay bounded"
              value="123,456,789,012"
              unit="very-long-unit"
              description="Long descriptions should remain readable without pushing the chart out."
              trend="up"
              trend-text="+123456789%"
              :data="edgeFlatTrend"
              :chart-height="96"
            />
          </view>

          <view class="edge-card edge-spark-single">
            <text class="edge-title">Sparkline single point</text>
            <lk-chart-sparkline
              :data="edgeSingleTrend"
              :height="120"
              :padding="18"
              :animation-duration="220"
            />
          </view>

          <view class="edge-card edge-spark-invalid">
            <text class="edge-title">Sparkline invalid values</text>
            <lk-chart-sparkline
              :data="edgeInvalidTrend"
              :height="120"
              :padding="18"
              :animation-duration="220"
            />
          </view>

          <view class="edge-card edge-ring-zero">
            <text class="edge-title">Ring all zero</text>
            <lk-chart-ring
              :segments="edgeZeroSegments"
              :height="180"
              :stroke-width="22"
              :animation-duration="220"
            />
          </view>

          <view class="edge-card edge-ring-tiny">
            <text class="edge-title">Ring tiny segment</text>
            <lk-chart-ring
              :segments="edgeTinySegments"
              :height="180"
              :stroke-width="22"
              :animation-duration="220"
            />
          </view>

          <view class="edge-card edge-ring-invalid">
            <text class="edge-title">Ring invalid max</text>
            <lk-chart-ring
              :value="Number.NaN"
              :max="Number.NaN"
              :height="180"
              :stroke-width="22"
              :animation-duration="220"
            />
          </view>

          <view class="edge-card edge-radar-invalid">
            <text class="edge-title">Radar invalid values</text>
            <lk-chart-radar-lite
              :data="edgeRadar"
              :height="220"
              :padding="36"
              :levels="Number.NaN"
              :animation-duration="220"
            />
          </view>

          <view class="edge-card edge-radar-short">
            <text class="edge-title">Radar short data</text>
            <lk-chart-radar-lite
              :data="edgeShortRadar"
              :height="220"
              :padding="160"
              :animation-duration="220"
            />
          </view>
        </view>
      </demo-block>
    </template>

    <template v-else>
      <demo-block title="ChartLite 参数面板">
        <view class="config-panel">
          <view class="config-row">
            <text class="config-label">图表颜色</text>
            <view class="color-swatches">
              <view
                v-for="item in colorOptions"
                :key="item.value"
                class="color-swatch"
                :class="{ 'is-active': chartColor === item.value }"
                @tap="selectChartColor(item.value)"
              >
                <view class="color-swatch__dot" :style="{ background: item.swatch }" />
                <text class="color-swatch__label">{{ item.label }}</text>
              </view>
            </view>
          </view>
          <view class="config-row">
            <text class="config-label">动效强度</text>
            <lk-segmented v-model="chartEffect" :options="effectOptions" size="sm" block />
          </view>
          <view class="config-row">
            <text class="config-label">入场次数: {{ repeatText }}</text>
            <lk-segmented v-model="animationRepeat" :options="repeatOptions" size="sm" block />
          </view>
          <view class="config-row">
            <text class="config-label">动画时长: {{ animationDuration }}ms</text>
            <view class="config-slider">
              <lk-slider v-model="animationDuration" :min="0" :max="1600" :step="80" show-value />
            </view>
          </view>
          <view class="config-row">
            <text class="config-label">趋势线宽: {{ sparkLineWidth }}rpx</text>
            <view class="config-slider">
              <lk-slider v-model="sparkLineWidth" :min="2" :max="14" :step="1" show-value />
            </view>
          </view>
          <view class="config-row">
            <text class="config-label">环图厚度: {{ ringStrokeWidth }}rpx</text>
            <view class="config-slider">
              <lk-slider v-model="ringStrokeWidth" :min="12" :max="42" :step="2" show-value />
            </view>
          </view>
          <view class="config-row">
            <text class="config-label">雷达描边: {{ radarLineWidth }}rpx</text>
            <view class="config-slider">
              <lk-slider v-model="radarLineWidth" :min="1" :max="8" :step="1" show-value />
            </view>
          </view>
          <view class="config-switches">
            <view class="config-switch">
              <text class="config-label">面积</text>
              <lk-switch v-model="showSparkArea" />
            </view>
            <view class="config-switch">
              <text class="config-label">顶点</text>
              <lk-switch v-model="showChartPoint" />
            </view>
            <view class="config-switch">
              <text class="config-label">雷达标签</text>
              <lk-switch v-model="showRadarLabel" />
            </view>
          </view>
          <view class="config-actions">
            <lk-button size="sm" @click="replayCharts">重播</lk-button>
            <lk-button size="sm" variant="outline" @click="resetConfig">重置</lk-button>
          </view>
        </view>
      </demo-block>

      <demo-block title="Apple 风格指标卡" desc="轻量趋势线 + 指标摘要，适合首页、健康、财务卡片。">
        <view class="stat-grid">
          <view class="stat-item">
            <lk-chart-stat-card
              :key="`steps-${previewKey}`"
              title="今日步数"
              value="12,680"
              unit="steps"
              description="比上周同日更活跃"
              trend="up"
              trend-text="+18%"
              :data="steps"
              :chart-line-width="sparkLineWidth"
              :chart-animation-duration="animationDuration"
              :chart-animation-repeat="animationRepeat"
              :chart-effect="chartEffect"
              :color="chartColorValue"
            />
          </view>
          <view class="stat-item">
            <lk-chart-stat-card
              :key="`sleep-${previewKey}`"
              title="睡眠"
              value="7.9"
              unit="h"
              description="深睡占比稳定"
              trend="flat"
              trend-text="稳定"
              :data="sleep"
              :chart-line-width="sparkLineWidth"
              :chart-animation-duration="animationDuration"
              :chart-animation-repeat="animationRepeat"
              :chart-effect="chartEffect"
              :color="chartColorValue"
            />
          </view>
        </view>
      </demo-block>

      <demo-block title="Sparkline 迷你趋势">
        <view class="spark-panel">
          <view class="spark-copy">
            <text class="spark-title">净收入趋势</text>
            <text class="spark-value">¥71k</text>
            <text class="spark-desc">去掉坐标轴，仅保留趋势和末端高亮。</text>
          </view>
          <lk-chart-sparkline
            :key="`spark-${previewKey}`"
            :data="revenue"
            :height="160"
            :padding="16"
            :line-width="sparkLineWidth"
            :area="showSparkArea"
            :show-end-point="showChartPoint"
            :animation-duration="animationDuration"
            :animation-repeat="animationRepeat"
            :effect="chartEffect"
            :color="chartColorValue"
          />
        </view>
      </demo-block>

      <demo-block title="Ring 轻量环图">
        <view class="ring-card">
          <view class="ring-chart">
            <lk-chart-ring
              :key="`ring-${previewKey}`"
              title="92%"
              subtitle="Activity"
              :segments="coloredActivitySegments"
              :height="260"
              :stroke-width="ringStrokeWidth"
              :animation-duration="animationDuration"
              :animation-repeat="animationRepeat"
              :effect="chartEffect"
            />
          </view>
          <view class="ring-list">
            <view v-for="item in coloredActivitySegments" :key="item.label" class="ring-row">
              <view class="ring-label-wrap">
                <view
                  class="ring-dot"
                  :style="{ background: item.color || 'var(--lk-color-primary)' }"
                />
                <text class="ring-label">{{ item.label }}</text>
              </view>
              <text class="ring-value">{{ item.value }}%</text>
            </view>
          </view>
        </view>
      </demo-block>

      <demo-block title="RadarLite 能力雷达">
        <view class="radar-card">
          <view class="radar-chart">
            <lk-chart-radar-lite
              :key="`radar-${previewKey}`"
              :data="wellness"
              :height="320"
              :line-width="radarLineWidth"
              :show-label="showRadarLabel"
              :show-point="showChartPoint"
              :animation-duration="animationDuration"
              :animation-repeat="animationRepeat"
              :effect="chartEffect"
              :color="chartColorValue"
            />
          </view>
          <view class="radar-copy">
            <text class="spark-title">Wellness Score</text>
            <text class="spark-value">82</text>
            <text class="spark-desc">适合健康维度、能力模型、评分分布等移动端轻量展示。</text>
          </view>
        </view>
      </demo-block>
    </template>
  </view>
</template>

<style scoped lang="scss">
.component-demo {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 32rpx;
  }
}

.stat-grid {
  display: flex;
  > :not(:first-child) {
    margin-left: var(--lk-spacing-md);
  }
}

.stat-item {
  flex: 1;
  min-width: 0;
}

.config-panel {
  display: flex;
  flex-direction: column;
  padding: var(--lk-spacing-md);
  border: var(--lk-rpx-2) solid var(--lk-color-border-light);
  border-radius: var(--lk-radius-lg);
  background: var(--lk-bg-container);

  > :not(:first-child) {
    margin-top: var(--lk-spacing-md);
  }
}

.config-row {
  min-width: 0;
  display: flex;
  flex-direction: column;

  > :not(:first-child) {
    margin-top: var(--lk-spacing-xs);
  }
}

.config-label {
  color: var(--lk-text-secondary);
  font-size: var(--lk-font-size-sm);
  font-weight: 700;
}

.config-slider {
  min-width: 0;
  padding-top: var(--lk-rpx-36);
}

.color-swatches {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--lk-spacing-xs);
}

.color-swatch {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--lk-rpx-10) var(--lk-spacing-xs);
  border: var(--lk-rpx-2) solid var(--lk-color-border-light);
  border-radius: var(--lk-radius-md);
  background: var(--lk-fill-1);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;

  > :not(:first-child) {
    margin-left: var(--lk-rpx-8);
  }
}

.color-swatch.is-active {
  border-color: var(--lk-color-primary);
  box-shadow: 0 0 0 var(--lk-rpx-4) var(--lk-color-primary-soft);
  transform: translateY(-2rpx);
}

.color-swatch__dot {
  flex: none;
  width: var(--lk-rpx-24);
  height: var(--lk-rpx-24);
  border-radius: 50%;
  box-shadow: inset 0 0 0 var(--lk-rpx-2) rgba(255, 255, 255, 0.56);
}

.color-swatch__label {
  min-width: 0;
  color: var(--lk-text-secondary);
  font-size: var(--lk-font-size-xs);
  font-weight: 700;
  line-height: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.config-switches {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--lk-spacing-sm);
}

.config-switch {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--lk-spacing-xs) var(--lk-spacing-sm);
  border: var(--lk-rpx-2) solid var(--lk-color-border-light);
  border-radius: var(--lk-radius-md);
  background: var(--lk-fill-1);

  > :not(:first-child) {
    margin-left: var(--lk-spacing-xs);
  }
}

.config-actions {
  display: flex;
  justify-content: flex-end;

  > :not(:first-child) {
    margin-left: var(--lk-spacing-sm);
  }
}

.spark-panel,
.radar-card,
.ring-card {
  padding: var(--lk-spacing-lg);
  border: var(--lk-rpx-2) solid var(--lk-color-border-light);
  border-radius: var(--lk-radius-xl);
  background: var(--lk-bg-container);
  box-shadow: var(--lk-shadow-sm);
  animation: chart-lite-card-in 420ms ease-out both;
}

.spark-copy {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: var(--lk-rpx-8);
  }
  margin-bottom: var(--lk-spacing-md);
}

.spark-title,
.spark-desc,
.ring-label {
  color: var(--lk-text-secondary);
  font-size: var(--lk-font-size-sm);
}

.spark-value {
  color: var(--lk-text-primary);
  font-size: var(--lk-rpx-48);
  font-weight: 800;
  line-height: 1;
}

.ring-card {
  display: flex;
  align-items: center;
  > :not(:first-child) {
    margin-left: var(--lk-spacing-lg);
  }
  animation-delay: 120ms;
}

.radar-card {
  display: flex;
  align-items: center;
  > :not(:first-child) {
    margin-left: var(--lk-spacing-lg);
  }
  animation-delay: 180ms;
}

.spark-panel {
  animation-delay: 40ms;
}

.ring-chart {
  flex: none;
  width: 280rpx;
  height: 260rpx;
}

.radar-chart {
  flex: none;
  width: 340rpx;
  height: 320rpx;
}

.radar-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: var(--lk-rpx-8);
  }
}

.ring-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: var(--lk-spacing-sm);
  }
}

.ring-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--lk-spacing-xs);
  border-bottom: var(--lk-rpx-2) solid var(--lk-color-border-light);
  animation: chart-lite-fade-up 520ms ease-out both;

  > :not(:first-child) {
    margin-left: var(--lk-spacing-sm);
  }
}

.ring-label-wrap {
  min-width: 0;
  display: flex;
  align-items: center;

  > :not(:first-child) {
    margin-left: var(--lk-rpx-8);
  }
}

.ring-dot {
  flex: none;
  width: var(--lk-rpx-14);
  height: var(--lk-rpx-14);
  border-radius: 50%;
}

.ring-row:nth-child(1) {
  animation-delay: 240ms;
}

.ring-row:nth-child(2) {
  animation-delay: 320ms;
}

.ring-row:nth-child(3) {
  animation-delay: 400ms;
}

.ring-value {
  color: var(--lk-text-primary);
  font-size: var(--lk-font-size-sm);
  font-weight: 700;
}

.edge-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--lk-spacing-md);
}

.edge-card {
  min-width: 0;
  padding: var(--lk-spacing-md);
  border: var(--lk-rpx-2) solid var(--lk-color-border-light);
  border-radius: var(--lk-radius-lg);
  background: var(--lk-bg-container);
}

.edge-title {
  display: block;
  margin-bottom: var(--lk-spacing-sm);
  color: var(--lk-text-secondary);
  font-size: var(--lk-font-size-sm);
  font-weight: 700;
}

@keyframes chart-lite-card-in {
  0% {
    opacity: 0;
    transform: translateY(var(--lk-rpx-18)) scale(0.98);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes chart-lite-fade-up {
  0% {
    opacity: 0;
    transform: translateY(var(--lk-rpx-10));
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
