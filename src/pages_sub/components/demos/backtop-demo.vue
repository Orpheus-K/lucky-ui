<script setup lang="ts">
import { ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkBacktop from '@/uni_modules/lucky-ui/components/lk-backtop/lk-backtop.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import {
  scrollControlledToTop,
  scrollToTopIfTopAreaTap,
} from '@/uni_modules/lucky-ui/core/src/utils/scroll';

type ScrollEvent = {
  detail?: {
    scrollTop?: number;
  };
};

const innerTop = ref(0);
const phoneTop = ref(0);

function onSvScroll(event: ScrollEvent) {
  // #ifdef H5 || MP || APP-PLUS
  innerTop.value = event.detail?.scrollTop || 0;
  // #endif
}

function onPhoneScroll(event: ScrollEvent) {
  phoneTop.value = event.detail?.scrollTop || 0;
}

function scrollInnerToTop() {
  scrollControlledToTop({
    startScrollTop: innerTop.value,
    duration: 640,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    setScrollTop: value => {
      innerTop.value = value;
    },
  });
}

function scrollPhoneToTop() {
  scrollControlledToTop({
    startScrollTop: phoneTop.value,
    duration: 420,
    easing: 'easeOutCubic',
    setScrollTop: value => {
      phoneTop.value = value;
    },
  });
}

function onPageTopAreaTap(event: unknown) {
  scrollToTopIfTopAreaTap(event, {
    duration: 300,
    topAreaHeight: Number.MAX_SAFE_INTEGER,
  });
}
</script>

<template>
  <view class="component-demo">
    <demo-block title="顶部区域点击回顶">
      <view class="desc">
        将顶部热区点击逻辑抽到工具后，可绑定在自定义导航栏或状态栏区域，实现类似微信点击顶部回顶。
      </view>
      <view class="page-top-trigger" @tap="onPageTopAreaTap">
        <lk-icon name="arrow-up" size="28" color="primary" />
        <text>页面级：模拟顶部热区点击</text>
      </view>
      <view class="phone-shell">
        <view class="phone-top-area" @tap="scrollPhoneToTop">
          <text>点击顶部区域回到列表顶部</text>
        </view>
        <scroll-view class="phone-scroll" scroll-y :scroll-top="phoneTop" @scroll="onPhoneScroll">
          <view class="phone-content">
            <view v-for="i in 24" :key="i" class="phone-item">
              <text class="phone-item__title">消息会话 {{ i }}</text>
              <text class="phone-item__desc">模拟微信列表，点击上方顶部区域立即回顶。</text>
            </view>
          </view>
        </scroll-view>
      </view>
      <view class="code-tip">
        页面级滚动可直接使用 scrollToTopIfTopAreaTap(event)，受控 scroll-view 使用
        scrollControlledToTop。
      </view>
    </demo-block>

    <demo-block title="在容器内演示（受控模式）">
      <view class="desc"
        >在内部 scroll-view 中演示 Backtop 的出现与回顶（通过 scrollTop 受控）。</view
      >
      <scroll-view class="sv-box" scroll-y :scroll-top="innerTop" @scroll="onSvScroll">
        <view class="sv-content">
          <view v-for="i in 30" :key="i" class="item">示例项目 {{ i }}</view>
        </view>
      </scroll-view>
      <lk-backtop
        :use-page-scroll="false"
        :scroll-top="innerTop"
        :bottom="'120rpx'"
        :duration="640"
        easing="cubic-bezier(0.22, 1, 0.36, 1)"
        @to-top="scrollInnerToTop"
      />
    </demo-block>

    <demo-block title="基础用法">
      <view class="desc">页面向下滚动超过可视高度后出现，点击回到顶部。</view>
      <view class="placeholder" />
      <view class="placeholder" />
      <view class="placeholder" />
      <lk-backtop :visibility-height="200" />
    </demo-block>

    <demo-block title="自定义位置与形状">
      <view class="desc">可通过 right、bottom 调整位置，shape 支持 circle/square/round。</view>
      <view class="placeholder" />
      <view class="placeholder" />
      <lk-backtop :right="'40rpx'" :bottom="'160rpx'" shape="round" />
      <lk-backtop :right="'140rpx'" :bottom="'160rpx'" shape="square" size="sm" />
    </demo-block>

    <demo-block title="自定义内容">
      <view class="desc">可通过默认插槽自定义内容。</view>
      <view class="placeholder" />
      <view class="placeholder" />
      <lk-backtop :bottom="'240rpx'">
        <lk-icon name="arrow-up-circle-fill" size="40" color="currentColor" />
        <text class="slot-text">TOP</text>
      </lk-backtop>
    </demo-block>

    <demo-block title="阈值、时长与贝塞尔速率">
      <view class="desc">
        通过 visibilityHeight 控制出现阈值，通过 duration 与 easing 控制回顶节奏。
      </view>
      <view class="placeholder" />
      <view class="placeholder" />
      <lk-backtop
        :bottom="'320rpx'"
        :visibility-height="600"
        :duration="640"
        easing="cubic-bezier(0.22, 1, 0.36, 1)"
      />
    </demo-block>

    <view class="tips">
      <lk-icon name="info-circle" size="28" color="var(--lk-color-info)" />
      <text class="tips__text">
        说明：本详情页使用 scroll-view 容器滚动。页面级顶部热区可以把 onPageTopAreaTap
        绑定到自定义导航栏或状态栏容器，受控滚动容器则通过 scrollControlledToTop 回顶。
      </text>
    </view>
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

