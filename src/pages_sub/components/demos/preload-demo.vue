<script setup lang="ts">
import { computed } from 'vue';
import { usePreload, PreloadPriority } from '@/uni_modules/lucky-ui/core/src/preload';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkPreloadDebugger from '@/uni_modules/lucky-ui/components/lk-preload-debugger/lk-preload-debugger.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const { stats, isLoading, isPaused, preloadPage, preloadImages, pause, resume, clear } = usePreload(
  {
    autoStart: true,
    startDelay: 0,
  }
);

const statusText = computed(() => {
  if (isLoading.value) return '运行中';
  if (isPaused.value) return '已暂停';
  return '空闲';
});

const summaryText = computed(() => {
  const s = stats.value;
  return `总 ${s.total} · 运行 ${s.running} · 等待 ${s.pending} · 完成 ${s.completed} · 失败 ${s.failed}`;
});

const handleQueuePages = () => {
  preloadPage({ path: '/pages_sub/search/index', priority: PreloadPriority.HIGH });
  preloadPage({ path: '/pages_sub/settings/index', priority: PreloadPriority.MEDIUM });
  preloadPage({ path: '/pages_sub/analytics/index', priority: PreloadPriority.LOW });
  uni.showToast({ title: '已加入页面预加载', icon: 'none' });
};

const handleQueueImages = () => {
  preloadImages(
    [
      'https://picsum.photos/420/240?random=31',
      'https://picsum.photos/420/240?random=32',
      'https://picsum.photos/420/240?random=33',
    ],
    PreloadPriority.LOW
  );
  uni.showToast({ title: '已加入图片预加载', icon: 'none' });
};

const handleTogglePause = () => {
  if (isPaused.value) {
    resume();
    uni.showToast({ title: '预加载已恢复', icon: 'none' });
    return;
  }
  pause();
  uni.showToast({ title: '预加载已暂停', icon: 'none' });
};

const handleClear = () => {
  clear();
  uni.showToast({ title: '队列已清空', icon: 'none' });
};
</script>

<template>
  <view class="component-demo preload-demo">
    <demo-block title="状态总览">
      <view class="status-card">
        <view class="status-header">
          <text class="status-title">当前状态：{{ statusText }}</text>
          <text class="experimental-tag">实验性功能</text>
        </view>
        <text class="status-summary">{{ summaryText }}</text>
      </view>
    </demo-block>

    <demo-block title="触发任务">
      <view class="action-row">
        <lk-button size="sm" @click="handleQueuePages">预加载页面</lk-button>
        <lk-button size="sm" variant="outline" @click="handleQueueImages">预加载图片</lk-button>
      </view>
      <view class="action-row">
        <lk-button size="sm" variant="soft" @click="handleTogglePause">
          {{ isPaused ? '恢复队列' : '暂停队列' }}
        </lk-button>
        <lk-button size="sm" variant="text" @click="handleClear">清空队列</lk-button>
      </view>
    </demo-block>

    <demo-block title="调试面板">
      <view class="debug-container">
        <text class="debug-tip">展开右下角调试面板，可查看任务日志与统计变化。</text>
        <text class="experimental-tag">实验性</text>
      </view>
    </demo-block>

    <lk-preload-debugger :visible="true" position="bottom-right" />
  </view>
</template>

<style scoped lang="scss">
.preload-demo {
  position: relative;
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 32rpx;
  }
  min-height: 680rpx;
}

.status-card {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 12rpx;
  }
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #303133;
}

.status-summary {
  font-size: 24rpx;
  color: #606266;
  line-height: 1.6;
}

.action-row {
  display: flex;
  > :not(:first-child) {
    margin-left: 16rpx;
  }
  flex-wrap: wrap;
  margin-bottom: 16rpx;
}

.debug-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.debug-tip {
  font-size: 24rpx;
  color: #909399;
  line-height: 1.6;
  flex: 1;
  margin-right: 16rpx;
}

.experimental-tag {
  font-size: 20rpx;
  color: #fa8c16;
  background: #fff7e6;
  border: 1px solid #ffd591;
  padding: 2rpx 12rpx;
  border-radius: 4rpx;
  font-weight: 500;
  line-height: 1.2;
  flex-shrink: 0;
}
</style>
