<script setup lang="ts">
import { ref } from 'vue';
import { usePagePullRefresh } from '@/uni_modules/lucky-ui/composables/usePagePullRefresh';

interface PageItem {
  id: number;
  title: string;
  desc: string;
}

const refreshing = ref(false);
const refreshedAt = ref('尚未刷新');
const pageItems = ref<PageItem[]>(createItems('初始'));

function createItems(prefix: string) {
  return Array.from({ length: 10 }, (_, index) => ({
    id: Date.now() + index,
    title: `${prefix}记录 ${index + 1}`,
    desc: ['客户画像更新', '支付状态同步', '仓储节点回传', '运营指标汇总'][index % 4],
  }));
}

usePagePullRefresh(refreshing, {
  async onRefresh() {
    await wait(900);
    const time = new Date();
    refreshedAt.value = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
    pageItems.value = createItems('页面刷新');
  },
  onError() {
    uni.showToast({ title: '刷新失败', icon: 'none' });
  },
});

function wait(duration: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, duration);
  });
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}
</script>

<template>
  <view class="page-refresh-demo">
    <view class="hero">
      <text class="hero-kicker">Native Pull Refresh</text>
      <text class="hero-title">页面级下拉刷新</text>
      <text class="hero-desc">下拉当前页面，触发 usePagePullRefresh 管理刷新态。</text>
      <view class="hero-meta">
        <text class="hero-pill">{{ refreshing ? '刷新中' : '空闲' }}</text>
        <text class="hero-pill">最近刷新 {{ refreshedAt }}</text>
      </view>
    </view>

    <view class="list">
      <view v-for="item in pageItems" :key="item.id" class="item">
        <view class="item-index">{{ item.id % 100 }}</view>
        <view class="item-main">
          <text class="item-title">{{ item.title }}</text>
          <text class="item-desc">{{ item.desc }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page-refresh-demo {
  min-height: 130vh;
  padding: 28rpx;
  box-sizing: border-box;
  background: var(--lk-bg-page);
}

.hero {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 12rpx;
  }
  padding: 34rpx;
  border-radius: var(--lk-radius-xl);
  color: var(--lk-text-primary);
  background: linear-gradient(135deg, rgba(105, 101, 219, 0.12), rgba(24, 144, 255, 0.08));
}

.hero-kicker {
  color: var(--lk-color-primary);
  font-size: 22rpx;
  font-weight: 800;
}

.hero-title {
  font-size: 42rpx;
  font-weight: 900;
  line-height: 1.16;
}

.hero-desc {
  color: var(--lk-text-secondary);
  font-size: 25rpx;
  line-height: 1.5;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  > :not(.preview-spacing-placeholder) {
    margin: 6rpx;
  }
  margin-top: 8rpx;
}

.hero-pill {
  padding: 8rpx 14rpx;
  border-radius: var(--lk-radius-full);
  color: var(--lk-color-primary);
  background: rgba(var(--lk-brand-rgb), 0.1);
  font-size: 22rpx;
  font-weight: 700;
}

.list {
  margin-top: 24rpx;
}

.item {
  display: flex;
  align-items: center;
  > :not(:first-child) {
    margin-left: 20rpx;
  }
  padding: 24rpx;
  border-radius: var(--lk-radius-lg);
  background: var(--lk-bg-container);
  box-shadow: 0 4rpx 18rpx rgba(15, 23, 42, 0.05);

  &:not(:first-child) {
    margin-top: 18rpx;
  }
}

.item-index {
  width: 58rpx;
  height: 58rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--lk-radius-md);
  color: var(--lk-color-primary);
  background: rgba(var(--lk-brand-rgb), 0.1);
  font-size: 24rpx;
  font-weight: 800;
}

.item-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 8rpx;
  }
}

.item-title {
  color: var(--lk-text-primary);
  font-size: 28rpx;
  font-weight: 800;
}

.item-desc {
  color: var(--lk-text-secondary);
  font-size: 24rpx;
}
</style>
