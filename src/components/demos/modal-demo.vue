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

type OverlayProbeMode = 'controlled' | 'observe';
const overlayProbeVisible = ref(false);
const overlayProbeMode = ref<OverlayProbeMode>('controlled');
const overlayProbeCloseOnOverlay = ref(false);
const overlayProbeClickCount = ref(0);
const overlayProbeUpdateCount = ref(0);
const overlayProbeLastUpdate = ref('none');

function openOverlayProbe(closeOnOverlay: boolean, mode: OverlayProbeMode) {
  overlayProbeVisible.value = true;
  overlayProbeMode.value = mode;
  overlayProbeCloseOnOverlay.value = closeOnOverlay;
  overlayProbeClickCount.value = 0;
  overlayProbeUpdateCount.value = 0;
  overlayProbeLastUpdate.value = 'none';
}

function onOverlayProbeClick() {
  overlayProbeClickCount.value += 1;
}

function onOverlayProbeUpdate(value: boolean) {
  overlayProbeUpdateCount.value += 1;
  overlayProbeLastUpdate.value = String(value);
  if (overlayProbeMode.value === 'controlled') {
    overlayProbeVisible.value = value;
  }
}

function closeOverlayProbe() {
  overlayProbeVisible.value = false;
}

type AsyncProbeMode = 'resolve' | 'reject';
const asyncProbeVisible = ref(false);
const asyncProbeMode = ref<AsyncProbeMode>('resolve');
const asyncProbeOutcome = ref('idle');
const asyncProbeHookCount = ref(0);
const asyncProbeConfirmCount = ref(0);
const asyncProbeCancelCount = ref(0);
const asyncProbeCloseClickCount = ref(0);
const asyncProbeUpdateCount = ref(0);
const asyncProbeEvents = ref<string[]>([]);
let asyncProbeSession = 0;

function openAsyncProbe(mode: AsyncProbeMode) {
  asyncProbeSession += 1;
  asyncProbeVisible.value = true;
  asyncProbeMode.value = mode;
  asyncProbeOutcome.value = 'idle';
  asyncProbeHookCount.value = 0;
  asyncProbeConfirmCount.value = 0;
  asyncProbeCancelCount.value = 0;
  asyncProbeCloseClickCount.value = 0;
  asyncProbeUpdateCount.value = 0;
  asyncProbeEvents.value = [];
}

function beforeAsyncConfirm() {
  const session = asyncProbeSession;
  const mode = asyncProbeMode.value;
  asyncProbeHookCount.value += 1;
  asyncProbeOutcome.value = 'pending';
  asyncProbeEvents.value.push(`before:${mode}`);

  return new Promise<boolean>((resolve, reject) => {
    setTimeout(() => {
      if (session === asyncProbeSession) {
        asyncProbeOutcome.value = mode === 'resolve' ? 'resolved' : 'rejected';
      }

      if (mode === 'resolve') {
        resolve(true);
      } else {
        reject(new Error('demo rejection'));
      }
    }, 1000);
  });
}

function onAsyncProbeConfirm() {
  asyncProbeConfirmCount.value += 1;
  asyncProbeEvents.value.push('confirm');
}

function onAsyncProbeCancel() {
  asyncProbeCancelCount.value += 1;
  asyncProbeEvents.value.push('cancel');
}

function onAsyncProbeCloseClick() {
  asyncProbeCloseClickCount.value += 1;
  asyncProbeEvents.value.push('click-close');
}

function onAsyncProbeUpdate(value: boolean) {
  asyncProbeUpdateCount.value += 1;
  asyncProbeEvents.value.push(`update:${value}`);
  asyncProbeVisible.value = value;
}

function reopenAsyncProbeDuringPending() {
  asyncProbeSession += 1;
  asyncProbeVisible.value = false;
  Promise.resolve().then(() => openAsyncProbe('reject'));
}

