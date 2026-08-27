<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import type { StyleValue } from 'vue';
import { useRipple } from '@/uni_modules/lucky-ui/composables/useRipple';
import LkLoading from '../lk-loading/lk-loading.vue';
import { collapseInjectionKey, collapseItemEmits, collapseItemProps } from './collapse.props';
import {
  resolveCollapseArrowIcon,
  resolveCollapseArrowText,
  resolveCollapseBodyStyle,
  resolveCollapseHeaderClass,
  resolveCollapseItemClass,
} from './collapse.utils';

defineOptions({ name: 'LkCollapseItem' });

const props = defineProps(collapseItemProps);
const emit = defineEmits(collapseItemEmits);
const collapse = inject(collapseInjectionKey);

const open = computed(() => collapse?.active.value.includes(props.name) ?? false);
const loading = ref(false);

const showArrow = computed(() => {
  if (props.arrow !== undefined) return props.arrow;
  return collapse?.arrow ?? true;
});

const currentArrowIcon = computed(() => {
  return resolveCollapseArrowIcon({
    open: open.value,
    itemArrowIcon: props.arrowIcon,
    itemOpenIcon: props.openIcon,
    parentArrowIcon: collapse?.arrowIcon,
    parentOpenIcon: collapse?.openIcon,
  });
});

const currentArrowText = computed(() => {
  return resolveCollapseArrowText({
    open: open.value,
    arrowText: props.arrowText,
    openText: props.openText,
  });
});

const shouldRotateArrow = computed(() => {
  const hasDistinctOpenIcon = Boolean(props.openIcon || collapse?.openIcon);
  return !hasDistinctOpenIcon;
});

const itemClass = computed(() =>
  resolveCollapseItemClass({
    open: open.value,
    disabled: props.disabled,
    customClass: props.customClass,
  })
);
const itemStyle = computed<StyleValue>(() => props.customStyle as StyleValue);

const { rippleActive, rippleWaveStyle, triggerRipple } = useRipple({ duration: 800 });
const headerClass = computed(() => resolveCollapseHeaderClass(rippleActive.value));
const bodyStyle = computed(() =>
  resolveCollapseBodyStyle({
    animationDuration: collapse?.animationDuration,
    animationTiming: collapse?.animationTiming,
  })
);

async function onHeaderTap(e: unknown) {
  if (props.disabled || loading.value) {
    if (props.disabled) {
      const payload = { name: props.name, event: e };
      emit('click-disabled', payload);
      collapse?.clickDisabled(props.name, e);
    }
    return;
  }

  emit('click', { name: props.name, expanded: open.value, event: e });

  const hook = props.beforeToggle ?? collapse?.beforeToggle;
  if (typeof hook === 'function') {
    const willOpen = !open.value;
    let allow = false;
    try {
      const result = hook(props.name, willOpen);
      if (typeof result === 'boolean') {
        allow = result;
      } else {
        loading.value = true;
        allow = await result;
      }
    } catch {
      return;
    } finally {
      loading.value = false;
    }
    if (!allow || open.value === willOpen) return;
  }

  triggerRipple(e);
  collapse?.toggle(props.name, e);
}
</script>

<template>
  <view class="lk-collapse-item" :class="itemClass" :style="itemStyle">
    <view class="lk-collapse-item__header lk-ripple" :class="headerClass" @tap="onHeaderTap">
      <view class="lk-ripple__content">
        <view class="lk-collapse-item__title">
          <slot name="title" :open="open" :disabled="disabled">{{ title }}</slot>
        </view>
        <view v-if="showArrow" class="lk-collapse-item__action">
          <slot name="arrow" :open="open" :disabled="disabled" :loading="loading">
            <lk-loading
              v-if="loading"
              :size="iconSize"
              class="lk-collapse-item__loading"
            />
            <text v-else-if="currentArrowText" class="lk-collapse-item__action-text">
              {{ currentArrowText }}
            </text>
            <view
              v-else
              class="lk-collapse-item__arrow"
              :class="{
                'is-open': open,
                'is-rotate': shouldRotateArrow,
              }"
            >
              <lk-icon :name="currentArrowIcon" :size="iconSize" />
            </view>
          </slot>
        </view>
      </view>
      <view class="lk-ripple__wave" :style="rippleWaveStyle" />
    </view>
    <view class="lk-collapse-item__wrapper" :class="{ 'is-open': open }" :style="bodyStyle">
      <view class="lk-collapse-item__body">
        <view class="lk-collapse-item__content">
          <slot />
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-collapse.scss';
</style>
