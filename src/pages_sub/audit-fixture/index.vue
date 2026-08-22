<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onErrorCaptured, onMounted, ref } from 'vue';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import AuditAdapterRenderer from '@/components/audit/AuditAdapterRenderer.vue';
import PreviewDemoRenderer from '@/components/preview/PreviewDemoRenderer.vue';
import {
  createAuditEvidenceSession,
  getCurrentAuditComponentEvents,
  hasAuditComponentAdapter,
  installAuditDeterminism,
  parseAuditFixtureQuery,
  reduceAuditEvidenceSession,
  stableAuditConfigJson,
  type AuditAdapterErrorPayload,
  type AuditAdapterEventPayload,
  type AuditAdapterReadyPayload,
  type AuditComponentStatus,
  type AuditEvidenceSessionAction,
  type AuditEvidenceSessionState,
  type AuditEvidenceScope,
  type AuditFixtureParseResult,
  type AuditFixtureQuery,
  type AuditRuntimePlatform,
} from '@/components/audit/audit-fixture';
import { Locale } from '@/uni_modules/lucky-ui/locale';
import { generateBrandVars } from '@/uni_modules/lucky-ui/theme/src/brand-color';

type WindowResizeUni = typeof uni & {
  onWindowResize?: (callback: () => void) => void;
  offWindowResize?: (callback: () => void) => void;
};

type RuntimeErrorUni = typeof uni & {
  onError?: (callback: (error: string) => void) => void;
  offError?: (callback: (error: string) => void) => void;
  onUnhandledRejection?: (callback: (result: { reason: unknown }) => void) => void;
  offUnhandledRejection?: (callback: (result: { reason: unknown }) => void) => void;
};

const buildIdentity = __LUCKY_UI_BUILD_IDENTITY__;
const parseResult = ref<AuditFixtureParseResult | null>(null);
const initialized = ref(false);
const shellReady = ref(false);
const environmentValid = ref(false);
const runtimeErrors = ref<string[]>([]);
const evidenceSession = ref<AuditEvidenceSessionState | null>(null);
const actualViewport = ref('pending');
const viewportMatches = ref(false);
const platform = ref<AuditRuntimePlatform>('unknown');
const runtimeErrorCapture = ref<'pending' | 'h5-global' | 'mp-global' | 'unsupported'>('pending');
let restoreDeterminism: (() => void) | null = null;
let restoreEnvironment: (() => void) | null = null;
let restoreRuntimeCapture: (() => void) | null = null;
let restoreResizeCapture: (() => void) | null = null;
let disposed = false;
let lifecycleGeneration = 0;
let evidenceGenerationEpoch = 0;

// #ifdef H5
platform.value = 'h5';
// #endif
// #ifdef MP-WEIXIN
platform.value = 'mp-weixin';
// #endif

