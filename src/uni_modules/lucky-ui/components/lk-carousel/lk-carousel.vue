<script lang="ts" setup>
import type { StyleValue } from 'vue';
import { ref, computed, watch, nextTick, getCurrentInstance, onMounted, useSlots } from 'vue';
import { carouselEmits, carouselProps, type CarouselItem } from './carousel.props';
import {
  clampCarouselIndex,
  getCarouselLength,
  getCarouselRectHeight,
  getCarouselSwiperCurrent,
  isCarouselAutoplayEnabled,
  isCarouselCircular,
  isCarouselIndicatorOutside,
  isCarouselIndicatorVertical,
  resolveCarouselCardStyleVars,
  resolveCarouselHeightProp,
  resolveCarouselIndicatorClass,
  resolveCarouselIndicatorInactiveColor,
  resolveCarouselIndicatorPosition,
  resolveCarouselIndicatorSpace,
  resolveCarouselIndicatorStyle,
  resolveCarouselIndicatorsClass,
  resolveCarouselItemClass,
  resolveCarouselNextMargin,
  resolveCarouselOuterStyle,
  resolveCarouselPreviousMargin,
  resolveCarouselRootStyle,
  resolveCarouselSwiperStyle,
  shouldShowCarouselIndicators,
  shouldUpdateCarouselActive,
  type CarouselChangeSource,
  type CarouselSwiperChangeEventLike,
} from './carousel.utils';
import LkCarouselItem from './lk-carousel-item.vue';

defineOptions({
  name: 'LkCarousel',
  components: {
    LkCarouselItem,
  },
});

const props = defineProps(carouselProps);
const emit = defineEmits(carouselEmits);

const innerCurrent = ref(props.current);
const length = computed(() => getCarouselLength(props.carouselList));
const slots = useSlots();
const hasDefaultSlot = computed(() => !!slots.default);
const autoplayEnabled = computed(() =>
  isCarouselAutoplayEnabled({
    autoPlay: props.autoPlay,
    length: length.value,
  })
);
const circular = computed(() =>
  isCarouselCircular({
    loop: props.loop,
    length: length.value,
  })
);

// 指示器位置
const resolvedIndicatorPosition = computed(() =>
  resolveCarouselIndicatorPosition({
    indicatorPosition: props.indicatorPosition,
    vertical: props.vertical,
  })
);
const indicatorVertical = computed(() =>
  isCarouselIndicatorVertical(resolvedIndicatorPosition.value)
);
const showIndicators = computed(() =>
  shouldShowCarouselIndicators({
    showIndicators: props.showIndicators,
    indicatorType: props.indicatorType,
    length: length.value,
  })
);
const indicatorOutside = computed(() =>
  isCarouselIndicatorOutside({
    indicatorOverlay: props.indicatorOverlay,
    showIndicators: showIndicators.value,
  })
);
const indicatorInactiveColor = computed(() =>
  resolveCarouselIndicatorInactiveColor({
    indicatorInactiveColor: props.indicatorInactiveColor,
  })
);

// Margin 处理
const previousMargin = computed(() =>
  resolveCarouselPreviousMargin({
    card: props.card,
    cardPrevMargin: props.cardPrevMargin,
    peek: props.peek,
    peekPrevMargin: props.peekPrevMargin,
  })
);
const nextMargin = computed(() =>
  resolveCarouselNextMargin({
    card: props.card,
    cardNextMargin: props.cardNextMargin,
    peek: props.peek,
    peekNextMargin: props.peekNextMargin,
  })
);

// 高度处理
const currentHeight = ref<number>(0);
const indicatorHeightPx = ref<number>(0);
const instance = getCurrentInstance();

const heightProp = computed(() => resolveCarouselHeightProp(props.height));

// 指示器占位
const indicatorSpaceRpx = computed(() =>
  resolveCarouselIndicatorSpace({
    indicatorOutside: indicatorOutside.value,
    indicatorType: props.indicatorType,
  })
);

