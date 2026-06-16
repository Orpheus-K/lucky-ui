<script setup lang="ts">
import { computed } from 'vue';
import { metaRowProps } from './meta-row.props';
import {
  resolveMetaRowClass,
  resolveMetaRowRootStyle,
  resolveMetaRowSideStyle,
  resolveMetaRowStyleVars,
} from './meta-row.utils';

defineOptions({ name: 'LkMetaRow' });

const props = defineProps(metaRowProps);

const cls = computed(() =>
  resolveMetaRowClass({
    align: props.align,
    customClass: props.customClass,
  })
);

const styleVars = computed(() =>
  resolveMetaRowStyleVars({
    gap: props.gap,
    mainGap: props.mainGap,
  })
);

const startStyle = computed(() => resolveMetaRowSideStyle(props.startWidth));

const endStyle = computed(() => resolveMetaRowSideStyle(props.endWidth));

const rootStyle = computed(() =>
  resolveMetaRowRootStyle({
    styleVars: styleVars.value,
    customStyle: props.customStyle,
  })
);
</script>

<template>
  <view :id="id" :class="cls" :style="rootStyle">
    <view class="lk-meta-row__start" :style="startStyle">
      <slot name="start" />
    </view>

    <view class="lk-meta-row__main">
      <view class="lk-meta-row__main-top">
        <slot name="main-top" />
      </view>
      <view class="lk-meta-row__main-bottom">
        <slot name="main-bottom" />
      </view>
    </view>

    <view class="lk-meta-row__end" :style="endStyle">
      <slot name="end" />
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-meta-row.scss';
</style>
