<script setup lang="ts">
import { ref } from 'vue';
import LkStepper from '@/uni_modules/lucky-ui/components/lk-stepper/lk-stepper.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

// 基础
const v1 = ref(1);

// 步长与范围
const v2 = ref(1);

// 限制整数
const v3 = ref(1);

// 尺寸
const v4_sm = ref(1);
const v4_md = ref(1);
const v4_lg = ref(1);

// 异步
const v5 = ref(1);

// 异步变更模拟
const asyncChange = (val: number) => {
  uni.showLoading({ title: '校验中...' });
  return new Promise<boolean>(resolve => {
    setTimeout(() => {
      uni.hideLoading();
      // 模拟：不能超过 5
      if (val > 5) {
        uni.showToast({ title: '库存不足', icon: 'none' });
        resolve(false);
      } else {
        resolve(true);
      }
    }, 600);
  });
};
</script>

<template>
  <view class="stepper-demo">
    <demo-block title="基础用法">
      <view class="row">
        <lk-stepper v-model="v1" />
      </view>
    </demo-block>

    <demo-block title="步长(0.2) 与 范围(0-10)">
      <view class="row">
        <lk-stepper v-model="v2" step="0.2" min="0" max="10" />
      </view>
    </demo-block>

    <demo-block title="限制整数 (尝试输入小数)">
      <view class="row">
        <lk-stepper v-model="v3" integer />
      </view>
      <view class="desc">输入 1.5 失焦后会自动变为 1</view>
    </demo-block>

    <demo-block title="禁用状态">
      <view class="row">
        <lk-stepper :model-value="3" disabled />
      </view>
    </demo-block>

    <demo-block title="自定义尺寸 (Sm/Md/Lg)">
      <view class="row space-between">
        <lk-stepper v-model="v4_sm" size="sm" />
        <lk-stepper v-model="v4_md" size="md" />
        <lk-stepper v-model="v4_lg" size="lg" />
      </view>
    </demo-block>

    <demo-block title="自定义宽度">
      <view class="row">
        <lk-stepper :model-value="1000" input-width="120" />
      </view>
    </demo-block>

    <demo-block title="异步变更 (最大为5)">
      <view class="row">
        <lk-stepper v-model="v5" :before-change="asyncChange" />
      </view>
    </demo-block>
  </view>
</template>

<style lang="scss" scoped>
.stepper-demo {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 32rpx;
  }
  padding-bottom: 50rpx;
}
.row {
  display: flex;
  align-items: center;

  &.space-between {
    justify-content: space-between;
  }
}
.desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 12rpx;
}
</style>
