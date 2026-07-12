<script setup lang="ts">
import { ref } from 'vue';
import LkProgress from '@/uni_modules/lucky-ui/components/lk-progress/lk-progress.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const percentage2 = ref(50);

const increase = () => {
  if (percentage2.value < 100) {
    percentage2.value += 10;
  }
};

const decrease = () => {
  if (percentage2.value > 0) {
    percentage2.value -= 10;
  }
};
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <lk-progress :striped="false" :percentage="50" />
    </demo-block>

    <demo-block title="线条粗细">
      <lk-progress :percentage="50" :stroke-width="8" />
      <lk-progress :percentage="70" :stroke-width="12" style="margin-top: 16rpx" />
      <lk-progress :percentage="90" :stroke-width="16" style="margin-top: 16rpx" />
    </demo-block>

    <demo-block title="不同状态">
      <lk-progress :percentage="30" />
      <lk-progress :percentage="70" status="success" style="margin-top: 16rpx" />
      <lk-progress :percentage="50" status="warning" style="margin-top: 16rpx" />
      <lk-progress :percentage="100" status="error" style="margin-top: 16rpx" />
    </demo-block>

    <demo-block title="条纹效果 (已优化密度)">
      <lk-progress :percentage="50" striped />
      <lk-progress :percentage="70" striped animated style="margin-top: 16rpx" />
    </demo-block>

    <demo-block title="自定义颜色">
      <lk-progress :percentage="40" color="#f56c6c" />
      <lk-progress
        :percentage="60"
        color="linear-gradient(to right, #f83600 0%, #f9d423 100%)"
        style="margin-top: 16rpx"
      />
    </demo-block>

    <demo-block title="文字内显">
      <lk-progress :percentage="80" :stroke-width="32" text-inside />
    </demo-block>

    <demo-block title="动态进度">
      <lk-progress :percentage="percentage2" show-text />
      <view class="button-group">
        <lk-button @click="decrease">-10</lk-button>
        <lk-button type="primary" @click="increase">+10</lk-button>
      </view>
    </demo-block>
  </view>
</template>
<style scoped lang="scss">
.component-demo {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 32rpx;
  }
}

.button-group {
  display: flex;
  > :not(:first-child) {
    margin-left: 16rpx;
  }
  margin-top: 24rpx;
}
</style>
