<script setup lang="ts">
import { ref } from 'vue';
import LkSlider from '@/uni_modules/lucky-ui/components/lk-slider/lk-slider.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const v1 = ref(30);
const vStep = ref(20);
const vStep2 = ref(15);
const vRange = ref([20, 60]);
const vRangeTooltip = ref([30, 70]);
const v3 = ref(45);
const vValue = ref(50);
const vDrag = ref(30);

const onDragRelease = (val: any) => {
  uni.showToast({
    title: `拖拽松开: ${val}`,
    icon: 'none',
  });
};
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <view class="demo-item">
        <lk-slider v-model="v1" />
        <text class="value-text">当前：{{ v1 }}</text>
      </view>
    </demo-block>

    <demo-block title="拖拽松开事件 (Drag Release)">
      <view class="demo-item">
        <lk-slider v-model="vDrag" @drag-release="onDragRelease" />
        <text class="value-text">拖拽结束会触发 Toast 提示</text>
      </view>
    </demo-block>

    <demo-block title="显示当前值（Tooltip）">
      <view class="demo-item">
        <lk-slider v-model="vValue" show-value />
      </view>
    </demo-block>

    <demo-block title="步长与间断点 (Step)">
      <view class="demo-item">
        <text class="label">步长=10，显示间断点</text>
        <lk-slider v-model="vStep" :step="10" show-stops show-value />
      </view>
      <view class="demo-item">
        <text class="label">Min=10, Step=5 (非0起始)</text>
        <lk-slider v-model="vStep2" :min="10" :max="40" :step="5" show-stops show-value />
      </view>
    </demo-block>

    <demo-block title="双滑块范围 (Range)">
      <view class="demo-item">
        <lk-slider v-model="vRange" range :max="100" />
        <text class="value-text">当前: {{ vRange.join(' - ') }}</text>
      </view>
      <view class="demo-item">
        <text class="label">双滑块 + Tooltip</text>
        <lk-slider v-model="vRangeTooltip" range show-value :max="100" />
        <text class="value-text">当前: {{ vRangeTooltip.join(' - ') }}</text>
      </view>
    </demo-block>

    <demo-block title="自定义样式">
      <view class="demo-item">
        <text class="label">自定义激活色与高度</text>
        <lk-slider v-model="v3" active-color="#ff4d4f" block-color="#ff4d4f" bar-height="8rpx" />
      </view>
      <view class="demo-item">
        <text class="label">自定义轨道背景色 (Inactive Color)</text>
        <lk-slider v-model="v3" active-color="#1890ff" inactive-color="#d9d9d9" />
      </view>
    </demo-block>
  </view>
</template>
<style scoped lang="scss">
.component-demo {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 32rpx;
  }
}
.demo-item {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 16rpx;
  }
}
.label {
  display: block;
  font-size: 24rpx;
  color: #909399;
  margin-bottom: 16rpx;
}
.value-text {
  display: block;
  font-size: 24rpx;
  color: #606266;
  text-align: center;
}
</style>
