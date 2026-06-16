<script setup lang="ts">
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkCard from '@/uni_modules/lucky-ui/components/lk-card/lk-card.vue';
import LkCell from '@/uni_modules/lucky-ui/components/lk-cell/lk-cell.vue';
import LkDivider from '@/uni_modules/lucky-ui/components/lk-divider/lk-divider.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkProgress from '@/uni_modules/lucky-ui/components/lk-progress/lk-progress.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';
import LkTag from '@/uni_modules/lucky-ui/components/lk-tag/lk-tag.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
</script>

<template>
  <view class="component-demo">
    <demo-block title="数据总览">
      <lk-card
        custom-class="hero-card"
        title="Revenue Pulse"
        sub-title="实时经营视图"
        shadow="lg"
        :custom-style="{ '--_bg': 'linear-gradient(145deg, #0f172a 0%, #1d4ed8 100%)' }"
      >
        <template #header-extra>
          <lk-tag
            type="light"
            size="sm"
            round
            bg-color="rgba(255,255,255,0.16)"
            text-color="#ffffff"
          >
            Live
          </lk-tag>
        </template>

        <lk-space direction="vertical" :gap="24" fill>
          <view class="hero-card__meta">
            <text class="hero-card__value">¥ 286,420</text>
            <text class="hero-card__trend">+18.6%</text>
          </view>
          <view class="hero-card__chart">
            <view class="hero-card__bar is-low" />
            <view class="hero-card__bar is-mid" />
            <view class="hero-card__bar is-high" />
            <view class="hero-card__bar is-peak" />
            <view class="hero-card__bar is-mid" />
            <view class="hero-card__bar is-high" />
          </view>
          <lk-space :gap="16" fill>
            <view class="metric-tile">
              <text class="metric-tile__label">转化率</text>
              <text class="metric-tile__value">12.8%</text>
            </view>
            <view class="metric-tile">
              <text class="metric-tile__label">客单价</text>
              <text class="metric-tile__value">¥ 642</text>
            </view>
          </lk-space>
        </lk-space>
      </lk-card>
    </demo-block>

    <demo-block title="沉浸封面">
      <lk-card title="Lake Como" sub-title="精选目的地" shadow="md">
        <template #cover>
          <view class="cover-wrap">
            <image
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=80"
              mode="aspectFill"
              class="cover-image"
            />
            <view class="cover-badge">
              <lk-icon name="star-fill" size="24" color="#fbbf24" />
              <text class="cover-badge__value">4.9</text>
            </view>
          </view>
        </template>

        <lk-space direction="vertical" :gap="18" fill>
          <text class="card-copy"
            >面向内容、电商与空间展示场景，封面、标题、摘要和状态信息可以自然组合。</text
          >
          <lk-space :gap="12" wrap>
            <lk-tag size="sm" round>封面贴边</lk-tag>
            <lk-tag size="sm" round type="light">信息层级</lk-tag>
            <lk-tag size="sm" round type="outline">视觉吸引</lk-tag>
          </lk-space>
        </lk-space>
      </lk-card>
    </demo-block>

    <demo-block title="业务操作">
      <lk-card title="订单履约" sub-title="高级机械键盘套装" border shadow="sm">
        <template #header-extra>
          <lk-tag type="light" size="sm" round text-color="var(--lk-color-success)">
            已支付
          </lk-tag>
        </template>

        <lk-space direction="vertical" :gap="20" fill>
          <view class="order-cells">
            <lk-cell title="订单金额" label="含增值服务与顺丰配送" center>
              <template #value>
                <text class="price">¥ 899.00</text>
              </template>
            </lk-cell>
            <lk-cell title="预计送达" value="明日 18:00 前" icon="calendar-check-fill" center />
          </view>
          <lk-progress
            :percentage="68"
            :stroke-width="14"
            status="success"
            striped
            animated
            :show-text="false"
          />
          <lk-space :gap="12" fill>
            <view class="step-item is-done">
              <lk-icon name="check-circle-fill" size="28" color="success" />
              <text class="step-item__text">已下单</text>
            </view>
            <view class="step-item is-done">
              <lk-icon name="box-seam-fill" size="28" color="primary" />
              <text class="step-item__text">配送中</text>
            </view>
            <view class="step-item">
              <lk-icon name="house-check-fill" size="28" color="textSecondary" />
              <text class="step-item__text">待签收</text>
            </view>
          </lk-space>
          <lk-divider />
        </lk-space>

        <template #footer>
          <view class="card-footer">
            <lk-space :gap="16" fill>
              <view class="action-button action-button--primary">
                <lk-button size="md" block>确认收货</lk-button>
              </view>
              <view class="action-button action-button--secondary">
                <lk-button size="md" variant="soft" block>物流详情</lk-button>
              </view>
            </lk-space>
          </view>
        </template>
      </lk-card>
    </demo-block>

    <demo-block title="交互反馈">
      <lk-card title="安全中心" sub-title="点击体验波纹反馈" ripple shadow="md">
        <template #header-extra>
          <lk-icon name="shield-fill-check" size="36" color="success" />
        </template>
        <view class="security-panel">
          <text class="security-panel__title">账户状态优秀</text>
          <text class="security-panel__desc">多端登录、支付校验与设备指纹均处于稳定区间。</text>
        </view>
      </lk-card>
    </demo-block>

    <demo-block title="简约信息">
      <lk-card border shadow="none">
        <lk-space :gap="20" align="center" fill>
          <view class="simple-icon">
            <lk-icon name="lightning-charge-fill" size="34" color="primary" />
          </view>
          <view class="simple-copy">
            <text class="simple-copy__title">轻量容器</text>
            <text class="simple-copy__desc">适合承载列表摘要、提示信息和紧凑型内容。</text>
          </view>
        </lk-space>
      </lk-card>
    </demo-block>
  </view>
