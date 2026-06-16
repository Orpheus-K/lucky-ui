<script setup lang="ts">
import { ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkSelectList from '@/uni_modules/lucky-ui/components/lk-select-list/lk-select-list.vue';
import type { SelectValue } from '@/uni_modules/lucky-ui/components/lk-select-list/select-list.props';

const singleValue = ref<SelectValue>('standard');
const multiValue = ref<SelectValue[]>(['push']);
const maxValue = ref<SelectValue[]>(['wechat']);
const borderOnlyValue = ref<SelectValue>('pro');
const bgOnlyValue = ref<SelectValue>('month');
const noIconValue = ref<SelectValue[]>(['coupon']);
const customColorValue = ref<SelectValue>('priority');
const gridValue = ref<SelectValue[]>(['coupon', 'points']);
const radiusValue = ref<SelectValue>('year');
const overlimitText = ref('');

const planOptions = [
  {
    label: '标准版',
    value: 'standard',
    description: '适合轻量配置和基础业务流程',
    icon: 'app-indicator',
  },
  {
    label: '专业版',
    value: 'pro',
    description: '支持更完整的自动化和数据洞察',
    icon: 'stars',
  },
  {
    label: '企业版',
    value: 'enterprise',
    description: '专属部署与高级权限能力',
    icon: 'shield-check',
  },
];

const textOnlyOptions = [
  { label: '标准版', value: 'standard' },
  { label: '专业版', value: 'pro' },
  { label: '企业版', value: 'enterprise' },
];

const noticeOptions = [
  { label: '站内消息', value: 'message', description: '进入应用后展示' },
  { label: 'Push 推送', value: 'push', description: '系统通知栏提醒' },
  { label: '邮件提醒', value: 'email', description: '用于重要流程通知' },
  { label: '短信提醒', value: 'sms', description: '该通道暂不可用', disabled: true },
];

const channelOptions = [
  { label: '微信支付', value: 'wechat', description: '推荐用于移动端' },
  { label: '支付宝', value: 'alipay', description: '覆盖主流支付场景' },
  { label: '银行卡', value: 'bank', description: '适合大额交易' },
];

const periodOptions = [
  { label: '按月订阅', value: 'month', description: '灵活续费' },
  { label: '按年订阅', value: 'year', description: '更低单价' },
];

const benefitOptions = [
  { label: '优惠券', value: 'coupon', description: '下单时抵扣金额' },
  { label: '积分', value: 'points', description: '完成任务后发放' },
  { label: '会员价', value: 'member', description: '对会员展示专属价格' },
];

const taskOptions = [
  { label: '优先处理', value: 'priority', description: '进入高优任务队列' },
  { label: '普通处理', value: 'normal', description: '按默认队列执行' },
  { label: '延后处理', value: 'later', description: '低峰时段执行' },
];

function onOverlimit() {
  overlimitText.value = '最多只能选择 2 项';
}
</script>

<template>
  <view class="component-demo select-list-demo">
    <demo-block title="单选">
      <lk-select-list v-model="singleValue" :options="planOptions" />
      <text class="select-list-demo__value">当前：{{ singleValue }}</text>
    </demo-block>

    <demo-block title="单行文本">
      <lk-select-list v-model="singleValue" :options="textOnlyOptions" size="sm" />
    </demo-block>

    <demo-block title="多选">
      <lk-select-list v-model="multiValue" multiple :options="noticeOptions" />
      <text class="select-list-demo__value">当前：{{ multiValue.join('、') }}</text>
    </demo-block>

    <demo-block title="最大可选数">
      <lk-select-list
        v-model="maxValue"
        multiple
        :max="2"
        :options="channelOptions"
        @overlimit="onOverlimit"
      />
      <text class="select-list-demo__value">{{
        overlimitText || `当前：${maxValue.join('、')}`
      }}</text>
    </demo-block>

    <demo-block title="仅边框选中态">
      <lk-select-list v-model="borderOnlyValue" :options="planOptions" :selected-bg="false" />
    </demo-block>

    <demo-block title="仅背景选中态">
      <lk-select-list v-model="bgOnlyValue" :options="periodOptions" :selected-border="false" />
    </demo-block>

    <demo-block title="隐藏右侧图标">
      <lk-select-list v-model="noIconValue" multiple :options="benefitOptions" :show-icon="false" />
    </demo-block>

    <demo-block title="两列网格">
      <lk-select-list
        v-model="gridValue"
        multiple
        :columns="2"
        :options="benefitOptions"
        :selected-border="false"
      />
      <text class="select-list-demo__value">当前：{{ gridValue.join('、') }}</text>
    </demo-block>

    <demo-block title="自定义项圆角">
      <lk-select-list v-model="radiusValue" :options="periodOptions" item-radius="32rpx" />
    </demo-block>

    <demo-block title="自定义选中颜色">
      <lk-select-list v-model="customColorValue" :options="taskOptions" active-color="#14b8a6" />
    </demo-block>

    <demo-block title="整体禁用">
      <lk-select-list v-model="singleValue" :options="planOptions" disabled size="sm" />
    </demo-block>
  </view>
</template>

<style scoped lang="scss">
.select-list-demo {
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
