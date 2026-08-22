<script setup lang="ts">
import { ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkLoading from '@/uni_modules/lucky-ui/components/lk-loading/lk-loading.vue';
import LkPullRefresh from '@/uni_modules/lucky-ui/components/lk-pull-refresh/lk-pull-refresh.vue';

interface FeedItem {
  id: number;
  title: string;
  desc: string;
}

const refreshing = ref(false);
const dotsRefreshing = ref(false);
const slotRefreshing = ref(false);
const updateIndex = ref(1);
const list = ref<FeedItem[]>(createList('初始'));

function createList(prefix: string) {
  return Array.from({ length: 6 }, (_, index) => ({
    id: Date.now() + index,
    title: `${prefix}内容 ${index + 1}`,
    desc: ['运营看板已同步', '交易链路运行正常', '库存策略已更新', '用户增长稳定'][index % 4],
  }));
}

function refreshBasic() {
  refreshing.value = true;
  setTimeout(() => {
    updateIndex.value += 1;
    list.value = createList(`第 ${updateIndex.value} 次刷新`);
    refreshing.value = false;
  }, 900);
}

function refreshDots() {
  dotsRefreshing.value = true;
  setTimeout(() => {
    list.value = createList('省略号');
    dotsRefreshing.value = false;
  }, 900);
}

function refreshSlot() {
  slotRefreshing.value = true;
  setTimeout(() => {
    list.value = createList('插槽');
    slotRefreshing.value = false;
  }, 900);
}

function openPageDemo() {
  uni.navigateTo({
    url: '/pages_sub/pull-refresh-page/index',
  });
}
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <lk-pull-refresh v-model="refreshing" height="620rpx" @refresh="refreshBasic">
        <view class="feed-list">
          <view v-for="item in list" :key="item.id" class="feed-item">
            <text class="feed-title">{{ item.title }}</text>
            <text class="feed-desc">{{ item.desc }}</text>
          </view>
        </view>
      </lk-pull-refresh>
    </demo-block>

    <demo-block title="简约省略号">
      <lk-pull-refresh v-model="dotsRefreshing" height="420rpx" @refresh="refreshDots">
        <template #text="{ status }">
          <view class="mini-indicator">
            <lk-loading v-if="status === 'refreshing'" variant="ellipsis" size="28" />
            <text v-else class="mini-indicator__text">
              {{ status === 'loosing' ? '松开刷新' : '下拉刷新' }}
            </text>
          </view>
        </template>
        <view class="compact-list">
          <view v-for="item in list.slice(0, 4)" :key="item.id" class="compact-item">
            <text>{{ item.title }}</text>
          </view>
        </view>
      </lk-pull-refresh>
    </demo-block>

    <demo-block title="简约插槽">
      <lk-pull-refresh v-model="slotRefreshing" height="420rpx" @refresh="refreshSlot">
        <template #indicator="{ status }">
          <view class="slot-indicator">
            <text class="slot-indicator__mark">{{
              status === 'refreshing' ? 'Sync' : 'Pull'
            }}</text>
          </view>
        </template>
        <view class="compact-list">
          <view v-for="item in list.slice(0, 4)" :key="item.id" class="compact-item">
            <text>{{ item.title }}</text>
          </view>
        </view>
      </lk-pull-refresh>
    </demo-block>

    <demo-block title="页面级刷新">
      <view class="page-entry">
        <view class="page-entry__copy">
          <text class="page-entry__title">原生页面下拉刷新</text>
          <text class="page-entry__desc">使用 usePagePullRefresh 封装 onPullDownRefresh。</text>
        </view>
        <lk-button size="sm" type="primary" @click="openPageDemo">打开页面</lk-button>
      </view>
    </demo-block>
  </view>
</template>

<style scoped lang="scss">
.component-demo {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 32rpx;
  }
  padding-bottom: 100rpx;
}

.feed-list,
.compact-list {
  padding: 24rpx;
}

.feed-item,
.compact-item,
.page-entry {
  border-radius: var(--lk-radius-lg);
  background: var(--lk-bg-container);
  box-shadow: 0 4rpx 18rpx rgba(15, 23, 42, 0.05);
}

.feed-item {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 8rpx;
  }
  padding: 24rpx;

  &:not(:first-child) {
    margin-top: 18rpx;
  }
}

.feed-title {
  color: var(--lk-text-primary);
  font-size: 28rpx;
  font-weight: 700;
}

.feed-desc,
.page-entry__desc {
  color: var(--lk-text-secondary);
  font-size: 24rpx;
  line-height: 1.5;
}

.compact-item {
  padding: 22rpx 24rpx;
  color: var(--lk-text-primary);

  &:not(:first-child) {
    margin-top: 14rpx;
  }
}

.mini-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48rpx;
}

.mini-indicator__text {
  color: var(--lk-text-secondary);
  font-size: 24rpx;
  font-weight: 700;
}

.slot-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48rpx;
}

.slot-indicator__mark {
  color: var(--lk-color-primary);
  font-size: 24rpx;
  font-weight: 800;
  letter-spacing: 0;
}

.page-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  > :not(:first-child) {
    margin-left: 24rpx;
  }
  padding: 28rpx;
}

.page-entry__copy {
  min-width: 0;
  flex: 1;
}

.page-entry__title {
  display: block;
  color: var(--lk-text-primary);
  font-size: 30rpx;
  font-weight: 800;
}

.page-entry__desc {
  display: block;
  margin-top: 8rpx;
}
</style>
