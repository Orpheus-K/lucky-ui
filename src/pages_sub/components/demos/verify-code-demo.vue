<script setup lang="ts">
import { ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkVerifyCode from '@/uni_modules/lucky-ui/components/lk-verify-code/lk-verify-code.vue';

// 基础用法
const code1 = ref('');

// 不同长度
const code4 = ref('');
const code6 = ref('');
const code8 = ref('');

// 样式变体
const codeBox = ref('');
const codeUnderline = ref('');
const codeRounded = ref('');

// 密码模式
const codeMask = ref('');

// 状态展示
const codeDefault = ref('');
const codeError = ref('1234');
const codeSuccess = ref('5678');
const codeDisabled = ref('0000');

// 倒计时
const countdownRef = ref<InstanceType<typeof LkVerifyCode>>();
const codeCountdown = ref('');

// 自定义颜色
const codeCustom = ref('');

// 文本类型
const codeText = ref('');

// 方法调用
const methodRef = ref<InstanceType<typeof LkVerifyCode>>();
const codeMethod = ref('');

function onFinish(v: string) {
  uni.showToast({ title: `输入完成: ${v}`, icon: 'none' });
}

function onSend() {
  uni.showToast({ title: '验证码已发送', icon: 'none' });
}

function onResend() {
  uni.showToast({ title: '验证码已重新发送', icon: 'none' });
}

function onCountdownFinish(v: string) {
  uni.showToast({ title: `验证完成: ${v}`, icon: 'success' });
}

function handleFocus() {
  methodRef.value?.focus();
}

function handleBlur() {
  methodRef.value?.blur();
}

function handleClear() {
  methodRef.value?.clear();
}

function handleSetValue() {
  methodRef.value?.setValue('123456');
}
</script>

<template>
  <view class="component-demo">
    <!-- 基础用法 -->
    <demo-block title="基础用法">
      <lk-verify-code v-model="code1" @finish="onFinish" />
      <view class="value">当前值：{{ code1 || '未输入' }}</view>
    </demo-block>

    <!-- 不同长度 -->
    <demo-block title="验证码长度">
      <view class="demo-row">
        <text class="demo-label">4位验证码</text>
        <lk-verify-code v-model="code4" :length="4" :cell-size="100" />
      </view>
      <view class="demo-row">
        <text class="demo-label">6位验证码</text>
        <lk-verify-code v-model="code6" :length="6" />
      </view>
      <view class="demo-row">
        <text class="demo-label">8位验证码</text>
        <lk-verify-code v-model="code8" :length="8" :cell-size="80" :gap="8" />
      </view>
    </demo-block>

    <!-- 样式变体 -->
    <demo-block title="样式变体">
      <view class="demo-row">
        <text class="demo-label">方框样式 (Box)</text>
        <lk-verify-code v-model="codeBox" variant="box" />
      </view>
      <view class="demo-row">
        <text class="demo-label">下划线样式 (Underline)</text>
        <lk-verify-code v-model="codeUnderline" variant="underline" />
      </view>
      <view class="demo-row">
        <text class="demo-label">圆角样式 (Rounded)</text>
        <lk-verify-code v-model="codeRounded" variant="rounded" />
      </view>
    </demo-block>

    <!-- 密码模式 -->
    <demo-block title="密码模式 (Mask)">
      <lk-verify-code v-model="codeMask" mask tips="输入的内容将显示为圆点" />
      <view class="value">实际值：{{ codeMask || '未输入' }}</view>
    </demo-block>

    <!-- 状态展示 -->
    <demo-block title="状态展示">
      <view class="demo-row">
        <text class="demo-label">默认状态</text>
        <lk-verify-code v-model="codeDefault" :length="4" :cell-size="88" />
      </view>
      <view class="demo-row">
        <text class="demo-label">错误状态</text>
        <lk-verify-code
          v-model="codeError"
          :length="4"
          :cell-size="88"
          status="error"
          error-message="验证码错误，请重新输入"
        />
      </view>
      <view class="demo-row">
        <text class="demo-label">成功状态</text>
        <lk-verify-code v-model="codeSuccess" :length="4" :cell-size="88" status="success" />
      </view>
      <view class="demo-row">
        <text class="demo-label">禁用状态</text>
        <lk-verify-code v-model="codeDisabled" :length="4" :cell-size="88" disabled />
      </view>
    </demo-block>

    <!-- 倒计时发送 -->
    <demo-block title="倒计时发送">
      <lk-verify-code
        ref="countdownRef"
        v-model="codeCountdown"
        countdown
        :countdown-duration="10"
        tips="验证码已发送到您的手机"
        @send="onSend"
        @resend="onResend"
        @finish="onCountdownFinish"
      />
    </demo-block>

    <!-- 自定义颜色 -->
    <demo-block title="自定义颜色">
      <lk-verify-code
        v-model="codeCustom"
        focus-color="#007AFF"
        error-color="#FF3B30"
        tips="自定义聚焦颜色为蓝色"
      />
    </demo-block>

    <!-- 文本类型 -->
    <demo-block title="文本类型输入">
      <lk-verify-code v-model="codeText" type="text" :length="4" tips="支持字母和数字混合输入" />
      <view class="value">当前值：{{ codeText || '未输入' }}</view>
    </demo-block>

    <!-- 交互演示 -->
    <demo-block title="方法调用">
      <lk-verify-code ref="methodRef" v-model="codeMethod" :length="6" />
      <view class="btn-group">
        <view class="demo-btn" @click="handleFocus">聚焦</view>
        <view class="demo-btn" @click="handleBlur">失焦</view>
        <view class="demo-btn" @click="handleClear">清空</view>
        <view class="demo-btn" @click="handleSetValue">设置值</view>
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
  padding-bottom: 100rpx;
}

.demo-row {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 16rpx;
  }
  margin-bottom: 32rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.demo-label {
  font-size: 26rpx;
  color: var(--lk-text-secondary);
}

.value {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: var(--lk-text-tertiary);
  text-align: center;
}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  > :not(.preview-spacing-placeholder) {
    margin: 8rpx;
  }
  margin-top: 24rpx;
  justify-content: center;
}

.demo-btn {
  padding: 16rpx 32rpx;
  font-size: 26rpx;
  color: var(--lk-color-primary);
  background: var(--lk-fill-tertiary);
  border-radius: var(--lk-radius-lg);
  transition: all 0.2s ease;

  &:active {
    opacity: 0.7;
    transform: scale(0.95);
  }
}
</style>
