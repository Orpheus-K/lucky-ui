export const AUDIT_COMPONENT_SLUGS = [
  'action-sheet',
  'anchor',
  'avatar',
  'backtop',
  'badge',
  'button',
  'calendar',
  'calendar-picker',
  'card',
  'carousel',
  'cell',
  'chart-area',
  'chart-bar',
  'chart-line',
  'chart-pie',
  'chart-radar-lite',
  'chart-ring',
  'chart-sparkline',
  'chart-stat-card',
  'checkbox',
  'choice',
  'collapse',
  'countdown',
  'curtain',
  'divider',
  'dropdown',
  'empty',
  'fab',
  'form',
  'form-group',
  'grid',
  'horizontal-scroll',
  'icon',
  'image',
  'input',
  'keyboard',
  'loading',
  'meta-row',
  'modal',
  'navbar',
  'notice-bar',
  'number-roller',
  'overlay',
  'page',
  'picker',
  'popup',
  'preload-debugger',
  'progress',
  'pull-refresh',
  'radio',
  'rate',
  'root',
  'segmented',
  'select-list',
  'skeleton',
  'slider',
  'space',
  'stepper',
  'sticky',
  'switch',
  'tab',
  'tabbar',
  'tabbar-container',
  'tag',
  'textarea',
  'timeline',
  'toast',
  'tooltip',
  'upload',
  'verify-code',
  'virtual-list',
  'waterfall',
  'watermark',
] as const;

export type AuditComponentSlug = (typeof AUDIT_COMPONENT_SLUGS)[number];
export type AuditTheme = 'light' | 'dark';
export type AuditMotion = 'full' | 'css-tokens-reduced';
export type AuditProfile = 'render-baseline';
export type AuditScenario = 'none';
export type AuditComponentKind = 'public' | 'internal-debug';
export type AuditInteractionCapability = 'none' | 'tap';
export type AuditMotionCoverage = 'css-tokens-only';
export type AuditComponentStatus = 'pending-adapter' | 'booting' | 'ready' | 'failed';
export type AuditEvidenceScope = 'fixture-shell' | 'component';
export type AuditRuntimePlatform = 'h5' | 'mp-weixin' | 'unknown';
export type AuditEvidenceSessionStatus = 'idle' | 'booting' | 'ready' | 'failed';
export type AuditJsonPrimitive = string | number | boolean | null;
export type AuditJsonValue = AuditJsonPrimitive | AuditJsonValue[] | AuditJsonObject;
export interface AuditJsonObject {
  readonly [key: string]: AuditJsonValue;
}

export interface AuditElementRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface AuditAdapterEnvelope {
  component: AuditComponentSlug;
  fingerprint: string;
  generation: number;
}

export interface AuditH5TargetLocator {
  kind: 'page-selector';
  platform: 'h5';
  scope: 'page';
  selector: string;
  measurement: 'page-selector-query';
  interactionCapability: 'tap';
}

export interface AuditMpTargetLocator {
  kind: 'scoped-render';
  platform: 'mp-weixin';
  scope: 'adapter-component';
  selector: string;
  measurement: 'component-scoped-selector-query';
  interactionCapability: 'none';
}

export type AuditTargetLocator = AuditH5TargetLocator | AuditMpTargetLocator;

export interface AuditAdapterReadyPayload extends AuditAdapterEnvelope {
  targetLocator: AuditTargetLocator;
  rect: AuditElementRect;
  state: Readonly<Record<string, unknown>>;
}

export interface AuditAdapterEventPayload extends AuditAdapterEnvelope {
  name: string;
  detail: Readonly<Record<string, unknown>>;
}

export interface AuditAdapterErrorPayload extends AuditAdapterEnvelope {
  message: string;
}

export interface AuditEvidenceHistoryEntry {
  sequence: number;
  generation: number;
  name: string;
  /** reducer ingress 已验证并复制为 JSON-safe 值；保留 unknown 避免 Vue 深层解包递归类型。 */
  detail?: unknown;
}

export interface AuditEvidenceFailure {
  kind: 'viewport' | 'terminal';
  reason: string;
  generation: number;
}

export interface AuditEvidenceSessionState {
  component: AuditComponentSlug;
  fingerprint: string;
  platform: AuditRuntimePlatform;
  generation: number;
  viewportValid: boolean;
  status: AuditEvidenceSessionStatus;
  evidence: AuditAdapterReadyPayload | null;
  targetLocator: AuditTargetLocator | null;
  activeInteractionCapability: AuditInteractionCapability;
  failure: AuditEvidenceFailure | null;
  history: AuditEvidenceHistoryEntry[];
}

export type AuditEvidenceSessionAction =
  | { type: 'viewport'; valid: boolean; reason?: string }
  | { type: 'adapter-ready'; payload: AuditAdapterReadyPayload }
  | { type: 'adapter-event'; payload: AuditAdapterEventPayload }
  | { type: 'adapter-error'; payload: AuditAdapterErrorPayload }
  | { type: 'runtime-error'; message: string }
  | { type: 'note'; name: string; detail?: unknown };

export const AUDIT_ADAPTED_COMPONENT_SLUGS = [
  'button',
] as const satisfies readonly AuditComponentSlug[];

