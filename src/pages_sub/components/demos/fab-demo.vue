<script setup lang="ts">
import { ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkFab from '@/uni_modules/lucky-ui/components/lk-fab/lk-fab.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';
import type { FabAction } from '@/uni_modules/lucky-ui/components/lk-fab/fab.props';

const expanded = ref(false);
const direction = ref<'up' | 'down' | 'left' | 'right'>('up');
const color = ref('primary');
const blur = ref(true);
const draggable = ref(true);
const icon = ref('plus');

const actions = ref<FabAction[]>([
  { key: 'scan', icon: 'qr-code-scan', label: '扫一扫' },
  { key: 'photo', icon: 'camera', label: '拍照' },
  { key: 'share', icon: 'share' },
]);

function onFabClick() {
  console.log('FAB clicked');
}

function onActionClick(action: FabAction) {
  uni.showToast({
    title: `点击了 ${action.label || action.key}`,
    icon: 'none',
  });
}

function onDragEnd(position: { x: number; y: number }) {
  console.log('拖拽结束，位置：', position);
}
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <view class="desc"
        >可拖拽的悬浮按钮，默认吸附到屏幕边缘。拖拽后自动吸边，点击可执行操作。</view
      >
    </demo-block>

    <demo-block title="带子按钮">
      <view class="desc">点击展开更多操作，支持上/下/左/右四个方向展开。</view>
      <lk-space wrap>
        <lk-button size="sm" @click="direction = 'up'">向上</lk-button>
        <lk-button size="sm" @click="direction = 'down'">向下</lk-button>
        <lk-button size="sm" @click="direction = 'left'">向左</lk-button>
        <lk-button size="sm" @click="direction = 'right'">向右</lk-button>
      </lk-space>
    </demo-block>

    <demo-block title="毛玻璃效果">
      <view class="desc">开启 blur 属性可获得 iOS 风格的毛玻璃效果。</view>
      <lk-space wrap>
        <lk-button size="sm" @click="blur = !blur">
          {{ blur ? '关闭毛玻璃' : '开启毛玻璃' }}
        </lk-button>
      </lk-space>
    </demo-block>

    <demo-block title="自定义颜色">
      <view class="desc">支持自定义颜色值。</view>
      <lk-space wrap>
        <lk-button size="sm" variant="soft" @click="color = 'primary'">Primary</lk-button>
        <lk-button size="sm" variant="soft" @click="color = '#ff6b6b'">红色</lk-button>
        <lk-button size="sm" variant="soft" @click="color = '#4ecdc4'">青色</lk-button>
        <lk-button size="sm" variant="soft" @click="color = '#ffe66d'">黄色</lk-button>
      </lk-space>
    </demo-block>

    <demo-block title="禁用拖拽">
      <view class="desc">设置 draggable="false" 可禁用拖拽功能。</view>
      <lk-space wrap>
        <lk-button size="sm" @click="draggable = !draggable">
          {{ draggable ? '禁用拖拽' : '启用拖拽' }}
        </lk-button>
      </lk-space>
    </demo-block>

    <view class="tips">
      <lk-icon name="info-circle" size="28" color="var(--lk-color-info)" />
      <text>提示：尝试拖动右下角的悬浮按钮，松手后会自动吸附到屏幕边缘。点击可展开更多操作。</text>
    </view>

    <!-- FAB 组件 -->
    <lk-fab
      v-model="expanded"
      :icon="icon"
      :direction="direction"
      :actions="actions"
      :color="color"
      :blur="blur"
      :draggable="draggable"
      @click="onFabClick"
      @action-click="onActionClick"
      @drag-end="onDragEnd"
    />
  </view>
</template>
<style scoped lang="scss">
.component-demo {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 32rpx;
  }
  padding-bottom: 200rpx;
}

.desc {
  font-size: 24rpx;
  color: var(--lk-text-secondary);
  margin-bottom: 16rpx;
}

.tips {
  display: flex;
  align-items: flex-start;
  > :not(:first-child) {
    margin-left: 12rpx;
  }
  padding: 24rpx;
  background: var(--lk-fill-secondary);
  border-radius: var(--lk-radius-lg);
  font-size: 24rpx;
  color: var(--lk-text-secondary);
  line-height: 1.6;
}
</style>