// 外层容器样式
const outerStyle = computed(() =>
  resolveCarouselOuterStyle({
    autoHeight: props.autoHeight,
    currentHeight: currentHeight.value,
    indicatorOutside: indicatorOutside.value,
    indicatorHeightPx: indicatorHeightPx.value,
    heightProp: heightProp.value,
    indicatorSpaceRpx: indicatorSpaceRpx.value,
  })
);

// Swiper 样式
const swiperStyle = computed(() =>
  resolveCarouselSwiperStyle({
    autoHeight: props.autoHeight,
    currentHeight: currentHeight.value,
    indicatorOutside: indicatorOutside.value,
    heightProp: heightProp.value,
  })
);

// 卡片样式变量
const cardStyleVars = computed(() =>
  resolveCarouselCardStyleVars({
    card: props.card,
    cardScale: props.cardScale,
    cardRadius: props.cardRadius,
    cardShadow: props.cardShadow,
  })
);

// 测量内容高度
function measureActiveHeight() {
  if (!props.autoHeight) return;
  const idx = innerCurrent.value;

  function query() {
    const q = uni.createSelectorQuery().in(instance?.proxy);
    q.select(`#lk-slide-${idx}`)
      .boundingClientRect(rect => {
        const h = getCarouselRectHeight(rect);
        if (h && h !== currentHeight.value) {
          if (props.card && currentHeight.value > 0 && h < currentHeight.value) return;
          currentHeight.value = h;
          emit('height-change', h);
        }
      })
      .exec();
  }

  nextTick(() => {
    query();
    setTimeout(query, 150);
    setTimeout(query, 300);
  });
}

// 测量外部指示器高度
function measureIndicatorHeight() {
  if (!props.autoHeight || !indicatorOutside.value) {
    indicatorHeightPx.value = 0;
    return;
  }
  nextTick(() => {
    const q = uni.createSelectorQuery().in(instance?.proxy);
    q.select('#lk-indicators-outside')
      .boundingClientRect(rect => {
        const h = getCarouselRectHeight(rect);
        indicatorHeightPx.value = h || 0;
      })
      .exec();
  });
}

// 监听
watch(
  () => props.current,
  val => {
    const n = length.value;
    if (typeof val !== 'number' || n === 0) return;
    const clamped = clampCarouselIndex(val, n);
    if (innerCurrent.value !== clamped) innerCurrent.value = clamped;
  }
);

watch(
  () => innerCurrent.value,
  () => measureActiveHeight()
);

watch(
  () => length.value,
  n => {
    if (n <= 0) {
      innerCurrent.value = 0;
      currentHeight.value = 0;
      return;
    }
    if (innerCurrent.value > n - 1) innerCurrent.value = n - 1;
    measureActiveHeight();
    measureIndicatorHeight();
  }
);

function updateActive(index: number, source: CarouselChangeSource = 'api') {
  const oldValue = innerCurrent.value;
  if (!shouldUpdateCarouselActive(oldValue, index)) return;
  innerCurrent.value = index;
  emit('update:current', index);
  emit('change', index, oldValue, source);
  if (source === 'swiper' && props.autoPlay) emit('autoplay-change', index, oldValue);
}

function onSwiperChange(e: CarouselSwiperChangeEventLike) {
  const idx = getCarouselSwiperCurrent(e);
  updateActive(idx, 'swiper');
}

function onItemClick(index: number, event?: unknown) {
  const list = props.carouselList || [];
  if (list.length) emit('click', list[index], index, event);
}

function resolveCarouselItemSrc(item: CarouselItem): string {
  if (typeof item === 'string' || typeof item === 'number') return String(item);
  if (Array.isArray(item)) return '';
  return String(item.src || item.url || item.image || '');
}