const AUDIT_ADAPTER_CAPABILITIES = {
  button: 'tap',
} as const satisfies Record<
  (typeof AUDIT_ADAPTED_COMPONENT_SLUGS)[number],
  AuditInteractionCapability
>;

export const AUDIT_REMOTE_RESOURCE_COMPONENT_SLUGS = [
  'anchor',
  'avatar',
  'card',
  'curtain',
  'empty',
  'image',
  'preload-debugger',
  'skeleton',
  'timeline',
  'upload',
  'waterfall',
] as const satisfies readonly AuditComponentSlug[];

export interface AuditFixtureQuery {
  component?: string;
  profile?: string;
  scenario?: string;
  theme?: string;
  brand?: string;
  locale?: string;
  motion?: string;
  clock?: string;
  seed?: string;
  viewport?: string;
}

export interface AuditFixtureConfig {
  component: AuditComponentSlug;
  componentKind: AuditComponentKind;
  previewSlug: string;
  profile: AuditProfile;
  scenario: AuditScenario;
  interactionCapability: AuditInteractionCapability;
  theme: AuditTheme;
  brand: string;
  locale: string;
  motion: AuditMotion;
  motionCoverage: AuditMotionCoverage;
  clock: string;
  clockMs: number;
  seed: number;
  viewport: string;
  viewportWidth: number;
  viewportHeight: number;
  viewportMetric: 'uni-window-css-px';
  resourcePolicy: 'known-direct-remote-deny';
  resourceEnforcement: 'direct-demo-literal-scan';
}

export interface AuditFixtureParseResult {
  config: AuditFixtureConfig;
  errors: string[];
  fingerprint: string;
}

export interface AuditStorageAdapter {
  listKeys: () => string[];
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
  remove: (key: string) => void;
}

interface AuditStorageSnapshot {
  key: string;
  exists: boolean;
  value: unknown;
}

const COMPONENT_SET = new Set<string>(AUDIT_COMPONENT_SLUGS);
const ADAPTED_COMPONENT_SET = new Set<string>(AUDIT_ADAPTED_COMPONENT_SLUGS);
const REMOTE_RESOURCE_COMPONENT_SET = new Set<string>(AUDIT_REMOTE_RESOURCE_COMPONENT_SLUGS);
const SUPPORTED_LOCALES = ['zh-Hans', 'zh-Hant', 'en', 'ja', 'ko', 'fr', 'es', 'pt-BR'] as const;
const LOCALE_MAP = new Map(SUPPORTED_LOCALES.map(locale => [locale.toLowerCase(), locale]));
const DEFAULT_CLOCK = '2026-08-13T00:00:00.000Z';
const DEFAULT_VIEWPORT = '390x844';
const BRAND_PATTERN = /^#[0-9a-f]{6}$/i;
const VIEWPORT_PATTERN = /^(\d{3,4})x(\d{3,4})$/;
const CANONICAL_UTC_CLOCK_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const AUDIT_JSON_MAX_DEPTH = 32;
const AUDIT_JSON_MAX_NODES = 10000;
const AUDIT_JSON_MAX_STRING_LENGTH = 16384;
const AUDIT_JSON_MAX_KEY_LENGTH = 256;
const AUDIT_JSON_MAX_TOTAL_CHARACTERS = 65536;
const AUDIT_HISTORY_MAX_ENTRIES = 512;

function normalizeComponent(value: string | undefined): string {
  return (value || 'button').trim().toLowerCase().replace(/^lk-/, '');
}

function normalizeEnum<T extends string>(
  value: string | undefined,
  fallback: T,
  values: readonly T[],
  field: string,
  errors: string[]
): T {
  const normalized = (value || fallback).trim().toLowerCase() as T;
  if (values.includes(normalized)) return normalized;
  errors.push(`${field}=${value || ''} 不在允许范围内`);
  return fallback;
}

function getPreviewSlug(component: AuditComponentSlug): string {
  return component === 'preload-debugger' ? 'preload' : component;
}

function getComponentKind(component: AuditComponentSlug): AuditComponentKind {
  return component === 'preload-debugger' ? 'internal-debug' : 'public';
}

export function hasAuditComponentAdapter(
  component: AuditComponentSlug
): component is (typeof AUDIT_ADAPTED_COMPONENT_SLUGS)[number] {
  return ADAPTED_COMPONENT_SET.has(component);
}

export function getAuditInteractionCapability(
  component: AuditComponentSlug
): AuditInteractionCapability {
  return hasAuditComponentAdapter(component) ? AUDIT_ADAPTER_CAPABILITIES[component] : 'none';
}

function roundAuditMetric(value: number): number {
  const rounded = Math.round(value * 1000) / 1000;
  return Object.is(rounded, -0) ? 0 : rounded;
}

