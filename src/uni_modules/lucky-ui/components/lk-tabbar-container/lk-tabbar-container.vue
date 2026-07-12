<script setup lang="ts">
import { computed, onMounted, watch, type StyleValue } from 'vue';
import LkLoading from '../lk-loading/lk-loading.vue';
import LkIcon from '../lk-icon/lk-icon.vue';
import { useLocale } from '../../composables/useLocale';
import {
  useTabbarContainer,
  initTabbarContainer,
  setTabbarDebug,
} from '../../core/src/tabbar-container';
import {
  TabbarContainerMode,
  TabbarContainerRenderMode,
  tabbarContainerEmits,
  tabbarContainerProps,
  type TabConfig,
} from './tabbar-container.props';
import {
  getTabbarContainerPreloadIds,
  isTabbarContainerSlidingMode,
  resolveTabbarContainerActiveBgStyle,
  resolveTabbarContainerBadgeText,
  resolveTabbarContainerClass,
  resolveTabbarContainerCopyText,
  resolveTabbarContainerIcon,
  resolveTabbarContainerSafeAreaBottom,
  resolveTabbarContainerStyle,
  shouldChangeTabbarContainerTab,
  shouldShowTabbarContainerBadge,
} from './tabbar-container.utils';

defineOptions({ name: 'LkTabbarContainer' });

const props = defineProps(tabbarContainerProps);

const emit = defineEmits(tabbarContainerEmits);
const { t } = useLocale('tabbarContainer');

type SafeAreaInfoLike = {
  screenHeight?: number;
  safeArea?: {
    bottom?: number;
  };
  safeAreaInsets?: {
    bottom?: number;
  };
};

const systemInfo: SafeAreaInfoLike =
  typeof uni !== 'undefined' ? (uni.getSystemInfoSync() as SafeAreaInfoLike) : {};

let preferRuntimeSafeArea = false;
// #ifdef MP || APP-PLUS
preferRuntimeSafeArea = true;
// #endif

const safeAreaBottom = resolveTabbarContainerSafeAreaBottom(systemInfo);

const { activeId, switchTab, preloadTabs, getTabInstance, isVisited } = useTabbarContainer();

const TABBAR_ICON_SIZE = 40;

/** 默认使用 block，与历史默认一致；宿主可通过 :mode 绑定全局状态 */
const activeMode = computed(() =>
  props.safeMode ? TabbarContainerMode.Plain : props.mode || TabbarContainerMode.Block
);
const activeRenderMode = computed(() => props.renderMode || TabbarContainerRenderMode.Auto);
const runtimeTabs = computed<TabConfig[]>(() => {
  if (activeRenderMode.value !== TabbarContainerRenderMode.Slot) return props.tabs;
  return props.tabs.map(tab => ({
    ...tab,
    component: undefined,
  }));
});

const hasSlidingIndicator = computed(() => isTabbarContainerSlidingMode(activeMode.value));
const resolvedLoadingText = computed(() =>
  resolveTabbarContainerCopyText({
    value: props.loadingText,
    fallback: t('loading'),
  })
);
const resolvedErrorText = computed(() =>
  resolveTabbarContainerCopyText({
    value: props.errorText,
    fallback: t('loadFailed'),
  })
);
const resolvedRetryText = computed(() =>
  resolveTabbarContainerCopyText({
    value: props.retryText,
    fallback: t('retry'),
  })
);

const containerClass = computed(() =>
  resolveTabbarContainerClass({
    mode: activeMode.value,
    fixed: props.fixed,
    safeMode: props.safeMode,
    renderMode: activeRenderMode.value,
    customClass: props.customClass,
  })
);

const containerStyle = computed<StyleValue>(() =>
  resolveTabbarContainerStyle({
    preferRuntimeSafeArea,
    safeAreaBottom,
    customStyle: props.customStyle as StyleValue,
  })
);

const activeIndex = computed(() => {
  return runtimeTabs.value.findIndex(tab => tab.id === activeId.value);
});

const activeTab = computed(() => {
  return runtimeTabs.value.find(tab => tab.id === activeId.value);
});

const activeBgStyle = computed(() =>
  resolveTabbarContainerActiveBgStyle({
    count: runtimeTabs.value.length,
    activeIndex: activeIndex.value,
  })
);

function resolveTabIcon(tab: TabConfig) {
  return resolveTabbarContainerIcon({
    tab,
    activeId: activeId.value,
  });
}

