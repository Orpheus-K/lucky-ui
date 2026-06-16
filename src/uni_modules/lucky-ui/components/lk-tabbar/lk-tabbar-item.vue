<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref } from 'vue';
import type { StyleValue } from 'vue';
import { tabbarContextKey } from './context';
import { tabbarItemProps } from './tabbar-item.props';
import {
  isTabbarBumpItem,
  resolveTabbarBadgeText,
  resolveTabbarFillIconName,
  resolveTabbarIconColor,
  resolveTabbarItemActive,
  resolveTabbarItemClass,
  resolveTabbarItemLabelStyle,
  shouldShowTabbarBadge,
} from './tabbar.utils';

defineOptions({ name: 'LkTabbarItem' });

const props = defineProps(tabbarItemProps);
const tabbar = inject(tabbarContextKey, null);

// 注册当前项并获取索引
const itemIndex = ref(-1);
let unregister: (() => void) | null = null;

onMounted(() => {
  if (tabbar) {
    const result = tabbar.registerItem();
    itemIndex.value = result.index;
    unregister = result.unregister;
  }
});

onUnmounted(() => {
  unregister?.();
});

const isActive = computed(() => resolveTabbarItemActive(tabbar?.active.value, props.name));

const mode = computed(() => tabbar?.mode.value || 'fixed');

// 是否为 bump 模式的中间项
const isBumpItem = computed(() => {
  if (mode.value !== 'bump' || !tabbar) return false;
  return isTabbarBumpItem({
    mode: mode.value,
    total: tabbar.itemCount.value,
    index: itemIndex.value,
  });
});
const itemClass = computed(() =>
  resolveTabbarItemClass({
    active: isActive.value,
    bump: isBumpItem.value,
    customClass: props.customClass,
  })
);
const itemStyle = computed<StyleValue>(() => props.customStyle as StyleValue);

const showBadge = computed(() =>
  shouldShowTabbarBadge({
    dot: props.dot,
    badge: props.badge,
  })
);

const badgeText = computed(() => resolveTabbarBadgeText(props.badge));

const activeColor = computed(() => tabbar?.activeColor.value || 'var(--lk-color-primary)');
const inactiveColor = computed(() => tabbar?.inactiveColor.value || 'var(--lk-text-secondary)');

const currentIcon = computed(() => {
  if (isActive.value && props.selectedIcon) {
    return props.selectedIcon;
  }
  if (isActive.value && props.activeIconFill) {
    return resolveTabbarFillIconName(props.icon);
  }
  return props.icon;
});

const iconColor = computed(() => {
  return resolveTabbarIconColor({
    active: isActive.value,
    bump: isBumpItem.value,
    activeColor: activeColor.value,
    inactiveColor: inactiveColor.value,
  });
});

const labelStyle = computed(() => {
  return resolveTabbarItemLabelStyle({
    active: isActive.value,
    bump: isBumpItem.value,
    activeColor: activeColor.value,
    inactiveColor: inactiveColor.value,
  });
});

function onTap(event: unknown) {
  tabbar?.setActive(props.name, itemIndex.value, event);
}
</script>

<template>
  <view class="lk-tabbar-item" :class="itemClass" :style="itemStyle" @tap="onTap">
    <view v-if="isBumpItem" class="lk-tabbar-item__bump-bg" />

    <view class="lk-tabbar-item__icon">
      <template v-if="customIcon">
        <image :src="currentIcon" class="lk-tabbar-item__custom-icon" mode="aspectFit" />
      </template>
      <template v-else-if="icon">
        <lk-icon :name="currentIcon" :size="isBumpItem ? 52 : 44" :color="iconColor" />
      </template>

      <view v-if="dot" class="lk-tabbar-item__dot" />
      <view v-else-if="showBadge" class="lk-tabbar-item__badge">
        <text>{{ badgeText }}</text>
      </view>
    </view>

    <view v-if="label" class="lk-tabbar-item__label" :style="labelStyle">{{ label }}</view>
  </view>
</template>

<style lang="scss">
@use './lk-tabbar.scss';
</style>