export function normalizeAuditElementRect(value: unknown): AuditElementRect | null {
  const inspected = readAuditIngressData(value, ['left', 'top', 'width', 'height'], 'element-rect');
  if (inspected.error) return null;
  const candidate = inspected.value!;
  const metrics = [candidate.left, candidate.top, candidate.width, candidate.height];
  if (!metrics.every(metric => typeof metric === 'number' && Number.isFinite(metric))) return null;
  if ((candidate.width as number) <= 0 || (candidate.height as number) <= 0) return null;
  const normalized = {
    left: roundAuditMetric(candidate.left as number),
    top: roundAuditMetric(candidate.top as number),
    width: roundAuditMetric(candidate.width as number),
    height: roundAuditMetric(candidate.height as number),
  };
  const normalizedMetrics = [normalized.left, normalized.top, normalized.width, normalized.height];
  if (!normalizedMetrics.every(Number.isFinite)) return null;
  if (normalized.width <= 0 || normalized.height <= 0) return null;
  return normalized;
}

interface AuditJsonNormalizationResult {
  value?: AuditJsonValue;
  error?: string;
}

/**
 * 将跨组件证据复制为有界、无环且不会被 JSON.stringify 静默改写的 JSON 值。
 */
export function normalizeAuditJsonValue(value: unknown): AuditJsonNormalizationResult {
  const ancestors = new WeakSet<object>();
  let nodes = 0;
  let characters = 0;

  function consumeCharacters(
    candidate: string,
    path: string,
    kind: 'string' | 'key'
  ): string | null {
    const limit = kind === 'string' ? AUDIT_JSON_MAX_STRING_LENGTH : AUDIT_JSON_MAX_KEY_LENGTH;
    if (candidate.length > limit) return `${path}:${kind}-too-long`;
    characters += candidate.length;
    return characters > AUDIT_JSON_MAX_TOTAL_CHARACTERS ? `${path}:character-limit` : null;
  }

  function visit(candidate: unknown, path: string, depth: number): AuditJsonNormalizationResult {
    nodes += 1;
    if (nodes > AUDIT_JSON_MAX_NODES) return { error: `${path}:node-limit` };
    if (depth > AUDIT_JSON_MAX_DEPTH) return { error: `${path}:depth-limit` };
    if (candidate === null || typeof candidate === 'boolean') {
      return { value: candidate };
    }
    if (typeof candidate === 'string') {
      const error = consumeCharacters(candidate, path, 'string');
      return error ? { error } : { value: candidate };
    }
    if (typeof candidate === 'number') {
      return Number.isFinite(candidate)
        ? { value: Object.is(candidate, -0) ? 0 : candidate }
        : { error: `${path}:number-not-finite` };
    }
    if (typeof candidate !== 'object') return { error: `${path}:type-${typeof candidate}` };
    if (ancestors.has(candidate)) return { error: `${path}:cycle` };
    ancestors.add(candidate);
    try {
      if (Object.getOwnPropertySymbols(candidate).length > 0) {
        return { error: `${path}:symbol-key` };
      }
      if (Array.isArray(candidate)) {
        if (Object.getPrototypeOf(candidate) !== Array.prototype) {
          return { error: `${path}:non-standard-array` };
        }
        const lengthDescriptor = Object.getOwnPropertyDescriptor(candidate, 'length');
        if (
          !lengthDescriptor ||
          !('value' in lengthDescriptor) ||
          !Number.isSafeInteger(lengthDescriptor.value) ||
          lengthDescriptor.value < 0
        ) {
          return { error: `${path}:array-length-invalid` };
        }
        const length = lengthDescriptor.value;
        if (length > AUDIT_JSON_MAX_NODES - nodes) return { error: `${path}:node-limit` };
        const ownNames = Object.getOwnPropertyNames(candidate);
        if (ownNames.length !== length + 1 || !ownNames.includes('length')) {
          return { error: `${path}:array-extra-key-or-hole` };
        }
        const result: AuditJsonValue[] = [];
        for (let index = 0; index < length; index += 1) {
          const descriptor = Object.getOwnPropertyDescriptor(candidate, String(index));
          if (!descriptor) {
            return { error: `${path}[${index}]:array-hole` };
          }
          if (!('value' in descriptor)) {
            return { error: `${path}[${index}]:accessor` };
          }
          const normalized = visit(descriptor.value, `${path}[${index}]`, depth + 1);
          if (normalized.error) return normalized;
          result.push(normalized.value!);
        }
        return { value: result };
      }

      const prototype = Object.getPrototypeOf(candidate);
      if (prototype !== Object.prototype && prototype !== null) {
        return { error: `${path}:non-plain-object` };
      }
      const ownNames = Object.getOwnPropertyNames(candidate);
      const enumerableKeys = Object.keys(candidate);
      if (ownNames.length !== enumerableKeys.length) {
        return { error: `${path}:non-enumerable-key` };
      }
      const result: Record<string, AuditJsonValue> = {};
      for (const key of enumerableKeys) {
        const keyError = consumeCharacters(key, path, 'key');
        if (keyError) return { error: keyError };
        const descriptor = Object.getOwnPropertyDescriptor(candidate, key);
        if (!descriptor || !('value' in descriptor)) {
          return { error: `${path}.${key}:accessor` };
        }
        const normalized = visit(descriptor.value, `${path}.${key}`, depth + 1);
        if (normalized.error) return normalized;
        Object.defineProperty(result, key, {
          value: normalized.value!,
          enumerable: true,
          configurable: true,
          writable: true,
        });
      }
      return { value: result };
    } catch {
      return { error: `${path}:inspection-failed` };
    } finally {
      ancestors.delete(candidate);
    }
  }

  return visit(value, '$', 0);
}