function shouldRenderSlot(tabId: string) {
  if (activeRenderMode.value === TabbarContainerRenderMode.Slot) return true;
  if (activeRenderMode.value === TabbarContainerRenderMode.Component) return false;
  return !getTabInstance(tabId)?.component;
}

function shouldRenderComponent(tabId: string) {
  return !shouldRenderSlot(tabId) && Boolean(getTabInstance(tabId)?.component);
}

function shouldRenderFallbackSlot(tabId: string) {
  return !shouldRenderSlot(tabId);
}

async function handleTabClick(tab: TabConfig) {
  if (
    !shouldChangeTabbarContainerTab({
      nextTabId: tab.id,
      activeId: activeId.value,
    })
  )
    return;

  const oldTabId = activeId.value;
  emit('beforeChange', tab.id, oldTabId);

  await switchTab(tab.id);
  emit('change', tab.id);
}

async function retryLoad(tabId: string) {
  const instance = getTabInstance(tabId);
  if (instance) {
    instance.loaded = false;
    instance.error = null;
  }
  await switchTab(tabId);
}

onMounted(() => {
  if (props.debug) {
    setTabbarDebug(true);
  }

  initTabbarContainer(runtimeTabs.value, props.defaultTab || runtimeTabs.value[0]?.id);

  if (props.preloadAll) {
    setTimeout(() => {
      preloadTabs(
        getTabbarContainerPreloadIds({
          tabs: runtimeTabs.value,
          activeId: activeId.value,
        })
      );
    }, props.preloadDelay);
  }
});

watch(
  () => [runtimeTabs.value, props.defaultTab] as const,
  ([newTabs]) => {
    initTabbarContainer(newTabs, activeId.value || props.defaultTab);
  },
  { deep: true }
);
</script>

