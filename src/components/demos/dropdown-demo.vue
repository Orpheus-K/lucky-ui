<script setup lang="ts">
import { ref } from 'vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkDropdown from '@/uni_modules/lucky-ui/components/lk-dropdown/lk-dropdown.vue';
import LkDropdownItem from '@/uni_modules/lucky-ui/components/lk-dropdown/lk-dropdown-item.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const sortValue = ref('latest');
const statusValue = ref('all');
const densityValue = ref('comfortable');

const toast = (value: string) => {
  uni.showToast({
    title: value,
    icon: 'none',
  });
};
</script>

<template>
  <view class="component-demo dropdown-demo">
    <demo-block title="操作菜单">
      <lk-dropdown>
        <lk-button type="primary">
          更多操作
          <lk-icon class="dropdown-demo__chevron" name="chevron-down" />
        </lk-button>
        <template #menu>
          <lk-dropdown-item name="edit" icon="pencil-square" @click="toast('编辑')">
            编辑
          </lk-dropdown-item>
          <lk-dropdown-item name="copy" icon="files" @click="toast('复制')">
            复制
          </lk-dropdown-item>
          <lk-dropdown-item name="delete" icon="trash" @click="toast('删除')">
            删除
          </lk-dropdown-item>
        </template>
      </lk-dropdown>
    </demo-block>

    <demo-block title="筛选排序">
      <view class="filter-row">
        <lk-dropdown v-model="sortValue">
          <lk-button variant="outline">
            排序
            <lk-icon class="dropdown-demo__chevron" name="chevron-down" />
          </lk-button>
          <template #menu>
            <lk-dropdown-item name="latest">最新创建</lk-dropdown-item>
            <lk-dropdown-item name="priority">优先级最高</lk-dropdown-item>
            <lk-dropdown-item name="progress">进度最快</lk-dropdown-item>
          </template>
        </lk-dropdown>

        <lk-dropdown v-model="statusValue">
          <lk-button variant="outline">
            状态
            <lk-icon class="dropdown-demo__chevron" name="chevron-down" />
          </lk-button>
          <template #menu>
            <lk-dropdown-item name="all">全部状态</lk-dropdown-item>
            <lk-dropdown-item name="active">进行中</lk-dropdown-item>
            <lk-dropdown-item name="done">已完成</lk-dropdown-item>
          </template>
        </lk-dropdown>
      </view>
      <text class="demo-result">当前：{{ sortValue }} / {{ statusValue }}</text>
    </demo-block>

    <demo-block title="禁用与保留展开">
      <lk-dropdown v-model="densityValue" :close-on-select="false">
        <lk-button>
          列表密度
          <lk-icon class="dropdown-demo__chevron" name="chevron-down" />
        </lk-button>
        <template #menu>
          <lk-dropdown-item name="compact">紧凑</lk-dropdown-item>
          <lk-dropdown-item name="comfortable">舒适</lk-dropdown-item>
          <lk-dropdown-item name="spacious" disabled>宽松（未开放）</lk-dropdown-item>
        </template>
      </lk-dropdown>
    </demo-block>

    <demo-block title="位置与动画">
      <view class="placement-row">
        <lk-dropdown placement="top" animation-type="fade-down" :duration="220">
          <lk-button variant="outline">向上</lk-button>
          <template #menu>
            <lk-dropdown-item name="top-1">顶部菜单</lk-dropdown-item>
            <lk-dropdown-item name="top-2">次级操作</lk-dropdown-item>
          </template>
        </lk-dropdown>

        <lk-dropdown placement="right" animation-type="fade-left" :duration="220">
          <lk-button variant="outline">向右</lk-button>
          <template #menu>
            <lk-dropdown-item name="right-1">右侧菜单</lk-dropdown-item>
            <lk-dropdown-item name="right-2">详情入口</lk-dropdown-item>
          </template>
        </lk-dropdown>
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

.filter-row,
.placement-row {
  display: flex;
  align-items: center;
  > :not(:first-child) {
    margin-left: 20rpx;
  }
  flex-wrap: wrap;
}

.placement-row {
  min-height: 220rpx;
  align-items: center;
}

.demo-result {
  display: block;
  margin-top: 18rpx;
  color: var(--lk-text-secondary);
  font-size: 24rpx;
}

.dropdown-demo :deep(.lk-dropdown__menu) {
  min-width: 260rpx;
}

.dropdown-demo__chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  line-height: 1;
}
</style>