function normalizeAuditJsonObject(
  value: unknown,
  field: string
): { value?: AuditJsonObject; error?: string } {
  const normalized = normalizeAuditJsonValue(value);
  if (normalized.error) return { error: `${field}:${normalized.error}` };
  if (
    !normalized.value ||
    typeof normalized.value !== 'object' ||
    Array.isArray(normalized.value)
  ) {
    return { error: `${field}:must-be-object` };
  }
  return { value: normalized.value };
}

export function auditElementRectsEqual(
  first: AuditElementRect | null,
  second: AuditElementRect | null
): boolean {
  return Boolean(
    first &&
      second &&
      first.left === second.left &&
      first.top === second.top &&
      first.width === second.width &&
      first.height === second.height
  );
}

export function createAuditTargetLocator(
  platform: AuditRuntimePlatform,
  selector: string
): AuditTargetLocator | null {
  if (platform === 'h5') {
    return {
      kind: 'page-selector',
      platform,
      scope: 'page',
      selector,
      measurement: 'page-selector-query',
      interactionCapability: 'tap',
    };
  }
  if (platform === 'mp-weixin') {
    return {
      kind: 'scoped-render',
      platform,
      scope: 'adapter-component',
      selector,
      measurement: 'component-scoped-selector-query',
      interactionCapability: 'none',
    };
  }
  return null;
}

export function createAuditEvidenceSession(options: {
  component: AuditComponentSlug;
  fingerprint: string;
  platform: AuditRuntimePlatform;
  initialGeneration?: number;
}): AuditEvidenceSessionState {
  return {
    component: options.component,
    fingerprint: options.fingerprint,
    platform: options.platform,
    generation: options.initialGeneration ?? 0,
    viewportValid: false,
    status: 'idle',
    evidence: null,
    targetLocator: null,
    activeInteractionCapability: 'none',
    failure: null,
    history: [],
  };
}

function appendAuditEvidenceHistory(
  state: AuditEvidenceSessionState,
  entries: Array<Omit<AuditEvidenceHistoryEntry, 'sequence'>>
): AuditEvidenceHistoryEntry[] {
  let sequence = state.history.at(-1)?.sequence ?? 0;
  const history = [
    ...state.history,
    ...entries.map(entry => ({
      ...entry,
      sequence: (sequence += 1),
    })),
  ];
  return history.length > AUDIT_HISTORY_MAX_ENTRIES
    ? history.slice(-AUDIT_HISTORY_MAX_ENTRIES)
    : history;
}

function failAuditEvidenceSession(
  state: AuditEvidenceSessionState,
  kind: AuditEvidenceFailure['kind'],
  reason: string
): AuditEvidenceSessionState {
  const revokedGeneration = state.generation;
  const shouldRevoke = state.status === 'booting' || state.status === 'ready';
  const entries: Array<Omit<AuditEvidenceHistoryEntry, 'sequence'>> = [];
  if (shouldRevoke) {
    entries.push({
      generation: revokedGeneration,
      name: 'component-revoked',
      detail: { reason, hadEvidence: state.evidence !== null },
    });
  }
  entries.push({
    generation: revokedGeneration,
    name: 'component-failed',
    detail: { kind, reason },
  });
  return {
    ...state,
    generation: shouldRevoke ? revokedGeneration + 1 : revokedGeneration,
    status: 'failed',
    evidence: null,
    targetLocator: null,
    activeInteractionCapability: 'none',
    failure: { kind, reason, generation: revokedGeneration },
    history: appendAuditEvidenceHistory(state, entries),
  };
}

function recordStaleEnvelope(
  state: AuditEvidenceSessionState,
  envelope: AuditAdapterEnvelope,
  envelopeType: 'ready' | 'event' | 'error'
): AuditEvidenceSessionState {
  return {
    ...state,
    history: appendAuditEvidenceHistory(state, [
      {
        generation: state.generation,
        name: 'component-stale-ignored',
        detail: {
          envelopeType,
          staleGeneration: envelope.generation,
          currentGeneration: state.generation,
        },
      },
    ]),
  };
}

function validateAuditAdapterEnvelope(
  state: AuditEvidenceSessionState,
  envelope: AuditAdapterEnvelope
): string | null {
  if (envelope.component !== state.component) {
    return `component-mismatch:expected=${state.component},actual=${envelope.component}`;
  }
  if (envelope.fingerprint !== state.fingerprint) {
    return `fingerprint-mismatch:expected=${state.fingerprint},actual=${envelope.fingerprint}`;
  }
  return null;
}

function readAuditIngressData(
  value: unknown,
  fields: readonly string[],
  label: string
): { value?: Record<string, unknown>; error?: string } {
  try {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return { error: `${label}-malformed` };
    }
    const result: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
    for (const field of fields) {
      const descriptor = Object.getOwnPropertyDescriptor(value, field);
      if (!descriptor) return { error: `${label}-${field}-missing` };
      if (!('value' in descriptor)) return { error: `${label}-${field}-accessor` };
      result[field] = descriptor.value;
    }
    return { value: result };
  } catch {
    return { error: `${label}-inspection-failed` };
  }
}

