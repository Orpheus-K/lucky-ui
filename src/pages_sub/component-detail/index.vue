<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTheme } from '@/uni_modules/lucky-ui/theme';
import { usePreviewQuery } from '@/composables/usePreviewQuery';
import { PREVIEW_COMPONENT_META_MAP } from '@/components/preview/preview-catalog';
import PreviewDemoRenderer from '@/components/preview/PreviewDemoRenderer.vue';

const componentName = ref('');
const componentMeta = computed(() => PREVIEW_COMPONENT_META_MAP[componentName.value]);
const componentTitle = computed(() => componentMeta.value?.title || '组件详情');
const componentDesc = computed(() => componentMeta.value?.desc || '');
const componentMark = computed(
  () => componentTitle.value.split(' ')[0]?.slice(0, 1).toUpperCase() || 'L'
);
const isFormPreview = computed(() => componentName.value === 'form');
const isRootPreview = computed(() => componentName.value === 'root');

const { theme, toggleTheme, themeClass } = useTheme();

usePreviewQuery(['component', 'name'], value => {
  componentName.value = value;
});
</script>

<template>
  <view class="detail-page" :class="[themeClass, { 'is-native-scroll': isFormPreview }]">
    <!-- 导航栏 -->
    <lk-navbar :title="componentTitle">
      <template #right>
        <view class="theme-toggle" @click="toggleTheme">
          <lk-icon :name="theme === 'dark' ? 'sun' : 'moon'" size="28" />
        </view>
      </template>
    </lk-navbar>

    <!-- 内容区域 -->
    <scroll-view
      class="page-content"
      :class="{ 'is-native-scroll': isFormPreview }"
      :scroll-y="!isFormPreview"
      show-scrollbar="false"
    >
      <view class="content-wrapper" :class="{ 'is-full-screen': isFormPreview }">
        <!-- 组件信息卡片 -->
        <view v-if="!isFormPreview" class="info-card">
          <view class="info-header">
            <view class="info-icon">
              <text class="info-mark">{{ componentMark }}</text>
            </view>
            <view class="info-text">
              <text class="info-kicker">Lucky UI Component</text>
              <text class="info-title">{{ componentTitle }}</text>
              <text class="info-desc">{{ componentDesc }}</text>
            </view>
          </view>
          <view class="info-meta">
            <text class="meta-pill">Preview</text>
            <text class="meta-pill">Vue 3</text>
            <text class="meta-pill">UniApp</text>
          </view>
        </view>

        <!-- 演示区域 -->
        <preview-demo-renderer v-if="isRootPreview" :slug="componentName" />
        <view v-else class="demo-area" :class="{ 'is-full-screen': isFormPreview }">
          <preview-demo-renderer :slug="componentName">
            <view class="developing-tip">
              <lk-icon name="code-square" size="100" color="textTertiary" />
              <text class="tip-text">该组件详细演示开发中...</text>
              <text class="tip-desc">请先访问其他已实现的组件</text>
            </view>
          </preview-demo-renderer>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style scoped lang="scss">
@use '@/styles/test-page.scss' as test;

.detail-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: test.$test-bg-page;

  &.is-native-scroll {
    height: auto;
    min-height: 100vh;
    display: block;
  }
}

.page-content {
  flex: 1;
  height: 0;
  min-height: 0;
  overflow-y: auto;

  &.is-native-scroll {
    height: auto;
    min-height: 0;
    overflow: visible;
  }
}

.content-wrapper {
  padding: 32rpx;
  &.is-full-screen {
    padding: 0;
  }
}

// 信息卡片（测试页面样式）
.info-card {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 30rpx;
  }
  padding: 36rpx;
  margin-bottom: 32rpx;
  background: test.$test-bg-card;
  border: 1rpx solid test.$test-border-color;
  border-radius: 36rpx;
  box-shadow: test.$test-shadow-sm;
}

.info-header {
  display: flex;
  align-items: center;
  > :not(:first-child) {
    margin-left: 28rpx;
  }
}

.info-icon {
  width: 108rpx;
  height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: test.$test-primary-soft;
  border: 1rpx solid rgba(var(--test-primary-rgb), 0.2);
  border-radius: 32rpx;
}

.info-mark {
  color: test.$test-primary;
  font-size: 44rpx;
  font-weight: 800;
  line-height: 1;
}

.info-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 10rpx;
  }
}

.info-kicker {
  color: test.$test-primary;
  font-size: 22rpx;
  font-weight: 700;
}

.info-title {
  color: test.$test-text-primary;
  font-size: 42rpx;
  font-weight: 800;
  line-height: 1.16;
}

.info-desc {
  color: test.$test-text-secondary;
  font-size: 26rpx;
  line-height: 1.5;
}

.info-meta {
  display: flex;
  flex-wrap: wrap;
  > :not(.preview-spacing-placeholder) {
    margin: 6rpx;
  }
}

.meta-pill {
  padding: 10rpx 18rpx;
  color: test.$test-text-secondary;
  font-size: 22rpx;
  font-weight: 700;
  background: test.$test-gray-50;
  border: 1rpx solid test.$test-border-color;
  border-radius: 999rpx;
}

// 演示区域
.demo-area {
  min-height: 400rpx;
  margin-top: 0;
  margin-bottom: 32rpx;
  // 统一 Demo 预览背景：与组件默认容器色区分，避免视觉叠色误判
  --lk-demo-block-bg: var(--test-bg-card);
  --lk-demo-block-border: var(--test-border-color);
  --lk-demo-block-self-gap: 32rpx;
  background: transparent;

  /* #ifdef MP */
  margin-top: -32rpx;
  /* #endif */

  &.is-full-screen {
    margin-top: 0;
    margin-bottom: 0;
    min-height: 100vh;
  }
}

// 开发中提示（测试页面样式）
.developing-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 48rpx;
  background: test.$test-bg-card;
  border-radius: 28rpx;
  border: 2rpx dashed test.$test-border-color;
}

.tip-text {
  font-size: 28rpx;
  font-weight: 600;
  color: test.$test-text-secondary;
  margin-top: 24rpx;
}

.tip-desc {
  font-size: 24rpx;
  color: test.$test-text-tertiary;
  margin-top: 12rpx;
}

// API 区域（测试页面样式）
.api-section {
  background: test.$test-bg-card;
  border: 1rpx solid test.$test-border-color;
  border-radius: test.$test-border-radius;
  overflow: hidden;
  box-shadow: test.$test-shadow-sm;
}

.section-title {
  display: flex;
  align-items: center;
  > :not(:first-child) {
    margin-left: 12rpx;
  }
  padding: 32rpx 32rpx 24rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: test.$test-text-primary;
}
</style>
