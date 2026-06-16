<script setup lang="ts">
import { ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkCarousel from '@/uni_modules/lucky-ui/components/lk-carousel/lk-carousel.vue';
import type { CarouselItem } from '@/uni_modules/lucky-ui/components/lk-carousel/carousel.props';

interface FashionSlide {
  id: string;
  tone: string;
  tag: string;
  title: string;
  subtitle: string;
  meta: string;
}

interface AutoHeightPanel {
  id: string;
  title: string;
  desc: string;
  stats: string[];
}

const fashionSlides = ref<FashionSlide[]>([
  {
    id: 'atelier',
    tone: 'atelier',
    tag: 'Atelier',
    title: '秋冬高级成衣',
    subtitle: '羊绒、皮革与低饱和灰调的层次搭配',
    meta: 'LOOK 01',
  },
  {
    id: 'gallery',
    tone: 'gallery',
    tag: 'Editorial',
    title: '城市画廊大片',
    subtitle: '利落廓形配合冷感光影，适合品牌首屏',
    meta: 'LOOK 02',
  },
  {
    id: 'resort',
    tone: 'resort',
    tag: 'Resort',
    title: '度假系列精选',
    subtitle: '自然材质、柔和轮廓与高端生活方式场景',
    meta: 'LOOK 03',
  },
  {
    id: 'beauty',
    tone: 'beauty',
    tag: 'Beauty',
    title: '美妆新品视觉',
    subtitle: '干净背景与近景人物，突出高阶质感',
    meta: 'LOOK 04',
  },
]);

const autoPanels = ref<AutoHeightPanel[]>([
  {
    id: 'brief',
    title: 'Campaign Brief',
    desc: '适合首页运营位，承载系列标题、卖点和行动入口。',
    stats: ['4 张精选图片', 'Bars 指示器', '点击可跳转'],
  },
  {
    id: 'theme',
    title: 'Theme Ready',
    desc: '示例样式全部使用主题变量，切换亮暗主题后卡片、文本、边框会自动响应。',
    stats: ['浅色模式', '暗色模式', '品牌色联动', '无硬编码颜色'],
  },
]);

const currentHero = ref(0);
const currentBars = ref(0);
const currentCorner = ref(0);
const currentNumber = ref(0);
const currentSide = ref(0);
const currentCard = ref(0);
const currentAutoHeight = ref(0);

function handleClick(item: unknown, index: number) {
  const title = isFashionSlide(item) ? item.title : `第 ${index + 1} 张`;
  uni.showToast({ title, icon: 'none' });
}

function isFashionSlide(item: unknown): item is FashionSlide {
  return typeof item === 'object' && item !== null && 'title' in item;
}

function slideClass(item: FashionSlide) {
  return `fashion-visual fashion-visual--${item.tone}`;
}

function asFashionSlide(item: CarouselItem): FashionSlide {
  return item as unknown as FashionSlide;
}

function asAutoHeightPanel(item: CarouselItem): AutoHeightPanel {
  return item as unknown as AutoHeightPanel;
}
</script>

<template>
  <view class="component-demo">
    <demo-block title="高级时尚 Banner" desc="自定义插槽叠加标题、标签与内容信息，适合品牌首屏。">
      <lk-carousel
        v-model:current="currentHero"
        :carousel-list="fashionSlides"
        indicator-type="bars"
        indicator-position="bottom-left"
        indicator-active-color="var(--carousel-demo-on-media)"
        indicator-inactive-color="var(--carousel-demo-indicator-muted)"
        :indicator-clickable="true"
        :auto-height="true"
        @click="handleClick"
      >
        <template #default="{ item }">
          <view class="hero-slide" :class="slideClass(asFashionSlide(item))">
            <view class="hero-slide__shade" />
            <view class="hero-slide__content">
              <text class="hero-slide__tag">{{ asFashionSlide(item).tag }}</text>
              <text class="hero-slide__title">{{ asFashionSlide(item).title }}</text>
              <text class="hero-slide__subtitle">{{ asFashionSlide(item).subtitle }}</text>
              <text class="hero-slide__meta">{{ asFashionSlide(item).meta }}</text>
            </view>
          </view>
        </template>
      </lk-carousel>
    </demo-block>

    <demo-block title="基础轮播" desc="默认圆点指示器适合通用场景，小程序不依赖外链图片。">
      <lk-carousel
        v-model:current="currentBars"
        :carousel-list="fashionSlides"
        indicator-type="dots"
        :auto-height="true"
        @click="handleClick"
      >
        <template #default="{ item }">
          <view class="simple-slide" :class="slideClass(asFashionSlide(item))">
            <text class="simple-slide__title">{{ asFashionSlide(item).title }}</text>
          </view>
        </template>
      </lk-carousel>
    </demo-block>

    <demo-block title="圆角轮播" desc="容器与内容同时继承圆角，适合卡片式运营位。">
      <view class="rounded-carousel">
        <lk-carousel
          v-model:current="currentBars"
          :carousel-list="fashionSlides"
          indicator-type="dots"
          :auto-height="true"
        >
          <template #default="{ item }">
            <view class="simple-slide" :class="slideClass(asFashionSlide(item))">
              <text class="simple-slide__title">{{ asFashionSlide(item).tag }}</text>
            </view>
          </template>
        </lk-carousel>
      </view>
    </demo-block>

    <demo-block title="圆润条形指示器" desc="覆盖指示器颜色时仍使用 CSS 变量，亮暗主题更稳定。">
      <lk-carousel
        v-model:current="currentCorner"
        :carousel-list="fashionSlides"
        indicator-type="bars"
        indicator-active-color="var(--carousel-demo-on-media)"
        indicator-inactive-color="var(--carousel-demo-indicator-muted)"
        :auto-height="true"
      >
        <template #default="{ item }">
          <view class="simple-slide" :class="slideClass(asFashionSlide(item))">
            <text class="simple-slide__title">{{ asFashionSlide(item).meta }}</text>
          </view>
        </template>
      </lk-carousel>
    </demo-block>

    <demo-block title="角落数字指示器">
      <lk-carousel
        v-model:current="currentNumber"
        :carousel-list="fashionSlides"
        indicator-position="top-right"
        indicator-type="number"
        :auto-height="true"
      >
        <template #default="{ item }">
          <view class="simple-slide" :class="slideClass(asFashionSlide(item))">
            <text class="simple-slide__title">{{ asFashionSlide(item).title }}</text>
          </view>
        </template>
      </lk-carousel>
    </demo-block>

    <demo-block title="竖向轮播 + 侧边指示器">
      <lk-carousel
        v-model:current="currentSide"
        :carousel-list="fashionSlides"
        :vertical="true"
        indicator-position="right"
        indicator-type="bars"
        :auto-height="true"
      >
        <template #default="{ item }">
          <view class="vertical-slide" :class="slideClass(asFashionSlide(item))">
            <text class="vertical-slide__tag">{{ asFashionSlide(item).tag }}</text>
            <text class="vertical-slide__title">{{ asFashionSlide(item).title }}</text>
          </view>
        </template>
      </lk-carousel>
    </demo-block>

    <demo-block
      title="卡片模式"
      desc="圆角、阴影、缩放和预览边距组合，适合专题入口和商品系列展示。"
    >
      <view class="card-demo-bg">
        <lk-carousel
          v-model:current="currentCard"
          :carousel-list="fashionSlides"
          :card="true"
          :auto-height="true"
          card-prev-margin="56rpx"
          card-next-margin="56rpx"
          :card-scale="0.9"
          card-radius="28rpx"
          card-shadow="var(--lk-shadow-lg)"
          indicator-type="bars"
          indicator-position="bottom"
        >
          <template #default="{ item }">
            <view class="card-slide" :class="slideClass(asFashionSlide(item))">
              <view class="card-slide__caption">
                <text>{{ asFashionSlide(item).title }}</text>
              </view>
            </view>
          </template>
        </lk-carousel>
      </view>
    </demo-block>

    <demo-block title="自适应高度" desc="不同内容长度下自动测量高度，适合营销说明与活动信息卡。">
      <lk-carousel
        v-model:current="currentAutoHeight"
        :carousel-list="autoPanels"
        :auto-height="true"
        indicator-type="dots"
        indicator-active-color="var(--lk-color-primary)"
        indicator-inactive-color="var(--lk-color-border-light)"
      >
        <template #default="{ item }">
          <view class="custom-content">
            <view class="content-card">
              <text class="content-card__title">{{ asAutoHeightPanel(item).title }}</text>
              <text class="content-card__desc">{{ asAutoHeightPanel(item).desc }}</text>
              <view class="content-card__stats">
                <text
                  v-for="stat in asAutoHeightPanel(item).stats"
                  :key="stat"
                  class="content-card__stat"
                >
                  {{ stat }}
                </text>
              </view>
            </view>
          </view>
        </template>
      </lk-carousel>
    </demo-block>
  </view>
</template>

<style scoped lang="scss">
.component-demo {
  --carousel-demo-on-media: var(--lk-text-inverse);
  --carousel-demo-indicator-muted: var(--lk-color-border-light);
  --carousel-demo-hero-min-height: 440rpx;
  --carousel-demo-slide-min-height: 340rpx;
  --carousel-demo-vertical-min-height: 420rpx;
  --carousel-demo-card-min-height: 400rpx;

  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 32rpx;
  }
  min-height: 100vh;
  padding-bottom: var(--lk-rpx-60);
  background: var(--lk-bg-page);
}

