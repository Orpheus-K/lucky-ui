<script setup lang="ts">
import { computed, ref } from 'vue';
import { Locale, SUPPORTED_LOCALES, type LocaleCode } from '@/uni_modules/lucky-ui/locale';
import LkActionSheet from '@/uni_modules/lucky-ui/components/lk-action-sheet/lk-action-sheet.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkCard from '@/uni_modules/lucky-ui/components/lk-card/lk-card.vue';
import LkChartStatCard from '@/uni_modules/lucky-ui/components/lk-chart-stat-card/lk-chart-stat-card.vue';
import LkCountdown from '@/uni_modules/lucky-ui/components/lk-countdown/lk-countdown.vue';
import LkEmpty from '@/uni_modules/lucky-ui/components/lk-empty/lk-empty.vue';
import LkImage from '@/uni_modules/lucky-ui/components/lk-image/lk-image.vue';
import LkModal from '@/uni_modules/lucky-ui/components/lk-modal/lk-modal.vue';
import LkPicker from '@/uni_modules/lucky-ui/components/lk-picker/lk-picker.vue';
import LkPopup from '@/uni_modules/lucky-ui/components/lk-popup/lk-popup.vue';
import LkTextarea from '@/uni_modules/lucky-ui/components/lk-textarea/lk-textarea.vue';
import LkUpload from '@/uni_modules/lucky-ui/components/lk-upload/lk-upload.vue';
import LkVerifyCode from '@/uni_modules/lucky-ui/components/lk-verify-code/lk-verify-code.vue';
import {
  ANIMATION_CATEGORIES,
  ANIMATION_PRESETS,
} from '@/uni_modules/lucky-ui/composables/useTransition';
import { PRESET_COLORS } from '@/uni_modules/lucky-ui/theme/src/brand-color';
import { formatRelativeTime } from '@/uni_modules/lucky-ui/core/src/utils/format';

const currentLang = ref(Locale.locale);
const localeOptions = SUPPORTED_LOCALES;
const showLangPopup = ref(false);
const showModal = ref(false);
const showPicker = ref(false);
const showActionSheet = ref(false);
const pickerValue = ref('');
const textareaValue = ref('');

const pickerColumns = computed(() => [
  { label: currentLang.value === 'en' ? 'Apple' : '苹果', value: 'apple' },
  { label: currentLang.value === 'en' ? 'Orange' : '橙子', value: 'orange' },
  { label: currentLang.value === 'en' ? 'Grape' : '葡萄', value: 'grape' },
]);

const actionSheetActions = computed(() => [
  { name: currentLang.value === 'en' ? 'Share' : '分享' },
  { name: currentLang.value === 'en' ? 'Favorite' : '收藏' },
]);

const countdownFormat = computed(() =>
  currentLang.value === 'en' ? 'D d HH h mm m ss s' : 'D天 HH时 mm分 ss秒'
);

const relativeTime = computed(() => formatRelativeTime(Date.now() - 5 * 60 * 1000));
const firstAnimation = computed(() => ANIMATION_CATEGORIES[0]);
const firstPreset = computed(() => ANIMATION_PRESETS.quick);
const firstColor = computed(() => PRESET_COLORS[0]);
const currentLangLabel = computed(
  () => localeOptions.find(locale => locale.value === currentLang.value)?.label || currentLang.value
);

function setLang(lang: LocaleCode) {
  Locale.use(lang);
  currentLang.value = lang;
  showLangPopup.value = false;
}
</script>

