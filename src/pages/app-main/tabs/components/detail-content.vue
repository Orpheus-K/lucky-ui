<script setup lang="ts">
import { ref, computed } from 'vue';
import { useThemeStore } from '@/stores/theme';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkStepper from '@/uni_modules/lucky-ui/components/lk-stepper/lk-stepper.vue';
import LkAvatar from '@/uni_modules/lucky-ui/components/lk-avatar/lk-avatar.vue';
import LkRate from '@/uni_modules/lucky-ui/components/lk-rate/lk-rate.vue';
import LkPopup from '@/uni_modules/lucky-ui/components/lk-popup/lk-popup.vue';
import LkModal from '@/uni_modules/lucky-ui/components/lk-modal/lk-modal.vue';
import LkCarousel from '@/uni_modules/lucky-ui/components/lk-carousel/lk-carousel.vue';
import LkCard from '@/uni_modules/lucky-ui/components/lk-card/lk-card.vue';
import LkImage from '@/uni_modules/lucky-ui/components/lk-image/lk-image.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';

defineProps<{
  contentHeight: string;
  skipAnimation?: boolean;
}>();

const themeStore = useThemeStore();
const themeClass = computed(() => themeStore.themeClass);

const carouselImages = ref([
  'https://picsum.photos/800/1000?random=10',
  'https://picsum.photos/800/1000?random=11',
  'https://picsum.photos/800/1000?random=12',
]);

const quantity = ref(1);
const sizes = ['S', 'M', 'L', 'XL'];
const activeSize = ref('L');

const colors = ['#8C8C8C', '#4A4A4A', '#1A1A1A'];
const activeColor = ref(2);

const showReviewPopup = ref(false);
const showDescModal = ref(false);

const goBack = () => {
  uni.switchTab({ url: '/pages/app-main/index' });
};
</script>

<template>
  <scroll-view
    scroll-y
    show-scrollbar="false"
    class="detail-content"
    :class="themeClass"
    :style="{ height: contentHeight }"
  >
    <!-- 顶部导航栏 (模拟) -->
    <view class="nav-header">
      <view class="back-btn" @click="goBack">
        <lk-icon name="chevron-left" size="40" color="var(--test-text-primary)" />
      </view>
      <view class="fav-btn">
        <lk-icon name="heart-fill" size="32" color="var(--test-text-primary)" />
      </view>
    </view>

    <!-- 商品大图 (轮播图) -->
    <view class="image-container">
      <lk-carousel
        :carousel-list="carouselImages"
        height="700rpx"
        indicator-type="dots"
        auto-play
      />
    </view>

    <!-- 商品基本信息 -->
    <view class="info-container">
      <view class="title-row">
        <view class="title-col">
          <text class="product-title">Light Dress Bless</text>
          <view class="rating-info">
            <lk-icon name="star-fill" size="24" color="#FFD700" />
            <text class="rating-val">5.0</text>
            <text class="reviews-count">(7.932 reviews)</text>
          </view>
        </view>
        <view class="stepper-box">
          <lk-stepper v-model="quantity" :min="1" />
        </view>
      </view>

      <!-- 商品描述 -->
      <text class="desc-text">
        Its simple and elegant shape makes it perfect for those of you who like you who want
        minimalist clothes
        <text class="read-more" @click="showDescModal = true">Read More. . .</text>
      </text>

      <!-- 评价预览 -->
      <lk-card class="review-preview" padding="30rpx" shadow="none" @click="showReviewPopup = true">
        <template #header>
          <text class="review-title">Customer Reviews</text>
        </template>
        <template #header-extra>
          <view class="view-all-reviews">
            <text>Show All</text>
            <lk-icon name="chevron-right" size="24" color="var(--test-primary)" />
          </view>
        </template>
        <view class="review-item">
          <lk-avatar src="https://picsum.photos/50/50?random=11" size="64" round />
          <view class="review-content">
            <view class="review-user-info">
              <text class="review-user-name">Jennifer L.</text>
              <lk-rate :model-value="5" size="24" readonly />
            </view>
            <text class="review-text"
              >The fabric is so soft and the fit is perfect! I love it so much!</text
            >
          </view>
        </view>
      </lk-card>

      <!-- 规格选择 -->
      <view class="options-row">
        <lk-card class="option-group" title="Choose Size" padding="24rpx" shadow="none" transparent>
          <view class="size-list">
            <view
              v-for="s in sizes"
              :key="s"
              :class="['size-item', activeSize === s ? 'active' : '']"
              @click="activeSize = s"
            >
              {{ s }}
            </view>
          </view>
        </lk-card>

        <lk-card class="option-group" title="Color" padding="24rpx" shadow="none" transparent>
          <view class="color-list">
            <view
              v-for="(c, i) in colors"
              :key="i"
              :class="['color-item', activeColor === i ? 'active' : '']"
              :style="{ backgroundColor: c }"
              @click="activeColor = i"
            />
          </view>
        </lk-card>
      </view>
    </view>

    <!-- 商品规格等内容保留用于展示组件 -->

    <view class="safe-area-bottom"></view>

    <!-- 交互增强：评论弹出层 -->
    <lk-popup
      v-model="showReviewPopup"
      position="bottom"
      round
      height="90vh"
      draggable
      title="All Reviews (7,932)"
      closable
      close-on-overlay
    >
      <view class="review-popup-container">
        <view v-for="i in 10" :key="i" class="review-list-item">
          <lk-avatar :src="`https://picsum.photos/50/50?random=${i + 20}`" size="80" round />
          <view class="review-body">
            <view class="review-top">
              <text class="u-name">User_{{ i }}</text>
              <text class="u-date">2 days ago</text>
            </view>
            <lk-rate :model-value="5 - (i % 2)" size="24" readonly />
            <text class="u-text"
              >Amazing quality! Definitely worth the price. I will buy another color soon!</text
            >
            <lk-space class="u-imgs" :gap="12" wrap>
              <lk-image
                v-for="j in 3"
                :key="j"
                :src="`https://picsum.photos/150/150?random=${i * 10 + j}`"
                width="140rpx"
                height="140rpx"
                radius="16rpx"
                fit="cover"
                class="u-img"
              />
            </lk-space>
          </view>
        </view>
        <view class="safe-area-bottom" />
      </view>
    </lk-popup>

    <!-- 交互增强：详细描述对话框 -->
    <lk-modal v-model="showDescModal" title="Product Description">
      <text class="full-desc">
        This dress is crafted from premium sustainable cotton, offering a breathable and luxurious
        feel. Its minimalist design features a sleek silhouette, making it suitable for both casual
        outings and evening events. Care Instructions: Hand wash cold, do not bleach, iron on low
        heat.
      </text>
    </lk-modal>
  </scroll-view>
