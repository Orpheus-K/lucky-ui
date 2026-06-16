<script setup lang="ts">
import { computed, inject, useSlots, type ComputedRef } from 'vue';
import type { StyleValue } from 'vue';
import { timelineItemEmits, timelineItemProps } from './timeline-item.props';
import type {
  TimelineDirection,
  TimelineDotVariant,
  TimelineLineVariant,
  TimelineLineMode,
} from './timeline.props';
import {
  defaultTimelineContext,
  hasTimelineLeftContent,
  isTimelineItemActive,
  resolveTimelineAccentColor,
  resolveTimelineDisplayNumber,
  resolveTimelineInheritedValue,
  resolveTimelineItemClass,
  resolveTimelineItemState,
  resolveTimelineItemStyle,
  resolveTimelineLineAnimated,
  resolveTimelineLineClass,
  resolveTimelineTrackClass,
} from './timeline.utils';

defineOptions({ name: 'LkTimelineItem' });

interface TimelineCtx {
  direction: TimelineDirection;
  total: number;
  showLine: boolean;
  activeIndex: number;
  dotVariant: TimelineDotVariant;
  lineVariant: TimelineLineVariant;
  lineMode: TimelineLineMode;
  lineAnimated: boolean;
}

const props = defineProps(timelineItemProps);
const emit = defineEmits(timelineItemEmits);
const slots = useSlots();

const injectedRaw = inject<ComputedRef<TimelineCtx>>(
  'LkTimelineCtx',
  null as unknown as ComputedRef<TimelineCtx>
);
const ctx = computed<TimelineCtx>(() => injectedRaw?.value ?? defaultTimelineContext);

const isActive = computed(() =>
  isTimelineItemActive({
    status: props.status,
    index: props.index,
    activeIndex: ctx.value.activeIndex,
  })
);
const state = computed(() => resolveTimelineItemState(props.status));
const isCompleted = computed(() => state.value.completed);
const isPending = computed(() => state.value.pending);
const isError = computed(() => state.value.error);
const isHorizontal = computed(() => ctx.value.direction === 'horizontal');

// 节点样式优先用 item 自身的，否则继承父级
const dotVariant = computed(() =>
  resolveTimelineInheritedValue(
    props.dotVariant as TimelineDotVariant | '',
    ctx.value.dotVariant,
    'filled'
  )
);

// 线轴样式优先用 item 自身的，否则继承父级
const lineVariant = computed(() =>
  resolveTimelineInheritedValue(
    props.lineVariant as TimelineLineVariant | '',
    ctx.value.lineVariant,
    'solid'
  )
);
const lineMode = computed(() =>
  resolveTimelineInheritedValue(
    props.lineMode as TimelineLineMode | '',
    ctx.value.lineMode,
    'normal'
  )
);
const lineAnimated = computed(() =>
  resolveTimelineLineAnimated(props.lineAnimated, ctx.value.lineAnimated)
);

// 节点显示数字（numbered 时）
const displayNumber = computed(() => resolveTimelineDisplayNumber(props.index));

// 品牌色统一：所有状态均使用 primary，pending 在 SCSS 层降透明
const accentColor = computed(() => resolveTimelineAccentColor(props.color));

// 是否显示左侧列（有 left 插槽或 time/date prop）
const hasLeft = computed(() =>
  hasTimelineLeftContent({
    hasLeftSlot: !!slots.left,
    time: props.time,
    date: props.date,
  })
);

const itemClass = computed(() =>
  resolveTimelineItemClass({
    horizontal: isHorizontal.value,
    hasLeft: hasLeft.value,
    active: isActive.value,
    completed: isCompleted.value,
    pending: isPending.value,
    error: isError.value,
    customClass: props.customClass,
  })
);

const trackClass = computed(() =>
  resolveTimelineTrackClass({
    last: props.last,
    showLine: ctx.value.showLine,
  })
);

const lineClass = computed(() =>
  resolveTimelineLineClass({
    lineVariant: lineVariant.value,
    lineMode: lineMode.value,
    lineAnimated: lineAnimated.value,
  })
);

const itemStyle = computed(() =>
  resolveTimelineItemStyle({
    accentColor: accentColor.value,
    index: props.index,
    total: ctx.value.total,
    customStyle: props.customStyle as StyleValue,
  })
);

function onTap(ev: Event) {
  emit('click', ev);
}
</script>

<template>
  <view :class="itemClass" :style="itemStyle" role="listitem" @tap="onTap">
    <!-- 左侧列：时间 / 自定义（有内容时才渲染） -->
    <view v-if="hasLeft" class="lk-timeline-item__left">
      <slot name="left">
        <text v-if="date" class="lk-timeline-item__date">{{ date }}</text>
        <text v-if="time" class="lk-timeline-item__time">{{ time }}</text>
      </slot>
    </view>

    <!-- 轨道列：节点圆 + 连接线 -->
    <view class="lk-timeline-item__track" :class="trackClass">
      <!-- 节点圆 -->
      <view
        class="lk-timeline-item__dot"
        :class="[`lk-timeline-item__dot--${dotVariant}`, isActive && 'is-active']"
      >
        <!-- numbered 变体显示序号 -->
        <text v-if="dotVariant === 'numbered' && displayNumber" class="lk-timeline-item__dot-num">
          {{ displayNumber }}
        </text>
        <!-- icon 插槽 -->
        <text v-else-if="icon" class="lk-icon" :class="`lk-icon-${icon}`" />
        <!-- 已完成 checkmark -->
        <text v-else-if="isCompleted" class="lk-timeline-item__dot-symbol">✓</text>
        <!-- error 叉 -->
        <text v-else-if="isError" class="lk-timeline-item__dot-symbol">✕</text>
      </view>

      <!-- 连接线（实体节点，支持 flex 拉伸与各种变体） -->
      <view v-if="!trackClass['is-last']" :class="lineClass" />
    </view>

    <!-- 右侧内容列 -->
    <view class="lk-timeline-item__body">
      <!-- 标题行 -->
      <view v-if="title || $slots.title" class="lk-timeline-item__title-row">
        <slot name="title">
          <text class="lk-timeline-item__title">{{ title }}</text>
        </slot>
      </view>

      <!-- 副标题（地点 / 房间号等） -->
      <view v-if="subtitle || $slots.subtitle" class="lk-timeline-item__subtitle-row">
        <slot name="subtitle">
          <text class="lk-timeline-item__subtitle">{{ subtitle }}</text>
        </slot>
      </view>

      <!-- 正文描述 -->
      <view v-if="desc || $slots.default" class="lk-timeline-item__desc-row">
        <slot>
          <text class="lk-timeline-item__desc">{{ desc }}</text>
        </slot>
      </view>

      <!-- 扩展插槽（图片预览 / 自定义卡片内容） -->
      <slot name="extra" />
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-timeline.scss';
</style>
