<script setup lang="ts">
import { computed, ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkPicker from '@/uni_modules/lucky-ui/components/lk-picker/lk-picker.vue';

// 单列选择器
const show = ref(false);
const value = ref('green');
const columns = [
  { label: '红色', value: 'red' },
  { label: '绿色', value: 'green' },
  { label: '蓝色', value: 'blue' },
  { label: '黄色', value: 'yellow' },
  { label: '紫色', value: 'purple' },
];
const display = computed(() => {
  const m = new Map(columns.map(o => [o.value, o.label]));
  return m.get(value.value) || '';
});

function onConfirm(v: string | number | (string | number)[]) {
  const selected = Array.isArray(v) ? undefined : columns.find(o => o.value === v);
  uni.showToast({ title: `已选择: ${selected?.label || display.value}`, icon: 'none' });
}

// 多列选择器
const show2 = ref(false);
const value2 = ref<(string | number)[]>(['tue', 'pm']);
const columns2 = [
  [
    { label: '周一', value: 'mon' },
    { label: '周二', value: 'tue' },
    { label: '周三', value: 'wed' },
    { label: '周四', value: 'thu' },
    { label: '周五', value: 'fri' },
  ],
  [
    { label: '上午', value: 'am' },
    { label: '下午', value: 'pm' },
    { label: '晚上', value: 'night' },
  ],
];

// 级联选择器
const show3 = ref(false);
const value3 = ref<(string | number)[]>([]);
const cascadeData = [
  {
    label: '电子产品',
    value: 'electronics',
    children: [
      {
        label: '手机',
        value: 'phone',
        children: [
          { label: 'iPhone', value: 'iphone' },
          { label: '华为', value: 'huawei' },
          { label: '小米', value: 'xiaomi' },
        ],
      },
      {
        label: '电脑',
        value: 'computer',
        children: [
          { label: 'MacBook', value: 'macbook' },
          { label: 'ThinkPad', value: 'thinkpad' },
        ],
      },
    ],
  },
  {
    label: '服装',
    value: 'clothing',
    children: [
      {
        label: '男装',
        value: 'men',
        children: [
          { label: 'T恤', value: 'tshirt' },
          { label: '牛仔裤', value: 'jeans' },
        ],
      },
      {
        label: '女装',
        value: 'women',
        children: [
          { label: '连衣裙', value: 'dress' },
          { label: '半身裙', value: 'skirt' },
        ],
      },
    ],
  },
];
const cascadeDisplay = computed(() => {
  if (!value3.value.length) return '未选择';
  return value3.value.join(' > ');
});
</script>

<template>
  <view class="component-demo">
    <demo-block title="单列选择器">
      <lk-button @click="show = true">选择颜色</lk-button>
      <view class="result">当前：{{ display }}</view>
      <lk-picker
        v-model:visible="show"
        v-model="value"
        mode="single"
        title="请选择颜色"
        :columns="columns"
        @confirm="onConfirm"
      />
    </demo-block>

    <demo-block title="多列选择器">
      <lk-button @click="show2 = true">选择日期时段</lk-button>
      <view class="result">当前：{{ value2.join(' / ') }}</view>
      <lk-picker
        v-model:visible="show2"
        v-model="value2"
        mode="multi"
        title="日期/时段"
        :columns="columns2"
      />
    </demo-block>

    <demo-block title="级联选择器">
      <lk-button @click="show3 = true">选择分类</lk-button>
      <view class="result">当前：{{ cascadeDisplay }}</view>
      <lk-picker
        v-model:visible="show3"
        v-model="value3"
        mode="cascade"
        title="选择分类"
        :columns="cascadeData"
      />
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

.result {
  margin-top: 16rpx;
  font-size: 28rpx;
  color: var(--lk-text-secondary);
}
</style>
