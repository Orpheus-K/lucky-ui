<script setup lang="ts">
import { ref, computed } from 'vue';
import { useThemeStore } from '@/stores/theme';
import LkAvatar from '@/uni_modules/lucky-ui/components/lk-avatar/lk-avatar.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkGrid from '@/uni_modules/lucky-ui/components/lk-grid/lk-grid.vue';
import LkCell from '@/uni_modules/lucky-ui/components/lk-cell/lk-cell.vue';
import LkBadge from '@/uni_modules/lucky-ui/components/lk-badge/lk-badge.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkTag from '@/uni_modules/lucky-ui/components/lk-tag/lk-tag.vue';
import LkActionSheet from '@/uni_modules/lucky-ui/components/lk-action-sheet/lk-action-sheet.vue';
import LkModal from '@/uni_modules/lucky-ui/components/lk-modal/lk-modal.vue';
import LkCard from '@/uni_modules/lucky-ui/components/lk-card/lk-card.vue';
import LkCellGroup from '@/uni_modules/lucky-ui/components/lk-cell/lk-cell-group.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';

defineProps<{
  contentHeight: string;
  skipAnimation?: boolean;
}>();

const themeStore = useThemeStore();
const themeClass = computed(() => themeStore.themeClass);

const stats = [
  { value: '12', label: 'Wishlist' },
  { value: '25', label: 'Coupons' },
  { value: '1,204', label: 'Points' },
];

const orderStatuses = [
  { label: 'Pending', icon: 'wallet2', count: 2 },
  { label: 'Processing', icon: 'box-seam', count: 0 },
  { label: 'Shipped', icon: 'app', count: 5 },
  { label: 'Reviews', icon: 'chat-dots', count: 1 },
];

const showThemeSheet = ref(false);
const themeActions = [
  { name: 'Light Mode', value: 'light', icon: 'sun' },
  { name: 'Dark Mode', value: 'dark', icon: 'moon' },
];

const handleThemeSelect = (payload: {
  action: { name?: string; value?: string };
  index: number;
}) => {
  const value = payload.action.value as 'light' | 'dark';
  if (value) {
    themeStore.setTheme(value);
  }
};

const showLogoutModal = ref(false);
const handleLogout = () => {
  uni.showToast({ title: 'Logged out', icon: 'success' });
  // 跳转到登录页（分包页面）
  uni.navigateTo({ url: '/pages_sub/auth/index' });
};

const goToOrders = () => {
  uni.showToast({ title: 'Orders page...', icon: 'none' });
};

const goToAnalytics = () => {
  uni.navigateTo({ url: '/pages_sub/analytics/index' });
};

const goToCheckIn = () => {
  uni.navigateTo({ url: '/pages_sub/check-in/index' });
};

const goToEditProfile = () => {
  uni.navigateTo({ url: '/pages_sub/edit-profile/index' });
};

const goToSettings = () => {
  uni.navigateTo({ url: '/pages_sub/settings/index' });
};
</script>

