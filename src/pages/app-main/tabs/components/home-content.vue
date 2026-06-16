<template>
  <view
    class="home-content"
    :class="[themeClass, { 'home-content--no-list-animation': props.skipAnimation }]"
  >
    <lk-waterfall
      class="home-waterfall"
      :items="products"
      :height="contentHeight"
      gutter="32rpx"
      row-gap="40rpx"
      padding-x="30rpx"
      :padding-y="0"
      card-radius="24"
      @load-more="handleLoadMore"
    >
      <template #header>
        <view class="header-container">
          <!-- 用户头像与欢迎语 -->
          <view class="header-section">
            <view class="user-info">
              <text class="welcome-text">Hello, Welcome 👋</text>
              <text class="user-name">Albert Stevano</text>
            </view>
            <lk-avatar src="https://picsum.photos/100/100?random=100" size="80" round />
          </view>

          <!-- 搜索与筛选 -->
          <view class="search-section">
            <lk-input
              class="search-bar"
              fake
              prefix-icon="search"
              placeholder=""
              @click="goToSearch"
            >
              <view class="search-ticker">
                <lk-notice-bar
                  :messages="searchHints"
                  scrollable="vertical"
                  :speed="2"
                  no-background
                />
              </view>
            </lk-input>
            <view class="filter-trigger-wrap">
              <lk-button
                fill
                class="filter-trigger"
                custom-style="padding:0;border-radius:24rpx;"
                @click="showFilter = true"
              >
                <lk-icon name="sliders" size="32" color="var(--test-text-inverse)" />
              </lk-button>
            </view>
          </view>

          <!-- 分类标签 -->
          <view class="category-section">
            <lk-horizontal-scroll hide-scrollbar>
              <lk-choice
                v-model="activeCategory"
                :options="
                  categories.map((c, i) => ({ label: c.name, value: String(i), icon: c.icon }))
                "
                size="lg"
                :gap="30"
                :wrap="false"
              />
            </lk-horizontal-scroll>
          </view>
        </view>
      </template>

      <template #item="{ item, height, loading, onImageLoad, onImageError }">
        <lk-card class="product-card" padding="0" :border="false" shadow="none" transparent>
          <template #cover>
            <view
              class="image-wrapper"
              :style="{ height: height - (item.extraHeight || 90) + 'px' }"
            >
              <lk-skeleton
                class="product-image-skeleton"
                :loading="loading"
                :rows="1"
                row-width="100%"
                :row-height="`${height - (item.extraHeight || 90)}px`"
                animated
              />
              <lk-image
                :src="item.image"
                width="100%"
                height="100%"
                fit="cover"
                class="product-image"
                :show-loading="false"
                :preview="false"
                :style="{ opacity: loading ? 0 : 1 }"
                @load="onImageLoad"
                @error="onImageError"
              />
              <view class="favorite-icon">
                <lk-icon name="heart" size="24" color="#fff" />
              </view>
            </view>
          </template>
          <view class="product-info">
            <text class="product-title">{{ item.title }}</text>
            <text class="product-type">{{ item.type }}</text>
            <view class="price-row">
              <text class="product-price">${{ item.price }}</text>
              <view class="rating-box">
                <lk-icon name="star-fill" size="24" color="#FFD700" />
                <text class="rating-text">{{ item.rating }}</text>
              </view>
            </view>
          </view>
        </lk-card>
      </template>

      <!-- 底部加载状态由外层贴底浮层承载，避免滚动内容高度抖动 -->
      <template #loading>
        <view class="waterfall-footer-anchor" />
      </template>
    </lk-waterfall>

    <view v-if="isLoading" class="waterfall-loading-overlay">
      <view class="loading-toast">
        <lk-loading variant="spinner" size="28" text="加载中" color="var(--test-primary)" />
      </view>
    </view>

    <!-- 交互增强：筛选弹窗 -->
    <lk-popup v-model="showFilter" position="right" width="600rpx">
      <view class="filter-panel" :class="themeClass" :style="{ paddingTop: filterPanelTop }">
        <view class="filter-header">
          <text class="filter-title">Filters</text>
          <text class="reset-btn" @click="resetFilter">Reset</text>
        </view>

        <scroll-view scroll-y class="filter-body">
          <view class="filter-group">
            <text class="group-title">Category</text>
            <scroll-view class="choice-scroll" scroll-x enable-flex show-scrollbar="false">
              <lk-choice
                v-model="activeCategoryName"
                :options="categories.map(c => ({ label: c.name, value: c.name }))"
                size="md"
                :gap="20"
                class="tag-flex"
              />
            </scroll-view>
          </view>

          <view class="filter-group">
            <text class="group-title">Price Range</text>
            <view class="price-inputs">
              <lk-input class="price-input" placeholder="Min" type="number" border />
              <view class="dash">-</view>
              <lk-input class="price-input" placeholder="Max" type="number" border />
            </view>
          </view>

          <view class="filter-group">
            <text class="group-title">Sort By</text>
            <scroll-view class="choice-scroll" scroll-x enable-flex show-scrollbar="false">
              <lk-choice
                v-model="activeSort"
                :options="
                  ['Newest', 'Price: Low to High', 'Price: High to Low', 'Popular'].map(s => ({
                    label: s,
                    value: s,
                  }))
                "
                size="md"
                :gap="20"
                class="tag-flex"
              />
            </scroll-view>
          </view>
        </scroll-view>

        <view class="filter-footer">
          <lk-button type="primary" block radius="40" @click="showFilter = false"
            >Apply Filters</lk-button
          >
        </view>
      </view>
    </lk-popup>
  </view>
