<script setup lang="ts">
import { ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkFormGroup from '@/uni_modules/lucky-ui/components/lk-form-group/lk-form-group.vue';
import LkInput from '@/uni_modules/lucky-ui/components/lk-input/lk-input.vue';
import LkStepper from '@/uni_modules/lucky-ui/components/lk-stepper/lk-stepper.vue';
import LkSwitch from '@/uni_modules/lucky-ui/components/lk-switch/lk-switch.vue';
import LkTag from '@/uni_modules/lucky-ui/components/lk-tag/lk-tag.vue';

const username = ref('Lucky');
const noticeEnabled = ref(true);
const seats = ref(3);
</script>

<template>
  <view class="component-demo form-group-demo">
    <demo-block title="基础分组">
      <lk-form-group title="账户信息">
        <view class="form-group-demo__row">
          <text class="form-group-demo__label">用户名</text>
          <lk-input v-model="username" placeholder="请输入用户名" input-align="right" borderless />
        </view>
        <view class="form-group-demo__row">
          <text class="form-group-demo__label">状态</text>
          <lk-tag type="light" color="var(--lk-color-success)">已启用</lk-tag>
        </view>
      </lk-form-group>
    </demo-block>

    <demo-block title="卡片模式">
      <lk-form-group title="团队设置" card>
        <view class="form-group-demo__row">
          <text class="form-group-demo__label">通知</text>
          <lk-switch v-model="noticeEnabled" />
        </view>
        <view class="form-group-demo__row">
          <text class="form-group-demo__label">席位数</text>
          <lk-stepper v-model="seats" :min="1" :max="12" />
        </view>
      </lk-form-group>
    </demo-block>

    <demo-block title="标题插槽与自定义样式">
      <lk-form-group custom-class="form-group-demo__custom" :custom-style="{ marginTop: '12rpx' }">
        <template #title>
          <view class="form-group-demo__title">
            <text>高级选项</text>
            <lk-tag size="sm" type="outline" color="var(--lk-color-primary)">slot</lk-tag>
          </view>
        </template>

        <view class="form-group-demo__metric">
          <text class="form-group-demo__label">安全等级</text>
          <text class="form-group-demo__value">高</text>
        </view>
      </lk-form-group>
    </demo-block>
  </view>
</template>

<style scoped lang="scss">
.component-demo {
  width: 100%;
  display: flex;
  flex-direction: column;

  > :not(:first-child) {
    margin-top: 32rpx;
  }
}

.form-group-demo {
  &__row,
  &__metric,
  &__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24rpx;
  }

  &__row,
  &__metric {
    min-height: 96rpx;
    padding: 0 var(--lk-spacing-md);
    border-bottom: 1rpx solid var(--lk-border-light);
  }

  &__row:last-child,
  &__metric:last-child {
    border-bottom: 0;
  }

  &__label {
    flex: 0 0 auto;
    font-size: var(--lk-font-size-base);
    color: var(--lk-text-primary);
  }

  &__value {
    font-size: var(--lk-font-size-base);
    color: var(--lk-color-success);
    font-weight: 600;
  }

  &__title {
    width: 100%;
    font-size: var(--lk-font-size-base);
    color: var(--lk-text-secondary);
    font-weight: 600;
  }
}
</style>