const config = computed(() => parseResult.value?.config);
const configJson = computed(() => (config.value ? stableAuditConfigJson(config.value) : '{}'));
const validationErrors = computed(() => {
  const errors = [...(parseResult.value?.errors || []), ...runtimeErrors.value];
  if (!buildIdentity.valid) {
    errors.push('build-identity:必须来自干净、可验证 Git 工作树的一次全新静态构建');
  }
  if (actualViewport.value !== 'pending' && !viewportMatches.value) {
    errors.push(
      `viewport-mismatch:expected=${config.value?.viewport || 'unknown'},actual=${actualViewport.value}`
    );
  }
  return [...new Set(errors)];
});
const errorsJson = computed(() => JSON.stringify(validationErrors.value));
const eventsJson = computed(() => JSON.stringify(evidenceSession.value?.history || []));
const fixtureValid = computed(
  () =>
    initialized.value &&
    environmentValid.value &&
    buildIdentity.valid &&
    viewportMatches.value &&
    validationErrors.value.length === 0
);
const canRenderPreview = computed(() => fixtureValid.value);
const adapterSupported = computed(() =>
  config.value ? hasAuditComponentAdapter(config.value.component) : false
);
const componentEvidence = computed(() => evidenceSession.value?.evidence || null);
const componentStatus = computed<AuditComponentStatus>(() => {
  if (!adapterSupported.value) return 'pending-adapter';
  if (evidenceSession.value?.status === 'failed') return 'failed';
  if (evidenceSession.value?.status === 'ready') return 'ready';
  return 'booting';
});
const evidenceReady = computed(
  () =>
    shellReady.value &&
    fixtureValid.value &&
    componentStatus.value === 'ready' &&
    componentEvidence.value !== null
);
const componentEvents = computed(() =>
  getCurrentAuditComponentEvents(evidenceSession.value, evidenceReady.value)
);
const lastComponentEvent = computed(() => componentEvents.value.at(-1) || null);
const lastComponentEventDetailJson = computed(() =>
  JSON.stringify(lastComponentEvent.value?.detail ?? null)
);
const evidenceScope = computed<AuditEvidenceScope>(() =>
  evidenceReady.value ? 'component' : 'fixture-shell'
);
const activeInteractionCapability = computed(() =>
  evidenceReady.value ? evidenceSession.value?.activeInteractionCapability || 'none' : 'none'
);
const targetLocator = computed(() => evidenceSession.value?.targetLocator || null);
const targetLocatorJson = computed(() => JSON.stringify(targetLocator.value));
const adapterGeneration = computed(() => evidenceSession.value?.generation || 0);
const canMountAdapter = computed(
  () =>
    canRenderPreview.value &&
    adapterSupported.value &&
    (evidenceSession.value?.status === 'booting' || evidenceSession.value?.status === 'ready')
);
const componentEvidenceJson = computed(() => JSON.stringify(componentEvidence.value));
const stateJson = computed(() =>
  JSON.stringify({
    initialized: initialized.value,
    shellReady: shellReady.value,
    evidenceReady: evidenceReady.value,
    fixtureValid: fixtureValid.value,
    evidenceScope: evidenceScope.value,
    componentStatus: componentStatus.value,
    generation: adapterGeneration.value,
    interactionCapability: activeInteractionCapability.value,
    targetLocator: targetLocator.value,
    componentEventCount: componentEvents.value.length,
    lastComponentEvent: lastComponentEvent.value?.name || '',
    lastComponentEventDetail: lastComponentEvent.value?.detail ?? null,
    build: buildIdentity,
    platform: platform.value,
    actualViewport: actualViewport.value,
    viewportMatches: viewportMatches.value,
    viewportMetric: config.value?.viewportMetric || 'uni-window-css-px',
    runtimeErrorCapture: runtimeErrorCapture.value,
    themeScope: 'fixture-root',
    brandScope: 'fixture-root',
    nativeSystemUiScope: 'not-controlled',
  })
);
const revisionLabel = computed(
  () =>
    `${buildIdentity.commit.slice(0, 12)}${buildIdentity.dirty ? '+dirty' : ''} / ${buildIdentity.sourceDigest.slice(0, 12)}`
);
const fixtureStyle = computed(() => {
  const brandVars = Object.entries(generateBrandVars(config.value?.brand || '#6965db'))
    .map(([key, value]) => `${key}:${value}`)
    .join(';');
  const motionVars =
    config.value?.motion === 'css-tokens-reduced'
      ? '--lk-transition-fast:0s linear;--lk-transition-base:0s linear;--lk-transition-slow:0s linear;--lk-transition-duration:0s;'
      : '';
  return `${brandVars};${motionVars}`;
});

function applyAuditEnvironment(result: AuditFixtureParseResult): () => void {
  const previousLocale = Locale.locale;
  try {
    Locale.use(result.config.locale);
    if (Locale.locale !== result.config.locale) {
      throw new Error(
        `locale-postcondition:expected=${result.config.locale},actual=${Locale.locale}`
      );
    }
  } catch (error) {
    try {
      Locale.use(previousLocale);
    } catch (rollbackError) {
      throw new Error(`environment:${String(error)}|rollback:${String(rollbackError)}`);
    }
    throw error;
  }
  return () => Locale.use(previousLocale);
}