</template>

<!-- eslint-disable-next-line vue/block-order -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useThemeStore } from '@/stores/theme';
import type { WaterfallItem } from '@/uni_modules/lucky-ui/components/lk-waterfall/waterfall.props';
import LkAvatar from '@/uni_modules/lucky-ui/components/lk-avatar/lk-avatar.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkWaterfall from '@/uni_modules/lucky-ui/components/lk-waterfall/lk-waterfall.vue';
import LkNoticeBar from '@/uni_modules/lucky-ui/components/lk-notice-bar/lk-notice-bar.vue';
import LkPopup from '@/uni_modules/lucky-ui/components/lk-popup/lk-popup.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkSkeleton from '@/uni_modules/lucky-ui/components/lk-skeleton/lk-skeleton.vue';
import LkCard from '@/uni_modules/lucky-ui/components/lk-card/lk-card.vue';
import LkChoice from '@/uni_modules/lucky-ui/components/lk-choice/lk-choice.vue';
import LkInput from '@/uni_modules/lucky-ui/components/lk-input/lk-input.vue';
import LkImage from '@/uni_modules/lucky-ui/components/lk-image/lk-image.vue';
import LkLoading from '@/uni_modules/lucky-ui/components/lk-loading/lk-loading.vue';
import LkHorizontalScroll from '@/uni_modules/lucky-ui/components/lk-horizontal-scroll/lk-horizontal-scroll.vue';
import { toastStore } from '@/uni_modules/lucky-ui/components/lk-toast/toast-manager';

const props = withDefaults(
  defineProps<{
    contentHeight: string;
    skipAnimation?: boolean;
  }>(),
  {
    skipAnimation: false,
  }
);

const themeStore = useThemeStore();
const themeClass = computed(() => themeStore.themeClass);

const showFilter = ref(false);
const filterPanelTop = ref('0rpx');
const activeCategoryName = ref('All Items');
const resetFilter = () => {
  activeCategoryName.value = 'All Items';
};

onMounted(() => {
  // #ifdef MP-WEIXIN
  const menuRect = uni.getMenuButtonBoundingClientRect?.();
  if (menuRect && menuRect.bottom) {
    filterPanelTop.value = `${menuRect.bottom + 12}px`;
  }
  // #endif
});

type ProductItem = WaterfallItem & {
  id: number;
  title: string;
  type: string;
  price: string;
  rating: string;
  image: string;
  ratio: number;
  extraHeight: number;
};

const products = ref<ProductItem[]>([]);
const activeCategory = ref<string | number>('0');
const activeSort = ref('Newest');
const categories = [
  { name: 'All Items', icon: 'grid' },
  { name: 'Dress', icon: 'list' },
  { name: 'T-Shirt', icon: 'box' },
  { name: 'Pants', icon: 'list' },
];

