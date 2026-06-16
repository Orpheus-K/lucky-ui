<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, onUnmounted, ref, watch } from 'vue';
import { useChartCanvas, type MaybeCanvas2DContext } from '../../composables/useChartCanvas';
import { LiteChartEffect } from '../../core/src/chart';
import {
  buildBrandPalette,
  resolveBrandBaseColor,
  resolveCanvasCssColor,
  rgbaFromColor,
  rgbaFromHex,
} from '../../utils/chart-colors';
import { chartRadarLiteProps } from './chart-radar-lite.props';
import {
  buildRadarLitePoints,
  getChartRadarLiteEffectStrength,
  getChartRadarLiteLevels,
  getRadarLiteAxisReveal,
  getRadarLiteBreath,
  getRadarLitePoint,
  getRadarLitePointDrop,
  normalizeRadarLiteData,
  resolveChartRadarLiteClass,
  resolveChartRadarLiteGeometry,
  resolveChartRadarLiteHeightStyle,
  resolveChartRadarLiteRootStyle,
  resolveRadarLiteMotion,
} from './chart-radar-lite.utils';

defineOptions({ name: 'LkChartRadarLite' });

const props = defineProps(chartRadarLiteProps);

let uidSeed = 0;
function uid(prefix: string) {
  uidSeed += 1;
  return `${prefix}-${Date.now()}-${uidSeed}`;
}

const wrapperId = computed(() => props.id || uid('lk-chart-radar-lite'));
const canvasId = computed(() => `${wrapperId.value}__canvas`);
const effectPhase = ref(0);

const heightStyle = computed(() => resolveChartRadarLiteHeightStyle(props.height));

const rootStyle = computed<StyleValue>(() =>
  resolveChartRadarLiteRootStyle({
    heightStyle: heightStyle.value,
    customStyle: props.customStyle as StyleValue,
  })
);

const classes = computed(() => resolveChartRadarLiteClass(props.customClass));

const chart = useChartCanvas({
  wrapperId: wrapperId.value,
  canvasId: canvasId.value,
  autoSize: true,
});

const normalizedData = computed(() => normalizeRadarLiteData(props.data || [], props.max));

function resolveColor() {
  const palette = buildBrandPalette(resolveBrandBaseColor());
  if (!props.color || props.color === 'primary') return palette.brand600;
  return props.color;
}

function getEffectStrength() {
  return getChartRadarLiteEffectStrength(props.effect);
}

function drawPolygon(
  ctx: MaybeCanvas2DContext,
  points: Array<{ x: number; y: number }>,
  closePath = true
) {
  if (!points.length) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index].x, points[index].y);
  }
  if (closePath) ctx.closePath();
}

