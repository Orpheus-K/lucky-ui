<script setup lang="ts">
import { ref, onMounted } from 'vue';
import LkVirtualList from '@/uni_modules/lucky-ui/components/lk-virtual-list/lk-virtual-list.vue';

// 真实分页模拟：首次加载一页，滚动到底或预取触发再加载下一页
const list = ref<{ id: number; text: string }[]>([]);
const loading = ref(false);
const pageSize = 100;
let currentPage = 0;
const totalPages = Infinity; // 模拟无尽流；如果有总页数请设置为具体数字

async function loadNextPage() {
  if (loading.value) return;
  if (currentPage >= totalPages) return;
  loading.value = true;
  const pageToLoad = currentPage + 1;
  // 模拟异步接口
  await new Promise(r => setTimeout(r, 400));
  const startId = (pageToLoad - 1) * pageSize;
  const newItems = Array.from({ length: pageSize }, (_, i) => {
    const id = startId + i;
    return { id, text: `项目 ${id + 1}` };
  });
  list.value.push(...newItems);
  currentPage = pageToLoad;
  loading.value = false;
}

onMounted(() => {
  // 首屏加载
  loadNextPage();
});

function onPrefetch() {
  loadNextPage();
}

function onReachBottom() {
  loadNextPage();
}

function onScroll(_data: { scrollTop: number; start: number; end: number }) {
  // 可用于调试滚动窗口：start/end
  // console.log('滚动事件', data);
}
</script>

<template>
  <view class="demo-container">
    <text class="title">虚拟列表演示</text>
    <!-- 简单状态栏 -->
    <view class="toolbar">
      <text>总数：{{ list.length }}</text>
      <text v-if="loading" class="loading">加载中...</text>
    </view>

    <lk-virtual-list
      :items="list"
      :item-height="50"
      :height="400"
      :buffer="6"
      :dynamic-overscan="true"
      :max-overscan-rows="24"
      :overscan-boost-factor="0.7"
      :prefetch-rows="30"
      :lower-threshold="'120rpx'"
      content-class="virtual-list-content"
      item-class="virtual-list-row"
      :content-style="{ '--virtual-list-demo-row-border': 'var(--lk-color-border-light)' }"
      @prefetch="onPrefetch"
      @reach-bottom="onReachBottom"
      @scroll="onScroll"
    >
      <template #default="{ items, start, itemClass, itemStyle }">
        <view
          v-for="(item, i) in items"
          :key="item.id"
          :class="['item', itemClass]"
          :style="itemStyle"
        >
          {{ start + i + 1 }}. {{ item.text }}
        </view>
      </template>
    </lk-virtual-list>
  </view>
</template>

<style scoped>
.demo-container {
  padding: 20px;
}
.title {
  font-size: 18px;
  margin-bottom: 10px;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}
.loading {
  color: #2979ff;
}
.item {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border-bottom: 1px solid var(--virtual-list-demo-row-border, #eee);
}
.virtual-list-row {
  box-sizing: border-box;
}
</style>