const mockAdjectives = [
  'Modern',
  'Casual',
  'Street',
  'Light',
  'Floral',
  'Classic',
  'Luxurious',
  'Vintage',
  'Minimalist',
  'Cozy',
];
const mockNouns = [
  'T-Shirt',
  'Dress',
  'Jacket',
  'Pants',
  'Gown',
  'Hoodie',
  'Skirts',
  'Blazer',
  'Sweater',
  'Cardigan',
];
const mockTypes = ['Modern', 'Style', 'Luxury', 'Casual', 'Summer', 'Winter', 'Autumn', 'Spring'];
const searchHints = [
  'Search: New arrivals',
  'Search: Summer dresses',
  'Search: Cozy hoodies',
  'Search: Minimalist tees',
];

const generateMockData = (count: number): ProductItem[] => {
  const newItems: ProductItem[] = [];
  for (let i = 0; i < count; i++) {
    const id = products.value.length + i + 1;
    const adj = mockAdjectives[Math.floor(Math.random() * mockAdjectives.length)];
    const noun = mockNouns[Math.floor(Math.random() * mockNouns.length)];
    const type = mockTypes[Math.floor(Math.random() * mockTypes.length)];
    const ratio = 1.0 + Math.random() * 0.35;

    newItems.push({
      id,
      title: `${adj} ${noun}`,
      type: `${type} style`,
      price: (50 + Math.random() * 500).toFixed(2),
      rating: (4.5 + Math.random() * 0.5).toFixed(1),
      image: `https://picsum.photos/400/${Math.floor(400 * ratio)}?random=${id}`,
      ratio,
      extraHeight: 90,
    });
  }
  return newItems;
};

// 初始化数据
products.value = generateMockData(10);

const isLoading = ref(false);
const handleLoadMore = () => {
  if (isLoading.value) return;
  isLoading.value = true;

  setTimeout(() => {
    const nextData = generateMockData(6);
    products.value = [...products.value, ...nextData];
    isLoading.value = false;
  }, 1000);
};

/** 跳转到搜索页 */
const goToSearch = () => {
  uni.navigateTo({ url: '/pages_sub/search/index' });
};
</script>

<style lang="scss" scoped>
@use '@/styles/test-page.scss' as test;

.home-content {
  --home-inset-x: #{30rpx};
  --home-section-space: #{36rpx};
  --home-inline-space: #{20rpx};

  background-color: test.$test-bg-page;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  height: 100%;
  flex: 1;
}

.home-waterfall {
  flex: 1;
  min-height: 0;
}

:deep(.lk-waterfall__scroll) {
  width: 100%;
}

:deep(.lk-waterfall__content) {
  width: 100%;
}

:deep(.lk-waterfall__footer) {
  padding: 0;
  pointer-events: none;
}

.header-container {
  padding: var(--home-inset-x);
  flex-shrink: 0;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--home-section-space);
  flex-shrink: 0;

  .user-info {
    display: flex;
    flex-direction: column;

    .welcome-text {
      font-size: 24rpx;
      color: test.$test-text-tertiary;
      margin-bottom: 4rpx;
    }

    .user-name {
      font-size: 36rpx;
      font-weight: bold;
      color: test.$test-text-primary;
    }
  }
}

.search-section {
  display: flex;
  align-items: stretch;
  margin-bottom: var(--home-section-space);
  flex-shrink: 0;

  .filter-trigger-wrap {
    flex: 0 0 100rpx;
    width: 100rpx;
    margin-left: var(--home-inline-space);
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  .filter-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    box-sizing: border-box;

    :deep(.lk-icon) {
      vertical-align: 0;
    }
  }

  .search-bar {
    flex: 1;
    height: 100rpx;
    min-height: 100rpx;
    --_bg: #{test.$test-bg-card};
    --_border: #{test.$test-border-color};
    --_radius: 24rpx;
    --_height: 100rpx;
    --_px: 30rpx;

    .search-ticker {
      flex: 1;
      margin-left: 20rpx;
      font-size: 28rpx;
      color: test.$test-text-tertiary;

      :deep(.lk-notice-bar) {
        height: 100%;
        display: flex;
        align-items: center;
      }

      :deep(.lk-notice-bar__message) {
        font-size: 28rpx;
        color: test.$test-text-tertiary;
      }
    }
  }
}

