<script setup lang="ts">
import { ref, computed } from 'vue';
import LkPage from '@/uni_modules/lucky-ui/components/lk-page/lk-page.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkTag from '@/uni_modules/lucky-ui/components/lk-tag/lk-tag.vue';
import LkCard from '@/uni_modules/lucky-ui/components/lk-card/lk-card.vue';
import LkCellGroup from '@/uni_modules/lucky-ui/components/lk-cell/lk-cell-group.vue';
import LkCell from '@/uni_modules/lucky-ui/components/lk-cell/lk-cell.vue';
import LkPopup from '@/uni_modules/lucky-ui/components/lk-popup/lk-popup.vue';
import LkSwitch from '@/uni_modules/lucky-ui/components/lk-switch/lk-switch.vue';
import { useTheme } from '@/uni_modules/lucky-ui/theme';

type SceneMode = 'order' | 'immersive' | 'result';

const currentScene = ref<SceneMode>('order');
const showConfigDrawer = ref(false);

const customConfig = ref({
  reserveTop: true,
  capsuleAlign: true,
  safeAreaBottom: true,
  scrollable: true,
  showLeftSlot: true,
  showBottomSlot: true,
});

const { theme, toggleTheme, themeClass } = useTheme();

const activeProps = computed(() => {
  if (currentScene.value === 'immersive') {
    return {
      reserveTop: false,
      capsuleAlign: true,
      safeAreaBottom: true,
      scrollable: true,
      showLeftSlot: true,
      showBottomSlot: true,
    };
  }
  if (currentScene.value === 'result') {
    return {
      reserveTop: true,
      capsuleAlign: true,
      safeAreaBottom: true,
      scrollable: false,
      showLeftSlot: true,
      showBottomSlot: true,
    };
  }
  return {
    reserveTop: customConfig.value.reserveTop,
    capsuleAlign: customConfig.value.capsuleAlign,
    safeAreaBottom: customConfig.value.safeAreaBottom,
    scrollable: customConfig.value.scrollable,
    showLeftSlot: customConfig.value.showLeftSlot,
    showBottomSlot: customConfig.value.showBottomSlot,
  };
});

function switchScene(scene: SceneMode) {
  currentScene.value = scene;
  if (scene === 'order') {
    customConfig.value = {
      reserveTop: true,
      capsuleAlign: true,
      safeAreaBottom: true,
      scrollable: true,
      showLeftSlot: true,
      showBottomSlot: true,
    };
  }
  uni.showToast({
    title: `已切换：${scene === 'order' ? '标准订单页' : scene === 'immersive' ? '沉浸大图页' : '全屏结果页'}`,
    icon: 'none',
  });
}

function handleBack() {
  uni.showToast({ title: '返回上一页 (Back)', icon: 'none' });
}

function handleHome() {
  uni.showToast({ title: '返回主页 (Home)', icon: 'none' });
}

function handlePay() {
  uni.showToast({ title: '正在拉起支付...', icon: 'none' });
}

function handleCancel() {
  uni.showToast({ title: '订单已取消', icon: 'none' });
}
</script>

