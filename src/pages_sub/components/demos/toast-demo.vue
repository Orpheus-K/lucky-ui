<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkToast from '@/uni_modules/lucky-ui/components/lk-toast/lk-toast.vue';
import LkToastManager from '@/uni_modules/lucky-ui/components/lk-toast/lk-toast-manager.vue';
import { useToast } from '@/uni_modules/lucky-ui/components/lk-toast/toast-manager';

const toast = useToast();

const showToast1 = () => {
  toast.show('这是一条提示');
};

const showSlideUp = () => {
  toast.show({
    message: '向上滑动',
    transition: 'slide-up',
  });
};

const showSlideDown = () => {
  toast.show({
    message: '向下滑动',
    transition: 'slide-down',
  });
};

const showFade = () => {
  toast.show({
    message: '淡入淡出',
    transition: 'fade',
  });
};

const showZoom = () => {
  toast.show({
    message: '缩放动画',
    transition: 'zoom-in',
  });
};

const showTop = () => {
  toast.show({
    message: '顶部提示',
    position: 'top',
  });
};

const showCenter = () => {
  toast.show({
    message: '中间提示',
    position: 'center',
  });
};

const showBottom = () => {
  toast.show({
    message: '底部提示',
    position: 'bottom',
  });
};

const lifecycleVisible = ref(true);
const lifecycleOpenCount = ref(0);
const lifecycleCloseCount = ref(0);
const lifecycleAfterLeaveCount = ref(0);

const openLifecycleToast = () => {
  lifecycleVisible.value = true;
};

const closeLifecycleToast = () => {
  lifecycleVisible.value = false;
};

const rapidReopenLifecycleToast = async () => {
  lifecycleVisible.value = false;
  await nextTick();
  lifecycleVisible.value = true;
};

type ToastBlockerMode = 'none' | 'visual' | 'lock' | 'visual-lock';

const blockerMode = ref<ToastBlockerMode>('none');
const blockerVisible = ref(false);
const blockerUnderClickCount = ref(0);
const blockerOpenCycle = ref(0);
const blockerAfterLeaveCount = ref(0);
const blockerOverlay = computed(
  () => blockerMode.value === 'visual' || blockerMode.value === 'visual-lock'
);
const blockerForbidClick = computed(
  () => blockerMode.value === 'lock' || blockerMode.value === 'visual-lock'
);

const openBlockerMode = (mode: ToastBlockerMode) => {
  blockerMode.value = mode;
  blockerVisible.value = true;
  blockerOpenCycle.value += 1;
};

const closeAndResetBlockerToast = () => {
  blockerVisible.value = false;
  blockerMode.value = 'none';
};

const closeAndResetBlockerForbidClick = () => {
  blockerVisible.value = false;
  blockerMode.value = 'visual';
};

const rapidReopenBlockerToast = async (mode: Extract<ToastBlockerMode, 'none' | 'visual'>) => {
  blockerVisible.value = false;
  blockerMode.value = 'none';
  await nextTick();
  blockerMode.value = mode;
  blockerVisible.value = true;
  blockerOpenCycle.value += 1;
};

const resetBlockerUnderClickCount = () => {
  blockerUnderClickCount.value = 0;
};

const onBlockerAfterLeave = () => {
  blockerAfterLeaveCount.value += 1;
};
</script>

