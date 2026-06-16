<script setup lang="ts">
import { ref } from 'vue';
import LkCollapse from '@/uni_modules/lucky-ui/components/lk-collapse/lk-collapse.vue';
import LkCollapseItem from '@/uni_modules/lucky-ui/components/lk-collapse/lk-collapse-item.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const activeNames1 = ref(['1']);
const activeNames2 = ref(['1']);
const activeNames3 = ref(['1']);
const activeNames4 = ref('1');
const activeNames5 = ref(['1']);
</script>

<template>
  <view class="component-demo">
    <demo-block title="动画速率调节" desc="通过 duration 和 timing 自定义动画曲线">
      <view class="demo-item">
        <text class="label">慢速展开 (0.8s, linear)</text>
        <lk-collapse v-model="activeNames1" animation-duration="0.8s" animation-timing="linear">
          <lk-collapse-item name="1" title="平滑慢速">
            <view class="collapse-content"> duration=0.8s, timing=linear </view>
          </lk-collapse-item>
        </lk-collapse>
      </view>
      <view class="demo-item">
        <text class="label">快速反馈 (0.1s, ease-in-out)</text>
        <lk-collapse
          v-model="activeNames2"
          animation-duration="0.1s"
          animation-timing="ease-in-out"
        >
          <lk-collapse-item name="1" title="灵敏快速">
            <view class="collapse-content"> duration=0.1s, timing=ease-in-out </view>
          </lk-collapse-item>
        </lk-collapse>
      </view>
    </demo-block>

    <demo-block title="整体分组" desc="默认 group 布局，多个面板连成一整块">
      <lk-collapse v-model="activeNames1">
        <lk-collapse-item name="1" title="基础信息">
          <view class="collapse-content">
            将多个折叠项组织在同一个容器里，适合设置页和详情页的信息分组。
          </view>
        </lk-collapse-item>
        <lk-collapse-item name="2" title="配送信息">
          <view class="collapse-content">
            分组模式下不会出现割裂的卡片间隙，视觉上是一整块内容。
          </view>
        </lk-collapse-item>
        <lk-collapse-item name="3" title="售后说明">
          <view class="collapse-content">
            边框、背景和圆角会由父级统一控制，亮暗主题下保持一致层级。
          </view>
        </lk-collapse-item>
      </lk-collapse>
    </demo-block>

    <demo-block title="卡片布局" desc="variant=card，保留单项卡片并通过 gap 控制间距">
      <lk-collapse v-model="activeNames2" variant="card" gap="20">
        <lk-collapse-item name="1" title="订单进度">
          <view class="collapse-content"> 卡片布局适合强调每个独立模块，间距由父级统一控制。 </view>
        </lk-collapse-item>
        <lk-collapse-item name="2" title="费用明细">
          <view class="collapse-content">
            不再通过 item 间的固定 margin 控制间隔，避免不同布局下间隙不可控。
          </view>
        </lk-collapse-item>
      </lk-collapse>
    </demo-block>

    <demo-block title="轻量布局" desc="variant=ghost，用于页面背景上的弱容器展示">
      <lk-collapse v-model="activeNames3" variant="ghost" :bordered="false">
        <lk-collapse-item name="1" title="为什么选择轻量布局">
          <view class="collapse-content">
            轻量布局减少边框和容器存在感，适合 FAQ、帮助说明等场景。
          </view>
        </lk-collapse-item>
        <lk-collapse-item name="2" title="是否支持暗黑模式">
          <view class="collapse-content">
            所有背景、边框和文本颜色都来自主题 token，亮暗主题会自动适配。
          </view>
        </lk-collapse-item>
      </lk-collapse>
    </demo-block>

    <demo-block title="手风琴模式">
      <lk-collapse v-model="activeNames4" accordion>
        <lk-collapse-item name="1" title="标题1">
          <view class="collapse-content"> 手风琴模式，同时只能展开一个面板。 </view>
        </lk-collapse-item>
        <lk-collapse-item name="2" title="标题2">
          <view class="collapse-content"> 点击其他面板会自动关闭当前面板。 </view>
        </lk-collapse-item>
        <lk-collapse-item name="3" title="标题3">
          <view class="collapse-content"> 适合 FAQ 等场景。 </view>
        </lk-collapse-item>
      </lk-collapse>
    </demo-block>

    <demo-block title="禁用状态">
      <lk-collapse v-model="activeNames5" variant="card">
        <lk-collapse-item name="1" title="正常">
          <view class="collapse-content"> 可以正常展开 </view>
        </lk-collapse-item>
        <lk-collapse-item name="2" title="禁用" disabled>
          <view class="collapse-content"> 此面板已禁用 </view>
        </lk-collapse-item>
      </lk-collapse>
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

.collapse-content {
  padding: var(--lk-spacing-md);
  color: var(--lk-text-secondary);
  font-size: var(--lk-font-size-sm);
  line-height: 1.6;
}
</style>
