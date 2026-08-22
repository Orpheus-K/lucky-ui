<script setup lang="ts">
import { ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkChoice from '@/uni_modules/lucky-ui/components/lk-choice/lk-choice.vue';

const singleValue = ref('wechat');
const multiValue = ref<Array<string>>(['coupon']);

const channelOptions = [
  { label: '微信', value: 'wechat', icon: 'wechat' },
  { label: '支付宝', value: 'alipay', icon: 'wallet2' },
  { label: '银行卡', value: 'bank', icon: 'credit-card' },
];

const sceneOptions = [
  { label: '优惠券', value: 'coupon' },
  { label: '积分', value: 'point' },
  { label: '包邮', value: 'shipping' },
  { label: '会员价', value: 'member' },
];
</script>

<template>
  <view class="component-demo choice-demo">
    <demo-block title="单选">
      <lk-choice v-model="singleValue" :options="channelOptions" />
      <text class="choice-demo__value">当前：{{ singleValue }}</text>
    </demo-block>

    <demo-block title="多选">
      <lk-choice v-model="multiValue" multiple :options="sceneOptions" size="sm" />
      <text class="choice-demo__value">当前：{{ multiValue.join('、') }}</text>
    </demo-block>

    <demo-block title="不可取消">
      <lk-choice v-model="singleValue" :options="channelOptions" :allow-unselect="false" />
    </demo-block>
  </view>
</template>

<style scoped lang="scss">
.choice-demo {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 32rpx;
  }

  &__value {
    display: block;
    margin-top: 16rpx;
    color: var(--lk-text-secondary);
    font-size: var(--lk-font-size-sm);
  }
}
</style>