<template>
  <view class="component-demo">
    <lk-toast-manager />
    <demo-block title="基础用法">
      <lk-button type="primary" @click="showToast1">显示提示</lk-button>
    </demo-block>

    <demo-block title="生命周期演练">
      <view
        id="toast-lifecycle-fixture"
        class="toast-lifecycle-fixture"
        :data-toast-visible="lifecycleVisible ? 'true' : 'false'"
        :data-toast-open-count="lifecycleOpenCount"
        :data-toast-close-count="lifecycleCloseCount"
        :data-toast-after-leave-count="lifecycleAfterLeaveCount"
      >
        <lk-toast
          v-model="lifecycleVisible"
          message="生命周期演练提示"
          :duration="1600"
          position="bottom"
          @open="lifecycleOpenCount += 1"
          @close="lifecycleCloseCount += 1"
          @after-leave="lifecycleAfterLeaveCount += 1"
        />
        <view class="toast-lifecycle-fixture__evidence">
          open={{ lifecycleOpenCount }} / close={{ lifecycleCloseCount }} / after-leave={{
            lifecycleAfterLeaveCount
          }}
        </view>
        <lk-space wrap>
          <lk-button id="toast-lifecycle-open" @click="openLifecycleToast">重新打开</lk-button>
          <lk-button id="toast-lifecycle-close" @click="closeLifecycleToast">手动关闭</lk-button>
          <lk-button id="toast-lifecycle-rapid-reopen" @click="rapidReopenLifecycleToast">
            快速重开
          </lk-button>
        </lk-space>
      </view>
    </demo-block>

    <demo-block title="遮罩与点击拦截演练">
      <view
        id="toast-blocker-fixture"
        class="toast-blocker-fixture"
        :data-blocker-mode="blockerMode"
        :data-overlay="blockerOverlay ? 'true' : 'false'"
        :data-forbid-click="blockerForbidClick ? 'true' : 'false'"
        :data-toast-visible="blockerVisible ? 'true' : 'false'"
        :data-under-click-count="blockerUnderClickCount"
        :data-open-cycle="blockerOpenCycle"
        :data-after-leave-count="blockerAfterLeaveCount"
      >
        <view id="toast-blocker-probe" class="toast-blocker-fixture__evidence">
          mode={{ blockerMode }} / under-click={{ blockerUnderClickCount }}
        </view>
        <view class="toast-blocker-fixture__controls">
          <lk-button id="toast-blocker-mode-none" @click="openBlockerMode('none')">
            无遮罩 / 可点击
          </lk-button>
          <lk-button id="toast-blocker-mode-visual" @click="openBlockerMode('visual')">
            有遮罩 / 可点击
          </lk-button>
          <lk-button id="toast-blocker-mode-lock" @click="openBlockerMode('lock')">
            无遮罩 / 禁止点击
          </lk-button>
          <lk-button id="toast-blocker-mode-visual-lock" @click="openBlockerMode('visual-lock')">
            有遮罩 / 禁止点击
          </lk-button>
          <lk-button id="toast-blocker-close" @click="closeAndResetBlockerToast">
            关闭并同批重置
          </lk-button>
          <lk-button id="toast-blocker-close-reset-forbid" @click="closeAndResetBlockerForbidClick">
            关闭并仅重置拦截
          </lk-button>
          <lk-button id="toast-blocker-rapid-none" @click="rapidReopenBlockerToast('none')">
            快速重开为无遮罩
          </lk-button>
          <lk-button id="toast-blocker-rapid-visual" @click="rapidReopenBlockerToast('visual')">
            快速重开为仅视觉遮罩
          </lk-button>
          <lk-button id="toast-blocker-reset" @click="resetBlockerUnderClickCount">
            重置计数
          </lk-button>
        </view>
        <view class="toast-blocker-fixture__underlay">
          <lk-button
            id="toast-blocker-under-button"
            type="primary"
            @click="blockerUnderClickCount += 1"
          >
            底层按钮
          </lk-button>
        </view>
        <lk-toast
          v-model="blockerVisible"
          message="遮罩与点击拦截是两个独立状态"
          :duration="0"
          position="top"
          :z-index="2200"
          :overlay="blockerOverlay"
          :forbid-click="blockerForbidClick"
          @after-leave="onBlockerAfterLeave"
        />
      </view>
    </demo-block>

    <demo-block title="动画效果">
      <lk-space wrap>
        <lk-button @click="showSlideUp">向上滑动</lk-button>
        <lk-button @click="showSlideDown">向下滑动</lk-button>
        <lk-button @click="showFade">淡入淡出</lk-button>
        <lk-button @click="showZoom">缩放</lk-button>
      </lk-space>
    </demo-block>

    <demo-block title="自定义位置">
      <lk-space wrap>
        <lk-button @click="showTop">顶部</lk-button>
        <lk-button @click="showCenter">中间</lk-button>
        <lk-button @click="showBottom">底部</lk-button>
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

.toast-lifecycle-fixture__evidence {
  margin-bottom: 20rpx;
  color: var(--lk-text-secondary);
  font-size: 24rpx;
  line-height: 1.5;
}

.toast-blocker-fixture {
  position: relative;
}

.toast-blocker-fixture__evidence {
  margin-bottom: 20rpx;
  color: var(--lk-text-secondary);
  font-size: 24rpx;
  line-height: 1.5;
}

.toast-blocker-fixture__controls {
  position: relative;
  z-index: 2202;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 16rpx;
  border-radius: var(--lk-radius-md);
  background: var(--lk-bg-page);
}

.toast-blocker-fixture__underlay {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  padding: 48rpx 0 16rpx;
}
</style>
