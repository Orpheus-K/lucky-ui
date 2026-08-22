<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { pickerProps, pickerEmits, type PickerOption } from './picker.props';
import LkPopup from '../lk-popup/lk-popup.vue';
import { useLocale } from '../../composables/useLocale';
import {
  clampPickerIndex,
  dispatchPickerCancelEvents,
  dispatchPickerConfirmEvents,
  dispatchPickerSelectionEvents,
  resolvePickerColumnOffset,
  resolvePickerColumnOffsetByDelta,
  resolvePickerColumnWrapperStyle,
  resolvePickerClass,
  resolvePickerColumnSelection,
  resolvePickerColumns,
  resolvePickerDraftSelection,
  resolvePickerIndicatorStyle,
  resolvePickerItemStyle,
  resolvePickerItemLabelClass,
  resolvePickerRenderedColumn,
  resolvePickerScrollEnd,
  resolvePickerViewHeight,
  resolvePickerViewWrapStyle,
  resolvePickerSelectionSnapshot,
  type PickerRenderedColumn,
  type PickerPrimitiveValue,
} from './picker.utils';

defineOptions({ name: 'LkPicker' });

const props = defineProps(pickerProps);
const emit = defineEmits(pickerEmits);
const { t } = useLocale('picker');

const resolvedConfirmText = computed(() => props.confirmText || t('confirm'));
const resolvedCancelText = computed(() => props.cancelText || t('cancel'));

// 当前选中的索引数组
const selectedIndexes = ref<number[]>([]);
// 内部值
const innerValue = ref<(string | number)[]>([]);
const columnOffsets = ref<number[]>([]);
const columnDurations = ref<number[]>([]);
const renderedColumns = ref<PickerRenderedColumn[]>([]);
const renderedColumnTimers: Array<ReturnType<typeof setTimeout> | undefined> = [];

interface PickerTouchEvent {
  touches?: Array<{ clientY: number }>;
  changedTouches?: Array<{ clientY: number }>;
}

const touchState = {
  columnIndex: -1,
  startY: 0,
  startOffset: 0,
  startTime: 0,
  pxToRpx: 1,
};

// 计算列数据
const computedColumns = computed<PickerOption[][]>(() => {
  return resolvePickerColumns({
    mode: props.mode,
    columns: props.columns,
    innerValue: innerValue.value,
  });
});

function getPxToRpxRatio(): number {
  try {
    const info = uni.getSystemInfoSync();
    return info.windowWidth ? 750 / info.windowWidth : 1;
  } catch {
    return 1;
  }
}

function getTouchY(event: unknown, changed = false): number {
  const touchEvent = event as PickerTouchEvent;
  const points = changed ? touchEvent.changedTouches : touchEvent.touches;
  return points?.[0]?.clientY || 0;
}

function setColumnScrollState(columnIndex: number, offset: number, duration: number) {
  columnOffsets.value[columnIndex] = offset;
  columnDurations.value[columnIndex] = duration;
}

function clearRenderedColumnTimer(columnIndex: number) {
  const timer = renderedColumnTimers[columnIndex];
  if (!timer) return;
  clearTimeout(timer);
  renderedColumnTimers[columnIndex] = undefined;
}

function resolveRenderedColumn(
  columnIndex: number,
  offset?: number,
  endOffset?: number,
  fast = false
) {
  const column = computedColumns.value[columnIndex] || [];
  return resolvePickerRenderedColumn({
    column,
    offset: offset ?? columnOffsets.value[columnIndex] ?? 0,
    endOffset,
    fast,
    itemHeight: props.itemHeight,
    visibleCount: props.visibleCount,
  });
}

function setRenderedColumn(columnIndex: number, next: PickerRenderedColumn) {
  const current = renderedColumns.value[columnIndex];
  if (
    current &&
    current.virtual === next.virtual &&
    current.startIndex === next.startIndex &&
    current.options.length === next.options.length &&
    current.offsetY === next.offsetY &&
    current.totalHeight === next.totalHeight
  ) {
    return;
  }

  const columns = [...renderedColumns.value];
  columns[columnIndex] = next;
  renderedColumns.value = columns;
}

function updateRenderedColumn(
  columnIndex: number,
  offset?: number,
  endOffset?: number,
  fast = false
) {
  setRenderedColumn(columnIndex, resolveRenderedColumn(columnIndex, offset, endOffset, fast));
}