.home-content--no-list-animation {
  :deep(.lk-waterfall__card) {
    animation: none;
  }
}

.product-card {
  width: 100%;
  box-sizing: border-box;
  padding: 0;

  .image-wrapper {
    position: relative;
    width: 100%;
    border-radius: 24rpx;
    overflow: hidden;
    background-color: test.$test-gray-100;

    .product-image-skeleton {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 1;
      pointer-events: none;
    }

    .product-image {
      width: 100%;
      height: 100%;
      display: block;
      transition: opacity 0.3s ease;
      position: relative;
      z-index: 2;
    }

    .favorite-icon {
      position: absolute;
      top: 24rpx;
      right: 24rpx;
      width: 60rpx;
      height: 60rpx;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(4rpx);
      z-index: 5;
      pointer-events: none;
    }
  }

  .product-info {
    padding: 14rpx 12rpx 8rpx;
    flex-shrink: 0;
    box-sizing: border-box;

    .product-title {
      font-size: 28rpx;
      font-weight: bold;
      color: test.$test-text-primary;
      display: block;
      margin-bottom: 6rpx;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .product-type {
      font-size: 22rpx;
      color: test.$test-text-secondary;
      display: block;
      margin-bottom: 10rpx;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .product-price {
        font-size: 32rpx;
        font-weight: bold;
        color: test.$test-text-primary;
      }

      .rating-box {
        display: flex;
        align-items: center;

        .rating-text {
          margin-left: 6rpx;
          font-size: 24rpx;
          color: test.$test-text-primary;
          font-weight: 500;
        }
      }
    }
  }
}

.waterfall-footer-anchor {
  width: 100%;
  height: 0;
}

.waterfall-loading-overlay {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  display: flex;
  justify-content: center;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(245, 247, 250, 0), rgba(245, 247, 250, 0.92));
}

.lk-theme-dark .waterfall-loading-overlay {
  background: linear-gradient(180deg, rgba(17, 24, 39, 0), rgba(17, 24, 39, 0.9));
}

.loading-toast {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 72rpx;
  padding: 0 28rpx;
  margin-bottom: 12rpx;
  background: test.$test-bg-card;
  border: 1rpx solid test.$test-border-color;
  border-radius: 999rpx;
  box-shadow: test.$test-shadow-sm;

  :deep(.lk-loading) {
    flex-direction: row;
    > :not(:first-child) {
      margin-top: 12rpx;
    }
  }

  :deep(.lk-loading__text) {
    margin-top: 0;
    color: test.$test-text-secondary;
    font-size: 24rpx;
    font-weight: 600;
  }
}

// 筛选弹窗样式
.filter-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: test.$test-bg-page;

  .filter-header {
    padding: 40rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: test.$test-bg-card;

    .filter-title {
      font-size: 36rpx;
      font-weight: bold;
      color: test.$test-text-primary;
    }

    .reset-btn {
      font-size: 26rpx;
      color: test.$test-primary;
    }
  }

  .filter-body {
    flex: 1;
    padding: 40rpx;
    box-sizing: border-box;

    .filter-group {
      margin-bottom: 50rpx;

      .group-title {
        font-size: 30rpx;
        font-weight: bold;
        color: test.$test-text-primary;
        margin-bottom: 24rpx;
        display: block;
      }

      .tag-flex {
        min-width: max-content;

        :deep(.lk-choice) {
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
        }

        :deep(.lk-choice__item) {
          white-space: nowrap;
        }
      }

      .choice-scroll {
        width: 100%;
        white-space: nowrap;
      }

      .price-inputs {
        display: flex;
        align-items: center;

        .price-input {
          flex: 1;
          border-radius: 20rpx;
          text-align: center;

          :deep(.lk-input__inner) {
            height: 80rpx;
            font-size: 28rpx;
            text-align: center;
          }
        }

        .dash {
          margin: 0 20rpx;
          color: test.$test-text-tertiary;
        }
      }
    }
  }

  .filter-footer {
    padding: 40rpx;
    background-color: test.$test-bg-card;
  }
}
</style>
