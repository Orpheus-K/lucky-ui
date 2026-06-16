<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type CSSProperties,
  type StyleValue,
} from 'vue';
import { waterfallProps, waterfallEmits } from './waterfall.props';
import type { PlacedCard, WaterfallLoadingState } from './waterfall.props';
import {
  extractWaterfallScrollTop,
  placeWaterfallCards,
  resolveWaterfallCardStyle,
  resolveWaterfallClass,
  resolveWaterfallColumnStyle,
  resolveWaterfallColumnWidth,
  resolveWaterfallContainerStyle,
  resolveWaterfallContentStyle,
  resolveWaterfallFooterStyle,
  resolveWaterfallPx,
  resolveWaterfallRightColumnLeft,
  resolveWaterfallSkeletonPadding,
  resolveWaterfallTotalHeight,
  resolveWaterfallUnit,
  shouldWaterfallLoadMore,
} from './waterfall.utils';

defineOptions({ name: 'LkWaterfall' });

const props = defineProps(waterfallProps);
const emit = defineEmits(waterfallEmits);

/**
 * LkWaterfall 瀑布流组件
 *
 * 特性:
 * - 贪心算法双列分配 (始终放入较短列)
 * - 绝对定位布局 (兼容小程序)
 * - 图片高度预计算 (基于 ratio)
 * - 使用 lk-skeleton 组件库骨架屏
 * - 无限滚动 + 预加载
 * - 作用域插槽自定义卡片
 */

const instance = getCurrentInstance();
const uid = instance?.uid ?? Math.floor(Math.random() * 1e6);
const rootId = `lk-waterfall-${uid}`;

/** 容器宽度 */
const containerWidth = ref<number>(0);
/** 容器高度 */
const containerHeight = ref<number>(0);
/** 滚动位置 */
const scrollTop = ref(0);
/** 所有卡片数据 (绝对定位) */
const cardList = ref<PlacedCard[]>([]);
/** 左列高度 */
const leftHeight = ref(0);
/** 右列高度 */
const rightHeight = ref(0);
/** 已处理的数据索引 */
const processedIndex = ref(0);
/** 是否正在处理 */
const isProcessing = ref(false);
/** 初始化完成 */
const isReady = ref(false);
/** 图片加载超时定时器 */
const imageLoadTimers = new Map<string | number, ReturnType<typeof setTimeout>>();

function getSystemInfo() {
  return uni.getSystemInfoSync?.();
}

function upx2px(value: number) {
  return typeof uni !== 'undefined' && uni.upx2px ? uni.upx2px(value) : value / 2;
}

const unitContext = computed(() => ({
  systemInfo: getSystemInfo(),
  containerHeight: containerHeight.value,
  upx2px,
}));

const gutterPx = computed(() => resolveWaterfallPx(props.gutter, 16, unitContext.value));
const rowGapPx = computed(() => resolveWaterfallPx(props.rowGap, 16, unitContext.value));
const paddingXPx = computed(() => resolveWaterfallPx(props.paddingX, 16, unitContext.value));
const paddingYPx = computed(() => resolveWaterfallPx(props.paddingY, 16, unitContext.value));
const heightPx = computed(() => resolveWaterfallPx(props.height, 600, unitContext.value));
const cardRadiusPx = computed(() => resolveWaterfallPx(props.cardRadius, 16, unitContext.value));

/** 单列宽度 */
const columnWidth = computed(() => {
  return resolveWaterfallColumnWidth({
    containerWidth: containerWidth.value,
    paddingX: paddingXPx.value,
    gutter: gutterPx.value,
  });
});

/** 右列左边距 */
const rightColumnLeft = computed(() =>
  resolveWaterfallRightColumnLeft({
    paddingX: paddingXPx.value,
    columnWidth: columnWidth.value,
    gutter: gutterPx.value,
  })
);

/** 总高度 */
const totalHeight = computed(() =>
  resolveWaterfallTotalHeight({
    leftHeight: leftHeight.value,
    rightHeight: rightHeight.value,
    paddingY: paddingYPx.value,
  })
);

/**
 * 同步增量布局，使用绝对定位。
 */
function processNewItems() {
  if (isProcessing.value) return;
  if (processedIndex.value >= props.items.length) return;
  if (columnWidth.value <= 0) return;

  isProcessing.value = true;

  const result = placeWaterfallCards({
    items: props.items,
    startIndex: processedIndex.value,
    leftHeight: leftHeight.value,
    rightHeight: rightHeight.value,
    paddingX: paddingXPx.value,
    rightColumnLeft: rightColumnLeft.value,
    columnWidth: columnWidth.value,
    rowGap: rowGapPx.value,
    estimateHeight: props.estimateHeight,
    defaultExtraHeight: props.defaultExtraHeight,
  });

  result.cards.forEach(card => {
    cardList.value.push(card);
    scheduleImageLoadTimeout(card);
  });
  leftHeight.value = result.leftHeight;
  rightHeight.value = result.rightHeight;
  processedIndex.value = result.processedIndex;

  isProcessing.value = false;
  isReady.value = true;
}

