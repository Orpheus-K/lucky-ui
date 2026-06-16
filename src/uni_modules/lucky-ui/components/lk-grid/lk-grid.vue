<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { StyleValue } from 'vue';
import { gridEmits, gridProps, type GridItem } from './grid.props';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkCarousel from '@/uni_modules/lucky-ui/components/lk-carousel/lk-carousel.vue';
import { useRipple } from '@/uni_modules/lucky-ui/composables/useRipple';
import {
  paginateGridItems,
  resolveGridClickResult,
  resolveGridContainerClass,
  resolveGridGap,
  resolveGridInnerGapStyle,
  resolveGridItemClass,
  resolveGridItemStyle,
  resolveGridStyle,
} from './grid.utils';

defineOptions({ name: 'LkGrid' });

const props = defineProps(gridProps);
const emit = defineEmits(gridEmits);

const { rippleActive, rippleWaveStyle, triggerRipple } = useRipple();
const activeIndex = ref<string | number>(-1);

const gapValue = computed(() => resolveGridGap(props.gap));

const gridStyle = computed(() =>
  resolveGridStyle({
    columns: props.columns,
    gap: gapValue.value,
  })
);

const itemStyle = computed(() => resolveGridItemStyle(gapValue.value));

const innerGapStyle = computed(() => resolveGridInnerGapStyle(props.itemGap));

const containerClass = computed(() => resolveGridContainerClass(props.clip));
const rootClass = computed(() => [containerClass.value, props.customClass]);
const rootStyle = computed<StyleValue>(() => props.customStyle as StyleValue);

const pages = computed(() => paginateGridItems(props.items || [], props.columns, props.rows));

function resolveGridPage(page: unknown): GridItem[] {
  return Array.isArray(page) ? (page as GridItem[]) : [];
}

function onItemClick(item: GridItem, index: number, pageIndex: number = 0, event?: unknown) {
  const result = resolveGridClickResult({ item, index, pageIndex, event });
  activeIndex.value = result.activeIndex;
  if (result.eventName === 'click-disabled') {
    emit('click-disabled', result.payload);
    return;
  }
  triggerRipple(event);
  emit('click', result.payload);
}

function onPageChange(index: number, oldIndex?: number) {
  emit('page-change', index, oldIndex);
}
</script>

<template>
  <lk-carousel
    v-if="props.carousel && props.items && props.items.length"
    :carousel-list="pages"
    :auto-height="true"
    :auto-play="false"
    :loop="false"
    :indicator-overlay="false"
    :custom-class="props.customClass"
    :custom-style="props.customStyle"
    @change="onPageChange"
  >
    <template #default="{ item: page, index: pageIndex }">
      <view class="lk-grid" :style="gridStyle">
        <view
          v-for="(it, idx) in resolveGridPage(page)"
          :key="idx"
          class="lk-grid__item lk-ripple"
          :class="
            resolveGridItemClass({
              rippleActive,
              activeIndex,
              pageIndex: Number(pageIndex),
              index: Number(idx),
              disabled: it.disabled,
            })
          "
          :style="itemStyle"
          @tap="onItemClick(it, Number(idx), Number(pageIndex), $event)"
        >
          <lk-icon v-if="it.icon" :name="it.icon" size="36" />
          <text class="lk-grid__item-text" :style="innerGapStyle">{{ it.text }}</text>
          <view class="lk-ripple__wave" :style="rippleWaveStyle" />
        </view>
      </view>
    </template>
  </lk-carousel>

  <view v-else :class="rootClass" :style="rootStyle">
    <view class="lk-grid" :style="gridStyle">
      <template v-if="items && items.length">
        <view
          v-for="(item, index) in items"
          :key="index"
          class="lk-grid__item lk-ripple"
          :class="
            resolveGridItemClass({
              rippleActive,
              activeIndex,
              pageIndex: 0,
              index,
              disabled: item.disabled,
            })
          "
          :style="itemStyle"
          @tap="onItemClick(item, index, 0, $event)"
        >
          <lk-icon v-if="item.icon" :name="item.icon" size="36" />
          <text class="lk-grid__item-text" :style="innerGapStyle">{{ item.text }}</text>
          <view class="lk-ripple__wave" :style="rippleWaveStyle" />
        </view>
      </template>
      <slot v-else></slot>
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-grid.scss';
</style>
