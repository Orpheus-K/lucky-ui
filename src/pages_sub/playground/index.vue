<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkTag from '@/uni_modules/lucky-ui/components/lk-tag/lk-tag.vue';
import LkBadge from '@/uni_modules/lucky-ui/components/lk-badge/lk-badge.vue';
import LkAvatar from '@/uni_modules/lucky-ui/components/lk-avatar/lk-avatar.vue';
import LkSwitch from '@/uni_modules/lucky-ui/components/lk-switch/lk-switch.vue';
import LkInput from '@/uni_modules/lucky-ui/components/lk-input/lk-input.vue';
import LkDivider from '@/uni_modules/lucky-ui/components/lk-divider/lk-divider.vue';
import LkProgress from '@/uni_modules/lucky-ui/components/lk-progress/lk-progress.vue';
import LkLoading from '@/uni_modules/lucky-ui/components/lk-loading/lk-loading.vue';
import LkStepper from '@/uni_modules/lucky-ui/components/lk-stepper/lk-stepper.vue';
import LkRate from '@/uni_modules/lucky-ui/components/lk-rate/lk-rate.vue';
import LkSlider from '@/uni_modules/lucky-ui/components/lk-slider/lk-slider.vue';
import LkCheckbox from '@/uni_modules/lucky-ui/components/lk-checkbox/lk-checkbox.vue';
import LkRadio from '@/uni_modules/lucky-ui/components/lk-radio/lk-radio.vue';
import LkCard from '@/uni_modules/lucky-ui/components/lk-card/lk-card.vue';
import LkSkeleton from '@/uni_modules/lucky-ui/components/lk-skeleton/lk-skeleton.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkNoticeBar from '@/uni_modules/lucky-ui/components/lk-notice-bar/lk-notice-bar.vue';
import LkImage from '@/uni_modules/lucky-ui/components/lk-image/lk-image.vue';
import LkTextarea from '@/uni_modules/lucky-ui/components/lk-textarea/lk-textarea.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';
import LkVerifyCode from '@/uni_modules/lucky-ui/components/lk-verify-code/lk-verify-code.vue';
import LkNumberRoller from '@/uni_modules/lucky-ui/components/lk-number-roller/lk-number-roller.vue';
import LkCell from '@/uni_modules/lucky-ui/components/lk-cell/lk-cell.vue';
import LkSegmented from '@/uni_modules/lucky-ui/components/lk-segmented/lk-segmented.vue';

// Suppress unused import warnings — components used in template
void [
  LkButton,
  LkTag,
  LkBadge,
  LkAvatar,
  LkSwitch,
  LkInput,
  LkDivider,
  LkProgress,
  LkLoading,
  LkStepper,
  LkRate,
  LkSlider,
  LkCheckbox,
  LkRadio,
  LkCard,
  LkSkeleton,
  LkIcon,
  LkNoticeBar,
  LkImage,
  LkTextarea,
  LkSpace,
  LkVerifyCode,
  LkNumberRoller,
  LkCell,
  LkSegmented,
];

const componentName = ref('');
const currentProps = ref<Record<string, unknown>>({});
const slotContent = ref('');

// uni-app 页面生命周期
onLoad(query => {
  if (query?.component) {
    componentName.value = query.component as string;
  }
});

function handleMessage(event: MessageEvent) {
  const data = event.data;
  if (!data || data.type !== 'playground-props-update') return;

  if (data.props) {
    currentProps.value = { ...data.props };
  }
  if (data.slotContent !== undefined) {
    slotContent.value = data.slotContent;
  }
}

// #ifdef H5
onMounted(() => {
  window.addEventListener('message', handleMessage);
  // 通知父窗口 playground 已就绪
  window.parent?.postMessage({ type: 'playground-ready' }, '*');
});

onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage);
});
// #endif
</script>

