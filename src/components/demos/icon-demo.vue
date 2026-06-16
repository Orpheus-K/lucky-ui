<script setup lang="ts">
import { computed, ref } from 'vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkSwitch from '@/uni_modules/lucky-ui/components/lk-switch/lk-switch.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import { ICON_CODEPOINTS } from '@/uni_modules/lucky-ui/components/lk-icon/codepoints';

const PREVIEW_ICON_BRAND_STORAGE_KEY = 'lk-preview-icon-follow-brand';
const searchKeyword = ref('');
const previewIconsFollowBrand = ref(true);

try {
  const savedFollowBrand = uni.getStorageSync(PREVIEW_ICON_BRAND_STORAGE_KEY);
  if (typeof savedFollowBrand === 'boolean') {
    previewIconsFollowBrand.value = savedFollowBrand;
  }
} catch {
  // Storage is best-effort in demo pages.
}

const allIconNames = Object.keys(ICON_CODEPOINTS).sort((leftName, rightName) =>
  leftName.localeCompare(rightName)
);

const iconTotal = allIconNames.length;

const filteredIcons = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();
  if (!keyword) {
    return allIconNames.slice(0, 60);
  }
  return allIconNames.filter(name => name.includes(keyword)).slice(0, 60);
});

const previewIconColor = computed(() => (previewIconsFollowBrand.value ? 'primary' : 'text'));

const togglePreviewIconColor = (value: boolean | string | number) => {
  previewIconsFollowBrand.value = Boolean(value);
  try {
    uni.setStorageSync(PREVIEW_ICON_BRAND_STORAGE_KEY, previewIconsFollowBrand.value);
  } catch {
    // Storage is best-effort in demo pages.
  }
};

const iconGroups = computed(() => {
  const groupRules = [
    { title: '导航类', pattern: /^(arrow|chevron|caret)/ },
    { title: '通信类', pattern: /^(chat|envelope|telephone|send)/ },
    { title: '媒体类', pattern: /^(play|pause|stop|camera|image|music|mic|volume)/ },
    { title: '业务类', pattern: /^(cart|bag|wallet|credit-card|cash|tag|receipt)/ },
  ] as const;

  return groupRules.map(group => ({
    title: group.title,
    icons: allIconNames.filter(name => group.pattern.test(name)).slice(0, 8),
  }));
});

const copyIconUsage = (name: string) => {
  const usage = `<lk-icon name="${name}" />`;

  // #ifdef H5
  if (navigator.clipboard) {
    navigator.clipboard.writeText(usage);
    uni.showToast({ title: `已复制: ${name}`, icon: 'none' });
    return;
  }
  // #endif

  uni.setClipboardData({
    data: usage,
    success: () => {
      uni.showToast({ title: `已复制: ${name}`, icon: 'none' });
    },
    fail: () => {
      uni.showToast({ title: name, icon: 'none' });
    },
  });
};
</script>

<template>
  <view class="component-demo">
    <demo-block title="图标引擎能力总览">
      <view class="engine-card">
        <view class="engine-item">
          <text class="engine-label">当前字体图标数</text>
          <text class="engine-value">{{ iconTotal }}</text>
        </view>
        <view class="engine-item">
          <text class="engine-label">构建流程</text>
          <text class="engine-value engine-value--small">assets:svg:check → assets:svg</text>
        </view>
      </view>
      <text class="engine-tip">
        你的 SVG 文件名会直接成为 `name`，构建后在全端统一使用，点击图标可复制 `<lk-icon />` 代码。
      </text>
    </demo-block>

    <demo-block title="图标检索（前 60 个）">
      <view class="preview-control">
        <view class="preview-control__copy">
          <text class="preview-control__label">图标跟随品牌色</text>
          <text class="preview-control__hint">关闭后使用默认文字色</text>
        </view>
        <lk-switch
          :model-value="previewIconsFollowBrand"
          size="sm"
          active-color="var(--lk-color-primary)"
          @update:model-value="togglePreviewIconColor"
        />
      </view>
      <view class="search-wrap">
        <lk-icon name="search" color="textSecondary" size="28" />
        <input
          v-model="searchKeyword"
          class="search-input"
          placeholder="输入图标名关键字，例如：arrow / chat / wallet"
        />
      </view>

      <view class="icon-grid">
        <view
          v-for="iconName in filteredIcons"
          :key="iconName"
          class="icon-item"
          @click="copyIconUsage(iconName)"
        >
          <lk-icon :name="iconName" size="40" :color="previewIconColor" />
          <text class="icon-label">{{ iconName }}</text>
        </view>
      </view>
    </demo-block>

    <demo-block title="分类样例（业务高频）">
      <view v-for="group in iconGroups" :key="group.title" class="group-wrap">
        <text class="group-title">{{ group.title }}</text>
        <view class="demo-row">
          <view
            v-for="iconName in group.icons"
            :key="iconName"
            class="group-icon"
            @click="copyIconUsage(iconName)"
          >
            <lk-icon :name="iconName" size="34" color="text" />
            <text class="group-label">{{ iconName }}</text>
          </view>
        </view>
      </view>
    </demo-block>

    <demo-block title="跨端主题适配">
      <view class="demo-row">
        <lk-icon name="shield-check" size="44" color="success" />
        <lk-icon name="lightning-charge" size="44" color="warning" />
        <lk-icon name="info-circle" size="44" color="info" />
        <lk-icon name="exclamation-triangle" size="44" color="danger" />
      </view>
      <text class="engine-tip"
        >支持语义色值（primary/success/warning/danger/info）与自定义颜色。</text
      >
    </demo-block>

    <demo-block title="背景容器">
      <view class="demo-row">
        <lk-icon name="wallet" size="32" color="primary" box />
        <lk-icon name="bell" size="32" color="warning" box box-shape="circle" />
        <lk-icon name="shield-check" size="34" color="success" box box-size="80" box-radius="20" />
        <lk-icon name="exclamation-triangle" size="34" color="danger" box box-shape="square" />
        <lk-icon name="star-fill" size="34" color="#f59e0b" box box-color="#fff7ed" />
      </view>
      <text class="engine-tip">启用 box 后会生成稳定的图标容器，语义色默认匹配浅底色。</text>
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