chart.setRenderer((info, progress) => {
  const { ctx, size } = info;
  const data = normalizedData.value;
  if (!data.length) return;

  const palette = buildBrandPalette(resolveBrandBaseColor());
  const color = resolveColor();
  const effectStrength = getEffectStrength();
  const motion = resolveRadarLiteMotion(progress);
  const breath = getRadarLiteBreath(effectPhase.value, effectStrength);
  const lineWidth = Math.max(1, info.px(props.lineWidth));
  const padding = info.px(props.padding);
  const geometry = resolveChartRadarLiteGeometry({
    width: size.width,
    height: size.height,
    padding,
  });
  const levels = getChartRadarLiteLevels(props.levels);
  const fullPoints = data.map((item, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / data.length;
    return {
      label: item.label,
      angle,
      ...getRadarLitePoint({
        cx: geometry.cx,
        cy: geometry.cy,
        radius: geometry.radius,
        angle,
        ratio: 1,
      }),
    };
  });

  ctx.save();
  ctx.strokeStyle = rgbaFromHex(palette.brand800, 0.06 + motion.gridProgress * 0.06);
  ctx.lineWidth = 1;
  for (let level = 1; level <= levels; level += 1) {
    const ratio = (level / levels) * motion.gridProgress;
    if (ratio <= 0) continue;
    const gridPoints = fullPoints.map(point =>
      getRadarLitePoint({
        cx: geometry.cx,
        cy: geometry.cy,
        radius: geometry.radius,
        angle: point.angle,
        ratio,
      })
    );
    if (data.length >= 3) {
      drawPolygon(ctx, gridPoints);
    } else {
      ctx.beginPath();
      ctx.arc(geometry.cx, geometry.cy, geometry.radius * ratio, 0, Math.PI * 2);
    }
    ctx.stroke();
  }
  ctx.strokeStyle = rgbaFromHex(palette.brand800, 0.08 + motion.axisProgress * 0.08);
  fullPoints.forEach(point => {
    const axisPoint = getRadarLitePoint({
      cx: geometry.cx,
      cy: geometry.cy,
      radius: geometry.radius,
      angle: point.angle,
      ratio: motion.axisProgress,
    });
    ctx.beginPath();
    ctx.moveTo(geometry.cx, geometry.cy);
    ctx.lineTo(axisPoint.x, axisPoint.y);
    ctx.stroke();
  });
  ctx.restore();

  const radarPoints = buildRadarLitePoints({
    data,
    cx: geometry.cx,
    cy: geometry.cy,
    radius: geometry.radius,
  }).map((point, index) => {
    const reveal = getRadarLiteAxisReveal(index, data.length, motion.polygonProgress);
    const next = getRadarLitePoint({
      cx: geometry.cx,
      cy: geometry.cy,
      radius: geometry.radius,
      angle: point.angle,
      ratio: point.ratio * reveal,
    });
    return {
      ...point,
      ...next,
      reveal,
    };
  });

  const visibleRadarPoints = radarPoints.some(point => point.reveal > 0.01);

  const fillGradient = ctx.createRadialGradient(
    geometry.cx,
    geometry.cy,
    1,
    geometry.cx,
    geometry.cy,
    geometry.radius
  );
  fillGradient.addColorStop(0, rgbaFromColor(color, 0.3, palette.brand600));
  fillGradient.addColorStop(1, rgbaFromColor(color, 0.12, palette.brand600));
  if (visibleRadarPoints) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth + breath * 0.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    if (radarPoints.length >= 3) {
      ctx.globalAlpha = 0.72 + motion.polygonProgress * 0.28;
      drawPolygon(ctx, radarPoints);
      ctx.fillStyle = fillGradient;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.stroke();
    } else {
      ctx.globalAlpha = motion.polygonProgress;
      ctx.beginPath();
      if (radarPoints.length === 1) {
        ctx.moveTo(geometry.cx, geometry.cy);
        ctx.lineTo(radarPoints[0].x, radarPoints[0].y);
      } else {
        ctx.moveTo(radarPoints[0].x, radarPoints[0].y);
        ctx.lineTo(radarPoints[1].x, radarPoints[1].y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  if (props.showPoint) {
    ctx.save();
    radarPoints.forEach(point => {
      if (point.reveal <= 0.08) return;
      const drop = getRadarLitePointDrop(point.reveal, motion.pointProgress);
      const halo = drop + breath * 0.32;
      ctx.fillStyle = rgbaFromColor(color, 0.08 + halo * 0.08, palette.brand600);
      ctx.beginPath();
      ctx.arc(point.x, point.y, 7 + halo * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = rgbaFromHex(palette.brand100, 1);
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4.5 + drop * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2.8 + drop * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  if (props.showLabel) {
    ctx.save();
    ctx.globalAlpha = motion.labelProgress;
    ctx.font = '11px sans-serif';
    ctx.fillStyle = resolveCanvasCssColor({
      source: info.canvas,
      varName: '--lk-chart-label',
      fallback: '#909399',
    });
    ctx.textBaseline = 'middle';
    fullPoints.forEach(point => {
      const labelPoint = getRadarLitePoint({
        cx: geometry.cx,
        cy: geometry.cy,
        radius: geometry.radius + 18,
        angle: point.angle,
        ratio: 1,
      });
      ctx.textAlign =
        Math.abs(labelPoint.x - geometry.cx) < 8
          ? 'center'
          : labelPoint.x > geometry.cx
            ? 'left'
            : 'right';
      ctx.fillText(point.label, labelPoint.x, labelPoint.y);
    });
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
  if (!chart.ready.value || !normalizedData.value.length) return;

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
    props.levels,
    props.max,
    props.color,
    props.lineWidth,
    props.showLabel,
    props.showPoint,
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
    <canvas :id="canvasId" class="lk-chart-radar-lite__canvas" type="2d" :canvas-id="canvasId" />
  </view>
</template>

<style lang="scss">
@use './lk-chart-radar-lite.scss';
</style>
