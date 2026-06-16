<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useThemeStore, PRESET_COLORS, DEFAULT_BRAND_COLOR } from '@/stores/theme';
import {
  PREVIEW_COMPONENT_GROUPS,
  PREVIEW_PUBLIC_COMPONENTS,
} from '@/components/preview/preview-catalog';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkSwitch from '@/uni_modules/lucky-ui/components/lk-switch/lk-switch.vue';
import PreviewLocalePicker from '@/components/preview/PreviewLocalePicker.vue';

defineProps<{
  contentHeight: string;
  skipAnimation?: boolean;
}>();

const themeStore = useThemeStore();
const searchKeyword = ref('');
const PREVIEW_ICON_BRAND_STORAGE_KEY = 'lk-preview-icon-follow-brand';

const currentBrandColor = ref(DEFAULT_BRAND_COLOR);
const customColorInput = ref('');
const previewIconsFollowBrand = ref(true);
const previewIconColor = computed(() => (previewIconsFollowBrand.value ? 'primary' : 'text'));
const previewCategoryIconColor = (color: string) =>
  previewIconsFollowBrand.value ? color : 'text';
const presetColors = PRESET_COLORS;
const categories = PREVIEW_COMPONENT_GROUPS;

const changeBrandColor = (color: string) => {
  currentBrandColor.value = color;
  customColorInput.value = color;
  themeStore.setBrandColor(color);
};

const applyCustomColor = () => {
  const color = customColorInput.value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    currentBrandColor.value = color;
    themeStore.setBrandColor(color);
  }
};

const togglePreviewIconColor = (value: boolean | string | number) => {
  previewIconsFollowBrand.value = Boolean(value);
  try {
    uni.setStorageSync(PREVIEW_ICON_BRAND_STORAGE_KEY, previewIconsFollowBrand.value);
  } catch {
    // Storage is best-effort in preview pages.
  }
};

onMounted(() => {
  if (themeStore.brandColor) {
    currentBrandColor.value = themeStore.brandColor;
    customColorInput.value = themeStore.brandColor;
  }
  try {
    const savedFollowBrand = uni.getStorageSync(PREVIEW_ICON_BRAND_STORAGE_KEY);
    if (typeof savedFollowBrand === 'boolean') {
      previewIconsFollowBrand.value = savedFollowBrand;
    }
  } catch {
    // Storage is best-effort in preview pages.
  }
});

const filteredCategories = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();
  if (!keyword) {
    return categories;
  }

  return categories
    .map(category => ({
      ...category,
      components: category.components.filter(
        component =>
          component.name.toLowerCase().includes(keyword) ||
          component.label.toLowerCase().includes(keyword) ||
          component.desc.includes(keyword) ||
          category.name.includes(keyword)
      ),
    }))
    .filter(category => category.components.length > 0);
});

const totalComponents = computed(() => PREVIEW_PUBLIC_COMPONENTS.length);
const categoryCount = computed(() => categories.length);

const navigateToDetail = (componentName: string) => {
  uni.navigateTo({
    url: `/pages_sub/component-detail/index?name=${componentName}`,
  });
};
</script>

