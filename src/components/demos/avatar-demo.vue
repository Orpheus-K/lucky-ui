<script setup lang="ts">
import LkAvatar from '@/uni_modules/lucky-ui/components/lk-avatar/lk-avatar.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkBadge from '@/uni_modules/lucky-ui/components/lk-badge/lk-badge.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <lk-space wrap>
        <lk-avatar text="A" />
        <lk-avatar text="用" />
        <lk-avatar text="Lucky" />
        <lk-avatar text="UI" />
      </lk-space>
    </demo-block>

    <demo-block title="头像形状">
      <lk-space wrap>
        <lk-avatar text="圆形" shape="circle" />
        <lk-avatar text="圆角" shape="rounded" />
        <lk-avatar text="方形" shape="square" />
      </lk-space>
    </demo-block>

    <demo-block title="头像尺寸">
      <lk-space wrap align="end">
        <!-- 默认尺寸已调整为中等（64） -->
        <lk-avatar text="默认" />
        <lk-avatar text="S" size="48" />
        <lk-avatar text="M" size="64" />
        <lk-avatar text="L" size="88" />
        <lk-avatar text="XL" size="112" />
      </lk-space>
    </demo-block>

    <demo-block title="自定义颜色">
      <lk-space wrap>
        <lk-avatar text="默" />
        <lk-avatar text="主" color="var(--lk-color-primary)" />
        <lk-avatar text="成" color="var(--lk-color-success)" />
        <lk-avatar text="警" color="var(--lk-color-warning)" />
      </lk-space>
    </demo-block>

    <demo-block title="背景与圆角">
      <lk-space wrap>
        <!-- 默认背景：使用公共主题变量 --lk-fill-2 -->
        <lk-avatar text="默" />
        <!-- 纯色背景 -->
        <lk-avatar text="蓝" bg="var(--lk-color-primary)" color="#fff" />
        <!-- 渐变背景 -->
        <lk-avatar text="渐" bg="linear-gradient(135deg, #1677ff, #7a5cff)" color="#fff" />
        <!-- 自定义圆角 -->
        <lk-avatar text="圆" shape="square" :radius="24" bg="#34c759" color="#fff" />
      </lk-space>
    </demo-block>

    <demo-block title="带图标">
      <lk-space wrap>
        <lk-avatar>
          <lk-icon name="house" size="32" />
        </lk-avatar>
        <lk-avatar>
          <lk-icon name="upload" size="32" />
        </lk-avatar>
        <lk-avatar shape="square">
          <lk-icon name="house" size="32" />
        </lk-avatar>
      </lk-space>
    </demo-block>

    <demo-block title="带徽章">
      <lk-space wrap>
        <lk-badge dot type="danger">
          <lk-avatar text="A" />
        </lk-badge>
        <lk-badge :value="8" type="danger">
          <lk-avatar text="B" />
        </lk-badge>
        <lk-badge :value="'VIP'" type="warning">
          <lk-avatar text="C" />
        </lk-badge>
      </lk-space>
    </demo-block>

    <demo-block title="带图片">
      <lk-space wrap>
        <lk-avatar src="https://picsum.photos/800/600?random=12" size="64" />
        <lk-avatar src="https://picsum.photos/800/600?random=13" size="64" />
        <lk-avatar src="https://picsum.photos/800/600?random=14" size="64" />
        <lk-avatar src="https://picsum.photos/800/600?random=15" size="64" />
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
</style>