function setActive(index: number, event?: unknown) {
  const n = length.value;
  if (n === 0) return;
  const clamped = clampCarouselIndex(index, n);
  emit('indicator-click', clamped, innerCurrent.value, event);
  updateActive(clamped, 'indicator');
}

const rootStyle = computed<StyleValue>(() =>
  resolveCarouselRootStyle(outerStyle.value, props.customStyle as StyleValue)
);

onMounted(() => {
  measureActiveHeight();
  measureIndicatorHeight();
});
</script>

<template>
  <view :id="id" class="lk-carousel" :class="customClass" :style="rootStyle">
    <swiper
      class="lk-carousel__swiper"
      :style="swiperStyle"
      :current="innerCurrent"
      :autoplay="autoplayEnabled"
      :interval="interval"
      :circular="circular"
      :vertical="vertical"
      :previous-margin="previousMargin"
      :next-margin="nextMargin"
      :duration="300"
      :indicator-dots="false"
      @change="onSwiperChange"
    >
      <swiper-item v-for="(item, index) in carouselList" :key="index">
        <view
          :id="`lk-slide-${index}`"
          class="lk-carousel__item-wrap"
          :class="
            resolveCarouselItemClass({
              card,
              active: index === innerCurrent,
              autoHeight,
            })
          "
          :style="card ? cardStyleVars : undefined"
          @tap="onItemClick(index, $event)"
        >
          <template v-if="hasDefaultSlot">
            <slot :item="item" :index="index" />
          </template>
          <lk-carousel-item v-else :src="resolveCarouselItemSrc(item)" />
        </view>
      </swiper-item>
    </swiper>

    <!-- 内部指示器 (Overlay) -->
    <template v-if="props.indicatorOverlay && showIndicators">
      <view
        class="lk-carousel__indicators"
        :class="
          resolveCarouselIndicatorsClass({
            position: resolvedIndicatorPosition,
            indicatorAlign,
            indicatorVertical,
            indicatorAnimated,
          })
        "
      >
        <view v-if="indicatorType === 'number'" class="lk-carousel__indicator-number">
          {{ innerCurrent + 1 }}/{{ length }}
        </view>
        <view
          v-for="(_, index) in carouselList"
          v-else-if="indicatorType === 'dots' || indicatorType === 'bars'"
          :key="index"
          class="lk-carousel__indicator"
          :class="
            resolveCarouselIndicatorClass({
              active: index === innerCurrent,
              indicatorType,
            })
          "
          :style="
            resolveCarouselIndicatorStyle({
              active: index === innerCurrent,
              indicatorActiveColor,
              indicatorInactiveColor,
            })
          "
          @tap.stop="indicatorClickable ? setActive(index, $event) : undefined"
        ></view>
      </view>
    </template>

    <!-- 外部指示器 (Outside) -->
    <template v-if="!props.indicatorOverlay && showIndicators">
      <view
        id="lk-indicators-outside"
        class="lk-carousel__indicators is-outside"
        :class="
          resolveCarouselIndicatorsClass({
            position: resolvedIndicatorPosition,
            indicatorAlign,
            indicatorVertical,
            indicatorAnimated,
          })
        "
      >
        <view v-if="indicatorType === 'number'" class="lk-carousel__indicator-number">
          {{ innerCurrent + 1 }}/{{ length }}
        </view>
        <view
          v-for="(_, index) in carouselList"
          v-else-if="indicatorType === 'dots' || indicatorType === 'bars'"
          :key="index"
          class="lk-carousel__indicator"
          :class="
            resolveCarouselIndicatorClass({
              active: index === innerCurrent,
              indicatorType,
            })
          "
          :style="
            resolveCarouselIndicatorStyle({
              active: index === innerCurrent,
              indicatorActiveColor,
              indicatorInactiveColor,
            })
          "
          @tap.stop="indicatorClickable ? setActive(index, $event) : undefined"
        ></view>
      </view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
@use './lk-carousel.scss';
</style>
