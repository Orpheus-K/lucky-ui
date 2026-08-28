<script setup lang="ts">
import { ref } from 'vue';
import LkInput from '@/uni_modules/lucky-ui/components/lk-input/lk-input.vue';
import type { InputEventPayload } from '@/uni_modules/lucky-ui/components/lk-input/input.props';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const value1 = ref('');
const value2 = ref('');
const value3 = ref('');
const value4 = ref('');
const valueIdcard = ref('');
const valuePassword = ref('');
const value5 = ref('可清除的内容');
const value6 = ref('禁用状态');
const value7 = ref('');
const value8 = ref('');
const value9 = ref('');
const value10 = ref('');
const value11 = ref('');
const valueAlign1 = ref('');
const valueAlign2 = ref('');
const valueAlign3 = ref('');
const valueConfirm = ref('');
const confirmTip = ref('');
const valueSpacing = ref('');
const keyboardInfo = ref('');

function onConfirm() {
  confirmTip.value = `已触发确认：${valueConfirm.value}`;
}

function onKeyboardHeight(e: InputEventPayload) {
  const detail =
    typeof e === 'object' && e !== null && 'detail' in e
      ? (e.detail as { height?: number } | undefined)
      : undefined;
  const height = detail?.height ?? 0;
  keyboardInfo.value = height > 0 ? `当前软键盘高度：${height}px` : '键盘已收起';
}
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <lk-input v-model="value1" placeholder="请输入内容" />
    </demo-block>

    <demo-block title="输入类型">
      <lk-space direction="vertical" :gap="24" fill>
        <lk-input v-model="value2" type="text" placeholder="文本输入" />
        <lk-input v-model="value3" type="number" placeholder="数字输入" />
        <lk-input v-model="value4" type="digit" placeholder="带小数点的数字" />
        <lk-input v-model="valueIdcard" type="idcard" placeholder="身份证号" />
      </lk-space>
    </demo-block>

    <demo-block title="密码输入（可切换明文）">
      <lk-input v-model="valuePassword" type="password" show-password placeholder="请输入密码" />
    </demo-block>

    <demo-block title="清除按钮">
      <lk-input v-model="value5" clearable placeholder="可清除内容" />
    </demo-block>

    <demo-block title="禁用状态">
      <lk-input v-model="value6" disabled placeholder="禁用输入框" />
    </demo-block>

    <demo-block title="带图标">
      <lk-space direction="vertical" :gap="24" fill>
        <lk-input v-model="value7" placeholder="搜索">
          <template #prefix>
            <lk-icon name="search" size="32" />
          </template>
        </lk-input>
        <lk-input v-model="value8" placeholder="用户名">
          <template #prefix>
            <lk-icon name="person-fill" size="32" />
          </template>
        </lk-input>
        <lk-input v-model="value10" prefix-icon="envelope-fill" placeholder="邮箱" />
        <lk-input v-model="value11" suffix-icon="calendar-fill" placeholder="选择日期" />
      </lk-space>
    </demo-block>

    <demo-block title="文字对齐方式">
      <lk-space direction="vertical" :gap="24" fill>
        <lk-input v-model="valueAlign1" input-align="left" placeholder="左对齐（默认）" />
        <lk-input v-model="valueAlign2" input-align="center" placeholder="居中对齐" />
        <lk-input
          v-model="valueAlign2"
          input-align="center"
          suffix-icon="search"
          placeholder="居中对齐 + 右侧图标"
        />
        <lk-input v-model="valueAlign3" input-align="right" placeholder="右对齐" />
      </lk-space>
    </demo-block>

    <demo-block title="确认按钮类型">
      <lk-input
        v-model="valueConfirm"
        confirm-type="search"
        placeholder="搜索（回车键显示搜索）"
        @confirm="onConfirm"
      />
      <text class="demo-tip">{{ confirmTip }}</text>
    </demo-block>

    <demo-block title="字数统计">
      <lk-input v-model="value9" :maxlength="20" show-word-limit placeholder="最多20个字" />
    </demo-block>

    <demo-block title="页面键盘推顶与安全间距 (cursor-spacing)">
      <lk-space direction="vertical" :gap="24" fill>
        <lk-input
          v-model="valueSpacing"
          :adjust-position="true"
          :cursor-spacing="24"
          placeholder="聚焦时页面上推并保持 24px 间距"
          @keyboardheightchange="onKeyboardHeight"
        />
        <text v-if="keyboardInfo" class="demo-tip">{{ keyboardInfo }}</text>
      </lk-space>
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

.demo-tip {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: var(--lk-text-secondary);
}

</style>
