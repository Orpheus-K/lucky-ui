<script setup lang="ts">
import { ref } from 'vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkTooltip from '@/uni_modules/lucky-ui/components/lk-tooltip/lk-tooltip.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const manualOpen = ref(false);
const touchOpen = ref(false);
const touchEvents = ref<string[]>([]);
const customContentOpen = ref(false);
const customContentTapCount = ref(0);
const disabledOpen = ref(false);
const disabledCase = ref(false);
const disabledEvents = ref<string[]>([]);

function recordTouchUpdate(value: boolean) {
  touchEvents.value.push(`update:${value}`);
}

function recordDisabledUpdate(value: boolean) {
  disabledEvents.value.push(`update:${value}`);
}

function toggleDisabledCase() {
  disabledCase.value = !disabledCase.value;
}
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <lk-space wrap>
        <lk-tooltip
          id="tooltip-touch-demo"
          v-model="touchOpen"
          content="细指针悬停、触屏轻点均可触发"
          @update:model-value="recordTouchUpdate"
          @show="touchEvents.push('show')"
          @open="touchEvents.push('open')"
          @hide="touchEvents.push('hide')"
          @close="touchEvents.push('close')"
        >
          <lk-button>悬停或轻点</lk-button>
        </lk-tooltip>

        <lk-tooltip content="点击触发" trigger="click">
          <lk-button>点击看看</lk-button>
        </lk-tooltip>
      </lk-space>
      <text id="tooltip-touch-state" class="tooltip-demo-state">
        open={{ touchOpen }}；events={{ touchEvents.join(' > ') || 'none' }}
      </text>
    </demo-block>
    <demo-block title="自定义内容">
      <view class="tooltip-demo-case">
        <lk-tooltip id="tooltip-content-demo" v-model="customContentOpen" trigger="click">
          <lk-button>自定义内容（点击打开）</lk-button>
          <template #content>
            <view
              id="tooltip-content-action"
              class="tooltip-custom-content"
              @tap="customContentTapCount += 1"
            >
              <view class="tooltip-custom-content__indicator" />
              <text class="tooltip-custom-content__text">轻点内容只执行内容动作，不关闭提示</text>
            </view>
          </template>
        </lk-tooltip>
        <text id="tooltip-content-state" class="tooltip-demo-state">
          open={{ customContentOpen }}；contentTap={{ customContentTapCount }}
        </text>
      </view>
    </demo-block>

    <demo-block title="设置宽度">
      <lk-space wrap>
        <lk-tooltip content="固定 260rpx 宽度" :width="260">
          <lk-button>width=260</lk-button>
        </lk-tooltip>
        <lk-tooltip :width="'50%'">
          <lk-button>width=50%</lk-button>
          <template #content>
            <view>
              <text>我占容器的一半宽度，适合展示较多信息。</text>
            </view>
          </template>
        </lk-tooltip>
      </lk-space>
    </demo-block>

    <demo-block title="位置（placement + 动画方向）">
      <lk-space wrap :gap="[24, 16]">
        <lk-tooltip content="Top" placement="top"><lk-button>Top</lk-button></lk-tooltip>
        <lk-tooltip content="Right" placement="right" animation-type="fade-left"
          ><lk-button>Right</lk-button></lk-tooltip
        >
        <lk-tooltip
          content="Bottom"
          placement="bottom"
          :duration="260"
          easing="ease-out"
          animation="quick"
          ><lk-button>Bottom</lk-button></lk-tooltip
        >
        <lk-tooltip content="Left" placement="left" animation-type="fade-right"
          ><lk-button>Left</lk-button></lk-tooltip
        >
      </lk-space>
    </demo-block>

    <demo-block title="手动控制">
      <lk-space wrap>
        <lk-tooltip :model-value="manualOpen" trigger="manual" content="手动开关的提示">
          <lk-button @click="manualOpen = !manualOpen">
            {{ manualOpen ? '关闭' : '打开' }}
          </lk-button>
        </lk-tooltip>
      </lk-space>
    </demo-block>

    <demo-block title="禁用与间距">
      <view id="tooltip-disable-demo" class="tooltip-demo-case">
        <lk-space wrap>
          <lk-tooltip
            v-model="disabledOpen"
            content="打开后切换 disabled 应立即关闭"
            trigger="click"
            :disabled="disabledCase"
            @update:model-value="recordDisabledUpdate"
            @show="disabledEvents.push('show')"
            @open="disabledEvents.push('open')"
            @hide="disabledEvents.push('hide')"
            @close="disabledEvents.push('close')"
          >
            <lk-button id="tooltip-disable-trigger">{{
              disabledCase ? '已禁用' : '先打开'
            }}</lk-button>
          </lk-tooltip>

          <lk-button id="tooltip-disable-toggle" @click="toggleDisabledCase">
            {{ disabledCase ? '解除禁用' : '切换为禁用' }}
          </lk-button>

          <lk-tooltip content="更远的间距" :offset="16">
            <lk-button>offset 16rpx</lk-button>
          </lk-tooltip>
        </lk-space>
        <text id="tooltip-disable-state" class="tooltip-demo-state">
          open={{ disabledOpen }}；disabled={{ disabledCase }}；events={{
            disabledEvents.join(' > ') || 'none'
          }}
        </text>
      </view>
    </demo-block>
    <demo-block title="初次展开一次（可关闭）">
      <lk-space wrap>
        <lk-tooltip content="默认展开，点击可关闭" trigger="click" :default-open="true">
          <lk-button>默认展开（defaultOpen）</lk-button>
        </lk-tooltip>
      </lk-space>
    </demo-block>
    <demo-block title="常驻显示">
      <lk-space wrap>
        <lk-tooltip content="我会一直显示" always>
          <lk-button>常驻（always）</lk-button>
        </lk-tooltip>
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

.tooltip-demo-case {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.tooltip-demo-state {
  display: block;
  margin-top: 16rpx;
  color: var(--lk-text-secondary);
  font-size: var(--lk-font-size-sm);
  line-height: 1.5;
  word-break: break-all;
}

.tooltip-custom-content {
  display: flex;
  align-items: flex-start;
  max-width: 280rpx;
  white-space: normal;

  > :not(:first-child) {
    margin-left: 12rpx;
  }
}

.tooltip-custom-content__indicator {
  flex: 0 0 20rpx;
  width: 20rpx;
  height: 20rpx;
  margin-top: 6rpx;
  border-radius: 50%;
  background: var(--lk-color-success);
}

.tooltip-custom-content__text {
  flex: 1;
  min-width: 0;
  line-height: 1.5;
  white-space: normal;
}
</style>
