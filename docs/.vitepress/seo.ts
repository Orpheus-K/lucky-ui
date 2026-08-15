import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { HeadConfig } from 'vitepress';

export const SITE_NAME = 'Lucky UI';
export const SITE_URL = 'https://lucky-ui.cn';
export const SITE_DESCRIPTION =
  'Lucky UI 是面向 Uni-app 与 Vue 3 的跨端组件库，提供 60+ TypeScript 组件、Design Token 主题系统，并支持 H5、App 和小程序。';
export const SITE_IMAGE = `${SITE_URL}/logo.png`;

const DOCS_ROOT = fileURLToPath(new URL('../', import.meta.url));
const MAX_DESCRIPTION_LENGTH = 160;

export interface SeoPageData {
  relativePath: string;
  title: string;
  description: string;
  frontmatter: Record<string, unknown>;
}

function compactWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function truncateDescription(value: string): string {
  const normalized = compactWhitespace(value)
    .replace(/"/g, '“')
    .replace(/'/g, '’')
    .replace(/[<>]/g, '');
  if (normalized.length <= MAX_DESCRIPTION_LENGTH) return normalized;
  return `${normalized.slice(0, MAX_DESCRIPTION_LENGTH - 1).replace(/[，。；、,.!?\s]+$/u, '')}…`;
}

function cleanMarkdownParagraph(value: string): string {
  return compactWhitespace(
    value
      .replace(/<[^>]+>/g, ' ')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[`*_~]/g, '')
      .replace(/^>\s*/gm, '')
  );
}

function extractMarkdownDescription(relativePath: string): string | undefined {
  try {
    const filePath = path.resolve(DOCS_ROOT, relativePath);
    const source = readFileSync(filePath, 'utf8')
      .replace(/^---\s*[\r\n]+[\s\S]*?[\r\n]+---\s*/u, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '');

    const paragraph = source.split(/\r?\n\s*\r?\n/u).find(block => {
      const value = block.trim();
      return value.length > 20 && !/^(#|[-*+]\s|\d+\.\s|\||<|import\s|export\s)/u.test(value);
    });

    return paragraph ? truncateDescription(cleanMarkdownParagraph(paragraph)) : undefined;
  } catch {
    return undefined;
  }
}

export function resolvePageDescription(pageData: SeoPageData): string {
  const frontmatterDescription = pageData.frontmatter.description;
  if (typeof frontmatterDescription === 'string' && frontmatterDescription.trim()) {
    return truncateDescription(frontmatterDescription);
  }

  return (
    extractMarkdownDescription(pageData.relativePath) || pageData.description || SITE_DESCRIPTION
  );
}

export function isLegacyBasicPage(relativePath: string): boolean {
  return relativePath.replace(/\\/g, '/').startsWith('components/basic/');
}

export function toCanonicalUrl(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');

  if (normalized === 'index.md') return `${SITE_URL}/`;
  if (normalized === 'components/basic/index.md') return `${SITE_URL}/components/`;
  if (normalized.startsWith('components/basic/')) {
    return `${SITE_URL}/${normalized
      .replace('components/basic/', 'components/')
      .replace(/\.md$/u, '.html')}`;
  }
  if (normalized.endsWith('/index.md')) {
    return `${SITE_URL}/${normalized.slice(0, -'index.md'.length)}`;
  }

  return `${SITE_URL}/${normalized.replace(/\.md$/u, '.html')}`;
}

function fullPageTitle(pageData: SeoPageData): string {
  if (pageData.relativePath === 'index.md')
    return pageData.title || `${SITE_NAME} — Uni-app 跨端组件库`;
  if (!pageData.title) return SITE_NAME;
  return pageData.title.includes(SITE_NAME) ? pageData.title : `${pageData.title} | ${SITE_NAME}`;
}

function breadcrumbGraph(pageData: SeoPageData, canonicalUrl: string) {
  const items: Array<{ name: string; item: string }> = [{ name: SITE_NAME, item: `${SITE_URL}/` }];
  const pathSegments = pageData.relativePath.replace(/\.md$/u, '').split('/');
  const section = pathSegments[0];

  if (section === 'components') {
    items.push({ name: '组件', item: `${SITE_URL}/components/` });
  } else if (section === 'guide') {
    items.push({ name: '指南', item: `${SITE_URL}/guide/` });
  }

  const isSectionIndex = pageData.relativePath === `${section}/index.md`;
  if (pageData.relativePath !== 'index.md' && !isSectionIndex) {
    items.push({ name: pageData.title, item: canonicalUrl });
  }

  if (items.length === 1) return undefined;

  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

function structuredData(pageData: SeoPageData, description: string, canonicalUrl: string) {
  const organization = {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Lucky UI Contributors',
    url: 'https://github.com/Orpheus-K/lucky-ui',
    logo: SITE_IMAGE,
  };
  const website = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: 'zh-CN',
    publisher: { '@id': organization['@id'] },
  };

  if (pageData.relativePath === 'index.md') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        organization,
        website,
        {
          '@type': 'SoftwareSourceCode',
          '@id': `${SITE_URL}/#software`,
          name: SITE_NAME,
          alternateName: 'uni-lucky-ui',
          url: `${SITE_URL}/`,
          description,
          codeRepository: 'https://github.com/Orpheus-K/lucky-ui',
          license: 'https://github.com/Orpheus-K/lucky-ui/blob/main/LICENSE',
          programmingLanguage: ['TypeScript', 'Vue'],
          runtimePlatform: ['Uni-app', 'H5', 'App', 'WeChat Mini Program'],
          author: { '@id': organization['@id'] },
        },
      ],
    };
  }

  const graph: unknown[] = [
    organization,
    website,
    {
      '@type': 'TechArticle',
      '@id': `${canonicalUrl}#article`,
      url: canonicalUrl,
      mainEntityOfPage: canonicalUrl,
      headline: pageData.title,
      description,
      inLanguage: 'zh-CN',
      author: { '@id': organization['@id'] },
      publisher: { '@id': organization['@id'] },
      isPartOf: { '@id': website['@id'] },
    },
  ];
  const breadcrumbs = breadcrumbGraph(pageData, canonicalUrl);
  if (breadcrumbs) graph.push(breadcrumbs);

  return { '@context': 'https://schema.org', '@graph': graph };
}

