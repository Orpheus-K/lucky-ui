<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useLocale } from '../../composables/useLocale';
import { useFormDisabled } from '../lk-form/useFormField';
import {
  CalendarViewMode,
  calendarEmits,
  calendarProps,
  type CalendarDay,
  type CalendarMarker,
  type CalendarValue,
} from './calendar.props';
import {
  addCalendarDays,
  addCalendarMonths,
  createCalendarDay,
  createCalendarDays,
  createCalendarMarkerMap,
  formatCalendarDate,
  getCalendarMonthStart,
  getCalendarViewDateValue,
  normalizeCalendarValue,
  parseCalendarDate,
  resolveCalendarDateClass,
  resolveCalendarGridClass,
  resolveCalendarGridStyle,
  resolveCalendarMarkerType,
  resolveCalendarRootClass,
  resolveCalendarSelectedSummary,
  resolveCalendarWeekdays,
  resolveCalendarInitialDate,
  resolveNextCalendarValue,
  resolveCalendarDayClass,
  shouldShowCalendarMarkers,
} from './calendar.utils';

defineOptions({ name: 'LkCalendar' });

const props = defineProps(calendarProps);
const emit = defineEmits(calendarEmits);
const { t } = useLocale('calendar');
const formDisabled = useFormDisabled(() => props.disabled);
const isDisabled = formDisabled.disabled;

const fallbackMonthNames = [
  '一月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '十一月',
  '十二月',
];
const fallbackWeekdayNames = ['日', '一', '二', '三', '四', '五', '六'];
const SWIPE_THRESHOLD = 50;
const SWIPE_LOCK_THRESHOLD = 8;
const SWIPE_MAX_OFFSET = 72;

type CalendarTouchEvent = {
  changedTouches?: ArrayLike<{
    clientX?: number;
    clientY?: number;
    pageX?: number;
    pageY?: number;
  }>;
  touches?: ArrayLike<{ clientX?: number; clientY?: number; pageX?: number; pageY?: number }>;
};

function formatDate(date: Date) {
  return formatCalendarDate(date);
}

function parseDate(value: string) {
  return parseCalendarDate(value);
}

function addDays(date: Date, amount: number) {
  return addCalendarDays(date, amount);
}

function addMonths(date: Date, amount: number) {
  return addCalendarMonths(date, amount);
}

function monthStart(date: Date) {
  return getCalendarMonthStart(date);
}

function normalizeValue(value: CalendarValue): string[] {
  return normalizeCalendarValue(value);
}

function resolveInitialDate() {
  return resolveCalendarInitialDate({
    viewDate: props.viewDate,
    modelValue: props.modelValue,
  });
}

const today = formatDate(new Date());
const initialDate = resolveInitialDate();
const cursor = ref(
  props.viewMode === CalendarViewMode.Week ? initialDate : monthStart(initialDate)
);
const dragOffset = ref(0);
const isDragging = ref(false);
const isSwitching = ref(false);
const switchDirection = ref<'prev' | 'next'>('next');
const ignoreNextTap = ref(false);
let switchStartTimer: ReturnType<typeof setTimeout> | null = null;
let switchTimer: ReturnType<typeof setTimeout> | null = null;
let panelGeneration = 0;
let ignoreTapTimer: ReturnType<typeof setTimeout> | null = null;
const touchState = {
  startX: 0,
  startY: 0,
  deltaX: 0,
  deltaY: 0,
  tracking: false,
  locked: false,
  interaction: null as number | null,
};

const markerMap = computed(() => {
  return createCalendarMarkerMap(props.markers);
});

const selectedValues = computed(() => normalizeValue(props.modelValue));
const monthNames = computed(() => {
  const values = t<string[]>('months');
  return Array.isArray(values) && values.length >= 12 ? values : fallbackMonthNames;
});
const weekdayNames = computed(() => {
  const values = t<string[]>('weekdays');
  return Array.isArray(values) && values.length >= 7 ? values : fallbackWeekdayNames;
});
const weekdays = computed(() => {
  return resolveCalendarWeekdays({
    weekdayNames: weekdayNames.value,
    firstDayOfWeek: props.firstDayOfWeek,
  });
});
const viewDateValue = computed(() => getCalendarViewDateValue(cursor.value));
const panelTitle = computed(() => props.title || monthNames.value[cursor.value.getMonth()]);
const panelSubTitle = computed(() => {
  if (!props.showYear) return '';
  return `${cursor.value.getFullYear()}`;
});

