<script setup lang="ts">
import ButtonAuditAdapter from './adapters/ButtonAuditAdapter.vue';
import type {
  AuditAdapterErrorPayload,
  AuditAdapterEventPayload,
  AuditAdapterReadyPayload,
  AuditComponentSlug,
  AuditRuntimePlatform,
} from './audit-fixture';

defineProps<{
  component: AuditComponentSlug;
  fingerprint: string;
  generation: number;
  platform: AuditRuntimePlatform;
}>();

defineEmits<{
  ready: [payload: AuditAdapterReadyPayload];
  event: [payload: AuditAdapterEventPayload];
  error: [payload: AuditAdapterErrorPayload];
}>();
</script>

<template>
  <button-audit-adapter
    v-if="component === 'button'"
    :fingerprint="fingerprint"
    :generation="generation"
    :platform="platform"
    @ready="$emit('ready', $event)"
    @event="$emit('event', $event)"
    @error="$emit('error', $event)"
  />
</template>
