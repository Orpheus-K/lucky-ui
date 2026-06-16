<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, onUnmounted, ref, watch } from 'vue';
import { useChartCanvas, type MaybeCanvas2DContext } from '../../composables/useChartCanvas';
import {
  formatLiteChartTooltipText,
  getLiteChartPositions,
  getNearestPointIndex,
  LiteChartEffect,
  oscillate,
} from '../../core/src/chart';
import {
  buildBrandPalette,
  resolveBrandBaseColor,
  rgbaFromColor,
  rgbaFromHex,
} from '../../utils/chart-colors';
import { chartSparklineEmits, chartSparklineProps } from './chart-sparkline.props';
import {
  areChartSparklineTooltipStatesEqual,
  CHART_SPARKLINE_EMPTY_TOOLTIP,
  getChartSparklineEffectStrength,
  resolveChartSparklineActiveIndex,
  resolveChartSparklineClass,
  resolveChartSparklineHeightStyle,
  resolveChartSparklineRootStyle,
  resolveChartSparklineTooltipState,
  resolveChartSparklineTooltipStyle,
} from './chart-sparkline.utils';

defineOptions({ name: 'LkChartSparkline' });

const props = defineProps(chartSparklineProps);
const emit = defineEmits(chartSparklineEmits);

let uidSeed = 0;
function uid(prefix: string) {
  uidSeed += 1;
  return `${prefix}-${Date.now()}-${uidSeed}`;
}

const wrapperId = computed(() => props.id || uid('lk-chart-sparkline'));
const canvasId = computed(() => `${wrapperId.value}__canvas`);
const hoverIndex = ref(-1);
const effectPhase = ref(0);
const tooltipState = ref(CHART_SPARKLINE_EMPTY_TOOLTIP);

const heightStyle = computed(() => resolveChartSparklineHeightStyle(props.height));

const rootStyle = computed<StyleValue>(() =>
  resolveChartSparklineRootStyle({
    heightStyle: heightStyle.value,
    customStyle: props.customStyle as StyleValue,
  })
);

const classes = computed(() =>
  resolveChartSparklineClass({
    tooltip: props.tooltip,
    customClass: props.customClass,
  })
);

const chart = useChartCanvas({
  wrapperId: wrapperId.value,
  canvasId: canvasId.value,
  autoSize: true,
});

const tooltipStyle = computed<StyleValue>(() =>
  resolveChartSparklineTooltipStyle(tooltipState.value)
);

function showTooltip(x: number, y: number, text: string, textWidth = text.length * 7) {
  const next = resolveChartSparklineTooltipState({
    x,
    y,
    text,
    textWidth,
    chartWidth: chart.size.value.width,
    px: chart.px,
  });
  if (areChartSparklineTooltipStatesEqual(tooltipState.value, next)) return;
  tooltipState.value = next;
}

function hideTooltip() {
  if (!tooltipState.value.visible) return;
  tooltipState.value = CHART_SPARKLINE_EMPTY_TOOLTIP;
}

function resolveColor() {
  const palette = buildBrandPalette(resolveBrandBaseColor());
  if (!props.color || props.color === 'primary') return palette.brand600;
  return props.color;
}

function drawLine(ctx: MaybeCanvas2DContext, points: Array<{ x: number; y: number }>) {
  if (!points.length) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index].x, points[index].y);
  }
}

function getEffectStrength() {
  return getChartSparklineEffectStrength(props.effect);
}

