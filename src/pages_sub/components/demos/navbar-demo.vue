<script setup lang="ts">
import LkNavbar from '@/uni_modules/lucky-ui/components/lk-navbar/lk-navbar.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const handleBack = () => {
  uni.showToast({
    title: '点击了返回',
    icon: 'none',
  });
};

const handleMore = () => {
  uni.showToast({
    title: '点击了更多',
    icon: 'none',
  });
};
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础导航">
      <lk-navbar title="页面标题" subtitle="清晰、轻量、适合普通页面" :fixed="false" />
    </demo-block>

    <demo-block title="详情导航">
      <lk-navbar
        title="订单详情"
        subtitle="已同步最新状态"
        left-text="返回"
        right-text="更多"
        :fixed="false"
        @click-left="handleBack"
        @click-right="handleMore"
      />
    </demo-block>

    <demo-block title="左对齐标题">
      <lk-navbar
        title="发现灵感"
        subtitle="为你推荐新内容"
        title-align="left"
        :show-back="false"
        :fixed="false"
      >
        <template #left>
          <lk-icon name="house-fill" size="36" />
        </template>
      </lk-navbar>
    </demo-block>

    <demo-block title="自定义操作区">
      <lk-navbar title="消息中心" subtitle="3 条未读提醒" :fixed="false">
        <template #right>
          <lk-icon name="search" size="36" />
          <lk-icon name="three-dots-vertical" size="36" />
        </template>
      </lk-navbar>
    </demo-block>

    <demo-block title="自定义中间">
      <lk-navbar :fixed="false" variant="frosted">
        <template #left>
          <lk-icon name="house-fill" size="36" />
        </template>
        <template #center>
          <view class="demo-search">搜索组件、文档、示例</view>
        </template>
        <template #right>
          <lk-icon name="search" size="36" />
        </template>
      </lk-navbar>
    </demo-block>

    <demo-block title="浮层导航">
      <lk-navbar
        title="资产看板"
        subtitle="浮层卡片式导航"
        variant="elevated"
        title-align="left"
        :fixed="false"
        :show-back="false"
        shadow
      >
        <template #right>
          <lk-icon name="bell" size="36" />
        </template>
      </lk-navbar>
    </demo-block>

    <demo-block title="沉浸背景">
      <view class="demo-hero">
        <lk-navbar
          title="旅行计划"
          subtitle="周末出发，轻松抵达"
          background="linear-gradient(to right, var(--lk-color-primary), var(--lk-color-success))"
          :fixed="false"
          :show-back="false"
          :border="false"
        >
          <template #right>
            <lk-icon name="share" size="36" />
          </template>
        </lk-navbar>
        <view class="demo-hero__content">优雅导航可以自然融入页面头图区域。</view>
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

.demo-search {
  width: 360rpx;
  height: var(--lk-rpx-64);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--lk-radius-full);
  background: var(--lk-fill-tertiary);
  color: var(--lk-text-secondary);
  font-size: var(--lk-font-size-sm);
}

.demo-hero {
  border-radius: var(--lk-radius-xl);
  overflow: hidden;
  background: var(--lk-color-primary-soft);
}

.demo-hero__content {
  padding: var(--lk-spacing-lg);
  color: var(--lk-text-secondary);
  font-size: var(--lk-font-size-sm);
}
</style>
