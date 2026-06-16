<script setup lang="ts">
import { ref } from 'vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkTooltip from '@/uni_modules/lucky-ui/components/lk-tooltip/lk-tooltip.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const manualOpen = ref(false);
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <lk-space wrap>
        <lk-tooltip content="这是一段提示信息">
          <lk-button>悬停看看</lk-button>
        </lk-tooltip>

        <lk-tooltip content="点击触发" trigger="click">
          <lk-button>点击看看</lk-button>
        </lk-tooltip>
      </lk-space>
    </demo-block>
    <demo-block title="自定义内容">
      <lk-space wrap>
        <lk-tooltip trigger="click">
          <lk-button>自定义内容（点击打开）</lk-button>
          <template #content>
            <view class="tooltip-custom-content">
              <view style="width: 20rpx; height: 20rpx; border-radius: 50%; background: #16a34a" />
              <text>一段可自定义的内容，包含图形和文字</text>
            </view>
          </template>
        </lk-tooltip>
      </lk-space>
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
      <lk-space wrap>
        <lk-tooltip content="已禁用" :disabled="true">
          <lk-button disabled>禁用</lk-button>
        </lk-tooltip>

        <lk-tooltip content="更远的间距" :offset="16">
          <lk-button>offset 16rpx</lk-button>
        </lk-tooltip>
      </lk-space>
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

.tooltip-custom-content {
  display: flex;
  align-items: center;

  > :not(:first-child) {
    margin-left: 12rpx;
  }
}
</style>
