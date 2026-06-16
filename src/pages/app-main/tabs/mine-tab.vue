<script setup lang="ts">
import MineContent from './components/mine-content.vue';
import PreviewTabShell from '@/components/preview/PreviewTabShell.vue';

defineProps<{
  tabId?: string;
  isActive?: boolean;
}>();
</script>

<template>
  <preview-tab-shell
    class="mine-tab"
    style="display: flex; flex-direction: column; width: 100%; height: 100%; min-height: 0"
    :content-scrollable="false"
  >
    <mine-content
      class="mine-tab__content"
      style="
        display: flex;
        flex-direction: column;
        flex: 1;
        width: 100%;
        height: 100%;
        min-height: 0;
      "
      content-height="100%"
    />
  </preview-tab-shell>
</template>
