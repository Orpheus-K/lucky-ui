<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore, PRESET_COLORS, type TabbarMode } from '@/stores/theme';
import LkNavbar from '@/uni_modules/lucky-ui/components/lk-navbar/lk-navbar.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkCell from '@/uni_modules/lucky-ui/components/lk-cell/lk-cell.vue';
import LkCellGroup from '@/uni_modules/lucky-ui/components/lk-cell/lk-cell-group.vue';
import LkCard from '@/uni_modules/lucky-ui/components/lk-card/lk-card.vue';

const themeStore = useThemeStore();

const themeClass = computed(() => themeStore.themeClass);
const brandStyleVars = computed(() => themeStore.brandStyleVars);
const isDark = computed(() => themeStore.isDark);
const brandColor = computed(() => themeStore.brandColor);
const activeTabbarMode = computed(() => themeStore.tabbarMode);

const currentColorName = computed(() => {
  return PRESET_COLORS.find(c => c.value === brandColor.value)?.name || 'Custom';
});

const tabbarModes: { name: string; value: TabbarMode; desc: string }[] = [
  { name: 'Plain (简约)', value: 'plain', desc: 'No background, only color changes' },
  { name: 'Block (弹性块)', value: 'block', desc: 'Moving background with elastic impact' },
  { name: 'Flashlight (手电筒)', value: 'flashlight', desc: 'Glowing spotlight effect' },
  { name: 'Float (悬浮)', value: 'float', desc: 'Icon springs up, text stays put' },
  { name: 'Marker Top (顶置线)', value: 'marker-top', desc: 'Clean indicator at the top' },
  { name: 'Marker Bottom (底置线)', value: 'marker-bottom', desc: 'Underline indicator at bottom' },
  { name: 'Dot Slide (灵动点)', value: 'dot-slide', desc: 'Centred sliding dot indicator' },
  { name: 'Bubble (泡泡)', value: 'bubble', desc: 'Soft expansion from center' },
  { name: 'Ripple (涟漪)', value: 'ripple', desc: 'Cyclic energy wave feedback' },
  { name: 'Mask Fill (遮罩填充)', value: 'mask-fill', desc: 'Liquid filling from bottom' },
  { name: 'Text Raise (文字跃动)', value: 'text-raise', desc: 'Icon hides while text rises' },
];

const toggleTheme = () => themeStore.toggleTheme();
const setBrandColor = (color: string) => themeStore.setBrandColor(color);
const setTabbarMode = (mode: TabbarMode) => themeStore.setTabbarMode(mode);

const goBack = () => {
  uni.navigateBack();
};
</script>

<template>
  <view class="page-container" :class="themeClass" :style="brandStyleVars">
    <lk-navbar title="Settings" @back="goBack" />

    <scroll-view class="settings-content" scroll-y>
      <view class="settings-inner">
        <view class="section-title">App Theme</view>
        <lk-card shadow="sm" padding="0">
          <lk-cell-group>
            <lk-cell
              title="Dark Mode"
              :label="isDark ? 'Following system or manually set to Dark' : 'Set to Light'"
            >
              <template #right-icon>
                <switch
                  :checked="isDark"
                  :color="brandColor"
                  style="transform: scale(0.8)"
                  @change="toggleTheme"
                ></switch>
              </template>
            </lk-cell>
          </lk-cell-group>
        </lk-card>

        <view class="section-title">Brand Identity</view>
        <lk-card shadow="sm" padding="30rpx">
          <view class="color-grid">
            <view
              v-for="color in PRESET_COLORS"
              :key="color.value"
              class="color-item"
              :class="{ 'is-active': brandColor === color.value }"
              :style="{ backgroundColor: color.value }"
              @click="setBrandColor(color.value)"
            >
              <lk-icon v-if="brandColor === color.value" name="check-lg" color="#fff" size="32" />
            </view>
          </view>
          <view class="color-name">{{ currentColorName }}</view>
        </lk-card>

        <view class="section-title">Tabbar Style</view>
        <lk-card shadow="sm" padding="0">
          <lk-cell-group>
            <lk-cell
              v-for="mode in tabbarModes"
              :key="mode.value"
              :title="mode.name"
              :label="mode.desc"
              clickable
              @click="setTabbarMode(mode.value)"
            >
              <template #right-icon>
                <lk-icon
                  v-if="activeTabbarMode === mode.value"
                  name="check-circle-fill"
                  :color="brandColor"
                  size="40"
                />
                <lk-icon v-else name="circle" color="var(--test-border-color)" size="40" />
              </template>
            </lk-cell>
          </lk-cell-group>
        </lk-card>

        <view class="demo-tip">Change settings to see immediate effect on the bottom tab bar.</view>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
@use '@/styles/test-page.scss' as test;

.page-container {
  min-height: 100vh;
  background-color: test.$test-bg-page;
  display: flex;
  flex-direction: column;
}

.settings-content {
  flex: 1;
  padding: 0 30rpx 60rpx;
  box-sizing: border-box;
}

.settings-inner {
  width: 100%;
  max-width: 690rpx;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: test.$test-text-secondary;
  margin: 40rpx 10rpx 20rpx;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  > :not(.preview-spacing-placeholder) {
    margin: 10rpx;
  }
  margin-bottom: 20rpx;
}

.color-item {
  aspect-ratio: 1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);

  &.is-active {
    transform: scale(1.15);
    box-shadow:
      0 0 0 4rpx var(--test-bg-page),
      0 0 0 8rpx var(--test-primary);
  }
}

.color-name {
  text-align: center;
  font-size: 24rpx;
  color: test.$test-text-secondary;
  margin-top: 10rpx;
}

.demo-tip {
  margin-top: 60rpx;
  text-align: center;
  font-size: 24rpx;
  color: test.$test-text-tertiary;
  font-style: italic;
}
</style>
