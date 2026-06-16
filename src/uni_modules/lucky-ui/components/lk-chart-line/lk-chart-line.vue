<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, ref, watch, onUnmounted } from 'vue';
import { useChartCanvas } from '../../composables/useChartCanvas';
import { buildBrandPalette, resolveBrandBaseColor, rgbaFromHex } from '../../utils/chart-colors';
import { chartLineProps, chartLineEmits } from './chart-line.props';
import {
  areChartLineTooltipStatesEqual,
  buildChartLineRenderPoints,
  CHART_LINE_EMPTY_TOOLTIP,
  clampChartLineIndex,
  formatChartLineAxisValue,
  getChartLineBezierSegments,
  getChartLineHoverIndexFromPoint,
  getChartLineXAxisLabelStride,
  isChartLineAutoAnimating,
  normalizeChartLineValues,
  resolveChartLineAutoTransition,
  resolveChartLineHeightStyle,
  resolveChartLineInitialHoverIndex,
  resolveChartLineInterpolatedTooltip,
  resolveChartLineLayout,
  resolveChartLineRootStyle,
  resolveChartLineTooltipState,
  resolveChartLineTooltipStyle,
  resolveChartLineTooltipText,
  resolveChartLineValueRange,
  resolveChartLineYAxisLabelWidth,
} from './chart-line.utils';

defineOptions({ name: 'LkChartLine' });

const props = defineProps(chartLineProps);
const emit = defineEmits(chartLineEmits);

const CHART_LINE_GRID_COLOR = 'rgba(148, 163, 184, 0.14)';
const CHART_LINE_AXIS_COLOR = 'rgba(148, 163, 184, 0.28)';
const CHART_LINE_AXIS_LABEL_COLOR = 'rgba(148, 163, 184, 0.74)';

let uidSeed = 0;
function uid(prefix: string) {
  uidSeed += 1;
  return `${prefix}-${Date.now()}-${uidSeed}`;
}

const wrapperId = computed(() => props.id || uid('lk-chart-line'));
const canvasId = computed(() => `${wrapperId.value}__canvas`);

const heightStyle = computed(() => resolveChartLineHeightStyle(props.height));
const rootStyle = computed<StyleValue>(() =>
  resolveChartLineRootStyle({
    heightStyle: heightStyle.value,
    customStyle: props.customStyle as StyleValue,
  })
);

const hoverIndex = ref(-1);
const autoFrom = ref<number | null>(null);
const autoTo = ref<number | null>(null);
const autoT = ref(1);
const pulse = ref(0);
const tooltipState = ref({ ...CHART_LINE_EMPTY_TOOLTIP });

let autoTimer: number | undefined;

