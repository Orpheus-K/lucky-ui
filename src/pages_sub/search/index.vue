<script setup lang="ts">
import { ref, computed } from 'vue';
import { useThemeStore } from '@/stores/theme';
import LkNavbar from '@/uni_modules/lucky-ui/components/lk-navbar/lk-navbar.vue';
import LkInput from '@/uni_modules/lucky-ui/components/lk-input/lk-input.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';
import LkTag from '@/uni_modules/lucky-ui/components/lk-tag/lk-tag.vue';

const themeStore = useThemeStore();
const themeClass = computed(() => themeStore.themeClass);
const brandStyleVars = computed(() => themeStore.brandStyleVars);

const keyword = ref('');
const hotTags = ['连衣裙', '外套', '运动鞋', 'T恤', '牛仔裤'];

const goBack = () => {
  uni.navigateBack();
};
</script>

<template>
  <view class="page-container" :class="themeClass" :style="brandStyleVars">
    <lk-navbar title="搜索" @back="goBack" />

    <view class="search-page">
      <view class="search-header">
        <lk-input
          v-model="keyword"
          prefix-icon="search"
          placeholder="搜索商品..."
          clearable
          autofocus
        />
      </view>

      <view class="search-content">
        <view class="hot-tags">
          <text class="section-title">热门搜索</text>
          <lk-space class="tag-list" wrap :gap="16">
            <lk-tag v-for="tag in hotTags" :key="tag" size="md" @click="keyword = tag">
              {{ tag }}
            </lk-tag>
          </lk-space>
        </view>
      </view>
    </view>
  </view>
</template>
<style lang="scss" scoped>
@use '@/styles/test-page.scss' as test;

.page-container {
  width: 100%;
  min-height: 100vh;
  background: test.$test-bg-page;
}

.search-page {
  padding: 20rpx 30rpx;
}

.search-header {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: test.$test-text-primary;
  margin-bottom: 24rpx;
  display: block;
}

.tag-list {
  width: 100%;
}
</style>