<template>
  <view class="page-component-preview" :class="themeClass">
    <!-- 核心 Page 容器 -->
    <lk-page
      :reserve-top="activeProps.reserveTop"
      :capsule-align="activeProps.capsuleAlign"
      :safe-area-bottom="activeProps.safeAreaBottom"
      :scrollable="activeProps.scrollable"
      :custom-class="['business-page-root', themeClass]"
    >
      <!-- 左侧插槽：胶囊垂直居中 -->
      <template v-if="activeProps.showLeftSlot" #left>
        <view
          v-if="currentScene === 'immersive'"
          class="immersive-back-btn"
          @click="handleBack"
        >
          <lk-icon name="arrow-left" size="36" color="#ffffff" />
        </view>

        <view v-else class="capsule-nav-actions">
          <view class="nav-action-btn" @click="handleBack">
            <lk-icon name="arrow-left" size="34" color="var(--lk-text-primary)" />
          </view>
          <view class="nav-action-divider" />
          <view class="nav-action-btn" @click="handleHome">
            <lk-icon name="house" size="32" color="var(--lk-text-primary)" />
          </view>
        </view>
      </template>

      <!-- 默认插槽：主体内容 -->
      <!-- 场景一：标准二级订单详情页 -->
      <view v-if="currentScene === 'order'" class="business-body">
        <!-- 顶部效果切换卡片 -->
        <view class="scene-switcher-card">
          <view class="switcher-header">
            <view class="switcher-title-wrap">
              <lk-icon name="sliders" size="30" color="var(--lk-color-primary)" />
              <text class="switcher-title">LkPage 效果切换</text>
            </view>
            <view class="theme-pill" @click="toggleTheme">
              <lk-icon :name="theme === 'dark' ? 'sun' : 'moon'" size="24" />
              <text class="theme-text">{{ theme === 'dark' ? '暗色' : '亮色' }}</text>
            </view>
          </view>

          <view class="scene-grid">
            <view class="scene-btn is-active" @click="switchScene('order')">
              <lk-icon name="receipt" size="34" />
              <text class="scene-label">标准订单</text>
            </view>
            <view class="scene-btn" @click="switchScene('immersive')">
              <lk-icon name="image" size="34" />
              <text class="scene-label">沉浸大图</text>
            </view>
            <view class="scene-btn" @click="switchScene('result')">
              <lk-icon name="check-circle" size="34" />
              <text class="scene-label">全屏结果</text>
            </view>
            <view class="scene-btn" @click="showConfigDrawer = true">
              <lk-icon name="gear" size="34" />
              <text class="scene-label">参数调试</text>
            </view>
          </view>
        </view>

        <!-- 订单状态横幅 -->
        <view class="order-status-banner">
          <view class="status-left">
            <text class="status-main">等待买家付款</text>
            <text class="status-sub">剩 14:59 自动取消 · 订单 #LK-9824</text>
          </view>
          <lk-icon name="clock" size="40" color="var(--lk-color-primary)" />
        </view>

        <!-- 服务商品卡片 -->
        <lk-card>
          <view class="product-item">
            <view class="product-thumb">
              <lk-icon name="tools" size="56" color="var(--lk-color-primary)" />
            </view>
            <view class="product-info">
              <text class="product-title">全屋智能家电深度清洗保养</text>
              <view class="product-tags">
                <lk-tag size="sm" color="primary">专业认证</lk-tag>
                <lk-tag size="sm" color="success">极速上门</lk-tag>
              </view>
              <view class="product-price-row">
                <text class="price-symbol">¥<text class="price-val">249.00</text></text>
                <text class="price-qty">× 1</text>
              </view>
            </view>
          </view>
        </lk-card>

        <!-- 费用与地址明细 -->
        <lk-card>
          <lk-cell-group>
            <lk-cell title="服务地址" label="北京市海淀区中关村南大街 1 号 801 室" />
            <lk-cell title="新客礼券" value="-¥50.00" />
            <lk-cell title="实付金额" value="¥249.00" />
          </lk-cell-group>
        </lk-card>
      </view>

      <!-- 场景二：沉浸大图详情页 -->
      <view v-else-if="currentScene === 'immersive'" class="business-body is-immersive">
        <view class="immersive-hero">
          <view class="hero-content">
            <lk-tag color="primary" size="sm">探索自然</lk-tag>
            <text class="hero-heading">山林秘境·高空探索</text>
            <text class="hero-sub">沉浸大图贴顶穿透 (reserveTop=false)</text>
          </view>
        </view>

        <view class="immersive-inner">
          <view class="scene-strip">
            <text class="strip-text">当前处于沉浸式模式</text>
            <lk-button size="sm" type="primary" @click="switchScene('order')">返回标准页</lk-button>
          </view>

          <lk-card title="亮点特色">
            <text class="info-desc">全景高空步道，专业领队带队保障，支持提前24小时退订。</text>
          </lk-card>
        </view>
      </view>

      <!-- 场景三：全屏不可滚动结果页 -->
      <view v-else-if="currentScene === 'result'" class="business-body is-result">
        <view class="result-card">
          <lk-icon name="check-circle-fill" size="108" color="var(--lk-color-success)" />
          <text class="result-title">预约办理成功</text>
          <text class="result-desc">服务工单 #YZ-8899201 已派发给工程师</text>

          <view class="result-info-box">
            <view class="info-line">
              <text class="info-label">服务人员</text>
              <text class="info-val">张师傅 (认证工程师)</text>
            </view>
            <view class="info-line">
              <text class="info-label">上门时间</text>
              <text class="info-val">明日 09:30 - 11:30</text>
            </view>
          </view>

          <lk-button block type="primary" @click="switchScene('order')">返回标准订单页</lk-button>
        </view>
      </view>

      <!-- 底部吸底操作栏 -->
      <template v-if="activeProps.showBottomSlot" #bottom>
        <view v-if="currentScene === 'order'" class="order-bottom-bar">
          <view class="bottom-price-info">
            <text class="price-label">实付：</text>
            <text class="price-symbol">¥<text class="price-num">249.00</text></text>
          </view>
          <view class="bottom-actions">
            <lk-button size="md" @click="handleCancel">取消</lk-button>
            <lk-button size="md" type="primary" @click="handlePay">立即支付</lk-button>
          </view>
        </view>

        <view v-else-if="currentScene === 'immersive'" class="order-bottom-bar">
          <text class="price-symbol">¥198.00<text class="price-label"> 起</text></text>
          <lk-button size="md" type="primary" @click="handlePay">立即预订</lk-button>
        </view>

        <view v-else-if="currentScene === 'result'" class="order-bottom-bar is-center">
          <text class="footer-tip">Lucky UI · 基础布局容器</text>
        </view>
      </template>
    </lk-page>

    <!-- 自由微调参数抽屉 -->
    <lk-popup v-model="showConfigDrawer" position="bottom" round title="LkPage 属性微调">
      <view class="drawer-content">
        <view class="drawer-item">
          <view class="item-text">
            <text class="item-title">预留顶部导航高度 (reserveTop)</text>
            <text class="item-desc">状态栏 + 胶囊导航区自适应避让</text>
          </view>
          <lk-switch v-model="customConfig.reserveTop" />
        </view>

        <view class="drawer-item">
          <view class="item-text">
            <text class="item-title">左侧胶囊物理居中 (capsuleAlign)</text>
            <text class="item-desc">与小程序右上角胶囊按钮垂直居中</text>
          </view>
          <lk-switch v-model="customConfig.capsuleAlign" />
        </view>

        <view class="drawer-item">
          <view class="item-text">
            <text class="item-title">底部安全区留白 (safeAreaBottom)</text>
            <text class="item-desc">全面屏底条 Home Indicator 避让</text>
          </view>
          <lk-switch v-model="customConfig.safeAreaBottom" />
        </view>

        <view class="drawer-item">
          <view class="item-text">
            <text class="item-title">启用滚动容器 (scrollable)</text>
            <text class="item-desc">关闭则为普通非滚动容器</text>
          </view>
          <lk-switch v-model="customConfig.scrollable" />
        </view>

        <view class="drawer-item">
          <view class="item-text">
            <text class="item-title">渲染左侧插槽 (#left)</text>
            <text class="item-desc">返回与首页操作区</text>
          </view>
          <lk-switch v-model="customConfig.showLeftSlot" />
        </view>

        <view class="drawer-item">
          <view class="item-text">
            <text class="item-title">渲染底部插槽 (#bottom)</text>
            <text class="item-desc">吸底操作结算栏</text>
          </view>
          <lk-switch v-model="customConfig.showBottomSlot" />
        </view>

        <view class="drawer-actions">
          <lk-button block type="primary" @click="showConfigDrawer = false">完成配置</lk-button>
        </view>
      </view>
    </lk-popup>
  </view>
</template>

<style scoped lang="scss">
.page-component-preview {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
}

:deep(.business-page-root) {
  background-color: var(--lk-bg-page);
}

// 胶囊双按钮
.capsule-nav-actions {
  display: flex;
  align-items: center;
  background-color: var(--lk-bg-container);
  backdrop-filter: blur(16px);
  border: 1rpx solid var(--lk-color-border-light);
  border-radius: 36rpx;
  padding: 6rpx 14rpx;
  box-shadow: var(--lk-shadow-sm);

  .nav-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rpx 6rpx;
    cursor: pointer;
  }

  .nav-action-divider {
    width: 2rpx;
    height: 22rpx;
    background-color: var(--lk-color-border-light);
    margin: 0 6rpx;
  }
}

.immersive-back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(12px);
  cursor: pointer;
}

