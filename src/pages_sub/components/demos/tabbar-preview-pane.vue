<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'TabbarPreviewPane' });

const props = defineProps<{
  tabId?: string;
  isActive?: boolean;
}>();

const titleMap: Record<string, string> = {
  home: '发现灵感',
  cart: '购物车',
  detail: '商品详情',
  mine: '个人中心',
  overview: '组件预览',
};

const descMap: Record<string, string> = {
  home: '这里用于演示 Tabbar 模式切换时的内容区稳定性。',
  cart: '支持徽标、主题色联动和不同激活动画。',
  detail: '切换到手电筒、浮动、标记等模式观察反馈差异。',
  mine: '图标与文字激活色会跟随当前品牌色。',
  overview: '和“预览设置”中的 Tabbar 模式保持一致。',
};

const title = computed(() => titleMap[props.tabId || ''] || 'Tab 页面');
const desc = computed(() => descMap[props.tabId || ''] || '演示内容');
</script>

<template>
  <view class="tabbar-preview-pane">
    <text class="tabbar-preview-pane__title">{{ title }}</text>
    <text class="tabbar-preview-pane__desc">{{ desc }}</text>
  </view>
</template>

<style scoped lang="scss">
.tabbar-preview-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  > :not(:first-child) {
    margin-top: 12rpx;
  }
  background: var(--lk-bg-page);

  &__title {
    font-size: 34rpx;
    font-weight: 700;
    color: var(--lk-text-primary);
  }

  &__desc {
    font-size: 24rpx;
    color: var(--lk-text-secondary);
    padding: 0 36rpx;
    text-align: center;
    line-height: 1.6;
  }
}
</style>
