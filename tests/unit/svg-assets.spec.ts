import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { afterEach, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { collectSvgAssets, findDuplicateAssets } = require('../../src/uni_modules/lucky-ui/scripts/svg-assets/collect') as {
  collectSvgAssets: (config: unknown, options?: { moduleRoot?: string; targetFilter?: string[] }) => Promise<{ assets: Array<{ name: string; target: string; sourceId: string }>; findings: Array<{ id: string; level: string }> }>;
  findDuplicateAssets: (assets: Array<{ name: string; target: string; sourceId: string }>) => Array<{ id: string; level: string }>;
};
const { normalizeConfig } = require('../../src/uni_modules/lucky-ui/scripts/svg-assets/load-config') as {
  normalizeConfig: (config: unknown, configPath?: string) => unknown;
};
const { normalizeSvgContent } = require('../../src/uni_modules/lucky-ui/scripts/svg-assets/normalize') as {
  normalizeSvgContent: (content: string, asset?: { name?: string; target?: string; colorMode?: string }) => Promise<{ content: string; findings: Array<{ id: string; level: string }> }>;
};
const { parseCodepointsFromCss, generateCodepointsTs } = require('../../src/uni_modules/lucky-ui/scripts/svg-assets/emit-icon-font') as {
  parseCodepointsFromCss: (css: string, prefix?: string) => Record<string, number>;
  generateCodepointsTs: (map: Record<string, number>) => string;
};
const { generateEmptyIllustrationsTs } = require('../../src/uni_modules/lucky-ui/scripts/svg-assets/emit-empty') as {
  generateEmptyIllustrationsTs: (assets: Array<{ name: string; target: string; content: string; sourceMeta?: Record<string, string> }>, targetConfig?: unknown) => string;
};

const tempRoots: string[] = [];

function makeTempRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lk-svg-assets-'));
  tempRoots.push(root);
  return root;
}

function writeSvg(root: string, relativePath: string, content = '<svg viewBox="0 0 16 16"><path fill="currentColor" d="M0 0h16v16H0z"/></svg>') {
  const file = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

describe('svg-assets config and collection', () => {
  it('validates source shape with actionable errors', () => {
    expect(() => normalizeConfig({ sources: [] })).toThrow('config.sources cannot be empty');
    expect(() => normalizeConfig({
      sources: [{ id: 'bad', type: 'remote', dir: 'icons', targets: ['iconFont'] }],
    })).toThrow('type must be "local" or "package"');
  });

  it('collects local SVG files with include, exclude, rename and prefix rules', async () => {
    const root = makeTempRoot();
    writeSvg(root, 'icons/add.svg');
    writeSvg(root, 'icons/remove.svg');
    writeSvg(root, 'icons/skip.svg');

    const config = normalizeConfig({
      sources: [{
        id: 'local-icons',
        type: 'local',
        dir: 'icons',
        targets: ['iconFont'],
        rules: {
          include: ['add', 'remove', 'skip'],
          exclude: ['skip'],
          rename: { add: 'plus' },
          prefix: 'biz-',
        },
      }],
      targets: { iconFont: { enabled: true } },
    });

    const result = await collectSvgAssets(config, { moduleRoot: root, targetFilter: ['iconFont'] });
    expect(result.assets.map(asset => asset.name).sort()).toEqual(['biz-plus', 'biz-remove']);
    expect(result.findings.some(item => item.id === 'asset-skipped')).toBe(true);
  });

  it('collects SVG files from an installed npm package source', async () => {
    const config = normalizeConfig({
      sources: [{
        id: 'bootstrap-one',
        type: 'package',
        packageName: 'bootstrap-icons',
        dir: 'icons',
        targets: ['iconFont'],
        rules: { explicit: ['alarm'] },
      }],
      targets: { iconFont: { enabled: true } },
    });

    const result = await collectSvgAssets(config, { targetFilter: ['iconFont'] });
    expect(result.assets.some(asset => asset.name === 'alarm')).toBe(true);
  });

  it('reports duplicate target names as errors', () => {
    const findings = findDuplicateAssets([
      { name: 'add', target: 'iconFont', sourceId: 'a' },
      { name: 'add', target: 'iconFont', sourceId: 'b' },
    ]);
    expect(findings).toEqual([expect.objectContaining({ id: 'duplicate-name', level: 'error' })]);
  });
});

describe('svg-assets normalization and emitters', () => {
  it('normalizes valid SVG and removes currentColor from monochrome icon roots', async () => {
    const result = await normalizeSvgContent(
      '<svg width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" onclick="x()" d="M0 0h16v16H0z"/></svg>',
      { name: 'add', target: 'iconFont', colorMode: 'monochrome' }
    );

    expect(result.findings).toEqual([]);
    expect(result.content).toContain('viewBox');
    expect(result.content).not.toContain('onclick');
    expect(result.content).not.toContain('currentColor');
  });

  it('blocks invalid SVG and missing viewBox input', async () => {
    const invalid = await normalizeSvgContent('<div />', { name: 'bad' });
    expect(invalid.findings).toEqual([expect.objectContaining({ id: 'invalid-svg', level: 'error' })]);

    const missingViewBox = await normalizeSvgContent('<svg><path d="M0 0h1v1z"/></svg>', { name: 'no-box' });
    expect(missingViewBox.findings).toEqual([expect.objectContaining({ id: 'missing-viewbox', level: 'error' })]);
  });

  it('parses icon codepoints and creates runtime lookup source', () => {
    const map = parseCodepointsFromCss('.lk-icon-add::before { content: "\\ea01"; }\n.lk-icon-x::before { content: "\\ea02"; }');
    expect(map).toEqual({ add: 0xea01, x: 0xea02 });
    expect(generateCodepointsTs(map)).toContain('iconCharOf');
  });

  it('generates empty illustration registry with data URI templates', () => {
    const ts = generateEmptyIllustrationsTs(
      [{
        name: 'empty',
        target: 'emptyIllustrations',
        content: '<svg viewBox="0 0 16 16"><path fill="{{primary}}" d="M0 0h16v16H0z"/></svg>',
      }],
      {
        presets: { empty: { title: 'No Data', description: 'No content' } },
        meta: { empty: { label: 'Empty', source: 'local' } },
      }
    );

    expect(ts).toContain('GENERATED_EMPTY_NAMES');
    expect(ts).toContain('{{primary}}');
    expect(ts).toContain('"Empty": "empty"');
  });
});
