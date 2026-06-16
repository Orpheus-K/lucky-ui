<script setup lang="ts">
import { ref, computed } from 'vue';
import LkCheckboxGroup from '@/uni_modules/lucky-ui/components/lk-checkbox/lk-checkbox-group.vue';
import LkCheckbox from '@/uni_modules/lucky-ui/components/lk-checkbox/lk-checkbox.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const value1 = ref(['1']);
const value2 = ref(['1']);
const value2_1 = ref(['1']);
const value3 = ref(['1', '2']);
const value4 = ref(['1']);
const value5 = ref(['1', '2']);
const value6 = ref(['1']);
const value6_1 = ref(['1', '2']);
const value7 = ref(['1']);
const value7_1 = ref(['1']);
const value8 = ref(['1']);
const value8_1 = ref(['1']);
const value8_2 = ref(['1']);
const value9 = ref(['1', '2']);

const isAllSelected = computed(() => value3.value.length === 4);
const isIndeterminate = computed(() => value3.value.length > 0 && value3.value.length < 4);

const handleCheckAll = (checked: boolean) => {
  value3.value = checked ? ['1', '2', '3', '4'] : [];
};
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <lk-checkbox-group v-model="value1">
        <lk-checkbox label="1">选项一</lk-checkbox>
        <lk-checkbox label="2">选项二</lk-checkbox>
        <lk-checkbox label="3">选项三</lk-checkbox>
      </lk-checkbox-group>
    </demo-block>

    <demo-block title="禁用状态">
      <lk-checkbox-group v-model="value2">
        <lk-checkbox label="1">正常</lk-checkbox>
        <lk-checkbox label="2" disabled>禁用</lk-checkbox>
        <lk-checkbox label="3">正常</lk-checkbox>
      </lk-checkbox-group>
      <view style="margin-top: 20rpx">
        <lk-checkbox-group v-model="value2_1" disabled>
          <lk-checkbox label="1">全部禁用</lk-checkbox>
          <lk-checkbox label="2">全部禁用</lk-checkbox>
          <lk-checkbox label="3">全部禁用</lk-checkbox>
        </lk-checkbox-group>
      </view>
    </demo-block>

    <demo-block title="纵向排列">
      <lk-checkbox-group v-model="value4" direction="column">
        <lk-checkbox label="1">选项一</lk-checkbox>
        <lk-checkbox label="2">选项二</lk-checkbox>
        <lk-checkbox label="3">选项三</lk-checkbox>
      </lk-checkbox-group>
    </demo-block>

    <demo-block title="圆点样式">
      <lk-checkbox-group v-model="value5" icon-type="dot">
        <lk-checkbox label="1">选项一</lk-checkbox>
        <lk-checkbox label="2">选项二</lk-checkbox>
        <lk-checkbox label="3">选项三</lk-checkbox>
      </lk-checkbox-group>
    </demo-block>

    <demo-block title="圆形样式">
      <lk-checkbox-group v-model="value6" shape="circle">
        <lk-checkbox label="1">圆形勾选</lk-checkbox>
        <lk-checkbox label="2">圆形勾选</lk-checkbox>
        <lk-checkbox label="3">圆形勾选</lk-checkbox>
      </lk-checkbox-group>
      <view style="margin-top: 20rpx">
        <lk-checkbox-group v-model="value6_1" shape="circle" icon-type="dot">
          <lk-checkbox label="1">圆形圆点</lk-checkbox>
          <lk-checkbox label="2">圆形圆点</lk-checkbox>
          <lk-checkbox label="3">圆形圆点</lk-checkbox>
        </lk-checkbox-group>
      </view>
    </demo-block>

    <demo-block title="自定义图标">
      <lk-checkbox-group v-model="value7">
        <lk-checkbox label="1">
          <template #icon="{ checked }">
            <lk-icon :name="checked ? 'heart-fill' : 'heart'" />
          </template>
          爱心
        </lk-checkbox>
        <lk-checkbox label="2">
          <template #icon="{ checked }">
            <lk-icon :name="checked ? 'star-fill' : 'star'" />
          </template>
          星星
        </lk-checkbox>
        <lk-checkbox label="3">
          <template #icon="{ checked }">
            <lk-icon :name="checked ? 'check-circle-fill' : 'check-circle'" />
          </template>
          圆圈
        </lk-checkbox>
      </lk-checkbox-group>

      <view style="margin-top: 20rpx">
        <text style="font-size: 24rpx; color: #999; margin-bottom: 12rpx; display: block"
          >使用 Emoji</text
        >
        <lk-checkbox-group v-model="value7_1">
          <lk-checkbox label="1">
            <template #icon>
              <text>🎉</text>
            </template>
            庆祝
          </lk-checkbox>
          <lk-checkbox label="2">
            <template #icon>
              <text>🔥</text>
            </template>
            火热
          </lk-checkbox>
          <lk-checkbox label="3">
            <template #icon>
              <text>💎</text>
            </template>
            钻石
          </lk-checkbox>
        </lk-checkbox-group>
      </view>
    </demo-block>

    <demo-block title="不同尺寸">
      <lk-checkbox-group v-model="value8" size="sm">
        <lk-checkbox label="1">小号</lk-checkbox>
        <lk-checkbox label="2">小号</lk-checkbox>
      </lk-checkbox-group>
      <view style="margin-top: 20rpx">
        <lk-checkbox-group v-model="value8_1" size="md">
          <lk-checkbox label="1">中号</lk-checkbox>
          <lk-checkbox label="2">中号</lk-checkbox>
        </lk-checkbox-group>
      </view>
      <view style="margin-top: 20rpx">
        <lk-checkbox-group v-model="value8_2" size="lg">
          <lk-checkbox label="1">大号</lk-checkbox>
          <lk-checkbox label="2">大号</lk-checkbox>
        </lk-checkbox-group>
      </view>
    </demo-block>

    <demo-block title="全选功能">
      <view class="checkbox-all">
        <lk-checkbox
          :model-value="isAllSelected"
          :indeterminate="isIndeterminate"
          @change="handleCheckAll"
        >
          全选
        </lk-checkbox>
      </view>
      <lk-checkbox-group v-model="value3">
        <lk-checkbox label="1">选项一</lk-checkbox>
        <lk-checkbox label="2">选项二</lk-checkbox>
        <lk-checkbox label="3">选项三</lk-checkbox>
        <lk-checkbox label="4">选项四</lk-checkbox>
      </lk-checkbox-group>
    </demo-block>

    <demo-block title="组合示例">
      <lk-checkbox-group v-model="value9" direction="column" shape="circle" icon-type="dot">
        <lk-checkbox label="1">纵向 + 圆形 + 圆点</lk-checkbox>
        <lk-checkbox label="2">纵向 + 圆形 + 圆点</lk-checkbox>
        <lk-checkbox label="3">纵向 + 圆形 + 圆点</lk-checkbox>
      </lk-checkbox-group>
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

.checkbox-all {
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid var(--lk-color-border);
}
</style>