function updateRenderedColumns(skipColumnIndex = -1) {
  renderedColumns.value = computedColumns.value.map((_, columnIndex) =>
    columnIndex === skipColumnIndex && renderedColumns.value[columnIndex]
      ? renderedColumns.value[columnIndex]
      : resolveRenderedColumn(columnIndex)
  );
}

function syncColumnScrollState(indexes = selectedIndexes.value, skipColumnIndex = -1) {
  const columns = computedColumns.value;
  const nextIndexes = columns.map((column, index) =>
    clampPickerIndex(indexes[index] ?? 0, column.length)
  );
  columnOffsets.value = columns.map((column, columnIndex) => {
    if (columnIndex === skipColumnIndex && columnOffsets.value[columnIndex] !== undefined) {
      return columnOffsets.value[columnIndex];
    }
    return resolvePickerColumnOffset(nextIndexes[columnIndex] ?? 0, props.itemHeight);
  });
  columnDurations.value = columns.map((_, columnIndex) => {
    return columnIndex === skipColumnIndex ? columnDurations.value[columnIndex] || 0 : 0;
  });
  updateRenderedColumns(skipColumnIndex);
}

function scheduleRenderedColumnSettle(columnIndex: number, offset: number, duration: number) {
  clearRenderedColumnTimer(columnIndex);
  renderedColumnTimers[columnIndex] = setTimeout(() => {
    if (touchState.columnIndex !== columnIndex && columnOffsets.value[columnIndex] === offset) {
      updateRenderedColumn(columnIndex, offset);
    }
    renderedColumnTimers[columnIndex] = undefined;
  }, duration + 40);
}

function getSelectionSnapshot(indexes = selectedIndexes.value) {
  return resolvePickerSelectionSnapshot({
    mode: props.mode,
    columns: props.columns,
    resolvedColumns: computedColumns.value,
    indexes,
  });
}

function resetDraftSelection() {
  const draft = resolvePickerDraftSelection({
    mode: props.mode,
    columns: props.columns,
    modelValue: props.modelValue,
  });
  innerValue.value = draft.innerValue;
  selectedIndexes.value = draft.indexes;
  syncColumnScrollState(draft.indexes);
}

watch(
  () => [props.modelValue, props.columns, props.mode],
  () => {
    resetDraftSelection();
  },
  { immediate: true, deep: true }
);

watch(
  () => props.visible,
  (visible, oldVisible) => {
    if (visible === oldVisible) return;
    if (visible && !props.inline) {
      resetDraftSelection();
      emit('open');
    } else if (!visible && !props.inline) {
      emit('close');
    }
  }
);

watch(
  () => [props.itemHeight, props.visibleCount],
  () => {
    syncColumnScrollState();
  }
);

function commitColumnIndex(columnIndex: number, optionIndex: number) {
  const columns = computedColumns.value;
  const selection = resolvePickerColumnSelection({
    mode: props.mode,
    columns: props.columns,
    resolvedColumns: columns,
    previousIndexes: selectedIndexes.value,
    columnIndex,
    optionIndex,
  });

  selectedIndexes.value = selection.indexes;

  if (props.mode !== 'single') {
    innerValue.value = Array.isArray(selection.value)
      ? (selection.value as PickerPrimitiveValue[])
      : [];
  }

  dispatchPickerSelectionEvents({
    inline: props.inline,
    selection,
    onPick: (value, indexes, options) => emit('pick', value, indexes, options),
    onUpdateModelValue: value => emit('update:modelValue', value),
    onChange: value => emit('change', value),
  });

  nextTick(() => {
    const normalized = computedColumns.value.map((column, index) =>
      clampPickerIndex(selectedIndexes.value[index] ?? 0, column.length)
    );
    selectedIndexes.value = normalized;
    syncColumnScrollState(normalized, columnIndex);
  });
}

function onColumnTouchStart(event: unknown, columnIndex: number) {
  touchState.columnIndex = columnIndex;
  touchState.startY = getTouchY(event);
  touchState.startOffset = columnOffsets.value[columnIndex] ?? 0;
  touchState.startTime = Date.now();
  touchState.pxToRpx = getPxToRpxRatio();
  setColumnScrollState(columnIndex, touchState.startOffset, 0);
  clearRenderedColumnTimer(columnIndex);
}