function formatConsoleValue(value: unknown): string {
  if (value instanceof Error) return value.stack || `${value.name}: ${value.message}`;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function installRuntimeCapture(): () => void {
  const originalError = console.error;
  const originalWarn = console.warn;
  let active = true;
  const capturedError = (...args: unknown[]) => {
    if (active) {
      recordRuntimeFailure(`console-error:${args.map(formatConsoleValue).join(' ')}`);
    }
    Reflect.apply(originalError, console, args);
  };
  const capturedWarn = (...args: unknown[]) => {
    if (active) {
      recordRuntimeFailure(`console-warn:${args.map(formatConsoleValue).join(' ')}`);
    }
    Reflect.apply(originalWarn, console, args);
  };

  // #ifdef H5
  let windowListenersInstalled = false;
  const handleWindowError = (event: ErrorEvent) => {
    if (!active) return;
    const target = event.target as (EventTarget & { src?: string; href?: string }) | null;
    recordRuntimeFailure(
      `window-error:${event.message || target?.src || target?.href || 'resource-error'}`
    );
  };
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (active) {
      recordRuntimeFailure(`unhandled-rejection:${formatConsoleValue(event.reason)}`);
    }
  };
  // #endif

  // #ifdef MP-WEIXIN
  const runtimeUni = uni as RuntimeErrorUni;
  let appErrorInstalled = false;
  let rejectionInstalled = false;
  const handleAppError = (error: string) => {
    if (active) recordRuntimeFailure(`mp-app-error:${error}`);
  };
  const handleAppUnhandledRejection = (result: { reason: unknown }) => {
    if (active) {
      recordRuntimeFailure(`mp-unhandled-rejection:${formatConsoleValue(result.reason)}`);
    }
  };
  // #endif

  const restore = () => {
    active = false;
    const restoreErrors: string[] = [];
    if (console.error === capturedError) console.error = originalError;
    if (console.warn === capturedWarn) console.warn = originalWarn;
    // #ifdef H5
    if (windowListenersInstalled) {
      try {
        window.removeEventListener('error', handleWindowError, true);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      } catch (error) {
        restoreErrors.push(`window:${String(error)}`);
      }
    }
    // #endif
    // #ifdef MP-WEIXIN
    if (appErrorInstalled) {
      try {
        runtimeUni.offError?.(handleAppError);
      } catch (error) {
        restoreErrors.push(`mp-error:${String(error)}`);
      }
    }
    if (rejectionInstalled) {
      try {
        runtimeUni.offUnhandledRejection?.(handleAppUnhandledRejection);
      } catch (error) {
        restoreErrors.push(`mp-rejection:${String(error)}`);
      }
    }
    // #endif
    if (restoreErrors.length > 0) throw new Error(restoreErrors.join('|'));
  };

  try {
    console.error = capturedError;
    console.warn = capturedWarn;
    // #ifdef H5
    window.addEventListener('error', handleWindowError, true);
    windowListenersInstalled = true;
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    runtimeErrorCapture.value = 'h5-global';
    // #endif
    // #ifdef MP-WEIXIN
    if (
      typeof runtimeUni.onError !== 'function' ||
      typeof runtimeUni.offError !== 'function' ||
      typeof runtimeUni.onUnhandledRejection !== 'function' ||
      typeof runtimeUni.offUnhandledRejection !== 'function'
    ) {
      throw new Error('mp-global-error-api-incomplete');
    }
    runtimeUni.onError(handleAppError);
    appErrorInstalled = true;
    runtimeUni.onUnhandledRejection(handleAppUnhandledRejection);
    rejectionInstalled = true;
    runtimeErrorCapture.value = 'mp-global';
    // #endif
    if (!['h5-global', 'mp-global'].includes(runtimeErrorCapture.value)) {
      runtimeErrorCapture.value = 'unsupported';
      throw new Error('platform-global-error-capture-unsupported');
    }
  } catch (error) {
    runtimeErrorCapture.value = 'unsupported';
    try {
      restore();
    } catch (rollbackError) {
      throw new Error(`runtime-capture:${String(error)}|rollback:${String(rollbackError)}`);
    }
    throw error;
  }

  return restore;
}

