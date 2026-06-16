<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, ref, watch, onUnmounted } from 'vue';
import { useChartCanvas } from '../../composables/useChartCanvas';
import {
  buildBrandPalette,
  getCssVarColor,
  resolveBrandBaseColor,
  rgbaFromHex,
} from '../../utils/chart-colors';
import { chartPieProps, chartPieEmits } from './chart-pie.props';
import {
  areChartPieTooltipStatesEqual,
  CHART_PIE_EMPTY_TOOLTIP,
  CHART_PIE_START_ANGLE,
  clampChartPieIndex,
  getChartPieCapSweep,
  getChartPieEffectiveIndex,
  getChartPieIndexByAngle,
  getChartPieNextAutoTooltipIndex,
  getChartPieOverlapAngle,
  getChartPieSliceSweep,
  getChartPieTotal,
  getValidChartPieSlices,
  isChartPiePointInside,
  normalizeChartPieAngle,
  resolveChartPieCenterText,
  resolveChartPieCanvasTextColor,
  resolveChartPieDonutBounds,
  resolveChartPieGeometry,
  resolveChartPieHeightStyle,
  resolveChartPieInitialHoverIndex,
  resolveChartPieRootStyle,
  resolveChartPieSliceColor,
  resolveChartPieTooltipState,
  resolveChartPieTooltipStyle,
  resolveChartPieTooltipText,
  shouldDrawChartPieSegmentEndCap,
} from './chart-pie.utils';

defineOptions({ name: 'LkChartPie' });

const props = defineProps(chartPieProps);
const emit = defineEmits(chartPieEmits);

let uidSeed = 0;
function uid(prefix: string) {
  uidSeed += 1;
  return `${prefix}-${Date.now()}-${uidSeed}`;
}

const wrapperId = computed(() => props.id || uid('lk-chart-pie'));
const canvasId = computed(() => `${wrapperId.value}__canvas`);

const heightStyle = computed(() => resolveChartPieHeightStyle(props.height));
const rootStyle = computed<StyleValue>(() =>
  resolveChartPieRootStyle({
    heightStyle: heightStyle.value,
    customStyle: props.customStyle as StyleValue,
  })
);

const hoverIndex = ref(-1);
const pulse = ref(0);
const tooltipState = ref({ ...CHART_PIE_EMPTY_TOOLTIP });

let autoTimer: number | undefined;

function resolveCanvasTextColor(varName: string, tokenName: string, fallback: string) {
  return resolveChartPieCanvasTextColor({
    color: getCssVarColor(varName) || getCssVarColor(tokenName),
    fallback,
  });
}

function triggerPulse() {
  if (!props.highlightPulse) return;
  chart.animateTo(
    320,
    p => {
      pulse.value = Math.sin(p * Math.PI);
      chart.scheduleRender(1);
    },
    () => {
      pulse.value = 0;
    }
  );
}

const chart = useChartCanvas({
  wrapperId: wrapperId.value,
  canvasId: canvasId.value,
  autoSize: true,
});

const tooltipStyle = computed<StyleValue>(() => resolveChartPieTooltipStyle(tooltipState.value));

function showTooltip(x: number, y: number, text: string, textWidth = text.length * 7) {
  const next = resolveChartPieTooltipState({
    x,
    y,
    text,
    textWidth,
    chartWidth: chart.size.value.width,
    px: chart.px,
  });
  if (areChartPieTooltipStatesEqual(tooltipState.value, next)) return;
  tooltipState.value = next;
}

function hideTooltip() {
  if (!tooltipState.value.visible) return;
  tooltipState.value = { ...CHART_PIE_EMPTY_TOOLTIP };
}

