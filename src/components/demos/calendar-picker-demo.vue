<script setup lang="ts">
import { ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkCalendarPicker from '@/uni_modules/lucky-ui/components/lk-calendar-picker/lk-calendar-picker.vue';
import type { CalendarMarker } from '@/uni_modules/lucky-ui/components/lk-calendar/calendar.props';

const dateValue = ref('2026-05-14');
const tripValue = ref<string[]>(['2026-09-30 10:00', '2026-10-03 10:00']);

const markers: CalendarMarker[] = [
  { date: '2026-09-30', type: 'dot', color: 'var(--lk-color-primary)' },
  { date: '2026-10-03', type: 'dot', color: 'var(--lk-color-success)' },
];
</script>

<template>
  <view class="component-demo calendar-picker-demo">
    <demo-block title="日期选择器">
      <lk-calendar-picker v-model="dateValue" title="选择日期" />
      <text class="calendar-picker-demo__status">当前日期：{{ dateValue }}</text>
    </demo-block>

    <demo-block title="行程日期 + 时间滑块">
      <lk-calendar-picker
        v-model="tripValue"
        mode="range"
        title="Trip Dates"
        view-date="2026-09-30"
        :first-day-of-week="0"
        :markers="markers"
        show-time
        time-precision="minute"
        :time-step="15"
      />
      <text class="calendar-picker-demo__status">行程：{{ tripValue.join(' / ') }}</text>
    </demo-block>
  </view>
</template>

<style scoped lang="scss">
.calendar-picker-demo {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 32rpx;
  }

  &__status {
    display: block;
    margin-top: 18rpx;
    color: var(--lk-text-secondary);
    font-size: var(--lk-font-size-sm);
    line-height: var(--lk-line-height-base);
  }
}
</style>