<template>
  <scroll-view
    class="mine-content"
    :class="themeClass"
    :style="{ height: contentHeight }"
    scroll-y
    show-scrollbar="false"
  >
    <!-- 背景装饰 -->
    <view class="profile-bg"></view>

    <view class="content-wrap">
      <!-- 用户头像与基本信息 -->
      <view class="profile-header">
        <lk-avatar
          src="https://picsum.photos/200/200?random=mine-profile"
          size="160"
          round
          border="4rpx solid #fff"
        />
        <text class="user-name">Albert Stevano</text>
        <text class="user-email">albert.stevano@example.com</text>

        <!-- 用户等级/勋章 -->
        <view class="badge-row">
          <lk-tag type="solid" size="sm" radius="20">Gold Member</lk-tag>
          <lk-tag type="solid" size="sm" radius="20" bg-color="#22c55e" style="margin-left: 12rpx"
            >Verified</lk-tag
          >
        </view>
      </view>

      <lk-space direction="vertical" :gap="24">
        <!-- 统计数据 -->
        <lk-card class="stats-card" padding="24rpx 20rpx" shadow="base" @click="goToAnalytics">
          <view class="stats-row">
            <view v-for="(stat, i) in stats" :key="i" class="stat-item">
              <text class="stat-value">{{ stat.value }}</text>
              <text class="stat-label">{{ stat.label }}</text>
            </view>
          </view>
        </lk-card>

        <!-- 快捷入口 -->
        <lk-card class="quick-entry section-card" padding="16rpx" shadow="sm">
          <lk-grid :columns="2" :border="false">
            <view class="entry-item" @click="goToCheckIn">
              <lk-icon name="calendar-check" size="40" color="var(--test-primary)" />
              <text class="entry-label">Daily Check-in</text>
            </view>
            <view class="entry-item" @click="goToAnalytics">
              <lk-icon name="reception-4" size="40" color="var(--test-primary)" />
              <text class="entry-label">Data Insights</text>
            </view>
          </lk-grid>
        </lk-card>

        <!-- 订单状态 -->
        <lk-card class="section-card" padding="24rpx" shadow="sm" overflow="visible">
          <template #header>
            <text class="section-title">My Orders</text>
          </template>
          <template #header-extra>
            <text class="view-all" @click="goToOrders">View All</text>
          </template>
          <lk-grid :columns="4" :border="false">
            <view v-for="(order, i) in orderStatuses" :key="i" class="order-status-item">
              <lk-badge :value="order.count" :offset="[-4, 4]">
                <lk-icon :name="order.icon" size="48" color="var(--test-text-primary)" />
              </lk-badge>
              <text class="status-label">{{ order.label }}</text>
            </view>
          </lk-grid>
        </lk-card>

        <!-- 菜单项 -->
        <lk-card shadow="sm" padding="0">
          <lk-cell-group>
            <lk-cell
              title="Edit Profile"
              icon="info-circle"
              clickable
              arrow
              @click="goToEditProfile"
            />
            <lk-cell title="My Wishlist" icon="heart" clickable arrow />
            <lk-cell title="Shipping Addresses" icon="geo-alt" clickable arrow />
            <lk-cell title="Payment Methods" icon="credit-card" clickable arrow />
          </lk-cell-group>
        </lk-card>

        <lk-card shadow="sm" padding="0">
          <lk-cell-group>
            <lk-cell
              title="Theme Management"
              icon="moon"
              clickable
              arrow
              @click="showThemeSheet = true"
            />
            <lk-cell title="Privacy Policy" icon="shield-lock" clickable arrow />
            <lk-cell title="Settings" icon="gear" clickable arrow @click="goToSettings" />
          </lk-cell-group>
        </lk-card>
      </lk-space>

      <!-- 退出登录 -->
      <view class="logout-btn-wrap">
        <lk-button block plain type="danger" radius="40" @click="showLogoutModal = true"
          >Log Out</lk-button
        >
      </view>
    </view>

    <!-- 交互增强：主题切换 -->
    <lk-action-sheet
      v-model="showThemeSheet"
      :actions="themeActions"
      title="Select Theme"
      @select="handleThemeSelect"
    />

    <!-- 交互增强：退出确认 -->
    <lk-modal
      v-model="showLogoutModal"
      title="Sign Out"
      confirm-text="Logout"
      cancel-text="Wait"
      @confirm="handleLogout"
    >
      <text style="color: var(--test-text-secondary); font-size: 28rpx">
        Are you sure you want to sign out? You will need to login again to access your orders.
      </text>
    </lk-modal>
  </scroll-view>
</template>

<style lang="scss" scoped>
@use '@/styles/test-page.scss' as test;

.mine-content {
  --mine-inset-x: #{30rpx};
  --mine-section-space: #{24rpx};
  --mine-profile-to-cards: #{40rpx};

  background-color: test.$test-bg-page;
  position: relative;
  flex: 1;
  padding-top: 0;
  box-sizing: border-box;
}

.profile-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 460rpx;
  background: linear-gradient(180deg, test.$test-text-primary 0%, test.$test-primary 100%);
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
}

.content-wrap {
  position: relative;
  z-index: 1;
  padding: 32rpx var(--mine-inset-x) 120rpx;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: calc(env(safe-area-inset-top) + 56rpx);
  margin-bottom: var(--mine-profile-to-cards);

  .user-name {
    font-size: 40rpx;
    font-weight: bold;
    color: #fff;
    margin-top: 24rpx;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
  }

  .user-email {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 8rpx;
  }

  .badge-row {
    margin-top: 20rpx;
    display: flex;
  }
}

.stats-card {
  .stats-row {
    display: flex;
    justify-content: space-between;
  }

  .stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-right: 1px solid test.$test-border-color;

    &:last-child {
      border-right: none;
    }

    .stat-value {
      font-size: 36rpx;
      font-weight: bold;
      color: test.$test-text-primary;
    }

    .stat-label {
      font-size: 22rpx;
      color: test.$test-text-secondary;
      margin-top: 8rpx;
    }
  }
}

.section-card {
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: test.$test-text-primary;
  }

  .view-all {
    font-size: 24rpx;
    color: test.$test-primary;
  }
}

.order-status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  overflow: visible;

  .status-label {
    margin-top: 16rpx;
    font-size: 24rpx;
    color: test.$test-text-secondary;
    line-height: 1.3;
    max-width: 100%;
    white-space: nowrap;
  }
}

.entry-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx;
  font-size: 26rpx;
  font-weight: bold;
  color: test.$test-text-primary;
}

.entry-label {
  margin-left: 16rpx;
}

.logout-btn-wrap {
  margin-block: 40rpx;
}
</style>