function formatAuditDiagnosticValue(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'undefined') {
    return String(value);
  }
  if (typeof value === 'string') {
    return value.length <= AUDIT_JSON_MAX_KEY_LENGTH ? value : 'string-too-long';
  }
  if (typeof value === 'bigint') return 'bigint';
  if (typeof value === 'symbol') return 'symbol';
  if (typeof value === 'function') return 'function';
  return 'object';
}

function normalizeAuditTargetLocator(
  platform: AuditRuntimePlatform,
  value: unknown
): { value?: AuditTargetLocator; error?: string } {
  if (!value || typeof value !== 'object') {
    return { error: 'target-locator-malformed' };
  }
  try {
    if (Array.isArray(value)) return { error: 'target-locator-malformed' };
  } catch {
    return { error: 'target-locator-inspection-failed' };
  }
  const normalized = normalizeAuditJsonObject(value, 'target-locator');
  if (normalized.error) return { error: normalized.error };
  const locator = normalized.value!;
  const expectedKeys = [
    'interactionCapability',
    'kind',
    'measurement',
    'platform',
    'scope',
    'selector',
  ];
  if (Object.keys(locator).sort().join('|') !== expectedKeys.join('|')) {
    return { error: 'target-locator-fields-invalid' };
  }
  if (typeof locator.selector !== 'string' || locator.selector.trim() === '') {
    return { error: 'target-locator-selector-empty' };
  }
  if (platform === 'h5') {
    return locator.platform === 'h5' &&
      locator.kind === 'page-selector' &&
      locator.scope === 'page' &&
      locator.measurement === 'page-selector-query' &&
      locator.interactionCapability === 'tap'
      ? {
          value: {
            kind: 'page-selector',
            platform: 'h5',
            scope: 'page',
            selector: locator.selector,
            measurement: 'page-selector-query',
            interactionCapability: 'tap',
          },
        }
      : { error: 'h5-locator-must-be-page-tappable' };
  }
  if (platform === 'mp-weixin') {
    return locator.platform === 'mp-weixin' &&
      locator.kind === 'scoped-render' &&
      locator.scope === 'adapter-component' &&
      locator.measurement === 'component-scoped-selector-query' &&
      locator.interactionCapability === 'none'
      ? {
          value: {
            kind: 'scoped-render',
            platform: 'mp-weixin',
            scope: 'adapter-component',
            selector: locator.selector,
            measurement: 'component-scoped-selector-query',
            interactionCapability: 'none',
          },
        }
      : { error: 'mp-locator-must-be-scoped-noninteractive' };
  }
  return { error: 'runtime-platform-unsupported' };
}

