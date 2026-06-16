<script setup lang="ts">
import LkLoading from '@/uni_modules/lucky-ui/components/lk-loading/lk-loading.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <view class="loading-preview">
        <lk-loading />
      </view>
    </demo-block>

    <demo-block title="加载文案">
      <view class="loading-stack">
        <lk-loading text="正在加载数据" />
        <lk-loading vertical text="同步中" />
      </view>
    </demo-block>

    <demo-block title="不同尺寸">
      <view class="loading-row">
        <view class="loading-item">
          <lk-loading size="30" />
          <text>Small</text>
        </view>
        <view class="loading-item">
          <lk-loading size="40" />
          <text>Middle</text>
        </view>
        <view class="loading-item">
          <lk-loading size="56" />
          <text>Large</text>
        </view>
      </view>
    </demo-block>

    <demo-block title="自定义颜色">
      <view class="loading-row">
        <lk-loading color="var(--lk-color-primary)" text="Primary" />
        <lk-loading color="var(--lk-color-success)" text="Success" />
        <lk-loading color="var(--lk-color-warning)" text="Warning" />
      </view>
    </demo-block>

    <demo-block title="弹跳样式">
      <view class="loading-row">
        <lk-loading variant="bounce" text="弹跳加载" />
      </view>
    </demo-block>

    <demo-block title="波浪样式">
      <view class="loading-row">
        <lk-loading variant="wave" text="波浪加载" />
      </view>
    </demo-block>

    <demo-block title="环形样式">
      <view class="loading-row">
        <lk-loading variant="ring" text="环形加载" />
        <lk-loading variant="circular" text="Circular" />
      </view>
    </demo-block>

    <demo-block title="环型轨道背景">
      <view class="loading-row">
        <lk-loading variant="circular" :show-track="true" text="有轨道" />
        <lk-loading variant="circular" :show-track="false" text="无轨道" />
        <lk-loading variant="spinner" :show-track="true" text="Spinner" />
        <lk-loading variant="spinner" :show-track="false" text="无轨道" />
      </view>
      <view class="loading-row" style="margin-top: 24rpx">
        <lk-loading variant="circular" track-color="rgba(255, 0, 0, 0.1)" text="自定义轨道色" />
      </view>
    </demo-block>

    <demo-block title="省略号样式">
      <view class="loading-row">
        <lk-loading variant="ellipsis" text="省略号加载" />
      </view>
    </demo-block>

    <demo-block title="文字闪光样式">
      <view class="loading-row">
        <lk-loading variant="text" text="Loading..." />
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

.loading-row {
  display: flex;
  > :not(:first-child) {
    margin-left: 36rpx;
  }
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.loading-preview {
  display: flex;
  justify-content: center;
  padding: 16rpx 0;
}

.loading-stack {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 28rpx;
  }
  align-items: flex-start;
}

.loading-item {
  min-width: 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  > :not(:first-child) {
    margin-top: 12rpx;
  }
  color: var(--lk-text-secondary);
  font-size: 24rpx;
}
</style>
