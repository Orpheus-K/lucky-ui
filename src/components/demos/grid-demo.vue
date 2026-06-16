<script setup lang="ts">
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkGrid from '@/uni_modules/lucky-ui/components/lk-grid/lk-grid.vue';

const items = Array.from({ length: 14 }, (_, i) => ({
  text: `项目${i + 1}`,
  icon: 'star',
}));
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础网格">
      <lk-grid :columns="4" :gap="16" :items="items" />
    </demo-block>

    <demo-block title="滑动网格">
      <lk-grid :columns="4" :rows="3" :gap="16" :item-gap="12" :carousel="true" :items="items" />
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
</style>