function onColumnTouchMove(event: unknown, columnIndex: number) {
  if (touchState.columnIndex !== columnIndex) return;

  const column = computedColumns.value[columnIndex] || [];
  const delta = (getTouchY(event) - touchState.startY) * touchState.pxToRpx;
  const offset = resolvePickerColumnOffsetByDelta({
    startOffset: touchState.startOffset,
    delta,
    count: column.length,
    itemHeight: props.itemHeight,
  });

  setColumnScrollState(columnIndex, offset, 0);
}

function onColumnTouchEnd(event: unknown, columnIndex: number) {
  if (touchState.columnIndex !== columnIndex) return;

  const column = computedColumns.value[columnIndex] || [];
  const offset = columnOffsets.value[columnIndex] ?? 0;
  const moveDistance = (getTouchY(event, true) - touchState.startY) * touchState.pxToRpx;
  const moveDuration = Date.now() - touchState.startTime;

  touchState.columnIndex = -1;

  if (offset === touchState.startOffset) return;

  const result = resolvePickerScrollEnd({
    offset,
    startOffset: touchState.startOffset,
    moveDistance,
    moveDuration,
    count: column.length,
    itemHeight: props.itemHeight,
  });

  updateRenderedColumn(columnIndex, offset, result.offset, result.fast);
  setColumnScrollState(columnIndex, result.offset, result.duration);
  commitColumnIndex(columnIndex, result.index);
  scheduleRenderedColumnSettle(columnIndex, result.offset, result.duration);
}

function onClickItem(columnIndex: number, optionIndex: number) {
  const column = computedColumns.value[columnIndex] || [];
  const index = clampPickerIndex(optionIndex, column.length);
  const offset = resolvePickerColumnOffset(index, props.itemHeight);

  updateRenderedColumn(columnIndex, columnOffsets.value[columnIndex] ?? 0, offset);
  setColumnScrollState(columnIndex, offset, 200);
  commitColumnIndex(columnIndex, index);
  scheduleRenderedColumnSettle(columnIndex, offset, 200);
}

onBeforeUnmount(() => {
  renderedColumnTimers.forEach(timer => {
    if (timer) clearTimeout(timer);
  });
});

function onCancel() {
  resetDraftSelection();
  dispatchPickerCancelEvents({
    snapshot: getSelectionSnapshot(),
    onCancel: (value, indexes, options) => emit('cancel', value, indexes, options),
    onVisibleChange: visible => emit('update:visible', visible),
  });
}

function onConfirm() {
  dispatchPickerConfirmEvents({
    snapshot: getSelectionSnapshot(),
    onUpdateModelValue: value => emit('update:modelValue', value),
    onChange: value => emit('change', value),
    onConfirm: (value, indexes, options) => emit('confirm', value, [...indexes], options),
    onVisibleChange: visible => emit('update:visible', visible),
  });
}

/** 分层样式挂在 text 上，减少整项节点在滚动选中时的样式抖动。 */
function itemLabelClass(ci: number, oi: number): string {
  return resolvePickerItemLabelClass({
    selectedIndexes: selectedIndexes.value,
    columnIndex: ci,
    optionIndex: oi,
  });
}

// 计算滚动视窗高度
const viewHeight = computed(() =>
  resolvePickerViewHeight({
    itemHeight: props.itemHeight,
    visibleCount: props.visibleCount,
  })
);
const viewWrapStyle = computed(() => resolvePickerViewWrapStyle(props.itemHeight));
const indicatorStyle = computed(() => resolvePickerIndicatorStyle(props.itemHeight));
const cls = computed(() => [
  ...resolvePickerClass({
    inline: props.inline,
    customClass: props.customClass,
  }),
]);
const style = computed(() => props.customStyle as StyleValue);
const itemStyle = computed(() => resolvePickerItemStyle(props.itemHeight));

function columnWrapperStyle(columnIndex: number): string {
  return resolvePickerColumnWrapperStyle({
    offset: columnOffsets.value[columnIndex] ?? 0,
    duration: columnDurations.value[columnIndex] ?? 0,
    itemHeight: props.itemHeight,
    visibleCount: props.visibleCount,
  });
}
</script>

