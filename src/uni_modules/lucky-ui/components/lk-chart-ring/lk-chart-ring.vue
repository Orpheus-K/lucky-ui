<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, onUnmounted, ref, watch } from 'vue';
import { useChartCanvas } from '../../composables/useChartCanvas';
import { LiteChartEffect, movingWindow, oscillate } from '../../core/src/chart';
import {
  buildBrandPalette,
  resolveBrandBaseColor,
  resolveCanvasCssColor,
  rgbaFromColor,
  rgbaFromHex,
} from '../../utils/chart-colors';
import { chartRingProps, type RingChartSegment } from './chart-ring.props';
import {
  getChartRingCapSweep,
  getChartRingEffectStrength,
  getChartRingOverlapAngle,
  getChartRingTotal,
  normalizeChartRingSegments,
  resolveChartRingCenterSubtitle,
  resolveChartRingCenterTitle,
  resolveChartRingClass,
  resolveChartRingGeometry,
  resolveChartRingHeightStyle,
  resolveChartRingRootStyle,
  resolveChartRingSegmentColor,
} from './chart-ring.utils';

defineOptions({ name: 'LkChartRing' });

const props = defineProps(chartRingProps);

let uidSeed = 0;
function uid(prefix: string) {
  uidSeed += 1;
  return `${prefix}-${Date.now()}-${uidSeed}`;
}

const wrapperId = computed(() => props.id || uid('lk-chart-ring'));
const canvasId = computed(() => `${wrapperId.value}__canvas`);
const effectPhase = ref(0);

const heightStyle = computed(() => resolveChartRingHeightStyle(props.height));

const rootStyle = computed<StyleValue>(() =>
  resolveChartRingRootStyle({
    heightStyle: heightStyle.value,
    customStyle: props.customStyle as StyleValue,
  })
);

const classes = computed(() => resolveChartRingClass(props.customClass));

const chart = useChartCanvas({
  wrapperId: wrapperId.value,
  canvasId: canvasId.value,
  autoSize: true,
});

const normalizedSegments = computed<RingChartSegment[]>(() =>
  normalizeChartRingSegments({
    segments: props.segments,
    value: props.value,
    max: props.max,
    title: props.title,
  })
);

const centerTitle = computed(() =>
  resolveChartRingCenterTitle({
    title: props.title,
    segments: props.segments,
    normalizedSegments: normalizedSegments.value,
    value: props.value,
    max: props.max,
  })
);

const centerSubtitle = computed(() =>
  resolveChartRingCenterSubtitle({
    subtitle: props.subtitle,
    segments: props.segments,
  })
);

function resolveSegmentColor(segment: RingChartSegment, index: number) {
  const palette = buildBrandPalette(resolveBrandBaseColor());
  return resolveChartRingSegmentColor(segment, index, palette);
}

function getEffectStrength() {
  return getChartRingEffectStrength(props.effect);
}

chart.setRenderer((info, progress) => {
  const { ctx, size } = info;
  const palette = buildBrandPalette(resolveBrandBaseColor());
  const strokeWidth = Math.max(2, info.px(props.strokeWidth));
  const padding = info.px(props.padding);
  const geometry = resolveChartRingGeometry({
    width: size.width,
    height: size.height,
    padding,
    strokeWidth,
  });
  const segments = normalizedSegments.value;
  if (!segments.length) return;
  const effectStrength = getEffectStrength();

  ctx.save();
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';

  if (props.showTrack) {
    ctx.strokeStyle = rgbaFromHex(palette.brand800, 0.08);
    ctx.beginPath();
    ctx.arc(geometry.cx, geometry.cy, geometry.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  const total = getChartRingTotal({
    hasSegments: props.segments.length > 0,
    segments,
    max: props.max,
  });
  let start = -Math.PI / 2;
  const pulse = effectStrength > 0 ? oscillate(effectPhase.value) * effectStrength : 0;
  const segmentCount = segments.length;
  const overlapAngle = getChartRingOverlapAngle({
    segmentCount,
    strokeWidth,
    radius: geometry.radius,
  });
  const drawnSegments: Array<{
    color: string;
    start: number;
    sweep: number;
    fullSweep: number;
    end: number;
  }> = [];

  function drawRingArc(color: string, from: number, to: number, lineCap: CanvasLineCap) {
    ctx.lineCap = lineCap;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(geometry.cx, geometry.cy, geometry.radius, from, to);
    ctx.stroke();
  }

  segments.forEach((segment, index) => {
    const fullSweep = (segment.value / total) * Math.PI * 2;
    const end = start + fullSweep * progress;
    const sweep = Math.max(0, end - start);
    const color = resolveSegmentColor(segment, index);
    if (sweep > 0) {
      drawRingArc(color, start, end, segmentCount > 1 ? 'butt' : 'round');
    }
    drawnSegments.push({ color, start, sweep, fullSweep, end });

    if (effectStrength > 0 && sweep > 0) {
      const highlight = movingWindow(
        effectPhase.value,
        (start + fullSweep / 2 + Math.PI / 2) / (Math.PI * 2),
        0.22
      );
      const sweepAngle = start + (sweep || 0) * effectPhase.value;
      const sweepX = geometry.cx + Math.cos(sweepAngle) * geometry.radius;
      const sweepY = geometry.cy + Math.sin(sweepAngle) * geometry.radius;
      ctx.save();
      ctx.fillStyle = rgbaFromColor(
        color,
        0.08 + highlight * 0.08 + pulse * 0.04,
        palette.brand600
      );
      ctx.beginPath();
      ctx.arc(sweepX, sweepY, strokeWidth * (0.18 + effectStrength * 0.06), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    start += fullSweep;
  });

  if (segmentCount > 1) {
    drawnSegments.forEach(segment => {
      const capSweep = getChartRingCapSweep({
        overlapAngle,
        sweep: segment.sweep,
        fullSweep: segment.fullSweep,
      });
      if (capSweep <= 0) return;
      const capEnd = segment.end;
      const capStart = capEnd - capSweep;
      drawRingArc(segment.color, capStart, capEnd, 'round');
    });
  }

  ctx.restore();

  if (props.showCenter) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = resolveCanvasCssColor({
      source: info.canvas,
      varName: '--lk-chart-center-value-color',
      fallback: '#090909',
    });
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(centerTitle.value, geometry.cx, geometry.cy - 8);
    ctx.fillStyle = resolveCanvasCssColor({
      source: info.canvas,
      varName: '--lk-chart-center-title-color',
      fallback: '#909399',
    });
    ctx.font = '12px sans-serif';
    ctx.fillText(centerSubtitle.value, geometry.cx, geometry.cy + 18);
    ctx.restore();
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

function syncEffectLoop() {
  chart.stopLoop();
  if (props.effect === LiteChartEffect.None) {
    effectPhase.value = 0;
    chart.scheduleRender(1);
    return;
  }
  if (!chart.ready.value || !normalizedSegments.value.length) return;

  chart.startLoop(props.effectDuration, frame => {
    effectPhase.value = frame.phase;
    chart.scheduleRender(1);
  });
}

watch(
  () => [
    props.value,
    props.max,
    props.segments,
    props.height,
    props.strokeWidth,
    props.padding,
    props.showTrack,
    props.title,
    props.subtitle,
    props.showCenter,
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
  <view :id="wrapperId" :class="classes" :style="rootStyle">
    <canvas :id="canvasId" class="lk-chart-ring__canvas" type="2d" :canvas-id="canvasId" />
  </view>
</template>

<style lang="scss">
@use './lk-chart-ring.scss';
</style>