// 业务容器
.business-body {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 20rpx;
  box-sizing: border-box;

  &.is-immersive {
    padding: 0;
    gap: 0;
  }

  &.is-result {
    flex: 1;
    justify-content: center;
    align-items: center;
    padding: 32rpx;
  }
}

// 场景切换卡片
.scene-switcher-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 20rpx;
  border-radius: var(--lk-radius-lg);
  background: linear-gradient(
    135deg,
    var(--lk-color-primary-soft),
    rgba(var(--lk-color-primary-rgb), 0.04)
  );
  border: 1rpx solid var(--lk-color-primary-soft);

  .switcher-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .switcher-title-wrap {
    display: flex;
    align-items: center;
    gap: 10rpx;
  }

  .switcher-title {
    font-size: 26rpx;
    font-weight: 700;
    color: var(--lk-color-primary);
  }

  .theme-pill {
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 4rpx 14rpx;
    border-radius: 20rpx;
    background-color: var(--lk-bg-container);
    border: 1rpx solid var(--lk-border-color-light);
    cursor: pointer;

    .theme-text {
      font-size: 20rpx;
      color: var(--lk-text-secondary);
    }
  }

  .scene-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10rpx;
  }

  .scene-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6rpx;
    padding: 14rpx 4rpx;
    border-radius: var(--lk-radius-md);
    background-color: var(--lk-bg-container);
    border: 1rpx solid var(--lk-border-color-light);
    cursor: pointer;
    transition: all 0.2s;

    &.is-active {
      border-color: var(--lk-color-primary);
      background-color: var(--lk-color-primary-soft);
      color: var(--lk-color-primary);
    }

    .scene-label {
      font-size: 20rpx;
      font-weight: 600;
      color: var(--lk-text-primary);
    }
  }
}

