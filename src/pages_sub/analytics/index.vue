<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@/stores/theme';
import LkNavbar from '@/uni_modules/lucky-ui/components/lk-navbar/lk-navbar.vue';
import LkCard from '@/uni_modules/lucky-ui/components/lk-card/lk-card.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';

const themeStore = useThemeStore();
const themeClass = computed(() => themeStore.themeClass);
const brandStyleVars = computed(() => themeStore.brandStyleVars);

const stats = [
  { value: '¥1,234', label: '总消费' },
  { value: '12', label: '订单数' },
  { value: '¥102', label: '平均单价' },
  { value: '3', label: '待评价' },
];

const goBack = () => {
  uni.navigateBack();
};
</script>

<template>
  <view class="page-container" :class="themeClass" :style="brandStyleVars">
    <lk-navbar title="数据分析" @back="goBack" />

    <view class="analytics-page">
      <lk-card title="本月概览" padding="30rpx">
        <view class="stats-grid">
          <view v-for="stat in stats" :key="stat.label" class="stat-item">
            <text class="stat-value">{{ stat.value }}</text>
            <text class="stat-label">{{ stat.label }}</text>
          </view>
        </view>
      </lk-card>

      <lk-card title="消费趋势" padding="30rpx">
        <view class="chart-placeholder">
          <lk-icon name="bar-chart" size="80" color="var(--test-text-tertiary)" />
          <text class="placeholder-text">图表功能开发中...</text>
        </view>
      </lk-card>
    </view>
  </view>
</template>
<style lang="scss" scoped>
@use '@/styles/test-page.scss' as test;

.page-container {
  width: 100%;
  min-height: 100vh;
  background: test.$test-bg-page;
}

.analytics-page {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 24rpx;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  > :not(.preview-spacing-placeholder) {
    margin: 12rpx;
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  background: test.$test-gray-50;
  border-radius: 16rpx;

  .stat-value {
    font-size: 36rpx;
    font-weight: bold;
    color: test.$test-text-primary;
  }

  .stat-label {
    font-size: 24rpx;
    color: test.$test-text-secondary;
    margin-top: 8rpx;
  }
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300rpx;
  > :not(:first-child) {
    margin-top: 16rpx;
  }

  .placeholder-text {
    font-size: 26rpx;
    color: test.$test-text-tertiary;
  }
}
</style>
