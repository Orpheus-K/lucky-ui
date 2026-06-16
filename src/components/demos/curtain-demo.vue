<script setup lang="ts">
import { ref, computed } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkChoice from '@/uni_modules/lucky-ui/components/lk-choice/lk-choice.vue';
import type { CurtainClosePosition } from '@/uni_modules/lucky-ui/components/lk-curtain/curtain.props';

// 基础展示
const showBasic = ref(false);

// 位置展示
const showPosition = ref(false);
const currentPosition = ref<CurtainClosePosition>('bottom');
const offsetType = ref<'inner' | 'outer'>('outer');

const currentOffset = computed(() => {
  return offsetType.value === 'inner' ? '24rpx' : '-24rpx';
});

const openPosition = (pos: CurtainClosePosition) => {
  currentPosition.value = pos;
  showPosition.value = true;
};

// 遮罩关闭
const showOverlayClose = ref(false);

// 自定义内容 (插槽)
const showCustom = ref(false);

/**
 * 这里的点击事件在小程序端需要注意：
 * 幕帘内部点击通常会触发业务逻辑（跳转、领券等）
 */
const onCurtainClick = () => {
  uni.showToast({
    title: '点击幕帘内容',
    icon: 'none',
  });
};

const onReceive = () => {
  showCustom.value = false;
  uni.showToast({
    title: '领取成功',
    icon: 'success',
  });
};
</script>

<template>
  <view class="curtain-demo">
    <view class="demo-container">
      <!-- 基础用法 -->
      <demo-block title="基础用法">
        <view class="demo-p">最简单的图片幕帘展示。</view>
        <lk-button block @click="showBasic = true">显示基础幕帘</lk-button>
        <lk-curtain
          v-model="showBasic"
          image-url="https://img.yzcdn.cn/vant/apple-1.jpg"
          @click="onCurtainClick"
        />
      </demo-block>

      <!-- 位置展示 -->
      <demo-block title="关闭按钮位置">
        <view class="demo-p">设置 close-position 调整关闭图标位置。</view>

        <view style="margin-bottom: 24rpx">
          <lk-choice
            v-model="offsetType"
            :options="[
              { label: '外侧角位 (默认)', value: 'outer' },
              { label: '内侧角位', value: 'inner' },
            ]"
            type="button"
          />
        </view>

        <lk-space wrap>
          <lk-button size="sm" @click="openPosition('top-left')">左上角</lk-button>
          <lk-button size="sm" @click="openPosition('top-right')">右上角</lk-button>
          <lk-button size="sm" @click="openPosition('bottom-left')">左下角</lk-button>
          <lk-button size="sm" @click="openPosition('bottom-right')">右下角</lk-button>
        </lk-space>
        <view style="margin-top: 10px">
          <lk-button block variant="soft" @click="openPosition('bottom')">正下方 (默认)</lk-button>
        </view>
        <lk-curtain
          v-model="showPosition"
          :close-position="currentPosition"
          :close-offset="currentOffset"
          image-url="https://img.yzcdn.cn/vant/apple-2.jpg"
        />
      </demo-block>

      <!-- 遮罩关闭 -->
      <demo-block title="点击遮罩关闭">
        <lk-button block variant="outline" @click="showOverlayClose = true">
          开启遮罩层点击关闭
        </lk-button>
        <lk-curtain
          v-model="showOverlayClose"
          close-on-overlay
          image-url="https://img.yzcdn.cn/vant/apple-3.jpg"
        />
      </demo-block>

      <!-- 自定义内容 -->
      <demo-block title="自定义插槽内容">
        <view class="demo-p">使用默认插槽实现高度自定义的营销弹窗。</view>
        <lk-button block type="primary" @click="showCustom = true"> 领取新人大礼包 </lk-button>

        <lk-curtain
          v-model="showCustom"
          width="580rpx"
          height="800rpx"
          close-position="bottom"
          close-offset-bottom="80rpx"
        >
          <view class="coupon-card">
            <view class="coupon-card__header">
              <lk-icon name="gift" size="80" color="#ffffff" />
              <text class="title">新人专享礼</text>
            </view>
            <view class="coupon-card__body">
              <view class="amount">
                <text class="symbol">¥</text>
                <text class="value">50</text>
              </view>
              <text class="condition">满 200 元可用</text>
              <text class="tips">全场通用 · 有效期 7 天</text>
            </view>
            <view class="coupon-card__footer">
              <lk-button
                round
                block
                type="error"
                style="background: #ff4444; color: #fff"
                @click.stop="onReceive"
              >
                立即领取
              </lk-button>
            </view>
          </view>
        </lk-curtain>
      </demo-block>
    </view>
  </view>
</template>

<style lang="scss" scoped>
@use '@/styles/test-page.scss' as test;

.curtain-demo {
  min-height: 100vh;
  background-color: test.$test-bg-page;
}

.demo-container {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 32rpx;
  }
}

.demo-p {
  font-size: 26rpx;
  color: test.$test-text-secondary;
  margin-bottom: 20rpx;
}

/* 自定义优惠券卡片样式 */
.coupon-card {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #ff4444 0%, #ff8855 100%);
  border-radius: 32rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__header {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 40rpx;

    .title {
      color: #fff;
      font-size: 44rpx;
      font-weight: bold;
      margin-top: 20rpx;
    }
  }

  &__body {
    background: var(--lk-bg-container);
    margin: 0 40rpx;
    padding: 40rpx 0;
    border-radius: 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .amount {
      color: #ff4444;
      font-weight: bold;

      .symbol {
        font-size: 32rpx;
      }
      .value {
        font-size: 80rpx;
      }
    }

    .condition {
      font-size: 28rpx;
      color: var(--lk-text-primary);
      margin-top: 10rpx;
    }

    .tips {
      font-size: 24rpx;
      color: var(--lk-text-secondary);
      margin-top: 20rpx;
    }
  }

  &__footer {
    padding: 40rpx;
  }
}
</style>