const selectedSummary = computed(() => {
  const values = selectedValues.value;
  return resolveCalendarSelectedSummary({
    values,
    mode: props.mode,
    selectDateText: t('selectDate'),
    selectEndDateText: t('selectEndDate'),
    rangeSeparator: t('rangeSeparator'),
    multipleSelectedText: t('multipleSelected', { count: values.length }),
  });
});

const cls = computed(() => [
  ...resolveCalendarRootClass({
    size: props.size,
    mode: props.mode,
    viewMode: props.viewMode,
    disabled: isDisabled.value,
    readonly: props.readonly,
    customClass: props.customClass,
  }),
]);
const style = computed(() => props.customStyle as StyleValue);
const gridStyle = computed(
  () =>
    resolveCalendarGridStyle({
      dragOffset: dragOffset.value,
      dragging: isDragging.value,
      switching: isSwitching.value,
    }) as StyleValue
);
const gridClass = computed(() => [
  ...resolveCalendarGridClass({
    dragging: isDragging.value,
    switching: isSwitching.value,
    switchDirection: switchDirection.value,
  }),
]);

function createDay(date: Date): CalendarDay {
  return createCalendarDay({
    date,
    cursor: cursor.value,
    today,
    values: selectedValues.value,
    mode: props.mode,
    viewMode: props.viewMode,
    firstDayOfWeek: props.firstDayOfWeek,
    disabled: isDisabled.value,
    minDate: props.minDate,
    maxDate: props.maxDate,
    disabledDates: props.disabledDates,
    showAdjacentDays: props.showAdjacentDays,
    markerMap: markerMap.value,
  });
}

const days = computed(() => {
  return createCalendarDays({
    viewMode: props.viewMode,
    cursor: cursor.value,
    firstDayOfWeek: props.firstDayOfWeek,
    createDay,
  });
});

async function emitPanelChange(interaction: number, generation: number) {
  if (!formDisabled.isInteractionCurrent(interaction) || generation !== panelGeneration) return;
  const value = viewDateValue.value;
  const week =
    props.viewMode === CalendarViewMode.Week && days.value.length
      ? {
          start: days.value[0].date,
          end: days.value[days.value.length - 1].date,
          viewDate: value,
        }
      : null;
  const panel = {
    year: cursor.value.getFullYear(),
    month: cursor.value.getMonth() + 1,
  };
  emit('update:viewDate', value);
  if (!(await formDisabled.awaitInteractionCurrent(interaction))) return;
  if (generation !== panelGeneration) return;
  emit('month-change', value);
  if (!(await formDisabled.awaitInteractionCurrent(interaction))) return;
  if (generation !== panelGeneration) return;
  if (week) {
    emit('week-change', week);
    if (!(await formDisabled.awaitInteractionCurrent(interaction))) return;
    if (generation !== panelGeneration) return;
  }
  emit('panel-change', panel);
}

function stopSwitchAnimation() {
  if (switchStartTimer) clearTimeout(switchStartTimer);
  if (switchTimer) clearTimeout(switchTimer);
  switchStartTimer = null;
  switchTimer = null;
  isSwitching.value = false;
}

function playSwitchAnimation(amount: number) {
  if (!amount) return;
  switchDirection.value = amount > 0 ? 'next' : 'prev';
  stopSwitchAnimation();
  switchStartTimer = setTimeout(() => {
    isSwitching.value = true;
    switchStartTimer = null;
    switchTimer = setTimeout(() => {
      isSwitching.value = false;
      switchTimer = null;
    }, 260);
  }, 0);
}

async function movePanel(
  amount: number,
  animate = true,
  interaction = formDisabled.captureInteraction()
) {
  if (!formDisabled.isInteractionCurrent(interaction)) return;
  const generation = ++panelGeneration;
  cursor.value =
    props.viewMode === CalendarViewMode.Week
      ? addDays(cursor.value, amount * 7)
      : addMonths(cursor.value, amount);
  if (animate) playSwitchAnimation(amount);
  await emitPanelChange(interaction, generation);
}

function moveMonth(amount: number) {
  void movePanel(amount);
}

