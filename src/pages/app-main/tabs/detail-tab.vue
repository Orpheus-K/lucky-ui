<script setup lang="ts">
import DetailContent from './components/detail-content.vue';
import PreviewTabShell from '@/components/preview/PreviewTabShell.vue';

defineProps<{
  tabId?: string;
  isActive?: boolean;
}>();
</script>

<template>
  <preview-tab-shell
    class="detail-tab"
    style="display: flex; flex-direction: column; width: 100%; height: 100%; min-height: 0"
    title="详情"
    show-navbar
    content-scrollable
  >
    <detail-content
      class="detail-tab__content"
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
