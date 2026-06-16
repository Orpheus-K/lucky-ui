<script setup lang="ts">
import { ref } from 'vue';

const value1 = ref(true);
const value2 = ref(true);
const value3 = ref(false);
const value4 = ref(true);
const value5 = ref(true);
const value6 = ref(true);
const value7 = ref(true);
const value8 = ref(true);
const value9 = ref(false);
const valueInline = ref(true);
const valueHaptic = ref(false);

// 异步切换示例
const asyncValue = ref(false);
const asyncLoading = ref(false);

const handleAsyncChange = (): Promise<boolean> => {
  asyncLoading.value = true;
  return new Promise(resolve => {
    setTimeout(() => {
      asyncLoading.value = false;
      resolve(true);
    }, 1000);
  });
};
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <view class="switch-row">
        <text>开关</text>
        <lk-switch v-model="value1" />
      </view>
    </demo-block>

    <demo-block title="内嵌文字提示">
      <view class="switch-row">
        <text>默认风格 (文字随主题色)</text>
        <lk-switch v-model="valueInline" inline-prompt />
      </view>
      <view class="switch-row">
        <text>自定义文字</text>
        <lk-switch v-model="valueInline" inline-prompt active-text="开" inactive-text="关" />
      </view>
    </demo-block>

    <demo-block title="触感反馈（仅移动端）">
      <view class="switch-row">
        <text>开启触感</text>
        <lk-switch v-model="valueHaptic" haptic-feedback />
      </view>
    </demo-block>

    <demo-block title="禁用状态">
      <view class="switch-row">
        <text>开启禁用</text>
        <lk-switch v-model="value2" disabled />
      </view>
      <view class="switch-row">
        <text>关闭禁用</text>
        <lk-switch v-model="value3" disabled />
      </view>
    </demo-block>

    <demo-block title="不同尺寸">
      <view class="switch-row">
        <text>小号 sm</text>
        <lk-switch v-model="value4" size="sm" />
      </view>
      <view class="switch-row">
        <text>默认 md</text>
        <lk-switch v-model="value5" size="md" />
      </view>
      <view class="switch-row">
        <text>大号 lg</text>
        <lk-switch v-model="value6" size="lg" />
      </view>
    </demo-block>

    <demo-block title="自定义颜色">
      <view class="switch-row">
        <text>成功色</text>
        <lk-switch v-model="value8" active-color="#07c160" />
      </view>
      <view class="switch-row">
        <text>警告色</text>
        <lk-switch v-model="value9" active-color="#ff976a" inactive-color="#ffe1d0" />
      </view>
    </demo-block>

    <demo-block title="加载状态">
      <view class="switch-row">
        <text>加载中</text>
        <lk-switch v-model="value7" loading />
      </view>
    </demo-block>

    <demo-block title="异步切换">
      <view class="switch-row">
        <text>模拟请求</text>
        <lk-switch
          v-model="asyncValue"
          :loading="asyncLoading"
          :before-change="handleAsyncChange"
        />
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

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;

  text {
    font-size: 28rpx;
    color: var(--lk-text-primary);
  }
}
</style>