/**
 * 重置布局
 */
function resetLayout() {
  clearAllImageLoadTimers();
  cardList.value = [];
  leftHeight.value = paddingYPx.value;
  rightHeight.value = paddingYPx.value;
  processedIndex.value = 0;
  isProcessing.value = false;
}

function onScroll(e: { detail?: { scrollTop?: number }; scrollTop?: number }) {
  scrollTop.value = extractWaterfallScrollTop(e);

  emit('scroll', {
    scrollTop: scrollTop.value,
    scrollHeight: totalHeight.value,
  });

  if (
    shouldWaterfallLoadMore({
      totalHeight: totalHeight.value,
      scrollTop: scrollTop.value,
      viewportHeight: heightPx.value,
      lowerThreshold: props.lowerThreshold,
    })
  ) {
    emit('load-more');
  }
}

function onScrollToLower() {
  emit('reach-bottom');
  emit('load-more');
}

function onCardClick(card: PlacedCard) {
  emit('card-click', card.item, card.index);
}

function setCardLoadingState(card: PlacedCard, state: WaterfallLoadingState) {
  if (card.loadingState === state) return;
  card.loadingState = state;
}

function clearImageLoadTimer(card: PlacedCard) {
  const timer = imageLoadTimers.get(card.id);
  if (!timer) return;
  clearTimeout(timer);
  imageLoadTimers.delete(card.id);
}

function clearAllImageLoadTimers() {
  imageLoadTimers.forEach(timer => clearTimeout(timer));
  imageLoadTimers.clear();
}

function scheduleImageLoadTimeout(card: PlacedCard) {
  if (card.loadingState !== 'loading') return;
  if (props.imageLoadTimeout <= 0) return;

  clearImageLoadTimer(card);
  const timer = setTimeout(() => {
    const currentCard = cardList.value.find(item => item.id === card.id);
    if (currentCard?.loadingState === 'loading') {
      setCardLoadingState(currentCard, 'loaded');
    }
    imageLoadTimers.delete(card.id);
  }, props.imageLoadTimeout);

  imageLoadTimers.set(card.id, timer);
}

function onImageLoaded(card: PlacedCard) {
  clearImageLoadTimer(card);
  setCardLoadingState(card, 'loaded');
  emit('image-loaded', card.item, card.index);
}

function onImageError(card: PlacedCard) {
  clearImageLoadTimer(card);
  setCardLoadingState(card, 'error');
  emit('image-error', card.item, card.index);
}

async function measureContainer() {
  await nextTick();

  return new Promise<void>(resolve => {
    const query = instance?.proxy
      ? uni.createSelectorQuery().in(instance.proxy)
      : uni.createSelectorQuery();
    query
      .select(`#${rootId}`)
      .boundingClientRect(rect => {
        const info = Array.isArray(rect) ? rect[0] : rect;
        const sys = uni.getSystemInfoSync?.();
        if (info && info.width && info.width > 0) {
          containerWidth.value = info.width;
        } else {
          containerWidth.value = sys?.windowWidth || 375;
        }
        if (info && info.height && info.height > 0) {
          containerHeight.value = info.height;
        } else {
          containerHeight.value = sys?.windowHeight || 600;
        }
        resolve();
      })
      .exec();
  });
}

onMounted(async () => {
  await measureContainer();
  resetLayout();
  processNewItems();
});

onBeforeUnmount(() => {
  clearAllImageLoadTimers();
});

watch(
  () => props.items.length,
  (newLen, oldLen) => {
    if (newLen > oldLen) {
      processNewItems();
    } else if (newLen < oldLen || newLen === 0) {
      resetLayout();
      processNewItems();
    }
  }
);

watch(columnWidth, (newWidth, oldWidth) => {
  if (oldWidth > 0 && newWidth !== oldWidth) {
    resetLayout();
    processNewItems();
  }
});

const rootClass = computed(() => resolveWaterfallClass(props.customClass));

const containerStyle = computed<StyleValue>(() =>
  resolveWaterfallContainerStyle({
    heightPx: heightPx.value,
    customStyle: props.customStyle,
  })
);

const contentStyle = computed<CSSProperties>(() => resolveWaterfallContentStyle(totalHeight.value));

const columnStyle = computed<CSSProperties>(() => resolveWaterfallColumnStyle(columnWidth.value));

const skeletonPaddingStyle = computed<CSSProperties>(() =>
  resolveWaterfallSkeletonPadding({
    paddingY: paddingYPx.value,
    paddingX: paddingXPx.value,
  })
);

const footerStyle = computed<CSSProperties>(() =>
  resolveWaterfallFooterStyle({
    totalHeight: totalHeight.value,
    paddingY: paddingYPx.value,
  })
);

