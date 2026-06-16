<script setup lang="ts">
import type { StyleValue } from 'vue';
import {
  ref,
  watch,
  nextTick,
  getCurrentInstance,
  computed,
  onMounted,
  onBeforeUnmount,
} from 'vue';
import { tabProps, tabEmits, type TabOption } from './tab.props';
import { resolveTabRootStyle, resolveTabSelection, resolveTabSliderStyle } from './tab.utils';
import LkBadge from '../lk-badge/lk-badge.vue';

defineOptions({ name: 'LkTab' });
const props = defineProps(tabProps);
const emit = defineEmits(tabEmits);
const inst = getCurrentInstance();
let updateTimer: ReturnType<typeof setTimeout> | null = null;
let retryCount = 0;

function scheduleUpdate(delay = 50) {
  if (updateTimer) clearTimeout(updateTimer);
  updateTimer = setTimeout(updateSlider, delay);
}

const active = ref(props.modelValue);
const sliderStyle = ref<Record<string, string>>({ opacity: '0' });
const scrollLeft = ref(0);

const rootStyle = computed<StyleValue>(() =>
  resolveTabRootStyle({
    duration: props.duration,
    easing: props.easing,
    letterSpacing: props.letterSpacing,
    underlineWidth: props.underlineWidth,
    underlineHeight: props.underlineHeight,
    customStyle: props.customStyle as StyleValue,
  })
);

function select(opt: TabOption, event?: unknown) {
  const result = resolveTabSelection({
    option: opt,
    activeValue: active.value,
  });

  emit('click', { value: opt.value, option: opt, event });
  if (result.disabled) {
    emit('click-disabled', { value: opt.value, option: opt, event });
    return;
  }
  if (result.reselected) {
    emit('reselect', { value: opt.value, option: opt, event });
    return;
  }
  active.value = result.value;
  emit('update:modelValue', result.value);

  const idx = props.options.findIndex(item => item.value === result.value);
  if (idx !== -1 && idx !== props.activeIndex) {
    emit('update:activeIndex', idx);
  }

  emit('select', { value: result.value, option: opt, oldValue: result.oldValue });
  emit('change', result.value, opt, result.oldValue);
  scheduleUpdate(50);
}

watch(
  () => props.modelValue,
  v => {
    if (v !== active.value) {
      active.value = v;
      const idx = props.options.findIndex(opt => opt.value === v);
      if (idx !== -1 && idx !== props.activeIndex) {
        emit('update:activeIndex', idx);
      }
      updateSlider();
    }
  }
);

watch(
  () => props.activeIndex,
  idx => {
    if (idx >= 0 && idx < props.options.length) {
      const opt = props.options[idx];
      if (opt && opt.value !== active.value) {
        active.value = opt.value;
        emit('update:modelValue', opt.value);
        emit('change', opt.value, opt, active.value);
        updateSlider();
      }
    }
  }
);

watch(
  () => props.options,
  opts => {
    const idx = opts.findIndex(opt => opt.value === active.value);
    if (idx !== -1) {
      if (idx !== props.activeIndex) {
        emit('update:activeIndex', idx);
      }
    } else if (props.activeIndex >= 0 && props.activeIndex < opts.length) {
      const opt = opts[props.activeIndex];
      if (opt) {
        active.value = opt.value;
        emit('update:modelValue', opt.value);
      }
    }
    nextTick(updateSlider);
  },
  { deep: true }
);

watch(
  [() => props.size, () => props.block, () => props.letterSpacing, () => props.underlineWidth],
  () => nextTick(updateSlider),
  { deep: true }
);

function updateSlider() {
  if (!inst || !inst.proxy || inst.isUnmounted) return;
  const q = uni.createSelectorQuery().in(inst.proxy);
  q.select('.lk-tab__nav').boundingClientRect();
  q.selectAll('.lk-tab__item').boundingClientRect();

  if (props.scrollable) {
    q.select('.lk-tab__scroll').scrollOffset(() => {});
    q.select('.lk-tab__scroll').boundingClientRect();
  }

  q.exec(res => {
    const wrapNav = res?.[0];
    const items = res?.[1];

    // If layout is not ready (rects not computed or empty), retry after a short delay
    if (!wrapNav || !items?.length || (items[0] && items[0].width === 0)) {
      if (props.options && props.options.length > 0 && retryCount < 15) {
        retryCount++;
        scheduleUpdate(50);
      }
      return;
    }
    retryCount = 0;

    sliderStyle.value = resolveTabSliderStyle({
      wrap: wrapNav,
      items,
      options: props.options,
      activeValue: active.value,
      animated: props.animated,
      duration: props.duration,
      easing: props.easing,
    });

    if (props.scrollable) {
      const scrollInfo = res?.[2];
      const wrapScroll = res?.[3];
      if (scrollInfo && wrapScroll) {
        const activeIndex = props.options.findIndex(opt => opt.value === active.value);
        const activeItem = items?.[activeIndex];
        if (activeItem) {
          const currentScroll = scrollInfo.scrollLeft ?? 0;
          const offsetLeft = activeItem.left - wrapScroll.left;
          scrollLeft.value =
            currentScroll + offsetLeft + activeItem.width / 2 - wrapScroll.width / 2;
        }
      }
    }
  });
}