.engine-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  > :not(.preview-spacing-placeholder) {
    margin: 8rpx;
  }
}

.engine-item {
  background: var(--lk-bg-container);
  border: 2rpx solid var(--lk-color-border);
  border-radius: var(--lk-radius-md);
  padding: 18rpx;
}

.engine-label {
  display: block;
  color: var(--lk-text-tertiary);
  font-size: 22rpx;
  margin-bottom: 6rpx;
}

.engine-value {
  color: var(--lk-text-primary);
  font-size: 34rpx;
  font-weight: 700;
}

.engine-value--small {
  font-size: 24rpx;
  font-weight: 600;
}

.engine-tip {
  display: block;
  margin-top: 14rpx;
  color: var(--lk-text-secondary);
  font-size: 23rpx;
  line-height: 1.5;
}

.preview-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  > :not(:first-child) {
    margin-left: 16rpx;
  }
  padding: 14rpx 16rpx;
  border-radius: var(--lk-radius-md);
  border: 2rpx solid var(--lk-color-border);
  background: var(--lk-bg-container);
  margin-bottom: 18rpx;
}

.preview-control__copy {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 6rpx;
  }
}

.preview-control__label {
  color: var(--lk-text-primary);
  font-size: 26rpx;
  font-weight: 600;
}

.preview-control__hint {
  color: var(--lk-text-tertiary);
  font-size: 22rpx;
}

.search-wrap {
  display: flex;
  align-items: center;
  > :not(:first-child) {
    margin-left: 12rpx;
  }
  padding: 12rpx 16rpx;
  border-radius: var(--lk-radius-md);
  border: 2rpx solid var(--lk-color-border);
  background: var(--lk-bg-container);
  margin-bottom: 18rpx;
}

.search-input {
  flex: 1;
  font-size: 26rpx;
  color: var(--lk-text-primary);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  > :not(.preview-spacing-placeholder) {
    margin: 8rpx;
  }
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16rpx 8rpx;
  border-radius: var(--lk-radius-md);
  border: 2rpx solid var(--lk-color-border);
  background: var(--lk-bg-container);

  &:active {
    transform: scale(0.96);
    border-color: var(--lk-color-primary);
  }
}

.icon-label {
  font-size: 20rpx;
  color: var(--lk-text-tertiary);
  margin-top: 8rpx;
  text-align: center;
  word-break: break-all;
  line-height: 1.3;
}

.group-wrap + .group-wrap {
  margin-top: 16rpx;
}

.group-title {
  display: block;
  margin-bottom: 10rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: var(--lk-text-secondary);
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  > :not(.preview-spacing-placeholder) {
    margin: 6rpx;
  }
}

.group-icon {
  min-width: 120rpx;
  padding: 10rpx 8rpx;
  border-radius: 12rpx;
  background: var(--lk-bg-container);
  border: 2rpx solid var(--lk-color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  > :not(:first-child) {
    margin-top: 6rpx;
  }
}

.group-label {
  font-size: 18rpx;
  color: var(--lk-text-tertiary);
  text-align: center;
}
</style>