<template>
  <view class="lk-tabbar-container" :class="containerClass" :style="containerStyle">
    <view class="lk-tabbar-container__content">
      <!-- 使用 v-show 保持组件状态，避免重新渲染 -->
      <template v-for="tab in runtimeTabs" :key="tab.id">
        <scroll-view
          v-if="(isVisited(tab.id) || tab.id === activeId) && props.panelScrollable"
          v-show="tab.id === activeId"
          class="lk-tabbar-container__panel"
          scroll-y
          :show-scrollbar="false"
        >
          <view v-if="getTabInstance(tab.id)?.loading" class="lk-tabbar-container__loading">
            <lk-loading variant="spinner" size="64" />
            <text class="loading-text">{{ resolvedLoadingText }}</text>
          </view>

          <view v-else-if="getTabInstance(tab.id)?.error" class="lk-tabbar-container__error">
            <lk-icon name="exclamation-circle" size="80" />
            <text class="error-text">{{ resolvedErrorText }}</text>
            <view class="error-retry" @tap="retryLoad(tab.id)">{{ resolvedRetryText }}</view>
          </view>

          <template v-else>
            <view v-if="shouldRenderSlot(tab.id)" class="lk-tabbar-container__slot">
              <slot :name="`tab-${tab.id}`" :tab-id="tab.id" :is-active="tab.id === activeId" />
            </view>

            <!-- #ifdef H5 || APP-PLUS -->
            <component
              :is="getTabInstance(tab.id)!.component"
              v-if="shouldRenderComponent(tab.id)"
              :tab-id="tab.id"
              :is-active="tab.id === activeId"
            />
            <!-- #endif -->

            <!-- #ifdef MP -->
            <view v-if="shouldRenderFallbackSlot(tab.id)" class="lk-tabbar-container__slot">
              <slot :name="`tab-${tab.id}`" :tab-id="tab.id" :is-active="tab.id === activeId" />
            </view>
            <!-- #endif -->
          </template>
        </scroll-view>
        <view
          v-else-if="isVisited(tab.id) || tab.id === activeId"
          v-show="tab.id === activeId"
          class="lk-tabbar-container__panel"
        >
          <view v-if="getTabInstance(tab.id)?.loading" class="lk-tabbar-container__loading">
            <lk-loading variant="spinner" size="64" />
            <text class="loading-text">{{ resolvedLoadingText }}</text>
          </view>

          <view v-else-if="getTabInstance(tab.id)?.error" class="lk-tabbar-container__error">
            <lk-icon name="exclamation-circle" size="80" />
            <text class="error-text">{{ resolvedErrorText }}</text>
            <view class="error-retry" @tap="retryLoad(tab.id)">{{ resolvedRetryText }}</view>
          </view>

          <template v-else>
            <view v-if="shouldRenderSlot(tab.id)" class="lk-tabbar-container__slot">
              <slot :name="`tab-${tab.id}`" :tab-id="tab.id" :is-active="tab.id === activeId" />
            </view>

            <!-- #ifdef H5 || APP-PLUS -->
            <component
              :is="getTabInstance(tab.id)!.component"
              v-if="shouldRenderComponent(tab.id)"
              :tab-id="tab.id"
              :is-active="tab.id === activeId"
            />
            <!-- #endif -->

            <!-- #ifdef MP -->
            <view v-if="shouldRenderFallbackSlot(tab.id)" class="lk-tabbar-container__slot">
              <slot :name="`tab-${tab.id}`" :tab-id="tab.id" :is-active="tab.id === activeId" />
            </view>
            <!-- #endif -->
          </template>
        </view>
      </template>
    </view>

    <view class="lk-tabbar-container__tabbar">
      <view class="tabbar-wrapper">
        <view
          v-if="hasSlidingIndicator"
          class="tabbar-active-bg"
          :class="[`is-${activeMode}`]"
          :style="activeBgStyle"
        />

        <view
          v-if="activeMode === 'float' && activeTab"
          class="tabbar-float-orb"
          :style="activeBgStyle"
        >
          <view class="tabbar-float-orb__inner">
            <lk-icon :name="resolveTabIcon(activeTab)" size="44" color="white" />
          </view>
        </view>

        <view
          v-for="tab in runtimeTabs"
          :key="tab.id"
          class="tabbar-item"
          :class="{ 'is-active': tab.id === activeId }"
          @tap="handleTabClick(tab)"
        >
          <view v-if="activeMode === 'flashlight'" class="tabbar-item__flashlight" />

          <view v-if="activeMode === 'bubble'" class="tabbar-item__bubble" />

          <view v-if="activeMode === 'mask-fill'" class="tabbar-item__mask-fill" />

          <view class="tabbar-item__icon-wrapper">
            <view class="tabbar-item__icon">
              <lk-icon :name="resolveTabIcon(tab)" :size="TABBAR_ICON_SIZE" />
              <view v-if="shouldShowTabbarContainerBadge(tab.badge)" class="tabbar-item__badge">
                {{ resolveTabbarContainerBadgeText(tab.badge) }}
              </view>
              <view v-else-if="tab.dot" class="tabbar-item__dot" />
            </view>
            <view v-if="activeMode === 'ripple'" class="tabbar-item__ripple" />
          </view>

          <view class="tabbar-item__label">{{ tab.label }}</view>
        </view>
      </view>
    </view>

    <view class="lk-tabbar-container__placeholder" />
  </view>
</template>

<style lang="scss" scoped>
@use './lk-tabbar-container.scss';

$tabbar-height: var(--lk-tabbar-container-height);
$tabbar-safe-area-bottom: var(--lk-tabbar-container-safe-area-bottom);