<template>
  <!-- 内联模式 -->
  <view v-if="inline" :id="id" :class="cls" :style="style">
    <view v-if="title" class="lk-picker__header">
      <text class="lk-picker__title">{{ title }}</text>
    </view>
    <view class="lk-picker__view-wrap" :style="viewWrapStyle">
      <view class="lk-picker__view" :style="{ height: viewHeight }">
        <view
          v-for="(rendered, ci) in renderedColumns"
          :key="ci"
          class="lk-picker__column"
          :style="{ height: viewHeight }"
          @touchstart="onColumnTouchStart($event, ci)"
          @touchmove.stop.prevent="onColumnTouchMove($event, ci)"
          @touchend="onColumnTouchEnd($event, ci)"
          @touchcancel="onColumnTouchEnd($event, ci)"
        >
          <view class="lk-picker__column-wrapper" :style="columnWrapperStyle(ci)">
            <view
              v-if="rendered.virtual"
              class="lk-picker__virtual"
              :style="'height: ' + rendered.totalHeight + 'rpx;'"
            >
              <view
                class="lk-picker__virtual-list"
                :style="'transform: translate3d(0, ' + rendered.offsetY + 'rpx, 0);'"
              >
                <view
                  v-for="(opt, ri) in rendered.options"
                  :key="rendered.startIndex + ri"
                  class="lk-picker__item"
                  :style="itemStyle"
                  @tap="onClickItem(ci, rendered.startIndex + ri)"
                >
                  <text :class="itemLabelClass(ci, rendered.startIndex + ri)">
                    {{ opt.label }}
                  </text>
                </view>
              </view>
            </view>

            <template v-else>
              <view
                v-for="(opt, oi) in rendered.options"
                :key="oi"
                class="lk-picker__item"
                :style="itemStyle"
                @tap="onClickItem(ci, oi)"
              >
                <text :class="itemLabelClass(ci, oi)">{{ opt.label }}</text>
              </view>
            </template>
          </view>
        </view>

        <view class="lk-picker__mask lk-picker__mask--top" />
        <view class="lk-picker__mask lk-picker__mask--bottom" />
        <view class="lk-picker__indicator" :style="indicatorStyle" />
      </view>
    </view>
  </view>

  <!-- 弹出模式 -->
  <lk-popup
    v-else
    :model-value="visible"
    position="bottom"
    :round="round"
    @update:model-value="(v: boolean) => emit('update:visible', v)"
  >
    <view :id="id" :class="cls" :style="style">
      <view class="lk-picker__toolbar">
        <view class="lk-picker__btn lk-picker__btn--cancel" @tap="onCancel">
          {{ resolvedCancelText }}
        </view>
        <view class="lk-picker__title">{{ title }}</view>
        <view class="lk-picker__btn lk-picker__btn--confirm" @tap="onConfirm">
          {{ resolvedConfirmText }}
        </view>
      </view>
      <view class="lk-picker__view-wrap" :style="viewWrapStyle">
        <view class="lk-picker__view" :style="{ height: viewHeight }">
          <view
            v-for="(rendered, ci) in renderedColumns"
            :key="ci"
            class="lk-picker__column"
            :style="{ height: viewHeight }"
            @touchstart="onColumnTouchStart($event, ci)"
            @touchmove.stop.prevent="onColumnTouchMove($event, ci)"
            @touchend="onColumnTouchEnd($event, ci)"
            @touchcancel="onColumnTouchEnd($event, ci)"
          >
            <view class="lk-picker__column-wrapper" :style="columnWrapperStyle(ci)">
              <view
                v-if="rendered.virtual"
                class="lk-picker__virtual"
                :style="'height: ' + rendered.totalHeight + 'rpx;'"
              >
                <view
                  class="lk-picker__virtual-list"
                  :style="'transform: translate3d(0, ' + rendered.offsetY + 'rpx, 0);'"
                >
                  <view
                    v-for="(opt, ri) in rendered.options"
                    :key="rendered.startIndex + ri"
                    class="lk-picker__item"
                    :style="itemStyle"
                    @tap="onClickItem(ci, rendered.startIndex + ri)"
                  >
                    <text :class="itemLabelClass(ci, rendered.startIndex + ri)">
                      {{ opt.label }}
                    </text>
                  </view>
                </view>
              </view>

              <template v-else>
                <view
                  v-for="(opt, oi) in rendered.options"
                  :key="oi"
                  class="lk-picker__item"
                  :style="itemStyle"
                  @tap="onClickItem(ci, oi)"
                >
                  <text :class="itemLabelClass(ci, oi)">{{ opt.label }}</text>
                </view>
              </template>
            </view>
          </view>

          <view class="lk-picker__mask lk-picker__mask--top" />
          <view class="lk-picker__mask lk-picker__mask--bottom" />
          <view class="lk-picker__indicator" :style="indicatorStyle" />
        </view>
      </view>
    </view>
  </lk-popup>
</template>

<style lang="scss">
@use './lk-picker.scss';
</style>