<template>
  <view class="playground-page">
    <view class="playground-stage">
      <!-- Button -->
      <template v-if="componentName === 'button'">
        <lk-button v-bind="currentProps">{{ slotContent || '按钮' }}</lk-button>
      </template>

      <!-- Tag -->
      <template v-else-if="componentName === 'tag'">
        <lk-tag v-bind="currentProps">{{ slotContent || '标签' }}</lk-tag>
      </template>

      <!-- Badge -->
      <template v-else-if="componentName === 'badge'">
        <lk-badge v-bind="currentProps">
          <view class="playground-badge-target">内容</view>
        </lk-badge>
      </template>

      <!-- Avatar -->
      <template v-else-if="componentName === 'avatar'">
        <lk-avatar v-bind="currentProps" />
      </template>

      <!-- Switch -->
      <template v-else-if="componentName === 'switch'">
        <lk-switch v-bind="currentProps" />
      </template>

      <!-- Input -->
      <template v-else-if="componentName === 'input'">
        <view style="width: 100%; padding: 0 24rpx">
          <lk-input v-bind="currentProps" />
        </view>
      </template>

      <!-- Divider -->
      <template v-else-if="componentName === 'divider'">
        <view style="width: 100%">
          <lk-divider v-bind="currentProps">{{ slotContent }}</lk-divider>
        </view>
      </template>

      <!-- Progress -->
      <template v-else-if="componentName === 'progress'">
        <view style="width: 100%; padding: 0 24rpx">
          <lk-progress v-bind="currentProps" />
        </view>
      </template>

      <!-- Loading -->
      <template v-else-if="componentName === 'loading'">
        <lk-loading v-bind="currentProps" />
      </template>

      <!-- Stepper -->
      <template v-else-if="componentName === 'stepper'">
        <lk-stepper v-bind="currentProps" />
      </template>

      <!-- Rate -->
      <template v-else-if="componentName === 'rate'">
        <lk-rate v-bind="currentProps" />
      </template>

      <!-- Slider -->
      <template v-else-if="componentName === 'slider'">
        <view style="width: 100%; padding: 0 24rpx">
          <lk-slider v-bind="currentProps" />
        </view>
      </template>

      <!-- Checkbox -->
      <template v-else-if="componentName === 'checkbox'">
        <lk-checkbox v-bind="currentProps">{{ slotContent || '复选框' }}</lk-checkbox>
      </template>

      <!-- Radio -->
      <template v-else-if="componentName === 'radio'">
        <lk-radio v-bind="currentProps">{{ slotContent || '单选框' }}</lk-radio>
      </template>

      <!-- Card -->
      <template v-else-if="componentName === 'card'">
        <view style="width: 100%; padding: 0 24rpx">
          <lk-card v-bind="currentProps">
            <text>{{ slotContent || '卡片内容示例' }}</text>
          </lk-card>
        </view>
      </template>

      <!-- Skeleton -->
      <template v-else-if="componentName === 'skeleton'">
        <view style="width: 100%; padding: 0 24rpx">
          <lk-skeleton v-bind="currentProps" />
        </view>
      </template>

      <!-- Icon -->
      <template v-else-if="componentName === 'icon'">
        <lk-icon v-bind="currentProps" />
      </template>

      <!-- NoticeBar -->
      <template v-else-if="componentName === 'notice-bar'">
        <view style="width: 100%">
          <lk-notice-bar v-bind="currentProps" />
        </view>
      </template>

      <!-- Image -->
      <template v-else-if="componentName === 'image'">
        <lk-image v-bind="currentProps" />
      </template>

      <!-- Textarea -->
      <template v-else-if="componentName === 'textarea'">
        <view style="width: 100%; padding: 0 24rpx">
          <lk-textarea v-bind="currentProps" />
        </view>
      </template>

      <!-- Space -->
      <template v-else-if="componentName === 'space'">
        <lk-space v-bind="currentProps">
          <lk-button size="sm">按钮A</lk-button>
          <lk-button size="sm">按钮B</lk-button>
          <lk-button size="sm">按钮C</lk-button>
        </lk-space>
      </template>

      <!-- VerifyCode -->
      <template v-else-if="componentName === 'verify-code'">
        <view style="width: 100%; padding: 0 24rpx">
          <lk-verify-code v-bind="currentProps" />
        </view>
      </template>

      <!-- NumberRoller -->
      <template v-else-if="componentName === 'number-roller'">
        <lk-number-roller v-bind="currentProps" />
      </template>

      <!-- Cell -->
      <template v-else-if="componentName === 'cell'">
        <view style="width: 100%">
          <lk-cell v-bind="currentProps" />
        </view>
      </template>

      <!-- Segmented -->
      <template v-else-if="componentName === 'segmented'">
        <view style="width: 100%; padding: 0 24rpx">
          <lk-segmented v-bind="currentProps" />
        </view>
      </template>

      <!-- 未支持的组件 -->
      <template v-else>
        <view class="playground-unsupported">
          <text class="unsupported-text">暂不支持 {{ componentName }} 的 Playground 预览</text>
        </view>
      </template>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.playground-page {
  width: 100%;
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.playground-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  width: 100%;
}

.playground-badge-target {
  width: 80rpx;
  height: 80rpx;
  background: #f0f0f0;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #666;
}

.playground-unsupported {
  text-align: center;
  padding: 40rpx;
}

.unsupported-text {
  font-size: 24rpx;
  color: #999;
}
</style>