</template>

<style lang="scss" scoped>
@use '@/styles/test-page.scss' as test;

.detail-content {
  background-color: test.$test-bg-page;
  position: relative;
  flex: 1;
}

.nav-header {
  position: absolute;
  top: 40rpx;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  padding: 0 40rpx;

  .back-btn,
  .fav-btn {
    width: 80rpx;
    height: 80rpx;
    background: test.$test-bg-card;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: test.$test-shadow-sm;
  }
}

.image-container {
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.info-container {
  padding: 40rpx;

  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 30rpx;

    .product-title {
      font-size: 44rpx;
      font-weight: bold;
      color: test.$test-text-primary;
      display: block;
      margin-bottom: 12rpx;
    }

    .rating-info {
      display: flex;
      align-items: center;
      > :not(:first-child) {
        margin-left: 10rpx;
      }

      .rating-val {
        font-size: 28rpx;
        color: test.$test-text-primary;
        font-weight: 500;
      }

      .reviews-count {
        font-size: 24rpx;
        color: test.$test-primary;
      }
    }
  }

  .stepper-box {
    :deep(.lk-stepper) {
      background: test.$test-gray-100;
      border-radius: 40rpx;
    }
  }
}

.desc-text {
  font-size: 26rpx;
  line-height: 40rpx;
  color: test.$test-text-secondary;

  .read-more {
    font-weight: bold;
    color: test.$test-text-primary;
    margin-left: 10rpx;
    text-decoration: underline;
  }
}

.review-preview {
  margin: 40rpx 0;

  .review-title {
    font-size: 32rpx;
    font-weight: bold;
    color: test.$test-text-primary;
  }

  .view-all-reviews {
    display: flex;
    align-items: center;
    > :not(:first-child) {
      margin-left: 4rpx;
    }
    font-size: 24rpx;
    color: test.$test-primary;
  }

  .review-item {
    display: flex;
    > :not(:first-child) {
      margin-left: 20rpx;
    }

    .review-content {
      flex: 1;

      .review-user-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8rpx;

        .review-user-name {
          font-size: 26rpx;
          font-weight: bold;
          color: test.$test-text-primary;
        }
      }

      .review-text {
        font-size: 24rpx;
        color: test.$test-text-secondary;
        line-height: 36rpx;
      }
    }
  }
}

.options-row {
  display: flex;
  > :not(:first-child) {
    margin-left: 80rpx;
  }
  margin-bottom: 40rpx;
}

/* Popup Styles */
.review-popup-container {
  background: test.$test-bg-card;
}

.review-list-item {
  display: flex;
  > :not(:first-child) {
    margin-left: 24rpx;
  }
  padding: 40rpx;
  border-bottom: 1px solid test.$test-border-color;

  .review-body {
    flex: 1;

    .review-top {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8rpx;

      .u-name {
        font-size: 28rpx;
        font-weight: bold;
        color: test.$test-text-primary;
      }

      .u-date {
        font-size: 24rpx;
        color: test.$test-text-secondary;
      }
    }

    .u-text {
      font-size: 26rpx;
      color: test.$test-text-secondary;
      line-height: 40rpx;
      margin: 16rpx 0;
      display: block;
    }

    .u-imgs {
      width: 100%;

      .u-img {
        display: block;
      }
    }
  }
}

.full-desc {
  font-size: 28rpx;
  color: test.$test-text-secondary;
  line-height: 44rpx;
}

.size-list {
  display: flex;
  > :not(:first-child) {
    margin-left: 16rpx;
  }

  .size-item {
    width: 70rpx;
    height: 70rpx;
    border-radius: 50%;
    border: 1px solid test.$test-border-color;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    color: test.$test-text-primary;
    transition: all 0.3s;

    &.active {
      background: test.$test-text-primary;
      border-color: test.$test-text-primary;
      color: test.$test-text-inverse;
    }
  }
}

.color-list {
  display: flex;
  > :not(:first-child) {
    margin-left: 16rpx;
  }

  .color-item {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    border: 4rpx solid transparent;
    transition: all 0.3s;

    &.active {
      border-color: test.$test-text-primary;
      transform: scale(1.1);
    }
  }
}

.safe-area-bottom {
  height: 80rpx;
}
</style>