async function goToday() {
  const interaction = formDisabled.captureInteraction();
  if (!formDisabled.isInteractionCurrent(interaction)) return;
  const generation = ++panelGeneration;
  const now = new Date();
  const direction = now.getTime() >= cursor.value.getTime() ? 1 : -1;
  cursor.value = props.viewMode === CalendarViewMode.Week ? now : monthStart(now);
  playSwitchAnimation(direction);
  await emitPanelChange(interaction, generation);
}

function getTouchPoint(event: CalendarTouchEvent) {
  const touch = event.changedTouches?.[0] || event.touches?.[0];
  if (!touch) return null;
  return {
    x: touch.clientX ?? touch.pageX ?? 0,
    y: touch.clientY ?? touch.pageY ?? 0,
  };
}

function resetSwipe() {
  touchState.tracking = false;
  touchState.locked = false;
  touchState.deltaX = 0;
  touchState.deltaY = 0;
  touchState.interaction = null;
  isDragging.value = false;
  dragOffset.value = 0;
}

function suppressNextTap() {
  ignoreNextTap.value = true;
  if (ignoreTapTimer) clearTimeout(ignoreTapTimer);
  ignoreTapTimer = setTimeout(() => {
    ignoreNextTap.value = false;
    ignoreTapTimer = null;
  }, 120);
}

function onTouchStart(event: CalendarTouchEvent) {
  if (!props.swipeable || isDisabled.value) return;
  const point = getTouchPoint(event);
  if (!point) return;
  touchState.startX = point.x;
  touchState.startY = point.y;
  touchState.deltaX = 0;
  touchState.deltaY = 0;
  touchState.tracking = true;
  touchState.locked = false;
  touchState.interaction = formDisabled.captureInteraction();
}

function onTouchMove(event: CalendarTouchEvent) {
  if (
    !touchState.tracking ||
    !props.swipeable ||
    touchState.interaction === null ||
    !formDisabled.isInteractionCurrent(touchState.interaction)
  ) {
    resetSwipe();
    return;
  }
  const point = getTouchPoint(event);
  if (!point) return;

  touchState.deltaX = point.x - touchState.startX;
  touchState.deltaY = point.y - touchState.startY;
  const absX = Math.abs(touchState.deltaX);
  const absY = Math.abs(touchState.deltaY);

  if (!touchState.locked) {
    if (absX < SWIPE_LOCK_THRESHOLD && absY < SWIPE_LOCK_THRESHOLD) return;
    if (absX <= absY * 1.15) {
      resetSwipe();
      return;
    }
    touchState.locked = true;
  }

  isDragging.value = true;
  dragOffset.value = Math.max(
    -SWIPE_MAX_OFFSET,
    Math.min(SWIPE_MAX_OFFSET, touchState.deltaX * 0.36)
  );
}

function onTouchEnd() {
  if (
    !touchState.tracking ||
    !props.swipeable ||
    touchState.interaction === null ||
    !formDisabled.isInteractionCurrent(touchState.interaction)
  ) {
    resetSwipe();
    return;
  }

  const shouldMove =
    touchState.locked &&
    Math.abs(touchState.deltaX) >= SWIPE_THRESHOLD &&
    Math.abs(touchState.deltaX) > Math.abs(touchState.deltaY) * 1.15;
  const direction = touchState.deltaX < 0 ? 1 : -1;
  const interaction = touchState.interaction;

  resetSwipe();
  if (shouldMove) {
    suppressNextTap();
    void movePanel(direction, true, interaction);
  }
}

function nextValue(day: CalendarDay): CalendarValue {
  return resolveNextCalendarValue({
    day,
    mode: props.mode,
    selectedValues: selectedValues.value,
    minDate: props.minDate,
    maxDate: props.maxDate,
    disabledDates: props.disabledDates,
  });
}

async function selectDay(day: CalendarDay) {
  if (ignoreNextTap.value) {
    ignoreNextTap.value = false;
    return;
  }
  if (day.isDisabled) {
    emit('click-disabled', day);
    return;
  }
  if (props.readonly) return;

  const interaction = formDisabled.captureInteraction();
  if (!formDisabled.isInteractionCurrent(interaction)) return;
  const value = nextValue(day);
  emit('update:modelValue', value);
  if (!(await formDisabled.awaitInteractionCurrent(interaction))) return;
  emit('select', day);
  if (!(await formDisabled.awaitInteractionCurrent(interaction))) return;
  emit('change', value, day);
}

