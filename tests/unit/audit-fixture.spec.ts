import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PREVIEW_DEMO_SLUGS } from '../../src/components/preview/preview-demo-registry';
import {
  AUDIT_ADAPTED_COMPONENT_SLUGS,
  AUDIT_COMPONENT_SLUGS,
  AUDIT_REMOTE_RESOURCE_COMPONENT_SLUGS,
  applyTemporaryStorageOverlay,
  auditElementRectsEqual,
  createAuditEvidenceSession,
  createSeededRandom,
  createAuditTargetLocator,
  fingerprintAuditConfig,
  getCurrentAuditComponentEvents,
  getAuditInteractionCapability,
  hasAuditComponentAdapter,
  installAuditDeterminism,
  normalizeAuditElementRect,
  normalizeAuditJsonValue,
  parseAuditFixtureQuery,
  reduceAuditEvidenceSession,
  stableAuditConfigJson,
  type AuditAdapterErrorPayload,
  type AuditAdapterEventPayload,
  type AuditAdapterReadyPayload,
  type AuditEvidenceSessionState,
  type AuditRuntimePlatform,
  type AuditStorageAdapter,
  type AuditTargetLocator,
} from '../../src/components/audit/audit-fixture';

const COMPONENT_ROOT = fileURLToPath(
  new URL('../../src/uni_modules/lucky-ui/components/', import.meta.url)
);
const DEMO_ROOT = fileURLToPath(new URL('../../src/pages_sub/components/demos/', import.meta.url));
const RENDERER_PATH = fileURLToPath(
  new URL('../../src/pages_sub/components/PreviewDemoRenderer.vue', import.meta.url)
);
const FIXTURE_PAGE_PATH = fileURLToPath(
  new URL('../../src/pages_sub/audit-fixture/index.vue', import.meta.url)
);
const ADAPTER_RENDERER_PATH = fileURLToPath(
  new URL('../../src/components/audit/AuditAdapterRenderer.vue', import.meta.url)
);
const BUTTON_ADAPTER_PATH = fileURLToPath(
  new URL('../../src/components/audit/adapters/ButtonAuditAdapter.vue', import.meta.url)
);

const STABLE_RECT = { left: 12, top: 24, width: 96, height: 44 } as const;

function startEvidenceSession(platform: AuditRuntimePlatform = 'h5'): AuditEvidenceSessionState {
  return reduceAuditEvidenceSession(
    createAuditEvidenceSession({
      component: 'button',
      fingerprint: 'fixture-fingerprint',
      platform,
    }),
    { type: 'viewport', valid: true }
  );
}

function readyPayload(
  state: AuditEvidenceSessionState,
  targetLocator: AuditTargetLocator
): AuditAdapterReadyPayload {
  return {
    component: 'button',
    fingerprint: state.fingerprint,
    generation: state.generation,
    targetLocator,
    rect: STABLE_RECT,
    state: { enabled: true, clickCount: 0 },
  };
}