<template>
  <scroll-view
    class="overview-content"
    :style="{ height: contentHeight }"
    scroll-y
    show-scrollbar="false"
  >
    <view class="page-content">
      <!-- 统计卡片 -->
      <view class="stats-card">
        <view class="stats-copy">
          <text class="stats-kicker">Lucky UI Preview</text>
          <text class="stats-title">组件预览</text>
          <text class="stats-desc">干净的移动端组件索引，快速进入每个组件详情。</text>
        </view>
        <view class="stats-metrics">
          <view class="stats-item">
            <text class="stats-number">{{ totalComponents }}</text>
            <text class="stats-label">组件</text>
          </view>
          <view class="stats-divider"></view>
          <view class="stats-item">
            <text class="stats-number">{{ categoryCount }}</text>
            <text class="stats-label">分类</text>
          </view>
          <view class="stats-divider"></view>
          <view class="stats-item">
            <text class="stats-number">100%</text>
            <text class="stats-label">覆盖</text>
          </view>
        </view>
      </view>

      <!-- 主题色配置 -->
      <view class="theme-config-card">
        <view class="config-header">
          <lk-icon name="sliders" size="36" color="primary" />
          <text class="config-title">品牌主题色</text>
        </view>
        <view class="locale-config-row">
          <text class="custom-label">组件语言</text>
          <preview-locale-picker />
        </view>
        <view class="icon-brand-row">
          <view class="icon-brand-copy">
            <text class="custom-label">预览图标跟随品牌色</text>
            <text class="icon-brand-hint">关闭后使用默认文字色</text>
          </view>
          <lk-switch
            :model-value="previewIconsFollowBrand"
            size="sm"
            :active-color="currentBrandColor"
            @update:model-value="togglePreviewIconColor"
          />
        </view>
        <view class="color-presets">
          <view
            v-for="color in presetColors"
            :key="color.value"
            class="color-preset-item"
            :class="{ active: currentBrandColor === color.value }"
            :style="{ '--preset-color': color.value }"
            @click="changeBrandColor(color.value)"
          >
            <view class="color-dot"></view>
            <text class="color-name">{{ color.name }}</text>
          </view>
        </view>
        <view class="custom-color-row">
          <text class="custom-label">自定义颜色</text>
          <view class="color-input-wrapper">
            <input
              v-model="customColorInput"
              class="color-input"
              placeholder="#6965db"
              maxlength="7"
              @blur="applyCustomColor"
              @confirm="applyCustomColor"
            />
            <view
              class="color-preview"
              :style="{ background: customColorInput || currentBrandColor }"
            ></view>
          </view>
        </view>
        <!-- 色阶预览 -->
        <view class="color-scale-preview">
          <text class="scale-label">色阶预览</text>
          <view class="scale-row">
            <view
              v-for="level in [100, 200, 300, 400, 500, 600, 700, 800, 900]"
              :key="level"
              class="scale-item"
              :style="{ background: `var(--lk-brand-${level})` }"
            >
              <text class="scale-level">{{ level }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 搜索框 -->
      <view class="search-box">
        <lk-icon name="search" size="32" color="textSecondary" />
        <input
          v-model="searchKeyword"
          class="search-input"
          placeholder="搜索组件名称..."
          placeholder-class="search-placeholder"
        />
        <lk-icon
          v-if="searchKeyword"
          name="x-circle"
          size="32"
          color="textTertiary"
          @click="searchKeyword = ''"
        />
      </view>

      <!-- 组件分类 -->
      <view v-for="category in filteredCategories" :key="category.name" class="category-section">
        <view class="category-header">
          <lk-icon
            :name="category.icon"
            size="40"
            :color="previewCategoryIconColor(category.color)"
          />
          <text class="category-title">{{ category.name }}</text>
          <text class="category-count">{{ category.components.length }}</text>
        </view>

        <view class="component-grid">
          <view
            v-for="comp in category.components"
            :key="comp.name"
            class="component-card"
            :style="{ '--card-color': `var(--lk-color-${category.color})` }"
            @click="navigateToDetail(comp.name)"
          >
            <view class="card-icon">
              <lk-icon :name="comp.icon" size="48" :color="previewIconColor" />
            </view>
            <text class="card-name">{{ comp.label }}</text>
            <text class="card-desc">{{ comp.desc }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredCategories.length === 0" class="empty-state">
        <lk-icon name="inbox" size="120" color="textTertiary" />
        <text class="empty-text">未找到相关组件</text>
        <text class="empty-desc">试试搜索其他关键词</text>
      </view>
    </view>
  </scroll-view>
</template>
<style scoped lang="scss">
@use '@/styles/test-page.scss' as test;

.overview-content {
  width: 100%;
  background: test.$test-bg-page;
  flex: 1;
  height: 0;
  min-height: 0;
}

.page-content {
  padding: 32rpx;
}

// 统计卡片
.stats-card {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 30rpx;
  }
  background: test.$test-bg-card;
  border: 1rpx solid test.$test-border-color;
  border-radius: 36rpx;
  padding: 40rpx;
  margin-bottom: 32rpx;
  box-shadow: test.$test-shadow-sm;
}

.stats-copy {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 12rpx;
  }
}

.stats-kicker {
  color: test.$test-primary;
  font-size: 22rpx;
  font-weight: 700;
}

.stats-title {
  color: test.$test-text-primary;
  font-size: 48rpx;
  font-weight: 800;
  line-height: 1.1;
}

.stats-desc {
  color: test.$test-text-secondary;
  font-size: 24rpx;
  line-height: 1.5;
}

.stats-metrics {
  display: flex;
  align-items: stretch;
  padding: 24rpx 28rpx;
  background: test.$test-gray-50;
  border: 1rpx solid test.$test-border-color;
  border-radius: 28rpx;
}

.stats-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  > :not(:first-child) {
    margin-top: 12rpx;
  }
}

.stats-number {
  color: test.$test-text-primary;
  font-size: 36rpx;
  font-weight: 800;
  line-height: 1;
}

.stats-label {
  color: test.$test-text-tertiary;
  font-size: 22rpx;
}

.stats-divider {
  width: 1rpx;
  background: test.$test-border-color;
  margin: 0 24rpx;
}

// 主题色配置卡片
.theme-config-card {
  background: test.$test-bg-card;
  border: 1rpx solid test.$test-border-color;
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: test.$test-shadow-sm;
}

.config-header {
  display: flex;
  align-items: center;
  > :not(:first-child) {
    margin-left: 16rpx;
  }
  margin-bottom: 24rpx;
}

.config-title {
  margin-left: 16rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: test.$test-text-primary;
}

.locale-config-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  > :not(:first-child) {
    margin-left: 20rpx;
  }
  padding: 16rpx 0 24rpx;
}

.icon-brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  > :not(:first-child) {
    margin-left: 20rpx;
  }
  padding: 0 0 24rpx;
}