chart.setRenderer((info, progress) => {
  const { ctx, size } = info;
  const d = getValidChartPieSlices(props.data || []);
  const pad = info.px(props.padding);

  const palette = buildBrandPalette(resolveBrandBaseColor());

  const geometry = resolveChartPieGeometry({
    width: size.width,
    height: size.height,
    padding: pad,
  });
  if (!d.length || geometry.radius <= 0) {
    hideTooltip();
    return;
  }

  const total = getChartPieTotal(d);
  if (total <= 0) {
    hideTooltip();
    return;
  }

  let start = CHART_PIE_START_ANGLE;

  // effective hover for always/auto
  const effectiveIndex = getChartPieEffectiveIndex({
    tooltip: props.tooltip,
    hoverIndex: hoverIndex.value,
    autoTooltip: props.autoTooltip,
    tooltipAlways: props.tooltipAlways,
    defaultIndex: props.defaultIndex,
    length: d.length,
  });

  if (props.donut) {
    const bounds = resolveChartPieDonutBounds({
      radius: geometry.radius,
      donutWidth: info.px(props.donutWidth),
    });
    ctx.save();
    ctx.lineWidth = bounds.thickness;
    ctx.lineCap = 'round';

    if (props.showTrack) {
      ctx.strokeStyle = rgbaFromHex(palette.brand800, 0.08);
      ctx.beginPath();
      ctx.arc(geometry.cx, geometry.cy, bounds.arcRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    const segmentCount = d.length;
    const overlapAngle = getChartPieOverlapAngle({
      segmentCount,
      thickness: bounds.thickness,
      radius: geometry.radius,
    });
    const drawnSegments: Array<{
      color: string;
      start: number;
      sweep: number;
      fullSweep: number;
      end: number;
    }> = [];

    function drawDonutArc(color: string, from: number, to: number, lineCap: CanvasLineCap) {
      ctx.lineCap = lineCap;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(geometry.cx, geometry.cy, bounds.arcRadius, from, to);
      ctx.stroke();
    }

    for (let i = 0; i < d.length; i += 1) {
      const slice = d[i];
      const sweep = getChartPieSliceSweep({ value: slice.value, total });
      const end = start + sweep * progress;
      const color = resolveChartPieSliceColor(slice, i, palette);

      drawDonutArc(color, start, end, segmentCount > 1 ? 'butt' : 'round');
      const actualEnd = end;
      drawnSegments.push({
        color,
        start,
        sweep: Math.max(0, actualEnd - start),
        fullSweep: sweep,
        end: actualEnd,
      });

      // hover highlight
      if (props.tooltip && effectiveIndex === i) {
        ctx.strokeStyle = rgbaFromHex(palette.brand800, 0.18 + 0.22 * pulse.value);
        ctx.lineWidth = bounds.thickness + 4 + 4 * pulse.value;
        ctx.beginPath();
        ctx.arc(geometry.cx, geometry.cy, bounds.arcRadius, start, end);
        ctx.stroke();
        ctx.lineWidth = bounds.thickness;
      }

      start += sweep;
    }

    if (segmentCount > 1) {
      drawnSegments.forEach((segment, index) => {
        const capSweep = getChartPieCapSweep({
          overlapAngle,
          sweep: segment.sweep,
          fullSweep: segment.fullSweep,
        });
        if (capSweep <= 0) return;
        if (index === 0) {
          drawDonutArc(segment.color, segment.start, segment.start + capSweep, 'round');
        }
        if (shouldDrawChartPieSegmentEndCap({ index, segmentCount })) {
          const capEnd = segment.end;
          const capStart = capEnd - capSweep;
          drawDonutArc(segment.color, capStart, capEnd, 'round');
        }
      });
    }

    ctx.restore();
  } else {
    for (let i = 0; i < d.length; i += 1) {
      const slice = d[i];
      const sweep = getChartPieSliceSweep({ value: slice.value, total });
      const end = start + sweep * progress;
      const color = resolveChartPieSliceColor(slice, i, palette);

      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(geometry.cx, geometry.cy);
      ctx.arc(geometry.cx, geometry.cy, geometry.radius, start, end);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      start += sweep;
    }
  }

  // center info (avoid “just a ring”)
  if (props.showCenterText) {
    const centerText = resolveChartPieCenterText({
      showCenterText: props.showCenterText,
      centerTitle: props.centerTitle,
      activeSlice: effectiveIndex >= 0 ? d[effectiveIndex] : null,
      total,
    });

    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = resolveCanvasTextColor(
      '--lk-chart-center-title-color',
      '--lk-text-secondary',
      '#64748b'
    );
    ctx.font = '12px sans-serif';
    ctx.textBaseline = 'bottom';
    ctx.fillText(centerText?.title || '', geometry.cx, geometry.cy - 2);

    ctx.fillStyle = resolveCanvasTextColor(
      '--lk-chart-center-value-color',
      '--lk-text-primary',
      '#0f172a'
    );
    ctx.font = `bold 18px sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(centerText?.main || '', geometry.cx, geometry.cy + 2);
    ctx.restore();
  }

  // tooltip
  if (props.tooltip && effectiveIndex >= 0 && effectiveIndex < d.length) {
    const slice = d[effectiveIndex];
    const text = resolveChartPieTooltipText({ slice, total });
    showTooltip(
      geometry.cx,
      geometry.cy - geometry.radius * 0.6,
      text,
      ctx.measureText(text).width
    );
  } else {
    hideTooltip();
  }
});

function triggerIntro() {
  chart.animateTo(props.animationDuration, p => {
    chart.scheduleRender(p);
  });
}

function refresh() {
  if (!chart.ready.value) return;
  chart.scheduleRender(1);
}

watch(
  () => props.data,
  () => {
    if (!chart.ready.value) return;
    hoverIndex.value = resolveChartPieInitialHoverIndex({
      tooltipAlways: props.tooltipAlways,
      autoTooltip: props.autoTooltip,
      defaultIndex: props.defaultIndex,
      length: getValidChartPieSlices(props.data || []).length,
    });
    triggerIntro();
  },
  { deep: true }
);

watch(
  () =>
    [
      props.autoTooltip,
      props.autoTooltipInterval,
      props.tooltipAlways,
      props.defaultIndex,
      (props.data || []).length,
    ] as const,
  () => {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = undefined;
    }
    const len = getValidChartPieSlices(props.data || []).length;
    if (!props.tooltip || len <= 0) return;

    if (props.autoTooltip) {
      hoverIndex.value = clampChartPieIndex(props.defaultIndex, len);
      autoTimer = setInterval(
        () => {
          if (!chart.ready.value) return;
          const next = getChartPieNextAutoTooltipIndex({
            hoverIndex: hoverIndex.value,
            defaultIndex: props.defaultIndex,
            length: len,
          });
          hoverIndex.value = next;
          emit('hoverChange', next);
          triggerPulse();
          refresh();
        },
        Math.max(300, props.autoTooltipInterval)
      ) as unknown as number;
      return;
    }

    if (props.tooltipAlways) {
      hoverIndex.value = clampChartPieIndex(props.defaultIndex, len);
      refresh();
    }
  },
  { immediate: true }
);

watch(
  () => chart.ready.value,
  v => {
    if (v) triggerIntro();
  }
);

function onMove(e: unknown) {
  if (!props.tooltip) return;
  const p = chart.getRelativePoint(e);
  if (!p) return;

  const geometry = resolveChartPieGeometry({
    width: chart.size.value.width,
    height: chart.size.value.height,
    padding: chart.px(props.padding),
  });

  const dx = p.x - geometry.cx;
  const dy = p.y - geometry.cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (geometry.radius <= 0) return;

  if (
    !isChartPiePointInside({
      distance: dist,
      donut: props.donut,
      radius: geometry.radius,
      donutWidth: chart.px(props.donutWidth),
    })
  ) {
    if (hoverIndex.value !== -1) {
      hoverIndex.value = -1;
      emit('hoverChange', -1);
      refresh();
    }
    return;
  }

  const angle = normalizeChartPieAngle(dx, dy);

  const d = getValidChartPieSlices(props.data || []);
  const total = getChartPieTotal(d);
  if (!d.length || total <= 0) return;

  const idx = getChartPieIndexByAngle({ angle, data: d, total });

  if (idx !== -1 && hoverIndex.value !== idx) {
    hoverIndex.value = idx;
    emit('hoverChange', idx);
    triggerPulse();
    refresh();
  }
}

function onEnd() {
  if (!props.tooltip) return;
  const len = getValidChartPieSlices(props.data || []).length;
  const keep = props.tooltipAlways || props.autoTooltip;
  const next = keep ? clampChartPieIndex(props.defaultIndex, len) : -1;
  if (hoverIndex.value !== next) {
    hoverIndex.value = next;
    emit('hoverChange', next);
    refresh();
  }
}

onUnmounted(() => {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = undefined;
  }
});
</script>

<template>
  <view
    :id="wrapperId"
    class="lk-chart"
    :class="props.customClass"
    :style="rootStyle"
    @touchstart="onMove"
    @touchmove="onMove"
    @touchend="onEnd"
    @touchcancel="onEnd"
    @mousemove="onMove"
    @mouseleave="onEnd"
  >
    <canvas :id="canvasId" :canvas-id="canvasId" type="2d" class="lk-chart__canvas" />
    <view v-if="tooltipState.visible" class="lk-chart__tooltip" :style="tooltipStyle">
      {{ tooltipState.text }}
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-chart-pie.scss';
</style>