function installResizeCapture(): () => void {
  const resizeUni = uni as WindowResizeUni;
  if (
    typeof resizeUni.onWindowResize !== 'function' ||
    typeof resizeUni.offWindowResize !== 'function'
  ) {
    return () => {};
  }
  let active = true;
  const handleResize = () => {
    if (active) readViewport();
  };
  resizeUni.onWindowResize(handleResize);
  return () => {
    active = false;
    resizeUni.offWindowResize?.(handleResize);
  };
}

function dispatchEvidence(action: AuditEvidenceSessionAction) {
  if (!evidenceSession.value) return;
  evidenceSession.value = reduceAuditEvidenceSession(evidenceSession.value, action);
  evidenceGenerationEpoch = Math.max(evidenceGenerationEpoch, evidenceSession.value.generation);
}

function recordEvent(name: string, detail?: unknown) {
  dispatchEvidence({ type: 'note', name, detail });
}

function recordRuntimeFailure(message: string) {
  dispatchEvidence({ type: 'runtime-error', message });
  runtimeErrors.value.push(message);
}

function dispatchAdapterAction(action: AuditEvidenceSessionAction) {
  if (!evidenceSession.value || disposed || !initialized.value) return;
  const previousFailure = evidenceSession.value.failure;
  dispatchEvidence(action);
  const currentFailure = evidenceSession.value?.failure;
  if (
    currentFailure?.kind === 'terminal' &&
    (currentFailure.generation !== previousFailure?.generation ||
      currentFailure.reason !== previousFailure?.reason)
  ) {
    runtimeErrors.value.push(`adapter:${currentFailure.reason}`);
  }
}

function handleAdapterReady(payload: AuditAdapterReadyPayload) {
  dispatchAdapterAction({ type: 'adapter-ready', payload });
}

function handleAdapterEvent(payload: AuditAdapterEventPayload) {
  dispatchAdapterAction({ type: 'adapter-event', payload });
}

function handleAdapterError(payload: AuditAdapterErrorPayload) {
  dispatchAdapterAction({ type: 'adapter-error', payload });
}

function restoreOwnedEnvironment() {
  try {
    restoreDeterminism?.();
  } catch (error) {
    runtimeErrors.value.push(`restore-determinism:${String(error)}`);
  }
  restoreDeterminism = null;
  try {
    restoreEnvironment?.();
  } catch (error) {
    runtimeErrors.value.push(`restore-environment:${String(error)}`);
  }
  restoreEnvironment = null;
}

function initialize(query: AuditFixtureQuery) {
  if (initialized.value) return;
  const result = parseAuditFixtureQuery(query);
  parseResult.value = result;
  runtimeErrors.value = [];
  evidenceSession.value = createAuditEvidenceSession({
    component: result.config.component,
    fingerprint: result.fingerprint,
    platform: platform.value,
    initialGeneration: evidenceGenerationEpoch + 1,
  });
  evidenceGenerationEpoch = evidenceSession.value.generation;
  disposed = false;
  runtimeErrorCapture.value = 'pending';
  try {
    restoreRuntimeCapture = installRuntimeCapture();
  } catch (error) {
    recordRuntimeFailure(`runtime-capture:${String(error)}`);
    environmentValid.value = false;
    initialized.value = true;
    return;
  }

  if (result.errors.length === 0 && buildIdentity.valid) {
    try {
      restoreEnvironment = applyAuditEnvironment(result);
      restoreDeterminism = installAuditDeterminism(result.config);
      environmentValid.value = true;
    } catch (error) {
      recordRuntimeFailure(`initialize:${String(error)}`);
      environmentValid.value = false;
      restoreOwnedEnvironment();
    }
  } else {
    environmentValid.value = false;
  }
  initialized.value = true;
}

