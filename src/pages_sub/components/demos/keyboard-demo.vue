<script setup lang="ts">
import { ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkKeyboard from '@/uni_modules/lucky-ui/components/lk-keyboard/lk-keyboard.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';
import type {
  KeyboardKey,
  KeyboardType,
} from '@/uni_modules/lucky-ui/components/lk-keyboard/keyboard.props';

const inputValue = ref('');
const keyboardVisible = ref(false);
const keyboardType = ref<KeyboardType>('number');
const keyboardTitle = ref('');
const keyboardShowDot = ref(false);
const keyboardRandom = ref(false);
const keyboardMaxLength = ref(0);
const keyboardShowClose = ref(false);
const keyboardShowConfirm = ref(false);
const keyboardKeys = ref<KeyboardKey[][]>([]);

const customKeyboardKeys: KeyboardKey[][] = [
  [
    { text: 'A', value: 'A' },
    { text: 'B', value: 'B' },
    { text: 'C', value: 'C' },
  ],
  [
    { text: 'VIP', value: 'VIP', flex: 2 },
    { text: '', type: 'delete' },
  ],
];

interface KeyboardOptions {
  title?: string;
  showDot?: boolean;
  random?: boolean;
  maxLength?: number;
  showClose?: boolean;
  showConfirm?: boolean;
  keys?: KeyboardKey[][];
}

function showKeyboard(type: KeyboardType, options: KeyboardOptions = {}) {
  keyboardType.value = type;
  keyboardTitle.value = options.title || '';
  keyboardShowDot.value = options.showDot || false;
  keyboardRandom.value = options.random || false;
  keyboardMaxLength.value = options.maxLength || 0;
  keyboardShowClose.value = options.showClose || false;
  keyboardShowConfirm.value = options.showConfirm || false;
  keyboardKeys.value = options.keys || [];
  keyboardVisible.value = true;
}

function showAmountKeyboard() {
  showKeyboard('number');
}

function onInput(key: string) {
  console.log('输入:', key);
}

function onDelete() {
  console.log('删除');
}

function onConfirm(value: string) {
  console.log('确认:', value);
  uni.showToast({
    title: `输入完成: ${value}`,
    icon: 'none',
  });
}

function onClose() {
  console.log('关闭');
}
</script>

<template>
  <view class="component-demo">
    <!-- 输入展示区 -->
    <view class="input-display" @click="showAmountKeyboard">
      <view class="input-label">当前输入</view>
      <view class="input-value" :class="{ 'is-placeholder': !inputValue }">
        {{ inputValue || '点击输入' }}
      </view>
    </view>

    <demo-block title="数字键盘">
      <view class="desc">标准数字键盘，适用于金额、数量等输入场景。</view>
      <lk-space wrap>
        <lk-button size="sm" @click="showKeyboard('number')">数字键盘</lk-button>
        <lk-button size="sm" @click="showKeyboard('number', { showDot: true })">带小数点</lk-button>
        <lk-button size="sm" @click="showKeyboard('number', { random: true })">随机排列</lk-button>
      </lk-space>
    </demo-block>

    <demo-block title="身份证键盘">
      <view class="desc">支持输入身份证号码，包含数字和 X。</view>
      <lk-space wrap>
        <lk-button size="sm" @click="showKeyboard('idcard')">身份证键盘</lk-button>
      </lk-space>
    </demo-block>

    <demo-block title="车牌号键盘">
      <view class="desc">支持输入车牌号，包含省份简称和字母数字。</view>
      <lk-space wrap>
        <lk-button size="sm" @click="showKeyboard('plate')">车牌号键盘</lk-button>
      </lk-space>
    </demo-block>

    <demo-block title="标题与操作">
      <view class="desc">默认只显示键盘；按需开启标题栏的收起与确认操作。</view>
      <lk-space wrap>
        <lk-button
          size="sm"
          @click="
            showKeyboard('number', {
              title: '输入金额',
              showClose: true,
              showConfirm: true,
            })
          "
          >完整标题栏</lk-button
        >
        <lk-button size="sm" @click="showKeyboard('number', { title: '输入密码' })"
          >仅标题</lk-button
        >
      </lk-space>
    </demo-block>

    <demo-block title="限制输入长度">
      <view class="desc">可以限制最大输入长度。</view>
      <lk-space wrap>
        <lk-button size="sm" @click="showKeyboard('number', { maxLength: 6 })">最多6位</lk-button>
        <lk-button size="sm" @click="showKeyboard('idcard', { maxLength: 18 })"
          >身份证18位</lk-button
        >
      </lk-space>
    </demo-block>

    <demo-block title="自定义布局">
      <view class="desc">自定义内容仍沿用统一的纯色面板与无键帽视觉。</view>
      <lk-space wrap>
        <lk-button
          size="sm"
          @click="showKeyboard('custom', { title: 'Quick input', keys: customKeyboardKeys })"
        >
          Custom keyboard
        </lk-button>
      </lk-space>
    </demo-block>

    <!-- 键盘组件 -->
    <lk-keyboard
      v-model:visible="keyboardVisible"
      v-model="inputValue"
      :type="keyboardType"
      :title="keyboardTitle"
      :show-dot="keyboardShowDot"
      :random="keyboardRandom"
      :max-length="keyboardMaxLength"
      :show-close="keyboardShowClose"
      :show-confirm="keyboardShowConfirm"
      :keys="keyboardKeys"
      @input="onInput"
      @delete="onDelete"
      @confirm="onConfirm"
      @close="onClose"
    />
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

.input-display {
  background: var(--lk-bg-elevated);
  border-radius: var(--lk-radius-lg);
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.input-label {
  font-size: var(--lk-font-size-sm);
  color: var(--lk-text-secondary);
  margin-bottom: 12rpx;
}

.input-value {
  font-size: 48rpx;
  font-weight: 600;
  color: var(--lk-text-primary);
  min-height: 64rpx;
  line-height: 64rpx;
  word-break: break-all;

  &.is-placeholder {
    color: var(--lk-text-tertiary);
    font-weight: 400;
    font-size: var(--lk-font-size-lg);
  }
}

.desc {
  font-size: 24rpx;
  color: var(--lk-text-secondary);
  margin-bottom: 16rpx;
}
</style>
