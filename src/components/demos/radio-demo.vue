<script setup lang="ts">
import { ref } from 'vue';
import LkRadioGroup from '@/uni_modules/lucky-ui/components/lk-radio/lk-radio-group.vue';
import LkRadio from '@/uni_modules/lucky-ui/components/lk-radio/lk-radio.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const value1 = ref('1');
const value2 = ref('1');
const value2_1 = ref('1');
const value3 = ref('medium');
const value4 = ref('1');
const value5 = ref('1');
const value5_1 = ref('1');
const value6 = ref('1');
const value7 = ref('1');
const value7_1 = ref('1');
const value7_2 = ref('1');
const value8 = ref('option1');
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <lk-radio-group v-model="value1">
        <lk-radio label="1">选项一</lk-radio>
        <lk-radio label="2">选项二</lk-radio>
        <lk-radio label="3">选项三</lk-radio>
      </lk-radio-group>
    </demo-block>

    <demo-block title="禁用状态">
      <lk-radio-group v-model="value2">
        <lk-radio label="1">正常</lk-radio>
        <lk-radio label="2" disabled>禁用</lk-radio>
        <lk-radio label="3">正常</lk-radio>
      </lk-radio-group>
      <view style="margin-top: 20rpx">
        <lk-radio-group v-model="value2_1" disabled>
          <lk-radio label="1">全部禁用</lk-radio>
          <lk-radio label="2">全部禁用</lk-radio>
          <lk-radio label="3">全部禁用</lk-radio>
        </lk-radio-group>
      </view>
    </demo-block>

    <demo-block title="纵向排列">
      <lk-radio-group v-model="value3" direction="column">
        <lk-radio label="small">小</lk-radio>
        <lk-radio label="medium">中</lk-radio>
        <lk-radio label="large">大</lk-radio>
      </lk-radio-group>
    </demo-block>

    <demo-block title="勾选样式">
      <lk-radio-group v-model="value4" icon-type="check">
        <lk-radio label="1">选项一</lk-radio>
        <lk-radio label="2">选项二</lk-radio>
        <lk-radio label="3">选项三</lk-radio>
      </lk-radio-group>
    </demo-block>

    <demo-block title="方形样式">
      <lk-radio-group v-model="value5" shape="square">
        <lk-radio label="1">方形圆点</lk-radio>
        <lk-radio label="2">方形圆点</lk-radio>
        <lk-radio label="3">方形圆点</lk-radio>
      </lk-radio-group>
      <view style="margin-top: 20rpx">
        <lk-radio-group v-model="value5_1" shape="square" icon-type="check">
          <lk-radio label="1">方形勾选</lk-radio>
          <lk-radio label="2">方形勾选</lk-radio>
          <lk-radio label="3">方形勾选</lk-radio>
        </lk-radio-group>
      </view>
    </demo-block>

    <demo-block title="自定义图标">
      <lk-radio-group v-model="value6">
        <lk-radio label="1">
          <template #icon="{ checked }">
            <lk-icon :name="checked ? 'heart-fill' : 'heart'" />
          </template>
          爱心
        </lk-radio>
        <lk-radio label="2">
          <template #icon="{ checked }">
            <lk-icon :name="checked ? 'star-fill' : 'star'" />
          </template>
          星星
        </lk-radio>
        <lk-radio label="3">
          <template #icon="{ checked }">
            <lk-icon :name="checked ? 'check-circle-fill' : 'check-circle'" />
          </template>
          圆圈
        </lk-radio>
      </lk-radio-group>
    </demo-block>

    <demo-block title="不同尺寸">
      <lk-radio-group v-model="value7" size="sm">
        <lk-radio label="1">小号</lk-radio>
        <lk-radio label="2">小号</lk-radio>
      </lk-radio-group>
      <view style="margin-top: 20rpx">
        <lk-radio-group v-model="value7_1" size="md">
          <lk-radio label="1">中号</lk-radio>
          <lk-radio label="2">中号</lk-radio>
        </lk-radio-group>
      </view>
      <view style="margin-top: 20rpx">
        <lk-radio-group v-model="value7_2" size="lg">
          <lk-radio label="1">大号</lk-radio>
          <lk-radio label="2">大号</lk-radio>
        </lk-radio-group>
      </view>
    </demo-block>

    <demo-block title="组合示例">
      <lk-radio-group v-model="value8" direction="column" shape="square" icon-type="check">
        <lk-radio label="option1">纵向 + 方形 + 勾选</lk-radio>
        <lk-radio label="option2">纵向 + 方形 + 勾选</lk-radio>
        <lk-radio label="option3">纵向 + 方形 + 勾选</lk-radio>
      </lk-radio-group>
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
</style>