function readViewport() {
  try {
    const info =
      typeof uni.getWindowInfo === 'function' ? uni.getWindowInfo() : uni.getSystemInfoSync();
    const width = Math.round(info.windowWidth);
    const height = Math.round(info.windowHeight);
    if (!Number.isFinite(width) || !Number.isFinite(height)) throw new Error('non-finite-window');
    actualViewport.value = `${width}x${height}`;
    viewportMatches.value =
      width === config.value?.viewportWidth && height === config.value?.viewportHeight;
    dispatchEvidence({
      type: 'viewport',
      valid: viewportMatches.value,
      reason: `viewport-mismatch:expected=${config.value?.viewport || 'unknown'},actual=${actualViewport.value}`,
    });
  } catch (error) {
    actualViewport.value = 'unavailable';
    viewportMatches.value = false;
    recordRuntimeFailure(`viewport:${String(error)}`);
  }
}

function cleanup() {
  if (disposed) return;
  disposed = true;
  lifecycleGeneration += 1;
  shellReady.value = false;
  evidenceSession.value = null;
  environmentValid.value = false;
  try {
    restoreResizeCapture?.();
  } catch (error) {
    runtimeErrors.value.push(`restore-resize:${String(error)}`);
  }
  restoreResizeCapture = null;
  restoreOwnedEnvironment();
  try {
    restoreRuntimeCapture?.();
  } catch (error) {
    runtimeErrors.value.push(`restore-runtime-capture:${String(error)}`);
  }
  restoreRuntimeCapture = null;
  initialized.value = false;
}

onErrorCaptured((error, _instance, info) => {
  recordRuntimeFailure(`vue-descendant:${info}:${formatConsoleValue(error)}`);
});

onLoad((query?: AuditFixtureQuery) => {
  initialize(query || {});
});

onMounted(async () => {
  if (!initialized.value) initialize({});
  const generation = ++lifecycleGeneration;
  readViewport();
  restoreResizeCapture = installResizeCapture();
  await nextTick();
  if (disposed || generation !== lifecycleGeneration || !initialized.value) return;
  shellReady.value = true;
  recordEvent('shell-ready', parseResult.value?.fingerprint);
});

onUnload(cleanup);
onBeforeUnmount(cleanup);
</script>