.hero-slide,
.card-slide {
  position: relative;
  width: 100%;
  align-self: stretch;
  min-height: var(--carousel-demo-slide-min-height);
  overflow: hidden;
  border-radius: inherit;
  box-sizing: border-box;
}

.hero-slide {
  min-height: var(--carousel-demo-hero-min-height);
}

.fashion-visual {
  background:
    radial-gradient(circle at 70% 18%, rgba(255, 255, 255, 0.32), transparent 25%),
    linear-gradient(135deg, #2a2d34 0%, #767b87 48%, #f1ece3 100%);
}

.fashion-visual--gallery {
  background:
    radial-gradient(circle at 22% 28%, rgba(255, 255, 255, 0.38), transparent 24%),
    linear-gradient(135deg, #141414 0%, #7d6e67 52%, #d7b9a3 100%);
}

.fashion-visual--resort {
  background:
    radial-gradient(circle at 74% 22%, rgba(255, 255, 255, 0.4), transparent 25%),
    linear-gradient(135deg, #203b3f 0%, #7c9a92 48%, #eadcc6 100%);
}

.fashion-visual--beauty {
  background:
    radial-gradient(circle at 32% 24%, rgba(255, 255, 255, 0.36), transparent 24%),
    linear-gradient(135deg, #342131 0%, #9f7185 52%, #f1d4c5 100%);
}

.hero-slide__shade {
  position: absolute;
  inset: 0;
  background: var(--lk-overlay-bg);
}

.hero-slide__content {
  position: absolute;
  left: var(--lk-spacing-lg);
  right: var(--lk-spacing-lg);
  bottom: var(--lk-spacing-xl);
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: var(--lk-spacing-xs);
  }
  color: var(--carousel-demo-on-media);
}

.hero-slide__tag,
.hero-slide__meta {
  font-size: var(--lk-font-size-xs);
  font-weight: 700;
  letter-spacing: var(--lk-rpx-2);
  text-transform: uppercase;
}

.hero-slide__title {
  font-size: 42rpx;
  font-weight: 800;
  line-height: 1.15;
}

.hero-slide__subtitle {
  max-width: 560rpx;
  font-size: var(--lk-font-size-sm);
  line-height: 1.6;
}

.hero-slide__meta {
  margin-top: var(--lk-spacing-sm);
}

.card-demo-bg {
  padding: var(--lk-spacing-sm) 0;
}

.rounded-carousel {
  overflow: hidden;
  border-radius: var(--lk-radius-xl);
}

.simple-slide,
.vertical-slide {
  width: 100%;
  align-self: stretch;
  min-height: var(--carousel-demo-slide-min-height);
  display: flex;
  align-items: flex-end;
  padding: var(--lk-spacing-lg);
  box-sizing: border-box;
}

.simple-slide__title,
.vertical-slide__title {
  color: var(--carousel-demo-on-media);
  font-size: var(--lk-rpx-36);
  font-weight: 800;
}

.vertical-slide {
  min-height: var(--carousel-demo-vertical-min-height);
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  > :not(:first-child) {
    margin-top: var(--lk-spacing-xs);
  }
}

.vertical-slide__tag {
  color: var(--carousel-demo-on-media);
  font-size: var(--lk-font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
}

.card-slide__caption {
  position: absolute;
  left: var(--lk-spacing-md);
  right: var(--lk-spacing-md);
  bottom: var(--lk-spacing-md);
  padding: var(--lk-spacing-sm) var(--lk-spacing-md);
  border-radius: var(--lk-radius-full);
  background: var(--lk-overlay-bg);
  color: var(--carousel-demo-on-media);
  font-size: var(--lk-font-size-sm);
  font-weight: 700;
}

.card-slide {
  min-height: var(--carousel-demo-card-min-height);
}

.custom-content {
  width: 100%;
  align-self: stretch;
  padding: var(--lk-spacing-sm);
  box-sizing: border-box;
}

.content-card {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: var(--lk-spacing-sm);
  }
  padding: var(--lk-spacing-lg);
  border: var(--lk-rpx-2) solid var(--lk-color-border-light);
  border-radius: var(--lk-radius-lg);
  background: var(--lk-bg-container);
}

.content-card__title {
  color: var(--lk-text-primary);
  font-size: var(--lk-font-size-lg);
  font-weight: 700;
}

.content-card__desc {
  color: var(--lk-text-secondary);
  font-size: var(--lk-font-size-sm);
  line-height: 1.7;
}

.content-card__stats {
  display: flex;
  flex-wrap: wrap;
  > :not(.preview-spacing-placeholder) {
    margin: calc(var(--lk-spacing-xs) / 2);
  }
}

.content-card__stat {
  padding: var(--lk-rpx-8) var(--lk-rpx-16);
  border-radius: var(--lk-radius-full);
  background: var(--lk-color-primary-soft);
  color: var(--lk-color-primary);
  font-size: var(--lk-font-size-xs);
}
</style>
