<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { WaterfallItem } from '@/uni_modules/lucky-ui/components/lk-waterfall/waterfall.props';

// 瀑布流高度 (屏幕高度 - 顶部区域)
const waterfallHeight = ref(500);

// 数据列表
const list = ref<WaterfallItem[]>([]);

// 加载状态
const loading = ref(false);
const currentPage = ref(0);
const pageSize = 20;
const hasMore = ref(true);

// 滚动位置
const scrollPosition = ref(0);

// 随机工具函数
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 精选高质量图片数据 (使用真实在线图片)
// 使用 Unsplash 精选图片，分类：时尚、美食、旅行、生活方式、设计
const curatedImages = [
  // 时尚穿搭类
  {
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80',
    ratio: 1.5,
    category: 'fashion',
  },
  {
    url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80',
    ratio: 1.33,
    category: 'fashion',
  },
  {
    url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80',
    ratio: 1.5,
    category: 'fashion',
  },
  {
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80',
    ratio: 1.25,
    category: 'fashion',
  },
  {
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    ratio: 1.4,
    category: 'fashion',
  },
  {
    url: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400&q=80',
    ratio: 1.33,
    category: 'fashion',
  },
  // 美食类
  {
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
    ratio: 0.75,
    category: 'food',
  },
  {
    url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80',
    ratio: 1,
    category: 'food',
  },
  {
    url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80',
    ratio: 0.8,
    category: 'food',
  },
  {
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
    ratio: 1.2,
    category: 'food',
  },
  {
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
    ratio: 0.75,
    category: 'food',
  },
  {
    url: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&q=80',
    ratio: 0.85,
    category: 'food',
  },
  // 旅行风景类
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
    ratio: 0.75,
    category: 'travel',
  },
  {
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80',
    ratio: 0.67,
    category: 'travel',
  },
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
    ratio: 0.67,
    category: 'travel',
  },
  {
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=80',
    ratio: 0.6,
    category: 'travel',
  },
  {
    url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80',
    ratio: 0.75,
    category: 'travel',
  },
  {
    url: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400&q=80',
    ratio: 0.8,
    category: 'travel',
  },
  // 生活方式类
  {
    url: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?w=400&q=80',
    ratio: 1.33,
    category: 'lifestyle',
  },
  {
    url: 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=400&q=80',
    ratio: 1,
    category: 'lifestyle',
  },
  {
    url: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=400&q=80',
    ratio: 1.25,
    category: 'lifestyle',
  },
  {
    url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=400&q=80',
    ratio: 0.75,
    category: 'lifestyle',
  },
  {
    url: 'https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=400&q=80',
    ratio: 1,
    category: 'lifestyle',
  },
  {
    url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&q=80',
    ratio: 0.8,
    category: 'lifestyle',
  },
  // 设计艺术类
  {
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    ratio: 1.33,
    category: 'design',
  },
  {
    url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&q=80',
    ratio: 1.5,
    category: 'design',
  },
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    ratio: 1,
    category: 'design',
  },
  {
    url: 'https://images.unsplash.com/photo-1456086272160-b28b0645b729?w=400&q=80',
    ratio: 1.2,
    category: 'design',
  },
  {
    url: 'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=400&q=80',
    ratio: 0.85,
    category: 'design',
  },
  {
    url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80',
    ratio: 0.75,
    category: 'design',
  },
  // 更多精选
  {
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    ratio: 0.75,
    category: 'product',
  },
  {
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    ratio: 1,
    category: 'product',
  },
  {
    url: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&q=80',
    ratio: 1.2,
    category: 'product',
  },
  {
    url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80',
    ratio: 1.5,
    category: 'coffee',
  },
  {
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
    ratio: 0.85,
    category: 'coffee',
  },
  {
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
    ratio: 1,
    category: 'coffee',
  },
  {
    url: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=400&q=80',
    ratio: 1.33,
    category: 'sport',
  },
  {
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
    ratio: 1.5,
    category: 'sport',
  },
  {
    url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80',
    ratio: 0.75,
    category: 'sport',
  },
  {
    url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&q=80',
    ratio: 1,
    category: 'flower',
  },
];

