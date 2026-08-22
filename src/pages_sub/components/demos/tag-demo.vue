<script setup lang="ts">
import { ref, computed } from 'vue';
import LkTag from '@/uni_modules/lucky-ui/components/lk-tag/lk-tag.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const tags = ref({
  tag1: true,
  tag2: true,
  tag3: true,
});

const allTagsVisible = computed(() => tags.value.tag1 && tags.value.tag2 && tags.value.tag3);

const selectableTags = ref([
  { name: 'vue', label: 'Vue', selected: false },
  { name: 'react', label: 'React', selected: false },
  { name: 'uniapp', label: 'UniApp', selected: true },
]);

const skills = ref(['Vue3', 'TypeScript', 'UniApp', 'Sass', 'Vite']);

const resetTags = () => {
  tags.value = { tag1: true, tag2: true, tag3: true };
  uni.showToast({ title: '标签已恢复', icon: 'none' });
};

const toggleTag = (name: string) => {
  const tag = selectableTags.value.find(t => t.name === name);
  if (tag) {
    tag.selected = !tag.selected;
  }
};
</script>

<template>
  <view class="component-demo">
    <demo-block title="标签类型">
      <lk-space wrap>
        <lk-tag type="light">浅色</lk-tag>
        <lk-tag type="outline">轮廓</lk-tag>
        <lk-tag type="solid">实心</lk-tag>
      </lk-space>
    </demo-block>

    <demo-block title="可关闭标签">
      <lk-space wrap>
        <lk-tag v-if="tags.tag1" closable @close="tags.tag1 = false">可关闭</lk-tag>
        <lk-tag v-if="tags.tag2" closable type="light" @close="tags.tag2 = false">浅色</lk-tag>
        <lk-tag v-if="tags.tag3" closable type="outline" @close="tags.tag3 = false">轮廓</lk-tag>
        <lk-button v-if="!allTagsVisible" size="md" @click="resetTags">恢复</lk-button>
      </lk-space>
    </demo-block>

    <demo-block title="标签尺寸">
      <lk-space wrap>
        <lk-tag size="sm">小标签</lk-tag>
        <lk-tag size="md">中等</lk-tag>
        <lk-tag size="lg">大标签</lk-tag>
      </lk-space>
    </demo-block>

    <demo-block title="圆形标签">
      <lk-space wrap>
        <lk-tag round>默认</lk-tag>
      </lk-space>
    </demo-block>

    <demo-block title="自定义颜色">
      <lk-space wrap>
        <lk-tag color="primary">品牌浅底</lk-tag>
        <lk-tag color="#7c3aed">紫色浅底</lk-tag>
        <lk-tag color="#0f9f6e">绿色浅底</lk-tag>
        <lk-tag color="rgb(225, 91, 64)">暖色浅底</lk-tag>
        <lk-tag color="#f56c6c">自定义红</lk-tag>
        <lk-tag color="#ffb400">自定义橙</lk-tag>
      </lk-space>
    </demo-block>

    <demo-block title="可选择标签">
      <lk-space wrap>
        <lk-tag
          v-for="tag in selectableTags"
          :key="tag.name"
          class="selectable-tag"
          @click="toggleTag(tag.name)"
        >
          <lk-icon v-if="tag.selected" name="check-circle-fill" class="selectable-tag__icon" />
          {{ tag.label }}
        </lk-tag>
      </lk-space>
    </demo-block>

    <demo-block title="标签组">
      <lk-space wrap :gap="12">
        <lk-tag v-for="skill in skills" :key="skill" size="sm" type="light">
          {{ skill }}
        </lk-tag>
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

.selectable-tag {
  cursor: pointer;
}

.selectable-tag__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  line-height: 1;
  margin-right: 8rpx;
}
</style>