function serializeStructuredData(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function createSeoHead(pageData: SeoPageData, description: string): HeadConfig[] {
  const canonicalUrl = toCanonicalUrl(pageData.relativePath);
  const title = fullPageTitle(pageData);
  const type = pageData.relativePath === 'index.md' ? 'website' : 'article';
  const robots = isLegacyBasicPage(pageData.relativePath)
    ? 'noindex, follow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  return [
    ['link', { rel: 'canonical', href: canonicalUrl }],
    [
      'meta',
      {
        name: 'robots',
        content: robots,
      },
    ],
    ['meta', { property: 'og:type', content: type }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { property: 'og:site_name', content: SITE_NAME }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: canonicalUrl }],
    ['meta', { property: 'og:image', content: SITE_IMAGE }],
    ['meta', { property: 'og:image:type', content: 'image/png' }],
    ['meta', { property: 'og:image:width', content: '1024' }],
    ['meta', { property: 'og:image:height', content: '1024' }],
    ['meta', { property: 'og:image:alt', content: 'Lucky UI 品牌标志' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: SITE_IMAGE }],
    ['meta', { name: 'twitter:image:alt', content: 'Lucky UI 品牌标志' }],
    [
      'script',
      { type: 'application/ld+json' },
      serializeStructuredData(structuredData(pageData, description, canonicalUrl)),
    ],
  ];
}

export function createNoindexHead(): HeadConfig[] {
  return [['meta', { name: 'robots', content: 'noindex, nofollow, noarchive' }]];
}
