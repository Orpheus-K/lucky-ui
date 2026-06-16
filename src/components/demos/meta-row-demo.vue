<script setup lang="ts">
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkAvatar from '@/uni_modules/lucky-ui/components/lk-avatar/lk-avatar.vue';
import LkMetaRow from '@/uni_modules/lucky-ui/components/lk-meta-row/lk-meta-row.vue';

const records = [
  { id: 1, title: 'Uber Taxi', subtitle: 'Transport', amount: '-$13.55', icon: 'car-front-fill' },
  {
    id: 2,
    title: 'Skydine',
    subtitle: 'Cafes & Restaurant',
    amount: '-$75.40',
    icon: 'cup-hot-fill',
  },
  { id: 3, title: 'Spotify', subtitle: 'Yesterday', amount: '-$90.40', icon: 'music-note-beamed' },
];
</script>

<template>
  <view class="meta-row-demo">
    <demo-block title="基础用法">
      <lk-meta-row>
        <template #start>
          <lk-avatar shape="rounded" size="72" icon="person-fill" />
        </template>
        <template #main-top>
          <text class="meta-row-demo__title">主标题</text>
        </template>
        <template #main-bottom>
          <text class="meta-row-demo__subtitle">副标题信息</text>
        </template>
        <template #end>
          <text class="meta-row-demo__amount">-$12.88</text>
        </template>
      </lk-meta-row>
    </demo-block>

    <demo-block title="交易记录列表">
      <view class="meta-row-demo__list">
        <lk-meta-row
          v-for="item in records"
          :key="item.id"
          :main-gap="4"
          :gap="18"
          :start-width="72"
        >
          <template #start>
            <lk-avatar shape="rounded" size="72" :icon="item.icon" />
          </template>
          <template #main-top>
            <text class="meta-row-demo__title">{{ item.title }}</text>
          </template>
          <template #main-bottom>
            <text class="meta-row-demo__subtitle">{{ item.subtitle }}</text>
          </template>
          <template #end>
            <text class="meta-row-demo__amount">{{ item.amount }}</text>
          </template>
        </lk-meta-row>
      </view>
    </demo-block>
  </view>
</template>

<style scoped lang="scss">
.meta-row-demo {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 32rpx;
  }
}

.meta-row-demo__list {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: var(--lk-spacing-md);
  }
}

.meta-row-demo__title {
  font-size: var(--lk-font-size-base);
  font-weight: 400;
  color: var(--lk-text-primary);
  line-height: 1.4;
}

.meta-row-demo__subtitle {
  font-size: var(--lk-font-size-sm);
  color: var(--lk-text-secondary);
  line-height: 1.3;
}

.meta-row-demo__amount {
  font-size: var(--lk-font-size-lg);
  font-weight: 700;
  color: var(--lk-text-primary);
  line-height: 1.2;
}
</style>
