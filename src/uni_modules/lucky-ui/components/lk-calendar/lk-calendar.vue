<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, ref, watch } from 'vue';
import { useLocale } from '../../composables/useLocale';
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
let ignoreTapTimer: ReturnType<typeof setTimeout> | null = null;
const touchState = {
  startX: 0,
  startY: 0,
  deltaX: 0,
  deltaY: 0,
  tracking: false,
  locked: false,
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
    disabled: props.disabled,
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
    disabled: props.disabled,
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

function emitPanelChange() {
  const value = viewDateValue.value;
  emit('update:viewDate', value);
  emit('month-change', value);
  if (props.viewMode === CalendarViewMode.Week && days.value.length) {
    emit('week-change', {
      start: days.value[0].date,
      end: days.value[days.value.length - 1].date,
      viewDate: value,
    });
  }
  emit('panel-change', {
    year: cursor.value.getFullYear(),
    month: cursor.value.getMonth() + 1,
  });
}

function playSwitchAnimation(amount: number) {
  if (!amount) return;
  switchDirection.value = amount > 0 ? 'next' : 'prev';
  isSwitching.value = false;
  if (switchStartTimer) clearTimeout(switchStartTimer);
  if (switchTimer) clearTimeout(switchTimer);
  switchStartTimer = setTimeout(() => {
    isSwitching.value = true;
    switchStartTimer = null;
    switchTimer = setTimeout(() => {
      isSwitching.value = false;
      switchTimer = null;
    }, 260);
  }, 0);
}

function movePanel(amount: number, animate = true) {
  if (props.disabled) return;
  cursor.value =
    props.viewMode === CalendarViewMode.Week
      ? addDays(cursor.value, amount * 7)
      : addMonths(cursor.value, amount);
  if (animate) playSwitchAnimation(amount);
  emitPanelChange();
}

function moveMonth(amount: number) {
  movePanel(amount);
}

function goToday() {
  if (props.disabled) return;
  const now = new Date();
  const direction = now.getTime() >= cursor.value.getTime() ? 1 : -1;
  cursor.value = props.viewMode === CalendarViewMode.Week ? now : monthStart(now);
  playSwitchAnimation(direction);
  emitPanelChange();
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
  if (!props.swipeable || props.disabled) return;
  const point = getTouchPoint(event);
  if (!point) return;
  touchState.startX = point.x;
  touchState.startY = point.y;
  touchState.deltaX = 0;
  touchState.deltaY = 0;
  touchState.tracking = true;
  touchState.locked = false;
}

function onTouchMove(event: CalendarTouchEvent) {
  if (!touchState.tracking || !props.swipeable || props.disabled) return;
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
  if (!touchState.tracking || !props.swipeable || props.disabled) {
    resetSwipe();
    return;
  }

  const shouldMove =
    touchState.locked &&
    Math.abs(touchState.deltaX) >= SWIPE_THRESHOLD &&
    Math.abs(touchState.deltaX) > Math.abs(touchState.deltaY) * 1.15;
  const direction = touchState.deltaX < 0 ? 1 : -1;

  resetSwipe();
  if (shouldMove) {
    suppressNextTap();
    movePanel(direction);
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

function selectDay(day: CalendarDay) {
  if (ignoreNextTap.value) {
    ignoreNextTap.value = false;
    return;
  }
  if (day.isDisabled) {
    emit('click-disabled', day);
    return;
  }
  if (props.readonly) return;

  const value = nextValue(day);
  emit('update:modelValue', value);
  emit('select', day);
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
    if (next) cursor.value = props.viewMode === CalendarViewMode.Week ? next : monthStart(next);
  }
);
</script>

<template>
  <view :id="id" :class="cls" :style="style">
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
        <view v-for="day in days" :key="day.date" :class="dayClass(day)" @tap="selectDay(day)">
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
