<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useThemeStore } from '@/stores/theme';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkStepper from '@/uni_modules/lucky-ui/components/lk-stepper/lk-stepper.vue';
import LkPopup from '@/uni_modules/lucky-ui/components/lk-popup/lk-popup.vue';
import LkCell from '@/uni_modules/lucky-ui/components/lk-cell/lk-cell.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkCard from '@/uni_modules/lucky-ui/components/lk-card/lk-card.vue';
import LkImage from '@/uni_modules/lucky-ui/components/lk-image/lk-image.vue';
import LkCellGroup from '@/uni_modules/lucky-ui/components/lk-cell/lk-cell-group.vue';

defineProps<{
  contentHeight: string;
  skipAnimation?: boolean;
}>();

const themeStore = useThemeStore();
const themeClass = computed(() => themeStore.themeClass);

const showMorePopup = ref(false);
const navHeaderPaddingTop = ref('0rpx');

const goBack = () => {
  // 切换到首页 tab
  uni.switchTab({ url: '/pages/app-main/index' });
};

const handleMoreAction = (type: string) => {
  showMorePopup.value = false;
  uni.showToast({ title: `Action: ${type}`, icon: 'none' });
};

const quotes = ref([
  {
    title: 'Believe in yourself',
    sub: 'Your limitation—it’s only your imagination.',
    author: 'Inspiration',
    icon: 'lightning-fill',
    image: 'https://picsum.photos/200/200?random=21',
  },
  {
    title: 'Push yourself',
    sub: 'Great things never come from comfort zones.',
    author: 'Success',
    icon: 'trophy-fill',
    image: 'https://picsum.photos/200/200?random=22',
  },
  {
    title: 'Stay Focused',
    sub: 'Dream it. Wish it. Do it.',
    author: 'Action',
    icon: 'target',
    image: 'https://picsum.photos/200/200?random=23',
  },
]);

onMounted(() => {
  // #ifdef MP-WEIXIN
  const menuRect = uni.getMenuButtonBoundingClientRect?.();
  if (menuRect && menuRect.bottom) {
    navHeaderPaddingTop.value = `${menuRect.bottom + 8}px`;
  }
  // #endif
});
</script>

<template>
  <view class="checkout-wrapper" :class="themeClass" :style="{ height: contentHeight }">
    <!-- 固定导航栏（移出 scroll-view ，避免滚动时消失） -->
    <view class="nav-header" :style="{ paddingTop: navHeaderPaddingTop }">
      <view class="icon-btn" @click="goBack">
        <lk-icon name="house-door" size="40" color="var(--test-text-primary)" />
      </view>
      <text class="nav-title">Daily Wisdom</text>
      <view class="icon-btn" @click="showMorePopup = true">
        <lk-icon name="heart" size="40" color="var(--test-text-primary)" />
      </view>
    </view>

    <!-- 可滚动内容区 -->
    <scroll-view scroll-y show-scrollbar="false" class="checkout-content">
      <!-- 交互增强：更多操作 -->
      <lk-popup v-model="showMorePopup" position="bottom" round height="45%">
        <view class="drag-handle"></view>
        <view class="popup-menu-content">
          <lk-cell
            title="Share All Wisdom"
            icon="share"
            clickable
            border
            @click="handleMoreAction('share')"
          />
          <lk-cell
            title="Refresh Quotes"
            icon="arrow-clockwise"
            clickable
            border
            @click="handleMoreAction('refresh')"
          />
          <lk-cell
            title="My Favorites"
            icon="heart"
            clickable
            border
            @click="handleMoreAction('fav')"
          />
          <lk-cell
            title="Support Us"
            icon="emoji-smile"
            clickable
            @click="handleMoreAction('support')"
          />
        </view>
      </lk-popup>

      <!-- 励志语录列表 -->
      <view class="cart-items">
        <lk-card
          v-for="(item, index) in quotes"
          :key="index"
          class="cart-item"
          padding="24rpx"
          shadow="none"
          transparent
        >
          <view class="item-body">
            <lk-image :src="item.image" width="160rpx" height="160rpx" radius="30rpx" fit="cover" />
            <view class="item-details">
              <view class="item-header">
                <view class="item-info">
                  <text class="item-title">{{ item.title }}</text>
                  <text class="item-sub">{{ item.sub }}</text>
                </view>
                <lk-icon :name="item.icon" size="32" color="var(--test-primary)" />
              </view>
              <view class="item-footer">
                <text class="item-author">By {{ item.author }}</text>
              </view>
            </view>
          </view>
        </lk-card>
      </view>

      <!-- 精选推荐 -->
      <lk-card
        class="section-container"
        title="Personal Growth"
        padding="0"
        shadow="none"
        transparent
      >
        <lk-cell-group>
          <lk-cell
            title="Daily Goals"
            label="Incomplete"
            value="Keep Going!"
            icon="list-check"
            arrow
          />
        </lk-cell-group>
      </lk-card>

      <view class="safe-area-bottom"></view>
    </scroll-view>
  </view>
</template>
<style lang="scss" scoped>
@use '@/styles/test-page.scss' as test;

.checkout-wrapper {
  display: flex;
  flex-direction: column;
  background-color: test.$test-bg-page;
  flex: 1;
  overflow: hidden;
  padding-top: 0;
  box-sizing: border-box;
}

.checkout-content {
  flex: 1;
  height: 0; // flex 布局中 scroll-view 需要 height:0 才能正确获得副本高度
  padding: 30rpx 40rpx 0;
  box-sizing: border-box;
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 100rpx;
  padding: 0 40rpx; // 与 scroll-view 内容区水平对齐
  flex-shrink: 0;

  .nav-title {
    font-size: 34rpx;
    font-weight: bold;
    color: test.$test-text-primary;
  }

  .icon-btn {
    width: 80rpx;
    height: 80rpx;
    background: test.$test-bg-card;
    border-radius: 50%;
    border: 1px solid test.$test-border-color;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: test.$test-shadow-sm;
  }
}

.drag-handle {
  width: 80rpx;
  height: 10rpx;
  background-color: test.$test-border-color;
  border-radius: 10rpx;
  margin: 20rpx auto 10rpx;
}

.popup-menu-content {
  padding: 20rpx 40rpx;
}

.cart-items {
  margin-bottom: 60rpx;
}

.cart-item {
  margin-bottom: 40rpx;

  .item-body {
    display: flex;
    align-items: center;
  }

  .item-details {
    flex: 1;
    margin-left: 30rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .item-header {
      display: flex;
      justify-content: space-between;

      .item-title {
        font-size: 30rpx;
        font-weight: bold;
        color: test.$test-text-primary;
        display: block;
      }

      .item-sub {
        font-size: 24rpx;
        color: test.$test-text-secondary;
      }
    }

    .item-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;

      .item-author {
        font-size: 24rpx;
        font-style: italic;
        color: test.$test-primary;
      }
    }
  }
}

.section-container {
  margin-bottom: 60rpx;
}

.safe-area-bottom {
  height: 120rpx;
}
</style>