// 分类对应的标题模板
const categoryTitles: Record<string, string[]> = {
  fashion: ['今日穿搭分享', '秋季必备单品', '极简风格穿搭', '通勤OOTD', '约会穿搭灵感', '街拍时尚'],
  food: ['美味不可辜负', '探店打卡', '周末美食记录', '自制早餐', '下午茶时光', '深夜食堂'],
  travel: ['旅行的意义', '绝美风景推荐', '小众旅行地', '周末出游', '治愈系风景', '想去的地方'],
  lifestyle: [
    '生活的仪式感',
    '居家好物分享',
    '提升幸福感的小事',
    '工作日常',
    '咖啡时光',
    '阅读时光',
  ],
  design: ['设计灵感', '创意空间', '极简美学', '艺术装置', '室内设计', '建筑之美'],
  product: ['好物推荐', '开箱测评', '必入好物', '品质生活', '设计感好物', '实用好物'],
  coffee: ['咖啡日记', '拿铁艺术', '咖啡店探店', '手冲咖啡', '咖啡与阅读', '治愈咖啡'],
  sport: ['运动日常', '健身打卡', '瑜伽时光', '跑步记录', '健康生活', '活力满满'],
  flower: ['花艺灵感', '今日花束', '植物日记', '阳台花园', '绿植治愈', '鲜花装饰'],
};

// 作者名称和头像颜色
const authors = [
  { name: '时尚博主Luna', color: '#FF6B6B' },
  { name: '美食家小厨', color: '#4ECDC4' },
  { name: '旅行达人Echo', color: '#45B7D1' },
  { name: '生活方式Mia', color: '#96CEB4' },
  { name: '设计师阿杰', color: '#BB8FCE' },
  { name: '摄影师Tom', color: '#85C1E9' },
  { name: '咖啡控Yuki', color: '#F8B500' },
  { name: '健身教练Max', color: '#00CED1' },
  { name: '花艺师小雨', color: '#DDA0DD' },
  { name: '极简生活家', color: '#98D8C8' },
];

// 标签
const tags = ['精选', '热门', '新品', '推荐', '编辑推荐', '', '', '', '', ''];

// 生成模拟数据
function generateItems(page: number): WaterfallItem[] {
  const startId = (page - 1) * pageSize;

  return Array.from({ length: pageSize }, (_, i) => {
    const id = startId + i;
    const imageIndex = id % curatedImages.length;
    const imageData = curatedImages[imageIndex];
    const category = imageData.category;
    const titleList = categoryTitles[category] || categoryTitles.lifestyle;
    const author = authors[rand(0, authors.length - 1)];

    return {
      id,
      image: imageData.url,
      ratio: imageData.ratio,
      extraHeight: 56,
      title: `${titleList[rand(0, titleList.length - 1)]} #${id + 1}`,
      author: author.name,
      avatarColor: author.color,
      likes: rand(100, 9999),
      tag: tags[rand(0, tags.length - 1)],
    };
  });
}

// 加载数据
async function loadMore() {
  if (loading.value || !hasMore.value) return;

  loading.value = true;

  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 600));

  const nextPage = currentPage.value + 1;
  const newItems = generateItems(nextPage);

  list.value = [...list.value, ...newItems];
  currentPage.value = nextPage;

  // 模拟数据有限 (10页后停止)
  if (nextPage >= 10) {
    hasMore.value = false;
  }

  loading.value = false;
}

// 事件处理
function onLoadMore() {
  loadMore();
}

function onReachBottom() {
  console.log('[Waterfall] 触底');
}

function onCardClick(item: WaterfallItem, index: number) {
  uni.showToast({
    title: `点击了 #${index + 1}`,
    icon: 'none',
  });
}

function onScroll(e: { scrollTop: number; scrollHeight: number }) {
  scrollPosition.value = e.scrollTop;
}

// 初始化
onMounted(() => {
  // 计算瀑布流高度
  const sysInfo = uni.getSystemInfoSync();
  // 留出顶部区域空间 (标题 + 统计)
  waterfallHeight.value = sysInfo.windowHeight - 180;

  // 加载首屏数据
  loadMore();
});
</script>