onMounted(() => {
  // Sync index on mount if modelValue is empty but options are available
  if ((props.modelValue === undefined || props.modelValue === '') && props.options.length > 0) {
    const idx =
      props.activeIndex >= 0 && props.activeIndex < props.options.length ? props.activeIndex : 0;
    const opt = props.options[idx];
    if (opt) {
      active.value = opt.value;
      emit('update:modelValue', opt.value);
      if (idx !== props.activeIndex) {
        emit('update:activeIndex', idx);
      }
    }
  } else if (props.modelValue && props.options.length > 0) {
    const idx = props.options.findIndex(opt => opt.value === props.modelValue);
    if (idx !== -1 && idx !== props.activeIndex) {
      emit('update:activeIndex', idx);
    }
  }

  scheduleUpdate(120);
});

onBeforeUnmount(() => {
  if (updateTimer) clearTimeout(updateTimer);
});
</script>

<template>
  <view
    :id="id"
    class="lk-tab"
    :class="[
      customClass,
      `lk-tab--${size}`,
      `lk-tab--${align}`,
      {
        'lk-tab--border': border,
      },
    ]"
    :style="rootStyle"
  >
    <!-- 左侧固定插槽 -->
    <view v-if="$slots.left" class="lk-tab__left-slot">
      <slot name="left" />
    </view>

    <!-- 滚动视图模式 -->
    <scroll-view
      v-if="scrollable"
      scroll-x
      class="lk-tab__scroll"
      :scroll-left="scrollLeft"
      scroll-with-animation
    >
      <view class="lk-tab__nav">
        <!-- 底部下划线滑块 -->
        <view v-if="showSlider" class="lk-tab__slider" :style="sliderStyle">
          <view class="lk-tab__line" />
        </view>

        <!-- 标签项 -->
        <view
          v-for="(opt, idx) in options"
          :key="opt.value"
          class="lk-tab__item"
          :class="[
            {
              'is-active': opt.value === active,
              'is-disabled': opt.disabled,
              'lk-tab__item--block': block,
            },
          ]"
          @tap="select(opt, $event)"
        >
          <!-- 角标 -->
          <view v-if="opt.badge || opt.badgeDot" class="lk-tab__badge-wrap">
            <lk-badge :value="opt.badge" :dot="opt.badgeDot" type="danger" />
          </view>

          <!-- 文本或插槽 -->
          <block v-if="$slots.item">
            <slot name="item" :option="opt" :active="opt.value === active" :index="idx" />
          </block>
          <block v-else>
            <view class="lk-tab__content">
              <text
                class="lk-tab__label"
                :class="{ 'lk-tab__label--uppercase': uppercase }"
                :data-text="uppercase ? opt.label.toUpperCase() : opt.label"
              >
                {{ opt.label }}
              </text>
              <text v-if="opt.subtitle" class="lk-tab__subtitle">
                {{ opt.subtitle }}
              </text>
            </view>
          </block>
        </view>
      </view>
    </scroll-view>

    <!-- 普通模式 (非滚动) -->
    <view v-else class="lk-tab__scroll">
      <view class="lk-tab__nav">
        <!-- 底部下划线滑块 -->
        <view v-if="showSlider" class="lk-tab__slider" :style="sliderStyle">
          <view class="lk-tab__line" />
        </view>

        <!-- 标签项 -->
        <view
          v-for="(opt, idx) in options"
          :key="opt.value"
          class="lk-tab__item"
          :class="[
            {
              'is-active': opt.value === active,
              'is-disabled': opt.disabled,
              'lk-tab__item--block': block,
            },
          ]"
          @tap="select(opt, $event)"
        >
          <!-- 角标 -->
          <view v-if="opt.badge || opt.badgeDot" class="lk-tab__badge-wrap">
            <lk-badge :value="opt.badge" :dot="opt.badgeDot" type="danger" />
          </view>

          <!-- 文本或插槽 -->
          <block v-if="$slots.item">
            <slot name="item" :option="opt" :active="opt.value === active" :index="idx" />
          </block>
          <block v-else>
            <view class="lk-tab__content">
              <text
                class="lk-tab__label"
                :class="{ 'lk-tab__label--uppercase': uppercase }"
                :data-text="uppercase ? opt.label.toUpperCase() : opt.label"
              >
                {{ opt.label }}
              </text>
              <text v-if="opt.subtitle" class="lk-tab__subtitle">
                {{ opt.subtitle }}
              </text>
            </view>
          </block>
        </view>
      </view>
    </view>

    <!-- 右侧固定插槽 -->
    <view v-if="$slots.right" class="lk-tab__right-slot">
      <slot name="right" />
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-tab.scss';
</style>