<template>
  <view
    v-if="initialized && config"
    id="audit-fixture-root"
    class="audit-fixture"
    :class="[`lk-theme-${config.theme}`, `audit-fixture--motion-${config.motion}`]"
    :style="fixtureStyle"
    :data-audit-shell-ready="String(shellReady)"
    :data-audit-evidence-ready="String(evidenceReady)"
    :data-audit-fixture-valid="String(fixtureValid)"
    :data-audit-error-count="String(validationErrors.length)"
    :data-audit-evidence-scope="evidenceScope"
    :data-audit-component-status="componentStatus"
    :data-audit-component="config.component"
    :data-audit-component-kind="config.componentKind"
    :data-audit-profile="config.profile"
    :data-audit-scenario="config.scenario"
    :data-audit-generation="String(adapterGeneration)"
    :data-audit-interaction-capability="activeInteractionCapability"
    :data-audit-target-locator="targetLocatorJson"
    :data-audit-target-selector="
      targetLocator?.kind === 'page-selector' ? targetLocator.selector : ''
    "
    :data-audit-target-scope="targetLocator?.scope || ''"
    :data-audit-target-interaction="targetLocator?.interactionCapability || 'none'"
    :data-audit-component-event-count="String(componentEvents.length)"
    :data-audit-last-component-event="lastComponentEvent?.name || ''"
    :data-audit-last-component-event-detail="lastComponentEventDetailJson"
    :data-audit-motion-coverage="config.motionCoverage"
    :data-audit-resource-policy="config.resourcePolicy"
    :data-audit-resource-enforcement="config.resourceEnforcement"
    :data-audit-fingerprint="parseResult?.fingerprint"
    :data-audit-commit="buildIdentity.commit"
    :data-audit-branch="buildIdentity.branch"
    :data-audit-dirty="String(buildIdentity.dirty)"
    :data-audit-source-digest="buildIdentity.sourceDigest"
    :data-audit-version="buildIdentity.version"
    :data-audit-build-mode="buildIdentity.buildMode"
    :data-audit-provenance="buildIdentity.provenance"
    :data-audit-platform="platform"
    :data-audit-viewport="actualViewport"
    :data-audit-viewport-metric="config.viewportMetric"
    :data-audit-viewport-match="String(viewportMatches)"
    :data-audit-runtime-error-capture="runtimeErrorCapture"
    data-audit-theme-scope="fixture-root"
    data-audit-brand-scope="fixture-root"
    data-audit-native-system-ui-scope="not-controlled"
  >
    <view class="audit-fixture__header">
      <text class="audit-fixture__title">{{ config.component }} / {{ config.profile }}</text>
      <text class="audit-fixture__revision">{{ revisionLabel }}</text>
    </view>

    <view
      class="audit-fixture__stage"
      :data-audit-preview-slug="config.previewSlug"
      :data-audit-preview-mounted="String(canRenderPreview)"
    >
      <audit-adapter-renderer
        v-if="canMountAdapter && parseResult"
        :key="`${parseResult.fingerprint}:${adapterGeneration}`"
        :component="config.component"
        :fingerprint="parseResult.fingerprint"
        :generation="adapterGeneration"
        :platform="platform"
        @ready="handleAdapterReady"
        @event="handleAdapterEvent"
        @error="handleAdapterError"
      />
      <preview-demo-renderer v-else-if="canRenderPreview" :slug="config.previewSlug" />
      <view v-else class="audit-fixture__invalid">
        <text>当前只允许确定性的壳层基线；配置、资源或环境不满足门槛时禁止生成组件证据。</text>
      </view>
    </view>

    <view class="audit-fixture__diagnostics">
      <text class="audit-fixture__config">{{ configJson }}</text>
      <text class="audit-fixture__state">{{ stateJson }}</text>
      <text class="audit-fixture__component-evidence">{{ componentEvidenceJson }}</text>
      <text class="audit-fixture__events">{{ eventsJson }}</text>
      <text class="audit-fixture__errors">{{ errorsJson }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.audit-fixture {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  color: var(--lk-text-primary);
  background: var(--lk-bg-page);
}

.audit-fixture__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72rpx;
  padding: 16rpx 24rpx;
  box-sizing: border-box;
  color: var(--lk-text-secondary);
  background: var(--lk-bg-card);
  border-bottom: 1rpx solid var(--lk-border-color);
}

.audit-fixture__title,
.audit-fixture__revision {
  font-family: monospace;
  font-size: 20rpx;
  line-height: 1.4;
}

.audit-fixture__stage {
  width: 100%;
  min-height: 480rpx;
  padding: 24rpx;
  box-sizing: border-box;
}

.audit-fixture__invalid {
  padding: 32rpx;
  color: var(--lk-color-danger);
  background: var(--lk-bg-card);
  border: 1rpx solid var(--lk-color-danger);
  border-radius: 16rpx;
}

.audit-fixture__diagnostics {
  display: flex;
  flex-direction: column;
  padding: 20rpx 24rpx 40rpx;
  background: var(--lk-bg-card);
  border-top: 1rpx solid var(--lk-border-color);
}

.audit-fixture__config,
.audit-fixture__state,
.audit-fixture__component-evidence,
.audit-fixture__events,
.audit-fixture__errors {
  display: block;
  overflow-wrap: anywhere;
  color: var(--lk-text-secondary);
  font-family: monospace;
  font-size: 18rpx;
  line-height: 1.5;
}

.audit-fixture__state,
.audit-fixture__component-evidence,
.audit-fixture__events,
.audit-fixture__errors {
  margin-top: 8rpx;
}

.audit-fixture__errors {
  color: var(--lk-color-danger);
}
</style>
