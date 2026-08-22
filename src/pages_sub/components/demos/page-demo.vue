<script setup lang="ts">
import { ref, computed } from 'vue';
import LkPage from '@/uni_modules/lucky-ui/components/lk-page/lk-page.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkSwitch from '@/uni_modules/lucky-ui/components/lk-switch/lk-switch.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

// 交互控制
const reserveTop = ref(true);
const capsuleAlign = ref(true);
const safeAreaBottom = ref(true);
const showBottomSlot = ref(true);
const scrollable = ref(true);

type SysInfoLike = {
  statusBarHeight?: number;
  windowWidth?: number;
};

// 提取系统指标
const sys: SysInfoLike = typeof uni !== 'undefined' ? (uni.getSystemInfoSync() as SysInfoLike) : {};
const statusBarHeight = sys.statusBarHeight ?? 0;

// 获取胶囊位置参数
let menuButtonInfo = { height: 32, top: statusBarHeight + 6, left: 280 };
// #ifdef MP
try {
  if (typeof uni !== 'undefined' && uni.getMenuButtonBoundingClientRect) {
    const rect = uni.getMenuButtonBoundingClientRect();
    if (rect && rect.height) {
      menuButtonInfo = {
        height: rect.height,
        top: rect.top,
        left: rect.left,
      };
    }
  }
} catch {
  // ignore
}
// #endif

// 计算模拟导航栏的高度
const navbarHeight = computed(() => {
  const capsuleHeight = menuButtonInfo.height;
  const capsuleTop = menuButtonInfo.top;
  if (capsuleHeight > 0) {
    return capsuleHeight + (capsuleTop - statusBarHeight) * 2;
  }
  return 44;
});

const totalNavHeight = computed(() => statusBarHeight + navbarHeight.value);
</script>

<template>
  <view class="component-demo">
    <demo-block title="布局参数配置">
      <view class="demo-controls">
        <view class="control-item">
          <view class="control-text">
            <text class="control-title">顶部导航高度留白 (reserveTop)</text>
            <text class="control-desc">开启后自动为自定义导航栏预留高度</text>
          </view>
          <lk-switch v-model="reserveTop" />
        </view>
        <view class="control-item">
          <view class="control-text">
            <text class="control-title">左侧插槽胶囊对齐 (capsuleAlign)</text>
            <text class="control-desc">使左侧返回按钮与右侧胶囊按钮垂直物理居中</text>
          </view>
          <lk-switch v-model="capsuleAlign" />
        </view>
        <view class="control-item">
          <view class="control-text">
            <text class="control-title">底部安全区适配 (safeAreaBottom)</text>
            <text class="control-desc">开启时自动在底部空出系统操作条距离</text>
          </view>
          <lk-switch v-model="safeAreaBottom" />
        </view>
        <view class="control-item">
          <view class="control-text">
            <text class="control-title">使用底部插槽 (showBottomSlot)</text>
            <text class="control-desc">显示底部的提交/操作固定操作栏</text>
          </view>
          <lk-switch v-model="showBottomSlot" />
        </view>
        <view class="control-item">
          <view class="control-text">
            <text class="control-title">启用默认滚动区域 (scrollable)</text>
            <text class="control-desc">关闭则为普通容器，方便自定义更复杂的滚动</text>
          </view>
          <lk-switch v-model="scrollable" />
        </view>
      </view>
    </demo-block>

    <demo-block title="物理布局模拟器">
      <view class="simulator-container">
        <!-- 模拟手机外壳 -->
        <view class="phone-simulator">
          <!-- 模拟的小程序右上角胶囊按钮 -->
          <view
            class="mock-capsule"
            :style="{
              top: menuButtonInfo.top + 'px',
              height: menuButtonInfo.height + 'px',
            }"
          >
            <view class="capsule-dot" />
            <view class="capsule-line" />
            <view class="capsule-circle" />
          </view>

          <!-- 模拟的顶部自定义导航栏 (当 reserveTop 时配合展示，辅助看清位置关系) -->
          <view
            class="mock-navbar"
            :style="{
              height: totalNavHeight + 'px',
              paddingTop: statusBarHeight + 'px',
            }"
            :class="{ 'is-transparent': !reserveTop }"
          >
            <text class="mock-navbar__title">自定义导航栏</text>
          </view>

          <!-- 测试的目标组件: LkPage -->
          <lk-page
            :reserve-top="reserveTop"
            :capsule-align="capsuleAlign"
            :safe-area-bottom="safeAreaBottom"
            :scrollable="scrollable"
            custom-class="simulator-page"
          >
            <!-- 左侧插槽 -->
            <template #left>
              <view class="mock-left-slot">
                <lk-icon name="arrow-left" size="36" color="var(--lk-text-primary)" />
                <lk-icon
                  name="house"
                  size="34"
                  color="var(--lk-text-primary)"
                  style="margin-left: 16rpx"
                />
              </view>
            </template>

            <!-- 默认插槽 (滚动内容) -->
            <view class="simulator-body">
              <view class="content-info-card">
                <text class="info-card-title">配置状态监控</text>
                <view class="info-card-row">
                  <text class="info-card-label">顶部高度预留:</text>
                  <text class="info-card-val" :class="{ 'is-active': reserveTop }">{{
                    reserveTop ? '已开启' : '直接贴顶'
                  }}</text>
                </view>
                <view class="info-card-row">
                  <text class="info-card-label">左侧返回键对齐:</text>
                  <text class="info-card-val" :class="{ 'is-active': capsuleAlign }">{{
                    capsuleAlign ? '胶囊按钮居中' : '标准导航居中'
                  }}</text>
                </view>
                <view class="info-card-row">
                  <text class="info-card-label">底部安全适配:</text>
                  <text class="info-card-val" :class="{ 'is-active': safeAreaBottom }">{{
                    safeAreaBottom ? '自动留空适配' : '无安全留白'
                  }}</text>
                </view>
              </view>

              <view v-for="item in 12" :key="item" class="mock-content-card">
                <text class="mock-card-title">段落内容示例 #{{ item }}</text>
                <text class="mock-card-desc"
                  >此处为页面主体滚动内容。通过滑动可以测试顶部和底部在滚动时的穿透与对齐效果。支持在小程序或全面屏手机上直观查看底部安全区是否被操作条遮挡。</text
                >
              </view>
            </view>

            <!-- 底部插槽 -->
            <template v-if="showBottomSlot" #bottom>
              <view class="mock-bottom-bar">
                <lk-button type="primary" block>保存并提交配置</lk-button>
              </view>
            </template>
          </lk-page>

          <!-- 模拟物理 Home Indicator 安全区操作条 -->
          <view class="mock-home-indicator" />
        </view>
      </view>
    </demo-block>
  </view>
