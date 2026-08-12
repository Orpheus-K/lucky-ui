<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onErrorCaptured, onMounted, ref } from 'vue';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import PreviewDemoRenderer from '@/components/preview/PreviewDemoRenderer.vue';
import {
  applyTemporaryStorageOverlay,
  installAuditDeterminism,
  parseAuditFixtureQuery,
  stableAuditConfigJson,
  type AuditFixtureParseResult,
  type AuditFixtureQuery,
  type AuditStorageAdapter,
} from '@/components/audit/audit-fixture';
import { Locale } from '@/uni_modules/lucky-ui/locale';
import { themeStore } from '@/uni_modules/lucky-ui/theme/src/theme-store';

interface AuditEvent {
  sequence: number;
  name: string;
  detail?: string;
}

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

const THEME_STORAGE_KEY = 'lk-theme';
const BRAND_STORAGE_KEY = 'lk-brand-color';
const buildIdentity = __LUCKY_UI_BUILD_IDENTITY__;
const parseResult = ref<AuditFixtureParseResult | null>(null);
const initialized = ref(false);
const shellReady = ref(false);
const evidenceReady = ref(false);
const environmentValid = ref(false);
const runtimeErrors = ref<string[]>([]);
const auditEvents = ref<AuditEvent[]>([]);
const actualViewport = ref('pending');
const viewportMatches = ref(false);
const platform = ref('unknown');
const runtimeErrorCapture = ref<'pending' | 'h5-global' | 'mp-global' | 'unsupported'>('pending');
let restoreDeterminism: (() => void) | null = null;
let restoreEnvironment: (() => void) | null = null;
let restoreRuntimeCapture: (() => void) | null = null;
let restoreResizeCapture: (() => void) | null = null;
let eventSequence = 0;
let disposed = false;
let lifecycleGeneration = 0;

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
const eventsJson = computed(() => JSON.stringify(auditEvents.value));
const fixtureValid = computed(
  () =>
    initialized.value &&
    environmentValid.value &&
    buildIdentity.valid &&
    viewportMatches.value &&
    validationErrors.value.length === 0
);
const canRenderPreview = computed(() => fixtureValid.value);
const stateJson = computed(() =>
  JSON.stringify({
    initialized: initialized.value,
    shellReady: shellReady.value,
    evidenceReady: evidenceReady.value,
    fixtureValid: fixtureValid.value,
    evidenceScope: 'fixture-shell',
    componentStatus: 'pending-adapter',
    interactionCapability: config.value?.interactionCapability || 'none',
    build: buildIdentity,
    platform: platform.value,
    actualViewport: actualViewport.value,
    viewportMatches: viewportMatches.value,
    viewportMetric: config.value?.viewportMetric || 'uni-window-css-px',
    runtimeErrorCapture: runtimeErrorCapture.value,
    nativeSystemUiScope: 'external-runtime-required',
  })
);
const revisionLabel = computed(
  () =>
    `${buildIdentity.commit.slice(0, 12)}${buildIdentity.dirty ? '+dirty' : ''} / ${buildIdentity.sourceDigest.slice(0, 12)}`
);
const fixtureStyle = computed(() => {
  const brandVars = themeStore.brandStyleVars;
  const motionVars =
    config.value?.motion === 'css-tokens-reduced'
      ? '--lk-transition-fast:0s linear;--lk-transition-base:0s linear;--lk-transition-slow:0s linear;--lk-transition-duration:0s;'
      : '';
  return `${brandVars};${motionVars}`;
});

const storageAdapter: AuditStorageAdapter = {
  listKeys() {
    const info = uni.getStorageInfoSync();
    if (!info || !Array.isArray(info.keys)) throw new Error('storage-info-without-keys');
    return [...info.keys];
  },
  get: key => uni.getStorageSync(key),
  set: (key, value) => uni.setStorageSync(key, value),
  remove: key => uni.removeStorageSync(key),
};

function restoreOriginalEnvironment(previousLocale: string): void {
  const errors: string[] = [];
  try {
    Locale.use(previousLocale);
  } catch (error) {
    errors.push(`locale:${String(error)}`);
  }
  try {
    themeStore.init();
  } catch (error) {
    errors.push(`theme:${String(error)}`);
  }
  if (errors.length > 0) throw new Error(errors.join('|'));
}

