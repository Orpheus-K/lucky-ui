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
export type AuditInteractionCapability = 'none';
export type AuditMotionCoverage = 'css-tokens-only';

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
const REMOTE_RESOURCE_COMPONENT_SET = new Set<string>(AUDIT_REMOTE_RESOURCE_COMPONENT_SLUGS);
const SUPPORTED_LOCALES = ['zh-Hans', 'zh-Hant', 'en', 'ja', 'ko', 'fr', 'es', 'pt-BR'] as const;
const LOCALE_MAP = new Map(SUPPORTED_LOCALES.map(locale => [locale.toLowerCase(), locale]));
const DEFAULT_CLOCK = '2026-08-13T00:00:00.000Z';
const DEFAULT_VIEWPORT = '390x844';
const BRAND_PATTERN = /^#[0-9a-f]{6}$/i;
const VIEWPORT_PATTERN = /^(\d{3,4})x(\d{3,4})$/;
const CANONICAL_UTC_CLOCK_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

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
    interactionCapability: 'none',
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
