<script setup lang="ts">
import { ref } from 'vue';
import { usePreviewLocale } from '@/composables/usePreviewLocale';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkPopup from '@/uni_modules/lucky-ui/components/lk-popup/lk-popup.vue';
import type { LocaleCode } from '@/uni_modules/lucky-ui/locale';

const showLocalePopup = ref(false);
const { currentLocale, currentLocaleLabel, localeOptions, setLocale } = usePreviewLocale();

function handleSelect(lang: LocaleCode) {
  setLocale(lang);
  showLocalePopup.value = false;
}
</script>

<template>
  <view class="preview-locale-picker">
    <view class="preview-locale-picker__trigger" @tap="showLocalePopup = true">
      <text class="preview-locale-picker__value">{{ currentLocaleLabel }}</text>
      <lk-icon name="chevron-down" size="28" color="textSecondary" />
    </view>

    <lk-popup v-model="showLocalePopup" position="bottom" title="选择语言" closable height="90vh">
      <view class="preview-locale-picker__list">
        <view
          v-for="locale in localeOptions"
          :key="locale.value"
          class="preview-locale-picker__item"
          :class="{ 'is-active': currentLocale === locale.value }"
          @tap="handleSelect(locale.value)"
        >
          <text class="preview-locale-picker__label">{{ locale.label }}</text>
          <text class="preview-locale-picker__code">{{ locale.value }}</text>
          <lk-icon
            v-if="currentLocale === locale.value"
            name="check-circle-fill"
            size="32"
            color="primary"
          />
        </view>
      </view>
    </lk-popup>
  </view>
</template>

<style scoped lang="scss">
@use '@/styles/test-page.scss' as test;

.preview-locale-picker__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 248rpx;
  height: 64rpx;
  padding: 0 22rpx;
  background: test.$test-bg-card;
  border: 1rpx solid test.$test-border-color;
  border-radius: 18rpx;

  > .preview-locale-picker__value {
    margin-right: 14rpx;
  }
}

.preview-locale-picker__value {
  color: test.$test-text-secondary;
  font-size: 24rpx;
  font-weight: 700;
}

.preview-locale-picker__list {
  display: flex;
  flex-direction: column;
  padding: 8rpx 32rpx 24rpx;

  > .preview-locale-picker__item:not(:first-child) {
    margin-top: 12rpx;
  }
}

.preview-locale-picker__item {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 78rpx;
  padding: 0 24rpx;
  border: 1rpx solid test.$test-border-color;
  border-radius: 18rpx;
  background: test.$test-bg-card;
  box-shadow: none;

  &.is-active {
    border-color: test.$test-primary;
    background: var(--lk-color-primary-soft);
  }

  > .preview-locale-picker__code,
  > :deep(.lk-icon) {
    margin-left: 12rpx;
  }
}

.preview-locale-picker__label {
  flex: 1;
  color: test.$test-text-primary;
  font-size: 28rpx;
  font-weight: 700;
}

.preview-locale-picker__code {
  color: test.$test-text-secondary;
  font-size: 22rpx;
}
</style>
