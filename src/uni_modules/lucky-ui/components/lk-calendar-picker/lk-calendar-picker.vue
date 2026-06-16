<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, ref, watch } from 'vue';
import { useLocale } from '../../composables/useLocale';
import LkButton from '../lk-button/lk-button.vue';
import LkCalendar from '../lk-calendar/lk-calendar.vue';
import { CalendarMode, type CalendarDay, type CalendarValue } from '../lk-calendar/calendar.props';
import LkIcon from '../lk-icon/lk-icon.vue';
import LkPopup from '../lk-popup/lk-popup.vue';
import LkSlider from '../lk-slider/lk-slider.vue';
import {
  calendarPickerEmits,
  calendarPickerProps,
  type CalendarPickerValue,
} from './calendar-picker.props';
import {
  canOpenCalendarPicker,
  formatCalendarPickerTime,
  getCalendarPickerTimeMax,
  getCalendarPickerTimeStep,
  getCalendarPickerTimeUnit,
  mergeCalendarPickerTime,
  normalizeCalendarPickerValue,
  parseCalendarPickerTime,
  resolveCalendarPickerClass,
  resolveCalendarPickerDisplayValue,
  resolveCalendarPickerResetValue,
  syncCalendarPickerDraft,
} from './calendar-picker.utils';

defineOptions({ name: 'LkCalendarPicker' });

const props = defineProps(calendarPickerProps);
const emit = defineEmits(calendarPickerEmits);
const { t } = useLocale('calendarPicker');

const innerShow = ref(props.show);
const tempValue = ref<CalendarValue>(normalizePickerValue(props.modelValue));
const startTime = ref(parseTime(props.defaultStartTime, 0));
const endTime = ref(parseTime(props.defaultEndTime, 86399));
const panelDate = ref(props.viewDate);

const cls = computed(() => [
  ...resolveCalendarPickerClass({
    disabled: props.disabled,
    readonly: props.readonly,
    customClass: props.customClass,
  }),
]);
const style = computed(() => props.customStyle as StyleValue);
const resolvedTitle = computed(() => props.title || t('title'));
const resolvedPlaceholder = computed(() => props.placeholder || t('placeholder'));
const resolvedConfirmText = computed(() => props.confirmText || t('confirm'));
const resolvedResetText = computed(() => props.resetText || t('reset'));
const hasValue = computed(() => normalizePickerValue(props.modelValue).length > 0);
const displayValue = computed(() => {
  const values = normalizePickerValue(props.modelValue);
  return resolveCalendarPickerDisplayValue({
    modelValue: props.modelValue,
    mode: props.mode,
    placeholder: resolvedPlaceholder.value,
    rangeSeparator: t('rangeSeparator'),
    multipleSelectedText: t('multipleSelected', { count: values.length }),
  });
});
const confirmDisabled = computed(() => normalizePickerValue(tempValue.value).length === 0);
const timeUnit = computed(() => getCalendarPickerTimeUnit(props.timePrecision));
const timeMax = computed(() => getCalendarPickerTimeMax(timeUnit.value));
const timeStep = computed(() =>
  getCalendarPickerTimeStep({
    timeStep: props.timeStep,
    timeUnit: timeUnit.value,
  })
);
const shouldShowEndTime = computed(() => props.showTime && props.mode === CalendarMode.Range);
const endTimeDisabled = computed(() => normalizePickerValue(tempValue.value).length < 2);

function normalizePickerValue(value: CalendarPickerValue): string[] {
  return normalizeCalendarPickerValue(value);
}

function parseTime(value: string, fallback: number) {
  return parseCalendarPickerTime(value, fallback);
}

function formatTime(value: number) {
  return formatCalendarPickerTime({
    value,
    precision: props.timePrecision,
  });
}

function mergeTime(value: CalendarValue): CalendarPickerValue {
  return mergeCalendarPickerTime({
    value,
    showTime: props.showTime,
    mode: props.mode,
    startTime: startTime.value,
    endTime: endTime.value,
    precision: props.timePrecision,
  });
}

function syncDraftFromValue(value: CalendarPickerValue) {
  const draft = syncCalendarPickerDraft({
    value,
    viewDate: props.viewDate,
    defaultStartTime: props.defaultStartTime,
    defaultEndTime: props.defaultEndTime,
    currentStartTime: startTime.value,
    currentEndTime: endTime.value,
  });
  tempValue.value = draft.tempValue;
  startTime.value = draft.startTime;
  endTime.value = draft.endTime;
  panelDate.value = draft.panelDate;
}