.lk-tabbar-container {
  width: 100%;
  height: 100%;
  display: flex !important;
  flex-direction: column !important;
  background: var(--lk-bg-page);
  overflow: hidden;

  &--float {
    overflow: visible;
  }

  &__content {
    flex: 1;
    height: 0;
    min-height: 0;
    overflow: hidden;
    position: relative;
  }

  &__panel {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  &__loading,
  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--lk-text-secondary);
  }

  &__slot {
    width: 100%;
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  &__loading {
    .loading-text {
      margin-top: var(--lk-spacing-lg);
      font-size: var(--lk-font-size-base);
    }
  }

  &__error {
    .error-text {
      margin-top: var(--lk-spacing-lg);
      font-size: var(--lk-font-size-base);
    }

    .error-retry {
      margin-top: var(--lk-spacing-xl);
      padding: var(--lk-spacing-md) var(--lk-spacing-xxl);
      font-size: var(--lk-font-size-base);
      color: var(--lk-color-primary);
      border: 1px solid var(--lk-color-primary);
      border-radius: var(--lk-radius-full);

      &:active {
        background: var(--lk-color-primary-soft);
      }
    }
  }

  &__tabbar {
    z-index: 300;
    background: var(--lk-bg-container);
    border-top: 1px solid var(--lk-color-border);
    padding-bottom: $tabbar-safe-area-bottom;
    overflow: visible;
    flex-shrink: 0;
  }

  &__placeholder {
    height: calc(#{$tabbar-height} + #{$tabbar-safe-area-bottom});
    flex-shrink: 0;
  }

  &.is-fixed-tabbar {
    .lk-tabbar-container__tabbar {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }

  &.is-static-tabbar {
    .lk-tabbar-container__tabbar {
      position: relative;
      left: auto;
      right: auto;
      bottom: auto;
    }

    .lk-tabbar-container__placeholder {
      display: none;
      height: 0;
    }
  }

  &.is-safe-mode {
    .tabbar-active-bg,
    .tabbar-float-orb,
    .tabbar-item,
    .tabbar-item__icon-wrapper,
    .tabbar-item__icon,
    .tabbar-item__label,
    .tabbar-item__flashlight,
    .tabbar-item__bubble,
    .tabbar-item__mask-fill,
    .tabbar-item__ripple {
      transition: none;
      animation: none;
      filter: none;
    }
  }
}

.tabbar-wrapper {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: $tabbar-height;
  position: relative;
  overflow: visible;
}

.tabbar-active-bg {
  position: absolute;
  top: 0;
  bottom: 0;
  width: var(--item-width);
  left: var(--item-left);
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 0;

  &.is-block {
    top: var(--lk-tabbar-container-active-inset-y);
    bottom: var(--lk-tabbar-container-active-inset-y);
    background: var(--lk-color-primary);
    border-radius: var(--lk-radius-full);
    margin: 0 var(--lk-spacing-sm);
    width: calc(var(--item-width) - var(--lk-spacing-lg));
    left: calc(var(--item-left) + var(--lk-spacing-sm));
    box-shadow: 0 var(--lk-spacing-xs) calc(var(--lk-spacing-md) + var(--lk-spacing-xs))
      rgba(var(--lk-brand-rgb), 0.3);
    opacity: 0.85;
  }

  &.is-marker-top {
    height: var(--lk-spacing-xxs);
    background: var(--lk-color-primary);
    border-radius: 0 0 var(--lk-radius-xs) var(--lk-radius-xs);
    box-shadow: 0 var(--lk-spacing-xxs) calc(var(--lk-spacing-sm) + var(--lk-spacing-xxs))
      rgba(var(--lk-brand-rgb), 0.6);
  }

  &.is-marker-bottom {
    top: auto;
    bottom: 0;
    height: var(--lk-spacing-xs);
    background: var(--lk-color-primary);
    border-radius: var(--lk-radius-xs) var(--lk-radius-xs) 0 0;
    box-shadow: 0 calc(var(--lk-spacing-xxs) * -1)
      calc(var(--lk-spacing-sm) + var(--lk-spacing-xxs)) rgba(var(--lk-brand-rgb), 0.6);
  }

  &.is-dot-slide {
    top: auto;
    bottom: var(--lk-spacing-sm);
    height: var(--lk-spacing-sm);
    width: var(--lk-spacing-sm);
    background: var(--lk-color-primary);
    border-radius: 50%;
    left: var(--active-center);
    transform: translateX(-50%);
    box-shadow: 0 0 calc(var(--lk-spacing-sm) + var(--lk-spacing-xxs)) var(--lk-color-primary);
  }
}

.tabbar-float-orb {
  position: absolute;
  top: calc(var(--lk-rpx-28) * -1);
  left: var(--active-center);
  width: var(--lk-control-height-md);
  height: var(--lk-control-height-md);
  z-index: 3;
  pointer-events: none;
  transform: translateX(-50%);
  transition:
    left 0.32s cubic-bezier(0.23, 1, 0.32, 1),
    transform 0.32s cubic-bezier(0.23, 1, 0.32, 1);

  &__inner {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: var(--lk-rpx-6) solid var(--lk-bg-container);
    border-radius: 50%;
    background: var(--lk-color-primary);
    box-shadow: 0 var(--lk-rpx-10) var(--lk-rpx-28) rgba(var(--lk-brand-rgb), 0.36);
    color: var(--lk-color-white);
    box-sizing: border-box;
  }
}

.tabbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--lk-tabbar-container-item-gap);
  flex: 1;
  height: $tabbar-height;
  min-width: 0;
  color: var(--lk-text-secondary);
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  position: relative;
  z-index: 1;

  &__flashlight {
    position: absolute;
    bottom: calc(var(--lk-spacing-md) * -1);
    left: 50%;
    transform: translateX(-50%) scale(0);
    width: calc(var(--lk-control-height-lg) * 2 + var(--lk-spacing-xs));
    height: calc(var(--lk-control-height-lg) + var(--lk-spacing-lg));
    background: radial-gradient(
      ellipse at bottom,
      rgba(var(--lk-brand-rgb), 0.5) 0%,
      rgba(var(--lk-brand-rgb), 0.2) 40%,
      transparent 70%
    );
    filter: blur(var(--lk-spacing-xs));
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    opacity: 0;
    z-index: -1;
    pointer-events: none;
  }

  &__bubble {
    position: absolute;
    top: 50%;
    left: 50%;
    width: calc(var(--lk-control-height-lg) + var(--lk-spacing-lg));
    height: calc(var(--lk-control-height-lg) + var(--lk-spacing-lg));
    background: var(--lk-color-primary-soft);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: -1;
  }

  &__mask-fill {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 0;
    background: linear-gradient(to top, rgba(var(--lk-brand-rgb), 0.2), transparent);
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    z-index: -1;
  }

  &__ripple {
    position: absolute;
    top: 50%;
    left: 50%;
    width: calc(var(--lk-control-height-xs) + var(--lk-spacing-xs));
    height: calc(var(--lk-control-height-xs) + var(--lk-spacing-xs));
    border: var(--lk-rpx-3) solid var(--lk-color-primary);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
    pointer-events: none;
  }

  &__icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  &.is-active {
    color: var(--lk-color-primary);

    .tabbar-item__icon {
      transform: translateY(var(--lk-tabbar-container-active-icon-translate-y));
    }

    .lk-tabbar-container--flashlight & .tabbar-item__flashlight {
      opacity: 1;
      transform: translateX(-50%) scale(1);
      bottom: calc(var(--lk-spacing-sm) * -1);
    }

    .lk-tabbar-container--bubble & .tabbar-item__bubble {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }

    .lk-tabbar-container--mask-fill & .tabbar-item__mask-fill {
      height: 100%;
    }

    .lk-tabbar-container--ripple & .tabbar-item__ripple {
      animation: tabbar-ripple 0.6s ease-out;
    }

    .lk-tabbar-container--text-raise & {
      .tabbar-item__icon {
        transform: translateY(calc(var(--lk-rpx-50) * -1));
        opacity: 0;
      }
      .tabbar-item__label {
        transform: translateY(calc(var(--lk-rpx-20) * -1)) scale(1.2);
        color: var(--lk-color-primary);
      }
    }

    .lk-tabbar-container--float & {
      color: var(--lk-color-primary);

      .tabbar-item__icon-wrapper {
        opacity: 0;
        transform: translateY(calc(var(--lk-rpx-8) * -1));
      }

      .tabbar-item__label {
        color: var(--lk-color-primary);
      }
    }

    .lk-tabbar-container--block & {
      color: var(--lk-color-white);
      .tabbar-item__icon,
      .tabbar-item__label {
        color: var(--lk-color-white) !important;
      }
    }
  }

  &__icon {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--lk-tabbar-container-icon-size);
    height: var(--lk-tabbar-container-icon-size);
    flex-shrink: 0;
    color: inherit;
    transform: translateZ(0);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    :deep(.lk-icon) {
      color: inherit;
    }
  }

  &__badge {
    position: absolute;
    top: calc(var(--lk-spacing-xs) * -1);
    right: calc(var(--lk-spacing-md) * -1 + var(--lk-spacing-xxs));
    min-width: calc(var(--lk-spacing-md) * 2);
    height: calc(var(--lk-spacing-md) * 2);
    padding: 0 var(--lk-spacing-xs);
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    font-size: var(--lk-font-size-xs);
    line-height: calc(var(--lk-spacing-md) * 2);
    text-align: center;
    color: var(--lk-color-white);
    background: var(--lk-color-danger);
    border-radius: var(--lk-radius-md);
  }

  &__dot {
    position: absolute;
    top: 0;
    right: calc(var(--lk-spacing-xxs) * -1);
    width: var(--lk-spacing-md);
    height: var(--lk-spacing-md);
    background: var(--lk-color-danger);
    border-radius: 50%;
  }

  &__label {
    margin-top: 0;
    font-size: var(--lk-font-size-sm);
    line-height: var(--lk-tabbar-container-label-line-height);
    height: auto;
    white-space: nowrap;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  }
}

@keyframes tabbar-ripple {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}
</style>