.desc {
  font-size: 24rpx;
  color: var(--lk-text-secondary);
  margin-bottom: 16rpx;
}

.sv-box {
  height: 520rpx;
  border: 2rpx solid var(--lk-color-border);
  border-radius: var(--lk-radius-lg);
  background: var(--lk-bg-container);
  overflow: hidden;
}

.phone-shell {
  overflow: hidden;
  border: 2rpx solid var(--lk-color-border);
  border-radius: var(--lk-radius-xl);
  background: var(--lk-bg-container);
}

.page-top-trigger {
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  > :not(:first-child) {
    margin-left: 8rpx;
  }
  margin-bottom: 16rpx;
  border: 2rpx dashed var(--lk-color-primary);
  border-radius: var(--lk-radius-lg);
  background: var(--lk-color-primary-soft);
  color: var(--lk-color-primary);
  font-size: var(--lk-font-size-sm);
  font-weight: 600;
}

.phone-top-area {
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 2rpx solid var(--lk-color-border-light);
  background: var(--lk-bg-container);
  color: var(--lk-color-primary);
  font-size: var(--lk-font-size-sm);
  font-weight: 600;
}

.phone-scroll {
  height: 520rpx;
}

.phone-content {
  padding: 16rpx;
}

.phone-item {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 8rpx;
  }
  padding: 20rpx;
  margin-bottom: 12rpx;
  border-radius: var(--lk-radius-lg);
  background: var(--lk-fill-1);
}

.phone-item__title {
  color: var(--lk-text-primary);
  font-size: var(--lk-font-size-base);
  font-weight: 600;
}

.phone-item__desc {
  color: var(--lk-text-secondary);
  font-size: var(--lk-font-size-xs);
}

.code-tip {
  margin-top: 16rpx;
  color: var(--lk-text-secondary);
  font-size: var(--lk-font-size-xs);
  line-height: 1.6;
}
.sv-content {
  padding: 16rpx;
}
.item {
  height: 80rpx;
  display: flex;
  align-items: center;
  padding: 0 16rpx;
  margin-bottom: 12rpx;
  border-radius: var(--lk-radius-md);
  background: var(--lk-fill-1);
  color: var(--lk-text-secondary);
}

.placeholder {
  height: 600rpx;
  background: var(--lk-bg-container);
  border-radius: var(--lk-radius-lg);
  border: 2rpx dashed var(--lk-color-border);
}

.slot-text {
  font-size: 22rpx;
  color: inherit;
}

.tips {
  display: flex;
  align-items: flex-start;
  > :not(:first-child) {
    margin-left: 12rpx;
  }
  padding: 16rpx;
  background: var(--lk-color-info-soft);
  border-radius: var(--lk-radius-md);
  color: var(--lk-text-primary);
}

.tips__text {
  font-size: 22rpx;
  color: var(--lk-text-secondary);
}
</style>
