<script setup lang="ts">
import { ref } from 'vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkActionSheet from '@/uni_modules/lucky-ui/components/lk-action-sheet/lk-action-sheet.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import type { Action } from '@/uni_modules/lucky-ui/components/lk-action-sheet/action-sheet.props';

const visible1 = ref(false);
const visible2 = ref(false);
const visible3 = ref(false);
const visible4 = ref(false);
const safeAreaVisible = ref(false);
const safeAreaEnabled = ref(true);
const safeAreaProbeStyle = {
  '--lk-action-sheet-safe-area-bottom': '24px',
};
const cancelProbeVisible = ref(false);
const cancelProbeText = ref<string | undefined>(undefined);

const actions1 = [
  { name: '选项一', value: 1 },
  { name: '选项二', value: 2 },
  { name: '选项三', value: 3 },
];

const actions2 = [
  { name: '选项一', value: 1 },
  { name: '选项二', value: 2, disabled: true },
  { name: '选项三', value: 3 },
];

const showActionSheet1 = () => {
  visible1.value = true;
};

const showActionSheet2 = () => {
  visible2.value = true;
};

const showActionSheet3 = () => {
  visible3.value = true;
};

const showActionSheet4 = () => {
  visible4.value = true;
};

const showSafeAreaProbe = () => {
  safeAreaVisible.value = true;
};

const showCancelProbe = () => {
  cancelProbeVisible.value = true;
};

const toggleCancelProbe = () => {
  cancelProbeText.value = cancelProbeText.value === '' ? undefined : '';
};

const handleSelect = (payload: { action: Action }) => {
  uni.showToast({
    title: `选择了: ${payload.action.name}`,
    icon: 'none',
  });
};
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <lk-button type="primary" @click="showActionSheet1">显示动作面板</lk-button>
      <lk-action-sheet v-model="visible1" :actions="actions1" @select="handleSelect" />
    </demo-block>

    <demo-block title="带标题（使用预设动画）">
      <lk-button type="primary" @click="showActionSheet2">带标题</lk-button>
      <lk-action-sheet
        v-model="visible2"
        title="请选择操作"
        :actions="actions1"
        animation="quick"
      />
    </demo-block>

    <demo-block title="带描述（自定义动画类型）">
      <lk-button type="primary" @click="showActionSheet3">带描述</lk-button>
      <lk-action-sheet
        v-model="visible3"
        title="请选择"
        description="选择你要进行的操作"
        :actions="actions1"
        animation-type="fade-up"
        :duration="320"
        easing="ease-out"
      />
    </demo-block>

    <demo-block title="禁用选项">
      <lk-button type="primary" @click="showActionSheet4">禁用选项</lk-button>
      <lk-action-sheet v-model="visible4" :actions="actions2" />
    </demo-block>

    <demo-block title="安全区单一所有者">
      <view
        id="action-sheet-safe-area-probe"
        :data-safe-area="safeAreaEnabled ? 'true' : 'false'"
        :data-visible="safeAreaVisible ? 'true' : 'false'"
        data-expected-inset="24"
      >
        ActionSheet 与内部 Popup 合计只能渲染一个安全区节点。
      </view>
      <lk-button id="action-sheet-safe-area-toggle" @click="safeAreaEnabled = !safeAreaEnabled">
        {{ safeAreaEnabled ? '关闭安全区' : '开启安全区' }}
      </lk-button>
      <lk-button id="action-sheet-safe-area-open" type="primary" @click="showSafeAreaProbe">
        打开安全区探针
      </lk-button>
      <lk-action-sheet
        id="action-sheet-safe-area-target"
        v-model="safeAreaVisible"
        :actions="actions1"
        :custom-style="safeAreaProbeStyle"
        :safe-area="safeAreaEnabled"
      />
    </demo-block>

    <demo-block title="取消按钮显隐">
      <view
        id="action-sheet-cancel-probe"
        :data-cancel-mode="cancelProbeText === '' ? 'hidden' : 'default'"
        :data-visible="cancelProbeVisible ? 'true' : 'false'"
      >
        未传 cancelText 使用当前语言文案；空字符串隐藏取消按钮。
      </view>
      <lk-button id="action-sheet-cancel-toggle" @click="toggleCancelProbe">
        {{ cancelProbeText === '' ? '恢复取消按钮' : '隐藏取消按钮' }}
      </lk-button>
      <lk-button id="action-sheet-cancel-open" type="primary" @click="showCancelProbe">
        打开取消按钮探针
      </lk-button>
      <lk-action-sheet
        id="action-sheet-cancel-target"
        v-model="cancelProbeVisible"
        :actions="actions1"
        :cancel-text="cancelProbeText"
      />
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
</style>