function dayClass(day: CalendarDay) {
  return resolveCalendarDayClass({
    day,
    showAdjacentDays: props.showAdjacentDays,
    viewMode: props.viewMode,
  });
}

function dateClass(day: CalendarDay) {
  return resolveCalendarDateClass({
    day,
    viewMode: props.viewMode,
  });
}

function shouldShowMarkers(day: CalendarDay) {
  return shouldShowCalendarMarkers({
    day,
    showAdjacentDays: props.showAdjacentDays,
  });
}

function markerType(day: CalendarDay, marker: CalendarMarker) {
  return resolveCalendarMarkerType({
    day,
    marker,
    todayText: t('today'),
  });
}

watch(
  () => props.viewDate,
  value => {
    const next = parseDate(value);
    if (!next) return;
    const nextCursor = props.viewMode === CalendarViewMode.Week ? next : monthStart(next);
    if (getCalendarViewDateValue(nextCursor) !== viewDateValue.value) panelGeneration += 1;
    cursor.value = nextCursor;
  }
);

watch(
  isDisabled,
  disabled => {
    if (!disabled) return;
    panelGeneration += 1;
    stopSwitchAnimation();
    resetSwipe();
    ignoreNextTap.value = false;
    if (ignoreTapTimer) {
      clearTimeout(ignoreTapTimer);
      ignoreTapTimer = null;
    }
  },
  { flush: 'sync' }
);

onBeforeUnmount(() => {
  panelGeneration += 1;
  stopSwitchAnimation();
  if (ignoreTapTimer) clearTimeout(ignoreTapTimer);
});
</script>

<template>
  <view :id="id" :class="cls" :style="style" :aria-disabled="isDisabled">
    <slot
      v-if="showHeader"
      name="header"
      :title="panelTitle"
      :subtitle="panelSubTitle"
      :view-date="viewDateValue"
      :summary="selectedSummary"
      :prev="() => moveMonth(-1)"
      :next="() => moveMonth(1)"
      :today="goToday"
    >
      <view class="lk-calendar__header">
        <view class="lk-calendar__header-main">
          <view class="lk-calendar__heading">
            <text class="lk-calendar__title">{{ panelTitle }}</text>
            <text v-if="panelSubTitle" class="lk-calendar__subtitle">{{ panelSubTitle }}</text>
          </view>
        </view>
        <view class="lk-calendar__actions">
          <text class="lk-calendar__summary">{{ selectedSummary }}</text>
          <view v-if="showToday" class="lk-calendar__today" @tap="goToday">{{ t('today') }}</view>
        </view>
      </view>
    </slot>

    <view v-if="viewMode === CalendarViewMode.Month" class="lk-calendar__weekdays">
      <text v-for="weekday in weekdays" :key="weekday" class="lk-calendar__weekday">
        {{ weekday }}
      </text>
    </view>

    <view
      class="lk-calendar__grid-wrap"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
    >
      <view :class="gridClass" :style="gridStyle">
        <view
          v-for="day in days"
          :key="day.date"
          :class="dayClass(day)"
          :data-date="day.date"
          @tap="selectDay(day)"
        >
          <slot name="day" :day="day">
            <view class="lk-calendar__day-core">
              <text v-if="viewMode === CalendarViewMode.Week" class="lk-calendar__week-label">
                {{ weekdayNames[day.weekday] }}
              </text>
              <text
                v-if="viewMode === CalendarViewMode.Week || showAdjacentDays || day.isCurrentMonth"
                :class="dateClass(day)"
              >
                {{ day.day }}
              </text>
              <view v-if="shouldShowMarkers(day)" class="lk-calendar__markers">
                <slot name="marker" :markers="day.markers" :day="day">
                  <view
                    v-for="(marker, index) in day.markers.slice(0, 3)"
                    :key="`${day.date}-${index}`"
                    class="lk-calendar__marker"
                    :class="`lk-calendar__marker--${markerType(day, marker)}`"
                    :style="{ backgroundColor: marker.color || '' }"
                  >
                    <text
                      v-if="markerType(day, marker) === 'badge' && marker.label"
                      class="lk-calendar__marker-label"
                    >
                      {{ marker.label }}
                    </text>
                  </view>
                </slot>
              </view>
            </view>
          </slot>
        </view>
      </view>
    </view>

    <slot name="footer" :value="modelValue" :view-date="viewDateValue" />
  </view>
</template>

<style lang="scss">
@use './lk-calendar.scss';
</style>