<template>
  <view class="demo-page">
    <!-- 标题区域 -->
    <view class="demo-header">
      <text class="demo-title">瀑布流 Waterfall</text>
      <text class="demo-desc">高性能双列瀑布流，支持图片预加载、骨架屏、无限滚动</text>
    </view>

    <!-- 统计信息 -->
    <view class="demo-stats">
      <view class="stat-item">
        <text class="stat-value">{{ list.length }}</text>
        <text class="stat-label">卡片数</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ currentPage }}</text>
        <text class="stat-label">页码</text>
      </view>
      <view v-if="loading" class="stat-item">
        <view class="loading-dot" />
        <text class="stat-label">加载中</text>
      </view>
    </view>

    <!-- 瀑布流 -->
    <view class="waterfall-shell">
      <lk-waterfall
        :items="list"
        :gutter="12"
        :row-gap="12"
        :padding-x="0"
        :padding-y="0"
        :height="waterfallHeight"
        :card-radius="12"
        :lower-threshold="200"
        :preload-screens="2"
        :show-skeleton="true"
        :preload-image="true"
        :default-extra-height="56"
        :bounces="true"
        @load-more="onLoadMore"
        @reach-bottom="onReachBottom"
        @card-click="onCardClick"
        @scroll="onScroll"
      >
        <template #item="{ item, loading: imageLoading, onImageLoad, onImageError }">
          <view class="card" :class="{ 'card--loading': imageLoading }">
            <!-- 图片区域 -->
            <view
              class="card__image-wrapper"
              :style="{ paddingBottom: `${(item.ratio || 1) * 100}%` }"
            >
              <image
                class="card__image"
                :src="item.image"
                mode="aspectFill"
                :lazy-load="true"
                @load="onImageLoad"
                @error="onImageError"
              />
              <!-- 图片上的标签 -->
              <view v-if="item.tag" class="card__tag">{{ item.tag }}</view>
            </view>

            <!-- 内容区域 -->
            <view class="card__content">
              <text class="card__title">{{ item.title }}</text>
              <view class="card__footer">
                <view class="card__author">
                  <view class="card__avatar" :style="{ background: item.avatarColor }" />
                  <text class="card__name">{{ item.author }}</text>
                </view>
                <view class="card__likes">
                  <text class="card__likes-icon">♥</text>
                  <text class="card__likes-count">{{ item.likes }}</text>
                </view>
              </view>
            </view>
          </view>
        </template>
      </lk-waterfall>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.demo-page {
  min-height: 100vh;
  background: var(--lk-bg-page);
}

.demo-header {
  padding: 24rpx 32rpx;
  background: var(--lk-bg-elevated);
}

.demo-title {
  font-size: 36rpx;
  font-weight: 600;
  color: var(--lk-text-primary);
  display: block;
}

.demo-desc {
  font-size: 24rpx;
  color: var(--lk-text-secondary);
  margin-top: 8rpx;
  display: block;
}

.demo-stats {
  display: flex;
  padding: 20rpx 32rpx;
  background: var(--lk-bg-elevated);
  border-top: 1px solid var(--lk-color-border);
  > :not(:first-child) {
    margin-left: 48rpx;
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--lk-color-primary);
}

.stat-label {
  font-size: 20rpx;
  color: var(--lk-text-tertiary);
  margin-top: 4rpx;
}

.loading-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: var(--lk-color-primary);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

.waterfall-shell {
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

// ======================== 卡片样式 ========================
.card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--lk-bg-elevated);
  overflow: hidden;

  &--loading {
    .card__image {
      opacity: 0;
    }
  }
}

.card__image-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.card__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: opacity 0.3s ease;
}

.card__tag {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  padding: 4rpx 12rpx;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border-radius: 8rpx;
  font-size: 20rpx;
  color: #fff;
}

.card__content {
  flex: 1;
  padding: 16rpx 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card__title {
  font-size: 26rpx;
  font-weight: 500;
  color: var(--lk-text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
}

.card__author {
  display: flex;
  align-items: center;
  > :not(:first-child) {
    margin-left: 8rpx;
  }
}

.card__avatar {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
}

.card__name {
  font-size: 20rpx;
  color: var(--lk-text-secondary);
}

.card__likes {
  display: flex;
  align-items: center;
  > :not(:first-child) {
    margin-left: 4rpx;
  }
}

.card__likes-icon {
  font-size: 24rpx;
  color: #ff6b6b;
}

.card__likes-count {
  font-size: 20rpx;
  color: var(--lk-text-secondary);
}
</style>
