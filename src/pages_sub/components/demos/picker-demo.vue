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
const popupEvents = ref<string[]>([]);
const inlineValue = ref('green');
const inlineDisplay = computed(
  () => columns.find(option => option.value === inlineValue.value)?.label || ''
);
const inlineEvents = ref<string[]>([]);

function recordInlinePick(nextValue: string | number | (string | number)[]) {
  inlineEvents.value.push(`pick:${String(nextValue)}`);
}

function recordInlineUpdate(nextValue: string | number | (string | number)[]) {
  inlineEvents.value.push(`update:${String(nextValue)}`);
}

function recordInlineChange(nextValue: string | number | (string | number)[]) {
  inlineEvents.value.push(`change:${String(nextValue)}`);
}

function onConfirm(v: string | number | (string | number)[]) {
  popupEvents.value.push(`confirm:${String(v)}`);
  const selected = Array.isArray(v) ? undefined : columns.find(o => o.value === v);
  uni.showToast({ title: `已选择: ${selected?.label || display.value}`, icon: 'none' });
}

function openSinglePicker() {
  popupEvents.value = [];
  show.value = true;
}

function recordPopupEvent(name: string, nextValue?: unknown) {
  popupEvents.value.push(nextValue === undefined ? name : `${name}:${String(nextValue)}`);
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
    <demo-block title="内联即时提交">
      <view id="picker-inline-value" class="result picker-inline-value">
        value={{ inlineValue }}；label={{ inlineDisplay }}；events={{
          inlineEvents.join(' > ') || 'none'
        }}
      </view>
      <lk-picker
        id="picker-inline-demo"
        v-model="inlineValue"
        inline
        mode="single"
        title="选择颜色（即时生效）"
        :columns="columns"
        @pick="recordInlinePick"
        @update:model-value="recordInlineUpdate"
        @change="recordInlineChange"
      />
    </demo-block>

    <demo-block title="单列选择器">
      <lk-button id="picker-popup-open" @click="openSinglePicker">选择颜色</lk-button>
      <view id="picker-popup-state" class="result">
        value={{ value }}；label={{ display }}；visible={{ show }}；events={{
          popupEvents.join(' > ') || 'none'
        }}
      </view>
      <lk-picker
        id="picker-popup-demo"
        v-model:visible="show"
        v-model="value"
        mode="single"
        title="请选择颜色"
        :columns="columns"
        @open="recordPopupEvent('open')"
        @pick="nextValue => recordPopupEvent('pick', nextValue)"
        @update:model-value="nextValue => recordPopupEvent('update', nextValue)"
        @change="nextValue => recordPopupEvent('change', nextValue)"
        @confirm="onConfirm"
        @cancel="nextValue => recordPopupEvent('cancel', nextValue)"
        @update:visible="nextVisible => recordPopupEvent('visible', nextVisible)"
        @close="recordPopupEvent('close')"
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
