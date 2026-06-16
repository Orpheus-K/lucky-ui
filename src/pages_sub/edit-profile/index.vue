<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@/stores/theme';
import LkNavbar from '@/uni_modules/lucky-ui/components/lk-navbar/lk-navbar.vue';
import LkAvatar from '@/uni_modules/lucky-ui/components/lk-avatar/lk-avatar.vue';
import LkCard from '@/uni_modules/lucky-ui/components/lk-card/lk-card.vue';
import LkCell from '@/uni_modules/lucky-ui/components/lk-cell/lk-cell.vue';
import LkCellGroup from '@/uni_modules/lucky-ui/components/lk-cell/lk-cell-group.vue';

const themeStore = useThemeStore();
const themeClass = computed(() => themeStore.themeClass);
const brandStyleVars = computed(() => themeStore.brandStyleVars);

const goBack = () => {
  uni.navigateBack();
};
</script>

<template>
  <view class="page-container" :class="themeClass" :style="brandStyleVars">
    <lk-navbar title="编辑资料" @back="goBack" />

    <view class="edit-profile-page">
      <view class="avatar-section">
        <lk-avatar src="https://picsum.photos/200/200?random=mine-profile" size="160" round />
        <text class="change-avatar">更换头像</text>
      </view>

      <lk-card padding="0">
        <lk-cell-group>
          <lk-cell title="昵称" value="Albert Stevano" arrow clickable />
          <lk-cell title="性别" value="男" arrow clickable />
          <lk-cell title="生日" value="1990-01-01" arrow clickable />
          <lk-cell title="签名" value="这是一段个性签名" arrow clickable />
        </lk-cell-group>
      </lk-card>
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

.edit-profile-page {
  padding: 40rpx;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;

  .change-avatar {
    margin-top: 16rpx;
    font-size: 26rpx;
    color: test.$test-primary;
  }
}
</style>