<template>
  <scroll-view scroll-y class="i18n-page">
    <view class="i18n-page__header">
      <text class="i18n-page__title">Lucky UI i18n Preview</text>
      <view class="lang-trigger" @tap="showLangPopup = true">
        <text>{{ currentLangLabel }}</text>
      </view>
    </view>
    <lk-popup
      v-model="showLangPopup"
      position="bottom"
      title="Select language"
      closable
      height="560rpx"
    >
      <view class="lang-popup-list">
        <view
          v-for="locale in localeOptions"
          :key="locale.value"
          class="lang-popup-item"
          :class="{ active: currentLang === locale.value }"
          @tap="setLang(locale.value)"
        >
          <text class="lang-popup-item__label">{{ locale.label }}</text>
          <text class="lang-popup-item__code">{{ locale.value }}</text>
        </view>
      </view>
    </lk-popup>

    <lk-card title="Feedback">
      <view class="row">
        <lk-button @click="showModal = true">Modal</lk-button>
        <lk-button variant="soft" @click="showActionSheet = true">ActionSheet</lk-button>
      </view>
    </lk-card>

    <lk-card title="Picker">
      <view class="row">
        <lk-button @click="showPicker = true">Picker</lk-button>
      </view>
    </lk-card>

    <lk-card title="Form & Upload">
      <lk-textarea v-model="textareaValue" clearable show-count :maxlength="60" />
      <view class="upload-wrap">
        <lk-upload :model-value="[]" :max-count="1" />
      </view>
      <lk-verify-code countdown />
    </lk-card>

    <lk-card title="Status">
      <view class="status-grid">
        <lk-empty name="network" />
        <lk-image src="/not-found-i18n-preview.png" width="240rpx" height="180rpx" />
      </view>
    </lk-card>

    <lk-card title="Data">
      <view class="meta-list">
        <text>Relative: {{ relativeTime }}</text>
        <text>Animation: {{ firstAnimation.title }} / {{ firstAnimation.description }}</text>
        <text>Preset: {{ firstPreset.name }}</text>
        <text>Color: {{ firstColor.name }}</text>
      </view>
      <lk-chart-stat-card title="Revenue" value="12.8" unit="%" trend="up" :show-chart="false" />
      <lk-countdown :time="3661000" :format="countdownFormat" />
    </lk-card>

    <lk-modal v-model="showModal">
      <text>{{
        currentLang === 'en'
          ? 'Default footer buttons are localized.'
          : '底部默认按钮已接入语言包。'
      }}</text>
    </lk-modal>

    <lk-picker
      v-model:visible="showPicker"
      v-model="pickerValue"
      :columns="pickerColumns"
      title="Fruit"
    />

    <lk-action-sheet
      v-model="showActionSheet"
      :actions="actionSheetActions"
      :title="currentLang === 'en' ? 'Choose Action' : '请选择操作'"
    />
  </scroll-view>
</template>

<style lang="scss" scoped>
.i18n-page {
  min-height: 100vh;
  background: var(--lk-bg-page);
}

.i18n-page__header {
  padding: var(--lk-rpx-40) var(--lk-spacing-lg) var(--lk-spacing-lg);
}

.i18n-page__title {
  display: block;
  margin-bottom: var(--lk-spacing-md);
  color: var(--lk-text-primary);
  font-size: var(--lk-font-size-xl);
  font-weight: var(--lk-font-weight-bold);
}

.row {
  display: flex;
  > :not(:first-child) {
    margin-left: var(--lk-spacing-sm);
  }
  flex-wrap: wrap;
}

.lang-trigger {
  align-self: flex-start;
  min-width: 220rpx;
  height: 60rpx;
  padding: 0 var(--lk-spacing-md);
  border: 1rpx solid var(--lk-color-border);
  border-radius: var(--lk-radius-full);
  background: var(--lk-fill-1);
  color: var(--lk-text-primary);
  font-size: var(--lk-font-size-sm);
  font-weight: var(--lk-font-weight-bold);
  line-height: 60rpx;
  text-align: center;
}

.lang-popup-list {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: var(--lk-spacing-sm);
  }
  padding: var(--lk-spacing-sm) var(--lk-spacing-lg) var(--lk-spacing-lg);
}

.lang-popup-item {
  display: flex;
  align-items: center;
  > :not(:first-child) {
    margin-left: var(--lk-spacing-sm);
  }
  min-height: 80rpx;
  padding: 0 var(--lk-spacing-lg);
  border: 1rpx solid var(--lk-color-border);
  border-radius: var(--lk-radius-md);
  background: var(--lk-fill-1);
}

.lang-popup-item.active {
  border-color: var(--lk-color-primary);
  background: var(--lk-color-primary-soft);
}

.lang-popup-item__label {
  flex: 1;
  color: var(--lk-text-primary);
  font-size: var(--lk-font-size-base);
  font-weight: var(--lk-font-weight-bold);
}

.lang-popup-item__code {
  color: var(--lk-text-secondary);
  font-size: var(--lk-font-size-sm);
}

.upload-wrap {
  margin-top: var(--lk-spacing-md);
}

.status-grid {
  display: grid;
  grid-template-columns: 1fr;
  > :not(.preview-spacing-placeholder) {
    margin: calc(var(--lk-spacing-md) / 2);
  }
  align-items: center;
}

.meta-list {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: var(--lk-spacing-xs);
  }
  margin: var(--lk-spacing-md) 0;
  color: var(--lk-text-secondary);
  font-size: var(--lk-font-size-sm);
}
</style>
