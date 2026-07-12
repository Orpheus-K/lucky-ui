<script setup lang="ts">
import { computed, ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';
import type {
  TransitionConfig,
  TransitionName,
} from '@/uni_modules/lucky-ui/composables/useTransition';
import type { SegmentedOption } from '@/uni_modules/lucky-ui/components/lk-segmented/segmented.props';

const visible1 = ref(false);
const visible2 = ref(false);
const visible3 = ref(false);
const visible4 = ref(false);
const visibleScale = ref(false);
const visibleBounce = ref(false);
const visibleNoHeader = ref(false);
const visibleLong = ref(false);
const visibleDynamic = ref(false);
const visibleTitleLeft = ref(false);
const visibleTitleCenter = ref(false);
const visibleFooterText = ref(false);
const visibleSingleBtn = ref(false);

// 动态参数
const dynamicType = ref<TransitionName>('zoom-in');
const dynamicDuration = ref(400);
const dynamicEasing = ref('ease-out');
const modalEasing = computed(() => dynamicEasing.value as TransitionConfig['easing']);
const animationOptions: SegmentedOption[] = [
  { label: 'zoom-in', value: 'zoom-in' },
  { label: 'slide-up', value: 'slide-up' },
  { label: 'fade-up', value: 'fade-up' },
  { label: 'bounce-in', value: 'bounce-in' },
];
const easingOptions: SegmentedOption[] = [
  { label: 'ease', value: 'ease' },
  { label: 'ease-out', value: 'ease-out' },
  { label: 'ease-in', value: 'ease-in' },
  { label: 'ease-in-out', value: 'ease-in-out' },
];

const handleConfirm = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      uni.showToast({ title: '删除成功' });
      resolve(true);
    }, 1000);
  });
};
</script>

<template>
  <view class="component-demo">
    <demo-block title="预设动画">
      <lk-space wrap>
        <lk-button @click="visible1 = true">缩放弹出（scale）</lk-button>
        <lk-modal v-model="visible1" animation="scale" title="Scale"> 我是缩放进来的！ </lk-modal>

        <lk-button @click="visible2 = true">弹跳（bounce）</lk-button>
        <lk-modal v-model="visible2" animation="bounce" title="Bounce"> 弹弹弹～ </lk-modal>

        <lk-button @click="visible3 = true">从下方滑入</lk-button>
        <lk-modal
          v-model="visible3"
          animation-type="slide-up"
          :duration="400"
          easing="ease-out-back"
          title="Slide Up"
        >
          我从下面飞上来！
        </lk-modal>
      </lk-space>
    </demo-block>

    <demo-block title="异步确认">
      <lk-space wrap>
        <lk-button @click="visible4 = true">异步确认</lk-button>
        <lk-modal v-model="visible4" animation="quick" @confirm="handleConfirm"
          >确定删除吗？</lk-modal
        >
      </lk-space>
    </demo-block>

    <demo-block title="更多预设与形态">
      <lk-space wrap>
        <lk-button @click="visibleScale = true">缩放 (scale 预设)</lk-button>
        <lk-modal v-model="visibleScale" animation="scale" title="Scale 预设">
          <text>使用 animation="scale"，来自预设映射。</text>
        </lk-modal>

        <lk-button @click="visibleBounce = true">弹跳 (bounce 预设)</lk-button>
        <lk-modal v-model="visibleBounce" animation="bounce" title="Bounce 预设">
          <text>使用 animation="bounce"，强调进入动势。</text>
        </lk-modal>

        <lk-button @click="visibleNoHeader = true">无头无脚 (纯内容)</lk-button>
        <lk-modal
          v-model="visibleNoHeader"
          :show-header="false"
          :show-footer="false"
          animation-type="zoom-in"
        >
          <view style="padding: 24rpx">
            <text>一个没有 header / footer 的轻量弹窗。</text>
          </view>
        </lk-modal>
      </lk-space>
    </demo-block>

    <demo-block title="长内容滚动">
      <lk-space wrap>
        <lk-button @click="visibleLong = true">长内容滚动</lk-button>
        <lk-modal v-model="visibleLong" title="长内容" animation-type="fade-up" :duration="500">
          <view style="max-height: 400rpx; overflow-y: auto; padding-right: 12rpx">
            <text v-for="i in 30" :key="i" style="display: block; margin-bottom: 12rpx"
              >第 {{ i }} 行示例内容，滚动测试。</text
            >
          </view>
        </lk-modal>
      </lk-space>
    </demo-block>

    <demo-block title="动态修改动画参数">
      <lk-space wrap>
        <lk-button @click="visibleDynamic = true">动态修改动画参数</lk-button>
        <lk-modal
          v-model="visibleDynamic"
          title="动态参数"
          :animation-type="dynamicType"
          :duration="dynamicDuration"
          :easing="modalEasing"
        >
          <view class="dynamic-modal-content">
            <text
              >当前动画: {{ dynamicType }} 时长: {{ dynamicDuration }}ms 缓动:
              {{ dynamicEasing }}</text
            >
            <lk-segmented
              v-model="dynamicType"
              :options="animationOptions"
              size="sm"
              class="dynamic-option-segmented"
            />
            <lk-slider v-model="dynamicDuration" :min="100" :max="1000" :step="100" />
            <lk-segmented
              v-model="dynamicEasing"
              :options="easingOptions"
              size="sm"
              class="dynamic-easing-segmented"
            />
          </view>
        </lk-modal>
      </lk-space>
    </demo-block>

    <demo-block title="标题对齐方式">
      <lk-space wrap>
        <lk-button @click="visibleTitleLeft = true">标题居左 (默认)</lk-button>
        <lk-modal v-model="visibleTitleLeft" title="提示" title-align="left">
          <text>默认标题居左显示，符合常规信息流布局。</text>
        </lk-modal>

        <lk-button @click="visibleTitleCenter = true">标题居中</lk-button>
        <lk-modal v-model="visibleTitleCenter" title="确认操作" title-align="center">
          <text>标题居中显示，更加庄重，常用于确认弹窗。</text>
        </lk-modal>
      </lk-space>
    </demo-block>

    <demo-block title="底部按钮风格">
      <lk-space wrap>
        <lk-button @click="visibleFooterText = true">文本按钮 (双按钮)</lk-button>
        <lk-modal
          v-model="visibleFooterText"
          title="退出登录"
          title-align="center"
          footer-type="text"
        >
          <text>确认退出当前账号吗？</text>
        </lk-modal>

        <lk-button @click="visibleSingleBtn = true">文本按钮 (单按钮)</lk-button>
        <lk-modal
          v-model="visibleSingleBtn"
          title="系统提示"
          title-align="center"
          footer-type="text"
          :show-cancel="false"
          confirm-text="我知道了"
        >
          <text>您的账号已在其他设备登录。</text>
        </lk-modal>
      </lk-space>
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

.dynamic-option-segmented,
.dynamic-easing-segmented {
  width: 100%;
}

.dynamic-modal-content {
  display: flex;
  flex-direction: column;
  padding: 16rpx;

  > :not(:first-child) {
    margin-top: 16rpx;
  }
}
</style>