chart.setRenderer((info, progress) => {
  const { ctx, size } = info;
  const data = props.data || [];
  const padding = Math.min(
    info.px(props.padding),
    Math.max(0, Math.min(size.width, size.height) / 2)
  );
  const lineWidth = info.px(props.lineWidth);
  const points = getLiteChartPositions(data, size.width, size.height, padding);
  if (!points.length) {
    hideTooltip();
    return;
  }

  const color = resolveColor();
  const palette = buildBrandPalette(resolveBrandBaseColor());
  const effectStrength = getEffectStrength();
  const animatedPoints = points.map(point => ({
    ...point,
    y: size.height - padding - (size.height - padding - point.y) * progress,
  }));
  const bottom = size.height - padding;

  if (props.area && animatedPoints.length >= 2) {
    const gradient = ctx.createLinearGradient(0, padding, 0, bottom);
    gradient.addColorStop(0, rgbaFromColor(color, 0.2, palette.brand600));
    gradient.addColorStop(1, rgbaFromColor(color, 0, palette.brand600));
    ctx.save();
    ctx.fillStyle = gradient;
    drawLine(ctx, animatedPoints);
    ctx.lineTo(animatedPoints[animatedPoints.length - 1].x, bottom);
    ctx.lineTo(animatedPoints[0].x, bottom);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  if (animatedPoints.length >= 2) {
    ctx.save();
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    drawLine(ctx, animatedPoints);
    ctx.stroke();
    ctx.restore();
  }

  if (effectStrength > 0 && animatedPoints.length >= 2) {
    const sweepGradient = ctx.createLinearGradient(padding, 0, size.width - padding, 0);
    const center = effectPhase.value;
    const left = Math.max(0, center - 0.18);
    const right = Math.min(1, center + 0.18);
    sweepGradient.addColorStop(0, rgbaFromColor(color, 0, palette.brand600));
    sweepGradient.addColorStop(left, rgbaFromColor(color, 0, palette.brand600));
    sweepGradient.addColorStop(center, rgbaFromHex(palette.brand100, 0.95 * effectStrength));
    sweepGradient.addColorStop(right, rgbaFromColor(color, 0, palette.brand600));
    sweepGradient.addColorStop(1, rgbaFromColor(color, 0, palette.brand600));

    ctx.save();
    ctx.lineWidth = lineWidth * (1.08 + effectStrength * 0.2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = sweepGradient;
    drawLine(ctx, animatedPoints);
    ctx.stroke();
    ctx.restore();
  }

  const activeIndex = resolveChartSparklineActiveIndex({
    hoverIndex: hoverIndex.value,
    pointCount: animatedPoints.length,
    showEndPoint: props.showEndPoint,
  });

  if (activeIndex >= 0) {
    const active = animatedPoints[activeIndex];
    const isHoverActive = hoverIndex.value >= 0 && hoverIndex.value < animatedPoints.length;
    const pulse = effectStrength > 0 ? oscillate(effectPhase.value) * effectStrength : 0;
    ctx.save();
    ctx.fillStyle = rgbaFromHex(palette.brand800, 0.12 + pulse * 0.06);
    ctx.beginPath();
    ctx.arc(active.x, active.y, lineWidth * (1.8 + pulse * 0.7), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(active.x, active.y, lineWidth, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (props.tooltip && isHoverActive) {
      const text = formatLiteChartTooltipText(active);
      showTooltip(active.x, active.y, text, ctx.measureText(text).width);
    } else {
      hideTooltip();
    }
  } else {
    hideTooltip();
  }
});

function renderWithAnimation() {
  effectPhase.value = 0;
  chart.stopLoop();
  chart.animateToRepeated(
    Math.max(0, props.animationDuration),
    props.animationRepeat,
    progress => {
      chart.scheduleRender(progress);
    },
    syncEffectLoop
  );
}

function updateHover(event: unknown) {
  if (!props.tooltip) return;
  const point = chart.getRelativePoint(event);
  if (!point) return;
  const positions = getLiteChartPositions(
    props.data || [],
    chart.size.value.width,
    chart.size.value.height,
    chart.px(props.padding)
  );
  const index = getNearestPointIndex(positions, point.x);
  if (index !== hoverIndex.value) {
    hoverIndex.value = index;
    emit('hoverChange', index);
    chart.scheduleRender(1);
  }
}

function clearHover() {
  if (hoverIndex.value < 0) return;
  hoverIndex.value = -1;
  hideTooltip();
  emit('hoverChange', -1);
  chart.scheduleRender(1);
}

function syncEffectLoop() {
  chart.stopLoop();
  if (props.effect === LiteChartEffect.None) {
    effectPhase.value = 0;
    chart.scheduleRender(1);
    return;
  }
  if (!chart.ready.value || (props.data || []).length < 2) return;

  chart.startLoop(props.effectDuration, frame => {
    effectPhase.value = frame.phase;
    chart.scheduleRender(1);
  });
}

watch(
  () => [
    props.data,
    props.height,
    props.padding,
    props.lineWidth,
    props.color,
    props.area,
    props.showEndPoint,
    props.tooltip,
    props.animationDuration,
    props.animationRepeat,
    props.effect,
    props.effectDuration,
  ],
  () => {
    renderWithAnimation();
  },
  { deep: true }
);

watch(
  () => chart.ready.value,
  ready => {
    if (!ready) return;
    renderWithAnimation();
  },
  { immediate: true }
);

onUnmounted(() => {
  chart.stopLoop();
});
</script>

<template>
  <view
    :id="wrapperId"
    :class="classes"
    :style="rootStyle"
    @touchstart="updateHover"
    @touchmove="updateHover"
    @touchend="clearHover"
  >
    <canvas :id="canvasId" class="lk-chart-sparkline__canvas" type="2d" :canvas-id="canvasId" />
    <view v-if="tooltipState.visible" class="lk-chart-sparkline__tooltip" :style="tooltipStyle">
      {{ tooltipState.text }}
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-chart-sparkline.scss';
</style>
