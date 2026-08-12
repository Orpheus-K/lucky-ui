import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PREVIEW_DEMO_SLUGS } from '../../src/components/preview/preview-demo-registry';
import {
  AUDIT_COMPONENT_SLUGS,
  AUDIT_REMOTE_RESOURCE_COMPONENT_SLUGS,
  applyTemporaryStorageOverlay,
  createSeededRandom,
  fingerprintAuditConfig,
  installAuditDeterminism,
  parseAuditFixtureQuery,
  stableAuditConfigJson,
  type AuditStorageAdapter,
} from '../../src/components/audit/audit-fixture';

const COMPONENT_ROOT = fileURLToPath(
  new URL('../../src/uni_modules/lucky-ui/components/', import.meta.url)
);
const DEMO_ROOT = fileURLToPath(new URL('../../src/components/demos/', import.meta.url));
const RENDERER_PATH = fileURLToPath(
  new URL('../../src/components/preview/PreviewDemoRenderer.vue', import.meta.url)
);
const FIXTURE_PAGE_PATH = fileURLToPath(
  new URL('../../src/pages_sub/audit-fixture/index.vue', import.meta.url)
);

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

  it('normalizes a complete shell-baseline query without implying interaction support', () => {
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
      interactionCapability: 'none',
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
      interactionCapability: 'none',
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

  it('keeps fixture validity distinct from component evidence', () => {
    const source = readFileSync(FIXTURE_PAGE_PATH, 'utf8');
    expect(source).toContain(':data-audit-fixture-valid="String(fixtureValid)"');
    expect(source).not.toContain('data-audit-valid');
    expect(source).toContain(':data-audit-evidence-ready="String(evidenceReady)"');
    expect(source).toContain('data-audit-component-status="pending-adapter"');
    expect(source).toContain(':data-audit-build-mode="buildIdentity.buildMode"');
    expect(source).toContain(':data-audit-provenance="buildIdentity.provenance"');
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