function open() {
  if (!canOpenCalendarPicker({ disabled: props.disabled, readonly: props.readonly })) return;
  syncDraftFromValue(props.modelValue);
  innerShow.value = true;
}

function close() {
  innerShow.value = false;
}

function reset() {
  const value = resolveCalendarPickerResetValue(props.mode);
  tempValue.value = value;
  startTime.value = parseTime(props.defaultStartTime, 0);
  endTime.value = parseTime(props.defaultEndTime, 86399);
  emit('update:modelValue', value);
  emit('change', value);
  emit('reset');
}

function confirm() {
  const value = mergeTime(tempValue.value);
  emit('update:modelValue', value);
  emit('change', value);
  emit('confirm', value);
  if (props.closeOnConfirm) close();
}

function onSelect(day: CalendarDay) {
  emit('select', day);
}

watch(
  () => props.show,
  value => {
    innerShow.value = value;
    if (value) syncDraftFromValue(props.modelValue);
  }
);

watch(
  () => props.modelValue,
  value => {
    if (!innerShow.value) syncDraftFromValue(value);
  },
  { deep: true }
);

watch(innerShow, value => {
  emit('update:show', value);
  if (value) {
    emit('open');
  } else {
    emit('close');
  }
});
</script>

<template>
  <view :id="id" :class="cls" :style="style">
    <slot name="trigger" :open="open" :value="modelValue" :display-value="displayValue">
      <view class="lk-calendar-picker__trigger" :class="{ 'is-empty': !hasValue }" @tap="open">
        <text class="lk-calendar-picker__trigger-text">{{ displayValue }}</text>
      </view>
    </slot>

    <lk-popup
      v-model="innerShow"
      :position="popupPosition"
      :height="popupHeight"
      :round="true"
      :closable="false"
      :close-on-overlay="closeOnOverlay"
      animation="slide-up"
    >
      <view class="lk-calendar-picker__panel">
        <view class="lk-calendar-picker__header">
          <text v-if="showReset" class="lk-calendar-picker__reset" @tap="reset">
            {{ resolvedResetText }}
          </text>
          <text v-else class="lk-calendar-picker__reset"></text>
          <text class="lk-calendar-picker__title">{{ resolvedTitle }}</text>
          <view class="lk-calendar-picker__close" @tap="close">
            <lk-icon name="x-lg" size="30" />
          </view>
        </view>

        <lk-calendar
          v-model="tempValue"
          v-model:view-date="panelDate"
          :mode="mode"
          :size="size"
          :view-mode="viewMode"
          :min-date="minDate"
          :max-date="maxDate"
          :disabled-dates="disabledDates"
          :markers="markers"
          :first-day-of-week="firstDayOfWeek"
          :show-adjacent-days="showAdjacentDays"
          :show-today="showToday"
          :show-year="showYear"
          :swipeable="swipeable"
          @select="onSelect"
        />

        <view v-if="showTime" class="lk-calendar-picker__time">
          <view class="lk-calendar-picker__time-row">
            <text class="lk-calendar-picker__time-label">
              {{ mode === CalendarMode.Range ? t('start') : t('time') }}
            </text>
            <view class="lk-calendar-picker__slider">
              <lk-slider
                v-model="startTime"
                :min="0"
                :max="timeMax"
                :step="timeStep"
                show-value
                :show-value-text="false"
                :format-value="formatTime"
                active-color="var(--lk-color-primary)"
              />
            </view>
          </view>
          <view v-if="shouldShowEndTime" class="lk-calendar-picker__time-row">
            <text class="lk-calendar-picker__time-label">{{ t('end') }}</text>
            <view class="lk-calendar-picker__slider" :class="{ 'is-disabled': endTimeDisabled }">
              <lk-slider
                v-model="endTime"
                :min="0"
                :max="timeMax"
                :step="timeStep"
                :disabled="endTimeDisabled"
                show-value
                :show-value-text="false"
                :format-value="formatTime"
                active-color="var(--lk-color-primary)"
              />
            </view>
          </view>
        </view>

        <view class="lk-calendar-picker__footer">
          <lk-button
            block
            shape="round"
            size="lg"
            :disabled="confirmDisabled"
            hover-class="none"
            @tap="confirm"
          >
            {{ resolvedConfirmText }}
          </lk-button>
        </view>
      </view>
    </lk-popup>
  </view>
</template>

<style lang="scss">
@use './lk-calendar-picker.scss';
</style>
