<script setup lang="ts">
import HomeContent from './components/home-content.vue';
import PreviewTabShell from '@/components/preview/PreviewTabShell.vue';

defineProps<{
  tabId?: string;
  isActive?: boolean;
}>();
</script>

<template>
  <preview-tab-shell
    class="home-tab"
    style="display: flex; flex-direction: column; width: 100%; height: 100%; min-height: 0"
    title="发现"
    show-navbar
    content-scrollable
  >
    <home-content
      class="home-tab__content"
      style="
        display: flex;
        flex-direction: column;
        flex: 1;
        width: 100%;
        height: 100%;
        min-height: 0;
      "
      content-height="100%"
      skip-animation
    />
  </preview-tab-shell>
</template>
