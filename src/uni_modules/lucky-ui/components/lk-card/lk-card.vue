<script setup lang="ts">
import { computed } from 'vue';
import type { StyleValue } from 'vue';
import { useRipple } from '@/uni_modules/lucky-ui/composables/useRipple';
import { cardEmits, cardProps } from './card.props';
import {
  resolveCardBodyStyle,
  resolveCardClass,
  resolveCardFooterStyle,
  resolveCardHeaderStyle,
  resolveCardRootStyle,
  resolveCardStyle,
} from './card.utils';

defineOptions({ name: 'LkCard' });

const props = defineProps(cardProps);
const emit = defineEmits(cardEmits);

const { rippleActive, rippleWaveStyle, triggerRipple } = useRipple({ duration: 800 });

const cardClass = computed(() =>
  resolveCardClass({
    customClass: props.customClass,
    border: props.border,
    ripple: props.ripple,
    rippleActive: rippleActive.value,
  })
);

const cardStyle = computed(() =>
  resolveCardStyle({
    transparent: props.transparent,
    bgColor: props.bgColor,
    overflow: props.overflow,
    shadow: props.shadow,
  })
);

const rootStyle = computed<StyleValue>(() =>
  resolveCardRootStyle(cardStyle.value, props.customStyle as StyleValue)
);

const headerStyle = computed(() => resolveCardHeaderStyle(props.padding));
const bodyStyle = computed(() => resolveCardBodyStyle(props.padding));
const footerStyle = computed(() => resolveCardFooterStyle(props.padding));

function handleClick(event: unknown) {
  if (props.ripple) triggerRipple(event);
  emit('click', event);
}

function handleHeaderClick(event: unknown) {
  emit('header-click', event);
}

function handleFooterClick(event: unknown) {
  emit('footer-click', event);
}
</script>

<template>
  <view :id="id" :class="cardClass" :style="rootStyle" @tap="handleClick">
    <view v-if="ripple" class="lk-ripple__wave" :style="rippleWaveStyle" />
    <!-- 封面图插槽：贴边显示 -->
    <view v-if="$slots.cover" class="lk-card__cover">
      <slot name="cover" />
    </view>

    <view v-if="title || $slots.header" class="lk-card__header" :style="headerStyle">
      <view class="lk-card__title" @tap="handleHeaderClick">
        <slot name="header">
          <text class="lk-card__title-text">{{ title }}</text>
          <text v-if="subTitle" class="lk-card__subtitle">{{ subTitle }}</text>
        </slot>
      </view>
      <view v-if="$slots['header-extra']" class="lk-card__extra">
        <slot name="header-extra" />
      </view>
    </view>

    <view class="lk-card__body" :style="bodyStyle">
      <slot />
    </view>

    <view
      v-if="$slots.footer"
      class="lk-card__footer"
      :style="footerStyle"
      @tap="handleFooterClick"
    >
      <slot name="footer" />
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-card.scss';
</style>
