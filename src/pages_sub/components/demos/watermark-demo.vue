<script setup lang="ts">
import { ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkWatermark from '@/uni_modules/lucky-ui/components/lk-watermark/lk-watermark.vue';
import type { WatermarkSize } from '@/uni_modules/lucky-ui/components/lk-watermark/watermark.props';

const showFullPage = ref(false);
const sizeOptions: WatermarkSize[] = ['sm', 'md', 'lg'];
const currentSize = ref<WatermarkSize>('md');
</script>

<template>
  <view class="component-demo">
    <demo-block title="动态尺寸控制">
      <view class="demo-actions">
        <lk-button
          v-for="s in sizeOptions"
          :key="s"
          size="sm"
          :variant="currentSize === s ? 'solid' : 'outline'"
          type="primary"
          @tap="currentSize = s"
        >
          {{ s.toUpperCase() }}
        </lk-button>
      </view>
      <lk-watermark
        :size="currentSize"
        :content="['Dynamic Size', currentSize]"
        :rows="4"
        :columns="2"
        class="demo-card"
      >
        <view class="demo-card__title">动态切换演示</view>
        <view class="demo-card__desc">点击上方按钮切换水印尺寸，观察布局和文字大小变化。</view>
      </lk-watermark>
    </demo-block>

    <demo-block title="容器水印">
      <lk-watermark
        :content="['Lucky UI', 'Internal Preview']"
        :rows="4"
        :columns="2"
        class="demo-card"
      >
        <view class="demo-card__title">项目报价单</view>
        <view class="demo-card__desc">
          水印默认只覆盖当前容器，层级较低，不会影响页面导航、弹层和按钮点击。
        </view>
        <view class="demo-card__actions">
          <lk-button class="demo-card__action" size="sm" type="primary">查看详情</lk-button>
          <lk-button class="demo-card__action" size="sm" variant="outline">导出</lk-button>
        </view>
      </lk-watermark>
    </demo-block>

    <demo-block title="大气低密度">
      <lk-watermark
        content="CONFIDENTIAL"
        variant="outline"
        :rotate="-18"
        :skew-x="-8"
        :opacity="0.17"
        :columns="2"
        :rows="4"
        class="demo-panel"
      >
        <view class="demo-panel__row">
          <text>合同编号</text>
          <text class="demo-panel__value">LK-2026-0427</text>
        </view>
        <view class="demo-panel__row">
          <text>审批状态</text>
          <text class="demo-panel__value">待复核</text>
        </view>
        <view class="demo-panel__row">
          <text>有效期</text>
          <text class="demo-panel__value">7 天</text>
        </view>
      </lk-watermark>
    </demo-block>

    <demo-block title="尺寸控制">
      <view class="demo-size-list">
        <lk-watermark size="sm" content="Small" class="demo-size-item">
          <view class="size-label">Small (sm)</view>
        </lk-watermark>
        <lk-watermark size="md" content="Middle" class="demo-size-item">
          <view class="size-label">Middle (md)</view>
        </lk-watermark>
        <lk-watermark size="lg" content="Large" class="demo-size-item">
          <view class="size-label">Large (lg)</view>
        </lk-watermark>
      </view>
    </demo-block>

    <demo-block title="全屏低层级水印">
      <view class="demo-tip">
        全屏水印默认 zIndex 为 8，低于
        Navbar(200)、Backtop(400)、Overlay(900)、Popup(1000)，并且不会拦截点击。
      </view>
      <lk-button type="primary" @tap="showFullPage = !showFullPage">
        {{ showFullPage ? '关闭全屏水印' : '开启全屏水印' }}
      </lk-button>
      <lk-watermark
        v-if="showFullPage"
        full-page
        :content="['Lucky UI', 'Do Not Copy']"
        :rows="6"
        :columns="3"
        :opacity="0.13"
      />
    </demo-block>
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

.demo-actions {
  display: flex;
  > :not(:first-child) {
    margin-left: var(--lk-spacing-sm);
  }
  margin-bottom: var(--lk-spacing-md);
}

.demo-card,
.demo-panel {
  min-height: var(--lk-rpx-320);
  padding: var(--lk-spacing-lg);
  border: var(--lk-rpx-1) solid var(--lk-color-border-light);
  border-radius: var(--lk-radius-xl);
  background: var(--lk-bg-container);
}

.demo-card__title {
  color: var(--lk-text-primary);
  font-size: var(--lk-font-size-lg);
  font-weight: 700;
}

.demo-card__desc {
  margin-top: var(--lk-spacing-sm);
  color: var(--lk-text-secondary);
  font-size: var(--lk-font-size-sm);
  line-height: 1.6;
}

.demo-card__actions {
  display: flex;
  margin-top: var(--lk-spacing-lg);
}

.demo-card__action + .demo-card__action {
  margin-left: var(--lk-spacing-sm);
}

.demo-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.demo-panel__row {
  display: flex;
  justify-content: space-between;
  padding: var(--lk-spacing-sm) 0;
  color: var(--lk-text-secondary);
  font-size: var(--lk-font-size-sm);
}

.demo-panel__value {
  color: var(--lk-text-primary);
  font-weight: 600;
}

.demo-tip {
  margin-bottom: var(--lk-spacing-md);
  color: var(--lk-text-secondary);
  font-size: var(--lk-font-size-sm);
  line-height: 1.6;
}

.demo-size-list {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: var(--lk-spacing-md);
  }
}

.demo-size-item {
  height: var(--lk-rpx-160);
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--lk-rpx-1) solid var(--lk-color-border-light);
  border-radius: var(--lk-radius-lg);
  background: var(--lk-bg-container);
  overflow: hidden;
}

.size-label {
  color: var(--lk-text-secondary);
  font-size: var(--lk-font-size-sm);
}
</style>