function isAutoAnimating() {
  return isChartLineAutoAnimating({
    autoFrom: autoFrom.value,
    autoTo: autoTo.value,
    autoT: autoT.value,
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

function setHover(idx: number) {
  const len = (props.data || []).length;
  const clamped = clampChartLineIndex(idx, len);
  if (clamped !== hoverIndex.value) {
    hoverIndex.value = clamped;
    emit('hoverChange', clamped);
  }
}

function animateHoverTo(nextIndex: number) {
  const len = (props.data || []).length;
  if (len <= 0) return;
  const transition = resolveChartLineAutoTransition({
    hoverIndex: hoverIndex.value,
    defaultIndex: props.defaultIndex,
    nextIndex,
    length: len,
  });
  if (!transition) return;
  autoFrom.value = transition.from;
  autoTo.value = transition.to;
  autoT.value = 0;
  triggerPulse();
  chart.animateTo(
    260,
    p => {
      autoT.value = p;
      chart.scheduleRender(1);
    },
    () => {
      autoT.value = 1;
      setHover(transition.to);
      autoFrom.value = null;
      autoTo.value = null;
    }
  );
}

const chart = useChartCanvas({
  wrapperId: wrapperId.value,
  canvasId: canvasId.value,
  autoSize: true,
});

const tooltipStyle = computed<StyleValue>(() => resolveChartLineTooltipStyle(tooltipState.value));

function showTooltip(x: number, y: number, text: string, textWidth = text.length * 7) {
  const next = resolveChartLineTooltipState({
    x,
    y,
    text,
    textWidth,
    chartWidth: chart.size.value.width,
    px: chart.px,
  });
  if (areChartLineTooltipStatesEqual(tooltipState.value, next)) return;
  tooltipState.value = next;
}

function hideTooltip() {
  if (!tooltipState.value.visible) return;
  tooltipState.value = { ...CHART_LINE_EMPTY_TOOLTIP };
}

chart.setRenderer((info, progress) => {
  const { ctx, size } = info;
  const d = props.data || [];
  const pad = info.px(props.padding);
  const lw = info.px(props.lineWidth);

  const palette = buildBrandPalette(resolveBrandBaseColor());
  const values = normalizeChartLineValues(d);
  const range = resolveChartLineValueRange(values, props.yAxisAutoScale);

  ctx.save();
  ctx.font = '10px sans-serif';
  const yAxisLabelWidth = resolveChartLineYAxisLabelWidth({
    showAxis: props.showAxis,
    minValue: range.min,
    maxValue: range.max,
    ticks: props.yAxisTicks,
    measureTextWidth: text => ctx.measureText(text).width,
  });
  ctx.restore();

  const layout = resolveChartLineLayout({
    width: size.width,
    height: size.height,
    padding: pad,
    showXAxisLabel: props.showXAxisLabel,
    showAxis: props.showAxis,
    length: d.length,
    yAxisLabelWidth,
  });
  if (!d.length || layout.innerWidth <= 0 || layout.innerHeight <= 0) {
    hideTooltip();
    return;
  }

  const pts = buildChartLineRenderPoints({
    data: d,
    layout,
    min: range.min,
    span: range.span,
    progress,
  });

  // axis/grid
  ctx.save();
  ctx.font = '10px sans-serif';
  ctx.textBaseline = 'middle';
  if (props.showAxis) {
    const ticks = Math.max(2, props.yAxisTicks);
    for (let t = 0; t <= ticks; t += 1) {
      const y = layout.plotBottom - (layout.innerHeight * t) / ticks;
      ctx.strokeStyle = CHART_LINE_GRID_COLOR;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(layout.yAxisLeft, y + 0.5);
      ctx.lineTo(layout.axisRight, y + 0.5);
      ctx.stroke();

      const val = range.min + (range.span * t) / ticks;
      const labelY = Math.max(10, Math.min(y, layout.plotBottom - 7));
      ctx.fillStyle = CHART_LINE_AXIS_LABEL_COLOR;
      ctx.textAlign = 'right';
      ctx.fillText(formatChartLineAxisValue(val, range.span), layout.yAxisLeft - 6, labelY);
    }
    // y axis
    ctx.strokeStyle = CHART_LINE_AXIS_COLOR;
    ctx.beginPath();
    ctx.moveTo(layout.yAxisLeft + 0.5, layout.plotTop);
    ctx.lineTo(layout.yAxisLeft + 0.5, layout.plotBottom);
    ctx.stroke();
  }
  // x axis baseline
  ctx.strokeStyle = CHART_LINE_AXIS_COLOR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(layout.yAxisLeft, layout.plotBottom + 0.5);
  ctx.lineTo(layout.axisRight, layout.plotBottom + 0.5);
  ctx.stroke();
  ctx.restore();

  // optional area gradient (to x axis)
  if (props.areaGradient) {
    const segs = getChartLineBezierSegments(pts);
    ctx.save();
    const g = ctx.createLinearGradient(0, layout.plotTop, 0, layout.plotBottom);
    g.addColorStop(0, rgbaFromHex(palette.brand600, 0.22));
    g.addColorStop(1, rgbaFromHex(palette.brand600, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, layout.plotBottom);
    ctx.lineTo(pts[0].x, pts[0].y);
    for (const s of segs) {
      ctx.bezierCurveTo(s.cp1x, s.cp1y, s.cp2x, s.cp2y, s.x, s.y);
    }
    ctx.lineTo(pts[pts.length - 1].x, layout.plotBottom);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // line (bezier)
  ctx.save();
  if (props.gradient) {
    const lg = ctx.createLinearGradient(layout.plotLeft, 0, layout.plotLeft + layout.innerWidth, 0);
    lg.addColorStop(0, palette.brand400);
    lg.addColorStop(0.6, palette.brand600);
    lg.addColorStop(1, palette.brand800);
    ctx.strokeStyle = lg;
  } else {
    ctx.strokeStyle = palette.brand600;
  }
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  const segs = getChartLineBezierSegments(pts);
  for (const s of segs) {
    ctx.bezierCurveTo(s.cp1x, s.cp1y, s.cp2x, s.cp2y, s.x, s.y);
  }
  ctx.stroke();
  ctx.restore();

  // points
  ctx.save();
  for (let i = 0; i < pts.length; i += 1) {
    const p = pts[i];
    const isHover = props.tooltip && hoverIndex.value === i;
    ctx.beginPath();
    ctx.fillStyle = isHover ? palette.brand800 : palette.brand600;
    ctx.arc(p.x, p.y, isHover ? 5 : 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // tooltip (touch/always/auto)
  const hasHover = hoverIndex.value >= 0 && hoverIndex.value < pts.length;
  const shouldShow =
    props.tooltip && (hasHover || props.tooltipAlways || props.autoTooltip || isAutoAnimating());

  let cursorX: number | null = null;
  let cursorY: number | null = null;
  let cursorText = '';

  if (shouldShow) {
    if (isAutoAnimating() && autoFrom.value != null && autoTo.value != null) {
      const a = pts[autoFrom.value];
      const b = pts[autoTo.value];
      const tooltip = resolveChartLineInterpolatedTooltip({
        from: a,
        to: b,
        t: autoT.value,
      });
      cursorX = tooltip.x;
      cursorY = tooltip.y;
      cursorText = tooltip.text;
    } else {
      const idx = hasHover ? hoverIndex.value : clampChartLineIndex(props.defaultIndex, pts.length);
      const p = pts[idx];
      cursorX = p.x;
      cursorY = p.y;
      cursorText = resolveChartLineTooltipText({
        label: p.label,
        value: p.v,
      });
    }
  }

  if (shouldShow && cursorX != null && cursorY != null) {
    ctx.save();
    ctx.strokeStyle = rgbaFromHex(palette.brand800, 0.18 + 0.18 * pulse.value);
    ctx.lineWidth = 1 + 1 * pulse.value;
    ctx.beginPath();
    ctx.moveTo(cursorX + 0.5, layout.plotTop);
    ctx.lineTo(cursorX + 0.5, layout.plotBottom);
    ctx.stroke();
    ctx.restore();

    showTooltip(cursorX, cursorY, cursorText, ctx.measureText(cursorText).width);
  } else {
    hideTooltip();
  }

  if (props.showXAxisLabel) {
    const stride = getChartLineXAxisLabelStride(d.length);
    ctx.save();
    ctx.font = '10px sans-serif';
    ctx.fillStyle = CHART_LINE_AXIS_LABEL_COLOR;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i < d.length; i += stride) {
      const label = d[i].label ? String(d[i].label) : '';
      if (!label) continue;
      const x = layout.plotLeft + layout.step * i;
      const labelWidth = ctx.measureText(label).width;
      const labelX = Math.max(labelWidth / 2, Math.min(x, size.width - labelWidth / 2));
      ctx.fillText(label, labelX, layout.plotBottom + 6);
    }
    ctx.restore();
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
    hoverIndex.value = resolveChartLineInitialHoverIndex({
      tooltipAlways: props.tooltipAlways,
      autoTooltip: props.autoTooltip,
      defaultIndex: props.defaultIndex,
      length: (props.data || []).length,
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
    const len = (props.data || []).length;
    if (!props.tooltip || len <= 0) return;

    if (props.autoTooltip) {
      hoverIndex.value = clampChartLineIndex(props.defaultIndex, len);
      autoTimer = setInterval(
        () => {
          if (!chart.ready.value) return;
          const current = clampChartLineIndex(
            hoverIndex.value < 0 ? props.defaultIndex : hoverIndex.value,
            len
          );
          const next = (current + 1) % len;
          animateHoverTo(next);
        },
        Math.max(300, props.autoTooltipInterval)
      ) as unknown as number;
      return;
    }

    if (props.tooltipAlways) {
      hoverIndex.value = clampChartLineIndex(props.defaultIndex, len);
      chart.scheduleRender(1);
    }
  },
  { immediate: true }
);

watch(
  () =>
    [
      props.padding,
      props.lineWidth,
      props.gradient,
      props.areaGradient,
      props.showAxis,
      props.yAxisTicks,
      props.yAxisAutoScale,
      props.showXAxisLabel,
      props.highlightPulse,
    ] as const,
  () => refresh()
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
  const d = props.data || [];
  if (!d.length) return;

  const pad = chart.px(props.padding);
  const values = normalizeChartLineValues(d);
  const range = resolveChartLineValueRange(values, props.yAxisAutoScale);
  const yAxisLabelWidth = resolveChartLineYAxisLabelWidth({
    showAxis: props.showAxis,
    minValue: range.min,
    maxValue: range.max,
    ticks: props.yAxisTicks,
  });
  const layout = resolveChartLineLayout({
    width: chart.size.value.width,
    height: chart.size.value.height,
    padding: pad,
    showXAxisLabel: props.showXAxisLabel,
    showAxis: props.showAxis,
    length: d.length,
    yAxisLabelWidth,
  });
  if (layout.innerWidth <= 0) return;

  const idx = getChartLineHoverIndexFromPoint({
    x: p.x,
    plotLeft: layout.plotLeft,
    step: layout.step,
    length: d.length,
  });
  if (hoverIndex.value !== idx) {
    hoverIndex.value = idx;
    emit('hoverChange', idx);
    triggerPulse();
  }
  refresh();
}

function onEnd() {
  if (!props.tooltip) return;
  const len = (props.data || []).length;
  const keep = props.tooltipAlways || props.autoTooltip;
  const next = keep ? clampChartLineIndex(props.defaultIndex, len) : -1;
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
@use './lk-chart-line.scss';
</style>