</template>

<style scoped lang="scss">
.component-demo {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.demo-controls {
  display: flex;
  flex-direction: column;
  background-color: var(--lk-bg-container);
  border-radius: var(--lk-radius-lg);
  padding: 12rpx 24rpx;
  border: 1rpx solid var(--lk-border-color);

  .control-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 0;

    &:not(:last-child) {
      border-bottom: 1rpx solid var(--lk-border-color-light);
    }
  }

  .control-text {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  .control-title {
    font-size: 28rpx;
    font-weight: 600;
    color: var(--lk-text-primary);
  }

  .control-desc {
    font-size: 22rpx;
    color: var(--lk-text-tertiary);
  }
}

.simulator-container {
  display: flex;
  justify-content: center;
  padding: 24rpx 0;
}

.phone-simulator {
  position: relative;
  width: 100%;
  max-width: 700rpx;
  height: 960rpx;
  border-radius: 48rpx;
  border: 12rpx solid #1a1a1a;
  background-color: var(--lk-bg-page);
  overflow: hidden;
  box-shadow: 0 24rpx 48rpx rgba(0, 0, 0, 0.12);
}

.mock-capsule {
  position: absolute;
  right: 20rpx;
  width: 160rpx;
  border-radius: 32rpx;
  background-color: rgba(255, 255, 255, 0.7);
  border: 1rpx solid rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  z-index: 210;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding: 0 10rpx;
  box-sizing: border-box;

  .capsule-dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background-color: #000;
  }

  .capsule-line {
    width: 2rpx;
    height: 24rpx;
    background-color: rgba(0, 0, 0, 0.15);
  }

  .capsule-circle {
    width: 24rpx;
    height: 24rpx;
    border-radius: 50%;
    border: 4rpx solid #000;
    box-sizing: border-box;
  }
}

.mock-navbar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--lk-bg-container);
  border-bottom: 1rpx solid var(--lk-border-color);
  z-index: 180;
  box-sizing: border-box;
  transition: all 0.3s;

  &.is-transparent {
    background-color: transparent;
    border-color: transparent;
    pointer-events: none;
    .mock-navbar__title {
      opacity: 0;
    }
  }

  &__title {
    font-size: 28rpx;
    font-weight: 600;
    color: var(--lk-text-primary);
  }
}

:deep(.simulator-page) {
  background-color: var(--lk-bg-page);
}

.mock-left-slot {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.75);
  border: 1rpx solid var(--lk-border-color);
  padding: 8rpx 16rpx;
  border-radius: 32rpx;
  backdrop-filter: blur(10px);
}

.simulator-body {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.content-info-card {
  background: linear-gradient(
    135deg,
    var(--lk-color-primary-soft),
    rgba(var(--lk-color-primary-rgb), 0.05)
  );
  border: 1rpx solid var(--lk-color-primary-soft);
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;

  .info-card-title {
    font-size: 26rpx;
    font-weight: 700;
    color: var(--lk-color-primary);
  }

  .info-card-row {
    display: flex;
    justify-content: space-between;
    font-size: 22rpx;
  }

  .info-card-label {
    color: var(--lk-text-secondary);
  }

  .info-card-val {
    color: var(--lk-text-tertiary);
    font-weight: 600;

    &.is-active {
      color: var(--lk-color-success);
    }
  }
}

.mock-content-card {
  background-color: var(--lk-bg-container);
  border: 1rpx solid var(--lk-border-color);
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;

  .mock-card-title {
    font-size: 26rpx;
    font-weight: 600;
    color: var(--lk-text-primary);
  }

  .mock-card-desc {
    font-size: 22rpx;
    color: var(--lk-text-secondary);
    line-height: 1.4;
  }
}

.mock-bottom-bar {
  background-color: var(--lk-bg-container);
  border-top: 1rpx solid var(--lk-border-color);
  padding: 20rpx 24rpx;
}

.mock-home-indicator {
  position: absolute;
  bottom: 8rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 240rpx;
  height: 8rpx;
  border-radius: 4rpx;
  background-color: #000000;
  z-index: 220;
  pointer-events: none;
}
</style>
