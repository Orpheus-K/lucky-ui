<script setup lang="ts">
import { ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkSticky from '@/uni_modules/lucky-ui/components/lk-sticky/lk-sticky.vue';

const fixed = ref(false);
</script>

<template>
  <view class="component-demo sticky-demo">
    <demo-block title="基础吸顶">
      <view class="scroll-card">
        <view class="hero">向下滚动查看吸顶栏</view>
        <lk-sticky :offset-top="0" @change="fixed = $event">
          <view class="sticky-bar" :class="{ 'is-fixed': fixed }">
            <text>项目筛选</text>
            <text class="sticky-bar__meta">{{ fixed ? '已吸顶' : '未吸顶' }}</text>
          </view>
        </lk-sticky>
        <view v-for="i in 18" :key="i" class="list-item">任务记录 {{ i }}</view>
      </view>
    </demo-block>

    <demo-block title="导航栏偏移">
      <view class="scroll-card">
        <view class="mock-navbar">模拟自定义导航栏</view>
        <view class="hero hero--compact">设置 offsetTop 后，吸顶内容会避开顶部导航。</view>
        <lk-sticky :offset-top="96">
          <view class="sticky-tabs">
            <text class="is-active">全部</text>
            <text>待处理</text>
            <text>已完成</text>
          </view>
        </lk-sticky>
        <view v-for="i in 16" :key="i" class="list-item">工单 {{ i }}</view>
      </view>
    </demo-block>

    <demo-block title="分组标题">
      <view class="scroll-card">
        <template v-for="group in ['今天', '昨天', '更早']" :key="group">
          <lk-sticky :offset-top="0">
            <view class="section-title">{{ group }}</view>
          </lk-sticky>
          <view v-for="i in 5" :key="`${group}-${i}`" class="list-item">
            {{ group }} · 消息 {{ i }}
          </view>
        </template>
      </view>
    </demo-block>

    <demo-block title="底部操作吸附">
      <view class="scroll-card scroll-card--relative">
        <view v-for="i in 14" :key="i" class="list-item">表单段落 {{ i }}</view>
        <view class="bottom-sticky">
          <text>草稿已保存</text>
          <text class="bottom-sticky__action">提交</text>
        </view>
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
}

.scroll-card {
  height: 760rpx;
  overflow-y: auto;
  border: 2rpx solid var(--lk-color-border-light);
  border-radius: var(--lk-radius-lg);
  background: var(--lk-bg-container);
}

.scroll-card--relative {
  position: relative;
  padding-bottom: 96rpx;
}

.hero {
  height: 220rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--lk-text-secondary);
  font-size: 26rpx;
  background: var(--lk-fill-1);
}

.hero--compact {
  height: 160rpx;
}

.mock-navbar {
  height: 96rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  color: var(--lk-color-primary);
  font-size: 26rpx;
  font-weight: 700;
  background: var(--lk-color-primary-soft);
}

.sticky-bar,
.sticky-tabs,
.section-title {
  background: var(--lk-bg-container);
  border-bottom: 2rpx solid var(--lk-color-border-light);
}

.sticky-bar {
  min-height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  color: var(--lk-text-primary);
  font-size: 28rpx;
  font-weight: 700;
}

.sticky-bar.is-fixed {
  box-shadow: var(--lk-shadow-sm);
}

.sticky-bar__meta {
  color: var(--lk-color-primary);
  font-size: 24rpx;
  font-weight: 600;
}

.sticky-tabs {
  display: flex;
  > :not(:first-child) {
    margin-left: 28rpx;
  }
  padding: 24rpx;
  color: var(--lk-text-secondary);
  font-size: 26rpx;
  font-weight: 600;

  .is-active {
    color: var(--lk-color-primary);
  }
}

.section-title {
  padding: 18rpx 24rpx;
  color: var(--lk-text-secondary);
  font-size: 24rpx;
  font-weight: 700;
}

.list-item {
  padding: 24rpx;
  color: var(--lk-text-primary);
  font-size: 26rpx;
  border-bottom: 2rpx solid var(--lk-color-border-light);
}

.bottom-sticky {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  color: var(--lk-text-secondary);
  font-size: 26rpx;
  background: var(--lk-bg-container);
  border-top: 2rpx solid var(--lk-color-border-light);
  box-shadow: 0 -8rpx 24rpx rgba(15, 23, 42, 0.08);
}

.bottom-sticky__action {
  color: var(--lk-color-primary);
  font-weight: 700;
}
</style>