function closeAsyncProbe() {
  asyncProbeSession += 1;
  asyncProbeVisible.value = false;
}
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

    <demo-block title="遮罩关闭控制流" desc="稳定计数用于 H5 与微信小程序交互验收">
      <lk-space wrap>
        <lk-button
          id="modal-overlay-open-controlled-false"
          @click="openOverlayProbe(false, 'controlled')"
        >
          受控：遮罩不关闭
        </lk-button>
        <lk-button
          id="modal-overlay-open-controlled-true"
          @click="openOverlayProbe(true, 'controlled')"
        >
          受控：遮罩关闭
        </lk-button>
        <lk-button id="modal-overlay-open-observe-true" @click="openOverlayProbe(true, 'observe')">
          仅观察关闭请求
        </lk-button>
      </lk-space>
      <view class="probe-state">
        <text id="modal-overlay-probe-visible">visible={{ overlayProbeVisible }}</text>
        <text id="modal-overlay-probe-mode">mode={{ overlayProbeMode }}</text>
        <text id="modal-overlay-probe-close-on-overlay">
          closeOnOverlay={{ overlayProbeCloseOnOverlay }}
        </text>
        <text id="modal-overlay-probe-click-count">click={{ overlayProbeClickCount }}</text>
        <text id="modal-overlay-probe-update-count">update={{ overlayProbeUpdateCount }}</text>
        <text id="modal-overlay-probe-last-update">lastUpdate={{ overlayProbeLastUpdate }}</text>
      </view>
      <lk-modal
        :model-value="overlayProbeVisible"
        :close-on-overlay="overlayProbeCloseOnOverlay"
        :show-close="false"
        :show-footer="false"
        title="遮罩关闭探针"
        @click-overlay="onOverlayProbeClick"
        @update:model-value="onOverlayProbeUpdate"
      >
        <view id="modal-overlay-probe-content" class="probe-modal-content">
          <text>点击遮罩后读取页面上的计数与可见状态。</text>
          <lk-button id="modal-overlay-force-close" size="sm" @click="closeOverlayProbe">
            结束探针
          </lk-button>
        </view>
      </lk-modal>
    </demo-block>

    <demo-block title="异步确认" desc="beforeConfirm 决定关闭，pending 期间默认操作全部禁用">
      <lk-space wrap>
        <lk-button id="modal-async-open-resolve" @click="openAsyncProbe('resolve')">
          异步成功
        </lk-button>
        <lk-button id="modal-async-open-reject" @click="openAsyncProbe('reject')">
          异步失败
        </lk-button>
      </lk-space>
      <view class="probe-state">
        <text id="modal-async-probe-visible">visible={{ asyncProbeVisible }}</text>
        <text id="modal-async-probe-mode">mode={{ asyncProbeMode }}</text>
        <text id="modal-async-probe-outcome">outcome={{ asyncProbeOutcome }}</text>
        <text id="modal-async-probe-hook-count">hook={{ asyncProbeHookCount }}</text>
        <text id="modal-async-probe-confirm-count">confirm={{ asyncProbeConfirmCount }}</text>
        <text id="modal-async-probe-cancel-count">cancel={{ asyncProbeCancelCount }}</text>
        <text id="modal-async-probe-close-count">closeClick={{ asyncProbeCloseClickCount }}</text>
        <text id="modal-async-probe-update-count">update={{ asyncProbeUpdateCount }}</text>
        <text id="modal-async-probe-events"
          >events={{ asyncProbeEvents.join(' > ') || 'none' }}</text
        >
      </view>
      <lk-modal
        :model-value="asyncProbeVisible"
        :before-confirm="beforeAsyncConfirm"
        animation="quick"
        title="异步确认探针"
        @cancel="onAsyncProbeCancel"
        @click-close="onAsyncProbeCloseClick"
        @confirm="onAsyncProbeConfirm"
        @update:model-value="onAsyncProbeUpdate"
      >
        <view id="modal-async-probe-content" class="probe-modal-content">
          <text>确认后等待 1 秒；成功才关闭，失败保持打开。</text>
          <lk-space wrap>
            <lk-button
              id="modal-async-race-reopen"
              size="sm"
              variant="soft"
              @click="reopenAsyncProbeDuringPending"
            >
              外部关闭并重开
            </lk-button>
            <lk-button
              id="modal-async-force-close"
              size="sm"
              variant="soft"
              @click="closeAsyncProbe"
            >
              结束探针
            </lk-button>
          </lk-space>
        </view>
      </lk-modal>
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

.probe-state,
.probe-modal-content {
  display: flex;
  flex-direction: column;

  > :not(:first-child) {
    margin-top: var(--lk-spacing-xs);
  }
}

.probe-state {
  margin-top: var(--lk-spacing-md);
  color: var(--lk-text-secondary);
  font-size: var(--lk-font-size-sm);
}

.probe-modal-content {
  color: var(--lk-text-primary);
}
</style>