export function reduceAuditEvidenceSession(
  state: AuditEvidenceSessionState,
  action: AuditEvidenceSessionAction
): AuditEvidenceSessionState {
  if (state.failure?.kind === 'terminal') {
    return action.type === 'viewport' ? { ...state, viewportValid: action.valid } : state;
  }
  if (state.history.length >= AUDIT_HISTORY_MAX_ENTRIES - 2) {
    return failAuditEvidenceSession(state, 'terminal', 'history-entry-limit');
  }
  if (action.type === 'note') {
    if (
      typeof action.name !== 'string' ||
      action.name.trim() === '' ||
      action.name.length > AUDIT_JSON_MAX_KEY_LENGTH
    ) {
      return failAuditEvidenceSession(state, 'terminal', 'note-name-invalid');
    }
    const normalizedDetail =
      action.detail === undefined ? undefined : normalizeAuditJsonValue(action.detail);
    if (normalizedDetail?.error) {
      return failAuditEvidenceSession(state, 'terminal', `note-detail:${normalizedDetail.error}`);
    }
    return {
      ...state,
      history: appendAuditEvidenceHistory(state, [
        { generation: state.generation, name: action.name, detail: normalizedDetail?.value },
      ]),
    };
  }

  if (action.type === 'viewport') {
    if (!action.valid) {
      if (!state.viewportValid && state.failure?.kind === 'viewport') return state;
      const failed = failAuditEvidenceSession(
        state,
        'viewport',
        action.reason || 'viewport-mismatch'
      );
      return { ...failed, viewportValid: false };
    }

    if (state.viewportValid && (state.status === 'booting' || state.status === 'ready')) {
      return state;
    }

    const generation = state.generation === 0 ? 1 : state.generation;
    const nextState: AuditEvidenceSessionState = {
      ...state,
      generation,
      viewportValid: true,
      status: 'booting',
      evidence: null,
      targetLocator: null,
      activeInteractionCapability: 'none',
      failure: null,
    };
    return {
      ...nextState,
      history: appendAuditEvidenceHistory(state, [
        { generation, name: 'component-generation-started' },
      ]),
    };
  }

  if (action.type === 'runtime-error') {
    if (
      typeof action.message !== 'string' ||
      action.message.length > AUDIT_JSON_MAX_STRING_LENGTH
    ) {
      return failAuditEvidenceSession(state, 'terminal', 'runtime-message-invalid');
    }
    return failAuditEvidenceSession(state, 'terminal', `runtime:${action.message}`);
  }

  const ingressEnvelope = readAuditIngressData(
    action.payload,
    ['component', 'fingerprint', 'generation'],
    'adapter-envelope'
  );
  if (ingressEnvelope.error) {
    return failAuditEvidenceSession(state, 'terminal', ingressEnvelope.error);
  }
  const component = ingressEnvelope.value!.component;
  const fingerprint = ingressEnvelope.value!.fingerprint;
  const generation = ingressEnvelope.value!.generation;
  if (typeof component !== 'string' || component.length > AUDIT_JSON_MAX_KEY_LENGTH) {
    return failAuditEvidenceSession(state, 'terminal', 'adapter-envelope-component-invalid');
  }
  if (typeof fingerprint !== 'string' || fingerprint.length > AUDIT_JSON_MAX_STRING_LENGTH) {
    return failAuditEvidenceSession(state, 'terminal', 'adapter-envelope-fingerprint-invalid');
  }
  const envelope: AuditAdapterEnvelope = {
    component: component as AuditComponentSlug,
    fingerprint,
    generation: typeof generation === 'number' ? generation : Number.NaN,
  };
  const envelopeType =
    action.type === 'adapter-ready' ? 'ready' : action.type === 'adapter-event' ? 'event' : 'error';
  if (typeof generation !== 'number' || !Number.isSafeInteger(generation) || generation <= 0) {
    return failAuditEvidenceSession(
      state,
      'terminal',
      `generation-invalid:${formatAuditDiagnosticValue(generation)}`
    );
  }
  if (envelope.generation < state.generation) {
    return recordStaleEnvelope(state, envelope, envelopeType);
  }
  if (envelope.generation > state.generation) {
    return failAuditEvidenceSession(
      state,
      'terminal',
      `generation-ahead:expected=${state.generation},actual=${envelope.generation}`
    );
  }

  const envelopeError = validateAuditAdapterEnvelope(state, envelope);
  if (envelopeError) return failAuditEvidenceSession(state, 'terminal', envelopeError);

  if (action.type === 'adapter-error') {
    const errorPayload = readAuditIngressData(action.payload, ['message'], 'adapter-error');
    if (errorPayload.error) {
      return failAuditEvidenceSession(state, 'terminal', errorPayload.error);
    }
    const message = errorPayload.value!.message;
    if (typeof message !== 'string' || message.length > AUDIT_JSON_MAX_STRING_LENGTH) {
      return failAuditEvidenceSession(state, 'terminal', 'adapter-error-message-invalid');
    }
    return failAuditEvidenceSession(
      state,
      'terminal',
      `adapter-error:${envelope.component}:${message}`
    );
  }

  if (action.type === 'adapter-ready') {
    if (state.status === 'ready') {
      return failAuditEvidenceSession(state, 'terminal', `duplicate-ready:${envelope.component}`);
    }
    if (!state.viewportValid || state.status !== 'booting') {
      return failAuditEvidenceSession(
        state,
        'terminal',
        `ready-outside-booting:${envelope.component}`
      );
    }
    const readyPayload = readAuditIngressData(
      action.payload,
      ['targetLocator', 'rect', 'state'],
      'adapter-ready'
    );
    if (readyPayload.error) {
      return failAuditEvidenceSession(state, 'terminal', readyPayload.error);
    }
    const normalizedLocator = normalizeAuditTargetLocator(
      state.platform,
      readyPayload.value!.targetLocator
    );
    if (normalizedLocator.error) {
      return failAuditEvidenceSession(state, 'terminal', normalizedLocator.error);
    }
    const rect = normalizeAuditElementRect(readyPayload.value!.rect);
    if (!rect) return failAuditEvidenceSession(state, 'terminal', 'ready-rect-invalid');
    const normalizedState = normalizeAuditJsonObject(readyPayload.value!.state, 'ready-state');
    if (normalizedState.error) {
      return failAuditEvidenceSession(state, 'terminal', normalizedState.error);
    }
    const targetLocator = normalizedLocator.value!;
    const evidence: AuditAdapterReadyPayload = {
      component: state.component,
      fingerprint: state.fingerprint,
      generation: state.generation,
      targetLocator,
      rect,
      state: normalizedState.value!,
    };
    return {
      ...state,
      status: 'ready',
      evidence,
      targetLocator,
      activeInteractionCapability: targetLocator.interactionCapability,
      failure: null,
      history: appendAuditEvidenceHistory(state, [
        {
          generation: state.generation,
          name: 'component-ready',
          detail: {
            component: envelope.component,
            targetLocator,
            rect,
            state: normalizedState.value!,
          },
        },
      ]),
    };
  }

  const eventPayload = readAuditIngressData(action.payload, ['name', 'detail'], 'adapter-event');
  if (eventPayload.error) {
    return failAuditEvidenceSession(state, 'terminal', eventPayload.error);
  }
  const eventName = eventPayload.value!.name;
  if (
    typeof eventName !== 'string' ||
    eventName.trim() === '' ||
    eventName.length > AUDIT_JSON_MAX_KEY_LENGTH
  ) {
    return failAuditEvidenceSession(state, 'terminal', 'event-name-invalid');
  }
  if (state.status !== 'ready' || !state.evidence) {
    return failAuditEvidenceSession(
      state,
      'terminal',
      `event-before-ready:${envelope.component}:${eventName}`
    );
  }
  if (state.activeInteractionCapability !== 'tap') {
    return failAuditEvidenceSession(
      state,
      'terminal',
      `interaction-not-supported:${state.platform}:${eventName}`
    );
  }
  const normalizedDetail = normalizeAuditJsonObject(eventPayload.value!.detail, 'event-detail');
  if (normalizedDetail.error) {
    return failAuditEvidenceSession(state, 'terminal', normalizedDetail.error);
  }
  return {
    ...state,
    history: appendAuditEvidenceHistory(state, [
      {
        generation: state.generation,
        name: `component:${envelope.component}:${eventName}`,
        detail: normalizedDetail.value!,
      },
    ]),
  };
}

