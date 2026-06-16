<script setup lang="ts">
import OverviewContent from './components/overview-content.vue';
import PreviewTabShell from '@/components/preview/PreviewTabShell.vue';

defineProps<{
  tabId?: string;
  isActive?: boolean;
}>();
</script>

<template>
  <preview-tab-shell
    class="overview-tab"
    style="display: flex; flex-direction: column; width: 100%; height: 100%; min-height: 0"
    title="组件预览"
    show-navbar
    content-scrollable
  >
    <overview-content
      class="overview-tab__content"
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
