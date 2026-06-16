<script setup lang="ts">
import { ref } from 'vue';
import LkTab from '@/uni_modules/lucky-ui/components/lk-tab/lk-tab.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

// Active tab references
const active1 = ref('overview');
const active2 = ref('editorial');
const active3 = ref('clothing');
const active4 = ref('badge');
const active5 = ref('slider');

// Phase 2 Slot & Align references
const activeSlotVal = ref('overview');
const activeAlignLeft = ref('overview');
const activeAlignCenter = ref('overview');
const activeAlignRight = ref('overview');

// Swiper linkage reference
const activeSwiperIdx = ref(0);

// Basic & Block Options
const basicOptions = [
  { label: 'Overview', value: 'overview' },
  { label: 'Details', value: 'details' },
  { label: 'Reviews', value: 'reviews' },
];

// High-end Editorial Options (American Luxury Vibe)
const editorialOptions = [
  { label: 'Archive', value: 'editorial', subtitle: '01' },
  { label: 'Seasonal', value: 'seasonal', subtitle: '02' },
  { label: 'Essentials', value: 'essentials', subtitle: '03' },
];

// Long Scrollable Options
const scrollOptions = [
  { label: 'New In', value: 'new' },
  { label: 'Clothing', value: 'clothing' },
  { label: 'Shoes', value: 'shoes' },
  { label: 'Bags & Accessories', value: 'bags' },
  { label: 'Activewear', value: 'activewear' },
  { label: 'Jewelry', value: 'jewelry' },
  { label: 'Beauty & Grooming', value: 'beauty' },
  { label: 'Home & Lifestyle', value: 'home' },
  { label: 'Designer Collections', value: 'designer' },
];

// Options with Badges
const badgeOptions = [
  { label: 'Messages', value: 'message', badge: 12 },
  { label: 'Notifications', value: 'notify', badgeDot: true },
  { label: 'Settings', value: 'badge' },
];

// Swiper panel list
const swiperOptions = [
  { label: 'Collection', value: 'col', subtitle: '01' },
  { label: 'Editorial', value: 'edt', subtitle: '02' },
  { label: 'Campaign', value: 'cmp', subtitle: '03' },
];

function onSwiperChange(e: { detail: { current: number } }) {
  activeSwiperIdx.value = e.detail.current;
}
</script>