describe('audit fixture contract', () => {
  it('covers exactly the 73 audited lk-* component directories', () => {
    const componentDirectories = readdirSync(COMPONENT_ROOT, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && entry.name.startsWith('lk-'))
      .map(entry => entry.name.replace(/^lk-/, ''))
      .sort();

    expect([...AUDIT_COMPONENT_SLUGS].sort()).toEqual(componentDirectories);
    expect(AUDIT_COMPONENT_SLUGS).toHaveLength(73);
    expect(new Set(AUDIT_COMPONENT_SLUGS).size).toBe(73);
    expect(AUDIT_COMPONENT_SLUGS).not.toContain('chart-lite');
    expect(AUDIT_COMPONENT_SLUGS).not.toContain('transition');
    expect(parseAuditFixtureQuery({ component: 'preload-debugger' }).config.componentKind).toBe(
      'internal-debug'
    );
  });

  it('keeps the preview registry and renderer branches in exact agreement', () => {
    const rendererSource = readFileSync(RENDERER_PATH, 'utf8');
    const rendererSlugs = [...rendererSource.matchAll(/activeSlug === ['"]([^'"]+)['"]/g)].map(
      match => match[1]
    );
    expect(rendererSlugs).toEqual([...PREVIEW_DEMO_SLUGS]);
    expect(new Set(rendererSlugs).size).toBe(rendererSlugs.length);
  });

  it('maps every audited component to a concrete preview renderer', () => {
    const previewSlugs = new Set<string>(PREVIEW_DEMO_SLUGS);
    for (const component of AUDIT_COMPONENT_SLUGS) {
      const result = parseAuditFixtureQuery({ component });
      expect(previewSlugs.has(result.config.previewSlug)).toBe(true);
    }
  });

  it('only grants interaction capability to components with a concrete adapter', () => {
    expect(AUDIT_ADAPTED_COMPONENT_SLUGS).toEqual(['button']);
    const rendererSource = readFileSync(ADAPTER_RENDERER_PATH, 'utf8');
    const rendererComponents = [...rendererSource.matchAll(/component === ['"]([^'"]+)['"]/g)].map(
      match => match[1]
    );
    expect(rendererComponents).toEqual([...AUDIT_ADAPTED_COMPONENT_SLUGS]);

    for (const component of AUDIT_COMPONENT_SLUGS) {
      const adapted = component === 'button';
      expect(hasAuditComponentAdapter(component)).toBe(adapted);
      expect(getAuditInteractionCapability(component)).toBe(adapted ? 'tap' : 'none');
    }
  });

  it('fails closed for every demo that still references a remote resource', () => {
    const detected = AUDIT_COMPONENT_SLUGS.filter(component => {
      const previewSlug = component === 'preload-debugger' ? 'preload' : component;
      const source = readFileSync(`${DEMO_ROOT}/${previewSlug}-demo.vue`, 'utf8');
      return /https?:\/\//.test(source);
    });

    expect([...AUDIT_REMOTE_RESOURCE_COMPONENT_SLUGS].sort()).toEqual(detected.sort());
    for (const component of AUDIT_REMOTE_RESOURCE_COMPONENT_SLUGS) {
      const result = parseAuditFixtureQuery({ component });
      expect(result.errors).toContain(
        `component=${component} 的现有 demo 含已知直接远程 URL，演练场拒绝渲染`
      );
    }
  });

  it('normalizes a complete query and exposes only the registered adapter capability', () => {
    const result = parseAuditFixtureQuery({
      component: 'lk-button',
      profile: 'render-baseline',
      scenario: 'none',
      theme: 'DARK',
      brand: '#ABCDEF',
      locale: 'pt-br',
      motion: 'full',
      clock: '2026-01-02T03:04:05.000Z',
      seed: '42',
      viewport: '430x932',
    });

    expect(result.errors).toEqual([]);
    expect(result.config).toMatchObject({
      component: 'button',
      componentKind: 'public',
      previewSlug: 'button',
      profile: 'render-baseline',
      scenario: 'none',
      interactionCapability: 'tap',
      theme: 'dark',
      brand: '#abcdef',
      locale: 'pt-BR',
      motion: 'full',
      motionCoverage: 'css-tokens-only',
      clock: '2026-01-02T03:04:05.000Z',
      seed: 42,
      viewport: '430x932',
      viewportMetric: 'uni-window-css-px',
      resourcePolicy: 'known-direct-remote-deny',
      resourceEnforcement: 'direct-demo-literal-scan',
    });
  });

  it('fails closed and reports every invalid input', () => {
    const result = parseAuditFixtureQuery({
      component: 'missing',
      profile: 'interactive',
      scenario: '../bad',
      theme: 'system',
      brand: 'red',
      locale: 'xx',
      motion: 'sometimes',
      clock: 'never',
      seed: '-1',
      viewport: 'wide',
    });

    expect(result.errors).toHaveLength(10);
    expect(result.config).toMatchObject({
      component: 'button',
      profile: 'render-baseline',
      scenario: 'none',
      interactionCapability: 'tap',
      theme: 'light',
      brand: '#6965db',
      locale: 'zh-Hans',
      motion: 'css-tokens-reduced',
      seed: 20260813,
      viewport: '390x844',
    });
  });

  it('rejects a named scenario until a component-level adapter exists', () => {
    const result = parseAuditFixtureQuery({ component: 'button', scenario: 'loading-race' });
    expect(result.config.scenario).toBe('none');
    expect(result.errors).toContain('scenario=loading-race 尚未注册组件级适配器');
  });

  it('serializes and fingerprints equal configs identically', () => {
    const first = parseAuditFixtureQuery({ component: 'button' }).config;
    const second = parseAuditFixtureQuery({ component: 'lk-button' }).config;
    expect(stableAuditConfigJson(first)).toBe(stableAuditConfigJson(second));
    expect(fingerprintAuditConfig(first)).toBe(fingerprintAuditConfig(second));
  });

  it('produces reproducible seeded random sequences', () => {
    const first = createSeededRandom(7);
    const second = createSeededRandom(7);
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });

  it('anchors the wall clock while allowing monotonic time to advance', () => {
    const originalDate = globalThis.Date;
    const originalRandom = Math.random;
    const config = parseAuditFixtureQuery({
      clock: '2026-01-02T03:04:05.000Z',
      seed: '7',
    }).config;
    const expectedRandom = createSeededRandom(7);
    let monotonicMs = 100;
    const restore = installAuditDeterminism(config, () => monotonicMs);

    try {
      expect(Date.now()).toBe(config.clockMs);
      monotonicMs += 250;
      expect(Date.now()).toBe(config.clockMs + 250);
      expect(new Date().toISOString()).toBe(new originalDate(config.clockMs + 250).toISOString());
      expect(Date()).toBe(new originalDate(config.clockMs + 250).toString());
      expect(Math.random()).toBe(expectedRandom());
    } finally {
      restore();
    }

    expect(globalThis.Date).toBe(originalDate);
    expect(Math.random).toBe(originalRandom);
  });

  it('never moves the deterministic clock backwards', () => {
    const config = parseAuditFixtureQuery({ clock: '2026-01-02T03:04:05.000Z' }).config;
    const readings = [100, 350, 120];
    const restore = installAuditDeterminism(config, () => readings.shift() ?? 120);

    try {
      expect(Date.now()).toBe(config.clockMs + 250);
      expect(Date.now()).toBe(config.clockMs + 250);
    } finally {
      restore();
    }
  });

  it('fails explicitly when the monotonic clock is not finite', () => {
    const config = parseAuditFixtureQuery().config;
    expect(() => installAuditDeterminism(config, () => Number.NaN)).toThrow(
      'audit-clock:non-finite:NaN'
    );
  });

  it('accepts only finite non-zero element rects and compares canonical metrics', () => {
    const first = normalizeAuditElementRect({
      left: 1.23456,
      top: 2.34567,
      width: 83.1919,
      height: 41.5999,
    });
    const second = normalizeAuditElementRect({
      left: 1.23451,
      top: 2.34561,
      width: 83.19151,
      height: 41.59951,
    });

    expect(first).toEqual({ left: 1.235, top: 2.346, width: 83.192, height: 41.6 });
    expect(auditElementRectsEqual(first, second)).toBe(true);
    const normalizedNegativeZeroRect = normalizeAuditElementRect({
      left: -0.0004,
      top: -0,
      width: 20,
      height: 20,
    });
    expect(normalizedNegativeZeroRect).toMatchObject({ left: 0, top: 0 });
    expect(Object.is(normalizedNegativeZeroRect?.left, -0)).toBe(false);
    expect(Object.is(normalizedNegativeZeroRect?.top, -0)).toBe(false);
    expect(normalizeAuditElementRect({ left: 0, top: 0, width: 0, height: 20 })).toBeNull();
    expect(normalizeAuditElementRect({ left: 0, top: 0, width: 0.0004, height: 20 })).toBeNull();
    expect(
      normalizeAuditElementRect({ left: 0, top: 0, width: Number.MAX_VALUE, height: 20 })
    ).toBeNull();
    expect(
      normalizeAuditElementRect({ left: 0, top: 0, width: Number.NaN, height: 20 })
    ).toBeNull();
    const rectWithAccessor = { left: 0, top: 0, width: 20, height: 20 };
    Object.defineProperty(rectWithAccessor, 'width', {
      get: () => {
        throw new Error('must-not-run');
      },
    });
    expect(() => normalizeAuditElementRect(rectWithAccessor)).not.toThrow();
    expect(normalizeAuditElementRect(rectWithAccessor)).toBeNull();
    expect(auditElementRectsEqual(first, null)).toBe(false);
  });

  it('copies only stable JSON evidence without silent serialization loss', () => {
    const source = { nested: [{ count: 1 }], enabled: true };
    const normalized = normalizeAuditJsonValue(source);
    expect(normalized).toEqual({ value: source });
    expect(normalized.value).not.toBe(source);
    expect((normalized.value as { nested: unknown[] }).nested).not.toBe(source.nested);

    expect(normalizeAuditJsonValue({ value: Number.NaN }).error).toContain('number-not-finite');
    expect(normalizeAuditJsonValue({ value: undefined }).error).toContain('type-undefined');
    expect(normalizeAuditJsonValue(new Map([['value', 1]])).error).toContain('non-plain-object');
    expect(normalizeAuditJsonValue({ value: 1n }).error).toContain('type-bigint');
    const normalizedNegativeZero = normalizeAuditJsonValue(-0);
    expect(normalizedNegativeZero.value).toBe(0);
    expect(Object.is(normalizedNegativeZero.value, -0)).toBe(false);
    expect(normalizeAuditJsonValue('x'.repeat(16385)).error).toContain('string-too-long');
    expect(normalizeAuditJsonValue({ ['x'.repeat(257)]: true }).error).toContain('key-too-long');
    expect(
      normalizeAuditJsonValue(Array.from({ length: 5 }, () => 'x'.repeat(16384))).error
    ).toContain('character-limit');
    const arrayWithIgnoredKey = [1] as number[] & { '01'?: number };
    arrayWithIgnoredKey['01'] = 2;
    expect(normalizeAuditJsonValue(arrayWithIgnoredKey).error).toContain('array-extra-key-or-hole');
    const arrayWithHiddenKey = [1] as number[] & { hidden?: number };
    Object.defineProperty(arrayWithHiddenKey, 'hidden', { value: 2 });
    expect(normalizeAuditJsonValue(arrayWithHiddenKey).error).toContain('array-extra-key-or-hole');
    const arrayWithAccessor = [1];
    Object.defineProperty(arrayWithAccessor, '0', {
      enumerable: true,
      get: () => {
        throw new Error('must-not-run');
      },
    });
    expect(() => normalizeAuditJsonValue(arrayWithAccessor)).not.toThrow();
    expect(normalizeAuditJsonValue(arrayWithAccessor).error).toContain('accessor');
    const cycle: Record<string, unknown> = {};
    cycle.self = cycle;
    expect(normalizeAuditJsonValue(cycle).error).toContain('cycle');
  });

  it('revokes ready evidence on viewport invalidation and requires a new generation to recover', () => {
    const locator = createAuditTargetLocator('h5', '#audit-button-target');
    expect(locator).not.toBeNull();
    let state = startEvidenceSession();
    const firstGeneration = state.generation;

    state = reduceAuditEvidenceSession(state, {
      type: 'adapter-ready',
      payload: readyPayload(state, locator!),
    });
    expect(state).toMatchObject({
      generation: firstGeneration,
      status: 'ready',
      activeInteractionCapability: 'tap',
    });
    expect(state.evidence).not.toBeNull();
    expect(state.targetLocator).toEqual(locator);

    state = reduceAuditEvidenceSession(state, {
      type: 'viewport',
      valid: false,
      reason: 'viewport-mismatch:expected=390x844,actual=430x932',
    });
    expect(state).toMatchObject({
      generation: firstGeneration + 1,
      viewportValid: false,
      status: 'failed',
      evidence: null,
      targetLocator: null,
      activeInteractionCapability: 'none',
      failure: { kind: 'viewport' },
    });
    expect(state.history.filter(entry => entry.name === 'component-revoked')).toHaveLength(1);

    state = reduceAuditEvidenceSession(state, { type: 'viewport', valid: true });
    expect(state).toMatchObject({
      generation: firstGeneration + 1,
      viewportValid: true,
      status: 'booting',
      evidence: null,
      targetLocator: null,
      activeInteractionCapability: 'none',
      failure: null,
    });
    expect(state.history.filter(entry => entry.name === 'component-ready')).toHaveLength(1);

    state = reduceAuditEvidenceSession(state, {
      type: 'adapter-ready',
      payload: readyPayload(state, locator!),
    });
    expect(state.status).toBe('ready');
    expect(state.evidence?.generation).toBe(firstGeneration + 1);
    expect(state.history.filter(entry => entry.name === 'component-ready')).toHaveLength(2);
    expect(state.history.map(entry => entry.sequence)).toEqual(
      state.history.map((_, index) => index + 1)
    );
  });

  it('atomically revokes evidence when a runtime error occurs after ready', () => {
    const locator = createAuditTargetLocator('h5', '#audit-button-target')!;
    let state = startEvidenceSession();
    state = reduceAuditEvidenceSession(state, {
      type: 'adapter-ready',
      payload: readyPayload(state, locator),
    });

    state = reduceAuditEvidenceSession(state, {
      type: 'runtime-error',
      message: 'console-error:render-failed',
    });

    expect(state).toMatchObject({
      status: 'failed',
      evidence: null,
      targetLocator: null,
      activeInteractionCapability: 'none',
      failure: { kind: 'terminal', reason: 'runtime:console-error:render-failed' },
    });
    expect(state.history.slice(-2).map(entry => entry.name)).toEqual([
      'component-revoked',
      'component-failed',
    ]);
  });

  it('revokes ready evidence when the current adapter generation reports an error', () => {
    const locator = createAuditTargetLocator('h5', '#audit-button-target')!;
    let state = startEvidenceSession();
    state = reduceAuditEvidenceSession(state, {
      type: 'adapter-ready',
      payload: readyPayload(state, locator),
    });
    state = reduceAuditEvidenceSession(state, {
      type: 'adapter-error',
      payload: {
        component: 'button',
        fingerprint: state.fingerprint,
        generation: state.generation,
        message: 'target-query:failed',
      },
    });

    expect(state).toMatchObject({
      status: 'failed',
      evidence: null,
      targetLocator: null,
      activeInteractionCapability: 'none',
      failure: { reason: 'adapter-error:button:target-query:failed' },
    });
  });

  it('ignores ready, event, and error envelopes from a stale generation', () => {
    const locator = createAuditTargetLocator('h5', '#audit-button-target')!;
    let state = startEvidenceSession();
    const staleReady = readyPayload(state, locator);
    state = reduceAuditEvidenceSession(state, { type: 'adapter-ready', payload: staleReady });
    state = reduceAuditEvidenceSession(state, { type: 'viewport', valid: false });
    state = reduceAuditEvidenceSession(state, { type: 'viewport', valid: true });
    state = reduceAuditEvidenceSession(state, {
      type: 'adapter-ready',
      payload: readyPayload(state, locator),
    });
    const currentEvidence = state.evidence;
    const staleEvent: AuditAdapterEventPayload = {
      component: 'button',
      fingerprint: state.fingerprint,
      generation: staleReady.generation,
      name: 'click',
      detail: { clickCount: 99 },
    };
    const staleError: AuditAdapterErrorPayload = {
      component: 'button',
      fingerprint: state.fingerprint,
      generation: staleReady.generation,
      message: 'late-query-failure',
    };

    state = reduceAuditEvidenceSession(state, { type: 'adapter-ready', payload: staleReady });
    state = reduceAuditEvidenceSession(state, { type: 'adapter-event', payload: staleEvent });
    state = reduceAuditEvidenceSession(state, { type: 'adapter-error', payload: staleError });

    expect(state.status).toBe('ready');
    expect(state.failure).toBeNull();
    expect(state.evidence).toBe(currentEvidence);
    expect(state.history.filter(entry => entry.name === 'component-stale-ignored')).toHaveLength(3);
  });

  it('fails closed for every future envelope instead of treating it as stale', () => {
    const locator = createAuditTargetLocator('h5', '#audit-button-target')!;
    for (const envelopeType of ['ready', 'event', 'error'] as const) {
      let state = startEvidenceSession();
      state = reduceAuditEvidenceSession(state, {
        type: 'adapter-ready',
        payload: readyPayload(state, locator),
      });
      const envelope = {
        component: 'button' as const,
        fingerprint: state.fingerprint,
        generation: state.generation + 1,
      };
      state =
        envelopeType === 'ready'
          ? reduceAuditEvidenceSession(state, {
              type: 'adapter-ready',
              payload: { ...readyPayload(state, locator), generation: envelope.generation },
            })
          : envelopeType === 'event'
            ? reduceAuditEvidenceSession(state, {
                type: 'adapter-event',
                payload: { ...envelope, name: 'click', detail: { clickCount: 1 } },
              })
            : reduceAuditEvidenceSession(state, {
                type: 'adapter-error',
                payload: { ...envelope, message: 'future-error' },
              });
      expect(state).toMatchObject({
        status: 'failed',
        evidence: null,
        targetLocator: null,
        failure: { reason: 'generation-ahead:expected=1,actual=2' },
      });
    }
  });

  it('fails closed for an invalid generation', () => {
    const locator = createAuditTargetLocator('h5', '#audit-button-target')!;

    let invalidState = startEvidenceSession();
    const invalidGeneration = readyPayload(invalidState, locator);
    invalidGeneration.generation = Number.NaN;
    invalidState = reduceAuditEvidenceSession(invalidState, {
      type: 'adapter-ready',
      payload: invalidGeneration,
    });
    expect(invalidState).toMatchObject({ status: 'failed', evidence: null });
    expect(invalidState.failure?.reason).toBe('generation-invalid:NaN');

    for (const invalidValue of [Object.create(null), new Proxy({}, {})]) {
      let malformedState = startEvidenceSession();
      const malformedGeneration = readyPayload(malformedState, locator);
      malformedGeneration.generation = invalidValue as unknown as number;
      expect(() => {
        malformedState = reduceAuditEvidenceSession(malformedState, {
          type: 'adapter-ready',
          payload: malformedGeneration,
        });
      }).not.toThrow();
      expect(malformedState).toMatchObject({
        status: 'failed',
        evidence: null,
        failure: { reason: 'generation-invalid:object' },
      });
    }

    let hostileState = startEvidenceSession();
    const hostilePayload = new Proxy(readyPayload(hostileState, locator), {
      getOwnPropertyDescriptor: () => {
        throw new Error('generation-inspection-failed');
      },
    });
    expect(() => {
      hostileState = reduceAuditEvidenceSession(hostileState, {
        type: 'adapter-ready',
        payload: hostilePayload,
      });
    }).not.toThrow();
    expect(hostileState).toMatchObject({
      status: 'failed',
      evidence: null,
      failure: { reason: 'adapter-envelope-inspection-failed' },
    });
  });

  it('rejects invalid ready geometry and non-JSON state before publishing evidence', () => {
    const locator = createAuditTargetLocator('h5', '#audit-button-target')!;
    for (const width of [Number.NaN, 0.0004, Number.MAX_VALUE]) {
      let invalidRectState = startEvidenceSession();
      const invalidRect = readyPayload(invalidRectState, locator);
      invalidRect.rect = { left: 0, top: 0, width, height: 44 };
      invalidRectState = reduceAuditEvidenceSession(invalidRectState, {
        type: 'adapter-ready',
        payload: invalidRect,
      });
      expect(invalidRectState).toMatchObject({
        status: 'failed',
        evidence: null,
        failure: { reason: 'ready-rect-invalid' },
      });
    }

    let invalidJsonState = startEvidenceSession();
    const invalidJson = readyPayload(invalidJsonState, locator);
    invalidJson.state = { value: 1n };
    invalidJsonState = reduceAuditEvidenceSession(invalidJsonState, {
      type: 'adapter-ready',
      payload: invalidJson,
    });
    expect(invalidJsonState).toMatchObject({ status: 'failed', evidence: null });
    expect(invalidJsonState.failure?.reason).toContain('ready-state:$');
  });

  it('copies accepted evidence and rejects non-JSON event or note details', () => {
    const locator = createAuditTargetLocator('h5', '#audit-button-target')!;
    let state = startEvidenceSession();
    const payload = readyPayload(state, locator);
    const originalState = payload.state;
    state = reduceAuditEvidenceSession(state, { type: 'adapter-ready', payload });
    expect(state.evidence?.state).toEqual(originalState);
    expect(state.evidence?.state).not.toBe(originalState);

    state = reduceAuditEvidenceSession(state, {
      type: 'adapter-event',
      payload: {
        component: 'button',
        fingerprint: state.fingerprint,
        generation: state.generation,
        name: 'click',
        detail: { bad: undefined },
      },
    });
    expect(state).toMatchObject({ status: 'failed', evidence: null, targetLocator: null });
    expect(state.failure?.reason).toContain('event-detail:$');

    let noteState = startEvidenceSession();
    noteState = reduceAuditEvidenceSession(noteState, {
      type: 'note',
      name: 'bad-note',
      detail: new Map([['bad', true]]),
    });
    expect(noteState.status).toBe('failed');
    expect(noteState.failure?.reason).toContain('note-detail:$');
  });

  it('rebuilds ready evidence from an exact whitelist without inspecting extra fields', () => {
    const locator = createAuditTargetLocator('h5', '#audit-button-target')!;
    let state = startEvidenceSession();
    const payload = readyPayload(state, locator) as AuditAdapterReadyPayload &
      Record<string, unknown>;
    payload.extraBigInt = 1n;
    payload.extraUndefined = undefined;
    const extraSymbol = Symbol('extra');
    Object.defineProperty(payload, extraSymbol, { value: 'ignored' });
    Object.defineProperty(payload, 'extraAccessor', {
      enumerable: true,
      get: () => {
        throw new Error('must-not-run');
      },
    });

    expect(() => {
      state = reduceAuditEvidenceSession(state, { type: 'adapter-ready', payload });
    }).not.toThrow();
    expect(state.status).toBe('ready');
    expect(Object.keys(state.evidence!).sort()).toEqual([
      'component',
      'fingerprint',
      'generation',
      'rect',
      'state',
      'targetLocator',
    ]);
    expect(Object.getOwnPropertySymbols(state.evidence!)).toEqual([]);
    expect(() => JSON.stringify(state)).not.toThrow();
  });

  it('fails closed before cumulative evidence history can grow without bound', () => {
    let state = createAuditEvidenceSession({
      component: 'button',
      fingerprint: 'fixture-fingerprint',
      platform: 'h5',
    });
    for (let index = 0; index < 512 && state.status !== 'failed'; index += 1) {
      state = reduceAuditEvidenceSession(state, {
        type: 'note',
        name: 'bounded-note',
        detail: { index },
      });
    }
    expect(state).toMatchObject({
      status: 'failed',
      evidence: null,
      failure: { reason: 'history-entry-limit' },
    });
    expect(state.history.length).toBeLessThanOrEqual(512);
    expect(state.history.at(-1)?.name).toBe('component-failed');
  });

  it('latches the first terminal failure when late actions arrive near the history limit', () => {
    const locator = createAuditTargetLocator('h5', '#audit-button-target')!;
    let state = startEvidenceSession();
    const payload = readyPayload(state, locator);
    state = reduceAuditEvidenceSession(state, { type: 'adapter-ready', payload });
    for (let index = 0; index < 507; index += 1) {
      state = reduceAuditEvidenceSession(state, {
        type: 'adapter-event',
        payload: {
          component: 'button',
          fingerprint: state.fingerprint,
          generation: state.generation,
          name: 'click',
          detail: { clickCount: index + 1 },
        },
      });
    }
    expect(state.history).toHaveLength(509);
    state = reduceAuditEvidenceSession(state, { type: 'adapter-ready', payload });
    expect(state).toMatchObject({
      status: 'failed',
      failure: { reason: 'duplicate-ready:button' },
    });
    expect(state.history).toHaveLength(511);
    const terminalState = state;

    state = reduceAuditEvidenceSession(state, {
      type: 'runtime-error',
      message: 'late-runtime-error',
    });
    expect(state).toBe(terminalState);
    state = reduceAuditEvidenceSession(state, {
      type: 'note',
      name: 'late-note',
      detail: { ignored: true },
    });
    expect(state).toBe(terminalState);
    state = reduceAuditEvidenceSession(state, { type: 'viewport', valid: false });
    expect(state).toMatchObject({
      viewportValid: false,
      failure: { reason: 'duplicate-ready:button' },
    });
    expect(state.history).toEqual(terminalState.history);
  });

  it('publishes a short event summary only for the ready current generation', () => {
    const locator = createAuditTargetLocator('h5', '#audit-button-target')!;
    let state = startEvidenceSession();
    state = reduceAuditEvidenceSession(state, {
      type: 'adapter-ready',
      payload: readyPayload(state, locator),
    });
    state = reduceAuditEvidenceSession(state, {
      type: 'adapter-event',
      payload: {
        component: 'button',
        fingerprint: state.fingerprint,
        generation: state.generation,
        name: 'click',
        detail: { clickCount: 1 },
      },
    });
    expect(getCurrentAuditComponentEvents(state, true)).toMatchObject([
      { generation: 1, name: 'component:button:click', detail: { clickCount: 1 } },
    ]);
    expect(getCurrentAuditComponentEvents(state, false)).toEqual([]);

    state = reduceAuditEvidenceSession(state, { type: 'viewport', valid: false });
    expect(getCurrentAuditComponentEvents(state, true)).toEqual([]);
    state = reduceAuditEvidenceSession(state, { type: 'viewport', valid: true });
    state = reduceAuditEvidenceSession(state, {
      type: 'adapter-ready',
      payload: readyPayload(state, locator),
    });
    expect(state.generation).toBe(2);
    expect(getCurrentAuditComponentEvents(state, true)).toEqual([]);

    state = reduceAuditEvidenceSession(state, {
      type: 'adapter-event',
      payload: {
        component: 'button',
        fingerprint: state.fingerprint,
        generation: state.generation,
        name: 'click',
        detail: { clickCount: 1 },
      },
    });
    expect(getCurrentAuditComponentEvents(state, true)).toMatchObject([
      { generation: 2, name: 'component:button:click', detail: { clickCount: 1 } },
    ]);

    state = reduceAuditEvidenceSession(state, {
      type: 'runtime-error',
      message: 'late-runtime-error',
    });
    expect(getCurrentAuditComponentEvents(state, true)).toEqual([]);
  });

  it('supports a monotonically increasing generation seed across fixture lifecycles', () => {
    const locator = createAuditTargetLocator('h5', '#audit-button-target')!;
    const stalePayload: AuditAdapterReadyPayload = {
      component: 'button',
      fingerprint: 'fixture-fingerprint',
      generation: 7,
      targetLocator: locator,
      rect: STABLE_RECT,
      state: { enabled: true },
    };
    let state = createAuditEvidenceSession({
      component: 'button',
      fingerprint: 'fixture-fingerprint',
      platform: 'h5',
      initialGeneration: 8,
    });
    state = reduceAuditEvidenceSession(state, { type: 'viewport', valid: true });
    state = reduceAuditEvidenceSession(state, { type: 'adapter-ready', payload: stalePayload });

    expect(state).toMatchObject({ generation: 8, status: 'booting', evidence: null });
    expect(state.history.at(-1)).toMatchObject({
      name: 'component-stale-ignored',
      detail: { staleGeneration: 7, currentGeneration: 8 },
    });
  });

  it('models H5 as page-tappable and WeChat as scoped render-only evidence', () => {
    const h5Locator = createAuditTargetLocator('h5', '#audit-button-target');
    const mpLocator = createAuditTargetLocator('mp-weixin', '#audit-button-target');
    expect(h5Locator).toEqual({
      kind: 'page-selector',
      platform: 'h5',
      scope: 'page',
      selector: '#audit-button-target',
      measurement: 'page-selector-query',
      interactionCapability: 'tap',
    });
    expect(mpLocator).toEqual({
      kind: 'scoped-render',
      platform: 'mp-weixin',
      scope: 'adapter-component',
      selector: '#audit-button-target',
      measurement: 'component-scoped-selector-query',
      interactionCapability: 'none',
    });
    expect(createAuditTargetLocator('unknown', '#audit-button-target')).toBeNull();

    let malformedLocatorState = startEvidenceSession();
    const malformedLocator = readyPayload(malformedLocatorState, h5Locator!);
    malformedLocator.targetLocator = null as unknown as AuditTargetLocator;
    malformedLocatorState = reduceAuditEvidenceSession(malformedLocatorState, {
      type: 'adapter-ready',
      payload: malformedLocator,
    });
    expect(malformedLocatorState.failure?.reason).toBe('target-locator-malformed');

    let hostileLocatorState = startEvidenceSession();
    const hostileLocator = readyPayload(hostileLocatorState, h5Locator!);
    hostileLocator.targetLocator = new Proxy(h5Locator!, {
      ownKeys: () => {
        throw new Error('locator-inspection-failed');
      },
    });
    expect(() => {
      hostileLocatorState = reduceAuditEvidenceSession(hostileLocatorState, {
        type: 'adapter-ready',
        payload: hostileLocator,
      });
    }).not.toThrow();
    expect(hostileLocatorState).toMatchObject({ status: 'failed', evidence: null });
    expect(hostileLocatorState.failure?.reason).toContain('target-locator:$:inspection-failed');

    let revokedLocatorState = startEvidenceSession();
    const revokedLocator = readyPayload(revokedLocatorState, h5Locator!);
    const revocableLocator = Proxy.revocable(h5Locator!, {});
    revocableLocator.revoke();
    revokedLocator.targetLocator = revocableLocator.proxy;
    expect(() => {
      revokedLocatorState = reduceAuditEvidenceSession(revokedLocatorState, {
        type: 'adapter-ready',
        payload: revokedLocator,
      });
    }).not.toThrow();
    expect(revokedLocatorState).toMatchObject({
      status: 'failed',
      evidence: null,
      failure: { reason: 'target-locator-inspection-failed' },
    });

    let mpState = startEvidenceSession('mp-weixin');
    mpState = reduceAuditEvidenceSession(mpState, {
      type: 'adapter-ready',
      payload: readyPayload(mpState, mpLocator!),
    });
    expect(mpState).toMatchObject({ status: 'ready', activeInteractionCapability: 'none' });

    let invalidMpState = startEvidenceSession('mp-weixin');
    invalidMpState = reduceAuditEvidenceSession(invalidMpState, {
      type: 'adapter-ready',
      payload: readyPayload(invalidMpState, h5Locator!),
    });
    expect(invalidMpState).toMatchObject({
      status: 'failed',
      evidence: null,
      targetLocator: null,
      failure: { reason: 'mp-locator-must-be-scoped-noninteractive' },
    });
  });

  it('fails closed and revokes current evidence on duplicate ready', () => {
    const locator = createAuditTargetLocator('h5', '#audit-button-target')!;
    let state = startEvidenceSession();
    const payload = readyPayload(state, locator);
    state = reduceAuditEvidenceSession(state, { type: 'adapter-ready', payload });
    state = reduceAuditEvidenceSession(state, { type: 'adapter-ready', payload });

    expect(state).toMatchObject({
      status: 'failed',
      evidence: null,
      targetLocator: null,
      activeInteractionCapability: 'none',
      failure: { reason: 'duplicate-ready:button' },
    });
  });

  it('keeps fixture validity distinct from component evidence', () => {
    const source = readFileSync(FIXTURE_PAGE_PATH, 'utf8');
    expect(source).toContain(':data-audit-fixture-valid="String(fixtureValid)"');
    expect(source).not.toContain('data-audit-valid');
    expect(source).toContain(':data-audit-evidence-ready="String(evidenceReady)"');
    expect(source).toContain(':data-audit-evidence-scope="evidenceScope"');
    expect(source).toContain(':data-audit-component-status="componentStatus"');
    expect(source).toContain(':data-audit-interaction-capability="activeInteractionCapability"');
    expect(source).toContain(':data-audit-target-locator="targetLocatorJson"');
    expect(source).toContain(':data-audit-component-event-count="String(componentEvents.length)"');
    expect(source).toContain(':data-audit-last-component-event="lastComponentEvent?.name || \'\'"');
    expect(source).toContain(
      ':data-audit-last-component-event-detail="lastComponentEventDetailJson"'
    );
    expect(source).toContain('v-if="canMountAdapter && parseResult"');
    expect(source).toContain(':key="`${parseResult.fingerprint}:${adapterGeneration}`"');
    expect(source).toContain(':generation="adapterGeneration"');
    expect(source).toContain('@ready="handleAdapterReady"');
    expect(source).not.toContain('@tap="recordEvent');
    expect(source).toContain(':data-audit-build-mode="buildIdentity.buildMode"');
    expect(source).toContain(':data-audit-provenance="buildIdentity.provenance"');
    expect(source).toContain('data-audit-theme-scope="fixture-root"');
    expect(source).toContain('data-audit-brand-scope="fixture-root"');
    expect(source).not.toContain('themeStore');
    expect(source).not.toContain('applyTemporaryStorageOverlay');
  });

  it('binds the button adapter to the real component target and a stable postcondition', () => {
    const source = readFileSync(BUTTON_ADAPTER_PATH, 'utf8');
    expect(source).toContain('<lk-button id="audit-button-target"');
    expect(source).toContain('@click="handleClick"');
    expect(source).toContain(':data-audit-click-count="String(clickCount)"');
    expect(source).toContain('stableReads >= 2');
    expect(source).toContain('.selectAll(TARGET_SELECTOR)');
    expect(source).toContain("adapterPlatform === 'mp-weixin'");
    expect(source).toContain('targetLocator: locator');
    expect(source).toContain('generation: adapterGeneration');
    expect(source).toContain("name: 'click'");
    expect(source).toContain('detail: { ...state.value }');
    expect(source).not.toContain('detail: stateJson.value');
    expect(source).not.toContain('uni.showToast');
  });

  it('does not overwrite a newer global owner during cleanup', () => {
    const originalDate = globalThis.Date;
    const originalRandom = Math.random;
    const config = parseAuditFixtureQuery().config;
    const restore = installAuditDeterminism(config, () => 0);
    const newerDate = class NewerDate extends originalDate {};
    const newerRandom = () => 0.25;
    globalThis.Date = newerDate;
    Math.random = newerRandom;

    try {
      restore();
      expect(globalThis.Date).toBe(newerDate);
      expect(Math.random).toBe(newerRandom);
    } finally {
      globalThis.Date = originalDate;
      Math.random = originalRandom;
    }
  });

  it('restores existing and missing storage keys after success', () => {
    const values = new Map<string, unknown>([['theme', 'dark']]);
    const storage: AuditStorageAdapter = {
      listKeys: () => [...values.keys()],
      get: key => values.get(key),
      set: (key, value) => values.set(key, value),
      remove: key => void values.delete(key),
    };

    applyTemporaryStorageOverlay(storage, { theme: 'light', brand: '#6965db' }, () => {
      expect(values.get('theme')).toBe('light');
      expect(values.get('brand')).toBe('#6965db');
    });

    expect(values.get('theme')).toBe('dark');
    expect(values.has('brand')).toBe(false);
  });

  it('restores storage after the environment callback fails', () => {
    const values = new Map<string, unknown>([['theme', 'dark']]);
    const storage: AuditStorageAdapter = {
      listKeys: () => [...values.keys()],
      get: key => values.get(key),
      set: (key, value) => values.set(key, value),
      remove: key => void values.delete(key),
    };

    expect(() =>
      applyTemporaryStorageOverlay(storage, { theme: 'light', brand: '#6965db' }, () => {
        throw new Error('apply-failed');
      })
    ).toThrow('storage-overlay:apply:Error: apply-failed');
    expect(values.get('theme')).toBe('dark');
    expect(values.has('brand')).toBe(false);
  });

  it('does not swallow an explicit undefined throw from the environment callback', () => {
    const values = new Map<string, unknown>([['theme', 'dark']]);
    const storage: AuditStorageAdapter = {
      listKeys: () => [...values.keys()],
      get: key => values.get(key),
      set: (key, value) => values.set(key, value),
      remove: key => void values.delete(key),
    };

    expect(() =>
      applyTemporaryStorageOverlay(storage, { theme: 'light' }, () => {
        throw undefined;
      })
    ).toThrow('storage-overlay:apply:undefined');
    expect(values.get('theme')).toBe('dark');
  });

  it('performs no writes when the complete storage snapshot cannot be read', () => {
    let writes = 0;
    const storage: AuditStorageAdapter = {
      listKeys: () => {
        throw new Error('snapshot-failed');
      },
      get: () => undefined,
      set: () => {
        writes += 1;
      },
      remove: () => {
        writes += 1;
      },
    };

    expect(() => applyTemporaryStorageOverlay(storage, { theme: 'light' }, () => {})).toThrow(
      'snapshot-failed'
    );
    expect(writes).toBe(0);
  });
});