</template>

<style scoped lang="scss">
.component-demo {
  --card-demo-surface: var(--lk-bg-container);
  --card-demo-border: var(--lk-color-border-light);
  --card-demo-text: var(--lk-text-primary);
  --card-demo-muted: var(--lk-text-secondary);
  --card-demo-copy: var(--lk-text-regular);
  --card-demo-soft: var(--lk-fill-1);
  --card-demo-active-soft: var(--lk-color-primary-soft);
  --card-demo-simple-icon-bg: var(--lk-color-primary-soft);

  width: 100%;
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 32rpx;
  }
  padding-bottom: 60rpx;
}

.card-footer,
.hero-card__chart,
.hero-card__meta,
.metric-tile,
.step-item,
.security-panel,
.simple-copy {
  display: flex;
}

:deep(.hero-card .lk-card__title-text),
:deep(.hero-card .lk-card__subtitle),
.hero-card__meta,
.metric-tile,
.security-panel {
  color: #ffffff;
}

.hero-card__meta {
  align-items: flex-end;
  justify-content: space-between;
}

.hero-card__value {
  font-size: 52rpx;
  font-weight: 700;
  line-height: 1;
}

.hero-card__trend {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: #bbf7d0;
  background: rgba(34, 197, 94, 0.18);
}

.hero-card__chart {
  align-items: flex-end;
  height: 128rpx;
  padding: 20rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.1);
}

.hero-card__bar {
  flex: 1;
  margin: 0 7rpx;
  border-radius: 999rpx 999rpx 8rpx 8rpx;
  background: linear-gradient(180deg, #bfdbfe 0%, #60a5fa 100%);

  &.is-low {
    height: 42rpx;
  }

  &.is-mid {
    height: 72rpx;
  }

  &.is-high {
    height: 96rpx;
  }

  &.is-peak {
    height: 118rpx;
    background: linear-gradient(180deg, #fef3c7 0%, #f59e0b 100%);
  }
}

.metric-tile {
  flex: 1;
  flex-direction: column;
  padding: 22rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.12);
}

.metric-tile__label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.72);
}

.metric-tile__value {
  margin-top: 8rpx;
  font-size: 32rpx;
  font-weight: 700;
}

.cover-wrap {
  position: relative;
  width: 100%;
  height: 340rpx;
}

.cover-image {
  width: 100%;
  height: 340rpx;
  display: block;
}

.cover-badge {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
  display: flex;
  align-items: center;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  color: #ffffff;
  font-size: 24rpx;
  background: rgba(15, 23, 42, 0.72);
}

.cover-badge__value {
  margin-left: 8rpx;
}

.card-copy {
  font-size: 28rpx;
  line-height: 1.7;
  color: var(--card-demo-copy);
}

.order-cells {
  overflow: hidden;
  border: 2rpx solid var(--card-demo-border);
  border-radius: 20rpx;
  background: var(--card-demo-surface);
}

.price {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--lk-color-danger);
}

.step-item {
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 64rpx;
  border-radius: 18rpx;
  font-size: 24rpx;
  color: var(--card-demo-muted);
  background: var(--card-demo-soft);

  &.is-done {
    color: var(--card-demo-text);
    background: var(--card-demo-active-soft);
  }
}

.step-item__text {
  margin-left: 8rpx;
}

.card-footer {
  flex-direction: column;
}

.action-button {
  min-width: 0;
}

.action-button--primary {
  flex: 1.25;
}

.action-button--secondary {
  flex: 1;
}

.security-panel {
  flex-direction: column;
  padding: 28rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #059669 0%, #0f766e 100%);
}

.security-panel__title {
  font-size: 32rpx;
  font-weight: 700;
}

.security-panel__desc {
  margin-top: 12rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.78);
}

.simple-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  background: var(--card-demo-simple-icon-bg);
}

.simple-copy {
  flex: 1;
  flex-direction: column;
}

.simple-copy__title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--card-demo-text);
}

.simple-copy__desc {
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.5;
  color: var(--card-demo-muted);
}
</style>

<style lang="scss">
.lk-theme-dark .component-demo {
  --card-demo-surface: var(--lk-bg-container);
  --card-demo-border: rgba(255, 255, 255, 0.1);
  --card-demo-text: var(--lk-text-primary);
  --card-demo-muted: var(--lk-text-secondary);
  --card-demo-copy: var(--lk-text-regular);
  --card-demo-soft: rgba(255, 255, 255, 0.06);
  --card-demo-active-soft: rgba(59, 130, 246, 0.18);
  --card-demo-simple-icon-bg: rgba(59, 130, 246, 0.18);
}
</style>
