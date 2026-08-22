<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import {
  auditElementRectsEqual,
  createAuditTargetLocator,
  normalizeAuditElementRect,
  type AuditAdapterErrorPayload,
  type AuditAdapterEventPayload,
  type AuditAdapterReadyPayload,
  type AuditElementRect,
  type AuditRuntimePlatform,
} from '../audit-fixture';

const props = defineProps<{
  fingerprint: string;
  generation: number;
  platform: AuditRuntimePlatform;
}>();

const emit = defineEmits<{
  ready: [payload: AuditAdapterReadyPayload];
  event: [payload: AuditAdapterEventPayload];
  error: [payload: AuditAdapterErrorPayload];
}>();

const TARGET_SELECTOR = '#audit-button-target';
const MAX_PROBE_ATTEMPTS = 90;
const PROBE_INTERVAL_MS = 16;
const QUERY_CALLBACK_TIMEOUT_MS = 250;
const instance = getCurrentInstance();
const adapterFingerprint = props.fingerprint;
const adapterGeneration = props.generation;
const adapterPlatform = props.platform;
const clickCount = ref(0);
const targetLocator = createAuditTargetLocator(adapterPlatform, TARGET_SELECTOR);
const state = computed(() => ({
  enabled: true,
  clickCount: clickCount.value,
}));
const stateJson = computed(() => JSON.stringify(state.value));
let active = true;
let readyEmitted = false;
let failureEmitted = false;
let probeAttempts = 0;
let stableReads = 0;
let previousRect: AuditElementRect | null = null;
let probeTimer: ReturnType<typeof setTimeout> | null = null;

function envelope() {
  return {
    component: 'button' as const,
    fingerprint: adapterFingerprint,
    generation: adapterGeneration,
  };
}

function fail(message: string) {
  if (!active || failureEmitted || readyEmitted) return;
  failureEmitted = true;
  emit('error', { ...envelope(), message });
}

function queryTargetRect(): Promise<AuditElementRect | null> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (result: AuditElementRect | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(callbackTimer);
      resolve(result);
    };
    const failQuery = (error: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(callbackTimer);
      reject(error);
    };
    const callbackTimer = setTimeout(() => finish(null), QUERY_CALLBACK_TIMEOUT_MS);

    try {
      const query = uni.createSelectorQuery();
      if (adapterPlatform === 'mp-weixin' && !instance?.proxy) {
        failQuery(new Error('mp-selector-scope-unavailable'));
        return;
      }
      if (adapterPlatform === 'unknown') {
        failQuery(new Error('runtime-platform-unsupported'));
        return;
      }
      const targetQuery = adapterPlatform === 'mp-weixin' ? query.in(instance!.proxy!) : query;
      targetQuery
        .selectAll(TARGET_SELECTOR)
        .boundingClientRect(result => {
          const matches = Array.isArray(result) ? result : [];
          finish(matches.length === 1 ? normalizeAuditElementRect(matches[0]) : null);
        })
        .exec();
    } catch (error) {
      failQuery(error);
    }
  });
}

function scheduleProbe() {
  if (!active || readyEmitted || failureEmitted) return;
  probeTimer = setTimeout(runProbe, PROBE_INTERVAL_MS);
}

async function runProbe() {
  probeTimer = null;
  if (!active || readyEmitted || failureEmitted) return;
  probeAttempts += 1;
  try {
    const rect = await queryTargetRect();
    if (!active) return;
    if (rect && auditElementRectsEqual(previousRect, rect)) stableReads += 1;
    else stableReads = rect ? 1 : 0;
    previousRect = rect;
    if (rect && stableReads >= 2) {
      const locator = targetLocator;
      if (!locator) {
        fail('runtime-platform-unsupported');
        return;
      }
      readyEmitted = true;
      emit('ready', {
        ...envelope(),
        targetLocator: locator,
        rect,
        state: { ...state.value },
      });
      return;
    }
    if (probeAttempts >= MAX_PROBE_ATTEMPTS) {
      fail(`target-not-stable:${TARGET_SELECTOR}:attempts=${probeAttempts}`);
      return;
    }
    scheduleProbe();
  } catch (error) {
    fail(`target-query:${String(error)}`);
  }
}

function handleClick() {
  if (targetLocator?.interactionCapability !== 'tap') return;
  clickCount.value += 1;
  const payload: AuditAdapterEventPayload = {
    ...envelope(),
    name: 'click',
    detail: { ...state.value },
  };
  emit('event', payload);
}

onMounted(async () => {
  await nextTick();
  if (active) void runProbe();
});

onBeforeUnmount(() => {
  active = false;
  if (probeTimer !== null) clearTimeout(probeTimer);
  probeTimer = null;
});
</script>

<template>
  <view
    id="audit-button-adapter"
    class="audit-component-evidence"
    data-audit-adapter="button"
    :data-audit-generation="String(adapterGeneration)"
    :data-audit-click-count="String(clickCount)"
    :data-audit-locator-kind="targetLocator?.kind || 'unavailable'"
    :data-audit-locator-scope="targetLocator?.scope || 'unavailable'"
    :data-audit-locator-interaction="targetLocator?.interactionCapability || 'none'"
  >
    <lk-button id="audit-button-target" :ripple="false" @click="handleClick">
      确定性按钮
    </lk-button>
    <text class="audit-component-evidence__state">{{ stateJson }}</text>
  </view>
</template>

<style scoped lang="scss">
.audit-component-evidence {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.audit-component-evidence__state {
  display: block;
  margin-top: 16rpx;
  color: var(--lk-text-secondary);
  font-family: monospace;
  font-size: 20rpx;
  line-height: 1.4;
}
</style>