/** 获取卡片的绝对定位样式 */
function getCardStyle(card: PlacedCard): CSSProperties {
  return resolveWaterfallCardStyle({
    top: card.top,
    left: card.left,
    width: card.width,
    height: card.height,
    cardRadius: cardRadiusPx.value,
  });
}
</script>

<template>
  <view :id="rootId" :class="rootClass" :style="containerStyle">
    <scroll-view
      class="lk-waterfall__scroll"
      scroll-y
      :scroll-with-animation="scrollWithAnimation"
      :enhanced="enhanced"
      :bounces="bounces"
      :show-scrollbar="showScrollbar"
      :lower-threshold="lowerThreshold"
      @scroll="onScroll"
      @scrolltolower="onScrollToLower"
    >
      <!-- 头部插槽 -->
      <slot name="header" />

      <!-- 初始加载骨架屏 -->
      <view
        v-if="showSkeleton && !isReady"
        class="lk-waterfall__init-skeleton"
        :style="skeletonPaddingStyle"
      >
        <view class="lk-waterfall__columns">
          <view class="lk-waterfall__column" :style="columnStyle">
            <view
              v-for="i in 3"
              :key="`left-skel-${i}`"
              class="lk-waterfall__skeleton-card"
              :style="{
                height: `${180 + i * 40}px`,
                borderRadius: resolveWaterfallUnit(cardRadiusPx),
                marginBottom: resolveWaterfallUnit(rowGapPx),
              }"
            >
              <lk-skeleton
                class="lk-waterfall__skeleton-image"
                :loading="true"
                :animated="true"
                :avatar="false"
                :title="false"
                :rows="1"
                row-width="100%"
                row-height="100%"
              />
              <view class="lk-waterfall__skeleton-content">
                <lk-skeleton
                  :loading="true"
                  :animated="true"
                  :avatar="false"
                  :title="true"
                  title-width="80%"
                  :rows="1"
                  row-width="60%"
                />
              </view>
            </view>
          </view>
          <view class="lk-waterfall__column" :style="columnStyle">
            <view
              v-for="i in 3"
              :key="`right-skel-${i}`"
              class="lk-waterfall__skeleton-card"
              :style="{
                height: `${220 + i * 30}px`,
                borderRadius: resolveWaterfallUnit(cardRadiusPx),
                marginBottom: resolveWaterfallUnit(rowGapPx),
              }"
            >
              <lk-skeleton
                class="lk-waterfall__skeleton-image"
                :loading="true"
                :animated="true"
                :avatar="false"
                :title="false"
                :rows="1"
                row-width="100%"
                row-height="100%"
              />
              <view class="lk-waterfall__skeleton-content">
                <lk-skeleton
                  :loading="true"
                  :animated="true"
                  :avatar="false"
                  :title="true"
                  title-width="70%"
                  :rows="1"
                  row-width="50%"
                />
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 正式内容 - 使用绝对定位布局 -->
      <view v-else class="lk-waterfall__content" :style="contentStyle">
        <!-- 单一循环渲染所有卡片，避免小程序插槽冲突 -->
        <view
          v-for="card in cardList"
          :key="card.id"
          :class="[
            'lk-waterfall__card',
            {
              'lk-waterfall__card--loading': card.loadingState === 'loading',
              'lk-waterfall__card--error': card.loadingState === 'error',
            },
          ]"
          :style="getCardStyle(card)"
          @tap="onCardClick(card)"
        >
          <!-- 插槽内容 -->
          <slot
            name="item"
            :item="card.item"
            :index="card.index"
            :width="card.width"
            :height="card.height"
            :loading="card.loadingState === 'loading'"
            :image-state="card.loadingState"
            :on-image-load="() => onImageLoaded(card)"
            :on-image-error="() => onImageError(card)"
          >
            <!-- 默认卡片 -->
            <view class="lk-waterfall__default-card">
              <image
                v-if="card.item.image"
                class="lk-waterfall__default-image"
                :src="card.item.image"
                mode="widthFix"
                :lazy-load="true"
                @load="onImageLoaded(card)"
                @error="onImageError(card)"
              />
              <view class="lk-waterfall__default-content">
                <text class="lk-waterfall__default-title">{{
                  card.item.title || `#${card.index + 1}`
                }}</text>
              </view>
            </view>
          </slot>
        </view>

        <!-- 加载更多状态 -->
        <view v-if="cardList.length > 0" class="lk-waterfall__footer" :style="footerStyle">
          <slot name="loading">
            <view class="lk-waterfall__loading">
              <view class="lk-waterfall__loading-dot" />
              <view class="lk-waterfall__loading-dot" />
              <view class="lk-waterfall__loading-dot" />
            </view>
          </slot>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss">
@use './lk-waterfall.scss';
</style>