// 订单状态横幅
.order-status-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  border-radius: var(--lk-radius-lg);
  background: linear-gradient(135deg, var(--lk-color-primary-soft), var(--lk-bg-container));
  border: 1rpx solid var(--lk-color-primary-soft);

  .status-left {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  .status-main {
    font-size: 30rpx;
    font-weight: 700;
    color: var(--lk-color-primary);
  }

  .status-sub {
    font-size: 20rpx;
    color: var(--lk-text-secondary);
  }
}

// 商品卡片
.product-item {
  display: flex;
  gap: 16rpx;

  .product-thumb {
    width: 110rpx;
    height: 110rpx;
    border-radius: var(--lk-radius-md);
    background-color: var(--lk-color-primary-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .product-info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
  }

  .product-title {
    font-size: 26rpx;
    font-weight: 600;
    color: var(--lk-text-primary);
  }

  .product-tags {
    display: flex;
    gap: 8rpx;
    margin: 4rpx 0;
  }

  .product-price-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .price-symbol {
    font-size: 22rpx;
    font-weight: 700;
    color: var(--lk-color-danger, #ff4d4f);

    .price-val {
      font-size: 30rpx;
    }
  }

  .price-qty {
    font-size: 22rpx;
    color: var(--lk-text-tertiary);
  }
}

// 沉浸页
.immersive-hero {
  width: 100%;
  height: 380rpx;
  background: linear-gradient(135deg, #1890ff, #722ed1);
  display: flex;
  align-items: flex-end;
  padding: 28rpx;
  box-sizing: border-box;

  .hero-content {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .hero-heading {
    font-size: 36rpx;
    font-weight: 800;
    color: #ffffff;
  }

  .hero-sub {
    font-size: 20rpx;
    color: rgba(255, 255, 255, 0.85);
  }
}

.immersive-inner {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.scene-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 20rpx;
  border-radius: var(--lk-radius-md);
  background-color: var(--lk-bg-container);
  border: 1rpx solid var(--lk-border-color-light);

  .strip-text {
    font-size: 22rpx;
    color: var(--lk-text-secondary);
  }
}

.info-desc {
  font-size: 22rpx;
  color: var(--lk-text-secondary);
  line-height: 1.5;
}

// 结果页
.result-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 28rpx;
  border-radius: var(--lk-radius-xl);
  background-color: var(--lk-bg-container);
  border: 1rpx solid var(--lk-border-color-light);
  box-shadow: var(--lk-shadow-sm);

  .result-title {
    font-size: 34rpx;
    font-weight: 800;
    color: var(--lk-text-primary);
    margin-top: 16rpx;
  }

  .result-desc {
    font-size: 22rpx;
    color: var(--lk-text-secondary);
    margin: 6rpx 0 28rpx;
  }

  .result-info-box {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10rpx;
    padding: 18rpx;
    border-radius: var(--lk-radius-md);
    background-color: var(--lk-bg-page);
    margin-bottom: 32rpx;

    .info-line {
      display: flex;
      justify-content: space-between;
      font-size: 22rpx;

      .info-label {
        color: var(--lk-text-tertiary);
      }
      .info-val {
        color: var(--lk-text-primary);
        font-weight: 600;
      }
    }
  }
}

// 底部栏
.order-bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx;
  background-color: var(--lk-bg-container);
  border-top: 1rpx solid var(--lk-border-color-light);

  &.is-center {
    justify-content: center;
    padding: 18rpx;
  }

  .bottom-price-info {
    display: flex;
    align-items: baseline;

    .price-label {
      font-size: 22rpx;
      color: var(--lk-text-secondary);
    }

    .price-symbol {
      font-size: 22rpx;
      font-weight: 700;
      color: var(--lk-color-danger, #ff4d4f);
    }

    .price-num {
      font-size: 32rpx;
    }
  }

  .bottom-actions {
    display: flex;
    gap: 12rpx;
  }

  .footer-tip {
    font-size: 20rpx;
    color: var(--lk-text-tertiary);
  }
}

// 抽屉
.drawer-content {
  padding: 20rpx 28rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 18rpx;

  .drawer-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 14rpx;
    border-bottom: 1rpx solid var(--lk-border-color-light);

    .item-text {
      display: flex;
      flex-direction: column;
      gap: 2rpx;
    }

    .item-title {
      font-size: 26rpx;
      font-weight: 600;
      color: var(--lk-text-primary);
    }

    .item-desc {
      font-size: 20rpx;
      color: var(--lk-text-tertiary);
    }
  }

  .drawer-actions {
    margin-top: 10rpx;
  }
}
</style>
