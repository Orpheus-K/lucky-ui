<script setup lang="ts">
import { ref } from 'vue';
import LkCellGroup from '@/uni_modules/lucky-ui/components/lk-cell/lk-cell-group.vue';
import LkCell from '@/uni_modules/lucky-ui/components/lk-cell/lk-cell.vue';
import LkSwitch from '@/uni_modules/lucky-ui/components/lk-switch/lk-switch.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const notification = ref(true);
const sound = ref(false);

const handleClick = () => {
  uni.showToast({
    title: '点击了单元格',
    icon: 'none',
  });
};
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <lk-cell-group>
        <lk-cell title="单元格" value="内容" />
        <lk-cell title="单元格" value="内容" />
      </lk-cell-group>
    </demo-block>

    <demo-block title="带图标">
      <lk-cell-group>
        <lk-cell title="个人信息" icon="person-fill" arrow />
        <lk-cell title="设置" icon="gear-fill" arrow />
        <lk-cell title="帮助中心" icon="question-circle-fill" arrow />
      </lk-cell-group>
    </demo-block>

    <demo-block title="可点击 (波纹效果)">
      <lk-cell-group>
        <lk-cell title="默认波纹" clickable @click="handleClick" />
        <lk-cell title="禁用波纹" clickable :ripple="false" @click="handleClick" />
      </lk-cell-group>
    </demo-block>

    <demo-block title="分组标题">
      <lk-cell-group title="基本设置">
        <lk-cell title="通知" icon="bell-fill">
          <template #value>
            <lk-switch v-model="notification" />
          </template>
        </lk-cell>
        <lk-cell title="声音" icon="volume-up-fill">
          <template #value>
            <lk-switch v-model="sound" />
          </template>
        </lk-cell>
      </lk-cell-group>
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