<template>
  <view class="demo-container">
    <!-- 面板滑动联动 (Swiper Panel Linkage) -->
    <demo-block title="双向滑动面板联动 (Swiper Linkage)">
      <view class="sub-title">滑动面板与标签栏同步切换，通过 v-model:activeIndex 实现</view>
      <view class="demo-card swiper-demo-wrapper">
        <lk-tab
          v-model:active-index="activeSwiperIdx"
          :options="swiperOptions"
          block
          letter-spacing="0.08em"
          underline-width="60rpx"
        />
        <swiper :current="activeSwiperIdx" class="linked-swiper" @change="onSwiperChange">
          <swiper-item v-for="(item, idx) in swiperOptions" :key="idx">
            <view class="swiper-content-card">
              <text class="swiper-panel-label">{{ item.label }} Panel</text>
              <text class="swiper-panel-desc">
                这里是
                {{
                  item.label
                }}
                内容展示区。支持在下方左/右滑动手指触发切换，顶部下划线会自动磁吸平移到对应标签。
              </text>
            </view>
          </swiper-item>
        </swiper>
      </view>
    </demo-block>

    <!-- 左右固定插槽 (Action Slots) -->
    <demo-block title="左右固定操作插槽 (Slots)">
      <view class="sub-title">支持固定在两侧的图标操作，中间部分可横向滑动</view>
      <view class="demo-card">
        <lk-tab v-model="activeSlotVal" :options="scrollOptions" scrollable>
          <template #left>
            <view class="slot-icon-btn">
              <lk-icon name="search" size="36rpx" />
            </view>
          </template>
          <template #right>
            <view class="slot-icon-btn">
              <lk-icon name="funnel" size="36rpx" />
            </view>
          </template>
        </lk-tab>
      </view>
    </demo-block>

    <!-- 对齐方式 (Align) -->
    <demo-block title="对齐方式 (Align Left / Center / Right)">
      <view class="sub-title">在宽度未占满时，支持靠左、居中、靠右排列</view>
      <view class="demo-card align-demo-card">
        <view class="align-row">
          <text class="align-tag">Left</text>
          <lk-tab v-model="activeAlignLeft" :options="basicOptions" align="left" />
        </view>
        <view class="align-row">
          <text class="align-tag">Center</text>
          <lk-tab v-model="activeAlignCenter" :options="basicOptions" align="center" />
        </view>
        <view class="align-row">
          <text class="align-tag">Right</text>
          <lk-tab v-model="activeAlignRight" :options="basicOptions" align="right" />
        </view>
      </view>
    </demo-block>

    <!-- Basic Usage -->
    <demo-block title="基础用法">
      <view class="sub-title">简约细线底边与滑动微动画</view>
      <view class="demo-card">
        <lk-tab v-model="active1" :options="basicOptions" />
      </view>
    </demo-block>

    <!-- Block Layout -->
    <demo-block title="块级模式 (Block)">
      <view class="sub-title">宽度平分容器，适用于标准页面分段导航</view>
      <view class="demo-card">
        <lk-tab v-model="active1" :options="basicOptions" block />
      </view>
    </demo-block>

    <!-- Scrollable Mode -->
    <demo-block title="横向滚动模式 (Scrollable)">
      <view class="sub-title">子项过多自动滚动，点击项智能平滑居中</view>
      <view class="demo-card no-padding">
        <lk-tab v-model="active3" :options="scrollOptions" scrollable />
      </view>
    </demo-block>

    <!-- Editorial Layout (American Premium Vibe) -->
    <demo-block title="美式高级排版 (Editorial)">
      <view class="sub-title">双行叠字大写、极富质感的留白与字符间距</view>
      <view class="demo-card premium-dark">
        <lk-tab
          v-model="active2"
          :options="editorialOptions"
          block
          letter-spacing="0.1em"
          underline-width="60rpx"
          underline-height="4rpx"
          style="
            --lk-tab-text-color: rgba(255, 255, 255, 0.45);
            --lk-tab-text-active-color: #ffffff;
            --lk-tab-slider-bg: #ffffff;
            --lk-tab-border-color: rgba(255, 255, 255, 0.1);
          "
        />
      </view>
      <view class="demo-card premium-light">
        <lk-tab
          v-model="active2"
          :options="editorialOptions"
          block
          letter-spacing="0.08em"
          underline-width="40rpx"
          underline-height="2rpx"
          style="
            --lk-tab-text-color: #8c8c8c;
            --lk-tab-text-active-color: #1a1a1a;
            --lk-tab-slider-bg: #1a1a1a;
            --lk-tab-border-color: #eaeaea;
          "
        />
      </view>
    </demo-block>

    <!-- Badges -->
    <demo-block title="微标支持 (Badge & Dot)">
      <view class="sub-title">内联小红点与数量提示</view>
      <view class="demo-card">
        <lk-tab v-model="active4" :options="badgeOptions" block />
      </view>
    </demo-block>

    <!-- Custom Slider Width & Toggle -->
    <demo-block title="自定义下划线宽度 / 显示控制">
      <view class="sub-title">限制最大宽度 (40rpx) 居中，或者关闭滑块显示</view>
      <view class="demo-card split-layout">
        <view class="col-half">
          <lk-tab
            v-model="active5"
            :options="basicOptions"
            block
            underline-width="40rpx"
            underline-height="4rpx"
          />
        </view>
        <view class="col-half">
          <lk-tab v-model="active5" :options="basicOptions" block :show-slider="false" />
        </view>
      </view>
    </demo-block>
  </view>
</template>

<style scoped lang="scss">
.demo-container {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 32rpx;
  }
  padding-bottom: 60rpx;
}

.sub-title {
  font-size: 24rpx;
  color: var(--lk-text-secondary);
  margin-bottom: 16rpx;
}

.demo-card {
  background: var(--lk-bg-container);
  border: 1rpx solid var(--lk-border-secondary);
  border-radius: 16rpx;
  padding: 16rpx 0;
  overflow: hidden;

  &.no-padding {
    padding: 16rpx 0;
  }

  &.premium-dark {
    background: #111111;
    border-color: #222222;
  }

  &.premium-light {
    background: #fafafa;
    border-color: #eaeaea;
  }
}

/* Slot button spacing */
.slot-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44rpx;
  height: 44rpx;
  color: var(--lk-text-primary);
  opacity: 0.85;

  &:active {
    opacity: 0.5;
  }
}

/* Align layouts */
.align-demo-card {
  padding: 24rpx;
}

.align-row {
  display: flex;
  flex-direction: column;
  &:not(:first-child) {
    margin-top: 32rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid var(--lk-border-secondary);
  }
}

.align-tag {
  font-size: 20rpx;
  color: var(--lk-text-secondary);
  text-transform: uppercase;
  margin-bottom: 8rpx;
  letter-spacing: 0.05em;
  font-weight: 700;
}

/* Swiper linkage styles */
.swiper-demo-wrapper {
  padding: 0;
}

.linked-swiper {
  height: 240rpx;
  background: var(--lk-fill-tertiary);
  border-top: 1rpx solid var(--lk-border-secondary);
}

.swiper-content-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 40rpx;
  box-sizing: border-box;
  text-align: center;
}

.swiper-panel-label {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--lk-text-primary);
  margin-bottom: 12rpx;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.swiper-panel-desc {
  font-size: 24rpx;
  color: var(--lk-text-secondary);
  line-height: 1.6;
}

/* Split layout */
.split-layout {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 24rpx 0;
}

.col-half {
  flex: 1;
}
</style>
