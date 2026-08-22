<script setup lang="ts">
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkHorizontalScroll from '@/uni_modules/lucky-ui/components/lk-horizontal-scroll/lk-horizontal-scroll.vue';

const nearbyCards = [
  {
    name: '滨江咖啡所',
    meta: '1.2km · 4.8',
    tag: '第二杯半价',
    color: 'coffee',
  },
  {
    name: '城市轻食',
    meta: '800m · 32 分钟',
    tag: '满 45 减 10',
    color: 'fresh',
  },
  {
    name: '周末展览',
    meta: '3.4km · 预约制',
    tag: '新展上线',
    color: 'gallery',
  },
  {
    name: '健身私教',
    meta: '2.1km · 体验课',
    tag: '新人 1 元',
    color: 'fitness',
  },
];
</script>

<template>
  <view class="horizontal-scroll-demo">
    <demo-block title="附近可用权益">
      <lk-horizontal-scroll gap="20rpx" padding="0rpx">
        <view
          v-for="item in nearbyCards"
          :key="item.name"
          class="nearby-card"
          :class="`nearby-card--${item.color}`"
        >
          <view class="nearby-card__media">
            <text class="nearby-card__tag">{{ item.tag }}</text>
          </view>
          <view class="nearby-card__body">
            <text class="nearby-card__name">{{ item.name }}</text>
            <text class="nearby-card__meta">{{ item.meta }}</text>
          </view>
        </view>
      </lk-horizontal-scroll>
    </demo-block>
  </view>
</template>

<style lang="scss" scoped>
.horizontal-scroll-demo {
  min-height: 100vh;
  margin-top: calc(var(--lk-rpx-12) * -1);
  padding-bottom: var(--lk-rpx-80);
  background: var(--lk-bg-page);

  :deep(.demo-block) {
    padding-top: var(--lk-rpx-32);
    padding-bottom: var(--lk-rpx-40);
  }

  :deep(.demo-block > view:not(:first-child)) {
    margin-top: var(--lk-rpx-24);
  }

  :deep(.demo-block + .demo-block) {
    margin-top: var(--lk-rpx-40);
  }

  :deep(.demo-block__body > view:not(:first-child)) {
    margin-top: 0;
  }
}

.nearby-card {
  flex: none;
  width: 560rpx;
  height: 328rpx;
  overflow: hidden;
  border-radius: var(--lk-radius-xl);
  background: var(--lk-bg-container);
  border: var(--lk-rpx-1) solid var(--lk-color-border-light);
  box-shadow: var(--lk-shadow-sm);

  &__media {
    position: relative;
    height: 196rpx;
    background: var(--card-bg);
  }

  &__media::after {
    content: '';
    position: absolute;
    right: var(--lk-rpx-28);
    bottom: calc(var(--lk-rpx-24) * -1);
    width: 104rpx;
    height: 104rpx;
    border-radius: var(--lk-radius-full);
    background: rgba(255, 255, 255, 0.38);
  }

  &__tag {
    position: absolute;
    left: var(--lk-spacing-md);
    bottom: var(--lk-spacing-md);
    padding: var(--lk-rpx-6) var(--lk-rpx-12);
    border-radius: var(--lk-radius-full);
    color: var(--lk-text-inverse);
    background: rgba(0, 0, 0, 0.38);
    font-size: var(--lk-font-size-xs);
  }

  &__body {
    height: 132rpx;
    box-sizing: border-box;
    padding: var(--lk-spacing-md);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  &__name,
  &__meta {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__name {
    color: var(--lk-text-primary);
    font-size: var(--lk-font-size-base);
    font-weight: 700;
  }

  &__meta {
    margin-top: var(--lk-rpx-8);
    color: var(--lk-text-secondary);
    font-size: var(--lk-font-size-xs);
  }

  &--coffee {
    --card-bg: linear-gradient(135deg, #77604e, #d9b996);
  }

  &--fresh {
    --card-bg: linear-gradient(135deg, #27785f, #9bd7a9);
  }

  &--gallery {
    --card-bg: linear-gradient(135deg, #5f54a4, #e1a5c4);
  }

  &--fitness {
    --card-bg: linear-gradient(135deg, #343a4e, #77b7d7);
  }
}
</style>
