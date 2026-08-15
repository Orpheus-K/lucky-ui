import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'docs', '.vitepress', 'dist');

function read(relativePath) {
  return readFileSync(path.join(DIST, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertPage(relativePath, canonicalUrl, expectedSchemaType) {
  const html = read(relativePath);
  const title = html.match(/<title>([^<]+)<\/title>/u);
  const description = html.match(/<meta name="description" content="([^"]+)">/u);
  assert(title?.[1]?.trim(), `${relativePath} 缺少有效 title`);
  assert(description?.[1]?.trim().length >= 20, `${relativePath} 缺少有效 description`);

  const required = [
    '<meta name="description"',
    '<meta name="robots"',
    '<meta property="og:title"',
    '<meta property="og:description"',
    '<meta property="og:url"',
    '<meta property="og:image"',
    '<meta name="twitter:card"',
    `<link rel="canonical" href="${canonicalUrl}">`,
  ];

  for (const marker of required) {
    assert(html.includes(marker), `${relativePath} 缺少 ${marker}`);
  }

  const structuredData = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/u);
  assert(structuredData, `${relativePath} 缺少 JSON-LD`);
  const parsed = JSON.parse(structuredData[1]);
  assert(
    parsed['@graph']?.some(item => item['@type'] === expectedSchemaType),
    `${relativePath} 缺少 ${expectedSchemaType} 结构化数据`
  );
}

function listHtmlFiles(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const relativePath = path.join(prefix, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(path.join(directory, entry.name), relativePath);
    return entry.isFile() && entry.name.endsWith('.html') ? [relativePath] : [];
  });
}

function canonicalForBuiltPage(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/');
  if (normalized === 'index.html') return 'https://lucky-ui.cn/';
  if (normalized.endsWith('/index.html')) {
    return `https://lucky-ui.cn/${normalized.slice(0, -'index.html'.length)}`;
  }
  return `https://lucky-ui.cn/${normalized}`;
}

const publicPages = listHtmlFiles(DIST).filter(relativePath => {
  const normalized = relativePath.replace(/\\/g, '/');
  return (
    normalized !== '404.html' &&
    !normalized.startsWith('assets/') &&
    !normalized.startsWith('components/basic/')
  );
});

assert(publicPages.length >= 80, `公开文档页数量异常：${publicPages.length}`);
for (const relativePath of publicPages) {
  assertPage(
    relativePath,
    canonicalForBuiltPage(relativePath),
    relativePath === 'index.html' ? 'SoftwareSourceCode' : 'TechArticle'
  );
}

const sitemap = read('sitemap.xml');
assert(sitemap.includes('https://lucky-ui.cn/'), 'sitemap 缺少主页');
assert(sitemap.includes('https://lucky-ui.cn/components/button.html'), 'sitemap 缺少组件文档');
assert(!sitemap.includes('TESTING_GUIDE'), 'sitemap 不应包含内部测试文档');
assert(!sitemap.includes('/components/basic/'), 'sitemap 不应包含旧版基础组件副本');

const legacyButton = read(path.join('components', 'basic', 'button.html'));
assert(
  legacyButton.includes('<meta name="robots" content="noindex, follow">'),
  '旧版基础组件页面应设置 noindex'
);
assert(
  legacyButton.includes('<link rel="canonical" href="https://lucky-ui.cn/components/button.html">'),
  '旧版基础组件页面应指向主组件文档'
);

const robots = read('robots.txt');
assert(robots.includes('Sitemap: https://lucky-ui.cn/sitemap.xml'), 'robots.txt 缺少 sitemap 地址');

console.log('Lucky UI docs SEO checks passed.');
