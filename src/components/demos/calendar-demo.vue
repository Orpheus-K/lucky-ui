<script setup lang="ts">
import { ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkCalendar from '@/uni_modules/lucky-ui/components/lk-calendar/lk-calendar.vue';
import type { CalendarMarker } from '@/uni_modules/lucky-ui/components/lk-calendar/calendar.props';

const singleValue = ref('2026-05-14');
const weekValue = ref('2026-05-01');
const rangeValue = ref<string[]>(['2026-05-18', '2026-05-22']);
const multipleValue = ref<string[]>(['2026-05-08', '2026-05-15', '2026-05-29']);

const markers: CalendarMarker[] = [
  { date: '2026-05-05', type: 'dot', color: 'var(--lk-color-success)' },
  { date: '2026-05-14', type: 'dot', color: 'var(--lk-color-primary)' },
  { date: '2026-05-20', type: 'ring', color: 'var(--lk-color-warning)' },
  { date: '2026-05-29', type: 'dot', color: 'var(--lk-color-danger)' },
];
</script>

<template>
  <view class="component-demo calendar-demo">
    <demo-block title="单行周视图">
      <lk-calendar
        v-model="weekValue"
        view-mode="week"
        view-date="2026-05-01"
        :first-day-of-week="0"
        :show-header="false"
        :markers="markers"
      />
      <text class="calendar-demo__status">当前日期：{{ weekValue }}</text>
    </demo-block>

    <demo-block title="单选日历">
      <lk-calendar v-model="singleValue" view-date="2026-05" title="五月计划" :markers="markers" />
      <text class="calendar-demo__status">当前日期：{{ singleValue }}</text>
    </demo-block>

    <demo-block title="区间选择">
      <lk-calendar
        v-model="rangeValue"
        mode="range"
        view-date="2026-05"
        min-date="2026-05-03"
        max-date="2026-05-28"
        :disabled-dates="['2026-05-12', '2026-05-13']"
        :markers="markers"
      />
      <text class="calendar-demo__status">行程区间：{{ rangeValue.join(' / ') }}</text>
    </demo-block>

    <demo-block title="多选 + 大尺寸">
      <lk-calendar
        v-model="multipleValue"
        mode="multiple"
        size="lg"
        view-date="2026-05"
        :markers="markers"
      />
      <text class="calendar-demo__status">已选：{{ multipleValue.join('、') }}</text>
    </demo-block>
  </view>
</template>

<style scoped lang="scss">
.calendar-demo {
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
