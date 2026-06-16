<script setup lang="ts">
import { computed, ref } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { usePreviewQuery } from '@/composables/usePreviewQuery';
import ComponentCase from '@/components/showcase/component-case.vue';
import type { ShowcaseCase } from '@/components/showcase/showcase-cases';
import { SHOWCASE_CASES } from '@/components/showcase/showcase-cases';
import PreviewDemoRenderer from '@/components/preview/PreviewDemoRenderer.vue';
import PreviewLocalePicker from '@/components/preview/PreviewLocalePicker.vue';

const currentSlug = ref('');
const themeStore = useThemeStore();
const themeClass = computed(() => themeStore.themeClass);
const brandStyleVars = computed(() => themeStore.brandStyleVars);

usePreviewQuery(['component'], value => {
  currentSlug.value = value;
});

const visibleCases = computed(() =>
  SHOWCASE_CASES.filter(item => {
    if (!currentSlug.value) {
      return true;
    }
    return item.slug === currentSlug.value;
  })
);

const groupLabelMap: Record<ShowcaseCase['group'], string> = {
  basic: '基础组件',
  form: '表单组件',
  feedback: '反馈组件',
  advanced: '高级组件',
};

const verifyStatusLabelMap: Record<ShowcaseCase['verifyStatus'], string> = {
  verified: '已验证',
  pending: '待验证',
};

const riskLevelLabelMap: Record<ShowcaseCase['riskLevel'], string> = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
};

const riskTagTypeMap: Record<ShowcaseCase['riskLevel'], 'low' | 'medium' | 'high'> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
};

const groupedCases = computed(() => {
  const groups: Record<string, ShowcaseCase[]> = {};
  for (const item of visibleCases.value) {
    const groupKey = item.group;
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
  }
  return groups;
});

const totalCount = computed(() => visibleCases.value.length);
const verifiedCount = computed(
  () => visibleCases.value.filter(item => item.verifyStatus === 'verified').length
);
const lowRiskCount = computed(
  () => visibleCases.value.filter(item => item.riskLevel === 'low').length
);
</script>

<template>
  <scroll-view scroll-y class="showcase-page" :class="themeClass" :style="brandStyleVars">
    <view class="showcase-hero">
      <view class="hero-copy">
        <text class="hero-kicker">Lucky UI Preview</text>
        <text class="hero-title">组件预览台</text>
        <text class="hero-desc">移动端质感、清晰分组、稳定回归。</text>
      </view>
      <view class="hero-metrics">
        <view class="metric-item">
          <text class="metric-value">{{ totalCount }}</text>
          <text class="metric-label">组件</text>
        </view>
        <view class="metric-divider" />
        <view class="metric-item">
          <text class="metric-value">{{ verifiedCount }}</text>
          <text class="metric-label">已验证</text>
        </view>
        <view class="metric-divider" />
        <view class="metric-item">
          <text class="metric-value">{{ lowRiskCount }}</text>
          <text class="metric-label">低风险</text>
        </view>
      </view>
      <view class="hero-config">
        <text class="config-label">语言</text>
        <preview-locale-picker />
      </view>
    </view>

    <view v-for="(groupItems, groupKey) in groupedCases" :key="groupKey" class="group-block">
      <view class="group-heading">
        <text class="group-title">{{ groupLabelMap[groupKey as ShowcaseCase['group']] }}</text>
        <text class="group-count">{{ groupItems.length }}</text>
      </view>

      <view v-for="item in groupItems" :key="item.slug" class="showcase-block">
        <component-case
          :title="item.title"
          :group-label="groupLabelMap[item.group]"
          :verify-status-label="verifyStatusLabelMap[item.verifyStatus]"
          :risk-level-label="riskLevelLabelMap[item.riskLevel]"
          :verify-status-type="item.verifyStatus === 'verified' ? 'ok' : 'warn'"
          :risk-type="riskTagTypeMap[item.riskLevel]"
          :risk-notes="item.riskNotes"
        >
          <template #demo>
            <preview-demo-renderer :slug="item.slug" />
          </template>
        </component-case>
      </view>
    </view>

    <view v-if="visibleCases.length === 0" class="showcase-empty">
      <text class="empty-title">未匹配到组件</text>
      <text class="empty-desc">请检查 query 参数 `component` 是否正确。</text>
    </view>
  </scroll-view>
</template>

<style scoped lang="scss">
@use '@/styles/test-page.scss' as test;

.showcase-page {
  height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
  background: test.$test-bg-page;
}

.showcase-hero {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 30rpx;
  }
  margin-bottom: 40rpx;
  padding: 40rpx;
  background: test.$test-bg-card;
  border: 1rpx solid test.$test-border-color;
  border-radius: 36rpx;
  box-shadow: test.$test-shadow-sm;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 12rpx;
  }
}

.hero-kicker {
  display: block;
  color: test.$test-primary;
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 0;
}

.hero-title {
  display: block;
  color: test.$test-text-primary;
  font-size: 48rpx;
  font-weight: 800;
  line-height: 1.1;
}

.hero-desc {
  display: block;
  color: test.$test-text-secondary;
  font-size: 24rpx;
  line-height: 1.5;
}

.hero-metrics {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 28rpx;
  background: test.$test-gray-50;
  border: 1rpx solid test.$test-border-color;
  border-radius: 28rpx;
}

.hero-config {
  display: flex;
  align-items: center;
  justify-content: space-between;
  > :not(:first-child) {
    margin-left: 20rpx;
  }
  padding: 20rpx 24rpx;
  background: test.$test-bg-page;
  border: 1rpx solid test.$test-border-color;
  border-radius: 24rpx;
}

.config-label {
  flex-shrink: 0;
  color: test.$test-text-secondary;
  font-size: 24rpx;
  font-weight: 700;
}

.metric-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  > :not(:first-child) {
    margin-top: 6rpx;
  }
}

.metric-value {
  color: test.$test-text-primary;
  font-size: 34rpx;
  font-weight: 800;
}

.metric-label {
  color: test.$test-text-tertiary;
  font-size: 20rpx;
}

.metric-divider {
  width: 1rpx;
  height: 44rpx;
  background: test.$test-border-color;
}

.showcase-block {
  margin-bottom: 36rpx;
}

.group-block {
  margin-bottom: 40rpx;
}

.group-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18rpx;
}

.group-title {
  display: block;
  color: test.$test-text-primary;
  font-size: 32rpx;
  font-weight: 800;
}

.group-count {
  min-width: 48rpx;
  height: 48rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  background: test.$test-bg-card;
  border: 1rpx solid test.$test-border-color;
  color: test.$test-text-secondary;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 48rpx;
  text-align: center;
  box-sizing: border-box;
}

.showcase-empty {
  padding: 40rpx 20rpx;
  text-align: center;
}

.empty-title {
  display: block;
  color: test.$test-text-primary;
  font-size: 30rpx;
  font-weight: 600;
}

.empty-desc {
  display: block;
  margin-top: 10rpx;
  color: test.$test-text-tertiary;
  font-size: 24rpx;
}
</style>
