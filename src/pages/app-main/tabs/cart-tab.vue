<script setup lang="ts">
import CartContent from './components/cart-content.vue';
import PreviewTabShell from '@/components/preview/PreviewTabShell.vue';

defineProps<{
  tabId?: string;
  isActive?: boolean;
}>();
</script>

<template>
  <preview-tab-shell
    class="cart-tab"
    style="display: flex; flex-direction: column; width: 100%; height: 100%; min-height: 0"
    :content-scrollable="false"
  >
    <cart-content
      class="cart-tab__content"
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
