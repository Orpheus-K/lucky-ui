<script setup lang="ts">
import { ref } from 'vue';
import LkRate from '@/uni_modules/lucky-ui/components/lk-rate/lk-rate.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const value1 = ref(3);
const value2 = ref(3);
const value3 = ref(4);
const value4 = ref(2);
const value5 = ref(5);
const value6 = ref(4);
const value7 = ref(3);
const valueClear = ref(3);
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <lk-rate v-model="value1" />
      <text class="demo-tip">当前值：{{ value1 }}</text>
    </demo-block>

    <demo-block title="自定义图标">
      <lk-rate
        v-model="value2"
        icon="star-fill"
        icon-void="star"
        color="#f5a623"
        color-void="#ddd"
      />
      <text class="demo-tip">当前值：{{ value2 }}</text>
    </demo-block>

    <demo-block title="可清除（再次点击清零）">
      <lk-rate v-model="valueClear" allow-clear />
      <text class="demo-tip">当前值：{{ valueClear }}</text>
    </demo-block>

    <demo-block title="只读">
      <lk-rate v-model="value3" readonly />
    </demo-block>

    <demo-block title="禁用">
      <lk-rate v-model="value4" disabled />
    </demo-block>

    <demo-block title="自定义数量">
      <lk-rate v-model="value5" :count="8" />
    </demo-block>

    <demo-block title="自定义颜色">
      <lk-rate v-model="value6" color="#ff6b6b" />
    </demo-block>

    <demo-block title="自定义尺寸">
      <lk-rate v-model="value7" :size="64" />
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
.demo-tip {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: var(--lk-text-secondary);
}
</style>