export function getCurrentAuditComponentEvents(
  state: AuditEvidenceSessionState | null,
  evidenceReady: boolean
): AuditEvidenceHistoryEntry[] {
  if (!evidenceReady || !state || state.status !== 'ready' || !state.evidence) return [];
  const eventPrefix = `component:${state.component}:`;
  return state.history.filter(
    entry => entry.generation === state.generation && entry.name.startsWith(eventPrefix)
  );
}

export function stableAuditConfigJson(config: AuditFixtureConfig): string {
  return JSON.stringify({
    component: config.component,
    componentKind: config.componentKind,
    previewSlug: config.previewSlug,
    profile: config.profile,
    scenario: config.scenario,
    interactionCapability: config.interactionCapability,
    theme: config.theme,
    brand: config.brand,
    locale: config.locale,
    motion: config.motion,
    motionCoverage: config.motionCoverage,
    clock: config.clock,
    seed: config.seed,
    viewport: config.viewport,
    viewportMetric: config.viewportMetric,
    resourcePolicy: config.resourcePolicy,
    resourceEnforcement: config.resourceEnforcement,
  });
}

export function fingerprintAuditConfig(config: AuditFixtureConfig): string {
  const input = stableAuditConfigJson(config);
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function parseAuditFixtureQuery(query: AuditFixtureQuery = {}): AuditFixtureParseResult {
  const errors: string[] = [];
  const normalizedComponent = normalizeComponent(query.component);
  const component = COMPONENT_SET.has(normalizedComponent)
    ? (normalizedComponent as AuditComponentSlug)
    : 'button';
  if (!COMPONENT_SET.has(normalizedComponent)) {
    errors.push(`component=${query.component || ''} 不是 73 个已审计组件目录之一`);
  }

  const profileCandidate = (query.profile || 'render-baseline').trim().toLowerCase();
  const profileValid = profileCandidate === 'render-baseline';
  if (!profileValid) {
    errors.push(`profile=${query.profile || ''} 尚未注册`);
  }

  const scenarioCandidate = (query.scenario || 'none').trim().toLowerCase();
  const scenarioValid = scenarioCandidate === 'none';
  if (!scenarioValid) {
    errors.push(`scenario=${query.scenario || ''} 尚未注册组件级适配器`);
  }

  if (REMOTE_RESOURCE_COMPONENT_SET.has(component)) {
    errors.push(`component=${component} 的现有 demo 含已知直接远程 URL，演练场拒绝渲染`);
  }

  const theme = normalizeEnum(query.theme, 'light', ['light', 'dark'], 'theme', errors);
  const motion = normalizeEnum(
    query.motion,
    'css-tokens-reduced',
    ['full', 'css-tokens-reduced'],
    'motion',
    errors
  );

  const brandCandidate = (query.brand || '#6965db').trim().toLowerCase();
  const brand = BRAND_PATTERN.test(brandCandidate) ? brandCandidate : '#6965db';
  if (!BRAND_PATTERN.test(brandCandidate)) {
    errors.push(`brand=${query.brand || ''} 必须是六位 HEX 颜色`);
  }

  const localeCandidate = (query.locale || 'zh-Hans').trim();
  const locale = LOCALE_MAP.get(localeCandidate.toLowerCase()) || 'zh-Hans';
  if (!LOCALE_MAP.has(localeCandidate.toLowerCase())) {
    errors.push(`locale=${query.locale || ''} 不受支持`);
  }

  const clockCandidate = (query.clock || DEFAULT_CLOCK).trim();
  const clockCandidateMs = CANONICAL_UTC_CLOCK_PATTERN.test(clockCandidate)
    ? Date.parse(clockCandidate)
    : Number.NaN;
  const clockValid =
    Number.isFinite(clockCandidateMs) &&
    new Date(clockCandidateMs).toISOString() === clockCandidate;
  const clockMs = clockValid ? clockCandidateMs : Date.parse(DEFAULT_CLOCK);
  const clock = new Date(clockMs).toISOString();
  if (!clockValid) {
    errors.push(`clock=${query.clock || ''} 必须是带毫秒的 UTC ISO 时间`);
  }

  const seedCandidate =
    query.seed === undefined || query.seed.trim() === '' ? Number.NaN : Number(query.seed);
  const seed =
    Number.isInteger(seedCandidate) && seedCandidate >= 0 && seedCandidate <= 0xffffffff
      ? seedCandidate
      : 20260813;
  if (query.seed !== undefined && seed !== seedCandidate) {
    errors.push(`seed=${query.seed || ''} 必须是 0..4294967295 的整数`);
  }

  const viewportCandidate = (query.viewport || DEFAULT_VIEWPORT).trim().toLowerCase();
  const viewportMatch = VIEWPORT_PATTERN.exec(viewportCandidate);
  let viewportWidth = 390;
  let viewportHeight = 844;
  if (viewportMatch) {
    viewportWidth = Number(viewportMatch[1]);
    viewportHeight = Number(viewportMatch[2]);
  }
  const viewportValid = Boolean(
    viewportMatch &&
      viewportWidth >= 240 &&
      viewportWidth <= 2048 &&
      viewportHeight >= 320 &&
      viewportHeight <= 4096
  );
  if (!viewportValid) {
    errors.push(`viewport=${query.viewport || ''} 必须是合理的 宽x高 CSS px`);
    viewportWidth = 390;
    viewportHeight = 844;
  }
  const viewport = `${viewportWidth}x${viewportHeight}`;

  const config: AuditFixtureConfig = {
    component,
    componentKind: getComponentKind(component),
    previewSlug: getPreviewSlug(component),
    profile: 'render-baseline',
    scenario: 'none',
    interactionCapability: getAuditInteractionCapability(component),
    theme,
    brand,
    locale,
    motion,
    motionCoverage: 'css-tokens-only',
    clock,
    clockMs,
    seed,
    viewport,
    viewportWidth,
    viewportHeight,
    viewportMetric: 'uni-window-css-px',
    resourcePolicy: 'known-direct-remote-deny',
    resourceEnforcement: 'direct-demo-literal-scan',
  };

  return {
    config,
    errors,
    fingerprint: fingerprintAuditConfig(config),
  };
}

export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function installAuditDeterminism(
  config: AuditFixtureConfig,
  monotonicNow?: () => number
): () => void {
  const OriginalDate = globalThis.Date;
  const originalRandom = Math.random;
  const seededRandom = createSeededRandom(config.seed);
  const readMonotonic =
    monotonicNow ||
    (typeof globalThis.performance?.now === 'function'
      ? () => globalThis.performance.now()
      : () => OriginalDate.now());
  const readFiniteMonotonic = () => {
    const value = readMonotonic();
    if (!Number.isFinite(value)) throw new Error(`audit-clock:non-finite:${String(value)}`);
    return value;
  };
  const monotonicStart = readFiniteMonotonic();
  let lastElapsed = 0;
  const currentClockMs = () => {
    const candidate = Math.max(0, readFiniteMonotonic() - monotonicStart);
    lastElapsed = Math.max(lastElapsed, candidate);
    return config.clockMs + Math.floor(lastElapsed);
  };
  const FixedDate = function AuditDate(this: Date, ...args: unknown[]) {
    if (!new.target) return new OriginalDate(currentClockMs()).toString();
    return Reflect.construct(OriginalDate, args.length ? args : [currentClockMs()], new.target);
  } as unknown as DateConstructor;

  Object.setPrototypeOf(FixedDate, OriginalDate);
  Object.setPrototypeOf(FixedDate.prototype, OriginalDate.prototype);
  FixedDate.now = currentClockMs;
  FixedDate.parse = OriginalDate.parse;
  FixedDate.UTC = OriginalDate.UTC;

  globalThis.Date = FixedDate;
  Math.random = seededRandom;

  return () => {
    if (globalThis.Date === FixedDate) globalThis.Date = OriginalDate;
    if (Math.random === seededRandom) Math.random = originalRandom;
  };
}

export function applyTemporaryStorageOverlay(
  storage: AuditStorageAdapter,
  values: Readonly<Record<string, unknown>>,
  apply: () => void
): void {
  const keys = Object.keys(values);
  const existingKeys = new Set(storage.listKeys());
  const snapshots: AuditStorageSnapshot[] = keys.map(key => ({
    key,
    exists: existingKeys.has(key),
    value: existingKeys.has(key) ? storage.get(key) : undefined,
  }));
  let applyFailed = false;
  let applyError: unknown;

  try {
    for (const key of keys) storage.set(key, values[key]);
    apply();
  } catch (error) {
    applyFailed = true;
    applyError = error;
  }

  const restoreErrors: string[] = [];
  for (const snapshot of [...snapshots].reverse()) {
    try {
      if (snapshot.exists) storage.set(snapshot.key, snapshot.value);
      else storage.remove(snapshot.key);
    } catch (error) {
      restoreErrors.push(`${snapshot.key}:${String(error)}`);
    }
  }

  if (applyFailed || restoreErrors.length > 0) {
    const parts = [
      ...(applyFailed ? [`apply:${String(applyError)}`] : []),
      ...restoreErrors.map(error => `restore:${error}`),
    ];
    throw new Error(`storage-overlay:${parts.join('|')}`);
  }
}
