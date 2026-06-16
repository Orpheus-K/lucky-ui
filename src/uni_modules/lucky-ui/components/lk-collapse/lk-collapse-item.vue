<script setup lang="ts">
import { computed, inject } from 'vue';
import type { PropType, StyleValue } from 'vue';
import { useRipple } from '@/uni_modules/lucky-ui/composables/useRipple';
import { baseProps } from '../common/props';
import { collapseInjectionKey, collapseItemEmits, type CollapseName } from './collapse.props';
import {
  resolveCollapseBodyStyle,
  resolveCollapseHeaderClass,
  resolveCollapseItemClass,
} from './collapse.utils';

defineOptions({ name: 'LkCollapseItem' });

const props = defineProps({
  ...baseProps,
  name: { type: [String, Number] as PropType<CollapseName>, required: true },
  title: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(collapseItemEmits);
const collapse = inject(collapseInjectionKey);
const open = computed(() => collapse?.active.value.includes(props.name) ?? false);
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

function toggle(event?: unknown) {
  if (props.disabled) {
    const payload = { name: props.name, event };
    emit('click-disabled', payload);
    collapse?.clickDisabled(props.name, event);
    return;
  }
  collapse?.toggle(props.name, event);
}

function onHeaderTap(e: unknown) {
  emit('click', { name: props.name, expanded: open.value, event: e });
  if (props.disabled) {
    toggle(e);
    return;
  }
  triggerRipple(e);
  toggle(e);
}
</script>

<template>
  <view class="lk-collapse-item" :class="itemClass" :style="itemStyle">
    <view class="lk-collapse-item__header lk-ripple" :class="headerClass" @tap="onHeaderTap">
      <view class="lk-ripple__content">
        <text class="lk-collapse-item__title">
          <slot name="title">{{ title }}</slot>
        </text>
        <lk-icon
          name="chevron-down"
          size="28"
          class="lk-collapse-item__arrow"
          :class="{ 'is-open': open }"
        />
      </view>
      <view class="lk-ripple__wave" :style="rippleWaveStyle" />
    </view>
    <view v-show="open" class="lk-collapse-item__body" :style="bodyStyle">
      <slot />
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-collapse.scss';
</style>
