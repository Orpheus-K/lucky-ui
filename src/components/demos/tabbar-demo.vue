<script setup lang="ts">
import { ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkTabbar from '@/uni_modules/lucky-ui/components/lk-tabbar/lk-tabbar.vue';
import LkTabbarItem from '@/uni_modules/lucky-ui/components/lk-tabbar/lk-tabbar-item.vue';

const active = ref('home');
const listActive = ref(0);

const tabbarList = [
  { icon: 'house', text: '首页', activeIconFill: true },
  { icon: 'grid', text: '分类', activeIconFill: true },
  { icon: 'cart', text: '购物车', badge: 3, activeIconFill: true },
  { icon: 'person', text: '我的', activeIconFill: true },
];
</script>

<template>
  <view class="tabbar-demo">
    <demo-block title="插槽模式">
      <view class="preview-shell">
        <view class="preview-content">
          <text class="preview-title">当前：{{ active }}</text>
          <text class="preview-desc">使用 lk-tabbar-item 组合底部导航。</text>
        </view>
        <lk-tabbar v-model="active" :fixed="false" mode="fixed">
          <lk-tabbar-item name="home" icon="house" label="首页" active-icon-fill />
          <lk-tabbar-item name="category" icon="grid" label="分类" active-icon-fill />
          <lk-tabbar-item name="cart" icon="cart" label="购物车" :badge="3" active-icon-fill />
          <lk-tabbar-item name="profile" icon="person" label="我的" active-icon-fill />
        </lk-tabbar>
      </view>
    </demo-block>

    <demo-block title="列表模式">
      <view class="preview-shell">
        <view class="preview-content">
          <text class="preview-title">当前索引：{{ listActive }}</text>
          <text class="preview-desc">使用 list 快速渲染导航项。</text>
        </view>
        <lk-tabbar v-model="listActive" :fixed="false" mode="slider" :list="tabbarList" />
      </view>
    </demo-block>
  </view>
</template>

<style scoped lang="scss">
.tabbar-demo {
  display: flex;
  flex-direction: column;

  > :not(:first-child) {
    margin-top: 32rpx;
  }
}

.preview-shell {
  overflow: hidden;
  border: 1rpx solid var(--lk-color-border-light);
  border-radius: var(--lk-radius-lg);
  background: var(--lk-bg-container);
}

.preview-content {
  min-height: 220rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--lk-bg-page);
}

.preview-title {
  color: var(--lk-text-primary);
  font-size: 30rpx;
  font-weight: 700;
}

.preview-desc {
  margin-top: 12rpx;
  color: var(--lk-text-secondary);
  font-size: 24rpx;
}
</style>
