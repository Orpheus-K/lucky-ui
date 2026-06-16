<script setup lang="ts">
import { ref, computed } from 'vue';
import { useThemeStore } from '@/stores/theme';
import LkNavbar from '@/uni_modules/lucky-ui/components/lk-navbar/lk-navbar.vue';
import LkCard from '@/uni_modules/lucky-ui/components/lk-card/lk-card.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';

const themeStore = useThemeStore();
const themeClass = computed(() => themeStore.themeClass);
const brandStyleVars = computed(() => themeStore.brandStyleVars);

const isCheckedIn = ref(false);

const goBack = () => {
  uni.navigateBack();
};

const handleCheckIn = () => {
  if (isCheckedIn.value) return;
  isCheckedIn.value = true;
  uni.showToast({ title: '签到成功 +10 积分', icon: 'success' });
};
</script>

<template>
  <view class="page-container" :class="themeClass" :style="brandStyleVars">
    <lk-navbar title="每日签到" @back="goBack" />

    <lk-space class="check-in-page" direction="vertical" :gap="24" fill>
      <lk-card class="check-in-card" padding="40rpx">
        <view class="check-in-header">
          <text class="points">当前积分: 1,204</text>
          <text class="streak">连续签到: 7 天</text>
        </view>

        <lk-button type="primary" block radius="40" size="lg" @click="handleCheckIn">
          {{ isCheckedIn ? '今日已签到' : '立即签到' }}
        </lk-button>
      </lk-card>

      <lk-card title="签到日历" padding="30rpx">
        <view class="calendar-placeholder">
          <lk-icon name="calendar-check" size="80" color="var(--test-primary)" />
          <text class="placeholder-text">日历功能开发中...</text>
        </view>
      </lk-card>
    </lk-space>
  </view>
</template>
<style lang="scss" scoped>
@use '@/styles/test-page.scss' as test;

.page-container {
  width: 100%;
  min-height: 100vh;
  background: test.$test-bg-page;
}

.check-in-page {
  padding: 20rpx;
  box-sizing: border-box;
}

.check-in-card {
  .check-in-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 40rpx;

    .points {
      font-size: 30rpx;
      font-weight: bold;
      color: test.$test-text-primary;
    }

    .streak {
      font-size: 26rpx;
      color: test.$test-primary;
    }
  }
}

.calendar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300rpx;

  .placeholder-text {
    margin-top: 16rpx;
    font-size: 26rpx;
    color: test.$test-text-tertiary;
  }
}
</style>