function applyAuditEnvironment(result: AuditFixtureParseResult): () => void {
  const previousLocale = Locale.locale;
  try {
    applyTemporaryStorageOverlay(
      storageAdapter,
      {
        [THEME_STORAGE_KEY]: result.config.theme,
        [BRAND_STORAGE_KEY]: result.config.brand,
      },
      () => {
        themeStore.init();
        Locale.use(result.config.locale);
        if (themeStore.theme !== result.config.theme) {
          throw new Error(
            `theme-postcondition:expected=${result.config.theme},actual=${themeStore.theme}`
          );
        }
        if (themeStore.brandColor.toLowerCase() !== result.config.brand.toLowerCase()) {
          throw new Error(
            `brand-postcondition:expected=${result.config.brand},actual=${themeStore.brandColor}`
          );
        }
        if (Locale.locale !== result.config.locale) {
          throw new Error(
            `locale-postcondition:expected=${result.config.locale},actual=${Locale.locale}`
          );
        }
      }
    );
  } catch (error) {
    try {
      restoreOriginalEnvironment(previousLocale);
    } catch (rollbackError) {
      throw new Error(`environment:${String(error)}|rollback:${String(rollbackError)}`);
    }
    throw error;
  }
  return () => restoreOriginalEnvironment(previousLocale);
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
    if (active) runtimeErrors.value.push(`console-error:${args.map(formatConsoleValue).join(' ')}`);
    Reflect.apply(originalError, console, args);
  };
  const capturedWarn = (...args: unknown[]) => {
    if (active) runtimeErrors.value.push(`console-warn:${args.map(formatConsoleValue).join(' ')}`);
    Reflect.apply(originalWarn, console, args);
  };

  // #ifdef H5
  let windowListenersInstalled = false;
  const handleWindowError = (event: ErrorEvent) => {
    if (!active) return;
    const target = event.target as (EventTarget & { src?: string; href?: string }) | null;
    runtimeErrors.value.push(
      `window-error:${event.message || target?.src || target?.href || 'resource-error'}`
    );
  };
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (active) runtimeErrors.value.push(`unhandled-rejection:${formatConsoleValue(event.reason)}`);
  };
  // #endif

  // #ifdef MP-WEIXIN
  const runtimeUni = uni as RuntimeErrorUni;
  let appErrorInstalled = false;
  let rejectionInstalled = false;
  const handleAppError = (error: string) => {
    if (active) runtimeErrors.value.push(`mp-app-error:${error}`);
  };
  const handleAppUnhandledRejection = (result: { reason: unknown }) => {
    if (active) {
      runtimeErrors.value.push(`mp-unhandled-rejection:${formatConsoleValue(result.reason)}`);
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

function recordEvent(name: string, detail?: string) {
  eventSequence += 1;
  auditEvents.value.push({ sequence: eventSequence, name, detail });
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
  auditEvents.value = [];
  eventSequence = 0;
  disposed = false;
  runtimeErrorCapture.value = 'pending';
  try {
    restoreRuntimeCapture = installRuntimeCapture();
  } catch (error) {
    runtimeErrors.value.push(`runtime-capture:${String(error)}`);
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
      runtimeErrors.value.push(`initialize:${String(error)}`);
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
  } catch (error) {
    runtimeErrors.value.push(`viewport:${String(error)}`);
    actualViewport.value = 'unavailable';
    viewportMatches.value = false;
  }
}

function cleanup() {
  if (disposed) return;
  disposed = true;
  lifecycleGeneration += 1;
  shellReady.value = false;
  evidenceReady.value = false;
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
  runtimeErrors.value.push(`vue-descendant:${info}:${formatConsoleValue(error)}`);
});

onLoad((query?: AuditFixtureQuery) => {
  initialize(query || {});
});

onMounted(async () => {
  if (!initialized.value) initialize({});
  const generation = ++lifecycleGeneration;
  // #ifdef H5
  platform.value = 'h5';
  // #endif
  // #ifdef MP-WEIXIN
  platform.value = 'mp-weixin';
  // #endif
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
    :class="[themeStore.themeClass, `audit-fixture--motion-${config.motion}`]"
    :style="fixtureStyle"
    :data-audit-shell-ready="String(shellReady)"
    :data-audit-evidence-ready="String(evidenceReady)"
    :data-audit-fixture-valid="String(fixtureValid)"
    :data-audit-error-count="String(validationErrors.length)"
    data-audit-evidence-scope="fixture-shell"
    data-audit-component-status="pending-adapter"
    :data-audit-component="config.component"
    :data-audit-component-kind="config.componentKind"
    :data-audit-profile="config.profile"
    :data-audit-scenario="config.scenario"
    :data-audit-interaction-capability="config.interactionCapability"
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
    data-audit-native-system-ui-scope="external-runtime-required"
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
      <preview-demo-renderer v-if="canRenderPreview" :slug="config.previewSlug" />
      <view v-else class="audit-fixture__invalid">
        <text>当前只允许确定性的壳层基线；配置、资源或环境不满足门槛时禁止生成组件证据。</text>
      </view>
    </view>

    <view class="audit-fixture__diagnostics">
      <text class="audit-fixture__config">{{ configJson }}</text>
      <text class="audit-fixture__state">{{ stateJson }}</text>
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
.audit-fixture__events,
.audit-fixture__errors {
  margin-top: 8rpx;
}

.audit-fixture__errors {
  color: var(--lk-color-danger);
}
</style>