.icon-brand-copy {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 8rpx;
  }
}

.icon-brand-hint {
  color: test.$test-text-tertiary;
  font-size: 22rpx;
}

.color-presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  > :not(.preview-spacing-placeholder) {
    margin: 8rpx;
  }
  margin-bottom: 24rpx;
}

.color-preset-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  > :not(:first-child) {
    margin-top: 8rpx;
  }
  padding: 16rpx 8rpx;
  border-radius: 24rpx;
  background: test.$test-gray-50;
  border: 1rpx solid test.$test-border-color;
  transition: all 0.2s;

  &.active {
    background: var(--preset-color);
    box-shadow: test.$test-preset-active-shadow;

    .color-dot {
      border-color: #fff;
      transform: scale(1.1);
    }

    .color-name {
      color: #fff;
    }
  }

  &:active {
    transform: scale(0.95);
  }
}

.color-dot {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: var(--preset-color);
  border: 4rpx solid transparent;
  transition: all 0.2s;
}

.color-name {
  font-size: 22rpx;
  color: test.$test-text-secondary;
  transition: color 0.2s;
}

.custom-color-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-top: 1rpx solid test.$test-border-color;
  margin-bottom: 24rpx;
}

.custom-label {
  font-size: 26rpx;
  color: test.$test-text-secondary;
}

.color-input-wrapper {
  display: flex;
  align-items: center;
  > :not(:first-child) {
    margin-left: 16rpx;
  }
}

.color-input {
  width: 180rpx;
  height: 56rpx;
  padding: 0 16rpx;
  border: 1rpx solid test.$test-border-color;
  border-radius: test.$test-border-radius;
  font-size: 26rpx;
  font-family: monospace;
  color: test.$test-text-primary;
  background: test.$test-bg-card;
}

.color-preview {
  width: 56rpx;
  height: 56rpx;
  border-radius: test.$test-border-radius;
  border: 2rpx solid test.$test-border-color;
}

.color-scale-preview {
  padding-top: 16rpx;
  border-top: 1rpx solid test.$test-border-color;
}

.scale-label {
  display: block;
  font-size: 24rpx;
  color: test.$test-text-tertiary;
  margin-bottom: 16rpx;
}

.scale-row {
  display: flex;
  border-radius: test.$test-border-radius;
  overflow: hidden;
}

.scale-item {
  flex: 1;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scale-level {
  font-size: 18rpx;
  color: #fff;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
}

// 搜索框
.search-box {
  display: flex;
  align-items: center;
  > :not(:first-child) {
    margin-left: 16rpx;
  }
  background: test.$test-bg-card;
  border: 1rpx solid test.$test-border-color;
  border-radius: 28rpx;
  padding: 24rpx 32rpx;
  margin-bottom: 32rpx;
  box-shadow: test.$test-shadow-sm;
}

.search-input {
  flex: 1;
  margin-left: 16rpx;
  font-size: 28rpx;
  color: test.$test-text-primary;
  height: 40rpx;
  line-height: 40rpx;
}

.search-placeholder {
  color: test.$test-text-tertiary;
}

// 分类区域
.category-section {
  margin-bottom: 48rpx;
}

.category-header {
  display: flex;
  align-items: center;
  > :not(:first-child) {
    margin-left: 16rpx;
  }
  margin-bottom: 24rpx;
}

.category-title {
  flex: 1;
  margin-left: 16rpx;
  font-size: 32rpx;
  font-weight: 800;
  color: test.$test-text-primary;
}

.category-count {
  font-size: 24rpx;
  color: test.$test-text-secondary;
  background: test.$test-bg-card;
  border: 1rpx solid test.$test-border-color;
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
}

// 组件网格
.component-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  > :not(.preview-spacing-placeholder) {
    margin: 8rpx;
  }
}

.component-card {
  background: test.$test-bg-card;
  border: 1rpx solid test.$test-border-color;
  border-radius: 28rpx;
  padding: 28rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  > :not(:first-child) {
    margin-top: 12rpx;
  }
  box-shadow: test.$test-shadow-sm;
  transition: all 0.3s;

  &:active {
    transform: scale(0.95);
    background: test.$test-bg-hover;
    box-shadow: test.$test-shadow-md;
  }
}

.card-icon {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: test.$test-primary;
  background: test.$test-gray-50;
  border-radius: 24rpx;
  margin-bottom: 8rpx;
}

.card-name {
  margin-top: 12rpx;
  font-size: 26rpx;
  font-weight: 500;
  color: test.$test-text-primary;
  text-align: center;
}

.card-desc {
  font-size: 22rpx;
  color: test.$test-text-secondary;
  text-align: center;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 48rpx;
  > :not(:first-child) {
    margin-top: 24rpx;
  }
}

.empty-text {
  font-size: 32rpx;
  font-weight: 500;
  color: test.$test-text-secondary;
}

.empty-desc {
  font-size: 26rpx;
  color: test.$test-text-tertiary;
}
</style>
