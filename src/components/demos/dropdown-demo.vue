<script setup lang="ts">
import { ref } from 'vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkDropdown from '@/uni_modules/lucky-ui/components/lk-dropdown/lk-dropdown.vue';
import LkDropdownDivider from '@/uni_modules/lucky-ui/components/lk-dropdown/lk-dropdown-divider.vue';
import LkDropdownItem from '@/uni_modules/lucky-ui/components/lk-dropdown/lk-dropdown-item.vue';
import type {
  DropdownMenuAlign,
  DropdownPlacement,
} from '@/uni_modules/lucky-ui/components/lk-dropdown/dropdown.props';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const cornerValue = ref('top-left-view');
const quickActions = ['arrow-right', 'star', 'download', 'info-circle', 'arrow-clockwise'] as const;

type DropdownCornerDemo = {
  key: string;
  label: string;
  className: string;
  placement: DropdownPlacement;
  menuAlign: DropdownMenuAlign;
};

const cornerDemos: DropdownCornerDemo[] = [
  {
    key: 'top-left',
    label: '左上',
    className: 'corner-trigger corner-trigger--top-left',
    placement: 'bottom',
    menuAlign: 'start',
  },
  {
    key: 'top-right',
    label: '右上',
    className: 'corner-trigger corner-trigger--top-right',
    placement: 'bottom',
    menuAlign: 'end',
  },
  {
    key: 'bottom-left',
    label: '左下',
    className: 'corner-trigger corner-trigger--bottom-left',
    placement: 'top',
    menuAlign: 'start',
  },
  {
    key: 'bottom-right',
    label: '右下',
    className: 'corner-trigger corner-trigger--bottom-right',
    placement: 'top',
    menuAlign: 'end',
  },
];
</script>

<template>
  <view class="component-demo dropdown-demo">
    <demo-block title="四角触发">
      <view class="corner-stage">
        <view
          v-for="item in cornerDemos"
          :key="item.key"
          :class="item.className"
        >
          <lk-dropdown
            :placement="item.placement"
            :menu-align="item.menuAlign"
            :selectable="false"
            menu-fit-content
            @select="cornerValue = String($event.name)"
          >
            <lk-button variant="outline">
              {{ item.label }}
            </lk-button>
            <template #menu-top>
              <view class="dropdown-quick-actions">
                <view
                  v-for="name in quickActions"
                  :key="name"
                  class="dropdown-quick-actions__item"
                >
                  <lk-icon :name="name" size="34" />
                </view>
              </view>
              <lk-dropdown-divider />
            </template>
            <template #menu>
              <lk-dropdown-item
                :name="`${item.key}-view`"
                icon="plus-square"
                :icon-size="40"
              >
                打开新的标签页
              </lk-dropdown-item>
              <lk-dropdown-item
                :name="`${item.key}-edit`"
                icon="grid"
                :icon-size="40"
                width="330"
              >
                向新分组添加标签页
              </lk-dropdown-item>
              <lk-dropdown-divider />
              <lk-dropdown-item
                :name="`${item.key}-remove`"
                icon="clock-history"
                :icon-size="40"
              >
                历史记录
              </lk-dropdown-item>
              <lk-dropdown-item :name="`${item.key}-download`" icon="download" :icon-size="40">
                下载内容
              </lk-dropdown-item>
              <lk-dropdown-divider />
              <lk-dropdown-item :name="`${item.key}-settings`" icon="gear" :icon-size="40">
                设置
              </lk-dropdown-item>
            </template>
            <template #menu-bottom>
              <lk-dropdown-divider />
              <lk-dropdown-item :name="`${item.key}-help`" icon="question-circle" :icon-size="40">
                帮助和反馈
              </lk-dropdown-item>
            </template>
          </lk-dropdown>
        </view>
      </view>
      <text class="demo-result">当前：{{ cornerValue }}</text>
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

.corner-stage {
  position: relative;
  box-sizing: border-box;
  min-height: 520rpx;
  width: 100%;
  border: 2rpx dashed var(--lk-color-border);
  border-radius: var(--lk-radius-md);
}

.corner-trigger {
  position: absolute;
}

.corner-trigger--top-left {
  top: 20rpx;
  left: 20rpx;
}

.corner-trigger--top-right {
  top: 20rpx;
  right: 20rpx;
}

.corner-trigger--bottom-left {
  bottom: 20rpx;
  left: 20rpx;
}

.corner-trigger--bottom-right {
  right: 20rpx;
  bottom: 20rpx;
}

.dropdown-quick-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 4rpx;
}

.dropdown-quick-actions__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  color: var(--lk-text-secondary);
  background: var(--lk-fill-1);
  border-radius: var(--lk-radius-full);
}

.demo-result {
  display: block;
  margin-top: 18rpx;
  color: var(--lk-text-secondary);
  font-size: 24rpx;
}
</style>
